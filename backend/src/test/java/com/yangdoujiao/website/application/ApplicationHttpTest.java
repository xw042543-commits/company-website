package com.yangdoujiao.website.application;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.api.AuthSecurityErrorWriter;
import com.yangdoujiao.website.auth.config.*;
import com.yangdoujiao.website.auth.session.*;
import com.yangdoujiao.website.common.exception.GlobalExceptionHandler;
import tools.jackson.databind.ObjectMapper;
@SpringJUnitWebConfig(ApplicationHttpTest.Config.class)
class ApplicationHttpTest {
 @Autowired WebApplicationContext context;
 @MockitoBean UserAccountDetailsService accounts;
 @MockitoBean ApplicationRepository repository;
 MockMvc mvc;
 UserPrincipal student;
 UserPrincipal adviser;
 @BeforeEach void setup(){
  mvc=MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  var account=UserAccount.external("Student","v1","v1");ReflectionTestUtils.setField(account,"id",7L);student=UserPrincipal.from(account);
  ReflectionTestUtils.setField(account,"id",9L);ReflectionTestUtils.setField(account,"role",UserAccountRole.ADVISER);adviser=UserPrincipal.from(account);
 }
 @Test void anonymousCannotReadApplications() throws Exception {mvc.perform(get("/api/v1/miniapp/me/applications")).andExpect(status().isUnauthorized());verifyNoInteractions(repository);}
 @Test void studentCannotCreateOrReviewApplications() throws Exception {mvc.perform(post("/api/v1/adviser/applications").with(user(student)).with(csrf()).contentType("application/json").content("{\"userId\":7,\"programmeId\":1}")).andExpect(status().isForbidden());verifyNoInteractions(repository);}
 @Test void privateListIsOwnerScopedAndNotCacheable() throws Exception {when(repository.list(7,false,null,0)).thenReturn(List.of());mvc.perform(get("/api/v1/miniapp/me/applications").with(user(student))).andExpect(status().isOk()).andExpect(header().string("Cache-Control",org.hamcrest.Matchers.containsString("no-store"))).andExpect(jsonPath("$.items").isEmpty());verify(repository).list(7,false,null,0);}
 @Test void detailOfAnotherUserReturnsNotFound() throws Exception {UUID id=UUID.randomUUID();when(repository.owned(id,7,false)).thenReturn(Optional.empty());mvc.perform(get("/api/v1/miniapp/me/applications/"+id).with(user(student))).andExpect(status().isNotFound());verify(repository,never()).documents(any());}
 @Test void adviserWritesRequireCsrf() throws Exception {mvc.perform(post("/api/v1/adviser/applications").with(user(adviser)).contentType("application/json").content("{\"userId\":7,\"programmeId\":1}")).andExpect(status().isForbidden());verifyNoInteractions(repository);}
 @Test void invalidFilterAndPageAreRejected() throws Exception {mvc.perform(get("/api/v1/miniapp/me/applications?status=FAKE").with(user(student))).andExpect(status().isBadRequest());mvc.perform(get("/api/v1/miniapp/me/applications?page=-1").with(user(student))).andExpect(status().isBadRequest());verifyNoInteractions(repository);}
 @Configuration(proxyBeanMethods=false) @EnableWebMvc @EnableWebSecurity
 @Import({SecurityConfig.class,PasswordEncodingConfig.class,AuthSecurityErrorWriter.class,GlobalExceptionHandler.class,StudentApplicationController.class,AdviserApplicationController.class,ApplicationService.class})
 static class Config {@Bean ObjectMapper objectMapper(){return new ObjectMapper();}}
}
