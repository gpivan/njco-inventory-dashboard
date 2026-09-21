/* ============ NJ&CO — shared UI primitives ============ */
import { useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { imageSrc } from '../images';
import { SIZES, STATUS_LABEL, TONES, sizeStatus, salesStatus, SALES_LABEL, SALES_BADGE_CLS } from '../data';
import type { Product, Size, Status } from '../types';

const PREVIEW = 320;
const PREVIEW_GAP = 14;

// A large hover preview of the product shot, rendered in a portal so table cells and
// rounded thumbs can't clip it. Prefers the right of the thumb, flips left if it won't fit.
function ThumbPreview({ rect, src, alt }: { rect: DOMRect; src: string; alt: string }) {
  const fitsRight = rect.right + PREVIEW_GAP + PREVIEW <= window.innerWidth - 8;
  const left = fitsRight ? rect.right + PREVIEW_GAP : Math.max(8, rect.left - PREVIEW_GAP - PREVIEW);
  const top = Math.min(Math.max(8, rect.top + rect.height / 2 - PREVIEW / 2), window.innerHeight - PREVIEW - 8);
  return createPortal(
    <div className="thumb-preview" style={{ left, top, width: PREVIEW, height: PREVIEW }}>
      <img src={src.replace(/sz=w\d+/, 'sz=w1000')} alt={alt} referrerPolicy="no-referrer" />
    </div>,
    document.body,
  );
}

export function Thumb({ tone, label, image, size = 46, radius, preview = true }: { tone: Product['tone']; label: string; image?: string; size?: number | string; radius?: number; preview?: boolean }) {
  const bg = TONES[tone] || TONES.beige;
  const src = imageSrc(image);
  // remember which src failed so a changed link gets a fresh attempt
  const [failed, setFailed] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const showImg = !!src && failed !== src;
  const canPreview = preview && showImg;
  return (
    <div
      className={'thumb' + (showImg ? ' has-img' : '')}
      style={{ width: size, height: size, background: bg, borderRadius: radius }}
      onMouseEnter={canPreview ? (e) => setRect(e.currentTarget.getBoundingClientRect()) : undefined}
      onMouseLeave={canPreview ? () => setRect(null) : undefined}
    >
      {showImg ? (
        <img src={src} alt={label} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(src)} />
      ) : (
        <span className="lab">{label}</span>
      )}
      {canPreview && rect && <ThumbPreview rect={rect} src={src} alt={label} />}
    </div>
  );
}

export function Badge({ status }: { status: Status }) {
  const cls = status === 'ok' ? 'ok' : status === 'low' ? 'low' : 'out';
  return (
    <span className={'badge ' + cls}>
      <span className="b-dot"></span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SalesBadge({ p }: { p: Product }) {
  const s = salesStatus(p);
  return (
    <span className={'badge ' + SALES_BADGE_CLS[s]}>
      <span className="b-dot"></span>
      {SALES_LABEL[s]}
    </span>
  );
}

// inline progress bar with % label
export function Progress({ pct, width = 110 }: { pct: number; width?: number }) {
  const v = Math.min(100, Math.round(pct));
  const tone = pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--terracotta)' : 'var(--amber)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: width }}>
      <div className="pbar" style={{ flex: 1, marginTop: 0, height: 7 }}>
        <i style={{ width: v + '%', background: tone } as CSSProperties}></i>
      </div>
      <b style={{ fontSize: 12.5, fontWeight: 700, minWidth: 34, textAlign: 'right', color: 'var(--ink-2)' }}>
        {Math.round(pct)}%
      </b>
    </div>
  );
}

// Size pills: kind 'stock' uses on-hand status coloring; 'sold' is neutral
export function SizePills({ p, kind = 'stock' }: { p: Product; kind?: 'stock' | 'sold' }) {
  return (
    <div className="sizes">
      {SIZES.map((sz) => {
        if (kind === 'sold') {
          return (
            <div key={sz} className="pill sold">
              <span className="k">{sz}</span>
              <span className="v">{p.sold[sz]}</span>
            </div>
          );
        }
        const onHand = p.stock[sz];
        const st = sizeStatus(onHand);
        return (
          <div key={sz} className={'pill ' + (st === 'ok' ? 'ok' : st === 'low' ? 'low' : 'out')}>
            <span className="k">{sz}</span>
            <span className="v">{onHand}</span>
          </div>
        );
      })}
    </div>
  );
}

// compact horizontal pills for mobile
export function MiniPills({ p }: { p: Product }) {
  return (
    <div className="sizes" style={{ minWidth: 0 }}>
      {SIZES.map((sz) => {
        const st = sizeStatus(p.stock[sz]);
        return (
          <div key={sz} className={'pill ' + (st === 'ok' ? 'ok' : st === 'low' ? 'low' : 'out')} style={{ minWidth: 30 }}>
            <span className="k">{sz}</span>
            <span className="v">{p.stock[sz]}</span>
          </div>
        );
      })}
    </div>
  );
}

// tight size-trio cell for inventory (Stock / Sold / Remaining rows of pills)
export function SizeRow({ p, kind }: { p: Product; kind: 'stocked' | 'sold' | 'remaining' }) {
  return (
    <div className="sizerow">
      {SIZES.map((sz: Size) => {
        let val: number;
        let st: Status | 'neutral' = 'neutral';
        if (kind === 'stocked') {
          val = p.stock[sz] + p.sold[sz];
        } else if (kind === 'sold') {
          val = p.sold[sz];
        } else {
          val = p.stock[sz];
          st = sizeStatus(val);
        } // remaining
        const cls = kind === 'remaining' ? (st === 'ok' ? 'ok' : st === 'low' ? 'low' : 'out') : 'sold';
        return (
          <div key={sz} className={'minipill ' + cls}>
            <span className="k">{sz}</span>
            <span className="v">{val}</span>
          </div>
        );
      })}
    </div>
  );
}
