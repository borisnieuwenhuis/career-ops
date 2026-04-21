const SEPARATOR_CLASS = '[\\u2014\\u2013-]';
const NUM_PREFIX_RX = new RegExp(`^\\s*\\d+\\s*${SEPARATOR_CLASS}\\s*`);
const TITLE_SEP_RX = new RegExp(`\\s${SEPARATOR_CLASS}\\s`, 'g');
const SECTION_RX = new RegExp(
  `^##\\s+(?:Block\\s+|Bloque\\s+)?([A-H])[\\s)${SEPARATOR_CLASS.slice(1, -1)}][^\\n]*\\n([\\s\\S]*?)(?=^##\\s+(?:Block\\s+|Bloque\\s+)?[A-H][\\s)${SEPARATOR_CLASS.slice(1, -1)}]|$(?![\\s\\S]))`,
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

  const parts = stripped.split(TITLE_SEP_RX).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const company = parts[parts.length - 2];
    const role = parts[parts.length - 1];
    if (company && role) {
      return { company, role };
    }
  }

  throw new Error(`Could not parse report title "${titleLine}" in ${sourcePath}`);
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
    try {
      identity = parseTitle(titleLine, sourcePath);
    } catch (err) {
      if (header.company || header.role) {
        throw new Error(
          `Could not parse report identity in ${sourcePath}: H1 "${titleLine}" is unparseable and header lacks both Company and Role`,
        );
      }
      throw err;
    }
  }

  const sections = {};
  SECTION_RX.lastIndex = 0;
  let m;
  while ((m = SECTION_RX.exec(text)) !== null) {
    sections[m[1]] = m[2].trim();
  }

  return { header, identity, sections };
}
