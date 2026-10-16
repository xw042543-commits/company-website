export async function planningDemoAsset(asset: string, environment: string, read: (asset: string) => Promise<string>): Promise<Response> {
  if (environment !== 'development' || !['index.html','planning-chat.js'].includes(asset)) return new Response(null,{status:404});
  try {
    const content = await read(asset === 'index.html' ? 'planning-agent.html' : asset);
    return new Response(content,{headers:{'Content-Type':asset === 'index.html' ? 'text/html; charset=utf-8' : 'application/javascript; charset=utf-8','Cache-Control':'no-store'}});
  } catch { return new Response('请先构建本地聊天预览。',{status:503}); }
}
