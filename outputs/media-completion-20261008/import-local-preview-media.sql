-- Local preview only: source records remain DRAFT; these rows are PUBLISHED so the local UI can be reviewed.
BEGIN;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.imperial.ac.uk/T4Assets/favicon-196x196.png', 'https://www.imperial.ac.uk/', '2026-10-05T06:59:42.028Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-imperial-college-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Arms_of_University_of_Oxford.svg/500px-Arms_of_University_of_Oxford.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/University_of_Oxford', '2026-10-06T01:41:13.203Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-oxford'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Oxford.svg', 'https://commons.wikimedia.org/wiki/File:University_of_Oxford.svg', '2026-10-06T01:41:13.203Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-oxford'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/1%20oxford%20aerial%20panorama%202016.jpg', 'https://commons.wikimedia.org/wiki/File:1_oxford_aerial_panorama_2016.jpg', '2026-10-06T01:41:13.203Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-university-of-oxford'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'CREST', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Arms%20of%20University%20of%20Oxford.svg', 'https://commons.wikimedia.org/wiki/File:Arms_of_University_of_Oxford.svg', '2026-10-06T01:48:23.391Z'::timestamptz, 'Public domain', 'PUBLISHED', 3
FROM universities WHERE slug = 'local-preview-university-of-oxford'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.cam.ac.uk/sites/default/files/about-the-university/senate-house-5717258098-0cb6542b9b-b.jpg', 'https://www.cam.ac.uk/', '2026-10-05T06:59:48.842Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-cambridge'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/UCL%20Crest.svg', 'https://commons.wikimedia.org/wiki/File:UCL_Crest.svg', '2026-10-06T01:41:16.354Z'::timestamptz, 'Public domain', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-college-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Wilkins%20Building%201%2C%20UCL%2C%20London%20-%20Diliff.jpg', 'https://commons.wikimedia.org/wiki/File:Wilkins_Building_1%2C_UCL%2C_London_-_Diliff.jpg', '2026-10-06T01:41:16.354Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-college-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.ed.ac.uk/themes/upstream/wpp_theme/images/uoe-logo-centred-black.png', 'https://www.ed.ac.uk/', '2026-10-05T06:59:55.612Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-edinburgh'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://kcl.ac.uk/SiteElements/2017/images/kcl-logo.jpg', 'https://www.kcl.ac.uk/', '2026-10-05T06:59:57.322Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-kings-college-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.manchester.ac.uk/Museum-1200x630.jpg', 'https://www.manchester.ac.uk/', '2026-10-05T06:59:58.295Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-manchester'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Shield_of_the_University_of_Bristol.svg/3840px-Shield_of_the_University_of_Bristol.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/University_of_Bristol', '2026-10-06T01:41:19.145Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-bristol'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Bristol.jpg', 'https://commons.wikimedia.org/wiki/File:University_of_Bristol.jpg', '2026-10-06T01:41:19.145Z'::timestamptz, 'CC0 | http://creativecommons.org/publicdomain/zero/1.0/deed.en', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-bristol'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'CREST', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Bristol%20shield.svg', 'https://commons.wikimedia.org/wiki/File:University_of_Bristol_shield.svg', '2026-10-06T01:48:23.392Z'::timestamptz, 'Public domain', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-university-of-bristol'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.lse.ac.uk/all-images/london-westminster-june-24-0012.x26beb190.jpg', 'https://www.lse.ac.uk/', '2026-10-05T07:00:08.465Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-london-school-of-economics'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://warwick.ac.uk/static_war/render/id7/images/wordmark.svg.136055278947', 'https://warwick.ac.uk/', '2026-10-05T07:00:09.451Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-warwick'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://warwick.ac.uk/250188_og-image_creation_-_lavender.jpg', 'https://warwick.ac.uk/', '2026-10-05T07:00:09.451Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-warwick'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.birmingham.ac.uk/media-library/study/campus-aston-webb.x3eed4ed1.jpg?w=1200&h=630&q=80&fit=crop', 'https://www.birmingham.ac.uk/', '2026-10-05T07:00:11.116Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-birmingham'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/3/39/University_of_Glasgow_Gilbert_Scott_Building_-_Feb_2008.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:University_of_Glasgow_Gilbert_Scott_Building_-_Feb_2008.jpg', '2026-10-08T02:14:39.654Z'::timestamptz, 'CC BY 3.0; Creative Commons Attribution 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-glasgow'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/6/68/HartleyLibraryFront.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:HartleyLibraryFront.JPG', '2026-10-08T02:14:39.654Z'::timestamptz, 'CC BY 3.0; Creative Commons Attribution 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-southampton'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/8/80/Parkinson_Building%2C_Leeds_University%2C_England-12Sept2010.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Parkinson_Building,_Leeds_University,_England-12Sept2010.jpg', '2026-10-08T02:14:39.654Z'::timestamptz, 'CC BY 2.0; Creative Commons Attribution 2.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-leeds'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://sheffield.ac.uk/sites/default/files/styles/two_thirds_2x/public/2026-03/Cover_v03_large%20%281%29.jpg?h=647c1a54&itok=KoMY2ZRi', 'https://sheffield.ac.uk/', '2026-10-05T07:00:17.726Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-sheffield'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/University_of_Durham_arms.svg/3840px-University_of_Durham_arms.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Durham_University', '2026-10-06T01:41:23.431Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-durham-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Durham%20-%20Castle%20-%2002.jpg', 'https://commons.wikimedia.org/wiki/File:Durham_-_Castle_-_02.jpg', '2026-10-06T01:41:23.431Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-durham-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'CREST', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Durham%20arms.svg', 'https://commons.wikimedia.org/wiki/File:University_of_Durham_arms.svg', '2026-10-06T01:48:23.392Z'::timestamptz, 'Public domain', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-durham-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/2/29/Nottingham%2C_Trent_Building.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Nottingham,_Trent_Building.jpg', '2026-10-08T02:14:39.654Z'::timestamptz, 'CC BY-SA 4.0; Creative Commons Attribution-Share Alike 4.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-nottingham'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.st-andrews.ac.uk/php/meta/university-of-st-andrews-logo.png', 'https://www.st-andrews.ac.uk/', '2026-10-05T07:00:26.939Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-st-andrews'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/en/1/17/Arms_of_Queen_Mary_University_of_London.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/Queen_Mary_University_of_London', '2026-10-06T01:42:03.896Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-queen-mary-university-of-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Queen%20Mary%20University%20of%20London%20coat%20of%20arms.svg', 'https://commons.wikimedia.org/wiki/File:Queen_Mary_University_of_London_coat_of_arms.svg', '2026-10-06T01:42:03.896Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-queen-mary-university-of-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Queens''%20Building%20(2899476115).jpg', 'https://commons.wikimedia.org/wiki/File:Queens''_Building_(2899476115).jpg', '2026-10-06T01:42:03.896Z'::timestamptz, 'CC BY-SA 2.0 | https://creativecommons.org/licenses/by-sa/2.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-queen-mary-university-of-london'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/0/09/University_of_Bath.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:University_of_Bath.jpg', '2026-10-08T02:14:39.654Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-bath'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/a/ac/MIT_Dome_night1_Edit.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:MIT_Dome_night1_Edit.jpg', '2026-10-08T02:15:16.200Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-massachusetts-institute-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://a-us.storyblok.com/f/1023936/1500x1000/edd739951b/20260613_commencement_n6a1207-1.jpg/m/1200x630/smart/filters:quality(60)', 'https://www.stanford.edu/', '2026-10-05T06:59:41.948Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-stanford-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.harvard.edu/wp-content/uploads/2021/03/100408_Yard_045-1200x630.jpg', 'https://www.harvard.edu/', '2026-10-05T06:59:42.047Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-harvard-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Beckman_Institute_at_Caltech.jpg', 'https://commons.wikimedia.org/wiki/File:Beckman_Institute_at_Caltech.jpg', '2026-10-08T02:21:20.558Z'::timestamptz, 'Creative Commons Attribution-ShareAlike; attribution required', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-california-institute-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.upenn.edu/themes/custom/penn_global/assets/img/penn-graphic.jpg', 'https://www.upenn.edu/', '2026-10-05T06:59:43.148Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-pennsylvania'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/3/34/Cornell_University%2C_Ho_Plaza_and_Sage_Hall.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Cornell_University,_Ho_Plaza_and_Sage_Hall.jpg', '2026-10-08T02:15:16.200Z'::timestamptz, 'CC BY-SA 2.0; Creative Commons Attribution-Share Alike 2.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-cornell-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Yale_Law_School_in_the_Sterling_Law_Building.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Yale_Law_School_in_the_Sterling_Law_Building.jpg', '2026-10-08T02:15:16.200Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-yale-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/0/09/Johns_Hopkins_University%27s_Academic_Seal.svg/250px-Johns_Hopkins_University%27s_Academic_Seal.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Johns_Hopkins_University', '2026-10-06T01:42:08.001Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-johns-hopkins-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Johns%20Hopkins%20University%20logo.png', 'https://commons.wikimedia.org/wiki/File:Johns_Hopkins_University_logo.png', '2026-10-06T01:42:08.001Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-johns-hopkins-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Johns%20Hopkins''%20Historic%20Dome%20-%20panoramio.jpg', 'https://commons.wikimedia.org/wiki/File:Johns_Hopkins''_Historic_Dome_-_panoramio.jpg', '2026-10-06T01:42:08.001Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-johns-hopkins-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Berkeley_glade_afternoon.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Berkeley_glade_afternoon.jpg', '2026-10-08T02:15:16.200Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-california-berkeley'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.uchicago.edu/-/media/images/logo-background/campus_aerial_2-min.png?h=627&iar=0&w=1200&hash=4B634222CA6B6F6F5AD375708EC6AA65', 'https://www.uchicago.edu/', '2026-10-05T06:59:53.143Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-chicago'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Princeton_seal.svg/330px-Princeton_seal.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Princeton_University', '2026-10-06T01:42:14.900Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-princeton-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Princeton%20text%20logo.svg', 'https://commons.wikimedia.org/wiki/File:Princeton_text_logo.svg', '2026-10-06T01:42:14.900Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-princeton-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/ClevelandTowerWatercolor20060829.jpg', 'https://commons.wikimedia.org/wiki/File:ClevelandTowerWatercolor20060829.jpg', '2026-10-06T01:42:14.900Z'::timestamptz, 'CC BY-SA 3.0 | http://creativecommons.org/licenses/by-sa/3.0/', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-princeton-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Coat_of_Arms_of_Columbia_University.svg/330px-Coat_of_Arms_of_Columbia_University.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Columbia_University', '2026-10-06T01:42:18.009Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-columbia-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Coat%20of%20Arms%20of%20Columbia%20University.svg', 'https://commons.wikimedia.org/wiki/File:Coat_of_Arms_of_Columbia_University.svg', '2026-10-06T01:42:18.009Z'::timestamptz, 'CC0 | http://creativecommons.org/publicdomain/zero/1.0/deed.en', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-columbia-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Columbia%20University%20-%20Low%20Memorial%20Library%20(48170370506).jpg', 'https://commons.wikimedia.org/wiki/File:Columbia_University_-_Low_Memorial_Library_(48170370506).jpg', '2026-10-06T01:42:18.009Z'::timestamptz, 'CC BY 2.0 | https://creativecommons.org/licenses/by/2.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-columbia-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://common.northwestern.edu/v8/images/northwestern-thumbnail.jpg', 'https://www.northwestern.edu/', '2026-10-05T07:00:10.498Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-northwestern-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Royce_Hall%2C_University_of_California%2C_Los_Angeles_%2823-09-2003%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Royce_Hall,_University_of_California,_Los_Angeles_(23-09-2003).jpg', '2026-10-08T02:15:16.200Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-california-los-angeles'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Seal_of_the_University_of_Michigan.svg/250px-Seal_of_the_University_of_Michigan.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/University_of_Michigan', '2026-10-06T01:43:04.582Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-michigan-ann-arbor'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Michigan%20logo.svg', 'https://commons.wikimedia.org/wiki/File:University_of_Michigan_logo.svg', '2026-10-06T01:43:04.582Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-michigan-ann-arbor'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/AngellHall2010.JPG', 'https://commons.wikimedia.org/wiki/File:AngellHall2010.JPG', '2026-10-06T01:43:04.582Z'::timestamptz, 'CC BY 3.0 | https://creativecommons.org/licenses/by/3.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-university-of-michigan-ann-arbor'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.cmu.edu/themes/custom/cmu_base/images/wordmarksquare-red-600x600.png', 'https://www.cmu.edu/', '2026-10-05T07:00:20.344Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-carnegie-mellon-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/NYU%20Stern%20School%20of%20Business%20-%20Full%20Building%20%2848072703233%29.jpg', 'https://commons.wikimedia.org/wiki/File:NYU_Stern_School_of_Business_-_Full_Building_(48072703233).jpg', '2026-10-08T02:21:20.558Z'::timestamptz, 'Creative Commons Attribution 2.0; attribution required', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-new-york-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.brown.edu/sites/default/files/2026-01/20211110-ADV-campusphotos-035-1_0.jpg', 'https://www.brown.edu/', '2026-10-05T07:00:22.494Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-brown-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.duke.edu/wp-content/uploads/2026/08/america-250-og.jpg', 'https://www.duke.edu/', '2026-10-05T07:00:25.362Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-duke-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.utexas.edu/sites/default/files/2026-07/homepage-parallax-background-image.jpg', 'https://www.utexas.edu/', '2026-10-05T07:00:25.955Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-texas-at-austin'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.unsw.edu.au/content/dam/images/unsw-wide/general/branding/2026-05-front-door/2026-05-symphony-homepage-yellow-banner.cropimg.width=700.crop=landscape.jpeg', 'https://www.unsw.edu.au/', '2026-10-05T06:59:42.826Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-unsw-sydney'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b4/The_University_of_Melbourne_Coat_of_Arms.svg/500px-The_University_of_Melbourne_Coat_of_Arms.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/University_of_Melbourne', '2026-10-06T01:43:08.923Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-melbourne'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Trinity%20college%20university%20of%20melbourne.jpg', 'https://commons.wikimedia.org/wiki/File:Trinity_college_university_of_melbourne.jpg', '2026-10-06T01:43:08.923Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-melbourne'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'CREST', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Arms%20of%20the%20University%20of%20Melbourne.svg', 'https://commons.wikimedia.org/wiki/File:Arms_of_the_University_of_Melbourne.svg', '2026-10-06T01:48:23.392Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-university-of-melbourne'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://sydney.edu.au/content/dam/icons/logos/logo-usyd-dark.svg', 'https://www.sydney.edu.au/', '2026-10-05T06:59:49.483Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-sydney'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.sydney.edu.au/content/dam/homepage-hero-2026/cs6259_cropv2_highres_heromage001.jpg', 'https://www.sydney.edu.au/', '2026-10-05T06:59:49.483Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-sydney'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/a/a2/University_House_ANU_Canberra_%282948649223%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:University_House_ANU_Canberra_(2948649223).jpg', '2026-10-08T02:16:16.615Z'::timestamptz, 'CC BY-SA 2.0; Creative Commons Attribution-Share Alike 2.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-australian-national-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Arms_of_Monash_University.svg/3840px-Arms_of_Monash_University.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Monash_University', '2026-10-06T01:43:11.666Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-monash-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Monashcaulfield2.jpg', 'https://commons.wikimedia.org/wiki/File:Monashcaulfield2.jpg', '2026-10-06T01:43:11.666Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-monash-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'CREST', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Arms%20of%20Monash%20University.svg', 'https://commons.wikimedia.org/wiki/File:Arms_of_Monash_University.svg', '2026-10-06T01:48:23.392Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-monash-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/b/b4/UQ-SteeleBldg800.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:UQ-SteeleBldg800.jpg', '2026-10-08T02:16:16.615Z'::timestamptz, 'CC BY-SA 3.0; Creative Commons Attribution-Share Alike 3.0', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-queensland'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.uwa.edu.au/_assets/opengraph.png', 'https://www.uwa.edu.au/home', '2026-10-05T07:00:01.766Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-western-australia'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://adelaide.edu.au/content/dam/adelaideuniversity/images/global/logos/au-logo-dark-blue-horizontal.svg', 'https://adelaide.edu.au/', '2026-10-05T07:00:02.608Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-adelaide-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/optimizely/635a5213-c94c-49f3-944b-d2430e3eff8e/original-image-uts-campus-building-8-hr-0022.jpg?stamp=f6fa06485846bf0359a5597e98b16a6a423583a1', 'https://www.uts.edu.au/', '2026-10-05T07:00:03.163Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-technology-sydney'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.rmit.edu.au/content/dam/rmit/common-assets/logo/rmit-logo.png', 'https://www.rmit.edu.au/', '2026-10-05T07:00:05.371Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-rmit-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.rmit.edu.au/assets/smart-crop/homepage-banner/homepage-mob-banner-bowen-st-particles-a-1440x1200.jpg', 'https://www.rmit.edu.au/', '2026-10-05T07:00:05.371Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-rmit-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Macquarie%20University%20International%20brandmark%20%E2%80%93%20Horizontal%20configuration.svg', 'https://commons.wikimedia.org/wiki/File:Macquarie_University_International_brandmark_%E2%80%93_Horizontal_configuration.svg', '2026-10-06T01:44:04.004Z'::timestamptz, 'CC0 | http://creativecommons.org/publicdomain/zero/1.0/deed.en', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-macquarie-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Macquarie%20University%20New%20Library%202011.jpg', 'https://commons.wikimedia.org/wiki/File:Macquarie_University_New_Library_2011.jpg', '2026-10-06T01:44:04.004Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-macquarie-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.curtin.edu.au/wp-content/uploads/sites/4/2023/10/Logo.png', 'https://www.curtin.edu.au/', '2026-10-05T07:00:13.367Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-curtin-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.uow.edu.au/assets/logos/999x562.jpg', 'https://www.uow.edu.au/', '2026-10-05T07:00:15.202Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-wollongong'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/7/74/Deakin_University_Logo_2017.svg/1280px-Deakin_University_Logo_2017.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Deakin_University', '2026-10-06T01:44:06.784Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-deakin-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Deakin%20Worldly%20Strip%20Logo.jpg', 'https://commons.wikimedia.org/wiki/File:Deakin_Worldly_Strip_Logo.jpg', '2026-10-06T01:44:06.784Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-deakin-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Deakin%20University%20Burwood%20Campus.jpg', 'https://commons.wikimedia.org/wiki/File:Deakin_University_Burwood_Campus.jpg', '2026-10-06T01:44:06.784Z'::timestamptz, 'Public domain', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-deakin-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/a/a9/Griffith_University_Logo_Variant_2022.svg/330px-Griffith_University_Logo_Variant_2022.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Griffith_University', '2026-10-06T01:44:09.631Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-griffith-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Griffith%20University.jpg', 'https://commons.wikimedia.org/wiki/File:Griffith_University.jpg', '2026-10-06T01:44:09.631Z'::timestamptz, 'CC BY-SA 2.0 | https://creativecommons.org/licenses/by-sa/2.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-griffith-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/b/be/Queensland_University_of_Technology%2C_Gardens_Point_campus.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/Queensland_University_of_Technology', '2026-10-06T01:44:12.248Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-queensland-university-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/QUT%20KG%20CtoA.jpg', 'https://commons.wikimedia.org/wiki/File:QUT_KG_CtoA.jpg', '2026-10-06T01:44:12.248Z'::timestamptz, 'CC BY-SA 3.0 | http://creativecommons.org/licenses/by-sa/3.0/', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-queensland-university-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/en/e/ed/LTU_Armorial_CMYK_small.PNG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/La_Trobe_University', '2026-10-06T01:45:05.895Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-la-trobe-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/La%20Trobe%20University.jpg', 'https://commons.wikimedia.org/wiki/File:La_Trobe_University.jpg', '2026-10-06T01:45:05.895Z'::timestamptz, 'CC BY-SA 2.0 | https://creativecommons.org/licenses/by-sa/2.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-la-trobe-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/6/6b/The_University_of_Newcastle_Coat_of_Arms.svg/330px-The_University_of_Newcastle_Coat_of_Arms.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/University_of_Newcastle_(Australia)', '2026-10-06T01:45:08.688Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-newcastle'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/timely-reign-media-comms.jpeg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/', '2026-10-05T07:00:47.706Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-swinburne-university-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/en/6/60/UTasLogo.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/University_of_Tasmania', '2026-10-06T01:45:11.511Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-tasmania'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/UniTas-Centenary%20Building.jpg', 'https://commons.wikimedia.org/wiki/File:UniTas-Centenary_Building.jpg', '2026-10-06T01:45:11.511Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-university-of-tasmania'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/b/b9/NUS_coat_of_arms.svg/250px-NUS_coat_of_arms.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/National_University_of_Singapore', '2026-10-06T01:46:05.291Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-national-university-of-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/NUS%2C%20University%20Cultural%20Centre%203%2C%20Nov%2006.JPG', 'https://commons.wikimedia.org/wiki/File:NUS%2C_University_Cultural_Centre_3%2C_Nov_06.JPG', '2026-10-06T01:46:05.291Z'::timestamptz, 'Copyrighted free use', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-national-university-of-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.ntu.edu.sg/media/images/default-source/from-figma/ntu-placeholder-d.jpg?sfvrsn=d4050a9e_2', 'https://www.ntu.edu.sg/', '2026-10-05T06:59:41.405Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-nanyang-technological-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Singapore%20University%20of%20Technology%20and%20Design%20%28SUTD%29%20campus.jpg', 'https://commons.wikimedia.org/wiki/File:Singapore_University_of_Technology_and_Design_(SUTD)_campus.jpg', '2026-10-08T02:18:40.697Z'::timestamptz, 'Creative Commons Attribution-ShareAlike; attribution required', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-singapore-university-of-technology-and-design'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Singapore_Management_University%2C_Jan_06.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original', 'https://commons.wikimedia.org/wiki/File:Singapore_Management_University,_Jan_06.JPG', '2026-10-08T02:16:16.615Z'::timestamptz, 'Copyrighted free use; Copyrighted free use', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-singapore-management-university'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Singapore%20Institute%20of%20Technology%20campus%2C%20Temasek%20Polytechnic%20-%2020160920-07.jpg', 'https://commons.wikimedia.org/wiki/File:Singapore_Institute_of_Technology_campus,_Temasek_Polytechnic_-_20160920-07.jpg', '2026-10-08T02:18:40.697Z'::timestamptz, 'Creative Commons Attribution-ShareAlike 4.0 International', 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-singapore-institute-of-technology'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/5/50/SUSS_logo.svg/500px-SUSS_logo.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Singapore_University_of_Social_Sciences', '2026-10-06T01:46:07.672Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-singapore-university-of-social-sciences'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/SUSS%20new%20logo.png', 'https://commons.wikimedia.org/wiki/File:SUSS_new_logo.png', '2026-10-06T01:46:07.672Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-singapore-university-of-social-sciences'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/SUSS%20Building.jpg', 'https://commons.wikimedia.org/wiki/File:SUSS_Building.jpg', '2026-10-06T01:46:07.672Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-singapore-university-of-social-sciences'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://uas.edu.sg/images/default-source/default-album/news/20230912-press-release-02.jpg?sfvrsn=3d1e7446_3', 'https://uas.edu.sg/news/diverse-career-pathways-for-arts-graduates--singapore-s-first-arts-university-introduces-eight-new-degree-programmes-and-a-common-curriculum-press-release', '2026-10-08T02:17:33.695Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-university-of-the-arts-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/en/thumb/4/46/INSEAD_Strapline_Logo.svg/500px-INSEAD_Strapline_Logo.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/INSEAD', '2026-10-06T01:46:10.496Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-insead-asia-campus'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Inseadlogo.jpg', 'https://commons.wikimedia.org/wiki/File:Inseadlogo.jpg', '2026-10-06T01:46:10.496Z'::timestamptz, 'Attribution', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-insead-asia-campus'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Insead%20-%20Blue%20Ocean%20Institute.jpg', 'https://commons.wikimedia.org/wiki/File:Insead_-_Blue_Ocean_Institute.jpg', '2026-10-06T01:46:10.496Z'::timestamptz, 'CC BY-SA 4.0 | https://creativecommons.org/licenses/by-sa/4.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-insead-asia-campus'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_essec2.svg/960px-Logo_essec2.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/ESSEC_Business_School', '2026-10-06T01:46:13.423Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-essec-asia-pacific'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/ESSEC%20Logo.svg', 'https://commons.wikimedia.org/wiki/File:ESSEC_Logo.svg', '2026-10-06T01:46:13.423Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-essec-asia-pacific'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/ESSEC%20campus%20cergy.jpg', 'https://commons.wikimedia.org/wiki/File:ESSEC_campus_cergy.jpg', '2026-10-06T01:46:13.423Z'::timestamptz, 'CC BY-SA 2.5 | https://creativecommons.org/licenses/by-sa/2.5', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-essec-asia-pacific'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://tum-asia.edu.sg/wp-content/uploads/2024/12/tum-main-logo.png', 'https://tum-asia.edu.sg/', '2026-10-05T06:59:58.951Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-tum-asia'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.spjain.sg/hubfs/home2017/sp-jain-mobile-logo.jpg', 'https://www.spjain.sg/', '2026-10-05T06:59:59.542Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-sp-jain-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.spjain.sg/hubfs/LOGO/SP%20Jain%20Logo%20suare.png', 'https://www.spjain.sg/', '2026-10-05T06:59:59.542Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-sp-jain-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.digipen.edu.sg/sites/default/files/public/img/about/about-the-campus/04-social/digipen-institute-of-technology-singapore-punggol-campus-og.webp', 'https://www.digipen.edu.sg/', '2026-10-05T06:59:59.691Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-digipen-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Logo_Panth%C3%A9on-Assas.svg/960px-Logo_Panth%C3%A9on-Assas.svg.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail', 'https://en.wikipedia.org/wiki/Paris-Panth%C3%A9on-Assas_University', '2026-10-06T01:47:03.919Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-sorbonne-assas-asia'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo%20Panth%C3%A9on-Assas.svg', 'https://commons.wikimedia.org/wiki/File:Logo_Panth%C3%A9on-Assas.svg', '2026-10-06T01:47:03.919Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-sorbonne-assas-asia'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pantheon-Assas%20University%20-%20Panth%C3%A9on.jpg', 'https://commons.wikimedia.org/wiki/File:Pantheon-Assas_University_-_Panth%C3%A9on.jpg', '2026-10-06T01:47:03.919Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-sorbonne-assas-asia'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/commons/6/69/EHL_Logo.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/%C3%89cole_h%C3%B4teli%C3%A8re_de_Lausanne', '2026-10-06T01:47:06.030Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-ehl-campus-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/EHL%20Logo.png', 'https://commons.wikimedia.org/wiki/File:EHL_Logo.png', '2026-10-06T01:47:06.030Z'::timestamptz, 'Public domain', 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-ehl-campus-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ecole-hoteliere-de-Lausanne%20-Lausanne-hospitality-management-school%20campus-aerial-view%20web.jpg', 'https://commons.wikimedia.org/wiki/File:Ecole-hoteliere-de-Lausanne_-Lausanne-hospitality-management-school_campus-aerial-view_web.jpg', '2026-10-06T01:47:06.030Z'::timestamptz, 'CC BY-SA 3.0 | https://creativecommons.org/licenses/by-sa/3.0', 'PUBLISHED', 2
FROM universities WHERE slug = 'local-preview-ehl-campus-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.duke-nus.edu.sg/images/librariesprovider10/default-album/10.jpg?MaxHeight=&MaxWidth=750&Method=ResizeFitToAreaArguments&Quality=High&ScaleUp=false&Signature=EF3234BE501D36EB4BF031935B1E58D5D9B600D1&sfvrsn=6126a8a1_0', 'https://www.duke-nus.edu.sg/careers', '2026-10-08T02:17:33.695Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-duke-nus-medical-school'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://upload.wikimedia.org/wikipedia/en/9/96/James_Cook_University_Armorial_Ensigns.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled', 'https://en.wikipedia.org/wiki/James_Cook_University_Singapore', '2026-10-06T01:47:09.156Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-james-cook-university-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-logo-696x696-1.jpg', 'https://www.curtin.edu.sg/', '2026-10-05T07:00:13.873Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-curtin-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/', '2026-10-05T07:00:13.873Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-curtin-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/header%20logos/sim-logo-2023.svg?ext=.svg', 'https://www.sim.edu.sg/', '2026-10-05T07:00:17.623Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-sim-global-education'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/og%20image/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/', '2026-10-05T07:00:17.623Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-sim-global-education'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.kaplan.com.sg/themes/custom/ksg_theme/kaplan-logo.png', 'https://www.kaplan.com.sg/', '2026-10-05T07:00:18.236Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-kaplan-singapore'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'LOGO', 'https://www.psb-academy.edu.sg/resources/others/common/logo-psb-academy.svg', 'https://www.psb-academy.edu.sg/', '2026-10-05T07:00:20.026Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM universities WHERE slug = 'local-preview-psb-academy'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO university_media (university_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'UNIVERSITY_IMAGE', 'https://www.psb-academy.edu.sg/resources/others/common/psb-academy-elearning-month-sep2026-promotion-1080x1920.jpg', 'https://www.psb-academy.edu.sg/', '2026-10-05T07:00:20.026Z'::timestamptz, NULL, 'PUBLISHED', 1
FROM universities WHERE slug = 'local-preview-psb-academy'
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/bachelor-of-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F1D0F2A04346E3AB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/bachelor-of-advanced-science-honours', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EE25141F465CB8E5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/university-preparation-program', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1B1AEC4437F2ACD8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/bachelor-of-science-honours', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0EB33C542B714387'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/bachelor-of-psychological-science-honours', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D121D47A74FBDEE0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.unsw.edu.au/etc.clientlibs/unsw-common/clientlibs/unsw-assets/resources/social/UNSWlogo-opengraph-squaresafe.png', 'https://www.unsw.edu.au/study/undergraduate/bachelor-of-criminology-criminal-justice-law', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3A45E5B326EC8202'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctor-of-philosophy-2.jpg', 'https://www.uwa.edu.au/study/courses/doctor-of-philosophy', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1A3D2A5E989E4CBD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctor-of-philosophy-1.jpg', 'https://www.uwa.edu.au/study/courses/master-of-philosophy', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_15C71B8559782FD9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctordentalmedicine.jpg', 'https://www.uwa.edu.au/study/courses/doctor-of-dental-medicine', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_35D52797E29C9F49'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctormedicine.jpg', 'https://www.uwa.edu.au/study/courses/doctor-of-MEDICINE', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_186F3334306818ED'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctorpodiatricmedicine.jpg', 'https://www.uwa.edu.au/study/courses/doctor-of-podiatric-medicine', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7E09605B8606CBBE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-masterarchitecturecoursework.jpg', 'https://www.uwa.edu.au/study/courses/master-of-architecture', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_966561A695418396'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/short-header-images/background-mobile/hero_m_master-of-architecture2_2025.jpg', 'https://www.uwa.edu.au/study/courses/master-of-landscape-architecture', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9CEA39E69B9EF1F2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-master-of-public-health.jpg', 'https://www.uwa.edu.au/study/courses/master-of-public-health', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FC61B44D9DBA2098'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-master-of-public-health-coursework.jpg', 'https://www.uwa.edu.au/study/courses/master-of-public-health-specialisation', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3BCB882D4F960115'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-mastertranslationstudies.jpg', 'https://www.uwa.edu.au/study/courses/master-of-translation-studies', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_960F6CE3BE668D71'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-architecture.jpg', 'https://www.uwa.edu.au/study/courses/architecture', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F3C1E28F56A82E13'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/master-of-business-analytics-teaser-792x576.jpg', 'https://www.uwa.edu.au/study/courses/master-of-business-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_045CC14C0FCB3429'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-master-it-cswk.jpg', 'https://www.uwa.edu.au/study/courses/master-of-information-technology', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0271E040C72F12DC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/courses-2020/cybersec_imgbtn.jpg', 'https://www.uwa.edu.au/study/courses/cybersecurity', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B6003CC9516CB29B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-master-of-secondary-teaching.jpg', 'https://www.uwa.edu.au/study/courses/master-of-teaching-secondary', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DD5D47675DC3E098'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/moce-freo-port-1-teaser-792px_x_576px.jpeg', 'https://www.uwa.edu.au/study/courses/master-of-offshore-and-coastal-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_97527A86D940C867'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-doctormedicine.jpg', 'https://www.uwa.edu.au/study/courses/doctor-of-medicine', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_87BAC833914A111A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-masterstrategiccommunication.jpg', 'https://www.uwa.edu.au/study/courses/master-of-strategic-communication', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9935A85A68D44835'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/rich-text-editor/busschool-792x528.jpg', 'https://www.uwa.edu.au/study/Courses/Business-Analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_946D5EC0470DCDAC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-masterminingenergylawcoursework-1.jpg', 'https://www.uwa.edu.au/study/courses/master-of-mining-and-energy-law', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8CAE29A8F982CC8E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-jurisdoctor.jpg', 'https://www.uwa.edu.au/study/courses/juris-doctor', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_25BC2EAAB01800F9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-master-of-fine-arts-research-1.jpg', 'https://www.uwa.edu.au/study/courses/master-of-fine-arts', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F9E6D82B082C487F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/ems/phy_0100-flat-792_x_576/physics_teaser.jpg', 'https://www.uwa.edu.au/study/Courses/Physics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9173526CF57DCC86'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/short-header-images/background-desktop/ablee/design/uwa-november118imagebyjarradseng-792x576.jpg', 'https://www.uwa.edu.au/study/Courses/Fine-Arts', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_87353E6361C5437E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn_cbm-marine-envirosci.jpg', 'https://www.uwa.edu.au/study/courses/bachelor-of-marine-science-and-master-of-environmental-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_623D3F004DBBB48A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/courses-2020/marinesci_imgbtn.jpg', 'https://www.uwa.edu.au/study/courses/marine-science-extended-major', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B6B0EA96FFD72864'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/chemistry_maj_head-792_x_576.jpeg', 'https://www.uwa.edu.au/study/Courses/Chemistry', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_941F9EA874454859'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/images/1image/graduate-certificate-in-business-psychology-online_m-800x860.png', 'https://www.uwa.edu.au/study/courses/graduate-certificate-in-business-psychology-online', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8EE72842734FB7A2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn_psychological-and-behavioural-sciences.jpg', 'https://www.uwa.edu.au/study/courses/psychological-and-behavioural-sciences', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B1BBF89709079897'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/images/1image/master-of-professional-psychology_m-800x860.png', 'https://www.uwa.edu.au/study/courses/master-of-professional-psychology-coursework', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AA02A8CEE9382A8F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/automation_and_robotics_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/automation-and-robotics-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5B0243442047296F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/biomedical_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/biomedical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1F2CA58084E123D9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/chemical_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/chemical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_661E3AAF89FC6632'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/civil_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/civil-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6B5A966533D8E5EC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/electrical_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/electrical-and-electronic-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_223CCB5BD7CAD8C7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/environmental_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/environmental-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6134EF922290420D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/mechanical_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/mechanical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E5389D27E3A515AB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/mining_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/mining-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_52D51C1D42AE9F2A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/faculties/ems/teasers/software_maj_header-792_x_576.jpg', 'https://www.uwa.edu.au/study/courses/software-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8567FE987E2B0B4D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-accounting.jpg', 'https://www.uwa.edu.au/study/courses/accounting', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_529F223357ECE7B8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-business-law.jpg', 'https://www.uwa.edu.au/study/courses/business-law', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5C495B627F502734'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uwa.edu.au/study/-/media/uwafs/teasers/imgbtn-economics-single-major.jpg', 'https://www.uwa.edu.au/study/courses/business-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F979C1D3B3BD2AD4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/fb760028bea534d1d08d2eaefb0f9a593bad4fc0-thumb.jpg?1712640477', 'https://catalog.adelaide.edu.au/browse/dr/courses/adelaide-edu', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1B0AAC5C8A2E5385'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/a8e1854d559d482edd144e1809436bca073e1292-thumb.png?1746080417', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-farm-animal-welfare', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9CC6056A094B0306'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/23d3e04b284832f4d4a6206d0b0bf59272eec84b-thumb.png?1700102397', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-1-animal-ethics-aseptic-technique', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AA45CC9780B61662'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/79c4b92ba92d81f6dbf70e4c35ab58e98db7661b-thumb.png?1700102599', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-2-animal-ethics-minimally-invasive-techniques-without-anaesthesia-including-wildlife-trapping', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_78FA37B1D2B0ABB3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/4f470aa2ecd4ec50ca45f8ff8a7cb601ec16771f-thumb.png?1700177768', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-3-animal-ethics-anesthesia-for-minor-procedures', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_03C0A6195B9FEA75'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/c39fa3321512af6ca39b31eff8f3d8b46b8dd4c6-thumb.png?1700178140', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-4-animal-ethics-anesthesia-for-major-procedures', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D2B7174957ED8CBB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/f6c2f53a8748140ef9f6b51c7ae15e572d9d217c-thumb.png?1700182750', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-5-animal-ethics-surgery-principles-methods-and-materials', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_299F8184917EECF2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/e17531949865cf01282c0cf6d968892c098eb5da-thumb.png?1700182950', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-6-animal-ethics-performing-a-systematic-post-mortem-examination', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C0E5E12010A0AD9F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/6d5e7a407dd8c93df8f3f56bd48148e231f4242d-thumb.png?1700183273', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-7-animal-ethics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E18EDFB4F3E59FE9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/5c76454dc4157798b502a15c02bb7c08173cca74-thumb.png?1700186954', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-module-8-animal-ethics-maximising-welfare-and-behavioural-assessment-in-research-animals', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_51EFB8FA9651B059'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/afb70435951d1c75793563156cb33f01a5f0368f-thumb.png?1700185685', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-training-materials-for-becoming-a-laboratory-animal-veterinarian-a-university-veterinarian-or-animal-welfare-officer', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C68EC651FDF5CF05'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/5750658250618aa9ab16958c96826c4ac1a34eaf-thumb.png?1700185337', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-training-materials-for-minimally-invasive-procedures-in-research-animals', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_501CC4A1EDDCA301'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/e5aa92692810cfb79cf34b4d99cc71660946d89e-thumb.png?1700185498', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-training-materials-for-performing-aseptic-technique-surgical-skills-suturing-and-euthanasia-methods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_348FA8D1C8E87BB8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/f2f6c6ada156e27978a3998c1f6c862df70ead74-thumb.jpg?1700185065', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-wildlife-1---researchers-and-aec-members-guide-to-improved-welfare', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8D855918A5A868D7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/5bc4103299418785cade5c90367a1f2adeadda70-thumb.png?1700185238', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/compass-2024-wildlife-2-researchers-and-aec-members-guide-to-improved-welfare', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_481B9FFCE47BF759'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/36bcb2af1182786f52c29b1e22eccd90185f305c-thumb.jpg?1700101589', 'https://catalog.adelaide.edu.au/browse/pace/compass2024/courses/core-compass-training-for-aec-members-and-animal-users-2024', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EC57318C7BCB9402'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/76b54442427a38893bb8a178e650fb7fe63ac663-thumb.jpg?1666235607', 'https://catalog.adelaide.edu.au/browse/pace/courses/cyber-security-awareness---primary-years', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A893348ADD821EA8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/d6bebfe99ce238f4da598097719f3bcd2b879718-thumb.jpg?1666235801', 'https://catalog.adelaide.edu.au/browse/pace/courses/cyber-security-awareness---secondary-years', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1EF59C224E88E9FA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/cca565cd9e1bd529b87a45633ce3904d67940ad5-thumb.png?1709789978', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/decoding-dt-primary-v9', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_09659EF70F57CF79'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/f3c6067f6d1e7278ac23927c46483932b7637369-thumb.png?1699332353', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/digital-technologies-x-for-the-primary-years-2023', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F1F8FD0BCB4C6B87'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/264c0160dc62d4aac8004fdc395545a67424c535-thumb.jpg?1683599868', 'https://catalog.adelaide.edu.au/browse/dr/courses/engageadelaide', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_95D92A62E643A398'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/5dd9ad6f378966a8398203fb05704e4d407105b2-thumb.jpg?1680757930', 'https://catalog.adelaide.edu.au/browse/dr/courses/firstgen', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_878839D54B44C4D9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/b480ece2dd90c8d3294a1570ec41a0a21a5e7e2d-thumb.jpg?1681957291', 'https://catalog.adelaide.edu.au/browse/dr/courses/health-academy-year-12', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B7096DA70A1E5729'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/6ae5bd14f53389a8371518ec5a1ce1500216618c-thumb.jpg?1681957600', 'https://catalog.adelaide.edu.au/browse/dr/courses/humanities-academy-year-12', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9117E60AEACF50E0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/699822977343e04350bb0adc5dd6eff41ab36202-thumb.png?1688897691', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/maths-in-schools-online-3-6-v9-0', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_09F25C41408C0970'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/cbdebea72021ff7a3808c8139abb4afb4941c09b-thumb.png?1693408003', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/maths-in-schools-online-7-10-v9-0', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2F7128E090998A39'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/2cec37e4529b655a0c23dec4d755d13048223c59-thumb.png?1666160635', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/maths-in-schools-online-f-2-v9', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B44C3453CB99436E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/5dd1e44fac7093e4111663643339826d414eb7e5-thumb.jpg?1681959611', 'https://catalog.adelaide.edu.au/browse/dr/courses/stem-academy-teacher-resources', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BD12A719F2A05ABF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/a764e541cd91e818f61ba974120b4b8df349464f-thumb.jpg?1681957060', 'https://catalog.adelaide.edu.au/browse/dr/courses/stem-academy-year-12', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C3B6836BDD640ABD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/b49a3ca2ce6cd188d204967ae3b689b1f6c7eb97-thumb.png?1716342460', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/ai-primary-v90', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5336E5F7B31776BD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/213e3d061f79d23e2c09f3f2956c4df18a2a8a3e-thumb.png?1716343912', 'https://catalog.adelaide.edu.au/browse/ecms/cser-stem/courses/ai-secondary-v90', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_03A1947EA68ACEEA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/54f1099a704d61f4bb743fcfb3eddffbaf085303-thumb.png?1765248898', 'https://catalog.adelaide.edu.au/courses/pg-prep', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0AD9375E0859FC67'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://catalog-cdn-syd-prod.inscloudgate.net/production/products/677591bcecdf32c5735881826a28126b410187e9-thumb.png?1765174570', 'https://catalog.adelaide.edu.au/browse/domestic-pathways/courses/tertiary-education-strategies', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_257AE5FC2DCEEB4B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/3EE45A70-B32D-4E74-9B660495A3989B61/Original_Image-Derek-Bogart-2020-photo-shoot-day-1.jpg?stamp=0adaa957352d33fdfa6f45fc20003120399fa665', 'https://www.uts.edu.au/courses/bachelor-of-communication-in-digital-and-social-media-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T03:59:42.683Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6E848CB2FF5BBC76'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/6CF19EB1-84CF-4243-9F5E9451AE3892A7/Original_Image-Abstract-lilac-fluorite-texture.jpg?stamp=f6a778c9301b4d6bc138865a3e4fc379dcde61d1', 'https://www.uts.edu.au/courses/bachelor-of-sport-and-exercise-science-honours', '2026-10-07T03:59:54.501Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C1F675BA3434280F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/080E5608-0A18-4715-9F17DA59D7181E07/Original_Image-ABSTRACT-SCI-AdobeStock_436387822.jpg?stamp=ce6f5b1cd2b832502d835dedfd8cdf553f68ecb8', 'https://www.uts.edu.au/courses/bachelor-of-marine-biology-and-climate-change', '2026-10-07T03:59:56.524Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79BC6F6C3605DD93'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/32F2B2F7-02D7-4363-902F5491F5F50DB5/Cybersecurity-Precinct-FEIT.jpg?cropleft=10&cropright=7171&stamp=9eded15a7ef14dc9f8d5626a0c3c01c946a09bc9', 'https://www.uts.edu.au/courses/bachelor-of-information-technology-co-op', '2026-10-07T03:59:58.606Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B2CBA1737B7A99B8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/7712F39D-B0E9-4844-8A9AB8F41D023818/DPC-HEA-UG-Nursing.jpg?stamp=0aabefe1eb8c38ae7270fe8ed0b4cb2a9721d9df', 'https://www.uts.edu.au/courses/bachelor-of-nursing', '2026-10-07T04:00:00.389Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E9165EC3371C72D3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/E136E280-0FB8-401D-8A55D74B9268E47B/Original_Image-UTS-DAB_DPP-Header_Diploma-in-Fashion-and-Sustainability-2.jpg?stamp=6165e8e46da355afed73ab99ad08859797cdd957', 'https://www.uts.edu.au/courses/diploma-in-fashion-and-sustainability', '2026-10-07T04:00:06.539Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9DD6DED2B0ED91D1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/optimizely/2e751a39-c9ec-4287-9186-35c2db554e32/original-image-uts-campus-building-8-hr-0010.jpg?stamp=db6c26f374c2bcf7e97bf7f0ae85191137ce17d5', 'https://www.uts.edu.au/courses/bachelor-of-business', '2026-10-07T04:00:10.808Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FD6056E39DD13A3C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/optimizely/7224e6f5-8c76-453d-af7e-d66ed2431e14/hea-pharmacy-banner.jpg?stamp=daa6e7639c7beb04ac9e058e3c099a09951bdd69', 'https://www.uts.edu.au/courses/master-of-pharmacy', '2026-10-07T05:59:20.554Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4FFD0AD4E835DD8C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/7E392880-F8E4-4091-B5E17D07611556ED/Original_Image-DAB-Building-6-Design-053.jpg?stamp=6c139a0dd1049980a9690ac519692a475fcd1175', 'https://www.uts.edu.au/courses/bachelor-of-design-in-fashion-and-textiles', '2026-10-07T05:59:22.676Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_85F45A0135AD952F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/C63A639C-0134-4026-9C8529F719F19473/Original_Image-UTS-FEIT-Undergraduate-Engineering-Students-in-Lab-EDITED.jpg?stamp=689c53fa74c8417eb60952481dd3a6d7ac2f1ac6', 'https://www.uts.edu.au/courses/bachelor-of-engineering-honours-bachelor-of-science', '2026-10-07T05:59:24.747Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_773AC170A5D999D0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/9C644BDA-EE13-43C7-9DE8A2D545BAF339/Course-Experience-TD-MDSI.jpg?stamp=8a18a26bb59de2ec542cb4b4c9a6a5b7e296747c', 'https://www.uts.edu.au/courses/master-of-data-science-and-innovation', '2026-10-07T05:59:26.748Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7BB0B6AF49B1A192'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/20E545DB-2028-497D-91DC274BCA5642D7/BCII-Showcase-2024_260.jpg?stamp=d12f88ec08ce6438b3ef650804f943347d9c5765', 'https://www.uts.edu.au/courses/bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:28.805Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_30EB178DE4480D31'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/04E35391-8134-4EE9-8A783AE821EF5454/Original_Image-UTS-DAB_DPP-Header_Bachelor-of-Design-in-Fashion-and-Textiles-Bachelor-of-Creative-Intelligence-and-Innovation_Tablet-Mobile.jpg?stamp=7fdfd64c96bf9ca4d8f1137d496badaf33e583c5', 'https://www.uts.edu.au/courses/bachelor-of-design-in-fashion-and-textiles-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:30.778Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0B09D4EE889F183D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/DC60EF81-B499-4E4F-B17FBC56CC6B9F80/Original_Image-DAB-Building-5A-Viscom-and-Product-Design-Students-40.jpg?cropleft=897&cropright=8182&stamp=d44b370135d0bdbae4e9bb3f0accfa76a980dbd0', 'https://www.uts.edu.au/courses/bachelor-of-design-in-visual-communication-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:33.009Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79E678441BD02CE4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/B7EF4950-5110-4422-8D0DF7590AC4D48A/Original_Image-ABSTRACT-HEA-chris-stein-69b2Yyxlygg-unsplash.jpg?stamp=401000db27a67a2be168b1b9d6e38bb9b0974c7f', 'https://www.uts.edu.au/courses/bachelor-of-sport-and-exercise-science-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:34.863Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2D449465B22D4470'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/671C7EC0-FD12-4F0A-81F6E8E49B1744C7/Original_Image-ABSTRACT-HEA-ryan-stone-U3cctUBucn0-unsplash.jpg?stamp=443fdbac739b43892d4ef91615351391f6afb1b8', 'https://www.uts.edu.au/courses/graduate-certificate-in-diabetes-education-and-management', '2026-10-07T05:59:36.813Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B09E9EE54703E678'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/B9FFD6F4-C45B-4994-82226A258870C317/Original_Image-gabe-09IS_HJcUZA-unsplash.jpg?cropleft=7&cropright=4615&stamp=b209ddb75cc4e81db226962dd761c91fd8115898', 'https://www.uts.edu.au/courses/doctor-of-philosophy-phd-thesis-orthoptics', '2026-10-07T05:59:38.708Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F3E66CF9BC2D222E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/447D0C15-00CC-4238-A6F8652B0ADA6D40/Original_Image-Abstract-wave-blue-dots-lines.jpg?stamp=020e938f32f91474f5db3eec64086b153b770476', 'https://www.uts.edu.au/courses/bachelor-of-science-master-of-teaching-in-secondary-education', '2026-10-07T05:59:40.845Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_03F3975CEEA5CE16'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/166BC905-EC10-4F13-92BA767A327DDFBD/Original_Image-susan-wilkinson-7572K1ubVkM-unsplash.jpg?stamp=7759924a3a05a6d4271d7d9274d46bd96a8ad4d3', 'https://www.uts.edu.au/courses/doctor-of-philosophy-phd-thesis-science', '2026-10-07T05:59:42.751Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_60947A9F453CEAB5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/6E03FF01-E5DF-4BBE-8202F5070461323C/Original_Image-ABSTRACT-SCI-AdobeStock_340842205.jpg?stamp=c37ed155e2851270193be06384aebd686bfb8360', 'https://www.uts.edu.au/courses/bachelor-of-mathematical-sciences-honours', '2026-10-07T05:59:44.821Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1D70AC923E181C75'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/C415644A-55A0-4B9E-8234A9B6387C1B3C/Original_Image-ABSTRACT-SCI-solen-feyissa-MJJ9ik9m3J4-unsplash.jpg?stamp=ddb32f2c7ae23414b4b7d9b4a0014041da4abb2c', 'https://www.uts.edu.au/courses/bachelor-of-forensic-science-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:46.879Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0134292BE7FDA487'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/D5089F8A-4784-400A-BE51F5047FA03E91/Original_Image-FEIT-Undergraduate-Engineering-and-IT-Student-Student.jpg?stamp=9bce3476443ea59095a0ad9c658158fd1615d880', 'https://www.uts.edu.au/courses/bachelor-of-information-systems-bachelor-of-business', '2026-10-07T05:59:48.810Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6A0CCC4715498F09'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/6E73ECCB-2AF5-422E-98CABB017990842A/Original_Image-FEIT-Postgraduate-Engineering-and-IT-Student-9.jpg?stamp=4210d22af2fc78e7db9c13485da81de7fc0d5902', 'https://www.uts.edu.au/courses/master-of-interaction-design-extension', '2026-10-07T05:59:50.692Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FE0A8B2BA384C35F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/9D2A5856-0058-4255-B55C01160BA2E099/Original_Image-pawel-czerwinski-Wk5xR31OE_M-unsplash.jpg?stamp=7c06d2a76ceb3fc8903ad80c33c8f639c3451b32', 'https://www.uts.edu.au/courses/doctor-of-philosophy-phd-thesis-analytics', '2026-10-07T05:59:52.711Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AD0A1EF2B8203D40'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/3379746C-E0A0-43CB-815F34B949FBF9FD/Original_Image-ABSTRACT-HEA-AdobeStock_874296009.jpg?stamp=26f3a933f322cea05279065b06e1e393e7a520cf', 'https://www.uts.edu.au/courses/bachelor-of-nursing-bachelor-of-creative-intelligence-and-innovation', '2026-10-07T05:59:56.862Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1CD14B63771F88D7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/505E619B-E33D-49C4-B0DF1A3828AF73D4/Original_Image-ABSTRACT-HEA-AdobeStock_805278444.jpg?stamp=bc8ea7a4424181827188873d5709fb7bbd1a5b34', 'https://www.uts.edu.au/courses/bachelor-of-nursing-honours', '2026-10-07T05:59:58.825Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_92BE05EE0B6B5765'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/F93A558C-8EAE-46B0-A1F02CD8D45ED764/UG-Midwifery.jpg?stamp=0ba4dfd49ce798edb536fd489e506b5c3cf6b117', 'https://www.uts.edu.au/courses/bachelor-of-midwifery', '2026-10-07T06:00:00.795Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BC1D0D591289E580'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/739CC990-A510-4564-97B0DE9E861D65CF/Original_Image-ABSTRACT-BUS-9lNoGFaNI2c-unsplash.jpg?stamp=dc2e24963eb4fee544f091a49f73b472d6466b72', 'https://www.uts.edu.au/courses/bachelor-of-economics-master-of-teaching-in-secondary-education', '2026-10-07T06:00:03.012Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_95193662D801BD58'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/26698982-6B83-49BF-A74DDEAEA86041DD/Original_Image-ABSTRACT-BUS-LbTm902zXbE-unsplash.jpg?stamp=56404661876c98783789599287b42e9dc7fd3ca1', 'https://www.uts.edu.au/courses/bachelor-of-economics', '2026-10-07T06:00:07.238Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_58F088B25BF836E4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/B8F9D38A-FEA3-4422-A4846EB2126BF46A/Original_Image-valdemars-magone-B8X8o1JcHkg-unsplash.jpg?stamp=f9459dd338272c7fc45b9724cc284d660dd3a960', 'https://www.uts.edu.au/courses/bachelor-of-business-bachelor-of-laws', '2026-10-07T06:00:08.872Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_398545EF391149E6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/66344401-A038-49FB-A7A571F6B871E7A2/Original_Image-Black-dark-blue-green-teal-cyan-petrol-jade-abstract-background-Geometric-shape-3d-effect-Line-triangle-angle-polygon-wave-Color-gradient-Light-glow-neon-flash-metal-metallic-Design-Futuristic.jpg?stamp=2dd080762fe386da12467617a327aa0424ee706d', 'https://www.uts.edu.au/courses/master-of-business-analytics', '2026-10-07T06:00:36.256Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A2A0471AAD94694F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/C6A3221A-F5D1-4882-9D1C3340ED33529A/Original_Image-ABSTRACT-BUS-ypqyuASFNps-unsplash.jpg?stamp=93a8b31708506f208ae8d1873ffb5a713674d2ff', 'https://www.uts.edu.au/courses/graduate-certificate-in-business-analytics', '2026-10-07T06:00:38.443Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F208E0E61FF3223D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uts.edu.au/AdaptiveImages/bynder/89AF1BA3-B7E5-4097-A2C1BE9EA0827F76/Original_Image-ABSTRACT-BUS-Df9CR3aQFw4-unsplash.jpg?stamp=15f10dc6404fcb9e151400a83d4d292b120b3aee', 'https://www.uts.edu.au/courses/bachelor-of-business-honours', '2026-10-07T06:00:40.352Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DF6DF18569D925B4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/', '2026-10-07T04:00:23.718Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A6AB64328DC37EA5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-business/', '2026-10-07T04:00:27.730Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2CA87AF26844871F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-communication-and-media/', '2026-10-07T04:00:31.731Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_472B8C231EBB4D77'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-international-studies/', '2026-10-07T04:00:35.758Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6000C0DDC91631FC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-laws/', '2026-10-07T04:00:39.777Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6B61EBBAA8FAC0FC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44093', '2026-10-07T04:00:43.771Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2F1C3468E0CD46E1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44036', '2026-10-07T04:00:47.788Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8C60649C1AC8DDFB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45340', '2026-10-07T04:00:51.826Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C14878AFF52CD99D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45527', '2026-10-07T04:00:55.827Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A836A8DB65227591'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44138', '2026-10-07T04:00:59.885Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_02A11E9AC29A0C62'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?addCourse=410100', '2026-10-07T04:01:22.638Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9E040C1CFCDB44ED'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=deciding&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:26.388Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E88E8A1990BED730'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45835&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:28.391Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7C2475F6661CF1FC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44036&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:30.394Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_76AAEF7175CACC7C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45340&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:32.428Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AB433BC3CE03E237'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45527&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:34.419Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DA46EEB23C0C07D9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44138&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:36.439Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_88F2398C32A7FA69'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44098&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:38.450Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1C4AD2D5C2E08570'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44142&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:40.472Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B569DC1621DA0DB7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44161&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:42.457Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_18404ABE574E7AA8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=45830&students=international&campus=Wollongong&year=2026', '2026-10-07T04:01:44.480Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A1D555C9502AD836'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44046&students=international&campus=Wollongong&year=2026', '2026-10-07T06:04:13.091Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0A955100D3475BF6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44048&students=international&campus=Wollongong&year=2026', '2026-10-07T06:04:15.087Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2F02C1CFEEA6C7F1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?major=44041&students=international&campus=Wollongong&year=2026', '2026-10-07T06:04:17.108Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_41B10F22EA8451C7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-engineering-honours---bachelor-of-arts/', '2026-10-07T06:04:19.137Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6167025BF94D0244'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-creative-arts---bachelor-of-arts/', '2026-10-07T06:04:21.140Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_54E6A84BAFC1106A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-science-smah---bachelor-of-arts/', '2026-10-07T06:04:23.129Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_08EE9B1D89C20F34'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts-in-western-civilisation-double-majors/', '2026-10-07T06:04:27.141Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_070A838339B94584'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?addCourse=410566', '2026-10-07T06:04:29.130Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_43DC483738AC51F3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?addCourse=410134', '2026-10-07T06:04:31.146Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_232EF00ED6ABF970'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts/?addCourse=410286', '2026-10-07T06:04:33.152Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_970DA575F0306464'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-business/?addCourse=410180', '2026-10-07T06:04:45.202Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E9C2D20C1A8D49D1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-business/', '2026-10-07T06:04:47.225Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4815C9E1F3AA25F7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-business---bachelor-of-laws/', '2026-10-07T06:04:53.172Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_78988600FCB5CF7D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-business/?addCourse=410161', '2026-10-07T06:04:54.410Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9F3C32BF2FDB2188'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-business/?addCourse=410134', '2026-10-07T06:04:56.409Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5D3B2FDA1E1887BC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-business/?addCourse=410197', '2026-10-07T06:04:58.477Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6983E17149EC1151'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-communication-and-media/?addCourse=410134', '2026-10-07T06:05:08.465Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7DF117EC7B722AC0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-communication-and-media/', '2026-10-07T06:05:10.487Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_537A1F9E3041AC8E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-communication-and-media/?addCourse=410197', '2026-10-07T06:05:14.488Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79530962A48BE622'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-communication-and-media/?addCourse=411228', '2026-10-07T06:05:16.511Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A37DD98EBD5E865F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-communication-and-media---bachelor-of-laws/', '2026-10-07T06:05:18.525Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DEFB817CC397E11F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-communication-and-media/?addCourse=410133', '2026-10-07T06:05:20.523Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E17F94E3CB89249A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-international-studies/?addCourse=410197', '2026-10-07T06:05:30.554Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_302FE45D7C9B3E51'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-international-studies/', '2026-10-07T06:05:32.599Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D6C4EFAF1E50A733'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-international-studies---bachelor-of-business/', '2026-10-07T06:05:38.508Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CAB50B689B33B638'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.uow.edu.au/study/courses/assets/scripts/uow/course-finder/images/outdoor-study.jpg', 'https://www.uow.edu.au/study/courses/bachelor-of-arts---bachelor-of-international-studies/?addCourse=410257', '2026-10-07T06:05:39.765Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8781D370CF54BF2C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/', '2026-10-07T04:01:56.156Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8593839E942C52E4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/', '2026-10-07T04:01:59.235Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79ECFDC0E6CA4C59'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-business/', '2026-10-07T04:02:00.171Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F8DD33B9995BC878'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/', '2026-10-07T04:02:03.559Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3EB31DD18CE6D4E1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/', '2026-10-07T04:02:05.573Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7C0DF784AC4327F7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-science/', '2026-10-07T04:02:07.454Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4B958B7C86056149'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/climate-and-social-justice/', '2026-10-07T04:02:08.205Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6B4F7A399029666E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/criminology-and-social-change/', '2026-10-07T04:02:10.203Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9FDB05BA49E9C76E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/ethics-and-technology/', '2026-10-07T04:02:13.803Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D36882008256A2E4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/indigenous-studies/', '2026-10-07T04:02:15.774Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F1F2AB70B4572D97'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/literature-and-creative-writing/', '2026-10-07T04:02:17.664Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9AD655E2DEB36104'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/perspectives-on-globalisation/', '2026-10-07T04:02:18.283Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B9E4BE5B9B18B74A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/politics-power-and-technology/', '2026-10-07T04:02:20.292Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6790FD755B9DBF8D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/screen-studies-and-popular-culture/', '2026-10-07T04:02:22.299Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_390DEFBE7C8D6F6B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts/handbook/', '2026-10-07T04:02:26.353Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F81AFE012811CF83'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Health-science_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-health-science-bachelor-of-arts/', '2026-10-07T04:02:29.648Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_858E8191AB46F56C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/CSIRO_Testlab_Clayton_E6A0101.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-engineering-honours-bachelor-of-arts/', '2026-10-07T04:02:30.339Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_54758DEB4490FAA1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/', '2026-10-07T04:02:32.343Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C544D2628E6A3A6D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Criminology_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-criminal-justice-and-criminology/', '2026-10-07T04:02:35.600Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5BCCF35CEC223829'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_business_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-business/', '2026-10-07T04:02:38.224Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7FDEFEEC4D224038'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/climate-and-social-justice/', '2026-10-07T04:02:39.749Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2592B5188534AA87'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/criminology-and-social-change/', '2026-10-07T04:02:41.777Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_67C0A0512DC2B55B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/ethics-and-technology/', '2026-10-07T04:02:43.777Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0868C86BCEDAA166'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/indigenous-studies/', '2026-10-07T04:02:45.825Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_76D360B3E25BF98C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/literature-and-creative-writing/', '2026-10-07T04:02:47.778Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1302DCB60B058A68'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/perspectives-on-globalisation/', '2026-10-07T04:02:49.765Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_747AFEAB26E62254'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/screen-studies-and-popular-culture/', '2026-10-07T04:02:54.160Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CD80A2DF31DE025B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-applied-innovation/handbook/', '2026-10-07T04:02:54.732Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0207A5D3D28DAE85'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-business/handbook/', '2026-10-07T04:02:56.866Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_40C86D399A848075'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/climate-and-social-justice/', '2026-10-07T04:03:00.080Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8FCBD35E6F605C19'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/ethics-and-technology/', '2026-10-07T04:03:04.006Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5C3B6F3A1CE26C40'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/indigenous-studies/', '2026-10-07T04:03:06.058Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E95FF6CE5A23C8EE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/literature-and-creative-writing/', '2026-10-07T04:03:08.002Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B1568CBEA2E43BCA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/perspectives-on-globalisation/', '2026-10-07T04:03:10.111Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A2AC39AB01E34C98'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/politics,-power-and-technology/', '2026-10-07T06:05:21.185Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2A9AC7FF9D1957DF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/screen-studies-and-popular-culture/', '2026-10-07T06:05:23.070Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7AF3F19BB9782860'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_psychological-sciences_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-psychological-sciences/handbook/', '2026-10-07T06:05:23.687Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8C4C9C602FCE3667'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/climate-and-social-justice/', '2026-10-07T06:05:27.090Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0F9689F530BC3D57'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/criminology-and-social-change/', '2026-10-07T06:05:29.078Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D179CD6E5F4DAA69'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/ethics-and-technology/', '2026-10-07T06:05:31.087Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_73C5FE0198132797'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/indigenous-studies/', '2026-10-07T06:05:33.113Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B3A6B0694488C800'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/literature-and-creative-writing/', '2026-10-07T06:05:35.108Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_03C6DEE90EE5ED30'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/perspectives-on-globalisation/', '2026-10-07T06:05:37.271Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8155318CBAAAFCF7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/politics,-power-and-technology/', '2026-10-07T06:05:39.051Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EC06377E98A8E555'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/screen-studies-and-popular-culture/', '2026-10-07T06:05:41.415Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B3F6FA7C39F055B8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/iStock-1068876946.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-arts/handbook/', '2026-10-07T06:05:41.918Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A166A9AA3B9D2567'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Arts_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-arts-bachelor-of-science/handbook/', '2026-10-07T06:05:43.921Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_57E415815BF7A4A6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Law_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-science/', '2026-10-07T06:05:45.915Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E77E3ECBC58A8B05'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Health-science_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-health-science-bachelor-of-arts/handbook/', '2026-10-07T06:05:47.960Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B3EC9A24B82B5909'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/place/CSIRO_Testlab_Images0E6A0322.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-engineering-honours-bachelor-of-arts/handbook/', '2026-10-07T06:05:49.936Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F35D3F2CAF6C73A8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/advertising/', '2026-10-07T06:05:54.187Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FF26239F9E77392C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/cinema-screen-studies/', '2026-10-07T06:05:54.687Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4DC3DB8B38EDB573'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/creative-writing-and-publishing/', '2026-10-07T06:06:01.208Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_30B0D68B855C1E5F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/immersive-media/', '2026-10-07T06:06:04.357Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EAD084A55A3ADFED'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/journalism/', '2026-10-07T06:06:06.292Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DCBE85E3C1A5EBEF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/public-relations/', '2026-10-07T06:06:08.541Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_694CA947E4DFA051'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication/social-media/', '2026-10-07T06:06:11.272Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_99B55853867E8F08'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pagesimagery_business-prof_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication-bachelor-of-business/', '2026-10-07T06:06:13.595Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_13C7CE99E26AACE4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/john-jennings-fg7J6NnebBc-unsplash.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-design-bachelor-of-media-and-communication/', '2026-10-07T06:06:17.168Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A50D692117B6486F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Law_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-media-and-communication/', '2026-10-07T06:06:20.849Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F7D5C9A5D0A9380B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner-professional.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication-bachelor-of-applied-innovation/', '2026-10-07T06:06:21.612Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3C1248A047EF867E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/bachelor-of-media-and-communication-banner-professional.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-media-and-communication-professional/', '2026-10-07T06:06:23.782Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D585B77E4FEA9DCB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Criminology_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-criminal-justice-and-criminology/handbook/', '2026-10-07T06:06:27.813Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_555A8FE0FBE971BA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Criminology_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-criminology-and-criminal-justice/', '2026-10-07T06:06:30.965Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_402A420E672DFE8B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_Criminology_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-criminal-justice-and-criminology-bachelor-of-applied-innovation/', '2026-10-07T06:06:31.654Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_74CA5F877CC6CEEE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/research/STOCK-1155488047.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-psychological-sciences-bachelor-of-criminal-justice-and-criminology/', '2026-10-07T06:06:33.652Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7F5C596A1883F79B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/research/STOCK-1183729230.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-laws-bachelor-of-criminal-justice-and-criminology/', '2026-10-07T06:06:35.655Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DF13A884AAA6BFAD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/engagement/forensic-psychology.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-forensic-psychological-sciences/', '2026-10-07T06:06:39.859Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DFDFFF7D9A5A6285'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/study-areas/Engineer_telecommunications_STOCK.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-engineering-honours/', '2026-10-07T06:06:43.858Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A40AF9681EE4224F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.swinburne.edu.au/content/dam/media/campaigns-restricted/web-banner-images/SUT0138_SSM-XXXX_UG-course-pages-imagery_business_202211_JB.jpg/_jcr_content/renditions/cq5dam.web.1280.720.jpeg', 'https://www.swinburne.edu.au/course/undergraduate/bachelor-of-business/accounting/', '2026-10-07T06:06:45.871Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E66ED07635841AF0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DA03FE23115229A9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/220428_heatshield_project_10x5_phd_postdocs_033.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautics-spacecraft-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F071BC3997F79E84'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D361E543A18B6D14'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/imp_140515_lifescience_052_149923_001-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-msci/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3A04DFBD9473C5FA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_20F8E63166AE5201'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-management/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_71737B16EF1A7914'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7BDB128AB64704B3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/241004_Ivy_Gao_UG_Biological_Sciences_026-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-msci/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F69B6D52DADEC9EE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E82CFDDCF6D75B7F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-management/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AD502F8F0E3B1948'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/materials/Biomaterials-and-Tissue-Engineering-MEng.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomaterials-tissue-engineering-meng/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6BEC235BCD8F2B56'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6BB15C4D9FE69426'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?addCourse=1699807', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FE96ACD0905B5A81'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?addCourse=1215803', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F7B8B77B7333D11D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?addCourse=1215804', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EA7BB2519B1B6BAF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?addCourse=1215805', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_726124581EF2570D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/220428_heatshield_project_10x5_phd_postdocs_033.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautics-spacecraft-engineering/?addCourse=1216182', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_88E12CDBD607D85A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?addCourse=1217781', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_28975BAEC22B27B5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?addCourse=1217786', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6A942E2C5D114352'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?addCourse=1217791', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5A13457C4B1E784D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/imp_140515_lifescience_052_149923_001-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-msci/?addCourse=1608038', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A9581FC8F94FAE53'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?addCourse=1256779', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5AD651F367FF171F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?addCourse=1217825', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AE371FABB685BE96'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?addCourse=1218384', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EA6EA93A6CE7AD00'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?addCourse=1218392', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_488BCA5982C07DAE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-management/?addCourse=1217806', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F24992CFA4A168DE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-management/?addCourse=1217811', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C37A230776718720'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?addCourse=1218439', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5403AB4023740FCD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?addCourse=1218445', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_351E0F61A8C3C23E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?addCourse=1218451', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9DA8061F593A8072'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/241004_Ivy_Gao_UG_Biological_Sciences_026-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-msci/?addCourse=1608196', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B2E5C40655C4A679'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?addCourse=1256861', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5CDBC6EC7014342F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?addCourse=1218461', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_466CB72AF5A9D2DE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?addCourse=1218468', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_51C340740F6DD2ED'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?addCourse=1218476', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_31BF5F54D84818C6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-management/?addCourse=1218407', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CEFE9F7AA9DA74DB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-management/?addCourse=1218422', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D9810252A5ACD428'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/materials/Biomaterials-and-Tissue-Engineering-MEng.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomaterials-tissue-engineering-meng/?addCourse=1215943', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E07329B9923BCAC7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?addCourse=1216471', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_45CBCCA2AA4F4A4E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?addCourse=1216473', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E3F8BFC1E7136586'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?addCourse=1216474', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CEDA05E47B46D7C9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?removeCourse=1699807', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_813FF9B9CCE330AC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?removeCourse=1215803', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EABFDAAF73489C00'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?removeCourse=1215804', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CFD23687BBDBA909'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/New-Aereonautical-Engineering-3000x2000.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautical-engineering/?removeCourse=1215805', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8269FF0339EA859D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/aeronautics/220428_heatshield_project_10x5_phd_postdocs_033.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/aeronautics-spacecraft-engineering/?removeCourse=1216182', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79D5066BBC9B60D7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?removeCourse=1217781', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E5CE1D8452BCBB17'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?removeCourse=1217786', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_04E721367AA4B608'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-bsc/?removeCourse=1217791', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AF74A560AA26E728'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/imp_140515_lifescience_052_149923_001-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-msci/?removeCourse=1608038', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2870296D226B3493'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?removeCourse=1256779', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5A7121CE93C12E57'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?removeCourse=1217825', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B2885BD4B486CC8B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?removeCourse=1218384', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_047A40B45E19929D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-language/?removeCourse=1218392', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FFC57FA183BDE93A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-management/?removeCourse=1217806', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EDC7335AA4022A90'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biochemistry-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biochemistry-management/?removeCourse=1217811', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7D2F59BD5C16BC26'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?removeCourse=1218439', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_ABB911AD685AA599'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?removeCourse=1218445', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7D3E1749DA490C39'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences/?removeCourse=1218451', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BB46B68AD122F662'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/241004_Ivy_Gao_UG_Biological_Sciences_026-copy.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-msci/?removeCourse=1608196', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AA52BB29C2DBEADD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?removeCourse=1256861', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E1E6118537F8D0D0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?removeCourse=1218461', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_722EC26EF0D895FD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?removeCourse=1218468', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_88365CB9657F2EBD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-a-Language-for-Science-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-language/?removeCourse=1218476', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_78D1CE7E01B0BC0A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-management/?removeCourse=1218407', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B2F447E9E686AC45'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/life-sciences/Biological-Sciences-with-Management-BSc.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biological-sciences-management/?removeCourse=1218422', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E59A0C3164A97414'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/course-pages/undergraduate/materials/Biomaterials-and-Tissue-Engineering-MEng.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomaterials-tissue-engineering-meng/?removeCourse=1215943', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1AC737030021F41A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?removeCourse=1216471', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_90016D2462057359'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?removeCourse=1216473', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5CD5167ABBC46CC7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.imperial.ac.uk/media/study---restricted-images/Biomedical-Engineering.jpg', 'https://www.imperial.ac.uk/study/courses/undergraduate/biomedical-engineering/?removeCourse=1216474', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CD331E6AE1541902'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://warwick.ac.uk/study/undergraduate/courses/ba-counselling-psychotherapeutic-relationship/ba_counselling_banner.webp', 'https://warwick.ac.uk/study/undergraduate/courses/ba-counselling-psychotherapeutic-relationship/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FCCCDF7E5F6F1635'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://warwick.ac.uk/study/undergraduate/courses/ba-early-childhood/early-childhood-banner.webp', 'https://warwick.ac.uk/study/undergraduate/courses/ba-early-childhood/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_60349CC20C978FE1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://warwick.ac.uk/study/undergraduate/courses/ba-early-childhood-top-up/early-childhood-banner.webp', 'https://warwick.ac.uk/study/undergraduate/courses/ba-early-childhood-top-up/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6B861F1DC0D6D115'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/civil-engineering-courses/geotechnical-engineering-msc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5C1664AFC69AE3BA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/computer-science-courses/computer-science-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DE681DB4568F28FB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/electronic-electrical-and-systems-engineering-courses/electrical-power-systems-advanced-research-msc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9331442E877D8804'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/health-services-management-courses/health-care-policy-and-management-msc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D7D751A4F61F8F23'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/geography-earth-and-environmental-sciences-courses/health-safety-and-environment-management-msc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E56EDB7846F314EB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/food-safety-courses/food-inspection-module', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7C05F194FABA3BDB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/postgraduate/subjects/geography-earth-and-environmental-sciences-courses/public-and-environmental-health-sciences-msc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9E8EB97FEDF62792'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/accounting-and-finance-courses/accounting-and-finance-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6073F1D116498A44'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/business-and-finance-courses/accounting-and-finance-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F2DD9BC412A50AE2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/accounting-and-finance-courses/accounting-and-finance-with-business-analytics-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_61F5A0661F2F3BA3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/business-and-finance-courses/accounting-and-finance-with-foundation-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F37A343134CE7691'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/business-and-finance-courses/money-banking-and-finance-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_88564E5F1A31A61F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/business-and-finance-courses/money-banking-and-finance-with-foundation-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DA9B3498A07B6628'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/economics-courses/money-banking-and-finance-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_31C1F8E2A11B3AD0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/aerospace-engineering-courses/aerospace-engineering-beng', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8CB5DAD8CF7BFEF8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/aerospace-engineering-courses/aerospace-engineering-meng', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_665C6DB6B17BE185'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/engineering-courses/engineering-physical-sciences-foundation-year', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4B35AB87D48B1763'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/anthropology-courses/social-anthropology-ba', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_406806EB6945547A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biochemistry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_71926D374573E02D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biochemistry-with-professional-placement-msci', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DAF7A93331B1FB2F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biological-sciences-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D432EAB2D071C451'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biological-sciences-with-professional-placement-msci', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A6E47DEBC5E86C34'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biotechnology-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_20D8B8FF9C0AC842'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biotechnology-with-placement-year-msci', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C165DDC57EB8682E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biochemistry-with-an-international-year-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_190F40D74C12D3D2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biochemistry-with-study-in-continental-europe-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CFC2576779D6D429'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biological-sciences-with-an-international-year-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_01AF1368201CC9E2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/biosciences-courses/biological-sciences-with-study-in-continental-europe-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C58B02AFB79B4BFA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CF7B8011CE0F19FE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-marketing-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6094FA0770E00AB2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-business-analytics-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C74943D59A2E054C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-human-resource-management-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E0F57D4B3636EC35'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-communications-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4C63BA368CDD48E3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-operations-and-supply-chain-management-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8CC2715725452367'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/mathematics-courses/mathematics-business-management-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AEA620D43D277778'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/chemistry-courses/chemistry-business-management-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_79A0CF4A62FBDFB0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-year-in-industry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BA4A24C74837C3DA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/dubai/study/undergraduate/subjects/business-and-finance-courses/business-management-with-industrial-placement-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1CF8DEDB53540AEB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-business-analytics-and-year-in-industry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4D0A80A821463812'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-marketing-and-year-in-industry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4B89A930832E3523'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-comms-and-year-in-industry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BC99556A68349994'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.birmingham.ac.uk/siteelements/images/university-of-birmingham.jpg?q=80&f=webp&q=80&f=webp', 'https://www.birmingham.ac.uk/study/undergraduate/subjects/business-and-management-courses/business-management-with-human-resource-management-with-year-in-industry-bsc', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E92B75565DB372D7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.cmu.edu/cfa/music/images/music-images/cellocases_hero_900x600_mobile-min.jpg', 'https://www.cmu.edu/cfa/music/programs/undergraduate-programs/bfa-music-performance.html', '2026-10-07T04:25:29.223Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FA04472FA69E4CC3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_97C0E94F16F647F8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5C9806CD9C8DFE1C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-information-engineering-and-media-(iem)-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4BF809E3CB116BB4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-information-engineering-and-media-(iem)-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_30B9C80D71A6BCEB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical---electronic-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E7DFA4B5584AD251'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-electrical---electronic-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_901BF65CD04B9132'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-robotics-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0FB7D8F65C79876E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-robotics-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DC96C21C9080C5C5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/cceblibraries/default-album/students-perform-chemistry-lab-experiment.jpg?sfvrsn=9a8b0203_1', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-science-with-double-majors-in-process-engineering-and-synthetic-chemistry', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5A82E1CFAD8E553D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/cceblibraries/default-album/students-perform-chemistry-lab-experiment.jpg?sfvrsn=9a8b0203_1', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-science-with-double-majors-in-process-engineering-and-synthetic-chemistry', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_ECEA106C333320A7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-a-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_35AE9F19699A0BC5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-a-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EF900635FE5B0CD8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BA1FDE2664493782'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C269310EB1DEF74D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-chemistry-and-biological-chemistry-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4200B2824BDC5153'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-chemistry-and-biological-chemistry-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C11965380C4322E5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-mechanical-engineering-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E0682DDA3A994174'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-mechanical-engineering-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8B4EA93511054490'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-(environmental-engineering)-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_716457C50E54FC46'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-(environmental-engineering)-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6D6BCB4E30262FEC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-a-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_27CE3A12625DA0B4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-a-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B44D96ACA72D2E37'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical-electronic-engineering-with-second-major-in-society-and-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_37CFFAA959AC4A73'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-electrical-electronic-engineering-with-second-major-in-society-and-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C9137DCDADB7DC58'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/double-degree-in-environmental-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B1F297FFB3D8EA08'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/double-degree-in-environmental-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_652A64D0AF4F1DA9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3374897055C85213'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C8B48AEAB8516992'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CA8A1707BA845E1A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4592F1266C91CE6B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1107EA81ACEB4890'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_ADA8B636A1424B9F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1F24C7C8BA4FA9CB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-environmental-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_350100EF0EF93C6B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-chemistry-and-biological-chemistry-with-second-major-in-environmental-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8A0A932706FD7B38'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-chemistry-and-biological-chemistry-with-second-major-in-environmental-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_793763251B1F5BB7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-chemical---biomolecular-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7F7EB26976C5606B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-chemical---biomolecular-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_11982534F8A7938B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider115/undergraduate/curriculum/undergraduate_thumbnail_bsff.png?sfvrsn=c4f73699_3', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-biological-sciences-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F51AAD738972A040'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider115/undergraduate/curriculum/undergraduate_thumbnail_bsff.png?sfvrsn=c4f73699_3', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-biological-sciences-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_32121783F88FA729'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2BF765F2F5DF3EB8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_885E6005AF053ED5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider118/2025---banners---such/programme-headers/computer-science-with-a-second-major-in-sustainability.png?sfvrsn=dbc1b264_1', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-computing-(hons)-in-computer-science-with-a-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_44339886F11E398B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider118/2025---banners---such/programme-headers/computer-science-with-a-second-major-in-sustainability.png?sfvrsn=dbc1b264_1', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-computing-(hons)-in-computer-science-with-a-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_56E4932405D71EAC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9F1A9D3A9B06B1EE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_420DB957F607D469'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_742D87833CA99DFC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_82DDFAD8C768478A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F0330C989BFB1C57'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/default-source/hub-programmes/sbs-bsfs8843da4d-212b-49f9-a9d8-896a29f31b4b.jpg?sfvrsn=6cb10f84_3', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-biological-sciences-with-second-major-in-food-science-and-technology', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_383C46674EC914FD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/default-source/hub-programmes/sbs-bsfs8843da4d-212b-49f9-a9d8-896a29f31b4b.jpg?sfvrsn=6cb10f84_3', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-biological-sciences-with-second-major-in-food-science-and-technology', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_18306B9D20DF7A23'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-and-public-policy-and-global-affairs', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9655DD577E0CA119'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science-and-public-policy-and-global-affairs', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_17DD764D8D2F67B9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_87FDB34B2FBC6A75'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-in-environmental-earth-systems-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_336CE5599B957C1C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/default-source/hub-programmes/nbs/nbs-ug/bsc-in-accountancy-(sustainability-management-and-analytics).jpg?sfvrsn=b0fa2b50_3', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/accountancy-for-future-leaders-bachelor-of-accountancy-in-sustainability-management-and-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DF31D0DDDB3E97B6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/default-source/hub-programmes/nbs/nbs-ug/bsc-in-accountancy-(sustainability-management-and-analytics).jpg?sfvrsn=b0fa2b50_3', 'https://www.ntu.edu.sg/education/undergraduate-programme/accountancy-for-future-leaders-bachelor-of-accountancy-in-sustainability-management-and-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7E6A3A2E43D63E5F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-business-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_94536146381D3CE4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-business-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_01AF2A89339799E8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-accountancy-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_91F73DF600C80338'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-accountancy-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6BCAF19A86A8439B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-arts-in-geography-and-education', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F5C80C50FF47557D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-arts-in-geography-and-education', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9202BCDFB98A19BC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-arts-in-art-and-education', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5DE0CFB5D6D7D148'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-arts-in-art-and-education', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9C212A74CC06EE87'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical-and-electronic-engineering-(part-time)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_430C5D4DFAF02A34'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-electrical-and-electronic-engineering-(part-time)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_E54872C48888E45B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-business-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FDBA85B47716B883'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/business/education/undergraduate-programme/bachelor-of-business-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4D153648C00519D3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider118/2025---banners---such/programme-headers/bachelor-of-engineering-in-computer-engineering-with-second-major-in-entrepreneurship.png?sfvrsn=e242e057_1', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-(hons)-in-computer-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_85421D4F5F7A6DCE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/librariesprovider118/2025---banners---such/programme-headers/bachelor-of-engineering-in-computer-engineering-with-second-major-in-entrepreneurship.png?sfvrsn=e242e057_1', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-(hons)-in-computer-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_05405F2D3F915B32'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/media/images/cceblibraries/default-album/students-perform-chemistry-lab-experiment.jpg?sfvrsn=9a8b0203_1', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-science-with-double-majors-in-process-engineering-and-synthetic-chemistry', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5A79AF1AF46471FA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-aerospace-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_97879F35ED1BBE57'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-aerospace-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7F4F1AC13835A4B2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-aerospace-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5AE02C4DFDFDE0E7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-aerospace-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_75F3020C9FD47C88'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-aerospace-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8D1A0190B64FB4BF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-aerospace-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8F8133591E1634B2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-bioengineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7C12ED5C4B6917CD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-bioengineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1B669ECFEF666BDD'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bioengineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_914E4A01F3DEC6A9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bioengineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BBB84670F81B1F41'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bioengineering-with-second-major-in-business-(international-trading)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_083C9B50502ECABE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bioengineering-with-second-major-in-business-(international-trading)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_70789FE880C893F8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bioengineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2DD2AE035E5B4F82'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bioengineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8F8C8A9EDA1E8385'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bioengineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_978AB04FAEC76335'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bioengineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_ABA1DD76691F8FF9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F2E9F0DC7EC6B29C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-bioengineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F55DF146FD396A2F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5EE8E2CE258FA6E8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-bioengineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_180942E09E25943C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-pharmaceutical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_ED48D39BA046801F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-bioengineering-with-second-major-in-pharmaceutical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_44AB8BDE547FDCFF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/adm/programmes/undergraduate-programmes/bachelor-of-fine-arts-programme-(admission-year-2026)', '2026-10-07T06:39:25.870Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_82BD401823214B70'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/adm/programmes/undergraduate-programmes/bachelor-of-fine-arts-programmes/bachelor-of-fine-arts-programmes', '2026-10-07T06:39:39.940Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8377BECC05FB06C1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bioengineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_41DA5F1C10644E77'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bioengineering-with-second-major-in-business-(international-trading)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1537859EBC41D8A9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bioengineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9A8B75CC6CA75EB5'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F1CA8DD42B4446EF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7B0558AB2B9E0D46'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-engineering-in-bioengineering-with-second-major-in-pharmaceutical-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6D6676BC150FEBE1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/double-degree-in-bachelor-of-engineering-(bioengineering)-and-bachelor-of-social-science-(economics)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B40A02BA70751A10'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/education/undergraduate-programme/double-degree-in-bachelor-of-engineering-(bioengineering)-and-bachelor-of-social-science-(economics)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_477CE76268A6829D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-bioengineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_05F1AB532EB8401C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-chemical-and-biomolecular-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_83F764D7325E95EB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-chemical-and-biomolecular-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_52FD4048936DA82D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/chemical-biomolecular-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AD9DECF0A4940A0B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/chemical-biomolecular-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4210A9B8F5EC7BD1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-chemical-biomolecular-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A5FD001C2D27AC05'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-chemical-biomolecular-engineering-with-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_C2B6F6E5C5BE987E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-chemical---biomolecular-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2FA9B2D5A036F2F2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/chemical-and-biomolecular-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_1D97CA48CEE34CB1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/chemical-and-biomolecular-engineering-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9625059A16524055'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/chemical-and-biomolecular-engineering-with-second-major-in-business-(international-trading)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5E38C8B46DB2CD4B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/chemical-and-biomolecular-engineering-with-second-major-in-business-(international-trading)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_62E8FB6B8C713C10'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/chemical-and-biomolecular-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_B52B9373FFA64973'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/chemical-and-biomolecular-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D5E81CB3412A3137'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-chemical-and-biomolecular-engineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_34BB7DC024A2CA61'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-chemical-and-biomolecular-engineering-with-second-major-in-future-foods', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_EA22F7F1F995F9E3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_756C57940E7DE128'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_127ABC77DA9D8052'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-work-study-programme', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FADBDA0C869EB260'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-engineering-with-work-study-programme', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A2428D0D63C943A9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3C1DAA2687ABBFAE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-with-second-major-in-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6D054CBA5349D8F4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-(civil)-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_91E9D74FCA24B4C4'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-(civil)-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3E84B20EDA3598E9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-civil-engineering-with-a-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A9EBE37C4F167524'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-engineering-with-a-second-major-in-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_679A1DF14B506619'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-engineering-with-a-second-major-in-society-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D8A9552B3BC8BDB7'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-civil-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_38887A5B396E1959'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical---electronic-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8620D7EF358DB3D1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical---electronic-engineering-with-second-major-in-data-analytics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BEB9C3649AB4AEAC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical-electronic-engineering-with-second-major-in-society-and-urban-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9D82FD578F77E2D6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical---electronic-engineering-with-second-major-in-sustainability', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_185D2D578A10BA73'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6698088EE908F9E2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_30902717E2F4298A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical-and-electronic-engineering-(part-time)', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5F7A15B7E4A6FAE6'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)-and-second-major-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_40C0897CE8692CD3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)-and-second-major-business', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CF612DDAE332D336'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)-and-second-major-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0D15523E6FEE422B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-electrical-and-electronic-engineering-(eee)-and-second-major-entrepreneurship', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CDD128ECC6548F5E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/bachelor-of-engineering-in-environmental-engineering', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4A74DDF13D24FA24'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/double-degree-in-aerospace-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_48EB1DA7038937F3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/double-degree-in-aerospace-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2B7EC32CCE66F866'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/admissions/undergraduate/undergraduate-programme/double-degree-in-mechanical-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_342550C36FEA038D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.ntu.edu.sg/images/default-source/default-album/ntu-thehive-775x465.jpg', 'https://www.ntu.edu.sg/engineering/coe-programmes/undergraduate/coe-programme-detail/double-degree-in-mechanical-engineering-and-economics', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9EEFF3C268CFAC69'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://tum-asia.edu.sg/wp-content/uploads/2024/10/TUM-Asia_MSc_Aerospace-Engineering.jpg', 'https://tum-asia.edu.sg/undergraduate-studies/chemical-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_7ACDFBF5620E25C9'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://tum-asia.edu.sg/wp-content/uploads/2024/10/TUM-Asia_MSc_Aerospace-Engineering.jpg', 'https://tum-asia.edu.sg/undergraduate-studies/electronics-and-data-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_94D4D876F6BD53AE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://tum-asia.edu.sg/wp-content/uploads/2024/10/TUM-Asia_MSc_Aerospace-Engineering.jpg', 'https://tum-asia.edu.sg/cn/undergraduate-studies/chemical-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3D9AC9AA7FC76084'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://tum-asia.edu.sg/wp-content/uploads/2024/10/TUM-Asia_MSc_Aerospace-Engineering.jpg', 'https://tum-asia.edu.sg/cn/undergraduate-studies/electronics-and-data-engineering/', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F2B88E818863D5E0'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.webp', 'https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-commerce/', '2026-10-07T04:29:59.258Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5073A1D04532FF5A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-commerce/', '2026-10-07T06:44:04.841Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5073A1D04532FF5A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/undergraduate/communications/', '2026-10-07T04:30:26.891Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_48ED45E3CBDF7D2F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-computing-cyber-security/', '2026-10-07T04:30:34.463Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2F5E1D4E107A3F82'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/undergraduate/bachelor-of-information-technology/', '2026-10-07T04:30:36.392Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6B78CD97631631A8'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/undergraduate/nursing-conversion-program-for-registered-nurses/', '2026-10-07T04:30:38.479Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8A40B27791DF6AAA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/05/pathway-flowchart-320x258-1.png', 'https://www.curtin.edu.sg/courses/diploma/', '2026-10-07T04:30:52.497Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_93866B9E6F4DAF27'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/phd/', '2026-10-07T04:31:00.660Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_999B8F77E1A5ADB3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-predictive-analytics-data-science-major/', '2026-10-07T04:31:02.546Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_6DA357F6E89EB71A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/diploma/diploma-of-arts-and-creative-industries/', '2026-10-07T04:31:06.807Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_570CE6D2458AA114'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/diploma/diploma-of-commerce/', '2026-10-07T04:31:08.660Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_FBE9B9C5344F1ED3'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/diploma/diploma-of-computing/', '2026-10-07T04:31:11.000Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_93925092ABAFAB4E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-certificate-in-business-fundamentals/', '2026-10-07T04:31:12.690Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_DA70A217C0BF3FDA'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-international-business-2/', '2026-10-07T04:31:14.041Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_447298D4297F0527'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-certificate-in-supply-chain-management/', '2026-10-07T06:45:15.344Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_2C6E53C5AE4AF253'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-supply-chain-management-professional/', '2026-10-07T06:45:17.399Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3F939098483992F2'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-certificate-in-clinical-leadership/', '2026-10-07T06:45:19.339Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_AF8F7E4E2E24192D'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-certificate-in-wound-ostomy-continence-practice/', '2026-10-07T06:45:21.414Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_38DFDB0EAB52DAEE'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-advanced-practice/', '2026-10-07T06:45:24.071Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BA7F640733AB2D7E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-computing/', '2026-10-07T06:45:30.052Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_06ED9D1A8CEA9E08'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-computing/master-of-computing-artificial-intelligence-major/', '2026-10-07T06:45:31.461Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_5048A91A2A6BE60C'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-computing/master-of-computing-computer-science-major/', '2026-10-07T06:45:32.919Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3A7E4676773352A1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-computing/master-of-computing-cyber-security-major/', '2026-10-07T06:45:35.647Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_644509C5A020E1DB'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-artificial-intelligence/', '2026-10-07T06:45:37.389Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_3BD462F1B0BB13FF'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/master-of-cyber-security/', '2026-10-07T06:45:39.518Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_9CA55DB9D9F83A48'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-certificate-in-predictive-analytics/', '2026-10-07T06:45:41.598Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_4F975BDEA6F0087E'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/postgraduate/graduate-diploma-in-predictive-analytics/', '2026-10-07T06:45:43.416Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A4F6B281FEDAFA96'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.curtin.edu.sg/wp-content/uploads/2025/12/curtin-singapore-campus-1200x675-1.jpg.optimal.jpg', 'https://www.curtin.edu.sg/courses/english-courses/english-for-academic-purposes/', '2026-10-07T06:45:45.424Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_CCA84EF7D20356B1'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/og%20image/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/professional-development/courses/course-listing/ai-dea-phase-1', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0C323828535995FC'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/og%20image/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/professional-development/courses/course-listing/tiktok-masterclass-695cc6a0cac5ac4a68ce6a67d4f7f8f9', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_0763BD3110886C1B'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/og%20image/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/academic-levels/bachelor', '2026-10-07T04:30:02.403Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_D97629371C7D4F55'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim-homepage/og%20image/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/academic-levels/diploma', '2026-10-07T04:30:07.470Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_8DA09C609CB67384'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.sim.edu.sg/CMSPages/GetAmazonFile.aspx?path=~%5Conesim%5Cmedia%5Csim%5Cdegrees%20and%20diplomas%5Cprogrammes%5Cprogrammes%20listing%5Cuni%20of%20london%5Cuni-of-london-og.jpg&hash=b0f9e24151ddeda33a817b59ba2bfbf2a779fc390a94d1b78cacdb16dc8ea11e&ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-science-honours-computer-science', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_BE75E98B59483949'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.sim.edu.sg/CMSPages/GetAmazonFile.aspx?path=~%5Conesim%5Cmedia%5Csim%5Cdegrees%20and%20diplomas%5Cprogrammes%5Cprogrammes%20listing%5Cuni%20of%20london%5Cuni-of-london-og.jpg&hash=b0f9e24151ddeda33a817b59ba2bfbf2a779fc390a94d1b78cacdb16dc8ea11e&ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-science-honours-business-and-management', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_86C7B440A6C57C39'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.sim.edu.sg/CMSPages/GetAmazonFile.aspx?path=~%5Conesim%5Cmedia%5Csim%5Cdegrees%20and%20diplomas%5Cprogrammes%5Cprogrammes%20listing%5Cuni%20of%20london%5Cuni-of-london-og.jpg&hash=b0f9e24151ddeda33a817b59ba2bfbf2a779fc390a94d1b78cacdb16dc8ea11e&ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-science-honours-computer-science-web-and-mobile-development', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_04BB51BEA750040A'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://www.sim.edu.sg/CMSPages/GetAmazonFile.aspx?path=~%5Conesim%5Cmedia%5Csim%5Cdegrees%20and%20diplomas%5Cprogrammes%5Cprogrammes%20listing%5Cuni%20of%20wollongong%5Cuni-of-wollongong-og.jpg&hash=91c5c6b2f4a0bd7bc674ac08fa1ca5964c64df4dec0cecf5193e9a23307992ac&ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-business-information-systems', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_F67096D2155FEF37'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim/degrees%20and%20diplomas/programmes/programmes%20listing/sim%20ge%20uni/sim-ge-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/certificate-in-pre-sessional-business-management', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_05E24EC806B65E94'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim/degrees%20and%20diplomas/programmes/programmes%20listing/uni%20of%20buffalo/uni-at-buffalo-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-arts-communication-and-international-trade', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_15281D1A0DA73736'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
INSERT INTO programme_media (programme_id, kind, asset_url, source_url, source_checked_at, licence_raw, status, sort_order)
SELECT id, 'COURSE_IMAGE', 'https://onesim-production.s3.ap-southeast-1.amazonaws.com/onesim/media/sim/degrees%20and%20diplomas/programmes/programmes%20listing/uni%20of%20buffalo/uni-at-buffalo-og.jpg?ext=.jpg', 'https://www.sim.edu.sg/degrees-diplomas/programmes/programme-listing/bachelor-of-arts-sociology', '2026-10-08T02:12:16.048Z'::timestamptz, NULL, 'PUBLISHED', 0
FROM programmes WHERE programme_code = 'LP_PROG_A239978B7405EE8F'
ON CONFLICT (programme_id, kind, asset_url) DO UPDATE SET source_url = EXCLUDED.source_url, source_checked_at = EXCLUDED.source_checked_at, licence_raw = EXCLUDED.licence_raw, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order, updated_at = CURRENT_TIMESTAMP;
COMMIT;
