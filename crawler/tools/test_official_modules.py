import unittest
from official_modules import parse_html,valid_title
URL='https://sunwayuniversity.edu.my/programme'
DATE='2026-10-15T00:00:00Z'
class OfficialModulesTest(unittest.TestCase):
 def test_related_degree_does_not_establish_ownership(self):
  html='<h1>Bachelor in Sports Management (Honours)</h1><h2>Programme Structure</h2><ul><li>Sports Management</li></ul><h3>Bachelor of Accountancy (Hons)</h3>'
  self.assertFalse(parse_html(html,URL,DATE,'Bachelor of Accountancy (Hons)')['programmeMatched'])
 def test_sunway_fields_are_included_and_minor_packages_excluded(self):
  html='<h1>Bachelor of Mechanical Engineering with Honours</h1><h2>Programme Structure</h2><div class="field--name-field-item-title">Engineering Materials</div><ul><li>Engineering Physics</li></ul><h3>Flexible Education</h3><ul><li>Accounting</li></ul>'
  result=parse_html(html,URL,DATE,'Bachelor of Mechanical Engineering with Honours')
  self.assertEqual([m['nameEn'] for m in result['modules']],['Engineering Materials','Engineering Physics'])
  self.assertTrue(all(m['credits'] is None and m['courseCode'] is None for m in result['modules']))
 def test_rejects_admission_and_fee_data(self):
  for title in ['CGPA 3.0','Minimum average of 65%','RM 2000','Entry requirements','Year 1']:
   self.assertFalse(valid_title(title),title)
 def test_keeps_own_course_code_separate_from_prerequisite_and_uses_published_english_alias(self):
  html='<h1>Computer Science</h1><h2>Programme Structure</h2><ul><li>GKI1001 Penyelidikan Bebas (Independent Research)</li><li>Data Structure (#WIX1002)</li><li>JIF3013(p)</li><li>Bahasa Melayu Komunikasi 2 (International Students) OR</li></ul>'
  result=parse_html(html,URL,DATE,'Computer Science')['modules']
  self.assertEqual(result[0]['nameEn'],'Independent Research')
  self.assertEqual(result[0]['courseCode'],'GKI1001')
  self.assertEqual(result[1]['nameEn'],'Data Structure')
  self.assertIsNone(result[1]['courseCode'])
  self.assertEqual(result[2]['nameEn'],'Bahasa Melayu Komunikasi 2')
 def test_preserves_programming_language_symbols_when_deduplicating(self):
  html='<h1>Computer Science</h1><h2>Programme Structure</h2><ul><li>C Programming</li><li>C++ Programming</li><li>C Programming</li></ul>'
  self.assertEqual(len(parse_html(html,URL,DATE,'Computer Science')['modules']),2)
 def test_rejects_malay_instructions_and_she_category_headers(self):
  for title in ['Kursus Elektif Program: Sila rujuk senarai penawaran', 'Pilih 1 Kursus SHE', 'Univerity Elective Courses: SHE_Cluster 1', 'Technology / Artificial Intelligence and Data Analytics: i-Technie']:
   self.assertFalse(valid_title(title),title)
 def test_extracts_module_from_nested_elective_label_without_using_category_as_name(self):
  html='<h1>Computer Science</h1><h2>Programme Structure</h2><ul><li>Elective Courses: University Courses - Student Holistic Empowerment Course (SHE): GQX0056 (KIAR) Integrity And Anti-Corruption Course</li><li>Elective Courses: SHE Cluster 3 - Technology</li></ul>'
  result=parse_html(html,URL,DATE,'Computer Science')['modules']
  self.assertEqual(len(result),1)
  self.assertEqual(result[0]['nameEn'],'Integrity And Anti-Corruption Course')
  self.assertEqual(result[0]['courseCode'],'GQX0056')
  self.assertEqual(result[0]['requirement'],'Elective')
if __name__=='__main__':unittest.main()
