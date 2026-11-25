"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatTanggal(tanggal) {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function BadgeTipe({ tipe }) {
    const isKeras = tipe?.toLowerCase() === "keras";
    return (
        <span
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${isKeras
                    ? "border-amber-200/80 bg-amber-50/60 text-amber-700"
                    : "border-white/90 bg-white/55 text-[#477aa5]"
                }`}
        >
            {isKeras ? "Obat keras" : "Obat biasa"}
        </span>
    );
}

function BadgeStok({ stok }) {
    let kelas = "border-emerald-200/80 bg-emerald-50/60 text-emerald-700";
    let label = "Tersedia";
    let titik = "bg-emerald-400";

    if (stok === 0 || stok == null) {
        kelas = "border-rose-200/80 bg-rose-50/60 text-rose-600";
        label = "Stok habis";
        titik = "bg-rose-400";
    } else if (stok <= 10) {
        kelas = "border-amber-200/80 bg-amber-50/60 text-amber-700";
        label = "Stok menipis";
        titik = "bg-amber-400";
    }

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${kelas}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${titik}`} />
            {label}
        </span>
    );
}

export default function CariObatPasien() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [obatList, setObatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Debounce 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch obat
    useEffect(() => {
        let aktif = true;
        setLoading(true);
        setError("");

        fetch(`/api/obat?q=${encodeURIComponent(debouncedQuery)}`, {
            credentials: "include",
            cache: "no-store",
        })
            .then(async (res) => {
                const data = await res.json();
                if (!aktif) return;
                if (!res.ok || !data.success) {
                    if (res.status === 401) {
                        router.replace("/login");
                        return;
                    }
                    setError(data.message || "Gagal memuat data obat.");
                    setObatList([]);
                } else {
                    setObatList(data.data || []);
                }
            })
            .catch(() => {
                if (aktif) setError("Terjadi kesalahan. Periksa koneksi Anda.");
            })
            .finally(() => {
                if (aktif) setLoading(false);
            });

        return () => {
            aktif = false;
        };
    }, [debouncedQuery, router]);

    const ringkasan = useMemo(
        () => ({
            total: obatList.length,
            tersedia: obatList.filter((o) => (o.stok ?? 0) > 10).length,
            menipis: obatList.filter((o) => (o.stok ?? 0) > 0 && (o.stok ?? 0) <= 10).length,
            habis: obatList.filter((o) => (o.stok ?? 0) === 0).length,
        }),
        [obatList]
    );

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

                {/* ================= JUDUL + PENCARIAN ================= */}
                <section className="harmoni-panel harmoni-enter mt-6 rounded-[30px] p-6 sm:p-9" style={{ animationDelay: "100ms" }}>
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                                <span className="harmoni-title">Cari obat</span>
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[#6f93b6]">
                                Telusuri ketersediaan obat di apotek rumah sakit. Ketik nama obat
                                untuk memulai pencarian.
                            </p>
                        </div>

                        <label className="harmoni-chip flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 lg:max-w-md">
                            <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                            <input
                                type="text"
                                placeholder="Cari nama obat..."
                                aria-label="Cari nama obat"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-[#2b5a84] placeholder:text-[#8aa9c6] focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="harmoni-focus shrink-0 rounded-full px-2 text-xs font-medium text-[#7e9fc0] hover:text-[#2b5a84]"
                                >
                                    Hapus
                                </button>
                            )}
                        </label>
                    </div>

                    {/* Ringkasan hasil */}
                    <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/60 pt-6 sm:grid-cols-4">
                        {[
                            { label: "Ditemukan", nilai: ringkasan.total, warna: "text-[#2b5a84]" },
                            { label: "Tersedia", nilai: ringkasan.tersedia, warna: "text-emerald-600" },
                            { label: "Menipis", nilai: ringkasan.menipis, warna: "text-amber-600" },
                            { label: "Habis", nilai: ringkasan.habis, warna: "text-rose-500" },
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

                {/* ================= HASIL ================= */}
                <section className="mt-6">
                    {loading && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className="harmoni-panel h-48 animate-pulse rounded-[26px]"
                                />
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-5 py-4 text-sm text-rose-600 backdrop-blur-md" role="alert">
                            {error}
                        </div>
                    )}

                    {!loading && !error && obatList.length === 0 && (
                        <div className="harmoni-panel flex min-h-[200px] flex-col items-center justify-center rounded-[26px] px-6 text-center">
                            <p className="text-base font-semibold text-[#2b5a84]">
                                Obat tidak ditemukan
                            </p>
                            <p className="mt-2 text-sm text-[#6f93b6]">
                                {debouncedQuery
                                    ? `Tidak ada obat dengan nama "${debouncedQuery}".`
                                    : "Belum ada data obat."}
                            </p>
                        </div>
                    )}

                    {!loading && !error && obatList.length > 0 && (
                        <>
                            <p className="mb-4 px-1 text-xs text-[#7e9fc0]">
                                {obatList.length} obat ditemukan
                                {debouncedQuery ? ` untuk "${debouncedQuery}"` : ""}
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {obatList.map((obat, i) => (
                                    <article
                                        key={obat.id}
                                        style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                                        className="harmoni-panel harmoni-tile harmoni-enter flex flex-col rounded-[26px] p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-base font-semibold leading-snug tracking-tight text-[#2b5a84]">
                                                {obat.nama}
                                            </h3>
                                            <BadgeTipe tipe={obat.tipe} />
                                        </div>

                                        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-[#6f93b6]">
                                            {obat.deskripsi || "Tidak ada deskripsi."}
                                        </p>

                                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/60 pt-4">
                                            <div>
                                                <p className="text-[11px] text-[#7e9fc0]">Stok</p>
                                                <p className="mt-0.5 text-2xl font-semibold tracking-tight text-[#315f88]">
                                                    {obat.stok ?? 0}
                                                </p>
                                            </div>
                                            <BadgeStok stok={obat.stok} />
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-white/70 bg-white/40 px-4 py-3">
                                            <p className="text-[11px] text-[#7e9fc0]">Tanggal kedaluwarsa</p>
                                            <p className="mt-0.5 text-sm font-medium text-[#477aa5]">
                                                {formatTanggal(obat.tanggal_kadaluarsa)}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/50 px-1 pt-4 text-[10px] text-[#7e9fc0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Cari Obat</span>
                </footer>
            </div>
        </main>
    );
}
