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
  app=service.progress(adviser,id,new Progress(Status.PAID,1,"Payment confirmed"));
  assertThat(service.list(owner,false,Status.IN_PROGRESS,0).items()).extracting(Summary::status).containsExactly(Status.PAID);
  assertThat(service.list(outsider,false,null,0).items()).isEmpty();
  assertThatThrownBy(()->service.detail(outsider,false,id)).isInstanceOf(ApiException.class);
  app=service.addDocument(adviser,id,new DocumentRequest("Passport",2));UUID doc=app.documents().getFirst().id();
  app=service.upload(owner,id,doc,new Upload("passport.pdf","JVBERi0="));assertThat(app.documents().getFirst().status()).isEqualTo(DocumentStatus.SUBMITTED);
  assertThat(service.file(owner,false,id,doc).contentBase64()).isEqualTo("JVBERi0=");
  app=service.review(adviser,id,doc,new Review(DocumentStatus.APPROVED,"Checked"));assertThat(app.documents().getFirst().status()).isEqualTo(DocumentStatus.APPROVED);
  app=service.fee(adviser,id,UUID.randomUUID(),new FeeRequest("Application fee",new BigDecimal("100.00"),"MYR",FeeStatus.DUE,3));assertThat(app.fees()).hasSize(1);
  app=service.progress(adviser,id,new Progress(Status.SUBMITTED,3,"Sent to university"));assertThat(service.list(owner,false,Status.IN_PROGRESS,0).items()).hasSize(1);assertThat(app.history()).hasSize(7);
 }
 @Test void studentCheckoutCreatesIndependentUnpaidApplicationsAndIsIdempotent(){
  long owner=account();String suffix=UUID.randomUUID().toString().replace("-","");
  long category=jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?, 'Computing') RETURNING id",Long.class,"PAY_"+suffix.toUpperCase());
  long university=jdbc.queryForObject("INSERT INTO universities(name,slug,country,name_zh,status) VALUES('Checkout School',?,'Malaysia','结算院校','PUBLISHED') RETURNING id",Long.class,"checkout-"+suffix);
  long first=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_zh,status) VALUES(?,?,?,?,'专业一','PUBLISHED') RETURNING id",Long.class,"PAY_A_"+suffix.toUpperCase(),university,category,"checkout-a-"+suffix);
  long second=jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_zh,status) VALUES(?,?,?,?,'专业二','PUBLISHED') RETURNING id",Long.class,"PAY_B_"+suffix.toUpperCase(),university,category,"checkout-b-"+suffix);
  String key="checkout_"+suffix;
  var created=service.checkout(owner,key,new CheckoutRequest(List.of(first,second)));
  assertThat(created.status()).isEqualTo("UNPAID");assertThat(created.amountFen()).isNull();assertThat(created.applications()).hasSize(2);
  assertThat(created.applications()).allMatch(item->item.application().status()==Status.UNPAID && item.payment()!=null && !item.payment().ready());
  var retried=service.checkout(owner,key,new CheckoutRequest(List.of(second,first)));
  assertThat(retried.orderId()).isEqualTo(created.orderId());
  assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM student_applications WHERE payment_order_id=?",Long.class,created.orderId())).isEqualTo(2);
  assertThatThrownBy(()->service.checkout(owner,key,new CheckoutRequest(List.of(first)))).isInstanceOf(ApiException.class);
 }
}
