import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {planningDemoAsset} from '@/lib/planning-demo-asset';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(_request: Request, context: {params: Promise<{asset:string}>}) {
  const {asset} = await context.params;
  return planningDemoAsset(asset,process.env.NODE_ENV,name => readFile(join(process.cwd(),'../miniapp/.preview',name),'utf8'));
}
