import { FILTERS, getApplications, type ApplicationSummary } from '../../services/applications';
import { sessionStore } from '../../stores/session';
type State = 'loading' | 'ready' | 'empty' | 'failed' | 'login';
Page({
  generation:0,
  data:{ filters:FILTERS, filter:'', state:'loading' as State, items:[] as ApplicationSummary[], page:0, hasMore:false, loadingMore:false, moreFailed:false },
  onShow(){void this.load();},
  onUnload(){this.generation++;},
  async onPullDownRefresh(){try {await this.load();} finally {wx.stopPullDownRefresh();}},
  onReachBottom(){if(this.data.hasMore && !this.data.loadingMore) void this.load(true);},
  retry(){void this.load();},
  more(){void this.load(true);},
  choose(event:WechatMiniprogram.BaseEvent){const filter=String(event.currentTarget.dataset.value ?? '');if(filter===this.data.filter)return;this.setData({filter});void this.load();},
  open(event:WechatMiniprogram.BaseEvent){wx.navigateTo({url:`/pages/application-detail/index?id=${event.currentTarget.dataset.id}`});},
  browse(){wx.switchTab({url:'/pages/universities/index'});},
  async load(append=false){
    if(append && (this.data.loadingMore || !this.data.hasMore))return;
    const generation=++this.generation;
    this.setData(append?{loadingMore:true,moreFailed:false}:{state:'loading' as State,items:[],loadingMore:false,moreFailed:false});
    const auth=await sessionStore.ensureAuthenticated();
    if(generation!==this.generation)return;
    if(!auth.ok){this.setData({state:'login' as State,loadingMore:false});return;}
    const page=append?this.data.page+1:0;
    const result=await getApplications(this.data.filter,page);
    if(generation!==this.generation)return;
    if(!result.ok){this.setData(append?{loadingMore:false,moreFailed:true}:{state:'failed' as State});return;}
    const items=append?[...this.data.items,...result.value.items]:result.value.items;
    this.setData({items,page,hasMore:result.value.hasMore,loadingMore:false,state:items.length?'ready' as State:'empty' as State});
  },
});
