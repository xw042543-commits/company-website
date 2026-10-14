-- Align AI-generated career and curriculum guidance with the qualification level.
-- Verified official and third-party material is deliberately excluded.

WITH target AS (
    SELECT section.id, study_level.code AS level_code, programme.name_zh, programme.name_en
    FROM programme_detail_sections section
    JOIN programmes programme ON programme.id = section.programme_id
    JOIN study_levels study_level ON study_level.id = programme.study_level_id
    WHERE programme.status = 'PUBLISHED'
      AND section.status = 'PUBLISHED'
      AND section.section_type = 'CAREER_OPPORTUNITIES'
      AND section.source_type = 'ai_generated'
      AND study_level.code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT|DIPLOMA|MASTER|POSTGRAD|PHD|DOCTOR'
)
UPDATE programme_detail_sections section
SET body_zh = CASE
      WHEN target.level_code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT' THEN
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(section.body_zh,
                '^[^\n]*行业应用：', '衔接领域：'),
              '具体就业岗位：[^\n\r]*',
              '发展路径：该层次主要用于衔接本科或其他高等教育阶段，不把完成预科或证书课程直接表述为取得特定职业资格。'),
            '深造方向：[^\n\r]*',
            '后续升学方向：可根据成绩、先修科目和院校要求申请相关本科或专业教育；具体衔接范围以院校官方规定为准。'),
          '职业说明：[^\n\r]*',
          '发展说明：升学结果取决于个人成绩、语言能力、先修科目及目标院校要求，不构成录取或就业承诺。')
      WHEN target.level_code ~* 'PHD|DOCTOR' THEN
        regexp_replace(
          regexp_replace(section.body_zh,
            '具体就业岗位：[^\n\r]*',
            '具体发展岗位：可关注与本研究领域相关的研究、教学、高级专业、政策研究或技术领导岗位；具体准入要求以用人单位、当地法规和专业认证为准。'),
          '深造方向：[^\n\r]*',
          '后续发展方向：博士后研究、跨学科研究、学术教学、研究管理或专业领域的高级实践。')
      WHEN target.level_code ~* 'MASTER|POSTGRAD' THEN
        regexp_replace(
          regexp_replace(section.body_zh,
            '具体就业岗位：[^\n\r]*',
            '具体发展岗位：可关注与本专业相关的高级专业岗位、项目管理、咨询、研究支持或专业实践岗位；具体准入要求以用人单位、当地法规和专业认证为准。'),
          '深造方向：[^\n\r]*',
          '后续深造方向：博士研究、跨学科研究或与本领域相关的高级专业资格。')
      WHEN target.level_code ~* 'DIPLOMA' THEN
        regexp_replace(
          regexp_replace(section.body_zh,
            '具体就业岗位：[^\n\r]*',
            '具体就业岗位：可关注与本专业相关的初级专业支持、技术助理、运营执行或项目支持岗位；具体准入要求以用人单位、当地法规和专业认证为准。'),
          '深造方向：[^\n\r]*',
          '后续深造方向：相关本科、衔接课程或适用的职业资格；学分减免和衔接年级以院校官方评估为准。')
      ELSE section.body_zh
    END,
    body_en = CASE
      WHEN target.level_code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT' THEN
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(section.body_en,
                '^[^\n]*Industry applications:', 'Progression fields:'),
              'Potential roles:[^\n\r]*',
              'Progression path: This level primarily prepares students for a bachelor degree or other higher education and is not presented as direct eligibility for a specific profession.'),
            'Further study:[^\n\r]*',
            'Further study: Subject to grades, prerequisites and university rules, students may apply to a related bachelor or professional programme; consult the university for confirmed progression routes.'),
          'Career note:[^\n\r]*',
          'Progression note: Outcomes depend on grades, language proficiency, prerequisites and the target university requirements; no admission or employment outcome is guaranteed.')
      WHEN target.level_code ~* 'PHD|DOCTOR' THEN
        regexp_replace(
          regexp_replace(section.body_en,
            'Potential roles:[^\n\r]*',
            'Potential pathways: research, teaching, senior professional, policy-research or technical-leadership roles related to the research field, subject to employer, regulatory and accreditation requirements.'),
          'Further study:[^\n\r]*',
          'Further development: postdoctoral research, interdisciplinary research, academic teaching, research management or advanced professional practice.')
      WHEN target.level_code ~* 'MASTER|POSTGRAD' THEN
        regexp_replace(
          regexp_replace(section.body_en,
            'Potential roles:[^\n\r]*',
            'Potential pathways: advanced professional, project-management, consulting, research-support or professional-practice roles related to the field, subject to employer, regulatory and accreditation requirements.'),
          'Further study:[^\n\r]*',
          'Further study: doctoral research, interdisciplinary research or advanced professional qualifications related to the field.')
      WHEN target.level_code ~* 'DIPLOMA' THEN
        regexp_replace(
          regexp_replace(section.body_en,
            'Potential roles:[^\n\r]*',
            'Potential roles: entry-level professional support, technical assistant, operations or project-support roles related to the field, subject to employer, regulatory and accreditation requirements.'),
          'Further study:[^\n\r]*',
          'Further study: a related bachelor degree, progression programme or applicable professional qualification; credit transfer and entry level require official university assessment.')
      ELSE section.body_en
    END,
    updated_at = CURRENT_TIMESTAMP
FROM target
WHERE section.id = target.id;

WITH target AS (
    SELECT section.id, study_level.code AS level_code
    FROM programme_detail_sections section
    JOIN programmes programme ON programme.id = section.programme_id
    JOIN study_levels study_level ON study_level.id = programme.study_level_id
    WHERE programme.status = 'PUBLISHED'
      AND section.status = 'PUBLISHED'
      AND section.section_type = 'CURRICULUM'
      AND section.source_type = 'ai_generated'
      AND study_level.code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT|MASTER|POSTGRAD|PHD|DOCTOR'
)
UPDATE programme_detail_sections section
SET body_zh = CASE
      WHEN target.level_code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT' THEN E'参考学习领域，非官方课程表\n01|学术英语与沟通|Academic English and Communication\n02|定量方法基础|Foundations of Quantitative Methods\n03|学科基础概念|Foundational Disciplinary Concepts\n04|数字化学习技能|Digital Study Skills\n05|调查与研究入门|Introduction to Inquiry and Research\n06|跨学科学习项目|Interdisciplinary Learning Project\n说明：以上为该层次可能涉及的通用学习领域，不是院校官方课程名称、学分、必修或选修安排；请以院校最新官方教学大纲为准。'
      WHEN target.level_code ~* 'PHD|DOCTOR' THEN E'参考学习领域，非官方课程表\n01|高级理论研讨|Advanced Theoretical Seminar\n02|系统文献综述|Systematic Literature Review\n03|研究设计与论证|Research Design and Argumentation\n04|高级数据或质性方法|Advanced Quantitative or Qualitative Methods\n05|研究伦理与学术传播|Research Ethics and Scholarly Communication\n06|博士研究与学位论文|Doctoral Research and Dissertation\n说明：以上为研究型博士阶段常见的学术活动领域，不是院校官方课程名称、学分、必修或选修安排；请以院校最新官方培养方案为准。'
      WHEN target.level_code ~* 'MASTER|POSTGRAD' THEN E'参考学习领域，非官方课程表\n01|专业高级理论|Advanced Theory in the Discipline\n02|研究设计与方法|Research Design and Methods\n03|定量与质性分析|Quantitative and Qualitative Analysis\n04|专业前沿专题|Contemporary Topics in the Discipline\n05|专业实践与伦理|Professional Practice and Ethics\n06|综合项目或学位论文|Capstone Project or Dissertation\n说明：以上为硕士阶段可能涉及的通用学习领域，不是院校官方课程名称、学分、必修或选修安排；请以院校最新官方教学大纲为准。'
      ELSE section.body_zh
    END,
    body_en = CASE
      WHEN target.level_code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT' THEN E'Illustrative study areas, not an official module list\n01|Academic English and Communication|学术英语与沟通\n02|Foundations of Quantitative Methods|定量方法基础\n03|Foundational Disciplinary Concepts|学科基础概念\n04|Digital Study Skills|数字化学习技能\n05|Introduction to Inquiry and Research|调查与研究入门\n06|Interdisciplinary Learning Project|跨学科学习项目\nNote: These are general areas often associated with this level, not official module names, credits or compulsory/elective arrangements. Refer to the university current official syllabus.'
      WHEN target.level_code ~* 'PHD|DOCTOR' THEN E'Illustrative study areas, not an official module list\n01|Advanced Theoretical Seminar|高级理论研讨\n02|Systematic Literature Review|系统文献综述\n03|Research Design and Argumentation|研究设计与论证\n04|Advanced Quantitative or Qualitative Methods|高级数据或质性方法\n05|Research Ethics and Scholarly Communication|研究伦理与学术传播\n06|Doctoral Research and Dissertation|博士研究与学位论文\nNote: These are common areas of doctoral academic activity, not official module names, credits or compulsory/elective arrangements. Refer to the university current official research programme requirements.'
      WHEN target.level_code ~* 'MASTER|POSTGRAD' THEN E'Illustrative study areas, not an official module list\n01|Advanced Theory in the Discipline|专业高级理论\n02|Research Design and Methods|研究设计与方法\n03|Quantitative and Qualitative Analysis|定量与质性分析\n04|Contemporary Topics in the Discipline|专业前沿专题\n05|Professional Practice and Ethics|专业实践与伦理\n06|Capstone Project or Dissertation|综合项目或学位论文\nNote: These are general areas often associated with master-level study, not official module names, credits or compulsory/elective arrangements. Refer to the university current official syllabus.'
      ELSE section.body_en
    END,
    updated_at = CURRENT_TIMESTAMP
FROM target
WHERE section.id = target.id;
