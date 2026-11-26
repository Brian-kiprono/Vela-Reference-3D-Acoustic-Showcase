import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import type { ProductFinish } from '../data/finishes';

const LISTENER_PORTRAIT_SRC = '/src/assets/images/hero_listener_portrait_1795687370598.jpg';

interface SculptedApertureProps {
  finish: ProductFinish;
  audioActive: boolean;
  onToggleAudioShowcase: () => void;
}

export function SculptedAperture({
  finish,
  audioActive,
  onToggleAudioShowcase,
}: SculptedApertureProps) {
  const isLight = finish.isLightStage;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[340px] lg:min-h-[460px] select-none">
      {/* Recessed Sculptural Acoustic Aperture Container */}
      <div className="relative w-[290px] sm:w-[320px] lg:w-[350px] h-[350px] sm:h-[390px] lg:h-[420px]">
        {/* Clipped Portrait Layer inside the Sculptural Acoustic Crest */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'url(#velaApertureClipObject)',
          }}
        >
          {/* Deep obsidian studio backing */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 42% 38%, ${finish.shellHex} 0%, #10141C 52%, #07090D 100%)`,
            }}
          />

          {/* Editorial Portrait of Listener Wearing Headphones */}
          {!imgFailed ? (
            <img
              src={LISTENER_PORTRAIT_SRC}
              alt="Listener in studio profile wearing Vela Reference headphones"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="relative w-full h-full object-cover object-[54%_22%] scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
              Vela Acoustic Chamber
            </div>
          )}

          {/* Finish-Harmonizing Studio Lighting Tint Overlay */}
          <div
            className="pointer-events-none absolute inset-0 transition-colors duration-500"
            style={{
              background: `radial-gradient(85% 75% at 72% 28%, ${finish.accentHex}38 0%, ${finish.shellHex}4D 52%, rgba(7,9,13,0.72) 100%)`,
              mixBlendMode: 'soft-light',
            }}
          />

          {/* Bottom Scrim & Recessed Vignette for Seamless Depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(82% 84% at 50% 48%, transparent 52%, rgba(0,0,0,0.72) 100%)',
            }}
          />
        </div>

        {/* SVG Architectural Bevel, Harmonic Petal & Recessed Inner Shadow Frame */}
        <svg
          viewBox="0 0 360 430"
          className="relative z-10 w-full h-full overflow-visible pointer-events-none drop-shadow-[0_24px_36px_rgba(0,0,0,0.32)]"
          aria-hidden="true"
        >
          <defs>
            {/* ObjectBoundingBox clip path for responsive HTML img masking */}
            <clipPath id="velaApertureClipObject" clipPathUnits="objectBoundingBox">
              <path d="M0.5,0.074 C0.689,0.074 0.856,0.181 0.906,0.358 C0.956,0.535 0.889,0.740 0.717,0.856 C0.656,0.895 0.589,0.902 0.5,0.902 C0.411,0.902 0.344,0.895 0.283,0.856 C0.111,0.740 0.044,0.535 0.094,0.358 C0.144,0.181 0.311,0.074 0.5,0.074 Z" />
            </clipPath>

            <clipPath id="velaApertureClip">
              <path d="M180,32 C248,32 308,78 326,154 C344,230 320,318 258,368 C236,385 212,388 180,388 C148,388 124,385 102,368 C40,318 16,230 34,154 C52,78 112,32 180,32 Z" />
            </clipPath>

            <radialGradient id="petalDepthGrad" cx="42%" cy="38%" r="68%">
              <stop offset="0%" stopColor={finish.shellHex} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#090C12" stopOpacity="1" />
            </radialGradient>

            <linearGradient id="bevelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.32)'}
              />
              <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
              <stop
                offset="100%"
                stopColor={isLight ? 'rgba(30,26,22,0.28)' : 'rgba(0,0,0,0.68)'}
              />
            </linearGradient>
          </defs>

          {/* Top-right floating harmonic petal accent */}
          <path
            d="M214,6 C244,6 266,24 274,46 C250,52 224,42 206,24 C203,14 206,6 214,6 Z"
            fill="url(#petalDepthGrad)"
            stroke="url(#bevelRimGrad)"
            strokeWidth="1.5"
            opacity="0.92"
          />

          {/* Subtle Acoustic Wavefront Rings when Spatial Preview is active */}
          <g clipPath="url(#velaApertureClip)">
            {audioActive && (
              <g className="animate-wave-ring origin-[145px_175px]">
                <circle
                  cx="145"
                  cy="175"
                  r="95"
                  fill="none"
                  stroke={finish.accentHex}
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                  strokeDasharray="5 9"
                />
                <circle
                  cx="145"
                  cy="175"
                  r="132"
                  fill="none"
                  stroke={finish.metalHex}
                  strokeOpacity="0.22"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Inner shadow lip for authentic recessed aperture depth */}
            <path
              d="M180,32 C248,32 308,78 326,154 C344,230 320,318 258,368 C236,385 212,388 180,388 C148,388 124,385 102,368 C40,318 16,230 34,154 C52,78 112,32 180,32 Z"
              fill="none"
              stroke="rgba(0,0,0,0.62)"
              strokeWidth="14"
            />
          </g>

          {/* Crisp outer bevel stroke */}
          <path
            d="M180,32 C248,32 308,78 326,154 C344,230 320,318 258,368 C236,385 212,388 180,388 C148,388 124,385 102,368 C40,318 16,230 34,154 C52,78 112,32 180,32 Z"
            fill="none"
            stroke="url(#bevelRimGrad)"
            strokeWidth="2"
          />
        </svg>

        {/* Bottom-Center Tactile Pearl Orb Control (Interactive Soundstage & Orbit Toggle) */}
        <button
          type="button"
          onClick={onToggleAudioShowcase}
          aria-pressed={audioActive}
          title={audioActive ? 'Stop spatial audio preview' : 'Preview spatial audio & 360° orbit'}
          className="group z-20 absolute left-1/2 bottom-[14px] -translate-x-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            background: audioActive
              ? `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${finish.accentHex} 62%, ${finish.shellHex} 100%)`
              : 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E7E5E0 62%, #B9B4AC 100%)',
            boxShadow: audioActive
              ? `0 0 24px ${finish.accentHex}66, 0 8px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.9)`
              : '0 8px 18px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255,255,255,0.9)',
          }}
        >
          {audioActive ? (
            <Volume2 className="w-4 h-4 text-slate-900" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-700 opacity-75 group-hover:opacity-100" aria-hidden="true" />
          )}
          <span className="sr-only">
            {audioActive ? 'Pause spatial preview' : 'Play spatial audio preview'}
          </span>
        </button>
      </div>
    </div>
  );
}
