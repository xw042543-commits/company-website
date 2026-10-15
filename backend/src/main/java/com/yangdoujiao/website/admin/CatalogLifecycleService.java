package com.yangdoujiao.website.admin;

import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;
import static com.yangdoujiao.website.admin.AdminImportDtos.EntityType;

@Service @Transactional
public class CatalogLifecycleService {
    public record Selection(EntityType type,List<Long> ids,String action,String confirmation){}
    public record Impact(long id,String name,boolean inRecycleBin,Map<String,Long> associations,boolean canPermanentlyDelete){}
    private final CatalogLifecycleRepository repository;
    private final CatalogIdentityService identities;
    private final AdminCatalogRepository catalog;
    private final AdminCourseService courses;
    public CatalogLifecycleService(CatalogLifecycleRepository repository,CatalogIdentityService identities,AdminCatalogRepository catalog,AdminCourseService courses){this.repository=repository;this.identities=identities;this.catalog=catalog;this.courses=courses;}
    @Transactional(readOnly=true) public Map<String,Boolean> capabilities(long actor){requireAdmin(actor);return Map.of("permanentDelete",repository.advanced(actor));}
    @Transactional(readOnly=true) public List<Map<String,Object>> audit(long actor,int page,int size){requireAdmin(actor);return repository.audit(page,size);}
    @Transactional(readOnly=true) public List<Impact> preview(long actor,Selection input){requireAdmin(actor);validate(input);return impacts(actor,input,false);}
    @CacheEvict(cacheNames="popularUniversities",allEntries=true)
    public List<Impact> execute(long actor,Selection input){
        requireAdmin(actor);validate(input);identities.lockCatalog();
        if(input.action().equals("PURGE")&&!repository.advanced(actor))throw new ApiException(HttpStatus.FORBIDDEN,"FORBIDDEN","仅高级管理员可永久删除");
        String expected=input.action().equals("PURGE")?"永久删除":"确认";
        if(!expected.equals(input.confirmation()))throw invalid("请先核对影响范围，再输入“"+expected+"”确认操作");
        var records=repository.records(input.type(),input.ids(),true);var impacts=impacts(actor,input,true);
        if(input.action().equals("PURGE")&&impacts.stream().anyMatch(i->!i.canPermanentlyDelete()))throw invalid("仅可永久删除回收站中无关联的数据；存在申请、订单、支付、收藏或下级数据时请保留记录");
        Set<Long> universities=new HashSet<>(),programmes=new HashSet<>();
        for(var record:records){long id=((Number)record.get("id")).longValue();
            if(input.type()==EntityType.UNIVERSITY)universities.add(id);
            else if(input.type()==EntityType.PROGRAMME)universities.add(((Number)record.get("university_id")).longValue());
            else {long p=((Number)record.get("programme_id")).longValue();programmes.add(p);universities.add(catalog.programmeUniversityId(p));}
            boolean already=input.action().equals("TRASH")?record.get("deleted_at")!=null:input.action().equals("RESTORE")&&record.get("deleted_at")==null;
            if(already)continue;
            repository.change(input.type(),id,input.action());repository.audit(actor,input.type(),id,input.action(),record);
        }
        programmes.forEach(courses::synchronize);universities.forEach(catalog::enqueue);return impacts;
    }
    private List<Impact> impacts(long actor,Selection input,boolean lock){var records=repository.records(input.type(),input.ids(),lock);
        if(records.size()!=input.ids().size())throw invalid("部分记录已不存在，请刷新列表");
        return records.stream().map(r->{long id=((Number)r.get("id")).longValue();var links=repository.impact(input.type(),id);boolean trash=r.get("deleted_at")!=null;
            return new Impact(id,Objects.toString(r.get("name_zh"),Objects.toString(r.get("name_en"),"课程 #"+id)),trash,links,trash&&repository.advanced(actor)&&links.values().stream().allMatch(v->v==0));}).toList();
    }
    private void requireAdmin(long actor){if(!repository.administrator(actor))throw new ApiException(HttpStatus.FORBIDDEN,"FORBIDDEN","管理员权限已失效，请重新登录");}
    private void validate(Selection input){if(input.type()==null||input.ids()==null||input.ids().isEmpty()||input.ids().size()>100||input.ids().stream().anyMatch(id->id==null||id<1)||input.ids().stream().distinct().count()!=input.ids().size()||!Set.of("TRASH","RESTORE","PURGE").contains(Objects.toString(input.action(),"")))throw invalid("请选择1至100条不同记录及有效操作");}
    private static ApiException invalid(String message){return new ApiException(HttpStatus.BAD_REQUEST,"VALIDATION_ERROR",message);}
}
