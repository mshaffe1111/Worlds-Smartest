import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('public/data/questions.json', 'utf8'));
const qs = d.questions || d;
const stemLeaks = [];
const clueLeaks = [];
for (const q of qs) {
  if (q.l0Domain === 11 || q.archetype !== 'SIGHTLINE_LOCK') continue;
  const a = String(q.answerCorrect || '').trim();
  if (a.length < 4) continue;
  const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'i');
  if (re.test(q.prompt)) {
    stemLeaks.push({ qid: q.qid, ans: a, prompt: q.prompt });
  }
  for (const c of q.clues || []) {
    if (re.test(c)) {
      clueLeaks.push({ qid: q.qid, ans: a, clue: c });
    }
  }
}

const manifest = JSON.parse(fs.readFileSync('public/data/shards/shard_manifest.json', 'utf8'));
const shardTemplateBugs = [];
for (const [typeId, spec] of Object.entries(manifest.types)) {
  for (const ang of spec.angles) {
    for (const field of ['prompt', 'truePrompt', 'falsePrompt', 'clue1', 'clue2']) {
      const tpl = ang[field] || '';
      if (/\ba \{/.test(tpl) || /\ba [AEIOU]/i.test(tpl)) {
        shardTemplateBugs.push({ typeId, angleId: ang.id, field, tpl });
      }
    }
  }
}

console.log(
  JSON.stringify(
    {
      wordBoundedStemLeaksCount: stemLeaks.length,
      wordBoundedStemLeaks: stemLeaks,
      wordBoundedClueLeaksCount: clueLeaks.length,
      wordBoundedClueLeaks: clueLeaks,
      shardTemplateBugs,
    },
    null,
    2
  )
);
