import { HLTV } from 'hltv';
import fs from 'node:fs';
const FILE = 'data/data.json';
let old = {};
try { old = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const safe = async (fn, keep) => { try { const r = await fn(); return r && r.length ? r : keep; } catch (e) { console.error('Klaida:', e.message); return keep; } };
const ts = (d) => (d ? new Date(d).getTime() : null);
const [news, matches, results, ranking] = await Promise.all([
  safe(async () => (await HLTV.getNews()).slice(0, 12).map(n => ({ title: n.title, link: n.link, date: ts(n.date) })), old.news),
  safe(async () => (await HLTV.getMatches()).slice(0, 14).map(m => ({ team1: m.team1?.name, team2: m.team2?.name, event: m.event?.name || m.title, date: ts(m.date), live: !!m.live })).filter(m => m.team1 && m.team2), old.matches),
  safe(async () => (await HLTV.getResults({ pages: 1 })).slice(0, 10).map(r => ({ team1: r.team1?.name, team2: r.team2?.name, result: r.result, event: r.event?.name })), old.results),
  safe(async () => (await HLTV.getTeamRanking()).slice(0, 10).map(t => ({ place: t.place, team: t.team?.name, points: t.points })), old.ranking),
]);
const out = { updated: Date.now(), news, matches, results, ranking };
fs.writeFileSync(FILE, JSON.stringify(out, null, 1));
console.log('Atnaujinta:', { news: news?.length, matches: matches?.length, results: results?.length, ranking: ranking?.length });
