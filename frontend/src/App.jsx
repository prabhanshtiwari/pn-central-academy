import { useEffect, useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SiteProvider } from './components/SiteContext';
import Home from './pages/Home';
import About from './pages/About';
import History from './pages/History';
import StudentCorner from './pages/StudentCorner';
import Vision from './pages/Vision';
import Infrastructure from './pages/Infrastructure';
import Admissions from './pages/Admissions';
import Fees from './pages/Fees';
import Staff from './pages/Staff';
import Disclosure from './pages/Disclosure';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Notices from './pages/Notices';
import AdmissionResources from './pages/AdmissionResources';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ScrollReset() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [location.pathname]);
  return null;
}

function PublicLayout() {
  return <><Navbar/><main><Outlet/></main><Footer/><ScrollTopButton/></>;
}

function ScrollTopButton() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);
  if (!visible) return null;
  return <button className="back-to-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUpRight size={18}/></button>;
}

function NotFound() {
  return <section className="not-found"><div><p className="eyebrow">404 · PAGE NOT FOUND</p><h1>Looks like this page took a wrong turn.</h1><p>The page may have moved or the link may be out of date.</p><Link to="/" className="button button-primary">Back to homepage <ArrowUpRight size={16}/></Link></div></section>;
}


export default function App() {
  return <SiteProvider><BrowserRouter><ScrollReset/><Routes><Route element={<PublicLayout/>}><Route index element={<Home/>}/><Route path="about" element={<About/>}/><Route path="history" element={<History/>}/><Route path="student-corner" element={<StudentCorner/>}/><Route path="vision" element={<Vision/>}/><Route path="infrastructure" element={<Infrastructure/>}/><Route path="admissions" element={<Admissions/>}/><Route path="admission-resources" element={<AdmissionResources/>}/><Route path="notices" element={<Notices/>}/><Route path="fees" element={<Fees/>}/><Route path="staff" element={<Staff/>}/><Route path="mandatory-disclosure" element={<Disclosure/>}/><Route path="gallery" element={<Gallery/>}/><Route path="videos" element={<Videos/>}/><Route path="contact" element={<Contact/>}/></Route><Route path="admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter></SiteProvider>;
}
