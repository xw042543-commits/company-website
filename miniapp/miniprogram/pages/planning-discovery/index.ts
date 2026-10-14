import { loadFilterOptions, type FilterOptions, type FilterOption } from '../../services/catalogue';
import { createPlanningDiscoveryService } from '../../services/planning-discovery';
import type { UniversitySummary, UniversityProgramme } from '../../services/universities';
import { buildUniversitySearchPath } from '../../services/universities';
import { universityLogoUrl } from '../../services/university-media';
import { universityDetailRoute, programmeDetailRoute } from '../../utils/routes';
import { normalizeStudyLevelOptions, studyLevelNameZh } from '../../utils/study-level-display';

const fields = ['q', 'level', 'category', 'country', 'mode', 'language', 'duration', 'intake', 'tuitionMin', 'tuitionMax'] as const;
type Field = typeof fields[number];
type Filters = Record<Field, string>;
type ViewState = 'loading' | 'ready' | 'empty' | 'failed' | 'offline';
type Event = { currentTarget: { dataset: Record<string, unknown> } };
type ValueEvent = Event & { detail: { value: string } };
type Course = UniversityProgramme & { levelLabel: string };
type School = UniversitySummary & { logoUrl: string | null; imageFailed: boolean; logoFailed: boolean;
  expanded: boolean; courses: Course[]; courseState: 'idle' | 'loading' | 'ready' | 'failed'; coursePage: number; coursePages: number };
type Group = { field: Field; title: string; options: FilterOption[]; index: number; selected: string };
const blank = (): Filters => ({ q: '', level: '', category: '', country: '', mode: '', language: '', duration: '', intake: '', tuitionMin: '', tuitionMax: '' });
const labels: Record<Field, string> = { q: '专业', level: '学历', category: '专业', country: '国家', mode: '学习模式', language: '授课语言', duration: '学制（月）', intake: '入学时间', tuitionMin: '最低学费', tuitionMax: '最高学费' };
const groups = [['level', 'studyLevels'], ['category', 'subjectCategories'], ['country', 'countries'], ['language', 'languages'], ['mode', 'courseModes']] as const;
const runtime = new WeakMap<object, { generation: number; alive: boolean }>();
function state(page: object) { let value = runtime.get(page); if (!value) { value = { generation: 0, alive: true }; runtime.set(page, value); } return value; }
function isField(value: unknown): value is Field { return fields.some(field => field === value); }
function nativePage<T>(options: T & ThisType<T & { setData(patch: Record<string, unknown>): void }>): T { return options; }
function optionGroups(options: FilterOptions | null, filters: Filters): Group[] {
  return groups.map(([field, source]) => {
    const sourceOptions = options?.[source] ?? [];
    const values = [{ code: '', nameZh: '不限', nameEn: 'Any' },
      ...(source === 'studyLevels' ? normalizeStudyLevelOptions(sourceOptions) : sourceOptions)];
    const index = Math.max(0, values.findIndex(option => option.code === filters[field]));
    return { field, title: labels[field], options: values, index, selected: values[index]!.nameZh || values[index]!.nameEn };
  });
}
function validation(filters: Filters): string {
  if (filters.q.length > 100) return '专业关键词请控制在 100 字以内';
  if (filters.duration && (!/^[1-9]\d*$/.test(filters.duration) || Number(filters.duration) > 2147483647)) return '学制请填写有效的正整数（月）';
  if (filters.intake && !/^\d{4}-(0[1-9]|1[0-2])$/.test(filters.intake)) return '入学时间请选择有效年月';
  for (const field of ['tuitionMin', 'tuitionMax'] as const) {
    if (filters[field] && !/^\d+(\.\d{1,2})?$/.test(filters[field])) return '学费请填写非负金额，最多两位小数';
  }
  if (filters.tuitionMin && filters.tuitionMax && Number(filters.tuitionMin) > Number(filters.tuitionMax)) return '最高学费不能小于最低学费';
  return '';
}

export function createPlanningDiscoveryPage(overrides: Partial<ReturnType<typeof createPlanningDiscoveryService> & { filters: typeof loadFilterOptions }> = {}) {
  const deps = { ...createPlanningDiscoveryService(), filters: loadFilterOptions, ...overrides };
  return nativePage({
    data: {
      keyword: '', applied: blank(), draft: blank(), filterOpen: false, validation: '',
      catalogue: null as FilterOptions | null, filtersFailed: false, filtersLoading: true,
      quickGroups: optionGroups(null, blank()).slice(0, 3), draftGroups: optionGroups(null, blank()),
      chips: [] as Array<{ field: Field; text: string }>,
      schools: [] as School[], state: 'loading' as ViewState, totalItems: 0, page: 1, totalPages: 0,
      loadingMore: false, moreFailed: false,
    },
    onLoad() { state(this).alive = true; void this.loadFilters(); void this.loadResults(true); },
    onUnload() { state(this).alive = false; state(this).generation++; },
    onPullDownRefresh() { void this.loadResults(true).finally(() => wx.stopPullDownRefresh()); },
    onReachBottom() { if (!this.data.filterOpen) void this.loadResults(false); },
    async loadFilters() {
      this.setData({ filtersLoading: true, filtersFailed: false });
      try {
        const result = await deps.filters(); if (!state(this).alive) return;
        this.setData({ filtersLoading: false, filtersFailed: !result.ok, catalogue: result.ok ? result.value : null });
        this.refreshLabels();
      } catch { if (state(this).alive) this.setData({ filtersLoading: false, filtersFailed: true }); }
    },
    refreshLabels() {
      const available = optionGroups(this.data.catalogue, this.data.applied);
      const chips = fields.filter(field => this.data.applied[field]).map(field => {
        const group = available.find(item => item.field === field);
        const value = group ? group.selected : this.data.applied[field];
        return { field, text: `${labels[field]}：${value}${field.startsWith('tuition') ? ' 元' : ''}` };
      });
      this.setData({ quickGroups: available.slice(0, 3), draftGroups: optionGroups(this.data.catalogue, this.data.draft), chips });
    },
    updateKeyword(event: { detail: { value: string } }) { this.setData({ keyword: event.detail.value }); },
    async submitSearch() {
      const applied = { ...this.data.applied, q: this.data.keyword.trim() };
      const error = validation(applied); if (error) { this.setData({ validation: error }); return; }
      this.setData({ applied, validation: '' }); this.refreshLabels(); await this.loadResults(true);
    },
    async quickSelect(event: ValueEvent) {
      const field = event.currentTarget.dataset.field;
      const group = this.data.quickGroups.find(item => item.field === field);
      const selected = group?.options[Number(event.detail.value)]; if (!group || !selected) return;
      this.setData({ applied: { ...this.data.applied, [group.field]: selected.code } });
      this.refreshLabels(); await this.loadResults(true);
    },
    openFilters() { this.setData({ filterOpen: true, draft: { ...this.data.applied, q: this.data.keyword }, validation: '' }); this.refreshLabels(); },
    closeFilters() { this.setData({ filterOpen: false, validation: '' }); },
    updateDraft(event: ValueEvent) {
      const field = event.currentTarget.dataset.field; if (!isField(field)) return;
      this.setData({ draft: { ...this.data.draft, [field]: event.detail.value }, validation: '' });
    },
    selectDraft(event: ValueEvent) {
      const group = this.data.draftGroups.find(item => item.field === event.currentTarget.dataset.field);
      const selected = group?.options[Number(event.detail.value)]; if (!group || !selected) return;
      this.setData({ draft: { ...this.data.draft, [group.field]: selected.code } }); this.refreshLabels();
    },
    resetDraft() { this.setData({ draft: blank(), validation: '' }); this.refreshLabels(); },
    clearDraftField(event: Event) {
      const field = event.currentTarget.dataset.field; if (isField(field)) this.setData({ draft: { ...this.data.draft, [field]: '' } });
    },
    async applyFilters() {
      const applied = Object.fromEntries(fields.map(field => [field, this.data.draft[field].trim()])) as Filters;
      const error = validation(applied); if (error) { this.setData({ validation: error }); return; }
      this.setData({ applied, keyword: applied.q, filterOpen: false, validation: '' });
      this.refreshLabels(); await this.loadResults(true);
    },
    async removeFilter(event: Event) {
      const field = event.currentTarget.dataset.field; if (!isField(field)) return;
      const applied = { ...this.data.applied, [field]: '' };
      this.setData({ applied, keyword: applied.q }); this.refreshLabels(); await this.loadResults(true);
    },
    async clearFilters() { this.setData({ applied: blank(), keyword: '', validation: '' }); this.refreshLabels(); await this.loadResults(true); },
    retry() { void this.loadResults(true); },
    loadMore() { void this.loadResults(false); },
    async loadResults(reset: boolean) {
      const local = state(this);
      if (!reset && (this.data.state !== 'ready' || this.data.loadingMore || this.data.page >= this.data.totalPages)) return;
      const generation = reset ? ++local.generation : local.generation;
      const page = reset ? 1 : this.data.page + 1;
      this.setData(reset ? { state: 'loading' as ViewState, schools: [], totalItems: 0, page: 1, totalPages: 0, loadingMore: false, moreFailed: false }
        : { loadingMore: true, moreFailed: false });
      try {
        const result = await deps.search({ ...this.data.applied, page, size: 12 });
        if (!local.alive || generation !== local.generation) return;
        if (!result.ok) {
          this.setData(reset ? { state: result.error.kind === 'unavailable' ? 'offline' as ViewState : 'failed' as ViewState }
            : { loadingMore: false, moreFailed: true }); return;
        }
        const additions: School[] = result.value.items.map(item => ({ ...item, logoUrl: universityLogoUrl(item.slug), imageFailed: false, logoFailed: false,
          expanded: false, courses: [], courseState: 'idle', coursePage: 0, coursePages: 0 }));
        const schools = [...new Map([...(reset ? [] : this.data.schools), ...additions].map(item => [item.slug, item])).values()];
        this.setData({ schools, totalItems: result.value.totalItems, page: result.value.page, totalPages: result.value.totalPages,
          state: schools.length ? 'ready' as ViewState : 'empty' as ViewState, loadingMore: false });
      } catch {
        if (local.alive && generation === local.generation) this.setData(reset ? { state: 'failed' as ViewState } : { loadingMore: false, moreFailed: true });
      }
    },
    patchSchool(slug: string, patch: Partial<School>) { this.setData({ schools: this.data.schools.map(item => item.slug === slug ? { ...item, ...patch } : item) }); },
    async toggleCourses(event: Event) {
      const slug = String(event.currentTarget.dataset.slug ?? ''); const school = this.data.schools.find(item => item.slug === slug); if (!school) return;
      this.patchSchool(slug, { expanded: !school.expanded });
      if (!school.expanded && school.courseState === 'idle') await this.loadCourses(slug);
    },
    moreCourses(event: Event) { void this.loadCourses(String(event.currentTarget.dataset.slug ?? '')); },
    async loadCourses(slug: string) {
      const school = this.data.schools.find(item => item.slug === slug);
      if (!school || school.courseState === 'loading' || (school.coursePage > 0 && school.coursePage >= school.coursePages)) return;
      const local = state(this); const generation = local.generation;
      this.patchSchool(slug, { courseState: 'loading' });
      try {
        const result = await deps.programmes(slug, this.data.applied, school.coursePage + 1);
        if (!local.alive || generation !== local.generation) return;
        if (!result.ok) { this.patchSchool(slug, { courseState: 'failed' }); return; }
        const courses = result.value.items.map(item => {
          const option = this.data.catalogue?.studyLevels.find(candidate => candidate.code === item.studyLevelCode);
          return { ...item, levelLabel: studyLevelNameZh({ code: item.studyLevelCode, nameZh: option?.nameZh, nameEn: option?.nameEn }) };
        });
        this.patchSchool(slug, { courses: [...school.courses, ...courses], courseState: 'ready', coursePage: result.value.page, coursePages: result.value.totalPages });
      } catch { if (local.alive && generation === local.generation) this.patchSchool(slug, { courseState: 'failed' }); }
    },
    imageError(event: Event) {
      const slug = String(event.currentTarget.dataset.slug ?? '');
      this.patchSchool(slug, event.currentTarget.dataset.kind === 'logo' ? { logoFailed: true } : { imageFailed: true });
    },
    openUniversity(event: Event) {
      const route = universityDetailRoute(String(event.currentTarget.dataset.slug ?? ''));
      if (route.ok) {
        const query = buildUniversitySearchPath(this.data.applied).split('?')[1];
        wx.navigateTo({ url: `${route.value}&planning=1&${query}` });
      }
    },
    openProgramme(event: Event) {
      const route = programmeDetailRoute(String(event.currentTarget.dataset.slug ?? ''), String(event.currentTarget.dataset.id ?? ''));
      if (route.ok) wx.navigateTo({ url: route.value });
    },
    openPlans() { wx.navigateTo({ url: '/pages/plans/index' }); },
    noop() {},
  });
}

Page(createPlanningDiscoveryPage());
