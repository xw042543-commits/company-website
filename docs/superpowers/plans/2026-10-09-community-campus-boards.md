# U圈校园与分类 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付真实可用、有校园辨识度的分类 U圈。

**Architecture:** 扩展现有 Spring Boot community 模块和原生小程序；PostgreSQL 保存分类与学校，Redis 热门快照按筛选条件隔离。保持旧客户端兼容、公开可见性和现有审核权限。

**Tech Stack:** Java 21、Spring Boot、PostgreSQL、Redis、原生微信小程序 TypeScript/WXML/WXSS、Next.js 审核端。

**Spec:** `docs/superpowers/specs/2026-10-09-community-campus-boards-design.md`（用户已确认）

## Global Constraints

- 新帖标题 1–60 字；正文沿用现有长度限制。旧客户端不传标题仍兼容。
- 分类固定为 GENERAL/NEWCOMER/HOUSING/MARKETPLACE/STUDY/MEETUP，分别显示日常交流/新生报到/租房室友/二手闲置/学习求助/周末搭子。
- 院校标签是讨论归属，不是身份认证；学校来源为真实院校库。
- 不做图片上传、关注、私信、吧主管理、交易支付及个性推荐，不新增无效入口。
- 不操作生产数据库、不部署、不改本地 AppID。保留 `miniapp/project.config.json` 用户改动。
- 延续至少 5,000 注册用户容量目标；没有压测不得宣称已达到容量。

## 执行准备

- [ ] 读取仓库 AGENTS、执行技能与设计全文；只读获取最新主分支，核对迁移最大编号。
- [ ] 使用独立功能分支或受管 worktree，遵循 using-git-worktrees，不把本地 AppID 带入提交。
- [ ] 按以下顺序执行；每项先观察失败测试，再写生产代码，最后提交相关文件。

## Task 1：分类写入、旧请求兼容与审核

**Files:** `backend/src/main/java/com/yangdoujiao/website/community/` 下新增 `CommunityCategory.java`、`CommunityPostMetadata.java`，修改 `CommunityPost.java`、`CommunityPostRequest.java`、`CommunityWriteService.java`；在 `backend/src/main/resources/db/migration/` 添加当前最大版本号加一的 `__community_boards.sql`。扩展 `CommunityWriteHttpIntegrationTest.java`、`CommunitySchemaIntegrationTest.java`，增加 `CommunityPostMetadataTest.java`。

**Interfaces:** 发帖增加可选 JSON 字段 `title/category/universityId`，院校 ID 为十进制字符串；省略分类默认 GENERAL，省略标题/学校为 null；显式非法值返回 400，不静默转换。保留单 body 构造器供旧调用兼容。

```java
public enum CommunityCategory { GENERAL, NEWCOMER, HOUSING, MARKETPLACE, STUDY, MEETUP }
public record CommunityPostMetadata(String title, CommunityCategory category, Long universityId) {}
```

- [ ] 先在现有认证 HTTP fixture 发 body-only 请求断言创建成功，再发完整元数据并读数据库验证。添加非法分类、空标题、61 字标题、无效学校、数字类型学校 ID 的 400 用例。新增同幂等键不同分类返回 409 用例，标题含现有风险词进入审核用例。
- [ ] 运行 `./mvnw -Dtest=CommunityWriteHttpIntegrationTest,CommunitySchemaIntegrationTest,CommunityPostMetadataTest test`，确认失败源于新契约缺失。
- [ ] 迁移增加 nullable title、NOT NULL category DEFAULT 'GENERAL' 和 nullable university_id 外键；分类增加 CHECK。按现有 ID 类型建 FK，不删除历史记录。标题采用 Unicode code point 长度和现有非法字符规则。
- [ ] 写入前验证真实学校存在；审核输入为标题加换行加正文。元数据纳入规范化幂等摘要；旧 body-only 摘要维持原算法，确保历史请求重放不冲突。扩展实体工厂保留旧重载。
- [ ] 重跑测试确认通过，提交 `feat: persist community boards and post metadata`。

## Task 2：列表、热门缓存与元数据读取

**Files:** 修改 `CommunityPostController.java`、`CommunityReadService.java`、`CommunityPostRepository.java`、`CommunityCursorCodec.java`、`CommunityHotSnapshotCache.java`、`CommunityPostSummary.java`、`CommunityPostDetail.java`、`CommunityMyPost.java` 及相关映射服务。测试 `CommunityReadHttpIntegrationTest.java`、`CommunityCursorCodecTest.java`、`CommunityHotSnapshotCacheTest.java`、`CommunityHotSnapshotConcurrencyIntegrationTest.java`。

**Interfaces:** `GET /api/v1/community/posts?sort=latest&category=STUDY&universityId=1`；缺省过滤意味着全部。响应增加 title、category、universityId、universityName；旧帖 title 为 null。学校不存在返回参数错误，不显示其他学校帖子。

```text
scope = category-or-ALL + ':' + universityId-or-ALL
latest cursor expected scope = 'latest:' + scope
hot keys = 'community:hot:v2:' + scope + ':' + suffix
```

- [ ] 用数据库 fixture 创建两所院校、两类帖子及隐藏帖子；组合筛选每页 size=1，断言每条返回记录都匹配学校和分类，分页不重复。将 A 圈游标传 B 圈断言 400。无过滤旧调用仍工作。
- [ ] 运行上述四个测试类，先观察新增断言失败。
- [ ] SQL 层筛选后排序分页；添加学校/分类/发布时间/ID 的匹配索引，保持 PUBLISHED 过滤。列表映射批量读取学校名称，禁止逐帖查询。
- [ ] 热门 ranking 构建前按 scope 过滤，签名游标含 scope、快照版本、位置和过期时间。锁、current、manifest、ids 全部按 scope 隔离，保留现有锁所有权 Lua 检查与 TTL。公开内容仍重读数据库校验可见性。
- [ ] 更新写后缓存失效覆盖所有相关 scope，不用 Redis KEYS 扫描；优先沿用 45 秒缓存窗口且保证可见性实时检查，需在代码说明列表新帖最迟 45 秒出现。保留旧无过滤游标解码兼容，仅在无过滤请求接受。
- [ ] 重跑测试及 `./mvnw test`，提交 `feat: scope community feeds by campus and category`。

## Task 3：小程序契约与分类发帖

**Files:** 修改 `miniapp/miniprogram/services/community.ts`、`utils/community-validation.ts`、`pages/circle-compose/index.ts`、`index.wxml`、`index.wxss`；新增 `utils/community-boards.ts`。测试 `miniapp/tests/community.test.ts`、`community-pages.test.ts`。

**Interfaces:** `CommunityCategory` 字符串联合类型与后端六编码一致；`listPosts` 增加 category/universityId 可选字段；`createPost` 增加 title/category/universityId。新增属性解析兼容旧响应缺字段，非法类型不能当作空数据。

```ts
export type CommunityCategory = 'GENERAL' | 'NEWCOMER' | 'HOUSING' | 'MARKETPLACE' | 'STUDY' | 'MEETUP';
```

- [ ] 用现有 service 测试 request double 捕获 URL 和 body，断言 STUDY/学校 ID 被正确编码；旧响应解析成功，非法分类失败。真实页面 harness 测试缺标题禁止提交、重复点击只发一次、失败后保留输入。
- [ ] `npm run test` 观察新增用例失败。
- [ ] 接入现有院校查询服务选择学校，必须支持加载失败、重试与取消选择；不把首个分页结果当全量学校。新帖默认 GENERAL，学校可空，标题最多 60 code points。
- [ ] 接通服务并保留原幂等键生命周期、认证、禁言与错误提示。全部校验通过后才发送；禁止 URL/URLSearchParams 浏览器依赖。
- [ ] `npm run check`，提交 `feat: compose community posts with campus and category`。

## Task 4：社区视觉、筛选与所有阅读端

**Files:** 修改 `miniapp/miniprogram/pages/circle/index.ts/wxml/wxss`、`components/community-post-card/index.ts/wxml/wxss`，以及 `pages/circle-detail/`、`pages/circle-me/` 实际对应详情和个人内容文件（执行前通过 app.json 核对路由）。修改 `frontend/src/lib/adviser-community-api.ts`、`frontend/src/components/adviser-community-panel.tsx` 及对应 API 测试。扩展 `miniapp/tests/community-page-lifecycle.test.ts`。

**Interfaces:** 页面 state 增加广场/校园圈模式、当前分类、当前学校；这些值传入真实列表服务。切换筛选清空游标、递增 generation，过期响应不得覆盖当前列表。

- [ ] 页面 harness 测试 A 学校慢响应在 B 学校快响应之后返回，最终列表仍是 B；切换分类不携带旧 cursor；更多加载保留当前 scope。元数据缺失的旧帖仍能打开、点赞和举报。
- [ ] 先跑失败测试，再实现交互。校园页呈现真实院校名称，无关注数或学生身份标志。空圈提示“这里还没有帖子”并提供可用发帖入口；网络失败不能假装空列表。
- [ ] 视觉采用白色 #FFFFFF、浅灰 #F5F7F6、正文 #183C30、辅助 #738078、品牌绿 #087C49；系统字体，标题 32rpx/正文 28rpx/辅助 22rpx。帖子用细分隔和克制圆角，不加大块装饰渐变。顶部遵守微信安全区；发帖按钮不遮底部内容。
- [ ] 卡片、详情、我的内容和审核端展示标题、分类及真实学校。标题纯文本，不渲染用户 HTML；老帖不伪造标题。所有操作继续调用原权限路径。
- [ ] 运行小程序 `npm run check`、前端 `npm test`/`npm run lint`/`npm run build` 与后端 `./mvnw test`。使用各 package.json 确认已有脚本，不报告未执行检查为通过。
- [ ] 微信开发者工具检查 320/375/430 宽度、长标题、空圈、错误状态、输入键盘、筛选分页和安全区，保存实际截图；不可运行时标记未验证，不用浏览器近似截图冒充真机。
- [ ] 提交 `feat: redesign U circle as a campus discussion community`；代码审查后列出验证结果、剩余压测和部署步骤。未经用户授权不推送或部署。
