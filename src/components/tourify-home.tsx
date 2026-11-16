"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent, MouseEvent as ReactMouseEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MapPin,
  Quote,
  Search,
  Star,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TourifyDestination } from "@/lib/booking-types";

const visitorReviews = [
  {
    name: "Nadia Putri",
    detail: "Main bareng keluarga",
    initials: "NP",
    quote: "Anak-anak betah dari pagi. Satu tempat, banyak pilihan mainnya.",
  },
  {
    name: "Rizky Pratama",
    detail: "Main bareng teman",
    initials: "RP",
    quote: "Dari yang santai sampai yang bikin teriak, semua ada di Tourify.",
  },
  {
    name: "Maya Sari",
    detail: "Pengunjung Tourify",
    initials: "MS",
    quote: "Tempatnya enak buat jalan seharian. Tinggal pilih wahana favorit.",
  },
];

type TourifyHomeProps = {
  destinations: TourifyDestination[];
};

export function TourifyHome({ destinations }: TourifyHomeProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState(destinations[0]?.slug ?? "");
  const [processPhotoIndex, setProcessPhotoIndex] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState<TourifyDestination | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const savedScrollBehavior = useRef<string | null>(null);
  const closeDetailRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const visibleDestinations = useMemo(() => {
    const searchText = submittedQuery.toLowerCase();

    if (!searchText) return destinations;

    return destinations.filter((destination) =>
      `${destination.name} ${destination.area} ${destination.category}`
        .toLowerCase()
        .includes(searchText),
    );
  }, [destinations, submittedQuery]);

  const areaCards = useMemo(() => {
    const areas = new Map<string, TourifyDestination>();

    destinations.forEach((destination) => {
      if (!areas.has(destination.area)) areas.set(destination.area, destination);
    });

    return Array.from(areas.values());
  }, [destinations]);

  const moreAreaImage =
    destinations.find((destination) =>
      !areaCards.some((area) => area.slug === destination.slug),
    )?.image ?? destinations[destinations.length - 1]?.image ?? "/tourify-coast-hero.png";

  const processPhoto = destinations[processPhotoIndex] ?? destinations[0];

  useEffect(() => {
    return () => {
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);

      if (savedScrollBehavior.current !== null) {
        document.documentElement.style.scrollBehavior = savedScrollBehavior.current;
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedDestination) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeDetailRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedDestination(null);
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [selectedDestination]);

  useEffect(() => {
    const selectedIndex = destinations.findIndex((destination) => destination.slug === activeSlug);
    if (selectedIndex >= 0) setProcessPhotoIndex(selectedIndex);
  }, [activeSlug, destinations]);

  useEffect(() => {
    if (
      destinations.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const timer = window.setInterval(() => {
      setProcessPhotoIndex((index) => (index + 1) % destinations.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, [destinations.length]);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>(".tourify-reveal");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const revealOnScroll = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    revealItems.forEach((item) => revealOnScroll.observe(item));
    return () => revealOnScroll.disconnect();
  }, [areaCards, visibleDestinations]);

  function scrollToTarget(sectionId: string, updateHash = true) {
    const target = document.getElementById(sectionId);

    if (!target) return;

    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);

    if (savedScrollBehavior.current !== null) {
      document.documentElement.style.scrollBehavior = savedScrollBehavior.current;
      savedScrollBehavior.current = null;
    }

    if (updateHash && window.location.hash !== `#${sectionId}`) {
      window.history.pushState(null, "", `#${sectionId}`);
    }

    const pageBottom = document.documentElement.scrollHeight - window.innerHeight;
    const targetTop = Math.min(
      Math.max(target.getBoundingClientRect().top + window.scrollY - 20, 0),
      pageBottom,
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetTop);
      return;
    }

    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    const startedAt = performance.now();
    const duration = 1250;

    savedScrollBehavior.current = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    function animateScroll(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress ** 3
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        scrollFrame.current = requestAnimationFrame(animateScroll);
        return;
      }

      scrollFrame.current = null;
      document.documentElement.style.scrollBehavior = savedScrollBehavior.current ?? "";
      savedScrollBehavior.current = null;
    }

    scrollFrame.current = requestAnimationFrame(animateScroll);
  }

  function scrollToSection(
    event: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    event.preventDefault();
    scrollToTarget(sectionId);
  }

  function searchDestinations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchText = query.trim();
    const nextResults = destinations.filter((destination) =>
      `${destination.name} ${destination.area} ${destination.category}`
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );

    setSubmittedQuery(searchText);
    setActiveSlug(nextResults[0]?.slug ?? "");
  }

  function pickArea(destination: TourifyDestination) {
    setQuery(destination.area);
    setSubmittedQuery(destination.area);
    setActiveSlug(destination.slug);
    scrollToTarget("wahana");
  }

  function openDestination(destination: TourifyDestination) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setSelectedDestination(destination);
  }

  return (
    <main className="tourify-home" id="beranda">
      <section className="public-hero">
        <div className="public-hero-photo" aria-hidden="true" />
        <div className="public-hero-shade" aria-hidden="true" />

        <header className="public-header tourify-header-enter">
          <Link href="/" className="public-brand" aria-label="Tourify, beranda">
            <Image
              src="/tourify-logo.png"
              width={168}
              height={68}
              alt="Tourify"
              priority
            />
          </Link>

          <nav className="public-nav" aria-label="Navigasi utama">
            <a href="#beranda" onClick={(event) => scrollToSection(event, "beranda")}>
              Beranda
            </a>
            <a href="#wahana" onClick={(event) => scrollToSection(event, "wahana")}>
              Wahana
            </a>
            <a href="#area-seru" onClick={(event) => scrollToSection(event, "area-seru")}>
              Area bermain
            </a>
            <a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>
              Cara berkunjung
            </a>
          </nav>

          <Link href="/dashboard" className="public-admin-link">
            Dashboard Admin <ArrowUpRight size={15} />
          </Link>
        </header>

        <div className="public-hero-inner">
          <div className="public-hero-copy">
            <h1>
              <span className="public-hero-line">Main sepuasnya.</span>
              <span className="public-hero-line">Pulang bawa</span>
              <span className="public-hero-line"><em>cerita seru.</em></span>
            </h1>
            <p>
              Satu hari penuh wahana, suasana, dan momen seru bareng orang-orang
              tersayang. Selamat datang di Tourify.
            </p>
            <div className="public-hero-actions">
              <a
                className="public-button public-button-light"
                href="#wahana"
                onClick={(event) => scrollToSection(event, "wahana")}
              >
                Jelajahi wahana <ArrowRight size={16} />
              </a>
              <a
                className="public-text-button"
                href="#cara-pesan"
                onClick={(event) => scrollToSection(event, "cara-pesan")}
              >
                Cara berkunjung <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="public-hero-bottom">
            <div className="public-hero-note">
              <span className="public-hero-note-icon"><UsersRound size={17} /></span>
              <span>
                <strong>Untuk keluarga dan teman</strong>
                <small>Temukan wahana yang pas buat harimu</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-area-section" id="area-seru">
        <div className="public-section-heading tourify-reveal">
          <div>
            <span className="public-eyebrow">AREA BERMAIN</span>
            <h2>Satu taman,<br />banyak suasana.</h2>
          </div>
          <p>
            Mau main air, mencoba permainan keluarga, atau menikmati udara
            terbuka? Pilih area yang paling cocok buatmu.
          </p>
        </div>

        <div className="public-area-grid">
          {areaCards.map((destination, index) => (
            <button
              className={
                "public-area-card tourify-reveal" +
                (index === 0 ? " public-area-card-featured" : "")
              }
              key={destination.area}
              type="button"
              onClick={() => pickArea(destination)}
              style={{ transitionDelay: Math.min(index * 90, 270) + "ms" }}
            >
              <span
                className="public-area-photo"
                style={{ backgroundImage: `url("${destination.image}")` }}
                aria-hidden="true"
              />
              <span className="public-area-content">
                <small>{String(index + 1).padStart(2, "0")} / TOURIFY</small>
                <strong>{destination.area}</strong>
                <span>{destination.category} <ArrowUpRight size={15} /></span>
              </span>
            </button>
          ))}
          <a
            className="public-area-card public-area-card-all tourify-reveal"
            href="#wahana"
            onClick={(event) => scrollToSection(event, "wahana")}
            style={{ transitionDelay: Math.min(areaCards.length * 90, 270) + "ms" }}
          >
            <span
              className="public-area-photo"
              style={{ backgroundImage: `url("${moreAreaImage}")` }}
              aria-hidden="true"
            />
            <span className="public-area-content">
              <small>LEBIH BANYAK UNTUK DICOBA</small>
              <strong>Lihat semua wahana</strong>
              <span>Jelajahi pilihan <ArrowRight size={15} /></span>
            </span>
          </a>
        </div>
      </section>

      <section className="public-destinations" id="wahana">
        <div className="public-section-heading tourify-reveal">
          <div>
            <span className="public-eyebrow">WAHANA FAVORIT</span>
            <h2>Pilih serunya harimu.</h2>
          </div>
          <form className="public-search-form" onSubmit={searchDestinations}>
            <label>
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari wahana atau area"
                aria-label="Cari wahana atau area"
              />
            </label>
            <button type="submit" aria-label="Cari">
              <ArrowRight size={17} />
            </button>
          </form>
        </div>

        {visibleDestinations.length > 0 ? (
          <div className="public-ride-grid">
            {visibleDestinations.map((destination, index) => (
              <article
                className="public-ride-card tourify-reveal"
                key={destination.slug}
                style={{ transitionDelay: Math.min(index * 90, 270) + "ms" }}
              >
                <div
                  className="public-ride-photo"
                  style={{ backgroundImage: `url("${destination.image}")` }}
                >
                  <span>{destination.category}</span>
                  <button
                    className="public-ride-arrow"
                    type="button"
                    onClick={() => openDestination(destination)}
                    aria-label={`Tentang ${destination.name}`}
                    title={`Tentang ${destination.name}`}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="public-ride-details">
                  <div>
                    <h3>{destination.name}</h3>
                    <span><MapPin size={13} /> {destination.area}</span>
                  </div>
                  <Ticket size={18} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-no-results">
            <Search size={20} />
            <strong>Wahana belum ditemukan</strong>
            <span>Coba cari nama wahana atau area yang lain.</span>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSubmittedQuery("");
              }}
            >
              Hapus pencarian
            </button>
          </div>
        )}
        <p className="public-search-result">
          {submittedQuery
            ? `${visibleDestinations.length} wahana untuk “${submittedQuery}”`
            : `${destinations.length} pilihan wahana Tourify`}
        </p>
      </section>

      <section className="public-process" id="cara-pesan">
        <div
          className="public-process-photo tourify-reveal"
        >
          <div
            key={processPhoto?.slug ?? "tourify-default"}
            className="public-process-photo-image"
            style={{ backgroundImage: `url("${processPhoto?.image ?? "/tourify-coast-hero.png"}")` }}
            aria-hidden="true"
          />
          {processPhoto && (
            <small className="public-process-photo-name">{processPhoto.name}</small>
          )}
        </div>
        <div className="public-process-content tourify-reveal">
          <span className="public-eyebrow">CARA BERKUNJUNG</span>
          <h2>Siapkan kunjunganmu.</h2>
          <p>
            Kenali taman dan wahananya di sini. Untuk memilih jadwal dan
            memesan tiket, lanjutkan lewat aplikasi Tourify.
          </p>
          <div className="public-step-list">
            <article>
              <span>01</span>
              <div>
                <strong>Pilih wahana favorit</strong>
                <p>Tentukan area yang paling ingin kamu coba.</p>
              </div>
              <ArrowRight size={17} />
            </article>
            <article>
              <span>02</span>
              <div>
                <strong>Siapkan tiket di aplikasi</strong>
                <p>Pilih tanggal dan simpan tiket kunjunganmu.</p>
              </div>
              <ArrowRight size={17} />
            </article>
            <article>
              <span>03</span>
              <div>
                <strong>Datang dan mulai bermain</strong>
                <p>Tunjukkan tiketmu saat tiba, lalu nikmati harimu.</p>
              </div>
              <ArrowRight size={17} />
            </article>
          </div>
        </div>
      </section>

      <section className="public-reviews" id="ulasan">
        <div className="public-reviews-heading tourify-reveal">
          <div>
            <span className="public-eyebrow">CERITA PENGUNJUNG</span>
            <h2>Serunya lanjut jadi cerita.</h2>
          </div>
          <span className="public-review-note">Ulasan contoh</span>
        </div>
        <div className="public-reviews-grid">
          {visitorReviews.map((review, index) => (
            <article
              className="public-review-card tourify-reveal"
              key={review.name}
              style={{ transitionDelay: index * 90 + "ms" }}
            >
              <div className="public-review-card-top">
                <Quote size={22} />
                <span aria-label="5 dari 5 bintang">
                  {Array.from({ length: 5 }, (_, star) => (
                    <Star key={star} size={12} fill="currentColor" />
                  ))}
                </span>
              </div>
              <p>“{review.quote}”</p>
              <div className="public-review-author">
                <span>{review.initials}</span>
                <div>
                  <strong>{review.name}</strong>
                  <small>{review.detail}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-last-call">
        <div className="public-last-call-photo" aria-hidden="true" />
        <div className="public-last-call-shade" aria-hidden="true" />
        <div className="public-last-call-copy">
          <span className="public-eyebrow tourify-reveal">SAMPAI JUMPA DI TOURIFY</span>
          <h2 className="tourify-reveal">Hari seru<br />dimulai di sini.</h2>
          <p className="tourify-reveal">Pilih wahana favorit dan rencanakan hari bermainmu.</p>
          <a
            className="public-button public-button-light tourify-reveal"
            href="#wahana"
            onClick={(event) => scrollToSection(event, "wahana")}
          >
            Lihat semua wahana <ArrowRight size={16} />
          </a>
        </div>
        <span className="public-last-call-mark"><Check size={14} /> Banyak wahana, satu tempat</span>
      </section>

      <footer className="public-footer">
        <div className="public-footer-grid">
          <div className="public-footer-about">
            <Link href="/" className="public-footer-brand" aria-label="Tourify, beranda">
              <Image src="/tourify-logo.png" width={150} height={60} alt="Tourify" />
            </Link>
            <p>Taman hiburan untuk hari-hari yang penuh cerita.</p>
            <span className="public-footer-note"><MapPin size={13} /> Satu taman, banyak keseruan</span>
          </div>
          <nav className="public-footer-group" aria-label="Jelajahi Tourify">
            <h3>Jelajahi</h3>
            <a href="#beranda" onClick={(event) => scrollToSection(event, "beranda")}>Beranda</a>
            <a href="#area-seru" onClick={(event) => scrollToSection(event, "area-seru")}>Area bermain</a>
            <a href="#wahana" onClick={(event) => scrollToSection(event, "wahana")}>Wahana favorit</a>
          </nav>
          <nav className="public-footer-group" aria-label="Info pengunjung">
            <h3>Info pengunjung</h3>
            <a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>Cara berkunjung</a>
            <a href="#ulasan" onClick={(event) => scrollToSection(event, "ulasan")}>Cerita pengunjung</a>
            <Link href="/dashboard">Dashboard Admin <ArrowUpRight size={13} /></Link>
          </nav>
          <div className="public-footer-group public-footer-app">
            <h3>Rencanakan kunjungan</h3>
            <p>Pilih wahana dan siapkan tiketmu lewat aplikasi Tourify.</p>
            <a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>
              Lihat cara berkunjung <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <div className="public-footer-bottom">
          <small>© 2026 Tourify. Semua keseruan dimulai di sini.</small>
          <span><Check size={13} /> Banyak wahana, satu tempat</span>
        </div>
      </footer>

      {selectedDestination && createPortal(
        <div
          className="public-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDestination(null);
          }}
        >
          <section
            className="public-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-detail-title"
            aria-describedby="public-detail-description"
          >
            <div
              className="public-detail-photo"
              style={{ backgroundImage: `url("${selectedDestination.image}")` }}
              role="img"
              aria-label={`Foto ${selectedDestination.name}`}
            />
            <div className="public-detail-copy">
              <button
                ref={closeDetailRef}
                className="public-detail-close"
                type="button"
                onClick={() => setSelectedDestination(null)}
                aria-label="Tutup detail wahana"
              >
                <X size={18} />
              </button>
              <span className="public-eyebrow">TENTANG WAHANA</span>
              <h2 id="public-detail-title">{selectedDestination.name}</h2>
              <div className="public-detail-tags">
                <span><MapPin size={14} /> {selectedDestination.area}</span>
                <span><Ticket size={14} /> {selectedDestination.category}</span>
              </div>
              <p id="public-detail-description">
                {selectedDestination.description ||
                  `${selectedDestination.name} adalah ${selectedDestination.category.toLowerCase()} di ${selectedDestination.area}. Nikmati suasana bermain Tourify dan pilih aktivitas yang paling cocok untuk harimu.`}
              </p>
              <button
                className="public-button public-button-dark"
                type="button"
                onClick={() => {
                  setSelectedDestination(null);
                  window.setTimeout(() => scrollToTarget("cara-pesan"), 0);
                }}
              >
                Cara berkunjung <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </main>
  );
}
