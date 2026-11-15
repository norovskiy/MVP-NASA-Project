// Decorative editorial photography stays behind a readable text layer.
export default function HeroMedia({src,credit='NASA',position='center'}){
 return <div className="page-hero-media" aria-hidden="true"><img src={src} alt="" draggable="false" style={{objectPosition:position}}/><span className="page-hero-credit">{credit}</span></div>;
}
