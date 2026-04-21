const SIGNIFICANT_SEP_CHARS = String.fromCharCode(0x2014, 0x2013, 0x00b7);
const SIGNIFICANT_SEP_SOURCE = `\\s(?:--|[${SIGNIFICANT_SEP_CHARS}])\\s`;
const ANY_SEP_CLASS = `[${SIGNIFICANT_SEP_CHARS}-]`;
const NUM_PREFIX_RX = new RegExp(`^\\s*\\d+\\s*(?:--|${ANY_SEP_CLASS})\\s*`);
const SECTION_RX = new RegExp(
  `^##\\s+(?:Block\\s+|Bloque\\s+)?([A-H])[\\s)${SIGNIFICANT_SEP_CHARS}-][^\\n]*\\n([\\s\\S]*?)(?=^##\\s+(?:Block\\s+|Bloque\\s+)?[A-H][\\s)${SIGNIFICANT_SEP_CHARS}-]|$(?![\\s\\S]))`,
  'gm',
);

function parseHeaderFields(text) {
  const header = {};
  const fieldRx = /^\*\*([^*]+):\*\*\s*(.+)$/gm;
  let m;
  while ((m = fieldRx.exec(text)) !== null) {
    const key = m[1].trim().toLowerCase();
    header[key] = m[2].trim();
  }
  return header;
}

function parseTitle(titleLine, sourcePath) {
  let stripped = titleLine.replace(NUM_PREFIX_RX, '');
  stripped = stripped.replace(/^\s*(?:Evaluaci[óo]n|Evaluation)\s*:\s*/i, '');
  stripped = stripped.trim();

  const atSplit = stripped.split(/\s+at\s+/);
  if (atSplit.length === 2) {
    const [role, company] = atSplit;
    if (role.trim() && company.trim()) {
      return { role: role.trim(), company: company.trim() };
    }
  }

  const firstSig = new RegExp(SIGNIFICANT_SEP_SOURCE).exec(stripped);
  if (firstSig) {
    const company = stripped.slice(0, firstSig.index).trim();
    const role = stripped.slice(firstSig.index + firstSig[0].length).trim();
    if (company && role) {
      return { company, role };
    }
  }

  throw new Error(
    `Could not parse identity from report "${sourcePath}". ` +
      `H1 "${titleLine}" has ambiguous separators. ` +
      `Add "**Company:** ..." and "**Role:** ..." lines to the report header to make identity explicit.`,
  );
}

export function parseReport(text, sourcePath) {
  const h1 = text.match(/^#\s+(.+)$/m);
  if (!h1) {
    throw new Error(`Could not parse report (no H1 title): ${sourcePath}`);
  }
  const titleLine = h1[1].trim();

  const header = parseHeaderFields(text);

  let identity;
  if (header.company && header.role) {
    identity = { company: header.company, role: header.role };
  } else {
    identity = parseTitle(titleLine, sourcePath);
  }

  const sections = {};
  SECTION_RX.lastIndex = 0;
  let m;
  while ((m = SECTION_RX.exec(text)) !== null) {
    sections[m[1]] = m[2].trim();
  }

  return { header, identity, sections };
}
