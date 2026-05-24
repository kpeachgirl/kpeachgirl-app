'use client';

import { useState, useEffect } from 'react';
import MembershipForm from '@/components/MembershipForm';
import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_FORM_CONFIG,
  DEFAULT_AREAS,
  DEFAULT_PILL_GROUPS,
} from '@/lib/constants';
import type { FormConfig, PillGroup } from '@/lib/types';

export default function MembershipPage() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [areas, setAreas] = useState<string[]>(DEFAULT_AREAS);
  const [pillGroups, setPillGroups] = useState<PillGroup[]>(DEFAULT_PILL_GROUPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('site_config')
          .select('id, value')
          .in('id', ['form_config', 'areas', 'pill_groups']);

        if (error) throw error;

        if (data) {
          for (const row of data) {
            switch (row.id) {
              case 'form_config':
                setFormConfig(row.value as FormConfig);
                break;
              case 'areas':
                setAreas(row.value as string[]);
                break;
              case 'pill_groups':
                setPillGroups(row.value as PillGroup[]);
                break;
            }
          }
        }

        // If form_config wasn't in DB, use default
        if (!data?.find(r => r.id === 'form_config')) {
          setFormConfig(DEFAULT_FORM_CONFIG);
        }
      } catch {
        // Fall back to defaults on any error
        setFormConfig(DEFAULT_FORM_CONFIG);
        setAreas(DEFAULT_AREAS);
        setPillGroups(DEFAULT_PILL_GROUPS);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  if (loading || !formConfig) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center grain">
        <div className="text-center">
          <span className="font-serif text-2xl font-normal text-charcoal">
            K<span className="text-rose">peach</span>girl
          </span>
          <div className="mt-4 w-6 h-6 border-2 border-sand border-t-rose rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <MembershipForm
      formConfig={formConfig}
      areas={areas}
      pillGroups={pillGroups}
    />
  );
}
