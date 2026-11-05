"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signUp.email({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        callbackURL: "/dashboard",
      });
      if (result.error) {
        setError(result.error.message ?? "Akun belum berhasil dibuat.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Akun belum bisa dibuat. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-layout">
    <section className="auth-story">
      <Link className="brand-logo-link" href="/dashboard" aria-label="Tourify"><Image className="brand-image" src="/tourify-logo.png" width={156} height={64} alt="Tourify" priority /></Link>
      <div className="story-copy">
        <span className="eyebrow light-eyebrow">Mulai dari langkah kecil</span>
        <h1>Rencana jadi<br />lebih jelas.</h1>
        <p>Buat ruang kerja pribadimu dan mulai bawa semua rencana ke garis akhir.</p>
        <div className="story-stat-row"><div><strong>01</strong><span>buat tugas</span></div><div><strong>02</strong><span>atur prioritas</span></div><div><strong>03</strong><span>lihat progres</span></div></div>
      </div>
      <span className="auth-footnote">Mulai gratis. Tersimpan di ruang pribadimu.</span>
    </section>
    <section className="auth-form-wrap">
      <div className="auth-form-card">
        <span className="auth-icon"><UserRound size={21} /></span>
        <span className="eyebrow">Ruang kerja barumu</span>
        <h2>Buat akun Tourify</h2>
        <p className="muted">Hanya perlu beberapa detail untuk memulai.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Nama<div className="input-icon"><UserRound size={17} /><input name="name" autoComplete="name" placeholder="Nama lengkap" minLength={2} maxLength={80} required /></div></label>
          <label>Email<div className="input-icon"><Mail size={17} /><input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required /></div></label>
          <label>Kata sandi<div className="input-icon"><LockKeyhole size={17} /><input name="password" type="password" autoComplete="new-password" placeholder="Minimal 12 karakter" minLength={12} maxLength={128} required /></div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-coral auth-submit" type="submit" disabled={busy}>{busy ? "Menyiapkan akun…" : "Buat akun"}<ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">Sudah punya akun? <Link href="/login">Masuk</Link></p>
        <div className="auth-note"><LockKeyhole size={15} /> Kata sandimu tidak pernah ditampilkan.</div>
      </div>
    </section>
  </div>;
}
