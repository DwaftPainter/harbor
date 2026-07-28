import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DOC_STATUSES = new Set([
  "Active",
  "Approved",
  "Accepted",
  "Draft",
  "Implemented",
  "Proposed",
  "Review",
  "Superseded",
]);

const PHASE_SECTIONS = [
  "Objective",
  "Scope",
  "Prerequisites",
  "Entry criteria",
  "Deliverables",
  "Implementation order",
  "Documents required",
  "Completion checklist",
  "Exit criteria",
];

const FEATURE_SECTIONS = [
  "Purpose",
  "Responsibilities",
  "User stories",
  "Domain concepts",
  "Entities",
  "Relationships",
  "Permissions",
  "API overview",
  "UI overview",
  "Validation",
  "Security",
  "Testing",
  "Operations",
  "Edge cases",
  "Future improvements",
  "Dependencies",
  "Out of scope",
  "Acceptance criteria",
  "Open questions",
];

const MARKDOWN_LINK = /!?\[[^\]]*]\(([^)]+)\)/g;

export function validateDocumentMetadata(relativePath, content) {
  const errors = [];

  if (!/^# .+/m.test(content)) {
    errors.push(`${relativePath}: missing level-one title`);
  }

  const statusMatch = content.match(/^Status:\s*([A-Za-z]+)\s{0,2}$/m);
  if (!statusMatch) {
    errors.push(`${relativePath}: missing Status metadata`);
  } else if (!DOC_STATUSES.has(statusMatch[1])) {
    errors.push(`${relativePath}: unsupported status "${statusMatch[1]}"`);
  }

  return errors;
}

export function validateRequiredSections(relativePath, content) {
  if (relativePath.endsWith("README.md")) {
    return [];
  }

  const sections = relativePath.startsWith("phases/")
    ? PHASE_SECTIONS
    : relativePath === "features/TEMPLATE.md"
      ? FEATURE_SECTIONS
      : [];

  return sections
    .filter((section) => !content.includes(`## ${section}`))
    .map((section) => `${relativePath}: missing required section "${section}"`);
}

export function extractLocalLinks(content) {
  return [...content.matchAll(MARKDOWN_LINK)]
    .map((match) => match[1].trim())
    .filter(
      (target) =>
        target &&
        !target.startsWith("#") &&
        !target.startsWith("http://") &&
        !target.startsWith("https://") &&
        !target.startsWith("mailto:"),
    )
    .map((target) => target.replace(/^<|>$/g, "").split("#", 1)[0]);
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(absolutePath);
      }
      return entry.name.endsWith(".md") ? [absolutePath] : [];
    }),
  );

  return files.flat();
}

async function targetExists(target) {
  try {
    const targetStat = await stat(target);
    if (targetStat.isDirectory()) {
      await stat(path.join(target, "README.md"));
    }
    return true;
  } catch {
    return false;
  }
}

export async function validateDocs(rootDirectory) {
  const docsDirectory = path.join(rootDirectory, "docs");
  const files = await collectMarkdownFiles(docsDirectory);
  const errors = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const relativePath = path.relative(docsDirectory, file);
    if (
      !relativePath.startsWith("prompts/") &&
      !relativePath.startsWith("skills/")
    ) {
      errors.push(...validateDocumentMetadata(relativePath, content));
    }
    errors.push(...validateRequiredSections(relativePath, content));

    for (const link of extractLocalLinks(content)) {
      const decodedLink = decodeURIComponent(link);
      const resolvedLink = path.resolve(path.dirname(file), decodedLink);
      if (!(await targetExists(resolvedLink))) {
        errors.push(`${relativePath}: broken link "${link}"`);
      }
    }
  }

  return { checked: files.length, errors };
}

async function main() {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const rootDirectory = path.resolve(scriptDirectory, "..");
  const result = await validateDocs(rootDirectory);

  if (result.errors.length > 0) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`Documentation check passed (${result.checked} files).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
