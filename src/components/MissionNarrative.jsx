import { t } from '../i18n';
import { missionEvidence } from '../data/archiveExpansion';
import { ArrowUpRight } from 'lucide-react';

export default function MissionNarrative({ mission: m }) {
  const evidence = missionEvidence[m.id];
  const active = ["curiosity","perseverance"].includes(m.id);
  return <section className="hardware-narrative">
    <header><span className="eyebrow">{t('HARDWARE. DISCOVERY. LEGACY.')}</span><h2>{t(active ? 'An ongoing scientific legacy.' : 'What the machine leaves behind.')}</h2></header>
    {evidence && <dl className="evidence-dates">{[['Launch',evidence.launch],['Last contact',evidence.lastContact],['Mission officially ended',evidence.missionEnd]].map(([label,value]) => <div key={label}><dt>{t(label)}</dt><dd>{t(value)}</dd></div>)}</dl>}
    <div className="narrative-grid">{evidence ? evidence.blocks.map((b,i) => <article key={b.title}><small>0{i+1}</small><h3>{t(b.title)}</h3><p>{t(b.text)}</p></article>) : <><article><small>01</small><h3>{t('Why it went')}</h3><p>{t(m.description)}</p></article><article><small>02</small><h3>{t(active ? 'The archived view' : 'What remains')}</h3><p>{t(m.legacy)}</p></article></>}</div>
    <div className="narrative-sources"><a href={m.source} target="_blank" rel="noreferrer">{t('NASA mission record')} <ArrowUpRight size={13}/></a>{m.coordinateSource && <a href={m.coordinateSource} target="_blank" rel="noreferrer">{t('NASA landing-coordinate source')} <ArrowUpRight size={13}/></a>}{evidence?.sources.filter(url => url !== m.source).map((url,i) => <a key={url} href={url} target="_blank" rel="noreferrer">{t('Research source')} {i+1} <ArrowUpRight size={13}/></a>)}</div>
  </section>;
}
