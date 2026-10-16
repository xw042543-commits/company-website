import {createHash} from 'node:crypto';
export const COURSE_MODULE_FIELDS=['nameZh','nameEn','descriptionZh','descriptionEn','courseCode','credits','requirement','sourceUrl','sourceCheckedAt','curriculumVersion','evidence','translationMethod','translationCheckedAt'];
// Same nullable string framing as PostgreSQL; insensitive to JSON object key ordering.
export function courseModuleFingerprint(modules){
 return createHash('md5').update((modules??[]).map(m=>COURSE_MODULE_FIELDS.map(k=>m[k]==null?'\u001d':String(m[k])).join('\u001f')).join('\u001e')).digest('hex');
}
