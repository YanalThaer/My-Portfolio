// npm run update-from-cv -- "C:\Users\AS\Desktop\Yanal-CV-new.pdf" يحدث الموقع من الـ CV + تقرير + نص LinkedIn + صورة إذا بالـ PDF
// npm run update-from-linkedin -- "C:\Users\AS\Downloads\Profile.pdf" يحدث الموقع من LinkedIn PDF + صورة اذا بالـ PDF
// npm run update-linkedin يجهّز نص النسخ لLinkedIn من الموقع الحالي
// npm run update-photo -- "C:\Users\AS\Desktop\me.jpg" يحدث الصورة فقط

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'public', 'data', 'portfolio.json');
const backupPath = path.join(root, 'public', 'data', 'portfolio.backup.json');
const reportPath = path.join(root, 'reports', 'cv-update-report.txt');
const linkedinReportPath = path.join(root, 'reports', 'linkedin-update.txt');
const cvDest = path.join(root, 'public', 'files', 'Yanal CV.pdf');

const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

const SKILL_ICONS = [
  ['spring', 'bxl-spring-boot'],
  ['angular', 'bxl-angular'],
  ['html', 'bxl-html5'],
  ['css', 'bxl-css3'],
  ['javascript', 'bxl-javascript'],
  ['flutter', 'bxl-flutter'],
  ['react', 'bxl-react'],
  ['laravel', 'bxl-php'],
  ['php', 'bxl-php'],
  ['java', 'bxl-java'],
  ['kafka', 'bx-broadcast'],
  ['microservices', 'bx-sitemap'],
  ['github', 'bxl-github'],
  ['mysql', 'bxs-data'],
  ['sql server', 'bxs-data'],
  ['postgres', 'bxs-data'],
  ['mongodb', 'bxs-data'],
  ['.net', 'bxl-visual-studio'],
  ['c#', 'bxl-visual-studio'],
  ['csharp', 'bxl-visual-studio'],
];

const SERVICE_ICONS = [
  ['mobile', 'bx-mobile-alt'],
  ['flutter', 'bx-mobile-alt'],
  ['web', 'bx-code-alt'],
  ['front', 'bx-code-alt'],
  ['spring', 'bx-server'],
  ['java', 'bx-server'],
  ['api', 'bx-server'],
  ['backend', 'bx-server'],
  ['database', 'bx-data'],
  ['sql', 'bx-data'],
];

loadEnv(path.join(root, '.env'));

const dryRun = process.argv.includes('--dry-run');
const linkedinOnly = process.argv.includes('--linkedin-only');
const fromLinkedIn = process.argv.includes('--from-linkedin');
const args = process.argv
  .slice(2)
  .filter((arg) => arg !== '--dry-run' && arg !== '--linkedin-only' && arg !== '--from-linkedin');

if (!existsSync(dataPath)) {
  console.error(`portfolio.json not found: ${dataPath}`);
  process.exit(1);
}

if (linkedinOnly) {
  const portfolio = JSON.parse(readFileSync(dataPath, 'utf8'));
  writeLinkedInGuide(portfolio);
  process.exit(0);
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY.');
  console.error('Copy .env.example to .env and paste your Google AI Studio key.');
  process.exit(1);
}

if (fromLinkedIn && !args[0]) {
  console.error('LinkedIn PDF path is required.');
  console.error('On LinkedIn: Resources / More -> Save to PDF');
  console.error('Then run:');
  console.error('  npm run update-from-linkedin -- "C:\\Users\\AS\\Downloads\\Profile.pdf"');
  process.exit(1);
}

const cvPath = path.resolve(args[0] || path.join(root, 'public', 'files', 'Yanal CV.pdf'));

if (!existsSync(cvPath)) {
  if (fromLinkedIn) {
    console.error(`LinkedIn PDF not found: ${cvPath}`);
    console.error('On LinkedIn: Resources / More -> Save to PDF, then pass that file path.');
  } else {
    console.error(`CV file not found: ${cvPath}`);
  }
  process.exit(1);
}

const current = JSON.parse(readFileSync(dataPath, 'utf8'));
const pdfBase64 = readFileSync(cvPath).toString('base64');
const currentForModel = structuredClone(current);
delete currentForModel.contact.web3forms;

const prompt = buildPrompt(currentForModel, fromLinkedIn);

const responseSchema = {
  type: 'OBJECT',
  properties: {
    logo: { type: 'STRING' },
    home: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING' },
        summary: { type: 'STRING' },
        roles: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { text: { type: 'STRING' } },
            required: ['text'],
          },
        },
        socials: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              url: { type: 'STRING' },
              label: { type: 'STRING' },
            },
            required: ['url', 'label'],
          },
        },
      },
      required: ['name', 'summary', 'roles', 'socials'],
    },
    services: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
        },
        required: ['title', 'description'],
      },
    },
    resume: {
      type: 'OBJECT',
      properties: {
        about: { type: 'STRING' },
        experience: { type: 'ARRAY', items: timelineSchema() },
        education: { type: 'ARRAY', items: timelineSchema() },
        skills: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: { name: { type: 'STRING' } },
            required: ['name'],
          },
        },
      },
      required: ['about', 'experience', 'education', 'skills'],
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          tech: { type: 'STRING' },
          github: { type: 'STRING', nullable: true },
        },
        required: ['title', 'description', 'tech'],
      },
    },
    contact: {
      type: 'OBJECT',
      properties: {
        phone: { type: 'STRING' },
        email: { type: 'STRING' },
        address: { type: 'STRING' },
      },
      required: ['phone', 'email', 'address'],
    },
  },
  required: ['logo', 'home', 'services', 'resume', 'projects', 'contact'],
};

const generated = await generatePortfolioJson(apiKey, prompt, pdfBase64);
const next = mergePortfolio(current, generated);
const photo = await extractProfilePhoto(cvPath);
let photoNote = 'No profile photo found in the PDF. Kept the current website photo.';

if (photo) {
  if (dryRun) {
    photoNote = `Photo found in PDF (${photo.width}x${photo.height}). Dry run: not saved.`;
  } else {
    next.home.image = saveProfilePhoto(photo);
    photoNote = `Photo updated from PDF -> ${next.home.image}`;
  }
}

const changes = collectChanges(current, next);
if (photo) {
  changes.unshift({
    section: 'Home',
    type: 'changed',
    name: 'Photo',
    fields: [
      {
        field: 'image',
        from: current.home.image,
        to: dryRun ? `${photo.width}x${photo.height} found, not saved` : next.home.image,
      },
    ],
  });
}

const report = formatChangeReport(changes) + photoNote + '\n';

writeReportFile(reportPath, report);

if (dryRun) {
  if (!fromLinkedIn) {
    writeLinkedInGuide(next, { openFile: true, openProfile: false });
  }
  console.log(report);
  console.log(`Report saved to ${path.relative(root, reportPath)}`);
  if (photo) {
    console.log('Dry run: photo was found but not saved.');
  }
  openReport(reportPath);
  process.exit(0);
}

writeFileSync(backupPath, JSON.stringify(current, null, 2) + '\n', 'utf8');
writeFileSync(dataPath, JSON.stringify(next, null, 2) + '\n', 'utf8');

if (!fromLinkedIn) {
  mkdirSync(path.dirname(cvDest), { recursive: true });
  if (path.resolve(cvPath) !== path.resolve(cvDest)) {
    copyFileSync(cvPath, cvDest);
  }
  writeLinkedInGuide(next);
}

console.log(report);
console.log(
  fromLinkedIn
    ? 'Updated public/data/portfolio.json from the LinkedIn PDF.'
    : 'Updated public/data/portfolio.json from the CV.',
);
console.log(`Backup saved to ${path.relative(root, backupPath)}`);
console.log(`Report file: ${path.relative(root, reportPath)}`);
if (!fromLinkedIn) {
  console.log(`LinkedIn copy file: ${path.relative(root, linkedinReportPath)}`);
  console.log(`CV file: ${path.relative(root, cvDest)}`);
  console.log('Copy the LinkedIn sections from the opened txt into your profile.');
}
console.log('Review the JSON, then refresh the Angular app.');
openReport(reportPath);

function timelineSchema() {
  return {
    type: 'OBJECT',
    properties: {
      year: { type: 'STRING' },
      title: { type: 'STRING' },
      company: { type: 'STRING' },
      description: { type: 'STRING' },
    },
    required: ['year', 'title', 'company', 'description'],
  };
}

function buildPrompt(currentJson, isLinkedIn) {
  const source = isLinkedIn ? 'LinkedIn profile PDF' : 'CV PDF';
  return `You update a personal portfolio website from a ${source}.

Return JSON only, matching the schema. Use the ${source} as the source of truth for:
- name, summary, roles, about, experience, education, skills, services, projects, contact.

Rules:
- Write professional English, short and clear, suitable for a company portfolio.
- Do not invent facts, dates, companies, GitHub URLs, phone numbers, or emails.
- If a GitHub URL is unknown, use null.
- If a project in the current JSON still exists in the ${source}, keep its GitHub URL.
- Keep existing project GitHub URLs when the project title is clearly the same.
- roles: 3 or 4 short job titles from the headline / title.
- services: exactly 4 items based on the strongest skills.
- projects: newest first. Numbering is not needed.
- year format like "01-2025 - 05-2025" or "2024 - Present".
- contact.address like "Amman - Jordan" when possible.
- Do not include Web3Forms keys, image paths, or file paths.
${
  isLinkedIn
    ? `- This PDF is a LinkedIn export. Map About -> about/summary, Experience -> experience, Education -> education, Skills -> skills, Projects/Featured -> projects.
- Keep the current website GitHub and contact values when the LinkedIn PDF does not include them.`
    : ''
}

Current portfolio JSON (preserve matching GitHub links and any still-valid details):
${JSON.stringify(currentJson, null, 2)}`;
}

function loadEnv(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function generatePortfolioJson(key, textPrompt, pdfData) {
  let lastError = '';

  for (const model of MODELS) {
    try {
      const text = await callGemini(key, model, textPrompt, pdfData, true);
      return parseJson(text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn(`${model} failed: ${lastError}`);
    }
  }

  for (const model of MODELS) {
    try {
      const text = await callGemini(key, model, textPrompt, pdfData, false);
      return parseJson(text);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn(`${model} (no schema) failed: ${lastError}`);
    }
  }

  throw new Error(`Gemini could not update the portfolio. Last error: ${lastError}`);
}

async function callGemini(key, model, textPrompt, pdfData, withSchema) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    systemInstruction: {
      parts: [
        {
          text: 'You are a careful assistant that converts CVs into portfolio JSON. Never invent facts. Return valid JSON only.',
        },
      ],
    },
    contents: [
      {
        parts: [
          { text: textPrompt },
          { inline_data: { mime_type: 'application/pdf', data: pdfData } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  if (withSchema) {
    body.generationConfig.responseSchema = responseSchema;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || `HTTP ${response.status}`);
  }

  const text =
    payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  if (!text.trim()) {
    throw new Error('Empty model response');
  }

  return text;
}

function parseJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

function mergePortfolio(base, generated) {
  const name = String(generated.home?.name || base.home.name).trim();
  const roles = Array.isArray(generated.home?.roles)
    ? generated.home.roles
        .map((role) => String(role.text || '').trim())
        .filter(Boolean)
        .slice(0, 4)
        .map((text, index, list) => ({ text, i: list.length - index }))
    : base.home.roles;

  const socials = mergeSocials(base.home.socials, generated.home?.socials);
  const services = mergeList(generated.services, base.services, 3).map((service) => ({
    title: String(service.title || '').trim(),
    description: String(service.description || '').trim(),
    icon: iconFor(String(service.title || ''), SERVICE_ICONS, 'bx-code-alt'),
  }));

  const experience = mergeList(generated.resume?.experience, base.resume.experience);
  const education = mergeList(generated.resume?.education, base.resume.education);
  const skills = mergeList(generated.resume?.skills, base.resume.skills).map((skill) => ({
    name: String(skill.name || '').trim(),
    icon: iconFor(String(skill.name || ''), SKILL_ICONS, 'bx-code-alt'),
  }));

  const projects = mergeList(generated.projects, base.projects).map((project, index, list) => {
    const title = String(project.title || '').trim();
    const previous = (base.projects || []).find(
      (item) => String(item.title || '').trim().toLowerCase() === title.toLowerCase(),
    );
    return {
      number: String(list.length - index).padStart(2, '0'),
      title,
      description: String(project.description || '').trim(),
      tech: String(project.tech || '').trim(),
      github: normalizeGithub(project.github ?? previous?.github),
      liveUrl: normalizeGithub(project.liveUrl ?? previous?.liveUrl),
      image: String(previous?.image || project.image || '').trim() || null,
    };
  });

  const contact = generated.contact || {};

  return {
    logo: String(generated.logo || logoFromName(name) || base.logo).trim(),
    home: {
      ...base.home,
      name,
      roles: roles.length ? roles : base.home.roles,
      summary: String(generated.home?.summary || base.home.summary).trim(),
      socials: socials.length ? socials : base.home.socials,
    },
    services: services.length ? services : base.services,
    resume: {
      tabs: base.resume.tabs,
      experience: experience.length ? experience.map(cleanTimeline) : base.resume.experience,
      education: education.length ? education.map(cleanTimeline) : base.resume.education,
      skills: skills.length ? skills : base.resume.skills,
      about: String(generated.resume?.about || base.resume.about).trim(),
    },
    projects: projects.length ? projects : base.projects,
    contact: {
      ...base.contact,
      details: [
        {
          icon: 'bxs-phone',
          label: 'Phone',
          value: String(contact.phone || findDetail(base, 'Phone')).trim(),
        },
        {
          icon: 'bxs-envelope',
          label: 'Email',
          value: String(contact.email || findDetail(base, 'Email')).trim(),
        },
        {
          icon: 'bxs-map',
          label: 'Address',
          value: String(contact.address || findDetail(base, 'Address')).trim(),
        },
      ],
      web3forms: base.contact.web3forms,
    },
  };
}

function mergeList(incoming, fallback, max) {
  const list = Array.isArray(incoming) ? incoming.filter(Boolean) : [];
  const result = list.length ? list : Array.isArray(fallback) ? fallback : [];
  return max ? result.slice(0, max) : result;
}

function mergeSocials(current, incoming) {
  const next = Array.isArray(incoming)
    ? incoming
        .map((item) => {
          const url = String(item.url || '').trim();
          if (!url) {
            return null;
          }
          const label = String(item.label || socialLabel(url)).trim();
          return { url, icon: socialIcon(url), label };
        })
        .filter(Boolean)
    : [];

  const map = new Map();
  for (const item of [...current, ...next]) {
    map.set(item.label.toLowerCase(), item);
  }
  return [...map.values()];
}

function socialLabel(url) {
  if (url.includes('github')) {
    return 'GitHub';
  }
  if (url.includes('linkedin')) {
    return 'LinkedIn';
  }
  return 'Profile';
}

function socialIcon(url) {
  if (url.includes('github')) {
    return 'bxl-github';
  }
  if (url.includes('linkedin')) {
    return 'bxl-linkedin';
  }
  return 'bx-link';
}

function iconFor(value, table, fallback) {
  const haystack = value.toLowerCase();
  const match = table.find(([keyword]) => haystack.includes(keyword));
  return match ? match[1] : fallback;
}

function cleanTimeline(item) {
  return {
    year: String(item.year || '').trim(),
    title: String(item.title || '').trim(),
    company: String(item.company || '').trim(),
    description: String(item.description || '').trim(),
  };
}

function normalizeGithub(value) {
  if (value == null) {
    return null;
  }
  const url = String(value).trim();
  if (!url || url.toLowerCase() === 'null' || url === '#') {
    return null;
  }
  return url;
}

function findDetail(portfolio, label) {
  return portfolio.contact.details.find((item) => item.label === label)?.value || '';
}

function logoFromName(name) {
  const first = name.split(/\s+/)[0];
  return first ? `${first}.` : '';
}

function collectChanges(before, after) {
  return [
    ...scalarChanges('Home', [
      ['Logo', before.logo, after.logo],
      ['Name', before.home.name, after.home.name],
      ['Summary', before.home.summary, after.home.summary],
    ]),
    ...listChanges('Home / Roles', before.home.roles, after.home.roles, (item) => item.text),
    ...listChanges(
      'Home / Socials',
      before.home.socials,
      after.home.socials,
      (item) => item.label,
      ['url'],
    ),
    ...listChanges('Services', before.services, after.services, (item) => item.title, [
      'description',
    ]),
    ...scalarChanges('Resume', [['About Me', before.resume.about, after.resume.about]]),
    ...listChanges(
      'Resume / Experience',
      before.resume.experience,
      after.resume.experience,
      (item) => `${item.title} @ ${item.company}`,
      ['year', 'description'],
    ),
    ...listChanges(
      'Resume / Education',
      before.resume.education,
      after.resume.education,
      (item) => item.title,
      ['year', 'company', 'description'],
    ),
    ...listChanges(
      'Resume / Skills',
      before.resume.skills,
      after.resume.skills,
      (item) => item.name,
    ),
    ...listChanges('Projects', before.projects, after.projects, (item) => item.title, [
      'description',
      'tech',
      'github',
      'liveUrl',
      'image',
    ]),
    ...listChanges('Contact', before.contact.details, after.contact.details, (item) => item.label, [
      'value',
    ]),
  ];
}

function scalarChanges(section, entries) {
  return entries
    .filter(([, oldValue, newValue]) => String(oldValue || '') !== String(newValue || ''))
    .map(([field, oldValue, newValue]) => ({
      section,
      type: 'changed',
      name: field,
      fields: [{ field, from: String(oldValue || ''), to: String(newValue || '') }],
    }));
}

function listChanges(section, oldList = [], newList = [], keyFn, compareFields = []) {
  const oldMap = new Map(oldList.map((item) => [normalizeKey(keyFn(item)), item]));
  const newMap = new Map(newList.map((item) => [normalizeKey(keyFn(item)), item]));
  const changes = [];

  for (const [key, item] of newMap) {
    if (!oldMap.has(key)) {
      changes.push({ section, type: 'added', name: keyFn(item) });
    }
  }

  for (const [key, item] of oldMap) {
    if (!newMap.has(key)) {
      changes.push({ section, type: 'removed', name: keyFn(item) });
    }
  }

  for (const [key, oldItem] of oldMap) {
    const newItem = newMap.get(key);
    if (!newItem) {
      continue;
    }

    const fields = compareFields
      .filter((field) => String(oldItem[field] ?? '') !== String(newItem[field] ?? ''))
      .map((field) => ({
        field,
        from: String(oldItem[field] ?? ''),
        to: String(newItem[field] ?? ''),
      }));

    if (fields.length) {
      changes.push({ section, type: 'changed', name: keyFn(newItem), fields });
    }
  }

  return changes;
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function formatChangeReport(changes) {
  const lines = [];
  lines.push('================ CV UPDATE REPORT ================');
  lines.push(`Time: ${new Date().toLocaleString()}`);
  lines.push('');

  if (!changes.length) {
    lines.push('No content changes. The portfolio JSON stayed the same.');
    lines.push('=================================================');
    return lines.join('\n') + '\n';
  }

  lines.push(`Total changes: ${changes.length}`);
  lines.push('  + added');
  lines.push('  - removed');
  lines.push('  ~ updated');
  lines.push('');

  let currentSection = '';
  for (const change of changes) {
    if (change.section !== currentSection) {
      currentSection = change.section;
      lines.push(`--- ${currentSection} ---`);
    }

    if (change.type === 'added') {
      lines.push(`  + ${change.name}`);
    } else if (change.type === 'removed') {
      lines.push(`  - ${change.name}`);
    } else {
      lines.push(`  ~ ${change.name}`);
      for (const field of change.fields || []) {
        lines.push(`      ${field.field}:`);
        lines.push(`        before: ${clip(field.from)}`);
        lines.push(`        after:  ${clip(field.to)}`);
      }
    }
  }

  lines.push('');
  lines.push('=================================================');
  return lines.join('\n') + '\n';
}

function clip(value, max = 140) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}...` : text || '(empty)';
}

function writeReportFile(filePath, report) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `\uFEFF${report}`, 'utf8');
}

function openReport(filePath) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', 'notepad.exe', filePath], {
      detached: true,
      stdio: 'ignore',
    }).unref();
  }
}

function openUrl(url) {
  if (!url) {
    return;
  }
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
    }).unref();
  }
}

function findLinkedInUrl(portfolio) {
  return (
    portfolio.home?.socials?.find((item) => String(item.label).toLowerCase().includes('linkedin'))
      ?.url ||
    portfolio.home?.socials?.find((item) => String(item.url).includes('linkedin'))?.url ||
    ''
  );
}

function writeLinkedInGuide(portfolio, options = {}) {
  const { openFile = true, openProfile = true } = options;
  const text = formatLinkedInGuide(portfolio);
  writeReportFile(linkedinReportPath, text);
  console.log(`LinkedIn copy file: ${path.relative(root, linkedinReportPath)}`);
  if (openFile) {
    openReport(linkedinReportPath);
  }
  if (openProfile) {
    openUrl(findLinkedInUrl(portfolio));
  }
}

function formatLinkedInGuide(portfolio) {
  const headline = (portfolio.home?.roles || [])
    .map((role) => role.text)
    .filter(Boolean)
    .slice(0, 3)
    .join(' | ');
  const about = portfolio.resume?.about || portfolio.home?.summary || '';
  const profileUrl = findLinkedInUrl(portfolio) || 'https://www.linkedin.com/in/me/';
  const lines = [
    '================ LINKEDIN UPDATE FROM CV ================',
    `Time: ${new Date().toLocaleString()}`,
    `Profile: ${profileUrl}`,
    '',
    'LinkedIn does not allow a personal script to edit your profile automatically.',
    'Copy each section below into LinkedIn after the website was updated from the CV.',
    '',
    '--------------------------------------------------------',
    '1) HEADLINE',
    'LinkedIn: pencil on intro -> Headline',
    'Max 220 characters.',
    '--------------------------------------------------------',
    headline || '(no headline)',
    '',
    '--------------------------------------------------------',
    '2) ABOUT',
    'LinkedIn: About -> pencil',
    'Max 2600 characters.',
    '--------------------------------------------------------',
    about || '(no about text)',
    '',
    '--------------------------------------------------------',
    '3) EXPERIENCE',
    'LinkedIn: Experience -> + or pencil on each job',
    '--------------------------------------------------------',
  ];

  for (const item of portfolio.resume?.experience || []) {
    lines.push(`Title: ${item.title}`);
    lines.push(`Company: ${item.company}`);
    lines.push(`Dates: ${item.year}`);
    lines.push('Description:');
    lines.push(item.description);
    lines.push('');
  }

  lines.push('--------------------------------------------------------');
  lines.push('4) EDUCATION');
  lines.push('LinkedIn: Education -> + or pencil');
  lines.push('--------------------------------------------------------');

  for (const item of portfolio.resume?.education || []) {
    lines.push(`School: ${item.company}`);
    lines.push(`Degree: ${item.title}`);
    lines.push(`Dates: ${item.year}`);
    lines.push('Description:');
    lines.push(item.description);
    lines.push('');
  }

  lines.push('--------------------------------------------------------');
  lines.push('5) SKILLS');
  lines.push('LinkedIn: Skills -> Add skill');
  lines.push('--------------------------------------------------------');
  lines.push(
    (portfolio.resume?.skills || []).map((skill) => skill.name).join(', ') || '(no skills)',
  );
  lines.push('');
  lines.push('--------------------------------------------------------');
  lines.push('6) PROJECTS / FEATURED');
  lines.push('LinkedIn: Projects or Featured -> Add');
  lines.push('--------------------------------------------------------');

  for (const project of portfolio.projects || []) {
    lines.push(`Title: ${project.title}`);
    lines.push(`Tech: ${project.tech}`);
    if (project.github) {
      lines.push(`Link: ${project.github}`);
    }
    lines.push('Description:');
    lines.push(project.description);
    lines.push('');
  }

  lines.push('========================================================');
  lines.push('Website and LinkedIn should now match the same CV.');
  lines.push('========================================================');
  return lines.join('\n') + '\n';
}

function isPhotoLike(width, height) {
  if (width < 80 || height < 80) {
    return false;
  }
  const ratio = width / height;
  return ratio >= 0.45 && ratio <= 2.2;
}

function jpegDimensions(buffer) {
  let i = 2;
  while (i < buffer.length - 8) {
    if (buffer[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buffer[i + 1];
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buffer.readUInt16BE(i + 5),
        width: buffer.readUInt16BE(i + 7),
      };
    }
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  return null;
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function extractEmbeddedJpegPng(pdfBuffer) {
  const candidates = [];
  const jpegStart = Buffer.from([0xff, 0xd8, 0xff]);
  const jpegEnd = Buffer.from([0xff, 0xd9]);
  let start = 0;
  while (start < pdfBuffer.length) {
    const soi = pdfBuffer.indexOf(jpegStart, start);
    if (soi === -1) {
      break;
    }
    const eoi = pdfBuffer.indexOf(jpegEnd, soi + 2);
    if (eoi === -1) {
      break;
    }
    const bytes = pdfBuffer.subarray(soi, eoi + 2);
    const dims = jpegDimensions(bytes);
    if (dims && isPhotoLike(dims.width, dims.height)) {
      candidates.push({
        ext: 'jpg',
        bytes,
        width: dims.width,
        height: dims.height,
      });
    }
    start = eoi + 2;
  }

  const pngStart = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngEnd = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  start = 0;
  while (start < pdfBuffer.length) {
    const soi = pdfBuffer.indexOf(pngStart, start);
    if (soi === -1) {
      break;
    }
    const eoi = pdfBuffer.indexOf(pngEnd, soi + 8);
    if (eoi === -1) {
      break;
    }
    const bytes = pdfBuffer.subarray(soi, eoi + 8);
    const dims = pngDimensions(bytes);
    if (dims && isPhotoLike(dims.width, dims.height)) {
      candidates.push({
        ext: 'png',
        bytes,
        width: dims.width,
        height: dims.height,
      });
    }
    start = eoi + 8;
  }

  return candidates;
}

function waitForPdfObject(page, name, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      page.objs.get(name, (obj) => {
        clearTimeout(timer);
        resolve(obj);
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

function bitmapToPng(img) {
  const png = new PNG({ width: img.width, height: img.height });
  const src = img.data;
  let si = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (img.kind === 3) {
      png.data[i] = src[si++];
      png.data[i + 1] = src[si++];
      png.data[i + 2] = src[si++];
      png.data[i + 3] = src[si++];
    } else if (img.kind === 2) {
      png.data[i] = src[si++];
      png.data[i + 1] = src[si++];
      png.data[i + 2] = src[si++];
      png.data[i + 3] = 255;
    } else {
      const gray = src[si++];
      png.data[i] = gray;
      png.data[i + 1] = gray;
      png.data[i + 2] = gray;
      png.data[i + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

async function extractProfilePhoto(pdfPath) {
  const pdfBuffer = readFileSync(pdfPath);
  const candidates = extractEmbeddedJpegPng(pdfBuffer);

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const data = new Uint8Array(pdfBuffer);
    const pdf = await pdfjs.getDocument({
      data,
      verbosity: 0,
      isEvalSupported: false,
      useWorkerFetch: false,
    }).promise;
    const pages = Math.min(pdf.numPages, 2);

    for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const opList = await page.getOperatorList();
      const names = new Set();
      for (let i = 0; i < opList.fnArray.length; i += 1) {
        const fn = opList.fnArray[i];
        if (
          fn === pdfjs.OPS.paintImageXObject ||
          fn === pdfjs.OPS.paintInlineImageXObject ||
          fn === pdfjs.OPS.paintJpegXObject
        ) {
          names.add(opList.argsArray[i][0]);
        }
      }

      for (const name of names) {
        const img = await waitForPdfObject(page, name);
        if (!img?.width || !img?.height || !img.data || !isPhotoLike(img.width, img.height)) {
          continue;
        }
        candidates.push({
          ext: 'png',
          bytes: bitmapToPng(img),
          width: img.width,
          height: img.height,
        });
      }
    }
  } catch (error) {
    console.warn(`PDF image scan warning: ${error instanceof Error ? error.message : error}`);
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => b.width * b.height - a.width * a.height);
  return candidates[0];
}

function saveProfilePhoto(photo) {
  const imagesDir = path.join(root, 'public', 'images');
  mkdirSync(imagesDir, { recursive: true });
  const relative = `images/home.${photo.ext}`;
  writeFileSync(path.join(root, 'public', relative), photo.bytes);
  return relative;
}
