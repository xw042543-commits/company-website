import { STAGES, type ApplicationDetail } from '../services/applications';
export function applicationTimeline(detail:ApplicationDetail){
  const closed=detail.application.status==='COMPLETED'||detail.application.status==='CANCELLED';
  return STAGES.map((title,index)=>{
    const number=index+1; const documents=detail.documents.filter((d)=>d.stage===number);
    const approved=documents.filter((d)=>d.status==='APPROVED').length;
    const events=detail.history.filter((e)=>e.stage===number);
    return {number,title,documents,approved,total:documents.length,fees:detail.fees.filter((f)=>f.stage===number),
      current:!closed && number===detail.application.stage,
      complete:detail.application.status==='COMPLETED'||number<detail.application.stage,
      note:number===detail.application.stage?detail.application.note:'',date:events[0]?.date ?? '',
      needsUpload:documents.some((d)=>d.editable),reviewNotes:documents.filter((d)=>d.reviewNote).map((d)=>`${d.title}：${d.reviewNote}`).join('\n'),
    };
  });
}
