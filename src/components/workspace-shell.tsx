"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarCheck2,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Filter,
  Home,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Settings,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  tourifyDestinations,
  type BookingDTO,
  type BookingInput,
  type BookingStatus,
  type DestinationInput,
  type TourifyDestination,
} from "@/lib/booking-types";

// Informasi akun yang dipakai oleh sidebar dan header admin.
export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

// Data dan aksi bersama supaya tiap halaman admin memakai sumber yang sama.
type BookingWorkspaceValue = {
  user: WorkspaceUser;
  bookings: BookingDTO[];
  filteredBookings: BookingDTO[];
  loading: boolean;
  error: string;
  destinations: TourifyDestination[];
  createDestination: (
    input: DestinationInput,
  ) => Promise<TourifyDestination | null>;
  statusFilter: "ALL" | BookingStatus;
  setStatusFilter: (value: "ALL" | BookingStatus) => void;
  createBooking: (input: BookingInput) => Promise<BookingDTO | null>;
  updateBooking: (
    id: string,
    input: {
      status?: BookingStatus;
      paymentStatus?: BookingDTO["paymentStatus"];
    },
  ) => Promise<BookingDTO | null>;
  refreshBookings: () => Promise<void>;
  updateUser: (name: string) => Promise<boolean>;
};

// Context menjadi jalur berbagi data antarkomponen di area admin.
const BookingWorkspaceContext =
  createContext<BookingWorkspaceValue | null>(null);

// Daftar menu panel admin beserta ikon dan URL setiap halaman.
const menuGroups = [
  {
    title: "Menu utama",
    items: [
      { href: "/", label: "Beranda Tourify", icon: Home },
      { href: "/dashboard", label: "Dashboard Admin", icon: LayoutDashboard },
      { href: "/bookings", label: "Pemesanan", icon: Ticket },
      { href: "/destinations", label: "Wahana", icon: MapPinned },
      { href: "/customers", label: "Pelanggan", icon: UsersRound },
    ],
  },
  {
    title: "Laporan",
    items: [
      { href: "/reports", label: "Analitik", icon: ChartNoAxesCombined },
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

// Daftar rata untuk mencari label halaman yang sedang dibuka.
const menuItems = menuGroups.flatMap((group) => group.items);

// Pilihan filter booking yang muncul dari tombol filter di header.
const statusOptions: { value: "ALL" | BookingStatus; label: string }[] = [
  { value: "ALL", label: "Semua status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

// Hook ini memberi halaman admin akses ke data dan aksi dari WorkspaceShell.
export function useWorkspace() {
  const workspace = useContext(BookingWorkspaceContext);

  if (!workspace) {
    throw new Error("useWorkspace harus digunakan di dalam WorkspaceShell.");
  }

  return workspace;
}

type WorkspaceShellProps = {
  user: WorkspaceUser;
  children: ReactNode;
};

// Kerangka admin: memuat data, menyediakan context, dan menampilkan navigasi.
export function WorkspaceShell({
  user: initialUser,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [destinations, setDestinations] =
    useState<TourifyDestination[]>(tourifyDestinations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | BookingStatus>("ALL");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Ambil ulang booking setelah admin meminta refresh atau ada aksi terkait.
  const refreshBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Data pemesanan belum bisa dimuat.",
        );
      }

      setBookings(data.bookings as BookingDTO[]);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Data pemesanan belum bisa dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Simpan wahana lewat API dan langsung perbarui katalog di layar.
  const createDestination = useCallback(
    async (input: DestinationInput) => {
      setError("");

      try {
        const response = await fetch("/api/destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Wahana belum bisa disimpan.");
        }

        const destination = data.destination as TourifyDestination;
        setDestinations((current) => [destination, ...current]);
        return destination;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Wahana belum bisa disimpan.",
        );
        return null;
      }
    },
    [],
  );

  // Saat panel dibuka, ambil booking dan daftar wahana akun ini dari server.
  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Data pemesanan belum bisa dimuat.",
          );
        }

        if (isMounted) {
          setBookings(data.bookings as BookingDTO[]);
          setError("");
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Data pemesanan belum bisa dimuat.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function loadDestinations() {
      try {
        const response = await fetch("/api/destinations", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Katalog wahana belum bisa dimuat.");
        }

        if (isMounted) {
          setDestinations(data.destinations as TourifyDestination[]);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Katalog wahana belum bisa dimuat.",
          );
        }
      }
    }

    void loadBookings();
    void loadDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Kirim booking baru dan masukkan hasilnya ke daftar tanpa reload halaman.
  const createBooking = useCallback(async (input: BookingInput) => {
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Pemesanan belum bisa disimpan.");
      }

      const booking = data.booking as BookingDTO;
      setBookings((current) => [booking, ...current]);
      return booking;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Pemesanan belum bisa disimpan.",
      );
      return null;
    }
  }, []);

  // Simpan perubahan status booking lalu ganti datanya di state lokal.
  const updateBooking = useCallback(
    async (
      id: string,
      input: {
        status?: BookingStatus;
        paymentStatus?: BookingDTO["paymentStatus"];
      },
    ) => {
      setError("");

      try {
        const response = await fetch(
          "/api/bookings/" + encodeURIComponent(id),
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ?? "Perubahan pemesanan belum tersimpan.",
          );
        }

        const updatedBooking = data.booking as BookingDTO;
        setBookings((current) =>
          current.map((booking) =>
            booking.id === id ? updatedBooking : booking,
          ),
        );
        return updatedBooking;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Perubahan pemesanan belum tersimpan.",
        );
        return null;
      }
    },
    [],
  );

  // Perbarui nama akun admin di server dan sinkronkan header/sidebar.
  const updateUser = useCallback(async (name: string) => {
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Profil belum bisa diperbarui.");
      }

      setUser((current) => ({ ...current, name: data.user.name }));
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Profil belum bisa diperbarui.",
      );
      return false;
    }
  }, []);

  // Terapkan filter status supaya halaman membaca booking yang sesuai pilihan.
  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          statusFilter === "ALL" || booking.status === statusFilter,
      ),
    [bookings, statusFilter],
  );

  // Memo menjaga nilai context stabil selama data yang dibagikan belum berubah.
  const workspaceValue = useMemo(
    () => ({
      user,
      bookings,
      filteredBookings,
      destinations,
      createDestination,
      loading,
      error,
      statusFilter,
      setStatusFilter,
      createBooking,
      updateBooking,
      refreshBookings,
      updateUser,
    }),
    [
      user,
      bookings,
      filteredBookings,
      destinations,
      createDestination,
      loading,
      error,
      statusFilter,
      createBooking,
      updateBooking,
      refreshBookings,
      updateUser,
    ],
  );

  const activeMenuItem = menuItems.find((item) => item.href === pathname);
  const pageTitle =
    activeMenuItem?.label ??
    (pathname === "/profile" ? "Profil" : "Dashboard");
  const userInitials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "T";

  // Akhiri sesi di server lalu kembali ke halaman masuk.
  async function logout() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <BookingWorkspaceContext.Provider value={workspaceValue}>
      <div className="app-backdrop admin-backdrop">
        <div className="workspace-frame admin-frame">
          {/* Sidebar berisi menu utama, profil, bantuan, dan tombol keluar. */}
          <aside
            className={
              "sidebar admin-sidebar " +
              (mobileNavOpen ? "sidebar-open" : "")
            }
          >
            <div className="sidebar-top admin-sidebar-top">
              <button
                className="menu-toggle"
                aria-label={mobileNavOpen ? "Tutup menu" : "Buka menu"}
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
              <Link
                href="/"
                className="brand-logo-link"
                aria-label="Beranda Tourify"
              >
                <Image
                  className="brand-image"
                  src="/tourify-logo.png"
                  width={156}
                  height={64}
                  alt="Tourify"
                  priority
                />
              </Link>
            </div>

            <nav className="side-nav admin-side-nav" aria-label="Navigasi utama">
              {menuGroups.map((group) => (
                <div className="admin-nav-group" key={group.title}>
                  <span className="admin-nav-heading">{group.title}</span>
                  {group.items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={
                        "nav-link admin-nav-link " +
                        (pathname === href ? "nav-link-active" : "")
                      }
                      aria-current={pathname === href ? "page" : undefined}
                    >
                      <span className="nav-icon">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>

            <div className="sidebar-bottom admin-sidebar-bottom">
              <div className="sidebar-help">
                <CircleHelp size={17} />
                <span>Pusat bantuan</span>
                <ArrowUpRight size={14} />
              </div>

              <button
                className="nav-link logout-link admin-logout"
                onClick={logout}
              >
                <span className="nav-icon">
                  <LogOut size={18} />
                </span>
                <span>Keluar</span>
              </button>

              <Link
                className="sidebar-user admin-sidebar-user"
                href="/profile"
              >
                <div className="avatar avatar-small">{userInitials}</div>
                <div className="sidebar-user-copy">
                  <strong>{user.name}</strong>
                  <span>Admin Tourify</span>
                </div>
                <ChevronDown size={15} />
              </Link>
            </div>
          </aside>

          {/* Area ini memuat judul halaman dan konten rute admin yang aktif. */}
          <section className="workspace-center admin-center">
            <header className="topbar admin-topbar">
              <div className="topbar-heading">
                <button
                  className="mobile-menu-button"
                  aria-label="Buka navigasi"
                  onClick={() => setMobileNavOpen((open) => !open)}
                >
                  <Menu size={21} />
                </button>
                <span className="topbar-title">{pageTitle}</span>
                <span className="topbar-divider">/</span>
                <span className="topbar-crumb">Tourify Admin</span>
              </div>

              <div className="topbar-actions">
                <div className="filter-anchor">
                  <button
                    className={
                      "icon-button " +
                      (filtersOpen ? "icon-button-active" : "")
                    }
                    aria-label="Filter status booking"
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <Filter size={17} />
                  </button>

                  {filtersOpen && (
                    <div className="filter-popover">
                      <strong>Status pemesanan</strong>
                      {statusOptions.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => {
                            setStatusFilter(value);
                            setFiltersOpen(false);
                          }}
                          className={
                            statusFilter === value ? "filter-selected" : ""
                          }
                        >
                          <CalendarCheck2 size={14} />
                          {label}
                          {statusFilter === value && (
                            <span className="filter-check">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/profile"
                  className="admin-top-avatar"
                  aria-label={"Profil " + user.name}
                >
                  <span className="avatar avatar-small">{userInitials}</span>
                </Link>
              </div>
            </header>

            <main className="view-container admin-view-container">
              {children}
            </main>
          </section>
        </div>
      </div>
    </BookingWorkspaceContext.Provider>
  );
}
