package com.yangdoujiao.website.application;

import static com.yangdoujiao.website.application.ApplicationModels.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
@Transactional(readOnly=true)
public class ApplicationService {
    private final ApplicationRepository repository;
    public ApplicationService(ApplicationRepository repository) { this.repository=repository; }
    public Page list(long actor,boolean adviser,Status status,int page) {
        if(page<0 || page>10000) throw bad("INVALID_PAGE");
        var items=repository.list(actor,adviser,status==null?null:status.name(),page);
        return new Page(items.stream().limit(20).toList(),items.size()>20);
    }
    public Detail detail(long actor,boolean adviser,UUID id) {
        var application=owned(actor,adviser,id);
        return new Detail(application,repository.documents(id),repository.fees(id),repository.history(id));
    }
    public File file(long actor,boolean adviser,UUID id,UUID document) {
        owned(actor,adviser,id);
        return repository.file(id,document).orElseThrow(()->missing());
    }
    @Transactional
    public Detail create(long actor,Create value) {
        var id=UUID.randomUUID();
        if(repository.create(id,"APP"+id.toString().replace("-", "").toUpperCase(Locale.ROOT),actor,value)!=1) throw bad("INVALID_APPLICATION_TARGET");
        repository.event(id,1,"申请已建立，开始准备材料");
        return detail(actor,true,id);
    }
    @Transactional
    public Detail progress(long actor,UUID id,Progress value) {
        editable(actor,true,id);
        if(value.status()==Status.COMPLETED && value.stage()!=8) throw bad("INVALID_COMPLETION_STAGE");
        repository.progress(id,value); repository.event(id,value.stage(),value.note());
        return detail(actor,true,id);
    }
    @Transactional
    public Detail addDocument(long actor,UUID id,DocumentRequest value) {
        editable(actor,true,id); repository.addDocument(id,UUID.randomUUID(),value);
        repository.event(id,value.stage(),"需要补充材料："+value.title());
        return detail(actor,true,id);
    }
    @Transactional
    public Detail upload(long actor,UUID id,UUID document,Upload value) {
        var app=editable(actor,false,id);
        byte[] bytes=validateFile(value);
        if(repository.upload(id,document,value.filename(),bytes)!=1) throw bad("DOCUMENT_NOT_EDITABLE");
        repository.event(id,app.stage(),"材料已提交，等待审核");
        return detail(actor,false,id);
    }
    @Transactional
    public Detail review(long actor,UUID id,UUID document,Review value) {
        var app=editable(actor,true,id);
        if(value.status()!=DocumentStatus.APPROVED && value.status()!=DocumentStatus.REJECTED) throw bad("INVALID_REVIEW_STATUS");
        if(repository.review(id,document,value)!=1) throw missing();
        repository.event(id,app.stage(),"材料审核："+value.note());
        return detail(actor,true,id);
    }
    @Transactional
    public Detail fee(long actor,UUID id,UUID fee,FeeRequest value) {
        editable(actor,true,id); if(repository.fee(id,fee,value)!=1) throw bad("INVALID_FEE_ID");
        repository.event(id,value.stage(),"费用资料已更新："+value.title());
        return detail(actor,true,id);
    }
    private Summary editable(long actor,boolean adviser,UUID id) {
        owned(actor,adviser,id); repository.lock(id);
        var app=owned(actor,adviser,id);
        if(app.status()==Status.CANCELLED || app.status()==Status.COMPLETED) throw bad("APPLICATION_CLOSED");
        return app;
    }
    private Summary owned(long actor,boolean adviser,UUID id) {
        return repository.owned(id,actor,adviser).orElseThrow(()->missing());
    }
    static byte[] validateFile(Upload value) {
        if(value.filename().contains("/") || value.filename().contains("\\") || value.filename().chars().anyMatch(Character::isISOControl)) throw bad("INVALID_FILENAME");
        byte[] bytes;
        try { bytes=Base64.getDecoder().decode(value.contentBase64()); } catch(IllegalArgumentException ex) { throw bad("INVALID_FILE"); }
        if(bytes.length==0 || bytes.length>1048576) throw bad("FILE_TOO_LARGE");
        String name=value.filename().toLowerCase(Locale.ROOT);
        boolean pdf=name.endsWith(".pdf") && bytes.length>=5 && bytes[0]==37 && bytes[1]==80 && bytes[2]==68 && bytes[3]==70 && bytes[4]==45;
        boolean png=name.endsWith(".png") && bytes.length>=8 && Arrays.equals(Arrays.copyOf(bytes,8),new byte[]{(byte)137,80,78,71,13,10,26,10});
        boolean jpg=(name.endsWith(".jpg") || name.endsWith(".jpeg")) && bytes.length>=3 && bytes[0]==(byte)255 && bytes[1]==(byte)216 && bytes[2]==(byte)255;
        if(!pdf && !png && !jpg) throw bad("UNSUPPORTED_FILE_TYPE");
        return bytes;
    }
    private static ApiException missing() { return new ApiException(HttpStatus.NOT_FOUND,"APPLICATION_NOT_FOUND","Application or document not found"); }
    private static ApiException bad(String code) { return new ApiException(HttpStatus.BAD_REQUEST,code,"Invalid application request"); }
}
