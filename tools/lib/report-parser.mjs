const HEADER_FIELDS = ['Score', 'URL', 'PDF', 'Legitimacy', 'Date'];

export function parseReport(text, sourcePath) {
  const h1 = text.match(/^# (.+)$/m);
  if (!h1) {
    throw new Error(`Could not parse report (no H1 title): ${sourcePath}`);
  }
  const titleLine = h1[1].trim();
  const at = titleLine.lastIndexOf(' at ');
  if (at === -1) {
    throw new Error(`Could not parse report title "${titleLine}": expected "<role> at <company>"`);
  }
  const identity = {
    role: titleLine.slice(0, at).trim(),
    company: titleLine.slice(at + 4).trim(),
  };

  const header = {};
  for (const field of HEADER_FIELDS) {
    const rx = new RegExp(`^\\*\\*${field}:\\*\\*\\s*(.+)$`, 'm');
    const m = text.match(rx);
    if (m) header[field.toLowerCase()] = m[1].trim();
  }

  const sections = {};
  const sectionRx = /^## ([A-G])\) [^\n]+\n([\s\S]*?)(?=^## [A-G]\)|$(?![\s\S]))/gm;
  let m;
  while ((m = sectionRx.exec(text)) !== null) {
    sections[m[1]] = m[2].trim();
  }

  return { header, identity, sections };
}
