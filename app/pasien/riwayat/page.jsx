"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STATUS = {
    Pending: {
        label: "Menunggu",
        dot: "bg-amber-400",
        badge: "border-amber-200/80 bg-amber-50/60 text-amber-700",
    },
    Approved: {
        label: "Disetujui",
        dot: "bg-sky-400",
        badge: "border-sky-200/80 bg-sky-50/60 text-sky-700",
    },
    Selesai: {
        label: "Selesai",
        dot: "bg-emerald-400",
        badge: "border-emerald-200/80 bg-emerald-50/60 text-emerald-700",
    },
    Rejected: {
        label: "Ditolak",
        dot: "bg-rose-400",
        badge: "border-rose-200/80 bg-rose-50/60 text-rose-600",
    },
    Dibatalkan: {
        label: "Dibatalkan",
        dot: "bg-slate-400",
        badge: "border-slate-200/80 bg-slate-50/60 text-slate-500",
    },
};

const FILTER = [
    { nilai: "Semua", label: "Semua" },
    { nilai: "Pending", label: "Menunggu" },
    { nilai: "Approved", label: "Disetujui" },
    { nilai: "Selesai", label: "Selesai" },
    { nilai: "Rejected", label: "Ditolak" },
    { nilai: "Dibatalkan", label: "Dibatalkan" },
];

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(`${tanggal}`.slice(0, 10) + "T00:00:00");

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getStatus(status) {
    return STATUS[status] || STATUS.Pending;
}

function inisialDokter(nama) {
    const kata = String(nama || "Dokter")
        .split(/\s+/)
        .filter((k) => !/^dr?g?\.?$/i.test(k));
    return (
        kata
            .slice(0, 2)
            .map((k) => k[0])
            .join("")
            .toUpperCase() || "D"
    );
}

function DoctorPhoto({ item }) {
    const [imageError, setImageError] = useState(false);
    const photo = item.foto_dokter;

    if (photo && !imageError) {
        return (
            <img
                src={photo}
                alt={`Foto ${item.nama_dokter || "dokter"}`}
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] text-xl font-bold text-[#5c8db5]">
            {inisialDokter(item.nama_dokter)}
        </div>
    );
}

export default function RiwayatPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Semua");
    const [cancelLoading, setCancelLoading] = useState(null);

    async function loadRiwayat() {
        try {
            setLoading(true);

            const response = await fetch("/api/pasien/janji-temu?riwayat=true", {
                cache: "no-store",
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setData(result.data || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Gagal memuat riwayat:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRiwayat();
    }, []);

    const jumlah = useMemo(() => {
        return {
            Semua: data.length,
            Pending: data.filter((i) => i.status === "Pending").length,
            Approved: data.filter((i) => i.status === "Approved").length,
            Selesai: data.filter((i) => i.status === "Selesai").length,
            Rejected: data.filter((i) => i.status === "Rejected").length,
            Dibatalkan: data.filter((i) => i.status === "Dibatalkan").length,
        };
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const keyword = search.toLowerCase();

            const cocokSearch =
                (item.nama_dokter || "").toLowerCase().includes(keyword) ||
                (item.nama_poli || "").toLowerCase().includes(keyword) ||
                (item.keluhan || "").toLowerCase().includes(keyword);

            const cocokStatus = filter === "Semua" || item.status === filter;

            return cocokSearch && cocokStatus;
        });
    }, [data, search, filter]);

    async function batalkanJanji(id) {
        const yakin = window.confirm("Batalkan janji temu ini? Riwayat tetap tersimpan.");

        if (!yakin) return;

        try {
            setCancelLoading(id);

            const response = await fetch(`/api/pasien/janji-temu/${id}`, {
                method: "PATCH",
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Janji temu gagal dibatalkan.");
                return;
            }

            await loadRiwayat();
        } catch (error) {
            console.error("Gagal membatalkan janji:", error);

            alert("Terjadi kesalahan saat membatalkan janji temu.");
        } finally {
            setCancelLoading(null);
        }
    }

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
            `}</style>

            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window harmoni-enter mx-auto max-w-[1180px] rounded-[32px] p-4 sm:rounded-[40px] sm:p-6">
                {/* ================= HEADER ================= */}
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-extrabold tracking-[0.3em] text-[#315f88] sm:text-2xl">
                            HARMONI
                        </h1>
                        <span className="hidden h-6 w-px bg-[#8fb6d8]/60 md:block" />
                        <p className="hidden text-xs tracking-[0.08em] text-[#6f93b6] md:block">
                            Hospital Information System
                        </p>
                    </div>

                    <Link
                        href="/pasien"
                        className="harmoni-chip harmoni-focus group flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        <span className="transition group-hover:-translate-x-1">←</span>
                        Dashboard
                    </Link>
                </header>

                {/* ================= JUDUL + RINGKASAN ================= */}
                <section
                    className="harmoni-panel harmoni-enter mt-6 rounded-[30px] p-6 sm:p-9"
                    style={{ animationDelay: "100ms" }}
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                                <span className="harmoni-title">Riwayat kunjungan</span>
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#6f93b6]">
                                Semua catatan konsultasi dan jadwal dokter tersimpan rapi dalam satu
                                ruang.
                            </p>
                        </div>

                        <Link
                            href="/pasien/janji-temu"
                            className="harmoni-focus group inline-flex w-fit shrink-0 items-center gap-4 rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] py-3.5 pl-6 pr-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.3)] transition hover:-translate-y-0.5"
                        >
                            Buat janji baru
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition group-hover:translate-x-0.5">
                                →
                            </span>
                        </Link>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/60 pt-6 sm:grid-cols-4">
                        {[
                            { label: "Total kunjungan", nilai: jumlah.Semua, warna: "text-[#2b5a84]" },
                            { label: "Menunggu", nilai: jumlah.Pending, warna: "text-amber-600" },
                            { label: "Disetujui", nilai: jumlah.Approved, warna: "text-sky-600" },
                            { label: "Selesai", nilai: jumlah.Selesai, warna: "text-emerald-600" },
                        ].map((s) => (
                            <div key={s.label} className="harmoni-chip rounded-2xl px-4 py-3.5">
                                <p className="text-[11px] text-[#7e9fc0]">{s.label}</p>
                                <p className={`mt-1 text-2xl font-semibold tracking-tight ${s.warna}`}>
                                    {loading ? "…" : s.nilai}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= FILTER ================= */}
                <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status">
                        {FILTER.map((f) => (
                            <button
                                key={f.nilai}
                                type="button"
                                onClick={() => setFilter(f.nilai)}
                                aria-pressed={filter === f.nilai}
                                className={`harmoni-focus rounded-full px-4 py-2.5 text-xs font-semibold transition ${filter === f.nilai
                                        ? "harmoni-chip-on text-[#2b5a84]"
                                        : "harmoni-chip text-[#6388a9] hover:bg-white/80"
                                    }`}
                            >
                                {f.label}
                                <span className="ml-1.5 text-[#8aa9c6]">{jumlah[f.nilai]}</span>
                            </button>
                        ))}
                    </div>

                    <label className="harmoni-chip flex w-full items-center gap-3 rounded-full px-5 py-3 lg:w-[300px]">
                        <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari dokter atau poli"
                            aria-label="Cari dokter atau poli"
                            className="w-full bg-transparent text-sm text-[#2b5a84] placeholder:text-[#8aa9c6] focus:outline-none"
                        />
                    </label>
                </section>

                {/* ================= DAFTAR ================= */}
                <section className="mt-5">
                    {loading ? (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {[1, 2].map((item) => (
                                <div key={item} className="harmoni-panel h-64 animate-pulse rounded-[28px]" />
                            ))}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="harmoni-panel flex min-h-[220px] flex-col items-center justify-center rounded-[28px] px-6 text-center">
                            <h3 className="text-lg font-semibold text-[#2b5a84]">
                                Belum ada catatan yang cocok
                            </h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-[#6f93b6]">
                                Coba ubah pencarian atau pilih status yang berbeda.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {filteredData.map((item, i) => {
                                const status = getStatus(item.status);
                                const canCancel = item.status === "Pending"; // hanya Pending

                                return (
                                    <article
                                        key={item.id}
                                        style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                                        className="harmoni-panel harmoni-tile harmoni-enter flex flex-col rounded-[28px] p-5 sm:p-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border-[3px] border-white/90 bg-[#e9f0ff] shadow-[0_10px_26px_rgba(60,110,160,0.2)]">
                                                <DoctorPhoto item={item} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-[#2b5a84]">
                                                        {item.nama_dokter || "Dokter"}
                                                    </h3>

                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md ${status.badge}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-[#6f93b6]">
                                                    {item.nama_poli || "Poli"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl border border-white/70 bg-white/40 px-4 py-3">
                                                <p className="text-[11px] text-[#7e9fc0]">Tanggal</p>
                                                <p className="mt-1 text-sm font-semibold text-[#477aa5]">
                                                    {formatTanggal(item.tanggal_booking)}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-white/70 bg-white/40 px-4 py-3">
                                                <p className="text-[11px] text-[#7e9fc0]">Jam praktik</p>
                                                <p className="mt-1 text-sm font-semibold text-[#477aa5]">
                                                    {item.jam_mulai ? String(item.jam_mulai).slice(0, 5) : "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex-1 rounded-2xl border border-white/70 bg-white/40 px-4 py-3.5">
                                            <p className="text-[11px] text-[#7e9fc0]">Catatan kunjungan</p>
                                            <p className="mt-1.5 break-words text-sm leading-6 text-[#5f86ab]">
                                                {item.keluhan || "Tidak ada keluhan yang dicatat."}
                                            </p>

                                            {item.status === "Rejected" && item.alasan_penolakan && (
                                                <div className="mt-3 rounded-xl border border-rose-200/70 bg-rose-50/60 px-3 py-2.5">
                                                    <p className="text-[11px] font-semibold text-rose-500">
                                                        Catatan dokter
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-rose-600/90">
                                                        {item.alasan_penolakan}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {canCancel && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => batalkanJanji(item.id)}
                                                    disabled={cancelLoading === item.id}
                                                    className="harmoni-chip harmoni-focus rounded-full px-5 py-2.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50/80 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {cancelLoading === item.id ? "Membatalkan..." : "Batalkan janji"}
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Riwayat Kunjungan</span>
                </footer>
            </div>
        </main>
    );
}
