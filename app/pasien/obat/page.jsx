"use client";

import { useEffect, useState, useCallback } from "react";
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
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                isKeras
                    ? "border border-orange-200 bg-orange-50 text-orange-600"
                    : "border border-sky-200 bg-sky-50 text-sky-600"
            }`}
        >
            {isKeras ? "⚠ Keras" : "✓ Biasa"}
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
                Stok Menipis
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
            Tersedia
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

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F3F7FC] text-[#31577F]">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-48 -top-48 h-[650px] w-[650px] rounded-full bg-[#C9E2FF]/50 blur-[130px]" />
                <div className="absolute -bottom-56 -left-48 h-[600px] w-[600px] rounded-full bg-[#DCEBFA]/60 blur-[130px]" />
                <div className="absolute left-[38%] top-[42%] h-[300px] w-[300px] rounded-full bg-white/50 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
                {/* Header */}
                <header className="flex flex-col gap-5 border-b border-[#DCE8F5] py-7 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-[0.25em] text-[#31577F] sm:text-[27px]">
                                HARMONI
                            </h1>
                        </div>
                        <span className="h-7 w-px bg-[#BBD2EA]" />
                        <p className="text-xs tracking-[0.12em] text-[#7A9FC5]">
                            Hospital Information System
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden items-center gap-2.5 rounded-full border border-white/80 bg-white/55 px-4 py-2.5 shadow-[0_5px_20px_rgba(74,115,160,0.06)] backdrop-blur-xl sm:flex">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-[11px] tracking-wide text-[#7898B9]">
                                Patient portal
                            </span>
                        </div>

                        <Link
                            href="/pasien"
                            className="rounded-full border border-white/90 bg-white/65 px-5 py-2.5 text-sm text-[#527CA7] shadow-[0_5px_20px_rgba(74,115,160,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(74,115,160,0.13)]"
                        >
                            ← Dashboard
                        </Link>
                    </div>
                </header>

                {/* Page title */}
                <section className="py-10">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="h-px w-9 bg-[#83ACD6]" />
                        <p className="text-[10px] font-semibold tracking-[0.32em] text-[#83A5C9]">
                            MEDICINE DIRECTORY
                        </p>
                    </div>

                    <h2 className="text-3xl font-medium tracking-tight text-[#31577F] sm:text-4xl">
                        Cari Obat
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#7899BA]">
                        Telusuri ketersediaan obat di apotek rumah sakit. Ketik nama obat
                        untuk memulai pencarian.
                    </p>

                    {/* Search box */}
                    <div className="mt-7 flex max-w-xl items-center gap-3 overflow-hidden rounded-[18px] border border-white/90 bg-white/60 px-5 py-3.5 shadow-[0_8px_28px_rgba(74,115,160,0.08)] backdrop-blur-xl">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 shrink-0 text-[#8BAAC9]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari nama obat..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-[#31577F] placeholder-[#9BB8D5] outline-none"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="shrink-0 text-xs text-[#9BB8D5] hover:text-[#527CA7]"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </section>

                {/* Results */}
                <section className="pb-16">
                    {loading && (
                        <div className="flex items-center gap-3 text-sm text-[#7899BA]">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C5DDF5] border-t-[#4E8FC0]" />
                            Memuat data obat...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-sm text-rose-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && obatList.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center text-[#9BB8D5]">
                            <span className="text-5xl opacity-40">💊</span>
                            <p className="text-sm">
                                {debouncedQuery
                                    ? `Tidak ada obat dengan nama "${debouncedQuery}".`
                                    : "Belum ada data obat."}
                            </p>
                        </div>
                    )}

                    {!loading && !error && obatList.length > 0 && (
                        <>
                            <p className="mb-5 text-xs text-[#8BAAC9]">
                                {obatList.length} obat ditemukan
                                {debouncedQuery ? ` untuk "${debouncedQuery}"` : ""}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {obatList.map((obat) => (
                                    <article
                                        key={obat.id}
                                        className="relative overflow-hidden rounded-[22px] border border-white/90 bg-white/50 p-5 shadow-[0_12px_35px_rgba(88,132,179,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_20px_45px_rgba(88,132,179,0.13)]"
                                    >
                                        {/* Top decoration */}
                                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#C5DDF5]/50" />

                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="flex-1 text-base font-semibold leading-snug text-[#31577F]">
                                                {obat.nama}
                                            </h3>
                                            <BadgeTipe tipe={obat.tipe} />
                                        </div>

                                        {obat.deskripsi && (
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#87A4C1]">
                                                {obat.deskripsi}
                                            </p>
                                        )}

                                        <div className="mt-4 border-t border-white/80 pt-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-[10px] text-[#9AB5D1]">STOK</p>
                                                    <p className="mt-0.5 text-lg font-bold text-[#4776A4]">
                                                        {obat.stok ?? 0}
                                                    </p>
                                                </div>
                                                <BadgeStok stok={obat.stok} />
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-[10px] text-[#9AB5D1]">
                                                    TANGGAL KADALUARSA
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#6A93B8]">
                                                    {formatTanggal(obat.tanggal_kadaluarsa)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* Footer */}
                <footer className="flex flex-col gap-4 border-t border-[#DCE8F5] py-7 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-[#5E87B0]">
                            HARMONI
                        </p>
                        <p className="mt-1 text-[10px] tracking-wide text-[#9AB4CF]">
                            Hospital Information System
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-[#B9D2EA]" />
                        <p className="text-xs text-[#89A7C6]">
                            A healthier journey, one step at a time.
                        </p>
                    </div>
                </footer>
            </div>
        </main>
    );
}
