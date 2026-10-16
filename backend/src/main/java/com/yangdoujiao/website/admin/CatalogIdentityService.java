package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.ObjectMapper;

/** One policy for manual forms and import drafts. Codes are allocated once, then stored in drafts. */
@Service
public class CatalogIdentityService {
    private final CatalogIdentityRepository repository;
    private final ObjectMapper json;
    public CatalogIdentityService(CatalogIdentityRepository repository,ObjectMapper json) {this.repository=repository;this.json=json;}
    public String code(String type,String supplied) {
        String value=supplied==null?"":supplied.trim().toUpperCase(Locale.ROOT);
        if(value.isEmpty())return repository.generate(type);
        if(!value.matches("[A-Z][A-Z0-9_]{0,63}"))throw invalid("内部编码请以大写字母开头，仅使用大写字母、数字、下划线，最多64位；也可留空自动生成");
        repository.reserve(type,value);return value;
    }
    public UniversityInput university(UniversityInput input,String existingCode) {
        String code=unchanged("UNIVERSITY",input.universityCode(),existingCode);
        return patch(input,UniversityInput.class,Map.of("universityCode",code,"slug",slug(input.slug(),code)));
    }
    public ProgrammeInput programme(ProgrammeInput input,String existingCode) {
        String code=unchanged("PROGRAMME",input.programmeCode(),existingCode);
        return patch(input,ProgrammeInput.class,Map.of("programmeCode",code,"slug",slug(input.slug(),code)));
    }
    public void lockCatalog(){repository.lockCatalog();}
    private String unchanged(String type,String supplied,String existing) {
        if(existing==null)return code(type,supplied);
        if(supplied!=null&&!supplied.isBlank()&&!existing.equals(supplied.trim()))throw invalid("已有记录的内部编码不可修改，请保留原编码");
        return existing;
    }
    public static String slug(String supplied,String code) {return supplied==null||supplied.isBlank()?code.toLowerCase(Locale.ROOT).replace('_','-'):supplied.trim();}
    private <T>T patch(T input,Class<T> type,Map<String,Object> additions) {
        Map<String,Object> data=json.convertValue(input,new tools.jackson.core.type.TypeReference<>(){});data.putAll(additions);return json.convertValue(data,type);
    }
    private static ApiException invalid(String message){return new ApiException(HttpStatus.BAD_REQUEST,"VALIDATION_ERROR",message);}
}
