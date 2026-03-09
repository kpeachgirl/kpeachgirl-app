import { createClient } from '@/lib/supabase/server';
import { parseSiteConfig } from '@/lib/utils';
import {
  DEFAULT_HERO,
  DEFAULT_AREAS,
  DEFAULT_CARD_SETTINGS,
  DEFAULT_PILL_GROUPS,
} from '@/lib/constants';
import type {
  Profile,
  Group,
  HeroConfig,
  CardSettings,
  PillGroup,
  AreaConfig,
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

  try {
    const supabase = createClient();

    const [profilesRes, groupsRes, configRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false }),
      supabase
        .from('groups')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false }),
      supabase.from('site_config').select('*'),
    ]);

    if (profilesRes.data) profiles = profilesRes.data as Profile[];
    if (groupsRes.data) groups = groupsRes.data as Group[];

    if (configRes.data) {
      const cfg = parseSiteConfig(configRes.data);
      if (cfg.hero) hero = cfg.hero as HeroConfig;
      if (cfg.areas) areas = cfg.areas as AreaConfig;
      if (cfg.card_settings) cardSettings = cfg.card_settings as CardSettings;
      if (cfg.pill_groups) pillGroups = cfg.pill_groups as PillGroup[];
    }
  } catch (error) {
    console.error('Homepage data fetch failed:', error);
    // Falls back to defaults initialized above
  }

  return (
    <AgeGate>
      <div className="grain min-h-screen bg-cream">
        <Navbar />
        <HomepageClient
          profiles={profiles}
          groups={groups}
          hero={hero}
          areas={areas}
          cardSettings={cardSettings}
          pillGroups={pillGroups}
        />
        <Footer />
      </div>
    </AgeGate>
  );
}
