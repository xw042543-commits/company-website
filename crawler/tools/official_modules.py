"""Official-only course-module collector. No translation or generated course names.
Install beautifulsoup4,pymupdf; see crawler/README.md. Output is review evidence, never a DB connection.
"""
import argparse, concurrent.futures, hashlib, json, re, sys, threading, time, functools
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, urljoin, urldefrag
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.robotparser import RobotFileParser
from bs4 import BeautifulSoup, Tag

PARSER_VERSION='0.4.6'
AGENT='YangdoujiaoResearchBot/0.3 (contact: bertram@staff.udajo.com)'
DOMAINS={'apu':['apu.edu.my'],'sunway':['sunwayuniversity.edu.my','sunway.edu.my'],'taylor':['taylors.edu.my'], 'um':['um.edu.my'],'ukm':['ukm.my'],'utm':['utm.my'],'upm':['upm.edu.my'],'usm':['usm.my'],'uum':['uum.edu.my'],'inti':['newinti.edu.my'],'ucsi':['ucsiuniversity.edu.my'],'utar':['utar.edu.my'],'nilai':['nilai.edu.my'],'mahsa':['mahsa.edu.my'],'help':['help.edu.my'],'nottingham':['nottingham.edu.my'],'monash':['monash.edu.my','monash.edu'],'southampton':['southampton.ac.uk','southamptonmalaysia.edu.my'],'segi':['segi.edu.my'],'city':['city.edu.my']}
STRUCTURE=re.compile(r'^(?:(?:programme?|course|program)\s+(?:structure|modules?|content|outline)|curriculum|study plan|modules?|subjects?|syllabus|what (?:will )?you(?:\Wll| will) study)\s*[:?]?$',re.I)
STOP=re.compile(r'(entry|admission|requirement|career|fees?|scholarship|how to apply|intake|overview|contact|testimonials|related courses|flexible education|minor pathway|recommended packages|articulation pathways)',re.I)
NONCOURSE=re.compile(r'^(?:year\s*\d|semester\s*\d|level\s*\d|choose\b|select\b|notes?\b|students?\b|entry\b|admission\b|programme structure|common modules?|speciali[sz]ed modules?|compulsory modules?|core modules?|electives?(?:\s+modules?|\s+courses?)?\s*(?:\(|$)|course modules?|learning outcomes?|the programme|this programme|you will|all students|click\b|read more|download|career|fees?|minimum\b|next\s*:|option\s*\d|programme course elective|faculty open elective|compulsory university courses|speciali[sz]ation\s*(?:modules?|electives?|:|/)|free electives?|university electives?|programme electives?)',re.I)
BAD=re.compile(r'\b(?:CGPA|GPA|IELTS|TOEFL|MUET|entry requirements?|minimum (?:average|score|grade)|tuition|qualification|international students?|subject to availability|choose (?:any |one|two|three|\d)|refer to (?:the )?list|are required|are subject|please note)\b|\d+\s*%|\b(?:RM|MYR|USD)\s*\d',re.I)

def now():return datetime.now(timezone.utc).isoformat()
def clean(value):return re.sub(r'\s+',' ',value).strip()
def canonical(value):
 value=re.sub(r'\b(?:honours|honors|hons)\b','',str(value).lower()).replace('&','and')
 value=re.sub(r'^bsc\b','bachelor of science',value);value=re.sub(r'^msc\b','master of science',value)
 return re.sub(r'[^a-z0-9]','',value)
def valid_title(title):
 if re.fullmatch(r'Foreign Language Course',title,re.I):return False
 if title in ('Measurement of Advanced','Sinography and Chinese Ancient') or re.search(r'^(?:(?:external )?faculty|department|discipline|university|univerity|programme|program|free|open)\s+electives?\b|^Elective\s+(?:Courses?|Modules?|Subjects?)(?:\b|_)|^Stream\s+\d+\b',title,re.I):return False
 if re.search(r'^(?:Kursus Elektif|Pilih\b|Sila\b)|\b(?:rujuk senarai|pilih \d|SHE[ _-]*Cluster|Technology\s*/\s*Artificial Intelligence and Data Analytics)',title,re.I):return False
 return 2<=len(title)<=180 and bool(re.search(r'[A-Za-z]',title)) and not re.search(r'[\u3400-\u9fff]',title) and not NONCOURSE.search(title) and not BAD.search(title) and not re.search(r'^(?:https?://|www\.)|[.!?]$|\b(?:and|or|of|for|to|in|with|&)\s*$|^\d+(?:\.\d+)?$|^[A-Z]{2,}\d+[A-Z0-9]*(?:\([a-z]\))?$|^(?:total credits?|credit hours?|course code)\b',title,re.I)
def allowed(url,slug):
 try:
  u=urlparse(url);return u.scheme=='https' and not u.username and any(u.hostname==d or u.hostname.endswith('.'+d) for d in DOMAINS.get(slug,[]))
 except (ValueError,AttributeError):return False

def module(title,url,stamp,version,code=None,credits=None,requirement=None,raw=None):
 return dict(nameEn=title,courseCode=code,credits=credits,requirement=requirement,sourceUrl=url,sourceCheckedAt=stamp,curriculumVersion=version,evidence=raw or title)

@functools.lru_cache(maxsize=32)
def soup_for(html):
 soup=BeautifulSoup(html,'html.parser')
 for bad in soup(['script','style','nav','footer','header']):bad.decompose()
 return soup

def parse_html(html,url,stamp,expected,linked_structure=False):
 soup=soup_for(html)
 headings=[clean(x.get_text(' ',strip=True)) for x in soup.select('h1')]
 metadata=[clean(soup.title.get_text(' ',strip=True))] if soup.title else []
 og=soup.select_one('meta[property="og:title"]')
 if og and og.get('content'):metadata.append(clean(og['content']))
 # Related-programme cards commonly use H2/H3 titles. They must never establish ownership.
 primary=headings[:1]+[re.split(r'\s+[|–—]\s+|\s+-\s+(?:APU|INTI|City|Sunway|HELP|UCSI|Universit)',t,flags=re.I)[0] for t in metadata]
 matched=any(canonical(h)==canonical(expected) for h in primary if expected)
 if linked_structure and not matched:
  matched=any(canonical(expected) in canonical(h) for h in primary if expected) or not any(re.search(r'\b(?:bachelor|master|doctor|diploma|foundation)\b',h,re.I) for h in primary)
 if not matched:return dict(modules=[],programmeMatched=False,rejected=[],version=None,title=headings[:6])
 text=soup.get_text(' ',strip=True)
 vm=re.search(r'(?:Curriculum (?:Version|for)|Programme Structure (?:for))\s*[: -]?\s*((?:20\d\d)(?:\s*[/–-]\s*(?:20)?\d\d)?[^.]{0,14})',text,re.I)
 version=clean(vm[0]) if vm else None
 candidates=[];seen_nodes=set();rejected=[]
 for h in soup.find_all(re.compile('^h[1-6]$')):
  if not (STRUCTURE.fullmatch(clean(h.get_text(' ',strip=True))) or (urlparse(url).hostname.endswith('apu.edu.my') and re.fullmatch(r'Degree Level \d+|MQA Compulsory Subjects\*?',clean(h.get_text(' ',strip=True)),re.I))):continue
  rank=int(h.name[1]);active_requirement=None
  for node in h.next_elements:
   if not isinstance(node,Tag):continue
   if node.name in ['h1','h2','h3','h4','h5','h6'] and node is not h:
    label=clean(node.get_text(' ',strip=True))
    if STOP.search(label) or (int(node.name[1])<=rank and not re.match(r'^(?:year|semester|level|core|common|elective|speciali[sz]|modules|subjects|study|programme|course)',label,re.I)):break
   if node.name in ['h3','h4','h5','h6','strong','b']:
    context=clean(node.get_text(' ',strip=True))
    if len(context)<100:
     if re.match(r'Elective (?:Modules?|Courses?)',context,re.I):active_requirement='Elective'
     elif re.match(r'(?:Core|Compulsory|Required) (?:Modules?|Courses?|Subjects?)|MQA Compulsory Subjects',context,re.I):active_requirement='Compulsory' if 'compulsory' in context.lower() else ('Core' if 'core' in context.lower() else 'Required')
     elif re.match(r'Common Modules?|Speciali[sz]ed Modules?|Degree Level',context,re.I):active_requirement=None
   if id(node) in seen_nodes:continue
   if node.name=='table':
    rows=node.find_all('tr');headers=[]
    for tr in rows:
     cells=tr.find_all(['th','td'],recursive=False);values=[clean(c.get_text(' ',strip=True)) for c in cells]
     if not values:continue
     if any(re.fullmatch(r'(?:course|unit|module|subject)\s*(?:name|title)|(?:name|title|subjects?|courses?|modules?)',v,re.I) for v in values):headers=values;continue
     if headers and len(values)==len(headers):
      col=lambda pattern:next((values[i] for i,v in enumerate(headers) if re.search(pattern,v,re.I)),None)
      title=col(r'(?:course|unit|module|subject)\s*(?:name|title)|(?:name|title|subjects?|courses?|modules?)');code=col(r'(?:course|unit|module)\s*code');credit=col(r'credit|credit points');typ=col(r'type|status|category')
      if title:candidates.append((title,code,credit,typ,' | '.join(values)))
    seen_nodes.add(id(node))
   if 'field--name-field-item-title' in node.get('class',[]):
    candidates.append((clean(node.get_text(' ',strip=True)),None,None,active_requirement,(active_requirement+': '+clean(node.get_text(' ',strip=True))) if active_requirement else None));seen_nodes.add(id(node))
   if node.name=='li' and not node.find('li') and not node.find_parent('table'):
    candidates.append((clean(node.get_text(' ',strip=True)),None,None,active_requirement,(active_requirement+': '+clean(node.get_text(' ',strip=True))) if active_requirement else None));seen_nodes.add(id(node))
   if node.name=='p' and not node.find_parent('li'):
    raw=clean(node.get_text(' ',strip=True))
    if re.match(r'^[•●▪·◦‣]\s*',raw):candidates.append((re.sub(r'^[•●▪·◦‣]\s*','',raw),None,None,active_requirement,(active_requirement+': '+raw) if active_requirement else raw));seen_nodes.add(id(node))
 result=[];seen=set()
 for title,code,credit,typ,raw in candidates:
  original_title=title
  title=re.sub(r'^\s*\d{1,3}[.)]\s+','',title).strip('* ').strip()
  if re.match(r'^Elective (?:University )?Courses?\s*[:(]',title,re.I):
   labelled=re.search(r'\b([A-Z]{2,6}\d{3,5}[A-Z]?)\s+(?:\(KIAR\)\s*)?(.+)$',title)
   faculty=re.match(r'^Elective Courses?\s*:\s*Faculty Course\s*[-–]\s*(.+)$',title,re.I)
   if labelled:code=code or labelled[1];title=labelled[2];typ='Elective'
   elif faculty:title=faculty[1];typ='Elective'
   else:rejected.append(original_title);continue
  title=re.sub(r'^[•●▪·◦‣]\s*','',title).strip()
  title=re.sub(r'\s*\((?:applicable to|for Malaysian|for International|Malaysian students|International students|local students)\b.*?\)', '',title,flags=re.I).strip()
  if re.search(r'\s+OR$',title):title=re.sub(r'\s+OR$','',title).strip();typ='OR'
  prefix=re.match(r'^([A-Z]{2,6}\d{3,5}[A-Z]?)\s+(.+)$',title)
  if prefix:code=code or prefix[1];title=prefix[2]
  # A #-marked code is a prerequisite, not this module's own code.
  title=re.sub(r'\s*\(#[^()]+\)\s*$','',title).strip()
  title=re.sub(r'\s*\(Replaces [A-Z]+\d+\)\s*$','',title,flags=re.I).strip()
  if re.match(r'^(?:Sangkutan@Industri|Penyelidikan Bebas|Khidmat Komuniti|Pembangunan Bakat|Kesukarelawanan|Keusahawanan)\b',title):
   english=re.search(r'\(([^()]+)\)\]?$|\(([^()]+)\]$',title)
   if english:title=english[1] or english[2]
  inline_credit=re.search(r'\((\d+(?:\.\d+)?)\s+(?:credits?|credit hours?)\)',title,re.I)
  if inline_credit:
   credit=credit or inline_credit[1];title=title[:inline_credit.start()].strip()+title[inline_credit.end():]
  if re.search(r'\s+OR\s+',title,re.I):
   for alternative in re.split(r'\s+OR\s+',title,flags=re.I):
    alternative=re.sub(r'\s*\((?:Malaysian|International)\)\s*$','',alternative.strip('*/ '),flags=re.I).strip()
    key=(code or '',clean(alternative).casefold())
    if valid_title(alternative) and key not in seen:
     seen.add(key);result.append(module(alternative,url,stamp,version,requirement='OR',raw=raw or original_title))
   continue
  if not valid_title(title):rejected.append(title);continue
  key=(code or '',clean(title).casefold())
  if key in seen:continue
  seen.add(key)
  requirement=typ if typ and re.fullmatch(r'(?:core|compulsory|required|elective|optional|C|E|OR)',typ,re.I) else None
  credits=credit if credit and re.fullmatch(r'\d+(?:\.\d+)?(?:\s*(?:credits?|credit points))?',credit,re.I) else None
  result.append(module(title,url,stamp,version,code,credits,requirement,raw or original_title))
 return dict(modules=result,programmeMatched=True,rejected=rejected,version=version,title=headings[:6])

class Fetcher:
 def __init__(self,root):self.offline=False;self.refresh=False;self.max_age_days=7;self.root=root;root.mkdir(parents=True,exist_ok=True);self.retried=set();self.locks={};self.policies={};self.origin_errors={};self.times={};self.guard=threading.Lock()
 def fetch(self,url,slug):
  url=urldefrag(url)[0]
  if not allowed(url,slug):raise ValueError('不在对应大学官网域名范围')
  origin=urlparse(url).scheme+'://'+urlparse(url).netloc
  with self.guard:lock=self.locks.setdefault(origin,threading.Lock())
  key=hashlib.sha256(url.encode()).hexdigest();meta=self.root/(key+'.json');data=self.root/(key+'.bin')
  with lock:
   if meta.exists():
    m=json.loads(meta.read_text(encoding='utf8'))
    if m.get('error'):
     if not self.offline and re.search(r'timed out|reset|Remote end',m['error'],re.I) and url not in self.retried:self.retried.add(url)
     else:raise ValueError(m['error'])
    elif self.offline or (not self.refresh and time.time()-datetime.fromisoformat(m['fetchedAt']).timestamp()<self.max_age_days*86400):return data.read_bytes(),m
    if data.exists():
     archive=self.root/'snapshots';archive.mkdir(exist_ok=True)
     (archive/(m.get('sha256',key)+'.bin')).write_bytes(data.read_bytes())
   if self.offline:raise ValueError('离线核验没有可用官方快照')
   try:
    if origin in self.origin_errors:raise ValueError(self.origin_errors[origin])
    if origin not in self.policies:
     rob=origin+'/robots.txt'
     try:
      with urlopen(Request(rob,headers={'User-Agent':AGENT}),timeout=20) as r:
       if not allowed(r.url,slug):raise ValueError('robots 重定向超出官网范围')
       rt=r.read(512000).decode('utf8','replace')
     except HTTPError as e:
      if e.code in (404,410):rt=''
      else:raise ValueError('robots.txt 无法读取: HTTP '+str(e.code))
     rp=RobotFileParser();rp.parse(rt.splitlines());self.policies[origin]=rp
    rp=self.policies[origin]
    if not rp.can_fetch(AGENT,url):raise ValueError('robots.txt 禁止抓取')
    delay=max(2,rp.crawl_delay(AGENT) or rp.crawl_delay('*') or 0)
    time.sleep(max(0,self.times.get(origin,0)+delay-time.time()));self.times[origin]=time.time()
    with urlopen(Request(url,headers={'User-Agent':AGENT,'Accept':'text/html,application/pdf'}),timeout=25) as r:
     if not allowed(r.url,slug):raise ValueError('重定向超出官网范围')
     body=r.read(35_000_001)
     if len(body)>35_000_000:raise ValueError('响应超过 35 MB 上限')
     m=dict(url=r.url,fetchedAt=now(),contentType=r.headers.get('Content-Type',''),sha256=hashlib.sha256(body).hexdigest())
     data.write_bytes(body);meta.write_text(json.dumps(m,ensure_ascii=False),encoding='utf8');return body,m
   except Exception as e:
    if origin not in self.policies:self.origin_errors[origin]=str(e)
    meta.write_text(json.dumps(dict(url=url,error=str(e),attemptedAt=now()),ensure_ascii=False),encoding='utf8');raise

@functools.lru_cache(maxsize=24)
def pdf_text_pages(body):
 import pymupdf
 with pymupdf.open(stream=body,filetype='pdf') as doc:return tuple(page.get_text() for page in doc)

def inspect_pdf(body,url,stamp,expected):
 hits=[]
 for i,text in enumerate(pdf_text_pages(body)):
  n=canonical(text)
  if expected and canonical(expected) in n:hits.append(dict(page=i+1,text=text[:20000]))
 return dict(modules=[],programmeMatched=bool(hits),pdfPageEvidence=hits[:12],version=None,rejected=[],reason='官方 PDF 已获取；需按专业及版面核对具体课程表，未将整页文本自动当课程')

def collect_one(row,fetcher):
 slug=row['universitySlug'];expected=row.get('officialNameEn') or row.get('nameEn');urls=list(dict.fromkeys(x for x in row['candidateUrls'] if x));attempts=[];verified=[];version=None;queue=urls[:8];visited=set();linked=set()
 for url in queue:
  if url in visited or len(visited)>=12:continue
  visited.add(url)
  try:
   body,m=fetcher.fetch(url,slug);stamp=m['fetchedAt'];actual=m['url'];is_pdf='pdf' in m['contentType'].lower() or body.startswith(b'%PDF')
   if is_pdf:parsed=inspect_pdf(body,actual,stamp,expected)
   else:
    html=body.decode('utf8','replace');parsed=parse_html(html,actual,stamp,expected,url in linked)
    soup=soup_for(html)
    for a in soup.select('a[href]'):
     label=clean(a.get_text(' ',strip=True));link=urljoin(actual,a['href'])
     if not allowed(link,slug):continue
     # Follow a uniquely matching degree link or an explicitly curriculum-labelled official PDF.
     if (expected and canonical(label)==canonical(expected)) or (parsed['programmeMatched'] and re.search(r'curriculum|study plan|course (?:structure|modules)|programme structure|module catalogue|handbook',label,re.I)):
      if link not in queue and len(queue)<16:
       queue.append(link)
       if parsed['programmeMatched']:linked.add(link)
   attempts.append(dict(url=url,sourceUrl=actual,fetchedAt=stamp,sha256=m['sha256'],programmeMatched=parsed['programmeMatched'],courseCount=len(parsed['modules']),version=parsed.get('version'),rejected=parsed.get('rejected',[]),pdfPageEvidence=parsed.get('pdfPageEvidence',[]),reason=parsed.get('reason')))
   if parsed['modules']:verified=parsed['modules'];version=parsed['version'];break
  except Exception as e:attempts.append(dict(url=url,error=str(e),attemptedAt=now()))
 return dict(parserVersion=PARSER_VERSION,programmeCode=row['programmeCode'],universitySlug=slug,programmeNameEn=expected,status='VERIFIED' if verified else 'PENDING',modules=verified,curriculumVersion=version,attempts=attempts,inputFingerprint=hashlib.sha256(json.dumps(row,sort_keys=True).encode()).hexdigest(),reason=None if verified else ('官网未公布可唯一关联的课程结构，或访问/解析失败；详见逐项尝试记录' if attempts else '未找到唯一对应的官网专业页，不能推测课程'))

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--input',required=True);ap.add_argument('--output',required=True);ap.add_argument('--workers',type=int,default=8);ap.add_argument('--offline',action='store_true');ap.add_argument('--refresh',action='store_true');ap.add_argument('--max-age-days',type=int,default=7);args=ap.parse_args()
 inputs=json.loads(Path(args.input).read_text(encoding='utf-8-sig'));out=Path(args.output);out.mkdir(parents=True,exist_ok=True);fetcher=Fetcher(out/'sources');fetcher.offline=args.offline;fetcher.refresh=args.refresh;fetcher.max_age_days=args.max_age_days;rows=inputs['records'];results=[]
 def job(row):
  target=out/(row['programmeCode']+'.json')
  if target.exists():
   previous=json.loads(target.read_text(encoding='utf8'))
   stamps=[a.get('fetchedAt') or a.get('attemptedAt') for a in previous.get('attempts',[])];fresh=all(stamp and time.time()-datetime.fromisoformat(stamp).timestamp()<args.max_age_days*86400 for stamp in stamps)
   same_input=previous.get('inputFingerprint')==hashlib.sha256(json.dumps(row,sort_keys=True).encode()).hexdigest()
   if previous.get('parserVersion')==PARSER_VERSION and same_input and (args.offline or (not args.refresh and fresh)):return previous
  result=collect_one(row,fetcher);target.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');return result
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
  futures=[executor.submit(job,r) for r in rows]
  for f in concurrent.futures.as_completed(futures):
   results.append(f.result())
   if len(results)%100==0:print(json.dumps(dict(processed=len(results),verified=sum(r['status']=='VERIFIED' for r in results))),flush=True)
 report=dict(generatedAt=now(),snapshotAt=inputs.get('generatedAt'),records=sorted(results,key=lambda r:r['programmeCode']))
 (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(dict(total=len(results),verified=sum(r['status']=='VERIFIED' for r in results),modules=sum(len(r['modules']) for r in results))),flush=True)
if __name__=='__main__':main()
