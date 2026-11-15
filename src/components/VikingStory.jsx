import { ArrowUpRight, Radio, Timer, Waves } from 'lucide-react';
import { t } from '../i18n';

const nasaStory = 'https://science.nasa.gov/mission/viking/viking-50-years-on-mars/';
const nasaVideo = 'https://science.nasa.gov/resource/viking-mission-to-mars-animation-and-footage/';

export default function VikingStory() {
  return <section className="viking-story" aria-labelledby="viking-title">
    <div className="viking-story-heading">
      <span className="eyebrow">{t('THE FIRST EYES ON MARS · VIKING 1')}</span>
      <h2 id="viking-title">{t('The camera opened.')}<br /><em>{t('Mars answered.')}</em></h2>
        <p>{t('A real view from Chryse Planitia, captured three days after touchdown. This was the landscape Viking 1 explored—and the place its instruments left behind.')}</p>
    </div>

    <figure className="viking-panorama">
      <div className="viking-panorama-image">
        <img src="/media/viking-1-panorama.jpg" alt={t('Panoramic black-and-white view across Chryse Planitia from the Viking 1 lander, captured July 23, 1976')} draggable="false" loading="lazy" decoding="async" onDragStart={(event) => event.preventDefault()} />
        <span className="viking-reticle" aria-hidden="true" />
        <span className="viking-pano-label">{t('CHRYSE PLANITIA · SOL 3 · 1976')}</span>
        <span className="viking-pano-grain" aria-hidden="true" />
      </div>
      <figcaption>{t('NASA/JPL · Viking 1 Camera 1 panorama · July 23, 1976')}</figcaption>
    </figure>

    <div className="viking-story-grid">
      <article className="viking-story-copy">
        <span className="eyebrow">{t('THE LANDING THAT ALMOST MISSED ITS DATE')}</span>
        <p>{t('Viking 1 launched on August 20, 1975, and spent 304 days crossing space. Its landing was planned for July 4, 1976, but orbital images revealed dangerous terrain. After searching for a safer site, it touched down at Chryse Planitia on July 20. A three-metre robotic arm delivered soil to onboard experiments searching for signs of life; the results remain inconclusive.')}</p>
        <a className="viking-source" href={nasaStory} target="_blank" rel="noreferrer">{t('Read the NASA mission story')} <ArrowUpRight size={15} /></a>
      </article>

      <div className="viking-signal-cards">
        <article className="viking-signal-card"><Timer size={17} /><span className="eyebrow">{t('FIRST CAMERA SCAN')}</span><strong>00:25</strong><p>{t('Twenty-five seconds after touchdown, Camera 2 began scanning the footpad and soil. The first image took minutes to assemble and transmit.')}</p></article>
        <article className="viking-signal-card"><Radio size={17} /><span className="eyebrow">{t('A SIGNAL ACROSS SPACE')}</span><strong>~19 min</strong><p>{t('One-way radio travel time was about nineteen minutes. Earth could not steer the landing in real time.')}</p></article>
        <article className="viking-signal-card"><Waves size={17} /><span className="eyebrow">{t('A LAB, LEFT BEHIND')}</span><strong>1976–1982</strong><p>{t('Viking 1 sent data for more than six years. Its lander still rests on Mars; its final transmission came in 1982.')}</p></article>
      </div>
    </div>

    <a className="viking-film-link" href={nasaVideo} target="_blank" rel="noreferrer"><span className="viking-play-icon">▶</span><span><b>{t('Watch the Viking landing animation and mission-control footage')}</b><small>{t('Official NASA/JPL video · opens in a new tab')}</small></span><ArrowUpRight size={18} /></a>
  </section>;
}
