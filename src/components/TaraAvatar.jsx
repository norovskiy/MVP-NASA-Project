import React from 'react';
const cells={neutral:[0,0],wave:[1,0],listening:[2,0],thinking:[0,1],speaking:[1,1],angry:[2,1],hurt:[0,2],sleeping:[1,2],happy:[2,2]};
export default function TaraAvatar({mood='neutral',className=''}){const [x,y]=cells[mood]||cells.neutral;return <span className={'tara-avatar '+className} data-emotion={mood} style={{backgroundPosition:`${x*50}% ${y*50}%`}} aria-hidden="true"/>}
