-- Re-extracted from reviewed Universiti Malaya and Taylor's University HTML snapshots.
-- Only semantic course/module items are retained; prose, notes, selection rules,
-- fees and admissions requirements are excluded. No course title is generated.
CREATE TEMP TABLE malaysia_official_curriculum_repairs (
    university_slug VARCHAR(200) NOT NULL,
    programme_code VARCHAR(64) PRIMARY KEY,
    body_en TEXT NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    source_checked_at TIMESTAMPTZ NOT NULL
) ON COMMIT DROP;

INSERT INTO malaysia_official_curriculum_repairs VALUES
    ('um', 'UM_BACHELOR_002', 'Penghayatan Etika dan Peradaban
Pengantar Pengajian Usuluddin
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Fiqh al-‘Ibadat
Pengantar Pentadbiran Perniagaan Islam
Ekonomi untuk Muamalat
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
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
Nazariyyah al-Hukm al-Syar’i fi Usul al-Fiqh
Statistik untuk Muamalat
Al-`Uqud al-Musammah (FE)
Ayat dan Hadith Hukum untuk Muamalat (FE)
Sistem Kewangan Islam
Asas Pembudayaan Keusahawanan
Qawaid Tafsir al-Nusus Fi Usul al-Fiqh
Asas Perakaunan
Amalan Perbankan dan Kewangan Islam
Pengurusan Kewangan
Sistem Pengurusan Islam
Pengguna dan kepenggunaan Islam
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
Pengurusan Harta Secara Islam
Pasaran Modal Islam
Al-‘Urf wa al-Maslahah
Transaksi Kewangan Islam Semasa
Pengurusan Risiko Secara Islam
Analisis Pelaburan dan Sekuriti Menurut Islam
Pengurusan Halal di Malaysia dan Isu Semasa
Metodologi Penyelidikan Pengurusan Muamalat
Etika Pengurusan Perniagaan Perbandingan
Pengurusan Sumber Manusia dari Perspektif Islam
Pasaran Derivatif Islam
Tadbir Urus Korporat Islam
Pengurusan Strategik dalam Islam
Pengauditan untuk institusi Perniagaan Islam
Pengurusan Kewangan Islam
Kertas Projek Pengurusan Muamalat
Latihan Industri Pengurusan Muamalat
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_004', 'Penghayatan Etika dan Peradaban
Co-Curriculum
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
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Bahasa Inggeris Komunikasi
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Syariah
Fiqh al-''Ibadat
Nazariyyah al-Hukm al-Syar‘i fi Usul al-Fiqh
‘Ulum al-Qur’an
‘Ulum al-Hadith
Usul Al-Tafsir
Dawabit fi Fahm al-Quran wa al-Sunnah
Tafsir Ayat Ahkam
Ahadith al-Ahkam
Al-Tafsir wa al-Hadith al-Mawdu’i
Pengajian al-Quran dan al-Hadith dalam Media
Asas Kebudayaan Keusahawanan
Al-Jarh wa al-Ta''dil
Dirasah Nassiyyah Tahliliyyah fi al-Qur’an wa al-Hadith
Al-Madkhal Ila ‘Ilm al-Qira’at
Al-I‘jaz fi Al-Qur’an wa Al-Hadith
Israiliyyat dalam Tafsir dan Hadith Nabi
Sains Menurut Al-Quran dan Al-Sunnah
Sirah al-Rasul wa al-Khulafa’ al-Rashidin
Takhrij al-Hadith wa Dirasah al-Asanid
Hujjiyyah al-Sunnah al-Nabawiyyah
Rekabentuk dan Pembangunan Teknologi Al-Quran dan Hadith
Penterjemahan Al-Quran dan Al-Hadith
Metodologi Hafazan Al-Quran
Mukhtalif al-Hadith wa Mushkiluh
Kertas Projek Al-Quran dan Al-Hadith
Rasm Wa Dabt Al-Qur''an
Aplikasi Ilmu Al-Qiraat
Latihan Industri
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
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
Business Management and Islamic Transactions
Contemporary Applications of Astronomy (Aplikasi Semasa Ilmu Falak)
Consumer Jurisprudence (Fiqh Kepenggunaan)
Ethics and Professionalism in Islamic Preaching
Health Sciences According to the Qur’an and Sunnah
Islamic Economic Systems in Malaysia
Issues of Weak and Fabricated Hadith in Malaysia
Medicine in the Qur’an and Sunnah
Muslim Politics in the Malay World', 'https://study.um.edu.my/bachelor-of-al-quran-and-al-hadith', '2026-10-14T05:44:43.315Z'),
    ('um', 'UM_BACHELOR_005', 'Penghayatan Etika dan Peradaban (PEP)
Pengantar Pengajian Usuluddin
AlArabiyah li al-Dirasat al-Islamiyyah 1
Sistem Kehakiman Islam
Fiqh al-''Ibadat
Pengantar Sistem Undang-undang di Malaysia
Kursus Bahasa Inggeris
Falsafah dan Isu Semasa (FIS)*
Bahasa Melayu Asas**
Pengantar Pengajian Syariah
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pentadbiran Undang-Undang Islam di Malaysia
Fiqh Muamalat
Undang-Undang Perlembagaan dan Pentadbiran
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
Metodologi Penyelidikan Undang-Undang Islam
Undang-Undang Jenayah Syariah
Al-Qawaid al-Fiqhiyyah
Undang-Undang Jenayah 1
Undang-Undang Kontrak 1
Undang-Undang Tanah 1
Undang-Undang Keterangan Islam
Undang-Undang Keterangan Mal
Undang-Undang Tatacara Jenayah Syariah
Maqasid al-Syari''ah
Undang-Undang Jenayah 2
Undang-Undang Kontrak 2
Undang-Undang Tanah 2
Amalan Profesional
Undang-Undang Perbankan dan kewangan Islam
Al-Dirasah al-Nassiyah fi al-Syari''ah wa al-Qanun
Undang-Undang Tort
Undang-Undang Harta Intelek
Undang-Undang Islam dan Jantina
Mediasi Syariah
Undang-Undang Islam dan Masyarakat
Moot
Undang-Undang Ekuiti dan Amanah
Undang-Undang dan Pentadbiran Wakaf
Undang-Undang dan Fatwa di Malaysia
Kertas Projek
Latihan Industri
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
Islamic Law and Gender
Law and Fatwa in Malaysia
Project Paper
Sharia Mediation
Waqf Law and Administration
Zakat and Baitulmal Law
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
    ('um', 'UM_BACHELOR_001', 'Penghayatan Etika dan Peradaban
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
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
IIP2002 Fiqh al-Mu’amalat
IIP2003 Fiqh al-Jinayat
IIP2018 Qawaid Tafsir al-Nusus Fi Usul al-Fiqh
Asas Pembudayaan Keusahawanan
Dirasah al-Ijma'' wa al-Qiyas
Fiqh al-halal wa al-Haram fi al-Islam
Al-''Urf wa al-Maslahah
Literatur Pengajian Syariah
Maqasid al-Syari''ah
Al-Qawa''id al-Fiqhiyyah
Kertas Projek Syariah
Latihan Industri Shariah
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
Amalan Fatwa
Manahij al-Fuqaha''
Al-Dirasah al-Nassiyyah
Al-Ijtihad Wa Al-Ikhtilaf
Muamalat Semasa
Pengajian Hudud, Qisas dan Takzir
Nizam al-Qada''
Fiqh Zakat
Fiqh al-Marawith wa al-Wasaya
Pematuhan Syariah dalam Industri Kewangan
Fiqh al-Hajj wa al-‘Umrah
Fiqh al-Waqf wa al-Hibah
Fiqh Budaya
Ayat Wa Ahadith al-Ahkam
Mantiq dalam Pengajian Syariah
Makroekonomi Islam
Ekonomi Digital Islam
Prinsip Ekonomi
Kuantitatif untuk Ekonomi Islam
Teori dan Amalan Takaful di Malaysia
Mikroekonomi Islam
Pengantar Perakaunan
Sistem Perbankan Islam
Ekonomi Zakat dan Wakaf
Perakaunan Zakat
Ekonomi Malaysia dan Isu Semasa
Ijtihad dalam Isu Ekonomi dan Kewangan Islam
Pasaran Wang dan Modal Islam
Ekonometrik Asas
Isu Muamalat dalam Perbankan dan Kewangan Islam
Asas Sains Politik
Sistem Governan dalam Islam
Pengurusan Kualiti Berteraskan Syariah
Sejarah Politik Islam
Kepimpinan Islam
Pentadbiran Organisasi Awam Islam
Pentadbiran Politik dan Masyarakat Malaysia
Pengenalan Siasah Syar''iyyah
Intergriti Governan dalam Islam
Institusi Pentadbiran Politik Islam
Perhubungan Antarabangsa Islam
Pengurusan Masyarakat Majmuk dalam Islam
Governan dan Dasar Awam Malaysia
Pentadbiran Kakitangan dan Organisasi
Pemikiran Politik Islam Perbandigan
Kaedah Matematik dalam Astronomi
Amali Asas Sains Fizik
Isu-isu Kontemporari dalam Astronomi Islam
Fiqh Falak
Prinsip Astronomi Semasa
Penentuan Arah Kiblat dan Waktu Solat
Kaedah Penyelidikan Falak
Sistem Takwim
Amali Pencerapan dan Instrumentasi
Dirasah al-Miqat
Historiografi Sains Islam
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
    ('um', 'UM_BACHELOR_003', 'Penghayatan Etika dan Peradaban
Pengantar Pengajian Usuluddin
Tilawah dan Hafazan
Al-Arabiyah li al-Dirasat al-Islamiyyah 1
Nazariyyah al-Hukm al-Syar‘i fi Usul al-Fiqh
''Ulum al-Qur''an
''Ulum al-Hadith
Kajian Perbandingan Agama
Falsafah dan Isu Semasa*
Bahasa Melayu Asas**
Co-Curriculum
GKA1001 Sangkutan@Industri (Attach@Industry)
GKI1001 Penyelidikan Bebas (Independent Research)
GKK1001 Khidmat Komuniti (Community Service)
GKP1001 Pembangunan Bakat (Talent Development)
GKS1001 Kesukarelawanan (Volunteerism)
GKU1001 Keusahawanan (Entrepreneurship)
Al-Arabiyah li al-Dirasat al-Islamiyyah 2
Pengantar Pengajian Syariah
Fiqh al-''Ibadat
Al-''Aqidah al-Islamiyyah
Al-Akhlak wa al-Tasawwuf
Bahasa Inggeris Komunikasi
Usul al-Da''wah
Aliran Permikiran Islam
Sistem Dalam Tamadun Islam
Asas Pembudayaan Keusahawanan
Pembangunan Insan
Al-Falsafah al-Islamiyyah
Sirah al-Rasul wa al-Khulafa'' al-Rashidin
Metodologi Dakwah
Kajian Fatwa dan ajaran salah di Malaysia
Dunia Islam Kini
Kertas Projek Usuluddin
''Ilm al-Kalam wa al-Tahaddiyat al-Mu''asirah
Latihan Industri Usuluddin
SHE 1: Cluster Thinking Matters, Mind & Intelect
SHE 2: Cluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Cluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Cluster Global Issues and Community Sustainability: Making the World a Better Place
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
Tamadun Islam di Afrika dan Eropah
Sejarah Islam Zaman Uthmaniyyah
Al- Tarikh al-Umawi wa al-Abbas
Metodologi Penyelidikan Sejarah Islam
Pengantar Sejarah dan Tamadun Islam
Sejarah Islam di Nusantara
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
    ('um', 'UM_BACHELOR_006', 'Kursus Bahasa Inggeris
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Ko-Kurikulum
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Bahasa Melayu dan Multimedia
Tatabahasa Bahasa Melayu
Bahasa dalam Komunikasi Interpersonal
Falsafah dan Isu Semasa*
Pengajian Melayu dan Masyarakat
Bahasa Melayu Tinggi
Sistem Ejaan Jawi
Semantik Leksikal Bahasa Melayu
Bahasa Melayu dalam Penyiaran dan Kewartawanan
Bahasa Melayu dalam Periklanan dan Perdagangan
Analisis Wacana Bahasa Melayu
Laras Bahasa Melayu
Stilistik Bahasa Melayu
Asas Pembudayaan Keusahawanan
Bahasa Melayu, Masyarakat dan Media Sosial
Analisis Bezaan dan Analisis Kesilapan Bahasa Melayu
Bahasa Melayu dalam Sinematografi
Retorik Bahasa Melayu
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
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
Tulisan Jawi dalam Kesusasteraan Melayu
Sosiologi Kesusasteraan Melayu
Kesusasteraan Melayu dan Komersial
Ilustrasi Kesusasteraan
Pengajaran Kesusasteraan Melayu
Ilmu Pernaskhahan Melayu
Penulisan Kreatif Puisi Melayu
Kesusasteraan Kitab
Kesusasteraan Melayu dan Penerbitan
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
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
    ('um', 'UM_BACHELOR_007', 'Ko-kurikulum
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Pengantar Linguistik Melayu
Penulisan Dokumen Khusus
Sosiolinguistik
Falsafah dan Isu Semasa*
Bahasa Inggeris Komunikasi
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Fonetik
Penyelidikan Lapangan
E-Linguistik
Penulisan Akademik
Fonologi
Morfologi
Linguistik Korpus
Analisis Wacana Bahasa
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi (ECP)
Linguistik Teks
Kepelbagaian Dialek Melayu
Leksikologi
Kompetensi Komunikatif
Penyuntingan Kesusasteraan Melayu
Pemikiran Melayu
Melayu dan Perlembagaan
Sintaksis
Semantik
Pragmatik
Etnolinguistik
*Projek Tahun Akhir (P1)
Isu Semasa Pengajian Melayu
Filogenetik Bahasa
Psikolinguistik
Kaedah dan Teknik Penterjemahan
Projek Tahun Akhir(P2)
Latihan Industri
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
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
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
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
Rekaan dan Penataan Sinografi', 'https://study.um.edu.my/bachelor-of-malay-linguistic', '2026-10-14T05:44:55.353Z'),
    ('um', 'UM_BACHELOR_008', 'Bahasa Inggeris Komunikasi
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Ko-kurikulum
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Puisi Tradisional
Pengantar Linguistik Melayu
Falsafah dan Isu Semasa
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Puisi Moden
Pengantar Teori Kesusasteraan
Prosa Moden
Kesusasteraan Islam
Penulisan Akademik
Prosa Tradisional
Kesusasteraan Lisan Serumpun
Metodologi Penyelidikan Sastera
Kesusasteraan Elektronik
Kritikan Kesusasteraan Melayu
Asas Pembudayaan Keusahawanan
Kesusasteraan Bandingan Melayu
Pengantar Karya Agung Kesusasteraan
Penyuntingan Kesusasteraan Melayu
Kesusasteraan Melayu dan Stilistik
Pengurusan dan Pemasaran Kesusasteraan
Penulisan Skrip
Pemikiran Melayu
Melayu dan Perlembagaan
Pengantar Kesusasteraan Antarabangsa
Kesusasteraan Melayu dan Estetika
Penulisan Kreatif Prosa Melayu
Latihan Ilmiah (P)
Isu Semasa Pengajian Melayu
Penulisan Kesusasteraan Kanak-Kanak dan Remaja
Kesusasteraan Melayu dan Komunikatif
Latihan Industri
SHE 1: Kluster Thinking Matters, Mind & Intelect
SHE 2: Kluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Kluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Kluster Global Issues and Community Sustainability: Making the World a Better Plac
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
Sejarah Perkembangan Bahasa Melayu
Bahasa Melayu dalam Perundangan
Kesantunan Bahasa Melayu
Linguistik dan Kesusasteraan Melayu
Aspek Linguistik Bahasa Klasik
Linguistik dalam Komunikasi Korporat
Geolinguistik Alam Melayu
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
Rekaan dan Penataan Sinografi', 'https://study.um.edu.my/bachelor-of-malay-literature', '2026-10-14T05:44:57.364Z'),
    ('um', 'UM_BACHELOR_009', 'Ko-kurikulum
Penghayatan Etika dan Peradaban / *Bahasa Melayu Komunikasi (BW)
Tamadun Melayu
Pengajian Melayu Berteraskan Islam
Pengurusan Sumber Sejarah Pengajian Melayu
Sosiologi Bahasa
Kosmologi Melayu
Seni, Budaya dan Masyarakat Melayu
Falsafah dan Isu Semasa
Bahasa Inggeris Komunikasi
Pengajian Melayu dan Masyarakat
Sejarah Kesusasteraan Melayu
Teori Pengajian Melayu
Dunia Melayu
Institusi Sosial Melayu/li>
Identiti Melayu
Penulisan Akademik
Budaya Politik dan Kepimpinan Melayu
Seni Melayu dan Islam
Sastera, Drama dan Media
JIF3013(p)
Asas Pembudayaan Keusahawanan
Bahasa Inggeris Komunikasi (ECP)
Kearifan Tempatan dan Teknologi Melayu
Kaedah Penyelidikan Pengajian Melayu
Bahasa dan Komuniti Melayu
Industri Kreatif Melayu
Pemikiran Melayu
Melayu dan Perlembagaan
Warisan Budaya dan Pelancongan
Pengurusan Arkib, Muzium dan Galeri
Kenegaraan dan Dasar-Dasar Negara
Projek Penyelidikan
JIF2010(p)
Isu Semasa Pengajian Melayu
Pemodenan dan Perubahan Orang Melayu
Kepimpinan Sosial Melayu
Ekonomi Melayu
JIF2015(p)
Latihan Industri
SHE 1: Kluster Thinking Matters, Mind & Intelect
SHE 2: Kluster Emotional and Spiritual Intelligence, Heart & Soul
SHE 3: Kluster Technology/Artificial Intelligence and Data Analytics: i-Techie
SHE 4: Kluster Global Issues and Community Sustainability: Making the World a Better Plac
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
    ('um', 'UM_BACHELOR_011', 'Philosophy and Current Issues
Co-Curriculum
Introduction to Ethnography
Introduction to Anthropology and Sociology
Development and Marginalised Communities
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Community Building, Social Action and Courses Innovation
Introduction to Psychology
Community and Environment
Digital Humanities
Research Methods in Anthropology and Sociology
Social Inequality
Work Psychology
English Communication Course / Foreign Language II
Field Exploration Science
Arts, Religion and Ritual
Organizational Development
Sociology of Migration
Visual Anthropology
Research Project (P1)
Community and Commerce
Social Psychology
Research Project (P2)
Industrial Training
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
    ('um', 'UM_BACHELOR_018', 'Philosophy and Current Issues
Basic Entrepreneurship Culture
Physical Geography : Processes and Forms
Human Geography: Patterns and Process
Economic Geography
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Co-Curriculum
Community Building, Social Action and Courses Innovation
Analysis Techniques in Geography
Climatology
Digital Humanities
System Approach in Physical Geography
Geographic Information System
Population Geography and Demography
English Communication Course / Foreign Language II
Remote Sensing
Human-Environment Interaction in Field
Geographical Statistical Methods
Application and Implementation of Geographic Information Systems
Qualitative Methods
Research Project (P1)
Location and Spatial Analysis
Social Geography
Urban Dynamics
Research Project (P2)
Industrial Training', 'https://study.um.edu.my/bachelor-of-geography', '2026-10-14T05:45:03.387Z'),
    ('um', 'UM_BACHELOR_019', 'Philosophy and Current Issues
Basic Entrepreneurship Culture
Physical Environment
Environmental and Human
Concepts and Issues in Sustainability
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language 1
Co-Curriculum
Community Building, Social Action and Courses Innovation
Cartography
Methods in Environmental Analysis
Digital Humanities
Environmental Management
Geographic Information Systems in Environmental Studies
Weather and climate
English Communication Course / Foreign Language II
Remote Sensing
Field Work on Sustainability Research
Statistical Methods of Environmental
Environmental Law
Application and Implementation of Geographic Information Systems
Research Project (P1)
Environmental Ethics
Global Environmental Change
Environmental Governance
Research Project (P2)
Industrial Training', 'https://study.um.edu.my/bachelor-of-environmental-studies', '2026-10-14T05:45:05.373Z'),
    ('um', 'UM_BACHELOR_012', 'Philosophy and Current Issues
Co-Curriculum
Introduction to International Relations
Evolution of International Society
Introduction to Theories of International Relations
International Organizations in World Politics
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Introduction of Politics
Political Economy of International Relations
Approaches to National Security of Malaysia
Basic Entrepreneurship Culture
Foreign Policy Analysis
Non-State Actors in International Relations
Development of Modern Strategy
English Communication Course / Foreign Language II
International Law
Research Methods in International Relations
Contemporary Theories of International Relations
Digital Humanities
Foreign Policy of Malaysia
Practice of Diplomacy
Research Project (P1)
International Security
Foreign Policies of Major Powers
Research Project (P2)
Industrial Training', 'https://study.um.edu.my/bachelor-of-arts-international-and-strategic-studies', '2026-10-14T05:45:07.373Z'),
    ('um', 'UM_BACHELOR_013', 'Philosophy and Current Issues
Basic Entrepreneurship Culture
Introduction to Southeast Asian 1
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Co-Curriculum
Community Building, Social Action and Innovation
Introduction to Southeast Asian Region II
Digital Humanities
Theory and Approaches to Development
Politics and Government In Southeast Asia
Economic Development in Southeast Asia
English Communication Course / Foreign Language II
Maritime Economy in Southeast Asia
Research Methodology
Ethnicity, Identity and Politics of Minorities in Southeast Asia
Migration and Development in Southeast Asia
Research Project (P1)
Southeast Asia in a Global Economy
Seminar on Southeast Asia
Research Project (P2)
Industrial Training
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
Filipino Language IA
Filipino Language IB
Filipino Language IIA
Filipino Language IIB
Burmese Language IA
Burmese Language IB
Burmese Language IIA
Burmese Language IIB
Thai Language IA
Thai Language IB
Thai Language IIA
Thai Language IIB
Introduction to Southeast Asian Region I
Research Project
International Security
Foreign Policy of Malaysia
Foreign Policies of Major Powers
Practice of Diplomacy', 'https://study.um.edu.my/bachelor-of-arts-southeast-asians-studies', '2026-10-14T05:45:09.391Z'),
    ('um', 'UM_BACHELOR_014', 'Philosophy and Current Issues Civilizations
Co-Curriculum
East Asia Through Digital Lenses
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Research Methods for Area Studies
International Relations of East Asia
Basic Entrepreneurship Culture
Digital Humanities
Economic Development in East Asia
English Communication Course / Foreign Language II
Security Issues in East Asia
Research Project (P1)
Research Seminar
Research Project (P2)
Industrial Training
China Culture and Society of China
Chinese Language 1
Chinese Language 2
Political Economy of China
Chinese Language 3
Chinese Language 4
Chinese Language 5
Chinese Language 6
Korea Culture and Society of Korea
Korean Language 1
Korean Language 2
Korea Political Economy of Korea
Korean Language 3
Korean Language 4
Korean Language 5
Korean Language 6
Culture and Society of Japan
Japanese Language 1
Japanese Language 2
Political Economy of Japan
Japanese Language 3
Japanese Language 4
Japanese Language 5
Japanese Language 6
Economic Development of East Asia
Research Project
Research Seminar on East Asia', 'https://study.um.edu.my/bachelor-of-east-asian-studies', '2026-10-14T05:45:11.383Z'),
    ('um', 'UM_BACHELOR_016', 'Appreciation of Ethics and Civilizations
Malay Language Communication*
Co-Curriculum
Social Dynamics
Welfare System
Basic of Human Behaviour
Introduction to Social Problem
Philosophy and Current Issues
English Communication Course / Foreign Language
Community Building, Social Action and Innovation
Introduction to Management of Human Services
Principle of Social Work
Interpersonal Skill
Basic Entrepreneurship Culture
Digital Humanities
Social Policy
Organization Behavior
Social Work with Individuals and Families
Analytical Investigation in Social Administration
English Communication Course / Foreign Language II
Criminology
Legislative in Social Work Practices
Social Enquiry
Directed Reading
Social Work with Groups
Industrial Training (P1)
Research Project
The Law of Welfare, Health and Occupational Safety
Basics of Human Behaviour
Introduction to Social Problems
Principles of Social Work
Interpersonal Skills
Organizational Behaviour
Legislation in Social Work Practices
Social Inquiry
Work with Groups
Industrial Training
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
    ('um', 'UM_BACHELOR_015', 'Philosophy and Current Issues
Basic Entrepreneurship Culture
History of Southeast Asia until 15th Century
Theory and Method of History
Introduction to History of Malaysia
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language I
Co-Curriculum
Community Building, Social Action and Innovation
Introduction to Early Asian History
Introduction to European History until 17th Century
Digital Humanities
Melaka Sultanate until 16th Century
Nationalism in Southeast Asia
Malaysian Economic History until Century Independence
English Communication Course / Foreign Language II
History of Islam in Southeast Asia
British Colonial Administration in Malaysia
Research Project (P1)
Japanese Occupation in Malaysia
Modern European History
Research Project (P2)
Documentation and Historical Sources of Malaysia
Indonesian Politics since 1966
Industrial Training
Malaysian Economic History until Independence
History of The Philippines to the 18th Century
Research Project
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
    ('um', 'UM_BACHELOR_020', 'Philosophy and Current Issues
Basic entrepreneurship Culture
Introduction to Indian Civilization
Modern Tamil Literature
Applied Tamil Grammar
Introduction to Malaysian Indian
The Culture of Malaysian Indians
Inquiry into Indian Civilization
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language I
Co-Curriculum
Community Building, Social Action and Innovation
Medieval Tamil Literature
Malaysian Tamils Social History
Classical Tamil Literature
Indian Civilization
An Introduction to Malaysian Indian Family Systems
Malaysian Indians Socioeconomic condition
Digital Humanities
Package Core Courses:
Tamil Linguistic
Yoga Tradition and Practices in Tamil Civilization
Seminar in Tamil Studies
Early Cultural Contact Between India And Southeast Asia Studies
Tradition of Indian Music and Dance
Seminar Series in Indian Studies
Research Methodology of Tamil Studies
Tamil Language in New Media
Ethical Thoughts of Tamil Society
Research Methodology of Indology Studies
Malaysian Tamils Culture
Culture and Thought of South Indian Community
Research Project (P1)
The Thoughts of Cittar in Tamil Tradition
Creative Writing in Tamil
Government and Politics of India
Contemporary of India
Writing for Multiple purpose needs in Tamil Language
Tamil in Journalism
Minority Groups Among Malaysian Indian
Communicative Tamil II
Industrial Training
An Introduction to Indian Civilization
Tamil Linguistics
Writing for Multiple Purposes in Tamil Language
An Introduction to Malaysian Indian
Early Cultural Contact Between India And Southeast Asia
Minority Groups Among Malaysian India', 'https://study.um.edu.my/bachelor-of-arts-indian-studies', '2026-10-14T05:45:17.405Z'),
    ('um', 'UM_BACHELOR_021', 'Philosophy and Current Issues
English Communication Course / Foreign Language I
Chinese in Modern Texts
Introduction of Chinese Literature
Classical Chinese Literature II
Classical Chinese Politic, Instituition and Culture
Appreciation of Ethics and Civilizations
Malay Language Communication*
English Communication Course / Foreign Language II
Community Building, Social Action and Innovation
Chinese In Classical Texts
Chinese Creative Writing
Classical Chinese Fiction
Digital Humanities
Sinography and Chinese Ancient
History of Chinese Philosophy
Research Methodology in Chinese
Modern Chinese Literature
Selected Ci in Classical Chinese
Basic Entrepreneurship Culture
Malaysian Chinese Literature
Research Project (P1)
Co-Curriculum
Research Project (P2)
Industrial Training
Introduction to Chinese Literature
Classical Chinese Literature I
Classical Chinese Politics, Institutions, and Culture
Sinography and Chinese Ancient Scripts
Research Methodology in Chinese Studies
Research Project
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
    ('um', 'UM_BACHELOR_010', 'Appreciation of Ethics and Civilizations
Malay Language Communication*
Foreign Language I
Drama: An Introduction
Research Methodology
Writing about Literature I
Philosophy and Current Issues
Foreign Language II
Community Building, Social Action and Innovation
Introduction to Fiction
Aspects of Poetry
Writing about Literature II
Co-Curriculum
Digital Humanities
Theories of Literature
Shakespeare and His Contemporaries
The Twentieth Century
Literature and the Environment
Malaysian Popular Literature and Culture
Basic Entrepreneurship Culture
Postcolonial Literature: Themes and Tropes
Topics in the Nineteenth Century
Women’s Voices in Literature
Exploring Travel Literature
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
Industrial Training
Theatre Performance in English
Journalistic Writing
Africa Speaks
Effective Writing
Creative Writing
Texts and Contexts in the Middle Ages
Introduction to Postmodern Fiction
Global Shakespeares: An Introduction
Nineteenth Century British Literature and Culture', 'https://study.um.edu.my/bachelor-of-arts-english', '2026-10-14T05:45:21.433Z'),
    ('um', 'UM_BACHELOR_017', 'Philosophy and Current Issues
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
News Reporting
Editing
Photo Journalism
Publishing Economy
Screen Writing
Persuasive Communication
Selected Current Issues
Media in the Global and Local Contexts
Political Communication
Communication Management
Appreciation of Ethics and Civilizations
Basic Entrepreneurship Culture
Malay Language Communication*
Media, Culture and Society
Feature Writing
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
Multimedia Production
Strategic Event Management
Documentary Production
Public Relations and Social Media
Language Proficiency for Professional
Magazine Publishing
Citizen Journalism
Industrial Training (P1)
Industrial Training (P2)
Industrial Training
Writing and Media
Project Paper 1
Language Proficiency for Professionals', 'https://study.um.edu.my/bachelor-of-media-studies', '2026-10-14T05:45:23.426Z'),
    ('um', 'UM_BACHELOR_022', 'English I
Architectural Design Studio I
Materials and Construction I
History of Asian Architecture
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
Basic Entrepreneurship Enculturation
Architectural Design Studio V
Culture and Context
Architectural Academic Report
Architectural Design Studio VI
Professional Studies
Working Drawing
Industrial Training
**Architectural Lighting and Acoustic/**Digital Fabrication
*Measured Drawing/*Landscape Architecture', 'https://study.um.edu.my/bachelor-of-science-in-architecture', '2026-10-14T05:45:25.431Z'),
    ('um', 'UM_BACHELOR_023', 'Philosophy and Current Issue/ Basic Malay Language*
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
Construction Technology – Complex Construction
Building Pathology
Property Management and Maintenance
Integrated Project II – Building Control & Development
Structural Principle
Building Dilapidation Survey
Integrated Project III – Building Services Audit
Accounting & Financial Management
Risk & Construction Safety
Integrated Project IV – Building Performance & Simulation
Procurement, Contract and Specification
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
Computer Aided Design
Sustainable Built Environment
Land & Geomatics Surveying
Co-Curriculum', 'https://study.um.edu.my/bachelor-of-building-surveying', '2026-10-14T05:45:27.453Z'),
    ('um', 'UM_BACHELOR_024', 'Philosophy and Current Issue / Basic Malay Language*
English I
Introduction to Construction Technology
Principles of Economics
Malaysian Legal Studies
Principles of Management
Building Services
Appreciation of Ethics and Civilization
Co-Curriculum
Principles of Measurement for Construction Works I
Materials and Structure in Construction
Construction Economics
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
Measurement of Advanced Construction Works II
QS Practices in Construction
Construction Project Management
Digital Construction
Data Analytics
Research Methodology for Quantity Surveying
Professional Internship I
Professional Internship II
Measurement of Civil Engineering Works
Construction Business & Development
Construction Legal Studies
Integrated Project II
Research Project
Risk and Value Management
QS Practices in Building Conservation
Facilities Management', 'https://study.um.edu.my/bachelor-of-quantity-surveying', '2026-10-14T05:45:29.446Z'),
    ('um', 'UM_BACHELOR_025', 'English I
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
Planning Studio IV – Local Development Planning
GIS and Urban Analytics
Planning Legislations and Governance
Quantitative Analysis in Planning
Sustainable Community Development
Appreciation of Ethics and Civilisations
Planning Studio V – Regional Development Planning
Development and Property Appraisal
Rural and Regional Planning
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
Sustainable Tourism Planning
Technologies in Urban Planning
Environmental Studies
Communication in Planning', 'https://study.um.edu.my/bachelor-of-urban-and-regional-planning', '2026-10-14T05:45:31.448Z'),
    ('um', 'UM_BACHELOR_026', 'Philosophy and Current Issues / *Basic Malay Language
English I
Introduction to Real Estate Valuations
Introduction to Law
Fundamentals of Economics
Accounting
Appreciation of Ethics and Civilizations
English II
Market Approach and Cost Approach in Real Estate Valuation
Land Law
Principle and Practice of Urban Planning
Basic Building Technology
Basic Entrepreneurship Enculturation
Income Approach of Real Estate Valuation I
Real Estate Law
Land Economics
Building Maintenance and Services
Co-Curriculum
Income Approach of Real Estate Valuation II
Strata Law
Real Estate Investment Analysis
Property Management
Property Taxation and Land Acquisition
Real Estate Marketing and Agency
Real Estate Market Analysis
Research Methodology
Real Estate and Community
Real Estate Finance Analysis
Corporate Real Estate Asset Management
Real Estate Development Appraisal
Ethics and Professional Practice
Real Estate Academic Project
Integrated Real Estate Project
Industrial Training
Facilities Management
Statistics for Real Estate
Business Valuation', 'https://study.um.edu.my/bachelor-of-real-estate', '2026-10-14T05:45:33.468Z'),
    ('um', 'UM_BACHELOR_029', 'Management
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
Cluster: Thinking Matter
Cluster: Emotional & Spiritual Intelligence
Cluster: Global Issue & Community Sustainability
Attach@Industry
Independent Research
Community Service
Talent Development
Volunteerism
Human Resource Management
Operations Management
Marketing
Operations and Information Systems Management
Entrepreneurship (Replaces GKU1001)
Financial Management
Cluster: Thinking Matters
Cluster: Global Issue & Community
Management Accounting
Strategic Management
Business Ethics & Corporate Governance
Industrial Training
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
Sales Management
E-Commerce
Retailing
Digital Marketing
Global Marketing
Hospitality Management
Integrated Marketing Communications
Services Marketing
Branding
Islamic Marketing
Marketing Analytics
Business Data Communication
Business Data Management
Business Analysis and Systems Design
Business Application Development
Supply Chain Management
Strategic Information Systems
Logistics Management
Sustainable Operations and Supply Chain Management
Business Modelling for Decision Making
Basic of Malaysian Taxation
Islamic Financial System
Investment Management
Global Finance
Money and Banking
Financial Services Marketing
Insurance and Risk Management
Applied Financial Planning
Bank Management', 'https://study.um.edu.my/bachelor-of-business-administration', '2026-10-14T05:45:35.455Z'),
    ('um', 'UM_BACHELOR_028', 'Principles of Macroeconomics
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
Business Ethics & Corporate Governance
Advanced Accounting Information System
Accounting Theory and Practice
Seminar in Management Accounting
Information Technology (IT) Auditing
Banking Operations and Reporting
Integrated Case Study
Industrial Training
ICAEW
CPA Australia
MICPA
CIF1001 Principles of Marketing
CIX1004 Quantitative Analysis for Business
CIA3013 Advanced Taxation: Planning and Compliance', 'https://study.um.edu.my/bachelor-in-accounting', '2026-10-14T05:45:37.472Z'),
    ('um', 'UM_BACHELOR_030', 'Philosophy and Current Issues
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
Entrepreneurship
Bank Management
Financial Modelling and Mathematics
Derivative Markets
Insurance and Risk Management
Applied Financial Planning
Business Ethics & Corporate Governance
Risk Management and Financial Instruments
Financial Statement Analysis
Advanced Corporate Finance
Islamic Banking
Co-curriculum
Cases In Finance
Fixed Income Markets and Instruments
Industrial Training
Cluster 1: Thinking Matters: Mind and Intellect
Cluster 2: Emotional and Spiritual Intelligence: Heart and Soul
Cluster 3: Global Issue and Community Sustainability: Making the World a Better Place
Cluster 4: Technology / Artificial Intelligence & Data Analytics: I-Techie
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
    ('um', 'UM_BACHELOR_031', 'Philosophy and Current Issues / Malay Language Communication
English Communication Courses
Microeconomics I
Statistics I
Politics and Public Administration
Introduction to Financial Mathematics and Accounting
English Communication Course
Appreciation of Ethics and Civilisations
Mathematics
Statistics II
Programming Tools for Economics
Co-Curriculum
Basic Entrepreneurship Enculturation
Microeconomics II
Introduction to Computer Assisted Data Analysis
Mathematical Economics
Econometrics I
Malaysian Economy in Globalised World
Development Economics
Public Policy and Economy
Econometrics II
Research Methodology
Macroeconomics III
Development of Economic Thought
Critical Thinking in Economics
Academic Research
Industrial Training
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
Survey and Sampling Methods
Data Analysis
Management Science
Demographic Techniques and Applications
Advanced Statistics
Actuarial Mathematics
Applied Analytics
Design of Experiments', 'https://study.um.edu.my/bachelor-of-economics', '2026-10-14T05:45:41.484Z'),
    ('um', 'UM_BACHELOR_033', 'Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Introduction to Data Science
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
System Analysis and Design
Mobile Application Development
Co-Curriculum (1)
Algorithm Design and Analysis (#WIA1002)
Internet of Things (#WIA1005)
Knowledge Representation and Reasoning
Computing Mathematics II
Cognitive Science
Industrial Training *
Academic Project I **
Natural Language Processing
Autonomous Robots
Deep Learning
Computer Vision and Pattern Recognition
Virtual Reality
Co-Curriculum (2)
Academic Project II (#WIA3002)
Functional and Logic Programming
Fuzzy Logic (#WIX1001)
Practical Artificial Intelligence
Numerical Analysis
Evolutionary Computation', 'https://study.um.edu.my/bachelor-of-computer-science-artificial-intelligence', '2026-10-14T05:45:43.497Z'),
    ('um', 'UM_BACHELOR_035', 'Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Thinking and Communication Skills
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
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Co-Curriculum (2)
Academic Project II (#WIA3002)
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
    ('um', 'UM_BACHELOR_032', 'Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Introduction to Data Science
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
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Co-Curriculum (2)
Academic Project II (#WIA3002)
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
    ('um', 'UM_BACHELOR_036', 'Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Thinking and Communication Skills
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
Mobile Application Development
Co-Curriculum (1)
Operating Systems
Algorithm Design and Analysis (#WIA1002)
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Co-Curriculum (2)
Academic Project II (#WIA3002)
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
    ('um', 'UM_BACHELOR_037', 'Basic Entrepreneurship Culture
Computing Mathematics I
Fundamentals of Programming
Computer System and Organization
Information Systems
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
Data Science Project
Data Science Industrial Training
Professional Development*
Data Science and Application*
Industrial Solution Development*
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
    ('um', 'UM_BACHELOR_034', 'Basic Entrepreneurship Culture
English for Communication (1)
Computing Mathematics I
Fundamentals of Programming
Computer Systems and Organization
Information Systems
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
KIAR: Integrity and Anti-Corruption course
Industrial Training *
Academic Project I **
Co-Curriculum (2)
Academic Project II (#WIA3002)
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
    ('um', 'UM_BACHELOR_041', 'Appreciation of Ethics and Civilisations
English Communication Programme
Co-Curriculum
Word Dance Culture
Dance Notation I
Kesuma Ensemble I
Uma Ensemble I
Dance Technique I
Anatomy And Injury
Malay Classical Dance I
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
Year End Project (P)
Ensemble Kesuma V
Production Management And Stage Management
Uma Ensemble V
Kesuma Ensemble VI
Dance For Children
Industrial Training
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_039', 'Appreciation of Ethics and Civilizations
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
Entrepreneurship Enculturation
Research Methodology For Performing Arts
Context And Aesthetic In Performance
Philosophy And Drama
Arts Criticism
Western Theatre
Co-Curriculum
Drama In Education
Topics In Drama And Theatre
Final Year Academic Project
Drama Performing Arts Project
Arts Marketing
Industrial Training
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_038', 'Appreciation of Ethics and Civilization
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
Advanced Aural and Musicianship
Principal Study II
Secondary Study II
Music Ensemble II
Tonal Harmony
History of Western Music: Classical and Beyond
Performing Arts Theory
Computer Music I
Principal Study III
Orchestra I
Chamber Music
Advanced Tonal Harmony
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
Music Ensemble IV
Electronic Composition
Industrial Training
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
SHE 3 - Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE 4 - Global Issues & Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_040', 'Philosophy and Current Issues (W)
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
Penghayatan Etika dan Peradaban
Research Methodology for Performing Arts
World Music Culture
Music Ensemble IV
Context and Aesthetic in Performance
Stage Combat
Asian Theatre Survey
Dance Ethnology Seminar
Malay Folk Dance II
UMa Ensemble II
Final Year Project (P)
Traditional Malay Music
Introduction to Music Education
Stage Acting
Arts Management
Set and Prop Design
Production Management and Stage Management
Dance Education
Co-Curriculum
Music Appreciation
Songwriting
Lighting Design and Technology
Children’s Theatre Production
Practicum in MakeUp for Effect
Dance for Children
Dance Criticism
Industrial Training
SHE 1 - Thinking Matters: Mind & Intellect
SHE 2 - Emotional, Physical & Spiritual Intelligence: Heart, Body & Soul
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
    ('um', 'UM_BACHELOR_043', 'Oral Biology
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
Community Dentistry IV
Operative & Endodontic III
Paediatric Dentistry III
Orthodontics III
Prosthodontics III
Oral & Maxillofacial Surgery III
General Dental Practice III
List of University Courses
Philosophy and Current Issues
Appreciation to Ethics and Civilisations
Master English VI
Advance Communication Skills
Basic Entrepreneurship Culture
Presentation Skills in English
Advance Professional Writing
Basic Malay Language
Appreciation of Ethics and Civilisations
Information Literacy
Mastering English VI', 'https://study.um.edu.my/bachelor-of-dental-surgery', '2026-10-14T05:46:05.579Z'),
    ('um', 'UM_BACHELOR_044', '*Philosophy and Current Issues
**Malay Language Communication
Introduction to Psychology
Developmental Psychology
Appreciation of Ethics and Civilizations
English Communication Course 1
Educational Development in Malaysia
Introduction to Counselling Psychology
Social Psychology
Counseling Theories
Development in Adult Stage
Program Organization for Counselling Services
Co-curriculum Courses
Basic Entrepreneurship Enculturation
Career Development Theory
Counseling Techniques
English Communication Course 2
Education and Research
Group Leadership
Basic Statistics for the Behavioral Science
Career and Vocational Counselling
Advanced Counseling Technique
Human Development from Islamic Perspective
Online Counseling
Research Project (P1)
Group Dynamic and Procedure
Psychological Testing and Measurement
Abnormal Psychology
Educational Psychology
Research Project (P2)
Cross-Cultural Counselling
Marriage and Family Counseling
Rehabilitation Counselling
Counselling in Higher Learning Institution
Education and Society
Professional Issues and Ethics in Counselling and Psychology
Counseling Practicum (Laboratory)
Counseling Children and Adolescent
Internship
Technology Application in Counseling Services
Personality
Industrial and Organizational Psychology
Behavior Modification
Addiction and Recovery Counselling
Clinical Mental Health Counseling
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-counseling', '2026-10-14T05:46:07.579Z'),
    ('um', 'UM_BACHELOR_045', '*Philosophy and Current Issues
**Malay Language Communication
Educational Development in Malaysia
Physical and Health Education
Foundations of TESL Methodology
Linguistics for Language Teachers
Appreciation of Ethics and Civilizations
English Communication Course 1
Educational Psychology
Grammar in the ESL Classroom
Listening and Speaking in the ESL Classroom
Phonetics and Phonology
Fundamentals of Visual Art Design
Philosophy and Moral Development
Physical Fitness and Health
Introduction to Methodology in Literature Education
Basic Entrepreneurship Culture
Education and Society
Reading in the ESL Classroom
Writing in the ESL Classroom
Language Learning and Language Use
3-Dimensional Design
Moral Education and Religion
Basics Measurement and Evaluation in Physical and Health Education
Interpretations of Literary Texts in Schools
English Communication Course 2
Communication & Innovation in Education
Self-Leadership and Co-Curricular Management
Writing Skills for Textual Analysis
Syllabus Design and Materials Development
Curriculum and Assessment in Visual Art Education
Moral Education Curriculum
Motor Learning Principles
Teaching Literary Genres
Appreciation and Fundamentals of Art Criticism
Approach and Assessment in Moral Education
Athletics Education
Simulated Teaching in Literature Education
Industrial Experience
Ethics and Legislation in Education
Assessment and Evaluation for ESL
Foundations of Research in TESL
Simulated Teaching in TESL
Micro Teaching in Visual Arts Education
Micro Teaching in Moral Education
Micro Teaching in Physical and Health Education
Performance in Literature Education
Practicum
Co-curriculum
Education and Research
Academic Project (P1)
Academic Writing
Integrative Seminar: Issues In TESL
Academic Project (P2)
Behaviour Modification
Personality
Introduction to Special Education
Comparative Education
Multimedia in Teaching
Akhlak and Professional Ethics
Statistical Reasoning in Educational Research
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
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-teaching-english-as-second-language', '2026-10-14T05:46:09.608Z'),
    ('um', 'UM_BACHELOR_046', 'Educational Development in Malaysia
Introduction to Special Education
Art and Craft
Child Development
Gifted and Talented Children
Language Arts Teaching
Appreciation of Ethics and Civilisations
English Communication Course 1
Education and Research
Application of Computer in Instruction
Play and Development
Music and Movement
Reading and Literature for Early Childhood
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
Research Methods in Early Childhood Education
Program Planning and Teaching Strategy I
Assessment of Learning in Early Childhood Education
Statistics for Early Childhood Education
Digital Audio Technology in Early Childhood Education
Child-rearing Practices in Malaysia
Teaching Practice (Nursery)
Co-curriculum
Leadership and Early Childhood Management
Teaching Strategy and Programme Planning II
Policy and Legal Literacy in Early Childhood Education
Industrial Orientation for Special Education
Early Childhood Education Research Project (P1)
Digital Technology and Innovation in Teaching
Islamic Child Rearing Practices
Teaching Practice (Kindergarten)
Early Childhood Education Research Project (P2)
SHE Cluster I: Thinking Matters: Mind and Intellect
SHE Cluster II: Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
SHE Cluster III: Technology/Artificial Intelligence and Data Analytics: I-Techie
SHE Cluster IV: Global Issues and Community Sustainability: Making The World A Better Place', 'https://study.um.edu.my/bachelor-of-childhood-education', '2026-10-14T05:46:11.601Z'),
    ('um', 'UM_BACHELOR_047', 'Philosophy and Current Issues* / Bahasa Melayu Komunikasi **
Basic Enculturation Entrepreneurship
English Communication I
Appreciation of Ethics and Civilisations
English Communication II
Engineering Mathematics 1
Engineering Mathematics 2
Engineering Mechanics
Civil Engineering Materials
Civil Engineering Drawing And CAD
Mechanics Of Materials
Engineering Survey
Programming And Information System
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
    ('um', 'UM_BACHELOR_048', 'Philosophy And Current Issues* / Bahasa Melayu Komunikasi **
English Communication Programme I
Appreciation of Ethics and Civilisations
English Communication II
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
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body & Soul
Technology/Artificial Intelligence and Data Analytics: I-Techie
Global Issues and Community Sustainability: Making the World a Better Place
Engineering Economics and Project Management
Sustainability and Practice in Biomedical Engineering
Biomedical Signal Processing
Medical Imaging
Experimental and Computational Biomechanics
Biomedical Integrate Design Project 1
Biomedical Integrate Design Project 2
Industrial Training
Co-Curriculum
Final Year Project (P)
Biomedical Field
Prosthetics and Orthotics Field
Electrical Safety Design of Medical Devices and System
Photonics in Biomedical Engineering
Biomedical Control System
Microcomputer and Digital System
Medical Electronics
Instrumentation and Measurement
Computational Modelling in Biomedical Engineering
Healthcare Technology and Clinical Management
Artificial Intelligence in Biomedical Engineering
Biomechanics in Prosthetics and Orthotics
Below Knee Prosthetics
Principles of Upper Limb Prosthetics and Orthotics Design
Principles of Lower Limb Orthotics Design
Above Knee Prosthetics
Industrial Prosthetics Design
Industrial Orthotics Design
Practice Management in Prosthetic and Orthotics
Advanced Prosthetics and Orthotics Engineering
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
    ('um', 'UM_BACHELOR_050', 'Philosophy and Current Issues* / Bahasa Melayu Komunikasi**
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
Materials Selection in Mechanical Design
Production and Operations Management
Final Year Project 1
Final Year Project 2
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
    ('um', 'UM_BACHELOR_049', 'Philosophy and Current Issues* / Malay Language Communication**
English Communication Programme I
Appreciation of Ethics and Civilisations
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
Electrical Energy Conversion Technologies
Renewable Energy Technologies
High Voltage Engineering
Electrical Power Quality
Power System Economics
Wireless Communication
Optical Communication
Antenna and Propagation
Data Communication Networks
VLSI Design
Analog VLSI Circuit Design
Microwave Electronics and Systems
Analog Electronics Design
Embedded Systems
Digital Control System
Optimization Methods
Machine Learning
Human-Computer Interaction
Data Analytics', 'https://study.um.edu.my/bachelor-of-electrical-engineering', '2026-10-14T05:46:19.644Z'),
    ('um', 'UM_BACHELOR_051', 'Philosophy and Current Issues* / Bahasa Melayu Komunikasi**
English Communication I
Appreciation of Ethics and Civilisations
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
Design Project
Research Project
Sustainable Development in Engineering
Air Pollution Fundamental
Solid Waste Management
Waste Water Treatment
Petroleum Engineering
Membrane Technology and Processes
Nanotechnology for Energy Conversion and Storage
Technology, Globalization and Sustainable Development
Current Technologies in Oleochemicals Industry
Natural Gas Engineering
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
    ('um', 'UM_BACHELOR_060', 'Philosophy and Current Issues / or Basic Malay Language*
Introduction to Linguistics
Understanding English Grammar
Effective Writing
Speaking and Presentation Skills
History of English
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Critical Reading
Phonetics and Phonology
Copyediting in English
English and the Performing Arts
Introduction to Sociolinguistics
Morphology and Syntax
World English''s
Computer Mediated Communication
Multimodal Discourse
GQX0056 (KIAR) Integrity and Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
Analyzing Spoken Discourse
Lexical Meaning
Intercultural Communication
Co-curriculum
Introduction to Semantics and Pragmatics
Analyzing Text
Trends of English in the ASEAN Region
Language in Literary Texts
Academic Project Writing
Final Year Project
English for Specific Purposes
Professional Communication
Industrial Training', 'https://study.um.edu.my/bachelor-of-english-language-and-linguistics', '2026-10-14T05:46:23.662Z'),
    ('um', 'UM_BACHELOR_054', 'Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistics
Chinese Language Competency
Phonetics and Phonology of Modern Chinese
Chinese Language and Poetry
Basic Entrepreneurship Enculturation
English for Communication* or / Foreign Language Course
Research Methodology
Chinese Language Competency II
Morphosyntax of Modern Chinese Language
Linguistics Theories in the Context of the Chinese Language
Introduction to Sociolinguistics
Chinese Language Competency III
Translation Theories and Practices
Chinese Language for Mass Media
Chinese Language Text Analysis
GQX0056 (KIAR) Integrity and Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
Chinese Language Competency IV
Language and Chinese Society
Chinese Dialectology
Chinese Language for Advertising
Co-curriculum
Introduction to Semantics and Pragmatics
Chinese Language Competency V
The History of Chinese Language
Chinese Language Varieties
Chinese Characters and Chinese Culture
Final Year Project
Chinese Language Competency VI
Acquisition of Chinese as a Second Language
English Chinese Translation
Industrial Training', 'https://study.um.edu.my/bachelor-of-chinese-language-and-linguistics', '2026-10-14T05:46:25.663Z'),
    ('um', 'UM_BACHELOR_052', 'Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
Arabic Language Enrichment and Language Style
Reading and Writing 1
Listening and Speaking 1
Arabic Language for Media and IT
Functional Grammar 1
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
GQX0056 Integrity and Anti-Corruption Course (KIAR)
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Functional Grammar 4
Bayan
Arabic Lexicography and Semantic
Dialects and Qira’at
Two-Way Arabic-Malay Translation 1
Linguistics of al-Quran and Hadith
Co-curriculum
Introduction to Semantics and Pragmatics
Functional Morphology 3
Badi’
Arabic Discourse Analysis
History of Grammatical and Rhetoric
Arabic Phonetic and Phonology
Arabic Language for Health and Sports
Arabic Language for Diplomatic and International Relation
Introduction to Arabic Psycho-sociolinguistics
Introduction to Arabic Language Learning
Final Year Project
Prosody and Rhyme
Two-Way Arabic-Malay Translation 2
History of Arabic Literature
Arabic Language for Administration and Economy
Analysis of Arabic Literature Text
Literary Criticism in Arabic Literature
Industrial Training
Arabic Language for Diplomatic and International', 'https://study.um.edu.my/bachelor-of-arabic-language-and-linguistics', '2026-10-14T05:46:27.670Z'),
    ('um', 'UM_BACHELOR_055', 'Philosophy and Current Issues / or Basic Malay Language*
Introduction to Linguistic
Tamil Language Competency I
Phonology of Modern Tamil
Tamil Language for Information Communication Technology
History of Tamil Language
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Tamil Competency II
Morphology of Modern Tamil
Tamil Language for Information Communication Technology II
Language, Society and Tamil Culture
Introduction to Sociolinguistics
Tamil Language Competency III
Syntax of Modern Tamil
Critical and Creative Thinking in Tamil
Tamil Language in Print Media Advertisement
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Tamil Language Competency IV
Tamil Text Analysis
Tamil Lexical Semantic
Tamil Language in Digital Media
Co-curriculum
Introduction to Semantics and Pragmatics
Tamil Competency V
Academic Genres and Research Fields in Tamil
Translation Theories and Practices
Tamil Language in Digital Marketing
Final Year Project
Tamil Language Competency VI
Tamil Dialects
Translation in Specific Field
Language and Tamil Civilization
Industrial Training', 'https://study.um.edu.my/bachelor-of-tamil-language-and-linguistics', '2026-10-14T05:46:29.663Z'),
    ('um', 'UM_BACHELOR_053', 'Analyzing Texts in Japanese
Appreciation of Ethics and Civilisations
Basic Entrepreneurship Enculturation
Basic Malay Language *
Co-Curriculum
Didactics of Japanese Language Skills
English for Communication
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
Two-Way Translation in Japanese', 'https://study.um.edu.my/bachelor-of-japanese-language-and-linguistic', '2026-10-14T05:46:31.676Z'),
    ('um', 'UM_BACHELOR_056', 'Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
French Language Skills Level I
French Language Skills Level II
Basic Entrepreneurship Enculturation
English for Communication* or Foreign Language Course
Research Methodology
French Language Skills Level III
French Language Skills Level IV
Introduction to Sociolinguistics
French Language Skills Level V
French Language Skills Level VI
French Language Reading Skills
French Language Listening and Speaking Skills
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Phonetics and Phonology of French
French Language and Civilization
French Language Writing Skills I
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of French Language
French Language and Literature
French Language Writing Skills II
Analyzing Texts in French
Didactics of French Language Skills
Final Year Project
Two-Way Translation in French
French for Communication and Tourism
French Language for Administration and Business
Industrial Training', 'https://study.um.edu.my/bachelor-of-french-language-and-linguistics', '2026-10-14T05:46:33.690Z'),
    ('um', 'UM_BACHELOR_057', 'Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
German Language Skills Level I
German Language Skills Level II
Basic Entrepreneurship Enculturation
English for Communication*/ or Foreign Language Course
Research Methodology
German Language Skills Level III
German Language Skills Level IV
Introduction to Sociolinguistics
German Language Skills Level V
German Language Skills Level VI
German Language Reading Skills
Jerman/German Language Listening and Speaking Skills
GQX0056 (KIAR) Integrity And Anti-Corruption Course
Appreciation of Ethics and Civilizations
Language Acquisition
Language in Technology and New Media
German Phonetics and Phonology
German Language and Civilization
German Language Writing Skills I
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of German Language
German Language and Literature
German Language Writing Skills II
Analyzing Texts in German
Didactics of German Language Skills
Final Year Project
Two-Way Translation in German
German for Communication and Tourism
German Language for Business and Administration
Industrial Training', 'https://study.um.edu.my/bachelor-of-german-language-and-linguistics', '2026-10-14T05:46:35.698Z'),
    ('um', 'UM_BACHELOR_058', 'Philosophy and Current Issues or / Basic Malay Language*
Introduction to Linguistic
Spanish Language Skills Level I
Spanish Language Skills Level II
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Spanish Language Skills Level III
Spanish Language Skills Level IV
Introduction to Sociolinguistics
Spanish Language Skills Level V
Spanish Language Skills Level VI
Spanish Language Reading Skills
Spanish Language Listening and Speaking Skills
GQX0056 (KIAR) Integrity And Anti-Corruption Course
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
Final Year Project
Two-Way Translation in Spanish
Spanish for Communication and Tourism
Spanish Language for Administration and Business
Industrial Training', 'https://study.um.edu.my/bachelor-of-spanish-language-and-linguistics', '2026-10-14T05:46:37.702Z'),
    ('um', 'UM_BACHELOR_059', 'Philosophy and Current Issues / or Basic Malay language*
Introduction to Linguistic
Italian Language Skills Level I
Italian Language Skills Level II
Basic Entrepreneurship Enculturation
English for Communication* / or Foreign Language Course
Research Methodology
Italian Language Skills Level III
Italian Language Skills Level IV
Introduction to Sociolinguistics
Italian Language Skills Level V
Italian Language Skills Level VI
Italian Language Reading Skills
Italian Language Listening and Speaking Skills
GQX0056 (KIAR) Integrity And Anti-Corruption Course
Appreciation of Ethics and Civilisations
Language Acquisition
Language in Technology and New Media
Italian Phonetics and Phonology
Italian Language and Civilization
Italian Language Writing Skills I
Co-curriculum
Introduction to Semantics and Pragmatics
Morphosyntax of Italian Language
Italian Language and Literature
Italian Language Writing Skills II
Analysing Texts in Italian Language
Didactics of Italian Language Skills
Final Year Project
Two-Way Translation in Italian
Italian for Communication and Tourism
Italian for Administration and Business
Industrial Training', 'https://study.um.edu.my/bachelor-of-italian-language-and-linguistics', '2026-10-14T05:46:39.713Z'),
    ('um', 'UM_BACHELOR_065', 'Basic Entrepreneurship Enculturation
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
Appreciation of Ethics and Civilizations
Pharmaceutical Analysis
Pharmaceutical Dosage Form Design for Liquids and Semisolids
Medicinal Chemistry
Pharmacotherapy for Immune Disorders
Pharmacotherapy for Fungal and Viral Infections
Co-curriculum
Chromatography, Electrochemistry and Radiochemistry
Sterile Pharmaceutical Dosage Form Design
Pharmacotherapy for Cardiovascular Disorders
Pharmacotherapy for Psychiatric and Neurological Disorders
Solid Pharmaceutical Dosage Form Design
Clinical Toxicology
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
Pharmacoinformatics
Nutrition and Health Supplement
Pharmaceutical Microbiology
Traditional and Complementary Medicine
Cosmetic Products
Emerging Topics in Pharmacy', 'https://study.um.edu.my/bachelor-of-pharmacy-with-honours', '2026-10-14T05:46:49.748Z'),
    ('um', 'UM_BACHELOR_066', 'Philosophy and Current Issues / Basic Malay Language*
English Language / Foreign Language**
Science, Technology & Society
Statistics
Principles of Chemistry
Organic Chemistry I
Safety and Basic Laboratory Techniques
Thinking Matters: Mind & Intellect
Appreciation of Ethics and Civilizations
Basic Entrepreneurship Enculturation
Co-Curriculum
Inorganic Chemistry I
Physical Chemistry I
Mathematics in Chemistry
Laboratory Skills
Emotional & Spiritual Intelligence: Heart & Soul
Inorganic Chemistry II
Practical of Inorganic Chemistry II
Organic Chemistry II
Practical of Organic Chemistry II
Computer Programming for Sciences
Spectroscopic Methods in Organic Chemistry
Technology / Artificial Intelligence and Data Analytics: i-Techie
Basic Analytical Chemistry
Molecular Spectroscopy
Physical Chemistry II
Practical of Chemistry II
Chemistry and Society
Global Issue and Community Sustainability: Making the World a Better Place
Inorganic Chemistry III
Practical of Inorganic Chemistry III
Research Project (Progressive) - OPTION 1
Organic Chemistry III
Practical of Organic Chemistry III
Physical Chemistry III
Practical of Physical Chemistry III
Industrial Training - OPTION 1
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_067', 'English Language / Foreign Language**
Appreciation of Ethics and Civilizations
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Cell Biology
Introduction to Computer Programming in Bioinformatics
Thinking Matters: Mind & Intellect
Global Issue and Community Sustainability: Making the World a Better Place
Statistics
Bioethics and Safety
Environmental Sustainability
Bioinformatics Concepts
Technology / Artificial Intelligence and Data Analytics: i-Technie
Integrity and Anti-Corruption
Plant Diversity
Vertebrate Biology
Phycology
Protozoa and Invertebrate I
Urban Zoology
Terrestrial Ecology
Plant Physiology
Key Issues in Climate Change
Ecosystem-based Management
Principles of Systematics
Mycology
Invertebrate II
Bioinformatics Data Management
Introductory Microbiology
Aquatic Ecology
Animal Physiology
Renewable Energy Transition and Society
Green Agriculture
Sustainable Food Systems
Research Project for Ecology and Biodiversity
Behavioral Ecology and Ethology
Quantitative Ecology
Biological Data Analytics
Economic Botany
Ecology and Management of Weeds
Parasitology
Economic Entomology
Aquaculture Biotechnology
Population and Community Ecology
Scientific Communication
Molecular Ecology and Applications
Plant Pathology
Horticulture and Landscape
Integrated Pest Management
Ecotoxicology
Slope Eco-engineering Techniques
Biodiversity Governance and Conservation
Nature and Society
Soil Ecology and Management
Fisheries Ecology and Management
Ecotourism
Bioimage Processing and Analysis
Population Genetics
Industrial Training for Ecology and Biodiversity', 'https://study.um.edu.my/bachelor-of-science-in-ecology', '2026-10-14T05:46:53.767Z'),
    ('um', 'UM_BACHELOR_068', 'Ethical appreciation and civilization
Co-Curriculum
English 1
Thermal Physics
Electronics I
Practical Physics 1
Vibrations and Waves
Mathematical Methods I
Basic Entrepreneurship Culture
English 2
Quantum Physics
Mathematical Methods II
Statistics
Electronic Practical or Physics Practical II or Applied Physics Practical
Science, Technology and Society
Integrity and Anti-Corruption
Mechanics I
Quantum Mechanics I
Electromagnetism I
Electronics Practical or Physics Practical II or Applied Physics Practical
Mathematical Methods III
Thinking Matters: Mind & Intellect
Electromagnetism II
Statistical Physics
Numerical and Computational Methods
Mechanics II
Optics
Nuclear Physics
Solid State State Physics
Technology / Artificial Intelligence and Data Analytics: i-Technie
Atomic Molecular Physics
Physics for Work
Global Issue and Community Sustainability: Making the World a Better Place
Project
Industrial Training
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_076', 'English Language / Foreign Language**
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Bioinformatics Concepts
Introduction to Computer Programming in Bioinformatics
Thinking Matters: Mind & Intellect
Global Issue and Community Sustainability: Making the World a Better Place
Statistics
Bioethics and Safety
Environmental Sustainability
Analytical Environmental Chemistry
Technology / Artificial Intelligence and Data Analytics: i-Technie
Appreciation of Ethics and Civilizations
Principles of Waste Management
Soil Science and Community
Environmental Health and Safety
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
Environmental Governance
Environmental Informatics
Renewable Energy Transition and Society
Air Pollution Control
Disaster Management
Organisms and Environment
Aquatic Ecology
Integrity and Anti-Corruption
Environmental Management System
Integrated Waste Management
Environmental Management Research Project (P)
Introduction to Administrative Management
Technology and Management of Hazardous Waste
Tourism and Environment
Introduction to Bioremediation
Environmental Well-Being
Sustainable Food Systems
Industrial Training (P)', 'https://study.um.edu.my/bachelor-of-science-in-environment', '2026-10-14T05:46:57.797Z'),
    ('um', 'UM_BACHELOR_069', 'Basic Entrepreneurship Culture
Co-Curriculum
English Language
Statistics
Introduction to the Earth
Earth Surface Processes
Geological Structures and Maps
Integrity and Anti-Corruption
Philosophy and Current Issues / Malay Language Communication*
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
Paleontology
Geology and Community
Geochemistry
GIS Applications in Geosciences
Geology Laboratory Analytical Techniques
Mineral Resources
Geology of Malaysia
Thinking Matters: Mind & Intellect
Geology Research Project
Technology / Artificial Intelligence and Data Analytics: i-Technie
Global Issue and Community Sustainability: Making the World a Better Place
Industrial Attachment
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Global Issues and Community Sustainability: Making the World a Better Place
Geological Data Analysis
Marine Geology
Karst Geomorphology and Conservations
Climate Change and Adaptation
Engineering Geology
Earth Water Resources
Environmental Geology
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
    ('um', 'UM_BACHELOR_070', 'Basic Entrepreneurship Enculturation
English Language / Foreign Language**
Co-Curriculum
Science, Technology and Society
Bioethics and Safety
Biochemistry of Cells
Principles of Biochemical Techniques
Philosophy and Current Issues / Malay Language Communication*
Statistics
Fundamentals of Chemistry
Introduction to Computational Biology
Basic Physics
Appreciation of Ethics and Civilizations
Structure and Function of Biomolecules
Metabolism and Regulation of Carbohydrate and Lipids
Protein Biochemistry
Practical Biochemistry I
Nutritional Biochemistry
Toxicology
Functional Anatomy and Physiology
Metabolism and Regulation of Amino Acids and Nucleotides
Molecular Biology
Enzymes: Mechanism and Control
Biochemistry Practical II
Scientific and Research Communication
Integrity and Anti-Corruption
Food Process Biochemistry
Microbial Biochemistry
Research Project in Biochemistry
Membrane Biochemistry and Cell Signaling
Advanced Molecular Biology
Biochemistry of Hormones
Natural Product Biochemistry and Drug Discovery
Fundamentals of Biochemical Pharmacology
Structural Biology Techniques
Epigenetics and RNA Biology
Clinical Biochemistry and Physiology
Cellular and Molecular Immunology
Thinking Matters: Mind & Intellect
Post-Genomic Technologies and Bioinformatics
Biochemistry of Cancer
Neurochemistry
Design Thinking and Knowledge Transfer
Plant Molecular Biology
Glycobiology
Computational Biochemistry', 'https://study.um.edu.my/bachelor-of-science-in-biochemistry', '2026-10-14T05:47:03.821Z'),
    ('um', 'UM_BACHELOR_071', 'Philosophy and Current Issues / Malay Language Communication*
Statistics
Basic Mathematics
Calculus I
Fundamentals of Computing
Emotional & Spiritual Intelligence: Heart & Soul
Appreciation of Ethics and Civilizations
Science, Technology and Society
Ordinary Differential Equations
Calculus II
Fundamentals of Spreadsheets
Integrity and Anti-Corruption
Basic Entrepreneurship Culture
Co-Curriculum
Probability and Statistics I
Advanced Calculus
Linear Algebra
Appreciation of Mathematics
Technology / Artificial Intelligence and Data Analytics: i-Technie
Foundations of Data Science
Introduction to Analysis
Complex Variables
Numerical Computation
Structured Programming
Global Issue and Community Sustainability: Making the World a Better Place
Introduction to Combinatorics
Algebra I
Basic Operations Research
Partial Differential Equations
Industrial Training
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_072', 'Basic Entrepreneurship Enculturation
English Language / Foreign Language**
Co-Curriculum
Science, Technology and Society
Cell Biology
Biochemistry of Cells
Fundamental Techniques in Biological Sciences
Philosophy and Current Issues / Malay Language Communication*
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
Integrity and Anti-Corruption
Biological Data Analytics
Research Project in Biotechnology
Animal Nutrition and Feed Technology
Fermentation and Product Recovery
Marine Biotechnology
Plant Genetics and Breeding
Secondary Metabolites and Metabolomics
Thinking Matters: Mind & Intellect
Food Biotechnology
Cellular and Molecular
Aquaculture Biotechnology
Post-Harvest Process Engineering and Technology
Sustainable Food Systems
Animal Cell and Tissue Culture
Enzyme Technology
Technology / Artificial Intelligence and Data Analytics: i-Technie
Design Thinking and Knowledge Transfer
Bioproduct Business and Supply Chain
Animal Physiology
Applied Genomics in Animal Breeding
Environmental Biotechnology
Microbial Technology for Soil and Plant Health
Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training in Biotechnology', 'https://study.um.edu.my/bachelor-of-science-in-biotechnology', '2026-10-14T05:47:07.834Z'),
    ('um', 'UM_BACHELOR_073', 'Philosophy and Current Issues / Malay Language Communication*
Basic Entrepreneurs Culture
Basic Mathematics
Calculus I
Statistics
Integrity and Anti-Corruption
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
Thinking Matters: Mind & Intellect
Advanced Calculus
Linear Algebra
Appreciation of Mathematics
Actuarial Mathematics I
Portfolio Theory and Asset Models
Life Insurance and Takaful
Actuarial Mathematics II
Mathematics of Financial Derivatives
Risk Theory
Technology / Artificial Intelligence and Data Analytics: i-Technie
Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training
Industrial Training in Biotechnology
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_074', 'English Language / Foreign Language**
Basic Entrepreneurship Enculturation
Co-Curriculum
Science, Technology and Society
Bioethics and Safety
Introduction to Computational Biology
Fundamental Microbiology
Fundamental Genetics
Concepts of Genetic Engineering
Philosophy and Current Issues / Malay Language Communication*
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
Phycology
Basic Mathematics
Bioinformatics Concepts
Food Microbiology
Population Genetics
Cytogenetics
Immunology
Microbial Ecology
Genomes
Genetics and Molecular Biology Practical II
Biosafety and Biosecurity
Mycology
Parasitology
Calculus I
Introduction to Computer Programming in Bioinformatics
Advanced Food Microbiology
Molecular Evolution and Phylogenetics
Integrity and Anti-Corruption
Research Project
Bioinformatics Data Plant Management
Public Health Microbiology
Diagnostic Microbiology
Advanced Immunology
Eukaryotic Cell Signaling
Applied and Environmental Microbiology
Applied Genomics in Animal Genetics
Plant Molecular and Cellular Biology
Conservation Genetics
Plant Genetics and Breeding
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
Green Agriculture
Biological Data Analytics
Microbial Technologies for Soil and Plant Health
Genetic Basis of Cancer
Fermentation Technology
Pharmaceutical Microbiology
Thinking Matters: Mind & Intellect
Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training', 'https://study.um.edu.my/bachelor-of-science-in-microbiology-and-molecular-genetics', '2026-10-14T05:47:13.847Z'),
    ('um', 'UM_BACHELOR_075', 'Malay Language Communication / Basic Malay Civilisations Language*
Statistical Programming
Basic Mathematics
Calculus I
Integrity and Anti-Corruption
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
Thinking Matters: Mind & Intellect
Further Mathematical Statistics
Stochastic Processes
Regression Analysis
Introduction to Multivariate Analysis
Technology / Artificial Intelligence and Data Analytics: i-Technie
Co-Curriculum
Time Series and Forecasting Methods
Generalized Linear Models
Statistical Learning and Data Mining
Global Issue and Community Sustainability: Making the World a Better Place
Industrial Training
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
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
    ('um', 'UM_BACHELOR_077', 'History and Philosophy of Sports
Introduction to Sports Science
Sport Management
Basic Principles of Economy and Finance
Philosophy and Current Issues
English
Appreciation of Ethics and Civilizations
First Aid and CPR
Theories in Management and Organizations
Sport Sociology
Sport Economy
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
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
Fitness Management
Sport Industry
Sport and Recreational Management
Weight Training
Sport Psychology
Management of Sport Injuries
Sport Technology and Information Management
Sport Tourism
Organizational Behavior in Sport
Sport Policy and Governance
Sport High Performance Management
Community Sport Management
Athlete and Team Management
Media and Sport
Sport Leadership
E-Sport', 'https://study.um.edu.my/bachelor-of-sports-management', '2026-10-14T05:47:17.864Z'),
    ('um', 'UM_BACHELOR_078', 'Basic Entrepreneurship Culture
History and Philosophy of Sports
Introduction to Sports Science
Anatomy and Physiology I
*Philosophy and Current Issues
English
Appreciation of Ethics and Civilizations
First Aid and CPR
Artificial Intelligence in Sports
Anatomy and Physiology II
Basic Biomechanics
Fundamentals in Psychology
Testing and Measurement in Exercise and Sports
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
Research Project in Sport and Exercise Sciences
Exercise Prescription for Health and Fitness
Adapted Physical Activity
Applied Biomechanics
Individual and Group Fitness Program
Psychology Exercise for Special Population (EF)
Applied Exercise Physiology and Biochemistry (EP)
Exercise Science Internship
Thinking Matters: Mind and Intellect
Emotional, Physical and Spiritual Intelligence: Heart, Body and Soul
Technology/Artificial Intelligence and Data Analytics: I-techie
Global Issues and Community Sustainability: Making the World a Better Place
Fitness Management
Sport Industry
Sport and Recreational Management
Weight Training
Management of Sport Injuries
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
    ('taylor', 'TAYLOR_BACHELOR_026', 'Architectural Design I
Architecture History and Theory
Design Communication
Architectural Design II
Asian Architecture
Building Construction and Materials
Architecture and Environment
Architectural Design III
Computer Applications
Architectural Design IV
Building Services
Architectural Design V
Advanced Architectural Construction
Architectural Design Project
Architectural Project Management
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('taylor', 'TAYLOR_BACHELOR_028', 'Construction Technology I
Legal Studies
Environmental Science and Services
Fundamental Measurement & Costing
Construction Technology II
Building Services Technology
Advanced Measurement
Construction Economics & Management
Construction Project Management
Measurement Of Building Works & Costing
Procurement & Contract Administration
Quantity Surveying Studio 2
Value Engineering and Management
Construction Law & Dispute Resolution
Construction Research Project II
Industrial Training and Report
Engineering Measurement
Professional Practice
Construction Research Project I
Quantity Surveying Studio 1
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Sustainable Housing Development
Construction Supply Chain Management
Strategic Management in Construction
Occupational Health and Safety Management
Facility Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('taylor', 'TAYLOR_BACHELOR_025', 'Construction Management and Safety
Construction Technology I
Building Information Modelling I
Building Services
Construction Environmental Protection Management
Site Management
Construction Planning and Scheduling
Construction Technology II
Construction Law and Dispute Resolution
Construction Measurement and Estimating
Cash Flow Management and Construction Economics
Construction Research Project I
Tendering Management and Contract Administration
Internship
Construction Research Project II
Construction Quality Management / (WBL)
Industry Project I (WBL)
Industry Project II (WBL)
Internet of Things in Construction
Construction Simulation Project / (WBL)
Green Technology and Construction
Innovative Construction Materials
SMART Building Systems
Data Science Principles
Building Information Modelling II
Extended Reality in Construction
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('taylor', 'TAYLOR_BACHELOR_032', 'Anatomy & Physiology
Pathology & Microbiology
Molecular Biology & Genetics
Pharmacology & Toxicology
Research & Laboratory Training
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
Medical Parasitology
Medical Microbiology
Immunoloy
Applications of Bioinformatics
Clinical Genetics
Biomedical Practicum (Hospital Attachment module)
Research and Laboratory Management
Research Project
Nutritional Biochemistry
Applied Nutrition
Community Nutrition
Industrial Training
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Mass Communication
Education
Journalism and Media Practice
Event Management
Entrepreneurship
International Business
Management
Marketing
Finance
Nutrition with Wellness
Psychology
Pharmaceutical Industry Practice', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('taylor', 'TAYLOR_BACHELOR_030', 'Introduction to Food Science & Nutrition
Fundamentals of Chemistry
Introduction to Microbiology
Cell Biology
Principles of Biochemistry
Food Chemistry
Food Physics
Food Microbiology
Introduction to Biostatistics
Food & Nutrients Evaluation
Techniques in Food/Nutrition Research
Food Processing
Food Preservation
Food Product Development
Sensory Evaluation
Food Safety & Quality Management
Research Project
Industrial Training
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
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
Creative Media Design', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('taylor', 'TAYLOR_BACHELOR_031', 'Introduction to Biotechnology
Fundamentals of Chemistry
Introduction to Microbiology
Cell Biology
Principles of Biochemistry
Principle of Genetics
Molecules from Nature: Biodiversity and Natural Products
Techniques and Instrumentation in Biotechnology
Introduction to Biostatistics
Crop Biotechnology
Animal Biotechnology
Bioprocess Technology
Applications of Bioinformatics
Research and Laboratory Management
Trends in Applied and Synthetic Biotechnology
Understanding Entrepreneurialism
Research Project
Industrial Training
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
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
Psychology
Creative Media Design
Pharmaceutical Biotechnology', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('taylor', 'TAYLOR_BACHELOR_020', 'Business of Hospitality, Food and Leisure Management
Food Safety and Sanitation
Principles of Marketing
Principles of Culinary
Principles of Pastry and Baking
Celebration and Designer Cakes
Advanced Boulangerie
Science of Baking
Asian Patisserie and Desserts
Understanding Entrepreneurialism
French – Basic
Research Methods
Chocolate and Confectionery
The Art of Sugar and Chocolate Works
Sensory Evaluation of Food
Food Business Management
Research Project
Culinary Product Development
Creative Modern Pastry
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('taylor', 'TAYLOR_BACHELOR_019', 'Principles of Culinary
Principles of Pastry and Baking
Food Sociology
Culinology 101
Principles of Organic Chemistry
Arts and Sciences of Pastry and Baking
Applied Food Microbiology
Arts and Sciences of Food preparation
Research Methods
Experimental Food Products & Practices
Food Chemistry
Food Product Design and Development I
Sensory Evaluation of Food
Food Preservation
Food Packaging and Labelling
Aromatic Ingredients and Flavour Application
Food Product Design and Development II
Food Processing
Food Safety and Quality Management
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Introduction to Food Science and Nutrition
Introduction to Human Nutrition
Food and Nutrient Evaluation
Nutraceutical and Functional Food
Techniques in Food / Nutrition Research
Food Business Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('taylor', 'TAYLOR_BACHELOR_016', 'Business of Hospitality, Food and Leisure Management
Food Safety and Sanitation
Principles of Marketing
Principles of Culinary
Principles of Pastry and Baking
International Cuisine
Restaurant Service and Productions
Advanced Pastry and Baking
Food Sociology
Understanding Entrepreneurialism
French – Basic
Research Methods
Food Media
Advanced Cuisine
Sensory Evaluation of Food
Food Business Management
Research Project
Culinary Product Development
Food Trends and Product Innovation
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Molecular Gastronomy
Food Styling
Science of Baking
Modern Gateau and Petit Four
Sugar & Chocolate Artistry', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('taylor', 'TAYLOR_BACHELOR_035', 'Introduction to Mass Communication
Visual Communication
Intercultural Communication
Communication Theory
New Media and Society
Innovative Media
Media Writing
Media Analytics
Media Law and Ethics
Advertising Fundamentals
Strategic Copywriting
Principles of Marketing
Brand Management
Creative Design for Advertising
Corporate Identity and Branding Design
Research Methods
Advertising and Brand Management Collaborative Project
Media Planning and Analysis
Research Project
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('taylor', 'TAYLOR_BACHELOR_037', 'Introduction to Mass Communication
Visual Communication
Intercultural Communication
Communication Theory
Innovative Media
Media Writing
Media Analytics
New Media and Society
Media Law & Ethics
Narrative Writing
Digital Moving Image
Digital Animation & Compositing
Visual Storytelling
Audience Studies
Editing Techniques
Research Methods
Research Project
Digital Media Creative Project
Trends in New Media
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('taylor', 'TAYLOR_BACHELOR_010', 'Statistical Inference and Modelling
Data Science Principles
Data Mining
Big Data Technologies
Computer and Network Security
Computer Intrusion Detection
Computer Crime and Digital Evidence
Wireless Networks and Security
Introduction to Mobile Computing
Mobile Applications Development
Internet of Things
Computer Vision and Natural Language Processing
Data Analytics and Machine Learning
Cognitive Computing and Applications
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
Data Science
Artificial Intelligence
Business Intelligence and Analytics
Mobile Computing
Digital Transformation
Cyber Security
Internet Technologies
Database Systems
Computer Architecture and Organisation
Object Oriented Programming
Discrete Structures
Principles of Software Engineering
Systems Analysis and Design
Data Structures and Algorithms
Operating Systems
Advanced Programming
Computer Networks
Machine Learning and Intelligent System
Ideating Start-up
Capstone Project I
Capstone Project II
Human Computer Interaction
Professional Practices and Information Security
Industrial Project I
Industrial Project II
Technopreneurship Project I
Technopreneurship Project II', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('taylor', 'TAYLOR_BACHELOR_009', 'Principles of Software Engineering
Database Systems
Computer Architecture and Organisation
Discrete Structures
Object Oriented Programming
Operating System
Advanced Programming
System Analysis and Design
Computer Networks
Software Design
Software Testing
Software Project Management
Requirement Engineering
Software Construction
Software Lifecycle
Software Safety and Security
Capstone Project I
Human Computer Interaction
Professional Practices and Information Security
Capstone Project II
Industrial Training
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
Data Science
Cyber Security
Mobile Computing
Internet Technologies
Artificial Intelligence
Digital Transformation', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('taylor', 'TAYLOR_BACHELOR_011', 'Database Systems
Computer Architecture and Organisation
Discrete Structures
Object Oriented Programming
Data Structures and Algorithms
Operating Systems
Systems Analysis and Design
Web and Mobile Systems
Computer Networks
System Integration and Architecture
System Paradigms
Ideating Start-up
Capstone Project I
Capstone Project II
Human Computer Interaction
Professional Practices and Information Security
Industrial Training
Mobile Applications Development
Wireless Networks and Security
Introduction to Cloud Computing
Internet of Things
Data Mining
Marketing Analytics
Market Intelligence and Data Visualisation
Social Media Analytics
Games Development
Games Studies
Experiential Design
3D Modeling
Machine Learning and Intelligent Systems
Digital Transformation
Artificial Intelligence-enabled Enterprise Automation
Interactive and Digital Marketing
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Accounting
Advertising and Brand Management
Creative Media Design
Entrepreneurship
Finance
International Business
Management
Marketing
Data Science
Artificial Intelligence
Business Intelligence and Analytics
Game Design
Cyber Security
Internet Technologies
Mobile Computing', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('taylor', 'TAYLOR_BACHELOR_014', 'Spatial Design I
Spatial Design II
Environment Design
3D Modelling
Application Design I
Application Design II
Games Studies
Programming
Embedded Systems
Lighting Interactive Design
Home Automation
Advanced Modelling & Animation
Advanced Home Automation
Internet of Things (IoT)
Computer Vision and Natural Language Processing
Experiential Design
Games Development
Performative Media
Interactive Design
Advanced Interactive Design
Sonic Design
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Multidisciplinary Project I
Multidisciplinary Project II
Technopreneurship Project I
Technopreneurship Project II
Industry Project I (WBL)
Industry Project II (WBL)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('taylor', 'TAYLOR_BACHELOR_013', 'Design Principles
Introduction to Fashion Design
Introduction to Pattern Drafting and Garment Making
Fashion Project I
Garment Draping
Fashion Illustration
Fashion History
Intercultural Design
Fashion Project II
Introduction to Pattern Technology
Ethical and Sustainable Fashion
Innovative Industry Project
Innovative Pattern Drafting Project
Fashion Entrepreneurship
Digital Illustration
Fashion Design Technology Final Project I
Garment Creation Technology I
Fashion Communication and Visual Merchandising
Fashion Design Technology Final Project II
Garment Creation Technology II
International Fashion
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('taylor', 'TAYLOR_BACHELOR_012', 'Typography
Illustration and Visual Narrative
Digital Photography and Imaging
Design Research Methodology
Video and Sound Production
Interactive Design
Advanced Typography
Intercultural Design
Design Principles
Design Research Dissertation
Minor Project
Major Project I
Industry Training
Major Project II
Brand Corporate Identity
Packaging and Merchandising Design
Publishing Design
Creative Brand Strategy
Digital and Social Media Communication
Advanced Interactive Design
Application Design I
Games Studies
Experiential Design
Application Design II
Games Development
Animation Fundamentals
3D Modelling
Sonic Design
Motion Graphics and Compositing
Advanced Animation
Film Studies and Cinematography
Character Design
Anatomy and Character Sculpture
Vehicle and Props Design
Environment Design
Digital Matte Painting
Game Art
Interactive Narrative Design
Spatial Audio Design
Immersive Visual Effects
Immersive Video Production
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Design Exploration
Art Direction
Collaborative Design Practice
Design Portfolio
UX Design
Advertising and Brand Management
Education
Entrepreneurship
Mobile Technology
Web Technology', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('taylor', 'TAYLOR_BACHELOR_040', 'Philosophy and Curriculum Design
Education, School and Society
Teaching and Managing Diverse Learners in the Classroom
Learning, Assessment and Feedback
Professional Practice 1 (PP1)
Professional Practice 2 (PP2)
New Pedagogies – Digital Tools and Resources
The Reflective Practitioner: Teachers Investigate Their Work
Action Research Project
Theory into Practice
Teaching Language Arts
Teaching Primary School English Language
Language Use and Society
Number & Algebra
Measurement & Geometry
Statistics
Science - Systems and Cycles
Science - Energy and Interactions
Nature of Science
Academic Reading & Writing
ELT Methodology
Introduction to Applied Linguistics I
Introduction to Applied Linguistics II (*)
Introduction to Creative Writing
Language, Culture & Society
Materials Development in ELT
Recent Developments in ELT
Capstone Project
Promoting Children''s Wellbeing
Early Science and Numeracy
Literacy and Language Development
Managing Behaviour and Safety
Advancing Play and Learning
Introduction to Human Nutrition
Inclusive Education
Entrepreneurship & Small Business
Introduction to Children with Special Educational Needs
Supporting Children with Specific Learning Difficulties
Policy and Legislative Framework on Special Education
Assessment and Intervention for Children with Special Educational Needs
Behavioural Management in Special Education
Inclusive Education BUS60304 Entrepreneurship & Small Business
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('taylor', 'TAYLOR_BACHELOR_022', 'Engineering Mathematics and Modelling I
Engineering Mathematics and Modelling II
Engineering Design and Analysis
Programming Techniques
Thermofluid Engineering I
Fundamental of Chemical Process Analysis
Sustainable Development in Engineering
Engineering Design and Project Management
Biochemical Processes
Heat and Mass Transfer
Separation Processes
Chemical Engineering Thermodynamics and Simulation
Process Control and Instrumentation
Process Plant Design and Economics
Advanced Heat and Momentum Transfer
Chemical Reaction Engineering
Industrial Training
Final Year Engineering Project I
Final Year Engineering Project II
Chemical Engineering Group Project I
Chemical Engineering Group Project II
Professional Engineers and Society
Additive Manufacturing
Advanced Manufacturing Systems
Internet of Things
Big Data Technologies
Renewable and Alternative Energies
Decarbonisation Technology
Fuel Cell and Hydrogen Energies
Engineering Economics and Environmental Impact
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Entrepreneurship
Robotics Design
Project Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('taylor', 'TAYLOR_BACHELOR_021', 'Engineering Mathematics and Modelling I
Engineering Design and Analysis
Circuits and Signals
Programming Techniques
Electromagnetic Fields & Waves
Engineering Mathematics and Modelling II
Digital and Analogue Electronics
Communication Systems
Microprocessors and Computer Architecture
Engineering Design and Project Management
Electrical Power and Machines
Power System Analysis and Protection
Power Electronics and Industrial Drives
Automatic Control and Instrumentation
High Voltage Engineering
Industrial Training
Electrical & Electronic Engineering Group Project I
Final Year Engineering Project I
Electrical Energy Generation and Utilisation
Electrical & Electronic Engineering Group Project II
Final Year Engineering Project II
Professional Engineers and Society
Sustainable Buildings
Engineering Economics and Environmental Impact
Renewable and Alternative Energies
Energy Storage and Transmission
Machine Learning for Engineers
Digital Imaging Processing
Deep Learning for Engineers
Unmanned Systems
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Design and Manufacturing
Entrepreneurship
Project Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('taylor', 'TAYLOR_BACHELOR_023', 'Engineering Mathematics and Modelling I
Engineering Mathematics and Modelling II
Engineering Design and Analysis
Programming Techniques
Materials and Manufacturing
Thermofluid Engineering I
Introduction to Electronics & Electrical Power Machines
Engineering Design and Project Management
Thermofluid Engineering II
Engineering Solid Mechanics
Electronics & Microprocessors
Automatic Control and Instrumentation
Engineering Dynamics
Finite Element Method and Simulation
Mechanical Vibration
Industrial Training
Final Year Engineering Project I
Final Year Engineering Project II
Mechanical Engineering Group Project I
Mechanical Engineering Group Project II
Professional Engineers and Society
Sustainable Development in Engineering
Additive Manufacturing
Advanced Manufacturing Systems
Internet of Things
Big Data Technologies
Sustainable Developement in Engineering
Renewable and Alternative Energies
Sustainable Thermofluid Engineering Systems
Fuel Cell and Hydrogen Energies
Engineering Economics and Environment Impact
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Robotics Design
Project Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('taylor', 'TAYLOR_BACHELOR_015', 'Introduction to Restaurant Operations
Business of Hospitality, Food and Leisure Management
Accommodation Management
Food Safety and Sanitation
Room Division Management
Beverage Management
Understanding Entrepreneurialism
Hotel Revenue Management
Culinary Essentials
Research Methods
French Basic
Hospitality Management and Leadership
F&B Operations Management
Hotel Innovation Management
Service Quality Management in Hospitality
Research Project
Hospitality Business Modelling
Hospitality Project Management
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Convention and Banquet Sales
Conventions & Meetings Management
Event and Tourism Risk Management
Event Project Management
Luxury Brand Management', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('taylor', 'TAYLOR_BACHELOR_018', 'Principles of Marketing
Business of Hospitality, Food and Leisure Management
Events and Entertainment
Design for Events
Social Media for Events
Trends and Issues in International Event Management
Conventions and Meetings Management
Event Sponsorship and Funding
Events Project Management
Research Methods
French Basic
Events Operations
Sustainable Event Management
Event Technology
Exhibition Management
Research Project
Live Event Project
Event and Tourism Risk Management
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('taylor', 'TAYLOR_BACHELOR_017', 'Principles of Marketing
Business of Hospitality, Food and Leisure Management
Leisure Attraction Management
Destination Geography and Analysis
Strategic Destination Marketing and Branding
Tourism Economics
Tourism Business Management
Understanding Entrepreneurialism
Airline and Airport Management
Research Methods
French Basic
Sociology of Tourism
Data and Media Analysis for Tourism
Sustainable Tourism Development
Tourism Product Design and Development
Research Project
Tourism Integrated Project
Event and Tourism Risk Management
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('taylor', 'TAYLOR_BACHELOR_029', 'Contract Law I
Contract Law II
Law of Tort I
Law of Tort II
Constitutional and Administrative Law I
Constitutional and Administrative Law II
English Legal System
Legal Skills and Methods
Malaysian Legal System
Constitutional and Administrative Law III
Criminal Law I
Criminal Law II
Land Law I
Land Law II
Public International Law
Mooting
Company Law
Equity and Trusts I
Equity and Trusts II
Family Law
Land Law III
Internship
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Corporate Law
Business Analytics
Entrepreneurship
Accounting
Journalism And Media Practice
Psychology
Management
Education
Creative Media Design', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('taylor', 'TAYLOR_BACHELOR_043', 'Co-created, co-designed and co-delivered by Taylor''s University, top industry professionals and renowned Adjuncts
Collaborative teaching & learning by leaders in education and performing arts
Flexible learning spaces at Taylor''s University Lakeside
Introduction to Performing Arts
History of Theatre
Introduction to Acting
Acting 1
Fundamentals of Choir Performance
Fundamentals Mechanics of Filmmaking
Introduction to Creative Writing
Introduction to Dance and Creative Processes
Directing 1 & 2
Production Practicum
Production and Stage Management
Research Methodology
Internship
Devising Performance Text
Voice and Speech 1 & 2
Movement 1 & 2
Acting 2 & 3
Language and diction
Movement and stagecraft
Musicianship and ear training
Principle vocal studies
Repertory and song
Scene studies
Vocal styles and musical theatre
Ballet Technique I & II
Contemporary Dance I & II
Hip Hop and Jazz Dance
Silat
Malaysian Traditional Dance
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('taylor', 'TAYLOR_BACHELOR_041', 'Introduction to Psychology
Research in Psychology
Learning and Motivation
Philosophy and Theories of Psychotherapy
Human Personality
Quantitative Methods
Qualitative Methods
Biological Psychology
Social Psychology
Ethics in Psychology
Developmental Psychology
Cognitive Psychology
History of Psychology
Psychological Tests and Measurements
Leadership and Organizational Psychology
Abnormal Psychology
Creative Integration Research Project (Part A)
Creative Integration Research Project (Part B)
Cross-cultural Psychology
Cyberpsychology
Industrial Training
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('taylor', 'TAYLOR_BACHELOR_034', 'Introduction to Pharmacy
Human Anatomy and Physiology
Principles of Life Sciences
Pharmaceutical Compounding and Dispensing
Pharmacology I
Pharmaceutical Organic Chemistry
Physical Pharmaceutics
Community Pharmacy Practice I
Pharmacology II
Principles of Pharmaceutical Chemistry
Pharmaceutical Formulation and Development I
Biostatistics and Quality Use of Medicines
Community Pharmacy Practice II
Pharmacology III
Pharmaceutical Analysis
Hospital Pharmacy Practice
Law, Ethics and Practice
Pharmaceutical Formulation and Development II
Drug Design and Biotechnology
Applied Therapeutics I
Professional Attachment
Applied Therapeutics II
Applied Therapeutics III
Research Projects
Kursus Integriti dan Antirasuah (Integrity and Anti-Corruption)
Emotional Intelligence in Action
Youth and Leadership in Malaysia
Community Impact and Engagement
Falsafah dan Cabaran Semasa
Aspirasi Negara Bangsa
Bahasa Melayu Komunikasi 2
Citra Malaysia (Malaysian Citra)
Psychology
Nutrition with Wellness
Accounting
Entrepreneurship
Web Technology
Management
Marketing', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('taylor', 'TAYLOR_BACHELOR_033', 'Biological Basis of Medicine Block
Musculoskeletal System Block
Learning Skills / ICT / Communication Skills
Haematology and Immunology System Block
Cardiovascular System Block
Respiratory System Block
Learning Skills / ICT / Medical Ethics
Gastrointestinal System Block
Urinary System Block
Public Health, Epidemiology & Biostatistics Block
Research Block
Introduction to Clinical Medicine
Endocrine and Reproductive System Block
Nervous System Block
Behavioural Sciences Block
Clinical Orientation
Internal Medicine 1
Surgery 1
Obstetrics and Gynaecology 1
Paediatrics 1
Orthopaedics 1
Psychiatry 1
Community Medicine
Ophthalmology
Otorhinolaryngology
Family Medicine
Emergency Medicine
Obstetrics and Gynaecology 2
Internal Medicine 2
Surgery 2
Medical Innovation and Entrepreneurship
Psychiatry 2
Orthopaedics 2
Forensic Medicine
Anaesthesia and Intensive Care
Medial Radiology and Imaging
Internal Medicine 3
Paediatrics 2
Surgery 3
Obstetrics and Gynaecology 3', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z');

DO $$
DECLARE
    existing_target_count INTEGER;
    course_title_count INTEGER;
BEGIN
    IF (SELECT COUNT(*) FROM malaysia_official_curriculum_repairs) <> 101 THEN
        RAISE EXCEPTION 'Expected 101 reviewed Malaysian curriculum repairs';
    END IF;

    SELECT COUNT(*) INTO existing_target_count
    FROM malaysia_official_curriculum_repairs repair
    JOIN programmes programme ON programme.programme_code = repair.programme_code
    JOIN universities university ON university.id = programme.university_id
    WHERE university.slug = repair.university_slug;
    IF existing_target_count NOT IN (0, 101) THEN
        RAISE EXCEPTION 'Only part of the reviewed Malaysian curriculum set matched: %', existing_target_count;
    END IF;

    SELECT SUM(array_length(regexp_split_to_array(body_en, E'\n'), 1))
      INTO course_title_count
    FROM malaysia_official_curriculum_repairs;
    IF course_title_count <> 5156 THEN
        RAISE EXCEPTION 'Unexpected official course title count: %', course_title_count;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM malaysia_official_curriculum_repairs
        WHERE body_en ~* '(^|\n)(note([ :]|$)|next\s*:|year\s*[0-9]+([ :]|$)|semester\s*[0-9]+([ :]|$)|choose([ :]|$)|select([ :]|$)|students?([ :]|$)|elective courses?([ :0-9(]|$)|speciali[sz]ation elective([ :0-9(]|$)|programme course elective([ :#]|$)|faculty open elective([ :]|$)|kursus elektif([ :]|$)|pilih([ :]|$)|flexible studies([ :]|$))'
           OR body_en ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|[0-9]+\s*%|students? (are )?required|subject to availability|(^|[^[:alpha:]])pilih([^[:alpha:]]|$)|(^|[^[:alpha:]])rujuk([^[:alpha:]]|$)|(^|[^[:alpha:]])sahaja([^[:alpha:]]|$))'
    ) THEN
        RAISE EXCEPTION 'Curriculum repair contains a non-course line';
    END IF;
END $$;

UPDATE programme_detail_sections section
SET title_zh = NULL,
    body_zh = NULL,
    title_en = 'Official Course List',
    body_en = repair.body_en,
    source_url = repair.source_url,
    source_checked_at = repair.source_checked_at,
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP
FROM malaysia_official_curriculum_repairs repair
JOIN programmes programme ON programme.programme_code = repair.programme_code
JOIN universities university ON university.id = programme.university_id
WHERE section.programme_id = programme.id
  AND section.section_type IN ('CURRICULUM', 'COURSE_STRUCTURE')
  AND university.slug = repair.university_slug;

-- Any additional Malaysian curriculum already in the database that still
-- contains requirement/note text is hidden until it can be re-verified.
UPDATE programme_detail_sections section
SET status = 'ARCHIVED',
    updated_at = CURRENT_TIMESTAMP
FROM programmes programme
JOIN universities university ON university.id = programme.university_id
LEFT JOIN countries country ON country.id = university.country_id
WHERE section.programme_id = programme.id
  AND (country.code = 'MY' OR LOWER(university.country) = 'malaysia')
  AND section.section_type IN ('CURRICULUM', 'COURSE_STRUCTURE')
  AND section.status = 'PUBLISHED'
  AND NOT EXISTS (
      SELECT 1 FROM malaysia_official_curriculum_repairs repair
      WHERE repair.programme_code = programme.programme_code
  )
  AND (
      section.body_en ~* '(^|\n)(note([ :]|$)|next\s*:|year\s*[0-9]+([ :]|$)|semester\s*[0-9]+([ :]|$)|choose([ :]|$)|select([ :]|$)|students?([ :]|$)|elective courses?([ :0-9(]|$)|speciali[sz]ation elective([ :0-9(]|$)|programme course elective([ :#]|$)|faculty open elective([ :]|$)|kursus elektif([ :]|$)|pilih([ :]|$)|flexible studies([ :]|$))'
      OR section.body_en ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|[0-9]+\s*%|students? (are )?required|subject to availability|(^|[^[:alpha:]])pilih([^[:alpha:]]|$)|(^|[^[:alpha:]])rujuk([^[:alpha:]]|$)|(^|[^[:alpha:]])sahaja([^[:alpha:]]|$))'
  );
