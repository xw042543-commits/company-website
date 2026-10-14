-- Generated from official Taylor's University pages captured by the reviewed crawler.
-- This migration fills blank fields and replaces only unsourced generated detail sections.
CREATE TEMP TABLE official_taylor_programme_updates (
  programme_code varchar(64) PRIMARY KEY, name_en varchar(200), description_en text,
  duration_months integer, duration_display varchar(100), tuition_min numeric(14,2),
  tuition_max numeric(14,2), tuition_currency char(3), tuition_display varchar(200),
  official_url varchar(1000) NOT NULL, source_checked_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO official_taylor_programme_updates VALUES
    ('TAYLOR_BACHELOR_026', 'Bachelor of Science (Honours) in Architecture', 'Learn from highly qualified practising architects and gain industry-focused skills to tackle global challenges through Taylor''s accredited architecture degree.', NULL, 'P3Y', 43845, 43845, 'USD', 'USD 43,845 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_028', 'Bachelor of Quantity Surveying (Honours)', 'Develop a strong foundation in cost management in construction and measurement of building elements with Taylor''s accredited Bachelor of Quantity Surveying.', NULL, 'P3Y6M', 35259, 35259, 'USD', 'USD 35,259 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_025', 'Bachelor of Science (Honours) in Sustainable Digital Construction Management', 'Become a construction professional that''s equipped with the knowledge and competencies aligned to the digital transformation within the built environment.', NULL, 'P3Y', 35199, 35199, 'USD', 'USD 35,199 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_032', 'Bachelor of Biomedical Science (Honours)', 'Get exposed to updates in the medicine, health sciences and biomedical science research fields with Taylor''s Bachelor of Biomedical Science (Honours).', NULL, 'P3Y6M', 45176, 45176, 'USD', 'USD 45,176 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_030', 'Bachelor of Food Science (Honours)', 'Learn the science and technology of food processing, preservation and nutrition with Taylor''s Bachelor of Food Science enriched by strong industry partnerships.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_031', 'Bachelor of Biotechnology (Honours)', 'Gain a comprehensive education & training in biotechnology focusing on agriculture, healthcare and industrial with Taylor''s Bachelor in Biotechnology.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_020', 'Bachelor of Patisserie Arts (Honours)', 'Study Patisserie Arts through a degree that incorporates professional pastry and baking skills, techniques, and technology relevant to today’s industry.', NULL, 'P3Y', 37579, 37579, 'USD', 'USD 37,579 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_019', 'Bachelor of Science (Honours) in Culinology', 'Strengthen R&D skills, master kitchen practices, and acquire real-life experience through a hands-on internship from Taylor''s immersive culinology programme.', NULL, 'P3Y', 41314, 41314, 'USD', 'USD 41,314 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_016', 'Bachelor of Culinary Management (Honours)', 'Gain culinary expertise and take place as a leader in the global food and beverage industries with Taylor''s degree in culinary arts and food service management.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_035', 'Bachelor of Mass Communication (Honours) in Advertising and Brand Management', 'Delve into the world of advertising creative strategy and brand management, gaining the expertise required to meet the challenging and growing market demands.', NULL, 'P3Y', 39748, 39748, 'USD', 'USD 39,748 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_037', 'Bachelor of Mass Communication (Honours) (Digital Media Production)', 'Gain first-hand experience in all aspects of production - including shooting, audio recording, editing, writing, directing and producing digital films.', NULL, 'P3Y', 39748, 39748, 'USD', 'USD 39,748 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_010', 'Bachelor of Computer Science (Honours)', 'Learn to design, develop, and maintain diverse computer applications with Taylor''s bachelor''s degree in Computer Science, Malaysia, blending science & practice.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_009', 'Bachelor of Software Engineering (Honours)', 'Taylor''s Bachelor of Software Engineering degree equips students with the skills and practical exposure to develop and maintain advanced systems and software.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_011', 'Bachelor of Information Technology (Honours)', 'Taylor''s Bachelor of Information Technology teaches students to apply Internet technologies to solve real-world problems and improve organisational processes.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_014', 'Bachelor in Interactive Spatial Design (Honours)', 'Learn foundations of spatial design with interactive technology and smart automation for interior and exterior environments, through immersive experiences.', NULL, 'P3Y', 38392, 38392, 'USD', 'USD 38,392 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_013', 'Bachelor of Fashion Design Technology (Honours)', 'Use the latest design technology & equipment in a course co-directed by the KL Fashion Week founder. Get exposure at Malaysia''s 1st co-working fashion studio.', NULL, 'P3Y', 38269, 38269, 'USD', 'USD 38,269 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_012', 'Bachelor of Design (Honours) in Creative Media', 'Study creative media with the option to specialise in Graphic Design, UI/UX, Digital Animation and Entertainment Design at a globally top-ranked design school.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_040', 'Bachelor of Education (Honours)', 'Gain practical knowledge and skills to teach early childhood, primary school, special educational needs, and more with Taylor''s Bachelor of Education degree.', NULL, 'P3Y', 35158, 35158, 'USD', 'USD 35,158 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_022', 'Bachelor of Chemical Engineering (Honours)', 'Taylor’s Bachelor of Chemical Engineering programme is designed to offer students with a strong grasp of the theories and concepts of chemical engineering.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_021', 'Bachelor of Electrical and Electronic Engineering with Honours', 'With Taylor’s Electrical & Electronic Engineering programme, you will gain a comprehensive understanding of electrical and electronic engineering principles.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_023', 'Bachelor of Mechanical Engineering with Honours', 'Navigate challenges and design systems in automotive, power generation, aerospace, and manufacturing industries with Taylor''s mechanical engineering degree.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_015', 'Bachelor of International Hospitality Management (Honours)', 'The Bachelor of International Hospitality Management programme will prepare our graduates for a successful future in the dynamic global hospitality industry.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_018', 'Bachelor of International Events Management (Honours)', 'Gear towards being a professional with a bachelor of event management. Gain managerial skills to lead the global event, tourism and recreation industries.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_017', 'Bachelor of International Tourism Management (Honours)', 'Get a deeper understanding of international affairs, get exposed to emerging trends, and prepare to enter the dynamic industry with Taylor''s hospitality degree.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_029', 'Bachelor of Laws (Honours)', 'Experience practical and realistic simulated court environments and learn Malaysian and English law fundamentals of legal systems through the bachelor of law.', 36, 'P3Y', 42911, 42911, 'USD', 'USD 42,911 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_043', 'Bachelor of Performing Arts (Honours)', 'Taylor''s, The Actors Studio, and industry experts bring you Malaysia''s 1st Performing Arts conservatory programme, with Performance, Music, and Dance tracks.', NULL, 'P3Y', 35319, 35319, 'USD', 'USD 35,319 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_041', 'Bachelor of Psychology (Honours)', 'Through Taylor''s Bachelor of Psychology, learn from industry experts about sociology, philosophy, ethics, and more while enjoying global exposure opportunities.', NULL, 'P3Y', 36886, 36886, 'USD', 'USD 36,886 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_034', 'Bachelor of Pharmacy (Honours)', 'Study a pharmacy degree in Malaysia at Taylor’s University and gain a strong foundation in pharmaceutical sciences and professional practice.', NULL, 'P4Y', 61758, 61758, 'USD', 'USD 61,758 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_033', 'Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'Gain hands-on experience with patients in clinical and healthcare disciplines at Taylor''s Bachelor of Medicine and Bachelor of Surgery (MBBS) degree programme.', NULL, 'P5Y', 134937, 134937, 'USD', 'USD 134,937 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z');

DO $$ BEGIN
  IF (SELECT COUNT(*) FROM official_taylor_programme_updates) <> 29 THEN
    RAISE EXCEPTION 'Unexpected official programme update count';
  END IF;
  IF (SELECT COUNT(*) FROM official_taylor_programme_updates f JOIN programmes p ON p.programme_code=f.programme_code JOIN universities u ON u.id=p.university_id WHERE u.slug='taylor') <> 29 THEN
    RAISE EXCEPTION 'Not every official programme update matched taylor';
  END IF;
END $$;

UPDATE programmes p SET
  name_en = COALESCE(NULLIF(BTRIM(p.name_en), ''), f.name_en),
  description_zh = CASE WHEN p.description_en LIKE '%Exact modules, credits and assessment methods are determined by the university’s current official syllabus.' THEN NULL ELSE p.description_zh END,
  description_en = CASE WHEN NULLIF(BTRIM(p.description_en), '') IS NULL OR p.description_en LIKE '%Exact modules, credits and assessment methods are determined by the university’s current official syllabus.' THEN f.description_en ELSE p.description_en END,
  duration_months = CASE WHEN p.duration_months IS NULL AND NULLIF(BTRIM(p.duration_display), '') IS NULL THEN f.duration_months ELSE p.duration_months END,
  duration_display = CASE WHEN p.duration_months IS NULL AND NULLIF(BTRIM(p.duration_display), '') IS NULL THEN f.duration_display ELSE p.duration_display END,
  tuition_min = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_min ELSE p.tuition_min END,
  tuition_max = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_max ELSE p.tuition_max END,
  tuition_currency = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_currency ELSE p.tuition_currency END,
  tuition_display = CASE WHEN p.tuition_min IS NULL AND p.tuition_max IS NULL AND NULLIF(BTRIM(p.tuition_display), '') IS NULL THEN f.tuition_display ELSE p.tuition_display END,
  official_url = COALESCE(NULLIF(BTRIM(p.official_url), ''), f.official_url),
  source_checked_at = GREATEST(COALESCE(p.source_checked_at, f.source_checked_at), f.source_checked_at),
  updated_at = CURRENT_TIMESTAMP
FROM official_taylor_programme_updates f, universities u
WHERE p.programme_code=f.programme_code AND p.university_id=u.id AND u.slug='taylor';

CREATE TEMP TABLE official_taylor_programme_sections (
  programme_code varchar(64), section_type varchar(40), title_en varchar(200), body_en text,
  source_url varchar(1000), source_checked_at timestamptz, PRIMARY KEY(programme_code, section_type)
) ON COMMIT DROP;

INSERT INTO official_taylor_programme_sections VALUES
    ('TAYLOR_BACHELOR_026', 'ADMISSIONS', 'Entry Requirements', 'Ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Architecture. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-level or equivalent
A pass in SPM/O-level or equivalent with 5 credits, including Mathematics.
(Except for UEC)
Pass an Interview and Aptitude Assessment (AA)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 70
A Level
Min. CDD excluding General Paper or studies in student’s first language
Note: any combination of grade but not lower than Grade D
Canadian Pre-University (CPU)
Min. average of 65% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CGPA 2.67 in 3 subjects
Unified Examination Certificate (UEC)
Pass in UEC with Min. 5Bs including Mathematics
(Note: Candidates without a Grade ‘B’ in Mathematics subject may be admitted if the candidate has a credit in Mathematic subject at SPM or equivalent level)
Taylor''s Foundation in Design (FID)
Pass with min. CGPA 2.00
Taylor''s Foundation in Natural and Built Environments (FNBE)
Pass with min. CGPA 2.00 (not subject to interview and AA)
Other Taylor''s Foundation in related field
Pass with min. CGPA 2.00
Taylor''s Diploma
Pass with min. CGPA 2.67
International Baccalaureate (IB)
Min. 28 points and above based on 6 subjects
Monash University Foundation Year (MUFY)
Overall 60%
Foundation in related field from other institution recognised by Malaysian Government
Pass with CGPA 2.00
Diploma from other institution recognised by Malaysian Government
Pass with CGPA 2.67
Other foundation, matriculation, high school certificates from other institution recognised by Malaysian Government
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 6.0
TOEFL
60 (Internet Based Test)
MUET
Band 4
UEC English
B4
O level
Grade C
1119 (GCE-O)
Grade B
Taylor’s EET
Overall Score 6.0
Taylor’s IEN
Level 2- Grade B
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.5 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_026', 'CURRICULUM', 'Programme Structure', 'Explore Taylor''s industry-focused curriculum, designed to equip you with robust skills for thriving in today''s rapidly changing environment. Below is an overview of what you can expect from this programme''s structure.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Architectural Design I
Architecture History and Theory
Design Communication
Architectural Design II
Asian Architecture
Building Construction and Materials
Architecture and Environment
Year 2
Architectural Design III
Computer Applications
Architectural Design IV
Building Services
Year 3
Architectural Design V
Advanced Architectural Construction
Architectural Design Project
Architectural Project Management
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. It consists of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Extensions
You will need to choose one of the below:
Option 1: Heritage and Conservation
Option 2: Sustainable Design
The extensions offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any one (1) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_026', 'CAREER_OPPORTUNITIES', 'Future Careers', 'Once you’ve successfully completed this Bachelor of Science in Architecture programme, you could embark on any of these exciting careers as an architecture graduate, including:
Architectural Model Specialist
Architectural Photographer
Architectural Structure Specialist
Computer-Aided Design / 3D Visualiser
Interior Designer / Interior Architect
Resort / Hotel Architectural Conceptualiser
Theme Park Conceptual Architect
Town Planning Conceptual Architect', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_028', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Quantity Surveying. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
A pass in SPM/O-level or equivalent with 5 credits, including Mathematics, for students from Foundation programmes.
A pass in SPM/O-Level or equivalent with 3 credits including Mathematics for students from Pre-U (CPU, STPM, UEC, IB or equivalent from other institutions) and Diploma qualifications.
A Pass in Mathematics at a higher level can be used to replace the prerequisite Credit in Mathematics in SPM/O-Level/or equivalent.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 65
A Level
Min. DDD
Canadian Pre-University (CPU)
Min. average of 65% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CGPA 2.00 for 3 subjects
Unified Examination Certificate (UEC)
Pass with Min. 5Bs including Mathematics or Advanced Mathematics or Advanced Mathematics 1 or Advanced Mathematics 2
(Note: Candidates without a Grade ‘B’ in the subjects above may be admitted if the candidate has a credit in Mathematic subject at SPM or equivalent level)
Taylor''s Foundation in Natural and Built Environments (FNBE)
Pass with min. CGPA 2.50 (not subject to AA)
Taylor''s Foundation in Design (FID)
Pass with min. CGPA 2.50
Other Taylor''s Foundation
Other Taylor''s Foundation in related field (Demonstrated numerical proficiency in Mathematics, Accounting, Principles of Economics or Statistics) with min CGPA 2.50
Taylor''s Diploma
Pass with min. CGPA 2.67
International Baccalaureate Diploma Programme (IBDP)
Min. 24 points and above based on 6 subjects
Monash University Foundation Year (MUFY)
Overall 60%
Foundation in related field from other institution recognised by Malaysian Government
Pass with CGPA 2.50 (demonstrated numerical proficiency in Mathematics, Accounting, Principles of Economics or Statistics)
Diploma from other institution recognised by Malaysian Government
Pass with CGPA 2.67
Other foundation, matriculation, high school certificates from other institution recognised by Malaysian Government
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 5.0
TOEFL
40 (Internet Based Test)
MUET
Band 3
UEC
English B6
O level
Grade C
1119 (GCE-O)
Grade C
Taylor’s EET
Overall Score 5.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.0 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_028', 'CURRICULUM', 'Programme Structure', 'In the Bachelor of Quantity Surveying (Hons) programme, the Common Core, University Core and Complementary Study components form the cornerstone of your education. These modules provide essential knowledge and skills that are fundamental to the discipline of Quantity Surveying.
Get ready to explore a range of exciting subjects designed to equip you with a comprehensive understanding of the industry.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides fundamental knowledge of the discipline.
Common Core
Year 1
Construction Technology I
Legal Studies
Environmental Science and Services
Fundamental Measurement & Costing
Construction Technology II
Building Services Technology
Year 2
Advanced Measurement
Construction Economics & Management
Construction Project Management
Measurement Of Building Works & Costing
Core Elective (Choose 1)
Procurement & Contract Administration
Year 3.5
Quantity Surveying Studio 2
Value Engineering and Management
Construction Law & Dispute Resolution
Construction Research Project II
Industrial Training and Report
Engineering Measurement
Professional Practice
Construction Research Project I
Quantity Surveying Studio 1
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. It consists of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Core Electives
Sustainable Housing Development
Construction Supply Chain Management
Strategic Management in Construction
Occupational Health and Safety Management
Facility Management
The electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_028', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this Bachelor of Quantity Surveying programme, you could embark on any of these exciting careers in the construction and civil engineering industries, including:
Building Material Manager
Building Surveyor
Construction Manager
Consultant Quantity Surveyor
Contractor Quantity Surveyor
Developer Quantity Surveyor
Geomatic & Land Surveyor
Mechanical & Electrical Quantity Surveyor
Property Management, Valuation & Estate Agency Surveyor', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_025', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Science (Honours) in Sustainable Digital Construction Management. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits including Science or Mathematics for entry with Pre-U/Foundation qualification.
(Except for UEC)
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits including Science or Mathematics for entry with Diploma qualification.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
ATAR 65%
A Level
Min. DD
Canadian Pre-University (CPU)
Min. 65% average in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
Pass with Grade CC in at least 2 subjects
Unified Examination Certificate (UEC)
A Pass in UEC with Min. 5 Bs including Science or Mathematics
(Note: Candidates without a Grade ‘B’ in Mathematics or Science subject may be admitted if the candidate has a credit in Mathematic or Science subject at SPM or equivalent level)
Taylor''s Foundation/Diploma
Pass any Taylor''s Foundation/Diploma programme with min CGPA 2.00
International Baccalaureate (IB)
Min 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Equivalent Qualification
Foundation from an institution recognised by the Malaysian Government with min. CGPA 2.00
Diploma from an institution recognised by the Malaysian Government with min. CGPA 2.00
MoE Matriculation with min. CGPA 2.00
Any other qualification recognised by the Malaysian govt.
Application via APEL A is allowed.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 5.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.0 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_025', 'CURRICULUM', 'Programme Structure', 'The Bachelor of Science (Honours) in Sustainable Digital Construction Management is multidisciplinary, collaborative and technology-driven and provides better opportunities for students'' successful careers in the ASEAN Economic Community industry. The programme is uniquely dedicated to developing construction project managers’ knowledge and expertise in sustainable construction by drawing upon subject expertise within the School of Architecture, Building and Design and other schools in Taylor’s University.  The programme focuses on challenges that the built environment faces today and the impact and importance of creating a resilient built environment and digitised construction project management.
It addresses critical global challenges by integrating contemporary construction management theory and practice with fundamental and interrelated sustainable design and construction theory and practice. The programme will expose students to multidisciplinary teamwork, focused on the integration of green and smart design, and construction processes across a building life cycle through collaborative practices emphasising the practical application of sustainability within the programme.
This degree programme is compatible with the Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Construction Management and Safety
Construction Technology I
Building Information Modelling I
Building Services
Construction Environmental Protection Management
Site Management
Construction Planning and Scheduling
Construction Technology II
Year 2
Construction Law and Dispute Resolution
Construction Measurement and Estimating
Cash Flow Management and Construction Economics
Construction Research Project I
Tendering Management and Contract Administration
Year 3
Internship
Construction Research Project II
Construction Quality Management / (WBL)
Industry Project I (WBL)
Industry Project II (WBL)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisations
Specialisations
You will need to choose one of the options below:
Green Construction
Internet of Things in Construction
Construction Simulation Project / (WBL)
Green Technology and Construction
Innovative Construction Materials
SMART Building Systems
Smart Construction
Internet of Things in Construction
Construction Simulation Project / (WBL)
Data Science Principles
Building Information Modelling II
Extended Reality in Construction
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. It consists of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_025', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Science (Honours) in Sustainable Digital Construction Management programme, you could embark on any of these exciting careers, including:
Construction Manager
Green Building Consultant
Green Building Facilitator
Building Performance Manager
Sustainability Consultant
Sustainability Manager
Sustainability Analyst
Green Building Project Manager
Sustainability Program Specialist
Sustainability Coordinator
Project Consultant Sustainability
Energy Project Manager
Communication Manager – Climate and Energy
Building Information Modeling (BIM) Manager
Smart Technologist
Construction Technical Writer
Business Development Manager
Design and Construction Manager
Technical Director
Building Information Modeling (BIM) Technician
Technical Coordinator
Information Manager
Digital Project Manager
Digital Technology Project Manager
Data Manager', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_032', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Biomedical Science. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / SPMV / O-Level or equivalent with 5 credits (Except for UEC)
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification.
Note :  All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation in Science (FIS)
Pass with min. CGPA 2.50 including GPA 2.33 in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CGPA 2.33 for 2 subjects including GPA 2.33 in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Unified Examination Certificate (UEC)
Pass with min. 5Bs including (ANY 2): Biology, Physics / Mathematics, Chemistry
A Level
Min. DD including min. D in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
AUSMAT (SACEi)
ATAR 60 with min. Grade C+ each in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects including 65% each in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
International Baccalaureate (IB)
Min. 24 points in 6 subjects including min. 5 points at Higher Level (HL) in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Matriculation in Science
Min. CGPA 2.33 for 3 subjects including (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
MUFY
Overall 55% including 65% each in (ANY 2) subjects: Biology, Physics/Mathematics, Chemistry
Other Qualifications
Students with other qualifications will be considered on a case-by-case basis. Application via APEL A is allowed.
Notes : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 5.5
MUET
Band 3
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS
Band 5.5
TOEFL iBT
46
PTE
51
Linguaskill
160
Pre-University / Foundation in Science
Completed Pre-University / Foundation in Science programme that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
Note :
- International students may join IEN Preparatory Course and achieve the IELTS score.
- All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_032', 'CURRICULUM', 'Programme Structure', 'The Bachelor of Biomedical Science (Honours) programme combines core biomedical knowledge with applicable skills. You will study:
Anatomy & Physiology
Pathology & Microbiology
Molecular Biology & Genetics
Pharmacology & Toxicology
Research & Laboratory Training
This balanced approach ensures you gain both scientific knowledge and the practical abilities needed for a career in biomedical science.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Basic Anatomy with Histology and Heamatology
Basic Pharmacology and Toxicology with Health Informatics
Introduction to Microbiology
Principles of Biochemistry
Human Physiology
Advanced Pharmacology
Clinical Chemistry
Human Pathology
Instrumentation in Medical Diagnostic, Laboratory Science and Blood Banking
Epidemiology, Public Health and Bioethics, Biostatistics
Year 2
Medical Parasitology
Medical Microbiology
Immunoloy
Applications of Bioinformatics
Clinical Genetics
Biomedical Practicum (Hospital Attachment module)
Year 3
Research and Laboratory Management
Research Project
Nutritional Biochemistry
Applied Nutrition
Community Nutrition
Industrial Training
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Malaysian students are required to take Bahasa Kebangsaan A if they do not obtain a Credit for Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Mass Communication
Education
Journalism and Media Practice
Event Management
Entrepreneurship
International Business
Management
Marketing
Finance
Nutrition with Wellness
Psychology
Pharmaceutical Industry Practice
The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Dr Tang Yin Quan, Programme Director
This programme builds students'' competencies to address global medical and health sciences issues by exposing them to the latest developments in the field of medicine and health science areas.
VIEW ALL LECTURER
Dr Tang Yin Quan, Programme Director
This programme builds students'' competencies to address global medical and health sciences issues by exposing them to the latest developments in the field of medicine and health science areas.
VIEW ALL LECTURER
Dr Tang Yin Quan, Programme Director
This programme builds students'' competencies to address global medical and health sciences issues by exposing them to the latest developments in the field of medicine and health science areas.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_032', 'CAREER_OPPORTUNITIES', 'Future Careers', 'Future Career
When you''ve successfully completed this Bachelor of Biomedical Science (Honours) programme, you could embark on any of these exciting careers, including:
Bioentrepreneur
Biomedical Scientist
Clinical Biochemist
Clinical Cytogeneticist
Clinical Molecular Geneticist
Clinical Geneticist
Clinical Operations Specialist
Medical Science Writer
Medical Laboratory Scientist
Health & Safety Officer
Immunologist
Laboratory Technologist
Microbiologist (Medical)
Quality Assurance Officer
Clinical Research Scientist
Sales & Marketing (Pharmaceutical)
Pharmaceutical Business Development', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_030', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Food Science. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / SPMV / O-Level or equivalent with 5 credits (Except for UEC)
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation in Science (FIS)
Pass with min. CGPA 2.00 including (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CGPA 2.00 for 2 subjects including (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Unified Examination Certificate (UEC)
Pass with min. 5Bs including (ANY 2): Biology, Physics / Mathematics, Chemistry
A Level
Min. DD including min. D each in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
AUSMAT (SACEi)
ATAR 60 with min. Grade C+ each in (ANY 2) subjects: Biology, Physics/Mathematics, Chemistry
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects including 65% each in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
International Baccalaureate (IB)
Min. 24 points in 6 subjects including min. 5 points at Higher Level (HL) in (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
Matriculation in Science
Min. CGPA 2.00 for 3 subjects including (ANY 2) subjects: Biology, Physics / Mathematics, Chemistry
MUFY
Overall 50% including (ANY 2) subjects: Biology, Physics/Mathematics, Chemistry;
Other Qualifications
Students with other qualifications will be considered on a case-by-case basis. Application via APEL A is allowed.
Notes : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 5.5
MUET
Band 3
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS
Band 5.5
TOEFL iBT
46
PTE
51
Linguaskill
160
Pre-University / Foundation in Science
Completed Pre-University / Foundation in Science programme that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
Note :
- International students may join IEN Preparatory Course and achieve the IELTS score.
- All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_030', 'CURRICULUM', 'Programme Structure', 'We will delve into the science behind food processing, exploring the various techniques and methods used in transforming raw ingredients into finished food products. You will learn about the principles of food preservation, packaging, and quality control, ensuring that you have a comprehensive understanding of the entire food production process.
This programme is compatible with the new Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Introduction to Food Science & Nutrition
Fundamentals of Chemistry
Introduction to Microbiology
Cell Biology
Principles of Biochemistry
Food Chemistry
Food Physics
Food Microbiology
Introduction to Biostatistics
Year 2
Food & Nutrients Evaluation
Techniques in Food/Nutrition Research
Food Processing
Food Preservation
Food Product Development
Sensory Evaluation
Food Safety & Quality Management
Year 3
Research Project
Industrial Training
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Malaysian students are required to take Bahasa Kebangsaan A if they do not obtain a Credit for Bahasa Malaysia for SPM
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Marketing
Management
Psychology
Education
Entrepreneurship
Mass Communication
Culinary Arts
Culinary Science
Nutrition with Wellness
Sustainable Food Systems
and Choose any two (2) Free Electives offered by Taylor’s University. Refer to the  Flexible Education Guide for the list of Free Electives. Modules will be subject to availability and you will need to meet the minimum module pre and co-requisite.
2nd Major
You will need to choose any Second Major package offered by Taylor’s University. Refer to the  Flexible Education Guide for the list of Second Major packages. The major will be subjected to availability. You will need to meet minimum module pre/co-requisite.
Education
Psychology
Creative Media Design
Free Electives
You will need to select any seven (7) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
Modules offered are subject to availability and you will need to meet the minimum module pre and co-requisite
Associate Professor Dr Yeo Siok Koon, Programme Director
This programme offers a comprehensive understanding of food, covering processing, flavour, nutrition, and safety. It equips students with the knowledge and skills to develop innovative food products.
VIEW ALL LECTURER
Associate Professor Dr Yeo Siok Koon, Programme Director
This programme offers a comprehensive understanding of food, covering processing, flavour, nutrition, and safety. It equips students with the knowledge and skills to develop innovative food products.
VIEW ALL LECTURER
Associate Professor Dr Yeo Siok Koon, Programme Director
This programme offers a comprehensive understanding of food, covering processing, flavour, nutrition, and safety. It equips students with the knowledge and skills to develop innovative food products.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_030', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this programme, you could embark on any of these exciting careers, including:
Consultancy
Food Analyst
Food Product Specialist
Food Technologist
Industry Buyer / Retail Buyer
Product / Process Development Scientist
Production Manager
Quality Assurance Associate
Quality Control Officer
Regulatory Affair Officer
Research Scientist (Food)
Flavour Technologist', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_031', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Biotechnology studies. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM/O-level or equivalent with 5 credits in Mathematics and one science subject for entry with pre-university /foundation qualification. (Except for UEC)
SPM / O-Level with Diploma
Pass SPM with three (3) credits in Mathematics, one science subject and one any other subject for entry with Diploma qualification.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation in Science (FIS)
Pass with min. CGPA 2.00
Sijil Tinggi Persekolahan Malaysia (STPM)
Pass STPM with min. of Grade C (GPA 2.00) in any two (2) subjects, or its equivalent
Unified Examination Certificate (UEC)
A Pass in UEC with min 5Bs including Mathematics and one Science subject. Candidates without a Grade B in Mathematics and one Science subject may be admitted if the candidate has a credit in Mathematics and one Science subject at SPM or equivalent level.
A Level
Min. DD for 2 subjects
AUSMAT (SACEi)
Min. ATAR 60
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects
International Baccalaureate (IB)
Min. 24 points based on 6 subjects
Matriculation in Science
Min. CGPA 2.00
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Students with other qualifications will be considered on a case-by-case basis. Application via APEL A is allowed.
Notes :
The credit requirement at SPM level for candidate can be waived should the grades obtained at the STPM / STAM / Diploma / Matriculation / Foundation level are equivalent/higher.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN Level 2
Grade C
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS
Band 5.5
Pre-University / Foundation in Science
Completed Pre-University / Foundation in Science programme that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_031', 'CURRICULUM', 'Programme Structure', 'As a student in our programme, you will have the opportunity to explore a wide range of essential components in the field of biotechnology. We will expose you to scientific principles and knowledge that serve as the foundation of this discipline. You will gain a deep understanding of the fundamental concepts and theories that drive advancements in biotechnology.
In addition, you will be introduced to bioinformatics technologies, which play a critical role in analysing and interpreting biological data. Through hands-on experiences and practical applications, you will develop the necessary skills to leverage computational tools and techniques for data analysis in the biotechnology field.
This programme is compatible with the new Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Introduction to Biotechnology
Fundamentals of Chemistry
Introduction to Microbiology
Cell Biology
Principles of Biochemistry
Principle of Genetics
Molecules from Nature: Biodiversity and Natural Products
Techniques and Instrumentation in Biotechnology
Introduction to Biostatistics
Year 2
Crop Biotechnology
Animal Biotechnology
Bioprocess Technology
Applications of Bioinformatics
Research and Laboratory Management
Trends in Applied and Synthetic Biotechnology
Understanding Entrepreneurialism
Year 3
Research Project
Industrial Training
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Malaysian students are required to take Bahasa Kebangsaan A if they do not obtain a Credit for Bahasa Malaysia for SPM
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Recommended Packages
Finance
International Business
Management
Marketing
Pharmacology
Nutrition with Wellness
Education
Business Analytics
Web Technology
Mass Communication
Sustainable Food Systems
Journalism and Media Practice
AND Choose any TWO (2) Free Electives offered by Taylor’s University. Refer to the  Flexible Education Guide for the list of Free Electives. Modules will be subject to availability and you will need to meet minimum module pre/co-requisite.
2nd Major
You will need to choose any Second Major package offered by Taylor’s University. Refer to the  Flexible Education Guide for the list of Second Major packages. The major will be subjected to availability. You will need to meet minimum module pre/co-requisite.
Recommended Packages
Psychology
Education
Creative Media Design
The major offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Extension
You will need to choose any ONE (1)  Extension* offered by Taylor’s University.
Pharmaceutical Biotechnology
Modules offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any seven (7) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
Modules offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Dr Lai Zee Wei​, Programme Director
Equipping future innovators with cutting-edge scientific skills and an entrepreneurial mindset, our Biotechnology programme empowers students to transform science into impactful solutions for healthcare, agriculture, and sustainability.
VIEW ALL LECTURER
Dr Lai Zee Wei​, Programme Director
Equipping future innovators with cutting-edge scientific skills and an entrepreneurial mindset, our Biotechnology programme empowers students to transform science into impactful solutions for healthcare, agriculture, and sustainability.
VIEW ALL LECTURER
Dr Lai Zee Wei​, Programme Director
Equipping future innovators with cutting-edge scientific skills and an entrepreneurial mindset, our Biotechnology programme empowers students to transform science into impactful solutions for healthcare, agriculture, and sustainability.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_031', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Biotechnology programme, you could embark on any of these exciting careers, including:
Research and development officers
Business development associates
Biotech data analyst
Medical claim assessor
Clinical research coordinators
Sustainability consultant (biotech sector)
Bioinformatics computational analyst
Medical sales representatives
Patent agents
Bioentrepreneurs
Environmental biotechnologist', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_020', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Patisserie Arts. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / O-Level or equivalent with 5 credits for entry with Pre-University / Foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification.
Note :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation / Diploma
Pass with min. CGPA 2.00; or
Pass Diploma in Culinary Arts
Pass Advanced Diploma in Patisseries & Gastronomic Cuisine
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
MOHE Matriculation
Pass with min. CGPA 2.00
DKM/DKLM/DVM
Pass with a minimum CGPA 2.50 subject to Senate approval of the relevant institutions; or
Graduated with a minimum CGPA 2.00 with a minimum of two (2) years of work experience in the related field.
Other Equivalent Qualification
Pass Foundation/Diploma/ Higher Diploma/ Advanced Diploma from any other institution recognised by Malaysian Government with min.CGPA 2.00; or
Application via APEL A is allowed;  or
Any other equiv. qualification recognized by the M''sian Government.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_020', 'CURRICULUM', 'Programme Structure', 'The Bachelor of Patisserie Arts at Taylor''s University is a premier programme designed for aspiring pastry chefs and dessert artists. Students gain hands-on experience in well-equipped kitchens, guided by industry experts with a strong emphasis on creativity, innovation, and business acumen, preparing graduates for successful careers in the global patisserie industry.
This programme is compatible with the new Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Business of Hospitality, Food and Leisure Management
Food Safety and Sanitation
Principles of Marketing
Principles of Culinary
Principles of Pastry and Baking
Celebration and Designer Cakes
Advanced Boulangerie
Science of Baking
Asian Patisserie and Desserts
Year 2
Understanding Entrepreneurialism
French – Basic
Research Methods
Chocolate and Confectionery
The Art of Sugar and Chocolate Works
Sensory Evaluation of Food
Food Business Management
Year 3
Research Project
Culinary Product Development
Creative Modern Pastry
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Second Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The major offered are subject to availability and you will need to meet the minimum module pre and co-requisite.e.
Note
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Shahril Nizam Shamsudin, Programme Director
Master the delicate art of pastry creation, from classic techniques to innovative designs, in a program tailored for aspiring pastry chefs. Elevate your culinary skills and creativity with expert guidance in a hands-on learning environment.
VIEW ALL LECTURER
Shahril Nizam Shamsudin, Programme Director
Master the delicate art of pastry creation, from classic techniques to innovative designs, in a program tailored for aspiring pastry chefs. Elevate your culinary skills and creativity with expert guidance in a hands-on learning environment.
VIEW ALL LECTURER
Shahril Nizam Shamsudin, Programme Director
Master the delicate art of pastry creation, from classic techniques to innovative designs, in a program tailored for aspiring pastry chefs. Elevate your culinary skills and creativity with expert guidance in a hands-on learning environment.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_020', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Patisserie Arts programme, you could embark on any of these exciting careers, including:
Executive Pastry Chef
Pastry Production Manager
Food Service Manager
Pastry Stylist
Pastry Kitchen Consultant
Pastry Chef
Pastry Sous Chef
Restaurant Owner
Celebrity Chef
F&B Consultant
Business Entrepreneur', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_019', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Science (Hons) in Culinology. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / O-Level or equivalent with 5 credits for entry with Pre-University / Foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification.
Notes :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation / Diploma programme
Pass with min. CGPA 2.00; or
Pass Diploma in Culinary Arts
Pass Advanced Diploma in Patisseries & Gastronomic Cuisine
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 60
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
MOHE Matriculation
Pass with min. CGPA 2.00
DKM/DKLM/DVM
Pass with a minimum CGPA 2.50 subject to Senate approval of the relevant institutions; or
Graduated with a minimum CGPA 2.00 with a minimum of two (2) years of work experience in the related field.
Other Equivalent Qualification
Pass Foundation/Diploma / Higher Diploma/Advanced Diploma from other institution recognised by Malaysian Government with min. CGPA 2.00; or
Application via APEL A is allowed; or
Any other equiv. qualification recognized by the M''sian Government.
Notes :
Candidates without a pass in Mathematics and English at SPM level or its equivalent may be admitted if the STPM / Matriculation / Foundation / Diploma programme contains subjects in Mathematics and English that are equivalent and achieved higher at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_019', 'CURRICULUM', 'Programme Structure', 'Prepare to excel in the dynamic field of food product development with our degree programme. Join us to lead the global food industry at all levels. Explore market-oriented ideas, perfect recipes for mass production, and master sensory analysis for quality control. Customise your studies using the flexible Taylor''s Curriculum Framework. Start your journey with us and unleash your potential in shaping the future of the culinary world.
This programme is compatible with the new Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Principles of Culinary
Principles of Pastry and Baking
Food Sociology
Culinology 101
Principles of Organic Chemistry
Arts and Sciences of Pastry and Baking
Applied Food Microbiology
Arts and Sciences of Food preparation
Year 2
Research Methods
Experimental Food Products & Practices
Food Chemistry
Food Product Design and Development I
Sensory Evaluation of Food
Food Preservation
Food Packaging and Labelling
Aromatic Ingredients and Flavour Application
Year 3
Food Product Design and Development II
Food Processing
Food Safety and Quality Management
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Complementary Studies Components.
Extension
You will need to choose one of the package below.
Option 1: Nutrition & Food Analysis
Introduction to Food Science and Nutrition
Introduction to Human Nutrition
Food and Nutrient Evaluation
and c hoose any TWO (2) of the below modules:
Nutraceutical and Functional Food
Techniques in Food / Nutrition Research
Food Business Management
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Second Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The major offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Dr Wendy Pek Kui Lim, Programme Director
Blend culinary arts and food science to innovate and excel in the food industry. Gain hands-on experience and scientific expertise to create the next generation of food products.
VIEW ALL LECTURER
Dr Wendy Pek Kui Lim, Programme Director
Blend culinary arts and food science to innovate and excel in the food industry. Gain hands-on experience and scientific expertise to create the next generation of food products.
VIEW ALL LECTURER
Dr Wendy Pek Kui Lim, Programme Director
Blend culinary arts and food science to innovate and excel in the food industry. Gain hands-on experience and scientific expertise to create the next generation of food products.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_019', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Science (Hons) in Culinology programme, you could embark on any of these exciting careers, including:
Research Chefs / Culinologist
Product Development & Formulation Specialists
Business Development & Merchandising Executive
Product Assurance Manager
Manufacturing Science & Technology Specialist
Food Solutions Consultant
Culinary Research Technologist
Ingredient Sales & Technical Support Specialist
Production Manager
Food Scientist', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_016', 'ADMISSIONS', 'Entry Requirements', 'Entry Qualification
Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Culinary Management. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / O-Level or equivalent with 5 credits for entry with Pre-University / Foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification.
Notes :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Requirements
Entry Requirements
Taylor’s Foundation / Diploma programme
Pass any Taylor''s Foundation / Diploma programme with CGPA 2.00
Pass Diploma in Culinary Arts
Pass Advanced Diploma in Patisseries and Gastronomic Cuisine
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
MOHE Matriculation
Pass with min. CGPA 2.00
DKM/DKLM/DVM
Pass with a minimum CGPA 2.50 subject to Senate approval of the relevant institutions; or
Graduated with a minimum CGPA 2.00 with a minimum of two (2) years of work experience in the related field.
Other Equivalent Qualification
Pass Foundation/Diploma/ Higher Diploma/ Advanced Diploma from any other institution recognised by Malaysian Government with min.CGPA 2.00; or
Application via APEL A is allowed;  or
Any other equiv. qualification recognized by the M''sian Government.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
Note : All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible for verifying the information by contacting the university’s Admissions Department.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_016', 'CURRICULUM', 'Programme Structure', 'Through this degree programme, we produce professionals in the field of culinary management who can take their productive place as leaders in the global food and beverage industries, and being equipped with management and culinary knowledge & skills applicable to the industry. Students will not only learn about managing food & beverage and kitchen operations efficiently & effectively but also on food production, supervise subordinates and communicate effectively in a multicultural context.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Business of Hospitality, Food and Leisure Management
Food Safety and Sanitation
Principles of Marketing
Principles of Culinary
Principles of Pastry and Baking
International Cuisine
Restaurant Service and Productions
Advanced Pastry and Baking
Food Sociology
Year 2
Understanding Entrepreneurialism
French – Basic
Research Methods
Food Media
Advanced Cuisine
Sensory Evaluation of Food
Food Business Management
Year 3
Research Project
Culinary Product Development
Food Trends and Product Innovation
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from  the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Select one from the extension packages suggested below. You can refer to the Flexible Education Guide for the complete list.
Option 1: Gastronomy
Choose one of the option below:
International Cuisine
Molecular Gastronomy
Food Styling
AND
Choose any TWO (2) of the below modules
Food Business Management
Food Media
Science of Baking
Sensory Evaluation of Food
Option 2: Patisserie
Choose one of the option below:
Modern Gateau and Petit Four
Sugar & Chocolate Artistry
Science of Baking
AND
Choose any TWO (2) of the below modules
Food Business Management
Food Media
Food Styling
Sensory Evaluation of Food
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Second Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The major offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Sharizan Azali Zamzuri, Programme Director
Master the art of culinary excellence and elevate your management skills to lead top-tier kitchens. Transform your passion for food into a successful career with advanced training in culinary innovation and business acumen.
VIEW ALL LECTURER
Sharizan Azali Zamzuri, Programme Director
Master the art of culinary excellence and elevate your management skills to lead top-tier kitchens. Transform your passion for food into a successful career with advanced training in culinary innovation and business acumen.
VIEW ALL LECTURER
Sharizan Azali Zamzuri, Programme Director
Master the art of culinary excellence and elevate your management skills to lead top-tier kitchens. Transform your passion for food into a successful career with advanced training in culinary innovation and business acumen.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_016', 'CAREER_OPPORTUNITIES', 'Future Careers', 'Upon completing this Bachelor of Culinary Management programme, you could embark on any of these exciting careers:
Executive Chef
Food & Beverage Manager
Food Production Manager
Food Service Manager
Food Stylist
Kitchen Consultant
Pastry Chef
Sous Chef
Restaurant Owner
Celebrity Chef', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_035', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Mass Communication in Advertising and Brand Management. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
Pass SPM//O-level or equivalent with 5 credits including English for entry with pre-university / foundation qualification (Except for UEC).
Pass SPM/O-level or equivalent with 3 credits including English for entry with Diploma qualification.
Note :
Candidates without a credit in English at SPM level or its equivalent may be admitted if the STPM / Foundation / Diploma / Matriculation programme contains subjects in English that are equivalent or higher to English at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor''s Foundation/ Diploma Programme
Pass with min. CGPA 2.00
Taylor’s Foundation in Arts (FIA)
Pass with min. CGPA 2.00
Taylor’s Diploma in Communication (DICM)
Pass with min. CGPA 2.00
Sijil Tinggi Persekolahan Malaysia (STPM)
CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs including English
(Note: Candidates without a Grade ‘B’ in UEC English may be admitted if the candidate has a credit in English at SPM or equivalent)
A Level
Min. DD (2 subjects)
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 55% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Pass Foundation / Pre-University from any other institution recognised by MOHE with min CGPA 2.0; or
Pass Diploma from any other institution recognised by MOHE with min CGPA 2.0 or
Pass Diploma in Media and Communication or its equivalent; or (Pre-requisite of credit in English at SPM level or equivalent is not required)
Pass Matriculation from an institution recognised by MOHE; or
Any other equiv. qualification recognized by M''sian Government.
Application via APEL A is allowed. For the requirements please refer to the index page.
Note :
Candidates without a credit in English at SPM level or its equivalent may be admitted if the STPM / Foundation / Diploma / Matriculation programme contains subjects in English that are equivalent or higher to English at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U / Diploma
Completed Pre-U / Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_035', 'CURRICULUM', 'Programme Structure', 'Through our Professional Media Workshop module, you will have the opportunity to actively engage with the industry. This module provides a platform for you to interact with professionals, gaining invaluable insights and knowledge directly from the field. In the Advertising Campaign module, you will work on real projects, putting your skills and creativity to the test. Collaborating with peers and industry professionals, you will develop and execute advertising campaigns that address real-world challenges.
To further enhance your practical experience, you will undertake a 10 -12 week internship with reputable advertising agencies, media agencies, and marketing communication consultancies.
Our degree programme is fully compatible with the new Taylor''s Curriculum Framework , which offers you the flexibility to mix and match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Introduction to Mass Communication
Visual Communication
Intercultural Communication
Communication Theory
New Media and Society
Innovative Media
Media Writing
Media Analytics
Media Law and Ethics
Year 2
Advertising Fundamentals
Strategic Copywriting
Principles of Marketing
Brand Management
Creative Design for Advertising
Corporate Identity and Branding Design
Research Methods
Year 3
Advertising and Brand Management Collaborative Project
Media Planning and Analysis
Research Project
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
2nd Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_035', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Mass Communication in Advertising and Brand Management programme, you could embark on any of these exciting careers, including:
Integrated Marketing Communication Specialist
Campaign Director
Branding Specialist
Brand Developer
Social Media Specialist/Coordinator
Customer Engagement Associate
Copywriter
Creative Director
Production Designer
Media Buyer/Planner
Web Designer
Traffic Manager
Digital Content Creator', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_037', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Mass Communication in Digital Media Production. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
Pass SPM//O-level or equivalent with 5 credits including English for entry with pre-university / foundation qualification (Except for UEC).
Pass SPM/O-level or equivalent with 3 credits including English for entry with Diploma qualification.
Note :
Candidates without a credit in English at SPM level or its equivalent may be admitted if the STPM / Foundation / Diploma / Matriculation programme contains subjects in English that are equivalent or higher to English at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor''s Foundation/ Diploma Programme
Pass with min. CGPA 2.00
Taylor’s Foundation in Arts (FIA)
Pass with min. CGPA 2.00
Taylor’s Diploma in Communication (DICM)
Pass with min. CGPA 2.00
Sijil Tinggi Persekolahan Malaysia (STPM)
CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs including English
(Note: Candidates without a Grade ‘B’ in UEC English may be admitted if the candidate has a credit in English at SPM or equivalent)
A Level
DD (2 subjects)
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 55% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Pass Foundation / Pre-University from any other institution recognised by MOHE with min CGPA 2.0.
Pass Diploma from any other institution recognised by MOHE with min CGPA 2.0.
Pass Diploma in Media and Communication or its equivalent; or (Pre-requisite of credit in English at SPM level or equivalent is not required).
Pass Matriculation from an institution recognised by MOHE; or
Any other equiv. qualification recognized by M''sian Government.
Application via APEL A is allowed. For the requirements please refer to the index page.
Note :
Candidates without a credit in English at SPM level or its equivalent may be admitted if the STPM / Foundation / Diploma / Matriculation programme contains subjects in English that are equivalent or higher to English at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U / Diploma
Completed Pre-U / Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_037', 'CURRICULUM', 'Programme Structure', 'A well-rounded degree structure ensures you, as a future graduate, will be equipped with critical thinking and problem-solving skills, electronic media and digital content proficiencies, and socio-cultural awareness. This will pave the way for you to become a creator and leader in digital communication.
You will have the opportunity to use top-notch facilities such as the audio recording & video editing laboratories, as well as the multi-camera television studio. You will work with up-to-date software and gain hands-on practical experience with industry-standard equipment. Additionally, you will undergo a 12-week internship with your choice of production houses, broadcasting firms, or media agencies. This internship will provide invaluable real-life experience and give you the chance to put into practice the skills you have gained from the programme.
The Digital Media Production degree is compatible with the new Taylor''s Curriculum Framework, which allows you to mix and match study modules according to your preferences.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Introduction to Mass Communication
Visual Communication
Intercultural Communication
Communication Theory
Innovative Media
Media Writing
Media Analytics
New Media and Society
Media Law & Ethics
Year 2
Narrative Writing
Digital Moving Image
Digital Animation & Compositing
Visual Storytelling
Audience Studies
Editing Techniques
Research Methods
Year 3
Research Project
Digital Media Creative Project
Trends in New Media
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
2nd Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Kok Jia Wern
As Senior Lecturer and Programme Director, Jia Wern brings over 15 years of teaching experience in media and communication, helping students explore the evolving relationship between digital media, technology, and society.
With a Master’s in Communication specialising in Digital Media and New Media, he is passionate about guiding the next generation through an increasingly digital world. His teaching approach balances creative exploration with practical understanding, encouraging students to think not only about how media is created, but also why it matters.
Drawing from freelance experience in digital media, motion graphics, and videography, he brings real-world industry perspectives into the classroom to help students better appreciate the creative process behind meaningful media work.
Beyond teaching, Jia Wern has also contributed to educational game development as a Gamification Lead, reflecting a strong belief that learning should remain interactive, creative, and engaging.
He hopes students leave the programme with not only technical and creative skills, but also empathy, ethical awareness, and a stronger sense of humanity in the age of AI.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_037', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Mass Communication in Digital Media Production programme, you could embark on any of these exciting careers, including:
Director
Producer
Scriptwriter
Editor
Sound Designer
Foley Artist
Production Manager
Cinematographer
Production Designer
Art Director
Visual Effects Artist
Digital Content Creator', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_010', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Computer Science. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits (including Additional Mathematics) for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits (including Additional Mathematics) for entry with Diploma qualification.
Note: Candidates without a credit in Additional Mathematics at SPM level or its equivalent may be admitted if the Foundation program contains subjects in mathematics that are equivalent to Additional Mathematics at SPM level.
As for Bachelor of Software Engineering (Honours) and Bachelor of Computer Science (Honours), students without a credit in Additional Mathematics at SPM level OR without Mathematics at a higher level (Pre-U, STPM, A Level, Foundation) but have obtained a credit in Mathematics and a credit in one of the subjects in Science / Technology / Engineering at SPM level is required to take and pass the reinforcement Mathematics equivalent to Additional Mathematics at the SPM level. The subject must be offered in the first semester or before enrollment with unconditional offer.
Reinforcement Mathematics can be offered as part of or outside the curriculum structure. If Reinforcement Mathematics is offered as part of the curriculum structure, it should count as an addition to the total number of credits required for graduation.
Note :
Readers are responsible for verifying information that pertains to them by contacting the university.
Candidates must pass Bahasa Malaysia and History in SPM
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 55
A Level
Pass with min. DD
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
A pass in STPM (Science Stream) or its equivalent with a minimum grade of C (CGPA 2.00) in Mathematics subject and ONE (1) Science / ICT subject.
(Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required); OR Pass with Grade C in any 2 subjects
Unified Examination Certificate (UEC)
Pass with minimum 5Bs, including Mathematics or Advanced Mathematics or Adv. Mathematics 1 or 2
(Note: Candidates without a Grade ‘B’ in UEC subjects above may be admitted if the candidate has a credit in Additional Mathematics at SPM or equivalent)
Foundation
Pass with min. CGPA 2.00
Diploma in Information Technology (DIT)
Pass with min. CGPA 2.50 (candidates with CGPA below 2.50 but above 2.00 may be admitted subject to internal evaluation process)
(Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required)
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Diploma in Computing (Level 4, MQF) or its equivalent with a minimum CGPA of 2.50. Candidates with a CGPA below 2.50 but more than 2.00 may be admitted subject to a thorough internal evaluation process. (Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required)
Any Diploma in Science and Technology (Level 4, MQF) with a minimum CGPA of 2.75. Candidates with a CGPA below 2.75 but more than 2.50 can be admitted subject to a thorough rigorous assessment.
Pass Matriculation programs recognised by the Ministry of Education Malaysia in the relevant field with a minimum CGPA of 2.00.
Pass ANY Foundation with a minimum CGPA of 2.0 from other institutions recognised by the Malaysian Government.
Diploma Kemahiran Malaysia (DKM) / Diploma Vokasional Malaysia (DVM) / Diploma Lanjutan Kemahiran Malaysia (DLKM) in Computing fields with a minimum CGPA of 2.50 subjected to HEP Senate / Academic Board’s approval. (The institution need to conduct a bridging program in the duration of the student following the programme to support the existing curriculum. The duration of the bridging program shall not exceed one (1) year or two (2) Semesters of study)
Any other qualifications recognised as equivalent by the Malaysian Government.
Application via APEL A is allowed.
Notes :
Candidates without a pass in Mathematics and English at SPM level or its equivalent may be admitted if the STPM / Matriculation / Foundation / Diploma programme contains subjects in Mathematics and English that are equivalent and achieved higher at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 5.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS 5.5
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_010', 'CURRICULUM', 'Programme Structure', 'In the Bachelor of Computer Science (Honours) programme, you will have the flexibility to choose between three tracks for the third year. The first option is the Conventional track, which provides valuable industry experience through internships or cooperative education placements. The second option, Work-based learning (WBL) , provides hands-on experience with industry partners for a full year, allowing you to apply theoretical knowledge in real-world settings and gain relevant practical skills.
The third option is the Technopreneurship track, which emphasises the entrepreneurial aspects of computer science. In this track, you will learn about technology-driven innovation, startup management, and business strategies in the digital era. This option is ideal for those who aspire to be tech entrepreneurs or work in technology startups.
Our degree programme is fully compatible with the Taylor''s Curriculum Framework , which offers you the flexibility to mix and match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides fundamental knowledge of the discipline.
Common Core
Year 1
• Database Systems
• Computer Architecture and Organisation
• Object Oriented Programming
• Discrete Structures
• Principles of Software Engineering
• Systems Analysis and Design
• Data Structures and Algorithms
• Operating Systems
• Advanced Programming
Year 2
• Computer Networks
• Machine Learning and Intelligent System
• Ideating Start-up
• Specialisation modules
Year 3
Conventional Mode
• Capstone Project I
• Capstone Project II
• Human Computer Interaction
• Professional Practices and Information Security
Work-Based Learning Mode
• Human Computer Interaction
• Professional Practices and Information Security
• Industrial Project I
• Industrial Project II
Technoprenueurship Mode
• Human Computer Interaction
• Technopreneurship Project I
• Professional Practices and Information Security
• Technopreneurship Project II
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
In the Bachelor of Computer Science programme, students are required to specialise in one of four key areas: Data Science, Cyber Security, Mobile Computing, or Artificial Intelligence. Dive deeper into your chosen discipline, gaining advanced knowledge and practical skills that enhance career readiness.
Throughout your journey, you will be supported by experienced faculty, strong industry collaborations, and access to cutting-edge facilities. These resources not only prepare you to deliver innovative computing solutions but also nurture a mindset of lifelong learning, enabling you to stay relevant in an ever-evolving digital landscape.
Data Science (Dual Award)
In the Data Science specialisation, you will delve into the field of data analysis and learn techniques to extract valuable insights from vast amounts of data. You will study data mining, statistical analysis, machine learning, and data visualisation, equipping you with the skills to make data-driven decisions and contribute to the growing field of data science.
Modules
Statistical Inference and Modelling
Data Science Principles
Data Mining
Big Data Technologies
Cyber Security (Dual Award)
If you choose the Cyber Security specialisation, you will explore the critical field of safeguarding digital systems and networks. You will learn about cybersecurity principles, network security, cryptography, and computer crime and digital evidence. With this specialisation, you will be prepared to tackle emerging cyber threats and protect organisations from cyber-attacks.
Modules
Computer and Network Security
Computer Intrusion Detection
Computer Crime and Digital Evidence
Wireless Networks and Security
Mobile Computing (Dual Award)
The Mobile Computing specialisation focuses on the development of mobile applications and technologies. You will gain a comprehensive understanding of mobile platforms, user interface design, mobile app development, and mobile data management. This specialisation equips you with the skills to create innovative and user-friendly mobile solutions.
Modules
Introduction to Mobile Computing
Mobile Applications Development
Wireless Networks and Security
Internet of Things
Artificial Intelligence (Dual Award)
In the Artificial Intelligence specialisation, you will dive into the fascinating field of intelligent systems and automation. You will study machine learning algorithms, natural language processing, computer vision, and big data technologies. With this specialisation, you will be at the forefront of developing intelligent systems that can learn, reason, and make decisions.
Modules
Computer Vision and Natural Language Processing
Data Analytics and Machine Learning
Cognitive Computing and Applications
Big Data Technologies
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the  Flexible Education Guide  for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Recommended Packages
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
Second Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the  Flexible Education Guide  for the complete list. The majors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Extension
Extension
For those who selected Cyber Security as Specialisation, you will need to choose one (1) of the below Extension packages:
Data Science
Artificial Intelligence
Business Intelligence and Analytics
Mobile Computing
Digital Transformation
For those who selected  Mobile Computing  as Specialisation, you will need to choose one (1) of the below Extension packages:
Data Science
Artificial Intelligence
Business Intelligence and Analytics
Cyber Security
Digital Transformation
For those who selected  Data Science as Specialisation, you will need to choose one (1) of the below Extension packages:
Mobile Computing
Cyber Security
Internet Technologies
Artificial Intelligence
Digital Transformation
For those who selected  Artificial Intelligence as Specialisation, you will need to choose one (1) of the below Extension packages:
Mobile Computing
Cyber Security
Internet Technologies
Business Intelligence and Analytics
Data Science
Note: Student must choose an Extension package that is different from their chosen specialisation.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_010', 'CAREER_OPPORTUNITIES', 'Future Careers', 'for Computer Science
When you’ve successfully completed this Bachelor of Computer Science programme, you could embark on any of these exciting careers, including:
Applications Developer
Database Designer
E-Business Consultant
IT Consultant
Network Engineer
Programmer
Software Developer
Software Engineer
Systems Analyst
Systems Developer
Technical Support Engineer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_009', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our Bachelor of Software Engineering programme offers an exciting opportunity for individuals passionate about the field of Software Engineering. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits (including Additional Mathematics) for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Note: Candidates without a credit in Additional Mathematics at SPM level or its equivalent may be admitted if the Foundation program contains subjects in mathematics that are equivalent to Additional Mathematics at SPM level.
As for Bachelor of Software Engineering (Honours) and Bachelor of Computer Science (Honours), students without a credit in Additional Mathematics at SPM level OR without Mathematics at a higher level (Pre-U, STPM, A Level, Foundation) but have obtained a credit in Mathematics and a credit in one of the subjects in Science / Technology / Engineering at SPM level is required to take and pass the reinforcement Mathematics equivalent to Additional Mathematics at the SPM level. The subject must be offered in the first semester or before enrollment with unconditional offer.
Reinforcement Mathematics can be offered as part of or outside the curriculum structure. If Reinforcement Mathematics is offered as part of the curriculum structure, it should count as an addition to the total number of credits required for graduation.
Note :
Readers are responsible for verifying information that pertains to them by contacting the university.
Candidates must pass Bahasa Malaysia and History in SPM
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 55
A Level
Pass with min. DD
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
A pass in STPM (Science Stream) or its equivalent with a minimum grade of C (CGPA 2.00) in Mathematics subject and ONE (1) Science / ICT subject.
(Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required); OR Pass with Grade C in any 2 subjects
Unified Examination Certificate (UEC)
Pass with minimum 5Bs, including Mathematics or Advanced Mathematics or Adv. Mathematics 1 or 2
(Note: Candidates without a Grade ‘B’ in UEC subjects above may be admitted if the candidate has a credit in Additional Mathematics at SPM or equivalent)
Foundation
Pass with min. CGPA 2.00
Diploma in Information Technology (DIT)
Pass with min. CGPA 2.50 (candidates with CGPA below 2.50 but above 2.00 may be admitted subject to internal evaluation process)
(Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required)
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Diploma in Computing (Level 4, MQF) or its equivalent with a minimum CGPA of 2.50. Candidates with a CGPA below 2.50 but more than 2.00 may be admitted subject to a thorough internal evaluation process. (Pre-requisite of Credit in Additional Mathematics at SPM level or equivalent is not required)
Any Diploma in Science and Technology (Level 4, MQF) with a minimum CGPA of 2.75. Candidates with a CGPA below 2.75 but more than 2.50 can be admitted subject to a thorough rigorous assessment.
Pass Matriculation programs recognised by the Ministry of Education Malaysia in the relevant field with a minimum CGPA of 2.00.
Pass ANY Foundation with a minimum CGPA of 2.0 from other institutions recognized by the Malaysian Government.
Diploma Kemahiran Malaysia (DKM) / Diploma Vokasional Malaysia (DVM) / Diploma Lanjutan Kemahiran Malaysia (DLKM) in Computing fields with a minimum CGPA of 2.50 subjected to HEP Senate / Academic Board’s approval. (The institution need to conduct a bridging
program in the duration of the student following the programme to support the existing curriculum. The duration of the bridging program shall not exceed one (1) year or two (2) Semesters of study.)
Any other qualifications recognised as equivalent by the Malaysian Government.
Application via APEL A is allowed.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 5.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS 5.5
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_009', 'CURRICULUM', 'Programme Structure', 'Our curriculum is carefully designed to equip students with the skills necessary to develop and maintain large and complex software systems or applications. Throughout this programme, you will learn to analyse user requirements, design software solutions, conduct testing, and apply the theories and principles of software engineering.
We place a strong emphasis on practical application and providing you with a good understanding of the latest tools and processes for software design and development. You will have hands-on experience with industry-standard software engineering tools, enabling you to develop real-world software solutions.
Our degree programme is fully compatible with the Taylor''s Curriculum Framework , which offers you the flexibility to mix and match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Principles of Software Engineering
Database Systems
Computer Architecture and Organisation
Discrete Structures
Object Oriented Programming
Operating System
Advanced Programming
System Analysis and Design
Computer Networks
Year 2
Software Design
Software Testing
Software Project Management
Requirement Engineering
Software Construction
Software Lifecycle
Software Safety and Security
Year 3
Capstone Project I
Human Computer Interaction
Professional Practices and Information Security
Capstone Project II
Industrial Training
*Work-based Learning mode available in third year.
(Taught & Accessed by Academics & Industry)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Recommended Packages
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
2nd Major
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Extension
Extension
Data Science
Cyber Security
Mobile Computing
Internet Technologies
Artificial Intelligence
Digital Transformation
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_009', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this Bachelor of Software Engineering programme, you could embark on any of these exciting careers, including:
Computer Communications Specialists
Games Developer
Games Graphic Designer
IT Consultant
IT Engineer
Java J2EE Developer
Network Architect Developer
Net Consultants
Software Architect
Software Designer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_011', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Information Technology. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits (including Mathematics) for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits (including Mathematics) for entry with Diploma qualification.
Note: Candidates without a credit in mathematics at SPM level or its equivalent may be admitted if the STPM (Pre-U) / Matriculation / Foundation / Diploma in Computer Science or Software Engineering or Information Technology or Information System or Science and Technology or Business Studies programme contains subjects in mathematics that are equivalent or higher to mathematics at SPM level.
Candidates without a credit in Mathematics at SPM level/equivalent or without a subject in Mathematics at a higher level, need to take and pass the reinforcement Mathematics subject that is equivalent to the SPM level. The reinforcement Mathematics subject must be offered in the first semester or before enrolment with unconditional offer.
Reinforcement Mathematics can be offered as part of or outside the curriculum structure. If Reinforcement Mathematics is offered as part of the curriculum structure, it should count as an addition to the total number of credits required for graduation.
Note :
Candidates without a credit in Mathematics at SPM level/equivalent or without a subject in Mathematics at a higher level, need to take a reinforcement Mathematics with appropriate topics in the discipline of Information Technology and Information Systems at the beginning of the study.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 55
A Level
Min. DD
Canadian Pre-University (CPU)
Min. average of 55% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. Grade C in at least 2 subjects
Unified Examination Certificate (UEC)
Pass with minimum 5Bs, including Mathematics or Advanced Mathematics or Adv. Mathematics 1 or 2
(Note: Candidates without a Grade ‘B’ in UEC subjects above may be admitted if the candidate has a credit in Mathematics at SPM or equivalent)
Foundation
Pass Foundation with CGPA 2.0
Diploma in Information Technology (DIT)
Taylor''s Diploma in IT with min. CGPA 2.50 (candidates with CGPA below 2.50 but above 2.00 may be admitted subject to thorough rigorous assessment) (Pre-requisite of Credit in Mathematics at SPM level or equivalent is not required)
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Diploma in Computing (Level 4, MQF) or equivalent with a minimum CGPA of 2.50. Candidates with a CGPA below 2.50 but more than 2.00 may be admitted subject to a thorough rigorous assessment; (Pre-requisite of Credit in Mathematics at SPM level or equivalent is not required)
Any other Diploma (Level 4, MQF) with a minimum CGPA of 2.75. Candidates with a CGPA below 2.75 but more than 2.50 can be admitted subject to a thorough rigorous assessment;
Pass High School Certificate from New South Wales, Australia with an average of 60%
Pass ANY Foundation with min CGPA 2.0 from other institutions recognized by the Malaysian Government
Pass Matriculation programs recognized by the Ministry of Education Malaysia in the relevant field with min CGPA 2.00
Diploma Kemahiran Malaysia (DKM) / Diploma Vokasional Malaysia (DVM) / Diploma Lanjutan Kemahiran Malaysia (DLKM) in Computing fields with a minimum CGPA of 2.50 subjected to HEP Senate / Academic Board’s approval;
Any other qualifications are recognised as equivalent by the Malaysia Government.
Application via APEL A is allowed.
Notes :
Candidates without a credit in mathematics at SPM level or its equivalent may be admitted if the STPM (Pre-U) / Matriculation / Foundation Diploma in Computer Science or Software Engineering or Information Technology or Information System or Science and Technology or Business Studies programme contains subjects in mathematics that are equivalent or higher to mathematics at SPM level.
Candidates without a credit in Mathematics at SPM level/equivalent or without a subject in Mathematics at a higher level, need to take a reinforcement Mathematics with appropriate topics in the discipline of Information Technology and Information Systems at the beginning of the study
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 5.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS 5.5
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_011', 'CURRICULUM', 'Programme Structure', 'The programme offers a comprehensive curriculum that balances core theory with applied learning. Key areas of study include System Architecture, Software Development, Web Programming & Web Technologies, Human-Computer Interface (HCI), and  Database Management Systems – Master how to store, retrieve, and organise data for business and technical applications.
You will study computer software and systems networks to gain a clear view of how IT infrastructure supports business operations. These modules strengthen your data management skills while preparing you for high-demand roles such as system administrator, IT analyst, or developer.
Our degree programme is fully compatible with the Taylor''s Curriculum Framework , which offers you the flexibility to mix and match study modules.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides fundamental knowledge of the discipline.
Common Core
Year 1
Database Systems
Computer Architecture and Organisation
Discrete Structures
Object Oriented Programming
Data Structures and Algorithms
Operating Systems
Systems Analysis and Design
Web and Mobile Systems
Year 2
Computer Networks
System Integration and Architecture
System Paradigms
Ideating Start-up
Specialisation modules
Year 3
Capstone Project I
Capstone Project II
Human Computer Interaction
Professional Practices and Information Security
Industrial Training
*Work-based Learning mode or Technopreneurship mode available in third year. (Taught & Accessed by Academics & Industry)
Students must select their specialisation during enrolment. It is advised to make changes of specialisation within Year 1. Take note that any change of specialisation during studies can impact study duration and fees.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisations (Compulsory Modules)
Specialisations (Compulsory Modules)
In this Bachelor of Information Technology programme, you will have the opportunity to specialise in one of the following areas: Internet Technologies, Business Intelligence and Analytics, or Game Design. By choosing one of these specialisations, you will gain in-depth knowledge and skills in your chosen area of expertise. Our experienced faculty members, industry collaborations, and cutting-edge resources will support your learning journey and provide you with the necessary tools to excel in your specialisation.
Internet Technologies (Dual Award)
If you choose the Internet Technologies specialisation, you will dive into the technical field that encompasses the skills needed to develop applications on the Internet or Internet-based systems. You will learn about e-commerce, cloud computing, mobile technologies, and web-based technologies. This specialisation equips you with the knowledge and skills to create innovative and dynamic solutions in the digital realm.
Modules
Mobile Applications Development
Wireless Networks and Security
Introduction to Cloud Computing
Internet of Things
Business Intelligence and Analytics (Dual Award)
The Business Intelligence and Analytics specialisation focuses on the study of techniques and tools used to gather, organise, and interpret information to support business decision-making. You will explore data analytics, data visualisation, data mining, and business intelligence technologies. This specialisation prepares you to harness the power of data to gain valuable insights and make informed business decisions.
Modules
Data Mining
Marketing Analytics
Market Intelligence and Data Visualisation
Social Media Analytics
Game Design (Dual Award)
In the Game Design specialisation, you will delve into the exciting field of game design, drawing from computer science, programming, and graphic design. You will learn the principles of game development, game mechanics, storytelling, and user experience design. This specialisation allows you to combine technical expertise with creative skills to create engaging and immersive gaming experiences.
Modules
Games Development
Games Studies
Experiential Design
3D Modeling
Digital Transformation (Dual Award)
This specialisation aims to equip individuals with the knowledge and skills needed to navigate the rapidly evolving landscape of artificial intelligence. It prepares students for roles ranging from machine learning engineers and data scientists to AI researchers and specialists. The goal is to enable individuals to apply these technologies to solve complex problems and contribute to the ongoing advancements in the field.
Modules
Machine Learning and Intelligent Systems
Digital Transformation
Artificial Intelligence-enabled Enterprise Automation
Interactive and Digital Marketing
University Core
University Core
This component aims to develop critical thinking, build up social intelligence, and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Recommended Packages
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
2nd Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The majors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Extension
Extension
Option 1: Internet Technologies
Choose one of the Extension package below:
Data Science
Artificial Intelligence
Business Intelligence and Analytics
Game Design
Cyber Security
Digital Transformation
Option 2: Business Intelligence and Analytics
Choose one of the Extension package below:
Internet Technologies
Cyber Security
Mobile Computing
Artificial Intelligence
Game Design
Digital Transformation
Option 3: Game Design
Choose one of the Extension package below:
Internet Technologies
Data Science
Cyber Security
Mobile Computing
Artificial Intelligence
Business Intelligence and Analytics
Digital Transformation
Option 4: Digital Transformation
Choose one of the Extension package below:
Internet Technologies
Data Science
Cyber Security
Mobile Computing
Business Intelligence and Analytics
Game Design
Note: Student must choose an Extension package that is different from their chosen specialisation.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_011', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this Bachelor of Information Technology programme, you could embark on any of these exciting careers, including:
Analyst Programmer
Client / Server Specialist
Information Technology Officer
IT Consultant
Network Administrator
Network Consultant
Programmer
System Analyst
System Software Programmer
Technology Manager
Web Designer / Developer
Internet Technologist Specialist
Game Designer / Producer / Animator
Data Analyst / Architect', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_014', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Interactive Spatial Design. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Visual Test
Pass Visual Test (Taylor’s FID, DID and FNBE are exempted from the Entrance Test)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
ATAR 55
A Level
Min. grades CDD
Canadian Pre-University (CPU)
Average of 55% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
CC
Unified Examination Certificate (UEC)
A Pass with UEC with Min. 5 Bs
Taylor''s Foundation / Diploma
Pass FNBE with min. CGPA 2.00
Pass FID with min. CGPA 2.00
Pass Taylor''s Diploma with min. CGPA 2.00
Other Taylor''s Foundation with min CGPA 2.00
International Baccalaureate (IB)
Min 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Foundation from an institution recognised by the Malaysian Government with min. CGPA 2.00
Diploma from an institution recognised by the Malaysian Government with min. CGPA 2.00
MoE Matriculation with min. CGPA 2.00
Any other qualification recognised by the Malaysian govt.
Notes :
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university''s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 4.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
Achieve a minimum score of Band 3 in MUET or equivalent to CEFR Low B2.
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_014', 'CURRICULUM', 'Programme Structure', 'Our curriculum is designed to nurture your creativity and enhance your digital proficiency. You will develop interdisciplinary skills and processes that are essential for the future of spatial design. Our experienced faculty members, who are industry practitioners themselves, will guide you through hands-on projects and provide insights into the latest trends and advancements in the field.
Programme Core
Programme Core
This component consists of Primary Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Spatial Design I
Spatial Design II
Environment Design
3D Modelling
Application Design I
Application Design II
Games Studies
Programming
Embedded Systems
Year 2
Specialisation modules
Year 3
Choose ONE(1) of the pathway option:
Conventional
• Multidisciplinary Project I
• Multidisciplinary Project II
Technopreneurship
• Technopreneurship Project I
• Technopreneurship Project II
Work-based Learning
• Industry Project I (WBL)
• Industry Project II (WBL)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisations
Specialisations
You will need to choose one of the options below:
Option 1: Smart Homes Design
Lighting Interactive Design
Home Automation
Advanced Modelling & Animation
Advanced Home Automation
Internet of Things (IoT)
Computer Vision and Natural Language Processing
Experiential Design
Games Development
Option 2: Smart Environment Design
Performative Media
Advanced Modelling & Animation
Interactive Design
Advanced Interactive Design
Lighting Interactive Design
Sonic Design
Experiential Design
Games Development
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Core
Flexible Core
Choose from a range of three pathway options; Multidisciplinary, Technopreneurship or Work-Based Learning track in the final year of studies.
Conventional
In the Conventional pathway, you will have the opportunity to engage in multidisciplinary projects that span various fields.
You will undertake two projects, Multidisciplinary Project I and Multidisciplinary Project II, which will enable you to apply your knowledge and skills across multiple disciplines.
Technopreneurship
If you have an entrepreneurial spirit and a passion for technology, the Technopreneurship pathway is designed for you. This pathway focuses on developing your skills in technology-driven entrepreneurship.
You will embark on two projects, Technopreneurship Project I and Technopreneurship Project II, where you will have the opportunity to apply your knowledge and creativity to create innovative technology-based solutions.
Work-Based Learning
The Work-Based Learning pathway offers a practical approach to learning by providing you with the opportunity to gain real-world industry experience. In this pathway, you will undertake projects that are closely aligned with industry needs and demands.
You will work on projects such as Industry Project I (WBL), Human Computer Interaction (WBL), and Professional Practices and Information Security (WBL). These projects will allow you to apply your knowledge and skills in a professional setting, gaining valuable practical experience and enhancing your employability.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_014', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor in Interactive Spatial Design programme, you could embark on any of these exciting careers, including:
Deep Learning Systems Designer
Hybrid Home Systems Designer
Smart Home Product Manager
Smart Home Solutions Architect
Home Software Development Manager
Smart Cybersecurity Architect
Smart Home Design Expert
Creative Technologist
Applied Futurist
Extended Reality Builder
Transhumanist Designer
Augmented Environment Developer
Spatial Interaction Designer
Interactive Environment Designer
Retailtainment Designer
Design Futurist', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_013', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Fashion Design Technology. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-Univesity/Foundation
Pass SPM/O-level or equivalent with 5 credits with foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Visual Test
Pass Visual Test (Taylor''’s FID, DID and FNBE are exempted from the Entrance Test)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 60
A Level
Min. grades DD
Canadian Pre-University (CPU)
Min. average of 55% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
Taylor’s Foundation in Design (FID)
Pass with min. CGPA 2.00
Taylor’s Foundation in Natural and Built Environments (FNBE)
Pass with min. CGPA 2.00
Other Taylor''s Foundation
Pass with min. CGPA 2.00
Taylor’s Diploma in Interior Design (DID)
Pass with min. CGPA 2.00
International Baccalaureate (IB)
Min 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Foundation from institution recognised by Malaysian Government with min. CGPA 2.00
Diploma from institution recognised by Malaysian Government with min. CGPA 2.00
MoE Matriculation with min. CGPA 2.00
A pass in DKM/DKLM/DVM in suitable fields with a min. CGPA of 2.50 subject to Senate approval (Note: The HEPs are to conduct screening and provide necessary guidance specific to the discipline of the programme);
OR
A pass in DKM / DLKM / DVM with a min. CGPA of 2.00 and at least have two (2) years working experience in a related discipline. The institution need to conduct a bridging program in the duration of the student following the programme to support the existing curriculum. The duration of the bridging program shall not exceed one (1) year or two (2) Semesters of study.
Any other qualification recognised by Malaysian govt.
Application via APEL A is allowed.
Notes :
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university''s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 4.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_013', 'CURRICULUM', 'Programme Structure', 'Through problem-based and studio-based approaches, you''ll delve into the fundamental processes of design theory and practice. Experience the design thinking process firsthand, enabling you to analyse, evaluate, and propose innovative and creative design solutions. Our prescribed modules will equip you with the necessary skill sets to conceptualise and create aesthetically appealing outputs that are not only creative and functional but also entertaining, engaging, and communicable.
Prepare for captivating careers in fashion retail, digital clothing creation, and more. Our programme is compatible with the Taylor''s Curriculum Framework, allowing you to mix and match study modules to tailor your learning experience.
Programme Core
Programme Core
This component consists of Primary Core subjects, which are common modules across a discipline that provides fundamental knowledge of the discipline.
Year 1
Design Principles
Introduction to Fashion Design
Introduction to Pattern Drafting and Garment Making
Fashion Project I
Garment Draping
Fashion Illustration
Fashion History
Intercultural Design
Year 2
Fashion Project II
Introduction to Pattern Technology
Ethical and Sustainable Fashion
Innovative Industry Project
Innovative Pattern Drafting Project
Fashion Entrepreneurship
Digital Illustration
Free Electives 1
Free Electives 2
Free Electives 3
*Note:  Industry Training module is offered in Year 2
Student able to opt for 1 semester abroad/mobility programme in Year 2 (Semester 4)
Year 3
Fashion Design Technology Final Project I
Garment Creation Technology I
Fashion Communication and Visual Merchandising
Fashion Design Technology Final Project II
Garment Creation Technology II
International Fashion
Free Electives 4
Free Electives 5
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Co-programme Director - Andrew Tan
Taylor''s fashion graduates, armed with industry skills and KL Fashion Week exposure, will bring a forward-thinking, industry-driven perspective, positively impacting Malaysia''s fashion scene.
Co-programme Director - Andrew Tan
Taylor''s fashion graduates, armed with industry skills and KL Fashion Week exposure, will bring a forward-thinking, industry-driven perspective, positively impacting Malaysia''s fashion scene.
Co-programme Director - Andrew Tan
Taylor''s fashion graduates, armed with industry skills and KL Fashion Week exposure, will bring a forward-thinking, industry-driven perspective, positively impacting Malaysia''s fashion scene.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_013', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Fashion Design Technology programme, you could embark on any of these exciting careers, including:
Fashion Designer
Fashion Entrepreneur
Fashion Merchandiser
Fashion Buyer
Fashion Forecaster
Fashion Engineer
Fashion PR Coordinator
Pattern Technologist
Fashion Editor
Fashion Director', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_012', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Creative Media. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Visual Test
Pass Visual Test (Taylor’s FID, DID and FNBE are exempted from the Entrance Test)
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
Min. ATAR 55
A Level
Min. CDD
Canadian Pre-University (CPU)
Min. average of 55% in 6 subjects
Sijil Tinggi Persekolahan Malaysia (STPM)
CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
Taylor’s Foundation in Design (FID)
Pass with min. CGPA 2.00
Taylor’s Foundation in Natural and Built Environments (FNBE)
Pass with min. CGPA 2.00
Other Taylor''s Foundation
Pass with min. CGPA 2.00
Taylor''s Diploma
Pass with min. CGPA 2.00
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Other Qualifications
Foundation from an institution recognised by the Malaysian Government with min. CGPA 2.00
Diploma from an institution recognised by the Malaysian Government with min. CGPA 2.00
MoE Matriculation with min. CGPA 2.00
Any other qualification recognised by the Malaysian govt.
Application via APEL A is allowed.
Notes :
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university''s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
MUET/IELTS/TOEFL/UEC English
Pass English
Taylor’s EET
Overall Score 4.0
Taylor’s IEN
Level 2- Grade C
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
Achieve a minimum score of Band 3 in MUET or equivalent to CEFR Low B2.
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_012', 'CURRICULUM', 'Programme Structure', 'Our curriculum is carefully designed to ensure that you gain a comprehensive understanding of design principles and methodologies. You will learn to apply critical thinking and problem-solving skills to tackle design challenges, while also honing your creativity and artistic abilities.
We believe in a holistic approach to design education, which is why our programme is designed to be compatible with the new Taylor''s Curriculum Framework . This framework allows you to personalise your learning experience by mixing and matching study modules that align with your interests and career goals.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Typography
Illustration and Visual Narrative
Digital Photography and Imaging
Design Research Methodology
Video and Sound Production
Interactive Design
Advanced Typography
Intercultural Design
Design Principles
Year 2
Design Research Dissertation
Minor Project
Major Project I
Specialisation Modules (Refer to specialisation options)
Year 3
Extension 1 / Free Elective 1 / Minor 1
Industry Training
Major Project II
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
In our Bachelor of Design in Creative Media programme, we offer a range of specialisations to cater to your specific interests and career goals.
Graphic Design
The Graphic Design specialisation encompasses a dynamic process that combines implicit and explicit knowledge, as well as intuitive and reasoned thinking. It integrates art, technology, user, organisational, and practice-based knowledge and skills within both individual and team contexts. This specialisation fosters the development of these attributes in students, enhancing learning, employability, and future growth. Join us to cultivate your creativity and expertise in Graphic Design.
Brand Corporate Identity
Packaging and Merchandising Design
Publishing Design
Creative Brand Strategy
Digital and Social Media Communication
Advanced Interactive Design
UI/UX
Discover the fascinating realm of UI and UX design, where aesthetics and user-friendliness intersect. As a student in our UI/UX design specialisation, you''ll delve into disciplines such as user experience design, app design, experiential design, and game design. Through hands-on learning with industry-standard technologies, you''ll develop skills in visual design, information design, user interface design, games design, usability research, and programming. Prepare to design impactful interactive solutions that deliver human-centred, intuitive, and engaging experiences. Join us on this exciting journey and unleash your creativity to shape the future of digital interactions.
Application Design I
Games Studies
Experiential Design
Application Design II
Games Development
Advanced Interactive Design
Digital Animation
Unlock your creative potential and master the art of digital animation. Our Digital Animation specialisation equips you with the professional skills needed to thrive in today''s digital media landscape. From state-of-the-art tools to 2D and 3D techniques, you''ll learn how to bring captivating and innovative content to life. Alongside technical expertise, we''ll nurture your storytelling and cinematic arts abilities, ensuring you become a well-rounded animator. Join us to embark on an exciting journey where imagination meets cutting-edge technology, and unleash your talent in creating visually stunning and engaging animated experiences. Refer to our digital prospectus for more information on the specialisations.
Animation Fundamentals
3D Modelling
Sonic Design
Motion Graphics and Compositing
Advanced Animation
Film Studies and Cinematography
Entertainment Design
Welcome to the Entertainment Design specialisation, where we dive into the exciting world of movies, games, animations, and more. Whether you''re passionate about comics, illustration, or related fields, this programme is perfect for you. Through project-based learning, you''ll master painting, 3D modelling, cinematography, and more. Develop industry-standard skills and unleash your creativity, either as a solo artist or as a collaborative team member. Join us to gain real-life knowledge, network with industry partners, and embark on an exhilarating journey in the entertainment industry.
Character Design
Anatomy and Character Sculpture
Vehicle and Props Design
Environment Design
Digital Matte Painting
Game Art
Immersive Design
Immerse yourself in the world of Immersive Design, where audio, video, and time-based media take centre stage in virtual 3D spaces like Virtual Reality (VR) and overlay reality in Augmented Reality (AR). Our project-based learning approach equips students with professional VR Head-mounted Devices, powerful workstations, motion capture suits, and 360-degree cameras for creating immersive content. Develop industry-standard technical skills, unleash your creativity, and collaborate with other programmes to produce multidisciplinary AR or VR projects. Experience real-world learning and networking opportunities through industry partnerships. Join us and embark on a transformative journey in Immersive Design.
Interactive Narrative Design
Film Studies and Cinematography
Motion Graphics and Compositing
Spatial Audio Design
Immersive Visual Effects
Immersive Video Production
Note:  Refer to our digital prospectus for more information regarding to each of the specialisation offer.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Extension
Design Exploration
Art Direction
Collaborative Design Practice
Design Portfolio
UX Design
AND
Free Elective Modules : You will need to select any one (1) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives modules offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Advertising and Brand Management
Education
Entrepreneurship
Mobile Technology
Web Technology
Note
This is subject to availability and you need to meet minimum module pre/co-requisite.
Second Major
You will need to select any second major offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The second majors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any seven (7) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives modules offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Notes
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_012', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Design in Creative Media programme, you could embark on any of these exciting careers, including:
2D or 3D Animator
3D Modeler
3D Visualiser
AR Developer
Art Director
App Developer
Brand Strategist
Creative Director
Concept Artist
Printmaker
Illustrator
Graphic Designer
Film and Video Editor
VFX Designer
Motion Graphic Designer
Interactive Installation Designer
Web Designer
UI/UX Designer
VR Developer
Game Designer
Game Artist
Production Designer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_040', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Education. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM//O-level or equivalent with 5 Credits for entry with pre-university/ foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Note :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation / Diploma programme
Pass any Taylor''s Foundation /Diploma programme with CGPA 2.00.
Sijil Tinggi Pelajaran Malaysia (STPM)
Min. GPA 2.00 in 2 subjects
Unified Examination Certification (UEC)
A Pass with Minimum 5Bs.
A Level
Pass with min. Grade C in 2 subjects.
AUSMAT (SACEi)
Min. ATAR 60
Canadian Pre-University (CPU)
Average 60% in 6 subjects.
International Baccalaureate (IB)
Min. 26 points in 6 subjects.
Monash University Foundation Year (MUFY)
Overall 50%.
MOHE Matriculation
Pass with min. CGPA 2.00
Other Equivalent Qualification
Foundation/Pre U from other recognised institutions with CGPA 2.00; OR
Ministry of Education Matriculation CGPA 2.00; OR
Diploma from other recognised institutions with CGPA 2.00; OR
Higher School Cert from New South Wales (Yr 12) min 60% OR
Other equivalent qualifications recognised by the Malaysian Government
Application via APEL A is allowed
Notes :
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university''s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-University/Diploma
Complete Pre-University/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_040', 'CURRICULUM', 'Programme Structure', 'This degree programme is compatible with Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Philosophy and Curriculum Design
Education, School and Society
Teaching and Managing Diverse Learners in the Classroom
Learning, Assessment and Feedback
Year 2
Professional Practice 1 (PP1)
Professional Practice 2 (PP2)
Year 3
New Pedagogies – Digital Tools and Resources
The Reflective Practitioner: Teachers Investigate Their Work
Action Research Project
Theory into Practice
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
This component consists of specialisation subjects, which are primary modules based on the chosen specialisation that provides the fundamental knowledge of the discipline.
Specialisation: Primary Education
Year 1
Teaching Language Arts
Teaching Primary School English Language
Language Use and Society
Number & Algebra
Year 2
Measurement & Geometry
Statistics
Science - Systems and Cycles
Science - Energy and Interactions
Year 3
Nature of Science
Specialisation: Teaching of English
Year 1
Academic Reading & Writing
ELT Methodology
Introduction to Applied Linguistics I
Introduction to Applied Linguistics II (*)
Year 2
Introduction to Creative Writing
Language, Culture & Society
Materials Development in ELT
Year 3
Recent Developments in ELT
Capstone Project
Specialisation: Early Childhood Education
Year 1
Promoting Children''s Wellbeing
Early Science and Numeracy
Literacy and Language Development
Managing Behaviour and Safety
Advancing Play and Learning
Year 2
Introduction to Human Nutrition
Year 3
Inclusive Education
Entrepreneurship & Small Business
Capstone Project
Specialisation: Special Educational Needs
Year 1
Introduction to Children with Special Educational Needs
Supporting Children with Specific Learning Difficulties
Policy and Legislative Framework on Special Education
Assessment and Intervention for Children with Special Educational Needs
Managing Behaviour and Safety
Year 2
Behavioural Management in Special Education
Year 3
Inclusive Education BUS60304 Entrepreneurship & Small Business
Capstone Project
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component provides student the flexibility to study modules in a related or unrelated field from the same or different school to complement the Primary Major. It may be completed in a form of free electives, an extension, minors or a second major that typically requires at least one (1) semester of student learning time.
Click here to see a full list of all available Flexible Education Components.
[Choose ONE (1) of the packages]
Minor
Choose any Minor package* offered by Taylor’s University. Refer to the Flexible Education Guide for the list of Minor packages.
AND
Free Elective Modules
Choose any TWO (2) Free Electives* offered by Taylor’s University. Refer to the Flexible Education Guide for the list of Free Electives.
Second Major
Choose any Second Major package* offered by Taylor’s University. Refer to the Flexible Education Guide for the list of Second Major packages.
*Subject to availability.
*Meet min. module pre- & co-requisite.
Dr Mindy Tay Pei Lin
As Programme Director of the Bachelor of Education programme, Dr Mindy has been a teacher educator since 2015, working closely with students to develop both the knowledge and values needed to shape future learning environments.
With a PhD in Education specialising in teacher education, she is particularly experienced in teacher education, mathematics education, reflective practice, and problem-based learning. Her teaching approach places strong emphasis on meaningful learning, empathy, and real-world application.
Drawing from collaborations with refugee learning centres and organisations supporting learners with disabilities, Dr Mindy brings practical and socially grounded perspectives into programme design and teaching. The projects include mathematics literacy initiatives for underperforming students, STEM literacy programmes for refugee learning centres, and curriculum development work for out-of-school children.
She has also received various awards and recognitions in teaching, curriculum innovation, and educational research, including Platinum, Gold, and Silver awards at national and international education competitions, alongside recognition from institutions such as Universiti Malaya, Universiti Teknologi Malaysia, and the Ministry of Higher Education.
Dr Mindy hopes students leave the programme with not only a stronger understanding of education, but also a genuine love for teaching, a passion for lifelong learning, and a deep sense of compassion for children.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_040', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this programme, you could embark on any of these exciting careers, including:
Primary School Teachers
Special Educational Needs Teachers
Educational Institution Administrators
Educational Researchers
Tutors
Learning Mentors
School Administrators
Academic Librarians
Consultants
Corporate Trainers
Subject Teachers
Homeroom Teachers
Educational Counsellors
Edupreneurs
Preschool Teachers
Preschool and Childcare Centre Directors
Industry Advisor / Analyst / Leaders
Educational Researchers', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_022', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Chemical Engineering. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma
qualification.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
ATAR 65 including Mathematics (preferably Specialist Mathematics) and Physics / Chemistry
A Level
Min. DDD including Mathematics and Physics / Chemistry
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects including Advanced Functions, Calculus & Vectors and Physics / Chemistry
Sijil Tinggi Persekolahan Malaysia (STPM)
CC in Mathematics and Physics / Chemistry
Unified Examination Certificate (UEC)
A Pass in UEC with 5Bs with maximum 25 points including Mathematics and Physics / Chemistry
Taylor’s Foundation in Engineering (FIE)
Pass Foundation in Engineering with min. CGPA 2.00
Foundation in Science (FIS)
Pass Foundation in Science with min CGPA of 2.00 including Mathematics and Physics / Chemistry
International Baccalaureate (IB)
Min. 24 points in 6 subjects including Mathematics and Physics / Chemistry
Monash University Foundation Year (MUFY)
Overall 50% including Physics A&B / Chemistry A&B and Mathematics A&B
Other Qualifications
Ministry of Education Matriculation in related field min. CGPA 2.00 including
OR
Foundation in the Field of Engineering with min. CGPA 2.00
OR
Diploma in Engineering with min. CGPA2.00 from any institution recognised by the Malaysian Govt.
Application via APEL A is allowed.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 4.0
TOEFL
30-31 (Internet Based Test)
MUET
Band 3.0
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.0 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_022', 'CURRICULUM', 'Programme Structure', 'Our curriculum places a strong emphasis on the practical application of knowledge. Through hands-on laboratory experiments and industry-relevant projects, you will gain valuable experience in applying theoretical concepts to real-world scenarios.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Engineering Mathematics and Modelling I
Engineering Mathematics and Modelling II
Engineering Design and Analysis
Programming Techniques
Thermofluid Engineering I
Fundamental of Chemical Process Analysis
Year 2
Sustainable Development in Engineering
Engineering Design and Project Management
Biochemical Processes
Heat and Mass Transfer
Flexible Studies (Choose Minor OR Free Electives package)
Year 3
Separation Processes
Chemical Engineering Thermodynamics and Simulation
Process Control and Instrumentation
Process Plant Design and Economics
Advanced Heat and Momentum Transfer
Chemical Reaction Engineering
Specialisation Module
Industrial Training
Year 4
Final Year Engineering Project I
Final Year Engineering Project II
Chemical Engineering Group Project I
Chemical Engineering Group Project II
Professional Engineers and Society
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
Specialisation 1: Smart Manufacturing
Additive Manufacturing
Advanced Manufacturing Systems
Internet of Things
Big Data Technologies
Specialisation 2: Sustainability in Engineering
Renewable and Alternative Energies
Decarbonisation Technology
Fuel Cell and Hydrogen Energies
Engineering Economics and Environmental Impact
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to Flexible Education Guide for the complete list.
Entrepreneurship
Robotics Design
Project Management
The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Washington Accord: International Engineering Alliance
At Taylor''s University, our Engineering degrees offer you international recognition under the esteemed Washington Accord. This recognition means that your Engineering qualifications will be acknowledged by countries such as Australia, Canada, China, Chinese Taipei, Hong Kong, India, Ireland, Japan, Korea, New Zealand, Pakistan, Peru, Russia, Singapore, Sri Lanka, South Africa, Turkey, the United Kingdom, and the United States - all of whom are signatories of the accord.
This recognition holds immense value for you as a graduate. It allows you to pursue a professional engineering career in any of these signatory countries without the need for re-qualification. This opens up exciting opportunities and enhances your global presence, enabling you to make a meaningful impact in industries worldwide.
Dr Firnaaz Ahamed
As Programme Director for the Chemical Engineering programme, Dr Firnaaz brings 11 years of experience spanning both academia and industry. Through the programme, he supports students in developing a strong foundation in chemical engineering principles and their practical applications.
Holding a PhD in Computational Biochemical Process Engineering, Dr Firnaaz''s research focuses on using computational simulations to understand how microorganisms function, regulate their metabolism, and interact within complex environments such as soil, rivers, the human gut, and industrial bioprocesses.
Prior to joining academia, he worked in the oil and gas services sector, where he was responsible for designing, producing, and troubleshooting drilling fluids for offshore projects across the Asia-Pacific region. This industry experience continues to inform his approach to engineering education and real-world problem solving.
Dr Firnaaz is also a Chartered Engineer (CEng) with the Institution of Chemical Engineers (IChemE), United Kingdom.
Drawing from both academic and industry experience, Dr Firnaaz encourages students to build strong engineering fundamentals, apply their knowledge across diverse real-world contexts, and remain adaptable as technologies and industries continue to evolve.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_022', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Chemical Engineering programme, you could embark on any of these exciting careers, including:
Biochemical Engineer
Biomedical Engineer
Biomolecular Engineer
Biotechnology Engineer
Chemical Process Engineer
Corrosion Engineer
Electrochemistry Engineer
Environmental Engineer
Food Process Engineer
Oil & Gas Engineer
Petrochemical Engineer
Petroleum Engineer
Process Engineer
Safety Engineer
Waste Management Engineer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_021', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Electrical and Electronic Engineering. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Note: All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
ATAR 65 including Mathematics (preferably Specialist Mathematics) and Physics / Chemistry
A Level
Min. DDD including Mathematics and Physics / Chemistry
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects including Advanced Functions, Calculus & Vectors and Physics / Chemistry
Sijil Tinggi Persekolahan Malaysia (STPM)
CC in Mathematics and Physics / Chemistry
Unified Examination Certificate (UEC)
A Pass in UEC with 5Bs with maximum 25 points including Mathematics and
Physics / Chemistry
Taylor’s Foundation in Engineering (FIE)
Pass Foundation in Engineering with min. CGPA 2.00
Foundation in Science (FIS)
Pass Foundation in Science with min CGPA of 2.00 including Mathematics and Physics / Chemistry
International Baccalaureate (IB)
Min. 24 points in 6 subjects including Mathematics and Physics / Chemistry
Monash University Foundation Year (MUFY)
Overall 50% including Physics A&B / Chemistry A&B and Mathematics A&B
Other Qualifications
Ministry of Education Matriculation in related field min. CGPA 2.00 including
OR
Foundation in the Field of Engineering with min. CGPA 2.00
OR
Diploma in Engineering with min. CGPA2.00 from any institution recognised by the Malaysian Govt.
Application via APEL A is allowed.
Notes:
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 4.0
TOEFL
30-31 (Internet Based Test)
MUET
Band 3.0
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.0 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note: All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_021', 'CURRICULUM', 'Programme Structure', 'Throughout the programme, you will delve into the intricacies of electrical and electronic engineering. You will gain a comprehensive understanding of key concepts, theories, and principles that form the backbone of the discipline. From circuit analysis to power systems, electronic devices to signal processing, you will explore a wide range of topics essential to electrical and electronic engineering.
You will have the opportunity to work on sophisticated scientific and industrial technology projects, gaining first-hand experience in creating, designing, and implementing electrical and electronic systems.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Engineering Mathematics and Modelling I
Engineering Design and Analysis
Circuits and Signals
Programming Techniques
Electromagnetic Fields & Waves
Engineering Mathematics and Modelling II
Digital and Analogue Electronics
Year 2
Communication Systems
Microprocessors and Computer Architecture
Engineering Design and Project Management
Electrical Power and Machines
Flexible Studies (Choose Minor OR Free Electives package)
Year 3
Power System Analysis and Protection
Power Electronics and Industrial Drives
Automatic Control and Instrumentation
High Voltage Engineering
Industrial Training
Year 4
Electrical & Electronic Engineering Group Project I
Final Year Engineering Project I
Electrical Energy Generation and Utilisation
Electrical & Electronic Engineering Group Project II
Final Year Engineering Project II
Professional Engineers and Society
Note: All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
Specialisation 1: Renewable Energy
Sustainable Buildings
Engineering Economics and Environmental Impact
Renewable and Alternative Energies
Energy Storage and Transmission
Specialisation 2: AI for Engineers
Machine Learning for Engineers
Digital Imaging Processing
Deep Learning for Engineers
Unmanned Systems
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note:
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Design and Manufacturing
Entrepreneurship
Project Management
The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Washington Accord: International Engineering Alliance
At Taylor''s University, our Engineering degrees offer you international recognition under the esteemed Washington Accord. This recognition means that your Engineering qualifications will be acknowledged by countries such as Australia, Canada, China, Chinese Taipei, Hong Kong, India, Ireland, Japan, Korea, New Zealand, Pakistan, Peru, Russia, Singapore, Sri Lanka, South Africa, Turkey, the United Kingdom, and the United States - all of whom are signatories of the accord.
This recognition holds immense value for you as a graduate. It allows you to pursue a professional engineering career in any of these signatory countries without the need for re-qualification. This opens up exciting opportunities and enhances your global presence, enabling you to make a meaningful impact in industries worldwide.
Associate Professor Ir Dr Eric Pang Wai Leong
As Associate Professor and Programme Director (Electrical & Electronic Engineering) at the School of Engineering, Assoc. Prof Ir Dr Pang brings over 20 years of experience in engineering education and research, having begun his academic career in 2004.
Holding a PhD in Engineering, his areas of expertise include wireless communications and networking, IoT systems and smart applications, VLSI and digital design, FPGA and hardware modelling, as well as machine learning applications in communications and IoT.
Dr Pang has worked closely with industry through consultancy and collaborative projects with organisations such as Telekom Malaysia R&D and OCK Berhad. He is also a Professional Engineer with Practising Certificate (Ir./PEPC), ensuring strong alignment between academic delivery and industry practice.
His professional standing is reflected through appointments and memberships including Senior Member of the IEEE (SMIEEE) and Member of the Institution of Engineers Malaysia (MIEM).
Dr Pang emphasises the importance of responsibility, professionalism, integrity, and accountability in engineering practice. He also encourages students to continuously learn and adapt as technologies and industry demands evolve.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_021', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Electrical and Electronic Engineering programme, you could embark on any of these exciting careers, including:
Appliances Engineer
Communication Engineer
Computer Engineer
Construction Engineer
Control Engineer
Electrical and Electronics Engineer
Instrumentation Engineer
Mechatronic Engineer
Medical Engineer
Microelectronics Engineer
Power Engineer
Signal Processing Engineer
Software Engineer
Telecommunications Engineer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_023', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Chemical Engineering. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM/O-Level with Pre-University/Foundation
Pass SPM/O-level or equivalent with 5 credits for entry with Pre-U/Foundation qualification (Except for UEC).
SPM/O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Note: All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
AUSMAT (SACEi)
ATAR 65 including Mathematics (preferably Specialist Mathematics) and Physics / Chemistry
A Level
Min. DDD including Mathematics and Physics / Chemistry
Canadian Pre-University (CPU)
Min. average of 60% in 6 subjects including Advanced Functions, Calculus & Vectors and Physics / Chemistry
Sijil Tinggi Persekolahan Malaysia (STPM)
CC in Mathematics and Physics / Chemistry
Unified Examination Certificate (UEC)
A Pass in UEC with 5Bs with maximum 25 points including Mathematics and Physics / Chemistry
Taylor’s Foundation in Engineering (FIE)
Pass Foundation in Engineering with min. CGPA 2.00
Foundation in Science (FIS)
Pass Foundation in Science with min CGPA of 2.00 including Mathematics and Physics / Chemistry
International Baccalaureate (IB)
Min. 24 points in 6 subjects including Mathematics and Physics / Chemistry
Monash University Foundation Year (MUFY)
Overall 50% including Physics A&B / Chemistry A&B and Mathematics A&B
Other Qualifications
Ministry of Education Matriculation in related field min. CGPA 2.00 including
OR
Foundation in the Field of Engineering with min. CGPA 2.00
OR
Diploma in Engineering with min. CGPA2.00 from any institution recognised by the Malaysian Govt.
Application via APEL A is allowed.
Notes :
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 4.0
TOEFL
30-31 (Internet Based Test)
MUET
Band 3.0
Pre-University/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS score of 5.0 OR its equivalent
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_023', 'CURRICULUM', 'Programme Structure', 'Throughout the programme, you will gain a deep understanding of the principles and technologies that drive these industries forward. You will explore the intricate workings of automotive systems, power generation processes, aerospace engineering, and advanced manufacturing techniques. By immersing yourself in these subjects, you will acquire the knowledge and skills necessary to excel in a rapidly evolving technological landscape.
In addition to industry-specific knowledge, we prioritise the development of your physics and mathematical skills. These foundational skills are crucial in the digital economy, enabling you to analyse complex problems, make data-driven decisions, and contribute to innovative solutions. By honing your abilities in these areas, you will be well-prepared for a wide range of careers that can positively impact the lives of many.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Engineering Mathematics and Modelling I
Engineering Mathematics and Modelling II
Engineering Design and Analysis
Programming Techniques
Materials and Manufacturing
Thermofluid Engineering I
Introduction to Electronics & Electrical Power Machines
Year 2
Engineering Design and Project Management
Thermofluid Engineering II
Engineering Solid Mechanics
Year 3
Electronics & Microprocessors
Automatic Control and Instrumentation
Engineering Dynamics
Finite Element Method and Simulation
Mechanical Vibration
Specialisation Module
Industrial Training
Year 4
Final Year Engineering Project I
Final Year Engineering Project II
Mechanical Engineering Group Project I
Mechanical Engineering Group Project II
Professional Engineers and Society
Note: All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
Specialisation 1: Smart Manufacturing
Sustainable Development in Engineering
Additive Manufacturing
Advanced Manufacturing Systems
Internet of Things
Big Data Technologies
Specialisation 2: Sustainability in Engineering
Sustainable Developement in Engineering
Renewable and Alternative Energies
Sustainable Thermofluid Engineering Systems
Fuel Cell and Hydrogen Energies
Engineering Economics and Environment Impact
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Notes:
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Robotics Design
Project Management
The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Washington Accord: International Engineering Alliance
At Taylor''s University, our Engineering degrees offer you international recognition under the esteemed Washington Accord. This recognition means that your Engineering qualifications will be acknowledged by countries such as Australia, Canada, China, Chinese Taipei, Hong Kong, India, Ireland, Japan, Korea, New Zealand, Pakistan, Peru, Russia, Singapore, Sri Lanka, South Africa, Turkey, the United Kingdom, and the United States - all of whom are signatories of the accord.
This recognition holds immense value for you as a graduate. It allows you to pursue a professional engineering career in any of these signatory countries without the need for re-qualification. This opens up exciting opportunities and enhances your global presence, enabling you to make a meaningful impact in industries worldwide.
AP. Ts Dr Choo Hui Leng
As Programme Director for the Mechanical Engineering programme and Cluster Leader for Advanced Materials and Manufacturing for Sustainable Engineering, AP Ts Dr Choo brings more than 15 years of experience in higher education and engineering research.
Holding a PhD in Mechanical Engineering specialising in polymer processing, his areas of expertise include additive manufacturing (3D printing), process optimisation, polymer composites, and sustainable materials.
His work includes multidisciplinary projects such as the development of a Braille Pad and radiation shielding materials using 3D printing, alongside industry collaborations in additive manufacturing and process optimisation. These experiences have contributed to the development of the programme''s Smart Manufacturing specialisation, including modules in Additive Manufacturing and Advanced Manufacturing Systems.
Dr Choo is a Chartered Engineer with the Engineering Council UK, a Member of the Institution of Mechanical Engineers (IMechE), a Professional Technologist (Material Technology) with MBOT, and a committee member of the Institute of Materials Malaysia. He was also recognised through the RISE Educator Award: Taylorian Edition in 2022.
Dr Choo emphasises the importance of applying engineering knowledge in real-world settings while developing problem-solving, teamwork, communication, and adaptability. He also encourages students to cultivate professional ethics and responsibility as they prepare to contribute to industry and society.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_023', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Mechanical Engineering programme, you could embark on any of these exciting careers, including:
Aerospace Engineer
Aircraft Engineer
Automotive Engineer
Industrial Engineer
Manufacturing Engineer
Materials Engineer
Mechatronic and Robotic Engineer
Medical Engineer
Product Development Engineer
Project Engineer
Systems Engineer', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_015', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of International Hospitality Management (Honours). To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM//O-level or equivalent with 5 credits for entry with pre-university / foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Notes :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Requirement
Entry Requirement
Taylor’s Foundation / Diploma
Pass any Taylor''s Foundation / Diploma Programme.
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects.
International Baccalaureate (IB)
Min. 24 points in 6 subjects.
Monash University Foundation Year (MUFY)
Overall 50%
MOHE Matriculation
Pass with min. CGPA 2.00
Other Equivalent Qualification
Pass Foundation from other institution recognised by Malaysian Government with min. CGPA 2.00.
Pass Diploma from other institution recognised by Malaysian Government with min CGPA 2.00.
Any other equivalent qualification recognised by the Malaysian Government.
Application via APEL A is allowed.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_015', 'CURRICULUM', 'Programme Structure', 'Our curriculum is thoughtfully designed to equip you with the relevant knowledge and abilities needed to thrive in the industry. By immersing yourself in a dynamic learning environment, you will gain the confidence and adaptability required to shine in different service-oriented roles.
This programme is also compatible with the new Taylor''s Curriculum Framework that allows you to mix & match study modules.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Introduction to Restaurant Operations
Business of Hospitality, Food and Leisure Management
Accommodation Management
Food Safety and Sanitation
Room Division Management
Beverage Management
Introduction to Restaurant Operations
Understanding Entrepreneurialism
Hotel Revenue Management
Culinary Essentials
Year 2
Research Methods
French Basic
Hospitality Management and Leadership
F&B Operations Management
Hotel Innovation Management
Service Quality Management in Hospitality
Year 3
Research Project
Hospitality Business Modelling
Hospitality Project Management
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Extension
Convention & Hospitality Management
Convention and Banquet Sales
Conventions & Meetings Management
Event and Tourism Risk Management
Event Project Management
Luxury Brand Management
Minor
Choose any Minor package* offered by Taylor’s University.
Refer to the Flexible Education Guide for the list of Minor packages.
Second Major
Choose any Second Major package* offered by Taylor’s University.
Refer to the Flexible Education Guide for the list of Second Major packages.
Free Electives
Choose any FIVE (5) Free Electives** offered by Taylor’s University.
Refer to the Flexible Education Guide for the list of Free Electives.
Dr Vinayaraj Mothiravally, Programme Director
We are here to empower our students for global careers with top-ranked programme, facilities, and industry collaborations.
VIEW ALL LECTURERS
Dr Vinayaraj Mothiravally, Programme Director
We are here to empower our students for global careers with top-ranked programme, facilities, and industry collaborations.
VIEW ALL LECTURERS
Dr Vinayaraj Mothiravally, Programme Director
We are here to empower our students for global careers with top-ranked programme, facilities, and industry collaborations.
VIEW ALL LECTURERS
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_015', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of International Hospitality Management programme, you could embark on any of these exciting careers, including:
Business Development Manager
Convention / Events Planner
Cost Control Manager
Customer Service Manager
Director of Operations
Exhibition Manager
Executive Housekeeper
Director of Food & Beverage
Director of Marketing
Director of Restaurants
Front Office Manager
Hotel Manager
Human Resource Manager
Public Relations Manager
Purchasing Manager
Restaurant Manager
Revenue Manager
Rooms Division Manager
Training Manager', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_018', 'ADMISSIONS', 'Entry Requirements', 'Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM//O-level or equivalent with 5 credits for entry with pre-university / foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Notes :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Requirements
Entry Requirements
Taylor’s Foundation / Diploma
Pass any Taylor''s Foundation / Diploma Programme
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
50%
MOHE Matriculation
Pass with min. CGPA 2.00
Other Equivalent Qualification
Pass Foundation from other institution recognised by Malaysian Government with min. CGPA 2.00.
Pass Diploma from other institution recognised by Malaysian Government with min CGPA 2.00.
Any other equivalent qualification recognised by the Malaysian Government.
Application via APEL A is allowed.
Note :
*All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_018', 'CURRICULUM', 'Programme Structure', 'Throughout the 12-month programme, you will delve into various interdisciplinary subjects that encompass the diverse aspects of hospitality management. You will explore topics such as strategic management, marketing, finance, operations, human resources, and entrepreneurship, all within the context of the hospitality industry.
One of the key strengths of the programme is its industry orientation. You will have the opportunity to learn from experienced industry professionals, participate in industry visits and internships, and engage in real-world projects that simulate the challenges and complexities of the hospitality industry. This hands-on approach ensures that you develop practical skills that are highly valued by employers and enables you to apply your knowledge in real-world settings.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Principles of Marketing
Business of Hospitality, Food and Leisure Management
Events and Entertainment
Design for Events
Social Media for Events
Trends and Issues in International Event Management
Conventions and Meetings Management
Event Sponsorship and Funding
Events Project Management
Year 2
Research Methods
French Basic
Events Operations
Sustainable Event Management
Event Technology
Exhibition Management
Year 3
Research Project
Live Event Project
Event and Tourism Risk Management
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
Dr Khairiah Ismail
As Programme Director for the Bachelor of International Events Management, Dr Khairiah brings 16 years of experience in events education, supporting students in developing the knowledge and practical skills required within the events industry.
Holding a PhD in Tourism from Universiti Putra Malaysia, her areas of specialisation include Events Management, Entertainment Events, Event Risk, Event Safety and Security, Business Events, and Tourism Risk. Her expertise also extends to music festivals, location-based services (LBS), dark tourism, and community-based initiatives within the tourism and events context.
Dr Khairiah actively engages in industry collaborations and real-world event projects, ensuring that programme delivery remains connected to current industry practices and expectations.
Under her guidance, the Hype-Lah Charity Project organised by her students was awarded Champion at the Malaysia Business Events Awards (MBEA) 2024 under the University Programme – Students Organised category.
Dr Khairiah emphasises the importance of strong organisational skills, professionalism, critical thinking, and effective teamwork. She encourages students to develop the confidence to manage real-world events and communicate effectively with clients and stakeholders.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_018', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this Bachelor of International Events Management (Honours) programme, you could embark on any of these exciting careers, including:
Convention Centre Manager
Convention / Events Planner
Convention Services Manager
Entertainment Manager
Entrepreneur
Events Manager
Exhibition Manager
Gaming Manager
Incentive Organiser
Professional Conference Organiser (PCO)
Sporting Event Organiser
Theme Park Manager', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_017', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of International Tourism Management (Honours). To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM//O-level or equivalent with 5 credits for entry with pre-university / foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM/O-level or equivalent with 3 credits for entry with Diploma qualification.
Notes :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Requirements
Entry Requirements
Taylor’s Foundation / Diploma
Pass any Taylor''s Foundation / Diploma Programme
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 55
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
MOHE Matriculation
Pass with min. CGPA 2.00
Other Equivalent Qualification
Pass Foundation from other institution recognised by Malaysian Government with min. CGPA 2.00.
Pass Diploma from other institution recognised by Malaysian Government with min CGPA 2.00.
Any other equivalent qualification recognised by the Malaysian Government.
Application via APEL A is allowed. For the requirements please refer to the index page.
Note :
*All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_017', 'CURRICULUM', 'Programme Structure', 'As a full-scale bachelor of tourism curriculum, this programme covers topics such as tourism marketing, destination management, sustainable development, event management, and cultural studies—ensuring a 360° understanding of travel services and sectors. Students will be equipped with functional and managerial skills, as well as knowledge in business, communication, culture and arts, events, and tourism studies. The curriculum has been strengthened with international and local content, preparing graduates to work in different parts of the world.
The programme is highly recognised by the industry and was awarded the Business Events (BE) Education Excellence Award and accredited as an International Centre of Excellence in Event Management.
This degree is compatible with the new Taylor''s Curriculum Framework that allows students to mix & match study modules.
Primary Major
Primary Major
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Principles of Marketing
Business of Hospitality, Food and Leisure Management
Leisure Attraction Management
Destination Geography and Analysis
Strategic Destination Marketing and Branding
Tourism Economics
Tourism Business Management
Understanding Entrepreneurialism
Airline and Airport Management
Year 2
Research Methods
French Basic
Sociology of Tourism
Data and Media Analysis for Tourism
Sustainable Tourism Development
Tourism Product Design and Development
Year 3
Research Project
Tourism Integrated Project
Event and Tourism Risk Management
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
Dr Thanam Subramaniam
As Senior Lecturer and Programme Director for the Bachelor of International Tourism Management, Dr Thanam brings 16 years of experience in academia across economics, business, and tourism. Prior to joining Taylor''s University, she also served as Programme Leader for a Bachelor of Marketing and Media programme.
Holding a PhD in Tourism from Universiti Putra Malaysia, her areas of specialisation include Tourism Marketing, Tourism Experiences, Tourist Behaviour, Tourism Economics, and Sustainable Tourism. She is particularly passionate about teaching and guiding students through tourism-related projects.
Since 2023, Dr Thanam has actively engaged in industry collaborations and real-world tourism projects, bringing current industry perspectives into her teaching, research, and programme development.
Her contributions have been recognised through achievements including the PATA Gold Award for Best Cultural Heritage Preservation for a student project in Lenggong, as well as a Bronze Award at IUCEL 2025 for a project exploring the use of AI in monitoring real-world public relations projects.
Dr Thanam encourages students to develop confidence, critical and creative thinking skills, professionalism, and adaptability. She also emphasises the importance of effective collaboration, responsible use of emerging technologies, professional ethics, and lifelong learning within the evolving tourism industry.
View All Lecturers
0" class="speaker-and-expert-card-root">
{{ speaker.name }}
{{ vm.selectedCard.name }}
{{ vm.selectedCard.title }}
{{ vm.selectedCard.informationText }}
0" class="highlight-wrapper mt-6">
{{ highlight.descriptionText }}
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_017', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this degree programme, you could embark on any of these exciting careers, including:
Destination Brand Manager
Destination Development Specialist
Incentive Specialist
Recreation Entrepreneur
Sports & Recreation Manager
Tour Manager
Tourism Office
Tour Planner
Tourism Bureau Manager
Tour Company Manager
Travel Consultant
Travel Journalist
Travel Retail Manager', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_029', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Laws. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U or Foundation Qualification
Pass SPM / O-Level or equivalent with 5 credits (including English) for entry with pre-university / foundation qualification (Except for UEC)
SPM / O-Level with Diploma Qualification
Pass SPM / O-Level or equivalent with 3 credits (including English) for entry with Diploma qualification.
Prerequisite for CLP
Students who wish to pursue the CLP Examinations will be required to show 5 credits in SPM / equivalent in one (1) sitting, prior to joining the programme
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Requirements
Entry Requirements
Taylor’s Foundation*
Pass with min. CGPA 2.67/4.00
Taylor’s Diploma*
Pass with min. CGPA 2.67/4.00 in a related discipline
Sijil Tinggi Persekolahan Malaysia (STPM)
Pass STPM with CGPA 2.67 in 2 subjects with at least a Pass in Pengajian Am
Unified Examination Certificate (UEC)
A Pass in UEC with a minimum of 5Bs including English, with a maximum of 20 points. For entry with UEC, the SPM prerequisites of 5 credits in one (1) sitting (prior to joining the programme), must be satisfied for students’ who wish to sit for CLP Exam. Candidates without a Grade ‘B’ in UEC English may be admitted if the candidate has a credit in English at SPM or equivalent
A Level
Min. CC / BD / AD
AUSMAT (SACEi)
Min. ATAR 70
Canadian Pre-University (CPU)*
Min. average of 65% in 6 subjects
International Baccalaureate (IB)
24 points in 6 subjects and at least 4 points for 3 Higher Level subjects
Monash University Foundation Year (MUFY)
Overall 60%
Other Qualifications*
Pass Foundation/ Matriculation recognised as an equivalent by the Malaysian Government / Diploma in a related discipline recognised as an equivalent by the Malaysian Government with Min CGPA of 2.67
Note :
Students are advised to check with LPQB (Legal Profession Qualifying Board) on the recognition of the Pre-U programme for purposes of pursuing the CLP (Certificate of Legal Practice)
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Overall Band 6.0
TOEFL
60 - Internet Based Test (20 in writing)
MUET
Band 4
Other Equivalent English Qualifications
Students with other qualifications will be considered on a case-by-case basis
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS  (or Equivalent)
Band 6.0
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
Note :
- International students may join IEN Preparatory Course and achieve the IELTS score.
- All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_029', 'CURRICULUM', 'Programme Structure', 'Our curriculum is thoughtfully designed to equip you with the relevant knowledge and abilities needed to thrive in the industry. By immersing yourself in a dynamic learning environment, you will gain the confidence and adaptability required to shine in different service-oriented roles.
This programme is compatible with the new Taylor''s Curriculum Framework that allows students to mix and match study modules.
Click here to find out more about the Taylor''s Curriculum Framework.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provide the fundamental knowledge of the discipline.
Core Modules
Year 1
Contract Law I
Contract Law II
Law of Tort I
Law of Tort II
Constitutional and Administrative Law I
Constitutional and Administrative Law II
English Legal System
Legal Skills and Methods
Malaysian Legal System
Year 2
Constitutional and Administrative Law III
Criminal Law I
Criminal Law II
Land Law I
Land Law II
Public International Law
Mooting
Year 3
Company Law
Equity and Trusts I
Equity and Trusts II
Family Law
Land Law III
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Malaysian students are required to take Bahasa Kebangsaan A if they do not obtain a Credit for Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the packages below.
Extension
Corporate Law
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list. The minors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Recommended Packages
Business Analytics
Entrepreneurship
Accounting
Journalism And Media Practice
Psychology
Management
Second Major
You will need to select any Major packages offered by Taylor''s University. We have provided some suggested packages below, and you can refer to the Flexible Education Guide for the complete list. The majors offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Recommended Packages
Education
Psychology
Creative Media Design
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Dr Ambikai S. Thuraisingam, Programme Director
School of Law and Governance: A community dedicated to transformative legal education and research, shaping responsible legal practitioners.
VIEW ALL LECTURERS
Dr Ambikai S. Thuraisingam, Programme Director
School of Law and Governance: A community dedicated to transformative legal education and research, shaping responsible legal practitioners.
VIEW ALL LECTURERS
Dr Ambikai S. Thuraisingam, Programme Director
School of Law and Governance: A community dedicated to transformative legal education and research, shaping responsible legal practitioners.
VIEW ALL LECTURERS
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_029', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Laws programme, you could embark on any of these exciting careers, including:
Solicitor
Academia
Researcher
Corporate Legal Advisor
Legal Writer
Journalist
Forensic Investigator
Criminal Investigator
Company Secretarial', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_043', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Performing Arts programme. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / O-Level or equivalent with 5 credits for entry with Pre-University / Foundation qualification (Except for UEC).
SPM / O-Level with Diploma
Pass SPM / O-Level or equivalent with 3 credits for entry with Diploma qualification.
Note :
1. Candidates need to pass BM and History at SPM level.
2. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Audition
Audition
Prepare adequately for the audition with the guidance provided by our experts, tailored to meet the requirements of each specialisation.
1. Format:
Video recording (MP4 or MOV format preferred)
Duration: 2–5 minutes
Clear audio and visual quality
2. Content:
Dance Specialisation: One solo piece (contemporary, traditional, or classical) demonstrating technique, creativity, and performance quality. (2-3 minutes)
Music Specialisation: One performance of a chosen song (2-3 minutes).
Performance Specialisation: One monologue, original or published play showing character interpretation and vocal clarity. (2-3 minutes)
3. Introduction
State the following details before beginning your performance:
Full name
Specialisation (Dance / Music / Performance)
Title of your piece
4. Submission Method
Upload your video to YouTube, and submit the link only
File name format: FullName_Specialisation_Audition2026
5. Assessment Criteria
Technique and control
Creativity and originality
Expression and interpretation
Stage presence and confidence
Overall presentation
Entry Pathway
Entry Pathway
Specialisation Audition
Pass
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
Pass with min. 5Bs
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 50
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
50%
MOHE Matriculation
Pass with min. CGPA 2.00
Taylor’s Foundation and Diploma programmes
Pass any Taylor''s Foundation / Diploma programme with CGPA 2.00
Other Equivalent Qualification
Pass Foundation from any other institution recognised by MOHE; or
Pass Diploma from any other institution recognised by MOHE; or
Pass Matriculation from an institution recognised by MOHE; or
Any other equiv. qualification recognized by M''sian Government.
Application via APEL A is allowed.
Note :
All Malaysian students are required to attain a Pass in Bahasa Melayu and English in SPM / O-Level / UEC / IGCSE or equivalent.
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
Students must pass auditions for the performance, dance, and music tracks.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall Score 5.0
Taylor''s IEN
Level 2 - Grade C
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.0
Pre-U/Diploma
Completed Pre-U/Diploma that was conducted in English
And
Technical Theatre track
Pass Interview; or
Performance track
Pass Audition
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_043', 'CURRICULUM', 'Programme Structure', 'Embark on a transformative journey with our performing arts programme, where you will learn from highly qualified academicians and esteemed industry leaders dedicated to nurturing the next generation of creative professionals. Our programme is designed to equip you with the knowledge, skills, and practical insights necessary to excel in your chosen field.
The programme contains modules that include Performance, Directing, History of Theatre, Devising Performance Text, Voice and Speech, Movement, Technical Theatre, Stage Costume, Hair and Makeup, Stage Lighting, Stage Sound, Stage Set Design, Stage Management, Scenography, Dance and Music.
Co-created, co-designed and co-delivered by Taylor''s University, top industry professionals and renowned Adjuncts
Collaborative teaching & learning by leaders in education and performing arts
Flexible learning spaces at Taylor''s University Lakeside
This programme is compatible with the new Taylor''s Curriculum Framework that allow you to mix & match study modules.
Primary Core
Primary Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Introduction to Performing Arts
History of Theatre
Introduction to Acting
Year 2
Acting 1
Fundamentals of Choir Performance
Fundamentals Mechanics of Filmmaking
Introduction to Creative Writing
Introduction to Dance and Creative Processes
Directing 1 & 2
Year 3
Production Practicum
Production and Stage Management
Research Methodology
Internship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Specialisation
Specialisation
Performance Specialisation:
This track is your gateway to a world of storytelling and expression, equipping you with the tools to bring characters to life. Dive into the art of devising performance texts, master the nuances of voice and speech, and let your body speak through movement. Through our acting modules, you''ll also refine your skills to captivate any audience.
Subjects:
Devising Performance Text
Voice and Speech 1 & 2
Movement 1 & 2
Acting 2 & 3
Music Specialisation:
Perfect your language and diction, and learn the art of movement and stagecraft to become a versatile musician. Develop your ear and musicianship skills, and dive deep into vocal studies. Your talent is your instrument, so you will explore a rich repertoire of songs and scenes while honing your craft.
Subjects:
Language and diction
Movement and stagecraft
Musicianship and ear training
Principle vocal studies
Repertory and song
Scene studies
Vocal styles and musical theatre
Dance Specialisation:
Step into a world of movement and rhythm. Embrace the grace of Ballet, the expressive flair of Contemporary Dance, the vibrant energy of Hip Hop and Jazz Dance, and even the rich traditions of Silat and Malaysian Traditional Dance. Dance isn''t just an art; it''s a language of the soul, and this track guides you to become fluent.
Subjects:
Ballet Technique I & II
Contemporary Dance I & II
Hip Hop and Jazz Dance
Silat
Malaysian Traditional Dance
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
You will need to select any one (1) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Raziman Sarbini, Programme Director
BPA offers a comprehensive curriculum designed to cultivate your artistic talents and professional skills. By combining hands-on training with theoretical knowledge, we prepare students to thrive in the diverse and dynamic field of performing arts.
VIEW ALL LECTURERS
Raziman Sarbini, Programme Director
BPA offers a comprehensive curriculum designed to cultivate your artistic talents and professional skills. By combining hands-on training with theoretical knowledge, we prepare students to thrive in the diverse and dynamic field of performing arts.
VIEW ALL LECTURERS
Raziman Sarbini, Programme Director
BPA offers a comprehensive curriculum designed to cultivate your artistic talents and professional skills. By combining hands-on training with theoretical knowledge, we prepare students to thrive in the diverse and dynamic field of performing arts.
VIEW ALL LECTURERS
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_043', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Performing Arts programme, you could embark on any of these exciting careers, including:
Stage, TV, and Film
Actor / Actress, Singer, Dancer
Director
Writer
Producer
Stage Manager
Production Manager
Performer
Scriptwriter
Presenter
Movement Coach
Corporate Training
Storyteller
Education
Drama teacher
Dance teacher
Voice teacher
Arts researcher
Speech Teacher
Teacher / Lecturer
Advocacy and Media
Arts and Culture Manager
Curator
Arts writer / Critic', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_041', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Psychology. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level with Pre-U / Foundation
Pass SPM / O-level or equivalent with 5 credits in Mathematics, Biology/Physics/ Chemistry/ General Science/Applied Science and a Pass in English (Except for UEC).
SPM / O-Level with Diploma
Pass SPM//O-level or equivalent with 3 credits in Mathematics, Biology/Physics/ Chemistry/ General Science/Applied Science and a Pass in English for entry with Diploma Qualification.
Note:
1. Candidates without a credits in Mathematics, Biology/ Physics/Chemistry/ General Science/ Applied Science and a Pass in English at SPM level or its equivalent may be admitted if the STPM / Foundation / Diploma/Matriculation programme contains subjects in Mathematics, Biology/Physics/ Chemistry/ General Science/Applied Science and English that are equivalent or higher to Mathematics, Biology/ Physics/ Chemistry/ General Science/ Applied Science and English at SPM level.
2. Those without a pass/credit in Mathematics, Biology/ Physics/Chemistry/ General Science/Applied Science at SPM level or equivalent can be admitted but must attend special enhancement course(s). These special enhancement courses should be SPM equivalent, remedial. Students must pass/credit the Mathematics and Biology/ Physics/ Chemistry/General Science/ Applied Science enhancement courses as a prerequisite to related core courses taught in English.
3. Candidates need to pass BM and History at SPM level.
4. All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. CC
Unified Examination Certificate (UEC)
A Pass in UEC with a minimum of 5B including Mathematics, Biology / Physics / Chemistry / General Science / Applied Science and a Pass in English
(Note: Candidates without a Grade ‘B’ in the subjects above may be admitted if the candidate has a credit in the subjects above at SPM or equivalent level)
A Level
Min. DD
AUSMAT (SACEi)
Min. ATAR 50
Canadian Pre-University (CPU)
Min. average of 50% in 6 subjects
International Baccalaureate (IB)
Min. 24 points in 6 subjects
Monash University Foundation Year (MUFY)
Overall 50%
Diploma in Psychology
CGPA 2.00
Taylor’s Foundation and Diploma programmes
Pass any Taylor''s Foundation/Diploma programme with min. CGPA 2.00
Foundation / Pre-University / Diploma from any other institution recognised by MOHE
Pass with min. CGPA 2.00
MOHE Matriculation
Pass with min. CGPA 2.00
DKM/DKLM/DVM
Pass with a min. CGPA 2.50 subject to Senate approval of the relevant institutions OR
Graduated with a min. CGPA 2.00 with a minimum of two (2) years of work experience in the related field
Other Equivalent Qualification
Application via APEL A is allowed
The HEPs are required to conduct screening and provide appropriate bridging courses in Mathematics and Science
Any other equivalent qualification recognised by the Malaysian Government
Note :
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS, TOEFL, MUET, UEC English
Pass English
Taylor''s EET
Overall Score 5.0
Taylor''s IEN
Level 2- Grade C
Pre-U / Diploma
Completed Pre-U / Diploma that was conducted in English
INTERNATIONAL STUDENTS
IELTS
5.5
Pre-U / Diploma
Completed Pre-U / Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_041', 'CURRICULUM', 'Programme Structure', 'This Bachelor of Psychology programme provides you with a solid foundation in psychological theories, concepts, empirical studies, and professional practice. Benefit from the expertise of our team of psychology experts who deliver comprehensive and up-to-date knowledge in the field.
As part of our commitment to offering a flexible and personalised learning experience, our programme is compatible with the new Taylor''s Curriculum Framework . This framework allows you to mix and match study modules according to your interests and career goals.
Common Core
Common Core
This component consists of core subjects, which are primary modules across a discipline that provides the fundamental knowledge of the discipline.
Year 1
Introduction to Psychology
Research in Psychology
Learning and Motivation
Philosophy and Theories of Psychotherapy
Human Personality
Quantitative Methods
Qualitative Methods
Biological Psychology
Social Psychology
Ethics in Psychology
Year 2
Developmental Psychology
Cognitive Psychology
History of Psychology
Psychological Tests and Measurements
Leadership and Organizational Psychology
Abnormal Psychology
Year 3
Creative Integration Research Project (Part A)
Creative Integration Research Project (Part B)
Cross-cultural Psychology
Cyberpsychology
Industrial Training
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Students are required to take Bahasa Kebangsaan A if they did not obtain a Credit in Bahasa Malaysia for SPM.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Complementary Study
Complementary Study
The Complementary Studies component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Complementary Studies can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Minor
You will need to select one of the Minor packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The minor offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
OR
2nd Major
You will need to select one of the Major packages offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The major offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
OR
Free Electives
You will need to select any five (5) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list. The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Note
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Dr Neerushah Subarimaniam, Programme Director
A comprehensive programme designed to deepen your understanding of the human mind and behaviour. The programme offers a blend of theoretical knowledge and practical experience, equipping you with the essential skills for a successful career in psychology.
VIEW ALL LECTURERS
Dr Neerushah Subarimaniam, Programme Director
A comprehensive programme designed to deepen your understanding of the human mind and behaviour. The programme offers a blend of theoretical knowledge and practical experience, equipping you with the essential skills for a successful career in psychology.
VIEW ALL LECTURERS
Dr Neerushah Subarimaniam, Programme Director
A comprehensive programme designed to deepen your understanding of the human mind and behaviour. The programme offers a blend of theoretical knowledge and practical experience, equipping you with the essential skills for a successful career in psychology.
VIEW ALL LECTURERS
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_041', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you''ve successfully completed this Bachelor of Psychology programme, you could embark on any of these exciting careers, including:
Advertising Accounts Planner
Career Counsellor
Clinical Psychologist
Consumer Psychologist
Counselling Psychologist
Developmental Psychologist
Educational Psychologist
Forensic Psychologist
Market Researcher
Occupational Psychologist
Psychotherapist
Rehabilitation Specialist
Social Service Specialist
Sports Psychologist
Training Consultant', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_034', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Pharmacy programme. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
Sijil Pelajaran Malaysia (SPM)
(i) A pass in SPM / O-Level or equivalent with 5Bs each in Biology, Chemistry, Physics, Mathematics or Additional Mathematics and another subject.
The SPM requirements will only be applicable to: Pre-Medical studies or Pre-Pharmacy / Foundation in Science.
(ii)  A pass in SPM with 2Bs each in Chemistry, Biology / Physics / Maths and credits in 3 other subjects including English; or
A pass in O-Level with 2Bs each in Chemistry, Biology / Physics / Maths and credits in 3 other subjects.
The above requirements will only be applicable to Diploma in Health Science / Pharmacy.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation in Science (FIS)
Pass FIS with Grades BBB, ABC, or AAC in 3 subjects: Biology, Chemistry, and Physics / Mathematics with min. B in Chemistry, provided the programme is at least one year in duration and completed at the same institution
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. BBB / ABC / AAC in Biology, Chemistry, and Physics / Mathematics with min. B in Chemistry
Unified Examination Certificate (UEC)
Pass with min. B4 in 5 subjects: Chemistry, Biology, Physics, Mathematics, Advanced Mathematics, and any other subject
A Level
Min. ABC / BBB / AAC in Biology, Chemistry, and Physics / Mathematics with min. B in Chemistry
AUSMAT (SACEi)
Achieve an average of 75% for Chemistry, Biology, and Physics / Mathematics with min. 75% for
Chemistry
Canadian Pre-University (CPU)
Average of 75% for Chemistry, Biology, and Physics / Mathematics with min. 75% for Chemistry
International Baccalaureate (IB)
Pass with min. score of 30 overall and attained a min. score of 5 each in: Chemistry, Biology, Physics / Mathematics with min. 2 at Higher Level and and 1 at Standard Level
Monash University Foundation Year (MUFY)
Achieve an average of 75% for Chemistry, Biology, and Physics / Mathematics with min. 75% for Chemistry
Matriculation in Science
Min. BBB, ABC, or AAC in 3 subjects: Biology, Chemistry, and Physics / Mathematics with min. B in Chemistry, provided the programme is at least one year in duration and completed at the same institution
Diploma in Pharmacy or Health Sciences
Min. CGPA 3.50, provided the programme is not less than 5 semesters or 2.5 years and completed at the
same institution.
First Degree in a Health or Medical or Pure or Applied Science subject
Min. CGPA 3.00 and above
HSC-New South Wales
Achieve an average of 75% for Chemistry, Biology, and Physics / Mathematics with min. 75% for Chemistry
Foundation in Science from other institutions recognised by M''sian Government
Min. BBB, ABC, or AAC in 3 subjects: Biology, Chemistry and Physics / Mathematics with min. B in Chemistry and provided the programme is not less than 1 year and completed at the same institution
Other Qualifications
Students with other qualifications will be considered on a case-by-case basis.
Note :
Student who wish to seek employment in Malaysian government is required to have credit in Bahasa Malaysia at SPM level.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
English Requirements
English Requirements
LOCAL STUDENTS
SPM / O-Level / UEC / IGCSE
Pass in Bahasa Melayu and English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS
Band 6.0
TOEFL iBT
60
PTE
59
Linguaskill
169
Pre-U / Foundation / Diploma
Completed Pre-U / Foundation / Diploma that was conducted in English
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Interview
Interview
All eligible candidates are required to attend an interview.
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_034', 'CURRICULUM', 'Programme Structure', 'The degree in Pharmacy course is designed to equip you with comprehensive knowledge in the pharmaceutical sciences, focusing on four main areas: Pharmacology, Medicinal Chemistry, Drug Delivery, and Pharmacy Practice.
This programme is designed to be compatible with the new Taylor''s Curriculum Framework , allowing you to mix and match study modules. This flexibility enables you to tailor your learning experience to your interests and career aspirations.
Primary Major
Primary Major
This component consists of Common Core subjects, which are common modules across a discipline that provides the fundamental knowledge of the discipline.
Common Core
Year 1
Introduction to Pharmacy
Human Anatomy and Physiology
Principles of Life Sciences
Pharmaceutical Compounding and Dispensing
Pharmacology I
Pharmaceutical Organic Chemistry
Physical Pharmaceutics
Year 2
Community Pharmacy Practice I
Pharmacology II
Principles of Pharmaceutical Chemistry
Pharmaceutical Formulation and Development I
Biostatistics and Quality Use of Medicines
Community Pharmacy Practice II
Pharmacology III
Pharmaceutical Analysis
Year 3
Hospital Pharmacy Practice
Law, Ethics and Practice
Pharmaceutical Formulation and Development II
Drug Design and Biotechnology
Applied Therapeutics I
Professional Attachment
Year 4
Applied Therapeutics II
Applied Therapeutics III
Research Projects
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
University Core
University Core
This component aims to develop critical thinking, build up social intelligence and cultivate civic responsibility as well as broaden cultural knowledge. These consist of compulsory and nationally-mandated study modules required by the Malaysian Ministry of Higher Education.
Applicable to ALL students
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
For Malaysian students
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
For International students
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Note :
Malaysian students are required to take Bahasa Kebangsaan A if they do not obtain a Credit for Bahasa Malaysia for SPM
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Flexible Education
Flexible Education
The Flexible Education component offers students the flexibility to explore modules in a related or unrelated field, enhancing and complementing their primary major. This component allows students to broaden their knowledge and skills by selecting modules from the same or different schools within the university.
Flexible Education can take various forms, including free electives, extensions, minors, or even a second major. These options provide students with the opportunity to delve deeper into a specific area of interest or broaden their understanding by exploring a different field of study.
Click here to see a full list of all available Flexible Education Components.
You will need to choose one of the package below.
Extension
You will need to choose any ONE (1)  Extension* offered by Taylor’s University.
Option 1: Advanced Pharmaceutical Industrial Practice (5 modules)
Option 2: Cosmetic Science (5 modules)
AND
Choose any two (2) Free Electives offered by Taylor’s University. Refer to the  Flexible Education Guide  for the list of Free Electives.
Modules will be subject to availability and you will need to meet the minimum module pre and co-requisite.
Minor
You will need to select any Minor packages offered by Taylor''s University. We have provided some suggested Minors below, and you can refer to the Flexible Education Guide for the complete list.
Psychology
Nutrition with Wellness
Accounting
Entrepreneurship
Web Technology
Management
Marketing
and Choose any two (2) Free Electives offered by Taylor’s University. Refer to the  Flexible Education Guide  for the list of Free Electives.
Modules will be subject to availability and you will need to meet the minimum module pre and co-requisite.
Free Electives
You will need to select any seven (7) of the Free Electives offered by Taylor''s University. You can refer to the Flexible Education Guide for the complete list.
The free electives offered are subject to availability and you will need to meet the minimum module pre and co-requisite.
Associate Professor Dr Jason Loo Siau Ee, Programme Director
Emphasising a strong foundation of knowledge, soft skills, and practical experience through internships, this programme prepares students to excel in the multifaceted fast-paced world of pharmacy.
VIEW ALL LECTURER
Associate Professor Dr Jason Loo Siau Ee, Programme Director
Emphasising a strong foundation of knowledge, soft skills, and practical experience through internships, this programme prepares students to excel in the multifaceted fast-paced world of pharmacy.
VIEW ALL LECTURER
Associate Professor Dr Jason Loo Siau Ee, Programme Director
Emphasising a strong foundation of knowledge, soft skills, and practical experience through internships, this programme prepares students to excel in the multifaceted fast-paced world of pharmacy.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_034', 'CAREER_OPPORTUNITIES', 'Future Careers', 'Completing this Bachelor of Pharmacy degree prepares you for a diverse range of professional pathways, from frontline patient care to research and regulatory roles that shape how medicines are developed, used, and governed, including:
Academic Pharmacist
Community Pharmacist
Hospital Pharmacist
Industrial Pharmacist
Pharmacologist
Primary Health Care Pharmacist
Regulatory Pharmacist
Research Scientist
Toxicologist
Veterinary Pharmacist
Public Health Advocate', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_033', 'ADMISSIONS', 'Entry Requirements', 'Are you ready to take the next step in your academic journey? Our programme offers an exciting opportunity for individuals passionate about the field of Bachelor of Medicine, Bachelor of Surgery (MBBS) programme. To ensure a smooth admission process, please take note of our entry requirements listed below.
Prerequisites
Prerequisites
SPM / O-Level
A pass in SPM/O-level or equivalent with 5Bs each in Biology, Chemistry, Physics and Mathematics / Additional Mathematics and another subject at school level or its equivalent.
Note :
The above Pre-requisite is not applicable for the following qualifications: STPM, A-level.
All other exit qualifications from secondary school must be read with SPM/O level or equivalent.
All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Entry Pathway
Entry Pathway
Taylor’s Foundation in Science (FIS)
Min. CGPA 3.00 (out of 4.0) in Biology, Chemistry and Physics / Mathematics (Provided no score for any subject is less than C (GPA 2.0), the course is not less than 1 year in the same accredited institution, and student meets prerequisite)
Diploma in Health Sciences
Min. CGPA 3.50 with min. 2Bs each in Biology and/or Chemistry and/or Physics and 3 credits each in English, Mathematics / Additional Mathematics and another subject at SPM or its equivalent (Provided the course is not less than 5 semesters/2.5 years in the same accredited institution)
Sijil Tinggi Persekolahan Malaysia (STPM)
Min. BBB, ABC or AAC or CGPA 3.0 in 3 subjects: Biology, Chemistry and Physics / Mathematics
Unified Examination Certificate (UEC)
Pass with min. B4 in Biology, Chemistry, Physics, Advanced Mathematics 1 / Mathematics, and Advanced Mathematics II / Advanced Mathematics
A Level
Min. BBB / ABC / AAC in Biology, Chemistry and Physics / Mathematics
AUSMAT (SACEi)
Min. ATAR 80 including Biology, Chemistry and Physics / Mathematics or Aggregate / Average of 80% or the equivalent of B in Biology, Chemistry and Physics / Mathematics
Canadian Pre-University (CPU) / Canadian International Matriculation Programme / Canadian Grade 12 / 13 / Ontario Secondary School Diploma Grade 12
Min. average of 80% in 3 subjects: Biology, Chemistry, Physics / Mathematics
International Baccalaureate (IB)
Min. 33 points including 2 science subjects (Biology and Chemistry) at Higher Level (HL) and Mathematics at HL with a min. score of 5 each in Biology, Chemistry and Mathematics
Monash University Foundation Year (MUFY)
Aggregate or the equivalent of B in 3 subjects (Biology, Chemistry, Physics / Mathematics) or ATAR 80% in Biology, Chemistry and Physics / Mathematics
Matriculation in Science (by Ministry of Education Malaysia)
Pass with CGPA 3.00 in Biology, Chemistry and Physics / Mathematics (provided no score for any subject is less than C (GPA 2.0), the course is not less than 1 year in the same accredited institution, and student must meet prerequisite/ CGPA 3.0 in Degree in Health Science, Pure Science or Applied Science/ CGPA 3.5 in Degree in the Arts or Humanities)
Other Qualifications
Students with other qualifications will be considered on a case-by-case basis.
Note :
The minimum entry requirements are subject to meet current requirements set by the Ministry of Higher Education / Malaysian Qualifications Agency / Malaysia Medical Council.
Pre-employment requirement: Graduates from a medical programme who seek employment in the public sector shall attain a pass in Bahasa Malaysia and English at SPM or its equivalent.
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
English Requirements
English Requirements
LOCAL STUDENTS
IELTS
Band 6.0
TOEFL
60 (Internet Based Test)
MUET
Band 4
UEC English
B4
1119 (GCE-O)
Grade B
Pre-University / Diploma
Completed Pre-University / Diploma that was conducted in English
Cambridge English / ELS
the minimum score varies by programme
INTERNATIONAL STUDENTS
IELTS
Band 6.0
TOEFL iBT
60
Cambridge English / ELS
the minimum score varies by programme
Note :
The minimum entry requirements are subject to meet current requirements set by the Ministry of Higher Education / Malaysian Qualifications Agency / Malaysia Medical Council.
Pre-employment requirement: Graduates from a medical programme who seek employment in the public sector shall attain a pass in Bahasa Malaysia and English at SPM or its equivalent.
All information is subject to change. The above entry requirements serve as a guideline. Readers are responsible to verify the information by contacting the university’s Admissions Department.
Interview
Interview
All eligible candidates are required to attend an interview.
Health Requirements
Health Requirements
The student should be at least 18 years. Prior to admission, students are required to undergo a medical examination to ensure they are in good health and free of transmissible diseases. They also need to comply with the immunisation and infection risk policy.
NEXT: WHY TAYLOR''S', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z'),
    ('TAYLOR_BACHELOR_033', 'CURRICULUM', 'Programme Structure', 'Our MBBS programme is divided into two distinct phases, each designed to provide you with a well-rounded and comprehensive medical education:
Phase 1 (Year 1, 2) focuses on building a strong foundation in medical sciences while introducing you to the world of clinical medicine. During this phase, you will have the opportunity to develop essential skills such as history taking and physical examination techniques. These skills will be honed through practical training using simulated patients and models. Through these interactive sessions, you will learn how to identify patients'' problems and propose appropriate investigation plans.
Phase 2 (Years 3, 4 and 5) takes your learning to a more advanced level by immersing you in real-world clinical rotations at designated hospitals affiliated with the Ministry of Health. This phase is an invaluable opportunity for you to gain hands-on experience working directly with patients. You will have the chance to apply the knowledge and skills acquired in Phase 1 to real medical scenarios. Throughout this phase, you will be rotated across various clinical disciplines, including Internal Medicine, Surgery, Intensive Care, and many others. This comprehensive exposure ensures that you receive a well-rounded undergraduate training experience.
After graduating from Taylor’s Bachelor of Medicine, Bachelor of Surgery (MBBS) programme, you will obtain a prestigious MQA-accredited MBBS degree that is widely recognised and respected worldwide, enhancing your professional credibility.
Note : Housemanship in Malaysia is open to Malaysian citizens only.
Year 1
Year 1
Semester 1
Biological Basis of Medicine Block
Musculoskeletal System Block
Learning Skills / ICT / Communication Skills
Semester 2
Haematology and Immunology System Block
Cardiovascular System Block
Respiratory System Block
Learning Skills / ICT / Medical Ethics
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Year 2
Year 2
Semester 3
Gastrointestinal System Block
Urinary System Block
Public Health, Epidemiology & Biostatistics Block
Research Block
Introduction to Clinical Medicine
Semester 4
Endocrine and Reproductive System Block
Nervous System Block
Behavioural Sciences Block
Introduction to Clinical Medicine
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Year 3
Year 3
Semester 5: Clinical Rotations
Clinical Orientation
Internal Medicine 1
Surgery 1
Obstetrics and Gynaecology 1
Semester 6: Clinical Rotations
Paediatrics 1
Orthopaedics 1
Psychiatry 1
Community Medicine
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Year 4
Year 4
Semester 7: Clinical Rotations
Ophthalmology
Otorhinolaryngology
Family Medicine
Emergency Medicine
Semester 8: Clinical Rotations
Obstetrics and Gynaecology 2
Internal Medicine 2
Surgery 2
Medical Innovation and Entrepreneurship
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Year 5
Year 5
Semester 9: Clinical Rotations
Clinical Electives
Psychiatry 2
Orthopaedics 2
Forensic Medicine
Anaesthesia and Intensive Care
Medial Radiology and Imaging
Semester 10: Senior Clerkship
Internal Medicine 3
Paediatrics 2
Surgery 3
Obstetrics and Gynaecology 3
Note : All information is subject to change. Readers are responsible for verifying information that pertains to them by contacting the university.
Associate Professor Dr Shajan Koshy, Programme Director
This programme equips students with the essential theoretical knowledge, skills, and professional ethics required for patient treatment which can transforms lives.
VIEW ALL LECTURER
Associate Professor Dr Shajan Koshy, Programme Director
This programme equips students with the essential theoretical knowledge, skills, and professional ethics required for patient treatment which can transforms lives.
VIEW ALL LECTURER
Associate Professor Dr Shajan Koshy, Programme Director
This programme equips students with the essential theoretical knowledge, skills, and professional ethics required for patient treatment which can transforms lives.
VIEW ALL LECTURER
NEXT: ENTRY REQUIREMENTS', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z'),
    ('TAYLOR_BACHELOR_033', 'CAREER_OPPORTUNITIES', 'Future Careers', 'When you’ve successfully completed this Bachelor of Medicine, Bachelor of Surgery (MBBS) programme, you could embark on any of these exciting careers, including:
Medical Officer
House Officer
Specialist
Administrator
Consultant
Professor / Lecturer
Researcher
International Aid / Development Worker', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z');

INSERT INTO programme_detail_sections (programme_id, section_type, title_en, body_en, sort_order, source_url, source_checked_at, status, created_at, updated_at)
SELECT p.id, s.section_type, s.title_en, s.body_en,
  CASE s.section_type WHEN 'ADMISSIONS' THEN 20 WHEN 'CAREER_OPPORTUNITIES' THEN 30 ELSE 40 END,
  s.source_url, s.source_checked_at, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM official_taylor_programme_sections s JOIN programmes p ON p.programme_code=s.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug='taylor'
ON CONFLICT (programme_id, section_type) DO UPDATE SET
  title_zh=CASE WHEN (programme_detail_sections.source_url IS NULL AND (
    programme_detail_sections.body_zh LIKE '参考课程结构（非院校官方科目表）%'
    OR programme_detail_sections.body_zh LIKE '参考学习领域，非官方课程表%'
    OR programme_detail_sections.body_zh LIKE '%核心竞争力：建议通过专业技能、跨学科协作%'
    OR programme_detail_sections.body_zh LIKE '%职业说明：岗位准入和发展取决于个人能力%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas only, not the institution%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas, not an official module list%'
    OR programme_detail_sections.body_en LIKE '%Career note: Entry and progression depend on individual capability%'
  )) THEN NULL ELSE programme_detail_sections.title_zh END,
  body_zh=CASE WHEN (programme_detail_sections.source_url IS NULL AND (
    programme_detail_sections.body_zh LIKE '参考课程结构（非院校官方科目表）%'
    OR programme_detail_sections.body_zh LIKE '参考学习领域，非官方课程表%'
    OR programme_detail_sections.body_zh LIKE '%核心竞争力：建议通过专业技能、跨学科协作%'
    OR programme_detail_sections.body_zh LIKE '%职业说明：岗位准入和发展取决于个人能力%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas only, not the institution%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas, not an official module list%'
    OR programme_detail_sections.body_en LIKE '%Career note: Entry and progression depend on individual capability%'
  )) THEN NULL ELSE programme_detail_sections.body_zh END,
  title_en=EXCLUDED.title_en, body_en=EXCLUDED.body_en, source_url=EXCLUDED.source_url,
  source_checked_at=EXCLUDED.source_checked_at, status='PUBLISHED', updated_at=CURRENT_TIMESTAMP
WHERE (programme_detail_sections.source_url IS NULL AND (
    programme_detail_sections.body_zh LIKE '参考课程结构（非院校官方科目表）%'
    OR programme_detail_sections.body_zh LIKE '参考学习领域，非官方课程表%'
    OR programme_detail_sections.body_zh LIKE '%核心竞争力：建议通过专业技能、跨学科协作%'
    OR programme_detail_sections.body_zh LIKE '%职业说明：岗位准入和发展取决于个人能力%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas only, not the institution%'
    OR programme_detail_sections.body_en LIKE 'Illustrative study areas, not an official module list%'
    OR programme_detail_sections.body_en LIKE '%Career note: Entry and progression depend on individual capability%'
  )) OR NULLIF(BTRIM(programme_detail_sections.body_en), '') IS NULL;

CREATE TEMP TABLE official_taylor_programme_intakes (
  programme_code varchar(64), display_text varchar(100), source_url varchar(1000), source_checked_at timestamptz,
  PRIMARY KEY(programme_code, display_text)
) ON COMMIT DROP;

INSERT INTO official_taylor_programme_intakes VALUES
    ('TAYLOR_BACHELOR_026', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_026', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_026', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_026', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_028', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_028', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_028', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_028', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_025', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_025', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_025', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_025', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_032', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_032', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_032', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_032', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_030', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_030', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_030', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_030', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_031', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_031', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_031', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_031', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_020', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_020', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_020', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_020', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_019', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_019', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_019', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_019', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_016', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_016', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_016', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_016', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_035', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_035', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_035', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_035', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_037', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_037', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_037', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_037', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_010', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_010', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_010', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_010', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_009', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_009', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_009', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_009', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_011', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_011', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_011', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_011', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_014', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_014', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_014', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_014', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_013', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_013', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_013', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_013', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_012', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_012', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_012', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_012', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_040', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_040', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_040', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_040', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_022', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_022', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_022', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_022', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_021', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_021', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_021', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_021', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_023', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_023', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_023', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_023', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_015', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_015', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_015', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_015', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_018', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_018', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_018', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_018', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_017', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_017', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_017', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_017', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_029', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_029', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_029', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_029', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_043', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_043', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_043', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_043', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_041', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_041', '2027-02-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_041', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_041', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_034', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_034', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_034', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_033', '2026-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z'),
    ('TAYLOR_BACHELOR_033', '2027-04-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z'),
    ('TAYLOR_BACHELOR_033', '2027-09-01', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z');

INSERT INTO programme_intakes (programme_id, display_text, source_url, source_checked_at)
SELECT p.id, i.display_text, i.source_url, i.source_checked_at
FROM official_taylor_programme_intakes i JOIN programmes p ON p.programme_code=i.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug='taylor' AND NOT EXISTS (
  SELECT 1 FROM programme_intakes existing WHERE existing.programme_id=p.id
);
