/* ============ NJ&CO — section views ============ */
import { Icon } from '../icons';
import { Thumb, Badge, Progress } from '../components/shared';
import { StatCards, FilterBar, ProductsGrid, InventoryTable, SalesTable, BulkBar, type StatCardSpec } from '../components/components';
import { overallStatus, peso, sumStock, sumSold, sumStocked, salesAmount, salesProgress, SORTS } from '../data';
import type { ActionType, Filters, NavId, Product } from '../types';

interface SectionCommonProps {
  products: Product[];
  all: Product[];
  on: (type: ActionType, p: Product) => void;
  newId: string | null;
  filters: Filters;
  setFilters: (updater: (f: Filters) => Filters) => void;
}

/* ---- PRODUCTS section: summary + filters + card grid ---- */
export function ProductsSection({ products, all, on, newId, filters, setFilters }: SectionCommonProps) {
  const avail = all.filter((p) => overallStatus(p) === 'ok').length;
  const low = all.filter((p) => overallStatus(p) === 'low').length;
  const out = all.filter((p) => overallStatus(p) === 'out').length;
  const cards: StatCardSpec[] = [
    { tone: 't-clay', icon: 'box', label: 'Total Products', num: all.length, sub: 'In catalogue' },
    { tone: 't-green', icon: 'check', label: 'Available', num: avail, sub: 'Ready to sell' },
    { tone: 't-amber', icon: 'lowstock', label: 'Low Stock', num: low, sub: 'Running down' },
    { tone: 't-red', icon: 'outstock', label: 'Out of Stock', num: out, sub: 'Need restock' },
  ];
  return (
    <>
      <StatCards cards={cards} cols={4} />
      <div className="section-head">
        <div>
          <h2 className="sec-h">Product Catalogue</h2>
          <p className="sec-sub">Browse every NJ&amp;CO piece at a glance</p>
        </div>
      </div>
      <div className="panel">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          controls={['search', 'cat', 'status', 'sort']}
          accent="blush"
          sortOptions={[
            { v: 'newest', t: 'Newest first' },
            { v: 'stock-high', t: 'Highest stock' },
            { v: 'stock-low', t: 'Lowest stock' },
            { v: 'bestselling', t: 'Best-selling' },
          ]}
        />
        <ProductsGrid products={products} on={on} newId={newId} />
      </div>
    </>
  );
}

/* ---- INVENTORY section: summary + filters + table ---- */
export function InventorySection({
  products,
  all,
  on,
  newId,
  filters,
  setFilters,
  heading,
  selected,
  toggleOne,
  toggleAll,
  clearSel,
  bulkDelete,
  bulkRestock,
  selCount,
}: SectionCommonProps & {
  heading?: string;
  selected: Set<string>;
  toggleOne: (id: string) => void;
  toggleAll: (list: Product[]) => void;
  clearSel: () => void;
  bulkDelete: () => void;
  bulkRestock: () => void;
  selCount: number;
}) {
  const totalStock = all.reduce((s, p) => s + sumStock(p), 0);
  const totalSold = all.reduce((s, p) => s + sumSold(p), 0);
  const totalStocked = all.reduce((s, p) => s + sumStocked(p), 0);
  const low = all.filter((p) => overallStatus(p) === 'low').length;
  const out = all.filter((p) => overallStatus(p) === 'out').length;
  const cards: StatCardSpec[] = [
    { tone: 't-blush', icon: 'inventory', label: 'Total Stock Available', num: totalStock, sub: 'Units on hand' },
    { tone: 't-green', icon: 'coins', label: 'Total Items Sold', num: totalSold, sub: 'All-time' },
    { tone: 't-clay', icon: 'box', label: 'Total Stocked', num: totalStocked, sub: 'Original intake' },
    { tone: 't-amber', icon: 'lowstock', label: 'Low Stock Items', num: low, sub: 'Need attention' },
    { tone: 't-red', icon: 'outstock', label: 'Out of Stock', num: out, sub: 'Restock soon' },
  ];
  return (
    <>
      <StatCards cards={cards} cols={5} />
      <div className="section-head">
        <div>
          <h2 className="sec-h">{heading || 'Stock Control'}</h2>
          <p className="sec-sub">Monitor quantities and movement across every size</p>
        </div>
      </div>
      <div className="panel">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          controls={['search', 'cat', 'status', 'size', 'sort']}
          accent="beige"
          sortOptions={[
            { v: 'newest', t: 'Newest first' },
            { v: 'stock-high', t: 'Stock: high → low' },
            { v: 'stock-low', t: 'Stock: low → high' },
            { v: 'sold-high', t: 'Most sold' },
          ]}
        />
        <BulkBar count={selCount} onClear={clearSel} onDelete={bulkDelete} onRestock={bulkRestock} />
        <InventoryTable products={products} on={on} newId={newId} selected={selected} toggleOne={toggleOne} toggleAll={toggleAll} />
      </div>
    </>
  );
}

/* ---- SALES section: target hero + summary + filters + sales table ---- */
export function SalesSection({ products, all, on, newId, filters, setFilters }: SectionCommonProps) {
  const totalQty = all.reduce((s, p) => s + sumSold(p), 0);
  const totalAmt = all.reduce((s, p) => s + salesAmount(p), 0);
  const totalTarget = all.reduce((s, p) => s + p.target, 0);
  const remain = Math.max(0, totalTarget - totalAmt);
  const pct = totalTarget ? (totalAmt / totalTarget) * 100 : 0;
  const cards: StatCardSpec[] = [
    { tone: 't-clay', icon: 'coins', label: 'Total Sales Quantity', num: totalQty, sub: 'Items sold' },
    { tone: 't-green', icon: 'peso', label: 'Total Sales Amount', num: peso(totalAmt), sub: 'Revenue to date' },
    { tone: 't-blush', icon: 'target', label: 'Target Sales', num: peso(totalTarget), sub: 'Combined goal' },
    { tone: 't-amber', icon: 'trend', label: 'Remaining to Target', num: peso(remain), sub: 'Still to earn' },
  ];
  return (
    <>
      <div className="sales-top">
        <StatCards cards={cards} cols={4} />
        <div className="target-hero">
          <div className="th-row">
            <div>
              <div className="th-k">Sales Progress</div>
              <div className="th-v">
                {Math.round(pct)}%<span>achieved</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="th-amt">{peso(totalAmt)}</div>
              <div className="th-of">of {peso(totalTarget)} target</div>
            </div>
          </div>
          <div className="pbar big">
            <i style={{ width: Math.min(100, pct) + '%' }}></i>
          </div>
          <div className="th-foot">
            <span>{peso(remain)} remaining to reach the combined target</span>
          </div>
        </div>
      </div>
      <div className="section-head">
        <div>
          <h2 className="sec-h">Sales Performance</h2>
          <p className="sec-sub">Track revenue and target progress per product</p>
        </div>
      </div>
      <div className="panel">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          controls={['search', 'cat', 'salesstatus', 'sort']}
          accent="clay"
          sortOptions={[
            { v: 'sales-high', t: 'Highest sales' },
            { v: 'sales-low', t: 'Lowest sales' },
            { v: 'progress', t: 'Target progress' },
          ]}
        />
        <SalesTable products={products} on={on} newId={newId} />
      </div>
    </>
  );
}

/* ---- DASHBOARD overview homepage ---- */
export function DashboardOverview({ all, on, goTo }: { all: Product[]; on: (type: ActionType, p: Product) => void; goTo: (n: NavId) => void }) {
  const totalStock = all.reduce((s, p) => s + sumStock(p), 0);
  const totalSold = all.reduce((s, p) => s + sumSold(p), 0);
  const totalAmt = all.reduce((s, p) => s + salesAmount(p), 0);
  const totalTarget = all.reduce((s, p) => s + p.target, 0);
  const remain = Math.max(0, totalTarget - totalAmt);
  const pct = totalTarget ? (totalAmt / totalTarget) * 100 : 0;
  const low = all.filter((p) => overallStatus(p) === 'low');
  const out = all.filter((p) => overallStatus(p) === 'out');

  const cards: StatCardSpec[] = [
    { tone: 't-clay', icon: 'box', label: 'Total Products', num: all.length, sub: 'In catalogue' },
    { tone: 't-blush', icon: 'inventory', label: 'Stock Available', num: totalStock, sub: 'Units on hand' },
    { tone: 't-green', icon: 'coins', label: 'Items Sold', num: totalSold, sub: 'All-time' },
    { tone: 't-amber', icon: 'peso', label: 'Sales Amount', num: peso(totalAmt), sub: 'Revenue to date' },
  ];

  const bestSellers = [...all].sort(SORTS.bestselling).slice(0, 4);
  const alerts = [...out, ...low].slice(0, 5);

  // synthetic recent sales feed (newest first)
  const recent = [
    { p: all.find((x) => x.id === 'p4'), sz: 'M', qty: 2, when: '12 min ago' },
    { p: all.find((x) => x.id === 'p1'), sz: 'S', qty: 1, when: '48 min ago' },
    { p: all.find((x) => x.id === 'p5'), sz: 'L', qty: 3, when: '2 hrs ago' },
    { p: all.find((x) => x.id === 'p6'), sz: 'M', qty: 1, when: '4 hrs ago' },
    { p: all.find((x) => x.id === 'p2'), sz: 'S', qty: 2, when: 'Yesterday' },
  ].filter((r): r is { p: Product; sz: string; qty: number; when: string } => !!r.p);

  return (
    <>
      <StatCards cards={cards} cols={4} />

      <div className="dash-grid">
        {/* sales target panel */}
        <div className="panel dash-card span2">
          <div className="dc-head">
            <span className="dc-ic t-clay">
              <Icon name="target" />
            </span>
            <h3>Sales Target</h3>
            <button className="dc-link" onClick={() => goTo('sales')}>
              View sales
              <Icon name="arrowright" />
            </button>
          </div>
          <div className="dc-body">
            <div className="th-row">
              <div>
                <div className="th-k">Progress</div>
                <div className="th-v">
                  {Math.round(pct)}%<span>achieved</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="th-amt">{peso(totalAmt)}</div>
                <div className="th-of">of {peso(totalTarget)}</div>
              </div>
            </div>
            <div className="pbar big">
              <i style={{ width: Math.min(100, pct) + '%' }}></i>
            </div>
            <div className="mini-kv">
              <div>
                <span>Target</span>
                <b>{peso(totalTarget)}</b>
              </div>
              <div>
                <span>Earned</span>
                <b>{peso(totalAmt)}</b>
              </div>
              <div>
                <span>Remaining</span>
                <b>{peso(remain)}</b>
              </div>
            </div>
          </div>
        </div>

        {/* low stock alerts */}
        <div className="panel dash-card">
          <div className="dc-head">
            <span className="dc-ic t-red">
              <Icon name="lowstock" />
            </span>
            <h3>Stock Alerts</h3>
            <button className="dc-link" onClick={() => goTo('inventory')}>
              Inventory
              <Icon name="arrowright" />
            </button>
          </div>
          <div className="dc-list">
            {alerts.map((p) => (
              <div className="dc-row" key={p.id} onClick={() => on('view', p)}>
                <Thumb tone={p.tone} label={p.label} image={p.image} size={38} />
                <div className="dc-row-main">
                  <b>{p.name}</b>
                  <span>{sumStock(p)} pcs left</span>
                </div>
                <Badge status={overallStatus(p)} />
              </div>
            ))}
            {alerts.length === 0 && <div className="dc-empty">All products well stocked ✓</div>}
          </div>
        </div>

        {/* best sellers */}
        <div className="panel dash-card">
          <div className="dc-head">
            <span className="dc-ic t-green">
              <Icon name="trophy" />
            </span>
            <h3>Best Sellers</h3>
            <button className="dc-link" onClick={() => goTo('products')}>
              Products
              <Icon name="arrowright" />
            </button>
          </div>
          <div className="dc-list">
            {bestSellers.map((p, i) => (
              <div className="dc-row" key={p.id} onClick={() => on('view', p)}>
                <span className="rank">{i + 1}</span>
                <div className="dc-row-main">
                  <b>{p.name}</b>
                  <span>
                    {sumSold(p)} sold · {peso(salesAmount(p))}
                  </span>
                </div>
                <Progress pct={salesProgress(p)} width={84} />
              </div>
            ))}
          </div>
        </div>

        {/* recent sales */}
        <div className="panel dash-card span2">
          <div className="dc-head">
            <span className="dc-ic t-blush">
              <Icon name="sell" />
            </span>
            <h3>Recent Sales</h3>
            <button className="dc-link" onClick={() => goTo('sales')}>
              All sales
              <Icon name="arrowright" />
            </button>
          </div>
          <div className="dc-list cols2">
            {recent.map((r, i) => (
              <div className="dc-row" key={i} onClick={() => on('view', r.p)}>
                <Thumb tone={r.p.tone} label={r.p.label} image={r.p.image} size={38} />
                <div className="dc-row-main">
                  <b>{r.p.name}</b>
                  <span>
                    Size {r.sz} · {r.qty} pc{r.qty > 1 ? 's' : ''} · {r.when}
                  </span>
                </div>
                <b className="amt">{peso(r.p.price * r.qty)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

