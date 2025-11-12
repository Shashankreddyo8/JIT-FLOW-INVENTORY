import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { ShoppingCart, Calendar, ChevronRight, ArrowUpRight, TrendingUp, Sun, Moon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/lib/indianLocalization';
import { motion } from 'framer-motion';

/* Lazy AutoOrderManager (keeps chunk lazy) */
const LazyAutoOrderManager = lazy(() => import('@/components/AutoOrderManager'));

/* Small skeleton for Suspense */
const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-neutral-700 rounded ${className}`} />
);

/* KPI Card */
const KPICard: React.FC<{
  title: string;
  subtitle?: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, subtitle, value, badge, children }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
      <Card className="rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            {badge}
          </CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{value}</p>
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const cardMotion = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.36, ease: 'easeOut' } },
  hover: { scale: 1.02, transition: { duration: 0.12 } }
};

/* --- Types for schedules and auto-orders --- */
type Recurrence =
  | { type: 'once' }
  | { type: 'daily' }
  | { type: 'weekly' }
  | { type: 'monthly' }
  | { type: 'every_n_days'; n: number };

type ScheduleItem = {
  id: string;
  name: string;
  supplierId?: string | null;
  amount: number;
  firstRunISO: string; // ISO datetime string
  recurrence: Recurrence;
  enabled: boolean;
  nextRunISO: string;
  createdAtISO: string;
};

type AutoOrder = {
  id: string;
  orderNumber: string;
  createdAtISO: string;
  suppliers?: { name: string } | null;
  total_amount: number;
};

/* Helper: compute next run after a given date */
function computeNextRun(fromISO: string, recurrence: Recurrence): string {
  const from = new Date(fromISO);
  if (recurrence.type === 'once') return from.toISOString();
  if (recurrence.type === 'daily') {
    const d = new Date(from);
    d.setDate(d.getDate() + 1);
    return d.toISOString();
  }
  if (recurrence.type === 'weekly') {
    const d = new Date(from);
    d.setDate(d.getDate() + 7);
    return d.toISOString();
  }
  if (recurrence.type === 'monthly') {
    const d = new Date(from);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  }
  if (recurrence.type === 'every_n_days') {
    const d = new Date(from);
    d.setDate(d.getDate() + (recurrence.n || 1));
    return d.toISOString();
  }
  return from.toISOString();
}

/* Generate a simple unique id */
const genId = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted');
  }, []);

  /* Theme restore */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('dark');
    } catch {}
  }, []);

  const toggleDark = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {}
  };

  /* ------- Sample data ------- */
  const [inventoryItems] = useState<Array<any>>([
    { id: '1', sku: 'ELC-001', name: 'Circuit Breaker 32A', current_quantity: 150, reorder_point: 30, optimal_quantity: 200, unit_cost: 450 },
    { id: '2', sku: 'ELC-002', name: 'Fuse 5A', current_quantity: 20, reorder_point: 25, optimal_quantity: 100, unit_cost: 10 },
  ]);

  const [recentOrders, setRecentOrders] = useState<Array<any>>([
    { id: 'o1', orderNumber: 'PO-1001', suppliers: { name: 'VASUMATHI ELECTRONIC' }, total_amount: 45000, createdAtISO: new Date().toISOString() }
  ]);

  const [supplierPerformance] = useState<Array<any>>([
    { name: 'VASUMATHI ELECTRONIC', rating: 4.6 },
    { name: 'TechParts Supply Co.', rating: 4.2 },
    { name: 'GlobalComponents', rating: 3.9 },
  ]);

  const suppliers = useMemo(() => (supplierPerformance ?? []).map((s, idx) => ({ id: String(idx + 1), name: s.name, average_delivery_days: 7 })), [supplierPerformance]);

  const totalInventoryValue = useMemo(() => {
    return (inventoryItems ?? []).reduce((s, it) => s + (it?.unit_cost || 0) * (it?.current_quantity || 0), 0);
  }, [inventoryItems]);

  const lowStockItems = useMemo(() => {
    return (inventoryItems ?? []).filter(i => (i?.current_quantity ?? 0) <= (i?.reorder_point ?? 0) + 10);
  }, [inventoryItems]);

  const smallTrend = useMemo(() => [{ name: 'Week 1', value: 120 }, { name: 'Week 2', value: 140 }, { name: 'Week 3', value: 110 }, { name: 'Week 4', value: 150 }], []);

  /* ------- Scheduled orders state (persisted in localStorage) ------- */
  const LS_KEY = 'myapp_schedules_v1';
  const LS_AUTO_ORDERS = 'myapp_autoorders_v1';

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ScheduleItem[];
      return parsed.map(s => ({ ...s }));
    } catch {
      return [];
    }
  });

  // Recent auto orders (generated by scheduler)
  const [autoOrders, setAutoOrders] = useState<AutoOrder[]>(() => {
    try {
      const raw = localStorage.getItem(LS_AUTO_ORDERS);
      if (!raw) return [];
      return JSON.parse(raw) as AutoOrder[];
    } catch {
      return [];
    }
  });

  // persist schedules to localStorage automatically
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(schedules));
    } catch {}
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_AUTO_ORDERS, JSON.stringify(autoOrders));
    } catch {}
  }, [autoOrders]);

  /* Scheduler loop: checks every 30s and runs due schedules while page is open */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSchedules(prev => {
        // produce updates to nextRun for recurring schedules
        const updated = prev.map(s => {
          if (!s.enabled) return s;
          const nextRun = new Date(s.nextRunISO);
          if (nextRun <= now) {
            // fire schedule
            runScheduledOrder(s);
            // compute next run
            if (s.recurrence.type === 'once') {
              return { ...s, enabled: false }; // disable one-time after run
            } else {
              const nextISO = computeNextRun(s.nextRunISO, s.recurrence);
              return { ...s, nextRunISO: nextISO };
            }
          }
          return s;
        });
        return updated;
      });
    }, 30 * 1000); // every 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, autoOrders]);

  /* Run the scheduled order: creates an autoOrder entry (simulate) */
  function runScheduledOrder(schedule: ScheduleItem) {
    const newOrder: AutoOrder = {
      id: genId('ao_'),
      orderNumber: `AUTO-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAtISO: new Date().toISOString(),
      suppliers: schedule.supplierId ? { name: (suppliers.find(s => s.id === schedule.supplierId)?.name || 'Supplier') } : { name: 'Supplier' },
      total_amount: schedule.amount || 0
    };
    setAutoOrders(prev => [newOrder, ...prev].slice(0, 50)); // keep max 50
    // also add to recentOrders (main panel) to show up there
    setRecentOrders(prev => [{ id: genId('po_'), orderNumber: newOrder.orderNumber, suppliers: newOrder.suppliers, total_amount: newOrder.total_amount, createdAtISO: newOrder.createdAtISO }, ...prev].slice(0, 50));
  }

  /* UI helpers: create schedule from form */
  function createScheduleFromForm(form: {
    name: string;
    supplierId?: string | undefined;
    amount: number;
    firstRunISO: string;
    recurrenceType: string;
    recurrenceN?: number;
  }) {
    let recurrence: Recurrence = { type: 'once' };
    if (form.recurrenceType === 'once') recurrence = { type: 'once' };
    else if (form.recurrenceType === 'daily') recurrence = { type: 'daily' };
    else if (form.recurrenceType === 'weekly') recurrence = { type: 'weekly' };
    else if (form.recurrenceType === 'monthly') recurrence = { type: 'monthly' };
    else if (form.recurrenceType === 'every_n') recurrence = { type: 'every_n_days', n: form.recurrenceN || 1 };

    const schedule: ScheduleItem = {
      id: genId('sch_'),
      name: form.name || `Auto order ${new Date().toLocaleString()}`,
      supplierId: form.supplierId || null,
      amount: form.amount || 0,
      firstRunISO: form.firstRunISO,
      recurrence,
      enabled: true,
      nextRunISO: form.firstRunISO,
      createdAtISO: new Date().toISOString()
    };
    setSchedules(prev => [schedule, ...prev]);
  }

  /* UI: delete, toggle, run now */
  function deleteSchedule(id: string) {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }
  function toggleSchedule(id: string) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }
  function runNow(id: string) {
    const s = schedules.find(x => x.id === id);
    if (!s) return;
    runScheduledOrder(s);
    // compute next run if recurring
    if (s.recurrence.type === 'once') {
      setSchedules(prev => prev.map(p => p.id === id ? { ...p, enabled: false } : p));
    } else {
      setSchedules(prev => prev.map(p => p.id === id ? { ...p, nextRunISO: computeNextRun(p.nextRunISO, p.recurrence) } : p));
    }
  }

  /* Format helpers */
  function fmtDateTime(iso?: string) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString();
  }

  /* FORM state for schedule creation (inline in sidebar) */
  const [formState, setFormState] = useState({
    name: '',
    supplierId: suppliers.length > 0 ? suppliers[0].id : '',
    amount: 0,
    firstRunISO: new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16), // default to next minute (YYYY-MM-DDTHH:mm)
    recurrenceType: 'once',
    recurrenceN: 1
  });

  /* small helper to parse form date/time to ISO (browser input type="datetime-local" gives local without timezone) */
  function localInputToISO(localDatetime: string) {
    // input format 'YYYY-MM-DDTHH:mm'
    if (!localDatetime) return new Date().toISOString();
    const d = new Date(localDatetime);
    // If browser produces local timezone, Date constructor would create correct ISO
    return d.toISOString();
  }

  /* Safety: ensure we store schedules with computed nextRun when created */
  useEffect(() => {
    // ensure any schedule with missing nextRun gets computed from firstRun
    setSchedules(prev => prev.map(s => s.nextRunISO ? s : { ...s, nextRunISO: s.firstRunISO }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* safe wrappers */
  const safeInventory = inventoryItems ?? [];
  const safeSuppliers = suppliers ?? [];

  /* -- UI rendering -- */
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Inventory, auto-orders and scheduled orders</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-sky-50 to-white px-3 py-2 rounded-lg shadow-sm border border-sky-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-md shadow-inner"><ShoppingCart className="h-5 w-5 text-sky-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Inventory Value</p>
                <p className="font-semibold">{formatIndianCurrency(totalInventoryValue)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/inventory')}>Manage Inventory</Button>
              <button
                aria-label="Toggle theme"
                onClick={toggleDark}
                className="inline-flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 focus:outline-none focus:ring"
              >
                {document.documentElement.classList.contains('dark') ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Grid: main + sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* MAIN column */}
          <main className="md:col-span-8 lg:col-span-8 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div initial="hidden" animate="enter" variants={cardMotion}>
                <KPICard title="Total Inventory Value" subtitle="Estimated stock value" value={formatIndianCurrency(totalInventoryValue)} badge={<Badge>{(inventoryItems ?? []).length} SKUs</Badge>}>
                  <p className="text-sm text-muted-foreground mt-1">As of today</p>
                </KPICard>
              </motion.div>

              <motion.div whileHover="hover" initial="hidden" animate="enter" variants={cardMotion}>
                <Card className="rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden w-full">
                  <CardHeader>
                    <CardTitle>Inventory Trend</CardTitle>
                    <CardDescription>Last month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={smallTrend} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
                        <defs>
                          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <Tooltip formatter={(val: any) => formatIndianCurrency(val)} />
                        <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#tg)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover="hover" initial="hidden" animate="enter" variants={cardMotion}>
                <Card className="rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden w-full">
                  <CardHeader>
                    <CardTitle>Health</CardTitle>
                    <CardDescription>Quick view</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">Stable</p>
                        <p className="text-sm text-muted-foreground">No critical alerts</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Low stock & recent orders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div initial="hidden" animate="enter" variants={cardMotion}>
                <Card className="rounded-2xl w-full">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Low Stock Items</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>View All</Button>
                  </CardHeader>
                  <CardContent>
                    {lowStockItems.length ? (
                      <div className="space-y-3">
                        {lowStockItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {item.sku} • {item.current_quantity} left</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className="bg-yellow-50 text-yellow-800">Low</Badge>
                              <Button size="sm" variant="ghost" onClick={() => handleReorder(item.id)} aria-label={`Reorder ${item.name}`}>Reorder</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">All inventory levels are healthy</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial="hidden" animate="enter" variants={cardMotion}>
                <Card className="rounded-2xl w-full">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>Recent Purchase Orders</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentOrders.length ? (
                      recentOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
                          <div>
                            <p className="font-medium">{order.orderNumber || order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{order.suppliers?.name || 'No supplier'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{formatIndianCurrency(order.total_amount)}</p>
                            <div className="flex items-center gap-2 mt-1 justify-end">
                              {order.createdAtISO && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> {new Date(order.createdAtISO).toLocaleDateString('en-IN')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">No orders yet</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Automatic Order Manager (main, full width) */}
            <motion.div initial="hidden" animate="enter" variants={cardMotion}>
              <Card className="rounded-2xl w-full">
                <CardHeader>
                  <CardTitle>Automatic Order Management</CardTitle>
                  <CardDescription>Configure auto-reorders, thresholds and approvals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-full">
                    <Suspense fallback={<SkeletonBlock className="h-48 w-full" />}>
                      <div className="w-full max-w-full">
                        <LazyAutoOrderManager inventoryItems={safeInventory} suppliers={safeSuppliers} />
                      </div>
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </main>

          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Scheduled Orders (expanded with form) */}
              <Card className="rounded-2xl w-full">
                <CardHeader>
                  <CardTitle>Scheduled Orders</CardTitle>
                  <CardDescription>Create recurring/one-time auto orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Form to create schedule */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium">Name</label>
                      <input value={formState.name} onChange={(e) => setFormState(s => ({ ...s, name: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1" placeholder="e.g., Weekly fuse reorder" />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Supplier</label>
                      <select value={formState.supplierId} onChange={(e) => setFormState(s => ({ ...s, supplierId: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1">
                        {safeSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        {safeSuppliers.length === 0 && <option value="">(No suppliers)</option>}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Amount (₹)</label>
                      <input type="number" value={formState.amount} onChange={(e) => setFormState(s => ({ ...s, amount: Number(e.target.value) }))} className="mt-1 w-full border rounded px-2 py-1" />
                    </div>

                    <div>
                      <label className="text-xs font-medium">First run (local)</label>
                      <input type="datetime-local" value={formState.firstRunISO} onChange={(e) => setFormState(s => ({ ...s, firstRunISO: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1" />
                    </div>

                    <div>
                      <label className="text-xs font-medium">Recurrence</label>
                      <select value={formState.recurrenceType} onChange={(e) => setFormState(s => ({ ...s, recurrenceType: e.target.value }))} className="mt-1 w-full border rounded px-2 py-1">
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="every_n">Every N days</option>
                      </select>
                    </div>

                    {formState.recurrenceType === 'every_n' && (
                      <div>
                        <label className="text-xs font-medium">N (days)</label>
                        <input type="number" min={1} value={formState.recurrenceN} onChange={(e) => setFormState(s => ({ ...s, recurrenceN: Number(e.target.value) }))} className="mt-1 w-full border rounded px-2 py-1" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={() => {
                        // assemble form and create schedule
                        const iso = localInputToISO(formState.firstRunISO);
                        createScheduleFromForm({
                          name: formState.name || `Auto order ${new Date().toLocaleString()}`,
                          supplierId: formState.supplierId || undefined,
                          amount: formState.amount,
                          firstRunISO: iso,
                          recurrenceType: formState.recurrenceType,
                          recurrenceN: formState.recurrenceN
                        });
                        // reset small fields
                        setFormState(s => ({ ...s, name: '', amount: 0, firstRunISO: new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16), recurrenceType: 'once', recurrenceN: 1 }));
                      }}>Create</Button>
                      <Button variant="ghost" onClick={() => {
                        setFormState(s => ({ ...s, name: '', amount: 0 }));
                      }}>Reset</Button>
                    </div>
                  </div>

                  <hr className="my-3" />

                  {/* list of schedules */}
                  <div className="space-y-3 max-h-60 overflow-auto">
                    {schedules.length === 0 && <p className="text-sm text-muted-foreground">No scheduled orders yet</p>}
                    {schedules.map(s => (
                      <div key={s.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-xs text-muted-foreground">Next: {fmtDateTime(s.nextRunISO)}</p>
                            <p className="text-xs text-muted-foreground">Recurrence: {s.recurrence.type === 'every_n_days' ? `Every ${s.recurrence.n} days` : s.recurrence.type}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-1 items-center">
                              <label className="text-xs">Enabled</label>
                              <input type="checkbox" checked={s.enabled} onChange={() => toggleSchedule(s.id)} />
                            </div>
                            <div className="flex gap-1">
                              <button className="text-xs text-blue-600" onClick={() => runNow(s.id)}>Run now</button>
                              <button className="text-xs text-red-600" onClick={() => deleteSchedule(s.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Auto Orders (shows generated ones) */}
              <Card className="rounded-2xl w-full">
                <CardHeader>
                  <CardTitle>Recent Auto Orders</CardTitle>
                  <CardDescription>Orders generated by schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-auto">
                    {autoOrders.length === 0 && <p className="text-sm text-muted-foreground">No auto orders yet</p>}
                    {autoOrders.map(a => (
                      <div key={a.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{a.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{a.suppliers?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatIndianCurrency(a.total_amount)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(a.createdAtISO).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" className="w-full" onClick={() => { setAutoOrders([]); }}>Clear</Button>
                  </div>
                </CardContent>
              </Card>

              {/* small placeholders */}
              <Card className="rounded-2xl w-full">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => { /* example quick create */ const po = { id: genId('po_'), orderNumber: `AUTO-${Math.floor(Math.random()*9000)+1000}`, suppliers: { name: 'Quick' }, total_amount: 1000, createdAtISO: new Date().toISOString() }; setRecentOrders(p => [po, ...p]); setAutoOrders(p => [{ id: po.id, orderNumber: po.orderNumber, createdAtISO: po.createdAtISO, suppliers: po.suppliers, total_amount: po.total_amount }, ...p]); }}>Create quick order</Button>
                    <Button variant="ghost" onClick={() => { /* open page */ navigate('/auto-orders'); }}>Manage all</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
