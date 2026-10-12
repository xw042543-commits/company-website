BEGIN;

CREATE TEMP TABLE university_name_zh_updates (
    slug varchar(200) PRIMARY KEY,
    name_zh varchar(200) NOT NULL
) ON COMMIT DROP;

INSERT INTO university_name_zh_updates (slug, name_zh) VALUES
    ('city', '马来西亚城市大学'),
    ('mahsa', '马来西亚玛莎大学（MAHSA）'),
    ('ukm', '马来西亚国民大学（UKM）'),
    ('upm', '马来西亚博特拉大学（UPM）'),
    ('utar', '拉曼大学（UTAR）'),
    ('uum', '马来西亚北方大学（UUM）');

CREATE TEMP TABLE programme_name_zh_updates (
    programme_code varchar(64) PRIMARY KEY,
    name_zh varchar(200) NOT NULL
) ON COMMIT DROP;

INSERT INTO programme_name_zh_updates (programme_code, name_zh) VALUES
    ('UTM_BACHELOR_025', '管理学荣誉学士'),
    ('UPM_BACHELOR_014', '应用金融荣誉学士'),
    ('UPM_BACHELOR_046', '木材工业理学荣誉学士'),
    ('TAYLOR_BACHELOR_045', '伊斯兰管理与金融硕士'),
    ('TAYLOR_BACHELOR_047', '哲学博士'),
    ('CITY_BACHELOR_003', '多媒体荣誉学士'),
    ('CITY_BACHELOR_004', '企业传播方向传播学荣誉学士'),
    ('CITY_BACHELOR_005', '大众传播方向传播学荣誉学士'),
    ('CITY_BACHELOR_006', '新闻学方向传播学荣誉学士'),
    ('CITY_BACHELOR_007', '工商管理荣誉学士'),
    ('CITY_BACHELOR_008', '工程管理荣誉学士'),
    ('CITY_BACHELOR_009', '会计学荣誉学士'),
    ('CITY_BACHELOR_010', '会计与金融理学荣誉学士'),
    ('CITY_BACHELOR_011', '信息技术荣誉学士'),
    ('CITY_BACHELOR_012', '软件工程方向计算机科学荣誉学士'),
    ('CITY_BACHELOR_013', '职业安全与健康荣誉学士'),
    ('CITY_BACHELOR_014', '生物医学科学荣誉学士'),
    ('CITY_BACHELOR_015', '环境健康荣誉学士'),
    ('CITY_BACHELOR_016', '护理学学士'),
    ('CITY_BACHELOR_017', '酒店管理荣誉学士（Vatel双学位）'),
    ('CITY_BACHELOR_018', '英语作为第二语言教学荣誉教育学士'),
    ('CITY_BACHELOR_019', '幼儿教育荣誉教育学士'),
    ('CITY_BACHELOR_020', '应用心理学荣誉学士'),
    ('CITY_BACHELOR_021', '土木工程荣誉学士'),
    ('CITY_BACHELOR_022', '机械工程荣誉学士'),
    ('CITY_BACHELOR_023', '建筑设计理学荣誉学士'),
    ('CITY_BACHELOR_024', '室内设计荣誉学士'),
    ('UTAR_BACHELOR_001', '会计、商业与管理科学'),
    ('UTAR_BACHELOR_002', '工商管理荣誉学士'),
    ('UTAR_BACHELOR_003', '银行与金融方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_004', '创业方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_005', '医疗保健管理方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_006', '物流与供应链管理方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_007', '零售管理方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_008', '风险管理方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_009', '旅游目的地营销方向工商管理荣誉学士'),
    ('UTAR_BACHELOR_010', '会计学商学荣誉学士'),
    ('UTAR_BACHELOR_011', '金融经济学荣誉经济学学士'),
    ('UTAR_BACHELOR_012', '金融学荣誉学士'),
    ('UTAR_BACHELOR_013', '市场营销荣誉学士'),
    ('UTAR_BACHELOR_014', '公共管理荣誉学士'),
    ('UTAR_BACHELOR_015', '物流与国际航运理学荣誉学士'),
    ('UTAR_BACHELOR_016', '全球经济学荣誉经济学学士'),
    ('UTAR_BACHELOR_017', '金融科技方向金融学荣誉学士'),
    ('UTAR_BACHELOR_018', '国际商务荣誉学士'),
    ('UTAR_BACHELOR_019', '会计学荣誉学士'),
    ('UTAR_BACHELOR_020', '中文研究文学荣誉学士'),
    ('UTAR_BACHELOR_021', '英语教育文学荣誉学士'),
    ('UTAR_BACHELOR_022', '英语语言文学荣誉学士'),
    ('UTAR_BACHELOR_023', '广告学传播荣誉学士'),
    ('UTAR_BACHELOR_024', '新闻学传播荣誉学士'),
    ('UTAR_BACHELOR_025', '公共关系传播荣誉学士'),
    ('UTAR_BACHELOR_026', '心理学社会科学荣誉学士'),
    ('UTAR_BACHELOR_027', '指导与辅导社会科学荣誉学士'),
    ('UTAR_BACHELOR_028', '中文媒体新闻学文学荣誉学士'),
    ('UTAR_BACHELOR_029', '数字动画文学荣誉学士'),
    ('UTAR_BACHELOR_030', '游戏设计文学荣誉学士'),
    ('UTAR_BACHELOR_031', '平面设计与多媒体文学荣誉学士'),
    ('UTAR_BACHELOR_032', '广播学传播荣誉学士'),
    ('UTAR_BACHELOR_033', '企业传播荣誉学士'),
    ('UTAR_BACHELOR_034', '幼儿教育荣誉学士'),
    ('UTAR_BACHELOR_035', '媒体与创意研究荣誉学士'),
    ('UTAR_BACHELOR_036', '游戏开发理学荣誉学士'),
    ('UTAR_BACHELOR_037', '农业科学理学荣誉学士'),
    ('UTAR_BACHELOR_038', '生物化学理学荣誉学士'),
    ('UTAR_BACHELOR_039', '生物技术理学荣誉学士'),
    ('UTAR_BACHELOR_040', '化学理学荣誉学士'),
    ('UTAR_BACHELOR_041', '食品科学理学荣誉学士'),
    ('UTAR_BACHELOR_042', '微生物学理学荣誉学士'),
    ('UTAR_BACHELOR_043', '生物医学科学理学荣誉学士'),
    ('UTAR_BACHELOR_044', '营养治疗学理学荣誉学士'),
    ('UTAR_BACHELOR_045', '环境、职业安全与健康理学荣誉学士'),
    ('UTAR_BACHELOR_046', '护理学荣誉学士'),
    ('UTAR_BACHELOR_047', '物理治疗荣誉学士'),
    ('UTAR_BACHELOR_048', '中医学荣誉学士'),
    ('UTAR_BACHELOR_049', '计算机科学荣誉学士'),
    ('UTAR_BACHELOR_050', '商业信息系统方向信息系统荣誉学士'),
    ('UTAR_BACHELOR_051', '数字经济技术方向信息系统荣誉学士'),
    ('UTAR_BACHELOR_052', '信息系统工程方向信息系统荣誉学士'),
    ('UTAR_BACHELOR_053', '通信与网络方向信息技术荣誉学士'),
    ('UTAR_BACHELOR_054', '计算机工程方向信息技术荣誉学士'),
    ('UTAR_BACHELOR_055', '工业智能系统方向信息技术荣誉学士'),
    ('UTAR_BACHELOR_056', '统计计算与决策分析理学荣誉学士'),
    ('UTAR_BACHELOR_057', '精算学理学荣誉学士'),
    ('UTAR_BACHELOR_058', '计算应用数学理学荣誉学士'),
    ('UTAR_BACHELOR_059', '金融数学理学荣誉学士'),
    ('UTAR_BACHELOR_060', '软件工程理学荣誉学士'),
    ('UTAR_BACHELOR_061', '建筑管理理学荣誉学士'),
    ('UTAR_BACHELOR_062', '电子系统技术荣誉学士'),
    ('UTAR_BACHELOR_063', '工业管理技术荣誉学士'),
    ('UTAR_BACHELOR_064', '化学工程（过程）荣誉学士'),
    ('UTAR_BACHELOR_065', '土木工程（环境）荣誉学士'),
    ('UTAR_BACHELOR_066', '电子工程荣誉学士'),
    ('UTAR_BACHELOR_067', '工业工程荣誉工程学士'),
    ('UTAR_BACHELOR_068', '建筑与物业管理荣誉学士'),
    ('UTAR_BACHELOR_069', '建筑学理学荣誉学士'),
    ('UTAR_BACHELOR_070', '物理学理学荣誉学士'),
    ('UTAR_BACHELOR_071', '生物医学工程荣誉学士'),
    ('UTAR_BACHELOR_072', '化学工程荣誉学士'),
    ('UTAR_BACHELOR_073', '土木工程荣誉学士'),
    ('UTAR_BACHELOR_074', '电气与电子工程荣誉学士'),
    ('UTAR_BACHELOR_075', '材料工程荣誉学士'),
    ('UTAR_BACHELOR_076', '机械工程荣誉学士'),
    ('UTAR_BACHELOR_077', '机电一体化工程荣誉学士'),
    ('UTAR_BACHELOR_078', '电信工程荣誉学士'),
    ('UTAR_BACHELOR_079', '工料测量理学荣誉学士'),
    ('NOTTINGHAM_BACHELOR_001', '商业经济与金融理学荣誉学士（BSc Hons）'),
    ('NOTTINGHAM_BACHELOR_002', '商业经济与管理理学荣誉学士（BSc Hons）'),
    ('NOTTINGHAM_BACHELOR_003', '金融、会计与管理'),
    ('NOTTINGHAM_BACHELOR_004', '市场营销与管理'),
    ('NOTTINGHAM_BACHELOR_005', '金融、管理与商业分析'),
    ('NOTTINGHAM_BACHELOR_006', '国际商务管理理学荣誉学士（BSc Hons）'),
    ('NOTTINGHAM_BACHELOR_007', '英语语言与文学'),
    ('NOTTINGHAM_BACHELOR_008', '英语与创意写作'),
    ('NOTTINGHAM_BACHELOR_009', '国际传播研究'),
    ('NOTTINGHAM_BACHELOR_010', '国际传播与影视研究'),
    ('NOTTINGHAM_BACHELOR_011', '国际传播与英语语言文学研究'),
    ('NOTTINGHAM_BACHELOR_012', '国际传播与表演艺术研究'),
    ('NOTTINGHAM_BACHELOR_013', '国际关系'),
    ('NOTTINGHAM_BACHELOR_014', '国际关系与法语'),
    ('NOTTINGHAM_BACHELOR_015', '国际关系与西班牙语'),
    ('NOTTINGHAM_BACHELOR_016', '对外英语教学教育学（TESOL）'),
    ('NOTTINGHAM_BACHELOR_017', '对外英语教学（TESOL）'),
    ('NOTTINGHAM_BACHELOR_018', '应用心理学与管理'),
    ('NOTTINGHAM_BACHELOR_019', '经济学'),
    ('NOTTINGHAM_BACHELOR_020', '经济学与国际经济学'),
    ('NOTTINGHAM_BACHELOR_021', '化学工程'),
    ('NOTTINGHAM_BACHELOR_022', '化学工程与环境工程'),
    ('NOTTINGHAM_BACHELOR_023', '土木工程'),
    ('NOTTINGHAM_BACHELOR_024', '电气与电子工程'),
    ('NOTTINGHAM_BACHELOR_025', '数学与管理'),
    ('NOTTINGHAM_BACHELOR_026', '数学与数据科学'),
    ('NOTTINGHAM_BACHELOR_027', '机械工程'),
    ('NOTTINGHAM_BACHELOR_028', '机电一体化工程'),
    ('NOTTINGHAM_BACHELOR_029', '计算机科学'),
    ('NOTTINGHAM_BACHELOR_030', '计算机科学与人工智能'),
    ('NOTTINGHAM_BACHELOR_031', '软件工程'),
    ('NOTTINGHAM_BACHELOR_032', '心理学'),
    ('NOTTINGHAM_BACHELOR_033', '心理学与认知神经科学'),
    ('NOTTINGHAM_BACHELOR_034', '营养学'),
    ('NOTTINGHAM_BACHELOR_035', '生物技术'),
    ('NOTTINGHAM_BACHELOR_036', '环境科学'),
    ('NOTTINGHAM_BACHELOR_037', '生物医学科学'),
    ('NOTTINGHAM_BACHELOR_038', '药学与健康科学'),
    ('NOTTINGHAM_BACHELOR_039', '药学荣誉学士（BPharm Hons）'),
    ('UM_MASTER_010', '伊斯兰研究硕士（伊斯兰教法）'),
    ('UM_MASTER_011', '伊斯兰研究硕士（伊斯兰金融）'),
    ('UM_MASTER_097', '文学硕士（东南亚历史）'),
    ('UM_MASTER_100', '文学硕士（东南亚历史）'),
    ('UM_MASTER_106', '口腔科学硕士（申请已关闭）'),
    ('UM_MASTER_110', '生物医学工程硕士'),
    ('UM_MASTER_154', '亚欧研究所'),
    ('CITY_MASTER_001', '工商管理硕士（MBA）'),
    ('CITY_MASTER_002', '工商管理理学硕士（研究型，MSBA）'),
    ('CITY_MASTER_003', '信息技术硕士（MIT）'),
    ('CITY_MASTER_004', '会计学硕士（MACC）'),
    ('CITY_MASTER_005', '教育学硕士（MED）'),
    ('CITY_MASTER_006', '建筑学硕士（M.ARC）'),
    ('CITY_MASTER_007', '机械工程硕士（MME）'),
    ('CITY_MASTER_008', '体育研究硕士（研究型，MSS）'),
    ('CITY_MASTER_009', '创意产业与传播硕士（MCIC）'),
    ('CITY_MASTER_010', '建筑项目管理硕士（MAPM）'),
    ('CITY_DOCTOR_001', '工商管理博士（DBA）'),
    ('CITY_DOCTOR_002', '教育学博士（DDE）'),
    ('CITY_DOCTOR_003', '工商管理哲学博士（PhDBA）'),
    ('CITY_DOCTOR_004', '设计学哲学博士（PhD Design）'),
    ('CITY_DOCTOR_005', '教育学哲学博士（PhD Edu）'),
    ('CITY_DOCTOR_006', '信息技术哲学博士（PhD IT）'),
    ('CITY_DOCTOR_007', '体育研究哲学博士（PhD SS）'),
    ('CITY_DOCTOR_008', '表演艺术哲学博士（PhD PA）'),
    ('CITY_DOCTOR_009', '建成环境哲学博士（PhD BE）');

DO $$
BEGIN
    IF (SELECT count(*) FROM university_name_zh_updates) <> 6 THEN
        RAISE EXCEPTION 'Expected 6 university translations';
    END IF;
    IF (SELECT count(*) FROM programme_name_zh_updates) <> 171 THEN
        RAISE EXCEPTION 'Expected 171 programme translations';
    END IF;
    IF (SELECT count(*) FROM universities u JOIN university_name_zh_updates x ON x.slug = u.slug) <> 6 THEN
        RAISE EXCEPTION 'Some university translation targets do not exist';
    END IF;
    IF (SELECT count(*) FROM programmes p JOIN programme_name_zh_updates x ON x.programme_code = p.programme_code) <> 171 THEN
        RAISE EXCEPTION 'Some programme translation targets do not exist';
    END IF;
END $$;

UPDATE universities AS u
SET name_zh = x.name_zh,
    updated_at = CURRENT_TIMESTAMP
FROM university_name_zh_updates AS x
WHERE u.slug = x.slug
  AND (u.name_zh IS NULL OR btrim(u.name_zh) = '');

UPDATE programmes AS p
SET name_zh = x.name_zh,
    updated_at = CURRENT_TIMESTAMP
FROM programme_name_zh_updates AS x
WHERE p.programme_code = x.programme_code
  AND (p.name_zh IS NULL OR btrim(p.name_zh) = '');

COMMIT;
