import type { App } from 'vue';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

// Aura's default "primary" is emerald green, which clashes with the site's
// warm terracotta palette (visible on Carousel dots, focus rings, selected
// MultiSelect chips). Swapping in a terracotta ramp keeps PrimeVue's own
// interactive chrome consistent with the buttons we style by hand.
const TantraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf6ef',
      100: '#f8e8d6',
      200: '#f0cca3',
      300: '#e3a86e',
      400: '#d0824a',
      500: '#c2703d',
      600: '#a85a30',
      700: '#8a4726',
      800: '#6b371f',
      900: '#4a2717',
      950: '#2e180e',
    },
  },
});

// PrimeVue's own internal strings (filter/search messages, ARIA labels)
// default to English and don't follow the page's own copy — the site is
// es-CL only, so these need to be set explicitly.
const localeEsCl = {
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  dateFormat: 'dd/mm/yy',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Fuerte',
  passwordPrompt: 'Ingresa una contraseña',
  emptyFilterMessage: 'No se encontraron resultados',
  searchMessage: '{0} resultados disponibles',
  selectionMessage: '{0} elementos seleccionados',
  emptySelectionMessage: 'Ningún elemento seleccionado',
  emptySearchMessage: 'No se encontraron resultados',
  emptyMessage: 'No hay opciones disponibles',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar',
  completed: 'Completado',
  pending: 'Pendiente',
  fileChosenMessage: '{0} archivos',
  noFileChosenMessage: 'Ningún archivo seleccionado',
  fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  dayNames: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthNamesShort: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
  aria: {
    close: 'Cerrar',
    previous: 'Anterior',
    next: 'Siguiente',
    navigation: 'Navegación',
    selectAll: 'Seleccionar todo',
    unselectAll: 'Deseleccionar todo',
    slide: 'Diapositiva',
    slideNumber: '{slideNumber}',
  },
};

// Runs once per Vue island Astro hydrates. Registers PrimeVue on
// every component tree so imported components (Dialog, Carousel, etc.)
// work without repeating this setup in each island.
export default (app: App) => {
  app.use(PrimeVue, {
    theme: {
      preset: TantraPreset,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
    locale: localeEsCl,
  });
};
