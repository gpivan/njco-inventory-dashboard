/* ============ NJ&CO — desktop chrome + section bodies ============ */
import { Icon, type IconName } from '../icons';
import { useAuthUser, displayName, initials } from '../useAuthUser';
import { Thumb, Badge, SalesBadge, Progress, SizePills, SizeRow } from './shared';
import { CATEGORIES, SIZES, overallStatus, peso, sumStock, sumSold, sumStocked, salesAmount, salesProgress } from '../data';
import type { ActionType, Filters, NavId, Product } from '../types';

export const NAV_MAIN: { id: NavId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'products', label: 'Products', icon: 'products' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'sales', label: 'Sales', icon: 'sales' },
];
export const NAV_ALERTS: { id: NavId; label: string; icon: IconName; key: 'low' | 'out' }[] = [
  { id: 'low', label: 'Low Stock', icon: 'lowstock', key: 'low' },
  { id: 'out', label: 'Out of Stock', icon: 'outstock', key: 'out' },
];

function UserCard() {
  const user = useAuthUser();
  if (!user) return null;
  const name = displayName(user);
  return (
    <div className="sb-user">
      {user.picture ? (
        <img className="avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
      ) : (
        <div className="avatar">{initials(name)}</div>
      )}
      <div className="who">
        <b>{name}</b>
        <span title={user.email}>{user.email}</span>
      </div>
      <a className="sb-logout" href="/api/auth/logout" title="Log out" aria-label="Log out">
        <Icon name="logout" />
      </a>
    </div>
  );
}

export function Sidebar({
  nav,
  setNav,
  counts,
}: {
  nav: NavId;
  setNav: (n: NavId) => void;
  counts: { low: number; out: number };
}) {
  const Item = ({ it }: { it: { id: NavId; label: string; icon: IconName; key?: 'low' | 'out' } }) => {
    const badge = it.key ? counts[it.key] : null;
    return (
      <a className={'sb-item' + (nav === it.id ? ' active' : '')} onClick={() => setNav(it.id)} title={it.label}>
        <Icon name={it.icon} />
        <span className="lbl">{it.label}</span>
        {badge != null && badge > 0 && <span className="count">{badge}</span>}
      </a>
    );
  };
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-mark">N</div>
        <div className="sb-word">
          <b>NJ&amp;CO</b>
          <span>Boutique Admin</span>
        </div>
      </div>
      <nav className="sb-nav">
        <div className="sb-section">Overview</div>
        {NAV_MAIN.map((it) => (
          <Item key={it.id} it={it} />
        ))}
        <div className="sb-section">Alerts</div>
        {NAV_ALERTS.map((it) => (
          <Item key={it.id} it={it} />
        ))}
        <div className="sb-section">System</div>
        <Item it={{ id: 'settings', label: 'Settings', icon: 'settings' }} />
      </nav>
      <div className="sb-foot">
        <UserCard />
      </div>
    </aside>
  );
}

export function TopBar({
  title,
  subtitle,
  onAdd,
  onToggleSidebar,
  query,
  setQuery,
}: {
  title: string;
  subtitle: string;
  onAdd: () => void;
  onToggleSidebar: () => void;
  query: string;
  setQuery: (v: string) => void;
}) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggleSidebar} title="Toggle menu" style={{ flex: '0 0 42px' }}>
        <Icon name="menu" />
      </button>
      <div className="titles">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-search">
        <Icon name="search" />
        <input placeholder="Search inventory…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <button className="icon-btn" title="Notifications">
        <Icon name="bell" />
        <span className="dot"></span>
      </button>
      <button className="btn btn-primary" onClick={onAdd}>
        <Icon name="plus" />
        Add Product
      </button>
    </header>
  );
}

/* ---- generic summary stat cards ---- */
export interface StatCardSpec {
  tone: string;
  icon: IconName;
  label: string;
  num: number | string;
  sub: string;
}

export function StatCards({ cards, cols }: { cards: StatCardSpec[]; cols?: number }) {
  return (
    <div className="summary" style={cols ? { gridTemplateColumns: `repeat(${cols},1fr)` } : undefined}>
      {cards.map((c, i) => (
        <div className={'stat ' + c.tone + (typeof c.num === 'string' ? ' money' : '')} key={i}>
          <div className="accent"></div>
          <div className="ic">
            <Icon name={c.icon} />
          </div>
          <div className="lbl">{c.label}</div>
          <div className="num">{c.num}</div>
          <div className="sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- configurable filter bar ---- */
type FilterControl = 'search' | 'status' | 'salesstatus' | 'cat' | 'size' | 'sort';

export function FilterBar({
  filters,
  setFilters,
  controls,
  sortOptions,
  accent,
}: {
  filters: Filters;
  setFilters: (updater: (f: Filters) => Filters) => void;
  controls: FilterControl[];
  sortOptions?: { v: string; t: string }[];
  accent?: string;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const Sel = ({ k, options, w }: { k: keyof Filters; options: { v: string; t: string }[]; w?: number }) => (
    <div className="selectwrap">
      <select className="sel" style={w ? { minWidth: w } : undefined} value={filters[k] as string} onChange={(e) => set(k, e.target.value as never)}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.t}
          </option>
        ))}
      </select>
      <Icon name="chevdown" className="chev" />
    </div>
  );
  return (
    <div className={'toolbar' + (accent ? ' tb-' + accent : '')}>
      {controls.includes('search') && (
        <div className="search-field">
          <Icon name="search" />
          <input
            placeholder="Search product name, category, or description…"
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>
      )}
      <span className="filter-tag">
        <Icon name="filter" />
        Filter
      </span>
      {controls.includes('status') && (
        <Sel
          k="status"
          options={[
            { v: 'all', t: 'All Status' },
            { v: 'ok', t: 'Available' },
            { v: 'low', t: 'Low Stock' },
            { v: 'out', t: 'Out of Stock' },
          ]}
        />
      )}
      {controls.includes('salesstatus') && (
        <Sel
          k="salesstatus"
          options={[
            { v: 'all', t: 'All Sales Status' },
            { v: 'met', t: 'Target Met' },
            { v: 'track', t: 'On Track' },
            { v: 'attn', t: 'Needs Attention' },
          ]}
          w={158}
        />
      )}
      {controls.includes('cat') && (
        <Sel k="cat" options={[{ v: 'all', t: 'All Categories' }, ...CATEGORIES.map((c) => ({ v: c, t: c }))]} />
      )}
      {controls.includes('size') && (
        <Sel k="size" options={[{ v: 'all', t: 'All Sizes' }, ...SIZES.map((s) => ({ v: s, t: 'Size ' + s }))]} />
      )}
      {controls.includes('sort') && sortOptions && (
        <div className="sort-group">
          <span className="sort-lbl">Sort</span>
          <div className="selectwrap">
            <select className="sel sort-sel" value={filters.sort} onChange={(e) => set('sort', e.target.value as never)}>
              {sortOptions.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.t}
                </option>
              ))}
            </select>
            <Icon name="chevdown" className="chev" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- row action buttons (configurable set) ---- */
const ACTION_META: Record<ActionType, { icon: IconName; cls: string; tip: string }> = {
  view: { icon: 'eye', cls: '', tip: 'View' },
  edit: { icon: 'edit', cls: '', tip: 'Edit' },
  sale: { icon: 'sell', cls: 'sell', tip: 'Record Sale' },
  restock: { icon: 'restock', cls: 'restock', tip: 'Restock' },
  delete: { icon: 'trash', cls: 'danger', tip: 'Delete' },
};

export function ActionBtns({
  p,
  on,
  set = ['view', 'edit', 'sale', 'restock', 'delete'],
  align,
}: {
  p: Product;
  on: (type: ActionType, p: Product) => void;
  set?: ActionType[];
  align?: 'right';
}) {
  return (
    <div className="actions" style={align === 'right' ? { justifyContent: 'flex-end' } : undefined}>
      {set.map((key) => {
        const m = ACTION_META[key];
        return (
          <button
            key={key}
            className={'act ' + m.cls}
            onClick={(e) => {
              e.stopPropagation();
              on(key, p);
            }}
          >
            <Icon name={m.icon} />
            <span className="tip">{m.tip}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============ PRODUCTS — card grid ============ */
export function ProductCard({ p, on, newId }: { p: Product; on: (type: ActionType, p: Product) => void; newId: string | null }) {
  const st = overallStatus(p);
  return (
    <div className={'pcard' + (p.id === newId ? ' fade-row' : '')} onClick={() => on('view', p)}>
      <div className="ph">
        <Thumb tone={p.tone} label={p.label} image={p.image} size="100%" radius={0} />
        <Badge status={st} />
        <span className="ph-cat">{p.cat}</span>
      </div>
      <div className="pb">
        <div className="pb-head">
          <h3>{p.name}</h3>
          <span className="price">{peso(p.price)}</span>
        </div>
        <p className="d">{p.desc}</p>
        <div className="stock-line">
          <span className="sl-k">Stocks available</span>
          <span className="sl-v">
            <b>{sumStock(p)}</b> pcs
          </span>
        </div>
        <SizePills p={p} kind="stock" />
        <div className="cardacts" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost" onClick={() => on('view', p)}>
            <Icon name="eye" />
            View
          </button>
          <button className="btn btn-ghost" onClick={() => on('edit', p)}>
            <Icon name="edit" />
            Edit
          </button>
          <button className="btn btn-soft" onClick={() => on('restock', p)}>
            <Icon name="restock" />
            Stock
          </button>
          <button className="btn btn-primary" onClick={() => on('sale', p)}>
            <Icon name="sell" />
            Sell
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsGrid({
  products,
  on,
  newId,
}: {
  products: Product[];
  on: (type: ActionType, p: Product) => void;
  newId: string | null;
}) {
  if (products.length === 0) return <EmptyState />;
  return (
    <div className="cards-grid">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} on={on} newId={newId} />
      ))}
    </div>
  );
}

/* ============ INVENTORY — detailed table ============ */
export function InventoryTable({
  products,
  on,
  newId,
  selected,
  toggleOne,
  toggleAll,
}: {
  products: Product[];
  on: (type: ActionType, p: Product) => void;
  newId: string | null;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  toggleAll: (list: Product[]) => void;
}) {
  if (products.length === 0) return <EmptyState />;
  const allOn = products.length > 0 && products.every((p) => selected.has(p.id));
  const someOn = products.some((p) => selected.has(p.id)) && !allOn;
  return (
    <div className="tbl-scroll">
      <table className="inv">
        <thead>
          <tr>
            <th className="tsel">
              <label className="cbox" title={allOn ? 'Clear selection' : 'Select all'}>
                <input
                  type="checkbox"
                  checked={allOn}
                  ref={(el) => {
                    if (el) el.indeterminate = someOn;
                  }}
                  onChange={() => toggleAll(products)}
                />
                <span className="cb-box">
                  <Icon name="check" />
                </span>
              </label>
            </th>
            <th>Product</th>
            <th>Category</th>
            <th>Stock by Size</th>
            <th>Sold by Size</th>
            <th>Remaining by Size</th>
            <th className="tnum">
              Total
              <br />
              Stock
            </th>
            <th className="tnum">
              Total
              <br />
              Sold
            </th>
            <th className="tnum">
              Total
              <br />
              Left
            </th>
            <th>Status</th>
            <th>Updated</th>
            <th className="tact" style={{ textAlign: 'right' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const st = overallStatus(p);
            const on_ = selected.has(p.id);
            return (
              <tr
                key={p.id}
                className={(p.id === newId ? 'fade-row' : '') + (on_ ? ' row-sel' : '')}
                onClick={() => on('view', p)}
                style={{ cursor: 'pointer' }}
              >
                <td className="tsel" onClick={(e) => e.stopPropagation()}>
                  <label className="cbox">
                    <input type="checkbox" checked={on_} onChange={() => toggleOne(p.id)} />
                    <span className="cb-box">
                      <Icon name="check" />
                    </span>
                  </label>
                </td>
                <td>
                  <div className="prod-cell">
                    <Thumb tone={p.tone} label={p.label} image={p.image} size={44} />
                    <div className="prodname">
                      <b>{p.name}</b>
                      <span>{peso(p.price)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="cat-chip">{p.cat}</span>
                </td>
                <td>
                  <SizeRow p={p} kind="stocked" />
                </td>
                <td>
                  <SizeRow p={p} kind="sold" />
                </td>
                <td>
                  <SizeRow p={p} kind="remaining" />
                </td>
                <td className="tnum">
                  <span className="bignum muted">{sumStocked(p)}</span>
                </td>
                <td className="tnum">
                  <span className="bignum muted">{sumSold(p)}</span>
                </td>
                <td className="tnum">
                  <span className={'bignum' + (sumStock(p) === 0 ? ' muted' : '')}>{sumStock(p)}</span>
                </td>
                <td>
                  <Badge status={st} />
                </td>
                <td>
                  <span className="upd">
                    <Icon name="clock" />
                    {p.updated}
                  </span>
                </td>
                <td className="tact" onClick={(e) => e.stopPropagation()}>
                  <ActionBtns p={p} on={on} align="right" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============ SALES — tracking table ============ */
export function SalesTable({ products, on, newId }: { products: Product[]; on: (type: ActionType, p: Product) => void; newId: string | null }) {
  if (products.length === 0) return <EmptyState />;
  return (
    <div className="tbl-scroll">
      <table className="inv sales-tbl">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th className="tnum">Price</th>
            <th>Sold by Size</th>
            <th className="tnum">Qty Sold</th>
            <th className="tnum">Sales Amount</th>
            <th className="tnum">Target</th>
            <th className="tnum">Remaining</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const amt = salesAmount(p),
              pct = salesProgress(p);
            const remain = Math.max(0, p.target - amt);
            return (
              <tr key={p.id} className={p.id === newId ? 'fade-row' : ''} onClick={() => on('view', p)} style={{ cursor: 'pointer' }}>
                <td>
                  <div className="prod-cell">
                    <Thumb tone={p.tone} label={p.label} image={p.image} size={44} />
                    <div className="prodname">
                      <b>{p.name}</b>
                      <span>#{p.id.toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="cat-chip">{p.cat}</span>
                </td>
                <td className="tnum">
                  <b style={{ fontWeight: 600 }}>{peso(p.price)}</b>
                </td>
                <td>
                  <SizeRow p={p} kind="sold" />
                </td>
                <td className="tnum">
                  <span className="bignum">{sumSold(p)}</span>
                </td>
                <td className="tnum">
                  <b className="amt">{peso(amt)}</b>
                </td>
                <td className="tnum">
                  <span style={{ color: 'var(--muted)' }}>{peso(p.target)}</span>
                </td>
                <td className="tnum">
                  <span style={{ color: remain > 0 ? 'var(--ink-2)' : 'var(--green-ink)' }}>{remain > 0 ? peso(remain) : '—'}</span>
                </td>
                <td>
                  <Progress pct={pct} />
                </td>
                <td>
                  <SalesBadge p={p} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- bulk action bar ---- */
export function BulkBar({
  count,
  onClear,
  onDelete,
  onRestock,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onRestock: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="bulkbar">
      <span className="bb-count">{count} selected</span>
      <button className="bb-link" onClick={onClear}>
        Clear
      </button>
      <div className="bb-acts">
        <button className="btn btn-ghost" onClick={onRestock}>
          <Icon name="restock" />
          Restock
        </button>
        <button className="btn bb-del" onClick={onDelete}>
          <Icon name="trash" />
          Delete {count}
        </button>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="empty">
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <Icon name="search" />
      </div>
      <b>No products match your filters</b>
      Try adjusting your search or clearing filters.
    </div>
  );
}
