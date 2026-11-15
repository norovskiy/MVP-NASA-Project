import {t, useLanguage} from '../i18n';

const people = [
 {en:'Sabzbahor Ramikhudoeva',ru:'Рамихудоева Сабзбахор',tg:'Рамихудоева Сабзбаҳор',initials:'SR'},
 {en:'Sumaya Vazirova',ru:'Вазирова Сумая',tg:'Вазирова Сумая',initials:'SV'},
 {en:'Nozanin Kholikova',ru:'Холикова Нозанин',tg:'Холиқова Нозанин',initials:'NK'},
 {en:'Mehrona Kudratova',ru:'Кудратова Мехрона',tg:'Қудратова Меҳрона',initials:'MK'},
];
// Contributions are stated at the level supplied by the team. No invented qualifications.
export default function ProjectTeam(){
 const lang=useLanguage(s=>s.lang);
 return <section className="project-team" aria-labelledby="project-team-heading">
  <header className="about-section-heading"><span className="eyebrow">{t('THE TEAM BEHIND THE RESEARCH')}</span><h2 id="project-team-heading">{t('Different roles. One shared mission.')}</h2><p>{t('Norov Muhammad independently designed and developed the website. The team contributed information and research; Sabrina led the team and prepared Mars data and translations.')}</p></header>
  <article className="team-captain"><div className="team-monogram" aria-hidden="true">SM<span>01 / CAPTAIN</span></div><div><span className="eyebrow">{t('TEAM CAPTAIN · RESEARCH & TRANSLATION')}</span><h3>{lang==='en'?'Sabrina Mukumova':'Мукумова Сабрина'}</h3><p>{t('I was the Team Captain for this NASA Space Apps project. My main contribution was collecting data on 12 Mars objects and translating that data into three languages.')}</p><div className="team-tags"><span>{t('Team Captain')}</span><span>{t('Mars data · 12 objects')}</span><span>{t('Translator · 3 languages')}</span></div></div></article>
  <div className="team-contributors">{people.map((person,i)=><article key={person.en}><div className="team-member-top"><span className="team-initials" aria-hidden="true">{person.initials}</span><small>0{i+2} / {t('RESEARCH TEAM')}</small></div><h3>{person[lang]||person.en}</h3><span className="team-role">{t('Information contributor')}</span><p>{t('Contributed information for the team’s space-exploration research and educational content.')}</p></article>)}</div>
 </section>;
}
