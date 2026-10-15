package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.springframework.stereotype.Component;

/** Fixed staff workbook contract. Formulas, macros, external links and excess rows are rejected. */
@Component
public class AdminImportExcel {
    public static final int MAX_ROWS = 500;
    public static final long MAX_BYTES = 5 * 1024 * 1024;
    public record Column(String key, String title) {}
    public record ParsedRow(int number, Map<String,Object> payload, String error) {}
    public static final List<Column> UNIVERSITY = columns("universityCode:院校内部编码（选填）,slug:页面地址（选填）,nameZh:院校中文名称,nameEn:院校英文名称,countryCode:国家*,aliases:别名（分号分隔）,regionZh:地区中文,regionEn:地区英文,descriptionZh:简介中文,descriptionEn:简介英文,officialUrl:官网链接,logoUrl:Logo链接");
    public static final List<Column> PROGRAMME = columns("programmeCode:专业内部编码（选填）,universityCode:所属院校*,slug:页面地址（选填）,nameZh:专业中文名称,nameEn:专业英文名称,aliases:别名（分号分隔）,categoryCode:学科分类*,studyLevelCode:学历层次*,campus:校区,courseModeCode:授课方式,durationMonths:学制月数,durationDisplay:学制说明,tuitionMin:最低学费,tuitionMax:最高学费,tuitionCurrency:学费币种（如MYR）,tuitionDisplay:学费说明,descriptionZh:专业介绍中文,descriptionEn:专业介绍英文,admissionsZh:入学要求中文,admissionsEn:入学要求英文,curriculumZh:课程介绍中文,curriculumEn:课程介绍英文,officialUrl:官网链接");
    public static final List<Column> COURSE=columns("courseCode:课程内部编码（选填）,programmeCode:所属专业*,universityCode:所属院校（选填）,studyLevelCode:学历层次（选填）,nameZh:课程中文名称*,nameEn:课程英文名称,officialCode:官网课程代码（选填）,descriptionZh:课程介绍,sourceUrl:资料来源链接,sourceType:资料来源,sortOrder:展示顺序（选填）");
    private static List<Column> columns(String spec) { return Arrays.stream(spec.split(",")).map(s -> s.split(":" )).map(s -> new Column(s[0],s[1])).toList(); }
    public static List<Column> columns(EntityType type) { return switch(type){case UNIVERSITY->UNIVERSITY;case PROGRAMME->PROGRAMME;case COURSE->COURSE;}; }
    public byte[] template(EntityType type, AdminCatalogDtos.Options options) {return template(type,options,List.of());}
    public byte[] template(EntityType type, AdminCatalogDtos.Options options,List<AdminCatalogDtos.Option> programmes) {
        try (XSSFWorkbook book = new XSSFWorkbook()) {
            Sheet data=book.createSheet("导入数据");
            header(book,data,columns(type).stream().map(Column::title).toList());
            Sheet guide=book.createSheet("填写说明");
            String[] notes={"填写步骤：先阅读说明和填写示例，再在导入数据表填写；保留表头和顺序。最多500条、5MB。", "带*是必填项，其余可留空。院校和专业的中文、英文名称至少填一个；课程必须填写中文名称。", "内部编码和页面地址均可留空，系统会自动生成；已有同名记录会复用原编码并标记重复，不会覆盖。", "国家、所属院校、学科分类、学历层次、授课方式可从下拉选项选择，也可填写已有名称或编码。", "所属专业请从可选资料中查找。名称重名时，请同时填写所属院校、学历或使用专业内部编码。", "别名用分号分隔；学制月数填正整数，学费填纯数字（最多两位小数），填写学费时须填币种如MYR。", "课程的内部编码与官网课程代码分别保存。学校未提供的官网代码、学分、必修要求不要自行编写。", "课程资料来源可选：学校官网、其他资料、参考概述；选择学校官网必须提供可核对的来源链接。", "示例表仅说明格式，不会被导入。上传后检查错误行和修改建议，再选中有效草稿确认发布。", "重复、疑似重复和冲突默认不导入；可下载重复资料表人工核对。必须先发布院校，再发布专业，最后导入课程。"};
            for(int i=0;i<notes.length;i++) guide.createRow(i).createCell(0).setCellValue(notes[i]); guide.setColumnWidth(0,24000);
            Sheet dict=book.createSheet("字典"); header(book,dict,List.of("类型","代码","中文名称","英文名称"));
            int row=1;
            for(var entry:Map.of("国家",options.countries(),"学科",options.categories(),"学历",options.studyLevels(),"授课方式",options.courseModes(),"院校",options.universities()).entrySet())
                for(var option:entry.getValue()) {Row r=dict.createRow(row++); text(r,0,entry.getKey());text(r,1,option.code());text(r,2,option.nameZh());text(r,3,option.nameEn());}
            Sheet sample=book.createSheet("填写示例（不会导入）"); header(book,sample,columns(type).stream().map(Column::title).toList());
            Row example=sample.createRow(1);
            for(int i=0;i<columns(type).size();i++){var field=columns(type).get(i);String value=switch(field.key()){case "nameZh"->type==EntityType.UNIVERSITY?"示例大学（请替换）":type==EntityType.PROGRAMME?"计算机科学（示例）":"程序设计基础（示例）";case "countryCode"->options.countries().isEmpty()?"":display(options.countries().getFirst());case "universityCode"->options.universities().isEmpty()?"请先新增院校":display(options.universities().getFirst());case "categoryCode"->options.categories().isEmpty()?"":display(options.categories().getFirst());case "studyLevelCode"->options.studyLevels().isEmpty()?"":display(options.studyLevels().getFirst());case "programmeCode"->type==EntityType.COURSE?"填写可选资料中的已有专业":"";case "sourceType"->"参考概述";default->"";};text(example,i,value);}
            Sheet programmeSheet=book.createSheet("可选专业");header(book,programmeSheet,List.of("所属院校及专业（可复制填写）","专业内部编码"));int pn=1;for(var p:programmes){Row r=programmeSheet.createRow(pn++);text(r,0,p.nameZh()+" ["+p.code()+"]");text(r,1,p.code());}
            addDropdowns(book,data,type,options,programmes);
            return bytes(book);
        } catch(IOException e){throw new IllegalStateException("模板生成失败",e);}
    }
    private static String display(AdminCatalogDtos.Option option){return option.nameZh()!=null&&!option.nameZh().isBlank()?option.nameZh():option.nameEn()!=null?option.nameEn():option.code();}
    private void addDropdowns(XSSFWorkbook book,Sheet sheet,EntityType type,AdminCatalogDtos.Options options,List<AdminCatalogDtos.Option> programmes){
        Map<String,List<String>> choices=new LinkedHashMap<>();
        choices.put("countryCode",options.countries().stream().map(AdminImportExcel::display).distinct().toList());
        choices.put("universityCode",options.universities().stream().map(AdminImportExcel::display).distinct().toList());
        choices.put("categoryCode",options.categories().stream().map(AdminImportExcel::display).distinct().toList());
        choices.put("studyLevelCode",options.studyLevels().stream().map(AdminImportExcel::display).distinct().toList());
        choices.put("courseModeCode",options.courseModes().stream().map(AdminImportExcel::display).distinct().toList());
        if(type==EntityType.COURSE)choices.put("programmeCode",programmes.stream().map(p->p.nameZh()+" ["+p.code()+"]").toList());
        choices.put("sourceType",List.of("学校官网","其他资料","参考概述"));
        Sheet lists=book.createSheet("下拉选项");int c=0;
        for(var entry:choices.entrySet()){
            if(entry.getValue().isEmpty())continue;
            for(int n=0;n<entry.getValue().size();n++){Row r=lists.getRow(n);if(r==null)r=lists.createRow(n);text(r,c,entry.getValue().get(n));}
            String name="choices_"+entry.getKey();var range=book.createName();range.setNameName(name);String letter=org.apache.poi.ss.util.CellReference.convertNumToColString(c);range.setRefersToFormula("'下拉选项'!$"+letter+"$1:$"+letter+"$"+entry.getValue().size());
            for(int col=0;col<columns(type).size();col++)if(columns(type).get(col).key().equals(entry.getKey())){
                var helper=sheet.getDataValidationHelper();var validation=helper.createValidation(helper.createFormulaListConstraint(name),new org.apache.poi.ss.util.CellRangeAddressList(1,MAX_ROWS,col,col));validation.setShowErrorBox(false);validation.setShowPromptBox(true);validation.createPromptBox("选择或填写","可选择已有名称，也可填写已有编码；上传后系统会检查。");sheet.addValidationData(validation);
            }c++;
        }
        book.setSheetHidden(book.getSheetIndex(lists),true);
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
