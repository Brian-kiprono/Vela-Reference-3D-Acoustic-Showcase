import * as THREE from 'three';

/**
 * Generates a crisp micro-perforated acoustic grille texture for the inner earcup baffle.
 */
export function createAcousticMeshTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14161A';
  ctx.fillRect(0, 0, size, size);

  const spacing = 16;
  for (let y = spacing / 2; y < size; y += spacing) {
    const rowOffset = Math.floor(y / spacing) % 2 === 0 ? 0 : spacing / 2;
    for (let x = spacing / 2; x < size; x += spacing) {
      const px = (x + rowOffset) % size;
      // Subtle radial recess
      const grad = ctx.createRadialGradient(px, y, 0.5, px, y, 4.6);
      grad.addColorStop(0, '#050607');
      grad.addColorStop(0.75, '#0C0E12');
      grad.addColorStop(1, '#262A32');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, y, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a fine woven acoustic textile texture for the memory foam cushions and canopy.
 */
export function createWovenFabricTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#E4E4E4';
  ctx.fillRect(0, 0, size, size);

  const step = 4;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const odd = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = odd ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y, step - 1, step - 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a dynamic brushed titanium plaque texture displaying the live custom engraving.
 */
export function createEngravingTexture(
  text: string,
  baseHex: string,
  inkHex: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const width = 512;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal brushed grain
  for (let i = 0; i < 180; i++) {
    const y = (i / 180) * height;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, y, width, 1);
  }

  const clean = text.trim();
  if (clean.length > 0) {
    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Laser-etched shadow groove + subtle inner highlight
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillText(clean.toUpperCase(), width / 2, height / 2 + 1.5);
    ctx.fillStyle = inkHex;
    ctx.fillText(clean.toUpperCase(), width / 2, height / 2);
  } else {
    // Subtle minimalist acoustic mark when un-engraved
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillText('VELA  REFERENCE', width / 2, height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Soft radial contact shadow texture placed directly under floating 3D objects.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.04,
    size / 2,
    size / 2,
    size * 0.48,
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.22)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
