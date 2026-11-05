"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Compass, MapPin, Quote, Search, ShieldCheck, Star, Ticket, WalletCards } from "lucide-react";
import type { TourifyDestination } from "@/lib/booking-types";

const sampleReviews = [
  { name: "Nadia Putri", trip: "Pengunjung keluarga", initials: "NP", color: "mint", text: "Seru bisa menikmati banyak wahana di satu tempat. Anak-anak betah dan kami punya banyak cerita buat dibawa pulang." },
  { name: "Rizky Pratama", trip: "Pengunjung Tourify", initials: "RP", color: "peach", text: "Pilihan wahananya beragam, jadi bisa ganti suasana tanpa harus pindah-pindah tempat." },
  { name: "Maya Sari", trip: "Pengunjung bersama teman", initials: "MS", color: "blue", text: "Enak buat jalan bareng teman. Dari wahana yang santai sampai yang bikin deg-degan, semua ada." },
  { name: "Andi Saputra", trip: "Pengunjung Tourify", initials: "AS", color: "lilac", text: "Kami lihat-lihat wahananya lewat website, lalu pesan tiket lewat aplikasi Tourify. Praktis buat persiapan." },
];

export function TourifyHome({ destinations }: { destinations: TourifyDestination[] }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const scrollFrame = useRef<number | null>(null);
  const previousScrollBehavior = useRef<string | null>(null);
  useEffect(() => () => {
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    if (previousScrollBehavior.current !== null) {
      document.documentElement.style.scrollBehavior = previousScrollBehavior.current;
    }
  }, []);
  const visibleDestinations = useMemo(() => {
    const term = submittedQuery.toLowerCase();
    if (!term) return destinations;
    return destinations.filter((item) => `${item.name} ${item.area} ${item.category}`.toLowerCase().includes(term));
  }, [destinations, submittedQuery]);

  function searchDestinations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
    scrollToTarget("wahana", false);
  }

  function scrollToSection(event: ReactMouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    scrollToTarget(sectionId);
  }

  function scrollToTarget(sectionId: string, updateHash = true) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    if (previousScrollBehavior.current !== null) {
      document.documentElement.style.scrollBehavior = previousScrollBehavior.current;
      previousScrollBehavior.current = null;
    }

    const hash = `#${sectionId}`;
    if (updateHash && window.location.hash !== hash) window.history.pushState(null, "", hash);

    const targetTop = Math.min(
      Math.max(target.getBoundingClientRect().top + window.scrollY - 24, 0),
      document.documentElement.scrollHeight - window.innerHeight,
    );
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, targetTop);
      return;
    }

    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    const startedAt = performance.now();
    const duration = 1200;
    previousScrollBehavior.current = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    function animateScroll(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = progress < 0.5
        ? 4 * progress ** 3
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startTop + distance * eased);

      if (progress < 1) {
        scrollFrame.current = requestAnimationFrame(animateScroll);
      } else {
        scrollFrame.current = null;
        document.documentElement.style.scrollBehavior = previousScrollBehavior.current ?? "";
        previousScrollBehavior.current = null;
      }
    }

    scrollFrame.current = requestAnimationFrame(animateScroll);
  }

  return <main className="tourify-home" id="beranda">
    <header className="public-header">
      <Link href="/" className="public-brand" aria-label="Tourify, beranda">
        <Image src="/tourify-logo.png" width={168} height={68} alt="Tourify" priority />
      </Link>
      <nav className="public-nav" aria-label="Navigasi utama">
        <a className="public-nav-active" href="#beranda" onClick={(event) => scrollToSection(event, "beranda")}>Beranda</a>
        <a href="#wahana" onClick={(event) => scrollToSection(event, "wahana")}>Wahana</a>
        <a href="#kenapa-tourify" onClick={(event) => scrollToSection(event, "kenapa-tourify")}>Tentang Tourify</a>
        <a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>Cara pesan</a>
      </nav>
      <Link href="/dashboard" className="public-admin-link">Dashboard Admin <ArrowUpRight size={15} /></Link>
    </header>

    <section className="public-hero">
      <div className="public-hero-image" aria-hidden="true" />
      <div className="public-hero-shade" aria-hidden="true" />
      <div className="public-hero-copy">
        <span className="public-kicker"><Compass size={14} /> HARI SERU MENANTIMU</span>
        <h1>Liburan seru<br />dimulai di <em>Tourify.</em></h1>
        <p>Tourify adalah taman hiburan dengan beragam wahana dan keseruan untuk dinikmati dalam satu kunjungan.</p>
        <div className="public-hero-actions">
          <a className="public-button public-button-light" href="#wahana" onClick={(event) => scrollToSection(event, "wahana")}>Jelajahi wahana <ArrowRight size={16} /></a>
          <a className="public-text-button" href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>Cara berkunjung <ArrowRight size={15} /></a>
        </div>
      </div>
      <form className="public-search-card" onSubmit={searchDestinations}>
        <label className="public-search-field"><span><MapPin size={17} /> Jelajahi Tourify</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau jenis wahana" aria-label="Cari nama atau jenis wahana di Tourify" /></label>
        <div className="public-search-divider" />
        <div className="public-search-note"><span className="public-search-icon"><Ticket size={17} /></span><span><strong>Tiket melalui aplikasi</strong><small>Pesan di aplikasi Tourify</small></span></div>
        <button className="public-search-submit" type="submit" aria-label="Cari wahana"><Search size={19} /></button>
      </form>
      <div className="public-hero-stamp"><strong>1</strong><span>taman hiburan<br />banyak wahana</span></div>
    </section>

    <section className="public-trust-row" id="kenapa-tourify">
      <div className="public-section-label"><span>TENTANG TOURIFY</span><h2>Satu taman hiburan, banyak keseruan.</h2><p>Kenali wahana dan area bermain Tourify sebelum merencanakan kunjungan.</p></div>
      <article className="public-trust-card"><span className="public-trust-icon"><Compass size={21} /></span><strong>Banyak wahana dalam satu tempat</strong><p>Pilih suasana bermain yang kamu suka, semuanya ada di Tourify.</p><span className="public-trust-index">01</span></article>
      <article className="public-trust-card"><span className="public-trust-icon"><WalletCards size={21} /></span><strong>Seru untuk dinikmati bersama</strong><p>Rencanakan hari bermain bersama keluarga atau teman.</p><span className="public-trust-index">02</span></article>
      <article className="public-trust-card"><span className="public-trust-icon"><ShieldCheck size={21} /></span><strong>Pesan lewat aplikasi Tourify</strong><p>Pemesanan tiket dilakukan melalui aplikasi Tourify.</p><span className="public-trust-index">03</span></article>
    </section>

    <section className="public-destinations" id="wahana">
      <div className="public-section-heading">
        <div><span className="public-eyebrow">JELAJAHI TOURIFY</span><h2>Temukan keseruan di setiap wahana.</h2></div>
        <p>Satu taman hiburan dengan beragam area dan pengalaman bermain.</p>
      </div>
      {visibleDestinations.length ? <div className="public-destination-grid">{visibleDestinations.map((destination, index) => <article className="public-destination-card" key={destination.slug}>
        <div className="public-destination-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 42%, rgba(7,22,25,.72) 100%), url("${destination.image}")` }}>
          <span className="public-destination-count">0{index + 1}</span>
          <div className="public-destination-title"><span>{destination.category}</span><h3>{destination.name}</h3><small><MapPin size={13} />{destination.area}</small></div>
        </div>
        <div className="public-destination-footer"><span>Pesan tiket lewat aplikasi</span><a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")} aria-label={`Lihat cara berkunjung ke ${destination.name}`}><ArrowUpRight size={17} /></a></div>
      </article>)}</div> : <div className="public-no-results"><Search size={19} /><strong>Wahana belum ditemukan</strong><span>Coba nama atau jenis wahana lainnya.</span><button type="button" onClick={() => { setQuery(""); setSubmittedQuery(""); }}>Hapus pencarian</button></div>}
      <p className="public-search-result">{submittedQuery ? `${visibleDestinations.length} wahana untuk “${submittedQuery}”` : `${destinations.length} pilihan wahana Tourify`}</p>
    </section>

    <section className="public-promo">
      <div className="public-promo-copy"><span className="public-eyebrow">WAKTUNYA BIKIN CERITA BARU</span><h2>Satu taman,<br /><em>banyak cerita seru.</em></h2><p>Ajak keluarga atau temanmu dan pilih wahana Tourify yang ingin dicoba.</p><a href="#wahana" onClick={(event) => scrollToSection(event, "wahana")} className="public-button public-button-dark">Lihat wahana <ArrowRight size={16} /></a></div>
      <div className="public-promo-photo"><span className="public-promo-caption"><Check size={14} /> Liburan lebih praktis bersama Tourify</span></div>
      <span className="public-promo-orbit public-promo-orbit-one" aria-hidden="true" /><span className="public-promo-orbit public-promo-orbit-two" aria-hidden="true" />
    </section>

    <section className="public-reviews" aria-labelledby="public-reviews-title">
      <div className="public-reviews-heading">
        <div><span className="public-eyebrow">CERITA DARI PENGUNJUNG</span><h2 id="public-reviews-title">Liburan seru, ceritanya lanjut.</h2><p>Contoh ulasan untuk pratinjau tampilan Tourify.</p></div>
        <div className="public-reviews-score"><span className="public-reviews-score-stars" aria-label="5 dari 5 bintang">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill="currentColor" />)}</span><strong>5.0</strong><small>Contoh rating</small></div>
      </div>
      <div className="public-reviews-grid">{sampleReviews.map((review) => <article className="public-review-card" key={review.name}>
        <div className="public-review-card-top"><Quote size={21} /><span className="public-review-stars" aria-label="5 dari 5 bintang">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}</span></div>
        <p>“{review.text}”</p>
        <div className="public-review-author"><span className={`public-review-avatar public-review-avatar-${review.color}`}>{review.initials}</span><span><strong>{review.name}</strong><small>{review.trip}</small></span></div>
      </article>)}</div>
    </section>

    <section className="public-steps" id="cara-pesan">
      <div className="public-steps-heading"><span className="public-eyebrow">CARA BERKUNJUNG</span><h2>Siapkan kunjunganmu ke Tourify.</h2><p>Website ini untuk mengenal taman dan wahananya. Kamu perlu aplikasi Tourify untuk memesan tiket.</p></div>
      <div className="public-step-list"><article><span>01</span><div><strong>Jelajahi wahana</strong><p>Lihat area dan wahana yang ingin kamu coba di Tourify.</p></div><ArrowRight size={18} /></article><article><span>02</span><div><strong>Unduh atau buka aplikasi Tourify</strong><p>Pemesanan tiket hanya tersedia melalui aplikasi Tourify.</p></div><ArrowRight size={18} /></article><article><span>03</span><div><strong>Pesan tiket dan berkunjung</strong><p>Pilih tanggal di aplikasi, lalu siapkan tiketmu saat datang ke Tourify.</p></div><ArrowRight size={18} /></article></div>
    </section>

    <footer className="public-footer">
      <Link href="/" className="public-footer-brand"><Image src="/tourify-logo.png" width={150} height={60} alt="Tourify" /></Link>
      <p>Kenali taman hiburan Tourify. Pemesanan tiket tersedia melalui aplikasi.</p>
      <div className="public-footer-links"><a href="#beranda" onClick={(event) => scrollToSection(event, "beranda")}>Beranda</a><a href="#wahana" onClick={(event) => scrollToSection(event, "wahana")}>Wahana</a><a href="#cara-pesan" onClick={(event) => scrollToSection(event, "cara-pesan")}>Cara pesan</a><Link href="/dashboard">Dashboard Admin <ArrowUpRight size={13} /></Link></div>
      <small>© 2026 Tourify. Semua keseruan dimulai di sini.</small>
    </footer>
  </main>;
}
