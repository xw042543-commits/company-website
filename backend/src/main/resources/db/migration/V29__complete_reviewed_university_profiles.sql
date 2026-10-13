-- Synchronize the 20 reviewed university profiles used by the public website with PostgreSQL.
-- The source text is maintained in frontend/src/data/university-catalog.ts and university-profiles.ts.
CREATE TEMP TABLE reviewed_university_profiles (
    slug VARCHAR(200) PRIMARY KEY,
    name_zh VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    city_zh VARCHAR(200) NOT NULL,
    city_en VARCHAR(200) NOT NULL,
    description_zh TEXT NOT NULL,
    description_en TEXT NOT NULL,
    popular BOOLEAN NOT NULL
) ON COMMIT DROP;

INSERT INTO reviewed_university_profiles (
    slug, name_zh, name_en, city_zh, city_en, description_zh, description_en, popular
) VALUES
    ('um', '马来亚大学', 'University of Malaya', '吉隆坡', 'Kuala Lumpur', '马来亚大学是一所综合研究型公立大学，课程横跨人文、科学、工程、商业与医学。多元的学科体系和研究环境，适合希望在同一所大学探索不同专业方向，或继续深造的学生。', 'University of Malaya is a comprehensive public research university with programmes spanning the humanities, sciences, engineering, business, and medicine. Its broad academic range and research environment suit students who want room to explore different disciplines or continue into advanced study.', TRUE),
    ('ukm', '马来西亚国民大学', 'Universiti Kebangsaan Malaysia', '万宜', 'Bangi', '马来西亚国民大学是一所公立研究型大学，提供涵盖医学、工程、社会科学等领域的本科及研究生课程。学校的课程选择较为完整，适合希望兼顾专业学习与研究发展的学生。', 'Universiti Kebangsaan Malaysia is a public research university offering undergraduate and postgraduate study across medicine, engineering, the social sciences, and other fields. Its wide academic range suits students looking to combine professional study with opportunities for further research.', TRUE),
    ('utm', '马来西亚理工大学', 'Universiti Teknologi Malaysia', '新山', 'Johor Bahru', '马来西亚理工大学以工程、科技、计算机及建筑环境相关课程见长。课程体系重视技术知识与实际应用，适合对工程设计、数字技术或建成环境感兴趣的学生。', 'Universiti Teknologi Malaysia is particularly known for engineering, technology, computing, and the built environment. Its programmes emphasise technical knowledge and practical application, making it a strong fit for students interested in engineering design, digital technology, or the built world.', FALSE),
    ('upm', '马来西亚博特拉大学', 'Universiti Putra Malaysia', '沙登', 'Serdang', '马来西亚博特拉大学由农业教育传统发展为综合研究型大学，优势领域包括农业、兽医学、科学与商业。跨学科的课程设置，适合希望把专业知识应用于产业、社会或研究工作的学生。', 'Universiti Putra Malaysia has grown from its agricultural education roots into a comprehensive research university, with strengths in agriculture, veterinary science, science, and business. Its interdisciplinary offering suits students who want to apply specialist knowledge in industry, society, or research.', FALSE),
    ('usm', '马来西亚理科大学', 'Universiti Sains Malaysia', '槟城', 'Penang', '马来西亚理科大学是一所公立研究型大学，在科学、药剂、健康、工程及可持续发展等领域具有鲜明特色。学校适合希望接受研究导向教育，并关注科学与社会实际问题的学生。', 'Universiti Sains Malaysia is a public research university with distinctive strengths in science, pharmacy, health, engineering, and sustainability. It suits students seeking a research-led education that connects scientific study with practical social challenges.', FALSE),
    ('uum', '马来西亚北方大学', 'Universiti Utara Malaysia', '吉打州新笃', 'Sintok, Kedah', '马来西亚北方大学的课程重点集中在管理、会计、商业及公共事务。清晰的专业方向适合希望发展商业分析、组织管理或公共部门相关能力的学生。', 'Universiti Utara Malaysia focuses strongly on management, accounting, business, and public affairs. Its clear academic direction suits students who want to develop skills for business analysis, organisational leadership, or public-sector work.', FALSE),
    ('taylor', '泰莱大学', 'Taylor''s University', '梳邦再也', 'Subang Jaya', '泰莱大学提供酒店管理、商业、设计、计算机及健康科学等多元课程。课程强调行业联系与实践学习，适合希望在学习期间累积项目经验并了解职业方向的学生。', 'Taylor''s University offers a varied selection of programmes in hospitality, business, design, computing, and health sciences. Its emphasis on industry connections and applied learning suits students who want to build project experience while clarifying their career direction.', TRUE),
    ('ucsi', '思特雅大学', 'UCSI University', '吉隆坡', 'Kuala Lumpur', '思特雅大学的课程涵盖音乐、商业、工程、药剂及健康科学，兼顾创意、技术与专业学科。多样化的学习方向适合希望在实践中建立专业能力，并逐步明确职业选择的学生。', 'UCSI University offers programmes across music, business, engineering, pharmacy, and health sciences, bringing creative, technical, and professional disciplines together. This variety suits students who want to build practical expertise while shaping a clearer career path.', FALSE),
    ('inti', '英迪国际大学', 'INTI International University', '汝来', 'Nilai', '英迪国际大学提供商业、计算机与工程课程，同时设有衔接海外大学的学习选择。灵活的升学路径适合希望先在马来西亚学习，再按计划完成国际课程或学位的学生。', 'INTI International University offers programmes in business, computing, and engineering alongside pathways linked to overseas universities. These flexible routes suit students who want to begin their studies in Malaysia and progress towards an international programme or degree.', FALSE),
    ('sunway', '双威大学', 'Sunway University', '双威城', 'Bandar Sunway', '双威大学提供商业、酒店管理、计算机、心理学及健康科学等课程。课程选择兼顾专业训练与跨学科学习，适合希望在校园学习中接触不同领域并发展就业能力的学生。', 'Sunway University offers programmes in business, hospitality, computing, psychology, and health sciences. Its mix of professional and interdisciplinary study suits students who want exposure to different fields while developing career-ready skills.', TRUE),
    ('apu', '亚太科技大学', 'Asia Pacific University of Technology & Innovation', '吉隆坡', 'Kuala Lumpur', '亚太科技大学以计算机、网络安全、科技、工程、商业及创意课程为重点。课程强调数字技能与行业应用，适合希望进入科技相关领域，或把技术能力应用于商业与创意工作的学生。', 'Asia Pacific University focuses on computing, cybersecurity, technology, engineering, business, and creative programmes. Its emphasis on digital skills and industry application suits students aiming for technology careers or roles that combine technical knowledge with business and creative work.', TRUE),
    ('segi', '世纪大学', 'SEGi University', '哥打白沙罗', 'Kota Damansara', '世纪大学提供从预科、本科到研究生阶段的多层次课程，学习领域涵盖商业、工程、健康科学与教育。学校注重实践型教学和职业发展支持，适合希望在马来西亚完成英文授课课程，并兼顾专业知识与就业能力的学生。', 'SEGi University offers study routes from foundation and undergraduate programmes through to postgraduate degrees, with subject areas spanning business, engineering, health sciences, and education. Its practical approach to learning and career development support suits students who want to study in English in Malaysia while building both subject knowledge and employability skills.', FALSE),
    ('utar', '拉曼大学', 'Universiti Tunku Abdul Rahman', '金宝与双溪龙', 'Kampar and Sungai Long', '拉曼大学提供工程、商业、科学、医学及人文等领域的课程。广泛的学科选择适合希望比较不同专业，并根据学术兴趣逐步确定升学方向的学生。', 'Universiti Tunku Abdul Rahman offers programmes across engineering, business, science, medicine, and the humanities. Its broad subject range suits students who want to compare disciplines and shape their study plans around their academic interests.', FALSE),
    ('city', '马来西亚城市大学', 'City University Malaysia', '八打灵再也', 'Petaling Jaya', '马来西亚城市大学提供商业、教育、工程、信息技术及创意产业课程。课程覆盖传统专业与应用型领域，适合希望通过实践学习建立职业技能的学生。', 'City University Malaysia offers programmes in business, education, engineering, information technology, and the creative industries. Its mix of established and applied disciplines suits students who want to build career skills through practical study.', FALSE),
    ('monash', '莫纳什大学马来西亚分校', 'Monash University Malaysia', '双威城', 'Bandar Sunway', '莫纳什大学马来西亚分校按照澳大利亚大学体系提供医学、工程、商业等多学科课程。它适合希望在马来西亚学习，同时体验国际课程结构与学术环境的学生。', 'Monash University Malaysia delivers multidisciplinary programmes, including medicine, engineering, and business, within an Australian university system. It suits students who want to study in Malaysia while experiencing an international curriculum and academic environment.', TRUE),
    ('nottingham', '诺丁汉大学马来西亚分校', 'University of Nottingham Malaysia', '士毛月', 'Semenyih', '诺丁汉大学马来西亚分校按照英国大学体系提供本科及研究生课程，主要领域包括工程、商业与药剂学。它适合希望在马来西亚完成英式课程，并保留继续深造选择的学生。', 'University of Nottingham Malaysia offers undergraduate and postgraduate study within a UK university system, with key areas including engineering, business, and pharmacy. It suits students who want a British-style education in Malaysia with options for further study.', FALSE),
    ('southampton', '南安普顿大学马来西亚分校', 'University of Southampton Malaysia', '依斯干达公主城', 'Iskandar Puteri', '南安普顿大学马来西亚分校以工程、计算机及商业课程为重点，并延续英国大学的课程体系。它适合希望在技术与商业之间建立跨领域能力，并接受国际课程训练的学生。', 'University of Southampton Malaysia focuses on engineering, computing, and business within a UK university curriculum. It suits students who want to build cross-disciplinary skills across technology and business while studying in an international academic setting.', FALSE),
    ('help', '精英大学', 'HELP University', '莎阿南', 'Shah Alam', '精英大学提供商业、心理学、法律、教育及信息技术课程。其专业组合适合希望从社会科学、商业或数字领域出发，并逐步规划职业方向的学生。', 'HELP University offers programmes in business, psychology, law, education, and information technology. This combination suits students who want to begin in the social sciences, business, or digital fields while developing a clearer career plan.', FALSE),
    ('mahsa', '玛莎大学', 'MAHSA University', '仁嘉隆', 'Jenjarom', '玛莎大学专注于医学、牙科、药剂、护理及相关健康科学课程。明确的健康专业方向，适合希望接受专业训练并为医疗与健康服务行业做准备的学生。', 'MAHSA University focuses on medicine, dentistry, pharmacy, nursing, and allied health programmes. Its clear health-science direction suits students seeking professional training for careers in healthcare and related services.', FALSE),
    ('nilai', '汝来大学', 'Nilai University', '汝来', 'Nilai', '汝来大学提供商业、工程、酒店管理、航空及健康科学课程。多样的应用型专业适合希望把课堂学习与具体行业方向结合起来的学生。', 'Nilai University offers programmes in business, engineering, hospitality, aviation, and health sciences. Its range of applied disciplines suits students who want to connect classroom learning with a specific industry direction.', FALSE);

UPDATE universities AS university
SET name = profile.name_en,
    name_zh = profile.name_zh,
    name_en = profile.name_en,
    city_zh = profile.city_zh,
    city_en = profile.city_en,
    description_zh = profile.description_zh,
    description_en = profile.description_en,
    country = 'Malaysia',
    country_id = country.id,
    popular = profile.popular,
    updated_at = CURRENT_TIMESTAMP
FROM reviewed_university_profiles AS profile
JOIN countries AS country ON country.code = 'MY'
WHERE university.slug = profile.slug;

CREATE TABLE university_profile_sections (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    university_id BIGINT NOT NULL,
    section_type VARCHAR(32) NOT NULL,
    title_zh VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    body_zh TEXT NOT NULL,
    body_en TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_university_profile_sections_university FOREIGN KEY (university_id)
        REFERENCES universities (id) ON DELETE CASCADE,
    CONSTRAINT uk_university_profile_sections_type UNIQUE (university_id, section_type),
    CONSTRAINT ck_university_profile_sections_type CHECK (section_type IN (
        'INSTITUTION_TYPE', 'POPULAR_SUBJECTS', 'INTAKES', 'TUITION', 'RANKING',
        'ACADEMIC_REQUIREMENTS', 'LANGUAGE_REQUIREMENTS'
    )),
    CONSTRAINT ck_university_profile_sections_sort_order CHECK (sort_order >= 0),
    CONSTRAINT ck_university_profile_sections_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_university_profile_sections_public
    ON university_profile_sections (university_id, status, sort_order, id);

CREATE TEMP TABLE reviewed_university_sections (
    slug VARCHAR(200) NOT NULL,
    section_type VARCHAR(32) NOT NULL,
    title_zh VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    body_zh TEXT NOT NULL,
    body_en TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    PRIMARY KEY (slug, section_type)
) ON COMMIT DROP;

INSERT INTO reviewed_university_sections (
    slug, section_type, title_zh, title_en, body_zh, body_en, sort_order
) VALUES
    ('um', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('um', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '工程 · 商业 · 医学', 'Engineering · Business · Medicine', '20'),
    ('um', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('um', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('um', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: #56', 'QS World 2027: #56', '50'),
    ('um', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('um', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('ukm', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('ukm', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '医学 · 工程 · 社会科学', 'Medicine · Engineering · Social sciences', '20'),
    ('ukm', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('ukm', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('ukm', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: #130', 'QS World 2027: #130', '50'),
    ('ukm', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('ukm', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('utm', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('utm', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '工程 · 计算机 · 建筑', 'Engineering · Computing · Architecture', '20'),
    ('utm', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('utm', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('utm', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: =158', 'QS World 2027: =158', '50'),
    ('utm', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('utm', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('upm', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('upm', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '农业 · 兽医学 · 商业', 'Agriculture · Veterinary science · Business', '20'),
    ('upm', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('upm', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('upm', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: #138', 'QS World 2027: #138', '50'),
    ('upm', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('upm', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('usm', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('usm', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '科学 · 药剂学 · 工程', 'Science · Pharmacy · Engineering', '20'),
    ('usm', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('usm', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('usm', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: =128', 'QS World 2027: =128', '50'),
    ('usm', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('usm', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('uum', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '公立大学', 'Public university', '10'),
    ('uum', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '管理 · 会计 · 公共管理', 'Management · Accounting · Public administration', '20'),
    ('uum', 'INTAKES', '入学时间', 'Intakes', '主要年度入学，部分研究生课程有不同安排', 'Main annual intake; postgraduate schedules may vary', '30'),
    ('uum', 'TUITION', '学费说明', 'Tuition guidance', '公立大学学费按课程及学生身份而定，请索取最新费用表', 'Public university fees vary by programme and student status; request the current fee schedule', '40'),
    ('uum', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('uum', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('uum', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('taylor', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('taylor', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '酒店管理 · 商业 · 设计', 'Hospitality · Business · Design', '20'),
    ('taylor', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('taylor', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('taylor', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: #272', 'QS World 2027: #272', '50'),
    ('taylor', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('taylor', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('ucsi', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('ucsi', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '音乐 · 药剂学 · 工程', 'Music · Pharmacy · Engineering', '20'),
    ('ucsi', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('ucsi', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('ucsi', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: #282', 'QS World 2027: #282', '50'),
    ('ucsi', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('ucsi', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('inti', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('inti', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '商业 · 计算机 · 工程', 'Business · Computing · Engineering', '20'),
    ('inti', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('inti', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('inti', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: =406', 'QS World 2027: =406', '50'),
    ('inti', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('inti', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('sunway', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('sunway', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '商业 · 酒店管理 · 心理学', 'Business · Hospitality · Psychology', '20'),
    ('sunway', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('sunway', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('sunway', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: =354', 'QS World 2027: =354', '50'),
    ('sunway', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('sunway', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('apu', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('apu', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '计算机 · 网络安全 · 商业', 'Computing · Cybersecurity · Business', '20'),
    ('apu', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('apu', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('apu', 'RANKING', '排名参考', 'Ranking reference', 'QS World 2027: =528', 'QS World 2027: =528', '50'),
    ('apu', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('apu', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('segi', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('segi', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '商业 · 健康科学 · 教育', 'Business · Health sciences · Education', '20'),
    ('segi', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('segi', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('segi', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('segi', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('segi', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('utar', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('utar', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '工程 · 商业 · 医学', 'Engineering · Business · Medicine', '20'),
    ('utar', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('utar', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('utar', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('utar', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('utar', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('city', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('city', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '商业 · 信息技术 · 设计', 'Business · Information technology · Design', '20'),
    ('city', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('city', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('city', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('city', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('city', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('monash', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '海外大学马来西亚分校', 'International branch campus', '10'),
    ('monash', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '医学 · 工程 · 商业', 'Medicine · Engineering · Business', '20'),
    ('monash', 'INTAKES', '入学时间', 'Intakes', '通常有多个入学月份，视课程而定', 'Several intake periods, depending on programme', '30'),
    ('monash', 'TUITION', '学费说明', 'Tuition guidance', '分校学费按课程及入学时间而定，请索取最新费用表', 'Branch-campus tuition varies by programme and intake; request the current fee schedule', '40'),
    ('monash', 'RANKING', '排名参考', 'Ranking reference', '请参考莫纳什大学全球排名', 'Refer to Monash University''s global ranking', '50'),
    ('monash', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('monash', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('nottingham', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '海外大学马来西亚分校', 'International branch campus', '10'),
    ('nottingham', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '工程 · 商业 · 药剂学', 'Engineering · Business · Pharmacy', '20'),
    ('nottingham', 'INTAKES', '入学时间', 'Intakes', '通常有多个入学月份，视课程而定', 'Several intake periods, depending on programme', '30'),
    ('nottingham', 'TUITION', '学费说明', 'Tuition guidance', '分校学费按课程及入学时间而定，请索取最新费用表', 'Branch-campus tuition varies by programme and intake; request the current fee schedule', '40'),
    ('nottingham', 'RANKING', '排名参考', 'Ranking reference', '请参考诺丁汉大学全球排名', 'Refer to the University of Nottingham''s global ranking', '50'),
    ('nottingham', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('nottingham', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('southampton', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '海外大学马来西亚分校', 'International branch campus', '10'),
    ('southampton', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '工程 · 计算机 · 商业', 'Engineering · Computing · Business', '20'),
    ('southampton', 'INTAKES', '入学时间', 'Intakes', '通常有多个入学月份，视课程而定', 'Several intake periods, depending on programme', '30'),
    ('southampton', 'TUITION', '学费说明', 'Tuition guidance', '分校学费按课程及入学时间而定，请索取最新费用表', 'Branch-campus tuition varies by programme and intake; request the current fee schedule', '40'),
    ('southampton', 'RANKING', '排名参考', 'Ranking reference', '请参考南安普顿大学全球排名', 'Refer to the University of Southampton''s global ranking', '50'),
    ('southampton', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('southampton', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('help', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('help', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '商业 · 心理学 · 法律', 'Business · Psychology · Law', '20'),
    ('help', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('help', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('help', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('help', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('help', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('mahsa', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('mahsa', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '医学 · 牙科 · 药剂学', 'Medicine · Dentistry · Pharmacy', '20'),
    ('mahsa', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('mahsa', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('mahsa', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('mahsa', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('mahsa', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70'),
    ('nilai', 'INSTITUTION_TYPE', '院校类型', 'Institution type', '私立大学', 'Private university', '10'),
    ('nilai', 'POPULAR_SUBJECTS', '优势学科', 'Popular subjects', '航空 · 商业 · 酒店管理', 'Aviation · Business · Hospitality', '20'),
    ('nilai', 'INTAKES', '入学时间', 'Intakes', '每年多次入学，视课程而定', 'Multiple intakes each year, depending on programme', '30'),
    ('nilai', 'TUITION', '学费说明', 'Tuition guidance', '私立大学学费按课程及入学时间而定，请索取最新费用表', 'Private tuition varies by programme and intake; request the current fee schedule', '40'),
    ('nilai', 'RANKING', '排名参考', 'Ranking reference', '最新排名资料正在审核', 'Latest ranking information under review', '50'),
    ('nilai', 'ACADEMIC_REQUIREMENTS', '学术要求', 'Academic requirements', '按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理', 'Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled', '60'),
    ('nilai', 'LANGUAGE_REQUIREMENTS', '语言要求', 'Language requirements', '英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理', 'English requirements vary by programme; accepted IELTS or equivalent scores are being compiled', '70');

INSERT INTO university_profile_sections (
    university_id, section_type, title_zh, title_en, body_zh, body_en, sort_order, status
)
SELECT university.id, section.section_type, section.title_zh, section.title_en,
       section.body_zh, section.body_en, section.sort_order, 'PUBLISHED'
FROM reviewed_university_sections AS section
JOIN universities AS university ON university.slug = section.slug
ON CONFLICT (university_id, section_type) DO UPDATE
SET title_zh = EXCLUDED.title_zh,
    title_en = EXCLUDED.title_en,
    body_zh = EXCLUDED.body_zh,
    body_en = EXCLUDED.body_en,
    sort_order = EXCLUDED.sort_order,
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP;

CREATE TEMP TABLE reviewed_university_media (
    slug VARCHAR(200) PRIMARY KEY,
    asset_url VARCHAR(2000) NOT NULL,
    source_url VARCHAR(2000) NOT NULL,
    licence_raw VARCHAR(500) NOT NULL
) ON COMMIT DROP;

INSERT INTO reviewed_university_media (slug, asset_url, source_url, licence_raw) VALUES
    ('um', 'https://yangdoujiao.com/universities/campuses/um-modern-campus.webp', 'https://yangdoujiao.com/universities/campuses/um-modern-campus.webp', 'Reviewed project campus asset'),
    ('taylor', 'https://yangdoujiao.com/universities/campuses/taylors-campus.webp', 'https://university.taylors.edu.my/en/discover-us/about-taylors/leaderships-and-governance.html', 'Taylor''s University campus'),
    ('ucsi', 'https://yangdoujiao.com/universities/campuses/ucsi-campus.webp', 'https://yangdoujiao.com/universities/campuses/ucsi-campus.webp', 'Reviewed project campus asset'),
    ('inti', 'https://yangdoujiao.com/universities/campuses/inti-campus.webp', 'https://yangdoujiao.com/universities/campuses/inti-campus.webp', 'Reviewed project campus asset'),
    ('sunway', 'https://yangdoujiao.com/universities/campuses/sunway-campus.webp', 'https://yangdoujiao.com/universities/campuses/sunway-campus.webp', 'Reviewed project campus asset'),
    ('apu', 'https://yangdoujiao.com/universities/campuses/apu-campus.webp', 'https://apu.edu.my/node/514', 'APU official campus guide'),
    ('segi', 'https://yangdoujiao.com/universities/campuses/segi-campus.webp', 'https://yangdoujiao.com/universities/campuses/segi-campus.webp', 'Reviewed project campus asset'),
    ('utar', 'https://yangdoujiao.com/universities/campuses/utar-campus.webp', 'https://yangdoujiao.com/universities/campuses/utar-campus.webp', 'Reviewed project campus asset'),
    ('monash', 'https://yangdoujiao.com/universities/campuses/monash-campus.webp', 'https://yangdoujiao.com/universities/campuses/monash-campus.webp', 'Reviewed project campus asset'),
    ('nottingham', 'https://yangdoujiao.com/universities/campuses/nottingham-campus.webp', 'https://yangdoujiao.com/universities/campuses/nottingham-campus.webp', 'Reviewed project campus asset'),
    ('southampton', 'https://yangdoujiao.com/universities/campuses/southampton-campus.webp', 'https://yangdoujiao.com/universities/campuses/southampton-campus.webp', 'Reviewed project campus asset'),
    ('help', 'https://yangdoujiao.com/universities/campuses/help-campus.webp', 'https://yangdoujiao.com/universities/campuses/help-campus.webp', 'Reviewed project campus asset'),
    ('nilai', 'https://yangdoujiao.com/universities/campuses/nilai-campus.webp', 'https://yangdoujiao.com/universities/campuses/nilai-campus.webp', 'Reviewed project campus asset');

INSERT INTO university_media (
    university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order
)
SELECT university.id, 'UNIVERSITY_IMAGE', media.asset_url, media.source_url,
       CURRENT_TIMESTAMP, media.licence_raw, 'PUBLISHED', 0
FROM reviewed_university_media AS media
JOIN universities AS university ON university.slug = media.slug
ON CONFLICT (university_id, kind, asset_url) DO UPDATE
SET source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    licence_raw = EXCLUDED.licence_raw,
    status = 'PUBLISHED',
    sort_order = 0,
    updated_at = CURRENT_TIMESTAMP;

-- Direct SQL imports do not emit application events. Reconcile every university so
-- published database records and the Elasticsearch directory cannot drift apart.
INSERT INTO search_sync_jobs (
    university_id, status, attempt_count, available_at, created_at, updated_at
)
SELECT id, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM universities;
