-- University media completion for the local review environment.
-- Generated: 2026-10-09
-- This script is idempotent. It does not modify university master data.

WITH local_logos(slug, asset_url) AS (
    VALUES
        ('apu', '/universities/asia-pacific-university.png'),
        ('city', '/universities/city-university-malaysia.png'),
        ('help', '/universities/help-university.png'),
        ('inti', '/universities/inti-international-university.jpg'),
        ('mahsa', '/universities/mahsa-university.png'),
        ('monash', '/universities/monash-university-malaysia.jpg'),
        ('nilai', '/universities/nilai-university.png'),
        ('nottingham', '/universities/university-of-nottingham-malaysia.svg'),
        ('segi', '/universities/segi-university.jpg'),
        ('southampton', '/universities/university-of-southampton-malaysia.png'),
        ('sunway', '/universities/sunway-university.jpg'),
        ('taylor', '/universities/taylors-university.jpg'),
        ('ucsi', '/universities/ucsi-university.jpg'),
        ('ukm', '/universities/universiti-kebangsaan-malaysia.jpg'),
        ('um', '/universities/university-of-malaya.jpg'),
        ('upm', '/universities/universiti-putra-malaysia.jpg'),
        ('usm', '/universities/universiti-sains-malaysia.jpg'),
        ('utar', '/universities/universiti-tunku-abdul-rahman.png'),
        ('utm', '/universities/universiti-teknologi-malaysia.jpg'),
        ('uum', '/universities/universiti-utara-malaysia.jpg')
)
INSERT INTO university_media (
    university_id, kind, asset_url, source_url, source_checked_at,
    licence_raw, status, sort_order
)
SELECT
    u.id, 'LOGO', l.asset_url, l.asset_url, TIMESTAMPTZ '2026-10-09 00:00:00+08',
    NULL, 'PUBLISHED', 0
FROM local_logos l
JOIN universities u ON u.slug = l.slug
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET
    source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

WITH sourced_images(slug, asset_url, source_url, licence_raw) AS (
    VALUES
        (
            'local-preview-kings-college-london',
            'https://commons.wikimedia.org/wiki/Special:Redirect/file/King%27s%20College%20London%20Denmark%20Hill.jpg',
            'https://commons.wikimedia.org/wiki/File:King%27s_College_London_Denmark_Hill.jpg',
            'Public domain; Wikimedia Commons source page'
        ),
        (
            'local-preview-university-of-st-andrews',
            'https://commons.wikimedia.org/wiki/Special:Redirect/file/St%20Andrews%20University%20Classics%20Building.jpg',
            'https://commons.wikimedia.org/wiki/File:St_Andrews_University_Classics_Building.jpg',
            'CC BY-SA 3.0 and GFDL; Wikimedia Commons source page'
        ),
        (
            'local-preview-carnegie-mellon-university',
            'https://commons.wikimedia.org/wiki/Special:Redirect/file/CMU%20Buildings.JPG',
            'https://commons.wikimedia.org/wiki/File:CMU_Buildings.JPG',
            'Public domain; Wikimedia Commons source page'
        ),
        (
            'local-preview-adelaide-university',
            'https://commons.wikimedia.org/wiki/Special:Redirect/file/University%20of%20Adelaide.jpg',
            'https://commons.wikimedia.org/wiki/File:University_of_Adelaide.jpg',
            'CC BY-SA 2.0; Wikimedia Commons source page'
        ),
        (
            'local-preview-curtin-university',
            'https://commons.wikimedia.org/wiki/Special:Redirect/file/Curtin%20building%20408%20from%20E%202.jpg',
            'https://commons.wikimedia.org/wiki/File:Curtin_building_408_from_E_2.jpg',
            'CC BY-SA 4.0; Wikimedia Commons source page'
        ),
        (
            'local-preview-kaplan-singapore',
            'https://www.kaplan.com.sg/files/styles/medium_big_sm/public/Life%20On%20Campus/Wilkie%20Edge%20Reception_0.jpg?itok=e77wDO4m',
            'https://www.kaplan.com.sg/facilities-our-campus',
            NULL
        )
)
INSERT INTO university_media (
    university_id, kind, asset_url, source_url, source_checked_at,
    licence_raw, status, sort_order
)
SELECT
    u.id, 'UNIVERSITY_IMAGE', s.asset_url, s.source_url,
    TIMESTAMPTZ '2026-10-09 00:00:00+08', s.licence_raw, 'PUBLISHED', 0
FROM sourced_images s
JOIN universities u ON u.slug = s.slug
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET
    source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    licence_raw = EXCLUDED.licence_raw,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- Keep review images inside the frontend so cards do not depend on external
-- hotlinking rules. Superseded external images stay recorded but archived.
UPDATE university_media AS m
SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP
FROM universities AS u
WHERE m.university_id = u.id
  AND m.kind = 'UNIVERSITY_IMAGE'
  AND (
      (u.slug = 'local-preview-kaplan-singapore'
          AND m.asset_url <> '/universities/campuses/kaplan-singapore-campus.jpg')
      OR
      (u.slug = 'local-preview-unsw-sydney'
          AND m.asset_url <> '/universities/campuses/unsw-sydney-campus.jpg')
  );

WITH local_campus_images(slug, asset_url, source_url, licence_raw) AS (
    VALUES
        (
            'local-preview-kaplan-singapore',
            '/universities/campuses/kaplan-singapore-campus.jpg',
            'https://www.kaplan.com.sg/facilities-our-campus',
            NULL
        ),
        (
            'local-preview-unsw-sydney',
            '/universities/campuses/unsw-sydney-campus.jpg',
            'https://commons.wikimedia.org/wiki/File:Unsw_quadrangle_building_2010-05-11.jpg',
            'CC BY 2.0; Wikimedia Commons source page'
        )
)
INSERT INTO university_media (
    university_id, kind, asset_url, source_url, source_checked_at,
    licence_raw, status, sort_order
)
SELECT
    u.id, 'UNIVERSITY_IMAGE', i.asset_url, i.source_url,
    TIMESTAMPTZ '2026-10-09 00:00:00+08', i.licence_raw, 'PUBLISHED', 0
FROM local_campus_images i
JOIN universities u ON u.slug = i.slug
ON CONFLICT (university_id, kind, asset_url) DO UPDATE SET
    source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    licence_raw = EXCLUDED.licence_raw,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;
