"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, CalendarCheck2, ChartNoAxesCombined, ChevronDown, Home,
  CircleHelp, Filter, LayoutDashboard, LogOut, MapPinned, Menu,
  Settings, Ticket, UsersRound, X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { tourifyDestinations, type BookingDTO, type BookingInput, type BookingStatus, type DestinationInput, type TourifyDestination } from "@/lib/booking-types";

export type WorkspaceUser = { id: string; name: string; email: string; image: string | null };
type BookingWorkspaceValue = {
  user: WorkspaceUser;
  bookings: BookingDTO[];
  filteredBookings: BookingDTO[];
  loading: boolean;
  error: string;
  destinations: TourifyDestination[];
  createDestination: (input: DestinationInput) => Promise<TourifyDestination | null>;
  statusFilter: "ALL" | BookingStatus;
  setStatusFilter: (value: "ALL" | BookingStatus) => void;
  createBooking: (input: BookingInput) => Promise<BookingDTO | null>;
  updateBooking: (id: string, input: { status?: BookingStatus; paymentStatus?: BookingDTO["paymentStatus"] }) => Promise<BookingDTO | null>;
  refreshBookings: () => Promise<void>;
  updateUser: (name: string) => Promise<boolean>;
};
const BookingWorkspaceContext = createContext<BookingWorkspaceValue | null>(null);
export function useWorkspace() {
  const value = useContext(BookingWorkspaceContext);
  if (!value) throw new Error("useWorkspace harus digunakan di dalam WorkspaceShell.");
  return value;
}

const menuGroups = [
    { title: "Menu utama", items: [
    { href: "/", label: "Beranda Tourify", icon: Home },
    { href: "/dashboard", label: "Dashboard Admin", icon: LayoutDashboard },
    { href: "/bookings", label: "Pemesanan", icon: Ticket },
    { href: "/destinations", label: "Wahana", icon: MapPinned },
    { href: "/customers", label: "Pelanggan", icon: UsersRound },
  ] },
  { title: "Laporan", items: [
    { href: "/reports", label: "Analitik", icon: ChartNoAxesCombined },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ] },
];

export function WorkspaceShell({ user: initialUser, children }: { user: WorkspaceUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [destinations, setDestinations] = useState<TourifyDestination[]>(tourifyDestinations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function refreshBookings() {
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Data pemesanan belum bisa dimuat.");
      setBookings(payload.bookings as BookingDTO[]);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data pemesanan belum bisa dimuat.");
    } finally { setLoading(false); }
  }

  async function createDestination(input: DestinationInput) {
    setError("");
    try {
      const response = await fetch("/api/destinations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Wahana belum bisa disimpan.");
      const destination = payload.destination as TourifyDestination;
      setDestinations((current) => [destination, ...current]);
      return destination;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wahana belum bisa disimpan.");
      return null;
    }
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/bookings", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Data pemesanan belum bisa dimuat.");
        if (active) { setBookings(payload.bookings as BookingDTO[]); setError(""); }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Data pemesanan belum bisa dimuat.");
      } finally { if (active) setLoading(false); }
    })();
    void (async () => {
      try {
        const response = await fetch("/api/destinations", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Katalog wahana belum bisa dimuat.");
        if (active) setDestinations(payload.destinations as TourifyDestination[]);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Katalog wahana belum bisa dimuat.");
      }
    })();
    return () => { active = false; };
  }, []);

  async function createBooking(input: BookingInput) {
    setError("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Pemesanan belum bisa disimpan.");
      setBookings((current) => [payload.booking as BookingDTO, ...current]);
      return payload.booking as BookingDTO;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pemesanan belum bisa disimpan."); return null; }
  }

  async function updateBooking(id: string, input: { status?: BookingStatus; paymentStatus?: BookingDTO["paymentStatus"] }) {
    setError("");
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Perubahan pemesanan belum tersimpan.");
      setBookings((current) => current.map((booking) => booking.id === id ? payload.booking as BookingDTO : booking));
      return payload.booking as BookingDTO;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan pemesanan belum tersimpan."); return null; }
  }

  async function updateUser(name: string) {
    setError("");
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Profil belum bisa diperbarui.");
      setUser((current) => ({ ...current, name: payload.user.name }));
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Profil belum bisa diperbarui."); return false; }
  }

  const filteredBookings = useMemo(() => bookings.filter((booking) => statusFilter === "ALL" || booking.status === statusFilter), [bookings, statusFilter]);
  const value = useMemo(() => ({ user, bookings, filteredBookings, destinations, createDestination, loading, error, statusFilter, setStatusFilter, createBooking, updateBooking, refreshBookings, updateUser }), [user, bookings, filteredBookings, destinations, loading, error, statusFilter]);
  const current = menuGroups.flatMap((group) => group.items).find((item) => item.href === pathname);
  const title = current?.label ?? (pathname === "/profile" ? "Profil" : "Dashboard");
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "T";

  async function logout() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <BookingWorkspaceContext.Provider value={value}>
    <div className="app-backdrop admin-backdrop">
      <div className="workspace-frame admin-frame">
        <aside className={`sidebar admin-sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-top admin-sidebar-top">
            <button className="menu-toggle" aria-label={mobileNavOpen ? "Tutup menu" : "Buka menu"} onClick={() => setMobileNavOpen((open) => !open)}>{mobileNavOpen ? <X size={19} /> : <Menu size={19} />}</button>
            <Link href="/" className="brand-logo-link" aria-label="Beranda Tourify"><Image className="brand-image" src="/tourify-logo.png" width={156} height={64} alt="Tourify" priority /></Link>
          </div>
          <nav className="side-nav admin-side-nav" aria-label="Navigasi utama">
            {menuGroups.map((group) => <div className="admin-nav-group" key={group.title}>
              <span className="admin-nav-heading">{group.title}</span>
              {group.items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileNavOpen(false)} className={`nav-link admin-nav-link ${pathname === href ? "nav-link-active" : ""}`} aria-current={pathname === href ? "page" : undefined}>
                <span className="nav-icon"><Icon size={18} strokeWidth={1.8} /></span><span>{label}</span>
              </Link>)}
            </div>)}
          </nav>
          <div className="sidebar-bottom admin-sidebar-bottom">
            <div className="sidebar-help"><CircleHelp size={17} /><span>Pusat bantuan</span><ArrowUpRight size={14} /></div>
            <button className="nav-link logout-link admin-logout" onClick={logout}><span className="nav-icon"><LogOut size={18} /></span><span>Keluar</span></button>
            <Link className="sidebar-user admin-sidebar-user" href="/profile"><div className="avatar avatar-small">{initials}</div><div className="sidebar-user-copy"><strong>{user.name}</strong><span>Admin Tourify</span></div><ChevronDown size={15} /></Link>
          </div>
        </aside>

        <section className="workspace-center admin-center">
          <header className="topbar admin-topbar">
            <div className="topbar-heading"><button className="mobile-menu-button" aria-label="Buka navigasi" onClick={() => setMobileNavOpen((open) => !open)}><Menu size={21} /></button><span className="topbar-title">{title}</span><span className="topbar-divider">/</span><span className="topbar-crumb">Tourify Admin</span></div>
            <div className="topbar-actions">
              <div className="filter-anchor"><button className={`icon-button ${filtersOpen ? "icon-button-active" : ""}`} aria-label="Filter status booking" onClick={() => setFiltersOpen((open) => !open)}><Filter size={17} /></button>{filtersOpen && <div className="filter-popover"><strong>Status pemesanan</strong>{[["ALL","Semua status"],["PENDING","Menunggu"],["CONFIRMED","Dikonfirmasi"],["COMPLETED","Selesai"],["CANCELLED","Dibatalkan"]].map(([value,label]) => <button key={value} onClick={() => {setStatusFilter(value as "ALL" | BookingStatus);setFiltersOpen(false);}} className={statusFilter === value ? "filter-selected" : ""}><CalendarCheck2 size={14} />{label}{statusFilter === value && <span className="filter-check">✓</span>}</button>)}</div>}</div>
              <Link href="/profile" className="admin-top-avatar" aria-label={`Profil ${user.name}`}><span className="avatar avatar-small">{initials}</span></Link>
            </div>
          </header>
          <main className="view-container admin-view-container">{children}</main>
        </section>
      </div>
    </div>
  </BookingWorkspaceContext.Provider>;
}
