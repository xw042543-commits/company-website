package com.yangdoujiao.website.admin;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.auth.miniapp.MiniappTokenService;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import jakarta.servlet.http.Cookie;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
    "app.miniapp.auth.enabled=true",
    "app.miniapp.auth.local-provider-enabled=true",
    "app.miniapp.auth.local-test-code=account-management-test",
    "app.miniapp.auth.local-test-subject=account-management-test"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class AdminAccountIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired tools.jackson.databind.ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired AdminAccountService service;
    @Autowired MiniappTokenService tokens;
    private final List<Long> ids = new ArrayList<>();
    private String prefix;
    private Long testUniversity, testCategory, testProgramme;
    private long advanced, target, ordinary;
    @BeforeEach void seed() {
        prefix = "am-" + UUID.randomUUID();
        advanced = create("owner", "ADMIN", "ACTIVE");
        target = create("member", "USER", "ACTIVE");
        ordinary = create("admin", "ADMIN", "ACTIVE");
        jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES(?,'integration-test')", advanced);
    }
    @AfterEach void cleanup() {
        for (long id : ids) {
            jdbc.update("DELETE FROM student_applications WHERE user_account_id=?", id);
            jdbc.update("DELETE FROM application_payment_orders WHERE user_account_id=?", id);
            jdbc.update("DELETE FROM account_management_audit WHERE actor_user_id=? OR target_user_id=?", id, id);
            jdbc.update("DELETE FROM spring_session WHERE principal_name=?", "user:" + id);
            jdbc.update("DELETE FROM miniapp_auth_tokens WHERE user_account_id=?", id);
            jdbc.update("DELETE FROM user_external_identities WHERE user_account_id=?", id);
            jdbc.update("DELETE FROM catalog_advanced_administrators WHERE user_account_id=?", id);
        }
        for (long id : ids) jdbc.update("DELETE FROM user_accounts WHERE id=?", id);
        if (testProgramme != null) jdbc.update("DELETE FROM programmes WHERE id=?", testProgramme);
        if (testUniversity != null) jdbc.update("DELETE FROM universities WHERE id=?", testUniversity);
        if (testCategory != null) jdbc.update("DELETE FROM subject_categories WHERE id=?", testCategory);
    }
    @Test void everyEndpointRequiresCurrentAdvancedAuthority() throws Exception {
        for (String path : List.of("", "/" + target, "/audit")) {
            mvc.perform(get("/api/v1/admin/accounts" + path)).andExpect(status().isUnauthorized());
            for (long id : List.of(target, ordinary)) mvc.perform(get("/api/v1/admin/accounts" + path).with(user(principal(id))))
                .andExpect(status().isForbidden());
        }
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/role").with(user(principal(ordinary))).with(csrf()).contentType("application/json").content(change(target, "\"role\":\"ADMIN\""))).andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/status").with(user(principal(ordinary))).with(csrf()).contentType("application/json").content(change(target, "\"enabled\":false"))).andExpect(status().isForbidden());
        UserPrincipal stale = principal(advanced);
        jdbc.update("UPDATE user_accounts SET status='DISABLED' WHERE id=?", advanced);
        mvc.perform(get("/api/v1/admin/accounts").with(user(stale))).andExpect(status().isForbidden());
    }
    @Test void listsEveryAccountTypeWithServerFiltersPaginationAndSafeDetails() throws Exception {
        create("pending", "USER", "PENDING_VERIFICATION"); create("disabled", "USER", "DISABLED");
        long deleted = create("deleted", "USER", "DELETED");
        jdbc.update("UPDATE user_accounts SET deleted_at=CURRENT_TIMESTAMP WHERE id=?", deleted);
        mvc.perform(get("/api/v1/admin/accounts").with(user(principal(advanced))).param("q", prefix).param("size", "2").param("page", "2"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(6)).andExpect(jsonPath("$.totalPages").value(3)).andExpect(jsonPath("$.items.length()").value(2));
        for (String identity : List.of("ADMIN", "ADVANCED")) mvc.perform(get("/api/v1/admin/accounts").with(user(principal(advanced))).param("q", prefix).param("identity", identity).param("status", "ACTIVE"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        mvc.perform(get("/api/v1/admin/accounts/" + target).with(user(principal(advanced))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.fullName").value(prefix + "member"))
            .andExpect(jsonPath("$.passwordHash").doesNotExist()).andExpect(jsonPath("$.password_hash").doesNotExist());
        mvc.perform(get("/api/v1/admin/accounts").with(user(principal(advanced))).param("q", "%_' OR 1=1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(0));
        mvc.perform(get("/api/v1/admin/accounts").with(user(principal(advanced))).param("page", "0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/accounts").with(user(principal(advanced))).param("identity", "ROOT")).andExpect(status().isBadRequest());
    }
    @Test void upgradeAndDowngradeInvalidateActualCookiesAndNewLoginGetsNewPermissions() throws Exception {
        Cookie old = login(target);
        seedTokens(target);
        mutate(target, "role", "\"role\":\"ADMIN\"");
        mvc.perform(get("/api/v1/account").cookie(old)).andExpect(status().isUnauthorized());
        assertThat(unrevoked(target)).isZero();
        Cookie promoted = login(target);
        mvc.perform(get("/api/v1/admin/catalog/options").cookie(promoted)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/admin/accounts").cookie(promoted)).andExpect(status().isForbidden());
        mutate(target, "role", "\"role\":\"USER\"");
        mvc.perform(get("/api/v1/admin/catalog/options").cookie(promoted)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/catalog/options").cookie(login(target))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/accounts/audit").with(user(principal(advanced))).param("target", Long.toString(target)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(2)).andExpect(jsonPath("$.items[0].actor_user_id").value(advanced))
            .andExpect(jsonPath("$.items[0].target_user_id").value(target)).andExpect(jsonPath("$.items[0].old_role").value("ADMIN"))
            .andExpect(jsonPath("$.items[0].new_role").value("USER")).andExpect(jsonPath("$.items[0].created_at").exists());
        assertThat(jdbc.queryForObject("SELECT full_name FROM user_accounts WHERE id=?", String.class, target)).isEqualTo(prefix + "member");
    }
    @Test void disableBlocksLoginAndTokensAndEnableNeverRevivesOldSessions() throws Exception {
        Cookie old = login(target); seedTokens(target);
        assertThat(tokens.authenticate(prefix + "access").getId()).isEqualTo(target);
        mutate(target, "status", "\"enabled\":false");
        mvc.perform(get("/api/v1/account").cookie(old)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType("application/json").content(credentials(target))).andExpect(status().isUnauthorized());
        assertThat(unrevoked(target)).isZero();
        assertThatThrownBy(() -> tokens.rotate(prefix + "refresh")).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> tokens.authenticate(prefix + "access")).isInstanceOf(ApiException.class);
        mutate(target, "status", "\"enabled\":true");
        mvc.perform(get("/api/v1/account").cookie(login(target))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/account").cookie(old)).andExpect(status().isUnauthorized());
        assertThat(unrevoked(target)).isZero();
        assertThatThrownBy(() -> tokens.authenticate(prefix + "access")).isInstanceOf(ApiException.class);
    }
    @Test void pendingVerificationAndDeletedAccountsCannotBeActivatedThroughManagement() throws Exception {
        long pending = create("pending", "USER", "PENDING_VERIFICATION");
        mutate(pending, "status", "\"enabled\":false"); mutate(pending, "status", "\"enabled\":true");
        assertThat(service.detail(advanced, pending).status()).isEqualTo("PENDING_VERIFICATION");
        mvc.perform(patch("/api/v1/admin/accounts/" + pending + "/role").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(pending, "\"role\":\"ADMIN\""))).andExpect(status().isBadRequest());
        long legacy = create("legacy", "USER", "DISABLED");
        jdbc.update("UPDATE user_accounts SET email_verified_at=NULL WHERE id=?", legacy);
        mutate(legacy, "status", "\"enabled\":true");
        assertThat(service.detail(advanced, legacy).status()).isEqualTo("PENDING_VERIFICATION");
        long deleted = create("deleted", "USER", "DELETED");
        mvc.perform(patch("/api/v1/admin/accounts/" + deleted + "/status").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(deleted, "\"enabled\":true"))).andExpect(status().isBadRequest());
    }
    @Test void selfAdvancedAdviserCsrfConfirmationAndStaleEditsAreProtected() throws Exception {
        for (String kind : List.of("role", "status")) mvc.perform(patch("/api/v1/admin/accounts/" + advanced + "/" + kind).with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(advanced, "\"role\":\"USER\",\"enabled\":false"))).andExpect(status().isBadRequest());
        jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES(?,'test')", ordinary);
        mvc.perform(patch("/api/v1/admin/accounts/" + ordinary + "/role").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(ordinary, "\"role\":\"USER\""))).andExpect(status().isBadRequest());
        long adviser = create("adviser", "ADVISER", "ACTIVE");
        mvc.perform(patch("/api/v1/admin/accounts/" + adviser + "/role").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(adviser, "\"role\":\"USER\""))).andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/role").with(user(principal(advanced))).contentType("application/json").content(change(target, "\"role\":\"ADMIN\""))).andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/role").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(target, "\"role\":\"ADMIN\"").replace("\"confirmed\":true", "\"confirmed\":false"))).andExpect(status().isBadRequest());
        String stale = change(target, "\"role\":\"ADMIN\"");
        mutate(target, "status", "\"enabled\":false");
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/role").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(stale)).andExpect(status().isConflict());
    }
    @Test void sameStateIsIdempotentAndAuditFailureRollsBackStatusAndTokenRevocation() {
        var account = service.detail(advanced, target);
        service.change(advanced, target, new AdminAccountService.Change("USER", null, true, account.updatedAt()), true);
        assertThat(service.audit(advanced, target, 1, 20).total()).isZero();
        seedTokens(target);
        String function = "reject_account_audit_" + target;
        jdbc.execute("CREATE FUNCTION " + function + "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.target_user_id=" + target + " THEN RAISE EXCEPTION 'test rollback'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER " + function + " BEFORE INSERT ON account_management_audit FOR EACH ROW EXECUTE FUNCTION " + function + "()");
        try {
            assertThatThrownBy(() -> service.change(advanced, target, new AdminAccountService.Change(null, false, true, account.updatedAt()), false)).isInstanceOf(org.springframework.dao.DataAccessException.class);
            assertThat(service.detail(advanced, target).status()).isEqualTo("ACTIVE");
            assertThat(unrevoked(target)).isEqualTo(2);
        } finally { jdbc.execute("DROP TRIGGER " + function + " ON account_management_audit"); jdbc.execute("DROP FUNCTION " + function + "()"); }
    }
    @Test void accountChangesRetainApplicationOrderAndPersonalData() throws Exception {
        String code = "AM" + target;
        testUniversity = jdbc.queryForObject("INSERT INTO universities(name,slug,country,university_code) VALUES(?,?,'Malaysia',?) RETURNING id", Long.class, prefix, prefix, code);
        testCategory = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?,?) RETURNING id", Long.class, code, prefix);
        testProgramme = jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_en) VALUES(?,?,?,?,?) RETURNING id", Long.class, code, testUniversity, testCategory, prefix, prefix);
        UUID order = UUID.randomUUID(), application = UUID.randomUUID();
        jdbc.update("INSERT INTO application_payment_orders(id,reference,user_account_id,idempotency_key,request_fingerprint,total_amount_fen) VALUES(?,?,?,?,?,12345)", order, "AM" + target, target, prefix, "a".repeat(64));
        jdbc.update("INSERT INTO student_applications(id,reference,user_account_id,programme_id,status,payment_order_id) VALUES(?,?,?,?,'UNPAID',?)", application, "APP" + target, target, testProgramme, order);
        var storedOrder = jdbc.queryForMap("SELECT * FROM application_payment_orders WHERE id=?", order);
        var storedApplication = jdbc.queryForMap("SELECT * FROM student_applications WHERE id=?", application);
        var personal = jdbc.queryForMap("SELECT full_name,normalized_email,password_hash,created_at FROM user_accounts WHERE id=?", target);
        mutate(target, "role", "\"role\":\"ADMIN\"");
        mutate(target, "status", "\"enabled\":false");
        mutate(target, "status", "\"enabled\":true");
        mutate(target, "role", "\"role\":\"USER\"");
        applyProfile(target, "历史记录关联保持不变", "REPLACE", profileImage("png"), "image/png");
        personal.put("full_name", "历史记录关联保持不变");
        assertThat(jdbc.queryForMap("SELECT * FROM application_payment_orders WHERE id=?", order)).isEqualTo(storedOrder);
        assertThat(jdbc.queryForMap("SELECT * FROM student_applications WHERE id=?", application)).isEqualTo(storedApplication);
        assertThat(jdbc.queryForMap("SELECT full_name,normalized_email,password_hash,created_at FROM user_accounts WHERE id=?", target)).isEqualTo(personal);
    }
    @Test void simultaneousAdvancedAdminsCannotDisableEachOtherAndLeaveNoActiveOperator() throws Exception {
        jdbc.update("INSERT INTO catalog_advanced_administrators(user_account_id,granted_by) VALUES(?,'test')", ordinary);
        var first = service.detail(advanced, advanced);
        var second = service.detail(advanced, ordinary);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            List<Future<Boolean>> results = new ArrayList<>();
            results.add(executor.submit(() -> { start.await(); return tryDisable(advanced, second); }));
            results.add(executor.submit(() -> { start.await(); return tryDisable(ordinary, first); }));
            start.countDown();
            int changed = 0;
            for (var result : results) if (result.get(15, TimeUnit.SECONDS)) changed++;
            assertThat(changed).isEqualTo(1);
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM user_accounts WHERE id IN (?,?) AND status='ACTIVE'", Long.class, advanced, ordinary)).isEqualTo(1);
    }
    private boolean tryDisable(long actor, AdminAccountService.Account account) {
        try { service.change(actor, account.id(), new AdminAccountService.Change(null, false, true, account.updatedAt()), false); return true; }
        catch (ApiException expected) { return false; }
    }

    @Test void profileNameEditUsesLiveDatabaseForExistingCookiesAndNewLogin() throws Exception {
        Cookie cookie = login(target);
        var before = jdbc.queryForMap("SELECT normalized_email,password_hash,role,status FROM user_accounts WHERE id=?", target);
        var body = new HashMap<String,Object>();
        body.put("fullName", "  更新后的用户名  "); body.put("avatarAction", "KEEP");
        body.put("expectedUpdatedAt", service.detail(advanced, target).updatedAt());
        body.put("role", "ADMIN"); body.put("password", "injection"); body.put("email", "changed@example.com"); body.put("status", "DISABLED");
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(json.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForMap("SELECT normalized_email,password_hash,role,status FROM user_accounts WHERE id=?", target)).isEqualTo(before);
        applyProfile(target, "  更新后的用户名  ", "KEEP", null, null);
        mvc.perform(get("/api/v1/auth/session").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.fullName").value("更新后的用户名"));
        mvc.perform(get("/api/v1/account").cookie(cookie)).andExpect(status().isOk()).andExpect(jsonPath("$.fullName").value("更新后的用户名"));
        mvc.perform(get("/api/v1/auth/session").cookie(login(target))).andExpect(jsonPath("$.fullName").value("更新后的用户名"));
        assertThat(jdbc.queryForMap("SELECT normalized_email,password_hash,role,status FROM user_accounts WHERE id=?", target)).isEqualTo(before);
        mvc.perform(get("/api/v1/admin/accounts/audit").with(user(principal(advanced))).param("target", Long.toString(target)))
            .andExpect(jsonPath("$.items[0].action").value("PROFILE")).andExpect(jsonPath("$.items[0].old_full_name").value(prefix + "member"))
            .andExpect(jsonPath("$.items[0].new_full_name").value("更新后的用户名")).andExpect(jsonPath("$.items[0].avatar_action").value("KEEP"));
    }
    @Test void uploadsReplacesAndRemovesDurableAvatarsWithCacheVersions() throws Exception {
        byte[] png = profileImage("png"), jpg = profileImage("jpeg");
        applyProfile(target, "新用户名", "REPLACE", png, "image/png");
        var first = service.detail(advanced, target);
        assertThat(first.avatarUrl()).contains("/api/v1/miniapp/avatars/" + target + "?v=");
        mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(status().isOk())
            .andExpect(header().string("Content-Type", "image/png")).andExpect(header().string("Cache-Control", "no-store"))
            .andExpect(content().bytes(png));
        mvc.perform(get("/api/v1/auth/session").cookie(login(target))).andExpect(jsonPath("$.avatarUrl").value(first.avatarUrl()));
        applyProfile(target, "新用户名", "REPLACE", jpg, "image/jpeg");
        var second = service.detail(advanced, target);
        assertThat(second.avatarUrl()).isNotEqualTo(first.avatarUrl());
        mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(content().bytes(jpg));
        applyProfile(target, "新用户名", "REMOVE", null, null);
        assertThat(service.detail(advanced, target).avatarUrl()).isNull();
        mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(status().isNotFound());
        Cookie cookie = login(target);
        mvc.perform(get("/api/v1/auth/session").cookie(cookie)).andExpect(jsonPath("$.avatarUrl").isEmpty());
        mvc.perform(get("/api/v1/account").cookie(cookie)).andExpect(jsonPath("$.avatarUrl").isEmpty());
    }
    @Test void acceptsExactlyOneMegabyteAndWebpAndPreservesOriginalOnInvalidUpload() throws Exception {
        byte[] png = Arrays.copyOf(profileImage("png"), 1_048_576);
        applyProfile(target, "边界测试", "REPLACE", png, "image/png");
        var old = service.detail(advanced, target);
        for (byte[] bad : List.of(Arrays.copyOf(png, 1_048_577), "<script>fake image</script>".getBytes(), new byte[]{(byte)137,80,78,71,13,10,26,10,1})) {
            mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(profileBody(target, "不应保存", "REPLACE", bad, "image/png")))
                .andExpect(status().isBadRequest());
            assertThat(service.detail(advanced, target)).isEqualTo(old);
            mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(content().bytes(png));
        }
        byte[] webp = Base64.getDecoder().decode("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v89WAAAAA==");
        applyProfile(target, "WebP测试", "REPLACE", webp, "image/webp");
        mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(header().string("Content-Type", "image/webp")).andExpect(content().bytes(webp));
    }
    @Test void deletingCustomizedAvatarDoesNotResurrectWechatAvatar() throws Exception {
        jdbc.update("INSERT INTO user_external_identities(user_account_id,provider,provider_client_id,provider_subject,avatar_url) VALUES(?,'WECHAT',?,?,?)", target, prefix, prefix, "https://thirdwx.qlogo.cn/mmopen/old/132");
        assertThat(service.detail(advanced, target).avatarUrl()).contains("qlogo.cn");
        applyProfile(target, "删除头像", "REMOVE", null, null);
        mvc.perform(get("/api/v1/account").cookie(login(target))).andExpect(jsonPath("$.avatarUrl").isEmpty());
        assertThat(jdbc.queryForObject("SELECT profile_avatar_overridden FROM user_accounts WHERE id=?", Boolean.class, target)).isTrue();
    }
    @Test void profileEndpointEnforcesAuthoritySelfProtectionCsrfValidationAndVersion() throws Exception {
        String body = profileBody(target, "新用户", "KEEP", null, null);
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(csrf()).contentType("application/json").content(body)).andExpect(status().isUnauthorized());
        for (long id : List.of(target, ordinary)) mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(id))).with(csrf()).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(advanced))).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/admin/accounts/" + advanced + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(profileBody(advanced, "自身", "KEEP", null, null))).andExpect(status().isBadRequest());
        for (String name : List.of("", " ", "a".repeat(101), "bad\nname")) mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(profileBody(target, name, "KEEP", null, null))).andExpect(status().isBadRequest());
        applyProfile(target, "已更新", "KEEP", null, null);
        mvc.perform(patch("/api/v1/admin/accounts/" + target + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(body)).andExpect(status().isConflict());
    }
    @Test void failedProfileAuditRollsBackNameAndAvatarWithoutOrphanFiles() throws Exception {
        byte[] old = profileImage("png"); applyProfile(target, "原用户名", "REPLACE", old, "image/png");
        var before = service.detail(advanced, target);
        String function = "reject_profile_" + target;
        jdbc.execute("CREATE FUNCTION " + function + "() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.target_user_id=" + target + " AND NEW.action='PROFILE' THEN RAISE EXCEPTION 'rollback'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER " + function + " BEFORE INSERT ON account_management_audit FOR EACH ROW EXECUTE FUNCTION " + function + "()");
        try {
            String encoded = Base64.getEncoder().encodeToString(profileImage("jpeg"));
            assertThatThrownBy(() -> service.edit(advanced, target, new AdminAccountService.ProfileEdit("不能保存", "REPLACE", "image/jpeg", encoded, before.updatedAt()))).isInstanceOf(org.springframework.dao.DataAccessException.class);
            assertThat(service.detail(advanced, target)).isEqualTo(before);
            mvc.perform(get("/api/v1/miniapp/avatars/" + target)).andExpect(content().bytes(old));
        } finally { jdbc.execute("DROP TRIGGER " + function + " ON account_management_audit"); jdbc.execute("DROP FUNCTION " + function + "()"); }
    }
    private byte[] profileImage(String type) throws Exception {
        var out = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(3,3,java.awt.image.BufferedImage.TYPE_INT_RGB), type, out);
        return out.toByteArray();
    }
    private String profileBody(long id, String name, String action, byte[] bytes, String type) throws Exception {
        var body = new HashMap<String,Object>(); body.put("fullName", name); body.put("avatarAction", action); body.put("expectedUpdatedAt", service.detail(advanced, id).updatedAt());
        if (bytes != null) { body.put("contentType", type); body.put("contentBase64", Base64.getEncoder().encodeToString(bytes)); }
        return json.writeValueAsString(body);
    }
    private void applyProfile(long id, String name, String action, byte[] bytes, String type) throws Exception {
        mvc.perform(patch("/api/v1/admin/accounts/" + id + "/profile").with(user(principal(advanced))).with(csrf()).contentType("application/json").content(profileBody(id, name, action, bytes, type))).andExpect(status().isOk());
    }
    private long create(String suffix, String role, String status) {
        long id = jdbc.queryForObject("INSERT INTO user_accounts(full_name,normalized_email,password_hash,role,status,email_verified_at,agreement_version,privacy_version,deleted_at) VALUES(?,?,?,?,?,CASE WHEN ?='ACTIVE' THEN CURRENT_TIMESTAMP ELSE NULL END,'test-terms','test-privacy',CASE WHEN ?='DELETED' THEN CURRENT_TIMESTAMP ELSE NULL END) RETURNING id", Long.class,
            prefix + suffix, prefix + suffix + "@example.com", passwords.encode("correct-horse-42"), role, status, status, status);
        ids.add(id); return id;
    }
    private UserPrincipal principal(long id) {
        UserAccount account = UserAccount.external("管理测试", "test", "test");
        ReflectionTestUtils.setField(account, "id", id);
        ReflectionTestUtils.setField(account, "role", UserAccountRole.valueOf(jdbc.queryForObject("SELECT role FROM user_accounts WHERE id=?", String.class, id)));
        return UserPrincipal.from(account);
    }
    private String change(long id, String fields) { return "{\"confirmed\":true,\"expectedUpdatedAt\":\"" + service.detail(advanced, id).updatedAt() + "\"," + fields + "}"; }
    private void mutate(long id, String kind, String fields) throws Exception {
        mvc.perform(patch("/api/v1/admin/accounts/" + id + "/" + kind).with(user(principal(advanced))).with(csrf()).contentType("application/json").content(change(id, fields))).andExpect(status().isOk());
    }
    private String credentials(long id) { return "{\"identifier\":\"" + jdbc.queryForObject("SELECT normalized_email FROM user_accounts WHERE id=?", String.class, id) + "\",\"password\":\"correct-horse-42\"}"; }
    private Cookie login(long id) throws Exception {
        var result = mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType("application/json").content(credentials(id))).andExpect(status().isOk()).andReturn();
        return Arrays.stream(result.getResponse().getCookies()).filter(c -> c.getName().equals("JSESSIONID")).findFirst().orElseThrow();
    }
    private void seedTokens(long id) {
        for (String kind : List.of("ACCESS", "REFRESH")) jdbc.update("INSERT INTO miniapp_auth_tokens(user_account_id,token_hash,token_kind,family_id,expires_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP+INTERVAL '1 hour')", id, AuthHash.sha256(prefix + kind.toLowerCase()), kind, UUID.randomUUID());
    }
    private long unrevoked(long id) { return jdbc.queryForObject("SELECT COUNT(*) FROM miniapp_auth_tokens WHERE user_account_id=? AND revoked_at IS NULL", Long.class, id); }
}
