# Task 7 实施报告：密码找回、重置与修改

## 范围与结果

- 增加 `POST /api/v1/auth/forgot-password`、`POST /api/v1/auth/reset-password` 和需要登录的 `PUT /api/v1/account/password`。
- 忘记密码对存在、不存在和不可恢复的账号统一返回 `202` 空响应；通知可用性检查和随机 token、SHA-256、密码编码工作在账号查询前执行。使用现有限流器分别限制 IP 和标识符；通知只在事务提交后异步投递。
- 重置 token 使用 32 字节安全随机数，仅把 SHA-256 摘要持久化。签发新 token 时使旧 token 失效；重置时先锁账号再锁 token 行并重新读取状态，检查到期与使用状态，因此并发消费至多一次成功。
- 重置和已登录修改密码都更新账号密码摘要、使其他重置 token 失效并调用 `UserSessionService.revokeAll`。HTTP 成功返回前还会使当前请求持有的 Session 失效。修改密码校验旧密码，并拒绝新密码与旧密码相同。
- 复用现有通知接口和本地通知存储的发行序号机制，保证连续请求的异步通知不会让旧 token 覆盖新 token。没有修改 `backend/company-website/`，也没有实施 Task 8 及之后内容。

## 测试源码

- `PasswordHttpIntegrationTest`：统一响应与摘要存储、过期和重复使用、再次签发失效、所有 Session 撤销、登录密码变化、修改旧密码与复用校验、CSRF 和密码长度。
- `PasswordResetConcurrencyIntegrationTest`：两个并发重置请求恰有一个成功。
- 已先写上述测试源码，再写生产代码；按用户指示，未执行测试、编译或构建，因此无法确认红绿状态。

## 静态核对与待运行命令

已核对路由、安全规则、数据库表结构、通知与 Session 接口；`git diff --cached --check` 返回 0。未运行任何 Maven 命令。

用户可在 `backend/` 执行聚焦测试：

```bash
./mvnw -Dtest=PasswordHttpIntegrationTest,PasswordResetConcurrencyIntegrationTest,LoginHttpIntegrationTest,UserSessionServiceIntegrationTest test
```

本任务的主要剩余风险是 Java 编译、Spring 上下文启动、数据库锁与 Session 行为尚未经过运行验证。通知投递沿用现有提交后异步、尽力而为的语义。
