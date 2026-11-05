"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Banknote, CalendarCheck2, CalendarDays,
  Check, CheckCircle2, CircleDollarSign, Clock3, Download, MapPinned,
  Plus, RotateCw, ShieldCheck, Ticket, UsersRound, X,
} from "lucide-react";
import { useWorkspace } from "@/components/workspace-shell";
import { tourifyDestinations, type BookingDTO, type BookingInput, type BookingStatus, type DestinationInput, type PaymentStatus } from "@/lib/booking-types";

type View = "dashboard" | "bookings" | "destinations" | "customers" | "reports" | "settings" | "profile";
const statusLabels: Record<BookingStatus, string> = { PENDING: "Menunggu", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" };
const paymentLabels: Record<PaymentStatus, string> = { UNPAID: "Belum dibayar", PAID: "Lunas", REFUNDED: "Dikembalikan" };
const idr = {
  format(value: number) {
    const grouped = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${grouped}`;
  },
};
const idrCompact = {
  format(value: number) {
    const amount = Math.abs(value);
    if (amount < 1000) return idr.format(value);
    const divisor = amount >= 1_000_000_000 ? 1_000_000_000 : amount >= 1_000_000 ? 1_000_000 : 1_000;
    const suffix = divisor === 1_000_000_000 ? " M" : divisor === 1_000_000 ? " jt" : " rb";
    const compact = (Math.round((value / divisor) * 10) / 10).toString().replace(".", ",");
    return `Rp ${compact}${suffix}`;
  },
};
const idNumber = new Intl.NumberFormat("id-ID");

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("id-ID", options).format(new Date(value));
}
function dateInputValue() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date()); }
function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T"; }
function isSameMonth(value: string) { const date = new Date(value); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }

export function BookingAdminPage({ view }: { view: View }) {
  const workspace = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");

  async function create(input: BookingInput) {
    const booking = await workspace.createBooking(input);
    if (booking) {
      setDialogOpen(false);
      setToast(`Booking ${booking.code} berhasil ditambahkan.`);
      window.setTimeout(() => setToast(""), 3200);
    }
  }

  return <>
    {workspace.error && <div className="admin-notice" role="status"><span>{workspace.error}</span><button onClick={() => void workspace.refreshBookings()}><RotateCw size={14} /> Muat ulang</button></div>}
    {view === "dashboard" && <DashboardView onCreate={() => setDialogOpen(true)} />}
    {view === "bookings" && <BookingsView onCreate={() => setDialogOpen(true)} />}
    {view === "destinations" && <DestinationsView />}
    {view === "customers" && <CustomersView />}
    {view === "reports" && <ReportsView />}
    {view === "settings" && <SettingsView />}
    {view === "profile" && <ProfileView />}
    {dialogOpen && <BookingDialog onClose={() => setDialogOpen(false)} onCreate={create} />}
    {toast && <div className="admin-toast"><CheckCircle2 size={17} />{toast}</div>}
  </>;
}

function ViewHeading({ eyebrow, title, description, action, actionLabel = "Booking baru", icon: Icon = Ticket }: { eyebrow: string; title: string; description: string; action?: () => void; actionLabel?: string; icon?: typeof Ticket }) {
  return <div className="view-heading admin-view-heading"><div><span className="eyebrow"><Icon size={14} />{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <button className="button button-coral admin-primary-button" onClick={action}><Plus size={17} />{actionLabel}</button>}</div>;
}

function DashboardView({ onCreate }: { onCreate: () => void }) {
  const { bookings, filteredBookings, loading, user, updateBooking, destinations } = useWorkspace();
  const monthBookings = bookings.filter((booking) => isSameMonth(booking.createdAt));
  const paidRevenue = monthBookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + booking.totalAmount, 0);
  const pendingCount = bookings.filter((booking) => booking.status === "PENDING").length;
  const confirmedCount = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const recent = filteredBookings.slice(0, 5);
  const weekly = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - index));
    const amount = bookings.filter((booking) => {
      const created = new Date(booking.createdAt);
      return created.toDateString() === date.toDateString() && booking.paymentStatus === "PAID";
    }).reduce((sum, booking) => sum + booking.totalAmount, 0);
    return { day: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(date), amount };
  }), [bookings]);
  const maximum = Math.max(1, ...weekly.map((item) => item.amount));
  const popular = destinations.map((destination) => ({ ...destination, count: bookings.filter((booking) => booking.destinationSlug === destination.slug).length })).sort((a, b) => b.count - a.count);

  return <>
    <ViewHeading eyebrow="Ikhtisar operasional" title={`Halo, ${user.name.split(" ")[0]}.`} description="Pantau pemesanan dan wahana di taman Tourify." action={onCreate} />
    <div className="admin-stat-grid">
      <MetricCard label="Total pemesanan" value={idNumber.format(monthBookings.length)} note="Booking bulan ini" icon={Ticket} tint="green" />
      <MetricCard label="Pendapatan masuk" value={idrCompact.format(paidRevenue)} note="Pembayaran lunas bulan ini" icon={CircleDollarSign} tint="blue" />
      <MetricCard label="Menunggu konfirmasi" value={idNumber.format(pendingCount)} note={`${confirmedCount} booking terkonfirmasi`} icon={Clock3} tint="amber" />
    </div>

    <div className="admin-dashboard-grid">
      <section className="admin-panel admin-revenue-panel">
        <div className="admin-panel-heading"><div><span className="eyebrow">Performa</span><h2>Pendapatan booking</h2><p>Transaksi lunas dalam 7 hari terakhir</p></div><span className="admin-period-chip"><CalendarDays size={14} /> 7 hari</span></div>
        <div className="admin-chart-summary"><strong>{idr.format(paidRevenue)}</strong><span className="admin-neutral-trend"><ArrowUpRight size={14} /> Bulan ini</span></div>
        <div className="admin-bar-chart" aria-label="Grafik pendapatan booking tujuh hari terakhir">
          {weekly.map((item, index) => <div className="admin-bar-column" key={`${item.day}-${index}`}><span className="admin-bar-tooltip">{item.amount ? idrCompact.format(item.amount) : ""}</span><div className="admin-bar-track"><i className={index === weekly.length - 1 ? "admin-bar-fill is-current" : "admin-bar-fill"} style={{ height: `${item.amount ? Math.max(6, item.amount / maximum * 100) : 3}%` }} /></div><span className="admin-bar-day">{item.day}</span></div>)}
        </div>
      </section>
      <section className="admin-panel admin-status-panel">
        <div className="admin-panel-heading"><div><span className="eyebrow">Status booking</span><h2>Ringkasan pemesanan</h2></div><Link className="admin-icon-link" href="/bookings" aria-label="Lihat pemesanan"><ArrowUpRight size={17} /></Link></div>
        {bookings.length ? <div className="admin-status-list">{(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]).map((status) => {
          const count = bookings.filter((booking) => booking.status === status).length;
          return <div className="admin-status-row" key={status}><span className={`admin-status-dot status-${status.toLowerCase()}`} /><span>{statusLabels[status]}</span><strong>{count}</strong><i><b style={{ width: `${Math.max(0, count / bookings.length * 100)}%` }} /></i></div>;
        })}</div> : <div className="admin-status-empty"><div className="admin-status-empty-ring"><CalendarCheck2 size={23} /></div><strong>Belum ada pemesanan</strong><span>Ringkasan status akan muncul setelah booking pertama.</span></div>}
      </section>
    </div>

    <div className="admin-lower-grid">
      <section className="admin-panel admin-booking-panel">
        <div className="admin-panel-heading admin-booking-heading"><div><span className="eyebrow">Terbaru</span><h2>Pemesanan terkini</h2></div><Link href="/bookings" className="admin-text-link">Lihat semua <ArrowRight size={15} /></Link></div>
        {loading ? <div className="admin-empty-line">Memuat data pemesanan…</div> : recent.length ? <BookingTable bookings={recent} onUpdate={updateBooking} compact /> : <AdminEmpty title="Belum ada booking masuk" description="Pemesanan baru dari pelanggan akan muncul di sini." action={onCreate} actionLabel="Tambah booking" icon={Ticket} />}
      </section>
      <section className="admin-panel admin-popular-panel">
        <div className="admin-panel-heading"><div><span className="eyebrow">Koleksi Tourify</span><h2>Wahana pilihan</h2></div><Link className="admin-icon-link" href="/destinations" aria-label="Lihat wahana"><ArrowUpRight size={17} /></Link></div>
        <div className="admin-popular-list">{popular.slice(0, 4).map((destination, index) => <div className="admin-popular-row" key={destination.slug}><span className="admin-popular-index">0{index + 1}</span><span className="admin-popular-copy"><strong>{destination.name}</strong><small>{destination.area}</small></span><span className="admin-popular-count">{destination.count}<small> booking</small></span></div>)}</div>
        <Link href="/destinations" className="admin-destination-link">Kelola wahana <ArrowRight size={15} /></Link>
      </section>
    </div>
  </>;
}

function MetricCard({ label, value, note, icon: Icon, tint }: { label: string; value: string; note: string; icon: typeof Ticket; tint: string }) {
  return <article className="admin-metric-card"><span className={`admin-metric-icon metric-${tint}`}><Icon size={18} /></span><span className="admin-metric-label">{label}</span><strong>{value}</strong><span className="admin-metric-note">{note}</span><ArrowUpRight size={15} className="admin-metric-trend" /></article>;
}

function BookingsView({ onCreate }: { onCreate: () => void }) {
  const { filteredBookings, loading, statusFilter, setStatusFilter, updateBooking } = useWorkspace();
  const filters: Array<["ALL" | BookingStatus, string]> = [["ALL", "Semua"], ["PENDING", "Menunggu"], ["CONFIRMED", "Dikonfirmasi"], ["COMPLETED", "Selesai"], ["CANCELLED", "Dibatalkan"]];
  return <>
    <ViewHeading eyebrow="Kelola transaksi" title="Pemesanan" description="Tinjau data pelanggan, jadwal kunjungan, dan pembayaran." action={onCreate} />
    <section className="admin-panel admin-table-panel">
      <div className="admin-table-toolbar"><div className="admin-filter-tabs">{filters.map(([value, label]) => <button className={statusFilter === value ? "is-selected" : ""} key={value} onClick={() => setStatusFilter(value)}>{label}{value === "ALL" && <span>{filteredBookings.length}</span>}</button>)}</div><span className="admin-table-count">{filteredBookings.length} pemesanan</span></div>
      {loading ? <div className="admin-empty-line">Memuat data pemesanan…</div> : <BookingTable bookings={filteredBookings} onUpdate={updateBooking} emptyTitle="Belum ada pemesanan" emptyDescription="Tambahkan booking pertama atau tunggu pesanan pelanggan masuk." emptyAction={onCreate} />}
    </section>
    <p className="admin-data-note"><ShieldCheck size={14} /> Data pemesanan hanya dapat dilihat oleh akun admin yang membuatnya.</p>
  </>;
}

function BookingTable({ bookings, onUpdate, compact = false, readOnly = false, emptyTitle = "Belum ada data", emptyDescription = "Data akan muncul di sini.", emptyAction }: { bookings: BookingDTO[]; onUpdate: (id: string, input: { status?: BookingStatus; paymentStatus?: PaymentStatus }) => Promise<BookingDTO | null>; compact?: boolean; readOnly?: boolean; emptyTitle?: string; emptyDescription?: string; emptyAction?: () => void }) {
  if (!bookings.length) return <AdminEmpty title={emptyTitle} description={emptyDescription} action={emptyAction} actionLabel="Tambah booking" icon={Ticket} compact={compact} />;
  return <div className="admin-table-wrap"><table className="admin-booking-table"><thead><tr><th>Kode booking</th><th>Pelanggan</th><th>Wahana</th><th>Kunjungan</th><th>Tiket</th><th>Total</th><th>Status</th><th>Pembayaran</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}>
    <td><span className="admin-booking-code">{booking.code}</span><small className="admin-booking-created">{formatDate(booking.createdAt)}</small></td>
    <td><span className="admin-customer-cell"><span className="admin-customer-avatar">{initials(booking.customerName)}</span><span><strong>{booking.customerName}</strong><small>{booking.customerEmail}</small></span></span></td>
    <td><strong className="admin-destination-cell">{booking.destinationName}</strong></td>
    <td>{formatDate(booking.visitDate)}</td>
    <td>{booking.ticketCount} tiket</td>
    <td><strong>{idr.format(booking.totalAmount)}</strong></td>
    <td>{readOnly ? <span className={`admin-status-badge status-${booking.status.toLowerCase()}`}>{statusLabels[booking.status]}</span> : <select aria-label={`Status ${booking.code}`} className={`admin-select-status status-${booking.status.toLowerCase()}`} value={booking.status} onChange={(event) => void onUpdate(booking.id, { status: event.target.value as BookingStatus })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
    <td>{readOnly ? <span className={`admin-status-badge payment-${booking.paymentStatus.toLowerCase()}`}>{paymentLabels[booking.paymentStatus]}</span> : <select aria-label={`Pembayaran ${booking.code}`} className={`admin-select-payment payment-${booking.paymentStatus.toLowerCase()}`} value={booking.paymentStatus} onChange={(event) => void onUpdate(booking.id, { paymentStatus: event.target.value as PaymentStatus })}>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
  </tr>)}</tbody></table></div>;
}

function DestinationsView() {
  const { bookings, destinations, createDestination, error } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");

  async function create(input: DestinationInput) {
    const destination = await createDestination(input);
    if (!destination) return false;
    setDialogOpen(false);
    setToast(`${destination.name} berhasil ditambahkan.`);
    window.setTimeout(() => setToast(""), 3200);
    return true;
  }

  return <>
    <ViewHeading eyebrow="Katalog Tourify" title="Wahana" description="Kelola wahana dan area bermain di taman Tourify." action={() => setDialogOpen(true)} actionLabel="Tambah wahana" icon={MapPinned} />
    <div className="admin-destination-grid">{destinations.map((destination, index) => {
      const count = bookings.filter((booking) => booking.destinationSlug === destination.slug).length;
      return <article className="admin-destination-card" key={destination.slug}>
        <div className="admin-destination-photo" style={{ backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(19,36,42,.72)), url("${destination.image}")` }}><span className="admin-destination-category">{destination.category}</span><span className="admin-destination-number">{String(index + 1).padStart(2, "0")}</span><span className="admin-destination-photo-title">{destination.name}</span></div>
        <div className="admin-destination-card-body"><div><span className="admin-location"><MapPinned size={14} />{destination.area}</span><strong>{idr.format(destination.price)} <small>/ tiket</small></strong></div><span className="admin-destination-bookings">{count} booking</span></div>
      </article>;
    })}</div>
    <section className="admin-destination-note"><div className="admin-note-icon"><CompassIcon /></div><div><strong>Katalog wahana Tourify</strong><span>Kelola informasi dan harga wahana untuk pemesanan tiket.</span></div><Link href="/bookings">Lihat pemesanan <ArrowRight size={15} /></Link></section>
    {dialogOpen && <DestinationDialog onClose={() => setDialogOpen(false)} onCreate={create} error={error} />}
    {toast && <div className="admin-toast"><CheckCircle2 size={17} />{toast}</div>}
  </>;
}

function CompassIcon() { return <MapPinned size={19} />; }

function DestinationDialog({ onClose, onCreate, error }: { onClose: () => void; onCreate: (input: DestinationInput) => Promise<boolean>; error: string }) {
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const data = new FormData(event.currentTarget);
    await onCreate({
      name: String(data.get("name") ?? "").trim(),
      area: String(data.get("area") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(),
      price: Number(data.get("price")),
      image: String(data.get("image") ?? "").trim() || undefined,
      description: String(data.get("description") ?? "").trim(),
    });
    setSaving(false);
  }

  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="admin-booking-modal admin-destination-modal" role="dialog" aria-modal="true" aria-labelledby="admin-destination-modal-title">
      <div className="admin-modal-heading"><div><span className="eyebrow">Katalog Tourify</span><h2 id="admin-destination-modal-title">Tambah wahana</h2></div><button className="admin-modal-close" type="button" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div>
      <form onSubmit={submit} className="admin-booking-form admin-destination-form">
        <div className="admin-form-grid">
          <label>Nama wahana<input name="name" placeholder="Contoh: Taman Petualangan" minLength={2} maxLength={100} required autoFocus /></label>
          <label>Area / zona<input name="area" placeholder="Contoh: Zona Air" minLength={2} maxLength={100} required /></label>
          <label>Jenis wahana<select name="category" defaultValue="Wahana keluarga"><option>Wahana keluarga</option><option>Wahana air</option><option>Atraksi indoor</option><option>Permainan</option><option>Lainnya</option></select></label>
          <label>Harga tiket<input name="price" type="number" min={1000} max={50000000} step={1000} placeholder="100000" required /></label>
          <label className="admin-destination-wide">Tautan foto <small>(opsional, HTTPS)</small><input name="image" type="url" placeholder="https://..." maxLength={500} /></label>
          <label className="admin-destination-wide">Deskripsi <small>(opsional)</small><textarea name="description" placeholder="Ceritakan singkat tentang wahana ini" maxLength={500} rows={3} /></label>
        </div>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions"><button className="button button-light" type="button" onClick={onClose}>Batal</button><button className="button button-coral admin-primary-button" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan wahana"}<ArrowRight size={15} /></button></div>
      </form>
    </section>
  </div>;
}

function CustomersView() {
  const { bookings, filteredBookings, loading } = useWorkspace();
  const customers = useMemo(() => {
    const grouped = new Map<string, { name: string; email: string; phone: string | null; count: number; paid: number; latest: string }>();
    for (const booking of filteredBookings) {
      const key = booking.customerEmail.toLowerCase();
      const previous = grouped.get(key);
      grouped.set(key, {
        name: previous?.name ?? booking.customerName,
        email: booking.customerEmail,
        phone: previous?.phone ?? booking.customerPhone,
        count: (previous?.count ?? 0) + 1,
        paid: (previous?.paid ?? 0) + (booking.paymentStatus === "PAID" ? booking.totalAmount : 0),
        latest: previous?.latest && new Date(previous.latest) > new Date(booking.createdAt) ? previous.latest : booking.createdAt,
      });
    }
    return [...grouped.values()].sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest));
  }, [filteredBookings]);
  return <>
    <ViewHeading eyebrow="Relasi pelanggan" title="Pelanggan" description="Kenali pengunjung yang memesan lewat Tourify." />
    <div className="admin-customer-summary"><div><span className="admin-metric-icon metric-green"><UsersRound size={18} /></span><strong>{idNumber.format(new Set(bookings.map((booking) => booking.customerEmail.toLowerCase())).size)}</strong><span>Pelanggan unik</span></div><div><span className="admin-metric-icon metric-blue"><Ticket size={18} /></span><strong>{idNumber.format(bookings.reduce((sum, booking) => sum + booking.ticketCount, 0))}</strong><span>Total tiket terjual</span></div><div><span className="admin-metric-icon metric-amber"><Banknote size={18} /></span><strong>{idrCompact.format(bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + booking.totalAmount, 0))}</strong><span>Nilai pembayaran lunas</span></div></div>
    <section className="admin-panel admin-table-panel"><div className="admin-panel-heading admin-booking-heading"><div><span className="eyebrow">Direktori</span><h2>Daftar pelanggan</h2></div><span className="admin-table-count">{customers.length} pelanggan</span></div>
      {loading ? <div className="admin-empty-line">Memuat data pelanggan…</div> : customers.length ? <div className="admin-table-wrap"><table className="admin-booking-table admin-customer-table"><thead><tr><th>Pelanggan</th><th>Kontak</th><th>Jumlah booking</th><th>Belanja lunas</th><th>Pelanggan sejak</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.email}><td><span className="admin-customer-cell"><span className="admin-customer-avatar">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>Pengunjung Tourify</small></span></span></td><td><span className="admin-contact-stack">{customer.email}<small>{customer.phone || "Nomor telepon belum tersedia"}</small></span></td><td>{customer.count} booking</td><td><strong>{idr.format(customer.paid)}</strong></td><td>{formatDate(customer.latest)}</td></tr>)}</tbody></table></div> : <AdminEmpty title="Belum ada pelanggan" description="Pelanggan akan otomatis tercatat saat booking dibuat." icon={UsersRound} />}
    </section>
  </>;
}

function ReportsView() {
  const { bookings, filteredBookings } = useWorkspace();
  const months = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - index));
    const monthBookings = bookings.filter((booking) => {
      const created = new Date(booking.createdAt);
      return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear() && booking.paymentStatus === "PAID";
    });
    return { label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date), total: monthBookings.reduce((sum, booking) => sum + booking.totalAmount, 0), count: monthBookings.length };
  }), [bookings]);
  const max = Math.max(1, ...months.map((month) => month.total));
  const paid = bookings.filter((booking) => booking.paymentStatus === "PAID");
  const conversion = bookings.length ? Math.round(paid.length / bookings.length * 100) : 0;

  function exportCsv() {
    const header = ["Kode booking", "Nama pelanggan", "Email", "Telepon", "Wahana", "Tanggal kunjungan", "Jumlah tiket", "Total", "Status booking", "Status pembayaran"];
    const rows = filteredBookings.map((booking) => [booking.code, booking.customerName, booking.customerEmail, booking.customerPhone ?? "", booking.destinationName, formatDate(booking.visitDate), booking.ticketCount, booking.totalAmount, statusLabels[booking.status], paymentLabels[booking.paymentStatus]]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `tourify-laporan-${dateInputValue()}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <>
    <ViewHeading eyebrow="Kinerja bisnis" title="Analitik" description="Ringkasan penjualan tiket dan tren booking Tourify." action={exportCsv} actionLabel="Ekspor laporan" icon={ArrowUpRight} />
    <div className="admin-stat-grid">
      <MetricCard label="Total pendapatan lunas" value={idrCompact.format(paid.reduce((sum, booking) => sum + booking.totalAmount, 0))} note="Semua transaksi terbayar" icon={CircleDollarSign} tint="green" />
      <MetricCard label="Booking terbayar" value={idNumber.format(paid.length)} note={`${bookings.length} total pemesanan`} icon={Ticket} tint="blue" />
      <MetricCard label="Rasio pembayaran" value={`${conversion}%`} note="Booking lunas dari total booking" icon={CheckCircle2} tint="amber" />
    </div>
    <section className="admin-panel admin-report-panel"><div className="admin-panel-heading"><div><span className="eyebrow">6 bulan terakhir</span><h2>Tren pendapatan</h2><p>Nilai transaksi dengan status pembayaran lunas.</p></div><span className="admin-period-chip"><CalendarDays size={14} /> Bulanan</span></div>
      <div className="admin-month-chart">{months.map((month) => <div className="admin-month-column" key={month.label}><strong>{month.total ? idrCompact.format(month.total) : ""}</strong><div><i style={{ height: `${month.total ? Math.max(6, month.total / max * 100) : 2}%` }} /></div><span>{month.label}</span></div>)}</div>
    </section>
    <section className="admin-panel admin-table-panel admin-report-table"><div className="admin-panel-heading admin-booking-heading"><div><span className="eyebrow">Rekap transaksi</span><h2>Detail pemesanan</h2></div><button className="admin-text-button" onClick={exportCsv}><Download size={15} /> Unduh CSV</button></div>
      <BookingTable bookings={filteredBookings.slice(0, 10)} onUpdate={async () => null} readOnly emptyTitle="Belum ada data laporan" emptyDescription="Laporan akan terisi setelah booking Tourify tercatat." />
    </section>
  </>;
}

function SettingsView() {
  const { user, bookings } = useWorkspace();
  return <>
    <ViewHeading eyebrow="Preferensi akun" title="Pengaturan" description="Kelola informasi akun dan keamanan ruang admin." icon={ShieldCheck} />
    <div className="admin-settings-grid"><section className="admin-panel admin-settings-panel"><span className="eyebrow">Profil administrator</span><h2>Informasi akun</h2><p>Perbarui nama yang digunakan pada panel admin Tourify.</p><ProfileForm /><div className="admin-settings-rule" /><div className="admin-setting-row"><span className="admin-setting-icon"><ShieldCheck size={17} /></span><span><strong>Sesi terlindungi</strong><small>Akun dipisahkan berdasarkan pemilik dan login memakai sesi aman.</small></span><CheckCircle2 size={17} className="admin-setting-check" /></div><div className="admin-setting-row"><span className="admin-setting-icon"><Ticket size={17} /></span><span><strong>Data booking pribadi</strong><small>{bookings.length} pemesanan tersimpan untuk akun ini.</small></span><CheckCircle2 size={17} className="admin-setting-check" /></div></section>
      <section className="admin-security-card"><div className="admin-security-mark"><span><ShieldCheck size={28} /></span><i /><i /></div><span className="eyebrow">Tourify Admin</span><h2>Data pengunjung tetap terjaga.</h2><p>Detail pelanggan dan transaksi tersimpan di PostgreSQL, dengan akses terbatas pada akun pengelola.</p><div className="admin-security-line"><Check size={15} /> Session login yang aman</div><div className="admin-security-line"><Check size={15} /> Booking terpisah per akun admin</div></section></div>
    <div className="admin-settings-footnote">Ada yang perlu dibantu? Hubungi tim Tourify untuk dukungan akun pengelola.</div>
    <span className="admin-settings-hidden-email" aria-hidden="true">{user.email}</span>
  </>;
}

function ProfileView() {
  const { user, bookings } = useWorkspace();
  return <>
    <ViewHeading eyebrow="Akun pengelola" title="Profil admin" description="Informasi akun yang digunakan untuk mengelola Tourify." icon={UsersRound} />
    <div className="admin-profile-layout"><section className="admin-panel admin-profile-card"><div className="admin-profile-cover"><div className="admin-profile-avatar">{initials(user.name)}</div><span className="admin-active-label"><i />Admin aktif</span></div><div className="admin-profile-body"><span className="eyebrow">Administrator Tourify</span><h2>{user.name}</h2><p>{user.email}</p><div className="admin-profile-stats"><span><strong>{idNumber.format(bookings.length)}</strong>Total booking</span><span><strong>{idrCompact.format(bookings.filter((booking) => booking.paymentStatus === "PAID").reduce((sum, booking) => sum + booking.totalAmount, 0))}</strong>Pendapatan lunas</span></div></div></section><section className="admin-panel admin-settings-panel"><span className="eyebrow">Pengaturan akun</span><h2>Perbarui profil</h2><p>Gunakan nama yang mudah dikenali tim kamu.</p><ProfileForm /></section></div>
  </>;
}

function ProfileForm() {
  const { user, updateUser } = useWorkspace();
  const [name, setName] = useState(user.name);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setNotice("");
    const ok = await updateUser(name.trim()); setSaving(false);
    setNotice(ok ? "Nama admin berhasil diperbarui." : "Perubahan belum tersimpan.");
  }
  return <form className="admin-profile-form" onSubmit={submit}><label>Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required /></label><label>Email login<input value={user.email} disabled /></label>{notice && <span className={notice.includes("berhasil") ? "admin-success-copy" : "admin-form-error"} role="status">{notice}</span>}<button className="button button-coral admin-primary-button" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan perubahan"}<ArrowRight size={15} /></button></form>;
}

function AdminEmpty({ title, description, action, actionLabel, icon: Icon = Ticket, compact = false }: { title: string; description: string; action?: () => void; actionLabel?: string; icon?: typeof Ticket; compact?: boolean }) {
  return <div className={`admin-empty-state ${compact ? "is-compact" : ""}`}><span className="admin-empty-icon"><Icon size={22} /></span><strong>{title}</strong><p>{description}</p>{action && <button className="button button-light admin-empty-button" onClick={action}><Plus size={15} />{actionLabel ?? "Booking baru"}</button>}</div>;
}

function BookingDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (input: BookingInput) => Promise<void> }) {
  const { error, destinations } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [destinationSlug, setDestinationSlug] = useState(destinations[0]?.slug ?? tourifyDestinations[0].slug);
  const [ticketCount, setTicketCount] = useState(1);
  const destination = destinations.find((item) => item.slug === destinationSlug) ?? destinations[0] ?? tourifyDestinations[0];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const data = new FormData(event.currentTarget);
    await onCreate({
      customerName: String(data.get("customerName") ?? "").trim(),
      customerEmail: String(data.get("customerEmail") ?? "").trim(),
      customerPhone: String(data.get("customerPhone") ?? "").trim(),
      destinationSlug,
      visitDate: String(data.get("visitDate") ?? ""),
      ticketCount,
      paymentStatus: data.get("paymentStatus") as PaymentStatus,
    });
    setSaving(false);
  }
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="admin-booking-modal" role="dialog" aria-modal="true" aria-labelledby="admin-booking-modal-title"><div className="admin-modal-heading"><div><span className="eyebrow">Pemesanan manual</span><h2 id="admin-booking-modal-title">Tambah booking</h2></div><button className="admin-modal-close" onClick={onClose} aria-label="Tutup"><X size={19} /></button></div><form onSubmit={submit} className="admin-booking-form"><div className="admin-form-grid"><label>Nama pelanggan<input name="customerName" placeholder="Nama lengkap" minLength={2} maxLength={100} required autoFocus /></label><label>Email pelanggan<input name="customerEmail" type="email" placeholder="nama@email.com" maxLength={254} required /></label><label>Nomor telepon <small>(opsional)</small><input name="customerPhone" type="tel" placeholder="08xx xxxx xxxx" maxLength={30} /></label><label>Wahana<select value={destinationSlug} onChange={(event) => setDestinationSlug(event.target.value)}>{destinations.map((item) => <option value={item.slug} key={item.slug}>{item.name} — {item.area}</option>)}</select></label><label>Tanggal kunjungan<input name="visitDate" type="date" min={dateInputValue()} required /></label><label>Jumlah tiket<select value={ticketCount} onChange={(event) => setTicketCount(Number(event.target.value))}>{Array.from({ length: 20 }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1} tiket</option>)}</select></label><label>Status pembayaran<select name="paymentStatus" defaultValue="UNPAID"><option value="UNPAID">Belum dibayar</option><option value="PAID">Lunas</option></select></label></div><div className="admin-price-preview"><span><small>Perkiraan total</small><strong>{idr.format(destination.price * ticketCount)}</strong></span><span>{destination.name} · {ticketCount} tiket</span></div>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button className="button button-light" type="button" onClick={onClose}>Batal</button><button className="button button-coral admin-primary-button" type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan booking"}<ArrowRight size={15} /></button></div></form></section></div>;
}
