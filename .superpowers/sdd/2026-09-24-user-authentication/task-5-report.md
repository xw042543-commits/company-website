# Task 5 实施报告

## 范围与文件

- `backend/src/main/java/com/yangdoujiao/website/auth/api/`：注册、重发、邮箱/手机验证 HTTP 接口，DTO，注册服务。
- `backend/src/main/java/com/yangdoujiao/website/auth/verification/`：验证凭证实体/仓库、验证服务、通知端口与仅 dev/test 可用的本地通知读取。
- `backend/src/main/java/com/yangdoujiao/website/auth/ratelimit/AuthRateLimiter.java`、`auth/config/AuthRateLimitProperties.java`、`auth/AuthHash.java`：PostgreSQL 限流与摘要辅助。
- `backend/src/main/java/com/yangdoujiao/website/auth/config/PasswordEncodingConfig.java`、`auth/account/UserAccount.java`、`auth/account/UserAccountRepository.java`、`backend/src/main/resources/application.yml`：BCrypt、账号激活、行锁查询及类型安全阈值。
- `backend/src/test/java/com/yangdoujiao/website/auth/{api,verification,ratelimit}/`：三组 HTTP、并发验证和 PostgreSQL 限流集成测试。

## 事务、并发与安全决定

- 注册和重发在账号事务内写账号及凭证；数据库唯一约束处理并发重复注册，公开响应保持一致。本地通知只在事务提交后发布。
- 验证先锁账号再锁凭证行，使用 `SELECT FOR UPDATE` 语义序列化验证与重发。手机错误码次数在事务内提交；第五次错误后正确码也不能再消费。验证失败统一返回 `INVALID_VERIFICATION_TOKEN`。
- 限流每次使用独立事务执行 V8 `auth_rate_limit_buckets` 原子 upsert；拒绝的尝试仍保存。写失败返回 `503 AUTH_SERVICE_UNAVAILABLE`。注册和重发按客户 IP 与规范化标识分别限流；验证按客户 IP 限流，并对单个短信码限制五次猜测。
- 邮件令牌来自 32 字节安全随机数；手机码为六位安全随机数。数据库只保存 SHA-256 摘要，手机摘要加入账号 ID，比较使用常量时间 API。原值不进入数据库、日志或公开成功响应。
- 本地通知读取仅在 `(dev | test) & !prod` 注册；只信任请求直连 loopback 地址、要求精确标识、读取后删除，并设置 `Cache-Control: no-store`。生产环境没有本地通知 bean/route，原有生产注册审批门控不变。
- 四个写接口沿用现有 CSRF 与 8 KB payload filter，客户端 IP 沿用共享 `ClientAddressResolver`；错误沿用 `ApiException` / `ApiErrorResponse`。

## 验证状态与用户命令

遵照用户要求，未运行 Maven 测试、构建或编译；测试先于生产实现已写入工作区，但 RED/GREEN 均未验证。只做静态 diff 自审和 `git diff --check`。

用户可执行：

```bash
cd backend
./mvnw -Dtest=RegistrationHttpIntegrationTest,VerificationConcurrencyIntegrationTest,AuthRateLimiterIntegrationTest,AuthSchemaIntegrationTest,AuthSecurityHttpIntegrationTest test
```

## 提交与风险

提交：`feat: 实现用户注册与联系方式验证`（本报告与实现同次提交，哈希见提交记录）。

风险：集成测试与编译由用户执行前不可宣称通过；正式通知服务商尚未接入，生产注册仍由既有审批与 readiness 门控关闭。实际外部通知服务商需要明确投递可靠性和失败重试策略，本次只定义替换端口。
