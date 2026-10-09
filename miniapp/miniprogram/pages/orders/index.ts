import { getApplicationOrders, type ApplicationOrderStatus, type ApplicationOrderSummary } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session';
import { applicationOrderRoute } from '../../utils/routes';

type PageState = 'loading' | 'ready' | 'empty' | 'failed';
type Filter = 'ALL' | ApplicationOrderStatus;
type OrderItem = ApplicationOrderSummary & { readonly statusTone: string };

const tabs: ReadonlyArray<{ key: Filter; label: string }> = [
  { key: 'ALL', label: '全部申请' },
  { key: 'IN_PROGRESS', label: '进行中' },
  { key: 'NEEDS_DOCUMENTS', label: '待补充材料' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
];

Page({
  data: {
    state: 'loading' as PageState,
    tabs,
    activeFilter: 'ALL' as Filter,
    orders: [] as OrderItem[],
    visibleOrders: [] as OrderItem[],
  },

  onShow() { void this.load(); },
  retry() { void this.load(); },

  switchFilter(event: WechatMiniprogram.BaseEvent) {
    const key = event.currentTarget.dataset.key as Filter | undefined;
    if (!key) return;
    this.setData({ activeFilter: key, visibleOrders: this.filter(this.data.orders, key) });
  },

  openOrder(event: WechatMiniprogram.BaseEvent) {
    const referenceCode = event.currentTarget.dataset.reference as string | undefined;
    if (!referenceCode) return;
    const route = applicationOrderRoute(referenceCode);
    if (route.ok) wx.navigateTo({ url: route.value });
  },

  async load() {
    this.setData({ state: 'loading' as PageState });
    const authenticated = await sessionStore.ensureAuthenticated();
    if (!authenticated.ok) { this.setData({ state: 'failed' as PageState }); return; }
    const result = await getApplicationOrders();
    if (!result.ok) { this.setData({ state: 'failed' as PageState }); return; }
    const orders: OrderItem[] = result.value.map((order) => ({
      ...order,
      statusTone: order.status === 'NEEDS_DOCUMENTS' ? 'warning' : order.status === 'CANCELLED' ? 'muted'
        : order.status === 'COMPLETED' ? 'complete' : 'active',
    }));
    this.setData({ orders, visibleOrders: this.filter(orders, this.data.activeFilter),
      state: orders.length ? 'ready' as PageState : 'empty' as PageState });
  },

  filter(orders: OrderItem[], filter: Filter): OrderItem[] {
    return filter === 'ALL' ? orders : orders.filter((order) => order.status === filter);
  },
});
