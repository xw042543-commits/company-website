import {getApplication,submitApplicationDocument,validApplicationId,type ApplicationDetail} from '../../services/applications';
import {applicationTimeline} from '../../utils/application-timeline';
import {sessionStore} from '../../stores/session';
type State='loading'|'ready'|'failed'|'login';
Page({
  generation:0,
  data:{id:'',state:'loading' as State,detail:null as ApplicationDetail|null,tab:'progress',expanded:0,steps:[] as ReturnType<typeof applicationTimeline>,uploading:'',
    tabs:[{key:'progress',label:'申请进度'},{key:'documents',label:'申请材料'},{key:'fees',label:'申请费用'},{key:'history',label:'进度记录'}]},
  onLoad(options:Record<string,string|undefined>){this.setData({id:options.id??''});void this.load();},
  onUnload(){this.generation++;},
  async onPullDownRefresh(){try{await this.load();}finally{wx.stopPullDownRefresh();}},
  retry(){void this.load();},
  chooseTab(event:WechatMiniprogram.BaseEvent){this.setData({tab:String(event.currentTarget.dataset.key)});},
  expand(event:WechatMiniprogram.BaseEvent){const number=Number(event.currentTarget.dataset.number);this.setData({expanded:this.data.expanded===number?0:number});},
  documents(){this.setData({tab:'documents'});},
  review(event:WechatMiniprogram.BaseEvent){const step=this.data.steps.find((s)=>s.number===Number(event.currentTarget.dataset.number));wx.showModal({title:'审核意见',content:step?.reviewNotes||'暂无审核意见',showCancel:false});},
  apply(detail:ApplicationDetail){this.setData({detail,steps:applicationTimeline(detail),state:'ready' as State,expanded:this.data.expanded||detail.application.stage});},
  async load(){
    if(this.data.uploading)return;
    const generation=++this.generation;this.setData({state:'loading' as State});
    if(!validApplicationId(this.data.id)){this.setData({state:'failed' as State});return;}
    const auth=await sessionStore.ensureAuthenticated();if(generation!==this.generation)return;
    if(!auth.ok){this.setData({state:'login' as State});return;}
    const result=await getApplication(this.data.id);if(generation!==this.generation)return;
    if(result.ok)this.apply(result.value);else this.setData({state:'failed' as State});
  },
  async upload(event:WechatMiniprogram.BaseEvent){
    const document=String(event.currentTarget.dataset.id??'');
    if(this.data.uploading||!this.data.detail?.documents.some((d)=>d.id===document&&d.editable))return;
    const generation=this.generation;
    this.setData({uploading:document});
    try{
      const selection=await wx.chooseMessageFile({count:1,type:'file',extension:['pdf','png','jpg','jpeg']});
      const file=selection.tempFiles[0];if(!file)return;
      if(file.size>1048576){wx.showToast({title:'请选择 1 MB 以内的文件',icon:'none'});return;}
      const content=await new Promise<string>((resolve,reject)=>wx.getFileSystemManager().readFile({filePath:file.path,encoding:'base64',success:r=>resolve(String(r.data)),fail:reject}));
      if(generation!==this.generation)return;
      const result=await submitApplicationDocument(this.data.id,document,file.name,content);
      if(generation!==this.generation)return;
      if(result.ok){this.apply(result.value);wx.showToast({title:'材料已提交',icon:'success'});}
      else wx.showToast({title:'提交失败，请刷新后重试',icon:'none'});
    }catch(error){
      const message=typeof error==='object'&&error&&'errMsg' in error?String(error.errMsg):'';
      if(!message.includes('cancel'))wx.showToast({title:'无法读取文件，请重试',icon:'none'});
    }finally{if(generation===this.generation)this.setData({uploading:''});}
  },
});
