package com.yangdoujiao.website.admin;
import static org.assertj.core.api.Assertions.*;
import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import java.io.*;
import java.util.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
class AdminImportExcelTest {
    private final AdminImportExcel excel=new AdminImportExcel();
    private final AdminCatalogDtos.Options options=new AdminCatalogDtos.Options(List.of(),List.of(),List.of(),List.of(),List.of());
    @Test void templatesHaveExactHeadersAndChineseInstructions() throws Exception {
        for(var type:EntityType.values())try(var book=new XSSFWorkbook(new ByteArrayInputStream(excel.template(type,options)))){
            assertThat(book.getSheet("导入数据").getRow(0).getLastCellNum()).isEqualTo((short)AdminImportExcel.columns(type).size());
            assertThat(book.getSheet("填写说明")).isNotNull();assertThat(book.getSheet("字典")).isNotNull();
        }
    }
    @Test void refusesChangedHeadersAndEmptyWorkbooks() throws Exception {
        assertThatThrownBy(()->excel.parse(EntityType.UNIVERSITY,excel.template(EntityType.UNIVERSITY,options))).hasMessageContaining("为空");
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(excel.template(EntityType.UNIVERSITY,options)))){
            book.getSheetAt(0).getRow(0).getCell(0).setCellValue("不符合模板");
            assertThatThrownBy(()->excel.parse(EntityType.UNIVERSITY,bytes(book))).hasMessageContaining("表头");
        }
    }
    @Test void parsesRowsButNeverEvaluatesFormulaCells() throws Exception {
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(excel.template(EntityType.UNIVERSITY,options)))){
            var r=book.getSheetAt(0).createRow(1);r.createCell(0).setCellValue("NEW_U");r.createCell(2).setCellFormula("1+1");
            var rows=excel.parse(EntityType.UNIVERSITY,bytes(book));assertThat(rows).hasSize(1);assertThat(rows.getFirst().number()).isEqualTo(2);assertThat(rows.getFirst().error()).contains("公式");
        }
    }
    @Test void exportUsesThreeSheetsAndStoresFormulaLikeValuesAsText() throws Exception {
        var payload=Map.<String,Object>of("nameZh","=HYPERLINK(\"https://example.test\")");
        var row=new ImportRow(1,UUID.randomUUID(),2,EntityType.UNIVERSITY,Classification.EXACT_DUPLICATE,"NOT_DRAFT",payload,"重复",7L,null,null,null,null);
        try(var book=new XSSFWorkbook(new ByteArrayInputStream(excel.export(EntityType.UNIVERSITY,List.of(row),r->"已有资料")))){
            assertThat(book.getNumberOfSheets()).isEqualTo(3);assertThat(book.getSheet("完全重复").getRow(1).getCell(7).getCellType()).isEqualTo(org.apache.poi.ss.usermodel.CellType.STRING);
            assertThat(book.getSheet("疑似重复")).isNotNull();assertThat(book.getSheet("字段冲突")).isNotNull();
        }
    }
    private static byte[] bytes(XSSFWorkbook book)throws IOException {var out=new ByteArrayOutputStream();book.write(out);return out.toByteArray();}
}
