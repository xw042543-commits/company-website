type Rule = { allow: boolean; path: string };

export type RobotsPolicy = { rules: Rule[]; crawlDelayMs: number | null };

export function parseRobots(text: string, userAgent: string): RobotsPolicy {
  const agentToken = userAgent.split(/[\/\s]/, 1)[0].toLowerCase();
  const groups: Array<{ agents: string[]; rules: Rule[]; delay: number | null }> = [];
  let current: { agents: string[]; rules: Rule[]; delay: number | null } | null = null;
  let rulesStarted = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase(); const value = match[2].trim();
    if (key === "user-agent") {
      if (!current || rulesStarted) { current = { agents: [], rules: [], delay: null }; groups.push(current); rulesStarted = false; }
      current.agents.push(value.toLowerCase());
    } else if (current && (key === "allow" || key === "disallow")) {
      rulesStarted = true;
      if (value) current.rules.push({ allow: key === "allow", path: value });
    } else if (current && key === "crawl-delay") {
      const seconds = Number(value); if (Number.isFinite(seconds) && seconds >= 0) current.delay = seconds * 1000;
    }
  }
  const exact = groups.filter((group) => group.agents.some((agent) => agentToken.includes(agent) || agentToken === agent));
  const selected = exact.length ? exact : groups.filter((group) => group.agents.includes("*"));
  return { rules: selected.flatMap((group) => group.rules), crawlDelayMs: selected.map((group) => group.delay).find((delay) => delay !== null) ?? null };
}

export function mayFetch(policy: RobotsPolicy, url: URL): boolean {
  const path = `${url.pathname}${url.search}`;
  const matches = policy.rules.filter((rule) => path.startsWith(rule.path)).sort((a, b) => b.path.length - a.path.length || Number(b.allow) - Number(a.allow));
  return matches[0]?.allow ?? true;
}
