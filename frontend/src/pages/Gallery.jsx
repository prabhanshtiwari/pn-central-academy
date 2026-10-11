import { useEffect, useState } from 'react';
import { ArrowUpRight, Images } from 'lucide-react';
import PageHero from '../components/PageHero';
import AssetImage from '../components/AssetImage';
import api from '../lib/api';
import { galleryFallback } from '../data/site';

export default function Gallery() {
  const [items, setItems] = useState(galleryFallback);
  const [activeItem, setActiveItem] = useState(null);
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/gallery').catch(() => ({ data: { data: [] } })),
      fetch('/assets/site-assets.json').then((response) => response.ok ? response.json() : null).catch(() => null),
    ]).then(([galleryResponse, assetReport]) => {
      if (!active) return;
      const liveItems = galleryResponse.data?.data || [];
      if (liveItems.length) { setItems(liveItems); return; }
      const mirrored = (assetReport?.manifest || []).filter((item) => item.kind === 'image' && item.galleryCandidate && item.downloaded && item.localPath)
        .map((item, index) => ({ _id: item.url, title: item.alt || `School photograph ${index + 1}`, category: 'School life', imageUrl: item.localPath, caption: '' }));
      if (mirrored.length) setItems(mirrored);
    });
    return () => { active = false; };
  }, []);
  return <>
    <PageHero title="A look at life around our school." crumb="Photo gallery" description="Explore campus and school-community photographs. More verified photographs can be published by the school admin." />
    <section className="section"><div className="container"><div className="gallery-intro-row"><div><p className="eyebrow">PHOTO GALLERY</p><h2 className="section-heading">Learning is full of moments.</h2></div><div className="gallery-count"><Images size={19}/><span>{items.length} featured {items.length === 1 ? 'image' : 'images'}</span></div></div><div className="gallery-grid">{items.map((item, index) => <button className={`gallery-card gallery-card-${(index % 6) + 1}`} key={item._id || `${item.title}-${index}`} onClick={() => setActiveItem(item)}><AssetImage src={item.imageUrl || item.src} fallback={item.fallback} alt={item.title || 'P.N. Central Academy gallery photo'}/><span className="gallery-card-overlay"><small>{item.category || 'School life'}</small><strong>{item.title || 'School memory'}</strong><span className="gallery-card-open"><ArrowUpRight size={17}/></span></span></button>)}</div><div className="gallery-note"><strong>Photography and consent</strong><p>Before making the new site public, confirm permission to reuse original photographs, especially any identifiable student images.</p></div></div></section>
    {activeItem && <div className="lightbox" role="dialog" aria-modal="true" aria-label={activeItem.title || 'Gallery preview'} onClick={() => setActiveItem(null)}><button className="lightbox-close" aria-label="Close image preview" onClick={() => setActiveItem(null)}>×</button><div className="lightbox-content" onClick={(event) => event.stopPropagation()}><AssetImage src={activeItem.imageUrl || activeItem.src} fallback={activeItem.fallback} alt={activeItem.title || 'Gallery image'} loading="eager"/><div><small>{activeItem.category || 'School life'}</small><h3>{activeItem.title || 'P.N. Central Academy'}</h3>{activeItem.caption && <p>{activeItem.caption}</p>}</div></div></div>}
  </>;
}
