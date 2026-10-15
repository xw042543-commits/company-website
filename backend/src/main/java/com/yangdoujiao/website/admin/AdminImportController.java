package com.yangdoujiao.website.admin;
import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import jakarta.validation.Valid;
@org.springframework.validation.annotation.Validated
@RestController
@RequestMapping("/api/v1/admin/imports")
public class AdminImportController {
    private final AdminImportService service;
    public AdminImportController(AdminImportService service){this.service=service;}
    @GetMapping("/templates/{type}") public ResponseEntity<byte[]> template(@PathVariable EntityType type){return file(service.template(type),type.name().toLowerCase()+"-template.xlsx");}
    @GetMapping public AdminCatalogDtos.PageResponse<ImportBatch> history(@RequestParam(defaultValue="1") @jakarta.validation.constraints.Min(1) int page,@RequestParam(defaultValue="20") @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(100) int size){return service.history(page,size);}
    @GetMapping("/{id}") public ImportBatch batch(@PathVariable UUID id){return service.batch(id);}
    @GetMapping("/{id}/rows") public List<ImportRow> rows(@PathVariable UUID id){return service.rows(id);}
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResult upload(@RequestParam EntityType type,@RequestParam MultipartFile file,@AuthenticationPrincipal UserPrincipal actor)throws IOException{
        if(file.getSize()>AdminImportExcel.MAX_BYTES)throw new ApiException(HttpStatus.CONTENT_TOO_LARGE,"IMPORT_TOO_LARGE","Excel文件不能超过5MB");
        return service.upload(type,file.getOriginalFilename(),file.getBytes(),actor.userId());
    }
    @PutMapping("/{id}/rows/{rowId}") public ImportRow edit(@PathVariable UUID id,@PathVariable long rowId,@Valid @RequestBody DraftUpdate request){return service.edit(id,rowId,request.payload());}
    @PostMapping("/{id}/remove") public ImportBatch remove(@PathVariable UUID id,@Valid @RequestBody PublishRequest request){return service.remove(id,request.rowIds());}
    @PostMapping("/{id}/reprocess") public ImportBatch reprocess(@PathVariable UUID id){return service.reprocess(id);}
    @PostMapping("/{id}/publish") public PublishResult publish(@PathVariable UUID id,@Valid @RequestBody PublishRequest request){
        try{return service.publish(id,request.rowIds());}
        catch(ApiException e){if(!"DUPLICATE_DATA".equals(e.getCode()))throw e;service.recordFailure(id,request.rowIds().size());throw new ApiException(HttpStatus.CONFLICT,"IMPORT_PUBLISH_FAILED","发布失败，所选记录已全部回滚，请重新处理后重试。");}
        catch(org.springframework.dao.DataAccessException | org.springframework.transaction.UnexpectedRollbackException e){service.recordFailure(id,request.rowIds().size());throw new ApiException(HttpStatus.CONFLICT,"IMPORT_PUBLISH_FAILED","发布失败，所选记录已全部回滚，请刷新草稿后重试。");}
    }
    @GetMapping("/{id}/duplicates.xlsx") public ResponseEntity<byte[]> duplicates(@PathVariable UUID id){return file(service.duplicates(id),"duplicates-"+id+".xlsx");}
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<java.util.Map<String,String>> tooLarge() { return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(java.util.Map.of("code","IMPORT_TOO_LARGE","message","Excel文件不能超过5MB")); }
    private ResponseEntity<byte[]> file(byte[] content,String name){return ResponseEntity.ok().contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(name).build().toString()).cacheControl(CacheControl.noStore()).body(content);}
}
