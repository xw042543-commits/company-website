import { getConsultations, type ConsultationRecord } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
import { isCommunityTimestamp } from '../../utils/community-validation';

type State = 'loading' | 'ready' | 'empty' | 'failed';
interface RecordView extends ConsultationRecord {
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly submittedLabel: string;
  readonly qualificationLabel: string;
  readonly canExpand: boolean;
  readonly expanded: boolean;
}

function toRecordView(record: ConsultationRecord): RecordView {
  const statuses: Record<string, { label: string; tone: string }> = {
    NEW: { label: '待顾问跟进', tone: 'waiting' },
    IN_PROGRESS: { label: '顾问跟进中', tone: 'active' },
    COMPLETED: { label: '咨询已完成', tone: 'complete' },
  };
  const status = Object.hasOwn(statuses, record.status) ? statuses[record.status] : undefined;
  const qualifications: Record<string, string> = { foundation: '预科', bachelor: '本科', master: '硕士', doctorate: '博士', 预科: '预科', 本科: '本科', 硕士: '硕士', 博士: '博士' };
  return {
    ...record,
    statusLabel: status?.label ?? '状态待确认',
    statusTone: status?.tone ?? 'unknown',
    submittedLabel: submissionTime(record.submittedAt),
    qualificationLabel: !record.qualification ? '' : Object.hasOwn(qualifications, record.qualification)
      ? qualifications[record.qualification]! : '学历待确认',
    canExpand: record.notes.length > 80 || record.notes.split('\n').length > 3,
    expanded: false,
  };
}

function submissionTime(value: string): string {
  if (!isCommunityTimestamp(value)) return '时间未记录';
  // Display consistently in China/Malaysia time, regardless of the device timezone.
  const local = new Date(Date.parse(value) + 8 * 60 * 60 * 1000);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

Page({
  data: { state: 'loading' as State, items: [] as RecordView[] },
  loadGeneration: 0,
  onShow() { void this.load(); },
  onHide() {
    this.loadGeneration += 1;
    this.setData({ items: [] as RecordView[], state: 'loading' as State });
  },
  onUnload() { this.loadGeneration += 1; },
  retry() { void this.load(); },
  async load() {
    const generation = ++this.loadGeneration;
    this.setData({ state: 'loading' as State, items: [] as RecordView[] });
    try {
      const authenticated = await sessionStore.ensureAuthenticated();
      if (generation !== this.loadGeneration) return;
      if (!authenticated.ok) { this.setData({ state: 'failed' as State }); return; }
      const result = await getConsultations();
      if (generation !== this.loadGeneration) return;
      if (!result.ok) { this.setData({ state: 'failed' as State }); return; }
      const items = result.value.map(toRecordView);
      this.setData({ items, state: items.length ? 'ready' as State : 'empty' as State });
    } catch {
      if (generation === this.loadGeneration) this.setData({ state: 'failed' as State });
    }
  },
  toggleNotes(event: WechatMiniprogram.TouchEvent) {
    const reference = event.currentTarget.dataset.reference;
    this.setData({ items: this.data.items.map(item => item.referenceCode === reference && item.canExpand
      ? { ...item, expanded: !item.expanded } : item) });
  },
  contactAdviser() { wx.navigateTo({ url: '/pages/about/index' }); },
});
