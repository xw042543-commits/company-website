import { getProgrammeFavorites, removeProgrammeFavorite, type ProgrammeFavorite } from '../../services/miniapp-data';
import { sessionStore } from '../../stores/session'; import { programmeDetailRoute } from '../../utils/routes';
type State = 'loading'|'ready'|'empty'|'failed';
Page({ data:{state:'loading' as State,items:[] as ProgrammeFavorite[]}, onShow(){void this.load();}, retry(){void this.load();},
  open(event:WechatMiniprogram.BaseEvent){const route=programmeDetailRoute(String(event.currentTarget.dataset.slug??''),Number(event.currentTarget.dataset.id));if(route.ok)wx.navigateTo({url:route.value});},
  async remove(event:WechatMiniprogram.BaseEvent){const result=await removeProgrammeFavorite(Number(event.currentTarget.dataset.id));if(result.ok)void this.load();else wx.showToast({title:'操作失败',icon:'none'});},
  async load(){this.setData({state:'loading' as State});if(!(await sessionStore.ensureAuthenticated()).ok){this.setData({state:'failed' as State});return;}const result=await getProgrammeFavorites();if(!result.ok){this.setData({state:'failed' as State});return;}this.setData({items:result.value,state:result.value.length?'ready' as State:'empty' as State});}
});
