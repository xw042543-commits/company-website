package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.springframework.stereotype.Component;

/** Fixed v1 workbook contract. Formulas, macros, external links and excess rows are rejected. */
@Component
public class AdminImportExcel {
    public static final int MAX_ROWS = 500;
    public static final long MAX_BYTES = 5 * 1024 * 1024;
    public record Column(String key, String title) {}
    public record ParsedRow(int number, Map<String,Object> payload, String error) {}
    public static final List<Column> UNIVERSITY = columns("universityCode:院校编码*,slug:网址标识*,nameZh:院校中文名称,nameEn:院校英文名称,countryCode:国家代码*,aliases:别名（分号分隔）,regionZh:地区中文,regionEn:地区英文,descriptionZh:简介中文,descriptionEn:简介英文,officialUrl:官网链接,logoUrl:Logo链接");
    public static final List<Column> PROGRAMME = columns("programmeCode:专业编码*,universityCode:所属院校编码*,slug:网址标识*,nameZh:专业中文名称,nameEn:专业英文名称,aliases:别名（分号分隔）,categoryCode:学科分类代码*,studyLevelCode:学历层次代码*,campus:校区,courseModeCode:授课方式代码,durationMonths:学制月数,durationDisplay:学制说明,tuitionMin:最低学费,tuitionMax:最高学费,tuitionCurrency:币种代码,tuitionDisplay:学费说明,descriptionZh:专业介绍中文,descriptionEn:专业介绍英文,admissionsZh:入学要求中文,admissionsEn:入学要求英文,curriculumZh:课程介绍中文,curriculumEn:课程介绍英文,officialUrl:官网链接");
    private static List<Column> columns(String spec) { return Arrays.stream(spec.split(",")).map(s -> s.split(":" )).map(s -> new Column(s[0],s[1])).toList(); }
    public static List<Column> columns(EntityType type) { return type == EntityType.UNIVERSITY ? UNIVERSITY : PROGRAMME; }
    public byte[] template(EntityType type, AdminCatalogDtos.Options options) {
        try (XSSFWorkbook book = new XSSFWorkbook()) {
            Sheet data=book.createSheet("导入数据");
            header(book,data,columns(type).stream().map(Column::title).toList());
            Sheet guide=book.createSheet("填写说明");
            String[] notes={"模板版本：1；请保留导入数据的表头和顺序。每次最多500条，文件最大5MB。", "带*字段必填；中文名称和英文名称至少填写一个。不要使用公式、宏或外部链接。", "编码使用大写字母、数字和下划线；网址标识使用小写字母、数字和短横线。", "数字填纯数字；学制月数填正整数，学费最多两位小数；日期及其他内容填文本。", "别名使用中文或英文分号分隔，用于中英文名称、缩写等已知别名匹配。", "国家、院校、学科和学历等代码从字典表复制；专业必须关联已经存在的院校。", "上传仅生成独立草稿。重复、疑似重复和冲突默认不入库；编辑后可重新校验。", "先预览、编辑和选择草稿，再确认发布。发布前会再次查重，不会覆盖已有数据。", "校区为空表示未指定。同名同学历但校区信息缺失时按疑似重复处理。"};
            for(int i=0;i<notes.length;i++) guide.createRow(i).createCell(0).setCellValue(notes[i]); guide.setColumnWidth(0,24000);
            Sheet dict=book.createSheet("字典"); header(book,dict,List.of("类型","代码","中文名称","英文名称"));
            int row=1;
            for(var entry:Map.of("国家",options.countries(),"学科",options.categories(),"学历",options.studyLevels(),"授课方式",options.courseModes(),"院校",options.universities()).entrySet())
                for(var option:entry.getValue()) {Row r=dict.createRow(row++); text(r,0,entry.getKey());text(r,1,option.code());text(r,2,option.nameZh());text(r,3,option.nameEn());}
            return bytes(book);
        } catch(IOException e){throw new IllegalStateException("模板生成失败",e);}
    }
    public List<ParsedRow> parse(EntityType type, byte[] file) {
        if(file.length==0 || file.length>MAX_BYTES) throw new IllegalArgumentException("文件必须为非空.xlsx，且不能超过5MB");
        ZipSecureFile.setMaxEntrySize(20 * 1024 * 1024); ZipSecureFile.setMaxTextSize(10 * 1024 * 1024);
        inspectArchive(file);
        try(XSSFWorkbook book=new XSSFWorkbook(new ByteArrayInputStream(file))) {
            if(book.isMacroEnabled() || !book.getExternalLinksTable().isEmpty()) throw new IllegalArgumentException("不支持宏或外部链接");
            Sheet sheet=book.getSheet("导入数据"); var cols=columns(type);
            if(sheet==null || sheet.getRow(0)==null || sheet.getRow(0).getLastCellNum()!=cols.size()) throw new IllegalArgumentException("表头不符合固定模板，请重新下载模板");
            DataFormatter formatter=new DataFormatter(Locale.ROOT);
            for(int i=0;i<cols.size();i++) if(!cols.get(i).title().equals(formatter.formatCellValue(sheet.getRow(0).getCell(i)))) throw new IllegalArgumentException("表头或顺序错误："+cols.get(i).title());
            if(sheet.getLastRowNum()>MAX_ROWS) throw new IllegalArgumentException("每次最多导入500条，请拆分文件");
            List<ParsedRow> rows=new ArrayList<>();
            for(int n=1;n<=sheet.getLastRowNum();n++) {
                Row r=sheet.getRow(n); if(r==null) continue;
                Map<String,Object> payload=new LinkedHashMap<>(); String error=null; boolean nonempty=false;
                if(r.getLastCellNum()>cols.size()) error="存在模板以外的额外列";
                for(int i=0;i<cols.size();i++) {
                    Cell cell=r.getCell(i); String value=formatter.formatCellValue(cell).trim();
                    if(cell!=null && (cell.getCellType()==CellType.FORMULA || cell.getCellType()==CellType.ERROR)) error="不允许公式或错误单元格，请粘贴为值";
                    if(value.length()>20000) error="单元格内容不能超过20000字";
                    payload.put(cols.get(i).key(),value.substring(0,Math.min(20000,value.length()))); nonempty|=!value.isEmpty();
                }
                if(nonempty) rows.add(new ParsedRow(n+1,payload,error));
            }
            if(rows.isEmpty()) throw new IllegalArgumentException("导入数据为空，请填写数据后上传");
            return rows;
        }catch(IllegalArgumentException e){throw e;}catch(Exception e){throw new IllegalArgumentException("无法读取Excel，请确认文件为有效的.xlsx模板且未加密");}
    }
    private static void inspectArchive(byte[] file) {
        long expanded=0;int entries=0;
        try(var zip=new java.util.zip.ZipInputStream(new ByteArrayInputStream(file))) {
            java.util.zip.ZipEntry entry;byte[] buffer=new byte[8192];
            while((entry=zip.getNextEntry())!=null){
                if(++entries>500 || entry.getName().toLowerCase(Locale.ROOT).contains("vbaproject"))throw new IllegalArgumentException("文件包含宏或过多内部文件");
                int read;while((read=zip.read(buffer))!=-1){expanded+=read;if(expanded>30L*1024*1024)throw new IllegalArgumentException("Excel解压内容过大，请拆分文件");}
            }
            if(entries==0)throw new IllegalArgumentException("文件不是有效的.xlsx工作簿");
        }catch(IOException e){throw new IllegalArgumentException("无法读取.xlsx文件");}
    }
    public byte[] export(EntityType type,List<ImportRow> rows,java.util.function.Function<ImportRow,String> existing) {
        try(XSSFWorkbook book=new XSSFWorkbook()) {
            for(var c:List.of(Classification.EXACT_DUPLICATE,Classification.POSSIBLE_DUPLICATE,Classification.CONFLICT)) {
                Sheet sheet=book.createSheet(switch(c){case EXACT_DUPLICATE->"完全重复";case POSSIBLE_DUPLICATE->"疑似重复";default->"字段冲突";});
                List<String> titles=new ArrayList<>(List.of("Excel行号","草稿记录ID","对应数据库记录ID","重复原因","数据库已有数据"));titles.addAll(columns(type).stream().map(Column::title).toList());header(book,sheet,titles);
                int n=1;for(var row:rows) if(row.classification()==c) {Row r=sheet.createRow(n++);text(r,0,Integer.toString(row.rowNumber()));text(r,1,Long.toString(row.id()));text(r,2,row.matchedRecordId()==null?"":row.matchedRecordId().toString());text(r,3,row.duplicateReason());text(r,4,existing.apply(row));int col=5;for(var field:columns(type)) text(r,col++,Objects.toString(row.payload().get(field.key()),""));}
            }
            return bytes(book);
        } catch(IOException e){throw new IllegalStateException("导出失败",e);}
    }
    private static void header(Workbook book,Sheet sheet,List<String> names) {
        Row row=sheet.createRow(0);CellStyle style=book.createCellStyle();style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());style.setFillPattern(FillPatternType.SOLID_FOREGROUND);Font font=book.createFont();font.setBold(true);style.setFont(font);
        for(int i=0;i<names.size();i++){Cell c=row.createCell(i);c.setCellValue(names.get(i));c.setCellStyle(style);sheet.setColumnWidth(i, Math.min(12000,Math.max(4200,names.get(i).length()*600)));}sheet.createFreezePane(0,1);
    }
    private static void text(Row row,int column,String value){row.createCell(column,CellType.STRING).setCellValue(value==null?"":value.substring(0,Math.min(32767,value.length())));}
    private static byte[] bytes(Workbook book)throws IOException {ByteArrayOutputStream out=new ByteArrayOutputStream();book.write(out);return out.toByteArray();}
}
