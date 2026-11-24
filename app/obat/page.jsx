"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                isKeras
                    ? "border border-orange-200 bg-orange-50 text-orange-600"
                    : "border border-sky-200 bg-sky-50 text-sky-600"
            }`}
        >
            {isKeras ? "⚠ Obat Keras" : "✓ Obat Bebas"}
        </span>
    );
}

function BadgeStok({ stok }) {
    if (stok === 0 || stok == null) {
        return (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                Stok Habis
            </span>
        );
    }
    if (stok <= 10) {
        return (
            <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-[10px] font-semibold text-yellow-700">
                Stok Menipis ({stok})
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
            Tersedia ({stok})
        </span>
    );
}

export default function CariObatPublik() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [obatList, setObatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Debounce 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let aktif = true;
        setLoading(true);
        setError("");

        fetch(`/api/obat?q=${encodeURIComponent(debouncedQuery)}`, {
            cache: "no-store",
        })
            .then(async (res) => {
                const data = await res.json();
                if (!aktif) return;
                if (!res.ok || !data.success) {
                    setError(data.message || "Gagal memuat data obat.");
                    setObatList([]);
                } else {
                    setObatList(data.data || []);
                }
            })
            .catch(() => {
                if (aktif) setError("Terjadi kesalahan koneksi ke server.");
            })
            .finally(() => {
                if (aktif) setLoading(false);
            });

        return () => {
            aktif = false;
        };
    }, [debouncedQuery]);

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4f8ff] via-[#e8f2ff] to-[#dcecff] text-[#193b60]">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#a9d5ff]/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-32 top-[600px] h-[450px] w-[450px] rounded-full bg-[#b9dcff]/40 blur-3xl" />

            {/* Navbar */}
            <nav className="relative z-10 mx-auto max-w-7xl px-5 pt-6 sm:px-8">
                <div className="flex items-center justify-between rounded-[26px] border border-white/80 bg-white/55 px-5 py-4 shadow-[0_12px_40px_rgba(74,125,180,0.08)] backdrop-blur-2xl sm:px-8">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#78baf0] to-[#397bb9] text-xl font-semibold text-white shadow-lg shadow-blue-200/70 transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                            💊
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[#285781] sm:text-lg">
                                HARMONI
                                <span className="ml-1 font-normal text-[#6a9bc9]">
                                    FARMASI
                                </span>
                            </h2>
                            <p className="text-[10px] tracking-wider text-[#91b3d2]">
                                INFORMASI & KETERSEDIAAN OBAT
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="rounded-full border border-white/80 bg-white/60 px-4 py-2 text-xs font-semibold text-[#45729c] shadow-sm backdrop-blur-md transition hover:bg-white"
                        >
                            ← Beranda
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-full bg-gradient-to-r from-[#315F91] to-[#193B65] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content Header */}
            <section className="relative z-10 mx-auto max-w-7xl px-5 pt-12 sm:px-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-1.5 text-xs font-semibold text-[#5480a8] shadow-sm backdrop-blur-md">
                        <span>✦</span>
                        <span>Layanan Apotek Digital</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#1b3f65] sm:text-5xl">
                        Cari Informasi Obat
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#688dae] sm:text-base">
                        Temukan informasi jenis, stok ketersediaan, serta masa berlaku obat-obatan di apotek HARMONI Healthcare.
                    </p>
                </div>

                {/* Search Box */}
                <div className="mx-auto mt-8 max-w-2xl">
                    <div className="relative rounded-[22px] border border-white/90 bg-white/70 p-2 shadow-[0_15px_45px_rgba(74,125,180,0.12)] backdrop-blur-xl">
                        <div className="flex items-center gap-3 px-3">
                            <span className="text-lg text-[#88a9c8]">🔍</span>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ketik nama obat (misal: Paracetamol, Amoxicillin)..."
                                className="w-full bg-transparent py-3 text-sm text-[#254d74] placeholder-[#9cb8d2] outline-none"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="rounded-full bg-[#E5EEF8] px-2.5 py-1 text-xs text-[#527eab] hover:bg-[#D5E4F3]"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status bar */}
                <div className="mt-6 flex items-center justify-between text-xs text-[#6e93b4]">
                    <p>
                        {loading
                            ? "Mencari obat..."
                            : `Menampilkan ${obatList.length} hasil obat`}
                    </p>
                </div>

                {/* Grid Kartu Obat */}
                <div className="mt-6 pb-20">
                    {loading ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="h-44 animate-pulse rounded-[24px] border border-white/60 bg-white/40"
                                />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="rounded-[24px] border border-red-200/80 bg-red-50/70 p-8 text-center text-sm text-red-600">
                            {error}
                        </div>
                    ) : obatList.length === 0 ? (
                        <div className="rounded-[24px] border border-white/80 bg-white/50 p-12 text-center text-[#6e93b4]">
                            <div className="text-4xl">💊</div>
                            <p className="mt-3 font-semibold">Obat tidak ditemukan</p>
                            <p className="mt-1 text-xs text-[#8ca8c3]">
                                Coba gunakan kata kunci pencarian yang lain.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {obatList.map((obat) => (
                                <div
                                    key={obat.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/90 bg-white/65 p-6 shadow-[0_12px_36px_rgba(74,125,180,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-[0_20px_50px_rgba(74,125,180,0.14)]"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <BadgeTipe tipe={obat.tipe} />
                                            <BadgeStok stok={obat.stok} />
                                        </div>

                                        <h3 className="mt-4 text-lg font-bold text-[#204972]">
                                            {obat.nama}
                                        </h3>

                                        <p className="mt-2 text-xs leading-relaxed text-[#6f92b2] line-clamp-3">
                                            {obat.deskripsi || "Tidak ada deskripsi tersedia."}
                                        </p>
                                    </div>

                                    <div className="mt-5 border-t border-[#E1EDF7] pt-3 text-[11px] text-[#86a6c4]">
                                        <span>Kedaluwarsa: </span>
                                        <span className="font-semibold text-[#48739b]">
                                            {formatTanggal(obat.tanggal_kadaluarsa)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
