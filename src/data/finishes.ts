export type BoxItemId = 'headphones' | 'case' | 'cable';

export interface ProductFinish {
  id: string;
  name: string;
  shortLabel: string;
  // Swatch dual tones
  shellSwatch: string;
  cushionSwatch: string;
  // 3D PBR material colors
  shellHex: string;
  metalHex: string;
  cushionHex: string;
  canopyHex: string;
  accentHex: string;
  // Studio UI palette tokens
  outerBg: string;
  stageSurface: string;
  tileSurface: string;
  tileActiveSurface: string;
  borderColor: string;
  borderActiveColor: string;
  railSurface: string;
  isLightStage: boolean;
  keyLightHex: string;
  rimLightHex: string;
}

export const VELA_FINISHES: ProductFinish[] = [
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    shortLabel: 'Slate',
    shellSwatch: '#2D3A4F',
    cushionSwatch: '#C9B18B',
    shellHex: '#28364A',
    metalHex: '#D5B88A',
    cushionHex: '#2A3342',
    canopyHex: '#2F3B4D',
    accentHex: '#E0C596',
    outerBg:
      'radial-gradient(120% 100% at 72% 18%, #2E3D56 0%, #192232 48%, #0E131D 100%)',
    stageSurface:
      'linear-gradient(135deg, rgba(46, 61, 86, 0.72) 0%, rgba(26, 36, 54, 0.84) 55%, rgba(19, 27, 41, 0.90) 100%)',
    tileSurface: 'rgba(255, 255, 255, 0.065)',
    tileActiveSurface: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.13)',
    borderActiveColor: 'rgba(224, 197, 150, 0.72)',
    railSurface: 'rgba(255, 255, 255, 0.05)',
    isLightStage: false,
    keyLightHex: '#FFF2DC',
    rimLightHex: '#78A6E8',
  },
  {
    id: 'alpine-sage',
    name: 'Alpine Sage',
    shortLabel: 'Sage',
    shellSwatch: '#4C645A',
    cushionSwatch: '#DCD8CE',
    shellHex: '#435B51',
    metalHex: '#D2D6D1',
    cushionHex: '#3A4A43',
    canopyHex: '#4A5F56',
    accentHex: '#C9D6CE',
    outerBg:
      'radial-gradient(120% 100% at 72% 18%, #3F574D 0%, #22332D 50%, #111B18 100%)',
    stageSurface:
      'linear-gradient(135deg, rgba(71, 96, 86, 0.72) 0%, rgba(38, 56, 49, 0.84) 55%, rgba(25, 38, 33, 0.90) 100%)',
    tileSurface: 'rgba(255, 255, 255, 0.07)',
    tileActiveSurface: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderActiveColor: 'rgba(220, 216, 206, 0.78)',
    railSurface: 'rgba(255, 255, 255, 0.055)',
    isLightStage: false,
    keyLightHex: '#F9F5EB',
    rimLightHex: '#8FC1AE',
  },
  {
    id: 'oxblood-bronze',
    name: 'Oxblood Bronze',
    shortLabel: 'Oxblood',
    shellSwatch: '#6D323B',
    cushionSwatch: '#D5A78F',
    shellHex: '#5E2932',
    metalHex: '#CFA088',
    cushionHex: '#442228',
    canopyHex: '#522830',
    accentHex: '#E0B59E',
    outerBg:
      'radial-gradient(120% 100% at 72% 18%, #5F2A33 0%, #34171D 50%, #180A0D 100%)',
    stageSurface:
      'linear-gradient(135deg, rgba(102, 46, 56, 0.72) 0%, rgba(58, 25, 31, 0.84) 55%, rgba(36, 15, 20, 0.90) 100%)',
    tileSurface: 'rgba(255, 255, 255, 0.065)',
    tileActiveSurface: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.13)',
    borderActiveColor: 'rgba(224, 181, 158, 0.75)',
    railSurface: 'rgba(255, 255, 255, 0.05)',
    isLightStage: false,
    keyLightHex: '#FFEFE5',
    rimLightHex: '#D88D96',
  },
  {
    id: 'warm-travertine',
    name: 'Warm Travertine',
    shortLabel: 'Travertine',
    shellSwatch: '#DDD6CA',
    cushionSwatch: '#8C7B6B',
    shellHex: '#D8D1C5',
    metalHex: '#A9967D',
    cushionHex: '#B8ADA0',
    canopyHex: '#C7BEB1',
    accentHex: '#8C7A65',
    outerBg:
      'radial-gradient(120% 100% at 72% 18%, #EAE4DA 0%, #D2C9BB 52%, #B4A999 100%)',
    stageSurface:
      'linear-gradient(135deg, rgba(244, 240, 233, 0.80) 0%, rgba(226, 219, 208, 0.86) 55%, rgba(209, 200, 187, 0.92) 100%)',
    tileSurface: 'rgba(20, 18, 16, 0.045)',
    tileActiveSurface: 'rgba(20, 18, 16, 0.10)',
    borderColor: 'rgba(20, 18, 16, 0.12)',
    borderActiveColor: 'rgba(20, 18, 16, 0.55)',
    railSurface: 'rgba(20, 18, 16, 0.04)',
    isLightStage: true,
    keyLightHex: '#FFF9F0',
    rimLightHex: '#D5C7B6',
  },
  {
    id: 'graphite-carbon',
    name: 'Graphite Carbon',
    shortLabel: 'Carbon',
    shellSwatch: '#23262B',
    cushionSwatch: '#6B727D',
    shellHex: '#202328',
    metalHex: '#9AA1AC',
    cushionHex: '#181A1E',
    canopyHex: '#25282E',
    accentHex: '#C2C8D1',
    outerBg:
      'radial-gradient(120% 100% at 72% 18%, #2C3037 0%, #181A1E 50%, #0B0C0E 100%)',
    stageSurface:
      'linear-gradient(135deg, rgba(44, 48, 55, 0.75) 0%, rgba(26, 29, 34, 0.86) 55%, rgba(17, 19, 23, 0.92) 100%)',
    tileSurface: 'rgba(255, 255, 255, 0.06)',
    tileActiveSurface: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderActiveColor: 'rgba(194, 200, 209, 0.72)',
    railSurface: 'rgba(255, 255, 255, 0.045)',
    isLightStage: false,
    keyLightHex: '#F4F7FC',
    rimLightHex: '#7A8CA8',
  },
];

export const VELA_PRICE = 649;

export interface BoxItemSpec {
  id: BoxItemId;
  label: string;
  detail: string;
}

export const BOX_ITEMS: BoxItemSpec[] = [
  {
    id: 'headphones',
    label: 'Headphones',
    detail: 'Vela Reference planar-magnetic headphones',
  },
  {
    id: 'case',
    label: 'Case',
    detail: 'Magnetic sleep folio',
  },
  {
    id: 'cable',
    label: 'Cable',
    detail: 'Lossless braided USB-C',
  },
];

export interface LineupProduct {
  id: string;
  title: string;
  spec: string;
  price: number;
  image: string;
  alt: string;
  boxTarget: BoxItemId;
}

export const STUDIO_LINEUP: LineupProduct[] = [
  {
    id: 'vela-reference',
    title: 'Vela Reference',
    spec: 'Planar-magnetic · 318g',
    price: 649,
    image: '/src/assets/images/vela_listening_room_1795687664092.jpg',
    alt: 'Vela Reference studio headphones on travertine pedestal',
    boxTarget: 'headphones',
  },
  {
    id: 'folio-cable-set',
    title: 'Travel Kit',
    spec: 'Folio Case · Braided USB-C',
    price: 129,
    image: '/src/assets/images/vela_accessories_kit_1795687664138.jpg',
    alt: 'Vela matte folio travel case and braided USB-C cable',
    boxTarget: 'case',
  },
  {
    id: 'planar-cushion-kit',
    title: 'Acoustic Cushions',
    spec: 'Magnetic · Woven Memory Foam',
    price: 89,
    image: '/src/assets/images/vela_driver_macro_1795687663420.jpg',
    alt: 'Precision anodized titanium acoustic driver assembly',
    boxTarget: 'headphones',
  },
];
