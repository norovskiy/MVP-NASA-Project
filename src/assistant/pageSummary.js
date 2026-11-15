import {withoutAddress} from './conversation.js';
export function wantsPageSummary(text,name='Tara'){
 const q=withoutAddress(text,name);
 return /(?:explain|describe|summari[sz]e|read).*(?:this page|current page|what s here|what is here)|(?:объясни|опиши|расскажи|прочитай|сократи|перескажи).*(?:эту страницу|этой странице|этой страницы|текущую страницу|что здесь|что тут)|^(?:что здесь|что тут|прочитай страницу|read the page|read this)$/.test(q);
}
export function conciseExcerpt(title,paragraphs,max=650){
 const seen=new Set(),picked=[];
 for(const text of paragraphs){const clean=String(text).replace(/\s+/g,' ').trim();if(clean.length<35||seen.has(clean)||/^(?:MVP|NASA source|Original image|Источник|Site guide)/.test(clean))continue;seen.add(clean);const sentences=clean.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/gu)||[clean];for(const sentence of sentences){if(picked.length>=3)break;const candidate=sentence.trim();if(picked.join(' ').length+candidate.length>max){if(!picked.length)picked.push(candidate.slice(0,max-1)+'…');break}picked.push(candidate)}if(picked.length>=3)break;}
 return [title?.trim(),picked.join(' ')].filter(Boolean).join('. ');
}
export function visiblePageSummary(doc=document){const main=doc.querySelector('main');if(!main)return '';const title=main.querySelector('h1')?.textContent||'';const paragraphs=[...main.querySelectorAll('p')].filter(n=>!n.closest('footer,[aria-hidden="true"]')&&n.getClientRects().length).map(n=>n.textContent);return conciseExcerpt(title,paragraphs);}
