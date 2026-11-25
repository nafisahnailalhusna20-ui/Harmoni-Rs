"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatTanggal(tanggal) {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function statusStok(stok) {
    if (stok === 0 || stok == null) return "habis";
    if (stok <= 10) return "menipis";
    return "tersedia";
}

const STATUS_STYLE = {
    habis: {
        label: "Stok habis",
        chip: "border-rose-200 bg-rose-50 text-rose-600",
        dot: "bg-rose-400",
    },
    menipis: {
        label: "Stok menipis",
        chip: "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-400",
    },
    tersedia: {
        label: "Tersedia",
        chip: "border-emerald-200 bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-400",
    },
};

function BadgeStatus({ stok }) {
    const s = STATUS_STYLE[statusStok(stok)];
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${s.chip}`}
        >
            {s.label}
        </span>
    );
}

function BadgeTipe({ tipe }) {
    const keras = tipe?.toLowerCase() === "keras";
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${keras
                ? "border-orange-200 bg-orange-50 text-orange-600"
                : "border-[#cfe3f4] bg-white/70 text-[#6f93b5]"
                }`}
        >
            {keras ? "Obat keras" : "Obat biasa"}
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

    // Debounce 400ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 400);
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

    const stat = useMemo(
        () => ({
            total: obatList.length,
            tersedia: obatList.filter((o) => statusStok(o.stok) === "tersedia").length,
            menipis: obatList.filter((o) => statusStok(o.stok) === "menipis").length,
            habis: obatList.filter((o) => statusStok(o.stok) === "habis").length,
        }),
        [obatList]
    );

    const navItems = [
        { label: "Beranda", href: "/dokter" },
        { label: "Janji Temu Pasien", href: "/dokter/janji-temu" },
        { label: "Rekam Medis", href: "/dokter/rekam-medis" },
        { label: "Profil Dokter", href: "/dokter/profil" },
        { label: "Cari Obat", href: "/dokter/obat", active: true },
    ];

    const panel =
        "border border-white/80 bg-gradient-to-br from-white/75 via-white/50 to-[#e3f1ff]/60 backdrop-blur-2xl " +
        "shadow-[0_30px_70px_rgba(75,125,165,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]";

    return (
        <main className="harmoni-dashboard relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,#eaf5ff_35%,#d3e8fb_72%,#e6f2fd_100%)] px-4 py-8 text-[#2d5b88] sm:px-8 lg:px-14">
            {/* soft blobs */}
            <div className="pointer-events-none absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-[#a9d3f7]/45 blur-[120px]" />
            <div className="pointer-events-none absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full bg-[#bfe0fa]/50 blur-[130px]" />

            <div className={`${panel} relative mx-auto max-w-[1280px] rounded-[48px] px-6 py-8 sm:px-10`}>
                {/* ───── Header ───── */}
                <header className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <span className="text-2xl font-black tracking-[0.42em] text-[#2f5f8f]">
                            HARMONI
                        </span>
                        <span className="hidden h-7 w-px bg-[#a9cce8]/60 sm:block" />
                        <span className="hidden text-sm tracking-[0.12em] text-[#6f93b5] sm:block">
                            Hospital Information System
                        </span>
                    </div>

                    <button
                        onClick={() => router.push("/dokter")}
                        className="rounded-full border border-white/90 bg-white/70 px-7 py-3 text-sm font-semibold text-[#3f78a8] shadow-[0_10px_26px_rgba(75,125,165,0.10),inset_0_1px_0_white] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                    >
                        ← Dashboard
                    </button>
                </header>

                <div className="mt-10 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
                    {/* ───── Sidebar ───── */}
                    <nav className="self-start rounded-[32px] border border-white/80 bg-white/45 p-3 shadow-[inset_0_1px_0_white]">
                        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
                            {navItems.map((n) => (
                                <li key={n.label} className="shrink-0">
                                    <button
                                        onClick={() => router.push(n.href)}
                                        className={`w-full whitespace-nowrap rounded-[22px] px-6 py-4 text-left text-[15px] transition-all duration-300 ${n.active
                                            ? "bg-white font-bold text-[#2d5b88] shadow-[0_10px_24px_rgba(75,125,165,0.10)]"
                                            : "font-medium text-[#6f93b5] hover:bg-white/60 hover:text-[#2d5b88]"
                                            }`}
                                    >
                                        {n.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ───── Konten ───── */}
                    <div className="min-w-0 space-y-8">
                        {/* Hero */}
                        <section className="rounded-[40px] border border-white/80 bg-gradient-to-br from-white/80 via-white/55 to-[#d9ecfc]/60 px-8 py-10 shadow-[0_24px_60px_rgba(75,125,165,0.08),inset_0_1px_0_white] sm:px-12">
                            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-[#5b8fb9]">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Apotek rumah sakit
                            </span>

                            <p className="mt-8 text-2xl font-light text-[#6f93b5]">
                                Telusuri ketersediaan
                            </p>
                            <h1 className="mt-1 bg-gradient-to-r from-[#2d5b88] to-[#5b93c0] bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
                                Cari Obat.
                            </h1>
                            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#6f93b5]">
                                Periksa stok, jenis, dan masa kadaluarsa obat sebelum menulis resep untuk pasien.
                            </p>

                            {/* Search */}
                            <div className="mt-8 flex max-w-xl items-center gap-3 rounded-full border border-white/90 bg-white/85 py-2 pl-6 pr-2 shadow-[0_14px_34px_rgba(75,125,165,0.10),inset_0_1px_0_white]">
                                <input
                                    type="text"
                                    placeholder="Ketik nama obat..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#2d5b88] placeholder-[#a3bfd8] outline-none"
                                />
                                {query ? (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="rounded-full bg-[#eaf3fb] px-5 py-3 text-sm font-semibold text-[#4f7ea8] transition hover:bg-[#dcecf9]"
                                    >
                                        Hapus
                                    </button>
                                ) : (
                                    <span className="rounded-full bg-gradient-to-b from-[#5b93c0] to-[#3f78a8] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(63,120,168,0.32)]">
                                        Cari
                                    </span>
                                )}
                            </div>

                            {/* Stat */}
                            <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-[#b8d6ee]/50">
                                {[
                                    ["Total", stat.total],
                                    ["Menipis", stat.menipis],
                                    ["Habis", stat.habis],
                                ].map(([label, val], i) => (
                                    <div key={label} className={i === 0 ? "pr-6" : "px-6"}>
                                        <p className="text-5xl font-bold leading-none text-[#2d5b88]">
                                            {val}
                                        </p>
                                        <p className="mt-2 text-sm text-[#7fa3c4]">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Hasil */}
                        <section className="rounded-[40px] border border-white/80 bg-gradient-to-br from-white/75 via-white/50 to-[#e3f1ff]/55 px-6 py-8 shadow-[0_24px_60px_rgba(75,125,165,0.08),inset_0_1px_0_white] sm:px-10">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-[#2d5b88]">Daftar obat</h2>
                                    <p className="mt-1 text-sm text-[#7fa3c4]">
                                        {debouncedQuery
                                            ? `Hasil untuk "${debouncedQuery}"`
                                            : "Semua obat di apotek"}
                                    </p>
                                </div>
                                {!loading && !error && stat.total > 0 && (
                                    <span className="rounded-full border border-[#fbe3b0] bg-[#fffaf0] px-4 py-1.5 text-xs font-semibold text-[#b45309]">
                                        {stat.total} obat
                                    </span>
                                )}
                            </div>

                            <div className="mt-7">
                                {loading && (
                                    <div className="flex items-center gap-3 py-10 text-sm text-[#7fa3c4]">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#cfe3f4] border-t-[#477da9]" />
                                        Memuat data obat...
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-6 py-4 text-sm text-rose-600">
                                        {error}
                                    </div>
                                )}

                                {!loading && !error && obatList.length === 0 && (
                                    <p className="py-14 text-center text-sm text-[#91adc7]">
                                        {debouncedQuery
                                            ? `Tidak ada obat dengan nama "${debouncedQuery}".`
                                            : "Belum ada data obat."}
                                    </p>
                                )}

                                {!loading && !error && obatList.length > 0 && (
                                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                        {obatList.map((obat) => (
                                            <article
                                                key={obat.id}
                                                className="harmoni-card group flex flex-col rounded-[30px] border border-white/90 bg-white/65 p-6 shadow-[0_14px_34px_rgba(75,125,165,0.07),inset_0_1px_0_white] transition-all duration-500 hover:-translate-y-1 hover:bg-white/90 hover:shadow-[0_24px_46px_rgba(75,125,165,0.14)]"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <BadgeTipe tipe={obat.tipe} />
                                                    <BadgeStatus stok={obat.stok} />
                                                </div>

                                                <h3 className="mt-5 text-xl font-bold leading-snug text-[#2d5b88]">
                                                    {obat.nama}
                                                </h3>

                                                <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-[#7fa3c4]">
                                                    {obat.deskripsi || "Tidak ada deskripsi."}
                                                </p>

                                                <div className="mt-6 flex items-end justify-between border-t border-[#cfe3f4]/70 pt-5">
                                                    <div>
                                                        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9ab6cf]">
                                                            STOK
                                                        </p>
                                                        <p className="mt-1 text-4xl font-bold leading-none text-[#2d5b88]">
                                                            {obat.stok ?? 0}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#9ab6cf]">
                                                            KADALUARSA
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-[#5b8fb9]">
                                                            {formatTanggal(obat.tanggal_kadaluarsa)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#81abcd]/20 pt-6 text-[11px] text-[#8aa6c0]">
                    <span className="font-bold tracking-[0.22em]">HARMONI HEALTHCARE</span>
                    <span>Dashboard Dokter — Cari Obat</span>
                </footer>
            </div>
        </main>
    );
}
