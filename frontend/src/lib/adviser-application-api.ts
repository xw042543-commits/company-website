export type ApplicationStatus="UNPAID"|"PAID"|"IN_PROGRESS"|"NEEDS_DOCUMENTS"|"SUBMITTED"|"COMPLETED"|"CANCELLED";
export type ApplicationSummary={id:string;reference:string;universityName:string;programmeName:string;status:ApplicationStatus;stage:number;stageName:string;note:string;currentStageDueAt:string|null;createdAt:string};
export type ApplicationUrge={id:string;type:"DOCUMENT_REVIEW"|"SUBMISSION"|"VISA"|"OTHER";detail:string;status:"OPEN"|"ACKNOWLEDGED"|"RESOLVED";response:string;createdAt:string};
export type ApplicationFollowUp={id:string;channel:"PHONE"|"WECHAT"|"EMAIL"|"MEETING"|"OTHER";content:string;result:string;nextFollowUpAt:string|null;createdAt:string};
export type ApplicationDetail={application:ApplicationSummary;documents:Array<{id:string;title:string;status:string;reviewNote:string}>;fees:Array<{id:string;title:string;amount:number;currency:string;status:string}>;history:Array<{id:string;message:string;createdAt:string}>;followUps:ApplicationFollowUp[];urges:ApplicationUrge[]};
export type ApplicationPage={items:ApplicationSummary[];hasMore:boolean};
export type ApplicationResult<T>={status:"ready";value:T}|{status:"unauthorized"|"forbidden"|"validation-error"|"unavailable"|"error"};

const root="/api/v1/adviser/applications";
function base(baseUrl:string|undefined,path:string){try{if(!baseUrl)return null;const value=new URL(path,new URL(baseUrl).origin);return value;}catch{return null;}}
function failure(code:number):ApplicationResult<never>{return {status:code===401?"unauthorized":code===403?"forbidden":code===400?"validation-error":"error"};}
async function json<T>(response:Response):Promise<T|null>{try{return await response.json() as T;}catch{return null;}}
export async function loadApplications(baseUrl:string|undefined,page:number,status:string,request:typeof fetch=fetch):Promise<ApplicationResult<ApplicationPage>>{
  const url=base(baseUrl,root);if(!url||!Number.isSafeInteger(page)||page<0)return {status:"validation-error"};
  url.searchParams.set("page",String(page));if(status)url.searchParams.set("status",status);
  try{const response=await request(url,{credentials:"include",cache:"no-store",signal:AbortSignal.timeout(7000)});if(response.status!==200)return failure(response.status);const value=await json<ApplicationPage>(response);return value&&Array.isArray(value.items)&&typeof value.hasMore==="boolean"?{status:"ready",value}:{status:"error"};}catch{return {status:"unavailable"};}
}
export async function loadApplication(baseUrl:string|undefined,id:string,request:typeof fetch=fetch):Promise<ApplicationResult<ApplicationDetail>>{
  const url=base(baseUrl,`${root}/${id}`);if(!url||!/^[0-9a-f-]{36}$/i.test(id))return {status:"validation-error"};
  try{const response=await request(url,{credentials:"include",cache:"no-store",signal:AbortSignal.timeout(7000)});if(response.status!==200)return failure(response.status);const value=await json<ApplicationDetail>(response);return value?.application?.id===id&&Array.isArray(value.urges)&&Array.isArray(value.followUps)?{status:"ready",value}:{status:"error"};}catch{return {status:"unavailable"};}
}
async function mutate(baseUrl:string|undefined,path:string,data:unknown,method="POST",request:typeof fetch=fetch):Promise<ApplicationResult<ApplicationDetail>>{
  const url=base(baseUrl,path),csrf=base(baseUrl,"/api/v1/auth/csrf");if(!url||!csrf)return {status:"validation-error"};
  try{const tokenResponse=await request(csrf,{credentials:"include",cache:"no-store"});if(tokenResponse.status!==200)return failure(tokenResponse.status);const token=await json<{headerName:string;token:string}>(tokenResponse);if(!token?.headerName||!token.token)return {status:"error"};
    const response=await request(url,{method,credentials:"include",cache:"no-store",headers:{"Content-Type":"application/json",[token.headerName]:token.token},body:JSON.stringify(data),signal:AbortSignal.timeout(7000)});if(response.status!==200)return failure(response.status);const value=await json<ApplicationDetail>(response);return value?{status:"ready",value}:{status:"error"};}catch{return {status:"unavailable"};}
}
export const addApplicationFollowUp=(baseUrl:string|undefined,id:string,data:{channel:string;content:string;result:string;nextFollowUpAt:string|null})=>mutate(baseUrl,`${root}/${id}/follow-ups`,data);
export const updateApplicationUrge=(baseUrl:string|undefined,id:string,urge:string,data:{status:"ACKNOWLEDGED"|"RESOLVED";response:string})=>mutate(baseUrl,`${root}/${id}/urges/${urge}`,data,"PUT");
