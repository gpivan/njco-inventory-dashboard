/* ============ NJ&CO — modals + details drawer ============ */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../icons';
import { Thumb, Badge, SalesBadge } from '../components/shared';
import { CATEGORIES, formatStamp, SIZES, TONES, overallStatus, peso, sizeStatus, salesAmount, salesProgress, sumStock, sumSold, sumStocked } from '../data';
import { uploadImage } from '../api';
import { imageSrc, isDriveFolderLink, resizeToJpeg } from '../images';
import type { ActionType, Product, Size, Tone } from '../types';

function Modal({
  icon,
  title,
  sub,
  onClose,
  children,
  footer,
  max,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  max?: number | string;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={max ? { maxWidth: max } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="mh-ic">
            <Icon name={icon} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{title}</h2>
            <p>{sub}</p>
          </div>
          <button className="modal-x" onClick={onClose}>
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  );
}

export interface ProductFormValues {
  name: string;
  desc: string;
  brand: string;
  cat: string;
  tone: Tone;
  label: string;
  image: string;
  price: number | string;
  target: number | string;
  S: number | string;
  M: number | string;
  L: number | string;
  XL: number | string;
}

// ---------- Add / Edit product ----------
export function AddProductModal({
  onClose,
  onSave,
  editing,
  brands,
  defaultBrand,
}: {
  onClose: () => void;
  onSave: (f: ProductFormValues) => void;
  editing: Product | null;
  brands: string[];
  defaultBrand: string;
}) {
  const isEdit = !!editing;
  const [f, setF] = useState<ProductFormValues>(() =>
    isEdit
      ? {
          name: editing.name,
          desc: editing.desc,
          brand: editing.brand,
          cat: editing.cat,
          tone: editing.tone,
          label: editing.label,
          image: editing.image || '',
          price: editing.price,
          target: editing.target,
          S: editing.stock.S,
          M: editing.stock.M,
          L: editing.stock.L,
          XL: editing.stock.XL,
        }
      : { name: '', desc: '', brand: defaultBrand, cat: 'Sleepwear', tone: 'blush', label: 'product', image: '', price: '', target: '', S: '', M: '', L: '', XL: '' },
  );
  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) => setF((p) => ({ ...p, [k]: v }));
  const total = SIZES.reduce((s, z) => s + (parseInt(String(f[z])) || 0), 0);
  const [addingBrand, setAddingBrand] = useState(false);
  const valid = f.name.trim().length > 0 && f.brand.trim().length > 0;

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const previewSrc = imageSrc(f.image);
  const [brokenSrc, setBrokenSrc] = useState('');
  const showPreview = !!previewSrc && brokenSrc !== previewSrc;
  const folderLink = isDriveFolderLink(f.image.trim());

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadErr('Please choose a PNG or JPG image.');
      return;
    }
    setUploading(true);
    setUploadErr('');
    try {
      const { base64 } = await resizeToJpeg(file);
      const base = (f.name.trim() || file.name.replace(/\.[^.]+$/, '') || 'product').replace(/[^\w-]+/g, '-').toLowerCase();
      const url = await uploadImage(base64, `${base}-${Date.now()}.jpg`);
      set('image', url);
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" disabled={!valid || uploading} onClick={() => valid && !uploading && onSave(f)}>
        <Icon name="check" />
        {isEdit ? 'Save Changes' : 'Save Product'}
      </button>
    </>
  );

  return (
    <Modal
      icon={isEdit ? 'edit' : 'plus'}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      sub={isEdit ? 'Update the details for this item' : 'Add a new item to the NJ&CO catalogue'}
      onClose={onClose}
      footer={footer}
    >
      <div className="modal-hero">
        <div className="hero-img">
          <label>Product Image</label>
          <div
            className={'dropzone square' + (drag ? ' drag' : '') + (showPreview ? ' has-img' : '')}
            style={{ background: TONES[f.tone] }}
            role="button"
            tabIndex={0}
            onClick={() => !uploading && fileRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !uploading && fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              if (!uploading) handleFile(e.dataTransfer.files[0]);
            }}
          >
            {showPreview && <img src={previewSrc} alt="Product preview" referrerPolicy="no-referrer" onError={() => setBrokenSrc(previewSrc)} />}
            {uploading ? (
              <b>Uploading…</b>
            ) : showPreview ? (
              <span className="dz-over">
                <b>Replace</b>
              </span>
            ) : (
              <>
                <Icon name="upload" />
                <b>Upload</b>
                <span>PNG / JPG</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
          <div className="tone-row">
            {(Object.keys(TONES) as Tone[]).map((t) => (
              <button
                key={t}
                type="button"
                title={'Placeholder tone: ' + t}
                onClick={() => set('tone', t)}
                className={'tone-chip' + (f.tone === t ? ' on' : '')}
                style={{ background: TONES[t] }}
              />
            ))}
          </div>
        </div>
        <div className="hero-meta">
          <div className="field">
            <label>
              Product Name <span className="req">*</span>
            </label>
            <input className="input" placeholder="e.g. Pink Pajama Set" value={f.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>
              Brand <span className="req">*</span>
            </label>
            <div className="selectwrap">
              <select
                className="sel"
                style={{ width: '100%' }}
                value={addingBrand ? '__new__' : f.brand}
                onChange={(e) => {
                  const isNew = e.target.value === '__new__';
                  setAddingBrand(isNew);
                  set('brand', isNew ? '' : e.target.value);
                }}
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="__new__">+ Add new brand…</option>
              </select>
              <Icon name="chevdown" className="chev" />
            </div>
            {addingBrand && (
              <input className="input" style={{ marginTop: 8 }} placeholder="e.g. Laura Ashley" maxLength={80} value={f.brand} onChange={(e) => set('brand', e.target.value)} autoFocus />
            )}
          </div>
          <div className="field">
            <label>Category</label>
            <div className="selectwrap">
              <select className="sel" style={{ width: '100%' }} value={f.cat} onChange={(e) => set('cat', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <Icon name="chevdown" className="chev" />
            </div>
          </div>
          <div className="field">
            <label>
              Image URL <span className="field-hint" style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input className="input" placeholder="…or paste an image link" value={f.image} onChange={(e) => set('image', e.target.value)} />
            {folderLink && <div className="img-err">That's a folder link. Open the image in Drive, then use Share → Copy link on the file itself.</div>}
            {!folderLink && !!f.image.trim() && !showPreview && !uploading && (
              <div className="img-err">Couldn't load this image. For Google Drive, set the file to "Anyone with the link".</div>
            )}
            {uploadErr && <div className="img-err">{uploadErr}</div>}
            {f.image && (
              <button type="button" className="img-clear" onClick={() => set('image', '')}>
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="field">
        <label>Product Description</label>
        <textarea className="textarea" placeholder="Describe the fabric, fit and feel…" value={f.desc} onChange={(e) => set('desc', e.target.value)} />
      </div>
      <div className="two-col">
        <div className="field">
          <label>
            Price <span className="req">*</span>
          </label>
          <div className="money-input">
            <span className="cur">₱</span>
            <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={f.price} onChange={(e) => set('price', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>
            Target Sales <span className="field-hint" style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <div className="money-input">
            <span className="cur">₱</span>
            <input className="input" type="number" min="0" step="100" placeholder="0.00" value={f.target} onChange={(e) => set('target', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="field">
        <label>Initial Stock by Size</label>
        <div className="size-grid">
          {SIZES.map((sz) => (
            <div className="size-qty" key={sz}>
              <div className="sz">{sz}</div>
              <input type="number" min="0" placeholder="0" value={f[sz]} onChange={(e) => set(sz, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="field-hint">
          Total units to add: <b style={{ color: 'var(--ink)' }}>{total}</b>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Record Sale (oversell guard) ----------
export function RecordSaleModal({
  products,
  onClose,
  onSubmit,
  preselect,
}: {
  products: Product[];
  onClose: () => void;
  onSubmit: (pid: string, size: Size, qty: number) => void;
  preselect?: Product | null;
}) {
  const [pid, setPid] = useState(preselect ? preselect.id : products[0]?.id);
  const [size, setSize] = useState<Size>('S');
  const [qty, setQty] = useState('1');
  const p = products.find((x) => x.id === pid);
  const avail = p ? p.stock[size] : 0;
  const q = parseInt(qty) || 0;
  const over = q > avail;
  const okToSell = !!p && q > 0 && !over;

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" disabled={!okToSell} onClick={() => okToSell && onSubmit(pid!, size, q)}>
        <Icon name="sell" />
        Record Sale
      </button>
    </>
  );

  return (
    <Modal icon="sell" title="Record a Sale" sub="Log units sold — stock updates automatically" onClose={onClose} footer={footer}>
      <div className="field">
        <label>Product</label>
        <div className="selectwrap">
          <select className="sel" style={{ width: '100%' }} value={pid} onChange={(e) => setPid(e.target.value)}>
            {products.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <Icon name="chevdown" className="chev" />
        </div>
      </div>
      {p && (
        <div className="preview-strip">
          <Thumb tone={p.tone} label={p.label} image={p.image} size={48} />
          <div className="pi">
            <b>{p.name}</b>
            <span>
              {p.brand} · {p.cat} · {peso(p.price)} · {sumStock(p)} on hand
            </span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Badge status={overallStatus(p)} />
          </div>
        </div>
      )}
      <div className="two-col">
        <div className="field">
          <label>Size Sold</label>
          <div className="selectwrap">
            <select className="sel" style={{ width: '100%' }} value={size} onChange={(e) => setSize(e.target.value as Size)}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  Size {s} — {p ? p.stock[s] : 0} available
                </option>
              ))}
            </select>
            <Icon name="chevdown" className="chev" />
          </div>
        </div>
        <div className="field">
          <label>Quantity Sold</label>
          <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
      </div>
      <div className="calc-row">
        <div className="calc-box">
          <div className="cl">Unit Price</div>
          <div className="cv" style={{ fontSize: 22 }}>
            {p ? peso(p.price) : '₱0'}
          </div>
        </div>
        <div className="arrow">
          <Icon name="x" />
        </div>
        <div className="calc-box">
          <div className="cl">Quantity</div>
          <div className="cv" style={{ fontSize: 22 }}>
            {q}
          </div>
        </div>
        <div className="arrow">
          <Icon name="arrowright" />
        </div>
        <div className="calc-box fresh">
          <div className="cl">Sale Amount</div>
          <div className="cv" style={{ fontSize: 22 }}>
            {p ? peso(p.price * q) : '₱0'}
          </div>
        </div>
      </div>
      <div className="stock-note">
        <span className="sn-l">Available stock — Size {size}</span>
        <span className="sn-v" style={over ? { color: 'var(--red-ink)' } : undefined}>
          {avail}
        </span>
      </div>
      {over && (
        <div className="warn">
          <Icon name="lowstock" />
          <span>
            Only <b>{avail}</b> unit{avail === 1 ? '' : 's'} of size {size} in stock. You can't sell {q}. Reduce the quantity or restock first.
          </span>
        </div>
      )}
    </Modal>
  );
}

// ---------- Restock ----------
export function RestockModal({
  products,
  onClose,
  onSubmit,
  preselect,
}: {
  products: Product[];
  onClose: () => void;
  onSubmit: (pid: string, size: Size, qty: number) => void;
  preselect?: Product | null;
}) {
  const [pid, setPid] = useState(preselect ? preselect.id : products[0]?.id);
  const [size, setSize] = useState<Size>('S');
  const [qty, setQty] = useState('10');
  const p = products.find((x) => x.id === pid);
  const current = p ? p.stock[size] : 0;
  const q = parseInt(qty) || 0;
  const next = current + q;
  const ok = !!p && q > 0;

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose}>
        Cancel
      </button>
      <button className="btn btn-primary" disabled={!ok} onClick={() => ok && onSubmit(pid!, size, q)}>
        <Icon name="restock" />
        Update Stock
      </button>
    </>
  );

  return (
    <Modal icon="restock" title="Restock Product" sub="Add new units to a size's inventory" onClose={onClose} footer={footer}>
      <div className="field">
        <label>Product</label>
        <div className="selectwrap">
          <select className="sel" style={{ width: '100%' }} value={pid} onChange={(e) => setPid(e.target.value)}>
            {products.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <Icon name="chevdown" className="chev" />
        </div>
      </div>
      {p && (
        <div className="preview-strip" style={{ padding: '14px 14px 12px', gap: 14, flexDirection: 'row', alignItems: 'center' }}>
          <Thumb tone={p.tone} label={p.label} image={p.image} size={48} />
          <div className="pi">
            <b>{p.name}</b>
            <span>
              {p.brand} · {p.cat} · {peso(p.price)} · {sumStock(p)} on hand
            </span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Badge status={overallStatus(p)} />
          </div>
        </div>
      )}
      <div className="two-col">
        <div className="field">
          <label>Size to Restock</label>
          <div className="selectwrap">
            <select className="sel" style={{ width: '100%' }} value={size} onChange={(e) => setSize(e.target.value as Size)}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  Size {s}
                </option>
              ))}
            </select>
            <Icon name="chevdown" className="chev" />
          </div>
        </div>
        <div className="field">
          <label>Quantity to Add</label>
          <input className="input" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
      </div>
      <div className="calc-row">
        <div className="calc-box">
          <div className="cl">Current</div>
          <div className="cv">{current}</div>
        </div>
        <div className="arrow">
          <Icon name="arrowright" />
        </div>
        <div className="calc-box">
          <div className="cl">Adding</div>
          <div className="cv" style={{ color: 'var(--terracotta)' }}>
            +{q}
          </div>
        </div>
        <div className="arrow">
          <Icon name="arrowright" />
        </div>
        <div className="calc-box fresh">
          <div className="cl">New Stock</div>
          <div className="cv">{next}</div>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Details drawer ----------
export function DetailsDrawer({ p, onClose, on }: { p: Product; onClose: () => void; on: (type: ActionType, p: Product) => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const st = overallStatus(p);
  const totalStock = sumStock(p),
    totalSold = sumSold(p),
    totalStocked = sumStocked(p);
  const sellThrough = totalStocked ? Math.round((totalSold / totalStocked) * 100) : 0;
  const amt = salesAmount(p),
    salesPct = salesProgress(p),
    remainTarget = Math.max(0, p.target - amt);
  return (
    <>
      <div className="drawer-overlay" onClick={onClose}></div>
      <aside className="drawer">
        <div className="drawer-head">
          <h2>Product Details</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-soft" onClick={() => on('edit', p)}>
              <Icon name="edit" />
              Edit
            </button>
            <button className="modal-x" onClick={onClose}>
              <Icon name="x" />
            </button>
          </div>
        </div>
        <div className="drawer-body">
          <div className="detail-hero">
            <Thumb tone={p.tone} label={p.label} image={p.image} size={130} radius={16} preview={false} />
            <div className="meta">
              <h1>{p.name}</h1>
              <p className="d">{p.desc}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="cat-chip">{p.brand}</span>
                <span className="cat-chip">{p.cat}</span>
                <Badge status={st} />
                <span className="price-chip">{peso(p.price)}</span>
              </div>
            </div>
          </div>

          <div className="kv-grid">
            <div className="kv">
              <div className="k">Total Remaining</div>
              <div className="v big">{totalStock}</div>
            </div>
            <div className="kv">
              <div className="k">Total Sold</div>
              <div className="v big">{totalSold}</div>
            </div>
            <div className="kv">
              <div className="k">Date Added</div>
              <div className="v">{formatStamp(p.added)}</div>
            </div>
            <div className="kv">
              <div className="k">Last Updated</div>
              <div className="v">{formatStamp(p.updated)}</div>
            </div>
          </div>

          <div>
            <p className="sec-title" style={{ marginBottom: 10 }}>
              Sales &amp; Target
            </p>
            <div className="kv-grid">
              <div className="kv">
                <div className="k">Total Sales</div>
                <div className="v big" style={{ color: 'var(--green-ink)' }}>
                  {peso(amt)}
                </div>
              </div>
              <div className="kv">
                <div className="k">Target Sales</div>
                <div className="v">{peso(p.target)}</div>
              </div>
              <div className="kv">
                <div className="k">Remaining Target</div>
                <div className="v">{remainTarget > 0 ? peso(remainTarget) : '—'}</div>
              </div>
              <div className="kv">
                <div className="k">Sales Status</div>
                <div className="v" style={{ marginTop: 6 }}>
                  <SalesBadge p={p} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
              <p className="sec-title" style={{ margin: 0 }}>
                Target progress
              </p>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{Math.round(salesPct)}%</b>
            </div>
            <div className="pbar">
              <i
                style={{
                  width: Math.min(100, salesPct) + '%',
                  background: salesPct >= 100 ? 'var(--green)' : salesPct >= 50 ? 'var(--terracotta)' : 'var(--amber)',
                }}
              ></i>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p className="sec-title">Sell-through rate</p>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{sellThrough}%</b>
            </div>
            <div className="pbar">
              <i style={{ width: sellThrough + '%' }}></i>
            </div>
          </div>

          <div>
            <p className="sec-title" style={{ marginBottom: 12 }}>
              Size Breakdown
            </p>
            <div className="size-cards">
              {SIZES.map((sz) => {
                const onHand = p.stock[sz],
                  sold = p.sold[sz],
                  stocked = onHand + sold;
                const s = sizeStatus(onHand);
                return (
                  <div className={'size-card ' + (s === 'ok' ? 'ok' : s === 'low' ? 'low' : 'out')} key={sz}>
                    <div className="stripe"></div>
                    <div className="sc-top">
                      <span className="sc-sz">{sz}</span>
                      <Badge status={s} />
                    </div>
                    <div className="sc-rows">
                      <div className="sc-line">
                        <span className="lk">Stocked</span>
                        <span className="lv">{stocked}</span>
                      </div>
                      <div className="sc-line">
                        <span className="lk">Sold</span>
                        <span className="lv">{sold}</span>
                      </div>
                      <div className="sc-line remain">
                        <span className="lk">Remaining</span>
                        <span className="lv">{onHand}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-soft btn-block" onClick={() => on('sale', p)}>
              <Icon name="sell" />
              Record Sale
            </button>
            <button className="btn btn-primary btn-block" onClick={() => on('restock', p)}>
              <Icon name="restock" />
              Restock
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
