import {
  deleteCommunityComment, deleteCommunityPost, listMyCommunityComments, listMyCommunityPosts,
  type CommunityMyComment, type CommunityMyPost,
} from '../../services/community';
import { sessionStore } from '../../stores/session';
import { errorCopy, formatCommunityTime, statusCopy, unwrapCommunityRoute } from '../../utils/community-ui';
import { communityPostRoute } from '../../utils/routes';

type PersonalTab = 'posts' | 'comments';
type PersonalState = 'loading' | 'ready' | 'empty' | 'offline' | 'failed';
type PersonalPostItem = CommunityMyPost & { displayTime: string; statusLabel: string };
type PersonalCommentItem = CommunityMyComment & { displayTime: string; statusLabel: string };
interface ItemEvent extends WechatMiniprogram.BaseEvent { currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & { dataset: { id?: string; post?: string } } }

let generation = 0;

Page({
  data: {
    tab: 'posts' as PersonalTab, state: 'loading' as PersonalState,
    posts: [] as PersonalPostItem[], comments: [] as PersonalCommentItem[],
    nextCursor: null as string | null, loadingMore: false, deletingId: null as string | null,
  },
  onLoad() { generation = 0; void this.requireLoginAndLoad(); },
  onPullDownRefresh() { void this.load(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() { if (this.data.state === 'ready' && this.data.nextCursor && !this.data.loadingMore) void this.load(false); },
  switchTab(event: WechatMiniprogram.BaseEvent) {
    const tab = event.currentTarget.dataset.tab;
    if ((tab !== 'posts' && tab !== 'comments') || tab === this.data.tab) return;
    this.setData({ tab, posts: [], comments: [], nextCursor: null }, () => void this.load(true));
  },
  retry() { void this.requireLoginAndLoad(); },
  async requireLoginAndLoad() {
    if (sessionStore.getSnapshot().status !== 'authenticated') {
      const result = await sessionStore.ensureAuthenticated();
      if (!result.ok) { this.setData({ state: 'failed' as PersonalState }); return; }
    }
    await this.load(true);
  },
  async load(reset: boolean) {
    if (!reset && this.data.loadingMore) return;
    const cursor = reset ? null : this.data.nextCursor; if (!reset && !cursor) return;
    const request = ++generation;
    if (reset) this.setData({ state: 'loading' as PersonalState }); else this.setData({ loadingMore: true });
    const result = this.data.tab === 'posts' ? await listMyCommunityPosts({ cursor, size: 20 }) : await listMyCommunityComments({ cursor, size: 20 });
    if (request !== generation) return;
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') return;
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMore: false }); return;
    }
    if (this.data.tab === 'posts') {
      const incoming = result.value.items as readonly CommunityMyPost[];
      const items = new Map((reset ? [] : this.data.posts).map((item) => [item.id, item]));
      incoming.forEach((item) => items.set(item.id, { ...item, displayTime: formatCommunityTime(item.createdAt), statusLabel: statusCopy(item.status) }));
      const posts = [...items.values()]; this.setData({ posts, nextCursor: result.value.nextCursor, loadingMore: false, state: posts.length ? 'ready' : 'empty' });
    } else {
      const incoming = result.value.items as readonly CommunityMyComment[];
      const items = new Map((reset ? [] : this.data.comments).map((item) => [item.id, item]));
      incoming.forEach((item) => items.set(item.id, { ...item, displayTime: formatCommunityTime(item.createdAt), statusLabel: statusCopy(item.status) }));
      const comments = [...items.values()]; this.setData({ comments, nextCursor: result.value.nextCursor, loadingMore: false, state: comments.length ? 'ready' : 'empty' });
    }
  },
  openItem(event: ItemEvent) {
    const id = this.data.tab === 'posts' ? event.currentTarget.dataset.id : event.currentTarget.dataset.post;
    if (!id) return; const route = unwrapCommunityRoute(communityPostRoute(id)); if (route) wx.navigateTo({ url: route });
  },
  async deleteItem(event: ItemEvent) {
    const id = event.currentTarget.dataset.id; if (!id || this.data.deletingId) return;
    const confirmed = await confirmDelete(); if (!confirmed) return;
    this.setData({ deletingId: id });
    const result = this.data.tab === 'posts' ? await deleteCommunityPost(id) : await deleteCommunityComment(id);
    if (!result.ok) wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    else await this.load(true);
    this.setData({ deletingId: null });
  },
});

function confirmDelete(): Promise<boolean> {
  return new Promise((resolve) => wx.showModal({ title: '确认删除', content: '删除后内容会保留“已删除”状态，且不能恢复。', confirmText: '删除', confirmColor: '#9f2f2f', success: (result) => resolve(result.confirm), fail: () => resolve(false) }));
}
