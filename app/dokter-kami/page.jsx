"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const daftarHari = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
    7: "Minggu",
};

function jamSelesai(jamMulai, durasi) {
    const [jam, menit] = String(jamMulai)
        .slice(0, 5)
        .split(":")
        .map(Number);

    const totalMenit = jam * 60 + menit + Number(durasi || 30);
    const jamAkhir = Math.floor(totalMenit / 60) % 24;
    const menitAkhir = totalMenit % 60;

    return `${String(jamAkhir).padStart(2, "0")}:${String(menitAkhir).padStart(2, "0")}`;
}

export default function DaftarDokter() {
    const [dataDokter, setDataDokter] = useState([]);
    const [dataJadwal, setDataJadwal] = useState([]);
    const [loading, setLoading] = useState(true);

    const [poliDipilih, setPoliDipilih] = useState("Semua Poli");
    const [pencarian, setPencarian] = useState("");

    useEffect(() => {
        async function ambilData() {
            try {
                const [responseDokter, responseJadwal] = await Promise.all([
                    fetch("/api/public/dokter"),
                    fetch("/api/public/jadwal"),
                ]);

                const hasilDokter = await responseDokter.json();
                const hasilJadwal = await responseJadwal.json();

                if (responseDokter.ok) {
                    setDataDokter(hasilDokter.data || []);
                }

                if (responseJadwal.ok) {
                    setDataJadwal(hasilJadwal.data || []);
                }
            } catch (error) {
                console.error("Gagal mengambil data dokter dan jadwal:", error);
            } finally {
                setLoading(false);
            }
        }

        ambilData();
    }, []);

    const daftarPoli = useMemo(
        () => [
            "Semua Poli",
            ...new Set(dataDokter.map((d) => d.nama_poli).filter(Boolean)),
        ],
        [dataDokter]
    );

    const dokterTampil = useMemo(() => {
        const kataKunci = pencarian.toLowerCase().trim();

        return dataDokter.filter((dokter) => {
            const sesuaiPoli =
                poliDipilih === "Semua Poli" || dokter.nama_poli === poliDipilih;

            const cocokKata =
                (dokter.full_name || "").toLowerCase().includes(kataKunci) ||
                (dokter.nama_poli || "").toLowerCase().includes(kataKunci);

            return sesuaiPoli && cocokKata;
        });
    }, [dataDokter, poliDipilih, pencarian]);

    // Senin = 1 ... Minggu = 7
    const [hariIniAngka, setHariIniAngka] = useState(null);

    useEffect(() => {
        const hari = new Date().getDay();
        setHariIniAngka(hari === 0 ? 7 : hari);
    }, []);

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
            `}</style>

            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1180px] rounded-[32px] p-4 sm:rounded-[44px] sm:p-7">
                {/* ================= NAVBAR ================= */}
                <nav
                    aria-label="Navigasi utama"
                    className="flex flex-wrap items-center justify-between gap-4 px-1"
                >
                    <Link
                        href="/"
                        className="harmoni-focus rounded-lg text-lg font-extrabold tracking-[0.28em] text-[#315f88] sm:text-xl"
                    >
                        HARMONI
                        <span className="ml-3 hidden text-xs font-medium tracking-[0.1em] text-[#6f93b6] md:inline">
                            Healthcare
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="harmoni-focus rounded-full px-4 py-2.5 text-xs font-semibold text-[#6388a9] transition hover:bg-white/60"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="/poli"
                            className="harmoni-focus rounded-full px-4 py-2.5 text-xs font-semibold text-[#6388a9] transition hover:bg-white/60"
                        >
                            Daftar Poli
                        </Link>
                        <Link
                            href="/login"
                            className="harmoni-chip harmoni-focus rounded-full px-5 py-2.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                        >
                            Login
                        </Link>
                    </div>
                </nav>

                {/* ================= HERO ================= */}
                <section
                    className="harmoni-panel harmoni-enter mt-7 rounded-[36px] p-7 sm:p-11"
                    style={{ animationDelay: "100ms" }}
                >
                    <div className="grid gap-10 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                            <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                                <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                                Tenaga medis
                            </span>

                            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
                                <span className="harmoni-title">Dokter kami,</span>
                                <br />
                                <span className="font-medium text-[#86b0d8]">siap menemanimu.</span>
                            </h1>

                            <p className="mt-5 max-w-md text-sm leading-7 text-[#6f93b6] sm:text-base">
                                Kenali dokter yang tersedia di HARMONI Healthcare dan lihat jadwal
                                praktik mereka.
                            </p>

                            <p className="mt-7 text-sm text-[#7e9fc0]">
                                <span className="font-semibold text-[#2b5a84]">{loading ? "…" : dataJadwal.length}</span>{" "}
                                jadwal praktik di{" "}
                                <span className="font-semibold text-[#2b5a84]">{loading ? "…" : daftarPoli.length - 1}</span>{" "}
                                poli
                            </p>
                        </div>

                        {/* Bola kaca: jumlah dokter */}
                        <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center">
                            <div className="harmoni-ring" />
                            <div className="harmoni-sphere flex flex-col items-center justify-center text-white">
                                <span className="text-6xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                    {loading ? "…" : dataDokter.length}
                                </span>
                                <span className="mt-1 text-xs font-medium text-white/90">dokter</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= PENCARIAN + POLI ================= */}
                <section className="harmoni-panel mt-5 flex flex-col gap-3 rounded-[30px] p-3 lg:flex-row lg:items-center">
                    <label className="flex items-center gap-3 rounded-full bg-white/55 px-5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] lg:w-[300px] lg:shrink-0">
                        <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={pencarian}
                            onChange={(e) => setPencarian(e.target.value)}
                            placeholder="Cari dokter atau poli"
                            aria-label="Cari dokter atau poli"
                            className="w-full bg-transparent text-sm text-[#2b5a84] placeholder:text-[#8aa9c6] focus:outline-none"
                        />
                    </label>

                    <div
                        className="flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                        role="group"
                        aria-label="Filter poli"
                    >
                        {daftarPoli.map((poli) => (
                            <button
                                key={poli}
                                type="button"
                                onClick={() => setPoliDipilih(poli)}
                                aria-pressed={poliDipilih === poli}
                                className={`harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${poliDipilih === poli
                                    ? "harmoni-chip-on text-[#2b5a84]"
                                    : "text-[#6388a9] hover:bg-white/60"
                                    }`}
                            >
                                {poli}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ================= DAFTAR DOKTER ================= */}
                <section className="mt-8">
                    <div className="mb-6 flex items-end justify-between px-1">
                        <h2 className="text-2xl font-semibold tracking-tight text-[#254968]">
                            Daftar dokter
                        </h2>
                        <p className="text-xs text-[#7e9fc0]">
                            {loading ? "Memuat..." : `${dokterTampil.length} dokter ditampilkan`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="harmoni-panel h-96 animate-pulse rounded-[32px]" />
                            ))}
                        </div>
                    ) : dataDokter.length === 0 ? (
                        <div className="harmoni-panel flex min-h-[240px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <p className="text-lg font-semibold text-[#2b5a84]">
                                Belum ada dokter yang tersedia.
                            </p>
                            <p className="mt-2 text-sm text-[#6f93b6]">Silakan kembali lagi nanti.</p>
                        </div>
                    ) : dokterTampil.length === 0 ? (
                        <div className="harmoni-panel flex min-h-[240px] flex-col items-center justify-center rounded-[32px] px-6 text-center">
                            <p className="text-lg font-semibold text-[#2b5a84]">Dokter tidak ditemukan.</p>
                            <p className="mt-2 text-sm text-[#6f93b6]">
                                Coba gunakan nama atau poli yang berbeda.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {dokterTampil.map((dokter, i) => {
                                const jadwalDokter = dataJadwal.filter(
                                    (jadwal) => Number(jadwal.dokter_id) === Number(dokter.id)
                                );

                                return (
                                    <article
                                        key={dokter.id}
                                        style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
                                        className="harmoni-panel harmoni-tile harmoni-enter flex flex-col rounded-[32px] p-6 sm:p-7"
                                    >
                                        {/* Identitas */}
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative">
                                                <div className="absolute -inset-3 rounded-full border border-white/70" />
                                                <div className="absolute -inset-6 rounded-full border border-white/40" />
                                                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[5px] border-white/90 bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] shadow-[0_18px_40px_rgba(60,110,160,0.28)]">
                                                    {dokter.photo ? (
                                                        <img
                                                            src={dokter.photo}
                                                            alt={`Foto ${dokter.full_name}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-4xl font-semibold text-[#5c8db5]">
                                                            {dokter.full_name?.charAt(0)?.toUpperCase() || "D"}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-[3px] border-white bg-[#7fcaae]" />
                                            </div>

                                            <h3 className="mt-9 break-words text-xl font-semibold leading-snug tracking-tight text-[#254968]">
                                                {dokter.full_name}
                                            </h3>

                                            <span className="harmoni-chip mt-2.5 rounded-full px-4 py-1.5 text-xs font-medium text-[#5f8fb8]">
                                                {dokter.nama_poli || "Poli belum ditentukan"}
                                            </span>
                                        </div>

                                        <div className="harmoni-hairline my-6" />

                                        {/* Jadwal praktik */}
                                        <div className="flex-1">
                                            <p className="mb-1 text-xs font-semibold text-[#7e9fc0]">
                                                Jadwal praktik
                                            </p>

                                            {jadwalDokter.length === 0 ? (
                                                <p className="py-3 text-sm text-[#6f93b6]">
                                                    Jadwal belum tersedia.
                                                </p>
                                            ) : (
                                                <ul>
                                                    {jadwalDokter.map((jadwal) => {
                                                        const hariIni = Number(jadwal.hari) === hariIniAngka;

                                                        return (
                                                            <li
                                                                key={jadwal.id}
                                                                className="flex items-center justify-between gap-3 border-b border-white/60 py-3 last:border-0"
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-[#2b5a84]">
                                                                        {daftarHari[Number(jadwal.hari)] || "-"}
                                                                    </span>
                                                                    {hariIni && (
                                                                        <span className="rounded-full border border-emerald-200/80 bg-emerald-50/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                                            Hari ini
                                                                        </span>
                                                                    )}
                                                                </span>

                                                                <span className="text-sm font-semibold text-[#477aa5]">
                                                                    {String(jadwal.jam_mulai).slice(0, 5)}
                                                                    {" – "}
                                                                    {jamSelesai(jadwal.jam_mulai, jadwal.durasi)}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ================= AJAKAN ================= */}
                <section className="relative mt-8 overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-[#5c96c4]/90 to-[#3f78a8]/90 p-8 text-white shadow-[0_30px_70px_rgba(40,95,150,0.3),inset_0_1.5px_0_rgba(255,255,255,0.6)] sm:p-11">
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/30" />
                    <div className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 rounded-full border border-white/25" />
                    <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-md">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Ingin berkonsultasi dengan dokter?
                            </h2>
                            <p className="mt-2 text-sm leading-7 text-white/85">
                                Login terlebih dahulu untuk membuat janji temu.
                            </p>
                        </div>

                        <Link
                            href="/login"
                            className="harmoni-focus group inline-flex w-fit shrink-0 items-center gap-4 rounded-2xl bg-white py-3.5 pl-6 pr-4 text-sm font-bold text-[#3b76a6] shadow-[0_12px_28px_rgba(20,60,100,0.25)] transition hover:-translate-y-0.5"
                        >
                            Buat janji temu
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4a86b8] text-white transition group-hover:translate-x-0.5">
                                →
                            </span>
                        </Link>
                    </div>
                </section>

                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>© 2026 HARMONI Healthcare. All rights reserved.</span>
                </footer>
            </div>
        </main>
    );
}
