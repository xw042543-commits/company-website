package com.yangdoujiao.website.community;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.community.media.CommunityImageStorage;
import java.time.*;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest @ActiveProfiles("test") @Import(TestContainersConfiguration.class)
class CommunityImageCleanupIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager manager;
    @Test void expiresOnlyUnboundImagesAndReleasesCapacity() throws Exception {
        var tx = new TransactionTemplate(manager);
        tx.executeWithoutResult(status -> {
            long owner=jdbc.queryForObject("INSERT INTO user_accounts(full_name,status,agreement_version,privacy_version) VALUES('Cleanup','ACTIVE','v1','v1') RETURNING id",Long.class);
            String expired=UUID.randomUUID().toString().replace("-","");
            String fresh=UUID.randomUUID().toString().replace("-","");
            jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1 FOR UPDATE",Long.class);
            long before=jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1",Long.class);
            jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size,created_at) VALUES(?,?,?,1,1,9,CURRENT_TIMESTAMP-INTERVAL '25 hours'),(?,?,?,1,1,9,CURRENT_TIMESTAMP)",expired,owner,expired,fresh,owner,fresh);
            jdbc.update("UPDATE community_image_capacity SET used_bytes=used_bytes+18 WHERE id=1");
            var storage=mock(CommunityImageStorage.class);
            var cleanup=new CommunityImageCleanupRepository(jdbc);
            assertEquals(1,cleanup.expireUnbound(Instant.now(),storage));
            assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM community_images WHERE owner_account_id=?",Integer.class,owner));
            assertEquals(before+9,jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1",Long.class));
            try { verify(storage).delete(expired); verify(storage,never()).delete(fresh); } catch(Exception e) { throw new RuntimeException(e); }
            status.setRollbackOnly();
        });
    }
}
