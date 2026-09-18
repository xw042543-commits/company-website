package com.yangdoujiao.website.search.v4.document;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.InnerField;
import org.springframework.data.elasticsearch.annotations.MultiField;

import com.yangdoujiao.website.search.v4.index.SearchIndexNames;

import lombok.Getter;

@Document(indexName = SearchIndexNames.READ_ALIAS, createIndex = false)
@Getter
public final class UniversityProgrammeSearchDocument {

    @Id
    @Field(type = FieldType.Keyword)
    private final Long id;

    @Field(type = FieldType.Keyword)
    private final String universityCode;

    @Field(type = FieldType.Keyword)
    private final String slug;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String nameZh;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String nameEn;

    @Field(type = FieldType.Keyword)
    private final String countryCode;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String countryNameZh;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String countryNameEn;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String cityZh;

    @MultiField(mainField = @Field(type = FieldType.Text),
            otherFields = @InnerField(suffix = "keyword", type = FieldType.Keyword))
    private final String cityEn;

    @Field(type = FieldType.Boolean)
    private final boolean popular;

    @Field(type = FieldType.Nested)
    private final List<ProgrammeSearchDocument> programmes;

    public UniversityProgrammeSearchDocument(Long id, String universityCode, String slug,
            String nameZh, String nameEn, String countryCode, String countryNameZh, String countryNameEn,
            String cityZh, String cityEn, boolean popular, List<ProgrammeSearchDocument> programmes) {
        this.id = id;
        this.universityCode = universityCode;
        this.slug = slug;
        this.nameZh = nameZh;
        this.nameEn = nameEn;
        this.countryCode = countryCode;
        this.countryNameZh = countryNameZh;
        this.countryNameEn = countryNameEn;
        this.cityZh = cityZh;
        this.cityEn = cityEn;
        this.popular = popular;
        this.programmes = List.copyOf(programmes);
    }
}
