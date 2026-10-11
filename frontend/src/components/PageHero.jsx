import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHero({ eyebrow = 'P.N. CENTRAL ACADEMY', title, description, crumb = 'Explore' }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
        <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>{crumb}</span></div>
      </div>
    </section>
  );
}
