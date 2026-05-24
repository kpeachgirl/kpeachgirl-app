import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createStaticClient } from '@/lib/supabase/static';
import { parseSiteConfig } from '@/lib/utils';
import type { Profile, GalleryImage, Group, CategorySection, PillGroup } from '@/lib/types';
import AgeGate from '@/components/AgeGate';
import ModelProfileClient from '@/components/ModelProfileClient';

export const revalidate = 60;

/* ─── Static Params (ISR pre-render all profile slugs) ─── */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from('profiles')
      .select('slug')
      .not('slug', 'is', null);
    return (data || []).map((p) => ({ slug: p.slug! }));
  } catch {
    return [];
  }
}

/* ─── SEO Metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createStaticClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio, profile_image')
    .eq('slug', params.slug)
    .single();

  if (!profile) {
    return { title: 'Model Not Found -- Kpeachgirl' };
  }

  const description = profile.bio
    ? profile.bio.length > 160
      ? profile.bio.slice(0, 157) + '...'
      : profile.bio
    : `${profile.name} -- editorial model on Kpeachgirl`;

  return {
    title: `${profile.name} -- Kpeachgirl`,
    description,
    openGraph: {
      title: `${profile.name} -- Kpeachgirl`,
      description,
      images: profile.profile_image ? [profile.profile_image] : [],
    },
  };
}

/* ─── Page Component ─── */
export default async function ModelProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createStaticClient();

  // Fetch profile by slug
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!profile) {
    notFound();
  }

  const typedProfile = profile as Profile;

  // Fetch gallery images, groups, and site config in parallel
  const [galleryResult, groupsResult, configResult] = await Promise.all([
    supabase
      .from('gallery_images')
      .select('*')
      .eq('profile_id', typedProfile.id)
      .order('sort_order'),
    supabase
      .from('groups')
      .select('*')
      .contains('member_ids', [typedProfile.id]),
    supabase
      .from('site_config')
      .select('*')
      .in('id', ['categories', 'pill_groups']),
  ]);

  const gallery = (galleryResult.data || []) as GalleryImage[];
  const groups = (groupsResult.data || []) as Group[];
  const config = parseSiteConfig(configResult.data || []);
  const categories = (config.categories || []) as CategorySection[];
  const pillGroups = (config.pill_groups || []) as PillGroup[];

  return (
    <AgeGate>
      {/* Back nav bar */}
      <div
        className="nav-pad fixed top-0 left-0 right-0 z-[100] flex justify-between items-center"
        style={{
          background: 'rgba(14, 13, 12, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Link
          href="/"
          className="font-sans text-xs font-semibold tracking-[0.1em] text-muted uppercase no-underline hover:text-charcoal transition-colors"
        >
          &larr; Back
        </Link>
        <div className="font-serif text-[22px] font-normal tracking-[-0.01em] text-charcoal">
          K<span className="text-rose">peach</span>girl
        </div>
        <div className="w-[60px]" />
      </div>

      <ModelProfileClient
        profile={typedProfile}
        gallery={gallery}
        groups={groups}
        categories={categories}
        pillGroups={pillGroups}
      />
    </AgeGate>
  );
}
