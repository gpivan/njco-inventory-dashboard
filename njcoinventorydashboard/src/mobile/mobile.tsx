/* ============ NJ&CO — mobile experience (section-aware) ============ */
import { Icon, type IconName } from '../icons';
import { Thumb, Badge, SalesBadge, Progress, MiniPills, SizeRow } from '../components/shared';
import { overallStatus, peso, salesAmount, salesProgress, sumStock, sumSold, sumStocked, SORTS } from '../data';
import type { ActionType, NavId, Product, Status } from '../types';

const M_TITLE: Record<NavId, string> = {
  dashboard: 'Dashboard',
  products: 'Products',
  inventory: 'Inventory',
  sales: 'Sales',
  low: 'Low Stock',
  out: 'Out of Stock',
  settings: 'Settings',
};

export function MobileView({
  section,
  setNav,
  products,
  all,
  on,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  onAdd,
}: {
  section: NavId;
  setNav: (n: NavId) => void;
  products: Product[];
  all: Product[];
  on: (type: ActionType, p: Product) => void;
  query: string;
  setQuery: (v: string) => void;
  statusFilter: 'all' | Status;
  setStatusFilter: (v: 'all' | Status) => void;
  onAdd: () => void;
}) {
  const sec: 'dashboard' | 'products' | 'inventory' | 'sales' = ['dashboard', 'products', 'inventory', 'sales'].includes(section)
    ? (section as 'dashboard' | 'products' | 'inventory' | 'sales')
    : section === 'low' || section === 'out'
      ? 'inventory'
      : 'dashboard';

  return (
    <div className="mobile-app">
      <div className="m-top">
        <div className="row1">
          <button className="m-burger">
            <Icon name="menu" />
          </button>
          <h1>{M_TITLE[section] || 'NJ&CO'}</h1>
          <button className="m-add" onClick={onAdd}>
            <Icon name="plus" />
          </button>
        </div>
        {sec !== 'dashboard' && (
          <div className="m-search">
            <Icon name="search" />
            <input placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        )}
      </div>

      {sec === 'dashboard' && <MobileDashboard all={all} on={on} />}
      {sec === 'products' && <MobileProducts products={products} on={on} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
      {sec === 'inventory' && <MobileInventory products={products} on={on} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />}
      {sec === 'sales' && <MobileSales products={products} on={on} />}

      <div className="m-tabbar">
        {(
          [
            ['dashboard', 'dashboard', 'Home'],
            ['products', 'products', 'Products'],
            ['inventory', 'inventory', 'Stock'],
            ['sales', 'sales', 'Sales'],
          ] as [NavId, IconName, string][]
        ).map(([id, ic, lbl]) => (
          <button key={id} className={section === id ? 'on' : ''} onClick={() => setNav(id)}>
            <Icon name={ic} />
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

function statIcStyle(tone: string) {
  const map: Record<string, { background: string; color: string }> = {
    't-clay': { background: 'var(--terracotta-soft)', color: 'var(--terracotta-dark)' },
    't-blush': { background: 'var(--blush)', color: '#B06A7E' },
    't-green': { background: 'var(--green-bg)', color: 'var(--green-ink)' },
    't-amber': { background: 'var(--amber-bg)', color: 'var(--amber-ink)' },
    't-red': { background: 'var(--red-bg)', color: 'var(--red-ink)' },
  };
  return map[tone];
}

function StatStrip({ stats }: { stats: { tone: string; icon: IconName; num: number; lbl: string }[] }) {
  return (
    <div className="m-stats">
      {stats.map((s, i) => (
        <div className="m-stat" key={i}>
          <div className="ic" style={statIcStyle(s.tone)}>
            <Icon name={s.icon} />
          </div>
          <div className="num">{s.num}</div>
          <div className="lbl">{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}

function StatusChips({ statusFilter, setStatusFilter }: { statusFilter: 'all' | Status; setStatusFilter: (v: 'all' | Status) => void }) {
  const chips: { v: 'all' | Status; t: string }[] = [
    { v: 'all', t: 'All' },
    { v: 'ok', t: 'Available' },
    { v: 'low', t: 'Low Stock' },
    { v: 'out', t: 'Out of Stock' },
  ];
  return (
    <div className="m-filter-chips">
      {chips.map((c) => (
        <button key={c.v} className={'m-chip' + (statusFilter === c.v ? ' on' : '')} onClick={() => setStatusFilter(c.v)}>
          {c.t}
        </button>
      ))}
    </div>
  );
}

/* ---- mobile dashboard ---- */
function MobileDashboard({ all, on }: { all: Product[]; on: (type: ActionType, p: Product) => void }) {
  const totalStock = all.reduce((s, p) => s + sumStock(p), 0);
  const totalSold = all.reduce((s, p) => s + sumSold(p), 0);
  const totalAmt = all.reduce((s, p) => s + salesAmount(p), 0);
  const totalTarget = all.reduce((s, p) => s + p.target, 0);
  const pct = totalTarget ? (totalAmt / totalTarget) * 100 : 0;
  const low = all.filter((p) => overallStatus(p) === 'low').length;
  const out = all.filter((p) => overallStatus(p) === 'out').length;
  const alerts = [...all.filter((p) => overallStatus(p) === 'out'), ...all.filter((p) => overallStatus(p) === 'low')].slice(0, 4);
  const best = [...all].sort(SORTS.bestselling).slice(0, 3);
  const stats: { tone: string; icon: IconName; num: number; lbl: string }[] = [
    { tone: 't-clay', icon: 'box', num: all.length, lbl: 'Products' },
    { tone: 't-blush', icon: 'inventory', num: totalStock, lbl: 'On hand' },
    { tone: 't-green', icon: 'coins', num: totalSold, lbl: 'Sold' },
    { tone: 't-amber', icon: 'lowstock', num: low, lbl: 'Low' },
    { tone: 't-red', icon: 'outstock', num: out, lbl: 'Out' },
  ];
  return (
    <div className="m-list" style={{ paddingTop: 14 }}>
      <StatStrip stats={stats} />
      <div className="m-target">
        <div className="mt-row">
          <span>Sales Target</span>
          <b>{Math.round(pct)}%</b>
        </div>
        <div className="pbar big">
          <i style={{ width: Math.min(100, pct) + '%' }}></i>
        </div>
        <div className="mt-foot">
          {peso(totalAmt)} of {peso(totalTarget)}
        </div>
      </div>
      <div className="m-block-title">Stock Alerts</div>
      {alerts.map((p) => (
        <div className="m-mini" key={p.id} onClick={() => on('view', p)}>
          <Thumb tone={p.tone} label={p.label} image={p.image} size={40} radius={10} />
          <div className="mm-main">
            <b>{p.name}</b>
            <span>{sumStock(p)} pcs left</span>
          </div>
          <Badge status={overallStatus(p)} />
        </div>
      ))}
      <div className="m-block-title">Best Sellers</div>
      {best.map((p, i) => (
        <div className="m-mini" key={p.id} onClick={() => on('view', p)}>
          <span className="rank">{i + 1}</span>
          <div className="mm-main">
            <b>{p.name}</b>
            <span>
              {sumSold(p)} sold · {peso(salesAmount(p))}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- mobile products ---- */
function MobileProducts({
  products,
  on,
  statusFilter,
  setStatusFilter,
}: {
  products: Product[];
  on: (type: ActionType, p: Product) => void;
  statusFilter: 'all' | Status;
  setStatusFilter: (v: 'all' | Status) => void;
}) {
  return (
    <>
      <StatusChips statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <div className="m-list">
        {products.length === 0 && (
          <div className="empty" style={{ padding: '40px 0' }}>
            <b>No products</b>Try another search.
          </div>
        )}
        {products.map((p) => (
          <div className="m-card" key={p.id}>
            <div className="mc-top" onClick={() => on('view', p)}>
              <Thumb tone={p.tone} label={p.label} image={p.image} size={64} radius={12} />
              <div className="mc-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                  <h3>{p.name}</h3>
                  <Badge status={overallStatus(p)} />
                </div>
                <div className="mc-cat">
                  {p.cat} · <b style={{ color: 'var(--terracotta-dark)' }}>{peso(p.price)}</b>
                </div>
                <div className="mc-stockline">
                  <b>{sumStock(p)}</b>
                  <span>pcs available</span>
                </div>
              </div>
            </div>
            <div className="m-pills">
              <MiniPills p={p} />
            </div>
            <div className="m-acts">
              <button onClick={() => on('view', p)}>
                <Icon name="eye" />
                View
              </button>
              <button onClick={() => on('sale', p)}>
                <Icon name="sell" />
                Sell
              </button>
              <button onClick={() => on('restock', p)}>
                <Icon name="restock" />
                Restock
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- mobile inventory ---- */
function MobileInventory({
  products,
  on,
  statusFilter,
  setStatusFilter,
}: {
  products: Product[];
  on: (type: ActionType, p: Product) => void;
  statusFilter: 'all' | Status;
  setStatusFilter: (v: 'all' | Status) => void;
}) {
  return (
    <>
      <StatusChips statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <div className="m-list">
        {products.length === 0 && (
          <div className="empty" style={{ padding: '40px 0' }}>
            <b>No products</b>Try another search.
          </div>
        )}
        {products.map((p) => (
          <div className="m-card" key={p.id}>
            <div className="mc-top" onClick={() => on('view', p)} style={{ paddingBottom: 8 }}>
              <Thumb tone={p.tone} label={p.label} image={p.image} size={48} radius={11} />
              <div className="mc-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                  <h3>{p.name}</h3>
                  <Badge status={overallStatus(p)} />
                </div>
                <div className="mc-cat">{p.cat}</div>
              </div>
            </div>
            <div className="m-invrows">
              <div className="m-invrow">
                <span className="ir-k">Stock</span>
                <SizeRow p={p} kind="stocked" />
              </div>
              <div className="m-invrow">
                <span className="ir-k">Sold</span>
                <SizeRow p={p} kind="sold" />
              </div>
              <div className="m-invrow">
                <span className="ir-k">Left</span>
                <SizeRow p={p} kind="remaining" />
              </div>
            </div>
            <div className="m-invtotals">
              <div>
                <span>Total Stock</span>
                <b>{sumStocked(p)}</b>
              </div>
              <div>
                <span>Sold</span>
                <b>{sumSold(p)}</b>
              </div>
              <div>
                <span>Remaining</span>
                <b>{sumStock(p)}</b>
              </div>
            </div>
            <div className="m-acts">
              <button onClick={() => on('view', p)}>
                <Icon name="eye" />
                View
              </button>
              <button onClick={() => on('restock', p)}>
                <Icon name="restock" />
                Restock
              </button>
              <button onClick={() => on('sale', p)}>
                <Icon name="sell" />
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- mobile sales ---- */
function MobileSales({ products, on }: { products: Product[]; on: (type: ActionType, p: Product) => void }) {
  return (
    <div className="m-list" style={{ paddingTop: 12 }}>
      {products.length === 0 && (
        <div className="empty" style={{ padding: '40px 0' }}>
          <b>No products</b>Try another search.
        </div>
      )}
      {products.map((p) => {
        const amt = salesAmount(p),
          pct = salesProgress(p),
          remain = Math.max(0, p.target - amt);
        return (
          <div className="m-card" key={p.id}>
            <div className="mc-top" onClick={() => on('view', p)} style={{ paddingBottom: 10 }}>
              <Thumb tone={p.tone} label={p.label} image={p.image} size={48} radius={11} />
              <div className="mc-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                  <h3>{p.name}</h3>
                  <SalesBadge p={p} />
                </div>
                <div className="mc-cat">
                  {p.cat} · {peso(p.price)} · {sumSold(p)} sold
                </div>
              </div>
            </div>
            <div className="m-saleamt">
              <div>
                <span>Total Sales</span>
                <b className="amt">{peso(amt)}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span>Target</span>
                <b>{peso(p.target)}</b>
              </div>
            </div>
            <div style={{ padding: '0 13px 13px' }}>
              <Progress pct={pct} width={0} />
              <div className="m-remain">{remain > 0 ? peso(remain) + ' to target' : 'Target met 🎉'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
