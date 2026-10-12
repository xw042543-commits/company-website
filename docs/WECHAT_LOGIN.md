# 微信登录配置与验收

## 当前状态

代码已经具备微信开放平台网站扫码登录框架，但默认关闭。没有公司主体的正式网站应用
AppID、AppSecret 和已审核回调域名时，页面不会显示微信入口，也不会生成演示二维码。

## 需要申请的资质

1. 使用公司主体注册并认证微信开放平台账号；
2. 创建“网站应用”，按平台要求提交网站、域名和业务资料；
3. 将正式 HTTPS 域名和回调地址加入平台白名单；
4. 由负责人把 AppID、AppSecret 放入服务器密钥存储，不在群里共享。

正式回调建议使用：

```text
https://yangdoujiao.com/api/v1/auth/wechat/callback
```

## 部署变量

```properties
APP_AUTH_WECHAT_ENABLED=true
APP_AUTH_WECHAT_APP_ID=由密钥存储注入
APP_AUTH_WECHAT_APP_SECRET=由密钥存储注入
APP_AUTH_WECHAT_CALLBACK_URL=https://yangdoujiao.com/api/v1/auth/wechat/callback
APP_AUTH_WECHAT_STATE_TTL=5m
APP_AUTH_WECHAT_BINDING_TTL=15m
```

启用前运行 `node scripts/deployment-preflight.mjs .env.production`。如需立即回滚，只需把
`APP_AUTH_WECHAT_ENABLED` 改为 `false` 并重新部署，邮箱和手机号登录不受影响。

## 账号规则

- 已绑定且状态正常的本地账号可以直接登录；
- 首次扫码必须输入并验证已有本地账号密码；
- 新用户先完成注册和邮箱或手机验证，再进行绑定；
- 一个本地账号只能绑定一个微信身份，同一微信身份不能绑定多个账号；
- 禁用或已删除账号不能通过微信登录。

## 正式验收

上线前至少验证：扫码成功、用户取消、过期回调、重复回调、首次绑定、错误密码、禁用账号、
再次扫码登录、退出登录、手机端回跳以及关闭开关。日志只检查事件结果、追踪号和摘要，不应出现
AppSecret、授权 code、Token、完整 state、Cookie 或 Session ID。
