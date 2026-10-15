package com.yangdoujiao.website.admin;

import static org.assertj.core.api.Assertions.assertThat;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.MountableFile;

class GrantAdvancedAdminScriptTest {
    @Test void grantsOnlyTheSelectedActiveAdministratorAndIsDurableAndIdempotent()throws Exception{
        try(var pg=new GrantDatabase()){
            pg.start();
            Flyway.configure().dataSource(pg.getJdbcUrl(),pg.getUsername(),pg.getPassword()).locations("classpath:db/migration").load().migrate();
            var jdbc=new JdbcTemplate(new SingleConnectionDataSource(pg.getJdbcUrl(),pg.getUsername(),pg.getPassword(),true));
            for(var entry:List.of(new String[]{"target@example.test","ADMIN","ACTIVE"},new String[]{"other@example.test","ADMIN","ACTIVE"},new String[]{"user@example.test","USER","ACTIVE"},new String[]{"disabled@example.test","ADMIN","DISABLED"}))
                jdbc.update("INSERT INTO user_accounts(full_name,normalized_email,password_hash,role,status,agreement_version,privacy_version) VALUES ('Test',?,'hash',?,?,'v1','v1')",entry[0],entry[1],entry[2]);
            pg.copyFileToContainer(MountableFile.forHostPath(Path.of("scripts/grant-existing-advanced-admin.sql").toAbsolutePath()),"/tmp/grant.sql");
            assertThat(run(pg,"target@example.test",false).getExitCode()).isNotZero();
            for(String email:List.of("missing@example.test","user@example.test","disabled@example.test"))assertThat(run(pg,email,true).getExitCode()).isNotZero();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_advanced_administrators",Long.class)).isZero();
            var first=run(pg,"TARGET@example.test",true);assertThat(first.getExitCode()).withFailMessage(first.getStdout()+first.getStderr()).isZero();
            assertThat(first.getStdout()).contains("permanent_advanced_administrator","target@example.test");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_advanced_administrators a JOIN user_accounts u ON u.id=a.user_account_id WHERE u.normalized_email='target@example.test' AND u.role='ADMIN'",Long.class)).isEqualTo(1);
            String timestamp=jdbc.queryForObject("SELECT granted_at::text FROM catalog_advanced_administrators",String.class);
            assertThat(run(pg,"target@example.test",true).getExitCode()).isZero();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM catalog_advanced_administrators",Long.class)).isEqualTo(1);
            assertThat(jdbc.queryForObject("SELECT granted_at::text FROM catalog_advanced_administrators",String.class)).isEqualTo(timestamp);
            assertThat(jdbc.queryForObject("SELECT role FROM user_accounts WHERE normalized_email='user@example.test'",String.class)).isEqualTo("USER");
        }
    }
    private org.testcontainers.containers.Container.ExecResult run(GrantDatabase pg,String email,boolean approval)throws Exception{
        var args=new ArrayList<>(List.of("psql","-U",pg.getUsername(),"-d",pg.getDatabaseName(),"-v","ON_ERROR_STOP=1","-v","identifier="+email));
        if(approval)args.addAll(List.of("-v","approved_by=Explicit test owner approval"));
        args.addAll(List.of("-f","/tmp/grant.sql"));return pg.execInContainer(args.toArray(String[]::new));
    }
    private static final class GrantDatabase extends PostgreSQLContainer implements AutoCloseable {
        GrantDatabase(){super("postgres:17.11");}
        @Override public void close(){stop();}
    }
}
