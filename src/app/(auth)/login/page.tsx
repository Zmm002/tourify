"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Check, CircleCheck, LockKeyhole, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        callbackURL: "/dashboard",
      });
      if (result.error) {
        setError(result.error.message ?? "Email atau kata sandi belum cocok.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Belum bisa masuk. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-layout">
    <section className="auth-story">
      <Link className="brand-logo-link" href="/dashboard" aria-label="Tourify"><Image className="brand-image" src="/tourify-logo.png" width={156} height={64} alt="Tourify" priority /></Link>
      <div className="story-copy">
        <span className="eyebrow light-eyebrow">Satu ruang, banyak yang selesai</span>
        <h1>Kerja rapi.<br />Pikiran lega.</h1>
        <p>Satukan tugas, rencana, dan prioritas tim dalam satu ruang kerja yang terasa ringan.</p>
        <div className="story-check"><CircleCheck size={18} /> Tahu apa yang harus dikerjakan hari ini</div>
        <div className="story-check"><CircleCheck size={18} /> Simpan progres tanpa kehilangan konteks</div>
      </div>
      <span className="auth-footnote">Ruang kerja yang mengikuti caramu bekerja.</span>
    </section>
    <section className="auth-form-wrap">
      <div className="auth-form-card">
        <span className="auth-icon"><Check size={21} /></span>
        <span className="eyebrow">Selamat datang kembali</span>
        <h2>Masuk ke Tourify</h2>
        <p className="muted">Lanjutkan dari titik terakhir kamu bekerja.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email<div className="input-icon"><Mail size={17} /><input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required /></div></label>
          <label>Kata sandi<div className="input-icon"><LockKeyhole size={17} /><input name="password" type="password" autoComplete="current-password" placeholder="Masukkan kata sandi" minLength={12} required /></div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-coral auth-submit" type="submit" disabled={busy}>{busy ? "Sedang masuk…" : "Masuk"}<ArrowRight size={17} /></button>
        </form>
        <p className="auth-switch">Belum punya akun? <Link href="/signup">Buat akun</Link></p>
        <div className="auth-note"><LockKeyhole size={15} /> Data akun disimpan dengan aman.</div>
      </div>
    </section>
  </div>;
}
