-- Generated from official Universiti Malaya pages captured by the reviewed crawler.
-- This migration fills blank fields and replaces only unsourced generated detail sections.
CREATE TEMP TABLE official_um_programme_updates (
  programme_code varchar(64) PRIMARY KEY, name_en varchar(200), description_en text,
  duration_months integer, duration_display varchar(100), tuition_min numeric(14,2),
  tuition_max numeric(14,2), tuition_currency char(3), tuition_display varchar(200),
  official_url varchar(1000) NOT NULL, source_checked_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO official_um_programme_updates VALUES
    ('UM_BACHELOR_002', 'Bachelor of Muamalat Management', 'The goal of this program is to produce a balanced human capital in line with the progress of the field of Muamalat studies, especially related to Islamic management and finance through quality education based on Islamic and contemporary scientific traditions, for the sustainability of the ummah and the country.', 48, '4 Years (8 Semesters), Full time (Coursework)', 69600, 69600, 'MYR', 'RM 69,600', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_004', 'Bachelor of Al-Quran and Al-Hadith', 'To advance the field of study of Al-Quran and Al-Hadith based on the tradition of Islamic knowledge and modern scientific methods through quality education for the nation and humanity.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_005', 'Bachelor of Shariah and Law', 'To advance the field of Shariah studies in particular Islamic Law based on the tradition of Islamic knowledge and modern scientific methods through quality education for the nation and humanity.', 48, '4 Years (8 Semesters and 1 Special Semester), Full time (Coursework)', 82500, 82500, 'MYR', 'RM 82,500', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_001', 'Bachelor of Shariah', 'To advance the field of Shariah studies based on the tradition of Islamic knowledge and modern scientific methods through quality education for the nation and humanity.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_003', 'Bachelor of Usuluddin', 'The main method of teaching is the conventional made of lectures and tutorials. However, online learning are also conducted using the application of SPECTRUM and online video conferencing.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_006', 'Bachelor of Professional Malay Language', 'This program will offer courses focused on the study of the Malay language corpus. Among the courses offered are Malay Language Writing, Malay Language Grammar, Malay Oral Language, History of the Development of the Malay Language, Terminology in Malay Language Planning, Malay Language Lexicography, and others.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 76300, 76300, 'MYR', 'RM 76,300', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_007', 'Bachelor of Malay Linguistics', 'This program focuses on the study of global linguistic disciplines and Malay-related languages found in the Malay world, including Introduction to Malay Linguistics, Methods of Field Linguistic Research, Introduction to Computational Linguistics, Phonetics, Phonology, Morphology, Language Typology, Iban Language, Basic Grammar Theory and Its Applications, Ethnolinguistics, Geolinguistics of the Malay World, Comparative Language Systems, Corpus Linguistics, Linguistic Aspects of Classical Languages, Pragmatics, Language Contact, Dialectology, Syntax, Sociolinguistics, Sociology of Language, Psycholinguistics, Language Skills, Bilingualism, Linguistic History, Communicative Competence, Lexicology, Semantics, Text Linguistics, Linguistics and Literature, and Linguistics and Culture.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 76300, 76300, 'MYR', 'RM 76,300', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_008', 'Bachelor of Malay Literature', 'The Bachelor of Malay Literature program is a coursework-based, full-time program. The delivery methods for this program are conventional and include interactive lectures, game-based learning, cooperative learning, e-learning, problem-based learning, case study-based learning, discovery-based learning, problem-oriented project-based learning, computer-based learning, fieldwork, online learning, and project-based learning.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 76300, 76300, 'MYR', 'RM 76,300', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_009', 'Bachelor of Malay Studies', 'The Bachelor of Malay Studies program is a coursework-based, full-time program. The delivery methods for this program are conventional and include interactive lectures, game-based learning, cooperative learning, e-learning, problem-based learning, case study-based learning, discovery-based learning, problem-oriented project-based learning, computer-based learning, fieldwork, online learning, and project-based learning.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 76300, 76300, 'MYR', 'RM 76,300', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_011', 'Bachelor of Arts Anthropology and Sociology', 'The study of anthropology and sociology basically entails an in-depth study of human cultures and societies, their history and what’s currently going on, by comparing cultures and society to one another. Students of this programme will delve further into the depth and width of cultures and societies of the world by analyzing and understanding the social structures, institutions and values that make us who we are.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_018', 'Bachelor of Geography', 'It is a common misconception that geography is about “what is where”. Although geography does primarily deal with physical analysis of a location, it also provides explanation of why the phenomenon is there. Geography, in short, answers the question “why what is where”. Geography emphasizes the locational analysis of human activities and their relationships with the environment. These interactions of different systems are not often studied together, except within geography.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 68100, 68100, 'MYR', 'RM 68,100', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_019', 'Bachelor of Environmental Studies', 'Development comes with a price, and that price is the decay of our natural environment. Does that mean we should stop developing our nation in order to preserve our environment? Or should we forgo our environment for developments’ sake?
This programme will hopefully produce graduates who will find the middle ground for the tug-of-war between development and the environment.
Covering interdisciplinary subjects ranging from biology, geology, policy studies and law, geography, religion, civil and chemical engineering, chemistry, economics, history, and sociology, students will face environmental studies as a whole, enabling them to have an analytical and functional perspective on the environmental issues facing our world today.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 75900, 75900, 'MYR', 'RM 75,900', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_012', 'Bachelor of Arts International and Strategic Studies', 'Regardless of the student application paths (international or local students), all first-year undergraduates are introduced to major theoretical ideas and various approaches about politics and international relations, examines how states and international institutions functions in practice, and attend a series of introductory compulsory courses (see the academic porgramme structure) where they will use qualitative and quantitative methods to investigate and to observe international historical and political events or questions.
The programme’s objective are to equip the students with the knowledge of international relations, foreign policy, security studies, defence analysis and strategic studies, particularly by examining international interactions between state and non-state actors, as well as the emerging trends and long-term effects of both global and regional issues.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 65100, 65100, 'MYR', 'RM 65,100', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_013', 'Bachelor of Arts Southeast Asian Studies', 'The programme intends to provide a space for the development of teaching and learning, emphasizing on the studies of the region including its politics, economy, culture and security.
Using the multi-disciplinary approach of considering issues and application, students in the initial stage are required to take two Departmental core subjects including South East Asian languages. Students in their final year of study are required to take the research paper component.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_014', 'Bachelor of East Asian Studies', 'Active international relation and dynamic economic development make East Asia an axis of the growing international trade.Globalization, followed by the idea of economic integration in East Asia is the force that creates trade opportunities and establishes new relationships in the interactions between countries in this region.
The importance of East Asia from the perspectives of geographic, economic and political strategies in the global arena has lead to the establishment of the Department of East Asian Studies offering a comprehensive education program.
The programme offers an integration of China Studies, Japan Studies and Korea Studies. Besides paying attention to the fields of economy, management and contemporary international relations, the teaching focuses on the languages of the three countries. The programme also offers courses on the East Asia Province to enrich students with knowledge and a deep understanding about the province.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_016', 'Bachelor of Social Administration', 'The programme offers a mixture of Social Policy, Social Welfare and Social Work, Social Law and even some Public and Social Management. This particular mix, allied of course to the Malaysian orientation of much of the syllabus, makes the programme unique.
It accurately reflects the needs of Malaysia at the present stage of its economic and social development.
The inclusion of practical placements or a semi-vocational course in the programme provides opportunity to put into practice lessons learned in the lecture room. Our students value this element, believing it to provide them with an opportunity to test out possible careers.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_015', 'Bachelor of Arts History', 'Department of History has developed three core areas that provide ample opportunities for students majoring in history to choose a variety of introductory and advanced courses specializing in the history of Malaysia, Southeast Asian History and Global History.
Courses offered not only reflect the expertise in teaching and academic research in the department but the main objective of this diversity is to produce graduates holistic graduates ready to face the working environment.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 61000, 61000, 'MYR', 'RM 61,000', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_020', 'Bachelor of Arts Indian Studies', 'The programme aims to introduce the linguistics, literature, religious and socio-cultural heritage of the Indian community in an academic manner that will benefit the nation as a whole. It also showcases the historical, socio-political and economic aspects of the Indian community in Malaysia. Students will cover subjects ranging from Tamil grammar and literature to the in-depth probe into the Indian culture and civilization. The programme hopes to expose the students to the finer elements of Indian culture and values Besides that, students can also discover Indian Philosophy and ethics which will enable them to understand the Indian community and to function well within the society.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_021', 'Bachelor of Arts Chinese Studies', 'China has undoubtedly one of the most multifaceted cultures, history and politics in the world. Its civilization spans thousands of years and encompasses triumphs that stand witness until today. This programme introduces students to the various aspects of the Chinese community – its language, rich culture, writing, literature and the history of China.
The programme offers an expansive view into Chinese Studies by emphasising two main areas, the language and literature as well as the socio-culture.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 68000, 68000, 'MYR', 'RM 68,000', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_010', 'Bachelor of Arts English', 'The programme is comparable to those offered in universities in the United Kingdom and the United States of America.The programme is comparable to those offered in universities in the United Kingdom and the United States of America.Due emphasis is also given to literature in English from other parts of the world such as Africa, India, Australia and the USA.
The department also offers courses reflective of current interdisciplinary developments in English Literature, such as ‘Popular Culture and Literature’, ‘Literature through Language’, and ‘Global Shakespeares’.Teaching is conducted mainly in the form of lectures and tutorials, with an emphasis on interactive learning to encourage students to stretch their abilities.
Most courses adopt a 60:40 ratio in assessment, with 60% based on continuous coursework assessment and 40% from final examinations. Some courses are assessed entirely from coursework.All teaching is supported by our e-learning system, SPeCTRUM, which every registered student has access to. Further, each student is assigned an Academic Advisor who can provide guidance on queries and problems of an academic or even personal nature.
There are also opportunities to participate in Exchange programmes with overseas universities, giving students valuable and stimulating exposure to different learning environments and experiences.Credits earned from an Exchange programme may be transferred as part of the degree programme of the Department of English, subject to terms and conditions. Students will also carry out an internship with a company, institution or organisation to gain practical experience that will equip them with useful skills when they apply for jobs after graduation.', 42, '3.5 Years (7 Semesters), Full time (Coursework)', 60900, 60900, 'MYR', 'RM 60,900', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_017', 'Bachelor of Media Studies', 'The Bachelor in Media Studies programme aims to produce good graduates who are knowledgeable, technology literate and skilled in producing worthwhile media texts, as well as able to contribute to the field of media and communication, whether as professional industry practitioners, or as scholars and intellects.
The programme is offered as a full time programme with 122 credits, with a minimum study-duration of 7 semesters plus 1 short semester and a maximum study-duration of 11 semesters.
The Bachelor of Media Studies is a 3u1i programme in which students will undergo face-to-face and online classes, undertake assignments and do an academic project for 5 normal semesters and 1 short semester, followed by industrial training internships for 2 semesters.', 42, '3.5 Years (7 Semesters), Full time (Industrial Mode)', 68100, 68100, 'MYR', 'RM 68,100', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('UM_BACHELOR_022', 'Bachelor of Science in Architecture', 'The Bachelor of Science in Architecture programme provides constitutes the first tier of the two-tier system.The programme provides solid academic foundation for those who wish to pursue professional architect qualification. In this 3-year intensive course, design is taught as the core subject into which knowledge on other subjects are integrated.
The BSc. Architecture course is also programmed as a stand-alone undergraduate course that is sufficient for students who do not wish to continue on to the Master of Architecture programme, but to venture into related fields.', 42, '3.5 Years (6 Semester & 2 Special Semester), Full time (Coursework)', 103900, 103900, 'MYR', 'RM 103,900', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_023', 'Bachelor of Building Surveying', 'The programme was developed in association with the Royal Institution of Surveyors Malaysia (RISM). The curriculum structure is accepted by the relevant professional bodies in United Kingdom i.e.The Royal Institution of Chartered Surveyors (RICS), UK. The minimum period of study for the Bachelor of Building Surveying is 4-31/2 years, comprising 8 semesters (including 1 special semester).
The full-time semesters consists of 14 weeks. This course is pursued on a full time basis only. The successful completion of the programme leads candidate to achieve the award of a degree in the field of building surveying.
In the Malaysian context, a professional Building Surveyor is a qualified person, by examination and experience, and a member of the RISM.The main roles and responsibilities of a Building Surveyor in Malaysia, as prescribed by the RISM cover the following areas; Building Control & Space Planning, Building Performance & Risk Assessment and Building Maintenance & Refurbishment.', 42, '3.5 Years (7 Semester & 1 Special Semester), Full time (Coursework)', 85000, 85000, 'MYR', 'RM 85,000', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_024', 'Bachelor of Quantity Surveying', 'Accredited by the Board of Quantity Surveyors Malaysia (BQSM) and the Royal Institution of Chartered Surveyors (RICS) UK, the Bachelor of Quantity Surveying programme challenges students to identify, analyse and solve problems, evaluate strategies and options, and provide good judgement, decisions and advise as a professional quantity surveyor.
The 4-years full time study programme also provides students with the opportunity to research and develop future applications that give shape to a more creative and innovative approach to quantity surveying and unlock future potentials of the construction field.', 42, '3.5 Years (7 Semester), Full time (Coursework)', 92900, 92900, 'MYR', 'RM 92,900', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_025', 'Bachelor of Urban and Regional', 'The Bachelor of Urban and Regional Planning was introduced as a professional program in line with the requirement of the Board of Town Planners Malaysia. The Urban Planning program is designed to reflect a different niche area as compared to other universities offering similar program i.e UTM, UiTM, UIA and USM. The niche area for UM’s Urban Planning program will be related to spatial planning for sustainable development.
Therefore, the graduates will be able to rise above the challenging rapid urbanizing world. The department aspires to be a center of excellence in urban and regional planning studies and research in the Asia-Pacific region. The region provides a living laboratory where urban and regional issues can be identified, analyzed and examined, and strategies formulated.', 48, '4 Years (8 Semester), Full time (Coursework)', 96100, 96100, 'MYR', 'RM 96,100', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_026', 'Bachelor of Real Estate', 'This programme has been designed with the incorporation of ideas and contributions from the Royal Institution of Surveyors Malaysia (RISM), and the programmes’ structure is recognised by the renowned Royal Institution of Chartered Surveyors (RICS) UK.
The programme is also recognised by Malaysia’s Department of Public Service and the Board of Valuers, Appraisers and Estate Agents (BOVAEA) Malaysia. This 4-years full time study programme imparts to students the art of valuing, advising, consulting and dealing in properties, sites and machines for various purposes. It also exposes students to all the financial, legal and intangible intricacies of the trade.', 42, '3.5 Years (7 Semester & Special Semester), Full time (Coursework)', 90100, 90100, 'MYR', 'RM 90,100', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_029', 'Bachelor of Business Administration', 'Business education in the University of Malaya (UM) dates back to 1966 when the Faculty of Economics and Administration first offered business and accounting courses. In line with the increasing demand for accounting and business programmes, the Faculty of Business and Accountancy (FBA) was subsequently established in 1997 to focus on developing these programmes.
FBA strives to meet the challenges of preparing students to play a vital role in industry and nation building. FBA seeks to remain at the forefront of business and accounting education and continues to enjoy the reputation as an excellent knowledge-based institution.', 42, '3.5 Years (7 Semester), Full time (Coursework)', 77100, 77100, 'MYR', 'RM 77,100', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_028', 'Bachelor in Accounting', 'Bachelor in Accounting programme is recognized both nationally and internationally. The programme is recognised under Schedule 1 Accountants Act 1967.Graduates of this programme are eligible to register as members of the Malaysian Institute of Accountants (MIA), subject to three years practical accounting experience, as stipulated in Part IV of the Accountants Act 1967.
In addition, the programme is also recognised by other international professional accounting bodies. BAcc graduates from UM may get maximum exemptions from the following bodies:', 42, '3.5 Years (7 Semester), Full time (Coursework)', 99100, 99100, 'MYR', 'RM 99,100', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('UM_BACHELOR_030', 'Bachelor of Finance', 'The Bachelor of Finance is a 3 &frac12; year programme with the objective to produce graduates with thorough knowledge and technical abilities in finance to meet with the increase in the market demand for finance graduates. The Bachelor of Finance programme allows students to embark on careers in fields of finance such as risk management, funds management, banking, investment analysis and financial analysis.', 42, '3.5 Years (7 Semester), Full time (Coursework)', 84100, 84100, 'MYR', 'RM 84,100', 'https://study.um.edu.my/bachelor-of-finance', '2026-10-14T05:45:39.480Z'),
    ('UM_BACHELOR_031', 'Bachelor of Economics', 'The Bachelor of Economics programme is designed to provide solid grounding in theory and economic knowledge and improve the critical and analytical skills of students.The core and elective courses are shaped to produce graduates with broad based as well as specialized knowledge.
The newly introduced specialization system has provided students the option to specialize in one of five (5) areas, namely;
&bull; Applied Economics
&bull; Financial Economics
&bull; Development Studies
&bull; Public Administration
&bull; Applied Statistic and Analytics', 42, '3.5 Years (7 Semester), Full time (Coursework)', 77100, 77100, 'MYR', 'RM 77,100', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_033', 'Bachelor of Computer Science (AI)', 'This programme equips students with the knowledge and skills to design and develop computer systems that emulate and exhibit human intelligence. Students will learn the theoretical and practical aspects of Robotics, Cognitive Science, Image Processing, Natural Language Processing, Machine Learning, Artificial Neural Network, Fuzzy Logic, Expert Systems and Logic Programming. Students will apply their skills and knowledge through the development of real world applications in their final year projects.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', 89200, 89200, 'MYR', 'RM 89,200', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('UM_BACHELOR_035', 'Bachelor of Computer Science (Software Engineering)', 'This programme offers a comprehensive look into the world of software engineering by providing the students with not only the theoretical and technical knowledge but the skills needed in various other related aspects of software engineering.
The programme emphasizes a strong underlying of Software Engineering principles and concepts through object-oriented modeling, software design and architecture, human-computer interaction and software quality.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', 89200, 89200, 'MYR', 'RM 89,200', 'https://study.um.edu.my/bachelor-of-computer-science-software-engineering', '2026-10-14T05:45:45.506Z'),
    ('UM_BACHELOR_032', 'Bachelor of Computer Science (Computer System and Network)', 'The purpose of this programme is to produce graduates who understand and able to apply the knowledge in networking and the theory of computer systems.
The graduates will have the ability to apply critical thinking skills and advanced scientific techniques in solving computer-based problems in line with the rapidly changing computer systems and technology.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', 89200, 89200, 'MYR', 'RM 89,200', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_036', 'Bachelor of Computer Science (Multimedia Computing)', 'This programme aims to produce graduates with knowledge and skills in the field of information technology and multimedia computing. The graduates will be able to apply the techniques and algorithms to solve information technology problem, and to utilize suitable software to process the elements of multimedia to achieve the goals of multimedia system developments.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', 89200, 89200, 'MYR', 'RM 89,200', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_037', 'Bachelor of Computer Science (Data Science)', 'This programme aims to produce excellent graduates who are able to apply the knowledge gained in the field of Computer Science and Data Science and apply scientific techniques to solve computer-based problems, as well as having entrepreneurship mindset. The graduates will be able to conduct data-driven investigations by accessing, assessing and analyzing data sets to gain useful information, to be competent in using suitable tools and technologies in building data model capable of prediction and be able to solve problems that involve disparate datasets from any domain and develop data products.
For this program, UM has signed the MoA with Statistical Analysis System (SAS) to develop Data Scientists in Malaysia. Students completing specific elective courses offered by this program will receive a Joint Professional Certificate from SAS. SAS also has endorsed the program in Data Analytics by providing tools and educational material support for learning and research purposes.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', NULL, NULL, NULL, NULL, 'https://study.um.edu.my/bachelor-of-computer-science-data-science', '2026-10-14T05:45:51.520Z'),
    ('UM_BACHELOR_034', 'Bachelor of Computer Science (Information System)', 'This programme aims to equip graduates with the ability to apply the concepts and principles of Information Systems to support the design, development and management of Information Systems. The graduates will be able to design and develop Information Systems to suit the organizational needs using highest quality technology-based services, with high ethical values in the context of professional practice of computing.', 42, '3.5 Years (7 Semester and 1 special semester), Full time (Coursework)', 89200, 89200, 'MYR', 'RM 89,200', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_041', 'Bachelor of Dance', 'This programme aims to produce graduates who are proficient and skilled in the professional practice and academic study of dance.Students study western and non-western, dance techniques, choreography, dance notation and dance education with particular emphasis on Malaysian dance, thus offering a well-rounded multi-cultural and cross cultural dance education at the tertiary level.
Dance faculty members include pioneers and experts in the field of ethnochoreology, modern and traditional choreography and dance education.', 36, '3 Years (6 Semester and 1 special semester), Full time (Coursework)', 62500, 62500, 'MYR', 'RM 62,500', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_039', 'Bachelor of Drama', 'The Bachelor of Drama programme provides a comprehensive grounding in the theories, technique, aesthetics, management, and technologies of drama and theatre. This programme offers the flexibility for students to choose an area of specialisation either as professionals or academics as their careers.', 36, '3 Years (6 Semester and 1 special semester), Full time (Coursework)', 62100, 62100, 'MYR', 'RM 62,100', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_038', 'Bachelor of Music', 'The Bachelor of Music is one of the core programmes started in 1997. After decades of educating and producing quality graduates in music, our programme has been striving to improve teaching and learning on par with leading universities worldwide. The curriculum is designed to develop students'' musical craft and creativity in performance and theoretical studies in related domains. The Bachelor of Music focuses on four areas of study - Performance, Composition, Ethnomusicology and Education and students can expect to be taught by leading ethnomusicologists, musicologists, music composers, music educators, and professional performers of various backgrounds.', 36, '3 Years (6 Semester and 1 special semester), Full time (Coursework)', 64500, 64500, 'MYR', 'RM 64,500', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_040', 'Bachelor of Performing Arts', 'The Bachelor of Performing Arts is a newly introduced, full-time programme under the Faculty of Creative Arts at Universiti Malaya, positioning UM as a pioneer in Malaysia under the EXCEL framework (POISE). This programme, guided by POISE (Passion Driven) principles, offers students the flexibility to shape their educational journey by choosing a blend of two core disciplines—Dance, Music, or Drama—alongside one elective. The programme spans three years, consisting of six regular semesters (each 14 weeks long) and one special semester (7 weeks). To complete the degree, students must earn a total of 127 credits, which are divided as follows: 18 credits for university courses, 82 credits for core courses, and 27 credits for electives.
For the core courses, students select two performing arts disciplines from Music, Drama, or Dance, amounting to 82 credits in total. These are distributed as 31 and 30 credits per discipline, including 4 credits allocated for Industrial Training. The remaining 21 credits cover general program core courses.In terms of electives, students must complete 27 credits: 19 credits in a single discipline (from any of the three fields), while the remaining 8 credits can be chosen freely from any of the three disciplines. University courses, including English Language Communication and mandatory subjects, comprise 14 credits, with an additional 4 credits dedicated to the Student Holistic Empowerment (SHE) program.
A key strength of this programme is its interdisciplinary and flexible approach, enabling students to customize their studies according to their passions and professional goals. Furthermore, the program culminates in a final year project where students can choose to showcase their talents as performers in Dance, Drama, or Music, take on roles as choreographers, directors, music instructors, or composers, focus on production management, or pursue academic research. This unique structure equips graduates with the creativity, technical skills, and industry readiness necessary to thrive in various performing arts fields.', 36, '3 Years (6 Semester and 1 special semester), Full time (Coursework)', 62500, 62500, 'MYR', 'RM 62,500', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_043', 'Bachelor of Dental Surgery', 'The Faculty of Dentistry Universiti Malaya was the first institution of higher learning in Malaysia to offer a degree course to train local candidates to become skilled professional dentists. The first batch of student intake was in 1972. This is currently a five-year programme where the first two years is dedicated to pre-clinical dental science and basic medical science teaching with exposure to clinical dentistry as early as in the first year. Basic Medical Science teaching is conducted in collaboration with the Faculty of Medicine, Universiti Malaya. In the subsequent three clinical years, candidates will have the opportunity to practice their clinical skills in dentistry as well as related medical practice. At the end of the programme, the Faculty of Dentistry is expected to produce a general dentist practice who is knowledgeable and highly competent in the clinical and technical aspects, understanding social responsibility and can work effectively to contribute to the country`s health service delivery system, and adheres to the principles of professional ethics and conduct of high value.', 60, '5 Years (10 Semester), Full time (Coursework)', 655000, 655000, 'MYR', 'RM 655,000', 'https://study.um.edu.my/bachelor-of-dental-surgery', '2026-10-14T05:46:05.579Z'),
    ('UM_BACHELOR_044', 'Bachelor of Counseling', 'The programme commenced in 1997 with the aim to provide education and professional training for those who aspire to become certified, highly trained and competent counselors. A comprehensive curriculum was developed for this programme to ensure it fulfills and cater to demand of the industry and community.
The programme is accredited by the Malaysian Qualification Agency (MQA/SWA11276) and fulfills the requirement standards established by the Malaysian Board of Counsellors (Lembaga Kaunselor Malaysia) which is the Malaysian professional counselling body.', 48, '4 Years (8 Semester), Full time (Coursework)', 69600, 69600, 'MYR', 'RM 69,600', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_045', 'Bachelor of Education TESL', 'The programme commenced in 1989 with the aim to provide academic preparation and professional training for Secondary School English teachers. The programme integrates the English language skills and English Literature with the professional components, which stresses on knowledge in education and classroom teaching practices. The programme is accredited by the Malaysian Qualification Agency (MQA/SWA11277) and fulfills the the Education programme standards.', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 75100, 75100, 'MYR', 'RM 75,100', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_046', 'Bachelor of Early Childhood Education', 'The program first established in 1997 with the aim to provide education and professional training for those who are interested to be Early Childhood educators. The curriculum developed for this program comprises of professional knowledge and skills in the field of childcare and early childhood education. This includes the history and philosophy of early childhood education, safety, health and nutrition for holistic early childhood education. The program is accredited by the Malaysian Qualification Agency (MQA/SWA11278) and fulfills the Early Childhood Education program standard', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 69600, 69600, 'MYR', 'RM 69,600', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_047', 'Bachelor of Civil Engineering', 'Bachelor of Civil Engineering programme provides a solid foundation of knowledge so that students can use the basic principles in Civil Engineering practice and problems. The subject involves the design and construction of projects, financing them, managing the construction process and maintenance. Civil Engineering helps to solve problems, design, build and maintain our living and working spaces.
It involves finding innovative solutions using a mixture of creativity, application of knowledge for the planning, design and execution of infrastructure works to enhance the quality of life. Civil engineers have played a significant role in most of the famous landmarks in the world. With the growing population straining today’s infrastructures, civil engineers are required to improve and build the built environment now and into the future.', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 132100, 132100, 'MYR', 'RM 132,100', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_048', 'Bachelor of Biomedical Engineering', 'Universiti Malaya was the first institute to offer a biomedical engineering undergraduate program in Malaysia, having commenced the intake in 1997. Having been formed as a department in the year 2001, our flagship undergraduate program is accredited by the Engineering Accreditation Council (EAC) of Malaysia. The past years, beginning from the late 1990’s to the early 2000’s, where the challenging ones as the various changes have taken place within the education system in Malaysia.
Thus, in a short span of a few years, the Biomedical Engineering program went through six accreditation exercises, namely in years of 2003, 2004, 2006, 2010, 2012, 2015 with the last accreditation exercise took place in 2021 with full 6 years accreditation. Biomedical Engineering involves the application of the latest advances in engineering and scientific knowledge for biomedical use. Our undergraduate programme prepares students for positions in biomedical engineering industries or to pursue advanced postgraduate studies.
Currently, the department offers one undergraduate engineering program, with two minoring in Biomedical Engineering and Prosthetics and Orthotics Engineering. The undergraduate degree programme is recognised and accredited by EAC.The programme implements Outcome Based Evaluation (OBE) in all its courses. The approach emphasises the outcomes of each course and students are informed of these outcomes in the beginning of their studies and the evaluation of its effectiveness at the end of the course.
he department has links of collaboration from the industries such as Universiti Malaya Medical Centre (UMMC), SIEMENS Healthineers Malaysia, Association of Malaysian Medical Industries (AMMI), Columbia Asia Sdn Bhd, OGAWA Sdn Bhd, Ossur and SeliaTek Sdn Bhd. Together with our comprehensive curriculum content, dedicated academic and support staff in teaching and learning, excellent facilities, and with the strong support from these industries, the department strives to provide quality education to prepare students for professional position and to meet the challenges of tomorrow in the industry, commerce and academia in line with UM’s mission and', NULL, NULL, 132100, 132100, 'MYR', 'RM 132,100', 'https://study.um.edu.my/bachelor-of-biomedical-engineering', '2026-10-14T05:46:15.646Z'),
    ('UM_BACHELOR_050', 'Bachelor of Mechanical Engineering', 'Mechanical engineering is a very broad field; hence mechanical engineers can work in a variety of different industries as well as design a wide range of products. Mechanical engineers develop, design, build, test, and inspect mechanical devices and systems, such as machines, tools, and engines. Mechanical engineers often work on the newest industrial pursuits, particularly in automation and robotics, alternative energies and nanotechnology. The Mechanical Engineering Program offers new opportunities for occupational growth, such as designing production projects to harness developments, improvements of technology in healthcare, or designing more powerful computer chips for the ever-growing digital era. The wide career spectrum opens up opportunities for different genders, different levels of ability, and different interests. The key is that the Mechanical Engineering Program develops a skilled personnel with competent technical and analytical skills that could be of good use wherever needed.', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 132100, 132100, 'MYR', 'RM 132,100', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_049', 'Bachelor of Electrical Engineering', 'Electrical engineering generally deals with the study and application of electricity, electronics, and electromagnetism. It covers a wide range of subfields including electronics, digital computers, power engineering, telecommunications, control systems, and signal processing. Electrical engineers give the world modern virtual reality and spanned power distribution networks across vast rural areas in developing countries. Bachelor of Electrical Engineering exposes students to the theory and applications of electricity, electronics, information and signal processing.
The program is designed around a set of core courses that provide a classical electrical engineering foundation, and a number of elective courses that allow students to specialize in areas of interest and emphasis is placed on the application of the engineering knowledge. "Electrical engineering generally deals with the study and application of electricity, electronics, and electromagnetism. It covers a wide range of subfields including electronics, digital computers, power engineering, telecommunications, control systems, and signal processing. Electrical engineers give the world modern virtual reality and spanned power distribution networks across vast rural areas in developing countries.
Bachelor of Electrical Engineering exposes students to the theory and applications of electricity, electronics, information and signal processing. The program is designed around a set of core courses that provide a classical electrical engineering foundation, and a number of elective courses that allow students to specialize in areas of interest and emphasis is placed on the application of the engineering knowledge.', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 132100, 132100, 'MYR', 'RM 132,100', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_051', 'Bachelor of Chemical Engineering', 'Working together with people from all walks of life, chemical engineers help to keep the world going and better. Like all engineers, we design and build equipment, then make them work safely and economically. These are mostly business-to-business activities, often outside public eyes. We specialize on activities that involve chemical and biochemical changes on a large scale. For example, we purify crude oil into petrol, kerosene and diesel that transport everyone around. We too make plastics and their biodegradable versions. Others such as fertilizers, drinking water, cooking oils, packaged foods, medicines and vaccines all have to be produced in large amounts, and here chemical engineers come in. The chips that run our handphones are designed by electronic engineers, but chemical engineers make them in large quantities. Increasingly, chemical engineers deal with living things such as bacteria and plants to produce renewable products. As large-scale chemical processing involves potential adverse social and environmental impact, chemical engineers also protect people and Earth by clever designs and responsible operations.', 48, '4 Years (8 semester and 1 special semester ), Full time (Coursework)', 132100, 132100, 'MYR', 'RM 132,100', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_060', 'Bachelor of English Language and Linguistics', 'Produce graduates who master language and linguistics, especially in the field of English, capable and competitive in their careers, responsible for society with ethical values, capable of leading, critical thinking, skilled in information management, and able to contribute to the surrounding community. Students are awarded the Bachelor of English Language and Linguistics, upon completion of a total of 127 credits of study.', 42, '3.5 Years (7 semester), Full time (Coursework)', 70100, 70100, 'MYR', 'RM 70,100', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_054', 'Bachelor of Chinese Language and Linguistics', 'Produce graduates who are successful in employment, knowledgeable and skilled in the field of Chinese language and linguistics, motivated and complete with research skills, the ability to lead and work in groups and possess nature of ethical and social responsibility. Students are awarded the Bachelor of Chinese Language and Linguistics upon completion of 124 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65100, 65100, 'MYR', 'RM 65,100', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_052', 'Bachelor of Arabic Language and Linguistics', 'Produce graduates who master language and linguistics, especially in the field of Arabic language, capable and competitive in career, responsible for society with ethical values, capable of leading, critical thinking, skilled in information management, as well as having the ability in entrepreneurial management.Students are awarded the Bachelor of Arabic Language and Linguistics, upon completion of a total of 126 credits of study.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65100, 65100, 'MYR', 'RM 65,100', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_055', 'Bachelor of Tamil Language and Linguistics', 'To produce successful and knowledgeable graduates who are proficient in language and linguistics especially in Tamil, capable and competitive in their careers, accountable to the community with ethical values, capable of leadership, critical thinking, information management, and competent in entrepreneurial management. Students are awarded the Bachelor of Tamil Language and Linguistics upon completion of 124 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65100, 65100, 'MYR', 'RM 65,100', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_053', 'Bachelor of Japanese Language and Linguistics', 'Produce graduates who master language and linguistics, especially in the field of Japanese language, capable and competitive in career, responsible for society with ethical values, capable of leading, critical thinking, skilled in information management, as well as having the ability in entrepreneurial management. Students are awarded the Bachelor of Japanese Language and Linguistics upon completion of 125 credits of studies.', 42, '3.5 Years (7 semesters), Full time (Coursework )', 70000, 70000, 'MYR', 'RM 70,000', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_056', 'Bachelor of French Language and Linguistics', 'Produce graduates who master language and linguistics, especially in field of French, capable and competitive in career, capable leading, critical thinking, skilled in information management, responsible towards the community with ethical values and having the ability in management. Students are awarded the Bachelor of French Language and Linguistics upon completion of 125 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursewo rk)', 65000, 65000, 'MYR', 'RM 65,000', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_057', 'Bachelor of German Language and Linguistics', 'Produce graduates who master language and linguistics, especially in field of German, capable and competitive in career, capable leading, critical thinking, skilled in information management, responsible towards society with ethical values and having the ability to management. Students are awarded the Bachelor of German Language and Linguistics upon completion of 125 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65000, 65000, 'MYR', 'RM 65,000', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_058', 'Bachelor of Spanish Language and Linguistics', 'Produce graduates who master language and linguistics, especially in the field Spanish, able and competitive in career, capable leading, critical thinking, skilled in information management, responsible for society with ethical values and having the ability in management. Students are awarded the Bachelor of Spanish Language and Linguistics upon completion of 125 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65000, 65000, 'MYR', 'RM 65,000', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_059', 'Bachelor of Italian Language and Linguistics', 'Produce graduates who master language and linguistics, especially in the field of Italian, capable and competitive in career, able to lead, critical thinking, skilled in information management, responsible for society with ethical values and having the ability in management. Students are awarded the Bachelor of Italian Language and Linguistics upon completion of 125 credits of studies.', 42, '3.5 Years (7 semester), Full time (Coursework)', 65000, 65000, 'MYR', 'RM 65,000', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_065', 'Bachelor of Pharmacy with Honours', 'The Bachelor of Pharmacy (Hons) degree programme that is offered by the University of Malaya holds true to the following philosophy, which is in line with the nation’s requirements. The programme offers a broad-based curriculum and training with opportunities for specialisation. The programme supports evidence-based practices and consists of dynamic characteristics with room for future advancement.', 48, '4 years( 8 semester ), Full time (Coursework)', 280100, 280100, 'MYR', 'RM 280,100', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('UM_BACHELOR_066', 'Bachelor of Science in Chemistry', 'The Department of Chemistry is the largest department in the Faculty of Science. The Department started operation in the academic year 1959/1960 and is one of the oldest departments in the faculty. The Department is the first institution of higher learning in Malaysia to receive the prestigious Royal Society of Chemistry, UK accreditation for its programme since August 2012. One of the objectives of the Department is to provide a centre of excellence in chemical education and research in Malaysia. Students from the Department are trained to develop their critical, creative and innovative thinking.
The Department is proud to produce graduates who are highly regarded, and much sought after in the workforce market. Presently, the Department has 54 academic staff, several of whom are from abroad, and 1 Emeritus Professor. Apart from teaching at both undergraduate and postgraduate degree levels, the staff also conduct quality research in fundamental and applied chemistry. Although the academic staff have different research interests, they adhere to the same philosophy in solving chemical-related problems and in the development of expertise in chemistry. In addition to the undergraduate programme, the department also offers MSc by research and coursework; and PhD programmes. Since the establishment, the Department has produced many MSc and PhD graduates who assume high positions in both government and private organization locally and internationally.', 48, '4 years ( 8 semester ), Full time (Coursework)', 78500, 78500, 'MYR', 'RM 78,500', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_067', 'Bachelor of Science in Ecology and Biodiversity', 'Ecology and biodiversity is a broad and diverse programme that includes scientific studies of various organisms exploring its diversity and interaction with the environment. Malaysia’s rich biodiverse terrestrial and aquatic natural ecosystems play vital life-support roles that provide us with quality air, food and water as well as numerous other health and economic benefits.
However, continuing habitat destruction and other anthropogenic impacts are resulting in major biodiversity loss especially in the tropics. As such, studies related to documentation of biodiversity and their linkages to the environment are of great value to the nation. In this regard, this program aims to produce well rounded graduates specialising in this subject which is in line with the vision of the country to conserve its biodiversity, to promote and ensure the sustainable use of biological resources.', 48, '4 Years (8 Semester), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_068', 'Bachelor of Science in Physics', 'Department of Physics is one of Malaysia’s leading physics departments, with a history that goes back over 60 years. We are renowned for our work in photonics, condensed matter physics, plasma physics, astrophysics, nuclear and particle physics with a strong emphasis on both research and teaching.You will be taught by academics who are also active researchers which ensures our courses are kept updated by the latest developments in physics and presents a unique opportunity to be closely involved at the forefront of cutting-edge physics research.', 48, '4 Years (8 Semester ), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_076', 'Bachelor of Science in Environmental Management', 'The Environmental Management program is designed in a 3u1i mode (3 years in the university and 1 year in the industry) with the aim to produce competent graduates in the field of environmental management. Students will have a strong foundation in the fundamentals of biology and on top of that, they will be exposed to latest developments in the environmental modules which include water management, environmental impact assessment, biological monitoring, sustainable development, coastal management, environmental toxicology, waste management, environmental audit, health and safety, slope management and others. Some courses also include practical components which include experiments in the laboratory and fieldwork. The students will be trained to identify problems, develop solutions, and work in teams to address the environmental issues
The program offers a comprehensive industrial training for two semesters during the final year to prepare the students for real life challenges. Apart from industrial exposure and linkages, students can partake in various community and environment-based activities. The students will also undertake a research project in the environment-management related fields of their interest culminating in a project thesis.', 48, '4 Years (8 Semester), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_069', 'Bachelor of Science in Applied Geology', 'The study of geology applies various branches of science to understand Earth processes, composition and its evolution. Its scope ranges from the study of minerals and rocks under the microscope to plate tectonics at the global scale. The broad spectrum of knowledge gained provides excellent opportunities for working in a variety of industries worldwide. Geology is important for the development of mineral, hydrocarbon and groundwater resources, the understanding of natural hazards, the remediation of environmental problems, and for providing insights into past climate change. Geology also plays a role in engineering projects.', 48, '4 Years (8 Semester), Full Time (Coursework)', 78400, 78400, 'MYR', 'RM 78,400', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_070', 'Bachelor of Science in Biochemistry', 'Biochemistry is one of the most influential areas in science. It explores the chemical processes within living organisms by understanding what is happening at molecular level and studying biomolecules like carbohydrates, lipids, proteins and nucleic acids. The molecular knowledge has helped us to learn about the biological processes which take place in cells and organisms, study the properties of biological molecules for a variety of purposes, find uses for biomolecules and produce new products for applied usage.
The discipline has made vital contributions to the fields of cell biology, physiology, pathology, pharmacology, microbiology, immunology, nutrition, forensic science, and toxicology. Thus, research in biochemistry has contributed crucially in medicine, industrial application, agriculture and food production.
The department of Biochemistry was originally founded in the Faculty of Medicine in 1963. The teaching was later taken over by the Faculty of Science in 1997 under the Institute of Biological Sciences and introduced as the programme of Biochemistry. The programme has successfully produced graduates for 24 years and becoming one of the best undergraduate programmes in the country.', 48, '4 Years (8 Semester), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_071', 'Bachelor of Science in Mathematics', 'Bachelor of Science in Mathematics is a four-year program designed for students seeking a strong mathematical foundation to pursue graduate study in mathematical sciences or careers in industry. It gives an exposure of not only classical mathematics, but also its modern applications in physical, computational, management, and industrial sciences. In short, it equips students with analytical and critical thinking and state-of-the-art problem-solving skills to excel in careers in this fast-changing world.', 48, '4 Years (8 Semester), Full Time (Coursework)', 78400, 78400, 'MYR', 'RM 78,400', 'https://study.um.edu.my/bachelor-of-science-of-mathematics', '2026-10-14T05:47:05.825Z'),
    ('UM_BACHELOR_072', 'Bachelor of Science in Biotechnology', 'The Bachelor of Science Biotechnology delivers an in-depth multidisciplinary curriculum interfacing biology with physical sciences and technology. With modern facilities and application-oriented education, the program seeks to produce multi-skilled, highly employable graduates by equipping the students with knowledge and skills in broad areas of Biotechnology. The program has a coherent curriculum that adheres to the National Qualification Standards, offering a wide range of modules covering plant, animal, and industrial biotechnology. The academics in the program are highly qualified with shared focus on student success and a strong commitment to theoretical and applied research.', 48, '4 Years (8 Semester and 1 Special Semester ), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_073', 'Bachelor of Actuarial Science', 'Bachelor of Actuarial Science in Universiti Malaya is a four years program design to prepare both, the industrial demand as well as the professional expert in the actuarial field. The program covers a wide range of areas including economics, finance, mathematics, statistics and risk modelling. The program also prepares the students with tools to kick start research that is inevitable in current world for the benefit of the wide society.', 48, '4 Years (8 Semester), Full Time (Coursework)', 78400, 78400, 'MYR', 'RM 78,400', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_074', 'Bachelor of Science in Microbiology and Molecular Genetics', 'This is newly founded program with the combination of two important fundamental biological sciences of microbiology and genetics. Knowledge about microbes & genes, inheritance & mutations, the importance of bacteria, viruses and other microbes in the environment and as pathogens. Ranked 137 in Best Global Universities for Microbiology. Ranked top 200 in the world by QS World Subject Rankings for Biological Sciences. This program is the first of the kind in Malaysia.', 48, '4 Years (8 Semester ), Full Time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_075', 'Bachelor of Science in Statistics', 'Bachelor of Science in Statistics is a four-year programme that provides excellent training in both theory and practice of mathematical statistics. It is a comprehensive program that covers inferential statistics, modelling techniques and the skills of interpreting and reporting statistical analysis. This program prepares graduates with solid foundation to apply statistical methods to solve real-world problems by supporting a shift towards the analysis of real-world data using modern statistics and by promoting data-driven culture.', 48, '4 Years (8 semester), Full time (Coursework)', 70600, 70600, 'MYR', 'RM 70,600', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_077', 'Bachelor of Sports Management', 'By studying various aspects of Sport Management such as Facilities and Equipment Management, Sport Finance, Sport Marketing, Event Management, Human Resource Management as well as Sport Law, Universiti Malaya graduates will have strong and adequate knowledge to make a difference. The Sports Centre, Universiti Malaya will strive further to improve the quality of the Sport Management programme in order for future graduates to become even more professional.', 42, '3.5 years( 7 semester ), Full time (Coursework)', 75100, 75100, 'MYR', 'RM 75,100', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_078', 'Bachelor of Sports Science (Exercise Science)', 'By learning various aspects of Exercise Science such as Anatomy and Physiology, Biomechanic, Sports Nutrition, Sports Psychology, Coaching, Measurement in Sports and Sports Science Research, graduates of Universiti Malaya will possess a well develop knowledge to more changes. The Sports Centre, Universiti Malaya in everwilling and continuously enhancing the quality of the Exercise Science program so that the graduates in the future will be more professional in their approach.', 42, '3.5 years( 7 semester ), Full time (Coursework)', 84700, 84700, 'MYR', 'RM 84,700', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z');

DO $$ BEGIN
  IF (SELECT COUNT(*) FROM official_um_programme_updates) <> 72 THEN
    RAISE EXCEPTION 'Unexpected official programme update count';
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
FROM official_um_programme_updates f, universities u
WHERE p.programme_code=f.programme_code AND p.university_id=u.id AND u.slug='um';

CREATE TEMP TABLE official_um_programme_sections (
  programme_code varchar(64), section_type varchar(40), title_en varchar(200), body_en text,
  source_url varchar(1000), source_checked_at timestamptz, PRIMARY KEY(programme_code, section_type)
) ON COMMIT DROP;

INSERT INTO official_um_programme_sections VALUES
    ('UM_BACHELOR_002', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtained at least Grade B in Mathematics subject
Senior High School Certificate
Pass with a minimum average of 65%/ Jayyid Jiddan
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) Subject
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 / average of 65% in Islamic Studies
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) subject
Diploma
Obtain a minimum CGPA of 3.00 / Jayyid Jiddan / average of 65% in Islamic Studies / Usuluddin / Shariah / Al-Quran and Al-Hadith Studies / Islamic Banking
Obtain a minimum of grade B- in Arabic Language
Obtain a minimum of grade B- in any ONE(1) subject
GEC A-Level
Obtain a minimum of grade B in Arabic Language
Obtain a minimum of grade B in any ONE(1) subject
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_002', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Penghayatan Etika dan Peradaban
Pengantar Pengajian Usuluddin
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Fiqh al-‘Ibadat
Pengantar Pentadbiran Perniagaan Islam
Ekonomi untuk Muamalat
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Bahasa Inggeris Komunikasi
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Syariah
Tilawah dan Hafazan
Fiqh al-Mu’amalat
Matematik untuk Muamalat
Pengurusan Pemasaran Islam
Co-Curriculum
Pilih satu kursus dari senarai di bawah:
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
Bahasa Inggeris Komunikasi
Nazariyyah al-Hukm al-Syar’i fi Usul al-Fiqh
Statistik untuk Muamalat
Al-`Uqud al-Musammah (FE)
Ayat dan Hadith Hukum untuk Muamalat (FE)
Sistem Kewangan Islam
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih satu sahaja
Asas Pembudayaan Keusahawanan
Qawaid Tafsir al-Nusus Fi Usul al-Fiqh
Asas Perakaunan
Amalan Perbankan dan Kewangan Islam
Pengurusan Kewangan
Sistem Pengurusan Islam
Kursus Elektif Program (pilih SATU sahaja): Pengguna dan kepenggunaan Islam
Amalan Takaful dan Retakaful
Pemasaran Digital Islam
Dirasah al-Ijma’ wa al-Qiyas
Keusahawanan Islam
Al-Qawa’id al-Fiqhiyyah
Gelagat Organisasi dari Perspektif Islam
Perakaunan Islam
Metodologi Syariah untuk Kewangan
Komunikasi dalam Muamalat
Teknologi Kewangan Islam
Kursus Elektif Universiti : Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Pengurusan Harta Secara Islam
Pasaran Modal Islam
Al-‘Urf wa al-Maslahah
Kursus Elektif Program (pilih SATU (1) kursus sahaja): Transaksi Kewangan Islam Semasa
Pengurusan Risiko Secara Islam
Analisis Pelaburan dan Sekuriti Menurut Islam
Pengurusan Halal di Malaysia dan Isu Semasa
Metodologi Penyelidikan Pengurusan Muamalat
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Etika Pengurusan Perniagaan Perbandingan
Kursus Elektif Program: Pilih empat (4) kursus sahaja Pengurusan Sumber Manusia dari Perspektif Islam
Pasaran Derivatif Islam
Tadbir Urus Korporat Islam
Pengurusan Strategik dalam Islam
Pengauditan untuk institusi Perniagaan Islam
Pengurusan Kewangan Islam
Kertas Projek Pengurusan Muamalat
Kursus Elektif Fakulti: Pilih satu (1) kursus sahaja
Latihan Industri Pengurusan Muamalat
Note:
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES (8 CREDITS)
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSES (27 CREDITS)
Auditing for Islamic Business Institutions
Communication in Muamalat
Consumers and Islamic Consumerism
Contemporary Islamic Financial Transactions
Halal Management in Malaysia and Current Issues
Human Resource Management from an Islamic Perspective
Islamic Accounting
Islamic Corporate Governance
Islamic Derivatives Market
Islamic Digital Marketing
Islamic Financial Management
Islamic Financial Technology
Investment and Security Analysis According to Islam
Muamalat Management Project Paper
Muamalat Management Research Methodology
Organizational Behavior from an Islamic Perspective
Risk Management in Islam
Shariah Methodology for Finance
Strategic Management in Islam
Takaful and Retakaful Practices
FACULTY / ACADEMY ELECTIVE COURSES (3 CREDITS)
Comparative Money and Capital Markets
Consumer Jurisprudence
Economic Cooperation in the Islamic World
Health Sciences According to the Quran and Hadith
History and Philosophy of Islamic Education
Integration of Islamic Knowledge and Current Sciences
Islamic Business and Muamalat Management
Islamic Financial Planning
Islamic Finance in Malaysia and Current Issues
Islamic Law and Society
Organizational Management Principles from an Islamic Perspective
Organizational Theory
Women and Governance in Islam', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_002', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Shariah Compliance Officer, Islamic Finance Executive, Syariah Auditor, Halal Industry Executive, Takaful (Islamic Insurance) Agent, Islamic Banking Officer, Investment Analyst (Islamic Funds), Zakat and Waqf Management Officer, Financial Planner (Islamic Finance), Islamic Wealth Management Advisor, Research Officer (Islamic Economics), Entrepreneur (Halal Business), Corporate Governance Executive (Shariah-compliant firms), Lecturer or Academic Researcher in Islamic Finance, Islamic Capital Market Executive', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_004', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM ( Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in the Bahasa Arab subject at STPM Level
Obtained at least Grade B- in ONE (1) subject at STPM Level
Matriculation / Foundation (Science and Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects at the Foundation in Islamic Studies and Science (University Malaya)
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in the field of Islamic Studies recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation SATU UM
GEC A-Level
Not Offered
International Baccalaureate (IB)
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least a Grade B- in the Bahasa Arab subject at STPM level
Obtain at least a grade of B- in ONE (1) subjects at the STPM;
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation in Islamic Studies and Science (University Malaya);
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 In Islamic Studies
Obtain at least a grade of B- in TWO (2) subjects at the IPTS Foundation
STAM (not the current year)
Malaysian citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%/ Jayyid Jiddan
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) Subject
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 / average of 65% in Islamic Studies
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) subject
Diploma
Obtain a minimum CGPA of 3.00 / Jayyid Jiddan / average of 65% in Islamic Studies / Usuluddin / Shariah / Al-Quran and Al-Hadith Studies /
Obtain a minimum of grade B- in Arabic Language
Obtain a minimum of grade B- in any ONE(1) subject
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in Arabic Language
Obtain a minimum of grade B in any ONE(1) subject
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_004', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Penghayatan Etika dan Peradaban
Co-Curriculum
Pilih satu kursus dari senarai di bawah:
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
Pengantar Pengajian Usuluddin
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Al-Akhlaq wa al-Tasawwuf
Al-Aqidah al-Islamiyyah
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Malay Language Communication (for International Student)
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Bahasa Inggeris Komunikasi
Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Syariah
Fiqh al-''Ibadat
Nazariyyah al-Hukm al-Syar‘i fi Usul al-Fiqh
‘Ulum al-Qur’an
‘Ulum al-Hadith
Bahasa Inggeris Komunikasi
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Usul Al-Tafsir
Dawabit fi Fahm al-Quran wa al-Sunnah
Tafsir Ayat Ahkam
Ahadith al-Ahkam
kursus Elektif Program: Pilih 1 sahaja
Al-Tafsir wa al-Hadith al-Mawdu’i
Pengajian al-Quran dan al-Hadith dalam Media
Kursus Elektif Fakulti: Pilih 1 kursus Elektif Fakulti yang ditawarkan – rujuk Lampiran A
Asas Kebudayaan Keusahawanan
Al-Jarh wa al-Ta''dil
Dirasah Nassiyyah Tahliliyyah fi al-Qur’an wa al-Hadith
Al-Madkhal Ila ‘Ilm al-Qira’at
Al-I‘jaz fi Al-Qur’an wa Al-Hadith
Kursus Elektif Program: Smart Al-Quran
kursus Elektif Program: Pilih 1 sahaja
Israiliyyat dalam Tafsir dan Hadith Nabi
Sains Menurut Al-Quran dan Al-Sunnah
Sirah al-Rasul wa al-Khulafa’ al-Rashidin
Takhrij al-Hadith wa Dirasah al-Asanid
Hujjiyyah al-Sunnah al-Nabawiyyah
kursus Elektif Program: Pilih 1 sahaja
Rekabentuk dan Pembangunan Teknologi Al-Quran dan Hadith
Penterjemahan Al-Quran dan Al-Hadith
Metodologi Hafazan Al-Quran
Kursus Elektif Fakulti: Pilih 2 kursus Elektif Fakulti yang ditawarkan – rujuk Lampiran A
Mukhtalif al-Hadith wa Mushkiluh
Kertas Projek Al-Quran dan Al-Hadith
Kursus Elektif Program: Orientalis dalam Pengajian Al-Quran dan al-Hadith
kursus Elektif Program: Pilih 1 sahaja
Rasm Wa Dabt Al-Qur''an
Aplikasi Ilmu Al-Qiraat
Kursus Elektif Fakulti: Pilih 1 kursus Elektif Fakulti yang ditawarkan – rujuk Lampiran A
Latihan Industri
Note:
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES (8 CREDITS)
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE (21 CREDITS)
Applications of Qur’anic Recitation
Commentary and Fabricated Hadith (Al-Tafsir wa al-Hadith al-Mawdu’i)
Design and Development of Qur’anic and Hadith Technology
Israeli Traditions in Qur’anic Exegesis and Prophetic Hadith
Methodology of Qur’anic Memorization
Orientalists in Qur’anic and Hadith Studies
Qur’anic and Hadith Studies in Media
Science According to the Qur’an and Sunnah
Script and Compilation of the Qur’an (Rasm Wa Dabt Al-Qur’an)
Smart Qur’an
Translation of the Qur’an and Hadith
FACULTY / ACADEMY ELECTIVE COURSES (12 CREDITS) - LAMPIRAN A
Business Management and Islamic Transactions
Contemporary Applications of Astronomy (Aplikasi Semasa Ilmu Falak)
Consumer Jurisprudence (Fiqh Kepenggunaan)
Ethics and Professionalism in Islamic Preaching
Health Sciences According to the Qur’an and Sunnah
Islamic Economic Systems in Malaysia
Issues of Weak and Fabricated Hadith in Malaysia
Medicine in the Qur’an and Sunnah
Muslim Politics in the Malay World', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_004', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Islamic Scholar, Religious Teacher, Quranic Studies Lecturer, Hadith Researcher, Islamic Counsellor, Islamic Education Coordinator, Mosque Imam, Religious Advisor, Author Of Islamic Literature, Islamic Curriculum Developer, Islamic Content Writer, Translator Of Islamic Texts, Community Outreach Coordinator, Islamic Affairs Officer, Interfaith Dialogue Facilitator, Islamic Historian, Religious Event Organizer, Quran Memorization Coach, Islamic Law Consultant, Lecturer In Islamic Universities.', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_005', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtained at least Grade C in Arabic Language and Islamic Studies Subject
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%/ Jayyid Jiddan
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) Subject
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 / average of 65% in Islamic Studies
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) subject
Diploma
Obtain a minimum CGPA of 3.00 / Jayyid Jiddan / average of 65% in Islamic Studies / Usuluddin / Shariah / Al-Quran and Al-Hadith Studies /
Obtain a minimum of grade B- in Arabic Language
Obtain a minimum of grade B- in any ONE(1) subject
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in Arabic Language
Obtain a minimum of grade B in any ONE(1) subject
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_005', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4 Year 5
Year 1 Year 2 Year 3 Year 4 Year 5 Penghayatan Etika dan Peradaban (PEP)
Pengantar Pengajian Usuluddin
AlArabiyah li al-Dirasat al-Islamiyyah 1
Sistem Kehakiman Islam
Fiqh al-''Ibadat
Pengantar Sistem Undang-undang di Malaysia
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Kursus Bahasa Inggeris
Falsafah dan Isu Semasa (FIS)*
Bahasa Melayu Asas**
Pengantar Pengajian Syariah
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pentadbiran Undang-Undang Islam di Malaysia
Fiqh Muamalat
Undang-Undang Perlembagaan dan Pentadbiran
Kursus Bahasa Inggeris
Co-Curriculum: Pilih 1 kursus sahaja
GKA1001 Sangkutan@Industri (Attach@Industry)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)]
Usul Al-Fiqh 1
Kontrak Muamalat
Undang-Undang Keluarga Islam
Undang-Undang Pusaka Islam
Fiqh al-Jinayat
Asas Pembudayaan Keusahawanan
Ayat Wa Ahadith al-Ahkam
Undang-Undang Wasiat dan Hibah
Usul al-Fiqh 2
Fiqh al-Ahwal al-Syakhsiyyah
Undang-Undang Pengguna
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Metodologi Penyelidikan Undang-Undang Islam
Undang-Undang Jenayah Syariah
Al-Qawaid al-Fiqhiyyah
Undang-Undang Jenayah 1
Undang-Undang Kontrak 1
Undang-Undang Tanah 1
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Undang-Undang Keterangan Islam
Undang-Undang Keterangan Mal
Undang-Undang Tatacara Jenayah Syariah
Maqasid al-Syari''ah
Undang-Undang Jenayah 2
Undang-Undang Kontrak 2
Undang-Undang Tanah 2
Kursus Elektif Fakulti: Pilih 1 kursus Elektif Fakulti yang ditawarkan – rujuk Lampiran A
Amalan Profesional
Undang-Undang Perbankan dan kewangan Islam
Al-Dirasah al-Nassiyah fi al-Syari''ah wa al-Qanun
Undang-Undang Tort
Undang-Undang Harta Intelek
Al-Dirasah al-Nassiyah fi al-Syari''ah wa al-Qanun
Kursus Elektif Program: Pilih 1 Kursus Sahaja Undang-Undang Islam dan Jantina
Mediasi Syariah
Kursus Elektif Fakulti: Pilih 1 kursus sahaja
Undang-Undang Islam dan Masyarakat
Moot
Undang-Undang Ekuiti dan Amanah
Kursus Elektif Program: Pilih 2 kursus sahaja Undang-Undang dan Pentadbiran Wakaf
Undang-Undang dan Fatwa di Malaysia
Kertas Projek
Latihan Industri
Note:
*Pelajar Warganegara
**Pelajar Bukan Warganegara
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES (8 CREDITS)
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSES (9 CREDITS)
Islamic Law and Gender
Law and Fatwa in Malaysia
Project Paper
Sharia Mediation
Waqf Law and Administration
Zakat and Baitulmal Law
FACULTY / ACADEMY ELECTIVE COURSES (3 KREDIT)
Basics of Astronomy
Business Management and Islamic Transactions
Contemporary Applications of Astronomy
Consumer Jurisprudence
Creed in Prophetic Hadith
Economic Cooperation in the Islamic World
Islamic Economic Systems in Malaysia
Islamic Economic Thought
Islamic Law and Society
Islamic Property Law in Malaysia
Integration of Islamic Knowledge and Contemporary Science
Introduction to Contemporary Islamic Law
History and Philosophy of Islamic Education
Human Rights in Islam
Law and Violence Against Women
Medicine in the Qur’an and Sunnah
Muslim Politics in the Malay World
Religious Practices in Muslim Society
Theory and Practice of Public Administration
Women and Governance in Islam', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_005', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Shariah Lawyer, Islamic Court Judge, Legal Advisor In Islamic Finance, Compliance Officer In Islamic Banking, Legal Consultant, Legal Researcher, Mediator In Islamic Disputes, Lecturer In Shariah And Law, Government Legal Officer, Legal Policy Analyst, Human Rights Advocate, Legal Auditor, Corporate Legal Counsel With Shariah Expertise, Public Prosecutor In Islamic Courts, Legal Affairs Manager, NGO Legal Advisor, Legal Writer/Journalist, Law Enforcement Officer Specializing In Shariah, Arbitrator, Islamic Legal Trainer.', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_001', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM ( Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in ONE (1) of the following subject at STPM Level Syariah
Usuluddin
Tahfiz Al-Quran
Obtained at least Grade B- in any ONE (1) subject at the STPM level that has not yet been counted.
Matriculation / Foundation (Science and Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects at the Foundation in Islamic Studies (University Malaya)
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in the field of Islamic Studies recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation SATU UM
GEC A-Level
Not Offered
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least a Grade B- in the Bahasa Arab subject at STPM level
Obtain at least a grade of B- in ONE (1) subjects at the STPM;
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation in Islamic Studies (University Malaya);
STAM (not the current year)
Malaysian citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of Jayyid in TWO (2) subjects at the STAM level
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 In Islamic Studies
Obtain at least a grade of B- in TWO (2) subjects at the IPTS Foundation
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%/ Jayyid Jiddan
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) Subject
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 / average of 65% in Islamic Studies
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) subject
Diploma
Obtain a minimum CGPA of 3.00 / Jayyid Jiddan / average of 65% in Islamic Studies / Usuluddin / Shariah / Al-Quran and Al-Hadith Studies /
Obtain a minimum of grade B- in Arabic Language
Obtain a minimum of grade B- in any ONE(1) subject
GEC A-Level;
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in Arabic Language
Obtain a minimum of grade B in any ONE(1) subject
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_001', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Penghayatan Etika dan Peradaban
Pengantar Pengajian Syariah
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Nazariyyah al-Hukm al-Syar‘i fi Usul al-Fiqh
Prinsip Shariah dalam Sistem Ekonomi Islam
Pengajian Siasah Syar''iyyah
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Bahasa Inggeris Komunikasi
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Usuluddin
Fiqh al-''Ibadat
Dirasah al-Quran wa al-Sunnah
Fiqh al-Ahwal al-Syakhsiyyah
Pengantar Falak
Pentadbiran Islam Kontemporari
Co-Curriculum
Pilih 1 Kursus dari Senarai di bawah:
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
IIP2002 Fiqh al-Mu’amalat
IIP2003 Fiqh al-Jinayat
IIP2018 Qawaid Tafsir al-Nusus Fi Usul al-Fiqh
Kursus Elektif Program: (pilih 3 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi
Dirasah al-Ijma'' wa al-Qiyas
Fiqh al-halal wa al-Haram fi al-Islam
Kursus Elektif Program: (pilih 3 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus
Al-''Urf wa al-Maslahah
Literatur Pengajian Syariah
Kursus Elektif Program: (pilih 2 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Fakulti: Pilih 2 Kursus Elektifif Fakulti yang ditawarkan pada semester semasa
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus
Maqasid al-Syari''ah
Al-Qawa''id al-Fiqhiyyah
Kertas Projek Syariah
Kursus Elektif Program: (pilih 1 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Fakulti: Pilih 2 Kursus Elektif Fakulti yang ditawarkan pada semester semasa
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) [Pilih 1 kursus]
Latihan Industri Shariah
Note:
*Pelajar Warganegara
**Pelajar Bukan Warganegara
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES (8 CREDITS)
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE (LAMPIRAN A)
1. Pengkhususan Fiqh dan Usul / Specialization Fiqh and Usul
SEMESTER 3 Pilih 3 Kursus sahaja:
Amalan Fatwa
Manahij al-Fuqaha''
Al-Dirasah al-Nassiyyah
SEMESTER 4 Pilih 3 Kursus sahaja:
Al-Ijtihad Wa Al-Ikhtilaf
Muamalat Semasa
Pengajian Hudud, Qisas dan Takzir
SEMESTER 5 Pilih 2 Kursus sahaja:
Nizam al-Qada''
Fiqh Zakat
Fiqh al-Marawith wa al-Wasaya
Pematuhan Syariah dalam Industri Kewangan
Fiqh al-Hajj wa al-‘Umrah
Fiqh al-Waqf wa al-Hibah
SEMESTER 6 Pilih 1 Kursus sahaja:
Fiqh Budaya
Ayat Wa Ahadith al-Ahkam
Mantiq dalam Pengajian Syariah
2. Pengkhususan Ekonomi Islam / Specialization in Islamic Economics
SEMESTER 3 Pilih 3 Kursus sahaja:
Makroekonomi Islam
Ekonomi Digital Islam
Prinsip Ekonomi
Kuantitatif untuk Ekonomi Islam
Teori dan Amalan Takaful di Malaysia
SEMESTER 4 Pilih 3 Kursus sahaja:
Mikroekonomi Islam
Pengantar Perakaunan
Sistem Perbankan Islam
Ekonomi Zakat dan Wakaf
SEMESTER 5 Pilih 2 Kursus sahaja:
Perakaunan Zakat
Ekonomi Malaysia dan Isu Semasa
Ijtihad dalam Isu Ekonomi dan Kewangan Islam
Pasaran Wang dan Modal Islam
SEMESTER 6 Pilih 1 Kursus sahaja:
Ekonometrik Asas
Isu Muamalat dalam Perbankan dan Kewangan Islam
3. Pengkhususan Governan Islam / Specialization in Islamic Governance
SEMESTER 3 Pilih 3 Kursus sahaja:
Asas Sains Politik
Sistem Governan dalam Islam
Pengurusan Kualiti Berteraskan Syariah
Sejarah Politik Islam
SEMESTER 4 Pilih 3 Kursus sahaja:
Kepimpinan Islam
Pentadbiran Organisasi Awam Islam
Pentadbiran Politik dan Masyarakat Malaysia
Pengenalan Siasah Syar''iyyah
SEMESTER 5 Pilih 2 Kursus sahaja:
Intergriti Governan dalam Islam
Institusi Pentadbiran Politik Islam
Perhubungan Antarabangsa Islam
Pengurusan Masyarakat Majmuk dalam Islam
SEMESTER 6 Pilih 1 Kursus sahaja:
Governan dan Dasar Awam Malaysia
Pentadbiran Kakitangan dan Organisasi
Pemikiran Politik Islam Perbandigan
4. Pengkhususan Falak/ Specialization in Astronomy
SEMESTER 3 Pilih 3 Kursus sahaja:
Kaedah Matematik dalam Astronomi
Amali Asas Sains Fizik
Isu-isu Kontemporari dalam Astronomi Islam
SEMESTER 4 Pilih 3 Kursus sahaja:
Fiqh Falak
Prinsip Astronomi Semasa
Penentuan Arah Kiblat dan Waktu Solat
SEMESTER 5 Pilih 2 Kursus sahaja:
Kaedah Penyelidikan Falak
Sistem Takwim
Amali Pencerapan dan Instrumentasi
Dirasah al-Miqat
SEMESTER 6 Pilih 1 Kursus sahaja:
Historiografi Sains Islam
Pentadbiran Kakitangan dan Organisasi
Pemikiran Politik Islam Perbandigan
FACULTY / ACADEMY ELECTIVE COURSES (10 CREDITS)
Basics of Astronomy
Consumer Jurisprudence
Creed in Prophetic Traditions
Current Applications of Astronomy
Economic Cooperation in the Islamic World
History and Philosophy of Islamic Education
Human Rights in Islam
Integration of Islamic Knowledge and Current Sciences
Islamic Economic System in Malaysia
Islamic Economic Thought
Islamic Law and Society
Introduction to Contemporary Islamic Law
Management of Business and Islamic Transactions
Medicine in the Quran and Sunnah
Muslim Politics in the Malay World
Quranic and Prophetic Guidance on Astronomy
Religious Practices in Islamic Society
Theory and Practice of Public Administration
Women and Governance in Islam', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_001', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Shariah Advisor, Islamic Finance Consultant, Mosque Imam, Islamic Judge (Qadi), Religious Teacher, Islamic Legal Researcher, Lecturer In Syariah Studies, Halal Certification Officer, Islamic Banking Officer, Islamic Counsellor, Legal Consultant In Syariah Law, Compliance Officer In Islamic Institutions, Community Outreach Coordinator, Mediator In Family And Inheritance Matters, Islamic Affairs Officer, NGO Worker Specializing In Islamic Law, Islamic Content Writer, Public Speaker On Syariah Issues, Islamic Event Organizer, Policy Analyst In Islamic Law.', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_003', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM ( Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in ONE (1) of the following subject at STPM Level Syariah
Usuluddin
Tahfiz Al-Quran
Obtained at least Grade B- in any ONE (1) subject at the STPM level that has not yet been counted.
Matriculation / Foundation (Science and Art Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects at the Foundation in Islamic Studies (University Malaya)
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in the field of Islamic Studies recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation SATU UM
GEC A-Level
Not Offered
International Baccalaureate
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least a Grade B- in the Bahasa Arab subject at STPM level
Obtain at least a grade of B- in ONE (1) subjects at the STPM;
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Foundation in Islamic Studies (University Malaya);
STAM (not the current year)
Malaysian citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of Jayyid in TWO (2) subjects at the STAM level
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 In Islamic Studies
Obtain at least a grade of B- in TWO (2) subjects at the IPTS Foundation
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%/ Jayyid Jiddan
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) Subject
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 / average of 65% in Islamic Studies
Obtain a minimum of 60%/ grade B- in Arabic Language
Obtain a minimum of 60%/ grade B- in any ONE(1) subject
Diploma
Obtain a minimum CGPA of 3.00 / Jayyid Jiddan / average of 65% in Islamic Studies / Usuluddin / Shariah / Al-Quran and Al-Hadith Studies /
Obtain a minimum of grade B- in Arabic Language
Obtain a minimum of grade B- in any ONE(1) subject
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in Islamic Law/Shariah Law
Obtain a minimum of grade B in any ONE(1) subject
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_003', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Penghayatan Etika dan Peradaban
Pengantar Pengajian Usuluddin
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Nazariyyah al-Hukm al-Syar‘i fi Usul al-Fiqh
''Ulum al-Qur''an
''Ulum al-Hadith
Kajian Perbandingan Agama
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 Kursus Sahaja
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Co-Curriculum
Pilih satu kursus dari senarai di bawah:
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Syariah
Fiqh al-''Ibadat
Tilawah dan Hafazan
Al-''Aqidah al-Islamiyyah
Al-Akhlak wa al-Tasawwuf
Bahasa Inggeris Komunikasi
Usul al-Da''wah
Aliran Permikiran Islam
Sistem Dalam Tamadun Islam
Kursus Elektif Program: (pilih 1 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Fakulti: Pilih 1 kursus Fakulti yang ditawarkan - rujuk Lampiran B
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus sahaja
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi
Pembangunan Insan
Al-Falsafah al-Islamiyyah
Sirah al-Rasul wa al-Khulafa'' al-Rashidin
Kursus Elektif Program: (pilih 1 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran B)
Kursus Elektif Fakulti: (pilih 1 kursus Elektif Fakulti yang Ditawarkan – rujuk Lampiran B)
Kursus Elektif Universiti: Student Holistic Empowerment (SHE) Pilih 1 kursus
Metodologi Dakwah
Kajian Fatwa dan ajaran salah di Malaysia
Dunia Islam Kini
Kursus Elektif Program: (pilih 3 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran A)
Kursus Elektif Fakulti: (Pilih 4 Kursus Elektifif Fakulti yang ditawarkan - rujuk Lampiran B)
Kertas Projek Usuluddin
''Ilm al-Kalam wa al-Tahaddiyat al-Mu''asirah
Kursus Elektif Program: (pilih 4 kursus Elektif Program mengikut Pengkhususan – rujuk Lampiran B)
Latihan Industri Usuluddin
Note:
*Pelajar Warganegara
**Pelajar Bukan Warganegara
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES (8 CREDITS)
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE (LAMPIRAN A)
1. Pengkhususan Pemikiran Islam dan Pengajian Kerohanian
Isu Akidah dan Pemikiran Islam Semasa
Psikospiritual Islam
Dialog Inter Agama dalam Konteks Kemajmukan
Akidah dalam Tafsir Al-Quran
Psikologi Agama
Dialog Intra Agama
Kajian Teks Kerohanian dan Pemikiran Islam
Falsafah Dunia
Epistemologi Islam
Falsafah dan Ideologi Moden
Tasawuf Tarekat
Al-Mantiq
Kajian Agama
Adab al-Bahth wa al-Munazarah fi Masai''il al-Aqidah
Kemahiran Psikoterapi Islam
2. Pengkhususan Sejarah dan Tamadun Islam
Tamadun Islam di Afrika dan Eropah
Sejarah Islam Zaman Uthmaniyyah
Al- Tarikh al-Umawi wa al-Abbas
Metodologi Penyelidikan Sejarah Islam
Pengantar Sejarah dan Tamadun Islam
Sejarah Islam di Nusantara
3. Pengkhususan Dakwah dan Pembangunan Insan
Kemahiran Asas Kaunseling dalam Dakwah
Pembangunan Minda
Pengucapan Dakwah
Psikologi Dakwah
Dakwah dan Pembangunan Masyarakat
Media Cetak Dakwah
Dakwah dan Media Penyiaran
Dakwah dan Kelompok Minoriti
Teori Kaunseling dan Psikoterapi
Komunikasi Dakwah
Pengurusan Dakwah
Penulisan Dakwah
Konsultasi, Perkahwinan dan Keluarga
Dinamika Kelompok
Motivasi Kendiri
Pengajian Islamic Jerusalem dan Timur Tengah
Historiografi dan Falsafah Sejarah Islam
Sejarah Islam di China dan India
Sejarah Islam di Asia Tengah
Peperangan dan Perdamaian dalam Sejarah Islam
Filologi dan Konservasi Manuskrip Melayu-Islam
Islam di Amerika dan Eropah
Seni Islam
Sejarah Gerakan Islah dan Tajdid
FACULTY / ACADEMY ELECTIVE COURSES (LAMPIRAN B)
Biography Studies of Islamic Scholars
Civilization of Muslim Minorities
Creed in Prophetic Traditions
Ethics and Professionalism in Islamic Preaching
Islamic Economic System in Malaysia
Islamic Preaching and Plural Society
Islamic Preaching in Malaysia
Islamic Socio-Political Thought
Islam and Malay Socio-Culture
Islamic Critical Thinking
Literature and Libraries in Islamic Civilization
Management of Islamic Museums and Artifacts
Medicine in the Quran and Sunnah
Mosque Administration
Muslim Politics in the Malay World
New Media and Islamic Preaching
Parenting Education
Spiritual Intelligence in Islam
Theory and Practice of Public Administration
Traditional Islamic Text Study', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_003', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Religious Teacher, Islamic Studies Lecturer, Imam, Mosque Administrator, Islamic Counsellor, Researcher in Islamic Theology, Shariah Advisor, Islamic NGO Officer, Islamic Content Writer, Religious Affairs Officer, Interfaith Dialogue Coordinator, Islamic Education Curriculum Developer, Da’wah Officer, Chaplain, Islamic Ethics Consultant, Quranic Studies Specialist, Islamic Youth Mentor, Religious Broadcaster, Islamic Heritage Researcher', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_006', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in a related field recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects
GEC A-Level
Not Offered
International Baccalaureate
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the STPM;
Matriculation / Foundation (not the current year)
Not Offered
STAM (not the current year)
Not Offered
IPTS Foundation (not the current year)
Not Offered
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_006', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Kursus Bahasa Inggeris
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Ko-Kurikulum
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Bahasa Melayu dan Multimedia
Tatabahasa Bahasa Melayu
Bahasa dalam Komunikasi Interpersonal
Kursus Elektif Universiti: Rujuk senarai pilihan SHE
Falsafah dan Isu Semasa*
Kursus Bahasa Inggeris
Pengajian Melayu dan Masyarakat
Bahasa Melayu Tinggi
Sistem Ejaan Jawi
Semantik Leksikal Bahasa Melayu
Bahasa Melayu dalam Penyiaran dan Kewartawanan
Kursus Elektif Universiti: Rujuk senarai pilihan SHE
Kursus Elektif Universiti: Rujuk senarai pilihan SHE
Kursus Bahasa Inggeris
Bahasa Melayu dalam Periklanan dan Perdagangan
Analisis Wacana Bahasa Melayu
Laras Bahasa Melayu
Stilistik Bahasa Melayu
Kursus Elektif Universiti: Rujuk Senarai SHE(Kembara 2a)
Kursus Elektif: Rujuk Senarai Pilihan Elektif(Kembara 2a)
Asas Pembudayaan Keusahawanan
Bahasa Melayu, Masyarakat dan Media Sosial
Analisis Bezaan dan Analisis Kesilapan Bahasa Melayu
Bahasa Melayu dalam Sinematografi
Retorik Bahasa Melayu
Kursus Elektif: Rujuk senarai pilihan Elektif (Kembaran 2a)
Penulisan Bahasa Melayu Profesional
Pembangunan Perisian Kursus Bahasa Melayu
Penterjemahan Bahasa Melayu
Terminologi dalam Perancangan Bahasa Melayu
Perkembangan dan Pemerolehan Bahasa kanak-kanak
Kertas Projek (p1)
Penerbitan dan Penyuntingan Teks Bahasa Melayu
Animasi Kreatif Bahasa Melayu
Bahasa dalam Komunikasi Korporat
Leksikografi Bahasa Melayu
Pembelajaran dan Penguasaan Bahasa Melayu
Kertas Projek (P2)
Latihan Industri
Note:
*Bukan warganegara (BW) sahaja
**Jumlah kredit maksimum adalah 22 kredit bagi setiap semester
STUDENT HOLISTIC EMPOWERMENT (SHE) COURSES
Emotional and Spiritual Intelligence: Heart, Body & Soul
Islamic Creed
Psychospiritual
Islamic Akhlaq Education
Global Trends in Food and Health
Psychology Positive in Daily Life
Music Moves
Mindfulness through Music
Dance in the World
Fitness and Nutrition
Exercise and Active Living
Tobacco and Smoking Cessation Programme
Stress Management
Appreciation of Harmony Singing
Dental Health
SENARAI KURSUS ELEKTIF(KEMBARAN 2a)
PROGRAM SARJANA MUDA BAHASA MELAYU PROFESIONAL
KURSUS ELEKTIF PILIHAN
Sarjana Muda Bahasa Melayu Profesional
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
Sarjana Muda Kesusasteraan Melayu
Tulisan Jawi dalam Kesusasteraan Melayu
Sosiologi Kesusasteraan Melayu
Kesusasteraan Melayu dan Komersial
Ilustrasi Kesusasteraan
Pengajaran Kesusasteraan Melayu
Ilmu Pernaskhahan Melayu
Penulisan Kreatif Puisi Melayu
Kesusasteraan Kitab
Kesusasteraan Melayu dan Penerbitan
Sarjana Muda Linguistik Melayu
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
Sarjana Muda Pengajian Melayu
Seni Lukis dan Catan
Seni Kaligrafi Melayu
Eksperimentasi Seni Visual
Seni Bina dan Ragam Hias Melayu
Seni Kraf Tangan dan Busana Melayu
Seni Tradisi Masyarakat Sabah dan Sarawak
Pembangunan Reka Bentuk Dua Dimensi
Pembangunan Reka Bentuk Tiga Dimensi
Fotografi Digital
Animasi Berkomputer
Seni Persembahan Iklan
Teknik Seni Persembahan
Teori Pengajian Kesenian Melayu
Psikologi dalam Kesenian
Seni dan Budaya Popular Melayu
Hukum Adat Melayu
Pendidikan dan Pengajaran Seni dan Budaya Melayu/li>
Pentadbiran Masyarakat
Estetika dan Etika Seni Rupa Melayu
Budaya Perubatan dan Kesihatan di Alam Melayu
Keusahawanan Melayu
Pemasaran Produk Seni dan Budaya
Pengurusan Pameran
Pengurusan Panggung Persembahan
Rekaan dan Penataan Sinografi', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_006', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Malay Language Editor, Content Writer, Copywriter, Translator, Language Researcher, Proofreader, Lexicographer, Language Policy Officer, Scriptwriter, Subtitler, Public Relations Officer, Corporate Communications Executive, Speechwriter, Language Trainer, Malay Language Teacher, Media Analyst, Broadcast Journalist, Technical Writer, Cultural Officer.', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_007', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in a related field recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects
GEC A-Level
Not Offered
International Baccalaureate
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the STPM;
Matriculation / Foundation (not the current year)
Not Offered
STAM (not the current year)
Not Offered
IPTS Foundation (not the current year)
Not Offered
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_007', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Ko-kurikulum
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Pengantar Linguistik Melayu
Penulisan Dokumen Khusus
Sosiolinguistik
Kursus Elektif Universiti: Rujuk senarai pilihan SHE
Falsafah dan Isu Semasa*
Bahasa Inggeris Komunikasi
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Fonetik
Penyelidikan Lapangan
E-Linguistik
Kursus Elektif Universiti: Pilih satu kursus SHE
Kursus Elektif Program: Sila rujuk senarai penawaran di Kembaran 2 (a)
Bahasa Inggeris Komunikasi
Penulisan Akademik
Fonologi
Morfologi
Linguistik Korpus
Analisis Wacana Bahasa
Kursus Elektif Universiti: Pilih satu kursus SHE
Kursus Elektif: Rujuk Senarai Pilihan Elektif(Kembara 2a)
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi (ECP)
Linguistik Teks
Kepelbagaian Dialek Melayu
Leksikologi
Kompetensi Komunikatif
Penyuntingan Kesusasteraan Melayu
Kursus Elektif: Rujuk senarai pilihan Elektif (Kembaran 2a)
Pemikiran Melayu
Melayu dan Perlembagaan
Sintaksis
Semantik
Pragmatik
Etnolinguistik
*Projek Tahun Akhir (P1)
Kursus Elektif Program: Sila rujuk senarai penawaran di Kembaran 2 (a)
Isu Semasa Pengajian Melayu
Filogenetik Bahasa
Psikolinguistik
Kaedah dan Teknik Penterjemahan
Projek Tahun Akhir(P2)
Kursus Elektif Program: Sila rujuk senarai penawaran di Kembaran 2 (a)
Latihan Industri
Note:
*Kursus Progresif (P)
SENARAI KURSUS ELEKTIF(KEMBARAN 2a)
PROGRAM SARJANA MUDA LINGUISTIK MELAYU
KURSUS ELEKTIF PILIHAN
Sarjana Muda Linguistik Melayu
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
Sarjana Muda Kesusasteraan Melayu
Kesusasteraan Drama
Kesusasteraan dan Undang-undang
Tulisan Jawi dalam Kesusasteraan Melayu
Sosiologi Kesusasteraan Melayu
Kesusasteraan Melayu dan Komersial
Ilustrasi Kesusasteraan
Pengajaran Kesusasteraan Melayu
Ilmu Pernaskhahan Melayu
Penulisan Kreatif Puisi Melayu
Kesusasteraan Kitab
Kesusasteraan Melayu dan Penerbitan
Sarjana Muda Bahasa Melayu Profesional
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
Sarjana Muda Pengajian Melayu
Seni Lukis dan Catan
Seni Kaligrafi Melayu
Eksperimentasi Seni Visual
Seni Bina dan Ragam Hias Melayu
Seni Kraf Tangan dan Busana Melayu
Seni Tradisi Masyarakat Sabah dan Sarawak
Pembangunan Reka Bentuk Dua Dimensi
Pembangunan Reka Bentuk Tiga Dimensi
Fotografi Digital
Animasi Berkomputer
Seni Persembahan Iklan
Teknik Seni Persembahan
Seni Tari Melayu
Koreografi Tari Melayu
Seni Muzik Melayu
Bentuk Lakon Melayu Tradisi
Teori Pengajian Kesenian Melayu
Teori Pengajian Kesenian Melayu
Psikologi dalam Kesenian
Seni dan Budaya Popular Melayu
Hukum Adat Melayu
Pendidikan dan Pengajaran Seni dan Budaya Melayu/li>
Pentadbiran Masyarakat
Estetika dan Etika Seni Rupa Melayu
Budaya Perubatan dan Kesihatan di Alam Melayu
Keusahawanan Melayu
Pemasaran Produk Seni dan Budaya
Pengurusan Pameran
Pengurusan Panggung Persembahan
Rekaan dan Penataan Sinografi
Ditawarkan sebagai elektif kepada pelajar program, fakulti dan luar fakulti.', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_007', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Linguist, Language Researcher, Translator, Interpreter, Editor, Lexicographer, Proofreader, Language Planner, Copywriter, Scriptwriter, Speech Analyst, Content Developer, Language Teacher, Communication Officer, Academic Researcher, Lecturer, Curriculum Developer, Language Consultant, Media Analyst, Public Relations Officer, Text Analyst, Subtitling Specialist, Technical Writer.', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_008', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in a related field recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects
GEC A-Level
Not Offered
International Baccalaureate
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the STPM;
Matriculation / Foundation (not the current year)
Not Offered
STAM (not the current year)PTS Foundation
Not Offered
IPTS Foundation
Not Offered
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_008', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Bahasa Inggeris Komunikasi
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Ko-kurikulum
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Puisi Tradisional
Pengantar Linguistik Melayu
Bahasa Inggeris Komunikasi
Falsafah dan Isu Semasa
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Puisi Moden
Pengantar Teori Kesusasteraan
Prosa Moden
Kesusasteraan Islam
Bahasa Inggeris Komunikasi
Penulisan Akademik
Prosa Tradisional
Kesusasteraan Lisan Serumpun
Metodologi Penyelidikan Sastera
Kesusasteraan Elektronik
Kritikan Kesusasteraan Melayu
Kursus Elektif Universiti: Pilih satu kursus SHE
Asas Pembudayaan Keusahawanan
Kesusasteraan Bandingan Melayu
Pengantar Karya Agung Kesusasteraan
Penyuntingan Kesusasteraan Melayu
Kesusasteraan Melayu dan Stilistik
Pengurusan dan Pemasaran Kesusasteraan
Penulisan Skrip
Kursus Elektif Universiti: Pilih 1 kursus SHE
Pemikiran Melayu
Melayu dan Perlembagaan
Pengantar Kesusasteraan Antarabangsa
Kesusasteraan Melayu dan Estetika
Penulisan Kreatif Prosa Melayu
Latihan Ilmiah (P)
Kursus Elektif Program: Sila rujuk Kursus Elektif Pilihan yang ditawarkan
Kursus Elektif Universiti: Pilih 1 kursus SHE
Isu Semasa Pengajian Melayu
Latihan Ilmiah (P)
Penulisan Kesusasteraan Kanak-Kanak dan Remaja
Kesusasteraan Melayu dan Komunikatif
Kursus Elektif Program: Sila rujuk Kursus Elektif Pilihan yang ditawarkan
Kursus Elektif Universiti: Pilih 1 kursus SHE
Latihan Industri
Note:
KURSUS STUDENT HOLISTIC EMPOWERMENT - SHE (8 Kredit)
SHE 1: Kluster Thinking Matters, Mind & Intelect
SHE 2: Kluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Kluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Kluster Global Issues and Community Sustainability: Making the World a Better Plac
KURSUS ELEKTIF PILIHAN
Sarjana Muda Kesusasteraan Melayu
Kesusasteraan Drama
Kesusasteraan dan Undang-undang
Tulisan Jawi dalam Kesusasteraan Melayu
Sosiologi Kesusasteraan Melayu
Kesusasteraan Melayu dan Komersial
Ilustrasi Kesusasteraan
Pengajaran Kesusasteraan Melayu
Ilmu Pernaskhahan Melayu
Penulisan Kreatif Puisi Melayu
Kesusasteraan Kitab
Kesusasteraan Melayu dan Penerbitan
Sarjana Muda Bahasa Melayu Profesional
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
Sarjana Muda Linguistik Melayu
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
Sarjana Muda Pengajian Melayu
Seni Lukis dan Catan
Seni Kaligrafi Melayu
Eksperimentasi Seni Visual
Seni Bina dan Ragam Hias Melayu
Seni Kraf Tangan dan Busana Melayu
Seni Tradisi Masyarakat Sabah dan Sarawak
Pembangunan Reka Bentuk Dua Dimensi
Pembangunan Reka Bentuk Tiga Dimensi
Fotografi Digital
Animasi Berkomputer
Seni Persembahan Iklan
Teknik Seni Persembahan
Seni Tari Melayu
Koreografi Tari Melayu
Seni Muzik Melayu
Bentuk Lakon Melayu Tradis
Teori Seni Persembahan
Teori Pengajian Kesenian Melayu
Psikologi dalam Kesenian
Seni dan Budaya Popular Melayu
Hukum Adat Melayu
Latihan Ilmiah
Pendidikan dan Pengajaran Seni dan Budaya Melayu
Pentadbiran Masyarakat
Estetika dan Etika Seni Rupa Melayu
Budaya Perubatan dan Kesihatan di Alam Melayu
Keusahawanan Melayu
Pemasaran Produk Seni dan Budaya
Pengurusan Pameran
Pengurusan Panggung Persembahan
Rekaan dan Penataan Sinografi
Ditawarkan sebagai elektif kepada pelajar program, fakulti dan luar fakulti.', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_008', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Writer, Novelist, Poet, Editor, Scriptwriter, Copywriter, Content Creator, Literature Researcher, Lecturer, Language Teacher, Cultural Officer, Museum Curator, Publisher, Journalist, Literary Critic, Book Reviewer, Public Relations Officer, Communication Executive, Academic Writer, Translator, Heritage Officer, Creative Director, Media Producer.', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_009', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) subjects
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in a related field recognized by the Government of Malaysia and approved by the Senate of the University Malaya, with a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects
GEC A-Level
Not Offered
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in TWO (2) subjects at the STPM;
Matriculation / Foundation (not the current year)
Not Offered
IPTS Foundation
Not Offered
STAM (not the current year)
Not Offered
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.0
IELTS (Academic) 4.5
TOEFL iBT (Centre-based) 33
TOEFL Essentials (Online) 6.5
Pearson Test of English (PTE Academic) 43
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 147', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_009', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Ko-kurikulum
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Pengurusan Sumber Sejarah Pengajian Melayu
Sosiologi Bahasa
Kosmologi Melayu
Seni, Budaya dan Masyarakat Melayu
Kursus Elektif Program: Pilih satu kursus SHE
Falsafah dan Isu Semasa
Bahasa Inggeris Komunikasi
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Teori Pengajian Melayu
Dunia Melayu
Institusi Sosial Melayu/li>
Identiti Melayu
Kursus Elektif Universiti: Pilih 1 kursus SHE
Bahasa Inggeris Komunikasi
Penulisan Akademik
Budaya Politik dan Kepimpinan Melayu
Seni Melayu dan Islam
Sastera, Drama dan Media
Kursus Elektif Program: PILIH 5 KURSUS Pilih 1 Kursus SHE
Pilih 4 Kursus Elektif JIF3008
JIF3010
JIF3012
JIF3013(p)
JIF3016
JIF3017
JIF3018
JIF3020
JIF3021
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi (ECP)
Kearifan Tempatan dan Teknologi Melayu
Kaedah Penyelidikan Pengajian Melayu
Bahasa dan Komuniti Melayu
Industri Kreatif Melayu
Kursus Elektif Program: PILIH 4 KURSUS Pilih 1 Kursus SHE
Pilih 3 Kursus Elektif JIF3009
JIF3011
JIF3013(p)
JIF3014
JIF3015
JIF3019
JIF302
Pemikiran Melayu
Melayu dan Perlembagaan
Warisan Budaya dan Pelancongan
Pengurusan Arkib, Muzium dan Galeri
Kenegaraan dan Dasar-Dasar Negara
Projek Penyelidikan
Kursus Elektif Program: PILIH 4 KURSUS JIF2008
JIF2009
JIF2010(p)
JIF2011
JIF2014
JIF2017
JIF2020
JIF2022
Isu Semasa Pengajian Melayu
Pemodenan dan Perubahan Orang Melayu
Kepimpinan Sosial Melayu
Ekonomi Melayu
Kursus Elektif Program: PILIH 6 KURSUS JIF2012
JIF2013
JIF2015(p)
JIF2016
JIF2018
JIF2019
JIF2021
JIF2023
Latihan Industri
Note:
*Pelajar boleh memilih mana mana kursus elektif seperti di lampiran
KURSUS STUDENT HOLISTIC EMPOWERMENT - SHE (8 KREDIT)
SHE 1: Kluster Thinking Matters, Mind & Intelect
SHE 2: Kluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Kluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Kluster Global Issues and Community Sustainability: Making the World a Better Plac
KURSUS ELEKTIF PROGRAM
Seni Lukis dan Catan
Seni Kaligrafi Melayu
Eksperimentasi Seni Visual
Seni Bina dan Ragam Hias Melayu
Seni Kraf Tangan dan Busana Melayu
Seni Tradisi Masyarakat Sabah dan Sarawak
Pembangunan Reka Bentuk Dua Dimensi
Pembangunan Reka Bentuk Tiga Dimensi
Fotografi Digital
Animasi Berkomputer
Seni Persembahan Iklan
Teknik Seni Persembahan
Seni Tari Melayu
Koreografi Tari Melayu
Seni Muzik Melayu
Bentuk Lakon Melayu Tradisi
Teori Seni Persembahan
Teori Pengajian Kesenian Melayu
Psikologi dalam Kesenian
Seni dan Budaya Popular Melayu
Hukum Adat Melayu
Latihan Ilmiah
Pendidikan dan Pengajaran Seni dan Budaya Melayu
Pentadbiran Masyarakat
Estetika dan Etika Seni Rupa Melayu
Budaya Perubatan dan Kesihatan di Alam Melayu
Keusahawanan Melayu
Pemasaran Produk Seni dan Budaya
Pengurusan Pameran
Pengurusan Panggung Persembahan
Rekaan dan Penataan Sinografi', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_009', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Language Researcher, Cultural Officer, Museum Curator, Archivist, Historian, Lecturer, Translator, Editor, Content Writer, Scriptwriter, Copywriter, Policy Analyst, Public Relations Officer, Diplomatic Officer, Journalist, Media Executive, Heritage Conservation Officer, Education Officer, Tourism Officer, Academic Writer, Lexicographer, Community Engagement Officer.', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_011', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained at least Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain at least a grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain at least a grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_011', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Co-Curriculum
Introduction to Ethnography
Introduction to Anthropology and Sociology
Development and Marginalised Communities
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Community Building, Social Action and Courses Innovation
Introduction to Psychology
Community and Environment
University Elective Course: Student Attribute Improvement Course 2
Digital Humanities
Research Methods in Anthropology and Sociology
Social Inequality
Work Psychology
Program Elective Courses: Choose 1 Course - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Field Exploration Science
Arts, Religion and Ritual
Organizational Development
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Sociology of Migration
Visual Anthropology
Research Project (P1)
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Community and Commerce
Social Psychology
Research Project (P2)
Program Elective Courses: Choose 1 Course - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Industrial Training
Note:
* Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA
ELECTIVE COURSE
Contemporary Social Thought
Sustainable Development
Cross Cultural Ethnography
Religion and Society
Identity, Diversity and Community
Adolescent and Psychosocial Problem
Gerontology
Sociology of Population
Demographic and Development
Personality Psychology
Food and Culture
Family Psychology
Consumption Behavior
Indigenous Knowledge and Scholarship
Migration in Global Perspective
Organizational Motivation and Leadership
Psychology of Human Behavior and Work
People and Culture of Borneo
Abnormal Psychology
Sociology of Deviance
Applied Anthropology
Urban Ethnography
Sociology of Manners
Health Psychology', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_011', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher/Professor, Arts and Cultural Administrator, Community Development Specialist, Content Creator/Writer, Cultural Arts Manager, Educational Consultant, Entrepreneur in Creative Industries, Language Specialist/Translator, Organizational Consultant, Policy Analyst, Public Relations Specialist, Social Researcher, Sociologist/Anthropologist, Tourism Consultant.', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_018', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained at least Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained at least the grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of B- in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_018', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Basic Entrepreneurship Culture
Physical Geography : Processes and Forms
Human Geography: Patterns and Process
Economic Geography
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Co-Curriculum
Community Building, Social Action and Courses Innovation
Analysis Techniques in Geography
Climatology
University Elective Course: Student Attribute Improvement Course 2
Digital Humanities
System Approach in Physical Geography
Geographic Information System
Population Geography and Demography
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Remote Sensing
Human-Environment Interaction in Field
Geographical Statistical Methods
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Application and Implementation of Geographic Information Systems
Qualitative Methods
Research Project (P1)
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Location and Spatial Analysis
Social Geography
Urban Dynamics
Research Project (P2)
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Industrial Training
Note:
* Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_018', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Climatologist, Community Development Specialist, Data Analyst, Demographer, Economic Geographer, Environmental Consultant, Environmental Scientist, Geographic Information Systems (GIS) Specialist, Policy Advisor, Remote Sensing Analyst, Research Analyst, Spatial Analyst, Sustainability Consultant, Urban Planner.', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_019', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_019', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Basic Entrepreneurship Culture
Physical Environment
Environmental and Human
Concepts and Issues in Sustainability
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Co-Curriculum
Community Building, Social Action and Courses Innovation
Cartography
Methods in Environmental Analysis
University Elective Course: Student Attribute Improvement Course 2
Digital Humanities
Environmental Management
Geographic Information Systems in Environmental Studies
Weather and climate
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Remote Sensing
Field Work on Sustainability Research
Statistical Methods of Environmental
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Environmental Law
Application and Implementation of Geographic Information Systems
Research Project (P1)
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Environmental Ethics
Global Environmental Change
Environmental Governance
Research Project (P2)
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Industrial Training
Note:
* Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITrA', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_019', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Environmental Consultant, Sustainability Officer, Environmental Educator, Conservation Scientist, Environmental Policy Analyst, Wildlife Conservationist, Environmental Health and Safety Officer, Climate Change Analyst, Renewable Energy Consultant, Environmental Researcher, Waste Management Officer, Ecotourism Planner, Environmental Compliance Officer, Natural Resource Manager, Urban Sustainability Planner, Green Building Specialist, Environmental Outreach Coordinator, Forest and Land Use Planner, Water Resource Specialist, Environmental Impact Assessment Officer.', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_012', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained at least Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_012', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Co-Curriculum
Introduction to International Relations
Evolution of International Society
Introduction to Theories of International Relations
International Organizations in World Politics
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Introduction of Politics
Political Economy of International Relations
Approaches to National Security of Malaysia
University Elective Course: Student Attribute Improvement Course 2
Basic Entrepreneurship Culture
Foreign Policy Analysis
Non-State Actors in International Relations
Development of Modern Strategy
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
English Communication Course / Foreign Language II
International Law
Research Methods in International Relations
Contemporary Theories of International Relations
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Digital Humanities
Foreign Policy of Malaysia
Practice of Diplomacy
Research Project (P1)
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
International Security
Foreign Policies of Major Powers
Research Project (P2)
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Industrial Training
Note:
* Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_012', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher in International Studies, Diplomat, Foreign Affairs Specialist, Global Risk Manager, Intelligence Officer, International Business Development Manager, International Development Officer, International Law Specialist, International Relations Consultant, NGO Coordinator, Policy Advisor, Political Analyst, Public Affairs Manager, Security Analyst, Strategic Planner.
.', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_013', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_013', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Basic Entrepreneurship Culture
Introduction to Southeast Asian 1
Package Core Courses: Choose 1 Course - Refer to the attached list
Program Elective Courses: Choose 1 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Co-Curriculum
Community Building, Social Action and Innovation
Introduction to Southeast Asian Region II
Package Core Courses: Choose 1 Course - Refer to the attached list
Program Elective Courses: Choose 1 Course - Refer to the attached list
University Elective Course: Student Attribute Improvement Course 2
Digital Humanities
Theory and Approaches to Development
Politics and Government In Southeast Asia
Economic Development in Southeast Asia
Package Core Courses: Choose 1 Course - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Maritime Economy in Southeast Asia
Research Methodology
Package Core Courses: Choose 1 Course - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Ethnicity, Identity and Politics of Minorities in Southeast Asia
Migration and Development in Southeast Asia
Research Project (P1)
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Southeast Asia in a Global Economy
Seminar on Southeast Asia
Research Project (P2)
Program Elective Courses: Choose 1 Course - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Industrial Training
Note:
*Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered. Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
ELECTIVE COURSE
Choose THREE (3) Only
Development of Small and Medium Industry and Enterprise in Southeast Asia
ASEAN in a Globalised World
Asian Emporium
Maritime World and Globalization in Southeast Asia
Social Movements in Southeast Asia
Marine Resource Management in Southeast Asia
Performing Arts of Southeast Asia
Culture and Society in Southeast Asia
Political Development in Southeast Asia
Social Entrepreneurship in Southeast Asia
Security and Globalisation in Southeast Asia
Political Theory and Ideology in Southeast Asia
Southeast Asian Theatre
Cultural Tourism in Southeast Asia
Political Economy of Southeast Asia
Environment and Development in Southeast Asia
ASEAN and Regionalism
Ocean Governance in Southeast Asia
Maritime Tourism Development in Southeast Asia
Electoral System and Democratisation in Southeast Asia
Field Studies in Southeast Asia
Coastal Management in Southeast Asia
Labour Markets in Southeast Asia
Heritage of Southeast Asia
Filipino Package
Filipino Language IA
Filipino Language IB
Filipino Language IIA
Filipino Language IIB
Burmese Package
Burmese Language IA
Burmese Language IB
Burmese Language IIA
Burmese Language IIB
Thai Package
Thai Language IA
Thai Language IB
Thai Language IIA
Thai Language IIB
Core Course
Introduction to Southeast Asian Region I
Introduction to Southeast Asian Region II
Theory and Approaches to Development
Politics and Government in Southeast Asia
Economic Development in Southeast Asia
Maritime Economy in Southeast Asia
Ethnicity, Identity and Politics of Minorities in Southeast Asia
Migration and Development in Southeast Asia
Southeast Asia in a Global Economy
Seminar on Southeast Asia
Research Project
Industrial Training
International Security
Foreign Policy of Malaysia
Foreign Policies of Major Powers
Practice of Diplomacy
Research Project
Industrial Training', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_013', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Business Development Manager, Cultural Consultant, Cultural Heritage Manager, Development Project Manager, Diplomat or Foreign Service Officer, Environmental Consultant, International Trade Specialist, Language Specialist, Maritime Policy Analyst, Non-Governmental Organization (NGO) Specialist, Policy Advisor, Social Entrepreneur, Southeast Asia Regional Analyst, Tourism Development Officer.', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_014', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_014', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues Civilizations
Co-Curriculum
East Asia Through Digital Lenses
Package Core Courses: Choose 1 Course - Refer to the attached list
Program Elective Courses: Choose 1 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Research Methods for Area Studies
International Relations of East Asia
Package Core Courses: Choose 1 Course - Refer to the attached list
University Elective Course: Student Attribute Improvement Course 2
Basic Entrepreneurship Culture
Digital Humanities
Economic Development in East Asia
Package Core Courses: Choose 1 Course - Refer to the attached list
Programe Elective courses: Choose 1 course from 1 package - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Security Issues in East Asia
Package Core Courses: Choose 2 Course from 1 package - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Research Project (P1)
Research Seminar
Package Core Courses: Choose 1 Courses from 1 Package - Refer to the attached list
Programme Elective Courses: Choose 1 Courses from 1 Package - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Research Project (P2)
Package Core Courses: Choose 1 Courses from 1 Package - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Industrial Training
Note:
*Courses for International Students
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered.Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
Chinese Studies Package
China Culture and Society of China
Chinese Language 1
Chinese Language 2
Political Economy of China
Chinese Language 3
Chinese Language 4
Chinese Language 5
Chinese Language 6
Korean Studies Package
Korea Culture and Society of Korea
Korean Language 1
Korean Language 2
Korea Political Economy of Korea
Korean Language 3
Korean Language 4
Korean Language 5
Korean Language 6
Japan Studies Package
Culture and Society of Japan
Japanese Language 1
Japanese Language 2
Political Economy of Japan
Japanese Language 3
Japanese Language 4
Japanese Language 5
Japanese Language 6
Core Course
East Asia Through Digital Lenses
Research Methods for Area Studies
International Relations of East Asia
Economic Development of East Asia
Security Issues in East Asia
Research Project
Research Seminar on East Asia
Industrial Training', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_014', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Corporate Communication Manager, Corporate Strategist in Multinational Companies, Cross-Cultural Trainer, Cultural Consultant, Diplomat, East Asian Market Analyst, Entrepreneur specializing in East Asian markets, Foreign Affairs Analyst, Foreign Policy Advisor, Government Policy Advisor, Intelligence Analyst, International Business Consultant, International Development Specialist, International Relations Specialist, Journalist/Foreign Correspondent, Language Instructor, Maritime Trade Analyst, Media Analyst, NGO Worker/Coordinator, Public Relations Specialist, Tourism Consultant, Trade and Investment Officer, Translator/Interpreter, University Lecturer.', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_016', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_016', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Appreciation of Ethics and Civilizations
Malay Language Communication*
Co-Curriculum
Social Dynamics
Welfare System
Basic of Human Behaviour
Introduction to Social Problem
University Elective Course (SHE): Student Attribute Improvement Course 1
Philosophy and Current Issues
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Introduction to Management of Human Services
Principle of Social Work
Interpersonal Skill
University Elective Course: Student Attribute Improvement Course 2
Basic Entrepreneurship Culture
Digital Humanities
Social Policy
Organization Behavior
Social Work with Individuals and Families
Analytical Investigation in Social Administration
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
Criminology
Legislative in Social Work Practices
Social Enquiry
Programe Elective courses: Choose 3 course- Refer to the attached list
Directed Reading
Social Work with Groups
Programe Elective courses: Choose 3 course- Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Industrial Training (P1)
Research Project
The Law of Welfare, Health and Occupational Safety
Programe Elective courses: Choose 3 course- Refer to the attached list
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
CORE COURSE
Social Dynamics
Welfare System
Basics of Human Behaviour
Introduction to Management of Human Services
Introduction to Social Problems
Principles of Social Work
Interpersonal Skills
Social Policy
Organizational Behaviour
Social Work with Individuals and Families
Criminology
Legislation in Social Work Practices
Analytical Investigation in Social Administration
Social Inquiry
Directed Reading
Work with Groups
Industrial Training
Research Project
The Law of Welfare, Health, and Occupational Safety
ELECTIVE COURSE
Choose TEN (10) courses only
Crime and Criminal Justice
Social Organization of Work
Social Planning
Cross-cultural Study of Family in Malaysia
Social Work Gerontology
Social Work and Mental Health
Crime Prevention
Medical Social Work
Social Evaluation and Monitoring
Community Development
Social Work with Marginalised Groups
Social Problem Management
Disability Studies
Social Extension
Rehabilitation and Care
Training and Development
Intervention Strategy
Community Policing
Child Welfare
Innovation and Social Entrepreneurship', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_016', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Child Welfare Officer, Community Development Specialist, Community Outreach Coordinator, Crime Prevention Specialist, Criminologist, Disability Advocate, Gerontologist, Medical Social Worker, Mental Health Counselor, Nonprofit Program Manager, Policy Analyst, Rehabilitation Specialist, Social Entrepreneur, Social Planner, Social Policy Advisor, Social Researcher, Social Services Administrator, Social Worker.', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_015', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_015', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Basic Entrepreneurship Culture
History of Southeast Asia until 15th Century
Theory and Method of History
Introduction to History of Malaysia
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language I
Co-Curriculum
Community Building, Social Action and Innovation
Introduction to Early Asian History
Introduction to European History until 17th Century
University Elective Course (SHE): Student Attribute Improvement Course 2
Digital Humanities
Melaka Sultanate until 16th Century
Nationalism in Southeast Asia
Malaysian Economic History until Century Independence
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
English Communication Course / Foreign Language II
History of Islam in Southeast Asia
British Colonial Administration in Malaysia
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Research Project (P1)
Japanese Occupation in Malaysia
Modern European History
Programe Elective courses: Choose 1 course- Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Research Project (P2)
Documentation and Historical Sources of Malaysia
Indonesian Politics since 1966
Programe Elective courses: Choose 1 course- Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
Industrial Training
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
CORE COURSE
History of Southeast Asia until 15th Century
Theory and Method of History
Introduction to History of Malaysia
Introduction to Early Asian History
Introduction to European History until 17th Century
Melaka Sultanate until 16th Century
History of Islam in Southeast Asia
Nationalism in Southeast Asia
Malaysian Economic History until Independence
British Colonial Administration in Malaysia
History of The Philippines to the 18th Century
Documentation and Historical Sources of Malaysia
Research Project
Japanese Occupation in Malaysia
Modern European History
Indonesian Politics since 1966
Industrial Training
ELECTIVE COURSE
History of Indonesia, 1900-1966
Social Change in Malaysia
History and Islamic Civilization
Nationalism in Malaysia
Islam and Politics in the Modern Middle East
Malay Historiography
History and the Development in Sarawak and Sabah After Second World War
Malaysian Politics after Independence
The Communist Movement and Emergency in Malaysia
Business History in Malaysia
Political History of Thailand
History of Indochina
Modern American History
History of Intelligence until 20th Century
European Economic Expansion until Early 20th Century
Colonialism and Nation State in Africa
Modern Filipino History', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_015', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Lecturer, Archivist, Cultural Heritage Manager, Educational Program Developer, Government Officer, Heritage Tourism Specialist, Historical Consultant, Historian, Intelligence Analyst, International Relations Specialist, Journalist, Museum Curator, Nonprofit Organization Specialist, Policy Analyst, Researcher.
.', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_020', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_020', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Basic entrepreneurship Culture
Package Core Courses:
TAMILOLOGY
Introduction to Indian Civilization
Modern Tamil Literature
Applied Tamil Grammar
INDOLOGY
Introduction to Malaysian Indian
The Culture of Malaysian Indians
Inquiry into Indian Civilization
Programe Elective courses: Choose 1 course- Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language I
Co-Curriculum
Community Building, Social Action and Innovation
Package Core Courses:
TAMILOLOGY
Medieval Tamil Literature
Malaysian Tamils Social History
Classical Tamil Literature
INDOLOGY
Indian Civilization
An Introduction to Malaysian Indian Family Systems
Malaysian Indians Socioeconomic condition
University Elective Course (SHE): Student Attribute Improvement Course 2
Digital Humanities
Package Core Courses:
TAMILOLOGY
Tamil Linguistic
Yoga Tradition and Practices in Tamil Civilization
Seminar in Tamil Studies
INDOLOGY
Early Cultural Contact Between India And Southeast Asia Studies
Tradition of Indian Music and Dance
Seminar Series in Indian Studies
3. Programe Elective courses: Choose 1 course - Refer to the attached list
4. Specialization Elective Courses: Choose 2 Course - Refer to the attached list
5. University Elective Course (SHE): Student Attribute Improvement Course 3
6. English Communication Course / Foreign Language II
7. Package Core Courses:
TAMILOLOGY
Research Methodology of Tamil Studies
Tamil Language in New Media
Ethical Thoughts of Tamil Society
INDOLOGY
Research Methodology of Indology Studies
Malaysian Tamils Culture
Culture and Thought of South Indian Community
8. Specialization Elective Courses: Choose 3 Course- Refer to the attached list
9. University Elective Course (SHE): Student Attribute Improvement Course 4
Research Project (P1)
Package Core Courses:
TAMILOLOGY
The Thoughts of Cittar in Tamil Tradition
Creative Writing in Tamil
INDOLOGY
Government and Politics of India
Contemporary of India
3. Programe Elective courses: Choose 1 course- Refer to the attached list
4. Specialization Elective Courses: Choose 2 Course - Refer to the attached list
5. Research Project (P2)
6. Package Core Courses:
TAMILOLOGY
Writing for Multiple purpose needs in Tamil Language
Tamil in Journalism
INDOLOGY
Minority Groups Among Malaysian Indian
Communicative Tamil II
7. Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Industrial Training
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
Tamilology Packages
An Introduction to Indian Civilization
Medieval Tamil Literature
Malaysian Tamils Social History
Classical Tamil Literature
Modern Tamil Literature
Applied Tamil Grammar
Tamil Linguistics
Research Methodology of Tamil Studies
Tamil Language in New Media
Yoga Tradition and Practices in Tamil Civilization
Ethical Thoughts of Tamil Society
Seminar in Tamil Studies
The Thoughts of Cittar in Tamil Tradition
Creative Writing in Tamil
Writing for Multiple Purposes in Tamil Language
Indology Package
An Introduction to Malaysian Indian
The Culture of Malaysian Indians
An Introduction to Malaysian Indian Family Systems
Indian Civilization
Inquiry Into Indian Civilization
Malaysian Indians Socioeconomic Condition
Early Cultural Contact Between India And Southeast Asia
Tradition of Indian Music and Dance
Seminar Series in Indian Studies
Research Methodology of Indology Studies
Malaysian Tamils Culture
Culture and Thought of South Indian Community
Government and Politics of India
Contemporary of India
Minority Groups Among Malaysian India', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_020', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Archivist, Community Development Officer, Content Writer, Creative Writer, Cultural Consultant, Diplomat, Editor/Publisher, Ethnographer, Government Policy Advisor, Heritage Preservation Officer, Historian, International Relations Specialist, Journalist, Language Instructor, Media and Communications Specialist, Museum Curator, Non-Governmental Organization (NGO) Worker, Political Analyst, Public Relations Specialist, Religious Studies Scholar, Social and Cultural Analyst, Social Worker, Translator/Interpreter, University Lecturer.
.', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_021', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Entry Requirements:
Obtain a minimum of Grade B in Chinese Language at the SPM level
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Obtain a minimum Grade B for Chinese Language subject for Secondary School
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_021', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
English Communication Course / Foreign Language I
Chinese in Modern Texts
Introduction of Chinese Literature
Classical Chinese Literature II
Classical Chinese Politic, Instituition and Culture
University Elective Course (SHE): Student Attribute Improvement Course 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language II
Community Building, Social Action and Innovation
Chinese In Classical Texts
Classical Chinese Literature II
Chinese Creative Writing
Classical Chinese Fiction
University Elective Course (SHE): Student Attribute Improvement Course 2
Digital Humanities
Sinography and Chinese Ancient
History of Chinese Philosophy
Programe Elective courses: Choose 1 course - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
Research Methodology in Chinese
Modern Chinese Literature
Selected Ci in Classical Chinese
Programe Elective courses: Choose 1 course - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Basic Entrepreneurship Culture
Malaysian Chinese Literature
Research Project (P1)
Programe Elective courses: Choose 1 course - Refer to the attached list
Specialization Elective Courses: Choose 2 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Co-Curriculum
Research Project (P2)
Programe Elective courses: Choose 1 course - Refer to the attached list
Specialization Elective Courses: Choose 3 Course - Refer to the attached list
Industrial Training
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students can choose one (1) of the Core Packages offer.
CORE COURSE
Chinese in Modern Texts
Chinese in Classical Texts
Introduction to Chinese Literature
Classical Chinese Literature I
Classical Chinese Politics, Institutions, and Culture
Classical Chinese Literature II
Chinese Creative Writing
Classical Chinese Fiction
Sinography and Chinese Ancient Scripts
Research Methodology in Chinese Studies
History of Chinese Philosophy
Modern Chinese Literature
Selected Ci in Classical Chinese
Malaysian Chinese Literature
Research Project
Industrial Training
ELECTIVE COURSE
Modern Chinese Film and Drama
Chinese Culture and Society in Southeast Asia
Studies of Malaysian Chinese Communities
Classical Chinese Poetry
Contemporary Chinese Literature
Introduction to Chinese Studies
The Cold War and The Overseas Chinese in Asia
Introduction to Chinese Religion
Economic Activities of Southeast Asian Chinese
Chinese Language I
Chinese Language II
Classical Chinese Drama
Analysis of Classical Chinese Texts
Chinese Phonetics and Phonology
Ethnic Chinese Politics in Maritime Southeast Asia
Selected Prose in Classical Chinese Literature
Chinese Literature Critiques
Selected Novels of Ming and Qing Dynasties
Classical Chinese Thought', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_021', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Lecturer, Content Writer, Cultural Consultant, Diplomat, Editor, Foreign Correspondent, Government Officer, Historian, International Relations Officer, Interpreter, Journalist, Language Instructor, Market Analyst, Museum Curator, Policy Advisor, Publisher, Researcher, Scriptwriter, Tour Guide, Translator.', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_010', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian Citizen
Obtained a minimum grade of Jayyid Jiddan at Sijil Tinggi Agama Malaysia (STAM)
Obtain a minimum grade of Jayyid in TWO (2) subjects at the STAM level
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 a recognised institution approved by UM Senate
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B in TWO (2) subjects
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 5.0
IELTS (Academic) 7.0
TOEFL iBT (Centre-based) 96
TOEFL Essentials (Online) 10
Pearson Test of English (PTE Academic) 65
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 180', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_010', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Appreciation of Ethics and Civilizations
Malay Language Communication*
Foreign Language I
Drama: An Introduction
Research Methodology
Writing about Literature I
University Elective Course (SHE): Student Attribute Improvement Course 1
Philosophy and Current Issues
Foreign Language II
Community Building, Social Action and Innovation
Introduction to Fiction
Aspects of Poetry
Writing about Literature II
University Elective Course (SHE): Student Attribute Improvement Course 1
Co-Curriculum
Digital Humanities
Theories of Literature
Shakespeare and His Contemporaries
The Twentieth Century
Literature and the Environment
Malaysian Popular Literature and Culture
Program Elective Courses: Choose 1 Course - Refer to the attached list
Basic Entrepreneurship Culture
Aspects of Poetry
Postcolonial Literature: Themes and Tropes
Topics in the Nineteenth Century
Women’s Voices in Literature
Exploring Travel Literature
Program Elective Courses: Choose 1 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 3
Topics in Malaysian and Singaporean Literature
Women and Literature
Popular Culture and Literature
Literature of the Restoration and the Eighteenth Century
Reading World Literature
Research Project I
Africa Literature and Culture
Reading American Literature
Malaysian Literature
Children’s and Young Adult Literature
Research Project II
Program Elective Courses: Choose 1 Course - Refer to the attached list
University Elective Course (SHE): Student Attribute Improvement Course 4
Industrial Training
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
ELECTIVE COURSE
Theatre Performance in English
Journalistic Writing
Africa Speaks
Effective Writing
Creative Writing
Texts and Contexts in the Middle Ages
Introduction to Postmodern Fiction
Global Shakespeares: An Introduction
Nineteenth Century British Literature and Culture', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_010', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher/Professor, Communications Consultant, Content Creator, Cultural Analyst, Dramaturg, Editor, Journalist, Literary Agent, Literary Critic, Media Specialist, Public Relations Officer, Publishing Professional, Scriptwriter, Theatre Director, Writer/Author.
.', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_017', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in English subject
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('UM_BACHELOR_017', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
External Faculty Electives
Introduction to Social Sciences and Humanities
Introduction to Media Studies
Introduction to Media Design
Rhetoric and Public Speaking
Writing for Media
Social Engagement
English Communication Course
Information Literacy
Media and Communication Theories
Media Law and Ethics
Organizational Communication
Screen Production Techniques
English Communication Course
Introduction to Social Sciences and Humanities
News Reporting
Editing
Programme Elective courses: Choose THREE (3) courses: Photo Journalism
Publishing Economy
Screen Writing
Persuasive Communication
Selected Current Issues
Media in the Global and Local Contexts
Political Communication
Communication Management (Offered in Year 2 Semester 1)
Appreciation of Ethics and Civilizations
Basic Entrepreneurship Culture
Malay Language Communication*
Media, Culture and Society
Programme Elective courses: Choose THREE (3) or FOUR (4) courses: Feature Writing
Electronic Publishing
Directing: Principles and Practices
Marketing Communication
Creative Writing
Creative Industry Management
Broadcast Journalism
Co-Curriculum
Ethics and Professionalism in Social
Techniques and Strategies in Public Relations
Project Paper 2
Programme Elective courses: Choose THREE (3) courses: Multimedia Production
Strategic Event Management
Documentary Production
Public Relations and Social Media
Language Proficiency for Professional
Magazine Publishing
Citizen Journalism
Industrial Training (P1)
Industrial Training (P2)
Industrial Training
Note:
*Courses for International Students
Refer to the list of Student Attribute Enhancement Courses (SHE) provided by CITRA.
Students may choose ten (10) Courses from one of the (1) specialization elective/ university minor packages offered
CORE COURSE
Introduction to Media Studies
Introduction to Media Design
Rhetoric and Public Speaking
Writing and Media
Media and Communication Theories
Media Law and Ethics
Organizational Communication
Screen Production Techniques
News Reporting
Editing
Media, Culture and Society
Project Paper 1
Techniques and Strategies in Public Relations
Project Paper 2
Industrial Training
ELECTIVE COURSE (YEAR 2)
Choose TWO (2) courses only
Photojournalism
Publishing Economy
Screen Writing
Persuasive Communication
Selected Current Issues
Media in the Global and Local Contexts
Political Communication
CHOOSE THREE (3) OR FOUR(4) COURSES ONLY
Feature Writing
Electronic Publishing
Directing: Principles and Practices
Marketing Communication
Creative Writing
Communication Management
Creative Industry Management
Broadcast Journalism
ELECTIVE COURSE(YEAR 3)
Choose THREE (3) courses only
Multimedia Production
Strategic Event Management
Documentary Production
Public Relations and Social Media
Language Proficiency for Professionals
Magazine Publishing
Citizen Journalism', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('UM_BACHELOR_017', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Broadcast Journalist, Communication Manager, Creative Writer, Digital Content Creator, Documentary Producer, Editorial Director, Event Manager, Marketing Communication Specialist, Media Analyst, Media Designer, Media Law Consultant, Media Planner, Media Researcher, Multimedia Producer, Photojournalist, Publishing Manager, Public Relations Specialist, Screenwriter, Strategic Communications Consultant, Citizen Journalist.', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('UM_BACHELOR_022', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) subjects
Stream: Engineering, Social Sciences, Science, and Accounting
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possess a Diploma from a Public University (UA) / Private Higher Education Institution (IPTS) / Polytechnic under the Department of Higher Education Malaysia in the field of Architecture or related to the Built Environment / Engineering / Geomatics, recognized by the Government of Malaysia and approved by the University Senate with a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B- in TWO (2) subjects
International Baccalaureate
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B- in TWO (2) subjects
STPM (not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum grade of B- in TWO (2) subjects
Matriculation/Foundation(not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum grade of B- in TWO (2) subjects
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum grade of B- in TWO (2) subjects
Additional Requirement
Pass the drawing test and/or interview as determined by the University
Possesses good vision, hearing, or speech and is not color blind
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Pass the drawing test and/or interview as determined by the University
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_022', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3
Year 1 Year 2 Year 3 English I
Architectural Design Studio I
Materials and Construction I
History of Asian Architecture
University Elective Courses - Student Holistic Empowerment (SHE) I (Thinking Matters: Mind & Intellect)
English II
Co-Curriculum
Architectural Design Studio II
Environmental Physics
History of World Architecture
Architectural Design Studio III
Materials and Construction II
Building Structure
Digital Architecture
***Philosophy and Current Issue / Basic Malay Language
Appreciation of Ethics and Civilization
Architectural Design Studio IV
Building Services
Programme Elective Courses: **Architectural Lighting and Acoustics / **Digital Fabrication
Programme Elective Courses: *Measured Drawing / *Landscape Architecture
Basic Entrepreneurship Enculturation
Architectural Design Studio V
Culture and Context
Architectural Academic Report
University Elective Courses - Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Architectural Design Studio VI
Professional Studies
Working Drawing
University Elective Courses - Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
Industrial Training
Note:
UNIVERSITY ELECTIVE COURSES
Student Holistic Empowerment(SHE) I (Thinking Matters:Mind & Intellect)
Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
*Elective subject (Under Cluster and context)
**Elective subject (Under Cluster technology and Environment)
***Courses offered to non-Malaysian students
PROGRAMME ELECTIVE COURSES
**Architectural Lighting and Acoustic/**Digital Fabrication
*Measured Drawing/*Landscape Architecture
Noted: Course KIAR GQX0056 is a Compulsory SHE course', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_022', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Architect, Architectural Assistant, Urban Planner, Interior Designer, Landscape Designer, Building Designer, Project Coordinator, Construction Manager, Draftsperson, 3D Visualizer, BIM Specialist, Sustainable Design Consultant, Building Information Modeler, Design Consultant, Site Supervisor, Planning Officer, Heritage Conservation Officer, Facilities Planner.', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_023', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain a minimum Grade B in THREE (3) of the following subjects: English
Mathematics
Any ONE (1) of the subjects: Science / Technical / Vocational
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 in relevant field including Building Surveying, Built Environment, Engineering, or Geomatic from a recognised institutions approved by the University
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_023', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issue/ Basic Malay Language*
English I
Legal Studies and Built Environment Laws
Construction Technology – Low Rise Building
Building Services
Building Services & Environment
Appreciation of Ethics and Civilization
Basic Entrepreneurship Enculturation
English II
Construction Technology – High Rise Building
Integrated Project I – Design Communication
Programme Elective Courses**: Computer Aided Design
Programme Elective Courses**: Sustainable Built Environment
Programme Elective Courses**: Land & Geomatics Surveying
Compulsory University Courses - Student Holistic Empowerment (SHE) I
Construction Technology – Complex Construction
Building Pathology
Property Management and Maintenance
Integrated Project II – Building Control & Development
Structural Principle
Compulsory University Courses - Co-Curriculum
Compulsory University Courses - Student Holistic Empowerment (SHE) II
Compulsory University Courses - Student Holistic Empowerment (SHE) III
Building Dilapidation Survey
Integrated Project III – Building Services Audit
Accounting & Financial Management
Risk & Construction Safety
Integrated Project IV – Building Performance & Simulation
Procurement, Contract and Specification
Compulsory University Courses - Student Holistic Empowerment (SHE) IV
Fundamental of Property Valuation & Taxation
Facility Management Services
Building Conservation
Research Methodology
Integrated Project V – Project Management
Property Economics & Investment
Professional Practice
Construction Law
Building Certification
Academic Research
Industrial Training
Note:
*Non-Malaysian
**Choose only two(2) Program Elective Courses
PROGRAMME ELECTIVE COURSES
Computer Aided Design
Sustainable Built Environment
Land & Geomatics Surveying
UNIVERSITY ELECTIVE COURSES
Student Holistic Empowerment (SHE) I (Thinking Matters: Mind & Intellect )
Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Student Holistic Empowerment (SHE) II Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
Student Holistic Empowerment (SHE) IV (Global Issues and Community Sustainability: Making the World a Better Place).
Co-Curriculum
Noted: Course KIAR GQX0056 is a compulsory SHE course', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_023', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Building Surveyor, Property Manager, Facilities Manager, Construction Project Manager, Quantity Surveyor, Site Inspector, Maintenance Manager, Building Control Officer, Health and Safety Officer, Building Consultant, Contract Administrator, Technical Officer, Real Estate Valuer, Risk Assessor, Asset Manager, Building Compliance Officer.', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_024', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain a minimum Grade B in Mathematics subject
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum Grade B- in THREE (3) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum Grade B- in THREE (3) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum Grade B- in THREE (3) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum Grade B- in THREE (3) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_024', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issue / Basic Malay Language*
English I
Introduction to Construction Technology
Principles of Economics
Malaysian Legal Studies
Principles of Management
Building Services
University Elective Courses: Student Holistic Empowerment (SHE) I
Appreciation of Ethics and Civilization
Co-Curriculum
Principles of Measurement for Construction Works I
Materials and Structure in Construction
Construction Economics
University Elective Courses: Student Holistic Empowerment (SHE) II
Programme Course Elective #
Basic Entrepreneurship Enculturation
Principles of Measurement for Construction Works II
Sustainable Construction Technology
Building Economics
Project Management Principles
Mechanical and Electrical Services in Buildings
Analysis of Prices
English II
Measurement of Advanced
Civil Engineering Construction Technology
Pre-Construction Legal Studies
Pre-Construction QS Practices
Integrated Project I
University Elective Courses: Student Holistic Empowerment (SHE) III
Measurement of Advanced Construction Works II
QS Practices in Construction
Construction Project Management
Digital Construction
Data Analytics
Research Methodology for Quantity Surveying
University Elective Courses: Student Holistic Empowerment (SHE) IV
Professional Internship I
Professional Internship II
Measurement of Civil Engineering Works
Construction Business & Development
Construction Legal Studies
Integrated Project II
Research Project
University Elective Courses: Programme Elective Course #
Note:
* Exempted for non –Malaysian students and to be replaced with another Senate-approved university course.
**Course offered to non-Malaysian students
UNIVERSITY ELECTIVE COURSES
Student Holistic Empowerment (SHE) I (Thinking Matters: Mind & Intellect )
Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
Student Holistic Empowerment (SHE) IV (Global Issues and Community Sustainability: Making the World a Better Place)
PROGRAMME ELECTIVE COURSES
Risk and Value Management
QS Practices in Building Conservation
Facilities Management
Noted: Course KIAR GQX0056 is a compulsory SHE course', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_024', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Quantity Surveyor, Cost Estimator, Contract Manager, Project Manager, Construction Manager, Procurement Officer, Claims Consultant, Commercial Manager, Value Engineer, Risk Manager, Cost Planner, Tendering Specialist, Site Quantity Surveyor, Construction Economist, Development Consultant.', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_025', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in TWO (2) Subjects
Obtain a minimum of grade B- in TWO (2) subjects: Mathematics, Additional Mathematics, Physics, Chemistry, Biology, Economics, History, Geography, Visual Arts
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects: Chemistry, Physics, Basic Engineering, Civil Engineering, Electrical & Electronics Engineering, Mechanical Engineering
Stream: Engineering, Social Sciences, Science, and Accounting
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possess a Diploma from a Public University (UA) / Private Higher Education Institution (IPTS) / Polytechnic under the Department of Higher Education Malaysia in the field of Urban and Regional Planning or related to the Built Environment / Engineering / Geomatics, recognized by the Government of Malaysia and approved by the University Senate with a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade of B- in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects.
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum grade of B- in TWO (2) subjects
STPM (not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum of grade B- in TWO (2) subjects: Mathematics, Additional Mathematics, Physics, Chemistry, Biology, Economics, History, Geography, Visual Arts
Matriculation/Foundation(not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum grade of B- in TWO (2) subjects
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum grade of B- in TWO (2) subjects
Additional Requirement
Possesses good vision, hearing, or speech and is not color blind
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects: Mathematics / Additional Mathematics, Physics, Chemistry, Biology, Economics, History, Geography, Visual Arts
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B in the Mathematics subject
Obtain a minimum grade of B in any ONE (1) other subject at the Matriculation / Foundation level
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_025', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English I
Planning Studio I – Fundamental Planning Skills
Computer Aided Graphic Design in Planning
History and Evolution of Urban Planning
Site Planning and Analysis
Philosophy and Current Issues / Basic Malay Language*
English II
Planning Studio II – Site Planning and Design
Land Use Planning
Transportation Planning and Traffic
Urban Design and Conservation
Basic Entrepreneurship Enculturation
Planning Studio III – City Centre Studies
Planning Laws
Planning Techniques
Urban Economics
Programme Elective Courses **: Sustainable Tourism Planning
Programme Elective Courses **: Technologies in Urban Planning
University Elective Courses: Student Holistic Empowerment (SHE) I
Planning Studio IV – Local Development Planning
GIS and Urban Analytics
Planning Legislations and Governance
Quantitative Analysis in Planning
Sustainable Community Development
Appreciation of Ethics and Civilisations
University Elective Courses: SHE II
Planning Studio V – Regional Development Planning
Development and Property Appraisal
Rural and Regional Planning
Programme Elective Courses**: Environmental Studies
Programme Elective Courses**: Communication in Planning
University Elective Courses: SHE III
University Elective Courses: SHE IV
Planning Studio VI – Township Appraisal
Housing, Planning and Sustainability
Planning Theory and Philosophy
Research Methodology
Co-Curriculum
International Planning Practice
Academic Project
Professionalism, Ethics and Politics
Urban Management
Industrial Training
Note:
* Non Citizen
**Student need to choose one of the offered programme elective subjects for the semester
UNIVERSITY ELECTIVE COURSES
Student Holistic Empowerment (SHE) I (Thinking Matters: Mind & Intellect )
Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
Student Holistic Empowerment (SHE) IV (Global Issues and Community Sustainability: Making the World a Better Place)
PROGRAMME ELECTIVE COURSES
Sustainable Tourism Planning
Technologies in Urban Planning
Environmental Studies
Communication in Planning
Noted: Course KIAR GQX0056 is a compulsory SHE course', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_025', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Urban Planner, Regional Planner, Town Planner, Land Use Planner, Transportation Planner, Environmental Planner, City Planner, Housing Development Officer, Planning Consultant, Urban Designer, Policy Analyst, Community Development Officer, GIS Specialist, Zoning Officer, Infrastructure Planner, Sustainable Development Consultant, Research Officer, Development Control Officer.', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_026', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtained a minimum Grade B- in THREE (3) Subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
Stream: Engineering, Social Sciences, Science, and Accounting
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possess a Diploma from a Public University (UA) / Private Higher Education Institution (IPTS) / Polytechnic under the Department of Higher Education Malaysia in the field of Real Estate or related to the Built Environment / Engineering / Geomatics, recognized by the Government of Malaysia and approved by the University Senate with a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects at the Diploma level
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum Grade B- in THREE (3) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain a minimum Grade B- in THREE (3) subjects
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum Grade B- in THREE (3) subjects
STPM (not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum Grade B- in THREE (3) subjects
Matriculation/Foundation(not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum Grade B- in THREE (3) subjects
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00.
Obtain a minimum Grade B- in THREE (3) subjects
Additional Requirement
Possesses good vision, hearing, or speech and is not color blind
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum Grade B- in THREE (3) subjects
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
Obtain a minimum grade of B in any ONE (1) of the following subjects: Chemistry, Physics, Basic Engineering, Civil Engineering, Electrical & Electronics Engineering, Mechanical Engineering
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum Grade B- in THREE (3) subjects
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum Grade B- in THREE (3) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum Grade B- in THREE (3) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum Grade B- in THREE (3) subjects
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_026', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / *Basic Malay Language
English I
Introduction to Real Estate Valuations
Introduction to Law
Fundamentals of Economics
Accounting
University Elective Courses: Student Holistic Empowerment (SHE) I
Appreciation of Ethics and Civilizations
English II
Market Approach and Cost Approach in Real Estate Valuation
Land Law
Principle and Practice of Urban Planning
Basic Building Technology
University Elective Courses: Student Holistic Empowerment (SHE) II
Basic Entrepreneurship Enculturation
Income Approach of Real Estate Valuation I
Real Estate Law
Land Economics
Building Maintenance and Services
Programme Elective Courses: Programme Elective Course I
Co-Curriculum
Income Approach of Real Estate Valuation II
Strata Law
Real Estate Investment Analysis
Property Management
University Elective Courses: Student Holistic Empowerment (SHE) III
Property Taxation and Land Acquisition
Real Estate Marketing and Agency
Real Estate Market Analysis
Research Methodology
Real Estate and Community
Programme Elective Courses: Programme Elective Course II
Real Estate Finance Analysis
Corporate Real Estate Asset Management
Real Estate Development Appraisal
Ethics and Professional Practice
Real Estate Academic Project
University Elective Courses: Student Holistic Empowerment (SHE) IV
Integrated Real Estate Project
Industrial Training
Note:
* Exempted for non-malaysian students and to be replaced with another Senate-approved university course.
UNIVERSITY ELECTIVE COURSES
Student Holistic Empowerment (SHE) I (Thinking Matters: Mind & Intellect )
Student Holistic Empowerment (SHE) II (Emotional and Spiritual Intelligence: Heart, Body and Soul)
Student Holistic Empowerment (SHE) III (Technology/Artificial Intelligence and Data Analytics: i-Techie)
Student Holistic Empowerment (SHE) IV (Global Issues and Community Sustainability: Making the World a Better Place)
PROGRAMME ELECTIVE COURSES
Facilities Management
Statistics for Real Estate
Business Valuation
Noted: Course KIAR GQX0056 is a compulsory SHE course.', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_026', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Real Estate Valuer, Property Manager, Real Estate Agent, Estate Planner, Asset Manager, Investment Analyst, Property Consultant, Leasing Manager, Real Estate Broker, Land Economist, Facilities Manager, Development Manager, Real Estate Appraiser, Property Analyst, Portfolio Manager, Valuation Executive, Real Estate Researcher.', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_029', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: English
Mathematics / Additional Mathematics
Senior High School Certificate (SHSC)
Pass with a minimum average of 70%
Obtain a minimum of 60% / grade B- in any TWO (2) subjects: Accounting/Mathematics/Business Studies/Economics/Physics/Chemistry
Matriculation / Foundation
Obtain a minimum CGPA of 3.30
Obtain a minimum grade of B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry/Business in Technology/Financial Accounting/Management Accounting
Diploma
Obtain a minimum CGPA of 3.30
Obtain a minimum of grade B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
International Baccalaureate (IB)
Obtain a minimum score of 35 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in any TWO (2) subjects: Mathematics/Economics/Business Studies/Physics/Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects: Mathematics/Business Management and Enterprise/Economics/Accounting and Finance/Physics/Chemistry
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_029', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues (Required for local students)
Appreciation of Ethics and Civilisations (Required for local students)
Appreciation of Ethics and Civilisations (in English) (Required for international students)
Malay Language Communication (Required for international students)
Management
Management Information System
Principles of Marketing
Principles of Microeconomics
Quantitative Analysis for Business
English Language Course I
English Language Course II
Introductory Accounting
Principles of Macroeconomics
Business Communication: A Critical Thinking Approach
Commercial Law
Business Statistics
University Elective Courses: SHE Courses&sup2; (Choose only one (1) course from each cluster.) Cluster: Thinking Matter
Cluster: Emotional & Spiritual Intelligence
Cluster: Global Issue & Community Sustainability
Attach@Industry
Co-curriculum [Choose one (1)] Independent Research
Community Service
Talent Development
Volunteerism
Human Resource Management
Operations Management
Specialisation students are required to choose one of the following specialisations: Management
Marketing
Operations and Information Systems Management
Elective Courses (number of courses to be taken throughout the study: 4 courses)
Entrepreneurship (Replaces GKU1001)
Financial Management
Specialisation/Elective (Choose only one (1) course from each cluster) Cluster: Thinking Matters
Cluster: Emotional & Spiritual Intelligence
Cluster: Global Issue & Community
Specialisation students are required to choose one of the following specialisations: Management
Marketing
Operations and Information Systems Management
Elective Courses (number of courses to be taken throughout the study: 4 courses)
Management Accounting
Strategic Management
Business Ethics & Corporate Governance
Specialisation / Elective Course - Specialisation Courses (Register for courses according to your chosen specialisation)
Elective Courses (Number of courses to be taken throughout the study: 4 courses)
Industrial Training
Specialization/Elective (Specialization Courses)
Note:
LIST OF SPECIALIZATION COURSES
&bull; MANAGEMENT SPECIALIZATION COURSES (CHOOSE 11 COURSES)
Consumer Behaviour
Company Law
Organizational Behaviour
Legal Aspect of Banking
International Business Management
Leadership
Service Management
Islamic Perspective on Business
Change Management
Cross Cultural Management
Introduction to Positive Psychology
Quality Management
Tourism Management
&bull; MARKETING SPECIALIZATION COURSES (CHOOSE 11 COURSES)
Sales Management
Organizational Behaviour
E-Commerce
Consumer Behaviour
Retailing
Digital Marketing
Global Marketing
Hospitality Management
Integrated Marketing Communications
Services Marketing
Branding
Islamic Marketing
Marketing Analytics
&bull; OPERATIONS AND INFORMATION SYSTEM MANAGEMENT COURSES (CHOOSE 11 COURSES)
E-Commerce
Business Data Communication
Business Data Management
Business Analysis and Systems Design
Retailing
Business Application Development
Supply Chain Management
Strategic Information Systems
Quality Management
Logistics Management
Sustainable Operations and Supply Chain Management
Business Modelling for Decision Making
Change Management
List of Faculty Elective Courses
For Management Specialization
Choose four (4) courses from the list (4 courses x 3 credits):
Basic of Malaysian Taxation
Islamic Financial System
Investment Management
Global Finance
Money and Banking
Financial Services Marketing
Insurance and Risk Management
Applied Financial Planning
Bank Management
Retailing
Digital Marketing
Sales Management
Hospitality Management
Integrated Marketing Communications
Services Marketing
Global Marketing
Branding
Islamic Marketing
Marketing Analytics
E-Commerce
Business Data Communication
Business Data Management
Business Analysis and Systems Design
Business Application Development
Supply Chain Management
Logistics Management
Business Modelling for Decision Making
Strategic Information Systems
List of Faculty Elective Courses
For Marketing Specialization
Choose four (4) courses from the list (4 courses x 3 credits):
Basic of Malaysian Taxation
Islamic Financial System
Investment Management
Global Finance
Money and Banking
Financial Services Marketing
Insurance and Risk Management
Applied Financial Planning
Bank Management
Legal Aspect of Banking
Company Law
International Business Management
Leadership
Service Management
Islamic Perspective on Business
Change Management
Cross Cultural Management
Introduction to Positive Psychology
Tourism Management
Business Data Communication
Business Data Management
Business Analysis and Systems Design
Business Application Development
Supply Chain Management
Quality Management
Logistics Management
Business Modelling for Decision Making
Strategic Information Systems
List of Faculty Elective Courses
For Operations and Information System Management Specialization
Choose four (4) courses from the list (4 courses x 3 credits):
Basic of Malaysian Taxation
Islamic Financial System
Investment Management
Global Finance
Money and Banking
Financial Services Marketing
Insurance and Risk Management
Applied Financial Planning
Bank Management
Legal Aspect of Banking
Company Law
International Business Management
Leadership
Service Management
Islamic Perspective on Business
Cross Cultural Management
Introduction to Positive Psychology
Tourism Management
Organizational Behaviour
Consumer Behaviour
Digital Marketing
Sales Management
Hospitality Management
Integrated Marketing Communications
Services Marketing
Global Marketing
Branding
Islamic Marketing
Marketing Analytics', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_029', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Business Development Executive, Marketing Manager, Human Resources Officer, Operations Manager, Sales Executive, Project Manager, Management Consultant, Customer Relationship Manager, Entrepreneur, Business Analyst, Administrative Manager, Product Manager, Supply Chain Coordinator, Retail Manager, Brand Manager, Corporate Trainer, Public Relations Officer, E-Commerce Specialist, Procurement Officer, Strategic Planning Executive.', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_028', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: English
Mathematics / Additional Mathematics
Senior High School Certificate (SHSC)
Pass with a minimum average of 70%
Obtain a minimum of 60% / grade B- in any TWO (2) subjects: Accounting/Mathematics/Business Studies/Economics/Physics/Chemistry
Matriculation / Foundation
Obtain a minimum CGPA of 3.30
Obtain a minimum grade of B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry/Business in Technology/Financial Accounting/Management Accounting
Diploma
Obtain a minimum CGPA of 3.30
Obtain a minimum of grade B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
International Baccalaureate (IB)
Obtain a minimum score of 35 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in any TWO (2) subjects: Mathematics/Economics/Business Studies/Physics/Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects: Mathematics/Business Management and Enterprise/Economics/Accounting and Finance/Physics/Chemistry
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('UM_BACHELOR_028', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues (required for Malaysian students) OR Malay Language Communication (required for International Students)
Principles of Macroeconomics
Business Statistics
Business Communication: A Critical Thinking Approach
Foundations in Financial Accounting and Reporting
Cost Accounting
English Language Course (1)
Co-curriculum
Principles of Microeconomics
Management
Management Information Systems
Intermediate Financial Accounting and Reporting
Entrepreneurship
Financial Management
Commercial Law
Accounting Information System
Advanced Financial Accounting and Reporting
Principle of Taxation
University Elective Courses: SHE (Cluster Emotional & Spiritual Intelligence) GQX0056 Kursus Integriti dan Anti Rasuah (KIAR)
Appreciation of Ethics and Civilizations
English Language Course (2)
Accounting for Decision Making and Control
Company Law
Auditing Practices
Tax Compliance
Corporate Finance
Corporate Accounting
Accountability and Auditing
Strategic Management
University Elective Courses: SHE (Cluster Thinking Matters)
Elective Course 1
Elective Course 2
Business Ethics & Corporate Governance
Advanced Accounting Information System
Accounting Theory and Practice
Seminar in Management Accounting
University Elective Courses: SHE (Cluster Technology / AI & Data Analytics)
Elective Course 3
Information Technology (IT) Auditing
Banking Operations and Reporting
Integrated Case Study
University Elective Courses: SHE (Cluster Global Issue & Community Sustainability)
Elective Course 4
Industrial Training
Note:
Students are required to take a minimum of 4 credits of English courses based on English Proficiency qualification (MUET/IELTS/TOEFL).
Students are advised to take CIA3004 before registering for CIA4001.
Students who wish to pursue the following professional qualifications in the future are advised to select the elective courses listed below:
Professional Qualification
ICAEW
CPA Australia
MICPA
Suggested elective course
CIF1001 Principles of Marketing
CIX1004 Quantitative Analysis for Business
CIA3013 Advanced Taxation: Planning and Compliance', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('UM_BACHELOR_028', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Accountant, Auditor, Tax Consultant, Financial Analyst, Budget Analyst, Management Accountant, Internal Auditor, External Auditor, Chief Financial Officer, Forensic Accountant, Payroll Specialist, Finance Manager, Credit Analyst, Risk Analyst, Investment Analyst, Compliance Officer, Accounts Executive, Financial Controller.', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('UM_BACHELOR_030', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: English
Mathematics / Additional Mathematics
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in any TWO (2) subjects: Accounting/Mathematics/Business Studies/Economics/Physics/Chemistry
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry/Business in Technology/Financial Accounting/Management Accounting
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in any TWO (2) subjects: Mathematics/Economics/Business Studies/Physics/Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects: Mathematics/Business Management and Enterprise/Economics/Accounting and Finance/Physics/Chemistry
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-finance', '2026-10-14T05:45:39.480Z'),
    ('UM_BACHELOR_030', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues
Principles of Microeconomics
Business Statistics
Introductory Accounting
Management
Management Information System
Appreciation of Ethics and Civilizations
Principles of Macroeconomics
Financial Management
Commercial Law
Islamic Financial System
Money and Banking
English Language Course_2
Fundamentals of Syariah for Islamic Finance
Investment Management
Econometrics
Global Finance
Corporate Finance
Univerity Elective Courses 1
English Language Course_2
Entrepreneurship
Bank Management
Financial Modelling and Mathematics
Derivative Markets
Insurance and Risk Management
Univerity Elective Courses: SHE_Cluster 1
Applied Financial Planning
Business Ethics & Corporate Governance
Risk Management and Financial Instruments
Financial Statement Analysis
Advanced Corporate Finance
Islamic Banking
University Elective Courses: SHE_Cluster 2
Co-curriculum
Cases In Finance
Fixed Income Markets and Instruments
Elective Course_2
University Elective Courses: SHE_Cluster 3
University Elective Courses: SHE_Cluster 4
Industrial Training
Note:
PROGRAMME ELECTIVES
(Student MUST choose a MINIMUM of 8 credit hours for Student Holistic Empowerment (SHE) courses + 2 other courses with total MINIMUM 14 credit hours for programme electives)
Student Holistic Empowerment (SHE) – Please select one course from each cluster (Total 4 courses or 8 credits)
Cluster 1: Thinking Matters: Mind and Intellect
Cluster 2: Emotional and Spiritual Intelligence: Heart and Soul
Cluster 3: Global Issue and Community Sustainability: Making the World a Better Place
Cluster 4: Technology / Artificial Intelligence & Data Analytics: I-Techie
Choose any TWO (2) courses from the following list (with total minimum 6 credits)
Management Accounting
Basic of Malaysian Taxation
Accounting for Islamic Financial Transactions
Organizational Behaviour
Legal Aspects of Banking
Financial Services Marketing
Treasury Management
Financial Econometrics
Islamic Capital Market and Instruments
Islamic Wealth Management Business Modelling for Decision Making', 'https://study.um.edu.my/bachelor-of-finance', '2026-10-14T05:45:39.480Z'),
    ('UM_BACHELOR_030', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Financial Analyst, Investment Banker, Risk Manager, Portfolio Manager, Financial Planner, Credit Analyst, Treasury Analyst, Fund Manager, Wealth Management Advisor, Finance Manager, Budget Analyst, Corporate Finance Executive, Loan Officer, Equity Analyst, Financial Consultant, Asset Manager, Banking Executive, Mergers and Acquisitions Analyst, Compliance Analyst, Financial Operations Analyst.', 'https://study.um.edu.my/bachelor-of-finance', '2026-10-14T05:45:39.480Z'),
    ('UM_BACHELOR_031', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possess a Diploma in the field of Economic and Administration or a related field recognized by the Government of Malaysia and approved by the Senate of the University of Malaya with a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GEC A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects: Accounting, Mathematics, Economics, Business Studies, Physics, Chemistry
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects: Mathematics, Economics, Business Studies, Physics, Chemistry
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects: Mathematics, Business Management and Enterprise, Economics, Accounting and Finance, Physics, Chemistry
STPM (not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation/Foundation(not from the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
IPTS Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Additional Requirement
Possesses good vision, hearing, or speech and is not color blind
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in any TWO (2) subjects: Accounting/Mathematics/Business Studies/Economics/Physics/Chemistry
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum grade of B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry/Business in Technology/Financial Accounting/Management Accounting
Diploma
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
GEC A-Level
Obtain a recognize GCE A-Level Qualification
Obtain a minimum of grade B in any TWO (2) subjects: Accounting/Mathematics/Economics/Business Studies/Physics/Chemistry
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in any TWO (2) subjects: Mathematics/Economics/Business Studies/Physics/Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects: Mathematics/Business Management and Enterprise/Economics/Accounting and Finance/Physics/Chemistry
Additional Requirements:
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_031', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / Malay Language Communication
English Communication Courses
Microeconomics I
Statistics I
Politics and Public Administration
Introduction to Financial Mathematics and Accounting
University Elective Courses: SHE 1 Cluster: Making the World a Better Place
English Communication Course
Appreciation of Ethics and Civilisations
Microeconomics I
Mathematics
Statistics II
Programming Tools for Economics
University Elective Courses: SHE 2 Cluster: Mind, Body & Soul
University Elective Courses: SHE 3 Cluster: i-Techie
Co-Curriculum
Basic Entrepreneurship Enculturation
Microeconomics II
Introduction to Computer Assisted Data Analysis
Mathematical Economics
Econometrics I
Malaysian Economy in Globalised World
Microeconomics II
Development Economics
Public Policy and Economy
Econometrics II
Elective Courses Specialization - Elective 1 (Elective Specialization)
Elective Courses Specialization - Elective 2 (Elective Specialization)
Elective Courses Specialization - Elective 3 (Elective Specialization)
Research Methodology
Macroeconomics III
Development of Economic Thought
Elective course: Specialisation course 4
Elective course: Specialisation course 5
Elective course: Specialisation course 6
Elective course: Specialisation course 7
Critical Thinking in Economics
Macroeconomics III
Academic Research
Elective course: Specialisation: Elective 8 (Faculty Elective)
Elective course: Specialisation: Elective 9 (Faculty Elective)
Elective course: Specialisation: Elective 10 (Faculty Elective)
Elective course: Specialisation: Elective 11 (Faculty Elective)
Industrial Training
Note:
LIST OF SPECIALIZATION AND RELATED ELECTIVE COURSES
APPLIED ECONOMICS
Labor Economics
Environmental Economics
Islamic Economics
Urban Economics
Transportation Economics
Industrial Organisation
Game Theory
Health Economics
Behavioral Economics
Digital Economics
LIST OF SPECIALIZATION AND RELATED ELECTIVE COURSES
FINANCIAL ECONOMICS
Money and Banking
Monetary Economics
International Trade Theory
Financial Economics
International Finance
Financial Mathematics
Behavioral Finance
Islamic Banking and Finance
Business Computing and Analytics
Time Series Analysis
Financial Econometrics
LIST OF SPECIALIZATION AND RELATED ELECTIVE COURSES
DEVELOPMENT STUDIES
Small and Medium Enterprises
Gender and Development
Microfinance and Social Enterprise
Sociology
Green Economy and Sustainable Development
Co-Operative Development
Agriculture Development
Globalization and Inclusive Development
Community Development
Poverty, Inequality and Economic Growth
Land Economics
LIST OF SPECIALIZATION AND RELATED ELECTIVE COURSES
PUBLIC ADMINISTRATION
Malaysian Politics
Local Government and Urban Management
Malaysian Administrative and Legislative System
Contemporary Quality Management
Foundations of Political Philosophy
Human Resource Management and Organisational Behaviour
Federalism
Policy and Public Management
International Political Economy
Industrial Relations
Management and Project Analysis Techniques
LIST OF SPECIALIZATION AND RELATED ELECTIVE COURSES
APPLIED STATISTICS AND ANALYTICS
Survey and Sampling Methods
Business Computing and Analytics
Data Analysis
Management Science
Demographic Techniques and Applications
Advanced Statistics
Time Series Analysis
Actuarial Mathematics
Applied Analytics
Financial Econometrics
Design of Experiments', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_031', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Economist, Financial Analyst, Policy Analyst, Market Research Analyst, Economic Consultant, Investment Analyst, Data Analyst, Risk Analyst, Statistician, Budget Analyst, Research Officer, Business Analyst, Trade Analyst, Actuarial Analyst, Public Sector Economist, Development Economist, Banking Officer, Corporate Strategist.', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_033', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: Mathematics/Additional Mathematics
Any ONE (1) subjects: Physics / Chemistry / Biology / Computer Science / Information and Communication Technology (ICT)
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Mathematics subjects.
Obtain a minimum of 60%/ grade B- in any ONE (1) subject: Physics, Computing, Chemistry, Biology
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Computing, Chemistry, Biology, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in Mathematics subjects.
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) subject: Physics, Chemistry, Biology, Computer Science
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Chemistry, Biology, Mathematics Specialist

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('UM_BACHELOR_033', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Introduction to Data Science
Philosophy and Current Issues (for local students only) / Basic Malay Language (for international students)
English for Communication (2)
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Network Technology Foundation
Machine Learning
Appreciation of Ethics and Civilizations
Thinking and Communication Skills
Project Management
Database
Probability and Statistics
Software Modeling
Probability and Statistics
System Analysis and Design
Mobile Application Development
Co-Curriculum (1)
Algorithm Design and Analysis (#WIA1002)
Specialization Elective (1)
Specialization Elective (2)
Specialization Elective (3)
University Elective (Cluster 1)
Choose 3 electives of the following: Internet of Things (#WIA1005)
Knowledge Representation and Reasoning
Computing Mathematics II
Cognitive Science
Industrial Training *
Academic Project I **
Specialization Elective (4)
Specialization Elective (5)
Specialization Elective (6)
Specialization Elective (7)
University Elective (Cluster 2)
University Elective (Cluster 3)
Choose 4 electives of the following: Natural Language Processing
Autonomous Robots
Deep Learning
Computer Vision and Pattern Recognition
Virtual Reality
Co-Curriculum (2)
Academic Project II (#WIA3002)
Specialization Elective (8)
Specialization Elective (9)
Specialization Elective (10)
University Elective (Cluster 3): Global Issues and Community Sustainability: Making the World a Better Place
Choose 3 electives of the following: Functional and Logic Programming
Fuzzy Logic (#WIX1001)
Practical Artificial Intelligence
Numerical Analysis
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Internet of Things (#WIA1005)
Knowledge Representation and Reasoning
Computing Mathematics II
Cognitive Science
Functional and Logic Programming
Natural Language Processing
Fuzzy Logic (#WIX1001)
Autonomous Robots
Deep Learning
Evolutionary Computation
Computer Vision and Pattern Recognition
Practical Artificial Intelligence
Numerical Analysis
Virtual Reality', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('UM_BACHELOR_033', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'AI Research Scientist, Algorithm Developer, Business Intelligence Analyst, Computer Vision Engineer, Data Scientist, Deep Learning Engineer, Machine Learning Engineer, Natural Language Processing Engineer, Robotics Engineer, Software Developer, Virtual Reality Developer', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('UM_BACHELOR_035', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: Mathematics/Additional Mathematics
Any ONE (1) subjects: Physics / Chemistry / Biology / Computer Science / Information and Communication Technology (ICT)
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Mathematics subjects.
Obtain a minimum of 60%/ grade B- in any ONE (1) subject: Physics, Computing, Chemistry, Biology
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Computing, Chemistry, Biology, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in Mathematics subjects.
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) subject: Physics, Chemistry, Biology, Computer Science
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Chemistry, Biology, Mathematics Specialist

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-computer-science-software-engineering', '2026-10-14T05:45:45.506Z'),
    ('UM_BACHELOR_035', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Thinking and Communication Skills
Philosophy and Current Issues (for local student only) / Basic Malay Language (for international student)
English for Communication (2)
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Network Technology Foundation
Machine Learning
Appreciation of Ethics and Civilizations
Project Management
Database
Probability and Statistics
System Analysis and Design
Advanced Network Technology (#WIA1005)
Digital Design and Hardware Description Language (#WIX1003 & #WIA1003)
Co-Curriculum (1)
Operating Systems
Algorithm Design and Analysis (#WIA1002)
Specialization Elective (1)***
Specialization Elective (2)***
Specialization Elective (3)***
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Specialization Elective (4)***
Specialization Elective (5)***
Specialization Elective (6)***
Specialization Elective (7)***
University Elective (Cluster 1): Thinking Matters: Mind & Intellect
University Elective (Cluster 2): Technology/Artificial Intelligence and Data Analytics: i-Techie
Co-Curriculum (2)
Academic Project II (#WIA3002)
Specialization Elective (8)***
Specialization Elective (9)***
Specialization Elective (10)***
University Elective (Cluster 3): Global Issues and Community Sustainability: Making the World a Better Place
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
***Each Specialization Elective Course is only offered ONCE every academic session, either on Semester 1 OR Semester 2.
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Software Requirements Engineering
Web Programming
Software Testing
Software Process and Quality
Software Architecture and Design Paradigms (#WIA2002)
Software Maintenance and Evolution
Component Based Software Engineering (#WIA2002)
Real Time Systems
Python for Scientific Computing
Programming Language Paradigm
Concurrent and Parallel Programming (#WIX1002) (#WIA2004)
Game Development
Internet of Things (#WIA1005)', 'https://study.um.edu.my/bachelor-of-computer-science-software-engineering', '2026-10-14T05:45:45.506Z'),
    ('UM_BACHELOR_035', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Application Developer, Cloud Solutions Architect, Component-Based Software Engineer, Data Scientist, Game Developer, IT Project Manager, Machine Learning Engineer, Network Administrator, Real-Time Systems Developer, Software Architect, Software Engineer, Software Maintenance Specialist, Software Quality Analyst, Software Requirements Analyst, Software Tester, Systems Analyst, Web Developer.', 'https://study.um.edu.my/bachelor-of-computer-science-software-engineering', '2026-10-14T05:45:45.506Z'),
    ('UM_BACHELOR_032', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: Mathematics/Additional Mathematics
Any ONE (1) subjects: Physics / Chemistry / Biology / Computer Science / Information and Communication Technology (ICT)
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Mathematics subjects.
Obtain a minimum of 60%/ grade B- in any ONE (1) subject: Physics, Computing, Chemistry, Biology
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Computing, Chemistry, Biology, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in Mathematics subjects.
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) subject: Physics, Chemistry, Biology, Computer Science
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Chemistry, Biology, Mathematics Specialist

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_032', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Introduction to Data Science
Philosophy and Current Issues (for local student only) / Basic Malay Language (for international student)
English for Communication (2)
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Network Technology Foundation
Machine Learning
Appreciation of Ethics and Civilizations
Project Management
Database
Probability and Statistics
System Analysis and Design
Advanced Network Technology (#WIA1005)
Digital Design and Hardware Description Language (#WIX1003 & #WIA1003)
Co-Curriculum (1)
Operating Systems
Algorithm Design and Analysis (#WIA1002)
Specialization Elective (1)
Specialization Elective (2)
Specialization Elective (3)
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Specialization Elective (4)
Specialization Elective (5)
Specialization Elective (6)
Specialization Elective (7)
University Elective (Cluster 1): Thinking Matters: Mind & Intellect
University Elective (Cluster 2): Technology/Artificial Intelligence and Data Analytics: i-Techie
Co-Curriculum (2)
Academic Project II (#WIA3002)
Specialization Elective (8)
Specialization Elective (9)
Specialization Elective (10)
University Elective (Cluster 3): Global Issues and Community Sustainability: Making the World a Better Place
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Network Security
Internet Technology
Programmable Network (#WIA2008)
Digital Forensic
Cyber Security
Internet of Things (#WIA1005)
Mathematics in Networking
Cryptography
Embedded System Programming
Computer Penetration
Enterprise Network Design and Management (#WIA1005)
Mobile Computing
Principles of Distributed System (#WIA1005)
Microprocessor
Parallel Programming', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_032', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Cybersecurity Analyst, Data Center Technician, Digital Forensics Specialist, Embedded Systems Engineer, Enterprise Network Architect, IT Consultant, Network Engineer, Network Security Specialist, Penetration Tester, Systems Analyst, Technical Support Specialist, Telecommunications Engineer, Wireless Communication Engineer.', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_036', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: Mathematics/Additional Mathematics
Any ONE (1) subjects: Physics / Chemistry / Biology / Computer Science / Information and Communication Technology (ICT)
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Mathematics subjects.
Obtain a minimum of 60%/ grade B- in any ONE (1) subject: Physics, Computing, Chemistry, Biology
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Computing, Chemistry, Biology, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in Mathematics subjects.
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) subject: Physics, Chemistry, Biology, Computer Science
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Chemistry, Biology, Mathematics Specialist

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_036', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Thinking and Communication Skills
Philosophy and Current Issues (for local student only) / Basic Malay Language (for international student)
English for Communication (2)
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Network Technology Foundation
Machine Learning
Appreciation of Ethics and Civilizations
Thinking and Communication Skills
Project Management
Database
Probability and Statistics
System Analysis and Design
Mobile Application Development
Co-Curriculum (1)
Operating Systems
Algorithm Design and Analysis (#WIA1002)
Specialization Elective (1)***
Specialization Elective (2)***
Specialization Elective (3)***
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Specialization Elective (4)
Specialization Elective (5)
Specialization Elective (6)
Specialization Elective (7)
University Elective (Cluster 1): Thinking Matters: Mind & Intellect
University Elective (Cluster 2): Technology/Artificial Intelligence and Data Analytics: i-Techie
Co-Curriculum (2)
Academic Project II (#WIA3002)
Specialization Elective (8)***
Specialization Elective (9)***
Specialization Elective (10)***
University Elective (Cluster 3): Global Issues and Community Sustainability: Making the World a Better Place
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
***Each Specialization Elective Course is only offered ONCE every academic session, either on Semester 1 OR Semester 2.
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Digital Image Processing
Computer Graphics
Audio Synthesis
Interactive Design
Mathematics for Multimedia
Rendering and Animation
Multimedia Programming
Virtual Reality
Game Development
Digital Video Processing
Special Topics in Multimedia
Multimedia Forensic and Security
Data Visualization
Web Programming', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_036', 'CAREER_OPPORTUNITIES', 'Career Prospects', '3D Animator, Applications Developer, Audio Engineer, Business Intelligence Analyst, Computational Scientist, Data Scientist, Digital Forensic Analyst, Digital Media Specialist, Game Developer, Graphic Designer, Human-Computer Interaction Specialist, Information Security Analyst, Interaction Designer, IT Project Manager, Mobile App Developer, Multimedia Artist, Network Administrator, Software Engineer, Systems Analyst, UI/UX Designer, Virtual Reality Developer, Web Developer.', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_037', 'ADMISSIONS', 'Entry Requirement', 'N/A

English language requirements
N/A', 'https://study.um.edu.my/bachelor-of-computer-science-data-science', '2026-10-14T05:45:51.520Z'),
    ('UM_BACHELOR_037', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
Computing Mathematics I
Fundamentals of Programming
Computer System and Organization
Information Systems
Philosophy and Current Issues (for local student only) / Basic Malay Language (for international student)
Information Literacy
Social Engagement
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Machine Learning
Introduction to Data Science
English for Communication (1)
Appreciation of Ethics and Civilizations
Communication Thinking and Skills
Project Management
Database
Software Modeling
Probability and Statistics
Co-Curriculum
English for Communication (2)
Operating Systems
Network Technology Foundation
Specialization Elective (1)***
Specialization Elective (2)***
Faculty Elective (1)
Data Science Project
Specialization Elective (3)***
Specialization Elective (4)***
Specialization Elective (5)***
Specialization Elective (6)***
Faculty Elective (2)
External Faculty Elective
Data Science Industrial Training
Professional Development*
Data Science and Application*
Industrial Solution Development*
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
***Each Specialization Elective Course is only offered ONCE every academic session, either on Semester 1 OR Semester 2.
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Data Analytics
Knowledge Representation and Reasoning
Computing Mathematics II
Functional and Logic Programming
Natural Language Processing
Data Mining and Warehousing
Data Visualization
Business Analytics and Intelligence
Big Data Applications and Analytics
Trends in Data Science', 'https://study.um.edu.my/bachelor-of-computer-science-data-science', '2026-10-14T05:45:51.520Z'),
    ('UM_BACHELOR_037', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Data Analyst, Data Scientist, Data Engineer, Business Intelligence Analyst, Data Architect, Machine Learning Engineer, Big Data Engineer, Analytics Consultant, Database Administrator, Research Scientist, Quantitative Analyst, Statistical Analyst.', 'https://study.um.edu.my/bachelor-of-computer-science-data-science', '2026-10-14T05:45:51.520Z'),
    ('UM_BACHELOR_034', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in TWO (2) of the following subjects: Mathematics /Additional Mathematics
Any ONE (1) subjects: Physics / Chemistry / Biology / Computer Science / Information and Communication Technology (ICT)
Senior High School Certificate (SHSC)
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Mathematics subjects.
Obtain a minimum of 60%/ grade B- in any ONE (1) subject: Physics, Computing, Chemistry, Biology
Matriculation / Foundation
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics subjects.
Obtain a minimum of grade B- in any ONE (1) subject: (Computing Science / Computing), (Chemistry/Engineering Chemistry), Biology, (Physics/Engineering Physics), Basic Engineering
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Computing, Chemistry, Biology, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain a minimum of grade 5 (HL) / 6 (SL) in Mathematics subjects.
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) subject: Physics, Chemistry, Biology, Computer Science
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics subjects.
Obtain a minimum of grade B in any ONE (1) subject: Physics, Chemistry, Biology, Mathematics Specialist

English language requirements
Obtained a minimum English language Competency in any ONE (1) of the following requirements: MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_034', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Information Systems
Philosophy and Current Issues (for local student only) / Basic Malay Language (for international student)
English for Communication (2)
Data Structure (#WIX1002)
Computer System Architecture (#WIX1003)
Network Technology Foundation
Machine Learning
Appreciation of Ethics and Civilizations
Project Management
Thinking and Communication Skills
Database
Probability and Statistics
System Analysis and Design
Mobile Application Development
Co-Curriculum (1)
Operating Systems
Algorithm Design and Analysis (#WIA1002)
Specialization Elective (1)
Specialization Elective (2)
Specialization Elective (3)
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Specialization Elective (4)***
Specialization Elective (5)***
Specialization Elective (6)***
Specialization Elective (7)***
University Elective (Cluster 1): Thinking Matters: Mind & Intellect
University Elective (Cluster 2): Technology/Artificial Intelligence and Data Analytics: i-Techie
Co-Curriculum (2)
Academic Project II (#WIA3002)
Specialization Elective (8)***
Specialization Elective (9)***
Specialization Elective (10)***
University Elective (Cluster 3): Global Issues and Community Sustainability: Making the World a Better Place
Note:
#Pre-requisite
*Taken all Faculty and Programme Core Courses except Academic Project I and Academic Project II
**Pass all Faculty and Programme Core Courses except Industrial Training and Academic Project II
***Each Specialization Elective Course is only offered ONCE every academic session, either on Semester 1 OR Semester 2.
SPECIALIZATION ELECTIVE COURSES (Choose only 10 courses)
Internet of Things
Trends in Information Systems
Open-Source Programming: Application and Technology
Introduction to Data Science
Information Retrieval and Web Search
Advanced Database
Electronic Commerce
Information System Control and Security
Knowledge Management and Engineering
Information System Auditing
Data Mining and Warehousing
Data Visualization
Business Analytics and Intelligence
Web Programming', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_034', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Business Intelligence Analyst, Data Analyst, Data Scientist, Database Administrator, E-Commerce Specialist, Information Systems Auditor, Information Systems Manager, IT Consultant, IT Project Manager, Network Administrator, Security Analyst, Systems Analyst, Web Developer.', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_041', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a Diploma from a Public University/IPTA/ILKA/Polytechnic/IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the University of Malaya, with a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation/Foundation (not the current year)
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
IPTS
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GEC A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_041', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Appreciation of Ethics and Civilisations
English Communication Programme
Co-Curriculum
Word Dance Culture
Dance Notation I
Kesuma Ensemble I
Uma Ensemble I
Dance Technique I
Anatomy And Injury
Malay Classical Dance I
English Communication Programme
Philosophy and Current Issues / Malay Communication Programme*
Dance History
Dance Notation II
Kesuma Ensemble II
Uma Ensemble II
Classical Dance II
Dance Technique II
Composition And Improvisation
Performing Arts Theory
Malay Folk Dance I
Kesuma Ensemble III
Uma Ensemble III
Introduction To Dance Ethnology
Choreography I
Ballet I
Dancers Conditioning
Dance Education
Malay Folk Dance II
Kesuma Ensemble IV
Uma Ensemble IV
Dance Ethnology Seminar
Dance Criticism
Elective courses: Programme Elective
Year End Project (P)
Ensemble Kesuma V
Production Management And Stage Management
Uma Ensemble V
Elective Course: Programme Elective
Elective Course: SHE 1**
Elective Course: SHE 2**
Year End Project (P)
Kesuma Ensemble VI
Dance For Children
Programme Elective
Elective Course: Faculty Elective
Elective Course: SHE 3**
Elective Course: SHE 4**
Industrial Training
Note:
* Compulsory for local students
** Compulsory for international students
# Choose one (1) course only
All students are required to register one (1) course from each SHE Cluster
UNIVERSITI ELECTIVE COURSE – STUDENT HOLISTIC EMPOWERMENT (SHE)
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSE
Dance Music I
Classical Dance – Bharata Natyam
Dance Technique IV
Jazz Technique I
Malay Dance of Nusantara
Tai Chi
Dance Music II
Jazz Technique II
Dance Technique III
Ballet II
Martial Arts in Dance
Koreografi II
FACULTY ELECTIVE COURSE
Keyboard Skills
Dictions
Piano Accompaniment
Introduction of Popular Music
Introduction of Jazz Studies
Fundamental of Conducting
Piano Pedagogy
Vocal Pedagogy and Repertoire
Basic Vocal
Composition and Arrangement
Orchestra
Taklempong
Topics in Music
Malaysia-Nusantara Music History
Teaching Music in Schools
Music Appreciation
Advanced Music Conducting
Music Analysis
Songwriting
Music and Movement
String Repertoire and Pedagogy
Piano Repertoire
Orchestration
Music for Animation and Film
Traditional Malay Music
Practicum in Make-up for Effect
Theatre Costume Design
Asian Theatre Survey
Stage Management
Set and Prop Design
Theatre Management
Stage Combat
Lighting Design and Technology
Sound Design and Technology
Children’s Theatre Production
Script Writing for Video
Stage Acting
Video Production Practicum
Voice Acting
Acting for Television and Film
Advanced Directing', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_041', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Ballet Instructor, Choreographer, Dance Critic, Dance Ethnologist, Dance Instructor, Dance Therapist, Dance Writer, Ensemble Director, Event Coordinator, Movement Coach, Performance Artist, Production Manager, Stage Manager, Traditional Dance Performer.', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_039', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a Diploma from a Public University/IPTA/ILKA/Polytechnic/IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the University of Malaya, with a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation/Foundation (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
IPTS
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_039', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Appreciation of Ethics and Civilizations
English Course
Drama Appreciation
Vocals Technique
Malaysia Traditional Theatre
Theatre Technology
Movement Technique In Theatre
Philosophy And Current Issues / Basic Malay Language*
English Communication
Style And Technique Of Acting
Drama Script Analysis
Theatre Design
Malaysian Modern Theatre
Arts Management
Performing Arts Theory
Directing
Traditional Theatre Production
Playwriting
Southeast Asian Theatre
Elective Course: SHE 1*
Entrepreneurship Enculturation
Research Methodology For Performing Arts
Context And Aesthetic In Performance
Philosophy And Drama
Arts Criticism
Western Theatre
Elective Course: SHE 2*
Co-Curriculum
Drama In Education
Topics In Drama And Theatre
Final Year Academic Project
Drama Performing Arts Project
Elective Course: Programme Elective
Elective Course: SHE 3*
Co-Curriculum
Arts Marketing
Final Year Academic Project
Drama Performing Arts Project
Programme Elective
Elective Course: Faculty Elective
Elective Course: SHE 4*
Industrial Training
Note:
* Compulsory for local students
** Compulsory for international students
# Choose one (1) course only
UNIVERSITI ELECTIVE COURSE – STUDENT HOLISTIC EMPOWERMENT (SHE)
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSE
Makeup and Special Effects
Theatre Costume Design
Asian Theatre Survey
Stage Management
Set and Props Design
Theatre Management
Stage Combat
Lighting Design and Technology
Sound Design and Technology
Children’s Theatre Production
Script Writing for Video
Stage Acting
Video Production Practicum
Voice Acting
Acting for Television and Film
Advanced Directing
FACULTY ELECTIVE COURSE
Keyboard Skills
Dictions
Piano Accompaniment
Introduction of Popular Music
Introduction of Jazz Studies
Fundamental of Conducting
Vocal Pedagogy and Repertoire
Basic Vocal
Composition and Arrangement
Orchestra
Taklempong
Topics in Music
Malaysia-Nusantara Music History
Teaching Music in Schools
Music Appreciation
Advanced Music Conducting
Music Analysis
Songwriting
Music and Movement
String Repertoire and Pedagogy
Piano Repertoire
Piano Pedagogy
Music for Animation and Film
Traditional Malay Music
Orchestration
Dance Music I
Indian Classical Dance – Bharata Natyam
Dance Technique IV
Jazz Technique I
Malay Dance of Nusantara
Tai Chi
Dance Music II
Jazz Technique II
Dance Technique III
Ballet II
Silat Tari
Choreography II', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_039', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Acting Coach, Actor, Arts Critic, Arts Manager, Choreographer, Children’s Theatre Director, Costume Designer, Dance Instructor, Drama Educator, Drama Therapist, Director, Dramaturg, Lighting Designer, Makeup Artist, Playwright, Stage Combat Instructor, Stage Director, Stage Manager, Scriptwriter, Theatre Designer, Theatre Manager, Theatre Producer, Theatre Technician.', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_038', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a Diploma from a Public University/IPTA/ILKA/Polytechnic/IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the University of Malaya, with a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation/Foundation (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
IPTS
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University
Candidates must have one (1) of the following qualifications: Minimum Grade 7 Yamaha Certificate
Minimum Grade 5 Certificate from The Associated Board of The Royal Schools of Music (ABRSM)
Minimum Grade 5 Certificate from Trinity College London (TCL)
Minimum Grade 5 Certificate from London College of Music (LCM)
Minimum Grade 5 Certificate from Australian GUILD Music & Speech Exam Board
Possess other related music certificates.
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University
Candidates must have one (1) of the following qualifications: Minimum Grade 7 Yamaha Certificate
Minimum Grade 5 Certificate from The Associated Board of The Royal Schools of Music (ABRSM)
Minimum Grade 5 Certificate from Trinity College London (TCL)
Minimum Grade 5 Certificate from London College of Music (LCM)
Minimum Grade 5 Certificate from Australian GUILD Music & Speech Exam Board
Possess other related music certificates.

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_038', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Appreciation of Ethics and Civilization
English Language Communication
Co-Curricular
Secondary Study I
Music Ensemble I
Music Theory
Aural and Musicianship
History of Western Music: Pre-Classical
Principal Study I
Philosophy and Current Issues
Malay Language Communication
English Language Communication
Advanced Aural and Musicianship
Principal Study II
Secondary Study II
Music Ensemble II
Tonal Harmony
History of Western Music: Classical and Beyond
Elective Course: SHE 1*
Performing Arts Theory
Computer Music I
Principal Study III
Orchestra I
Chamber Music
Advanced Tonal Harmony
Elective Course: SHE 2**
Basic Entrepreneurship Enculturation
Research Methodology for Performing Arts
Advanced Music Theory
World Music Culture
Principal Study IV
Orchestra II
Introduction to Music Education
Curricular
Final Year Project (Recital)
Final Year Project (Thesis) (P)
Computer Music II
Music Ensemble III
Elective Course: Programme Elective*
Final Year Project (Recital)
Final Year Project (Thesis) (P)
Music Ensemble IV
Electronic Composition
Elective Course: Programme Elective*
Faculty Elective
Elective Course: SHE 3*
Elective Course: SHE 4*
Industrial Training
Note:
* Compulsory for local students
** Compulsory for international students
# Choose one (1) course only
UNIVERSITI ELECTIVE COURSE – STUDENT HOLISTIC EMPOWERMENT (SHE)
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSE
Keyboard Skills
Dictions
Piano Accompaniment
Introduction of Popular Music
Introduction of Jazz Studies
Fundamental of Conducting
Vocal Pedagogy and Repertoire
Basic Vocal
Composition and Arrangement
Orchestra
Taklempong
Topics in Music
Malaysia-Nusantara Music History
Teaching Music in Schools
Music Appreciation
Advanced Music Conducting
Music Analysis
Songwriting
Music and Movement
String Repertoire and Pedagogy
Piano Repertoire
Piano Pedagogy
Music for Animation and Film
Traditional Malay Music
Composition and Arrangement II
FACULTY ELECTIVE COURSE
Makeup and Special Effects
Theatre Costume Design
Asian Theatre Survey
Stage Management
Set and Props Design
Theatre Management
Stage Combat
Lighting Design and Technology
Sound Design and Technology
Children’s Theatre Production
Script Writing for Video
Stage Acting
Video Production Practicum
Voice Acting
Acting for Television and Film
Advanced Directing
Dance Music I
Indian Classical Dance - Bharata Natyam
Dance Technique IV
Jazz Technique I
Malay Dance of Nusantara
Tai Chi
Dance Music II
Jazz Technique II
Dance Technique III
Ballet II
Silat Tari
Choreography II', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_038', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Advanced Music Conductor, Arts Critic, Ballet Instructor, Choreographer, Dance Instructor, Dance Music Composer, Dance Notation Specialist, Electronic Music Producer, Ensemble Director, Film Music Composer, Jazz Musician, Music Appreciation Specialist, Music Analyst, Music Educator, Music Ensemble Director, Music for Animation and Film Composer, Music Pedagogue, Music Producer, Music Therapist, Orchestra Conductor, Orchestra Musician, Piano Instructor, Principal Study Musician, Recording Engineer, Songwriter, Stage Combat Instructor, Stage Director, Stage Manager, Traditional Music Specialist.', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_040', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a Diploma from a Public University/IPTA/ILKA/Polytechnic/IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the University of Malaya, with a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Not Offered
AUSMAT
Not Offered
STPM (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Matriculation/Foundation (not the current year)
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
IPTS
Malaysian Citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B- in any TWO (2) subjects
Additional Requirement
Pass the test and/or interview as required by the Public University

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_040', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues (W)
Malay Language Communication
Aural dan Musicianship
Music Ensemble I
Music Theory
Orchestra 1
Drama Appreciation
Vocals Technique
Theatre Technology
World Dance Culture
Dance Technique I
Anatomy and Injury
Basic Entrepreneurship Enculturation
English / Language Communication Course
Advanced Aural and Musicianship
Music Ensemble II
Tonal Harmony
Orchestra II
Style and Technique of Acting
Malaysian Modern Theatre
Dance History
Dance Technique II
Composition and Improvisation
Artificial Intelligence in the Creative Arts
Integrity and AntiCorruption Course
English Communication
Performing Arts Theory
Introduction of Popular Music
Music Ensemble III
Directing
Playwriting
Theatre Costume Design
Dancers Conditioning
Introduction to Dance Ethnology
Malay Folk Dance I
UMa Ensemble I
Elective Course: Elective Program
Penghayatan Etika dan Peradaban
Elective Course: SHE 1*
Research Methodology for Performing Arts
World Music Culture
Music Ensemble IV
Context and Aesthetic in Performance
Stage Combat
Asian Theatre Survey
Dance Ethnology Seminar
Malay Folk Dance II
UMa Ensemble II
Elective Course: Elective Program
Elective Course: SHE 2*
Final Year Project (P)
Traditional Malay Music
Introduction to Music Education
Stage Acting
Arts Management
Set and Prop Design
Production Management and Stage Management
Dance Education
Elective Course: Elective Program
Co-Curriculum
Final Year Project (P)
Music Appreciation
Songwriting
Lighting Design and Technology
Children’s Theatre Production
Practicum in MakeUp for Effect
Dance for Children
Dance Criticism
Elective Course: Elective Program
Industrial Training
Note:
* Compulsory for local students
** Compulsory for international students
# Choose one (1) course only
UNIVERSITI ELECTIVE COURSE – STUDENT HOLISTIC EMPOWERMENT (SHE)
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
PROGRAMME ELECTIVE COURSE
History of Western Music: Pre Classical
History of Western Music: Classical and Beyond
Keyboard Skills
Chamber Music
Fundamental of Conducting
Taklempong
Topics in Music
Malaysia – Nusantara Music History
Teaching Music in Schools
Advanced Tonal Harmony
Malaysia Traditional Theatre
Drama Script Analysis
Philosophy and Drama
Western Theatre
Sound Design and Technology
Topics in Drama and Theatre
Script Writing for Video
Video Production Practicum
Drama in Education
Voice Acting
Ballet I
Bharata Natyam
Dance Technique IV
Teknik Jazz I
Malay Dance of Nusantara
Teknik Jazz II
Dance Technique III
Ballet II
Silat Tari
Koreografi I
Koreografi II', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_040', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Actor, Dancer, Musician, Choreographer, Director, Stage Manager, Theatre Producer, Performing Arts Educator, Arts Administrator, Dramaturg, Performance Designer, Sound Designer, Lighting Designer, Set Designer, Stage Technician, Performance Coach, Casting Director, Theatre Critic, Event Coordinator, Cultural Program Manager, Arts Festival Organizer.', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_043', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.80
Obtain a minimum of grade A in TWO (2) subjects and grade A- in one (1) subject: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.80
Obtain a minimum of grade A in TWO (2) subjects and grade A- in one (1) subject: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.80 in the field of Health Sciences or equivalent from an institution approved by UM Senate and recognized by the Malaysian government
Obtain a minimum of grade B in these TWO (2) subjects at the SPM level: Biology, Chemistry, Physics
Obtain a minimum of grade B in THREE (3) other subjects at the SPM level: English, Mathematics or Additional Mathematics, other subjects
Obtain a minimum of grade B in ONE (1) other subject at the SPM level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.80
Obtain a minimum of grade A in TWO (2) subjects and grade A- in one (1) subject: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM level, excluding subjects in the fields of Arts/Humanities and Literature in Professional Studies (KSI)
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade BBB or ABC or AAC in any THREE (3) subjects: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 36 points
Obtain at least Grade 6 (HL) in TWO (2) subjects and 6 (SL) in ONE (1) subject: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
AUSMAT
Malaysian citizen
Obtain a minimum score of 90 in the Australian Tertiary Admissions Rank (ATAR).
Obtain a minimum of grade AAB in TWO (2) subjects: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Entry Requirements for
(MUFY, UNSW, WESTERN AUSTRALIA CURRICULUM COUNCIL, HSC SYDNEY AUSTRALIA, TRINITY COLLEGE FOUNDATION STUDIES, AUSTRALIAN UNIVERSITIES FOUNDATION PROGRAMME, SOUTH AUSTRALIAN MATRICULATION, VICTORIAN CERTIFICATE OF EDUCATION, AUSTRALIA YEAR 12 OR EQUIVALENT, NATIONAL CERTIFICATE OF EDUCATIONAL ACHIEVEMENT (NCEA) LEVEL 3 OR NEW ZEALAND BURSARY, CPU OR CIMP/CANADIAN GRADE 12/13)
Malaysian citizen
Obtain a recognized qualification
Obtain a minimum aggregate score or average score of 80% or equivalent to grade B in THREE (3) subjects: Biology, Chemistry, Physics or Mathematics
Obtain a minimum score of 80% in the Australian Tertiary Admissions Rank (ATAR) in THREE (3) subjects: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Indian Pre-University
Malaysian citizen
Obtain a recognized pre-university qualification from India
Obtain a minimum average score of 70% in THREE (3) subjects: Biology, Chemistry, Physics or Mathematics
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Bachelor''s Degree Program
Malaysian citizen
Obtain a minimum CGPA of 3.80 in Bachelor’s Degree of Medical Science (MBBS) or equivalent from an institution approved by UM Senate and recognized by the Malaysian government
Obtain a minimum of grade B in FIVE (5) subjects at the SPM level or O-Level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics, and ONE (1) other subject, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Additional Requirement
Interview is required
Test is required
Confirmed to be free from physical disabilities and serious mental illnesses, serious infectious diseases, and has never been convicted of any criminal activities that would have implications as a medical practitioner.
Failure to provide valid and accurate information, especially regarding one''s health as a medical practitioner, may result in the application being rejected and/or termination of studies in this field.
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 75%/ grade A- in any TWO (2) subjects: Biology, Chemistry, Physics / Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM/O-Level/Equivalent level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Matriculation/Foundation
Obtain a minimum CGPA of 3.80 from a recognised institution approved by UM Senate
Obtain a minimum of grade A- in any TWO (2) subjects: Biology, Chemistry, Physics / Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM/O-Level/Equivalent level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Diploma
Obtain a minimum CGPA of 3.80 from a recognised institution approved by UM Senate
Obtain a minimum of grade A- in any TWO (2) subjects: Biology, Chemistry, Physics / Mathematics
Obtain a minimum of grade B in any TWO (2) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics
Obtain a minimum of grade B in any TWO (2) subject at the SPM/O-Level/Equivalent level, in English, Mathematics/Additional Mathematics, any ONE (1) subject excluding the fields of Arts or Humanities and Literature in Professional Studies (KSI)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade in these THREE (3) subjects: Biology (A), Chemistry (A), Physics / Mathematics (B)
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM/O-Level/Equivalent level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
International Baccalaureate (IB)
Obtain a minimum score of 36 points
Obtain at least Grade 6 (HL) / 6 (SL) in any TWO (2) subjects: Biology, Chemistry, Physics / Mathematics
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM/O-Level/Equivalent level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade in any TWO (2) subjects: Biology (A), Chemistry (A), Physics / Mathematics (B)
Obtain a minimum of grade B in these FOUR (4) subjects at the SPM/O-Level/Equivalent level: Biology, Chemistry, Physics, Mathematics or Additional Mathematics
Obtain a minimum of grade B in ONE (1) other subject at the SPM/O-Level/Equivalent level, excluding subjects in the fields of Arts or Humanities and Literature in Professional Studies (KSI)
Additional Requirement
Interview is required
Test is required
Certified healthy from serious physical disabilities and mental illness (exceptions may be given to candidates who have physical disabilities that can be corrected and / or do not prevent candidates from conducting clinical activities required by medical practitioners)

English language requirements
MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 60
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-dental-surgery', '2026-10-14T05:46:05.579Z'),
    ('UM_BACHELOR_043', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4 Year 5
Year 1 Year 2 Year 3 Year 4 Year 5 Oral Biology
Anatomy
Biochemistry
Physiology
Community Dentistry I
Oral & Maxillofacial Imaging I
Dental Material and Dental Technology
Pathology
Medical Microbiology
Pharmacology
Community Dentistry Ii
Oral & Maxillofacial Imaging Ii
Operative & Endodontic I
Oral Medicine & Oral Pathology I
Periodontology I
Paediatric Dentistry I
Orthodontics I
Prosthodontics I
Oral & Maxillofacial Surgery I
General Dental Practice I
Human Diseases (General Surgery)
Human Diseases (General Medicine)
Community Dentistry III
Oral & Maxillofacial Imaging III
Operative & Endodontic II
Oral Medicine & Oral Pathology II
Periodontology II
Paediatric Dentistry II
Orthodontics II
Prosthodontics II
Oral & Maxillofacial Surgery II
General Dental Practice II
Elective Project (P)
Community Dentistry IV
Operative & Endodontic III
Paediatric Dentistry III
Orthodontics III
Prosthodontics III
Oral & Maxillofacial Surgery III
General Dental Practice III
Note:
List of University Courses
Dental students are required to undertake 14 credit hours of university courses. The predetermined required courses are taken in the First Year and are as follows:
UNIVERSITY COURSES (LOCAL STUDENTS) - (TERM 1)
Philosophy and Current Issues
Appreciation to Ethics and Civilisations
Master English VI
Advance Communication Skills
Basic Entrepreneurship Culture
Presentation Skills in English
Advance Professional Writing
UNIVERSITY COURSES (INTERNATIONAL STUDENTS) - (TERM 1)
Basic Malay Language
Appreciation of Ethics and Civilisations
Information Literacy
Mastering English VI
Advance Professional Writing
Basic Entrepreneurship Culture
Presentation Skills in English
Advance Professional Writing', 'https://study.um.edu.my/bachelor-of-dental-surgery', '2026-10-14T05:46:05.579Z'),
    ('UM_BACHELOR_043', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Clinical Dentist, Clinical Lecturer, Community Dentist, Dental Health Educator, Dental Public Health Specialist, Dental Research Scientist, Dental Specialist, Forensic Odontologist, General Practitioner Dentist, Hospital Dentist, Oral & Maxillofacial Surgeon, Oral Medicine Specialist, Paediatric Dentist, Periodontist, Private Practice Owner, Prosthodontist, Public Health Consultant, University Lecturer, Veteran’s Affairs Dentist.', 'https://study.um.edu.my/bachelor-of-dental-surgery', '2026-10-14T05:46:05.579Z'),
    ('UM_BACHELOR_044', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science Stream
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Social Science, Science, Accounting, and TESL
STAM
Malaysian citizen
Obtain a minimum of Jayyid Jiddan
Obtain a minimum of Jayyid in TWO (2) subjects
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
Additional Requirement
Passed the examination and/or interview set by the University.
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/ grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Passed the examination and/or interview set by the University.
Candidates who apply must be physically fit, not suffering from any mental or physical illness and / or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 60
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_044', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 *Philosophy and Current Issues
**Malay Language Communication
Introduction to Psychology
Developmental Psychology
Program Elective Courses Choose TWO (2) courses. (Refer Course List A) Elective 1
Elective 2
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Appreciation of Ethics and Civilizations
English Communication Course 1
Educational Development in Malaysia
Introduction to Counselling Psychology
Social Psychology
Counseling Theories
Program Elective Courses: Choose ONE (1) course. (Refer Course List A) Development in Adult Stage
Program Organization for Counselling Services
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Co-curriculum Courses
Basic Entrepreneurship Enculturation
Career Development Theory
Counseling Techniques
Program Elective Courses: Choose TWO (2) courses. (Refer Course List A) Elective 3
Elective 4
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
English Communication Course 2
Education and Research
Group Leadership
Basic Statistics for the Behavioral Science
Career and Vocational Counselling
Advanced Counseling Technique
Program Elective Courses: Choose ONE (1) course. (Refer Course List A) Human Development from Islamic Perspective
Online Counseling
Research Project (P1)
Group Dynamic and Procedure
Psychological Testing and Measurement
Abnormal Psychology
Program Elective Courses: Choose ONE (1) course. (Refer Course List A) Elective 5
Educational Psychology
Research Project (P2)
Cross-Cultural Counselling
Marriage and Family Counseling
Program Elective Courses: Choose ONE (1) course. (Refer Course List A) Rehabilitation Counselling
Counselling in Higher Learning Institution
Co-curriculum Courses
Education and Society
Professional Issues and Ethics in Counselling and Psychology
Counseling Practicum (Laboratory)
Counseling Children and Adolescent
Program Elective Courses: Choose ONE (1) course. (Refer Course List A) Elective 6
Internship
Note:
*Local Student
**International Student
Course List A
Technology Application in Counseling Services
Personality
Industrial and Organizational Psychology
Behavior Modification
Addiction and Recovery Counselling
Clinical Mental Health Counseling
University Elective Courses
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_044', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Addiction Counselor, Behavioral Therapist, Career Counselor, Clinical Psychologist, Counseling Psychologist, Educational Counselor, Family Therapist, Group Counselor, Human Resources Specialist, Industrial and Organizational Psychologist, Marriage Counselor, Mental Health Counselor, Online Counselor, Program Coordinator for Counseling Services, Psychological Tester, Social Worker, Substance Abuse Counselor.', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_045', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science Stream
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
Additional Requirement
Meet the minimum Malaysian Educators Selection Inventory (MEdSI) test score as required by the Public University.
Passed the examination and/or interview set by the University.
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/ grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Pass the examination and/or interview set by the University.
Candidates who apply must be physically fit, not suffering from any mental or physical illness and / or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 5.0
IELTS (Academic) 7.0
TOEFL iBT (Centre-based) 96
TOEFL Essentials (Online) 10.0
Pearson Test of English (PTE Academic) 65
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 180', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_045', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 *Philosophy and Current Issues
**Malay Language Communication
Educational Development in Malaysia
Physical and Health Education
Foundations of TESL Methodology
Linguistics for Language Teachers
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Appreciation of Ethics and Civilizations
English Communication Course 1
Educational Psychology
Grammar in the ESL Classroom
Listening and Speaking in the ESL Classroom
Phonetics and Phonology
Choose ONE (1) course only: Fundamentals of Visual Art Design
Philosophy and Moral Development
Physical Fitness and Health
Introduction to Methodology in Literature Education
Basic Entrepreneurship Culture
Education and Society
Reading in the ESL Classroom
Writing in the ESL Classroom
Language Learning and Language Use
Program Elective Courses: Choose ONE (1) course ONLY 3-Dimensional Design
Moral Education and Religion
Basics Measurement and Evaluation in Physical and Health Education
Interpretations of Literary Texts in Schools
Programme Open Elective: Choose ONE (1) course from List A
English Communication Course 2
Communication & Innovation in Education
Self-Leadership and Co-Curricular Management
Writing Skills for Textual Analysis
Syllabus Design and Materials Development
Choose ONE (1) course only: Curriculum and Assessment in Visual Art Education
Moral Education Curriculum
Motor Learning Principles
Teaching Literary Genres
Appreciation and Fundamentals of Art Criticism
Approach and Assessment in Moral Education
Athletics Education
Simulated Teaching in Literature Education
Special Semester
Industrial Experience
Ethics and Legislation in Education
Assessment and Evaluation for ESL
Foundations of Research in TESL
Simulated Teaching in TESL
Choose ONE (1) course only: Micro Teaching in Visual Arts Education
Micro Teaching in Moral Education
Micro Teaching in Physical and Health Education
Performance in Literature Education
Programme Open Elective: Choose ONE (1) course from List B
University Electives: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Practicum
Co-curriculum
Education and Research
Academic Project (P1)
Academic Writing
Integrative Seminar: Issues In TESL
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Academic Project (P2)
Program Open Elective Courses: Choose ONE (1) course only (*Refer Open Elective List A)
Program Open Elective Courses: Choose ONE (1) course only (*Refer Open Elective List B)
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Note:
*Local Student
**International Student
Course List A
Students choose TWO (2) of SEVEN (7) courses offered by the Faculty of Education listed below. Each course is 3 credits
Behaviour Modification
Personality
Introduction to Special Education
Comparative Education
Multimedia in Teaching
Akhlak and Professional Ethics
Statistical Reasoning in Educational Research
Course List B
Students choose TWO (2) of SEVENTEEN (17) courses offered by the English Department, Faculty of Arts and Social Sciences, as listed below.
Introduction to Fiction
Aspects of Poetry
Drama: An Introduction
Shakespeare and His Contemporaries
Postcolonial Literature: Themes and Tropes
Topics in the Nineteenth Century
Theatre Performance in English
Exploring Travel Literature
Literature and the Environment
Malaysian Popular Literature and Culture
Crime Fiction: An Investigation
Women’s Voices in Literature
Topics in Malaysian and Singaporean Literature
Women and Literature
Popular Culture and Literature
Malaysian Literature
Children and Young Adult Literature
University Elective Courses
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_045', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Curriculum Developer, Educational Consultant, English Language Instructor, ESL Program Coordinator, Instructional Designer, Language Assessment Specialist, Language Learning Specialist, Literacy Coach, Micro Teaching Specialist, Performance Analyst in Literature Education, TESL Program Director, Teaching English as a Second Language (TESL) Teacher, Writing Instructor.', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_046', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science Stream
Matriculation / Foundation (Science and Arts Stream)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Social Science, Science, Accounting, and TESL
STAM
Malaysian citizen
Obtain a minimum of Jayyid Jiddan
Obtain a minimum of Jayyid in TWO (2) subjects
Diploma / Equivalent
Malaysian citizen
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in TWO (2) subjects
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
Additional Requirement
Passed the examination and/or interview set by the University.
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/ grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Pass the examination and/or interview set by the University.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 6.0
TOEFL iBT (Centre-based) 60
TOEFL Essentials (Online) 8.5
Pearson Test of English (PTE Academic) 59
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 169', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_046', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues (Local students only)
Malay Language Communication (International students only)
Educational Development in Malaysia
Introduction to Special Education
Art and Craft
Child Development
Program Elective Courses: Choose ONE (1) course only: Gifted and Talented Children
Language Arts Teaching
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Appreciation of Ethics and Civilisations
English Communication Course 1
Education and Research
Application of Computer in Instruction
Play and Development
Music and Movement
Reading and Literature for Early Childhood
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Basic Entrepreneurship Enculturation
Educational Psychology
Instructional Design
Early Childhood Mathematics
Science for Young Children
Observational and Evaluation Skills
Inclusive Education
English Communication Course 2
Education and Society
Children and Family Intervention
Principles of Children Behavior Management
Reading and Mathematics Methods for Children with Disabilities
Health, Nutrition and Safety
Family, Preschool and Community Smart Partnerships
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Research Methods in Early Childhood Education
Program Planning and Teaching Strategy I
Assessment of Learning in Early Childhood Education
Statistics for Early Childhood Education
Digital Audio Technology in Early Childhood Education
Child-rearing Practices in Malaysia
University Elective Courses: Student Holistic Empowerment (SHE) Course Cluster 1/2/3/4
Teaching Practice (Nursery)
Co-curriculum
Leadership and Early Childhood Management
Teaching Strategy and Programme Planning II
Policy and Legal Literacy in Early Childhood Education
Industrial Orientation for Special Education
Early Childhood Education Research Project (P1)
Program Elective Courses: Choose ONE (1) only: Digital Technology and Innovation in Teaching
Islamic Child Rearing Practices
Teaching Practice (Kindergarten)
Early Childhood Education Research Project (P2)
Note:
University Elective Courses
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_046', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Academic Researcher, Child Development Specialist, Children''s Program Coordinator, Curriculum Developer, Digital Learning Specialist, Educational Consultant, Early Childhood Educator, Early Childhood Education Administrator, Family Support Specialist, Health and Nutrition Specialist, Instructional Designer, Islamic Child Rearing Specialist, Kindergarten Teacher, Language Arts Specialist, Learning Disabilities Specialist, Music and Movement Instructor, Play Therapist, Policy Analyst, Program Planner, Special Education Teacher.', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_047', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in Engineering recognized by the Government of Malaysia and approved by the Senate of the University Malaya with a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics / Equivalent Subject.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain at least a grade of B in Mathematics and Physics
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject: Mathematics and Physics
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain at least a grade of B in Mathematical Methods and Physics
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & Physics
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & (Physics/Engineering Physics)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
Additional Requirement
Candidates who apply for Bachelor of Electrical Engineering and Chemical Engineering must not be colour blind.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_047', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues* / Bahasa Melayu Komunikasi **
Basic Enculturation Entrepreneurship
English Communication I
Appreciation of Ethics and Civilisations
English Communication II
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
Engineering Mathematics 1
Engineering Mathematics 2
Engineering Mechanics
Civil Engineering Materials
Civil Engineering Drawing And CAD
Mechanics Of Materials
Engineering Survey
Programming And Information System
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making The World A Better Place
Law, Ethics and Sustainability For Engineers
Theory Of Structures
Fluid Mechanics
Soil Mechanics I
Pavement Engineering
Principles Of Environmental Engineering
Water Resources
Reinforced Concrete Design I
Soil Mechanics II
Surveying Fieldwork
Highway Engineering
Co-Curriculum
Engineering Economics and Project Management
Statistics and Numerical Techniques
Structural Steel Design
Geotechnical Engineering
Open Channel Hydraulics
Structural Analysis
Traffic Engineering
Foundation Engineering
Reinforced Concrete Design II
Water Supply And Sewerage
Fundamentals Of Sustainability In Civil Engineering
Construction Management And Technology
Industrial Training
Final Year Project (P)
Integrated Design Project I
Engineers and Society
Prestressed Concrete Design
Integrated Design Project II
Department Elective Courses: Elective Course I
Department Elective Courses: Elective Course II
Department Elective Courses: Elective Course III
Department Elective Courses: Elective Course IV
Department Elective Courses: Elective Course V
Note:
*Compulsory for Local Students
**Compulsory for International students
University Elective Courses
Student Holistic Empowerment Course (SHE)
Department Elective Courses
Advanced Structural Steel Design
Timber Design
Wind and Earthquake Engineering
Bridge Engineering
Concrete Engineering and Technology
Rock Engineering
Ground Improvements
Quantitative Techniques in Construction Management
Precast Concrete and IBS
Green Building
Repair and Rehabilitation
Waste Management and Treatment
Erosion and Sediment Control
Coastal Processes and Management
Environmental Impact Assessment and Management Systems
Advanced Hydrology
Advanced Hydraulics
Artificial Intelligence in Civil Engineering
Urban Mass Transit System
Highway Planning and Road Safety Audit
Advanced Transportation System
Surface Water Quality Engineering', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_047', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Advanced Transportation Engineer, Bridge Engineer, Coastal Engineer, Construction Manager, Environmental Engineer, Geotechnical Engineer, Highway Engineer, Hydraulic Engineer, Project Manager, Quantity Surveyor, Reinforced Concrete Engineer, Research and Development Engineer, Site Engineer, Structural Engineer, Traffic Engineer, Water Resources Engineer, Waste Management Engineer, Wind and Earthquake Engineer.', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_048', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in Engineering recognized by the Government of Malaysia and approved by the Senate of the University Malaya with a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics / Equivalent Subject.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain at least a grade of B in Mathematics and Physics
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject: Mathematics and Physics
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain at least a grade of B in Mathematical Methods and Physics
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & Physics
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & (Physics/Engineering Physics)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
Additional Requirement
Candidates who apply for Bachelor of Electrical Engineering and Chemical Engineering must not be colour blind.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-biomedical-engineering', '2026-10-14T05:46:15.646Z'),
    ('UM_BACHELOR_048', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy And Current Issues* / Bahasa Melayu Komunikasi **
English Communication Programme I
Appreciation of Ethics and Civilisations
English Communication II
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Engineering Mathematics 1
Engineering Mathematics 2
Statistics For Biomedical Engineering
Anatomy And Physiology
Statics And Mechanics of Materials
Circuit Theory
Biomedical Engineering Lab 1
Human Musculoskeletal System
Dynamics
Electronic Devices
University Elective Courses (Student Holistic Empowerment): Basic Entrepreneurship Enculturation
Law, Ethics and Sustainability for Engineers
Biomedical Engineering Lab 2
Biomedical Engineering, Healthcare and Ethics
Biomaterials
Biomedical Engineering Design 1
Fundamentals Of Prosthetics and Orthotics Engineering
Numerical Methods and Programming
Safety And Standards in Biomedical Engineering
Fluid Mechanics and Transport Processes in Biomedical Engineering
Electromagnetism And Biomedical Devices
Biomechanics of Human Motion
Biomedical Engineering Design 2
Biomedical Engineering Lab 3
Elective University Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
Elective University Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
Elective University Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
Elective University Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Engineering Economics and Project Management
Programme Elective Courses: Elective Courses (Biomedical Field)
Programme Elective Courses: Elective Courses (Prosthetics and Orthotics Field)
Sustainability and Practice in Biomedical Engineering
Biomedical Signal Processing
Medical Imaging
Experimental and Computational Biomechanics
Biomedical Integrate Design Project 1
Biomedical Integrate Design Project 2
Industrial Training
Co-Curriculum
Final Year Project (P)
Programme Elective Courses: Elective Course I
Programme Elective Courses: Elective Course II
Programme Elective Courses: Elective Course III
Programme Elective Courses: Elective Course IV
Programme Elective Courses: Open Elective Course
Programme Elective Courses: Open Elective Course
Elective University Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
Elective University Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
Elective University Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
Elective University Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Note:
*Compulsory for Local Students
**Compulsory for International students
University Elective Courses
Student Holistic Empowerment Course (SHE)
Programme Elective Courses
Biomedical Field
Prosthetics and Orthotics Field
Programme Elective Courses
PROGRAMME ELECTIVE COURSES IN BIOMEDICAL
Electrical Safety Design of Medical Devices and System
Photonics in Biomedical Engineering
Biomedical Control System
Microcomputer and Digital System
Medical Electronics
Instrumentation and Measurement
Computational Modelling in Biomedical Engineering
Healthcare Technology and Clinical Management
Artificial Intelligence in Biomedical Engineering
PROGRAMME ELECTIVE COURSES IN PROSTHETICS AND ORTHOTICS
Biomechanics in Prosthetics and Orthotics
Below Knee Prosthetics
Principles of Upper Limb Prosthetics and Orthotics Design
Principles of Lower Limb Orthotics Design
Above Knee Prosthetics
Industrial Prosthetics Design
Industrial Orthotics Design
Practice Management in Prosthetic and Orthotics
Advanced Prosthetics and Orthotics Engineering
OPEN PROGRAMME ELECTIVE COURSES
Sports Biomechanics and Rehabilitation
Assistive Technology in Rehabilitation
Mechanical Circulatory and Respiratory Support
Biomechatronics
Pattern and Image Analysis
Micro Technologies for Biomedical Engineering
Medical IT and Telemedicine
Clinical Prosthetics
Clinical Orthotics
Spinal Orthoses
Tissue Engineering
Advanced Biomaterials
Biochemistry and Analytical Techniques
Wireless Power Transfer in Biomedical Engineering', 'https://study.um.edu.my/bachelor-of-biomedical-engineering', '2026-10-14T05:46:15.646Z'),
    ('UM_BACHELOR_048', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Advanced Prosthetics Engineer, Assistive Technology Developer, Assistive Technology Specialist, Biomechanics Engineer, Biomechatronics Engineer, Biomedical Engineer, Biomedical Equipment Technician, Biomedical Signal Processing Engineer, Clinical Engineer, Clinical Prosthetist, Clinical Prosthetics Specialist, Healthcare Technology Manager, Medical Device Designer, Medical Device Developer, Medical Electronics Engineer, Medical Imaging Specialist, Microcomputer and Digital Systems Engineer, Prosthetic Designer, Prosthetics and Orthotics Engineer, Quality Assurance Engineer, Regulatory Affairs Specialist, Rehabilitation Engineer, Research and Development Engineer, Research Scientist, Safety and Compliance Engineer, Safety Engineer, Tissue Engineer, Tissue Engineering Specialist, Validation Engineer, Wireless Power Transfer Engineer, Rehabilitation Engineer, Regulatory Affairs Specialist, Research and Development Engineer, Quality Assurance Engineer, Safety and Compliance Engineer, Tissue Engineer, Validation Engineer.', 'https://study.um.edu.my/bachelor-of-biomedical-engineering', '2026-10-14T05:46:15.646Z'),
    ('UM_BACHELOR_050', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in Engineering recognized by the Government of Malaysia and approved by the Senate of the University Malaya with a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics / Equivalent Subject.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain at least a grade of B in Mathematics and Physics
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject: Mathematics and Physics
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain at least a grade of B in Mathematical Methods and Physics
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & Physics
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & (Physics/Engineering Physics)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
Additional Requirement
Candidates who apply for Bachelor of Electrical Engineering and Chemical Engineering must not be colour blind.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_050', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues* / Bahasa Melayu Komunikasi**
English Communication I
English Communication II
Engineering Mathematics 1
Engineering Mathematics 2
Statics
Fluid Mechanics 1
Engineering Materials 1
Engineering Design and Modelling
Engineering Thermodynamics 1
Mechanics of Materials 1
Dynamics
Machining and Manufacturing Processes
Basic Entrepreneurship Enculturation
Appreciation of Ethics and Civilisations
Engineering Economics and Project Management
Mechatronics 1
Computer Programming
Fluid Mechanics 2
Mechanics of Materials 2
Product Design and Innovation
Design of Machine Elements
Engineering Thermodynamics 2
Numerical and Statistical Methods in Engineering
Mechatronics 2
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Co-Curriculum
Law, Ethics and Sustainability for Engineers
Integrated Design 1
Instrumentation and Measurement Techniques
Mechanical Vibrations
Engineering Materials 2
Integrated Design 2
Control Engineering
Heat Transfer
Finite Element Analysis
Industrial Training
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Materials Selection in Mechanical Design
Production and Operations Management
Final Year Project 1
Final Year Project 2
Department Elective Courses: Elective Course II
Department Elective Courses: Elective Course III
Department Elective Courses: Elective Course IV
Department Elective Courses: Elective Course V
Department Elective Courses: Elective Course VI
Note:
*Compulsory for Local Students
**Compulsory for International students
University Elective Courses
Student Holistic Empowerment Course (SHE)
Department Elective Courses
Tribology
Machinery Vibration and Condition Monitoring
Engineering Acoustics and Noise Control
Internal Combustion Engine
Heat Exchanger Equipments
Pump Characteristics and Application
Computational Fluid Dynamics
Heating, Ventilation, Air Conditioning and Refrigeration
Human Factors Design
Sustainable Design
Rapid Manufacturing Technology
Manufacturing Strategy
Machine Learning
Ceramic Engineering
Constitutive Modeling of Materials
Electronic Packaging
Failure Analysis and Prevention
Metals and Alloys Engineering
Nanomaterials
Polymer and Rubber Engineering
Semiconductor Manufacturing Process and Technology
Mold and Die Design
Microfabrication and Devices
Theory and Applications in Metal Forming
Industrial Robotics
Corrosion Engineering
Power Plant Engineering
Technopreneurship in Engineering', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_050', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Acoustics Engineer, Aerospace Engineer, Automotive Engineer, Computational Fluid Dynamics Engineer, Control Systems Engineer, Corrosion Engineer, Design Engineer, Energy Systems Engineer, Failure Analysis Engineer, Finite Element Analyst, Heat Transfer Engineer, HVAC Engineer, Industrial Engineer, Internal Combustion Engine Specialist, Maintenance Engineer, Manufacturing Engineer, Materials Engineer, Mechanical Design Engineer, Mechatronics Engineer, Nanomaterials Engineer, Operations Manager, Power Plant Engineer, Product Design Engineer, Production Engineer, Quality Control Engineer, Robotics Engineer, Safety Engineer, Sustainable Design Engineer, Technopreneur, Vibration and Condition, Monitoring Specialist.', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_049', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in Engineering recognized by the Government of Malaysia and approved by the Senate of the University Malaya with a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics / Equivalent Subject.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain at least a grade of B in Mathematics and Physics
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject: Mathematics and Physics
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain at least a grade of B in Mathematical Methods and Physics
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & Physics
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & (Physics/Engineering Physics)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
Additional Requirement
Candidates who apply for Bachelor of Electrical Engineering and Chemical Engineering must not be colour blind.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_049', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues* / Malay Language Communication**
English Communication Programme I
Appreciation of Ethics and Civilisations
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
Engineering Mathematics 1
Engineering Mathematics 2
Digital System
Programming I
Circuit Analysis I
Lab 1
Electronic Physics
Electronic Circuits I
Signals and Systems
English Communication Programme II
Basic Entrepreneurship Enculturation
Co-Curriculum
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: i-Techie
Engineering Economics and Project Management
Lab 2
Programming II
Electronic Circuit II
Basic Electromagnetics
Microprocessors and Microcontrollers
Lab 3
Communication Systems
Machines and Drives
Digital Design
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Law, Ethics and Sustainability for Engineers
Lab 4
Applied Electromagnetics
Numerical Analysis
Control System
Digital Signal Processing
Integrated Design Project
Lab 5
Power Electronics
Energy Conversion and High Voltage Transmission
Instrumentation
Digital Communications
Industrial Training
Final Year Project
Power System
Electrical Energy Utilization
Elective Course I
Elective Course II
Elective Course III
Elective Course IV
Elective Course V
Elective Course VI
Elective Course VII
Note:
*Compulsory for Local Students **Compulsory for International students
University Elective Courses
Student Holistic Empowerment Course (SHE)
Department Elective Courses
Sustainable Energy Technologies
Electrical Energy Conversion Technologies
Renewable Energy Technologies
High Voltage Engineering
Electrical Power Quality
Power System Economics
Information Communication Technologies
Wireless Communication
Optical Communication
Antenna and Propagation
Data Communication Networks
Integrated Micro/Nano Electronics
VLSI Design
Analog VLSI Circuit Design
Microwave Electronics and Systems
Analog Electronics Design
Cyber-physical System
Embedded Systems
Digital Control System
Optimization Methods
Machine Learning
Human-Computer Interaction
Data Analytics', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_049', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Automation Engineer, Control Systems Engineer, Cybersecurity Engineer, Data Analyst, Digital Design Engineer, Electrical Engineer, Electronics Engineer, Energy Engineer, Instrumentation Engineer, Machine Learning Engineer, Microelectronics Engineer, Power System Engineer, Project Manager, Research and Development Engineer, Robotics Engineer, Software Engineer, Sustainability Consultant, Telecommunications Engineer, VLSI Design Engineer, Wireless Communication Engineer.', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_051', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Possesses a Diploma in Engineering recognized by the Government of Malaysia and approved by the Senate of the University Malaya with a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics / Equivalent Subject.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain at least a grade of B in Mathematics and Physics
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject: Mathematics and Physics
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain at least a grade of B in Mathematical Methods and Physics
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics (T) and Physics
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain at least a grade of B in Mathematics and Physics
Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & Physics
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of 65% / grade B in the following subjects: Mathematics & (Physics/Engineering Physics)
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Mathematics & Physics
Additional Requirement
Candidates who apply for Bachelor of Electrical Engineering and Chemical Engineering must not be colour blind.
Candidates who apply must be physically fit, not suffering from any mental, mental health or physical illness and/or disabilities and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_051', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues* / Bahasa Melayu Komunikasi**
English Communication I
Appreciation of Ethics and Civilisations
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Engineering Mathematics 1
Engineering Mathematics 2
Chemical Process Principles I
Engineering Drawing
Physical and Analytical Chemistry
Chemical Engineering Thermodynamics I
Numerical Methods for Engineering
Fluid Mechanics I
Physical and Analytical Chemistry Laboratory
Basic Material Science for Chemical Engineering
English Communication II
Basic Entrepreneurship Enculturation
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Engineering Economics and Project Management
Chemical Process Principles II
Organic Chemistry
Chemical Engineering Thermodynamics II
Heat Transfer
Mass Transfer
Chemical Engineering Computing
Laboratory and Communications I
Separation Processes I
Reaction Engineering I
Biochemistry
Applied Statistics for Engineering
Law, Ethics and Sustainability for Engineers
Fluid Mechanics II
Modelling of Chemical Processes
Process Synthesis and Simulation
Separation Processes II
Laboratory and Communication II
Integrated Design Exercise
Process Control
Particle Technology
Process Safety and Loss Prevention
Reaction Engineering II
Integrated Design
Design of Process Equipment
Industrial Training
Co-Curriculum
University Elective Courses (Student Holistic Empowerment): Thinking Matters: Mind and Intellect
University Elective Courses (Student Holistic Empowerment): Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
University Elective Courses (Student Holistic Empowerment): Technology/Artificial Intelligence and Data Analytics: I-Techie
University Elective Courses (Student Holistic Empowerment): Global Issues and Community Sustainability: Making the World a Better Place
Design Project
Research Project
Sustainable Development in Engineering
Department Elective Courses: Elective Course I
Department Elective Courses: Elective Course II
Department Elective Courses: Elective Course III
Department Elective Courses: Elective Course IV
Department Elective Courses: Elective Course V
Note:
*Compulsory for Local Students
**Compulsory for International students
University Elective Courses
Student Holistic Empowerment Course (SHE)
Department Elective Courses (GENERAL )
Air Pollution Fundamental
Solid Waste Management
Waste Water Treatment
Petroleum Engineering
Membrane Technology and Processes
Nanotechnology for Energy Conversion and Storage
Technology, Globalization and Sustainable Development
Current Technologies in Oleochemicals Industry
Natural Gas Engineering
Department Elective Courses (ADVANCE)
Process Integration
Advanced Process Control
Adsorption in Porous Solid
Advanced Process Safety and Loss Prevention
Reaction Engineering for Bioreactors
Advanced Fluidization Engineering
Advanced Functional Materials
Chemical Decomposition Processes
Optimal Control
Materials Characterization', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_051', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Advanced Process Control Engineer, Advanced Process Safety Engineer, Air Quality Engineer, Biochemical Engineer, Chemical Engineer, Chemical Safety Engineer, Chemical Process Engineer, Chemical Research Scientist, Environmental Engineer, Materials Engineer, Nanotechnology Engineer, Petroleum Engineer, Process Design Engineer, Process Integration Engineer, Process Safety Consultant, Quality Control Engineer, Research and Development Engineer, Solid Waste Management Engineer, Sustainable Development Engineer, Waste Water Treatment Engineer, Water Resource Engineer.', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_060', 'ADMISSIONS', 'Entry Requirement', 'Local International
SPM / O-Level / Equivalent Subject Requirements:
Obtain at least a Grade B in the subject of English Language
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Not Offered
Diploma / Equivalent (Requirement 1)
Malaysian citizen
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
Diploma / Equivalent (Requirement 2)
Malaysian citizen
Possess a Basic Teaching Diploma from the Ministry of Education Malaysia with a minimum CGPA of 3.00./li>
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
Pass in the Basic Management Certificate, Ministry of Education Malaysia.
Have teaching experience in the field of English or have served in work involving English-related matters (such as language teaching, translation, language planning, terminology management, editing, and so on) for no less than three (3) years of experience.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
SPM / O-Level / Equivalent Subject Requirements:
Obtain at least a Grade B in the subject of English Language
For Gaokao Certification:
- Grade B in English Language; and
- TWO (2) Grade C in any other TWO (2) subjects
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects

English language requirements
MUET 5.0
IELTS (Academic) 7.0
TOEFL iBT (Centre-based) 96
TOEFL Essentials (Online) 10.0
Pearson Test of English (PTE Academic) 65
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 180', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_060', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / or Basic Malay Language*
Introduction to Linguistics
Understanding English Grammar
Effective Writing
Speaking and Presentation Skills
History of English
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Critical Reading
Phonetics and Phonology
Copyediting in English
English and the Performing Arts
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
Morphology and Syntax
World English''s
Computer Mediated Communication
Multimodal Discourse
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity and Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
Analyzing Spoken Discourse
Lexical Meaning
Intercultural Communication
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Co-curriculum
Introduction to Semantics and Pragmatics
Analyzing Text
Trends of English in the ASEAN Region
Language in Literary Texts
Academic Project Writing
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
English for Communication* or / Foreign Language Course
Final Year Project
English for Specific Purposes
Professional Communication
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
*Compulsory for International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE)- GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_060', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'English Language Teacher, Editor, Proofreader, Copywriter, Content Writer, Translator, Interpreter, Linguist, Speech Therapist Assistant, Communication Specialist, Public Relations Officer, Media Analyst, Journalist, News Writer, Scriptwriter, Technical Writer, Academic Researcher, Curriculum Developer, Lexicographer, Publishing Assistant, Social Media Manager, Corporate Trainer, Language Assessment Specialist, Advertising Executive, Education Consultant, Customer Service Executive, Policy Analyst, Voice-Over Artist, Transcriptionist.', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_054', 'ADMISSIONS', 'Entry Requirement', 'Local International
SPM / O-Level / Equivalent Subject Requirements:
Obtain at least a Grade C in the subject of Chinese Language / Chinese Literature
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Holds a Diploma from a Public University / IPTA / ILKA / Polytechnic / IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the Universiti Malaya, with a minimum CGPA of 3.00;
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) or 6 (SL) in TWO (2) subject
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
SPM / O-Level / Equivalent Subject Requirements:
Obtain at least a Grade C in the subject of Chinese Language
For Gaokao Certification:
- Grade B in Chinese Language; and
- ONE (1) Grade B and ONE (1) Grade C in Mathematics and Foreign Language
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects

English language requirements
MUET 5.0
IELTS (Academic) 7.0
TOEFL iBT (Centre-based) 96
TOEFL Essentials (Online) 10.0
Pearson Test of English (PTE Academic) 65
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 180', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_054', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistics
Chinese Language Competency
Phonetics and Phonology of Modern Chinese
Chinese Language and Poetry
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* or / Foreign Language Course
Research Methodology
Chinese Language Competency II
Morphosyntax of Modern Chinese Language
Linguistics Theories in the Context of the Chinese Language
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
Chinese Language Competency III
Translation Theories and Practices
Chinese Language for Mass Media
Chinese Language Text Analysis
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity and Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
Chinese Language Competency IV
Language and Chinese Society
Chinese Dialectology
Chinese Language for Advertising
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Co-curriculum
Introduction to Semantics and Pragmatics
Chinese Language Competency V
The History of Chinese Language
Chinese Language Varieties
Chinese Characters and Chinese Culture
Elective Courses: Faculty Course - Faculty Open Elective
English for Communication* or / Foreign Language Course
Final Year Project
Chinese Language Competency VI
Acquisition of Chinese as a Second Language
English Chinese Translation
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
*For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE) - GQX0056 Integrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_054', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Chinese Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, Media Analyst, Communication Officer, Public Relations Executive, Cultural Advisor, Academic Researcher, Curriculum Developer, Publishing Assistant, Language Consultant, Lexicographer, Subtitle Translator, Corporate Trainer, Social Media Manager, International Relations Officer, Tourism Officer, Embassy Staff, Customer Service Executive, Policy Analyst, Transcriptionist, Scriptwriter, Voice-Over Artist.', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_052', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Malaysian citizen
Obtain a minimum grade of Jayyid Jiddan
Obtain a minimum of grade Jayyid Jiddan in TWO (2) subjects
Diploma / Equivalent
Malaysian citizen
Possess a Diploma in the field of Arabic Language / Islamic Studies recognized by the Malaysian Government and approved by the Senate of the University of Malaya with a minimum CGPA of 3.00;
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
Basic Teaching Diploma
Malaysian citizen
Possess a Basic Teaching Diploma from the Ministry of Education Malaysia with a minimum CGPA of 3.00;
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
Pass in the Basic Management Certificate, Ministry of Education Malaysia.
Has teaching experience in the field of Arabic Language or has served in a job involving Arabic language matters (teaching, translation, language planning, terminology management, editing, etc.) for no less than three (3) years.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Not offered
AUSMAT
Not offered
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation / Foundation (not the current year)
Not offered
STAM (not the current year)
Malaysian citizen
Obtained at least a Jayyid Jiddan grade
Obtain a minimum of grade B- in TWO (2) subjects
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Additional Requirement
Obtained at least a Grade C in ONE (1) subject at the SPM level: Arabic Language, Advanced Arabic Language, Al-Lughah Al-Arabiah Al-Mu''asirah, Arabic Language Turath
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Grade C or higher in Arabic Language subject for Secondary Education (O-Level) or equivalent

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_052', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
Arabic Language Enrichment and Language Style
Reading and Writing 1
Listening and Speaking 1
Arabic Language for Media and IT
Functional Grammar 1
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Reading and Writing 2
Listening and Speaking 2
Functional Morphology 1
Functional Grammar 2
Arabic Philology
Introduction to Sociolinguistics
Functional Morphology 2
Functional Grammar 3
Ma’ani
Arabic Language for Communication and Tourism
Arabic Language for Religion and Education
Technology in Arabic Language Learning
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 Integrity and Anti-Corruption Course (KIAR)
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Functional Grammar 4
Bayan
Arabic Lexicography and Semantic
Dialects and Qira’at
Two-Way Arabic-Malay Translation 1
Linguistics of al-Quran and Hadith
Elective Courses: Faculty Course - Faculty Open Elective
Co-curriculum
Introduction to Semantics and Pragmatics
Functional Morphology 3
Badi’
Arabic Discourse Analysis
History of Grammatical and Rhetoric
Arabic Phonetic and Phonology
Choose TWO courses only: Elective Courses: Faculty Course - Arabic Language for Health and Sports
Elective Courses: Faculty Course - Arabic Language for Diplomatic and International Relation
Elective Courses: Faculty Course - Introduction to Arabic Psycho-sociolinguistics
Elective Courses: Faculty Course - Introduction to Arabic Language Learning
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
English for Communication* or / Foreign Language Course
Final Year Project
Prosody and Rhyme
Two-Way Arabic-Malay Translation 2
History of Arabic Literature
Arabic Language for Administration and Economy
Choose ONE course only: Elective Courses: Faculty Course - Analysis of Arabic Literature Text
Elective Courses: Faculty Course - Literary Criticism in Arabic Literature
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Industrial Training
Note:
*For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE)- GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective
Programme Elective Courses
Arabic Language for Health and Sports
Arabic Language for Diplomatic and International
Introduction to Arabic Psycho-sociolinguistics
Introduction to Arabic Language Learning
Analysis of Arabic Literature Text
Literary Criticism in Arabic Literature', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_052', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Arabic Language Teacher, Translator, Interpreter, Linguistic Researcher, Editor, Proofreader, Content Writer, Copywriter, Language Curriculum Developer, Lexicographer, Cultural Advisor, Foreign Language Analyst, Diplomatic Officer, Embassy Staff, Journalist, News Broadcaster, Subtitle Translator, Academic Lecturer, Arabic Calligraphy Artist, Publishing Assistant, Tourism Officer, Heritage And Cultural Officer, International Relations Officer, Religious Educator, Scriptwriter, Voice-Over Artist, Arabic Transcriptionist, Communication Specialist, Media Analyst.', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_055', 'ADMISSIONS', 'Entry Requirement', 'Local International
STPM
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
Matriculation / Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Stream: Art and Science stream
STAM
Not Offered
Diploma / Equivalent
Malaysian citizen
Holds a Diploma from a Public University / IPTA / ILKA / Polytechnic / IPTS or other qualifications recognized by the Government of Malaysia and approved by the Senate of the Universiti Malaya, with a minimum CGPA of 3.00;
Obtain a minimum of grade B- in TWO (2) subjects at the Diploma level.
UM SATU Foundation
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
GCE A-Level
Malaysian citizen
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in TWO (2) subjects
International Baccalaureate (IB)
Malaysian citizen
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in TWO (2) subjects
AUSMAT
Malaysian citizen
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in TWO (2) subjects
STPM (Not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Matriculation / Foundation (not the current year)
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
STAM (not the current year)
Not Offered
IPTS
Malaysian citizen
Obtain a minimum CGPA of 3.00
Obtain a minimum of grade B- in TWO (2) subjects
Additional Requirement
Obtain at least a Grade C in the subject of Tamil Language / Tamil Literature at the SPM level
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects.
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Grade C or higher in Tamil Language subject for Secondary Education (O-Level) or equivalent

English language requirements
MUET 3.5
IELTS (Academic) 5.0
TOEFL iBT (Centre-based) 40
TOEFL Essentials (Online) 7.5
Pearson Test of English (PTE Academic) 47
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_055', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / or Basic Malay Language*
Introduction to Linguistic
Tamil Language Competency I
Phonology of Modern Tamil
Tamil Language for Information Communication Technology
History of Tamil Language
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Tamil Competency II
Morphology of Modern Tamil
Tamil Language for Information Communication Technology II
Language, Society and Tamil Culture
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
Tamil Language Competency III
Syntax of Modern Tamil
Critical and Creative Thinking in Tamil
Tamil Language in Print Media Advertisement
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE)
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Tamil Language Competency IV
Tamil Text Analysis
Tamil Lexical Semantic
Tamil Language in Digital Media
Elective Courses: Faculty Course - Faculty Open Elective
Co-curriculum
Introduction to Semantics and Pragmatics
Tamil Competency V
Academic Genres and Research Fields in Tamil
Translation Theories and Practices
Tamil Language in Digital Marketing
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
English for Communication* / or Foreign Language Course
Final Year Project
Tamil Language Competency VI
Tamil Dialects
Translation in Specific Field
Language and Tamil Civilization
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
*For International Students', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_055', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Tamil Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, News Reporter, Scriptwriter, Media Analyst, Communication Officer, Public Relations Executive, Academic Researcher, Curriculum Developer, Publishing Assistant, Language Consultant, Lexicographer, Subtitle Translator, Social Media Manager, Cultural Advisor, Tourism Officer, Embassy Staff, Voice-Over Artist, Transcriptionist, Education Officer, Corporate Trainer, Policy Writer.', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_053', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Candidates must be physically fit, not suffering from any mental or physical illness, and able to follow the programme of study designed for this course.

English language requirements
Grade B or higher in English subject for Secondary Education (O-Level) or equivalent
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency – minimum 160', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_053', 'CURRICULUM', 'Programme Structure', 'Year 1 - Year 3
Year 1 - Year 3 Analyzing Texts in Japanese
Appreciation of Ethics and Civilisations
Basic Entrepreneurship Enculturation
Basic Malay Language *
Co-Curriculum
Didactics of Japanese Language Skills
English for Communication
Faculty Open Elective
Final Year Project
Integrity and Anti-Corruption Course
Introduction to Linguistic
Introduction to Semantics and Pragmatics
Japanese for Communication and Tourism
Japanese Language and Civilization
Japanese Language for Business and Administration
Japanese Language Reading Skills
Japanese Language Skills Level I
Japanese Language Skills Level II
Japanese Language Skills Level III
Japanese Language Skills Level IV
Japanese Language Skills Level V
Japanese Language Skills Level VI
Japanese Language Writing Skills I
Japanese Language Writing Skills II
Japanese Phonetics and Phonology
Language Acquisition
Language in Technology and New Media
Morphosyntax of Japanese Language
Philosophy and Current Issues
Research Methodology
Student Holistic Empowerment Course (SHE)
Two-Way Translation in Japanese
Note:
*For International Students', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_053', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Japanese Language Teacher, Translator, Interpreter, Content Writer, Copywriter, Editor, Proofreader, Subtitle Translator, Academic Researcher, Curriculum Developer, Publishing Assistant, Language Consultant, Lexicographer, Cultural Advisor, Communication Officer, Public Relations Executive, Corporate Trainer, International Relations Officer, Tourism Officer, Embassy Staff, Customer Service Executive, Media Analyst, Journalist, Scriptwriter, Voice-Over Artist, Transcriptionist, Education Officer, Localization Specialist.', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_056', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Candidates must be physically fit, not suffering from any mental or physical illness, and able to follow the programme of study designed for this course.

English language requirements
Grade B or higher in English subject for Secondary Education (O-Level) or equivalent
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency – minimum 160', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_056', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
French Language Skills Level I
French Language Skills Level II
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* or Foreign Language Course
Research Methodology
French Language Skills Level III
French Language Skills Level IV
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
1. Introduction to Sociolinguistics
2. French Language Skills Level V
3. French Language Skills Level VI
4. French Language Reading Skills
5. French Language Listening and Speaking Skills
6. Elective Courses: Faculty Course - Faculty Open Elective
7. Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And
8. Appreciation of Ethics and Civilisations
9. Language Acquisition
10. Language in Technology and New Media
11. Phonetics and Phonology of French
12. French Language and Civilization
13. French Language Writing Skills I
14. Elective Courses: Faculty Course - Faculty Open Elective
15. Elective Courses: Faculty Course - Faculty Open Elective
1. Co-curriculum
2. Introduction to Semantics and Pragmatics
3. Morphosyntax of French Language
4. French Language and Literature
5. French Language Writing Skills II
6. Analyzing Texts in French
7. Didactics of French Language Skills
8. Elective Courses: Faculty Course - Faculty Open Elective
9. English for Communication* / or Foreign Language Course
10. Final Year Project
11. Two-Way Translation in French
12. French for Communication and Tourism
13. French Language for Administration and Business
14. Elective Courses: Faculty Course - Faculty Open Elective
15. Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
* For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE) - GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_056', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'French Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, Subtitle Translator, Communication Officer, Public Relations Executive, Media Analyst, Academic Researcher, Curriculum Developer, Language Consultant, Lexicographer, Publishing Assistant, Cultural Advisor, International Relations Officer, Embassy Staff, Tourism Officer, Corporate Trainer, Education Officer, Voice-Over Artist, Transcriptionist, Localization Specialist, Customer Service Executive, Scriptwriter.', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_057', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Candidates must be physically fit, not suffering from any mental or physical illness, and able to follow the programme of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency – minimum 160', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_057', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
German Language Skills Level I
German Language Skills Level II
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication*/ or Foreign Language Course
Research Methodology
German Language Skills Level III
German Language Skills Level IV
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
German Language Skills Level V
German Language Skills Level VI
German Language Reading Skills
Jerman/German Language Listening and Speaking Skills
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
German Phonetics and Phonology
German Language and Civilization
German Language Writing Skills I
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of German Language
German Language and Literature
German Language Writing Skills II
Analyzing Texts in German
Didactics of German Language Skills
Elective Courses: Faculty Course - Faculty Open Elective
English for Communication* / or Foreign Language Course
Final Year Project
Two-Way Translation in German
German for Communication and Tourism
German Language for Business and Administration
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
* For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE) - GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_057', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'German Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, Subtitle Translator, Communication Officer, Public Relations Executive, Media Analyst, Academic Researcher, Curriculum Developer, Language Consultant, Lexicographer, Publishing Assistant, Cultural Advisor, International Relations Officer, Embassy Staff, Tourism Officer, Corporate Trainer, Education Officer, Voice-Over Artist, Transcriptionist, Localization Specialist, Customer Service Executive, Scriptwriter.', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_058', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Candidates must be physically fit, not suffering from any mental or physical illness, and able to follow the programme of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency – minimum 160', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_058', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
Spanish Language Skills Level I
Spanish Language Skills Level II
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Spanish Language Skills Level III
Spanish Language Skills Level IV
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
Spanish Language Skills Level V
Spanish Language Skills Level VI
Spanish Language Reading Skills
Spanish Language Listening and Speaking Skills
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And Anti-Corruption Course
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Spanish Phonetics and Phonology
Spanish Language and Civilization
Spanish Language Writing Skills I
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of Spanish Language
Spanish Language and Literature
Spanish Language Writing Skills II
Analyzing Texts in Spanish Language
Didactics of Spanish Language Skills
Elective Courses: Faculty Course - Faculty Open Elective
English for Communication*/ or Foreign Language Course
Final Year Project
Two-Way Translation in Spanish
Spanish for Communication and Tourism
Spanish Language for Administration and Business
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
* For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE) - GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_058', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Spanish Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, Subtitle Translator, Scriptwriter, Communication Officer, Public Relations Executive, Media Analyst, Academic Researcher, Curriculum Developer, Language Consultant, Lexicographer, Publishing Assistant, Cultural Advisor, International Relations Officer, Embassy Staff, Tourism Officer, Education Officer, Corporate Trainer, Customer Service Executive, Voice-Over Artist, Transcriptionist, Localization Specialist.', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_059', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) subjects
Matriculation/Foundation
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognised institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) subjects
Additional Requirement
Candidates must be physically fit, not suffering from any mental or physical illness, and able to follow the programme of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency – minimum 160', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_059', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / or Basic Malay language*
Introduction to Linguistic
Italian Language Skills Level I
Italian Language Skills Level II
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Italian Language Skills Level III
Italian Language Skills Level IV
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Introduction to Sociolinguistics
Italian Language Skills Level V
Italian Language Skills Level VI
Italian Language Reading Skills
Italian Language Listening and Speaking Skills
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And Anti-Corruption Course
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Italian Phonetics and Phonology
Italian Language and Civilization
Italian Language Writing Skills I
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of Italian Language
Italian Language and Literature
Italian Language Writing Skills II
Analysing Texts in Italian Language
Didactics of Italian Language Skills
Elective Courses: Faculty Course - Faculty Open Elective
English for Communication*/ or Foreign Language Course
Final Year Project
Two-Way Translation in Italian
Italian for Communication and Tourism
Italian for Administration and Business
Elective Courses: Faculty Course - Faculty Open Elective
Elective Courses: Faculty Course - Faculty Open Elective
Industrial Training
Note:
* For International Students
University Elective Courses
Student Holistic Empowerment Course (SHE)
University Elective Courses
Student Holistic Empowerment Course (SHE) - GQX0056 Intergrity And Anti-Corruption Course (KIAR)
Programme Elective Courses
Faculty Open Elective', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_059', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Italian Language Teacher, Translator, Interpreter, Editor, Proofreader, Content Writer, Copywriter, Journalist, Subtitle Translator, Scriptwriter, Communication Officer, Public Relations Executive, Media Analyst, Academic Researcher, Curriculum Developer, Language Consultant, Lexicographer, Publishing Assistant, Cultural Advisor, International Relations Officer, Embassy Staff, Tourism Officer, Education Officer, Corporate Trainer, Customer Service Executive, Voice-Over Artist, Transcriptionist, Localization Specialist.', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_065', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade B in FIVE (5) of the following subjects: English, Biology, Chemistry, Physics & Mathematics / Additional Mathematics
Senior High School Certificate
Pass with a minimum average of 85% of two (2) Grade A and one (1) Grade B (AAB) in the following three (3) subjects: Biology 80% (A) / 65% (B)
Chemistry 80% (A) / 65% (B)
Physics / Mathematics 80% (A) / 65% (B)
Matriculations/Foundations
Pass with a minimum average of 85% of two (2) Grade A and one (1) Grade B (AAB) in the following three (3) subjects: Biology 80% (A/A-)
Chemistry 80% (A/A-)
Physics / Mathematics 80% (A/A-)
GCE A-Level
Obtain a GCE A-Level with a minimum of two (2) Grade A and one (1) Grade B (AAB) in the following three (3) subjects: Biology(A/B)
Chemistry(A/B)
Physics / Mathematics(A/B)
International Baccalaureate (IB)
Obtain a minimum score of 36 points Biology -6 (HL)
Chemistry - 6 (HL)
Physics / Mathematics - 6(HL)
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR) Biology (B)
Chemistry (B)
Physics / Mathematics (B)
Additional Requirement
Interview are required for this course
Test are required for this course
Certified healthy from serious physical disabilities and mental illness (exceptions may be given to candidates who have physical disabilities that can be corrected and / or do not prevent candidates from conducting clinical activities required by medical practitioners)
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('UM_BACHELOR_065', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Enculturation
Anatomy and Physiology
Microbiology and Basic Immunology
Basic Pharmaceutical Chemistry
Pharmaceutical Organic Chemistry
Principles of Drug Actions
Introduction to Pharmacotherapy
English for Communication or Foreign Language Course**
Philosophy and Current Issue or Basic Malay Language Communication*
Biochemistry
Physical Pharmacy
Pharmacotherapy for Bacterial Infections
Pharmacotherapy for Respiratory and Gastrointestinal Disorders
Pharmacognosy
University Elective Courses: Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And Anti-Corruption Course (Note: For Local Student Only)
English for Communication or Foreign Language Course**
Appreciation of Ethics and Civilizations
Pharmaceutical Analysis
Pharmaceutical Dosage Form Design for Liquids and Semisolids
Medicinal Chemistry
Pharmacotherapy for Immune Disorders
Pharmacotherapy for Fungal and Viral Infections
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Elective Courses: Program Elective Courses
Co-curriculum
Chromatography, Electrochemistry and Radiochemistry
Sterile Pharmaceutical Dosage Form Design
Pharmacotherapy for Cardiovascular Disorders
Pharmacotherapy for Psychiatric and Neurological Disorders
Solid Pharmaceutical Dosage Form Design
Clinical Toxicology
Elective Courses: University Courses: Student Holistic Empowerment Course (SHE)
Co-curriculum
Pharmacotherapy for Endocrine Disorders
Ethics and Legislation in Pharmacy
Extemporaneous Preparations
Pharmacoepidemiology and Evidence-Based Pharmacotherapy
Pharmaceutical Biotechnology and Personalized Medicine
Pharmacotherapy for Cancer, Pain and Renal Disorders
Drug Discovery and Development
Community Pharmacy Practice
Hospital Pharmacy Practice
Principles and Applications of Pharmacokinetics
Pharmacotherapy for Specific Population
Research Project I
Advanced Pharmaceutical Dosage Form Design
Pharmacoeconomics
Management Skills for Pharmacists
Clinical Clerkship I
Research Project II
Industrial Pharmacy and Regulatory Control
Clinical Clerkship II
Program Elective Courses: Program Elective
Note:
*For International students only
**Student with MUET band 5 and 6 are given the option to choose either to enroll for English Communication Course or Foreign Language Course
University''s Course
Student Holistic Empowerment Course (SHE) - GQX0056 Integrity And Anti-Corruption Course (KIAR)
University''s Course
Student Holistic Empowerment Course (SHE)
Programme Elective Courses
Pharmacoinformatics
Nutrition and Health Supplement
Pharmaceutical Microbiology
Traditional and Complementary Medicine
Cosmetic Products
Emerging Topics in Pharmacy', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('UM_BACHELOR_065', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Community Pharmacist, Hospital Pharmacist, Clinical Pharmacist, Industrial Pharmacist, Regulatory Affairs Officer, Pharmaceutical Sales Representative, Research Scientist, Quality Control Analyst, Drug Safety Associate, Pharmacovigilance Officer, Academic Lecturer, Medical Science Liaison, Formulation Scientist, Production Pharmacist, Compounding Pharmacist, Public Health Pharmacist, Clinical Trials Coordinator, Healthcare Consultant, Toxicologist, Pharmacy Benefits Analyst.', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('UM_BACHELOR_066', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Chemistry
Obtain a minimum of 60% / grade B- in any ONE (1) of the following subjects: Biology, Physics, Mathematics
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Chemistry
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology, Physics, Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Chemistry
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology, Physics, Mathematics, Further Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Chemistry
Obtain a minimum of grade B in any ONE (1) of the following subjects: Biology, Physics, Mathematics, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Chemistry
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Biology, Physics, Mathematics, Further Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Chemistry
Obtain a minimum of grade B in any ONE (1) of the following subjects: Biology, Physics, Chemistry, Mathematics, Further Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_066', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Philosophy and Current Issues / Basic Malay Language*
English Language / Foreign Language**
Science, Technology & Society
Statistics
Principles of Chemistry
Organic Chemistry I
Safety and Basic Laboratory Techniques
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Appreciation of Ethics and Civilizations
English Language / Foreign Language**
Basic Entrepreneurship Enculturation
Co-Curriculum
Inorganic Chemistry I
Physical Chemistry I
Mathematics in Chemistry
Laboratory Skills
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul
Inorganic Chemistry II
Practical of Inorganic Chemistry II
Organic Chemistry II
Practical of Organic Chemistry II
Computer Programming for Sciences
Spectroscopic Methods in Organic Chemistry
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Techie
Co-Curriculum
Basic Analytical Chemistry
Molecular Spectroscopy
Physical Chemistry II
Practical of Chemistry II
Chemistry and Society
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Inorganic Chemistry III
Practical of Inorganic Chemistry III
Research Project (Progressive) - OPTION 1
Elective Courses: Program Elective***
Organic Chemistry III
Practical of Organic Chemistry III
Physical Chemistry III
Practical of Physical Chemistry III
Research Project (Progressive) - OPTION 1
Elective Courses: Program Elective***
Industrial Training - OPTION 1
Elective Courses: Program Elective***
Note:
*For non-Malaysian. **Student whose native language is English.
***Elective courses should be selected according to the packages below.
Programme Elective Courses should be selected according to the packages below (Pure Chemistry or Applied Chemistry Packages)
For Minor Package courses offered please refer to UMSItS Guide via this link: https://umsitsguide.um.edu.my/
Elective Course
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology / Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
Programme Elective Courses
(Pure Chemistry Packages)
Advanced Analytical Chemistry
Polymer Chemistry
Heterocyclic and Medicinal Chemistry
Electrochemistry
Environmental Chemistry
Natural Products and Biosynthesis
Organic Synthesis
Mechanistic Organic Chemistry
Physical Organic Chemistry
Bioinorganic Chemistry
Nuclear Chemistry
Materials Chemistry
Chemometrics
Computational Chemistry
Colloid Chemistry
Programme Elective Courses
(Applied Chemistry Package)
Chemometrics***
Computational Chemistry***
Colloid Chemistry***
Analytical Chemistry and Instrumentation***
Industrial Chemistry
Industrial Polymer Chemistry***
Oleochemistry
Petrochemistry
Process Chemistry
Food Chemistry
Natural Products and Biotechnological Processes
Applied Electrochemistry
Catalysis
Quality Assurance in Chemical Laboratory
Environmental Pollution and Waste Management***
Liquid Crystals', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_066', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Community Pharmacist, Hospital Pharmacist, Clinical Pharmacist, Industrial Pharmacist, Regulatory Affairs Officer, Pharmaceutical Sales Representative, Research Scientist, Quality Control Analyst, Drug Safety Associate, Pharmacovigilance Officer, Academic Lecturer, Medical Science Liaison, Formulation Scientist, Production Pharmacist, Compounding Pharmacist, Public Health Pharmacist, Clinical Trials Coordinator, Healthcare Consultant, Toxicologist, Pharmacy Benefits Analyst.', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_067', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Biology
Obtain a minimum of 60% / grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Biology
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_067', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Language / Foreign Language**
Appreciation of Ethics and Civilizations
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Cell Biology
Introduction to Computer Programming in Bioinformatics
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
English Language / Foreign Language**
Philosophy and Current Issues (local students) / Malay Language Communication*
Co-Curriculum
Statistics
Bioethics and Safety
Environmental Sustainability
Bioinformatics Concepts
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Plant Diversity
Vertebrate Biology
Phycology
Protozoa and Invertebrate I
Elective Courses: Program (EP): Urban Zoology
Terrestrial Ecology
Plant Physiology
Key Issues in Climate Change
Ecosystem-based Management
Principles of Systematics
Mycology
Invertebrate II
Bioinformatics Data Management
Elective Courses: Program (EP): Introductory Microbiology
Aquatic Ecology
Animal Physiology
Renewable Energy Transition and Society
Green Agriculture
Sustainable Food Systems
Research Project for Ecology and Biodiversity
Behavioral Ecology and Ethology
Quantitative Ecology
Biological Data Analytics
Elective Courses: Program (EP): Economic Botany
Ecology and Management of Weeds
Parasitology
Economic Entomology
Aquaculture Biotechnology
Research Project for Ecology and Biodiversity
Population and Community Ecology
Scientific Communication
Molecular Ecology and Applications
Elective Courses: Program (EP): Plant Pathology
Horticulture and Landscape
Integrated Pest Management
Ecotoxicology
Slope Eco-engineering Techniques
Biodiversity Governance and Conservation
Nature and Society
Elective Courses: Program (EP): Soil Ecology and Management
Fisheries Ecology and Management
Ecotourism
Bioimage Processing and Analysis
Population Genetics
Industrial Training for Ecology and Biodiversity
Note:*Only for international students; **Student whose native language is English', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_067', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Ecologist, Conservation Biologist, Environmental Consultant, Wildlife Biologist, Park Ranger, Natural Resource Manager, Environmental Educator, Biodiversity Researcher, Marine Biologist, Field Technician, Environmental Policy Analyst, Ecotourism Guide, Habitat Restoration Specialist, Forestry Officer, Zoologist, Environmental Impact Assessor, Sustainability Officer, GIS Analyst, Climate Change Analyst, Academic Researcher', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_068', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Physics and Mathematics/Further Mathematics
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Physics and Mathematics
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology, Physics, Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Physics and Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Physics and Mathematics/Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Physics and Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Physics and Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_068', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Ethical appreciation and civilization
Co-Curriculum
English 1
Thermal Physics
Electronics I
Practical Physics 1
Vibrations and Waves
Mathematical Methods I
Basic Entrepreneurship Culture
Philosophy & Current Issue (Local students) / Malay Language Communication (only for international students)
Co-Curriculum
English 2
Quantum Physics
Mathematical Methods II
Statistics
Electronic Practical or Physics Practical II or Applied Physics Practical
Science, Technology and Society
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Mechanics I
Quantum Mechanics I
Electromagnetism I
Electronics Practical or Physics Practical II or Applied Physics Practical
Mathematical Methods III
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Electromagnetism II
Statistical Physics
Numerical and Computational Methods
Electronics Practical or Physics Practical II or Applied Physics Practical
Mechanics II
Optics
Elective Courses: Program Elective
Nuclear Physics
Solid State State Physics
Elective Courses: Program Elective
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Atomic Molecular Physics
Physics for Work
Elective Courses: Program Elective
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Project
Industrial Training
Note: ** Minor package
(1) Students are required to complete a minimum of 18 credits under the same minor package in order to be displayed on the transcript.
(2) For further information, student can refer to UMSItS Guide via this link: https://umsitsguide.um.edu.my
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
PROGRAM ELECTIVE COURSES or/and MINOR PACKAGE ** (30 credits)
Modern Optics and Laser Physics S
Photonics
Astrophysics
Materials Science
Radiation Physics
Gas Discharge Physics
Electronics II
Digital Electronics
Optoelectronics
Elementary Particle Physics
Condensed Matter Physics
Plasma Physics and Technology
Quantum Mechanics II
Computational Physics
Semiconductor Devices
Quantum Optics and Technology
Cosmology and General Relativity', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_068', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Physicist, Research Scientist, Data Analyst, Laboratory Technician, Radiation Safety Officer, Medical Physicist, Physics Lecturer, Instrumentation Engineer, Aerospace Technician, Systems Analyst, Renewable Energy Specialist, Quality Control Analyst, Meteorologist, Software Developer, Geophysicist, Nanotechnology Researcher, Optical Engineer, Materials Scientist, Technical Consultant, Scientific Writer', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_076', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60% / grade B- in Biology
Obtain a minimum of 60% / grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Biology
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_076', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Language / Foreign Language**
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Bioinformatics Concepts
Introduction to Computer Programming in Bioinformatics
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
English Language / Foreign Language**
Philosophy and Current Issues (local students) / Malay Language Communication*
Co-Curriculum
Statistics
Bioethics and Safety
Environmental Sustainability
Analytical Environmental Chemistry
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Appreciation of Ethics and Civilizations
Principles of Waste Management
Soil Science and Community
Elective Courses: Program (EP): Environmental Health and Safety
Environmental Forensics
Environmental Risk Assessment and Management
Key Issues in Climate Change
Ecosystem-Based Management
Energy Saving Culture
Water Management
Bioinformatics Data Management
Environmental Monitoring
Applied Ecology
Research Methods and Scientific Writing
Elective Courses: Program (EP): Environmental Governance
Environmental Informatics
Renewable Energy Transition and Society
Air Pollution Control
Disaster Management
Organisms and Environment
Aquatic Ecology
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Environmental Management System
Integrated Waste Management
Environmental Management Research Project (P)
Introduction to Administrative Management
Elective Courses: Program (EP): Technology and Management of Hazardous Waste
Tourism and Environment
Introduction to Bioremediation
Environmental Well-Being
Sustainable Food Systems
Industrial Training (P)
Industrial Training (P)
Note: *Only for International students.
**Student whose native language is English.', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_076', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Environmental Consultant, Sustainability Officer, Environmental Scientist, Conservation Officer, Waste Management Specialist, Environmental Health and Safety Officer, Climate Change Analyst, Environmental Compliance Inspector, Natural Resource Manager, Environmental Policy Analyst, Renewable Energy Consultant, Environmental Educator, Ecologist, Water Resource Specialist, Air Quality Analyst, Environmental Impact Assessor, Corporate Social Responsibility (CSR) Manager, Green Building Consultant, Environmental Auditor, GIS Analyst (Environmental Applications).', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_069', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics and Geography
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics, Further Mathematics and Geography
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics, Further Mathematics and Geography
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics, Further Mathematics and Geography
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Physics, Chemistry, Mathematics, Further Mathematics and Geography
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics, Further Mathematics and Geography
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_069', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
Co-Curriculum
English Language
Statistics
Introduction to the Earth
Earth Surface Processes
Geological Structures and Maps
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Philosophy and Current Issues / Malay Language Communication*
Co-Curriculum
English Language
Science, Technology and Society
Computer Programming for the Sciences
Mineralogy
Fundamentals of Field Geology
Safety and Geology Code of Practice
Appreciation of Ethics and Civilizations
Applied Geology Field Course
Structural Geology
Sedimentology
Igneous and Metamorphic Petrology
Introduction to Geophysics
Applied Geology Field Course
Paleontology
Geology and Community
Geochemistry
GIS Applications in Geosciences
Geology Laboratory Analytical Techniques
Mineral Resources
Geology of Malaysia
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Elective Courses: Program Elective
Geology Research Project
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Elective Courses: Program Elective
Geology Research Project
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Elective Courses: Program Elective
Industrial Attachment
Note: **Minor package
(1) Students are required to complete a minimum of 18 credits under the same minor package in order to be displayed on the transcript.
(2) For further information, student can refer to UMSItS Guide via this link : https://umsitsguide.um.edu.my/
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology / Artificial Intelligence and Data Analytics: i-Technie
Global Issues and Community Sustainability: Making the World a Better Place
PROGRAM ELECTIVE COURSES or/and MINOR PACKAGE ** (32 CREDITS)
Choose from all elective courses or/and Minor Packages that are offered
LEVEL 2
Geological Data Analysis
Marine Geology
Karst Geomorphology and Conservations
Climate Change and Adaptation
Engineering Geology
Earth Water Resources
Environmental Geology
LEVEL 3
Advanced Geophysics
Geohazard
Quaternary Geology
Stratigraphic Methods
Geology of South East Asia
Petroleum Geology
Organic Petrology
Industrial Minerals
Tectonics and Earth History
Mineral and Mining Exploration
Geological Site Investigation
Unconventional Oil and Gas Resources
Basic Mathematics
Calculus I', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_069', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Geologist, Hydrogeologist, Engineering Geologist, Environmental Geologist, Petroleum Geologist, Mining Geologist, Geophysicist, Geological Consultant, Seismologist, Exploration Geologist, Geotechnical Engineer, Soil Scientist, Remote Sensing Specialist, GIS Analyst, Natural Resource Manager, Groundwater Consultant, Environmental Consultant, Drilling Engineer, Geological Surveyor, Earth Science Educator.', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_070', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in the following subjects: Biology, Chemistry
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in the following subjects: Biology, Chemistry
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in the following subjects: Biology, Chemistry
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in the following subjects: Biology, Chemistry
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in the following subjects: Biology, Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in the following subjects: Biology, Chemistry
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_070', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Enculturation
English Language / Foreign Language**
Co-Curriculum
Science, Technology and Society
Bioethics and Safety
Biochemistry of Cells
Principles of Biochemical Techniques
Elective Courses: SHE Cluster 4 - Global Issues and Community Sustainability: Making the World a Better Place
Philosophy and Current Issues / Malay Language Communication*
English Language / Foreign Language**
Co-Curriculum
Statistics
Fundamentals of Chemistry
Introduction to Computational Biology
Basic Physics
Elective Courses: SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Appreciation of Ethics and Civilizations
Structure and Function of Biomolecules
Metabolism and Regulation of Carbohydrate and Lipids
Protein Biochemistry
Practical Biochemistry I
Elective Courses: Program (EP): Nutritional Biochemistry
Toxicology
Functional Anatomy and Physiology
Metabolism and Regulation of Amino Acids and Nucleotides
Molecular Biology
Enzymes: Mechanism and Control
Biochemistry Practical II
Scientific and Research Communication
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Elective Courses: Program (EP): Toxicology
Food Process Biochemistry
Microbial Biochemistry
Research Project in Biochemistry
Membrane Biochemistry and Cell Signaling
Advanced Molecular Biology
Elective Courses: Program (EP): Biochemistry of Hormones
Natural Product Biochemistry and Drug Discovery
Fundamentals of Biochemical Pharmacology
Structural Biology Techniques
Epigenetics and RNA Biology
Research Project in Biochemistry
Clinical Biochemistry and Physiology
Cellular and Molecular Immunology
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Elective Courses: Program (EP): Post-Genomic Technologies and Bioinformatics
Biochemistry of Cancer
Neurochemistry
Design Thinking and Knowledge Transfer
Elective Courses: Program (EP): Plant Molecular Biology
Natural Product Biochemistry and Drug Discovery
Glycobiology
Computational Biochemistry
Fundamentals of Biochemical Pharmacology
Structural Biology Techniques
Epigenetics and RNA Biology
Note:
*Only for international students
**Student whose native language is English', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_070', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Biochemist, Biomedical Scientist, Clinical Research Associate, Laboratory Technician, Pharmaceutical Scientist, Toxicologist, Geneticist, Research Scientist, Biotechnology Consultant, Forensic Scientist, Quality Control Analyst, Food Safety Analyst, Molecular Biologist, Microbiologist, Environmental Scientist, Medical Science Liaison, Health and Safety Officer, Science Communicator, Regulatory Affairs Specialist, Academic Researcher.', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_071', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in Mathematics
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) other subject that has not yet been taken
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any ONE (1) of the following subjects: Biology / Physics / Chemistry / Mathematics / Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Mathematics/Further Mathematics
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Biology / Physics / Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology / Physics / Chemistry
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-of-mathematics', '2026-10-14T05:47:05.825Z'),
    ('UM_BACHELOR_071', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Courses (subject to MUET bands)
Philosophy and Current Issues / Malay Language Communication*
Statistics
Basic Mathematics
Calculus I
Fundamentals of Computing
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul
English Courses (subject to MUET bands)
Appreciation of Ethics and Civilizations
Science, Technology and Society
Ordinary Differential Equations
Calculus II
Fundamentals of Spreadsheets
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect Integrity and Anti-Corruption
Basic Entrepreneurship Culture
Co-Curriculum
Probability and Statistics I
Advanced Calculus
Linear Algebra
Appreciation of Mathematics
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Foundations of Data Science
Introduction to Analysis
Complex Variables
Numerical Computation
Structured Programming
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Introduction to Combinatorics
Algebra I
Basic Operations Research
Partial Differential Equations
Elective Courses: Elective Courses 1
Elective Courses: Elective Courses 2
Elective Courses: Elective Courses 3
Elective Courses: Elective Courses 4
Elective Courses: Elective Courses 5
Elective Courses: Elective Courses 6
Elective Courses: Elective Courses 7
Elective Courses: Elective Courses 8
Elective Courses: Elective Courses 9
Industrial Training
Note: *Only for international students.
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology / Artificial Intelligence and Data Analytics: i-Technie
Global Issues and Community Sustainability: Making the World a Better Place
PROGRAMME ELECTIVE COURSES
Geometry
Systems of Ordinary Differential Equations
Optimization Techniques
Graph Theory
Combinatorial Mathematics
Number Theory
Advanced Linear Algebra
Matrix Theory
Algebra II
Ring Theory
Group Theory
Differential Geometry
Topology
Complex Analysis
Real Analysis
Mathematical Science Project
Cryptography
Introduction to Accounting
Microeconomics
Macroeconomics
Financial Mathematics and Derivatives
Probability and Statistics II', 'https://study.um.edu.my/bachelor-of-science-of-mathematics', '2026-10-14T05:47:05.825Z'),
    ('UM_BACHELOR_071', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Data Analyst, Statistician, Actuary, Financial Analyst, Operations Research Analyst, Mathematician, Risk Analyst, Quantitative Analyst, Data Scientist, Market Research Analyst, Software Developer, Cryptographer, Investment Analyst, Business Analyst, Research Scientist, Machine Learning Engineer, Economist, Systems Analyst, Academic Lecturer, Algorithm Developer.', 'https://study.um.edu.my/bachelor-of-science-of-mathematics', '2026-10-14T05:47:05.825Z'),
    ('UM_BACHELOR_072', 'ADMISSIONS', 'Entry Requirement', 'SPM / O-Level / Equivalent Subject Requirements:
Obtain at least Grade C in Mathematics ; and
Obtain at least Grade C in any ONE (1) of the following subjects: Biology / Chemistry / Physics; and
Obtain at least Grade C in any ONE (1 ) other subject that has not yet been taken
Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in Biology
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Chemistry / Physics / Mathematics /
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Chemistry / Physics / Mathematics / Further Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Chemistry / Physics / Mathematics / Further Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Biology
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Chemistry / Physics / Mathematics / Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Biology
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Chemistry / Physics / Mathematics / Further Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology, Physics, Chemistry, Mathematics/Further Mathematics

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_072', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Enculturation
English Language / Foreign Language**
Co-Curriculum
Science, Technology and Society
Cell Biology
Biochemistry of Cells
Fundamental Techniques in Biological Sciences
Philosophy and Current Issues / Malay Language Communication*
English Language / Foreign Language**
Co-Curriculum
Statistics
Fundamentals of Chemistry
Basic Physics
Introduction to Computer Programming in Bioinformatics
Appreciation of Ethics and Civilizations
Structure and Function of Biomolecules
Nutritional Biochemistry
Applied Microbiology
Higher Plant Physiology
Bioinformatics Data Management
Public Speaking and Oral Speaking
Enzymes: Mechanism and Control
Bioprocess Design Principles
Plant Biotechnology
Plant Cell and Tissue Culture
Scientific Writing
Concepts of Genetic Engineering
Elective Courses: SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Biological Data Analytics
Research Project in Biotechnology
Elective Courses: Program (EP): Choose from: Animal Nutrition and Feed Technology
Fermentation and Product Recovery
Marine Biotechnology
Plant Genetics and Breeding
Secondary Metabolites and Metabolomics
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Food Biotechnology
Research Project in Biotechnology
Elective Courses: Program (EP): Choose from: Cellular and Molecular
Aquaculture Biotechnology
Post-Harvest Process Engineering and Technology
Sustainable Food Systems
Animal Cell and Tissue Culture
Enzyme Technology
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Design Thinking and Knowledge Transfer
Bioproduct Business and Supply Chain
Elective Courses: Program (EP): Choose from: Animal Physiology
Applied Genomics in Animal Breeding
Environmental Biotechnology
Microbial Technology for Soil and Plant Health
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training in Biotechnology
SPECIAL SEMESTER
Industrial Training in Biotechnology
Note:
*Only for international students
**Student whose native language is English', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_072', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Biotechnologist, Research Scientist, Biomedical Scientist, Genetic Counselor, Pharmaceutical Scientist, Quality Control Analyst, Bioprocess Engineer, Clinical Research Coordinator, Environmental Biotechnologist, Molecular Biologist, Food Technologist, Bioinformatics Specialist, Regulatory Affairs Specialist, Laboratory Technician, Biomanufacturing Specialist, Agricultural Biotechnologist, Forensic Scientist, Medical Scientist, Science Communicator, Biotech Sales Specialist.', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_073', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 75%
Obtain a minimum of 60%/grade B- in Mathematics
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Matriculations/Foundations
Obtain a minimum CGPA of 3.50 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Diploma
Obtain a minimum CGPA of 3.50 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) other subject that has not yet been taken
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any ONE (1) of the following subjects: Biology / Physics / Chemistry / Mathematics / Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 34 points
Obtain at least Grade 5 (HL) / 6 (SL) in Mathematics/Further Mathematics
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Biology / Physics / Chemistry / Mathematics / Further Mathematics
AUSMAT
Obtain a minimum score of 85 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology / Physics / Chemistry / Mathematics / Further Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_073', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Courses (subject to MUET bands)
Philosophy and Current Issues / Malay Language Communication*
Basic Entrepreneurs Culture
Basic Mathematics
Calculus I
Statistics
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
English Courses (subject to MUET bands)
Appreciation of Ethics and Civilizations
Co-Curriculum
Introduction to Accounting
Calculus II
Probability and Statistics I
Science, Technology and Society
Structured Programming
Microeconomics
Financial Mathematics and Derivative
Probability and Statistics II
Foundations of Data Science
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Advanced Calculus
Linear Algebra
Appreciation of Mathematics
Microeconomics
Elective Courses: Elective Course 1
Elective Courses: Elective Course 2
Actuarial Mathematics I
Portfolio Theory and Asset Models
Life Insurance and Takaful
Elective Courses: Elective Course 3
Elective Courses: Elective Course 4
Actuarial Mathematics II
Mathematics of Financial Derivatives
Risk Theory
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Elective Courses: Elective Course 5
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Industrial Training
Elective Courses: Elective Course 6
Elective Courses: Elective Course 7
Elective Courses: Elective Course 8
Elective Courses: Elective Course 9
Elective Courses: Elective Course 10
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training in Biotechnology
SPECIAL SEMESTER
Industrial Training in Biotechnology
Note:
*Only for international students.
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
ELECTIVE COURSES
Fundamentals of Computing
Fundamentals of Spreadsheets
Ordinary Differential Equations
Numerical Computation
Basic Operations Research
Mathematical Science Project
Foundation of Islamic Finance
Pension Mathematics
Survival Models
Business Finance
Financial and Business
Financial and Business Management
Stochastic Models
Further Mathematical Statistics
Regression Analysis
Stochastic Processes
Computer Intensive Methods in Statistics
Applied Stochastic Processes
Time Series and Forecasting Methods
Introduction to Multivariate Analysis
Generalized Linear Models', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_073', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Actuary, Risk Analyst, Insurance Underwriter, Pension Consultant, Investment Analyst, Data Analyst, Financial Risk Manager, Actuarial Consultant, Insurance Broker, Risk Manager, Pricing Analyst, Claims Analyst, Quantitative Analyst, Corporate Finance Analyst, Reinsurance Analyst.', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_074', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in Biology
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Biology
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Biology
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Biology
Obtain a minimum of grade B in any ONE (1) of the following subjects: Chemistry, Physics, Mathematics, Further Mathematics
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_074', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Language / Foreign Language**
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Bioethics and Safety
Introduction to Computational Biology
Fundamental Microbiology
Fundamental Genetics
Concepts of Genetic Engineering
English Language / Foreign Language**
Philosophy and Current Issues / Malay Language Communication*
Co-Curriculum
Principle of Chemistry
Biochemistry
Genetics and Molecular Biology Practical I
Statistics
Appreciation of Ethics and Civilizations
Bacteriology
Virology
Microbiology Practical
Eukaryotic Microorganisms
Molecular Genetics
Elective Courses: Program (EP): Phycology
Basic Mathematics
Bioinformatics Concepts
Food Microbiology
Population Genetics
Cytogenetics
Elective Courses: SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Immunology
Microbiology Practical
Microbial Ecology
Genomes
Genetics and Molecular Biology Practical II
Biosafety and Biosecurity
Elective Courses: Program (EP): Mycology
Parasitology
Calculus I
Introduction to Computer Programming in Bioinformatics
Advanced Food Microbiology
Molecular Evolution and Phylogenetics
Elective Courses: SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
Research Project
Elective Courses: Program (EP): Bioinformatics Data Plant Management
Public Health Microbiology
Diagnostic Microbiology
Advanced Immunology
Eukaryotic Cell Signaling
Applied and Environmental Microbiology
Applied Genomics in Animal Genetics
Plant Molecular and Cellular Biology
Conservation Genetics
Research Project
Elective Courses: Program (EP): Plant Genetics and Breeding
Advanced Virology
Microbial Pathogenesis
Developmental Genetics
Epigenetics and Gene Regulation
Agricultural Microbiology
Animal Genetics and Gene Manipulation
Marine and Estuarine Biology
Advanced Mycology
Science Communication
Human Molecular Genetics
Elective Courses: Program (EP): Green Agriculture
Biological Data Analytics
Microbial Technologies for Soil and Plant Health
Genetic Basis of Cancer
Fermentation Technology
Pharmaceutical Microbiology
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training
Note:
*Only for international students.
**Student whose native language is English.', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_074', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Microbiologist, Molecular Geneticist, Biomedical Scientist, Clinical Laboratory Technologist, Research Scientist, Biotechnologist, Quality Control Analyst, Pharmaceutical Sales Representative, Environmental Microbiologist, Public Health Microbiologist, Food Safety Specialist, Forensic Scientist, Laboratory Manager, Genetic Counselor (with further study), Vaccine Development Specialist, Industrial Microbiologist, Science Communicator, Regulatory Affairs Associate, Academic Research Assistant, Bioinformatics Analyst.', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_075', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/grade B- in Mathematics
Obtain a minimum of 60%/grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) of the following subjects: Biology / Physics / Chemistry
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in Mathematics
Obtain a minimum of grade B- in any ONE (1) other subject that has not yet been taken
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any ONE (1) of the following subjects: Biology / Physics / Chemistry / Mathematics / Further Mathematics
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in Mathematics/Further Mathematics
Obtain at least Grade 5 (HL) / 6 (SL) in any ONE (1) of the following subjects: Biology / Physics / Chemistry
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum of grade B in Mathematics/Further Mathematics
Obtain a minimum of grade B in any TWO (2) of the following subjects: Biology / Physics / Chemistry
Additional Requirement
Candidates who apply must be physically fit, not suffering from any mental or physical illness and able to follow the program of study designed for this course.

English language requirements
MUET 4.0
IELTS (Academic) 5.5
TOEFL iBT (Centre-based) 46
TOEFL Essentials (Online) 8.0
Pearson Test of English (PTE Academic) 51
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 160', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_075', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 English Courses (subject to MUET bands)
Malay Language Communication / Basic Malay Civilisations Language*
Statistical Programming
Basic Mathematics
Calculus I
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 2 - Emotional & Spiritual Intelligence: Heart & Soul Integrity and Anti-Corruption
English Courses (subject to MUET bands)
Appreciation of Ethics and Civilizations
Calculus II
Probability and Statistics
Analysis of Data and Statistical Report Writing
Science, Technology and Society
Basic Entrepreneurship Culture
Advanced Calculus
Linear Algebra
Probability and Statistics II
Foundations of Data Science
Statistics and Community
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 1 - Thinking Matters: Mind & Intellect
Further Mathematical Statistics
Stochastic Processes
Regression Analysis
Introduction to Multivariate Analysis
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 3 - Technology / Artificial Intelligence and Data Analytics: i-Technie
Elective Courses: Elective Course 1
Co-Curriculum
Time Series and Forecasting Methods
Generalized Linear Models
Statistical Learning and Data Mining
Elective Courses: Elective Course 2
Elective Courses: Student Holistic Empowerment (SHE): SHE Cluster 4 - Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training
Elective Courses: Elective Course 3
Elective Courses: Elective Course 4
Elective Courses: Elective Course 5
Elective Courses: Elective Course 6
Elective Courses: Elective Course 7
Elective Courses: Elective Course 8
Elective Courses: Elective Course 9
Elective Courses: Elective Course 10
Note:
*Only for international students
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
PROGRAM ELECTIVE COURSES
Numerical Computation
Basic Operations Research
Introduction to Accounting
Microeconomics
Macroeconomics
Financial Mathematics and Derivatives
Computer Intensive Methods in Statistics
Applied Stochastic Processes
Introduction to Survey Sampling
Statistical Process Control
Design and Analysis of Experiments
Analysis of Failure and Survival Data
Non-Parametric Statistics
Introduction to Bayesian Statistics
Python for Data Science
Probability Theory
Statistical Laboratory
Statistical Consultancy and Data Analysis
Statistical Science Project', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_075', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Statistician, Data Analyst, Data Scientist, Biostatistician, Actuary, Risk Analyst, Market Research Analyst, Financial Analyst, Business Intelligence Analyst, Operations Analyst, Policy Analyst, Quality Control Analyst, Research Scientist, Statistical Programmer, Econometrician, Epidemiologist, Survey Researcher, Sports Statistician, Insurance Underwriter, Demographer.', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_077', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/ grade B- in any TWO (2) subjects
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirement
Candidates who apply must be active in sports with submission of evidence of experience or involvement in sports.
Certified healthy from serious physical disabilities and mental illness (exceptions may be given to candidates who have physical disabilities that can be corrected and / or do not prevent candidates from conducting clinical activities required by medical practitioners)

English language requirements
MUET 3.5; or
IELTS (Academic) 5.0; or
TOEFL iBT (Centre-based) 40; or
TOEFL Essentials (Online) 7.5; or
Pearson Test of English (PTE Academic) 47; or
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_077', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Elective Course: SHE
Elective Course: SHE
History and Philosophy of Sports
Introduction to Sports Science
Sport Management
Basic Principles of Economy and Finance
Philosophy and Current Issues
English
Malay Language Communication (for International Student)
Elective Course: SHE
Elective Course: SHE
Appreciation of Ethics and Civilizations
First Aid and CPR
Theories in Management and Organizations
Sport Sociology
Sport Economy
English
Co-Curriculum
Research Methodology in Sport Management
Sport Marketing, Promotion and Sponsorship
Risk Management in Sport
Basic Entrepreneurship Culture
Fitness Management (FE)
Sport and Recreational Management (FE)
Sport Psychology (FE)
Management of Sport Injuries (FE)
Human Resource Management in Sport
Sport Event Management
Sport Business and Entrepreneurship
Sport Facilities and Equipment Management
Sport Financial Management
Sport Industry (FE)
Weight Training (FE)
Sport Social Engagement
Sport Law
Research Project in Sport Management
Sport Leadership (PE)
Sport Technology and Information Management (PE)
Sport Tourism (PE)
Community Sport Management (PE)
Athlete and Team Management (PE)
Sport Management Seminar
Project Management
Organizational Behavior in Sport (PE)
Sport Policy and Governance (PE)
Sport High Performance Management (PE)
Media and Sport (PE)
Sports Consumer Behavior (PE)
E-Sport (PE)
Sport Management Industrial Training
Note:
*Only for international students
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
ELECTIVE COURSES (Choose any 3 courses)
Fitness Management
Sport Industry
Sport and Recreational Management
Weight Training
Sport Psychology
Management of Sport Injuries
PROGRAMME ELECTIVE (Choose any 7 courses)
Sport Technology and Information Management
Sport Tourism
Organizational Behavior in Sport
Sport Policy and Governance
Sport High Performance Management
Community Sport Management
Athlete and Team Management
Media and Sport
Sports Consumer Behavior (PE)
Sport Leadership
E-Sport', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_077', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Sports Marketing Manager, Event Coordinator, Sports Agent, Athletic Director, Sports Facility Manager, Sports Analyst, Sports Public Relations Specialist, Sports Development Officer, Fitness Center Manager, Sports Journalist, Team Operations Manager, Sponsorship Coordinator, Sports Coach, Recreation Manager, Sports Data Analyst, Sports Consultant, Tournament Director, Sports Official, Athlete Liaison Officer, Sports Product Manager.', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_078', 'ADMISSIONS', 'Entry Requirement', 'Senior High School Certificate
Pass with a minimum average of 65%
Obtain a minimum of 60%/ grade B- in any TWO (2) subjects
Matriculations/Foundations
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
Diploma
Obtain a minimum CGPA of 3.00 from a recognized institution approved by UM Senate
Obtain a minimum of grade B- in any TWO (2) subjects
GCE A-Level
Obtain a recognized GCE A-Level qualification
Obtain a minimum grade B in any TWO (2) subjects
International Baccalaureate (IB)
Obtain a minimum score of 30 points
Obtain at least Grade 5 (HL) / 6 (SL) in any TWO (2) subjects
AUSMAT
Obtain a minimum score of 80 in the Australian Tertiary Admissions Rank (ATAR)
Obtain a minimum grade B in any TWO (2) subjects
Additional Requirement
Active in sports by providing evidence of experience or involvement in the field, and having at least represented the state/national level or having been a former athlete/referee/team manager

English language requirements
MUET 3.5; or
IELTS (Academic) 5.0; or
TOEFL iBT (Centre-based) 40; or
TOEFL Essentials (Online) 7.5; or
Pearson Test of English (PTE Academic) 47; or
Cambridge English Qualifications & Tests B1 Preliminary, B2 First, C1 Advanced, C2 Proficiency 154', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z'),
    ('UM_BACHELOR_078', 'CURRICULUM', 'Programme Structure', 'Year 1 Year 2 Year 3 Year 4
Year 1 Year 2 Year 3 Year 4 Basic Entrepreneurship Culture
History and Philosophy of Sports
Introduction to Sports Science
Anatomy and Physiology I
*Philosophy and Current Issues
English
Malay Language Communication (for International Student)
English
Appreciation of Ethics and Civilizations
First Aid and CPR
Artificial Intelligence in Sports
Anatomy and Physiology II
Basic Biomechanics
Fundamentals in Psychology
Testing and Measurement in Exercise and Sports
Elective Course: SHE
Exercise Physiology and Sports
Exercise Psychology and Health
Physical Conditioning in Exercise and Sports
Fitness Management (EF)
Sport and Recreational Management (EF)
Sport Psychology
Management of Sport Injuries (EF)
Co-Curriculum
Integrity and Anti-Corruption Course
Research Methods and Statistics in Exercise and Sports
Nutrition and Energy Balance in Exercise and Sports
Sports and Exercise Physiology
Motor Control and Performance
Science and Technology in Coaching
Sport Industry (EF)
Weight Training (EF)
Sports and Exercise Movement Analysis
Applied Research Method in Sports and Exercise
Sports and Exercise Nutrition
Motor Learning and Skill Acquisition (EP)
Sports and Exercise Rehabilitation
Applied Sports and Exercise Psychology (EP)
Integrated Home Based Exercise (EP)
Elective Course: SHE
Research Project in Sport and Exercise Sciences
Exercise Prescription for Health and Fitness
Adapted Physical Activity
Applied Biomechanics
Individual and Group Fitness Program
Psychology Exercise for Special Population (EF)
Applied Exercise Physiology and Biochemistry (EP)
Exercise Science Internship
Note:
*Only for international students.
ELECTIVE COURSES
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
ELECTIVE COURSES (Choose any 3 courses)
Fitness Management
Sport Industry
Sport and Recreational Management
Weight Training
Sport Psychology
Management of Sport Injuries
PROGRAMME ELECTIVE (Choose any 7 courses)
Sport Technology and Information Management
Sport Tourism
Organizational Behavior in Sport
Sport Policy and Governance
Sport High Performance Management
Community Sport Management
Athlete and Team Management
Media and Sport
Sports Consumer Behavior (PE)
Sport Leadership
E-Sport', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z'),
    ('UM_BACHELOR_078', 'CAREER_OPPORTUNITIES', 'Career Prospects', 'Exercise Physiologist, Sports Coach, Fitness Trainer, Rehabilitation Specialist, Strength and Conditioning Coach, Sports Scientist, Athletic Trainer, Wellness Consultant, Physical Therapy Assistant, Sports Nutritionist, Health Promotion Specialist, Occupational Therapist (with further study), Exercise Therapist, Corporate Wellness Coordinator, Bio-mechanist, Sports Psychologist Assistant, Kinesiologist, Sports Medicine Technician, Research Assistant in Sports Science, Community Health Worker', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z');

INSERT INTO programme_detail_sections (programme_id, section_type, title_en, body_en, sort_order, source_url, source_checked_at, status, created_at, updated_at)
SELECT p.id, s.section_type, s.title_en, s.body_en,
  CASE s.section_type WHEN 'ADMISSIONS' THEN 20 WHEN 'CAREER_OPPORTUNITIES' THEN 30 ELSE 40 END,
  s.source_url, s.source_checked_at, 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM official_um_programme_sections s JOIN programmes p ON p.programme_code=s.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug='um'
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

CREATE TEMP TABLE official_um_programme_intakes (
  programme_code varchar(64), display_text varchar(100), source_url varchar(1000), source_checked_at timestamptz,
  PRIMARY KEY(programme_code, display_text)
) ON COMMIT DROP;

INSERT INTO official_um_programme_intakes VALUES
    ('UM_BACHELOR_002', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_002', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-muamalat-management', '2026-10-14T05:44:41.294Z'),
    ('UM_BACHELOR_004', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_004', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('UM_BACHELOR_005', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_005', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-shariah-and-law', '2026-10-14T05:44:45.312Z'),
    ('UM_BACHELOR_001', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_001', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-shariah', '2026-10-14T05:44:47.321Z'),
    ('UM_BACHELOR_003', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_003', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-usuluddin', '2026-10-14T05:44:49.329Z'),
    ('UM_BACHELOR_006', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_006', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-proffesional-malay-language', '2026-10-14T05:44:53.348Z'),
    ('UM_BACHELOR_007', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_007', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('UM_BACHELOR_008', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_008', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('UM_BACHELOR_009', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_009', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-malay-studies', '2026-10-14T05:44:59.358Z'),
    ('UM_BACHELOR_011', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_011', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-anthropology-and-sociology', '2026-10-14T05:45:01.371Z'),
    ('UM_BACHELOR_018', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_018', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('UM_BACHELOR_019', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_019', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('UM_BACHELOR_012', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_012', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('UM_BACHELOR_013', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_013', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('UM_BACHELOR_014', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_014', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('UM_BACHELOR_016', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_016', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-social-administration', '2026-10-14T05:45:13.391Z'),
    ('UM_BACHELOR_015', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_015', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-history', '2026-10-14T05:45:15.408Z'),
    ('UM_BACHELOR_020', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_020', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('UM_BACHELOR_021', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_021', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-chinese-studies', '2026-10-14T05:45:19.421Z'),
    ('UM_BACHELOR_010', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_010', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('UM_BACHELOR_017', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('UM_BACHELOR_022', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_022', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('UM_BACHELOR_023', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_023', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('UM_BACHELOR_024', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_024', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('UM_BACHELOR_025', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_025', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('UM_BACHELOR_026', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_026', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('UM_BACHELOR_029', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_029', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('UM_BACHELOR_028', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('UM_BACHELOR_030', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-finance', '2026-10-14T05:45:39.480Z'),
    ('UM_BACHELOR_031', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_031', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('UM_BACHELOR_033', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('UM_BACHELOR_035', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-software-engineering', '2026-10-14T05:45:45.506Z'),
    ('UM_BACHELOR_032', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_032', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-computer-system-and-network', '2026-10-14T05:45:47.503Z'),
    ('UM_BACHELOR_036', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_036', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-multimedia-computing', '2026-10-14T05:45:49.503Z'),
    ('UM_BACHELOR_037', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-data-science', '2026-10-14T05:45:51.520Z'),
    ('UM_BACHELOR_034', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_034', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-computer-science-information-system', '2026-10-14T05:45:53.525Z'),
    ('UM_BACHELOR_041', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_041', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-dance', '2026-10-14T05:45:55.539Z'),
    ('UM_BACHELOR_039', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_039', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-drama', '2026-10-14T05:45:57.556Z'),
    ('UM_BACHELOR_038', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_038', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-music', '2026-10-14T05:45:59.563Z'),
    ('UM_BACHELOR_040', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_040', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-performing-arts', '2026-10-14T05:46:01.562Z'),
    ('UM_BACHELOR_044', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_044', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('UM_BACHELOR_045', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_045', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('UM_BACHELOR_046', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_046', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('UM_BACHELOR_047', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_047', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-civil-engineering', '2026-10-14T05:46:13.614Z'),
    ('UM_BACHELOR_050', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_050', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-mechanical-engineering', '2026-10-14T05:46:17.637Z'),
    ('UM_BACHELOR_049', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_049', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('UM_BACHELOR_051', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_051', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-chemical-engineering', '2026-10-14T05:46:21.660Z'),
    ('UM_BACHELOR_060', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_060', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('UM_BACHELOR_054', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_054', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('UM_BACHELOR_052', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_052', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('UM_BACHELOR_055', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_055', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('UM_BACHELOR_053', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_053', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('UM_BACHELOR_056', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_056', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('UM_BACHELOR_057', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_057', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('UM_BACHELOR_058', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_058', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('UM_BACHELOR_059', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_059', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('UM_BACHELOR_065', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('UM_BACHELOR_066', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_066', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-chemistry', '2026-10-14T05:46:51.812Z'),
    ('UM_BACHELOR_067', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_067', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('UM_BACHELOR_068', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_068', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-physics', '2026-10-14T05:46:55.783Z'),
    ('UM_BACHELOR_076', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_076', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('UM_BACHELOR_069', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_069', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-applied-geology', '2026-10-14T05:47:01.806Z'),
    ('UM_BACHELOR_070', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_070', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('UM_BACHELOR_071', 'Semester 2 (March) Intake, Academic Session 2025/2026', 'https://study.um.edu.my/bachelor-of-science-of-mathematics', '2026-10-14T05:47:05.825Z'),
    ('UM_BACHELOR_072', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_072', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('UM_BACHELOR_073', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_073', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-actuarial-science', '2026-10-14T05:47:11.837Z'),
    ('UM_BACHELOR_074', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_074', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('UM_BACHELOR_075', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_075', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-science-in-statistics', '2026-10-14T05:47:15.862Z'),
    ('UM_BACHELOR_077', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_077', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('UM_BACHELOR_078', 'Semester 1 (October) Intake', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z'),
    ('UM_BACHELOR_078', 'Semester 2 (March) Intake', 'https://study.um.edu.my/bachelor-of-sport-sciences', '2026-10-14T05:47:19.876Z');

INSERT INTO programme_intakes (programme_id, display_text, source_url, source_checked_at)
SELECT p.id, i.display_text, i.source_url, i.source_checked_at
FROM official_um_programme_intakes i JOIN programmes p ON p.programme_code=i.programme_code JOIN universities u ON u.id=p.university_id
WHERE u.slug='um' AND NOT EXISTS (
  SELECT 1 FROM programme_intakes existing WHERE existing.programme_id=p.id
);
