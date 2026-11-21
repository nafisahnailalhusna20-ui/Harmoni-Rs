"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pesan, setPesan] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setPesan("");
        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Username atau password salah.");
                return;
            }

            if (data.role === "admin") {
                router.push("/admin");
            } else if (data.role === "dokter") {
                router.push("/dokter");
            } else {
                router.push("/pasien");
            }
        } catch {
            setPesan("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#eaf1fa] text-[#17345c]">

            {/* BACKGROUND LIGHT */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#b7d5f5] opacity-60 blur-[130px]" />

                <div className="absolute -right-40 top-20 h-[550px] w-[550px] rounded-full bg-[#c5d5f0] opacity-70 blur-[140px]" />

                <div className="absolute bottom-[-200px] left-[35%] h-[600px] w-[600px] rounded-full bg-[#8db8e5] opacity-40 blur-[150px]" />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#17345c 1px, transparent 1px), linear-gradient(90deg, #17345c 1px, transparent 1px)",
                        backgroundSize: "70px 70px",
                    }}
                />
            </div>

            {/* FLOATING ORBITS */}
            <div className="pointer-events-none absolute left-[8%] top-[15%] h-40 w-40 rounded-full border border-white/60" />

            <div className="pointer-events-none absolute right-[10%] top-[18%] h-56 w-56 rounded-full border border-white/50" />

            <div className="pointer-events-none absolute bottom-[8%] right-[20%] h-32 w-32 rounded-full border border-[#8caed5]/30" />

            {/* MAIN CONTENT */}
            <div className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">

                <section className="relative w-full max-w-[1100px]">

                    {/* GLASS CARD */}
                    <div className="relative overflow-hidden rounded-[36px] border border-white/75 bg-white/35 shadow-[0_35px_100px_rgba(35,75,125,0.18)] backdrop-blur-[35px]">

                        {/* INNER LIGHT */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/15 to-[#c8def4]/30" />

                        <div className="relative grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">

                            {/* LEFT BRAND PANEL */}
                            <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#18365f] via-[#315b8b] to-[#6d9dcb] p-8 text-white sm:p-12 lg:p-14">

                                {/* PANEL DECORATION */}
                                <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/15" />

                                <div className="pointer-events-none absolute right-10 top-36 h-52 w-52 rounded-full border border-white/10" />

                                <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#a9d0f3]/20 blur-3xl" />

                                {/* BRAND HEADER */}
                                <div className="relative">

                                    <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl">
                                        <span className="h-2 w-2 rounded-full bg-[#c6e2ff] shadow-[0_0_12px_rgba(198,226,255,0.9)]" />

                                        <span className="text-[10px] font-semibold tracking-[0.22em] text-white/85">
                                            HOSPITAL INFORMATION SYSTEM
                                        </span>
                                    </div>

                                    {/* LOGO MARK */}
                                    <div className="mt-14 flex items-center gap-4">

                                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/25 bg-white/15 shadow-[0_12px_35px_rgba(10,30,60,0.15)] backdrop-blur-xl">
                                            <svg
                                                viewBox="0 0 100 100"
                                                className="h-11 w-11"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <defs>
                                                    <linearGradient id="harmoniLogoBlue" x1="20" y1="15" x2="80" y2="85">
                                                        <stop offset="0%" stopColor="#D9ECFF" />
                                                        <stop offset="100%" stopColor="#7EBAF0" />
                                                    </linearGradient>
                                                </defs>

                                                <path
                                                    d="M50 84C42 76 17 57 17 36C17 20 34 13 48 27C55 17 70 13 82 21C94 31 85 49 72 63L50 84Z"
                                                    fill="url(#harmoniLogoBlue)"
                                                />

                                                <path
                                                    d="M49 83C51 66 52 46 48 28"
                                                    stroke="#17345C"
                                                    strokeWidth="4"
                                                    strokeLinecap="round"
                                                />

                                                <path
                                                    d="M53 37L75 23M55 49L82 37M55 61L76 52"
                                                    stroke="#17345C"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    opacity="0.65"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <h1 className="text-3xl font-semibold tracking-[0.2em] sm:text-4xl">
                                                HARMONI
                                            </h1>

                                            <p className="mt-2 text-[9px] tracking-[0.3em] text-white/65">
                                                CARE THROUGH CONNECTION
                                            </p>
                                        </div>
                                    </div>

                                </div>

                                {/* BRAND STORY */}
                                <div className="relative mt-14 lg:mt-20">

                                    <p className="mb-5 text-[10px] font-semibold tracking-[0.25em] text-[#c8e2ff]">
                                        A SYSTEM WITH CARE
                                    </p>

                                    <h2 className="max-w-md text-4xl font-light leading-[1.2] tracking-[-0.04em] sm:text-5xl">
                                        Every detail
                                        <br />
                                        <span className="font-medium text-[#d6eaff]">
                                            matters.
                                        </span>
                                    </h2>

                                    <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
                                        Menghubungkan informasi, tenaga medis,
                                        dan pelayanan rumah sakit dalam satu
                                        sistem yang terintegrasi.
                                    </p>

                                    {/* DECORATIVE LINE */}
                                    <div className="mt-10 flex items-center gap-3">
                                        <div className="h-px w-16 bg-white/50" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#c6e2ff]" />
                                        <div className="h-px w-8 bg-white/25" />
                                    </div>
                                </div>

                                {/* BRAND FOOTER */}
                                <div className="relative mt-12 flex items-center justify-between border-t border-white/15 pt-6 text-[11px] text-white/65">
                                    <span>HARMONI · 2026</span>
                                    <span>Built with care.</span>
                                </div>

                            </div>

                            {/* RIGHT LOGIN PANEL */}
                            <div className="relative flex items-center justify-center p-8 sm:p-12 lg:p-14">

                                {/* SOFT GLASS LIGHT */}
                                <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-white/70 blur-[90px]" />

                                <div className="relative w-full max-w-[390px]">

                                    {/* TOP LABEL */}
                                    <div className="mb-8">
                                        <div className="mb-4 flex items-center gap-3">
                                            <span className="h-px w-8 bg-[#6d9bc8]" />

                                            <span className="text-[10px] font-semibold tracking-[0.25em] text-[#6d91bd]">
                                                SECURE ACCESS
                                            </span>
                                        </div>

                                        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#17345c] sm:text-[38px]">
                                            Selamat datang.
                                        </h2>

                                        <p className="mt-3 text-sm leading-6 text-[#6e84a3]">
                                            Masuk ke akun Anda untuk
                                            melanjutkan aktivitas di HARMONI.
                                        </p>
                                    </div>

                                    {/* LOGIN FORM */}
                                    <form onSubmit={handleLogin} className="space-y-6">

                                        {/* USERNAME */}
                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="mb-2.5 block text-xs font-semibold tracking-wide text-[#29486f]"
                                            >
                                                Username
                                            </label>

                                            <div className="group relative">
                                                <input
                                                    id="username"
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) =>
                                                        setUsername(e.target.value)
                                                    }
                                                    placeholder="Masukkan username"
                                                    autoComplete="username"
                                                    required
                                                    className="w-full rounded-2xl border border-white/80 bg-white/45 px-5 py-4 text-sm text-[#17345c] shadow-[0_8px_25px_rgba(40,75,120,0.04)] outline-none backdrop-blur-xl transition duration-300 placeholder:text-[#9aacc3] focus:border-[#8db6df] focus:bg-white/75 focus:shadow-[0_0_0_4px_rgba(141,182,223,0.15)]"
                                                />
                                            </div>
                                        </div>

                                        {/* PASSWORD */}
                                        <div>
                                            <label
                                                htmlFor="password"
                                                className="mb-2.5 block text-xs font-semibold tracking-wide text-[#29486f]"
                                            >
                                                Password
                                            </label>

                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                placeholder="Masukkan password"
                                                autoComplete="current-password"
                                                required
                                                className="w-full rounded-2xl border border-white/80 bg-white/45 px-5 py-4 text-sm text-[#17345c] shadow-[0_8px_25px_rgba(40,75,120,0.04)] outline-none backdrop-blur-xl transition duration-300 placeholder:text-[#9aacc3] focus:border-[#8db6df] focus:bg-white/75 focus:shadow-[0_0_0_4px_rgba(141,182,223,0.15)]"
                                            />
                                        </div>

                                        {/* ERROR MESSAGE */}
                                        {pesan && (
                                            <div className="rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm text-red-600 backdrop-blur-xl">
                                                {pesan}
                                            </div>
                                        )}

                                        {/* LOGIN BUTTON */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#19375f] via-[#315b8b] to-[#527fae] py-4 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(34,73,120,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(34,73,120,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-[100%]" />

                                            <span className="relative flex items-center justify-center gap-3">
                                                {loading
                                                    ? "Memproses..."
                                                    : "Masuk ke HARMONI"}

                                                {!loading && (
                                                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                                                        →
                                                    </span>
                                                )}
                                            </span>
                                        </button>

                                    </form>

                                    {/* FOOTER */}
                                    <div className="mt-9">
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b7cce3] to-transparent" />

                                            <span className="text-[9px] font-medium tracking-[0.2em] text-[#91a6c2]">
                                                HARMONI
                                            </span>

                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b7cce3] to-transparent" />
                                        </div>

                                        <p className="mt-5 text-center text-[11px] leading-5 text-[#8da1bc]">
                                            © 2026 HARMONI
                                            <br />
                                            Hospital Information System
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>

                    {/* BOTTOM TAGLINE */}
                    <p className="relative mt-7 text-center text-xs tracking-wide text-[#718eaf]">
                        A connected system, a more harmonious care.
                    </p>

                </section>
            </div>
        </main>
    );
}