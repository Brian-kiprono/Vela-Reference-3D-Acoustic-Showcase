import { Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export interface CartItem {
  id: string;
  title: string;
  finishName: string;
  shellSwatch: string;
  cushionSwatch: string;
  engraving: string;
  unitPrice: number;
  quantity: number;
}

interface BagDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function BagDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: BagDrawerProps) {
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleCheckout = () => {
    setOrderConfirmed(true);
    onClearCart();
  };

  const handleClose = () => {
    setOrderConfirmed(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-label="Bag"
    >
      <div className="w-full max-w-md h-full bg-[#131720] text-slate-100 border-l border-white/12 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-amber-200" aria-hidden="true" />
            <h2 className="text-base font-semibold tracking-tight">Bag</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Close bag"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {orderConfirmed ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">Order #VL-2048 Confirmed</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Express studio dispatch scheduled.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-5 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm text-slate-400">Your bag is empty.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${item.shellSwatch} 50%, ${item.cushionSwatch} 50%)`,
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          {item.finishName}
                          {item.engraving ? ` · "${item.engraving}"` : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-white tabular-nums">
                      ${(item.quantity * item.unitPrice).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/8">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-slate-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium tabular-nums w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-slate-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && !orderConfirmed && (
          <div className="px-6 py-5 border-t border-white/10 space-y-4 bg-[#0F131B]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Shipping</span>
              <span className="text-slate-200">Free</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">${subtotal.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-white text-slate-950 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
