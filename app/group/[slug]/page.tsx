import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createStaticClient } from '@/lib/supabase/static';
import type { Group, GroupGalleryImage, Profile, CategorySection, PillGroup } from '@/lib/types';
import AgeGate from '@/components/AgeGate';
import GroupProfileClient from '@/components/GroupProfileClient';

export const revalidate = 60;

/* ─── Static Params ─── */
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from('groups').select('slug');
    return (data || [])
      .filter((g): g is { slug: string } => g.slug !== null)
      .map((g) => ({ slug: g.slug }));
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
  const { data: group } = await supabase
    .from('groups')
    .select('name, bio, image')
    .eq('slug', params.slug)
    .single();

  if (!group) return { title: 'Group Not Found' };

  const description = group.bio
    ? group.bio.length > 160
      ? group.bio.slice(0, 157) + '...'
      : group.bio
    : `${group.name} on Kpeachgirl`;

  return {
    title: `${group.name} \u2014 Kpeachgirl`,
    description,
    openGraph: {
      title: `${group.name} \u2014 Kpeachgirl`,
      description,
      images: group.image ? [group.image] : [],
    },
  };
}

/* ─── Page Component ─── */
export default async function GroupProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createStaticClient();

  /* Fetch group */
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!group) notFound();

  const typedGroup = group as unknown as Group;

  /* Fetch gallery */
  const { data: galleryData } = await supabase
    .from('group_gallery_images')
    .select('*')
    .eq('group_id', typedGroup.id)
    .order('sort_order');

  const gallery = (galleryData || []) as unknown as GroupGalleryImage[];

  /* Fetch member profiles */
  let members: Profile[] = [];
  if (typedGroup.member_ids && typedGroup.member_ids.length > 0) {
    const { data: memberData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', typedGroup.member_ids);
    members = (memberData || []) as unknown as Profile[];
  }

  /* Fetch site config: categories + pill_groups */
  const { data: configRows } = await supabase
    .from('site_config')
    .select('id, value')
    .in('id', ['categories', 'pill_groups']);

  let categories: CategorySection[] = [];
  let pillGroups: PillGroup[] = [];

  if (configRows) {
    for (const row of configRows) {
      if (row.id === 'categories') categories = row.value as CategorySection[];
      if (row.id === 'pill_groups') pillGroups = row.value as PillGroup[];
    }
  }

  return (
    <AgeGate>
      <div className="grain min-h-screen bg-cream">
        {/* Nav bar */}
        <div className="nav-pad fixed top-0 left-0 right-0 z-[100] flex justify-between items-center bg-[rgba(14,13,12,0.9)] backdrop-blur-[12px] border-b border-white/[0.06]">
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

        {/* Profile content */}
        <GroupProfileClient
          group={typedGroup}
          members={members}
          gallery={gallery}
          categories={categories}
          pillGroups={pillGroups}
        />
      </div>
    </AgeGate>
  );
}
