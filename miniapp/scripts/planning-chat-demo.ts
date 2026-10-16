interface Message { role: 'user' | 'assistant'; text: string }
interface Snapshot { messages: Message[]; facts: Record<string, string> }

/** Local scripted interaction only. No model, network, inference or admissions assessment. */
export function createChatDemo(changed: () => void = () => {}, delay = 500) {
  const state = { messages: [] as Message[], facts: {} as Record<string, string>, busy: false, error: '', saved: [] as Snapshot[] };
  const asked = new Set<string>();
  let epoch = 0; let failure = false; let pendingText = ''; let cancel: (() => void) | undefined;
  function reply(text: string) {
    // Only recognise explicit target phrases. Do not treat current education as a target.
    const level = text.match(/(?:想|打算|计划|申请|改成|改为)[^，。！？\n]{0,8}?(预科|本科|硕士|博士)/)?.[1]
      ?? (/^(预科|本科|硕士|博士)$/.test(text) ? text : undefined);
    if (level) state.facts.level = level;
    const currency = text.match(/人民币|马币|MYR|RMB/i)?.[0];
    if (currency) state.facts.currency = /MYR|马币/i.test(currency) ? '马币' : '人民币';
    const question = (key: string, value: string) => {
      if (asked.has(key) || state.facts[key]) return '';
      asked.add(key); return '\n\n' + value;
    };
    if (/不知道|不确定|跳过|不想回答/.test(text)) return '可以，先不补这些信息。我们可以先聊选专业、费用构成或申请步骤；缺少依据的地方会保留为待核实，不会替你猜。';
    if (/预算|费用|学费|多少钱|人民币|马币|MYR|RMB/i.test(text)) {
      return `先看费用怎么拆：学费、生活费，以及签证、保险等其他支出都需要分别核对。${state.facts.level ? `你提到的${state.facts.level}方向也要结合具体学制。` : ''}目前没有接入真实费用数据，所以我不能判断这笔钱一定够用。`
        + (!state.facts.currency ? question('currency', '你说的预算是什么币种？不确定也可以先跳过。') : question('period', '这笔预算是每年，还是整个留学期间的总预算？'));
    }
    if (/规划|方案|方向|路线|推荐|学校|院校/.test(text)) {
      return `可以先看一条${state.facts.level ?? '马来西亚留学'}规划路线，不需要先填完整资料。\n\n先明确想学的方向，再比较课程内容、费用和申请要求，最后按院校公布的时间准备材料。\n\n这只是流程示例，尚未查询真实院校，也不构成录取或预算判断。`
        + question('subject', '你更想先聊哪个专业方向？暂时没有想法也没关系。');
    }
    if (level) return `可以，我们先聊${level}，不用一次提供所有背景。先从你最关心的地方展开：选专业、费用或申请步骤都可以。`
      + question('priority', '你现在最想弄清楚哪一件事？');
    if (/雅思|英语|语言/.test(text)) return '语言要求要看具体院校与专业，不能用一个分数概括。还没考语言也可以先了解申请路径，后续再核对是否有语言衔接安排。这里暂未接入真实招生要求。';
    if (/计算机|商科|设计|工程|金融/.test(text)) return '选专业可以先比较课程内容、学习方式和你希望发展的方向，再筛学校。当前演示不查询真实课程，不会直接给出“适合你”或“保证录取”的结论。'
      + question('level', '你打算申请哪个学历阶段？也可以先继续聊专业。');
    return '你可以直接聊想法，不需要填表。当前是预设对话演示，还不能像真实 AI 一样理解所有问题；可以试着问预算、选专业或申请规划，也可以跳过追问。';
  }
  async function complete(text: string) {
    const current = epoch; state.busy = true; state.error = ''; changed();
    await new Promise<void>(resolve => {
      const timer = setTimeout(() => { cancel = undefined; resolve(); }, Math.max(0, delay));
      cancel = () => { clearTimeout(timer); resolve(); };
    });
    if (current !== epoch) return;
    state.busy = false;
    if (failure) { failure = false; pendingText = text; state.error = '模拟回复失败。你的消息已保留，可以重试。'; }
    else { pendingText = ''; state.messages.push({ role: 'assistant', text: reply(text) }); }
    changed();
  }
  return { state,
    async send(value: string) {
      const text = value.trim(); if (!text || state.busy || state.error) return;
      state.messages.push({ role: 'user', text }); await complete(text);
    },
    async retry() { if (pendingText && !state.busy) await complete(pendingText); },
    failNext() { failure = true; },
    reset() { epoch++; cancel?.(); cancel = undefined; failure = false; pendingText = ''; asked.clear(); state.messages = []; state.facts = {}; state.saved = []; state.error = ''; state.busy = false; changed(); },
    save(confirmed: boolean) {
      if (!confirmed || state.busy || state.error || !state.messages.some(m => m.role === 'assistant')) return false;
      state.saved.push(structuredClone({ messages: state.messages, facts: state.facts })); changed(); return true;
    },
  };
}
