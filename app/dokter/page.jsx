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
    const [cari, setCari] = useState("");

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

    // Foto profil untuk avatar bar atas.
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

    const hasilCari = MENU.filter((m) =>
        `${m.judul} ${m.deskripsi}`.toLowerCase().includes(cari.trim().toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-sm text-[#7198bb]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    Memuat dashboard dokter...
                </div>
            </div>
        );
    }

    if (!dokter) return null;

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
                        placeholder="Cari menu"
                        aria-label="Cari menu"
                        className="w-full bg-transparent text-sm text-[#315879] placeholder:text-[#8aa9c6] focus:outline-none"
                    />
                </label>

                <button
                    onClick={() => router.push("/dokter/profil")}
                    className="harmoni-chip harmoni-focus flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 transition hover:bg-white/80 sm:ml-auto"
                >
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7fcff] to-[#c4dff3] ring-2 ring-white/80">
                        {fotoDokter ? (
                            <img
                                src={fotoDokter}
                                alt={`Foto ${namaDokter}`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-[#5c8db5]">{inisial}</span>
                        )}
                    </span>
                    <span className="max-w-[160px] truncate text-xs font-semibold text-[#426f96]">
                        {namaDokter}
                    </span>
                </button>
            </div>

            {/* ================= HERO ================= */}
            <section
                className="harmoni-panel harmoni-enter relative min-h-[380px] rounded-[36px] p-7 sm:p-10"
                style={{ animationDelay: "100ms" }}
            >
                <div className="harmoni-disc -right-10 top-4 h-72 w-72 sm:h-80 sm:w-80" aria-hidden="true" />
                <div className="harmoni-disc right-20 top-24 h-40 w-40 opacity-70" aria-hidden="true" />

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
                <div className="pointer-events-none absolute bottom-0 right-0 z-10 flex h-full w-[44%] items-end justify-center">
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

            {/* ================= RINGKASAN ================= */}
            <div className="grid gap-5 md:grid-cols-2">
                <section
                    className="harmoni-panel harmoni-enter flex flex-col rounded-[32px] p-6 sm:p-7"
                    style={{ animationDelay: "180ms" }}
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

                    <p className="mt-6 text-7xl font-light tracking-tight text-[#2b5a84]">
                        {loadingDashboard ? "…" : dashboard.total_pending}
                    </p>

                    <button
                        onClick={() => router.push("/dokter/janji-temu")}
                        className="harmoni-chip harmoni-focus group mt-6 flex items-center justify-between rounded-2xl px-5 py-3.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        Validasi janji temu
                        <span className="transition group-hover:translate-x-0.5">→</span>
                    </button>
                </section>

                <section
                    className="harmoni-panel harmoni-enter flex flex-col rounded-[32px] p-6 sm:p-7"
                    style={{ animationDelay: "260ms" }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-[#2b5a84]">Janji temu hari ini</p>
                            <p className="mt-1 text-xs text-[#7e9fc0]">
    Seluruh janji temu pada hari ini
</p>
                        </div>
                        <span className="rounded-full border border-emerald-200/80 bg-emerald-50/60 px-3 py-1 text-[11px] font-semibold text-emerald-700 backdrop-blur-md">
                            Approved
                        </span>
                    </div>

                    <p className="mt-6 text-7xl font-light tracking-tight text-[#2b5a84]">
                        {loadingDashboard ? "…" : dashboard.approved_hari_ini}
                    </p>

                    <button
                        onClick={() => router.push("/dokter/janji-temu")}
                        className="harmoni-chip harmoni-focus group mt-6 flex items-center justify-between rounded-2xl px-5 py-3.5 text-xs font-semibold text-[#477aa5] transition hover:bg-white/80"
                    >
                        Lihat jadwal pasien
                        <span className="transition group-hover:translate-x-0.5">→</span>
                    </button>
                </section>
            </div>

            {/* ================= MENU UTAMA ================= */}
            <section>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
                    <h2 className="text-xl font-semibold tracking-tight text-[#254968]">
                        Menu utama
                    </h2>
                    <p className="text-xs text-[#7e9fc0]">Akses cepat ke semua layanan dokter.</p>
                </div>

                {hasilCari.length === 0 ? (
                    <div className="harmoni-panel flex min-h-[140px] items-center justify-center rounded-[26px] text-sm text-[#7e9fc0]">
                        Tidak ada menu yang cocok dengan pencarianmu.
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        {hasilCari.map((item, i) => (
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
                )}
            </section>

            {/* ================= JADWAL PRAKTIK + PASIEN TERAKHIR ================= */}
            <div className="grid gap-5 2xl:grid-cols-2">
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
    );
}
