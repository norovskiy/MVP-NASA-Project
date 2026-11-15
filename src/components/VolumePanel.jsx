import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import {t} from '../i18n';
// Loaded only when the user opens sound settings.
export default function VolumePanel({anchor,volume,onChange,onEnter,onLeave}){
 return <Popper open anchorEl={anchor} placement="bottom-end" className="sound-settings-popper" modifiers={[{name:'offset',options:{offset:[0,12]}}]}><Paper className="sound-settings-panel" onMouseEnter={onEnter} onMouseLeave={onLeave}><span>{t('Ambient volume')}</span><Slider size="small" min={0} max={35} value={Math.round(volume*100)} onChange={(_,value)=>onChange(Number(value)/100)} aria-label={t('Ambient volume')} sx={{color:'#a5dcff',padding:'13px 0',width:'100%'}}/></Paper></Popper>;
}
