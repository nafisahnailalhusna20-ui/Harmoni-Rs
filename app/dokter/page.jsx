"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Menu utama. Ubah href / teks di sini kalau route-mu berbeda.
const MENU = [
    {
        judul: "Janji Temu Pasien",
        deskripsi: "Periksa permintaan dan kelola status janji temu pasien.",
        href: "/dokter/janji-temu",
    },
    {
        judul: "Rekam Medis",
        deskripsi: "Isi diagnosis, tindakan medis, catatan, dan resep pasien.",
        href: "/dokter/rekam-medis",
    },
    {
        judul: "Profil Dokter",
        deskripsi: "Lihat dan kelola informasi profil dokter serta data akun.",
        href: "/dokter/profil",
    },
    {
        judul: "Cari Obat",
        deskripsi: "Cek ketersediaan obat, tipe keras/biasa, dan tanggal kedaluwarsa.",
        href: "/dokter/obat",
    },
];

export default function DokterPage() {
    const router = useRouter();

    const [dokter, setDokter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [pesanError, setPesanError] = useState("");
    const [now, setNow] = useState(null);

    const [dashboard, setDashboard] = useState({
        total_pending: 0,
        approved_hari_ini: 0,
        pasien_terbaru: [],
        jadwal_praktik: [],
    });

    useEffect(() => {
        async function ambilData() {
            try {
                const responseMe = await fetch("/api/me");
                const dataMe = await responseMe.json();

                if (
                    !responseMe.ok ||
                    !dataMe.success ||
                    dataMe.user?.role !== "dokter"
                ) {
                    router.push("/login");
                    return;
                }

                setDokter(dataMe.user);

                const responseDashboard = await fetch(
                    "/api/dokter/dashboard"
                );

                const dataDashboard =
                    await responseDashboard.json();

                if (
                    !responseDashboard.ok ||
                    !dataDashboard.success
                ) {
                    setPesanError(
                        dataDashboard.message ||
                        "Data dashboard gagal dimuat."
                    );
                    return;
                }

                setDashboard({
                    total_pending:
                        dataDashboard.data.total_pending ?? 0,

                    approved_hari_ini:
                        dataDashboard.data.approved_hari_ini ?? 0,

                    pasien_terbaru:
                        dataDashboard.data.pasien_terbaru ?? [],

                    jadwal_praktik:
                        dataDashboard.data.jadwal_praktik ?? [],
                });
            } catch (error) {
                console.error(error);

                setPesanError(
                    "Terjadi kesalahan saat memuat dashboard."
                );
            } finally {
                setLoading(false);
                setLoadingDashboard(false);
            }
        }

        ambilData();
    }, [router]);

    // Waktu (diisi setelah mount supaya sama dengan server)
    useEffect(() => {
        setNow(new Date());
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    async function logout() {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
        } finally {
            router.push("/login");
        }
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    }

    function formatJam(jam) {
        if (!jam) return "-";
        return String(jam).slice(0, 5);
    }

    function namaHari(hari) {
        const daftarHari = [
            "",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu",
        ];

        return daftarHari[Number(hari)] || "-";
    }

    const namaDokter =
        dokter?.full_name ||
        dokter?.username ||
        "Dokter";

    // Foto profil untuk avatar header dan menu Profil Dokter.
    const fotoDokter = dokter?.photo || "";

    // Foto hero khusus untuk kartu sapaan dashboard.
    const fotoHero = dokter?.hero_photo || "";

    const inisial = namaDokter
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((kata) => kata[0])
        .join("")
        .toUpperCase();

    // Sapaan sesuai waktu & hari praktik hari ini (Senin = 1 ... Minggu = 7)
    let sapaan = "Halo";
    let hariIniAngka = 0;
    if (now) {
        const h = now.getHours();
        sapaan =
            h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
        hariIniAngka = now.getDay() === 0 ? 7 : now.getDay();
    }

    const tanggalPanjang = now
        ? now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eaf4fc]">
                <div className="flex flex-col items-center gap-4 text-sm text-[#7198bb]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    Memuat dashboard dokter...
                </div>
            </main>
        );
    }

    if (!dokter) return null;

    return (
        <main className="harmoni-scene relative min-h-screen overflow-hidden px-3 py-4 text-[#244968] sm:px-8 sm:py-8 lg:px-10">
            <style>{`
                @keyframes harmoniRise {
                    from { opacity: 0; transform: translate3d(0, 16px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                .harmoni-enter { animation: harmoniRise .9s cubic-bezier(.16,.78,.25,1) both; }

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

                .harmoni-window {
                    position: relative; z-index: 1;
                    background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.7);
                    box-shadow: 0 40px 100px rgba(55,105,155,.2), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3);
                }
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
                .harmoni-tile:hover {
                    transform: translateY(-3px);
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.75), transparent 58%),
                        linear-gradient(145deg, rgba(255,255,255,.5), rgba(255,255,255,.18));
                    box-shadow: 0 18px 44px rgba(55,105,155,.16), inset 0 1px 0 rgba(255,255,255,1);
                }
                .harmoni-chip {
                    background: rgba(255,255,255,.5);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.95);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                }
                .harmoni-chip-on {
                    background: rgba(255,255,255,.92);
                    border: 1px solid #fff;
                    box-shadow: 0 6px 16px rgba(75,125,165,.18), inset 0 1px 0 #fff;
                }
                .harmoni-modal {
                    background:
                        radial-gradient(120% 70% at 0% 0%, rgba(255,255,255,.7), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.78), rgba(236,245,253,.66));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 40px 110px rgba(30,70,115,.35), inset 0 1.5px 0 #fff;
                }
                .harmoni-focus:focus-visible { outline: 2px solid #3f78a8; outline-offset: 3px; }
                .harmoni-title {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }
                @media (prefers-reduced-motion: reduce) {
                    .harmoni-enter { animation: none !important; }
                    .harmoni-tile { transition: none !important; }
                    .harmoni-tile:hover { transform: none !important; }
                }
                @keyframes harmoniOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .harmoni-sphere {
                    width: 190px; height: 190px; border-radius: 9999px;
                    background: radial-gradient(circle at 32% 26%, #ffffff 0, rgba(255,255,255,.75) 11%, #b9d9f3 42%, #5f98cb 100%);
                    box-shadow: inset -20px -26px 50px rgba(255,255,255,.35), inset 10px 10px 30px rgba(255,255,255,.5), 0 40px 80px rgba(60,110,160,.35);
                }
                .harmoni-ring {
                    position: absolute; inset: -30px; border-radius: 9999px;
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 0 30px rgba(255,255,255,.4);
                    animation: harmoniOrbit 40s linear infinite;
                }
                .harmoni-ring::after {
                    content: ""; position: absolute; top: 12%; left: 8%; width: 12px; height: 12px; border-radius: 9999px;
                    background: #fff; box-shadow: 0 0 16px 4px rgba(255,255,255,.9);
                }
                .harmoni-hairline { background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent); height: 1px; }
                @media (prefers-reduced-motion: reduce) { .harmoni-ring { animation: none !important; } }
                @keyframes harmoniFloatImage {
                    0%, 100% { transform: translate3d(0,0,0); }
                    50% { transform: translate3d(0,-9px,0); }
                }
                .harmoni-hero-photo { animation: harmoniFloatImage 7s ease-in-out infinite; filter: drop-shadow(0 28px 34px rgba(45,83,119,.28)); }
                .harmoni-name {
                    display: block; max-width: 100%; font-size: clamp(2.1rem, 4.4vw, 3.8rem); line-height: 1.06;
                    letter-spacing: -.045em; font-weight: 700; text-wrap: balance;
                }
                .harmoni-name span {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }
                .harmoni-disc {
                    position: absolute; border-radius: 9999px; pointer-events: none;
                    background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(111,166,214,.45));
                    border: 1px solid rgba(255,255,255,.75);
                    box-shadow: inset 0 2px 24px rgba(255,255,255,.6), 0 24px 60px rgba(70,120,170,.15);
                }
                @media (prefers-reduced-motion: reduce) { .harmoni-hero-photo { animation: none !important; } }
            `}</style>

            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1280px] rounded-[32px] p-4 sm:rounded-[44px] sm:p-7">
                {/* ================= HEADER ================= */}
                <header className="flex flex-wrap items-center gap-4 px-1">
                    <div className="mr-auto flex items-center gap-4">
                        <h1 className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </h1>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/dokter/profil")}
                        className="harmoni-chip harmoni-focus group flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 transition hover:bg-white/80"
                    >
                        <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] ring-2 ring-white/80">
                            {fotoDokter ? (
                                <img
                                    src={fotoDokter}
                                    alt={`Foto ${namaDokter}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-[#5c8db5]">{inisial}</span>
                            )}
                        </span>

                        <span className="hidden text-left sm:block">
                            <span className="block text-xs font-bold text-[#426f96]">Profil saya</span>
                            <span className="mt-0.5 block max-w-[130px] truncate text-[10px] text-[#8aa9c6]">
                                {namaDokter}
                            </span>
                        </span>
                    </button>

                    <button
                        onClick={logout}
                        className="harmoni-chip harmoni-focus rounded-full px-5 py-3.5 text-xs font-semibold text-[#5c82a5] transition hover:bg-white/80"
                    >
                        Keluar
                    </button>
                </header>

                {/* ================= BODY ================= */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[170px_1fr]">
                    {/* ---- Sidebar ---- */}
                    <nav
                        aria-label="Menu dokter"
                        className="harmoni-panel hidden h-fit flex-col gap-1 rounded-[26px] p-3 lg:flex"
                    >
                        <span className="rounded-2xl bg-white/75 px-4 py-3 text-xs font-semibold text-[#2b5a84] shadow-[0_6px_18px_rgba(75,125,165,0.12)]">
                            Beranda
                        </span>
                        {MENU.map((m) => (
                            <button
                                key={m.judul}
                                onClick={() => router.push(m.href)}
                                className="harmoni-focus rounded-2xl px-4 py-3 text-left text-xs font-medium text-[#6388a9] transition hover:bg-white/50 hover:text-[#2b5a84]"
                            >
                                {m.judul}
                            </button>
                        ))}
                    </nav>

                    <div className="grid min-w-0 gap-5">
                        {/* ---- Hero + ringkasan ---- */}
                        <div className="grid gap-5 xl:grid-cols-12">
                            {/* Hero */}
                            <section
                                className="harmoni-panel harmoni-enter relative min-h-[400px] rounded-[36px] p-7 sm:p-10 xl:col-span-8 xl:row-span-2 xl:min-h-[460px]"
                                style={{ animationDelay: "100ms" }}
                            >
                                <div className="harmoni-disc -right-10 top-6 h-72 w-72 sm:h-80 sm:w-80" aria-hidden="true" />
                                <div className="harmoni-disc right-16 top-24 h-40 w-40 opacity-70" aria-hidden="true" />

                                <div className="relative z-20 max-w-[60%] sm:max-w-[56%]">
                                    <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                                        <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                                        Ruang kerja dokter
                                    </span>

                                    <h2 className="mt-6">
                                        <span className="block text-lg font-medium text-[#6f93b6] sm:text-xl">
                                            {sapaan}, Dokter
                                        </span>
                                        <span className="harmoni-name mt-1">
                                            <span>{namaDokter}.</span>
                                        </span>
                                    </h2>

                                    <p className="mt-4 max-w-md text-xs leading-6 text-[#6f93b6] sm:text-sm sm:leading-7">
                                        Kelola konsultasi dan rekam medis pasien, serta pantau jadwal
                                        praktik dalam satu ruang kerja.
                                    </p>

                                    {tanggalPanjang && (
                                        <p className="mt-3 text-xs capitalize text-[#8aa9c6]">{tanggalPanjang}</p>
                                    )}

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => router.push("/dokter/janji-temu")}
                                            className="harmoni-focus rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-5 py-3.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                                        >
                                            Periksa janji temu
                                        </button>
                                        <button
                                            onClick={() => router.push("/dokter/rekam-medis")}
                                            className="harmoni-chip harmoni-focus rounded-2xl px-5 py-3.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                                        >
                                            Rekam medis
                                        </button>
                                    </div>
                                </div>

                                {/* Foto hero */}
                                <div className="pointer-events-none absolute bottom-0 right-0 z-10 flex h-full w-[46%] items-end justify-center sm:w-[44%]">
                                    {fotoHero ? (
                                        <img
                                            src={fotoHero}
                                            alt={`Foto hero dokter ${namaDokter}`}
                                            className="harmoni-hero-photo h-[104%] max-w-none object-contain object-bottom"
                                        />
                                    ) : (
                                        <div className="relative mb-10 flex h-[220px] w-[220px] items-center justify-center">
                                            <div className="harmoni-ring" />
                                            <div className="harmoni-sphere flex items-center justify-center">
                                                <span className="text-5xl font-semibold text-white drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                                    {inisial}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Menunggu */}
                            <section
                                className="harmoni-panel harmoni-enter flex flex-col rounded-[32px] p-6 xl:col-span-4"
                                style={{ animationDelay: "200ms" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2b5a84]">Janji temu menunggu</p>
                                        <p className="mt-1 text-xs text-[#7e9fc0]">Permintaan belum divalidasi</p>
                                    </div>
                                    <span className="rounded-full border border-amber-200/80 bg-amber-50/60 px-3 py-1 text-[11px] font-semibold text-amber-700 backdrop-blur-md">
                                        Pending
                                    </span>
                                </div>

                                <p className="mt-5 text-6xl font-light tracking-tight text-[#2b5a84]">
                                    {loadingDashboard ? "…" : dashboard.total_pending}
                                </p>

                                <button
                                    onClick={() => router.push("/dokter/janji-temu")}
                                    className="harmoni-chip harmoni-focus group mt-auto flex items-center justify-between rounded-2xl px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                                >
                                    Validasi janji temu
                                    <span className="transition group-hover:translate-x-0.5">→</span>
                                </button>
                            </section>

                            {/* Disetujui hari ini */}
                            <section
                                className="harmoni-panel harmoni-enter flex flex-col rounded-[32px] p-6 xl:col-span-4"
                                style={{ animationDelay: "280ms" }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-[#2b5a84]">Janji temu hari ini</p>
                                        <p className="mt-1 text-xs text-[#7e9fc0]">Janji temu yang disetujui</p>
                                    </div>
                                    <span className="rounded-full border border-emerald-200/80 bg-emerald-50/60 px-3 py-1 text-[11px] font-semibold text-emerald-700 backdrop-blur-md">
                                        Approved
                                    </span>
                                </div>

                                <p className="mt-5 text-6xl font-light tracking-tight text-[#2b5a84]">
                                    {loadingDashboard ? "…" : dashboard.approved_hari_ini}
                                </p>

                                <button
                                    onClick={() => router.push("/dokter/janji-temu")}
                                    className="harmoni-chip harmoni-focus group mt-auto flex items-center justify-between rounded-2xl px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                                >
                                    Lihat jadwal pasien
                                    <span className="transition group-hover:translate-x-0.5">→</span>
                                </button>
                            </section>
                        </div>

                        {/* ---- Menu utama ---- */}
                        <section>
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
                                <h2 className="text-xl font-semibold tracking-tight text-[#254968]">
                                    Menu utama
                                </h2>
                                <p className="text-xs text-[#7e9fc0]">Akses cepat ke semua layanan dokter.</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {MENU.map((item, i) => (
                                    <button
                                        key={item.judul}
                                        type="button"
                                        onClick={() => router.push(item.href)}
                                        style={{ animationDelay: `${340 + i * 60}ms` }}
                                        className="harmoni-panel harmoni-tile harmoni-enter harmoni-focus group flex min-h-[190px] flex-col justify-between rounded-[28px] p-5 text-left"
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
                        </section>

                        {/* ---- Jadwal praktik + pasien terakhir ---- */}
                        <div className="grid gap-5 lg:grid-cols-2">
                            {/* Jadwal praktik */}
                            <section className="harmoni-panel rounded-[32px] p-6 sm:p-7">
                                <h2 className="text-xl font-semibold tracking-tight text-[#254968]">
                                    Jadwal praktik
                                </h2>
                                <p className="mt-1 text-xs text-[#7e9fc0]">Informasi jam praktikmu.</p>

                                <div className="mt-4">
                                    {loadingDashboard ? (
                                        <p className="flex min-h-28 items-center justify-center text-xs text-[#7e9fc0]">
                                            Memuat jadwal praktik...
                                        </p>
                                    ) : dashboard.jadwal_praktik.length === 0 ? (
                                        <p className="flex min-h-28 items-center justify-center text-xs text-[#7e9fc0]">
                                            Belum ada jadwal praktik.
                                        </p>
                                    ) : (
                                        <ul>
                                            {dashboard.jadwal_praktik.map((jadwal) => {
                                                const hariIni = Number(jadwal.hari) === hariIniAngka;

                                                return (
                                                    <li
                                                        key={jadwal.id}
                                                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/60 py-3.5 last:border-0"
                                                    >
                                                        <span className="flex min-w-[110px] items-center gap-2">
                                                            <span className="text-sm font-semibold text-[#2b5a84]">
                                                                {namaHari(jadwal.hari)}
                                                            </span>
                                                            {hariIni && (
                                                                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                    Hari ini
                                                                </span>
                                                            )}
                                                        </span>

                                                        <span className="text-sm font-semibold text-[#477aa5]">
                                                            {formatJam(jadwal.jam_mulai)}
                                                        </span>

                                                        <span className="text-xs text-[#8aa9c6]">
                                                            {jadwal.durasi} menit
                                                        </span>

                                                        <span className="harmoni-chip rounded-full px-3 py-1 text-[11px] font-medium text-[#5f8fb8]">
                                                            {jadwal.nama_poli || "-"}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </section>

                            {/* Pasien terakhir */}
                            <section className="harmoni-panel rounded-[32px] p-6 sm:p-7">
                                <h2 className="text-xl font-semibold tracking-tight text-[#254968]">
                                    Pasien terakhir diperiksa
                                </h2>
                                <p className="mt-1 text-xs text-[#7e9fc0]">Riwayat pemeriksaan terbaru.</p>

                                <div className="mt-4">
                                    {loadingDashboard ? (
                                        <p className="flex min-h-28 items-center justify-center text-xs text-[#7e9fc0]">
                                            Memuat data pasien...
                                        </p>
                                    ) : dashboard.pasien_terbaru.length === 0 ? (
                                        <p className="flex min-h-28 items-center justify-center text-xs text-[#7e9fc0]">
                                            Belum ada pasien yang diperiksa.
                                        </p>
                                    ) : (
                                        <ul>
                                            {dashboard.pasien_terbaru.map((pasien) => (
                                                <li
                                                    key={pasien.medical_record_id}
                                                    className="flex items-center gap-4 border-b border-white/60 py-3.5 last:border-0"
                                                >
                                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/90 bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] text-sm font-bold text-[#5c8db5] shadow-[0_6px_16px_rgba(60,110,160,0.15)]">
                                                        {pasien.nama_pasien?.charAt(0).toUpperCase()}
                                                    </span>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-[#2b5a84]">
                                                            {pasien.nama_pasien}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs text-[#6f93b6]">
                                                            {pasien.diagnosis}
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-right text-[11px] text-[#8aa9c6]">
                                                        {formatTanggal(pasien.tanggal_pemeriksaan)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </section>
                        </div>

                        {pesanError && (
                            <div
                                role="alert"
                                className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm text-rose-600 backdrop-blur-md"
                            >
                                {pesanError}
                            </div>
                        )}
                    </div>
                </div>

                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Dashboard Dokter</span>
                </footer>
            </div>
        </main>
    );
}
