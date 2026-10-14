import { getProgrammeFavorites, removeProgrammeFavorite, type ProgrammeFavorite } from '../../services/miniapp-data';
import { favoriteUniversities } from '../../stores/favorites';
import { getUniversityDetail } from '../../services/universities';
import { universityCampusUrl, universityLogoUrl } from '../../services/university-media';
import { sessionStore } from '../../stores/session';
import { programmeDetailRoute, universityDetailRoute, consultationRoute } from '../../utils/routes';

type Event = { currentTarget: { dataset: Record<string, unknown> } };
type Group = { slug: string; name: string; location: string; cover: string | null; logo: string | null;
  saved: boolean; checked: boolean; partial: boolean; courses: Array<ProgrammeFavorite & { checked: boolean }> };
const dependencies = { favourites: getProgrammeFavorites, remove: removeProgrammeFavorite, schools: favoriteUniversities,
  detail: getUniversityDetail, session: sessionStore };
function nativePage<T>(options: T & ThisType<T & { setData(patch: Record<string, unknown>): void }>): T { return options; }

export function createFavoritesCartPage(deps = dependencies) {
  return nativePage({
    generation: 0,
    data: { groups: [] as Group[], selected: [] as number[], selectedCount: 0, allChecked: false,
      loading: true, failed: false, loginNeeded: false, detailsFailed: false, removing: 0, checkingOut: false, checkoutKey: '' },
    onShow() { void this.load(); },
    onHide() { this.generation++; this.setData({ groups: [], selected: [], selectedCount: 0, allChecked: false }); },
    onUnload() { this.generation++; },
    retry() { void this.load(); },
    async login() { if ((await deps.session.ensureAuthenticated()).ok) await this.load(); else wx.showToast({ title: '登录未完成，请重试', icon: 'none' }); },
    browse() { wx.navigateTo({ url: '/pages/planning-discovery/index' }); },
    refreshSelection(ids: number[]) {
      const available = new Set(this.data.groups.flatMap(group => group.courses.map(course => course.id)));
      const selected = [...new Set(ids)].filter(id => available.has(id));
      const groups = this.data.groups.map(group => {
        const courses = group.courses.map(course => ({ ...course, checked: selected.includes(course.id) }));
        const count = courses.filter(course => course.checked).length;
        return { ...group, courses, checked: courses.length > 0 && count === courses.length, partial: count > 0 && count < courses.length };
      });
      this.setData({ groups, selected, selectedCount: selected.length, allChecked: available.size > 0 && selected.length === available.size });
      this.setData({ checkoutKey: '' });
    },
    toggleCourse(event: Event) {
      const id = Number(event.currentTarget.dataset.id);
      this.refreshSelection(this.data.selected.includes(id) ? this.data.selected.filter(value => value !== id) : [...this.data.selected, id]);
    },
    toggleGroup(event: Event) {
      const group = this.data.groups.find(item => item.slug === event.currentTarget.dataset.slug);
      if (!group) return;
      const ids = group.courses.map(course => course.id);
      this.refreshSelection(group.checked ? this.data.selected.filter(id => !ids.includes(id)) : [...this.data.selected, ...ids]);
    },
    toggleAll() { this.refreshSelection(this.data.allChecked ? [] : this.data.groups.flatMap(group => group.courses.map(course => course.id))); },
    async checkout() {
      if (!this.data.selectedCount || this.data.checkingOut) { if (!this.data.selectedCount) wx.showToast({ title: '请先选择专业', icon: 'none' }); return; }
      const choices = this.data.groups.flatMap(group => group.courses.filter(course => this.data.selected.includes(course.id))
        .map(course => `${group.name}：${course.name}`));
      if (!choices.length) return;
      const route = consultationRoute({ intent: 'application', notes: `申请意向（待顾问确认，尚未向院校递交）：\n${choices.join('\n')}` });
      if (!route.ok) { wx.showToast({ title: '所选内容过长，请分批提交意向', icon: 'none' }); return; }
      wx.navigateTo({ url: route.value });
    },
    openSchool(event: Event) { const route = universityDetailRoute(String(event.currentTarget.dataset.slug)); if (route.ok) wx.navigateTo({ url: route.value }); },
    openCourse(event: Event) { const route = programmeDetailRoute(String(event.currentTarget.dataset.slug), Number(event.currentTarget.dataset.id)); if (route.ok) wx.navigateTo({ url: route.value }); },
    imageError(event: Event) {
      const key = event.currentTarget.dataset.kind === 'logo' ? 'logo' : 'cover';
      this.setData({ groups: this.data.groups.map(group => group.slug === event.currentTarget.dataset.slug ? { ...group, [key]: null } : group) });
    },
    removeSchool(event: Event) {
      const slug = String(event.currentTarget.dataset.slug);
      if (deps.schools.has(slug)) deps.schools.toggle(slug);
      this.setData({ groups: this.data.groups.map(group => group.slug === slug ? { ...group, saved: false } : group).filter(group => group.saved || group.courses.length) });
      this.refreshSelection(this.data.selected);
    },
    async removeCourse(event: Event) {
      if (this.data.removing) return;
      const id = Number(event.currentTarget.dataset.id);
      const generation = this.generation;
      this.setData({ removing: id });
      try {
        const result = await deps.remove(id);
        if (generation !== this.generation) return;
        if (!result.ok) { wx.showToast({ title: '取消收藏失败，请重试', icon: 'none' }); return; }
        this.setData({ groups: this.data.groups.map(group => ({ ...group, courses: group.courses.filter(course => course.id !== id) })).filter(group => group.saved || group.courses.length) });
        this.refreshSelection(this.data.selected);
      } catch { if (generation === this.generation) wx.showToast({ title: '取消收藏失败，请重试', icon: 'none' }); }
      finally { if (generation === this.generation) this.setData({ removing: 0 }); }
    },
    async load() {
      const generation = ++this.generation;
      this.setData({ loading: true, failed: false, detailsFailed: false, removing: 0, groups: [], selected: [], selectedCount: 0, allChecked: false });
      const authenticated = deps.session.getSnapshot().status === 'authenticated';
      this.setData({ loginNeeded: !authenticated });
      let courses: ProgrammeFavorite[] = [];
      let failed = false;
      if (authenticated) {
        try { const result = await deps.favourites(); if (result.ok) courses = result.value; else failed = true; }
        catch { failed = true; }
      }
      const saved = deps.schools.list();
      const slugs = [...new Set([...saved, ...courses.map(course => course.universitySlug)])];
      let detailsFailed = false;
      const groups: Group[] = [];
      for (const slug of slugs) {
        if (generation !== this.generation) return;
        const favourites = courses.filter(course => course.universitySlug === slug);
        let name = favourites[0]?.universityName || '院校资料暂不可用';
        let location = '';
        try { const result = await deps.detail(slug); if (result.ok) { name = result.value.nameZh || result.value.nameEn; location = [result.value.cityZh, result.value.countryNameZh].filter(Boolean).join('，'); } else detailsFailed = true; }
        catch { detailsFailed = true; }
        groups.push({ slug, name, location, cover: universityCampusUrl(slug), logo: universityLogoUrl(slug), saved: saved.includes(slug), checked: false, partial: false, courses: favourites.map(course => ({ ...course, checked: false })) });
      }
      if (generation !== this.generation) return;
      this.setData({ groups, loading: false, failed, detailsFailed });
    },
  });
}
Page(createFavoritesCartPage());
