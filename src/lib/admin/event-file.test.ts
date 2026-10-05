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
    expect(validateEvent(valid, { hasImage: true })).toEqual({});
  });

  it('flags missing fields and the photo in Spanish', () => {
    const errors = validateEvent(emptyEvent(), { hasImage: false });
    expect(errors.title).toBe('Ponle un título al evento.');
    expect(errors.image).toBe('Sube una foto para el evento.');
  });

  it('rejects an end date before the start', () => {
    const errors = validateEvent(
      { ...valid, endDate: '2026-11-01' },
      { hasImage: true },
    );
    expect(errors.endDate).toBeDefined();
  });

  it('requires a cheaper early bird with a deadline before the event', () => {
    const errors = validateEvent(
      {
        ...valid,
        earlyBirdPrice: 90000,
        earlyBirdDeadline: '2026-12-01',
      },
      { hasImage: true },
    );
    expect(errors.earlyBirdPrice).toBeDefined();
    expect(errors.earlyBirdDeadline).toBeDefined();
  });
});
