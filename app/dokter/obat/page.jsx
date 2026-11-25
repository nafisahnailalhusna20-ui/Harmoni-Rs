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

// Selisih hari sampai kedaluwarsa (negatif = sudah lewat). null jika tanggal tidak valid.
function sisaHari(tanggal) {
    if (!tanggal) return null;
    const target = new Date(tanggal);
    if (Number.isNaN(target.getTime())) return null;

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.round((target - hariIni) / 86400000);
}

const STATUS_STYLE = {
    habis: {
        label: "Stok habis",
        chip: "border-rose-200/80 bg-rose-50/60 text-rose-600",
        dot: "bg-rose-400",
        bar: "from-rose-300 to-rose-400",
    },
    menipis: {
        label: "Stok menipis",
        chip: "border-amber-200/80 bg-amber-50/60 text-amber-700",
        dot: "bg-amber-400",
        bar: "from-amber-300 to-amber-400",
    },
    tersedia: {
        label: "Tersedia",
        chip: "border-emerald-200/80 bg-emerald-50/60 text-emerald-700",
        dot: "bg-emerald-400",
        bar: "from-[#9cc9ee] to-[#4f8bbf]",
    },
};

function BadgeStatus({ stok }) {
    const s = STATUS_STYLE[statusStok(stok)];
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${s.chip}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function BadgeTipe({ tipe }) {
    const keras = tipe?.toLowerCase() === "keras";
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${
                keras
                    ? "border-orange-200/80 bg-orange-50/60 text-orange-700"
                    : "border-white/90 bg-white/55 text-[#477aa5]"
            }`}
        >
            {keras ? "Obat keras" : "Obat biasa"}
        </span>
    );
}

const FILTER_STATUS = [
    { nilai: "semua", label: "Semua" },
    { nilai: "tersedia", label: "Tersedia" },
    { nilai: "menipis", label: "Menipis" },
    { nilai: "habis", label: "Habis" },
];

const FILTER_TIPE = [
    { nilai: "semua", label: "Semua jenis" },
    { nilai: "biasa", label: "Obat biasa" },
    { nilai: "keras", label: "Obat keras" },
];

export default function CariObatDokter() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [obatList, setObatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [filterStatus, setFilterStatus] = useState("semua");
    const [filterTipe, setFilterTipe] = useState("semua");

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

    const jumlahFilter = {
        semua: stat.total,
        tersedia: stat.tersedia,
        menipis: stat.menipis,
        habis: stat.habis,
    };

    const obatTampil = useMemo(
        () =>
            obatList.filter((o) => {
                const cocokStatus = filterStatus === "semua" || statusStok(o.stok) === filterStatus;
                const keras = o.tipe?.toLowerCase() === "keras";
                const cocokTipe =
                    filterTipe === "semua" ||
                    (filterTipe === "keras" && keras) ||
                    (filterTipe === "biasa" && !keras);
                return cocokStatus && cocokTipe;
            }),
        [obatList, filterStatus, filterTipe]
    );

    return (
        <div className="grid min-w-0 gap-5">
            {/* ================= HERO ================= */}
            <section
                className="harmoni-panel harmoni-enter rounded-[36px] p-7 sm:p-10"
                style={{ animationDelay: "60ms" }}
            >
                <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                        <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                            <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                            Apotek rumah sakit
                        </span>

                        <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">
                            <span className="harmoni-title">Cari obat,</span>
                            <br />
                            <span className="font-medium text-[#86b0d8]">cek stoknya.</span>
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-7 text-[#6f93b6] sm:text-base">
                            Periksa stok, jenis, dan masa kedaluwarsa obat sebelum menulis resep untuk
                            pasien.
                        </p>

                        <label className="harmoni-chip mt-7 flex max-w-md items-center gap-3 rounded-full py-2 pl-5 pr-2">
                            <span className="text-sm text-[#7e9fc0]" aria-hidden="true">⌕</span>
                            <input
                                type="text"
                                placeholder="Ketik nama obat"
                                aria-label="Cari nama obat"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="min-w-0 flex-1 bg-transparent text-sm text-[#2b5a84] placeholder:text-[#8aa9c6] focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="harmoni-focus rounded-full bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white"
                                >
                                    Hapus
                                </button>
                            )}
                        </label>
                    </div>

                    {/* Bola kaca: total obat */}
                    <div className="relative mx-auto flex h-[250px] w-[250px] items-center justify-center">
                        <div className="harmoni-ring" />
                        <div className="harmoni-sphere flex flex-col items-center justify-center text-white">
                            <span className="text-6xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(40,90,140,0.35)]">
                                {loading ? "…" : stat.total}
                            </span>
                            <span className="mt-1 text-xs font-medium text-white/90">obat ditemukan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FILTER ================= */}
            <section className="harmoni-panel flex flex-col gap-3 rounded-[30px] p-3 lg:flex-row lg:items-center lg:justify-between">
                <div
                    className="flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                    role="group"
                    aria-label="Filter stok"
                >
                    {FILTER_STATUS.map((f) => (
                        <button
                            key={f.nilai}
                            type="button"
                            onClick={() => setFilterStatus(f.nilai)}
                            aria-pressed={filterStatus === f.nilai}
                            className={`harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                                filterStatus === f.nilai
                                    ? "harmoni-chip-on text-[#2b5a84]"
                                    : "text-[#6388a9] hover:bg-white/60"
                            }`}
                        >
                            {f.label}
                            <span className="ml-1.5 text-[#8aa9c6]">{loading ? "" : jumlahFilter[f.nilai]}</span>
                        </button>
                    ))}
                </div>

                <div
                    className="flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                    role="group"
                    aria-label="Filter jenis obat"
                >
                    {FILTER_TIPE.map((f) => (
                        <button
                            key={f.nilai}
                            type="button"
                            onClick={() => setFilterTipe(f.nilai)}
                            aria-pressed={filterTipe === f.nilai}
                            className={`harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                                filterTipe === f.nilai
                                    ? "harmoni-chip-on text-[#2b5a84]"
                                    : "text-[#6388a9] hover:bg-white/60"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ================= DAFTAR OBAT ================= */}
            <section>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2 px-1">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-[#254968]">
                            Daftar obat
                        </h2>
                        <p className="mt-1 text-xs text-[#7e9fc0]">
                            {debouncedQuery
                                ? `Hasil untuk "${debouncedQuery}"`
                                : "Semua obat di apotek"}
                        </p>
                    </div>
                    {!loading && !error && stat.total > 0 && (
                        <p className="text-xs text-[#7e9fc0]">{obatTampil.length} obat ditampilkan</p>
                    )}
                </div>

                {loading && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="harmoni-panel h-64 animate-pulse rounded-[30px]" />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-5 py-4 text-sm text-rose-600 backdrop-blur-md"
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && obatList.length === 0 && (
                    <div className="harmoni-panel flex min-h-[220px] flex-col items-center justify-center rounded-[30px] px-6 text-center">
                        <p className="text-lg font-semibold text-[#2b5a84]">Obat tidak ditemukan</p>
                        <p className="mt-2 text-sm text-[#6f93b6]">
                            {debouncedQuery
                                ? `Tidak ada obat dengan nama "${debouncedQuery}".`
                                : "Belum ada data obat."}
                        </p>
                    </div>
                )}

                {!loading && !error && obatList.length > 0 && obatTampil.length === 0 && (
                    <div className="harmoni-panel flex min-h-[220px] flex-col items-center justify-center rounded-[30px] px-6 text-center">
                        <p className="text-lg font-semibold text-[#2b5a84]">Tidak ada yang cocok</p>
                        <p className="mt-2 text-sm text-[#6f93b6]">
                            Coba ubah filter stok atau jenis obat.
                        </p>
                    </div>
                )}

                {!loading && !error && obatTampil.length > 0 && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
                        {obatTampil.map((obat, i) => {
                            const status = statusStok(obat.stok);
                            const s = STATUS_STYLE[status];
                            const persen = Math.min(100, Math.max(status === "habis" ? 0 : 4, Number(obat.stok) || 0));
                            const sisa = sisaHari(obat.tanggal_kadaluarsa);

                            return (
                                <article
                                    key={obat.id}
                                    style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                                    className="harmoni-panel harmoni-tile harmoni-enter flex flex-col rounded-[30px] p-6"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <BadgeTipe tipe={obat.tipe} />
                                        <BadgeStatus stok={obat.stok} />
                                    </div>

                                    <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-[#254968]">
                                        {obat.nama}
                                    </h3>

                                    <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-[#6f93b6]">
                                        {obat.deskripsi || "Tidak ada deskripsi."}
                                    </p>

                                    <div className="harmoni-hairline my-5" />

                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] text-[#7e9fc0]">Stok</p>
                                            <p className="mt-1 text-5xl font-light leading-none tracking-tight text-[#2b5a84]">
                                                {obat.stok ?? 0}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[11px] text-[#7e9fc0]">Kedaluwarsa</p>
                                            <p className="mt-1 text-sm font-semibold text-[#477aa5]">
                                                {formatTanggal(obat.tanggal_kadaluarsa)}
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/60"
                                        role="img"
                                        aria-label={`Level stok ${s.label}`}
                                    >
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${s.bar}`}
                                            style={{ width: `${persen}%` }}
                                        />
                                    </div>

                                    {sisa !== null && sisa <= 30 && (
                                        <p
                                            className={`mt-4 w-fit rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-md ${
                                                sisa < 0
                                                    ? "border-rose-200/80 bg-rose-50/60 text-rose-600"
                                                    : "border-amber-200/80 bg-amber-50/60 text-amber-700"
                                            }`}
                                        >
                                            {sisa < 0
                                                ? "Sudah kedaluwarsa"
                                                : sisa === 0
                                                    ? "Kedaluwarsa hari ini"
                                                    : `Kedaluwarsa ${sisa} hari lagi`}
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
