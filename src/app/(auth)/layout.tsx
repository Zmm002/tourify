// Menaruh halaman login dan daftar di tengah layar dengan gaya autentikasi.
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="auth-page">{children}</main>;
}
