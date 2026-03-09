import type {
  AreaConfig,
  CardSettings,
  PillGroup,
  HeroConfig,
  FormConfig,
  CategorySection,
} from './types';

/* ─── Default Site Config Values ────────────────────────────── */

export const DEFAULT_AREAS: AreaConfig = [
  'LA',
  'West LA',
  'Mid-Wilshire',
  'OC',
];

export const DEFAULT_CARD_SETTINGS: CardSettings = {
  subtitleFields: ['region', 'types'],
  showVerifiedBadge: true,
  showAwayBadge: true,
  verifiedLabel: 'Verified',
  awayLabel: 'Away',
  overlayColor: '#1a1a1a',
  overlayOpacity: 70,
};

export const DEFAULT_PILL_GROUPS: PillGroup[] = [
  {
    id: 'types',
    title: 'Shoot Types',
    color: 'var(--charcoal)',
    dataKey: 'types',
    options: [
      'Portrait',
      'Fashion',
      'Commercial',
      'Glamour',
      'Fitness',
      'Editorial',
      'Artistic',
      'Swimwear',
      'Lingerie',
      'Cosplay',
      'Lifestyle',
      'Event',
    ],
  },
  {
    id: 'compensation',
    title: 'Compensation',
    color: 'var(--sage)',
    dataKey: 'compensation',
    options: ['Paid Only', 'TFP', 'Negotiable'],
  },
];

export const DEFAULT_HERO: HeroConfig = {
  img: '',
  imgCrop: null,
  subtitle: 'Los Angeles \u00b7 Orange County',
  titleLine1: 'Find Your',
  titleLine2: 'Perfect',
  titleAccent: 'Model',
  searchPlaceholder: 'Search by name or area...',
};

export const DEFAULT_FORM_CONFIG: FormConfig = {
  title: 'Model Membership Form',
  subtitle:
    "You've been invited to submit your information for consideration on our platform. Fill out the form below and our team will review within 48 hours.",
  successTitle: 'Submission Received!',
  successMsg:
    'Thank you for your interest! Our team will review your information and reach out within 48 hours.',
  submitLabel: 'Submit Membership Form',
  fields: [
    { id: 'name', label: 'Full Name', type: 'text', required: true, width: 'half', placeholder: 'Jane Doe' },
    { id: 'email', label: 'Email', type: 'email', required: true, width: 'half', placeholder: 'jane@email.com' },
    { id: 'phone', label: 'Phone', type: 'text', required: false, width: 'third', placeholder: '(555) 123-4567' },
    { id: 'age', label: 'Age', type: 'text', required: false, width: 'third', placeholder: '21' },
    { id: 'height', label: 'Height', type: 'text', required: false, width: 'third', placeholder: '5\'7"' },
    { id: 'region', label: 'Preferred Area', type: 'area_select', required: false, width: 'half', placeholder: 'Select area...' },
    { id: 'exp', label: 'Experience Level', type: 'exp_select', required: false, width: 'half', placeholder: 'Select...' },
    { id: 'types', label: 'Shoot Types (select all that apply)', type: 'type_pills', required: false, width: 'full' },
    { id: 'bio', label: 'Tell us about yourself', type: 'textarea', required: false, width: 'full', placeholder: 'Your experience, style, what you bring to a shoot...' },
    { id: 'social', label: 'Instagram / Social', type: 'text', required: false, width: 'full', placeholder: '@yourhandle' },
    {
      id: 'id_photo',
      label: 'ID Verification',
      type: 'file_upload',
      required: true,
      width: 'full',
      helperText:
        'Upload a photo holding your ID next to your face. You may cover all other information \u2014 we only need to verify your name matches. No other personal details will be recorded.',
    },
  ],
};

export const DEFAULT_CATEGORIES: CategorySection[] = [
  {
    id: 'stats',
    title: 'Vitals',
    fields: [
      { key: 'age', label: 'Age' },
      { key: 'height', label: 'Height' },
      { key: 'weight', label: 'Weight' },
      { key: 'bust', label: 'Bust' },
      { key: 'waist', label: 'Waist' },
      { key: 'hips', label: 'Hips' },
    ],
  },
  {
    id: 'appearance',
    title: 'Look',
    fields: [
      { key: 'hair', label: 'Hair' },
      { key: 'eyes', label: 'Eyes' },
      { key: 'shoe', label: 'Shoe' },
      { key: 'dress', label: 'Dress' },
      { key: 'tattoos', label: 'Tattoos' },
      { key: 'piercings', label: 'Piercings' },
    ],
  },
  {
    id: 'professional',
    title: 'Work',
    fields: [
      { key: 'exp', label: 'Experience' },
      { key: 'region', label: 'Based In' },
    ],
  },
];
