# UDAJO 微信小程序

原生 WXML、WXSS 和 TypeScript 小程序。当前底部导航固定为首页、院校、U圈、我的；
留学规划从首页进入，不占用底部导航。院校数据来自官网现有公开 API，不包含演示学校或伪造内容。

## 本地准备

1. 安装 Node.js 24，进入本目录执行 `npm ci` 和 `npm run check`。
2. 在微信开发者工具中选择“导入项目”，目录选仓库内的 `miniapp/`。
3. 首次导入可使用提交文件中的测试 AppID。需要真机或正式接口能力时，在开发者工具项目设置中填写
   自己有权限的小程序 AppID；它会写入 `project.private.config.json`，该文件已被 Git 忽略，禁止提交。
4. 本地 API 默认使用 `http://localhost:8080`。开发者工具调试本地服务时，可以仅在本地关闭合法域名校验；体验版和正式版不得依赖该选项。

## 本地测试登录

本地身份提供方只用于开发环境。后端本地 `.env` 可设置：

```dotenv
APP_MINIAPP_AUTH_ENABLED=true
APP_MINIAPP_WECHAT_APP_ID=
APP_MINIAPP_WECHAT_APP_SECRET=
APP_MINIAPP_PUBLIC_ORIGIN=http://localhost:8080
APP_MINIAPP_ACCESS_TOKEN_TTL=15m
APP_MINIAPP_REFRESH_TOKEN_TTL=30d
APP_MINIAPP_LOCAL_PROVIDER_ENABLED=true
APP_MINIAPP_LOCAL_TEST_CODE=replace_with_local_fixed_code
APP_MINIAPP_LOCAL_TEST_SUBJECT=replace_with_local_fixed_subject
```

本地测试值不得对应真实微信账号，也不得进入 Git、截图或日志。生产配置会强制拒绝本地身份提供方。

## 正式微信登录

正式环境使用以下变量：

```dotenv
APP_MINIAPP_AUTH_ENABLED=true
APP_MINIAPP_WECHAT_APP_ID=
APP_MINIAPP_WECHAT_APP_SECRET=
APP_MINIAPP_PUBLIC_ORIGIN=https://yangdoujiao.com
APP_MINIAPP_ACCESS_TOKEN_TTL=15m
APP_MINIAPP_REFRESH_TOKEN_TTL=30d
APP_MINIAPP_LOCAL_PROVIDER_ENABLED=false
APP_MINIAPP_LOCAL_TEST_CODE=
APP_MINIAPP_LOCAL_TEST_SUBJECT=
```

`APP_MINIAPP_WECHAT_APP_SECRET` 只能保存在服务器未跟踪的环境文件或 GitHub `production`
Environment Secret 中，不能写入小程序。`APP_MINIAPP_LOCAL_TEST_CODE` 和
`APP_MINIAPP_LOCAL_TEST_SUBJECT` 仅限非生产环境，生产必须留空。

在微信公众平台完成下列事项后才能打开正式认证：

- 将 `https://yangdoujiao.com` 配置为小程序服务器 request 合法域名，确保 HTTPS 证书有效且 API 可从公网访问。
- 确认小程序主体拥有该域名，并完成平台要求的备案、业务类目和隐私保护指引审核。
- 为使用到的用户信息逐项填写采集目的；当前登录默认只使用微信返回的身份标识，不主动获取头像或昵称。
- 服务器先保持 `APP_MINIAPP_AUTH_ENABLED=false` 完成部署和健康检查，随后填写正式 AppID、AppSecret 并重新部署。
- 严禁在开发者工具、前端代码或请求日志中输出 AppSecret、`session_key`、访问令牌或刷新令牌。

## 检查与体验版

提交前运行：

```bash
cd miniapp
npm ci
npm run check
```

然后在微信开发者工具中验证四个底部入口、规划页、院校加载/空结果/失败/离线状态、首次登录、
冷启动续期和退出登录。至少使用一台小屏设备、一台带安全区设备和大字体模式检查布局。

验证通过后，在开发者工具右上角选择“上传”，填写与 Git 提交对应的版本号和说明；再到微信公众平台
的版本管理中选择该构建作为体验版，配置体验成员并进行真机验收。正式提交审核前，必须再次确认合法域名、
隐私指引、生产本地提供方关闭、后端健康和认证集成测试均已通过。

## 协作边界

- 公共请求统一使用 `miniprogram/services/http.ts`，页面不得另建请求封装。
- 登录和令牌生命周期统一使用 `miniprogram/stores/session.ts`，不得持久化访问令牌或账号资料。
- B 组首页、院校模块和 C 组专业、规划、我的模块通过公共 service 与组件开发。

### A2 公共能力

- 可被新查询替代的读取请求必须传稳定的 `requestKey`；页面收到 `REQUEST_SUPERSEDED` 时保持当前状态，不显示失败提示。
- 筛选项统一来自 `services/catalogue.ts`；“全部”只在页面展示，发请求时省略，禁止在页面硬编码数据库 code。
- 院校与专业详情地址统一使用 `utils/routes.ts`；目标页面注册完成前不得导航。
- 远程院校图统一使用 `university-card` 的失败回退，页面不得重复维护图片错误状态。

- U圈面向 2,000 名以上学生，正式动态、评论、举报、审核和数据保留必须先完成独立规格与容量设计，不能用静态假数据代替。
