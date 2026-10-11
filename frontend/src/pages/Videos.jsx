import { ArrowUpRight, Youtube } from 'lucide-react';
import PageHero from '../components/PageHero';

export default function Videos() {
  return <>
    <PageHero title="Watch and revisit school life." crumb="Video gallery" description="The existing school homepage embeds a school video. It is displayed here in YouTube’s privacy-enhanced player." />
    <section className="section"><div className="container video-page-grid">
      <div className="video-embed-wrap">
        <iframe
          className="video-embed"
          src="https://www.youtube-nocookie.com/embed/WFFdzQhVcfg"
          title="P.N. Central Academy school video"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="video-caption-panel"><span className="video-empty-icon"><Youtube size={38}/></span><p className="eyebrow">VIDEO GALLERY</p><h2 className="section-heading">School moments, in motion.</h2><p className="lead-paragraph">The video is streamed from YouTube and therefore requires an internet connection. The school can provide more approved video URLs for this page later.</p><a className="button button-outline-dark" href="https://www.youtube.com/watch?v=WFFdzQhVcfg" target="_blank" rel="noreferrer">Open video on YouTube <ArrowUpRight size={17}/></a>
      </div>
    </div></section>
  </>;
}
