"use client";

import { useEffect, useState } from "react";
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

export default function CariObatDokter() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [obatList, setObatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const glass =
        "border border-white/75 bg-white/42 backdrop-blur-2xl " +
        "shadow-[0_22px_55px_rgba(75,125,165,0.10),inset_0_1px_0_rgba(255,255,255,0.96)] " +
        "transition-[background,box-shadow,transform] duration-500";

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
        <main className="harmoni-dashboard relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,#eaf5ff_35%,#d9ebfa_72%,#edf6fd_100%)] px-4 py-7 text-[#244968] sm:px-7 lg:px-10">
            {/* BG blobs */}
            <div className="pointer-events-none absolute -left-36 top-36 h-[520px] w-[520px] rounded-full bg-white/75 blur-[130px]" />
            <div className="pointer-events-none absolute right-[12%] top-24 h-[340px] w-[340px] rounded-full bg-[#d5eaff]/65 blur-[105px]" />
            <div className="pointer-events-none absolute -right-40 top-[650px] h-[450px] w-[450px] rounded-full bg-[#b7d9f3]/50 blur-[130px]" />

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#a9cce8]/35 pb-6">
                    <div>
                        <p className="text-[10px] font-extrabold tracking-[0.24em] text-[#77a1c6]">
                            HARMONI HEALTHCARE
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#244968] sm:text-4xl">
                            Cari Obat
                        </h1>
                        <p className="mt-2 text-sm text-[#789bbd]">
                            Telusuri ketersediaan obat di apotek rumah sakit.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/dokter")}
                        className="rounded-full border border-white/85 bg-white/55 px-5 py-3 text-xs font-semibold text-[#6388a9] shadow-[0_8px_24px_rgba(75,125,165,0.08),inset_0_1px_0_white] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80"
                    >
                        ← Dashboard
                    </button>
                </header>

                {/* Search box */}
                <section className="mt-8">
                    <div className={`${glass} flex max-w-xl items-center gap-3 overflow-hidden rounded-[18px] px-5 py-3.5`}>
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
                            className="flex-1 bg-transparent text-sm text-[#244968] placeholder-[#9BB8D5] outline-none"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="shrink-0 text-xs text-[#9BB8D5] hover:text-[#527da3]"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </section>

                {/* Results */}
                <section className="mt-8 pb-16">
                    {loading && (
                        <div className="flex items-center gap-3 text-sm text-[#789bbd]">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#cfe3f4] border-t-[#477da9]" />
                            Memuat data obat...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-sm text-rose-600">
                            {error}
                        </div>
                    )}

                    {!loading && !error && obatList.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center text-[#91adc7]">
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
                            <p className="mb-5 text-xs text-[#91adc7]">
                                {obatList.length} obat ditemukan
                                {debouncedQuery ? ` untuk "${debouncedQuery}"` : ""}
                            </p>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {obatList.map((obat) => (
                                    <article
                                        key={obat.id}
                                        className={`${glass} harmoni-card relative overflow-hidden rounded-[26px] p-6`}
                                        style={{
                                            background:
                                                "linear-gradient(145deg, rgba(255,255,255,.58), rgba(238,248,255,.34))",
                                        }}
                                    >
                                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/60" />

                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="flex-1 text-base font-bold leading-snug text-[#315879]">
                                                {obat.nama}
                                            </h3>
                                            <BadgeTipe tipe={obat.tipe} />
                                        </div>

                                        {obat.deskripsi && (
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#819fbb]">
                                                {obat.deskripsi}
                                            </p>
                                        )}

                                        <div className="mt-4 border-t border-white/60 pt-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-[0.15em] text-[#9ab6cf]">
                                                        STOK
                                                    </p>
                                                    <p className="mt-0.5 text-2xl font-bold text-[#315f88]">
                                                        {obat.stok ?? 0}
                                                    </p>
                                                </div>
                                                <BadgeStok stok={obat.stok} />
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-[10px] font-bold tracking-[0.15em] text-[#9ab6cf]">
                                                    KADALUARSA
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#6384a3]">
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
                <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#81abcd]/20 pt-6 pb-4 text-[10px] text-[#8aa6c0]">
                    <span className="font-bold tracking-[0.18em]">HARMONI HEALTHCARE</span>
                    <span>Dashboard Dokter — Cari Obat</span>
                </footer>
            </div>
        </main>
    );
}
