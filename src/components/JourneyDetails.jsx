import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '../i18n';

// Detailed mission context lives in the readable page content after the animation.
export default function JourneyDetails({ stories }) {
  return <section className="journey-details" id="journey-stories" aria-labelledby="journey-details-title">
    <header className="journey-details-heading">
      <span className="eyebrow">{t('WHAT THE JOURNEY REVEALS')}</span>
      <h2 id="journey-details-title">{t('The worlds pass.')}<br /><em>{t('The evidence stays.')}</em></h2>
      <p>{t('Move from the cinematic flight into the archive: the places, machines, and traces left by exploration.')}</p>
    </header>

    <div className="journey-story-list">
      {stories.map((story) => <article className={`journey-story journey-story-${story.id}`} key={story.id} id={`story-${story.id}`}>
        <figure className="journey-story-figure">
          <img
            src={story.image}
            alt={t(story.imageAlt)}
            loading="lazy"
            decoding="async"
            draggable="false"
            onDragStart={(event) => event.preventDefault()}
          />
          <figcaption>{t(story.credit)}</figcaption>
          <span className="journey-story-number">{story.number}</span>
        </figure>

        <div className="journey-story-copy">
          <span className="journey-story-eyebrow">{t(story.eyebrow)}</span>
          <h3>{t(story.title[0])}<br /><em>{t(story.title[1])}</em></h3>
          <p>{t(story.description)}</p>
          <div className="journey-story-facts">
            {story.facts.map(([label, detail]) => <div key={label}>
              <strong>{t(label)}</strong>
              <span>{t(detail)}</span>
            </div>)}
          </div>
          <Link className="journey-story-link" to={story.link}>{t(story.linkLabel)}<ArrowUpRight size={16} /></Link>
        </div>
      </article>)}
    </div>
  </section>;
}
