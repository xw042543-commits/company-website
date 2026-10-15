package com.yangdoujiao.website.admin;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import static com.yangdoujiao.website.admin.AdminCourseService.*;

@RestController @RequestMapping("/api/v1/admin/catalog/courses") @org.springframework.validation.annotation.Validated
public class AdminCourseController {
    private final AdminCourseService service;
    public AdminCourseController(AdminCourseService service){this.service=service;}
    @GetMapping("/programmes") public List<Option> options(){return service.programmes();}
    @GetMapping public PageResponse<CourseItem> list(@RequestParam(defaultValue="") @jakarta.validation.constraints.Size(max=100) String q,@RequestParam(required=false) Long programmeId,@RequestParam(defaultValue="") String status,@RequestParam(defaultValue="1") @jakarta.validation.constraints.Min(1) int page,@RequestParam(defaultValue="20") @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(100) int size){return service.list(q,programmeId,status,page,size);}
    @PostMapping public CourseItem create(@RequestBody CourseInput in){return service.save(null,in);}
    @PutMapping("/{id}") public CourseItem update(@PathVariable long id,@RequestBody CourseInput in){return service.save(id,in);}
    @PatchMapping("/{id}/status") public CourseItem status(@PathVariable long id,@jakarta.validation.Valid @RequestBody StatusInput in){return service.status(id,in.enabled());}
}
