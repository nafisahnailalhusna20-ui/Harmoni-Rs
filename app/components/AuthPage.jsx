"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage({ mode = "login" }) {
    const router = useRouter();

    const [isRegister, setIsRegister] = useState(mode === "register");
    const switchingRef = useRef(false);
    const switchTimerRef = useRef(null);

    useEffect(() => {
        function syncModeFromUrl() {
            const registerMode = window.location.pathname.replace(/\/$/, "") === "/register";
            setIsRegister(registerMode);
            switchingRef.current = false;
            if (switchTimerRef.current) {
                window.clearTimeout(switchTimerRef.current);
                switchTimerRef.current = null;
            }
        }

        window.addEventListener("popstate", syncModeFromUrl);
        return () => {
            window.removeEventListener("popstate", syncModeFromUrl);
            if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
        };
    }, []);
    const [loading, setLoading] = useState(false);
    const [pesan, setPesan] = useState("");
    const [berhasil, setBerhasil] = useState(false);

    const [loginForm, setLoginForm] = useState({
        username: "",
        password: "",
    });

    const [registerForm, setRegisterForm] = useState({
        full_name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    function switchMode(mode) {
        if (switchingRef.current || mode === isRegister) return;

        switchingRef.current = true;
        setPesan("");
        setBerhasil(false);
        setIsRegister(mode);

        if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current);
        switchTimerRef.current = window.setTimeout(() => {
            const destination = mode ? "/register" : "/login";
            window.history.pushState(null, "", destination);
            switchingRef.current = false;
            switchTimerRef.current = null;
        }, 880);
    }

    function handleLoginChange(event) {
        const { name, value } = event.target;

        setLoginForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleRegisterChange(event) {
        const { name, value } = event.target;

        setRegisterForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleLogin(event) {
        event.preventDefault();

        setPesan("");
        setBerhasil(false);
        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginForm),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Login gagal.");
                return;
            }

            setBerhasil(true);
            setPesan(data.message || "Login berhasil!");

            if (data.role === "admin") {
                router.push("/admin");
            } else if (data.role === "dokter") {
                router.push("/dokter");
            } else if (data.role === "pasien") {
                router.push("/pasien");
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            setPesan("Tidak dapat terhubung ke server.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        setPesan("");
        setBerhasil(false);

        if (
            registerForm.password !==
            registerForm.confirmPassword
        ) {
            setPesan("Konfirmasi password tidak sama.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    full_name: registerForm.full_name,
                    username: registerForm.username,
                    email: registerForm.email,
                    phone: registerForm.phone,
                    password: registerForm.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Pendaftaran gagal.");
                return;
            }

            setBerhasil(true);
            setPesan(data.message || "Pendaftaran berhasil!");

            setRegisterForm({
                full_name: "",
                username: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                router.push("/login");
            }, 1400);
        } catch (error) {
            console.error("Register error:", error);
            setPesan("Tidak dapat terhubung ke server.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-[15px] border border-white/75 bg-white/45 px-4 py-3 text-sm text-[#24476D] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_5px_18px_rgba(64,111,159,0.04)] outline-none backdrop-blur-xl transition duration-300 placeholder:text-[#91A9C5] hover:bg-white/60 focus:border-[#8AB8DD] focus:bg-white/75 focus:ring-4 focus:ring-[#B9D8F2]/25";

    const labelClass =
        "mb-2 block text-[12px] font-semibold tracking-wide text-[#315477]";

    const formTransition =
        "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

    return (
        <main className="auth-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#DCEBFA] px-4 py-7 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#dceafa_0%,#edf5fd_45%,#c9e0f5_100%)]" />


            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(91,143,190,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(91,143,190,0.10)_1px,transparent_1px)] bg-[size:58px_58px] opacity-60" />

            <div className="auth-orb pointer-events-none absolute -left-32 top-10 h-[340px] w-[340px] rounded-full bg-white/55 blur-[110px]" />

            <div className="auth-orb auth-orb-delay pointer-events-none absolute -right-28 bottom-0 h-[380px] w-[380px] rounded-full bg-[#8DBDE8]/30 blur-[120px]" />
            <section className="auth-glass-shell relative z-10 w-full max-w-[1160px] overflow-hidden rounded-[30px] border border-white/80 bg-white/30 shadow-[0_35px_100px_rgba(35,77,122,0.22),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-3xl sm:rounded-[36px]">
                <div className="relative hidden min-h-[690px] lg:block">

                    {/* LOGIN FORM */}
                    <div
                        className={`absolute inset-y-0 right-0 flex w-1/2 items-center justify-center px-10 py-10 xl:px-14 ${formTransition} ${isRegister
                            ? "translate-x-3 opacity-0 pointer-events-none"
                            : "translate-x-0 opacity-100"
                            }`}
                    >
                        <div className="w-full max-w-[410px]">

                            <div className="mb-7">
                                
                                <h1 className="text-[36px] font-bold tracking-[-0.04em] text-[#193B65] xl:text-[40px]">
                                    Selamat datang.
                                </h1>

                                <p className="mt-3 max-w-sm text-sm leading-6 text-[#6C87AA]">
                                    Masuk ke akun Anda untuk melanjutkan
                                    aktivitas di HARMONI.
                                </p>
                            </div>

                            {pesan && !isRegister && (
                                <MessageBox
                                    pesan={pesan}
                                    berhasil={berhasil}
                                />
                            )}

                            <form
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                <div>
                                    <label className={labelClass}>
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={loginForm.username}
                                        onChange={handleLoginChange}
                                        placeholder="Masukkan username"
                                        autoComplete="username"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={loginForm.password}
                                        onChange={handleLoginChange}
                                        placeholder="Masukkan password"
                                        autoComplete="current-password"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative mt-2 w-full overflow-hidden rounded-[17px] border border-white/30 bg-gradient-to-r from-[#193B65] via-[#315D8C] to-[#5489B8] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(35,77,122,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(35,77,122,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                    <span className="relative flex items-center justify-center gap-3">
                                        {loading
                                            ? "Memproses..."
                                            : "Masuk ke HARMONI"}

                                        {!loading && (
                                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                                →
                                            </span>
                                        )}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push("/")}
                                    className="group mt-3 w-full rounded-[17px] border border-[#8AB8DD]/60 bg-white/30 px-5 py-3.5 text-sm font-semibold text-[#315D8C] backdrop-blur-xl transition duration-300 hover:border-[#5489B8]/80 hover:bg-white/50 hover:text-[#193B65] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(35,77,122,0.12)]"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>👤</span>
                                        <span>Jelajahi sebagai Tamu</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    </span>
                                </button>
                            </form>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8D0E8] to-transparent" />

                                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#91A9C5]">
                                    HARMONI
                                </span>

                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8D0E8] to-transparent" />
                            </div>

                            <p className="mt-6 text-center text-sm text-[#7C98B8]">
                                Belum punya akun?{" "}
                                <button
                                    type="button"
                                    onClick={() => switchMode(true)}
                                    className="font-bold text-[#315D8C] transition hover:text-[#193B65]"
                                >
                                    Daftar sekarang
                                </button>
                            </p>

                            <p className="mt-3 text-center text-xs text-[#7C98B8]">
                                Anda seorang dokter?{" "}
                                <button
                                    type="button"
                                    onClick={() => router.push("/register-dokter")}
                                    className="font-bold text-[#315D8C] transition hover:text-[#193B65]"
                                >
                                    Daftar akun dokter di sini
                                </button>
                            </p>

                            <p className="mt-6 text-center text-[11px] leading-5 text-[#91A9C5]">
                                © 2026 HARMONI
                                <br />
                                Hospital Information System
                            </p>
                        </div>
                    </div>

                    {/* REGISTER FORM */}
                    <div
                        className={`absolute inset-y-0 left-0 flex w-1/2 items-center justify-center px-9 py-8 xl:px-12 ${formTransition} ${isRegister
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-3 opacity-0 pointer-events-none"
                            }`}
                    >
                        <div className="w-full max-w-[440px]">

                            <div className="mb-5">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="h-px w-8 bg-[#6C9BCB]" />

                                    <p className="text-[10px] font-bold tracking-[0.25em] text-[#6C91BC]">
                                        CREATE YOUR ACCOUNT
                                    </p>
                                </div>

                                <h1 className="text-[34px] font-bold tracking-[-0.04em] text-[#193B65]">
                                    Buat akun.
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-[#6C87AA]">
                                    Bergabung dan mulai menggunakan
                                    layanan HARMONI.
                                </p>
                            </div>

                            {pesan && isRegister && (
                                <MessageBox
                                    pesan={pesan}
                                    berhasil={berhasil}
                                />
                            )}

                            <form
                                onSubmit={handleRegister}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>
                                            Nama Lengkap
                                        </label>

                                        <input
                                            type="text"
                                            name="full_name"
                                            value={registerForm.full_name}
                                            onChange={handleRegisterChange}
                                            placeholder="Nama lengkap"
                                            maxLength={120}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            value={registerForm.username}
                                            onChange={handleRegisterChange}
                                            placeholder="Buat username"
                                            minLength={3}
                                            maxLength={30}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={registerForm.email}
                                            onChange={handleRegisterChange}
                                            placeholder="nama@email.com"
                                            maxLength={120}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Nomor Telepon
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={registerForm.phone}
                                            onChange={handleRegisterChange}
                                            placeholder="Nomor telepon"
                                            maxLength={30}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            value={registerForm.password}
                                            onChange={handleRegisterChange}
                                            placeholder="Min. 6 karakter"
                                            minLength={6}
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Konfirmasi Password
                                        </label>

                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={registerForm.confirmPassword}
                                            onChange={handleRegisterChange}
                                            placeholder="Ulangi password"
                                            minLength={6}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative mt-2 w-full overflow-hidden rounded-[17px] border border-white/30 bg-gradient-to-r from-[#193B65] via-[#315D8C] to-[#5489B8] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(35,77,122,0.22)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                    <span className="relative">
                                        {loading
                                            ? "Mendaftarkan akun..."
                                            : "Daftar ke HARMONI →"}
                                    </span>
                                </button>
                            </form>

                            <p className="mt-5 text-center text-sm text-[#7C98B8]">
                                Sudah punya akun?{" "}
                                <button
                                    type="button"
                                    onClick={() => switchMode(false)}
                                    className="font-bold text-[#315D8C] transition hover:text-[#193B65]"
                                >
                                    Masuk di sini
                                </button>
                            </p>
                        </div>
                    </div>


                    <div
                        className={`auth-sliding-panel absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden rounded-[30px] border border-white/30 bg-gradient-to-br from-[#193B65] via-[#315D8C] to-[#659BC8] shadow-[0_20px_55px_rgba(25,59,101,0.22),inset_0_1px_0_rgba(255,255,255,0.3)] sm:rounded-[36px] transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isRegister
                            ? "translate-x-full"
                            : "translate-x-0"
                            }`}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.28)_0%,transparent_28%,transparent_66%,rgba(255,255,255,0.10)_100%)]" />
                        <div className="pointer-events-none absolute -left-1/4 -top-1/3 h-3/4 w-[130%] rotate-[-12deg] rounded-[50%] bg-white/[0.07] blur-2xl" />
                        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />

                        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-full rotate-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

                        <div className="pointer-events-none absolute -right-24 top-24 h-[300px] w-[300px] rounded-full border border-white/15" />
                        <div className="pointer-events-none absolute -right-10 top-40 h-[220px] w-[220px] rounded-full border border-white/10" />
                        <div className="pointer-events-none absolute right-16 top-40 h-2.5 w-2.5 rounded-full bg-[#D8ECFF]/60 shadow-[0_0_20px_rgba(216,236,255,0.55)]" />
                        <div className="pointer-events-none absolute bottom-24 left-16 h-2 w-2 rounded-full bg-white/45" />
                        <div
                            className={`relative flex h-full flex-col justify-between p-9 text-white transition-all duration-500 xl:p-12 ${isRegister
                                ? "text-right"
                                : "text-left"
                                }`}
                        >
                            <div>
                                <div
                                    className={`inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl ${isRegister
                                        ? "flex-row-reverse"
                                        : ""
                                        }`}
                                >
                                    <span className="h-2 w-2 rounded-full bg-[#C8E5FF] shadow-[0_0_12px_rgba(200,229,255,0.8)]" />

                                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/85">
                                        HOSPITAL INFORMATION SYSTEM
                                    </span>
                                </div>
                                <div
                                    className={`mt-12 flex items-center gap-4 ${isRegister
                                        ? "flex-row-reverse"
                                        : ""
                                        }`}
                                >
                                    <div className="flex h-[66px] w-[66px] items-center justify-center rounded-[22px] border border-white/25 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_25px_rgba(15,45,80,0.12)] backdrop-blur-xl">
                                        <svg
                                            viewBox="0 0 48 48"
                                            className="h-9 w-9"
                                            fill="none"
                                        >
                                            <path
                                                d="M24 41C18 35 7 29 7 18C2 7 14 3 24 10C34 3 46 7 41 18C31 29 30 35 24 41Z"
                                                fill="currentColor"
                                                className="text-[#D9EDFF]"
                                            />

                                            <path
                                                d="M24 10V39"
                                                stroke="#315D8C"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />

                                            <path
                                                d="M27 17L37 12M27 24L38 19M27 31L34 27"
                                                stroke="#315D8C"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h2 className="text-[30px] font-bold tracking-[0.2em] xl:text-[34px]">
                                            HARMONI
                                        </h2>

                                        <p className="mt-1.5 text-[9px] font-medium tracking-[0.24em] text-white/65">
                                            CARE THROUGH CONNECTION
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-[10px] font-bold tracking-[0.24em] text-[#D3E8FF]">
                                    A SYSTEM WITH CARE
                                </p>

                                <h2 className="mt-5 text-[46px] font-light leading-[1.12] tracking-tight xl:text-[54px]">
                                    {isRegister ? (
                                        <>
                                            Start your
                                            <br />
                                            <span className="font-medium text-[#D1E8FF]">
                                                journey.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Every detail
                                            <br />
                                            <span className="font-medium text-[#D1E8FF]">
                                                matters.
                                            </span>
                                        </>
                                    )}
                                </h2>

                                <p className="mt-5 max-w-[370px] text-[13px] leading-7 text-white/75">
                                    {isRegister
                                        ? "Satu langkah sederhana untuk terhubung dengan layanan rumah sakit yang lebih terintegrasi."
                                        : "Menghubungkan informasi, tenaga medis, dan pelayanan rumah sakit dalam satu sistem yang terintegrasi."}
                                </p>

                                <div
                                    className={`mt-9 flex items-center gap-3 ${isRegister
                                        ? "justify-end"
                                        : ""
                                        }`}
                                >
                                    <div className="h-px w-16 bg-white/35" />
                                    <span className="h-2 w-2 rounded-full bg-[#C8E5FF]" />
                                    <div className="h-px w-8 bg-white/20" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/15 pt-5 text-[10px] text-white/65">
                                <span>HARMONI · 2026</span>
                                <span>Built with care.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden">

                    <div className="relative overflow-hidden bg-gradient-to-br from-[#193B65] via-[#315D8C] to-[#659BC8] px-6 py-7 text-white">

                        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/15" />

                        <div className="pointer-events-none absolute -right-5 top-12 h-40 w-40 rounded-full border border-white/10" />

                        <div className="relative">
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-[#C8E5FF]" />

                                <p className="text-[9px] font-bold tracking-[0.2em] text-white/80">
                                    HOSPITAL INFORMATION SYSTEM
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-xl">
                                    <span className="text-2xl font-bold">
                                        H
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold tracking-[0.18em]">
                                        HARMONI
                                    </h2>

                                    <p className="mt-1 text-[8px] tracking-[0.2em] text-white/65">
                                        CARE THROUGH CONNECTION
                                    </p>
                                </div>
                            </div>

                            <p className="mt-6 text-sm text-white/75">
                                {isRegister
                                    ? "Start your journey with HARMONI."
                                    : "Every detail matters."}
                            </p>
                        </div>
                    </div>

                    {/* Mobile form */}
                    <div className="relative bg-white/35 px-6 py-7 backdrop-blur-3xl sm:px-9">

                        <div className="mb-6">
                            <p className="text-[10px] font-bold tracking-[0.25em] text-[#6C91BC]">
                                {isRegister
                                    ? "CREATE YOUR ACCOUNT"
                                    : "SECURE ACCESS"}
                            </p>

                            <h1 className="mt-3 text-3xl font-bold text-[#193B65]">
                                {isRegister
                                    ? "Buat akun."
                                    : "Selamat datang."}
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-[#6C87AA]">
                                {isRegister
                                    ? "Daftar untuk mulai menggunakan layanan HARMONI."
                                    : "Masuk ke akun Anda untuk melanjutkan aktivitas."}
                            </p>
                        </div>

                        {pesan && (
                            <MessageBox
                                pesan={pesan}
                                berhasil={berhasil}
                            />
                        )}

                        {!isRegister ? (
                            <form
                                onSubmit={handleLogin}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelClass}>
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={loginForm.username}
                                        onChange={handleLoginChange}
                                        placeholder="Masukkan username"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={loginForm.password}
                                        onChange={handleLoginChange}
                                        placeholder="Masukkan password"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-[16px] bg-gradient-to-r from-[#193B65] to-[#5489B8] px-5 py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
                                >
                                    {loading
                                        ? "Memproses..."
                                        : "Masuk ke HARMONI →"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push("/")}
                                    className="group mt-3 w-full rounded-[16px] border border-[#8AB8DD]/60 bg-white/30 px-5 py-3.5 text-sm font-semibold text-[#315D8C] backdrop-blur-xl transition duration-300 hover:border-[#5489B8]/80 hover:bg-white/50 hover:text-[#193B65]"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>👤</span>
                                        <span>Jelajahi sebagai Tamu</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    </span>
                                </button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleRegister}
                                className="space-y-3.5"
                            >
                                <div>
                                    <label className={labelClass}>
                                        Nama Lengkap
                                    </label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        value={registerForm.full_name}
                                        onChange={handleRegisterChange}
                                        placeholder="Nama lengkap"
                                        maxLength={120}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Username
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={registerForm.username}
                                        onChange={handleRegisterChange}
                                        placeholder="Buat username"
                                        minLength={3}
                                        maxLength={30}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={registerForm.email}
                                        onChange={handleRegisterChange}
                                        placeholder="nama@email.com"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Nomor Telepon
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={registerForm.phone}
                                        onChange={handleRegisterChange}
                                        placeholder="Nomor telepon"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        placeholder="Minimal 6 karakter"
                                        minLength={6}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Konfirmasi Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={registerForm.confirmPassword}
                                        onChange={handleRegisterChange}
                                        placeholder="Ulangi password"
                                        minLength={6}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-[16px] bg-gradient-to-r from-[#193B65] to-[#5489B8] px-5 py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60"
                                >
                                    {loading
                                        ? "Mendaftarkan akun..."
                                        : "Daftar ke HARMONI →"}
                                </button>
                            </form>
                        )}

                        <p className="mt-6 text-center text-sm text-[#7C98B8]">
                            {isRegister
                                ? "Sudah punya akun? "
                                : "Belum punya akun? "}

                            <button
                                type="button"
                                onClick={() => switchMode(!isRegister)}
                                className="font-bold text-[#315D8C]"
                            >
                                {isRegister
                                    ? "Masuk di sini"
                                    : "Daftar sekarang"}
                            </button>
                        </p>

                        <p className="mt-2 text-center text-xs text-[#7C98B8]">
                            Anda seorang dokter?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/register-dokter")}
                                className="font-bold text-[#315D8C]"
                            >
                                Daftar akun dokter di sini
                            </button>
                        </p>

                        <p className="mt-6 text-center text-[11px] text-[#91A9C5]">
                            © 2026 HARMONI · Hospital Information System
                        </p>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                .auth-glass-shell {
                    isolation: isolate;
                    transform: translateZ(0);
                }
                @keyframes harmon-shell-arrive {
                    from { opacity: 0; transform: translateY(14px) scale(.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes harmon-float {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(18px, -16px, 0); }
                }
                .auth-orb { animation: harmon-float 12s ease-in-out infinite; }
                .auth-orb-delay { animation-delay: -5s; }
                @media (prefers-reduced-motion: reduce) {
                    ::view-transition-old(harmon-auth-shell),
                    ::view-transition-new(harmon-auth-shell),
                    .auth-glass-shell, .auth-orb { animation: none !important; }
                }
            `}</style>
        </main>
    );
}

function MessageBox({ pesan, berhasil }) {
    return (
        <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm backdrop-blur-xl ${berhasil
                ? "border-[#B9D8F2]/80 bg-[#E5F2FC]/70 text-[#4776A6]"
                : "border-red-200/80 bg-red-50/70 text-red-600"
                }`}
        >
            {pesan}
        </div>
    );
}