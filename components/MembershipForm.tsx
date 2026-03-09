'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { FormConfig, FormField, PillGroup } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface MembershipFormProps {
  formConfig: FormConfig;
  areas: string[];
  pillGroups: PillGroup[];
}

export default function MembershipForm({ formConfig, areas, pillGroups }: MembershipFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cleanup file preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const update = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const shootTypes = pillGroups.find(pg => pg.dataKey === 'types');
  const typeOptions = shootTypes ? shootTypes.options : [];

  const requiredFields = formConfig.fields.filter(f => f.required).map(f => f.id);
  const canSubmit = requiredFields.every(k => {
    if (k === 'id_photo') return fileObj !== null;
    const val = formData[k];
    return val && (typeof val === 'string' ? val.length > 0 : true);
  });

  const handleFileSelect = (field: FormField, file: File) => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFileObj(file);
    setFilePreview(URL.createObjectURL(file));
    update(field.id, file.name);
  };

  const handleFileRemove = (field: FormField) => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFileObj(null);
    setFilePreview('');
    update(field.id, '');
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const supabase = createClient();
      let idPhotoUrl: string | null = null;

      // Upload file if present
      if (fileObj) {
        const fileName = `${Date.now()}-${fileObj.name}`;
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(fileName, fileObj);

        if (uploadError) {
          console.warn('File upload failed, continuing without photo:', uploadError.message);
        } else {
          idPhotoUrl = `submissions/${fileName}`;
        }
      }

      // Build form_data without the file field
      const submissionData: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        if (key !== 'id_photo') {
          submissionData[key] = value;
        }
      }

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          form_data: submissionData,
          id_photo_url: idPhotoUrl,
          status: 'new',
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  /* ─── Field Renderer ─── */
  const renderField = (field: FormField) => {
    const inputClass =
      'w-full px-4 py-3 border border-sand bg-[#181716] text-charcoal text-sm font-sans font-medium focus:outline-none focus:border-rose transition-colors';

    switch (field.type) {
      case 'file_upload': {
        return (
          <div>
            {field.helperText && (
              <p className="text-[11px] text-muted leading-relaxed mb-3 px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06]">
                {field.helperText}
              </p>
            )}
            <div
              className="relative border border-dashed border-sand bg-white/[0.02] cursor-pointer overflow-hidden"
              style={{ padding: filePreview ? 0 : 32 }}
              onClick={() => document.getElementById(`ff-${field.id}`)?.click()}
            >
              {filePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Upload preview"
                    className="w-full max-h-[300px] object-contain block"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex gap-px">
                    <div className="flex-1 py-2 bg-black/80 text-white text-[10px] font-bold tracking-wider uppercase text-center font-sans">
                      Uploaded
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileRemove(field);
                      }}
                      className="px-4 py-2 bg-black/80 text-rose border-none text-[10px] font-bold tracking-wider uppercase cursor-pointer font-sans"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-[32px] text-sand mb-2 leading-none">&#8593;</div>
                  <div className="text-xs font-semibold text-muted font-sans">
                    Click to upload photo
                  </div>
                  <div className="text-[10px] text-sand mt-1 font-sans">JPG, PNG up to 10MB</div>
                </div>
              )}
            </div>
            <input
              id={`ff-${field.id}`}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(field, file);
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        );
      }

      case 'area_select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => update(field.id, e.target.value)}
            className={inputClass}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        );

      case 'exp_select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => update(field.id, e.target.value)}
            className={inputClass}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {['Beginner', 'Intermediate', 'Experienced', 'Professional'].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );

      case 'type_pills': {
        const selected: string[] = formData[field.id] || [];
        return (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {typeOptions.map((st) => {
              const on = selected.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    update(
                      field.id,
                      on ? selected.filter((x) => x !== st) : [...selected, st]
                    )
                  }
                  className={`px-4 py-1.5 text-[11px] tracking-wide font-sans transition-all duration-150 border ${
                    on
                      ? 'font-bold border-charcoal bg-charcoal text-cream'
                      : 'font-medium border-sand bg-transparent text-muted'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        );
      }

      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => update(field.id, e.target.value)}
            rows={4}
            placeholder={field.placeholder}
            className={`${inputClass} resize-y min-h-[80px]`}
          />
        );

      default:
        return (
          <input
            type={field.type === 'email' ? 'email' : 'text'}
            value={formData[field.id] || ''}
            onChange={(e) => update(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={inputClass}
          />
        );
    }
  };

  /* ─── Group fields into rows ─── */
  const rows: FormField[][] = [];
  let currentRow: FormField[] = [];
  let currentWidth = 0;
  formConfig.fields.forEach((ff) => {
    const w = ff.width === 'third' ? 1 : ff.width === 'half' ? 1.5 : 3;
    if (currentWidth + w > 3 && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }
    currentRow.push(ff);
    currentWidth += w;
  });
  if (currentRow.length) rows.push(currentRow);

  /* ─── Success State ─── */
  if (done) {
    return (
      <div className="font-sans min-h-screen bg-cream flex items-center justify-center grain">
        <div
          className="text-center max-w-[440px] px-10 py-14"
          style={{
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            opacity: show ? 1 : 0,
            transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center mx-auto mb-5 text-2xl text-[#181716]">
            &#10003;
          </div>
          <div className="font-serif text-[32px] font-light text-charcoal mb-2">
            {formConfig.successTitle}
          </div>
          <p className="text-sm text-muted leading-relaxed mb-8">
            {formConfig.successMsg}
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-charcoal text-cream border-none text-[11px] font-bold tracking-widest uppercase font-sans hover:bg-rose transition-colors"
          >
            Back to Site
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Form ─── */
  return (
    <div className="font-sans min-h-screen bg-cream grain">
      {/* Top bar */}
      <div className="px-8 py-4 border-b border-sand flex justify-between items-center bg-[#181716]">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold tracking-wider text-muted uppercase font-sans hover:text-charcoal transition-colors"
          >
            &larr; Back
          </Link>
          <span className="font-serif text-[22px] font-normal text-charcoal">
            K<span className="text-rose">peach</span>girl
          </span>
        </div>
      </div>

      {/* Form container */}
      <div
        className="max-w-[600px] mx-auto px-6 pt-12 pb-20"
        style={{
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          opacity: show ? 1 : 0,
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="font-serif text-4xl font-light text-charcoal mb-1">
            {formConfig.title}
          </div>
          <div className="w-10 h-px bg-rose mx-auto my-4" />
          <p className="text-[13px] text-muted leading-relaxed max-w-[440px] mx-auto">
            {formConfig.subtitle}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#181716] border border-sand p-8">
          {rows.map((row, ri) => {
            const cols = row.map(() => '1fr').join(' ');
            return (
              <div
                key={ri}
                className="mb-5"
                style={{
                  display: 'grid',
                  gridTemplateColumns: row.length > 1 ? cols : '1fr',
                  gap: '16px 20px',
                }}
              >
                {row.map((ff) => (
                  <div
                    key={ff.id}
                    style={ff.width === 'full' ? { gridColumn: '1 / -1' } : {}}
                  >
                    <label className="block text-[10px] font-bold tracking-[0.12em] text-muted uppercase mb-1.5 font-sans">
                      {ff.label}
                      {ff.required && <span className="text-rose ml-0.5">*</span>}
                    </label>
                    {renderField(ff)}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-rose/10 border border-rose/30 text-rose text-xs font-sans">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className={`w-full py-3.5 border-none text-xs font-bold tracking-[0.15em] uppercase font-sans transition-all duration-300 ${
              submitting
                ? 'bg-muted text-cream cursor-wait'
                : !canSubmit
                ? 'bg-sand text-cream cursor-default'
                : 'bg-charcoal text-cream cursor-pointer hover:bg-rose'
            }`}
          >
            {submitting ? 'Submitting...' : formConfig.submitLabel}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-sand text-center mt-5 leading-normal">
          By submitting, you confirm you are 18+ and consent to your information being reviewed
          by the Kpeachgirl team. All information is kept confidential.
        </p>
      </div>
    </div>
  );
}
