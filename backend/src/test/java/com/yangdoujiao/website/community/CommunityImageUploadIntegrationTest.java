package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.community.media.*;
import com.yangdoujiao.website.common.exception.ApiException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.*;
import java.time.Clock;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class CommunityImageUploadIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager manager;
    @Autowired UserAccountRepository accounts;
    @Autowired CommunityUserRestrictionRepository restrictions;
    @TempDir Path root;
    long owner;
    CommunityImageUploadService service;
    @BeforeEach void setup() throws Exception {
        owner = jdbc.queryForObject("INSERT INTO user_accounts(full_name,password_hash,status,agreement_version,privacy_version) VALUES ('Image Upload Test',NULL,'ACTIVE','v1','v1') RETURNING id", Long.class);
        service = createService(100_000_000L);
    }
    private CommunityImageUploadService createService(long limit) throws Exception {
        return new CommunityImageUploadService(new CommunityImageRepository(jdbc), accounts, restrictions,
            new LocalCommunityImageStorage(root), new TransactionTemplate(manager), Clock.systemUTC(),
            () -> true, () -> Long.MAX_VALUE, limit);
    }
    @AfterEach void cleanup() {
        jdbc.update("UPDATE community_image_capacity SET used_bytes=used_bytes-COALESCE((SELECT SUM(byte_size) FROM community_images WHERE owner_account_id=?),0) WHERE id=1", owner);
        jdbc.update("DELETE FROM community_images WHERE owner_account_id=?", owner);
        jdbc.update("DELETE FROM user_accounts WHERE id=?", owner);
    }
    @Test void uploadIsOwnedPrivateAndPending() throws Exception {
        var result=service.upload(owner,png());
        assertEquals("PENDING",result.status());
        assertEquals(owner,jdbc.queryForObject("SELECT owner_account_id FROM community_images WHERE id=?",Long.class,result.id()));
        String key=jdbc.queryForObject("SELECT storage_key FROM community_images WHERE id=?",String.class,result.id());
        assertNotNull(ImageIO.read(new java.io.ByteArrayInputStream(new LocalCommunityImageStorage(root).read(key,false))));
        assertTrue(jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1",Long.class)>0);
    }
    @Test void controllerReturnsCreatedWithoutPublicUrl() throws Exception {
        var controller=new CommunityImageUploadController(service);
        var actor=com.yangdoujiao.website.auth.session.UserPrincipal.from(accounts.findById(owner).orElseThrow());
        var response=controller.upload(new org.springframework.mock.web.MockMultipartFile("file","../../photo.png","image/png",png()),actor);
        assertEquals(201,response.getStatusCode().value());
        assertEquals("PENDING",response.getBody().status());
        assertEquals(32,response.getBody().id().length());
    }
    @Test void controllerRejectsUnauthenticatedAndOversizedInput() throws Exception {
        var controller=new CommunityImageUploadController(service);
        var file=new org.springframework.mock.web.MockMultipartFile("file",png());
        assertEquals("AUTHENTICATION_REQUIRED",assertThrows(ApiException.class,()->controller.upload(file,null)).getCode());
        var actor=com.yangdoujiao.website.auth.session.UserPrincipal.from(accounts.findById(owner).orElseThrow());
        var large=new org.springframework.mock.web.MockMultipartFile("file",new byte[5*1024*1024+1]);
        assertEquals("INVALID_COMMUNITY_IMAGE",assertThrows(ApiException.class,()->controller.upload(large,actor)).getCode());
    }
    @Test void quotaRejectsBeforeWriting() throws Exception {
        service=createService(1);
        assertEquals("COMMUNITY_IMAGE_CAPACITY",assertThrows(ApiException.class,()->service.upload(owner,png())).getCode());
        try(var files=Files.list(root)){assertEquals(0,files.count());}
    }
    @Test void inactiveAccountCannotUpload() {
        jdbc.update("UPDATE user_accounts SET status='DELETED',deleted_at=CURRENT_TIMESTAMP WHERE id=?",owner);
        assertEquals("COMMUNITY_USER_RESTRICTED",assertThrows(ApiException.class,()->service.upload(owner,png())).getCode());
    }
    @Test void dailyLimitCannotBeBypassed() throws Exception {
        jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size) SELECT md5(? || '-' || n),?,md5(? || '-' || n),1,1,1 FROM generate_series(1,90) n",Long.toString(owner),owner,Long.toString(owner));
        jdbc.update("UPDATE community_image_capacity SET used_bytes=used_bytes+90 WHERE id=1");
        assertEquals("COMMUNITY_IMAGE_DAILY_LIMIT",assertThrows(ApiException.class,()->service.upload(owner,png())).getCode());
    }
    @Test void rollbackRemovesBothFilesAndAccounting() throws Exception {
        byte[] content=png();
        new TransactionTemplate(manager).executeWithoutResult(tx->{service.upload(owner,content);tx.setRollbackOnly();});
        assertEquals(0L,jdbc.queryForObject("SELECT COUNT(*) FROM community_images WHERE owner_account_id=?",Long.class,owner));
        try(var files=Files.list(root)){assertEquals(0,files.count());}
    }
    @Test void reservedDiskSpaceIsProtected() throws Exception {
        var lowDisk=new CommunityImageUploadService(new CommunityImageRepository(jdbc),accounts,restrictions,
            new LocalCommunityImageStorage(root),new TransactionTemplate(manager),Clock.systemUTC(),()->true,()->2L*1024*1024*1024,100_000_000L);
        assertEquals("COMMUNITY_IMAGE_CAPACITY",assertThrows(ApiException.class,()->lowDisk.upload(owner,png())).getCode());
    }
    @Test void disabledCommunityRejectsUploads() throws Exception {
        var disabled=new CommunityImageUploadService(new CommunityImageRepository(jdbc),accounts,restrictions,
            new LocalCommunityImageStorage(root),new TransactionTemplate(manager),Clock.systemUTC(),()->false,()->Long.MAX_VALUE,100_000_000L);
        assertEquals("COMMUNITY_DISABLED",assertThrows(ApiException.class,()->disabled.upload(owner,png())).getCode());
    }
    private static byte[] png() throws Exception {
        var output=new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(10,10,BufferedImage.TYPE_INT_RGB),"png",output);
        return output.toByteArray();
    }
}
