import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BookOpen, BriefcaseBusiness, GraduationCap, LoaderCircle,
  Mail, Search, ShieldCheck, Sparkles, UserRound, Users,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import { useSite } from '../components/SiteContext';
import api, { getErrorMessage, getMediaUrl } from '../lib/api';

const categoryLabel = (type) => type === 'non-teaching' ? 'Non-teaching staff' : 'Teaching staff';

export default function Staff() {
  const { settings } = useSite();
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/faculty')
      .then(({ data }) => {
        if (active) setFaculty(Array.isArray(data?.data) ? data.data : []);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faculty.filter((item) => {
      const matchesCategory = category === 'all' || item.staffType === category;
      const values = [item.fullName, item.designation, item.department, item.subjectsTaught, item.qualifications, item.specialization];
      const matchesSearch = !query || values.some((value) => String(value || '').toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [faculty, search, category]);

  return <>
    <PageHero
      title="Meet the people who support learning."
      crumb="Faculty & Staff"
      description="Get to know the verified teaching and support professionals who contribute to the school community."
    />

    <section className="section faculty-directory-section">
      <div className="container">
        <div className="faculty-directory-intro">
          <div>
            <p className="eyebrow">OUR FACULTY & STAFF</p>
            <h2 className="section-heading">Dedicated people. A shared purpose.</h2>
            <p className="lead-paragraph">Profiles are published by the school administration after review. The directory shares professional information relevant to the school community.</p>
          </div>
          <div className="faculty-directory-stat"><Users size={22}/><strong>{faculty.length}</strong><span>verified {faculty.length === 1 ? 'profile' : 'profiles'}</span></div>
        </div>

        <div className="faculty-directory-toolbar">
          <label className="faculty-public-search"><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, role, subject or qualification" aria-label="Search faculty directory"/></label>
          <div className="faculty-category-filter" role="group" aria-label="Filter staff type">
            <button type="button" className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Everyone</button>
            <button type="button" className={category === 'teaching' ? 'active' : ''} onClick={() => setCategory('teaching')}>Teaching</button>
            <button type="button" className={category === 'non-teaching' ? 'active' : ''} onClick={() => setCategory('non-teaching')}>Support staff</button>
          </div>
        </div>

        {loading ? <div className="faculty-public-state"><LoaderCircle size={25} className="spin"/><p>Loading the verified faculty directory…</p></div> : error ? <div className="faculty-public-state faculty-public-error"><ShieldCheck size={27}/><h3>Faculty details are temporarily unavailable</h3><p>{error}</p><button className="button button-outline-dark" onClick={() => window.location.reload()}>Try again</button></div> : filteredFaculty.length ? <div className="faculty-public-grid">
          {filteredFaculty.map((item) => <article className={`faculty-public-card ${item.isFeatured ? 'faculty-public-card-featured' : ''}`} key={item._id}>
            <div className="faculty-public-photo-wrap">
              {item.photoUrl ? <img className="faculty-public-photo" src={getMediaUrl(item.photoUrl)} alt={item.imageAlt || `${item.fullName}, ${item.designation}`} loading="lazy"/> : <div className="faculty-public-placeholder" aria-label={`No photo provided for ${item.fullName}`}><UserRound size={50}/><span>{item.fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span></div>}
              {item.isFeatured && <span className="faculty-featured-label"><Sparkles size={13}/> Featured</span>}
            </div>
            <div className="faculty-public-content">
              <div className="faculty-public-verified"><BadgeCheck size={15}/> School-verified profile</div>
              <h3>{item.fullName}</h3>
              <p className="faculty-public-designation">{item.designation}</p>
              {item.department && <p className="faculty-public-department">{item.department}</p>}
              {item.subjectsTaught && <div className="faculty-public-detail"><BookOpen size={16}/><span><strong>Subjects</strong>{item.subjectsTaught}</span></div>}
              {item.qualifications && <div className="faculty-public-detail"><GraduationCap size={16}/><span><strong>Qualifications</strong>{item.qualifications}</span></div>}
              {item.specialization && <div className="faculty-public-detail"><BriefcaseBusiness size={16}/><span><strong>Specialization</strong>{item.specialization}</span></div>}
              {Number(item.experienceYears) > 0 && <p className="faculty-public-experience">{item.experienceYears}+ {Number(item.experienceYears) === 1 ? 'year' : 'years'} of professional experience</p>}
              {item.joiningYear && <p className="faculty-public-joining">At the academy since {item.joiningYear}</p>}
              {item.bio && <p className="faculty-public-bio">{item.bio}</p>}
              {item.achievements && <div className="faculty-public-achievements"><strong>Achievements</strong><p>{item.achievements}</p></div>}
              {item.languages && <p className="faculty-public-languages"><span>Languages</span>{item.languages}</p>}
              <div className="faculty-public-footer"><span>{categoryLabel(item.staffType)}</span>{item.email && <a href={`mailto:${item.email}`} aria-label={`Email ${item.fullName}`}><Mail size={16}/> Contact</a>}</div>
            </div>
          </article>)}
        </div> : <div className="faculty-public-state"><Users size={32}/><h3>{faculty.length ? 'No profiles match your search' : 'Faculty profiles are being prepared'}</h3><p>{faculty.length ? 'Try a different name, subject or category.' : 'The school team is preparing its verified directory. Please contact the office if you need current staff information.'}</p>{(search || category !== 'all') && <button className="button button-outline-dark" onClick={() => { setSearch(''); setCategory('all'); }}>Clear filters</button>}</div>}

        <div className="faculty-directory-footnote"><ShieldCheck size={18}/><p>Faculty profiles are school-managed and should contain only information approved for public display. For general enquiries, contact the school at <a href={`mailto:${settings.email}`}>{settings.email}</a>.</p></div>
      </div>
    </section>
  </>;
}
