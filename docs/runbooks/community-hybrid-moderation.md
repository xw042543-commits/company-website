# U圈混合审核发布与值班手册

本手册供获授权的发布与值班人员执行。仓库自动检查只证明本地契约；真实微信联调、备份、灰度、监控通知与生产开关操作都需要单独记录验收证据。编写本手册不代表已执行这些操作。沿用 [DEPLOYMENT.md](../DEPLOYMENT.md) 的批准流程，不绕过人工部署批准。

## 配置与上线顺序

1. 内容负责人批准 `APP_COMMUNITY_REVIEW_TERMS`，复审规则必须非空；拒绝规则 `APP_COMMUNITY_REJECT_TERMS` 可选。已知样例 `synthetic-review`、`hard-reject`、`needs-review`、`example-review`、`example-reject` 在两类规则中均禁止。不要用测试词替代自有规则，勿把个人信息当作规则。
2. 通过密钥管理写入受保护、未跟踪、权限 600 的环境文件：`APP_MINIAPP_AUTH_ENABLED=true`、`APP_MINIAPP_LOCAL_PROVIDER_ENABLED=false`、公司小程序的 `APP_MINIAPP_WECHAT_APP_ID` / `APP_MINIAPP_WECHAT_APP_SECRET`。登录和内容安全共享这一组凭据；网站微信登录 `APP_AUTH_WECHAT_*` 不能替代小程序凭据。所有后端副本使用相同小程序凭据及至少 32 UTF-8 字节的随机 `APP_COMMUNITY_CURSOR_SECRET`。
3. 设置 `APP_COMMUNITY_CONTENT_SAFETY_ENABLED=true`。默认请求超时 `APP_COMMUNITY_CONTENT_SAFETY_REQUEST_TIMEOUT=2s`，允许 250ms–5s，应用于令牌获取和文本检查；文本检查 `APP_COMMUNITY_CONTENT_SAFETY_MAXIMUM_ATTEMPTS=2`，允许 1–3，包含首次请求，令牌刷新每次仅请求一次。不能把 2s 当作整个发布的总耗时。保持精确官方 HTTPS 端点：`https://api.weixin.qq.com/cgi-bin/token` 和 `https://api.weixin.qq.com/wxa/msg_sec_check`；不允许代理地址、HTTP、查询参数、fragment、额外路径或端口。
4. 保持 `APP_COMMUNITY_ENABLED=false`，执行部署预检、下节备份验证，再按已批准流程启动新镜像。确认迁移、readiness、读取、Adviser 访问和真实小程序认证正常。先配置规则与凭据，再启动镜像，最后开放写入。
5. 完成受限预览灰度、内部指标采集、告警演练和值班验收后，申请另一次生产开放写入批准。得到授权后才设置生产 `APP_COMMUNITY_ENABLED=true` 并按批准流程重建 backend。启动守卫再次拒绝缺少规则、内容安全、真实认证或官方端点的配置；不通过时修复配置，不降低守卫。

AppSecret 只能经受保护的密钥输入流程配置，禁止粘贴到命令历史、普通环境变量命令、日志、截图、工单或群聊。禁用 `set -x`、HTTP debug/wire 日志及请求/响应全量记录；微信令牌 URL 含凭据，不能复制到验收记录。记录发布 SHA、规则版本、配置开关和值班人，省略所有密钥、openid、正文和完整接口响应。泄露时立即由凭据负责人轮换并检查受影响记录。

正式部署前在仓库根目录执行：

```bash
node scripts/deployment-preflight.mjs .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
```

必须同时通过。`.env.example` 与 `deploy/.env.production.example` 保持凭据、规则和游标密钥为空，故意不能作为可部署生产配置。仅做本地 Compose 语法检查时使用 [DEPLOYMENT.md 的合成环境覆盖命令](../DEPLOYMENT.md#1-prepare-configuration)，不向示例补入真实值。

## PostgreSQL 发布前备份

先按 [BACKUP_AND_RESTORE.md](../BACKUP_AND_RESTORE.md#postgresql-backup) 生成 custom-format `pg_dump -Fc`，限制备份目录和文件权限，再执行 `test -s` 和 `pg_restore --list` 可读性检查。只有退出码均为 0 才能继续；将备份加密存放至部署主机之外，记录 UTC 时间、受控存储位置、校验摘要、迁移版本和验证退出码，勿附数据内容。

在隔离 PostgreSQL 实例、独立数据库与凭据上完成还原演练，核对 Flyway 历史、帖子/评论状态、回执、举报、限制、审核动作和通知的汇总数量及关系约束。可读性检查只证明档案可解析，不证明完整恢复。任何校验或演练失败都暂停发布并重新获得有效备份。不得对生产执行还原、清表或演练清理；生产数据库恢复是独立审批的故障恢复事项。

## 受限预览的真实微信联调

试点使用隔离数据库和 Redis，preview/staging 入口限制团队访问，微信体验版仅邀请批准的内部测试人员。配置真实小程序 AppID/AppSecret、HTTPS 小程序 request 合法域名与公司拥有的规则，使用官方微信端点；不使用 local provider。`APP_COMMUNITY_ENABLED` 是全局开关，没有账号 allowlist，不能在公开生产站点用它实现“仅内部账号可写”。

在 DevTools 与真机分别使用至少两个批准的内部账号，以测试人员自愿提交、无真实学生资料的内容完成：

| 用例 | 必须观察到的结果 |
| --- | --- |
| 普通内容、本地无规则命中、微信 pass | 帖子/评论 `PUBLISHED`；普通读取可见，作者状态一致 |
| 命中批准的本地复审规则 | `PENDING_REVIEW`，普通列表/详情/评论不可见；作者看到待审状态；不调用微信 |
| 命中批准的本地拒绝规则 | `400 COMMUNITY_CONTENT_REJECTED`，没有内容或成功回执行；不调用微信 |
| 微信 review 或 risky | 进入 `PENDING_REVIEW`，不自动公开；由 Adviser 复审 |
| 微信超时/不可用、无绑定小程序身份 | 进入 `PENDING_REVIEW`，禁止 fail-open；作者看到审核中 |
| 同一幂等键重试、两个 Adviser 并发处理 | 返回原回执且不重复创建；过期版本返回冲突，刷新后再操作 |
| Adviser 批准/拒绝并选择适当 reasonCode | 作者状态与通知一致；待审评论只在批准后出现在公开线程 |

不可用/响应映射/重试次数的确定性故障注入在独立非生产测试实例或现有 stub 测试完成，不能将生产 profile 的官方端点换成 stub；真实预览只做获准且隔离的外部网络故障演练。记录实际执行与未执行用例，不能把自动测试当作真实微信联调通过。验收截图需遮蔽身份与正文，禁止打开含 token 的网络详情。

## 灰度观察与放行

内部账号试点至少观察 48 小时，覆盖首次写入、12 小时预警、24 小时超期、值班交接和一个完整工作日。在 0、1、6、12、24、48 小时记录无个人信息的汇总：待审数量/最老年龄、微信 unavailable 比例、发布/评论错误率、审核处理耗时和通知结果。未产生微信检查请求时标记“无样本”，不能填写可用性 100%。

放行条件：上述真实微信与并发/幂等/不可见性检查完成；备份恢复演练通过；两名 Adviser 和替补值班人排班覆盖观察期；私有指标与告警通知演练成功；无未处置的 24 小时超期待审，无持续积压增长或不明数据差异；错误率处于批准阈值以内。缺少证据即保持生产写入关闭。内部试点通过不会自动触发生产部署或放量。

## 指标、告警与响应

当前生产 Actuator 仅暴露 health，仓库没有安装生产指标导出器、仪表盘或告警规则。上线前运维必须接入私有 MeterRegistry 导出/采集，或经审批仅向私有后端开放 metrics；验证采集、缺失检测与值班通知链路，公网 Caddy/前端不能转发指标。以下是待实施的初始告警建议，需负责人按容量签字确认，不能描述为已启用。

| 观察项 | 数据与建议触发条件 | 响应 |
| --- | --- | --- |
| 审核积压 | `community.moderation.backlog`，同一待审/OPEN 举报目标只计一次；建议 ≥50 且持续 15 分钟，或连续 3 次观察增长 | 15 分钟内确认责任人，增派 Adviser；产能不足时关闭写入 |
| 最老等待 | `community.moderation.oldest.age`，秒；12h=43,200，24h=86,400；此指标包含 OPEN 举报目标，UI SLA 只针对真正待审内容 | 12h 预警分派负责人；24h 升级负责人并优先处理，不自动批准/拒绝 |
| 微信不可用比例 | `community.content.safety`，标签仅 `content_type=post|comment`、`stage=local|wechat`、`result=pass|review|reject|unavailable`；5 分钟窗口 `stage=wechat,result=unavailable` 增量 / `stage=wechat` 全部增量；建议 ≥5%，至少 20 次检查 | 检查凭据/权限、网络、令牌与 provider code；不可用仍入待审，超出人工能力则关写入 |
| 发布错误率 | `community.results`，`endpoint=publish|comment`；5 分钟窗口 `outcome=error|unavailable` 增量 / 相同端点所有结果增量；建议 >1%，至少 50 次请求 | 检查 PostgreSQL、Redis、微信延迟与事务错误；保护证据，必要时关写入 |
| 采集故障 | 任一 gauge 为 NaN、缺失，或采集连续失败 2 次 | 当作未知/故障，不能将缺失置零；暂停放行并排查 |

比例使用同一窗口、同一端点/阶段与全部实例汇总；处理计数器重启，不能直接相除累计值。微信 unavailable 已被安全地转为待审，通常不会体现为发布 5xx，因此必须单独观察。限流、版本冲突和内容拒绝等预期 4xx 不进入服务错误分子，但要观察异常增长；关闭开关后的预期 `COMMUNITY_DISABLED` 不用于证明正常发布可用。不得增加账号、openid、IP、正文、目标 ID 或回执键作为指标标签。

值班开始核对队列、最老等待、微信可用性与采集状态，每 30–60 秒采集，每小时检查趋势并交接所有未结目标。12 小时预警后在 30 分钟内认领、确认审核说明和计划；24 小时超期在 15 分钟内升级审核负责人，增派人员并评估暂停新写入。值班交接需包含目标受控链接、责任人、期限、异常状态与下一次检查时间，不能靠截图转存内容。不得批量自动批准或重置创建时间消除超期。

## 可恢复回滚

在既有批准的发布/应急权限下，先在受保护服务器环境文件设置 `APP_COMMUNITY_ENABLED=false`，通过批准的更新流程重建 backend。确认 readiness、已登录账号新发帖/评论/举报/点赞或取消/作者删除返回 `503 COMMUNITY_DISABLED`，读取继续可用，Adviser 仍能处理积压与审核证据。其他认证/权限限制可先于此错误返回，验证应使用有效且有权限的试点账号。该开关没有热更新能力，仅编辑文件不代表已关闭运行中的实例。

如果代码版本必须回退，按 [应用镜像回滚流程](../DEPLOYMENT.md#update-and-application-rollback) 核对上一版镜像与当前迁移、Compose 配置及读取/审核功能兼容，保持写入关闭，再执行已批准的镜像回退；需要数据库降级的旧镜像不得使用。保留现有迁移，不运行 down migration，不恢复覆盖生产数据库，不执行 DROP/TRUNCATE、清表、删回执/审核/通知证据、清 Redis 或 `down -v`。数据库故障走独立恢复流程。

修复后重新进行隔离验收与规则/凭据预检，确认剩余队列责任人和私有告警正常，再申请生产恢复写入。重新开启前不要轮换游标密钥来掩盖故障；保留数据和证据可支撑重试、审核与追溯。

发布记录模板：发布 SHA / 迁移版本 / 规则版本 / 自动检查命令与退出码 / 备份及恢复演练证据 / DevTools 与真机结果 / 48 小时观察汇总 / 12h、24h 响应演练 / 私有采集和告警链路结果 / 值班与替补 / 生产开关批准人和时间 / 回滚镜像兼容性 / 明确未执行项。只记录必要汇总，凭据和用户内容留在受控系统。
