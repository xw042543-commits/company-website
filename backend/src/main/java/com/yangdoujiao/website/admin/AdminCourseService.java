package com.yangdoujiao.website.admin;

import java.util.*;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import com.yangdoujiao.website.common.exception.ApiException;
import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;

@Service @Transactional
public class AdminCourseService {
    public record CourseInput(String courseCode,Long programmeId,String nameZh,String nameEn,String officialCode,String descriptionZh,String sourceUrl,String sourceType,Integer sortOrder){}
    public record CourseItem(long id,String courseCode,long programmeId,String programmeName,String nameZh,String nameEn,String officialCode,String descriptionZh,String sourceUrl,String sourceType,int sortOrder,String status,boolean inRecycleBin,Map<String,Object> moduleData){}
    private final AdminCourseRepository repository;private final CatalogIdentityService identities;private final AdminCatalogRepository catalog;
    public AdminCourseService(AdminCourseRepository repository,CatalogIdentityService identities,AdminCatalogRepository catalog){this.repository=repository;this.identities=identities;this.catalog=catalog;}
    @Transactional(readOnly=true) public PageResponse<CourseItem> list(String q,Long p,String status,int page,int size){if(!Set.of("","TRASH","PUBLISHED","ARCHIVED","DRAFT").contains(status))throw invalid("状态选项无效");return repository.list(q==null?"":q.trim(),p,status,page,size);}
    @Transactional(readOnly=true) public List<Option> programmes(){return repository.programmes();}
    @Transactional(readOnly=true) public List<CourseItem> all(){return repository.all();}
    @Transactional(readOnly=true) public CourseItem get(long id){var item=repository.get(id);if(item==null)throw invalid("课程不存在，请刷新");return item;}
    public CourseItem save(Long id,CourseInput in){
        identities.lockCatalog();validate(in);var old=id==null?null:get(id);
        if(old!=null&&(!Objects.equals(in.programmeId(),old.programmeId())||in.courseCode()!=null&&!in.courseCode().isBlank()&&!old.courseCode().equals(in.courseCode())))throw invalid("已有课程的所属专业与内部编码不可修改，请编辑正确的记录");
        if(repository.forProgramme(in.programmeId()).stream().anyMatch(c->!Objects.equals(id,c.id())&&c.programmeId()==in.programmeId()&&(!AdminImportService.normalize(in.nameZh()).isEmpty()&&AdminImportService.normalize(c.nameZh()).equals(AdminImportService.normalize(in.nameZh()))||!AdminImportService.normalize(in.nameEn()).isEmpty()&&AdminImportService.normalize(c.nameEn()).equals(AdminImportService.normalize(in.nameEn())))))throw conflict("该专业已有同名课程，请编辑原记录或从回收站恢复");
        Map<String,Object> module=old==null?new LinkedHashMap<>():new LinkedHashMap<>(old.moduleData());
        module.put("nameZh",trim(in.nameZh()));module.put("nameEn",trim(in.nameEn()));module.put("courseCode",trim(in.officialCode()));module.put("descriptionZh",trim(in.descriptionZh()));module.put("sourceUrl",trim(in.sourceUrl()));module.put("sourceCheckedAt",OffsetDateTime.now().toString());
        // Preserve official credits, compulsory requirements and evidence already present in the JSON.
        String code=old==null?identities.code("COURSE",in.courseCode()):old.courseCode();
        try{long key=repository.save(id,in,code,module);synchronize(in.programmeId());catalog.enqueue(catalog.programmeUniversityId(in.programmeId()));return get(key);}
        catch(DataIntegrityViolationException e){throw conflict("课程内部编码或官网课程已存在，请核对后重试");}
    }
    public CourseItem status(long id,boolean enabled){var old=get(id);if(old.inRecycleBin())throw invalid("请先从回收站恢复课程");repository.status(id,enabled);synchronize(old.programmeId());catalog.enqueue(catalog.programmeUniversityId(old.programmeId()));return get(id);}
    public void synchronize(long programme){repository.synchronize(programme);}
    public void validate(CourseInput in){
        if(in.programmeId()==null||in.programmeId()<1||catalog.programmeUniversityId(in.programmeId())==null)throw invalid("请选择已有专业；请先发布院校和专业");
        if(trim(in.nameZh()).isEmpty())throw invalid("请填写课程中文名称，便于前台中文展示");
        if(trim(in.nameZh()).length()>200||trim(in.nameEn()).length()>300||trim(in.officialCode()).length()>100||trim(in.descriptionZh()).length()>20000)throw invalid("课程名称、官网代码或介绍过长，请缩短后重新上传");
        if(!Set.of("official","third_party","ai_generated").contains(Objects.toString(in.sourceType(),"")))throw invalid("请从下拉框选择课程资料来源");
        String url=trim(in.sourceUrl());if(in.sourceType().equals("official")&&(url.isEmpty()||!url.startsWith("https://")||trim(in.nameEn()).isEmpty()||trim(in.nameEn()).matches(".*[\u3400-\u9fff].*")))throw invalid("学校官网课程请填写英文原名和 https 官网来源链接；无法核实时请选择参考概述");
        if(!url.isEmpty())try{var uri=java.net.URI.create(url);if(!Set.of("http","https").contains(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||url.length()>1000)throw new IllegalArgumentException();}catch(IllegalArgumentException e){throw invalid("课程来源链接应以 http:// 或 https:// 开头且为有效网页地址");}
        if(in.sortOrder()!=null&&(in.sortOrder()<0||in.sortOrder()>10000))throw invalid("展示顺序请填写0至10000的整数");
    }
    private static String trim(String value){return value==null?"":value.trim();}
    private static ApiException invalid(String m){return new ApiException(HttpStatus.BAD_REQUEST,"VALIDATION_ERROR",m);}
    private static ApiException conflict(String m){return new ApiException(HttpStatus.CONFLICT,"DUPLICATE_DATA",m);}
}
