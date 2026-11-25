"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterDokterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        full_name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        poli_id: "",
    });

    const [poliList, setPoliList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPoli, setLoadingPoli] = useState(true);
    const [pesan, setPesan] = useState("");
    const [berhasil, setBerhasil] = useState(false);
    const [fileSK, setFileSK] = useState(null);

    useEffect(() => {
        async function fetchPoli() {
            try {
                const res = await fetch("/api/public/poli");
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    setPoliList(data.data);
                }
            } catch {
                // Dropdown tetap kosong jika gagal mengambil data.
            } finally {
                setLoadingPoli(false);
            }
        }

        fetchPoli();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleFileChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            setFileSK(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        if (!allowedTypes.includes(file.type)) {
            setPesan("File SK harus berupa PDF, JPG, atau PNG.");
            event.target.value = "";
            setFileSK(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setPesan("Ukuran file SK maksimal 5 MB.");
            event.target.value = "";
            setFileSK(null);
            return;
        }

        setPesan("");
        setFileSK(file);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setPesan("");
        setBerhasil(false);

        if (form.password !== form.confirm_password) {
            setPesan("Konfirmasi password tidak sama.");
            return;
        }

        if (!fileSK) {
            setPesan("Silakan unggah Surat Keterangan (SK) dokter.");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            formData.append("sk_dokter", fileSK);

            const res = await fetch("/api/register-dokter", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setPesan(data.message || "Pendaftaran gagal.");
                return;
            }

            setBerhasil(true);
            setPesan(
                data.message ||
                "Pendaftaran berhasil. Akun menunggu verifikasi admin."
            );

            setForm({
                full_name: "",
                username: "",
                email: "",
                phone: "",
                password: "",
                confirm_password: "",
                poli_id: "",
            });

            setFileSK(null);

            if (event.target.sk_dokter) {
                event.target.sk_dokter.value = "";
            }

            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch {
            setPesan("Tidak dapat terhubung ke server.");
        } finally {
            setLoading(false);
        }
    }

    const inputClass =
        "w-full rounded-[15px] border border-white/75 bg-white/45 px-4 py-3 text-sm text-[#24476D] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_5px_18px_rgba(64,111,159,0.04)] outline-none backdrop-blur-xl transition duration-300 placeholder:text-[#91A9C5] hover:bg-white/60 focus:border-[#8AB8DD] focus:bg-white/75 focus:ring-4 focus:ring-[#B9D8F2]/25";

    const labelClass =
        "mb-2 block text-[12px] font-semibold tracking-wide text-[#315477]";

    return (
        <main className="auth-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#DCEBFA] px-4 py-7 sm:px-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#dceafa_0%,#edf5fd_45%,#c9e0f5_100%)]" />

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(91,143,190,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(91,143,190,0.10)_1px,transparent_1px)] bg-[size:58px_58px] opacity-60" />

            <div className="auth-orb pointer-events-none absolute -left-32 top-10 h-[340px] w-[340px] rounded-full bg-white/55 blur-[110px]" />
            <div className="auth-orb auth-orb-delay pointer-events-none absolute -right-28 bottom-0 h-[380px] w-[380px] rounded-full bg-[#8DBDE8]/30 blur-[120px]" />

            <section className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-[30px] border border-white/80 bg-white/30 shadow-[0_35px_100px_rgba(35,77,122,0.22),inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-3xl sm:rounded-[36px]">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#193B65] via-[#315D8C] to-[#659BC8] px-8 py-7 text-white">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15" />
                    <div className="pointer-events-none absolute -right-5 top-16 h-40 w-40 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute right-20 top-16 h-2.5 w-2.5 rounded-full bg-[#D8ECFF]/60 shadow-[0_0_20px_rgba(216,236,255,0.55)]" />

                    <div className="relative flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-[#C8E5FF] shadow-[0_0_12px_rgba(200,229,255,0.8)]" />
                        <p className="text-[9px] font-bold tracking-[0.2em] text-white/80">
                            HOSPITAL INFORMATION SYSTEM
                        </p>
                    </div>

                    <div className="relative mt-5 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10 backdrop-blur-xl">
                            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
                                <path
                                    d="M24 6C16.268 6 10 12.268 10 20c0 10.5 14 26 14 26S38 30.5 38 20C38 12.268 31.732 6 24 6z"
                                    fill="currentColor"
                                    className="text-[#D9EDFF]"
                                />
                                <path
                                    d="M24 16v8M20 20h8"
                                    stroke="#315D8C"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold tracking-[0.18em]">
                                HARMONI
                            </h2>
                            <p className="mt-1 text-[8px] tracking-[0.2em] text-white/65">
                                PENDAFTARAN AKUN DOKTER
                            </p>
                        </div>
                    </div>

                    <p className="relative mt-4 text-sm text-white/70">
                        Daftarkan diri Anda sebagai dokter di sistem HARMONI.
                    </p>
                </div>

                <div className="px-8 py-8 sm:px-10">
                    <div className="mb-6">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="h-px w-8 bg-[#6C9BCB]" />
                            <p className="text-[10px] font-bold tracking-[0.25em] text-[#6C91BC]">
                                REGISTER DOKTER
                            </p>
                        </div>

                        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#193B65]">
                            Buat akun dokter.
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6C87AA]">
                            Lengkapi data berikut untuk mendaftarkan akun dokter Anda.
                        </p>
                    </div>

                    {pesan && (
                        <div
                            className={`mb-5 rounded-xl border px-4 py-3 text-sm backdrop-blur-xl ${
                                berhasil
                                    ? "border-[#B9D8F2]/80 bg-[#E5F2FC]/70 text-[#4776A6]"
                                    : "border-red-200/80 bg-red-50/70 text-red-600"
                            }`}
                        >
                            {pesan}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    placeholder="Nama lengkap dokter"
                                    maxLength={120}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Buat username"
                                    minLength={3}
                                    maxLength={30}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="nama@gmail.com"
                                    maxLength={120}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Nomor Telepon</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Nomor telepon aktif"
                                    maxLength={30}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Poliklinik</label>
                            <select
                                name="poli_id"
                                value={form.poli_id}
                                onChange={handleChange}
                                required
                                disabled={loadingPoli}
                                className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                                <option value="" disabled>
                                    {loadingPoli
                                        ? "Memuat daftar poli..."
                                        : "Pilih poliklinik"}
                                </option>

                                {poliList.map((poli) => (
                                    <option key={poli.id} value={poli.id}>
                                        {poli.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Upload SK dokter */}
                        <div>
                            <label className={labelClass}>
                                Surat Keterangan (SK) Dokter
                            </label>

                            <input
                                type="file"
                                name="sk_dokter"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                                className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#DCEBFA] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#315D8C]`}
                            />

                            <p className="mt-2 text-xs leading-5 text-[#7C98B8]">
                                Unggah SK dokter dalam format PDF, JPG, atau PNG.
                                Maksimal 5 MB. Akun akan diverifikasi oleh admin.
                            </p>

                            {fileSK && (
                                <p className="mt-2 break-all text-xs text-[#315D8C]">
                                    File dipilih: {fileSK.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
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
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                    minLength={6}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !fileSK}
                            className="group relative mt-2 w-full overflow-hidden rounded-[17px] border border-white/30 bg-gradient-to-r from-[#193B65] via-[#315D8C] to-[#5489B8] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(35,77,122,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(35,77,122,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                            <span className="relative flex items-center justify-center gap-3">
                                {loading
                                    ? "Mendaftarkan akun..."
                                    : "Daftar sebagai Dokter →"}
                            </span>
                        </button>
                    </form>

                    <div className="mt-7 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8D0E8] to-transparent" />
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-[#91A9C5]">
                            HARMONI
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B8D0E8] to-transparent" />
                    </div>

                    <div className="mt-5 space-y-2 text-center">
                        <p className="text-sm text-[#7C98B8]">
                            Sudah punya akun?{" "}
                            <Link
                                href="/login"
                                className="font-bold text-[#315D8C] transition hover:text-[#193B65]"
                            >
                                Masuk di sini
                            </Link>
                        </p>

                        <p className="text-sm text-[#7C98B8]">
                            Daftar sebagai Pasien?{" "}
                            <Link
                                href="/register"
                                className="font-bold text-[#315D8C] transition hover:text-[#193B65]"
                            >
                                Klik di sini
                            </Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-[11px] leading-5 text-[#91A9C5]">
                        © 2026 HARMONI
                        <br />
                        Hospital Information System
                    </p>
                </div>
            </section>

            <style jsx global>{`
                .auth-orb {
                    animation: harmon-float 12s ease-in-out infinite;
                }

                .auth-orb-delay {
                    animation-delay: -5s;
                }

                @keyframes harmon-float {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }

                    50% {
                        transform: translate3d(18px, -16px, 0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .auth-orb {
                        animation: none !important;
                    }
                }
            `}</style>
        </main>
    );
}