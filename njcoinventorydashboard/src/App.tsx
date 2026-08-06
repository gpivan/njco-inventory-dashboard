/* ============ NJ&CO — app root, routing + state ============ */
import { useEffect, useMemo, useState } from 'react';
import { Icon } from './icons';
import { Sidebar, TopBar } from './components/components';
import { ProductsSection, InventorySection, SalesSection, DashboardOverview } from './sections/sections';
import { AddProductModal, RecordSaleModal, RestockModal, DetailsDrawer, type ProductFormValues } from './modals/modals';
import { MobileView } from './mobile/mobile';
import { useIsMobile } from './useIsMobile';
import { fetchProducts, saveProducts } from './api';
import { PRODUCTS, SIZES, SORTS, overallStatus, salesStatus, todayStr } from './data';
import type { ActionType, Filters, NavId, Product } from './types';

const SECTION_META: Record<NavId, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Your NJ&CO boutique at a glance' },
  products: { title: 'Products', sub: 'Browse and present the NJ&CO catalogue' },
  inventory: { title: 'Inventory', sub: 'Track stock levels and movement by size' },
  sales: { title: 'Sales', sub: 'Monitor revenue and sales targets' },
  low: { title: 'Low Stock', sub: 'Products running low — restock soon' },
  out: { title: 'Out of Stock', sub: 'Products that need restocking now' },
  settings: { title: 'Settings', sub: 'Configure your NJ&CO workspace' },
};
const DEFAULT_SORT: Partial<Record<NavId, Filters['sort']>> = {
  products: 'newest',
  inventory: 'newest',
  sales: 'sales-high',
  low: 'newest',
  out: 'newest',
};

type ModalState = { type: 'add' } | { type: 'sale'; product: Product } | { type: 'restock'; product: Product } | null;

function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loaded, setLoaded] = useState(false);
  const [nav, setNav] = useState<NavId>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState<Filters>({ q: '', status: 'all', cat: 'all', size: 'all', salesstatus: 'all', sort: 'newest' });
  const [modal, setModal] = useState<ModalState>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const isMobile = useIsMobile(760);

  // load persisted products on first mount; fall back to the seed catalogue if
  // the backend isn't configured yet or the sheet is empty
  useEffect(() => {
    let cancelled = false;
    fetchProducts().then((remote) => {
      if (cancelled) return;
      if (remote && remote.length > 0) setProducts(remote);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // persist every change (add/edit/delete/sale/restock) once the initial load has settled
  useEffect(() => {
    if (!loaded) return;
    saveProducts(products);
  }, [products, loaded]);

  // when the section changes: set a sensible sort + status filter for it
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      sort: DEFAULT_SORT[nav] || f.sort,
      status: nav === 'low' ? 'low' : nav === 'out' ? 'out' : nav === 'inventory' || nav === 'products' ? 'all' : f.status,
      salesstatus: nav === 'sales' ? 'all' : f.salesstatus,
    }));
  }, [nav]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  // ----- bulk selection -----
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = (list: Product[]) =>
    setSelected((s) => {
      const allOn = list.length > 0 && list.every((p) => s.has(p.id));
      if (allOn) {
        const n = new Set(s);
        list.forEach((p) => n.delete(p.id));
        return n;
      }
      const n = new Set(s);
      list.forEach((p) => n.add(p.id));
      return n;
    });
  const clearSel = () => setSelected(new Set());

  const counts = useMemo(
    () => ({
      low: products.filter((p) => overallStatus(p) === 'low').length,
      out: products.filter((p) => overallStatus(p) === 'out').length,
    }),
    [products],
  );

  // filtered + sorted for the active section
  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q && !(p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))) return false;
      if (filters.status !== 'all' && overallStatus(p) !== filters.status) return false;
      if (filters.cat !== 'all' && p.cat !== filters.cat) return false;
      if (filters.size !== 'all' && p.stock[filters.size] <= 0) return false;
      if (filters.salesstatus !== 'all' && salesStatus(p) !== filters.salesstatus) return false;
      return true;
    });
    const cmp = SORTS[filters.sort];
    if (cmp) list = [...list].sort(cmp);
    return list;
  }, [products, filters]);

  // selection acts ONLY on rows currently visible under the filters
  const selectedVisible = useMemo(() => visible.filter((p) => selected.has(p.id)), [visible, selected]);

  // drop ids that filtering/searching has hidden, so counts always match the screen
  useEffect(() => {
    setSelected((s) => {
      if (s.size === 0) return s;
      const vis = new Set(visible.map((p) => p.id));
      const n = new Set([...s].filter((id) => vis.has(id)));
      return n.size === s.size ? s : n;
    });
  }, [visible]);

  const bulkDelete = () => {
    const ids = selectedVisible.map((p) => p.id);
    const n = ids.length;
    if (n === 0) return;
    if (window.confirm(`Delete ${n} selected product${n > 1 ? 's' : ''}? This cannot be undone.`)) {
      const del = new Set(ids);
      setProducts((ps) => ps.filter((p) => !del.has(p.id)));
      if (detail && del.has(detail.id)) setDetail(null);
      clearSel();
      flash(`Deleted ${n} product${n > 1 ? 's' : ''}`);
    }
  };
  const bulkRestock = () => {
    const ids = selectedVisible.map((p) => p.id);
    const n = ids.length;
    if (n === 0) return;
    const set = new Set(ids);
    setProducts((ps) =>
      ps.map((p) => (set.has(p.id) ? { ...p, stock: Object.fromEntries(SIZES.map((z) => [z, p.stock[z] + 10])) as Product['stock'], updated: todayStr() } : p)),
    );
    flash(`Restocked ${n} product${n > 1 ? 's' : ''} · +10 per size`);
    clearSel();
  };

  // ----- action router -----
  const on = (type: ActionType, p: Product) => {
    if (type === 'view') {
      setDetail(p);
      return;
    }
    if (type === 'edit') {
      setEditing(p);
      setModal({ type: 'add' });
      setDetail(null);
      return;
    }
    if (type === 'sale') {
      setModal({ type: 'sale', product: p });
      return;
    }
    if (type === 'restock') {
      setModal({ type: 'restock', product: p });
      return;
    }
    if (type === 'delete') {
      if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
        setProducts((ps) => ps.filter((x) => x.id !== p.id));
        if (detail && detail.id === p.id) setDetail(null);
        flash(`Deleted ${p.name}`);
      }
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const saveProduct = (f: ProductFormValues) => {
    const stock = {
      S: parseInt(String(f.S)) || 0,
      M: parseInt(String(f.M)) || 0,
      L: parseInt(String(f.L)) || 0,
      XL: parseInt(String(f.XL)) || 0,
    };
    const price = parseFloat(String(f.price)) || 0;
    const target = parseFloat(String(f.target)) || 0;
    if (editing) {
      setProducts((ps) =>
        ps.map((x) => (x.id === editing.id ? { ...x, name: f.name, desc: f.desc, cat: f.cat, tone: f.tone, price, target, stock, updated: todayStr() } : x)),
      );
      flash(`Saved changes to ${f.name}`);
    } else {
      const id = 'p' + Date.now();
      const np: Product = {
        id,
        name: f.name,
        desc: f.desc || '—',
        cat: f.cat,
        tone: f.tone,
        label: (f.name || 'product').toLowerCase().slice(0, 16),
        price,
        target,
        ts: 9999,
        added: todayStr(),
        updated: todayStr(),
        stock,
        sold: { S: 0, M: 0, L: 0, XL: 0 },
      };
      setProducts((ps) => [np, ...ps]);
      setNewId(id);
      setTimeout(() => setNewId(null), 1200);
      flash(`Added ${f.name} to catalogue`);
    }
    closeModal();
  };

  const recordSale = (pid: string, size: (typeof SIZES)[number], qty: number) => {
    setProducts((ps) =>
      ps.map((p) => (p.id === pid ? { ...p, stock: { ...p.stock, [size]: p.stock[size] - qty }, sold: { ...p.sold, [size]: p.sold[size] + qty }, updated: todayStr() } : p)),
    );
    setDetail((d) => (d && d.id === pid ? { ...d, stock: { ...d.stock, [size]: d.stock[size] - qty }, sold: { ...d.sold, [size]: d.sold[size] + qty } } : d));
    flash(`Recorded sale · ${qty}× size ${size}`);
    closeModal();
  };

  const restock = (pid: string, size: (typeof SIZES)[number], qty: number) => {
    setProducts((ps) => ps.map((p) => (p.id === pid ? { ...p, stock: { ...p.stock, [size]: p.stock[size] + qty }, updated: todayStr() } : p)));
    setDetail((d) => (d && d.id === pid ? { ...d, stock: { ...d.stock, [size]: d.stock[size] + qty } } : d));
    flash(`Restocked ${qty}× size ${size}`);
    closeModal();
  };

  const liveDetail = detail ? products.find((p) => p.id === detail.id) || detail : null;
  const meta = SECTION_META[nav] || SECTION_META.dashboard;

  const sectionProps = {
    products: visible,
    all: products,
    on,
    newId,
    filters,
    setFilters,
    selected,
    toggleOne,
    toggleAll,
    clearSel,
    bulkDelete,
    bulkRestock,
    selCount: selectedVisible.length,
  };

  const renderSection = () => {
    switch (nav) {
      case 'products':
        return <ProductsSection {...sectionProps} />;
      case 'inventory':
        return <InventorySection {...sectionProps} />;
      case 'sales':
        return <SalesSection {...sectionProps} />;
      case 'low':
        return <InventorySection {...sectionProps} heading="Low Stock Products" />;
      case 'out':
        return <InventorySection {...sectionProps} heading="Out of Stock Products" />;
      case 'settings':
        return <SettingsStub />;
      default:
        return <DashboardOverview all={products} on={on} goTo={setNav} />;
    }
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div className="empty">
          <b>Loading NJ&amp;CO inventory…</b>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileView
          section={nav}
          setNav={setNav}
          products={visible}
          all={products}
          on={on}
          query={filters.q}
          setQuery={(v) => setFilters((f) => ({ ...f, q: v }))}
          statusFilter={filters.status}
          setStatusFilter={(v) => setFilters((f) => ({ ...f, status: v }))}
          onAdd={() => setModal({ type: 'add' })}
        />
      ) : (
        <div className={'app' + (collapsed ? ' sidebar-collapsed' : '')}>
          <Sidebar nav={nav} setNav={setNav} counts={counts} />
          <div className="main">
            <TopBar
              title={meta.title}
              subtitle={meta.sub}
              onAdd={() => setModal({ type: 'add' })}
              onToggleSidebar={() => setCollapsed((c) => !c)}
              query={filters.q}
              setQuery={(v) => setFilters((f) => ({ ...f, q: v }))}
            />
            <div className="content">{renderSection()}</div>
          </div>
        </div>
      )}

      {modal?.type === 'add' && <AddProductModal onClose={closeModal} onSave={saveProduct} editing={editing} />}
      {modal?.type === 'sale' && <RecordSaleModal products={products} preselect={modal.product} onClose={closeModal} onSubmit={recordSale} />}
      {modal?.type === 'restock' && <RestockModal products={products} preselect={modal.product} onClose={closeModal} onSubmit={restock} />}
      {liveDetail && <DetailsDrawer p={liveDetail} onClose={() => setDetail(null)} on={on} />}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function SettingsStub() {
  return (
    <div className="panel" style={{ padding: '48px 30px' }}>
      <div className="empty" style={{ padding: '30px 0' }}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <Icon name="settings" />
        </div>
        <b>Settings</b>
        Workspace, team, and store preferences would live here.
      </div>
    </div>
  );
}

export default App;
