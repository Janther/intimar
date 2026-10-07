import { readdirSync, readFileSync } from 'node:fs';
import { format } from 'prettier';
import { describe, expect, it } from 'vitest';
import {
  emptyEvent,
  serializeEvent,
  slugify,
  validateEvent,
  type EventFile,
} from './event-file';

const EVENTS_DIR = new URL('../../data/events/', import.meta.url);

describe('serializeEvent', () => {
  // A PR from the panel must pass CI's Prettier check untouched, so the
  // output has to match the committed (Prettier-formatted) files exactly.
  for (const file of readdirSync(EVENTS_DIR)) {
    it(`reproduces ${file} byte for byte`, () => {
      const source = readFileSync(new URL(file, EVENTS_DIR), 'utf8');
      expect(serializeEvent(JSON.parse(source) as EventFile)).toBe(source);
    });
  }

  it('is already Prettier-formatted for long arrays and no early bird', async () => {
    const event: EventFile = {
      ...emptyEvent(),
      id: 'x',
      tags: [
        'una etiqueta bastante larga',
        'otra etiqueta larga',
        'y otra más para pasar el ancho',
      ],
      hostIds: ['antoine-lacoste', 'fernanda-pinochet', 'klaus-hott'],
    };
    const out = serializeEvent(event);
    expect(await format(out, { parser: 'json' })).toBe(out);
  });
});

describe('serializeEvent couple price', () => {
  it('writes couplePrice right after price, and omits it when unset', () => {
    const base = { ...emptyEvent(), id: 'x', price: 80000 };
    expect(serializeEvent({ ...base, couplePrice: 150000 })).toContain(
      '"price": 80000,\n  "couplePrice": 150000,\n  "currency"',
    );
    expect(serializeEvent(base)).not.toContain('couplePrice');
  });
});

describe('slugify', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('Un Portal al Erotismo Consciente')).toBe(
      'un-portal-al-erotismo-consciente',
    );
    expect(slugify('¡Respiración & Contacto!')).toBe('respiracion-contacto');
  });
});

describe('validateEvent', () => {
  const valid: EventFile = {
    ...emptyEvent(),
    id: 'taller',
    title: 'Taller',
    summary: 'Resumen',
    description: 'Descripción',
    location: 'Pirque',
    startDate: '2026-11-07',
    endDate: '2026-11-07',
    price: 80000,
    hostIds: ['klaus-hott'],
  };

  it('accepts a complete event', () => {
    expect(validateEvent(valid)).toEqual({});
  });

  it('flags missing fields in Spanish, but not a missing photo', () => {
    const errors = validateEvent(emptyEvent());
    expect(errors.title).toBe('Ponle un título al evento.');
    expect(errors.image).toBeUndefined();
  });

  it('accepts no couple price, rejects a non-positive one', () => {
    expect(validateEvent({ ...valid, couplePrice: undefined })).toEqual({});
    expect(validateEvent({ ...valid, couplePrice: 0 }).couplePrice).toBe(
      'El precio por pareja debe ser mayor que 0.',
    );
  });

  it('rejects an end date before the start', () => {
    const errors = validateEvent({ ...valid, endDate: '2026-11-01' });
    expect(errors.endDate).toBeDefined();
  });

  it('requires a cheaper early bird with a deadline before the event', () => {
    const errors = validateEvent({
      ...valid,
      earlyBirdPrice: 90000,
      earlyBirdDeadline: '2026-12-01',
    });
    expect(errors.earlyBirdPrice).toBeDefined();
    expect(errors.earlyBirdDeadline).toBeDefined();
  });
});
