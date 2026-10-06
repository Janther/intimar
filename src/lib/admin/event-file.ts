// The shape of one src/data/events/<id>.json file, plus the form-side
// helpers the /admin panel needs: slugs, validation (messages in Spanish,
// for the editors) and serialisation that matches Prettier, so a PR opened
// from the panel passes CI's format check without anyone touching it.
import {
  formatDateRange,
  formatShortDate,
  isEarlyBirdActive,
  type EventSummary,
} from '../format';

export interface EventFile {
  id: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
  price: number;
  currency: string;
  // Omitted when the event uses the default image (events/default.jpg).
  image?: string;
  tags: string[];
  hostIds: string[];
  featured: boolean;
  published: boolean;
}

// Same key order as the existing files, so diffs only show real changes.
const KEY_ORDER: (keyof EventFile)[] = [
  'id',
  'title',
  'summary',
  'description',
  'location',
  'startDate',
  'endDate',
  'earlyBirdPrice',
  'earlyBirdDeadline',
  'price',
  'currency',
  'image',
  'tags',
  'hostIds',
  'featured',
  'published',
];

export function emptyEvent(): EventFile {
  return {
    id: '',
    title: '',
    summary: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    price: 0,
    currency: 'CLP',
    tags: [],
    hostIds: [],
    featured: false,
    published: false,
  };
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Prettier keeps an array on one line when it fits in 80 columns and
// breaks it one item per line otherwise; JSON.stringify always breaks.
const PRINT_WIDTH = 80;

export function serializeEvent(event: EventFile): string {
  const entries = KEY_ORDER.filter((key) => event[key] !== undefined).map(
    (key) => {
      const value = event[key];
      const prefix = `  ${JSON.stringify(key)}: `;
      if (Array.isArray(value)) {
        const inline = `[${value.map((v) => JSON.stringify(v)).join(', ')}]`;
        if (
          value.length === 0 ||
          prefix.length + inline.length + 1 <= PRINT_WIDTH
        ) {
          return prefix + inline;
        }
        const items = value.map((v) => `    ${JSON.stringify(v)}`).join(',\n');
        return `${prefix}[\n${items}\n  ]`;
      }
      return prefix + JSON.stringify(value);
    },
  );
  return `{\n${entries.join(',\n')}\n}\n`;
}

export type EventErrors = Partial<Record<keyof EventFile, string>>;

export function validateEvent(event: EventFile): EventErrors {
  const errors: EventErrors = {};
  const required: [keyof EventFile, string][] = [
    ['title', 'Ponle un título al evento.'],
    ['summary', 'Escribe un resumen corto.'],
    ['description', 'Escribe la descripción.'],
    ['location', 'Indica dónde será.'],
    ['startDate', 'Elige la fecha de inicio.'],
    ['endDate', 'Elige la fecha de término.'],
  ];
  for (const [key, message] of required) {
    if (!String(event[key] ?? '').trim()) errors[key] = message;
  }
  if (!event.id) errors.id = 'El título debe tener letras o números.';
  if (event.startDate && event.endDate && event.endDate < event.startDate) {
    errors.endDate = 'La fecha de término no puede ser antes del inicio.';
  }
  if (!(event.price > 0)) errors.price = 'Indica un precio mayor que 0.';
  if (event.earlyBirdPrice !== undefined) {
    if (!(event.earlyBirdPrice > 0 && event.earlyBirdPrice < event.price)) {
      errors.earlyBirdPrice =
        'El precio early bird debe ser menor que el precio normal.';
    }
    if (!event.earlyBirdDeadline) {
      errors.earlyBirdDeadline = 'Elige hasta cuándo vale el early bird.';
    } else if (event.startDate && event.earlyBirdDeadline > event.startDate) {
      errors.earlyBirdDeadline =
        'El early bird tiene que terminar antes de que empiece el evento.';
    }
  }
  if (event.hostIds.length === 0)
    errors.hostIds = 'Elige al menos un facilitador.';
  return errors;
}

// The same card the site shows, for the form's live preview.
export function toPreviewSummary(
  event: EventFile,
  imageUrl: string,
): EventSummary {
  const start = event.startDate ? new Date(event.startDate) : undefined;
  const end = event.endDate ? new Date(event.endDate) : start;
  const deadline = event.earlyBirdDeadline
    ? new Date(event.earlyBirdDeadline)
    : undefined;
  return {
    id: event.id || 'nuevo-evento',
    title: event.title || 'Título del evento',
    summary: event.summary || 'Aquí va el resumen corto del evento.',
    location: event.location || 'Lugar',
    startDateLabel: start && end ? formatDateRange(start, end) : 'Fecha',
    earlyBirdPrice: event.earlyBirdPrice ?? event.price,
    earlyBirdActive:
      event.earlyBirdPrice !== undefined && isEarlyBirdActive(deadline),
    earlyBirdDeadlineLabel: deadline ? formatShortDate(deadline) : '',
    price: event.price,
    currency: event.currency,
    image: imageUrl,
    imageWidth: 800,
    imageHeight: 600,
    tags: event.tags,
  };
}
