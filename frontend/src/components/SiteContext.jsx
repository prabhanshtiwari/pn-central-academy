import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { school } from '../data/site';

const SiteContext = createContext(null);
const defaults = {
  schoolName: school.name,
  heroEyebrow: 'LEARN · LEAD · THRIVE',
  heroTitle: 'A strong foundation for a brighter future.',
  heroSubtitle: 'A supportive, student-centred learning environment in Saidabad, Prayagraj.',
  introTitle: 'Education with purpose. Character for life.',
  introText: 'P.N. Central Academy focuses on academic learning, discipline, curiosity and all-round development.',
  phonePrimary: school.phonePrimary,
  phoneSecondary: school.phoneSecondary,
  phoneWhatsapp: school.phoneWhatsapp || school.phonePrimary,
  email: school.email,
  address: school.address,
  admissionsOpen: true,
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/content').then(({ data }) => {
      if (!active || !data?.data) return;
      setSettings((current) => ({ ...current, ...data.data }));
      setApiAvailable(true);
    }).catch(() => {
      if (active) setApiAvailable(false);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ settings, setSettings, apiAvailable }), [settings, apiAvailable]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
}
