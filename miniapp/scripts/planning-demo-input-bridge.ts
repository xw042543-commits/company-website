interface DemoPage {
  data: { input: string; profileVersion: number; busy: boolean; state: string };
  send(): unknown;
  generate(): unknown;
  beginPlanning(): unknown;
  submitMessage(intent: 'GENERATE', text: string): unknown;
}

/** Preview-only input preservation; the native controller still owns every request. */
export function attachDemoInputBridge(page: DemoPage) {
  const send = page.send.bind(page); const generate = page.generate.bind(page);
  let hasFirstMessage = false;
  page.send = () => {
    if (!page.data.profileVersion) {
      hasFirstMessage = !!page.data.input.trim(); return page.beginPlanning();
    }
    if (page.data.input.trim() && !page.data.busy && !['sending', 'polling'].includes(page.data.state)) hasFirstMessage = false;
    return send();
  };
  page.generate = () => {
    if (hasFirstMessage && page.data.profileVersion && !page.data.busy && !['sending', 'polling'].includes(page.data.state)) {
      const text = page.data.input.trim(); hasFirstMessage = false;
      if (text) return page.submitMessage('GENERATE', text);
    }
    return generate();
  };
}
