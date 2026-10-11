package com.yangdoujiao.website.application;
import static com.yangdoujiao.website.application.ApplicationModels.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.common.exception.ApiException;
class ApplicationServiceTest {
 private final ApplicationRepository repository=mock(ApplicationRepository.class);
 private final ApplicationService service=new ApplicationService(repository);
 private final UUID id=UUID.randomUUID();
 private Summary summary(Status status){return new Summary(id,"APP", "segi-university","School","Programme","Degree","Business",status,2,"",OffsetDateTime.now());}
 @Test void ownershipIsCheckedBeforeAnyPrivateDocumentRead(){when(repository.owned(id,7,false)).thenReturn(Optional.empty());assertThatThrownBy(()->service.file(7,false,id,UUID.randomUUID())).isInstanceOf(ApiException.class);verify(repository,never()).file(any(),any());}
 @Test void anotherAdviserCannotUpdateAnApplication(){when(repository.owned(id,8,true)).thenReturn(Optional.empty());assertThatThrownBy(()->service.progress(8,id,new Progress(Status.IN_PROGRESS,2,"note"))).isInstanceOf(ApiException.class);verify(repository,never()).progress(any(),any());}
 @Test void closedApplicationsCannotReceiveDocuments(){when(repository.owned(id,7,false)).thenReturn(Optional.of(summary(Status.COMPLETED)));assertThatThrownBy(()->service.upload(7,id,UUID.randomUUID(),new Upload("file.pdf","JVBERi0="))).isInstanceOf(ApiException.class);verify(repository,never()).upload(any(),any(),any(),any());}
 @Test void rejectsRenamedExecutablesAndOversizedFiles(){assertThatThrownBy(()->ApplicationService.validateFile(new Upload("file.pdf",Base64.getEncoder().encodeToString(new byte[]{77,90,0})))).isInstanceOf(ApiException.class);assertThatThrownBy(()->ApplicationService.validateFile(new Upload("file.pdf",Base64.getEncoder().encodeToString(new byte[1048577])))).isInstanceOf(ApiException.class);assertThatThrownBy(()->ApplicationService.validateFile(new Upload("../file.pdf","JVBERi0="))).isInstanceOf(ApiException.class);}
 @Test void acceptsSupportedFileSignatures(){assertThat(ApplicationService.validateFile(new Upload("file.pdf","JVBERi0="))).startsWith((byte)37,(byte)80,(byte)68);}
 @Test void paginationUsesOneExtraRowAndNeverReturnsMoreThanTwenty(){when(repository.list(7,false,null,0)).thenReturn(Collections.nCopies(21,summary(Status.IN_PROGRESS)));var page=service.list(7,false,null,0);assertThat(page.items()).hasSize(20);assertThat(page.hasMore()).isTrue();}
 @Test void successfulUploadCreatesHistoryAfterSaving(){when(repository.owned(id,7,false)).thenReturn(Optional.of(summary(Status.NEEDS_DOCUMENTS)));UUID doc=UUID.randomUUID();when(repository.upload(eq(id),eq(doc),eq("file.pdf"),any())).thenReturn(1);when(repository.documents(id)).thenReturn(List.of());when(repository.fees(id)).thenReturn(List.of());when(repository.history(id)).thenReturn(List.of());service.upload(7,id,doc,new Upload("file.pdf","JVBERi0="));verify(repository).event(eq(id),eq(2),anyString());}
}
