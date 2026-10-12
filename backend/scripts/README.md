# 本地开发数据

`seed-development-data.sql` 只用于本地开发和前后端联调。

- 脚本中的学费、入学时间和专业介绍是演示数据，不是官方招生信息。
- 该脚本不在 Flyway 正式迁移目录中，应用启动时不会自动执行。
- 脚本使用 `ON CONFLICT` 和存在性检查，可以在同一个本地数据库重复执行。
- 老板的正式数据到位后，应使用单独的导入流程，不能把本脚本当作生产数据源。

在项目根目录执行：

```bash
docker compose exec -T postgres sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < backend/scripts/seed-development-data.sql
```

成功时最后会显示 `COMMIT`。后端运行时，搜索同步任务通常会在 5 秒内被处理。
