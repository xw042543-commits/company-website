package com.yangdoujiao.website.community;

import java.io.IOException;
import java.nio.file.*;
import java.time.Clock;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.community.media.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration(proxyBeanMethods=false)
@ConditionalOnProperty(name="app.community.images.enabled",havingValue="true")
@EnableScheduling
public class CommunityImageUploadConfiguration {
    @Bean CommunityImageCleanupWorker communityImageCleanupWorker(CommunityImageCleanupRepository repository,Clock clock,
            @Value("${app.community.images.root}") String root) throws IOException {
        return new CommunityImageCleanupWorker(repository,new LocalCommunityImageStorage(Path.of(root)),clock);
    }
    @Bean CommunityImageUploadService communityImageUploadService(JdbcTemplate jdbc,UserAccountRepository accounts,
            CommunityUserRestrictionRepository restrictions,PlatformTransactionManager manager,Clock clock,
            CommunityProperties community,@Value("${app.community.images.root}") String directory,
            @Value("${app.community.images.max-bytes}") long maxBytes) throws IOException {
        if(directory.isBlank() || !Path.of(directory).isAbsolute()) throw new IllegalArgumentException("An absolute private image directory is required");
        Path root=Path.of(directory);
        var storage=new LocalCommunityImageStorage(root);
        return new CommunityImageUploadService(new CommunityImageRepository(jdbc),accounts,restrictions,storage,
            new TransactionTemplate(manager),clock,community::enabled,()-> {
                try {return Files.getFileStore(root).getUsableSpace();}
                catch(IOException e) {return 0L;}
            },maxBytes);
    }
    @Bean jakarta.servlet.MultipartConfigElement communityImageMultipartConfig() {
        return new jakarta.servlet.MultipartConfigElement("",5L*1024*1024,6L*1024*1024,0);
    }
}
