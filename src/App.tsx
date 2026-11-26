import {
  ArrowUpRight,
  Check,
  Layers,
  RotateCcw,
  ShoppingBag,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BagDrawer, type CartItem } from './components/BagDrawer';
import { BoxThumbnail } from './components/BoxThumbnails';
import { HeroCanvas3D } from './components/HeroCanvas3D';
import { SculptedAperture } from './components/SculptedAperture';
import {
  BOX_ITEMS,
  type BoxItemId,
  type LineupProduct,
  STUDIO_LINEUP,
  VELA_FINISHES,
  VELA_PRICE,
} from './data/finishes';
import { acousticPreview } from './utils/soundPreview';

const DRIVER_MACRO_SRC = '/src/assets/images/vela_driver_macro_1795687663420.jpg';
const LISTENING_ROOM_SRC = '/src/assets/images/vela_listening_room_1795687664092.jpg';

export default function App() {
  const [selectedFinishId, setSelectedFinishId] = useState<string>(VELA_FINISHES[0].id);
  const [engravingEnabled, setEngravingEnabled] = useState<boolean>(false);
  const [engravingText, setEngravingText] = useState<string>('STUDIO 01');
  const [activeBoxItem, setActiveBoxItem] = useState<BoxItemId>('headphones');
  const [exploded, setExploded] = useState<boolean>(false);
  const [audioShowcase, setAudioShowcase] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [bagOpen, setBagOpen] = useState<boolean>(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Subtle 3D stage perspective tilt responding to pointer position
  const [stageTilt, setStageTilt] = useState<{ rx: number; ry: number }>({ rx: 0.8, ry: -1.2 });

  const finish =
    VELA_FINISHES.find((f) => f.id === selectedFinishId) ?? VELA_FINISHES[0];
  const isLight = finish.isLightStage;

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setStageTilt({ rx: 0, ry: 0 });
      return;
    }

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setStageTilt({
        rx: -ny * 1.5,
        ry: nx * 1.9,
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    return () => {
      acousticPreview.stop();
    };
  }, []);

  const handleToggleAudioShowcase = () => {
    const active = acousticPreview.toggle();
    setAudioShowcase(active);
  };

  const activeEngraving = engravingEnabled ? engravingText.trim() : '';

  const addConfiguredItem = (
    productId: string,
    title: string,
    unitPrice: number,
    includeEngraving: boolean,
  ) => {
    const engrave = includeEngraving ? activeEngraving.toUpperCase() : '';
    const itemKey = `${productId}__${finish.id}__${engrave}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.id === itemKey ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          title,
          finishName: finish.name,
          shellSwatch: finish.shellSwatch,
          cushionSwatch: finish.cushionSwatch,
          engraving: engrave,
          unitPrice,
          quantity: 1,
        },
      ];
    });
    setJustAddedId(productId);
    window.setTimeout(() => setJustAddedId(null), 1300);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleInspectInHero = (target: BoxItemId, explodeDrivers = false) => {
    setActiveBoxItem(target);
    setExploded(explodeDrivers);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLineupAdd = (product: LineupProduct) => {
    addConfiguredItem(
      product.id,
      product.title,
      product.price,
      product.id === 'vela-reference',
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Contrast-calibrated ink classes
  const primaryText = isLight ? 'text-[#161412]' : 'text-[#F8FAFC]';
  const secondaryText = isLight ? 'text-[#443F39]' : 'text-white/75';
  const mutedText = isLight ? 'text-[#665F56]' : 'text-white/55';
  const dividerBorder = isLight ? 'border-[#161412]/12' : 'border-white/12';

  return (
    <div
      id="top"
      className="min-h-screen transition-colors duration-500 selection:bg-amber-200 selection:text-slate-900"
      style={{ background: finish.outerBg }}
    >
      {/* SECTION 1: 3D HERO STAGE */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-12 py-8 lg:py-10 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-40"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 100%, rgba(0,0,0,0.65) 0%, transparent 100%)',
          }}
        />

        {/* 3D Perspective Frosted Hero Slab */}
        <div
          className="relative w-full max-w-[1260px] rounded-[28px] overflow-hidden transition-transform duration-300 ease-out"
          style={{
            background: finish.stageSurface,
            border: `1px solid ${finish.borderColor}`,
            boxShadow: isLight
              ? '0 40px 90px -24px rgba(24, 20, 14, 0.32), 0 18px 40px -16px rgba(24, 20, 14, 0.16), inset 0 1px 0 rgba(255,255,255,0.65)'
              : '0 45px 100px -20px rgba(0, 0, 0, 0.65), 0 20px 45px -15px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
            transform: `perspective(1800px) rotateX(${stageTilt.rx}deg) rotateY(${stageTilt.ry}deg)`,
          }}
        >
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              {/* TOP BAR CONTRACT: 3 ZONES */}
              <header className="flex items-center justify-between gap-8 pb-6 lg:pb-8">
                <a
                  href="#top"
                  className={`inline-flex items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap shrink-0 ${primaryText}`}
                >
                  <svg
                    viewBox="0 0 28 28"
                    className="w-6 h-6 shrink-0"
                    aria-hidden="true"
                  >
                    <circle
                      cx="14"
                      cy="14"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity="0.35"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 10 L14 19 L19 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Vela</span>
                </a>

                <nav
                  className={`hidden md:flex items-center gap-8 text-xs sm:text-sm font-medium ${secondaryText}`}
                  aria-label="Primary navigation"
                >
                  <a
                    href="#sound"
                    className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-opacity hover:opacity-100"
                  >
                    Sound
                  </a>
                  <a
                    href="#craft"
                    className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-opacity hover:opacity-100"
                  >
                    Craft
                  </a>
                  <a
                    href="#lineup"
                    className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-opacity hover:opacity-100"
                  >
                    Lineup
                  </a>
                  <a
                    href="#in-the-box"
                    className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-opacity hover:opacity-100"
                  >
                    Box
                  </a>
                </nav>

                <button
                  type="button"
                  onClick={() => setBagOpen(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                    isLight
                      ? 'bg-[#161412] text-white hover:bg-[#2C2824]'
                      : 'bg-white text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="tabular-nums">Bag ({totalItems})</span>
                </button>
              </header>

              {/* HERO 3-COLUMN SPATIAL GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
                {/* LEFT COLUMN: ULTRA-MINIMAL CONFIGURATOR */}
                <div className="lg:col-span-4 space-y-5 z-10">
                  <div
                    className="px-5 py-4 rounded-2xl"
                    style={{
                      background: finish.tileSurface,
                      border: `1px solid ${finish.borderColor}`,
                    }}
                  >
                    <h1
                      className={`text-3xl sm:text-4xl xl:text-[42px] font-bold tracking-tight leading-[1.08] text-balance ${primaryText}`}
                    >
                      Vela Reference
                    </h1>
                  </div>

                  <p className={`text-sm leading-relaxed ${secondaryText}`}>
                    Planar precision. Milled titanium. Zero fatigue.
                  </p>

                  {/* Finishes Matrix */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${primaryText}`}>Finishes</span>
                      <span className={mutedText}>{finish.name}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {VELA_FINISHES.map((item) => {
                        const active = item.id === finish.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedFinishId(item.id)}
                            aria-label={`Select ${item.name} finish`}
                            aria-pressed={active}
                            className="h-14 rounded-xl flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            style={{
                              background: active
                                ? finish.tileActiveSurface
                                : finish.tileSurface,
                              border: `1px solid ${
                                active ? finish.borderActiveColor : finish.borderColor
                              }`,
                            }}
                          >
                            <span
                              className="w-6 h-6 rounded-full shadow-sm transition-transform duration-200"
                              style={{
                                background: `linear-gradient(135deg, ${item.shellSwatch} 50%, ${item.cushionSwatch} 50%)`,
                                border: active
                                  ? '2px solid rgba(255,255,255,0.85)'
                                  : '1px solid rgba(255,255,255,0.28)',
                                transform: active ? 'scale(1.1)' : 'scale(1)',
                              }}
                            />
                          </button>
                        );
                      })}

                      {/* 6th Tile: Price & Buy CTA */}
                      <div
                        className="h-14 rounded-xl px-2.5 py-1.5 flex flex-col items-center justify-center gap-1"
                        style={{
                          background: finish.tileSurface,
                          border: `1px solid ${finish.borderColor}`,
                        }}
                      >
                        <span
                          className={`text-sm font-bold leading-none tabular-nums ${primaryText}`}
                        >
                          ${VELA_PRICE}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            addConfiguredItem(
                              'vela-reference',
                              'Vela Reference',
                              VELA_PRICE,
                              true,
                            )
                          }
                          className={`w-full py-1 rounded-md text-[11px] font-semibold leading-none transition-colors whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-1 ${
                            isLight
                              ? 'bg-[#161412] text-white hover:bg-[#2F2B26]'
                              : 'bg-white text-slate-950 hover:bg-slate-200'
                          }`}
                        >
                          {justAddedId === 'vela-reference' ? (
                            <>
                              <Check className="w-3 h-3" aria-hidden="true" />
                              <span>Added</span>
                            </>
                          ) : (
                            <span>Buy</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Personalization */}
                  <div className="space-y-2 pt-1">
                    <p className={`text-xs font-semibold ${primaryText}`}>
                      Personalize
                    </p>

                    <div className="space-y-2">
                      <div
                        className="rounded-xl transition-all duration-200"
                        style={{
                          background: engravingEnabled
                            ? finish.tileActiveSurface
                            : finish.tileSurface,
                          border: `1px solid ${
                            engravingEnabled
                              ? finish.borderActiveColor
                              : finish.borderColor
                          }`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setEngravingEnabled(true)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left"
                        >
                          <span className={`text-xs font-semibold ${primaryText}`}>
                            Add Engraving
                          </span>
                          <span className={`text-xs font-medium ${secondaryText}`}>
                            Free
                          </span>
                        </button>

                        {engravingEnabled && (
                          <div className="px-3.5 pb-3 pt-0.5">
                            <input
                              type="text"
                              value={engravingText}
                              maxLength={14}
                              onChange={(e) => setEngravingText(e.target.value)}
                              placeholder="Monogram"
                              aria-label="Custom laser engraving text"
                              className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider outline-none transition-colors ${
                                isLight
                                  ? 'bg-white/75 text-[#161412] placeholder:text-[#787066] border border-[#161412]/15 focus:border-[#161412]/50'
                                  : 'bg-black/30 text-white placeholder:text-white/35 border border-white/15 focus:border-white/50'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setEngravingEnabled(false)}
                        className="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left transition-all duration-200"
                        style={{
                          background: !engravingEnabled
                            ? finish.tileActiveSurface
                            : finish.tileSurface,
                          border: `1px solid ${
                            !engravingEnabled
                              ? finish.borderActiveColor
                              : finish.borderColor
                          }`,
                        }}
                      >
                        <span className={`text-xs font-semibold ${primaryText}`}>
                          No Engraving
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* CENTER COLUMN: SCULPTED APERTURE WITH LISTENER PORTRAIT */}
                <div className="lg:col-span-4 flex items-center justify-center relative">
                  <SculptedAperture
                    finish={finish}
                    audioActive={audioShowcase}
                    onToggleAudioShowcase={handleToggleAudioShowcase}
                  />
                </div>

                {/* RIGHT COLUMN: REAL-TIME 3D PRODUCT + IN THE BOX */}
                <div className="lg:col-span-4 flex flex-col justify-between h-full">
                  <div className="relative h-[320px] sm:h-[360px] lg:h-[380px] w-full">
                    <HeroCanvas3D
                      finish={finish}
                      engraving={activeEngraving}
                      activeBoxItem={activeBoxItem}
                      exploded={exploded}
                      autoShowcase={audioShowcase}
                      resetTrigger={resetTrigger}
                    />
                  </div>

                  <div id="in-the-box" className="space-y-2.5 pt-2 z-10">
                    <p className={`text-[11px] font-semibold ${primaryText}`}>
                      In the Box
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {BOX_ITEMS.map((boxItem) => {
                        const active = activeBoxItem === boxItem.id;
                        return (
                          <button
                            key={boxItem.id}
                            type="button"
                            onClick={() => setActiveBoxItem(boxItem.id)}
                            aria-pressed={active}
                            title={boxItem.detail}
                            className="p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-200"
                            style={{
                              background: active
                                ? finish.tileActiveSurface
                                : finish.tileSurface,
                              border: `1px solid ${
                                active ? finish.borderActiveColor : finish.borderColor
                              }`,
                            }}
                          >
                            <BoxThumbnail item={boxItem.id} finish={finish} />
                            <span
                              className={`text-[10px] font-medium whitespace-nowrap truncate max-w-full ${secondaryText}`}
                            >
                              {boxItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIM INTEGRATED RIGHT ACTION RAIL */}
            <aside
              className={`lg:w-14 flex lg:flex-col items-center justify-between px-6 py-3 lg:px-0 lg:py-8 border-t lg:border-t-0 lg:border-l ${dividerBorder}`}
              style={{ background: finish.railSurface }}
              aria-label="3D Viewport Tools"
            >
              <button
                type="button"
                onClick={() => {
                  setActiveBoxItem('headphones');
                  setExploded((prev) => !prev);
                }}
                aria-pressed={exploded}
                title={exploded ? 'Assemble earcups' : 'Explode planar drivers'}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  exploded
                    ? isLight
                      ? 'bg-[#161412] text-white'
                      : 'bg-white text-slate-950'
                    : `${secondaryText} hover:bg-white/10`
                }`}
              >
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Toggle exploded planar driver view</span>
              </button>

              <div className="flex lg:flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleAudioShowcase}
                  aria-pressed={audioShowcase}
                  title={audioShowcase ? 'Mute spatial preview' : 'Play spatial preview'}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    audioShowcase
                      ? isLight
                        ? 'bg-[#161412] text-white'
                        : 'bg-white text-slate-950'
                      : `${secondaryText} hover:bg-white/10`
                  }`}
                >
                  {audioShowcase ? (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">Toggle spatial audio preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExploded(false);
                    setActiveBoxItem('headphones');
                    setResetTrigger((n) => n + 1);
                  }}
                  title="Reset 3D view"
                  className={`p-2.5 rounded-xl transition-colors hover:bg-white/10 ${secondaryText}`}
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Reset 3D view</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* SECTION 2: ACOUSTIC PRECISION (ULTRA-MINIMAL SPLIT) */}
      <section
        id="sound"
        className={`max-w-[1260px] mx-auto px-6 sm:px-10 py-20 lg:py-28 border-t ${dividerBorder}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <div
              className="aspect-[4/3] w-full rounded-3xl overflow-hidden"
              style={{ border: `1px solid ${finish.borderColor}` }}
            >
              {!brokenImages.macro ? (
                <img
                  src={DRIVER_MACRO_SRC}
                  alt="CNC-milled titanium earcup and copper planar-magnetic driver"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, macro: true }))
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-sm ${mutedText}`}
                  style={{ background: finish.tileSurface }}
                >
                  40mm Planar-Magnetic Assembly
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2
                className={`text-3xl sm:text-4xl font-bold tracking-tight text-balance ${primaryText}`}
              >
                Pure planar clarity.
              </h2>
              <p className={`text-base ${secondaryText}`}>
                2-micron diaphragm. Zero distortion.
              </p>
            </div>

            <div className={`grid grid-cols-3 gap-4 pt-6 border-t ${dividerBorder}`}>
              <div>
                <p className={`text-lg sm:text-xl font-semibold tabular-nums ${primaryText}`}>
                  6–48 kHz
                </p>
                <p className={`text-xs mt-1 ${mutedText}`}>Response</p>
              </div>
              <div>
                <p className={`text-lg sm:text-xl font-semibold tabular-nums ${primaryText}`}>
                  0.08%
                </p>
                <p className={`text-xs mt-1 ${mutedText}`}>Distortion</p>
              </div>
              <div>
                <p className={`text-lg sm:text-xl font-semibold tabular-nums ${primaryText}`}>
                  38 hrs
                </p>
                <p className={`text-xs mt-1 ${mutedText}`}>Playback</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleInspectInHero('headphones', true)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isLight
                  ? 'bg-[#161412] text-white hover:bg-[#2C2824]'
                  : 'bg-white text-slate-950 hover:bg-slate-200'
              }`}
            >
              <span>Inspect 3D drivers</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: ARCHITECTURAL SILENCE */}
      <section
        id="craft"
        className="max-w-[1260px] mx-auto px-6 sm:px-10 pb-20 lg:pb-28"
      >
        <div
          className="relative aspect-[16/9] min-h-[340px] w-full rounded-3xl overflow-hidden"
          style={{ border: `1px solid ${finish.borderColor}` }}
        >
          {!brokenImages.room ? (
            <img
              src={LISTENING_ROOM_SRC}
              alt="Minimalist architectural listening room with Vela Reference headphones"
              referrerPolicy="no-referrer"
              onError={() =>
                setBrokenImages((prev) => ({ ...prev, room: true }))
              }
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: finish.tileSurface }}
            />
          )}

          {/* Measured contrast scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white text-balance">
                Silence, sculpted.
              </h2>
              <p className="text-sm sm:text-base text-white/75">
                Adaptive eight-mic isolation.
              </p>
            </div>

            <a
              href="#top"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <span>Configure</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4: STUDIO LINEUP (3-COLUMN RETAIL GRID) */}
      <section
        id="lineup"
        className={`max-w-[1260px] mx-auto px-6 sm:px-10 py-20 lg:py-24 border-t ${dividerBorder}`}
      >
        <div className="flex items-end justify-between gap-6 pb-10">
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${primaryText}`}>
            Studio Lineup
          </h2>
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            className={`text-xs font-semibold hover:underline underline-offset-4 whitespace-nowrap shrink-0 ${secondaryText}`}
          >
            View Bag ({totalItems})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STUDIO_LINEUP.map((product) => {
            const added = justAddedId === product.id;
            return (
              <article
                key={product.id}
                className="group rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: finish.tileSurface,
                  border: `1px solid ${finish.borderColor}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleInspectInHero(product.boxTarget, false)}
                  className="aspect-[4/3] w-full overflow-hidden text-left"
                  aria-label={`Inspect ${product.title} in 3D`}
                >
                  {!brokenImages[product.id] ? (
                    <img
                      src={product.image}
                      alt={product.alt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [product.id]: true,
                        }))
                      }
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-xs ${mutedText}`}
                    >
                      {product.title}
                    </div>
                  )}
                </button>

                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className={`text-base font-semibold truncate ${primaryText}`}>
                      {product.title}
                    </h3>
                    <p className={`text-xs mt-0.5 truncate ${mutedText}`}>
                      {product.spec}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-semibold tabular-nums ${primaryText}`}>
                      ${product.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLineupAdd(product)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                        isLight
                          ? 'bg-[#161412] text-white hover:bg-[#2C2824]'
                          : 'bg-white text-slate-950 hover:bg-slate-200'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-3 h-3" aria-hidden="true" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer
        className={`max-w-[1260px] mx-auto px-6 sm:px-10 py-8 border-t ${dividerBorder} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${mutedText}`}
      >
        <p>© 2026 Vela Acoustics</p>
        <div className="flex items-center gap-5">
          {VELA_FINISHES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFinishId(item.id)}
              className={`hover:underline underline-offset-4 transition-colors ${
                item.id === finish.id ? primaryText : ''
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
      </footer>

      <BagDrawer
        open={bagOpen}
        items={cart}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
