package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminImportDtos.*;
import static com.yangdoujiao.website.admin.AdminCatalogDtos.*;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;
import jakarta.validation.Validator;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional
public class AdminImportService {
    private final AdminImportRepository repository;
    private final AdminCatalogRepository catalog;
    private final AdminCatalogService catalogService;
    private final AdminImportExcel excel;
    private final Validator validator;
    private final ObjectMapper json;
    public AdminImportService(AdminImportRepository repository,AdminCatalogRepository catalog,
            AdminCatalogService catalogService,AdminImportExcel excel,Validator validator,ObjectMapper json) {
        this.repository=repository;this.catalog=catalog;this.catalogService=catalogService;
        this.excel=excel;this.validator=validator;this.json=json;
    }
    @Transactional(readOnly=true) public byte[] template(EntityType type){return excel.template(type,catalog.options());}
    @Transactional(readOnly=true) public PageResponse<ImportBatch> history(int page,int size){long total=repository.batchCount();return new PageResponse<>(repository.batches(page,size),page,size,total,(int)Math.ceil(total/(double)size));}
    @Transactional(readOnly=true) public ImportBatch batch(UUID id){return required(repository.batch(id));}
    @Transactional(readOnly=true) public List<ImportRow> rows(UUID id){batch(id);return repository.rows(id);}
    public UploadResult upload(EntityType type,String filename,byte[] bytes,long userId){
        String safe=Objects.toString(filename,"上传文件.xlsx").replaceAll("[\\\\/\\p{Cntrl}]","_");safe=safe.substring(0,Math.min(safe.length(),255));
        UUID id=repository.createBatch(type,safe,userId);
        try {
            if(!safe.toLowerCase(Locale.ROOT).endsWith(".xlsx")) throw new IllegalArgumentException("仅支持.xlsx文件，请使用固定模板");
            var parsed=excel.parse(type,bytes); var context=context(); List<Candidate> previous=new ArrayList<>();
            for(var row:parsed){var data=clean(type,row.payload());Outcome result=assess(type,data,row.error(),context,previous);
                repository.addRow(id,row.number(),type,result.classification(),data,key(type,data),result.reason(),result.matchId(),result.error(),row.error());
                if(result.classification()!=Classification.INVALID)previous.add(candidate(type,data,null,"本次Excel第"+row.number()+"行",context));
            }
            repository.refreshCounts(id);
        }catch(IllegalArgumentException e){repository.failBatch(id,e.getMessage());}
        return new UploadResult(batch(id),repository.rows(id).stream().limit(50).toList());
    }
    public ImportRow edit(UUID batchId,long rowId,Map<String,Object> input){
        batch(batchId);repository.lockBatch(batchId);var row=repository.lockRows(batchId,List.of(rowId)).stream().findFirst().orElseThrow(()->invalid("导入记录不存在"));
        if(Set.of("PUBLISHED","REMOVED").contains(row.draftStatus()))throw invalid("已发布或已移除的记录不能编辑");
        var data=clean(row.entityType(),input);var context=context();
        List<Candidate> others=repository.rows(batchId).stream().filter(r->r.id()!=rowId&&!Set.of("PUBLISHED","REMOVED").contains(r.draftStatus())&&r.classification()!=Classification.INVALID)
            .map(r->candidate(r.entityType(),r.payload(),null,"本次Excel第"+r.rowNumber()+"行",context)).toList();
        Outcome result=assess(row.entityType(),data,null,context,others);
        repository.clearParseError(rowId);repository.updateRow(rowId,data,result.classification(),key(row.entityType(),data),result.reason(),result.matchId(),result.error());repository.refreshCounts(batchId);
        return repository.rows(batchId).stream().filter(r->r.id()==rowId).findFirst().orElseThrow();
    }
    public ImportBatch remove(UUID batchId,List<Long> ids){batch(batchId);repository.lockBatch(batchId);if(ids.size()>500)throw invalid("一次最多选择500条");for(long id:ids)repository.removeRow(batchId,id);repository.refreshCounts(batchId);return batch(batchId);}
    public ImportBatch reprocess(UUID batchId){
        batch(batchId);repository.lockBatch(batchId);var context=context();List<Candidate> previous=new ArrayList<>();
        for(var row:repository.rows(batchId)) if(!Set.of("PUBLISHED","REMOVED").contains(row.draftStatus())){
            Outcome result=assess(row.entityType(),row.payload(),row.parseError(),context,previous);
            repository.updateRow(row.id(),row.payload(),result.classification(),key(row.entityType(),row.payload()),result.reason(),result.matchId(),result.error());
            if(result.classification()!=Classification.INVALID)previous.add(candidate(row.entityType(),row.payload(),null,"本次Excel第"+row.rowNumber()+"行",context));
        }
        repository.refreshCounts(batchId);return batch(batchId);
    }
    public PublishResult publish(UUID batchId,List<Long> ids){
        batch(batchId);if(ids.isEmpty()||ids.size()>500||ids.stream().distinct().count()!=ids.size())throw invalid("请选择1至500条不同草稿");
        repository.lockBatch(batchId);repository.lockCatalog();var rows=repository.lockRows(batchId,ids);
        if(rows.size()!=ids.size())throw invalid("选择中包含不存在的草稿");
        // An identical retry is safe: already-published rows are never inserted again.
        if(rows.stream().allMatch(r->r.draftStatus().equals("PUBLISHED")))return new PublishResult(batch(batchId),0);
        if(rows.stream().anyMatch(r->!r.draftStatus().equals("DRAFT")))throw invalid("只能发布有效草稿，请刷新后重新选择");
        var context=context();List<Candidate> previous=new ArrayList<>();boolean blocked=false;
        for(var row:rows){Outcome result=assess(row.entityType(),row.payload(),row.parseError(),context,previous);
            if(result.classification()!=Classification.NEW){repository.updateRow(row.id(),row.payload(),result.classification(),key(row.entityType(),row.payload()),result.reason(),result.matchId(),result.error());blocked=true;}
            previous.add(candidate(row.entityType(),row.payload(),null,"本次Excel第"+row.rowNumber()+"行",context));
        }
        if(blocked){repository.refreshCounts(batchId);return new PublishResult(batch(batchId),0);}
        for(var row:rows){long recordId;
            if(row.entityType()==EntityType.UNIVERSITY) recordId=catalogService.createUniversity(university(row.payload())).id();
            else {recordId=catalogService.createProgramme(programme(row.payload(),context)).id();repository.setCampus(recordId,str(row.payload(),"campus"));}
            for(String alias:aliases(row.payload()))repository.saveAlias(row.entityType(),recordId,alias,normalize(alias));
            repository.markPublished(row.id(),recordId);
        }
        repository.refreshCounts(batchId);return new PublishResult(batch(batchId),rows.size());
    }
    public void recordFailure(UUID id,int count){repository.publishFailure(id,count);}
    @Transactional(readOnly=true) public byte[] duplicates(UUID id){
        ImportBatch batch=batch(id);List<ImportRow> all=repository.rows(id);
        return excel.export(batch.entityType(),all,row->{
            if(row.matchedRecordId()!=null){Object data=row.entityType()==EntityType.UNIVERSITY?catalog.university(row.matchedRecordId()):catalog.programme(row.matchedRecordId());return json.writeValueAsString(data);}
            var match=Pattern.compile("本次Excel第(\\d+)行").matcher(Objects.toString(row.duplicateReason(),""));
            if(match.find()){int number=Integer.parseInt(match.group(1));return all.stream().filter(r->r.rowNumber()==number).findFirst().map(r->json.writeValueAsString(r.payload())).orElse("");}return "";
        });
    }
    record Context(Map<String,Long> countries,Map<String,Long> categories,Map<String,Long> levels,Map<String,Long> modes,Map<String,Long> universityIds,List<Candidate> universities,List<Candidate> programmes){}
    record Candidate(Long id,String code,String slug,String country,Long universityId,String level,String campus,Set<String> names,String origin,Map<String,Object> data){}
    record Outcome(Classification classification,String reason,Long matchId,String error){}
    private Context context(){
        var countries=repository.countryIds();var categories=repository.categoryIds();var levels=repository.studyLevelIds();var modes=repository.courseModeIds();var uids=repository.universityIds();
        List<Candidate> universities=repository.universities().stream().map(u->new Candidate(u.id(),u.code(),u.slug(),u.countryCode(),null,"","",names(u.nameZh(),u.nameEn(),u.aliases()),"数据库院校ID="+u.id(),null)).toList();
        List<Candidate> programmes=repository.programmes().stream().map(p->new Candidate(p.id(),p.code(),p.slug(),"",p.universityId(),p.levelCode(),p.campus(),names(p.nameZh(),p.nameEn(),p.aliases()),"数据库专业ID="+p.id(),null)).toList();
        return new Context(countries,categories,levels,modes,uids,universities,programmes);
    }
    private Outcome assess(EntityType type,Map<String,Object> data,String parsingError,Context context,List<Candidate> previous){
        try{if(parsingError!=null)throw new IllegalArgumentException(parsingError);validate(type,data,context);}catch(IllegalArgumentException e){return new Outcome(Classification.INVALID,null,null,e.getMessage());}
        Candidate incoming=candidate(type,data,null,"",context);List<Candidate> candidates=new ArrayList<>(type==EntityType.UNIVERSITY?context.universities():context.programmes());candidates.addAll(previous);
        Outcome possible=null;
        for(Candidate old:candidates){
            boolean code=normalize(old.code()).equals(normalize(incoming.code()));
            boolean scope=type==EntityType.UNIVERSITY?Objects.equals(old.country(),incoming.country()):Objects.equals(old.universityId(),incoming.universityId());
            boolean slug=scope&&Objects.equals(old.slug(),incoming.slug());boolean sameName=scope&&old.names().stream().anyMatch(incoming.names()::contains);
            boolean level=Objects.equals(Objects.toString(old.level(),""),Objects.toString(incoming.level(),""));
            String oc=normalize(old.campus()),ic=normalize(incoming.campus());boolean campus=oc.equals(ic);
            if(code||slug||sameName&&(type==EntityType.UNIVERSITY||level&&campus)){
                String reason=old.origin()+"："+(code?"编码相同":slug?"网址标识相同":"标准化名称或别名、国家/院校、学历和校区相同");
                Map<String,Object> current=old.data();
                if(current==null)current=existingPayload(type,old.id(),context);
                boolean conflict=!scope || type==EntityType.PROGRAMME&&(!level||!campus)||conflicting(data,current,type);
                return new Outcome(conflict?Classification.CONFLICT:Classification.EXACT_DUPLICATE,reason+(conflict?"；填写字段与已有记录不一致":""),old.id(),null);
            }
            if(scope && (type==EntityType.UNIVERSITY || (level || old.level()==null) && (campus || oc.isEmpty() || ic.isEmpty())) && (sameName || similar(incoming.names(),old.names())))
                possible=new Outcome(Classification.POSSIBLE_DUPLICATE,old.origin()+"：名称相近或校区/学历信息不足，需人工核对",old.id(),null);
        }
        return possible==null?new Outcome(Classification.NEW,null,null,null):possible;
    }
    private Map<String,Object> existingPayload(EntityType type,long id,Context context){
        Object record=type==EntityType.UNIVERSITY?catalog.university(id):catalog.programme(id);
        Map<String,Object> map=json.convertValue(record,new tools.jackson.core.type.TypeReference<Map<String,Object>>(){});
        if(type==EntityType.PROGRAMME){
            var item=(ProgrammeItem)record;
            map.put("categoryCode",context.categories().entrySet().stream().filter(e->e.getValue().equals(item.categoryId())).map(Map.Entry::getKey).findFirst().orElse(""));
            map.put("studyLevelCode",context.levels().entrySet().stream().filter(e->e.getValue().equals(item.studyLevelId())).map(Map.Entry::getKey).findFirst().orElse(""));
            map.put("courseModeCode",context.modes().entrySet().stream().filter(e->e.getValue().equals(item.courseModeId())).map(Map.Entry::getKey).findFirst().orElse(""));
        }
        return map;
    }
    private boolean conflicting(Map<String,Object> input,Map<String,Object> current,EntityType type){
        for(var field:input.entrySet()){
            String k=field.getKey(),v=Objects.toString(field.getValue(),"").trim();
            if(v.isEmpty()||Set.of("aliases","universityCode","programmeCode","slug","campus","universityId").contains(k))continue;
            Object old=current.get(k);if(old==null||old.toString().isBlank())continue;
            if(Set.of("tuitionMin","tuitionMax","durationMonths").contains(k)){if(new BigDecimal(v).compareTo(new BigDecimal(old.toString()))!=0)return true;}
            else if(!normalize(v).equals(normalize(old.toString())))return true;
        }return false;
    }
    static String normalize(String value){return Normalizer.normalize(Objects.toString(value,""),Normalizer.Form.NFKC).toLowerCase(Locale.ROOT).replaceAll("[\\p{Z}\\s\\p{Punct}，。·、（）【】]+","");}
    private static Set<String> names(String zh,String en,List<String> aliases){Set<String> names=new HashSet<>();names.add(normalize(zh));names.add(normalize(en));for(String alias:aliases)names.add(normalize(alias));names.remove("");return names;}
    private static boolean similar(Set<String> left,Set<String> right){for(String a:left)for(String b:right){if(Math.min(a.length(),b.length())>=6&&(a.contains(b)||b.contains(a)))return true;int limit=Math.max(1,Math.min(a.length(),b.length())/10);if(a.length()>=4&&b.length()>=4&&Math.abs(a.length()-b.length())<=limit&&distance(a,b,limit)<=limit)return true;}return false;}
    private static int distance(String a,String b,int limit){int[] d=new int[b.length()+1];for(int i=0;i<d.length;i++)d[i]=i;for(int i=1;i<=a.length();i++){int prev=d[0];d[0]=i;for(int j=1;j<=b.length();j++){int old=d[j];d[j]=Math.min(Math.min(d[j]+1,d[j-1]+1),prev+(a.charAt(i-1)==b.charAt(j-1)?0:1));prev=old;}int min=Arrays.stream(d).min().orElse(limit+1);if(min>limit)return limit+1;}return d[b.length()];}
    private static Candidate candidate(EntityType type,Map<String,Object> p,Long id,String origin,Context c){return new Candidate(id,str(p,type==EntityType.UNIVERSITY?"universityCode":"programmeCode"),str(p,"slug"),str(p,"countryCode"),c.universityIds().get(str(p,"universityCode")),str(p,"studyLevelCode"),str(p,"campus"),names(str(p,"nameZh"),str(p,"nameEn"),aliases(p)),origin,p);}
    private static String key(EntityType type,Map<String,Object> data){return normalize(str(data,type==EntityType.UNIVERSITY?"countryCode":"universityCode"))+"|"+normalize(str(data,"nameZh")+str(data,"nameEn"))+"|"+str(data,"studyLevelCode")+"|"+normalize(str(data,"campus"));}
    private static List<String> aliases(Map<String,Object> data){return Arrays.stream(str(data,"aliases").split("[;；]" )).map(String::trim).filter(s->!s.isEmpty()).toList();}
    private Map<String,Object> clean(EntityType type,Map<String,Object> input){Map<String,Object> out=new LinkedHashMap<>();Set<String> allowed=new HashSet<>();for(var col:AdminImportExcel.columns(type))allowed.add(col.key());if(!allowed.containsAll(input.keySet()))throw invalid("包含模板以外的字段");for(var col:AdminImportExcel.columns(type)){Object raw=input.get(col.key());if(raw!=null&&!(raw instanceof String)&&!(raw instanceof Number))throw invalid("字段必须为文字或数字");String value=Objects.toString(raw,"").trim();if(value.length()>20000)throw invalid("字段内容不能超过20000字");if(col.key().endsWith("Code")||col.key().equals("tuitionCurrency"))value=value.toUpperCase(Locale.ROOT);out.put(col.key(),value);}return out;}
    private void validate(EntityType type,Map<String,Object> data,Context c){
        for(var col:AdminImportExcel.columns(type))if(col.title().endsWith("*")&&str(data,col.key()).isEmpty())throw new IllegalArgumentException(col.title()+"不能为空");
        if(str(data,"nameZh").isEmpty()&&str(data,"nameEn").isEmpty())throw new IllegalArgumentException("中文或英文名称至少填写一个");
        Object input=type==EntityType.UNIVERSITY?university(data):programme(data,c);
        var violations=validator.validate(input);if(!violations.isEmpty())throw new IllegalArgumentException("字段格式错误："+violations.stream().map(v->AdminImportExcel.columns(type).stream().filter(f->f.key().equals(v.getPropertyPath().toString())).map(AdminImportExcel.Column::title).findFirst().orElse("关联字段")).sorted().reduce((a,b)->a+"、"+b).orElse(""));
        if(type==EntityType.UNIVERSITY&&!c.countries().containsKey(str(data,"countryCode")))throw new IllegalArgumentException("国家代码不存在，请使用字典中的代码");
        if(type==EntityType.PROGRAMME){
            if(!c.universityIds().containsKey(str(data,"universityCode")))throw new IllegalArgumentException("所属院校不存在，请先发布院校或使用已有院校编码");
            if(!c.categories().containsKey(str(data,"categoryCode")))throw new IllegalArgumentException("学科分类不存在或未启用");
            if(!c.levels().containsKey(str(data,"studyLevelCode")))throw new IllegalArgumentException("学历层次不存在或未启用");
            if(!str(data,"courseModeCode").isEmpty()&&!c.modes().containsKey(str(data,"courseModeCode")))throw new IllegalArgumentException("授课方式代码不存在");
            if(str(data,"campus").length()>200)throw new IllegalArgumentException("校区不能超过200字");
            BigDecimal min=decimal(data,"tuitionMin"),max=decimal(data,"tuitionMax");if(min!=null&&max!=null&&min.compareTo(max)>0)throw new IllegalArgumentException("最低学费不能超过最高学费");if((min!=null||max!=null)&&str(data,"tuitionCurrency").isEmpty())throw new IllegalArgumentException("填写学费时必须填写币种");
        }
        for(String key:List.of("officialUrl","logoUrl")){String value=str(data,key);if(!value.isEmpty()){try{var uri=java.net.URI.create(value);if(!Set.of("http","https").contains(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null)throw new IllegalArgumentException();}catch(Exception e){throw new IllegalArgumentException("官网或Logo链接必须为有效HTTP(S)地址");}}}
        if(aliases(data).size()>20)throw new IllegalArgumentException("每条记录最多20个别名");
        for(String alias:aliases(data))if(alias.length()>200||normalize(alias).isEmpty())throw new IllegalArgumentException("别名不能为空或超过200字");
    }
    private static UniversityInput university(Map<String,Object> p){return new UniversityInput(str(p,"universityCode"),str(p,"slug"),str(p,"nameZh"),str(p,"nameEn"),str(p,"countryCode"),str(p,"regionZh"),str(p,"regionEn"),str(p,"descriptionZh"),str(p,"descriptionEn"),str(p,"officialUrl"),str(p,"logoUrl"));}
    private static ProgrammeInput programme(Map<String,Object> p,Context c){return new ProgrammeInput(str(p,"programmeCode"),c.universityIds().get(str(p,"universityCode")),str(p,"slug"),str(p,"nameZh"),str(p,"nameEn"),c.categories().get(str(p,"categoryCode")),c.levels().get(str(p,"studyLevelCode")),c.modes().get(str(p,"courseModeCode")),str(p,"descriptionZh"),str(p,"descriptionEn"),integer(p,"durationMonths"),str(p,"durationDisplay"),decimal(p,"tuitionMin"),decimal(p,"tuitionMax"),blank(str(p,"tuitionCurrency")),str(p,"tuitionDisplay"),str(p,"admissionsZh"),str(p,"admissionsEn"),str(p,"curriculumZh"),str(p,"curriculumEn"),str(p,"officialUrl"));}
    private static String str(Map<String,Object> p,String key){return Objects.toString(p.get(key),"").trim();}
    private static String blank(String s){return s.isEmpty()?null:s;}
    private static BigDecimal decimal(Map<String,Object> p,String key){String s=str(p,key);if(s.isEmpty())return null;if(!s.matches("[0-9]{1,12}(?:\\.[0-9]{1,2})?"))throw new IllegalArgumentException("学费必须为非负数字，最多12位整数和2位小数");return new BigDecimal(s);}
    private static Integer integer(Map<String,Object> p,String key){String s=str(p,key);if(s.isEmpty())return null;if(!s.matches("[1-9][0-9]{0,4}"))throw new IllegalArgumentException("学制月数必须为正整数");return Integer.valueOf(s);}
    private static <T>T required(T value){if(value==null)throw new ApiException(HttpStatus.NOT_FOUND,"NOT_FOUND","导入批次不存在");return value;}
    private static ApiException invalid(String message){return new ApiException(HttpStatus.BAD_REQUEST,"VALIDATION_ERROR",message);}
}
