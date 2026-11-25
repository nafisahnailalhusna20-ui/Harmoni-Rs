"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Daftar layanan. Ubah href / teks di sini kalau route-mu berbeda.
const LAYANAN = [
    {
        judul: "Janji Temu",
        deskripsi: "Atur jadwal pemeriksaan dan kunjunganmu dengan mudah.",
        href: "/pasien/janji-temu",
    },
    {
        judul: "Rekam Medis",
        deskripsi: "Catatan pemeriksaan dan informasi kesehatanmu, tersimpan rapi.",
        href: "/pasien/rekam-medis",
    },
    {
        judul: "Riwayat Kunjungan",
        deskripsi: "Telusuri kembali pemeriksaan yang pernah kamu lakukan.",
        href: "/pasien/riwayat",
    },
    {
        judul: "Profil Saya",
        deskripsi: "Pastikan data pribadi dan akunmu selalu terbarui.",
        href: "/pasien/profil",
    },
    {
        judul: "Cari Obat",
        deskripsi: "Cek ketersediaan, jenis, dan masa berlaku obat di apotek.",
        href: "/pasien/obat",
    },
];

const HARI_SINGKAT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function PasienPage() {
    const router = useRouter();

    const [pasien, setPasien] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pesanError, setPesanError] = useState("");

    const [now, setNow] = useState(null);
    const [offsetBulan, setOffsetBulan] = useState(0);
    const [cari, setCari] = useState("");

    useEffect(() => {
        async function ambilData() {
            try {
                const res = await fetch("/api/me");
                const data = await res.json();

                if (!res.ok || !data.success || data.user?.role !== "pasien") {
                    router.push("/login");
                    return;
                }

                setPasien(data.user);
            } catch (error) {
                console.error(error);
                setPesanError("Terjadi kesalahan saat memuat halaman.");
            } finally {
                setLoading(false);
            }
        }

        ambilData();
    }, [router]);

    // Jam & tanggal (diisi setelah mount agar tidak beda dengan server)
    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    async function logout() {
        try {
            await fetch("/api/logout", { method: "POST" });
        } finally {
            router.push("/login");
        }
    }

    const namaPasien = pasien?.full_name || pasien?.username || "Pasien";
    const fotoPasien = pasien?.photo || "";

    const inisial = namaPasien
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata[0])
        .join("")
        .toUpperCase();

    // ---- data jam & kalender ----
    const jam = now ? String(now.getHours()).padStart(2, "0") : "--";
    const menit = now ? String(now.getMinutes()).padStart(2, "0") : "--";
    const progresHari = now
        ? ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100
        : 0;

    let sapaan = "Halo";
    if (now) {
        const h = now.getHours();
        sapaan =
            h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
    }

    const tanggalPanjang = now
        ? now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";

    let kalender = null;
    if (now) {
        const basis = new Date(now.getFullYear(), now.getMonth() + offsetBulan, 1);
        const jumlahHari = new Date(basis.getFullYear(), basis.getMonth() + 1, 0).getDate();
        const geser = (basis.getDay() + 6) % 7; // Senin = 0
        const sel = [
            ...Array.from({ length: geser }, () => null),
            ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
        ];
        kalender = {
            judul: basis.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
            sel,
            bulanIni:
                basis.getMonth() === now.getMonth() && basis.getFullYear() === now.getFullYear(),
        };
    }

    const hasilCari = LAYANAN.filter((l) =>
        `${l.judul} ${l.deskripsi}`.toLowerCase().includes(cari.trim().toLowerCase())
    );

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eaf4fc]">
                <div className="flex flex-col items-center gap-4 text-sm text-[#7198bb]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    Memuat portal pasien...
                </div>
            </main>
        );
    }

    if (!pasien) return null;

    return (
        <main className="harmoni-scene relative min-h-screen overflow-hidden px-3 py-4 text-[#244968] sm:px-8 sm:py-8 lg:px-10">
            <style>{`
                @keyframes harmoniRise {
                    from { opacity: 0; transform: translate3d(0, 16px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                @keyframes harmoniOrbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .harmoni-enter { animation: harmoniRise .9s cubic-bezier(.16,.78,.25,1) both; }

                /* ---------- Latar belakang (yang terlihat menembus kaca) ---------- */
                .harmoni-scene {
                    background:
                        radial-gradient(70% 50% at 8% 0%, #ffffff 0%, transparent 62%),
                        linear-gradient(165deg, #eaf4fc 0%, #d3e6f7 55%, #c2dbf1 100%);
                }
                .hs { position: absolute; border-radius: 9999px; pointer-events: none; }
                .hs-1 { width: 520px; height: 520px; left: -150px; top: 140px; background: linear-gradient(145deg, #ffffff 0%, #9fc8ec 100%); opacity: .9; }
                .hs-2 { width: 430px; height: 430px; right: -70px; top: -90px; background: linear-gradient(145deg, #e3f0fb 0%, #6aa3d4 100%); opacity: .85; }
                .hs-3 { width: 470px; height: 470px; right: 6%; bottom: -150px; background: linear-gradient(145deg, #bcdcf5 0%, #4a86b8 100%); opacity: .8; }
                .hs-4 { width: 720px; height: 720px; left: 28%; top: 26%; border: 1px solid rgba(255,255,255,.75); }
                .hs-5 { width: 240px; height: 240px; left: 16%; bottom: 6%; background: linear-gradient(145deg, #ffffff 0%, #7fb2de 100%); opacity: .85; }

                /* ---------- Jendela kaca utama ---------- */
                .harmoni-window {
                    position: relative; z-index: 1;
                    background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.7);
                    box-shadow: 0 40px 100px rgba(55,105,155,.2), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3);
                }

                /* ---------- Panel kaca di dalam jendela ---------- */
                .harmoni-panel {
                    position: relative; overflow: hidden; isolation: isolate;
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.5), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.36), rgba(255,255,255,.1));
                    backdrop-filter: blur(28px) saturate(1.6);
                    -webkit-backdrop-filter: blur(28px) saturate(1.6);
                    border: 1px solid rgba(255,255,255,.6);
                    box-shadow: 0 10px 30px rgba(55,105,155,.1), inset 0 1px 0 rgba(255,255,255,.95);
                }
                .harmoni-tile { transition: transform .45s cubic-bezier(.2,.7,.2,1), background .45s ease, box-shadow .45s ease; }
                .harmoni-tile:hover, .harmoni-tile:focus-visible {
                    transform: translateY(-3px);
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.75), transparent 58%),
                        linear-gradient(145deg, rgba(255,255,255,.5), rgba(255,255,255,.18));
                    box-shadow: 0 18px 44px rgba(55,105,155,.16), inset 0 1px 0 rgba(255,255,255,1);
                }
                .harmoni-focus:focus-visible { outline: 2px solid #3f78a8; outline-offset: 3px; }

                .harmoni-chip {
                    background: rgba(255,255,255,.5);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.95);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                }

                /* ---------- Bola kaca di hero ---------- */
                .harmoni-sphere {
                    width: 210px; height: 210px; border-radius: 9999px;
                    background: radial-gradient(circle at 32% 26%, #ffffff 0, rgba(255,255,255,.75) 11%, #b9d9f3 42%, #5f98cb 100%);
                    box-shadow: inset -20px -26px 50px rgba(255,255,255,.35), inset 10px 10px 30px rgba(255,255,255,.5), 0 40px 80px rgba(60,110,160,.35);
                }
                .harmoni-ring {
                    position: absolute; inset: -34px; border-radius: 9999px;
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 0 30px rgba(255,255,255,.4);
                    animation: harmoniOrbit 40s linear infinite;
                }
                .harmoni-ring::after {
                    content: ""; position: absolute; top: 12%; left: 8%; width: 14px; height: 14px; border-radius: 9999px;
                    background: #fff; box-shadow: 0 0 16px 4px rgba(255,255,255,.9);
                }

                .harmoni-name {
                    display: block; font-size: clamp(2rem, 4.2vw, 3.6rem); line-height: 1.08; letter-spacing: -.045em; font-weight: 700;
                    text-wrap: balance;
                }
                .harmoni-name span {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }

                @media (prefers-reduced-motion: reduce) {
                    .harmoni-enter, .harmoni-ring { animation: none !important; }
                    .harmoni-tile { transition: none !important; }
                    .harmoni-tile:hover { transform: none !important; }
                }
            `}</style>

            {/* bentuk latar */}
            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1280px] rounded-[32px] p-4 sm:rounded-[40px] sm:p-6">
                {/* ================= HEADER ================= */}
                <header className="flex flex-wrap items-center gap-4">
                    <div className="mr-auto flex items-center gap-4">
                        <h1 className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </h1>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <label className="harmoni-chip order-last flex w-full items-center gap-3 rounded-full px-5 py-3 sm:order-none sm:w-[300px]">
                        <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Cari layanan"
                            aria-label="Cari layanan"
                            className="w-full bg-transparent text-sm text-[#315879] placeholder:text-[#8aa9c6] focus:outline-none"
                        />
                    </label>

                    <button
                        onClick={() => router.push("/pasien/profil")}
                        className="harmoni-chip harmoni-focus flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition hover:bg-white/80"
                    >
                        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] ring-2 ring-white/80">
                            {fotoPasien ? (
                                <img src={fotoPasien} alt={`Foto ${namaPasien}`} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-[#5c8db5]">{inisial}</span>
                            )}
                        </span>
                        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-[#426f96] sm:block">
                            {namaPasien}
                        </span>
                    </button>

                    <button
                        onClick={logout}
                        className="harmoni-chip harmoni-focus rounded-full px-5 py-3 text-xs font-semibold text-[#5c82a5] transition hover:bg-white/80"
                    >
                        Keluar
                    </button>
                </header>

                {/* ================= BODY ================= */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[170px_1fr]">
                    {/* ---- Sidebar ---- */}
                   {/* ---- Sidebar ---- */}
<nav className="flex flex-col gap-3 w-full">

</nav>

<div className="grid gap-5">
                        {/* ---- Hero + jam + kalender ---- */}
                        <div className="grid gap-5 xl:grid-cols-12">
                            {/* Hero */}
                            <section
                                className="harmoni-panel harmoni-enter relative rounded-[30px] p-6 sm:p-9 xl:col-span-7 xl:row-span-2"
                                style={{ animationDelay: "120ms" }}
                            >
                                <div className="relative z-10 max-w-[420px]">
                                    <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                                        <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                                        Portal pasien
                                    </span>

                                    <h2 className="mt-7">
                                        <span className="block text-lg font-medium text-[#6f93b6] sm:text-xl">
                                            Selamat datang,
                                        </span>
                                        <span className="harmoni-name mt-1">
                                            <span>{namaPasien}.</span>
                                        </span>
                                    </h2>

                                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#6f93b6]">
                                        Ruang pribadimu untuk mengakses layanan kesehatan, memantau
                                        pemeriksaan, dan menjaga informasi tetap terorganisir.
                                    </p>

                                    <div className="mt-7 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => router.push("/pasien/janji-temu")}
                                            className="harmoni-focus rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-5 py-3.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                                        >
                                            Buat janji temu
                                        </button>
                                        <button
                                            onClick={() => router.push("/pasien/rekam-medis")}
                                            className="harmoni-chip harmoni-focus rounded-2xl px-5 py-3.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                                        >
                                            Lihat rekam medis
                                        </button>
                                    </div>
                                </div>

                                {/* bola kaca */}
                                <div className="pointer-events-none absolute -bottom-6 -right-2 hidden h-[300px] w-[300px] items-center justify-center sm:flex xl:-right-4">
                                    <div className="relative">
                                        <div className="harmoni-ring" />
                                        <div className="harmoni-sphere flex items-center justify-center">
                                            <span className="text-5xl font-semibold tracking-tight text-white drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                                H+
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Jam */}
                            <section
                                className="harmoni-panel harmoni-enter rounded-[30px] p-6 xl:col-span-5"
                                style={{ animationDelay: "200ms" }}
                            >
                                <p className="text-xs font-medium text-[#7e9fc0]">{sapaan}</p>
                                <p className="mt-2 text-6xl font-light tracking-tight text-[#2b5a84]">
                                    {jam}
                                    <span className="mx-0.5 text-[#8fb6d8]">:</span>
                                    {menit}
                                </p>
                                <p className="mt-2 text-sm text-[#6f93b6]">{tanggalPanjang || "\u00A0"}</p>

                                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/60">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#9cc9ee] to-[#4f8bbf]"
                                        style={{ width: `${progresHari}%` }}
                                    />
                                </div>
                            </section>

                            {/* Kalender */}
                            <section
                                className="harmoni-panel harmoni-enter rounded-[30px] p-6 xl:col-span-5"
                                style={{ animationDelay: "280ms" }}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold capitalize text-[#2b5a84]">
                                        {kalender?.judul || "\u00A0"}
                                    </h3>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => setOffsetBulan((o) => o - 1)}
                                            aria-label="Bulan sebelumnya"
                                            className="harmoni-chip harmoni-focus flex h-7 w-7 items-center justify-center rounded-full text-xs text-[#5f8fb8] hover:bg-white/80"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={() => setOffsetBulan((o) => o + 1)}
                                            aria-label="Bulan berikutnya"
                                            className="harmoni-chip harmoni-focus flex h-7 w-7 items-center justify-center rounded-full text-xs text-[#5f8fb8] hover:bg-white/80"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
                                    {HARI_SINGKAT.map((h) => (
                                        <span key={h} className="pb-2 text-[11px] font-medium text-[#8aa9c6]">
                                            {h}
                                        </span>
                                    ))}
                                    {kalender?.sel.map((tgl, i) => {
                                        const hariIni = kalender.bulanIni && tgl === now.getDate();
                                        return (
                                            <span
                                                key={i}
                                                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${hariIni
                                                        ? "bg-white/90 font-bold text-[#2b5a84] shadow-[0_6px_16px_rgba(75,125,165,0.2)]"
                                                        : "text-[#5f86ab]"
                                                    }`}
                                            >
                                                {tgl}
                                            </span>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* ---- Layanan ---- */}
                        <section>
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
                                <h2 className="text-xl font-semibold tracking-tight text-[#254968]">
                                    Layanan kesehatan
                                </h2>
                                <p className="text-xs text-[#7e9fc0]">
                                    Semua yang kamu butuhkan untuk perjalanan perawatanmu.
                                </p>
                            </div>

                            {hasilCari.length === 0 ? (
                                <div className="harmoni-panel flex min-h-[140px] items-center justify-center rounded-[26px] text-sm text-[#7e9fc0]">
                                    Tidak ada layanan yang cocok dengan pencarianmu.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {hasilCari.map((item, i) => (
                                        <button
                                            key={item.judul}
                                            type="button"
                                            onClick={() => router.push(item.href)}
                                            style={{ animationDelay: `${360 + i * 60}ms` }}
                                            className="harmoni-panel harmoni-tile harmoni-enter harmoni-focus group flex min-h-[190px] flex-col justify-between rounded-[26px] p-5 text-left"
                                        >
                                            <div>
                                                <h3 className="text-base font-semibold tracking-tight text-[#2b5a84]">
                                                    {item.judul}
                                                </h3>
                                                <p className="mt-2 text-xs leading-6 text-[#6f93b6]">
                                                    {item.deskripsi}
                                                </p>
                                            </div>

                                            <span className="harmoni-chip mt-5 inline-flex w-fit items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-xs font-medium text-[#3f78a8]">
                                                Buka
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[#4a86b8] transition-transform duration-300 group-hover:translate-x-0.5">
                                                    →
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {pesanError && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
                                {pesanError}
                            </div>
                        )}
                    </div>
                </div>

                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Portal Pasien</span>
                </footer>
            </div>
        </main>
    );
}
