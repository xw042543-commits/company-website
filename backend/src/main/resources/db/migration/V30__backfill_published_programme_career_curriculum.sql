-- Professional programme outlook and study areas: reference content, not verified official module lists.
-- All published programmes matched by name (Chinese/English); existing published content preserved.
-- PostgreSQL. Run after backup. No source_url is asserted.
WITH profiles(priority, discipline, pattern, jobs, sectors, foundation, core, advanced, practical) AS (
 VALUES
   (1, '人工智能与数据', '人工智能|机器学习|数据科学|数据分析|大数据|artificial intelligence|machine learning|data science|data analytics|big data', '机器学习工程师、数据分析师、智能系统开发人员、数据工程师', '金融风控、智能制造、医疗数据、互联网产品与自动化', 'Python 编程、离散数学、概率统计、数据结构', '机器学习、数据库、算法设计、数据建模', '深度学习、自然语言处理、计算机视觉、模型评估', '数据清洗、模型训练、团队项目、毕业设计')
  ,(2, '网络安全', '网络安全|信息安全|cybersecurity|cyber security|information security|digital forensics', '安全分析师、安全工程师、渗透测试助理、合规与风险分析人员', '企业安全运营、云安全、金融科技、数字取证', '计算机网络、操作系统、编程基础、离散数学', '网络防护、密码学、安全架构、风险管理', '数字取证、漏洞分析、云安全、安全治理', '安全实验、攻防演练、风险评估报告、毕业项目')
  ,(3, '软件与计算机', '软件工程|计算机科学|信息技术|信息系统|软件开发|computer science|software engineering|information technology|information systems|computing', '软件工程师、系统分析师、测试工程师、应用开发人员', '互联网服务、企业数字化、金融科技、云平台与软件产品', '程序设计、计算机数学、数据结构、计算机组成', '数据库、操作系统、软件工程、计算机网络', '云计算、移动开发、分布式系统、软件测试', '团队开发、版本管理、系统设计、毕业项目')
  ,(4, '会计与审计', '会计|审计|accounting|accountancy|audit', '会计助理、审计助理、财务分析师、税务助理', '企业财务、会计师事务所、税务服务、内部控制', '财务会计、管理会计、商业数学、经济学', '财务报告、成本管理、审计原理、税务基础', '财务分析、公司治理、风险与内部控制', '财务报表分析、案例研究、财务软件实践')
  ,(5, '金融与经济', '金融|经济|银行|投资|financ|economic|banking|investment|actuarial', '金融分析师助理、风险分析师、银行业务专员、研究助理', '银行、保险、资产管理、金融科技与企业财务', '微观经济学、宏观经济学、商业统计、数学', '公司金融、金融市场、计量经济学、投资分析', '风险管理、金融建模、国际金融、金融科技', '数据分析、投资案例、行业研究、毕业论文')
  ,(6, '工商管理', '工商管理|商业管理|企业管理|创业|人力资源|business administration|business management|entrepreneur|human resource|management', '管理培训生、运营专员、项目协调员、人力资源专员', '企业运营、咨询服务、创业公司与跨国企业', '管理学、商业沟通、经济学、组织行为', '战略管理、运营管理、人力资源、商业分析', '创新创业、项目管理、商业决策、领导力', '商业计划书、企业案例、团队项目、实习')
  ,(7, '市场营销', '市场营销|广告|公共关系|marketing|advertising|public relations|digital media', '市场专员、品牌助理、数字营销专员、市场研究员', '品牌管理、电商、数字广告、市场调研', '市场营销原理、消费者行为、商业沟通、统计', '品牌管理、营销研究、数字营销、传播策略', '搜索营销、社交媒体运营、营销数据分析', '营销策划、广告创意、市场调研项目')
  ,(8, '法律', '法律|法学|法务|law|legal|jurisprudence|shariah', '法律研究助理、合规专员、政策研究员、法务助理', '企业合规、法律服务、公共政策与监管事务', '法律体系、法律研究方法、宪法与法律写作', '合同法、商法、法律伦理、争议解决', '国际法、合规治理、专题法律研究', '案例研讨、模拟法庭、法律检索、研究论文')
  ,(9, '医学与护理', '医学|护理|临床|药学|医学检验|medical|medicine|nursing|pharmacy|clinical|biomedical', '临床或医疗支持岗位、医学研究助理、健康服务相关岗位', '医院、医疗机构、生命科学研究与公共卫生', '人体解剖、生理学、生物化学、医学基础', '病理学、药理学、临床技能、医学伦理', '循证实践、公共卫生、专业专题、临床研究', '实验技能、临床模拟、受监管的实践训练')
  ,(10, '心理与社会', '心理|社会工作|社会学|psychology|social work|sociology|counselling|counseling', '研究助理、人力资源专员、社区项目协调员、心理健康服务支持人员', '教育支持、社会服务、组织发展与行为研究', '心理学导论、社会研究方法、统计基础、发展理论', '认知与行为、社会心理、研究设计、伦理', '组织心理、心理测量、社区研究、专题研究', '问卷研究、案例分析、研究报告、实践项目')
  ,(11, '教育与语言', '教育|教学|英语|语言学|翻译|education|teaching|tesol|linguistics|translation|english language', '教学助理、课程开发专员、语言培训人员、教育项目协调员', '学校、教育科技、培训机构与语言服务', '教育学基础、语言基础、学习心理、研究方法', '课程设计、教学方法、教育评价、课堂管理', '数字教学、语言评估、跨文化交流、教育研究', '教学设计、课堂观察、微格教学、实践报告')
  ,(12, '建筑与土木', '建筑|土木|施工|城市规划|architecture|civil engineering|construction|urban planning|quantity surveying', '建筑设计助理、项目协调员、土木工程助理、工程造价助理', '建筑设计、基础设施、城市开发、工程咨询', '工程数学、建筑制图、材料基础、结构基础', '建筑设计、结构分析、工程测量、项目管理', '可持续建筑、施工管理、建筑信息模型', '设计工作室、工程测量、模型制作、综合项目')
  ,(13, '机械与制造', '机械|机电|制造|汽车工程|mechanical|mechatronic|manufacturing|automotive', '机械设计助理、制造工程师助理、自动化技术人员、质量工程师助理', '智能制造、汽车工业、设备维护与产品研发', '工程数学、工程力学、工程制图、材料科学', '机械设计、热力学、控制基础、制造工艺', '机器人、自动化、产品优化、质量管理', 'CAD 设计、工程实验、原型制作、毕业项目')
  ,(14, '电气与电子', '电气|电子|通信工程|electrical|electronic|telecommunication|embedded', '电子工程师助理、嵌入式开发人员、测试工程师、系统集成助理', '通信网络、半导体、智能设备与能源系统', '工程数学、电路原理、数字逻辑、程序设计', '电子电路、信号与系统、微控制器、通信原理', '嵌入式系统、物联网、自动控制、电子设计', '电路实验、硬件调试、系统原型、毕业项目')
  ,(15, '设计与创意', '设计|动画|视觉|平面|游戏|创意|design|animation|visual|graphic|game art|creative', '视觉设计师、交互设计助理、动画制作人员、品牌设计师', '数字媒体、广告、游戏、产品与用户体验', '设计基础、色彩构成、视觉传达、数字工具', '用户体验、设计研究、品牌设计、交互原理', '三维设计、动态影像、创意策略、作品集开发', '设计工作室、用户测试、作品集、毕业展')
  ,(16, '酒店旅游', '酒店|旅游|餐饮|烹饪|hospitality|tourism|culinary|hotel management', '酒店运营专员、活动协调员、旅游产品专员、餐饮管理培训生', '酒店、旅游服务、会展与餐饮运营', '服务管理、商务沟通、旅游概论、客户体验', '酒店运营、服务质量、活动策划、财务基础', '收益管理、可持续旅游、国际服务运营', '情景模拟、运营案例、实习、综合项目')
  ,(17, '生物与环境', '生物|化学|环境|食品科学|biolog|biotechnolog|chemistry|environment|food science', '实验室助理、质量控制专员、环境项目助理、研究助理', '科研机构、食品企业、环保咨询与生物技术', '普通化学、生物学、实验安全、统计基础', '微生物学、分析方法、实验设计、质量管理', '生物技术、环境监测、可持续发展、专题研究', '实验报告、样品分析、研究项目、毕业论文')
  ,(18, '数学与统计', '数学|统计|精算|mathematics|statistics|statistical|quantitative', '数据分析师、统计助理、风险分析师、研究助理', '金融、保险、研究机构、商业分析', '微积分、线性代数、概率论、编程基础', '数理统计、优化方法、回归分析、数学建模', '时间序列、随机过程、统计计算、专题研究', '数据建模、案例分析、研究报告、毕业项目')
  ,(19, '传播与媒体', '传媒|新闻|传播|影视|广播|communication|journalism|media studies|broadcast|film', '内容策划、编辑助理、传播专员、媒体制作人员', '新闻媒体、品牌传播、影视制作与数字内容', '传播学、媒体写作、视觉叙事、研究方法', '新闻采编、媒体伦理、数字传播、内容制作', '跨平台传播、受众分析、纪录片、媒体管理', '采访实训、内容制作、作品集、毕业项目')
  ,(20, '体育与健康', '体育|运动|健康科学|sports|sport science|health science|fitness', '运动项目协调员、健康促进助理、体育运营专员、研究助理', '体育产业、健康促进、运动训练支持', '人体生理、运动科学基础、研究方法、健康概论', '运动心理、训练原理、健康评估、运动管理', '运动数据分析、康复基础、社区健康项目', '体能评估、项目实践、研究报告、实习')
  ,(21, '通用学科', '.*', '行业研究助理、项目协调员、运营或专业支持岗位', '与专业相关的企事业单位、研究机构及公共服务', '学科导论、基础理论、研究与信息检索方法', '专业核心理论、分析方法、学科应用', '跨学科专题、研究方法、行业发展议题', '案例研讨、团队项目、研究报告、毕业项目')
), matches AS (
 SELECT p.id AS programme_id, COALESCE(NULLIF(BTRIM(p.name_zh), ''), NULLIF(BTRIM(p.name_en), ''), '本专业') AS programme_name, pr.*
 FROM programmes p CROSS JOIN LATERAL (
   SELECT * FROM profiles pr WHERE CONCAT_WS(' ',p.name_zh,p.name_en) ~* pr.pattern ORDER BY pr.priority LIMIT 1
 ) pr WHERE p.status = 'PUBLISHED'
), entries AS (
 SELECT programme_id, 'CAREER_OPPORTUNITIES'::varchar AS section_type, '专业前景'::varchar AS title_zh, 'Career prospects'::varchar AS title_en,
  programme_name || E'\n\n行业应用：' || sectors || E'。\n\n潜在就业方向：' || jobs || E'。\n\n核心竞争力：建议通过专业技能、跨学科协作、沟通能力和真实项目积累提升竞争力。部分职业需要额外认证、实习或执业资格。\n\n继续深造：可根据个人兴趣申请相关硕士、研究型课程或行业资格认证。\n\n说明：上述方向是专业相关的职业路径参考，不代表学校就业承诺。' AS body_zh,
  'Potential pathways include relevant industry roles, applied projects, research and further study. Career outcomes depend on individual skills, market conditions and, where applicable, professional licensing. Employment is not guaranteed.'::text AS body_en, 30 AS sort_order
 FROM matches
 UNION ALL
 SELECT programme_id, 'CURRICULUM', '专业课程', 'Programme curriculum',
  E'参考课程结构（非院校官方科目表）\n\n基础学习：' || foundation || E'。\n\n专业核心：' || core || E'。\n\n进阶方向：' || advanced || E'。\n\n实践与评估：' || practical || E'。\n\n重要说明：以上为根据专业领域整理的典型学习主题，并非该大学已确认的课程名称、学分、必修或选修安排；以学校最新官方教学大纲为准。',
  'Illustrative study areas only, not the institution’s verified module list. Typical study includes foundational learning, core disciplinary subjects, advanced topics and applied projects. Consult the university’s current syllabus for exact modules, credits and sequencing.', 40
 FROM matches
)
INSERT INTO programme_detail_sections (programme_id, section_type, title_zh, title_en, body_zh, body_en, sort_order, status, created_at, updated_at)
SELECT e.programme_id, e.section_type, e.title_zh, e.title_en, e.body_zh, e.body_en, e.sort_order, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM entries e
ON CONFLICT (programme_id, section_type) DO UPDATE
 SET body_zh = CASE WHEN programme_detail_sections.status <> 'PUBLISHED' OR NULLIF(BTRIM(programme_detail_sections.body_zh), '') IS NULL THEN EXCLUDED.body_zh ELSE programme_detail_sections.body_zh END,
 body_en = CASE WHEN programme_detail_sections.status <> 'PUBLISHED' OR NULLIF(BTRIM(programme_detail_sections.body_en), '') IS NULL THEN EXCLUDED.body_en ELSE programme_detail_sections.body_en END,
 title_zh = COALESCE(NULLIF(BTRIM(programme_detail_sections.title_zh), ''), EXCLUDED.title_zh),
 title_en = COALESCE(NULLIF(BTRIM(programme_detail_sections.title_en), ''), EXCLUDED.title_en),
 status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP
 WHERE programme_detail_sections.status <> 'PUBLISHED' OR NULLIF(BTRIM(programme_detail_sections.body_zh), '') IS NULL;
