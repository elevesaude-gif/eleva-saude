import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const roots = ["src", "supabase", "scripts"];
const rootFiles = ["AGENTS.md", "README.md", "package.json", ".editorconfig", ".gitattributes"];
const textExtensions = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".sql", ".md", ".css", ".html", ".yml", ".yaml"]);
const mojibake = /(?:Ã.|Â.|â(?:€|€™|€œ|€œ|€˜|€ž|€“|€”|€¦|„|œ|˜|ž|™|–|—|…|†|‡|ˆ|‰|‹|›|™|š|œ|ž|Ÿ)|\uFFFD)/u;
const findings = [];
const intentionalPatternFiles = new Set(["scripts/audit-cms-data.sql"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (textExtensions.has(extname(path).toLowerCase())) files.push(path);
  }
  return files;
}

const files = [...rootFiles];
for (const root of roots) files.push(...await walk(root));
for (const file of files) {
  let source;
  try { source = await readFile(file); } catch (error) {
    if (error?.code === "ENOENT") continue;
    throw error;
  }
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(source); }
  catch { findings.push({ file, line: 1, text: "arquivo contém bytes inválidos para UTF-8" }); continue; }
  text.split(/\r?\n/u).forEach((line, index) => {
    const normalized=relative(process.cwd(),file).replaceAll("\\","/");
    if (intentionalPatternFiles.has(normalized)||normalized==="scripts/audit-encoding.mjs"&&line.includes("const mojibake")) return;
    if (mojibake.test(line)) findings.push({ file: normalized, line: index + 1, text: line.trim() });
  });
}

if (findings.length) {
  console.error(`Encoding: ${findings.length} ocorrência(s) suspeita(s).`);
  for (const finding of findings) console.error(`${finding.file}:${finding.line}: ${finding.text}`);
  process.exitCode = 1;
} else console.log(`Encoding UTF-8: aprovado (${files.length} arquivos auditados).`);
