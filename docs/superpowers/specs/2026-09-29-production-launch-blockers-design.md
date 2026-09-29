# 生产启动与公开索引修复设计

## 目标

修复当前生产 Compose 无法健康启动的问题，并保证公开 sitemap 不包含需要登录或返回 404 的地址。修复不改变现有会员访问边界，不开放注册、微信登录或咨询提交。

## 备选方案

1. **固定前端的内部代理身份，保留后端 HTTPS 校验（采用）**
   - 为 frontend 和 backend 创建专用 Docker 网络，给 frontend 分配固定内部 IP。
   - backend 只信任该 frontend IP 传入的唯一 `X-Forwarded-Proto: https` 和 `X-Forwarded-For`。
   - backend 同时信任容器回环地址，healthcheck 显式携带唯一 HTTPS 转发头。
   - 优点：保留应用层 HTTPS 防线和真实访客 IP 限流，不会把全部访客当成同一容器地址。

2. **仅由公网边缘强制 HTTPS，容器内全部允许 HTTP**
   - 配置最简单，但后端无法区分内部代理和误暴露的 HTTP 请求。
   - 如果不再信任 frontend 的转发头，限流会把所有访客当成同一客户端，因此不采用。

3. **在内部请求中加共享密钥头**
   - 后端仅接受带有内部密钥的 HTTP 请求。
   - 缺点：需要新增密钥轮换、Next 代理层和额外故障模式，对当前单机 Compose 过度设计。

## 生产网络边界

- 保留 Spring Boot 的生产 HTTPS 校验，只接受来自明确可信 IP 的单一 `X-Forwarded-Proto: https`。
- 保留 `Secure`、`HttpOnly`、`SameSite=Lax` Session Cookie，保留前端 HSTS 和其他安全响应头。
- 生产 Compose 仍不对宿主机发布 backend、PostgreSQL、Redis 或 Elasticsearch 端口。
- frontend 和 backend 使用专用 `frontend-backend` 网络；frontend 使用固定 IP `172.30.0.10`，backend 使用 `172.30.0.20`。
- backend 的 `APP_TRUSTED_PROXIES` 在该 Compose 中固定为 `127.0.0.1,172.30.0.10`，不由公开环境文件随意改写。
- 部署文档明确要求边缘代理删除客户伪造的转发头，将 HTTP 重定向 HTTPS，并仅代理到 `127.0.0.1:3000`。
- 生产健康检查访问容器内 `http://localhost:8080/actuator/health/readiness`，并显式添加 `X-Forwarded-Proto: https`。

## 公开路由与 SEO

- 保留现有会员权限：院校、留学规划、语言、奖学金和资讯继续需要登录。
- sitemap 首发只包含 `/zh`、`/en`、`/zh/about`、`/en/about`。
- 删除不存在的 `/zh/programmes` 和 `/en/programmes`。
- 新增测试，要求 sitemap 中每个路由都属于明确的匿名公开路由，不得属于登录保护路由。
- 未获批正式收录前，`PUBLIC_INDEXING_ENABLED=false` 保持不变。

## 验证

1. 单元测试证明只有 frontend 固定 IP 和容器回环地址能携带 HTTPS 转发头通过生产校验。
2. Compose 契约测试证明只有 frontend 发布宿主机端口，内部 IP、可信代理和 readiness 头一致。
3. sitemap 测试证明不含登录保护路由或不存在的路由。
4. CI 使用隔离环境实际启动生产 Compose，等待所有容器 healthy，用 `X-Forwarded-Proto: https` 经 frontend 验证首页与后端 API，最后执行 `down --volumes`。

## 非本次范围

- 合并或发布 PR #31 的正式数据。
- 打开注册、微信登录、咨询提交或公开搜索引擎收录。
- 实现邮件/短信供应商、法律文本、服务器监控或备份基础设施。
