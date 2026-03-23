import { createStaticClient } from '@/lib/supabase/static';
import { parseSiteConfig } from '@/lib/utils';
import {
  DEFAULT_HERO,
  DEFAULT_AREAS,
  DEFAULT_CARD_SETTINGS,
  DEFAULT_PILL_GROUPS,
  DEFAULT_AGE_GATE,
} from '@/lib/constants';
import type {
  Profile,
  Group,
  HeroConfig,
  CardSettings,
  PillGroup,
  AreaConfig,
  AgeGateConfig,
} from '@/lib/types';
import AgeGate from '@/components/AgeGate';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomepageClient from '@/components/HomepageClient';

export const revalidate = 60;

export default async function HomePage() {
  let profiles: Profile[] = [];
  let groups: Group[] = [];
  let hero: HeroConfig = DEFAULT_HERO;
  let areas: AreaConfig = DEFAULT_AREAS;
  let cardSettings: CardSettings = DEFAULT_CARD_SETTINGS;
  let pillGroups: PillGroup[] = DEFAULT_PILL_GROUPS;
  let ageGate: AgeGateConfig = DEFAULT_AGE_GATE;
  let heroGalleryUrls: string[] = [];

  try {
    const supabase = createStaticClient();

    const [profilesRes, groupsRes, configRes, galleryRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false }),
      supabase
        .from('groups')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false }),
      supabase.from('site_config').select('*'),
      supabase
        .from('gallery_images')
        .select('url')
        .order('sort_order', { ascending: true })
        .limit(10),
    ]);

    if (profilesRes.data) profiles = profilesRes.data as Profile[];
    if (groupsRes.data) groups = groupsRes.data as Group[];
    heroGalleryUrls = (galleryRes.data || []).map((r: { url: string }) => r.url);

    if (configRes.data) {
      const cfg = parseSiteConfig(configRes.data);
      if (cfg.hero) hero = cfg.hero as HeroConfig;
      if (cfg.areas) areas = cfg.areas as AreaConfig;
      if (cfg.card_settings) cardSettings = cfg.card_settings as CardSettings;
      if (cfg.pill_groups) pillGroups = cfg.pill_groups as PillGroup[];
      if (cfg.age_gate) ageGate = cfg.age_gate as AgeGateConfig;
    }
  } catch (error) {
    console.error('Homepage data fetch failed:', error);
    // Falls back to defaults initialized above
  }

  return (
    <AgeGate config={ageGate}>
      <div className="grain min-h-screen bg-cream">
        <Navbar />
        <HomepageClient
          profiles={profiles}
          groups={groups}
          hero={hero}
          areas={areas}
          cardSettings={cardSettings}
          pillGroups={pillGroups}
          heroGalleryUrls={heroGalleryUrls}
        />
        <Footer />
      </div>
    </AgeGate>
  );
}
