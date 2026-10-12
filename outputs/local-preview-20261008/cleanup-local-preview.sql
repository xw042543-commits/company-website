\set ON_ERROR_STOP on
BEGIN;
DELETE FROM programmes WHERE programme_code LIKE 'LP_PROG_%';
DELETE FROM universities WHERE university_code LIKE 'LP_UNI_%';
DELETE FROM subject_categories WHERE code = 'LOCAL_PREVIEW_UNCLASSIFIED';
COMMIT;
