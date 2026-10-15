# 院校、专业、课程导入与回收站

## 工作人员操作

1. 登录网页管理后台，点击“批量导入”，下载院校、专业或课程模板。
2. 先看“填写说明”和“填写示例”。仅“导入数据”工作表会入库，示例不会导入。
3. 带星号的字段必填，其余可空。院校、专业至少填写一个名称；课程必须填写中文名称。
4. 国家、院校、分类、学历、授课方式可选择中文名称。重名时使用可选资料中的编码。
   课程的所属专业也可在“可选专业”表复制完整选项。先发布院校，再发布专业，最后导入课程。
5. 内部编码和页面地址可以留空。系统生成的编码会出现在上传预览中，确认后沿用该编码。
   官网课程代码是学校提供的代码，与内部编码分别保存；不知道时不要编写。
6. 上传后查看错误行和修改建议。重复或冲突记录不会覆盖现有记录，可下载一个含三个工作表的核对文件。
7. 在草稿中修改、重新校验，选中有效草稿后确认发布。发布前会再次查重，整批选择在事务中写入。

课程资料来源分为“学校官网”“其他资料”“参考概述”。学校官网资料需有中文译名、英文原名及 HTTPS
来源链接，工作人员应先核对来源。未确认内容不得选择“学校官网”。参考内容单独标注
“参考学习领域，非官方课程表”，不补写官网未提供的学分、必修要求或官方课程代码。

## 删除与恢复

- 管理列表可勾选一条或多条，点击“删除所选”。先核对影响范围，再输入“确认”。
- 普通删除进入回收站，不删除申请、支付及历史数据。删除院校后其专业、课程对外隐藏。
- 在“查看范围/状态”选择“回收站”，选中记录后恢复。恢复沿用删除前状态，原来停用的数据仍停用。
- 只恢复专业或课程时，若其上级仍被删除或停用，前台仍不展示。
- 高级管理员才可看到“永久删除所选”。需在回收站中、没有业务关联，输入“永久删除”并再次确认。
- 有申请、支付明细、用户收藏、社区内容或下级资料的记录禁止永久删除。
  无关联资料按课程、专业、院校顺序清理；批次中任一记录不符合条件，整批不删除。
- 页面底部可查看操作人、对象、时间及删除/恢复类型。永久删除的编码不再复用。

## 安全部署

1. 备份 PostgreSQL，先在预发布环境验证。发布后端让 Flyway 执行新增 V54，再发布前端。
2. V54 保持旧编码、状态、申请关联及原有官方课程 JSON 不变；新增回收站时间、编码预留、
   操作审计、课程管理投影和高级管理员授权表。旧导入草稿继续按原字段处理。
3. 官网采集流程仍可更新 `programme_detail_sections.course_modules`；数据库触发器同步课程管理投影，
   保持已有内部编码。工作人员的课程修改在同一事务内同步公开详情 JSON；官网证据、学分等原字段保留。
4. 搜索同步任务继续负责更新 Elasticsearch。搜索请求额外根据 PostgreSQL 排除停用、回收站及已永久删除的
   院校和专业，避免索引尚未同步时暴露已隐藏资料。恢复后搜索可能需要等待同步任务完成。
5. 新增课程中“其他资料/参考概述”通过明确标注的学习概述展示；正式官网课程继续使用现有审核规则。

### 高级管理员授权

现有 ADMIN 不会自动获得永久删除权限。没有公共授权接口；必须由有数据库维护权限的负责人
审查账号后执行。以下为受控操作示例，替换邮箱和授权依据，并确认仅影响指定的现有活跃管理员：

```sql
BEGIN;
SELECT id, normalized_email, role, status
FROM user_accounts
WHERE normalized_email = lower('指定管理员邮箱') AND deleted_at IS NULL
FOR UPDATE;

INSERT INTO catalog_advanced_administrators(user_account_id, granted_by)
SELECT id, '负责人姓名/审批编号'
FROM user_accounts
WHERE normalized_email = lower('指定管理员邮箱')
  AND role = 'ADMIN' AND status = 'ACTIVE' AND deleted_at IS NULL
ON CONFLICT (user_account_id) DO NOTHING;
-- 核对 INSERT 数量与指定账号，随后 COMMIT；不符合预期则 ROLLBACK。
COMMIT;
```

撤销：按核实的用户 ID 删除 `catalog_advanced_administrators` 对应授权行。删除接口每次读取数据库
中的当前角色、账号状态和高级权限，撤销后旧登录会话也不能继续永久删除。其他后台权限仍复用现有系统。

## 验证

- `./mvnw test`：含真实 PostgreSQL 的导入、编码、重复、课程同步、删除恢复、业务关联保护及权限测试。
- `npm --prefix frontend test`、`npm --prefix frontend run lint`、`npm --prefix frontend run build`。
- `npm --prefix miniapp run check`。

本说明描述代码能力，不能视为生产环境已部署或已授予任何人高级管理员权限。

## 本次修改文件

- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCatalogDtos.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCatalogRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCatalogService.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCourseController.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCourseRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminCourseService.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminImportDtos.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminImportExcel.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminImportRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/AdminImportService.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/CatalogIdentityRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/CatalogIdentityService.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/CatalogLifecycleController.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/CatalogLifecycleRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/admin/CatalogLifecycleService.java`
- `backend/src/main/java/com/yangdoujiao/website/catalog/CatalogVisibilityRepository.java`
- `backend/src/main/java/com/yangdoujiao/website/search/UniversitySearchService.java`
- `backend/src/main/java/com/yangdoujiao/website/search/v4/query/UniversitySearchQueryFactory.java`
- `backend/src/main/resources/db/migration/V54__catalog_staff_workflows.sql`
- `backend/src/test/java/com/yangdoujiao/website/admin/AdminCatalogServiceTest.java`
- `backend/src/test/java/com/yangdoujiao/website/admin/CatalogStaffWorkflowIntegrationTest.java`
- `backend/src/test/java/com/yangdoujiao/website/programme/V3MigrationCompatibilityTest.java`
- `backend/src/test/java/com/yangdoujiao/website/search/v4/query/UniversitySearchQueryFactoryTest.java`
- `backend/src/test/java/com/yangdoujiao/website/university/api/UniversityDetailHttpIntegrationTest.java`
- `docs/ADMIN_STAFF_IMPORT_GUIDE.md`
- `docs/API.md`
- `docs/DATABASE.md`
- `frontend/src/app/[locale]/admin/courses/page.tsx`
- `frontend/src/app/[locale]/universities/[slug]/programmes/[programmeId]/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/admin-catalog-panel.tsx`
- `frontend/src/components/admin-course-panel.tsx`
- `frontend/src/components/admin-import-panel.tsx`
- `frontend/src/components/admin-lifecycle-actions.tsx`
- `frontend/src/lib/admin-import-api.test.ts`
- `frontend/src/lib/admin-import-api.ts`
- `miniapp/miniprogram/pages/programme-detail/index.wxml`
- `miniapp/miniprogram/utils/discovery-view.ts`
- `miniapp/tests/discovery-view.test.ts`
- `backend/src/test/java/com/yangdoujiao/website/admin/AdminImportIntegrationTest.java`
- `backend/src/test/java/com/yangdoujiao/website/admin/AdminImportExcelTest.java`
