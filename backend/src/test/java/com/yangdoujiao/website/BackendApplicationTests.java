package com.yangdoujiao.website;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.search.UniversitySearchDocument;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class BackendApplicationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ElasticsearchOperations elasticsearchOperations;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private FindByIndexNameSessionRepository<? extends Session> sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoadsUsingIsolatedServices() {
        String databaseName = jdbcTemplate.queryForObject(
                "select current_database()",
                String.class
        );
        RedisCallback<String> ping = connection -> connection.ping();
        String redisPing = redisTemplate.execute(ping);
        boolean searchIndexExists = elasticsearchOperations
                .indexOps(UniversitySearchDocument.class)
                .exists();

        assertThat(databaseName).isEqualTo("company_website_test");
        assertThat(redisPing).isEqualTo("PONG");
        assertThat(searchIndexExists).isTrue();
    }

    @Test
    void authenticationInfrastructureLoadsWithIsolatedServices() {
        assertThat(dataSource).isNotNull();
        assertThat(sessionRepository).isNotNull();
        assertThat(passwordEncoder).isNotNull();
    }
}
