# U圈图片存储基础 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先交付可独立测试的安全图片编码和持久化存储基础，不开放上传入口或公开图片。

**Architecture:** 沿用Spring Boot模块化单体。图片模块负责解码、转码和受控文件存储；后续上传服务负责PostgreSQL元数据、所有权及配额。此阶段不接入帖子，不改变现有文字审核。

**Tech Stack:** Java 21、Maven Wrapper、Java ImageIO、JUnit 5、临时文件系统。

**Spec:** `docs/superpowers/specs/2026-10-12-community-image-posts-design.md`

## Global Constraints

- 每帖最多9张；标题60字、正文2000字及当前必填要求保持不变。
- 服务端上传硬限制5MB；真实解码校验JPEG/PNG；像素上限2000万。
- 去除EXIF等元数据；不支持SVG、动图和视频。
- 图片路径由服务端生成；不允许公开整个存储目录。
- 未审核图片不可公开；不得自动购买服务、修改生产微信配置或部署。
- 保留用户修改的 `miniapp/project.config.json`；提交必须精确列出文件。
- 此计划仅覆盖存储基础，不能据此声称图片发帖已完成。

## 分段边界

本功能分三段：①安全存储基础；②鉴权上传、持久审核任务、回调与帖子状态整合；③编辑器、草稿、列表详情及后台展示。后两段须在读取相关完整实现和核实微信官方接口后分别制定详细计划。第①段可独立验收，不依赖微信账号配置，不开放不完整的用户功能。

## 文件职责

新文件统一放在 `backend/src/main/java/com/yangdoujiao/website/community/media/`：

- `EncodedCommunityImage.java`：转码后展示图、缩略图及尺寸的不可变值。
- `CommunityImageCodec.java`：检测格式、尺寸和字节限制，解码并生成无原始元数据的JPEG。
- `CommunityImageStorage.java`：存储接口，不承载HTTP或鉴权。
- `LocalCommunityImageStorage.java`：受控根目录、随机存储键、原子文件提交和清理。

对应测试放在 `backend/src/test/java/com/yangdoujiao/website/community/media/`。

### Task 1: 图片解码边界

**Files:** Create上述值对象和Codec；Test `CommunityImageCodecTest.java`。

**Interfaces:** `EncodedCommunityImage(byte[] display, byte[] thumbnail, int width, int height)`；`CommunityImageCodec.encode(byte[] input)` 返回该对象，非法输入抛 `IllegalArgumentException`。输出固定JPEG，不复用用户文件名或声称的Content-Type。

- [ ] 编写失败测试，以ImageIO生成测试图片，不下载真实照片：

```java
@Test void rejectsEmptyAndOversizedInput() {
    var codec = new CommunityImageCodec();
    assertThrows(IllegalArgumentException.class, () -> codec.encode(new byte[0]));
    assertThrows(IllegalArgumentException.class,
        () -> codec.encode(new byte[5 * 1024 * 1024 + 1]));
}
@Test void rejectsSvg() {
    assertThrows(IllegalArgumentException.class,
        () -> new CommunityImageCodec().encode("<svg/>".getBytes(StandardCharsets.UTF_8)));
}
```

- [ ] 从backend运行 `./mvnw -Dtest=CommunityImageCodecTest test`，记录因缺少实现失败。
- [ ] 实现值对象与解码校验。先用ImageReader读尺寸，再分配像素；使用long检查宽×高，拒绝超过20_000_000、零或负尺寸、多帧、非JPEG/PNG输入。关闭reader及所有流。

```java
long pixels = (long) width * height;
if (width <= 0 || height <= 0 || pixels > 20_000_000L) {
    throw new IllegalArgumentException("Unsupported image dimensions");
}
```

- [ ] 添加实际JPEG、PNG成功样例、伪造扩展名不参与判断、GIF拒绝、尺寸边界和损坏数据测试。确认失败原因后实现转码：展示图最长边1600、缩略图最长边480，不放大小图，透明背景合成为白色；新建RGB像素画布写JPEG，不复制原始元数据。
- [ ] 重跑Codec测试，检查两种输出均可解码、宽高比保持、最长边受限、输入未被修改。返回/构造数组使用防御性复制。
- [ ] 精确提交Codec、值对象与测试：`git commit -m "feat: add bounded community image encoding"`。

### Task 2: 私有文件存储

**Files:** Create `CommunityImageStorage.java`、`LocalCommunityImageStorage.java`；Test `LocalCommunityImageStorageTest.java`。

**Interfaces:** `String save(EncodedCommunityImage image)`、`byte[] read(String key, boolean thumbnail)`、`void delete(String key)`；方法抛IOException。构造器 `LocalCommunityImageStorage(Path root)`。key只接受服务端生成的32位小写十六进制值，禁止路径输入；两个变体同目录 `display.jpg` 和 `thumbnail.jpg`。

- [ ] 编写临时目录失败测试：

```java
@TempDir Path root;
@Test void rejectsTraversal() throws Exception {
    var storage = new LocalCommunityImageStorage(root);
    assertThrows(IllegalArgumentException.class, () -> storage.read("../secret", false));
    assertThrows(IllegalArgumentException.class, () -> storage.delete("../secret"));
}
```

- [ ] 运行 `./mvnw -Dtest=LocalCommunityImageStorageTest test`，确认失败。
- [ ] 实现接口，key来自UUID移除连字符；每次读取/删除验证 `key.matches("[0-9a-f]{32}")`。拒绝根目录和图片目录符号链接，检查规范化路径位于配置根目录内。根目录仅供本模块写入。
- [ ] 写入先进入根目录下随机临时子目录，完整写两图后原子移动为最终key目录；不支持原子移动时失败并清理，不退化为公开半成品。失败只清理本次创建的明确路径，不能递归删除配置根目录。
- [ ] 增加往返读取、两个变体独立、重新构造实例仍可读、缺失文件、无效key、符号链接拒绝、重复删除幂等、写入失败无残留测试。使用Task1 Codec生成有效输入。
- [ ] 运行两个测试类：`./mvnw -Dtest=CommunityImageCodecTest,LocalCommunityImageStorageTest test`；通过后精确提交 `git commit -m "feat: add private community image file store"`。

### Task 3: 存储基础验收与后续接口调查

**Files:** Modify本计划的完成项；Create `docs/runbooks/community-image-storage.md`。

- [ ] 运行 `./mvnw test`，记录测试数及环境导致的跳过/失败；不要把容器不可用等问题标记为通过。
- [ ] 检查 `git diff --check`、提交文件列表和工作树，确认未修改AppID/线上配置，也未加入公开图片HTTP端点。
- [ ] 编写运行说明：这只是存储内部模块；后续需要卷挂载、PostgreSQL元数据、权限、每用户90张/日与总配额、2GB余量保护、24小时孤儿清理及数据库+卷备份恢复，当前尚未具备这些上线条件。
- [ ] 从微信官方文档核实异步媒体接口、回调验签/加密、权限和限制，保留来源与核实日期。文档无法读取时如实报告，仅阻止供应商集成，不编造协议。
- [ ] 后续计划必须覆盖：上传两并发与登录刷新；元数据所有权和原子绑定；持久任务、幂等及乱序回调；人工/删除状态不可复活；可见性受控读取；草稿与迟到上传；9图UI与预览；后台审核图片；部署契约及备份恢复；真机和真实回调验收。完成详细计划前不得开放生产上传。

## 自查

此计划有意只实现设计中的编解码和私有存储单元；不宣称覆盖完整发帖功能。没有存储到公开Web目录的路径；没有供应商协议猜测；保留文本发布行为。后续两个阶段依赖本阶段返回的存储key与编码输出，不接受客户端URL作为存储位置。

## 2026-10-12执行记录

- [x] 已实现Codec与存储接口、文件实现；两个新测试类共11项通过。
- [x] 观察到缺少新类时测试编译失败；APNG回归测试观察到未拒绝动图的断言失败，加入控制块检测后通过。
- [x] `./mvnw -q -Djava.awt.headless=true test` 在允许Docker访问后退出0；首次沙箱运行被Docker/端口权限阻止，不算通过。
- [x] `git diff --check`通过；没有修改现有请求接口及小程序配置。
- [x] 新增存储运行说明，明确尚不可上线。
- [ ] 写盘中途故障和不支持原子移动文件系统的故障注入测试尚未完成；当前null输入测试只覆盖写入前拒绝，不替代I/O故障测试。
- [x] 补充精确2000万像素接受边界、源EXIF夹具及截断JPEG专项测试；发现ImageIO容错接受截断JPEG，监听解码告警拒绝损坏文件后14项专项测试通过。
- [x] 直接读取微信官方媒体检测和消息推送页面，已核对基础协议并记录运行说明。
- [ ] 真实账号回调配置与联调仍未完成；第二、三段未实施。
