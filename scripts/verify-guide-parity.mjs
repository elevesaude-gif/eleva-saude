import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);
const [preparedText,pageSource,visualSource,migrationSource,auditSource]=await Promise.all([
  readFile(new URL("src/content/guide-cms.json",root),"utf8"),
  readFile(new URL("src/app/guia-canetas-emagrecimento/page.tsx",root),"utf8"),
  readFile(new URL("src/components/educational/CardVisual.tsx",root),"utf8"),
  readFile(new URL("scripts/migrate-full-guide-to-cms.sql",root),"utf8"),
  readFile(new URL("scripts/audit-full-guide-cms.sql",root),"utf8"),
]);
const prepared=JSON.parse(preparedText);
const sections=prepared.sections;
const normalizedPageSource=pageSource.replace(/<[^>\n]+>/g,"");
const flatten=(value,path="root",result=[])=>{if(typeof value==="string")result.push({path,value});else if(Array.isArray(value))value.forEach((item,index)=>flatten(item,`${path}[${index}]`,result));else if(value&&typeof value==="object")Object.entries(value).forEach(([key,item])=>flatten(item,`${path}.${key}`,result));return result;};
const objects=(key)=>sections.flatMap(section=>Array.isArray(section.content[key])?section.content[key]:[]);
const comparisons=sections.flatMap(section=>section.content.comparison?.items??[]);
const checklist=sections.flatMap(section=>section.content.checklist??[]);
const journey=sections.flatMap(section=>(section.content.lists??[]).flatMap(list=>list.items??[]));
const faqs=objects("faq");
const ctas=objects("ctas");
const headerCtas=sections.flatMap(section=>section.content.headerCta?[section.content.headerCta]:[]);
const cards=objects("cards");
const imageUrls=new Set(flatten(sections).filter(({path,value})=>/(?:imageUrl|image\.url)$/.test(path)&&value.startsWith("/educational/")).map(({value})=>value));

assert.equal(sections.length,13,"A representação CMS deve possuir 13 seções.");
assert.equal(new Set(sections.map(section=>section.content.sectionKey)).size,13,"sectionKey deve ser único e estável.");
assert.deepEqual(sections.map(section=>section.sort_order),Array.from({length:13},(_,index)=>index*10),"A ordem das seções está incorreta.");
assert(sections.every(section=>section.active),"As 13 seções preparadas devem estar ativas.");
assert.equal(faqs.length,12,"O FAQ deve possuir 12 perguntas e respostas.");
assert.equal(cards.length+comparisons.length+checklist.length+journey.length,58,"O inventário deve possuir 58 cards.");
assert.equal(checklist.length,6,"O checklist deve possuir 6 itens.");
assert.equal(comparisons.length,4,"O comparativo deve possuir 4 cards.");
assert.equal(imageUrls.size,7,"O guia deve referenciar 7 assets únicos.");
assert.equal(ctas.length+headerCtas.length,11,"O guia deve possuir 11 CTAs.");

const ignoredKeys=/\.(?:id|section_type|sectionKey|visualVariant|style|slug|schemaVersion|sort_order)$/;
const cmsText=flatten(sections,"sections").filter(({path,value})=>value&& !ignoredKeys.test(path)&&!path.endsWith(".url")&&!path.endsWith(".imageUrl"));
for(const {path,value} of cmsText)assert(pageSource.includes(value)||normalizedPageSource.includes(value)||visualSource.includes(value),`Texto ausente ou truncado na fonte estática: ${path} = ${JSON.stringify(value)}`);
for(const url of imageUrls)assert(visualSource.includes(url),`Asset não mapeado na versão estática: ${url}`);
for(const section of sections)assert(pageSource.includes(section.content.title),`Título ausente na página estática: ${section.content.title}`);

const combined=`${preparedText}\n${pageSource}`;
assert(!/\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2(?:\u20AC|\u2122|\u0153|\u201C|\u201D)/u.test(combined),"Mojibake detectado no conteúdo do guia.");
assert(!/\b(?:lorem ipsum|tbd|placeholder)\b/i.test(combined),"Placeholder detectado no conteúdo do guia.");
assert(!/\.\.\.(?:\s|$)/.test(preparedText),"Possível texto truncado detectado na representação CMS.");

assert.equal((migrationSource.match(/\bdo\s+\$migration\$/giu)??[]).length,1,"A migração deve possuir exatamente um bloco DO $migration$.");
assert.equal((migrationSource.match(/\$migration\$/gu)??[]).length,2,"O delimitador $migration$ deve abrir e fechar exatamente uma vez.");
assert(!/create\s+(?:global\s+|local\s+)?temporary\s+table/iu.test(migrationSource),"A migração não pode criar tabela temporária.");
assert(!/\bpg_temp\b/iu.test(migrationSource),"A migração não pode usar pg_temp.");
assert(!/prepared_full_guide_sections/iu.test(migrationSource),"A relação antiga de preparação não pode existir.");
assert(!/\bcommit\b/iu.test(migrationSource),"A migração não pode conter COMMIT.");
assert(!/\b(?:delete|truncate)\b/iu.test(migrationSource),"A migração não pode usar DELETE ou TRUNCATE.");
assert(/prepared_sections\s+jsonb\s*:=/iu.test(migrationSource),"Os dados preparados devem estar na variável JSONB prepared_sections.");
assert(!/\bwith\s+[a-z_][a-z0-9_]*\s+as\s*\(/iu.test(migrationSource),"A migração não deve depender de CTE de preparação.");
assert((migrationSource.match(/jsonb_(?:array_elements|to_recordset)\(prepared_sections\)/gu)??[]).length>=8,"Todos os usos dos dados preparados devem partir de prepared_sections.");
const embedded=migrationSource.match(/\$guide_sections\$(\[[\s\S]*\])\$guide_sections\$::jsonb/u);
assert(embedded,"O JSONB das 13 seções deve estar incorporado ao bloco DO.");
assert.deepEqual(JSON.parse(embedded[1]),sections,"O conteúdo incorporado na migração diverge da fonte canônica.");
assert(!/\b(?:insert|update|delete|truncate|alter|create|drop|grant|revoke)\b/iu.test(auditSource.replace(/^\s*--.*$/gmu,"")),"A auditoria posterior deve conter somente consultas de leitura.");

console.log("Paridade e estrutura SQL aprovadas: migração em um único DO e auditoria somente leitura.");
