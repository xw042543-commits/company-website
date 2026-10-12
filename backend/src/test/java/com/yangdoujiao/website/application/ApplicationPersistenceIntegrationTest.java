package com.yangdoujiao.website.application;
import static com.yangdoujiao.website.application.ApplicationModels.*;
import static org.assertj.core.api.Assertions.*;
import java.util.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
@SpringBootTest @ActiveProfiles("test") @Import(TestContainersConfiguration.class) @Transactional
class ApplicationPersistenceIntegrationTest {
 @Autowired JdbcTemplate jdbc;
 @Autowired ApplicationService service;
 private long account(){return jdbc.queryForObject("INSERT INTO user_accounts(full_name,agreement_version,privacy_version,status) VALUES('Application Test','v1','v1','ACTIVE') RETURNING id",Long.class);}
 @Test void persistsApplicationDocumentsFeesAndHistoryWithOwnership(){
  long owner=account(),adviser=account(),outsider=account();String suffix=UUID.randomUUID().toString().replace("-","");
  long category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?, 'Business') RETURNING id",Long.class,"APP_"+suffix.toUpperCase());
  long university=jdbc.queryForObject("INSERT INTO universities(name,slug,country,name_zh,status) VALUES('Application School',?,'Malaysia','测试院校','PUBLISHED') RETURNING id",Long.class,"application-"+suffix);
  long programme=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_zh,status) VALUES(?,?,?,?,'测试专业','PUBLISHED') RETURNING id",Long.class,"APP_"+suffix.toUpperCase(),university,category,"application-"+suffix);
  var app=service.create(adviser,new Create(owner,programme));UUID id=app.application().id();
  assertThat(service.list(owner,false,null,0).items()).hasSize(1);
  assertThat(service.list(outsider,false,null,0).items()).isEmpty();
  assertThatThrownBy(()->service.detail(outsider,false,id)).isInstanceOf(ApiException.class);
  app=service.addDocument(adviser,id,new DocumentRequest("Passport",2));UUID doc=app.documents().getFirst().id();
  app=service.upload(owner,id,doc,new Upload("passport.pdf","JVBERi0="));assertThat(app.documents().getFirst().status()).isEqualTo(DocumentStatus.SUBMITTED);
  assertThat(service.file(owner,false,id,doc).contentBase64()).isEqualTo("JVBERi0=");
  app=service.review(adviser,id,doc,new Review(DocumentStatus.APPROVED,"Checked"));assertThat(app.documents().getFirst().status()).isEqualTo(DocumentStatus.APPROVED);
  app=service.fee(adviser,id,UUID.randomUUID(),new FeeRequest("Application fee",new BigDecimal("100.00"),"MYR",FeeStatus.DUE,3));assertThat(app.fees()).hasSize(1);
  app=service.progress(adviser,id,new Progress(Status.SUBMITTED,3,"Sent to university"));assertThat(service.list(owner,false,Status.IN_PROGRESS,0).items()).hasSize(1);assertThat(app.history()).hasSize(6);
 }
}
