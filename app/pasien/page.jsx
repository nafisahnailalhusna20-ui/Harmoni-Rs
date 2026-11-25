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
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-sm text-[#7198bb]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    Memuat portal pasien...
                </div>
            </div>
        );
    }

    if (!pasien) return null;

    return (
        <div className="grid min-w-0 gap-5">
            {/* ================= BAR ATAS ================= */}
            <div className="harmoni-enter flex flex-wrap items-center gap-3">
                <label className="harmoni-chip flex w-full items-center gap-3 rounded-full px-5 py-3 sm:max-w-[340px]">
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
                    className="harmoni-chip harmoni-focus flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 transition hover:bg-white/80 sm:ml-auto"
                >
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] ring-2 ring-white/80">
                        {fotoPasien ? (
                            <img src={fotoPasien} alt={`Foto ${namaPasien}`} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-[#5c8db5]">{inisial}</span>
                        )}
                    </span>
                    <span className="max-w-[160px] truncate text-xs font-semibold text-[#426f96]">
                        {namaPasien}
                    </span>
                </button>
            </div>

            {/* ================= HERO ================= */}
            <section
                className="harmoni-panel harmoni-enter relative min-h-[320px] rounded-[34px] p-7 sm:p-10"
                style={{ animationDelay: "100ms" }}
            >
                <div className="relative z-10 max-w-[480px]">
                    <span className="harmoni-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-[#5f8fb8]">
                        <span className="h-2 w-2 rounded-full bg-[#7fcaae]" />
                        Portal pasien
                    </span>

                    <h2 className="mt-6">
                        <span className="block text-lg font-medium text-[#6f93b6] sm:text-xl">
                            Selamat datang,
                        </span>
                        <span className="harmoni-name mt-1">
                            <span>{namaPasien}.</span>
                        </span>
                    </h2>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#6f93b6]">
                        Ruang pribadimu untuk mengakses layanan kesehatan, memantau pemeriksaan,
                        dan menjaga informasi tetap terorganisir.
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
                <div className="pointer-events-none absolute -bottom-4 right-6 hidden h-[300px] w-[300px] items-center justify-center md:flex lg:right-12">
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

            {/* ================= JAM + KALENDER ================= */}
            <div className="grid gap-5 md:grid-cols-2">
                <section
                    className="harmoni-panel harmoni-enter flex flex-col justify-between rounded-[30px] p-7"
                    style={{ animationDelay: "180ms" }}
                >
                    <div>
                        <p className="text-xs font-medium text-[#7e9fc0]">{sapaan}</p>
                        <p className="mt-3 text-7xl font-light tracking-tight text-[#2b5a84]">
                            {jam}
                            <span className="mx-1 text-[#8fb6d8]">:</span>
                            {menit}
                        </p>
                        <p className="mt-3 text-sm capitalize text-[#6f93b6]">{tanggalPanjang || "\u00A0"}</p>
                    </div>

                    <div className="mt-8">
                        <div className="mb-2 flex items-center justify-between text-[11px] text-[#8aa9c6]">
                            <span>Hari berjalan</span>
                            <span>{Math.round(progresHari)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/60">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#9cc9ee] to-[#4f8bbf]"
                                style={{ width: `${progresHari}%` }}
                            />
                        </div>
                    </div>
                </section>

                <section
                    className="harmoni-panel harmoni-enter rounded-[30px] p-7"
                    style={{ animationDelay: "260ms" }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold capitalize text-[#2b5a84]">
                            {kalender?.judul || "\u00A0"}
                        </h3>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setOffsetBulan((o) => o - 1)}
                                aria-label="Bulan sebelumnya"
                                className="harmoni-chip harmoni-focus flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#5f8fb8] hover:bg-white/80"
                            >
                                ‹
                            </button>
                            <button
                                onClick={() => setOffsetBulan((o) => o + 1)}
                                aria-label="Bulan berikutnya"
                                className="harmoni-chip harmoni-focus flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#5f8fb8] hover:bg-white/80"
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
                                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs ${
                                        hariIni
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

            {/* ================= LAYANAN ================= */}
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
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
                        {hasilCari.map((item, i) => (
                            <button
                                key={item.judul}
                                type="button"
                                onClick={() => router.push(item.href)}
                                style={{ animationDelay: `${340 + i * 60}ms` }}
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
                <div
                    role="alert"
                    className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-4 py-3 text-sm text-rose-600 backdrop-blur-md"
                >
                    {pesanError}
                </div>
            )}
        </div>
    );
}
