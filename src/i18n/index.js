import {create} from 'zustand';
import {messages} from './messages';
const allowed=['en','ru','tg'];
// Each new visit starts in English. Tara and the language selector can switch it live.
const initial='en';
export const useLanguage=create(set=>({lang:initial,setLanguage:lang=>{if(!allowed.includes(lang))return;try{localStorage.setItem('mars-explorer-language',lang)}catch{};document.documentElement.lang=lang;set({lang})}}));
document.documentElement.lang=initial;
export function t(value){
 if(typeof value!=='string')return value;
 const lang=useLanguage.getState().lang;if(lang==='en')return value;
 const leading=value.match(/^\s*/)[0],trailing=value.match(/\s*$/)[0],key=value.trim();
 const row=messages[key];if(row)return leading+row[lang==='ru'?0:1]+trailing;
 const months={JAN:['ЯНВ','ЯНВ'],FEB:['ФЕВ','ФЕВ'],MAR:['МАР','МАР'],APR:['АПР','АПР'],MAY:['МАЙ','МАЙ'],JUN:['ИЮН','ИЮН'],JUL:['ИЮЛ','ИЮЛ'],AUG:['АВГ','АВГ'],SEP:['СЕН','СЕН'],OCT:['ОКТ','ОКТ'],NOV:['НОЯ','НОЯ'],DEC:['ДЕК','ДЕК']};
 if(/^\d{2} [A-Z]{3} \d{4}$/.test(key))return value.replace(/[A-Z]{3}/,x=>months[x]?.[lang==='ru'?0:1]||x);
 // Trim before splitting: a bare prefix must never translate itself recursively.
 for(const suffix of [' story',' briefing'])if(key.endsWith(suffix)&&key.length>suffix.length)return leading+t(key.slice(0,-suffix.length))+' '+t(suffix.trim())+trailing;
 for(const prefix of ['Explore ','Discover ','Enter ','Archival NASA photograph: '])if(key.startsWith(prefix)&&key.length>prefix.length)return leading+t(prefix.trim())+' '+t(key.slice(prefix.length))+trailing;
 return value;
}
