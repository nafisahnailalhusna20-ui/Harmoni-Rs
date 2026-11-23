"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DokterPage() {
    const router = useRouter();

    const [dokter, setDokter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [pesanError, setPesanError] = useState("");

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

    async function logout() {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
        } finally {
            router.push("/login");
        }
    }

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

    // Foto profil untuk avatar header dan menu Profil Dokter.
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

    const glass =
        "border border-white/75 " +
        "bg-white/45 backdrop-blur-2xl " +
        "shadow-[0_18px_45px_rgba(75,125,165,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]";

    const glassButton =
        "border border-white/85 " +
        "bg-white/55 backdrop-blur-xl " +
        "shadow-[0_8px_24px_rgba(75,125,165,0.08),inset_0_1px_0_white] " +
        "transition-all duration-300 " +
        "hover:-translate-y-0.5 hover:bg-white/80";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eaf4fc]">
                <div className="flex flex-col items-center gap-4 text-sm text-[#7198bb]">
                    <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#477da9]" />
                    Memuat dashboard dokter...
                </div>
            </main>
        );
    }

    if (!dokter) return null;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,#eaf5ff_35%,#d9ebfa_72%,#edf6fd_100%)] px-4 py-7 text-[#244968] sm:px-7 lg:px-10">
            <div className="pointer-events-none absolute -left-36 top-36 h-[420px] w-[420px] rounded-full bg-white/70 blur-[120px]" />

            <div className="pointer-events-none absolute -right-40 top-[650px] h-[450px] w-[450px] rounded-full bg-[#b7d9f3]/50 blur-[130px]" />

            <div className="relative mx-auto max-w-7xl">
                <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#a9cce8]/35 pb-6">

                    <div>
                        <p className="text-[10px] font-extrabold tracking-[0.24em] text-[#77a1c6]">
                            HARMONI HEALTHCARE
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#244968] sm:text-4xl">
                            Dashboard Dokter
                        </h1>

                        <p className="mt-2 text-sm text-[#789bbd]">
                            Selamat datang kembali,{" "}
                            <span className="font-semibold text-[#315f85]">
                                {namaDokter}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() =>
                                router.push("/dokter/profil")
                            }
                            className="group flex items-center gap-3 rounded-full border border-white/85 bg-white/45 py-2 pl-2 pr-4 shadow-[0_10px_30px_rgba(75,125,165,0.09),inset_0_1px_0_white] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/75"
                        >
                            <div className="relative h-12 w-12 shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-[#dceefa] to-[#a9cfea] p-[2px] shadow-[0_5px_16px_rgba(75,125,165,0.15)]">
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#f7fcff] to-[#d1e7f6]">
                                        {fotoDokter ? (
                                            <img
                                                src={fotoDokter}
                                                alt={`Foto ${namaDokter}`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold tracking-wide text-[#5c8db5]">
                                                {inisial}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#edf6fc] bg-[#8fc9b5]" />
                            </div>

                            <div className="text-left">
                                <p className="text-xs font-bold text-[#426f96]">
                                    Profil Saya
                                </p>

                                <p className="mt-1 max-w-[125px] truncate text-[10px] text-[#91adc7]">
                                    {namaDokter}
                                </p>
                            </div>

                            <span className="ml-1 text-xs text-[#8bb2d3] transition-transform group-hover:translate-x-0.5">
                                ↗
                            </span>
                        </button>

                        <button
                            onClick={logout}
                            className={`${glassButton} rounded-full px-5 py-3.5 text-xs font-semibold text-[#6388a9]`}
                        >
                            Keluar
                        </button>
                    </div>
                </header>

                <section className={`${glass} relative mt-7 min-h-[300px] overflow-hidden rounded-[30px] p-7 sm:min-h-[340px] sm:p-10`}>

                    <div className="pointer-events-none absolute -right-12 top-5 h-64 w-64 rounded-full border border-white/70 bg-white/15 shadow-[inset_0_0_45px_rgba(255,255,255,0.45)]" />

                    <div className="pointer-events-none absolute right-8 top-12 h-48 w-48 rounded-full border border-white/65 bg-white/10 backdrop-blur-sm" />

                    <div className="pointer-events-none absolute right-20 top-20 h-28 w-28 rounded-full border border-white/60" />

                    <div className="relative z-20 max-w-[65%] sm:max-w-[62%] lg:max-w-[58%]">

                        <span className="inline-flex rounded-full border border-white/90 bg-white/65 px-4 py-2 text-[10px] font-bold tracking-[0.15em] text-[#80a6c7] shadow-sm backdrop-blur-xl">
                            RUANG KERJA DOKTER
                        </span>

                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#244968] sm:text-4xl">
                            Halo, Dokter!
                        </h2>

                        <p className="mt-4 max-w-xl text-xs leading-6 text-[#789bbd] sm:text-sm sm:leading-7">
                            Kelola konsultasi dan rekam medis
                            pasien, serta pantau jadwal praktik
                            dalam satu ruang kerja.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">

                            <button
                                onClick={() =>
                                    router.push(
                                        "/dokter/janji-temu"
                                    )
                                }
                                className="rounded-2xl bg-gradient-to-br from-[#5c96c4] to-[#407ba9] px-4 py-3 text-[10px] font-bold text-white shadow-[0_12px_28px_rgba(63,121,169,0.25)] transition hover:-translate-y-0.5 sm:px-5 sm:py-3.5 sm:text-xs"
                            >
                                Periksa Janji Temu →
                            </button>

                            <button
                                onClick={() =>
                                    router.push(
                                        "/dokter/rekam-medis"
                                    )
                                }
                                className={`${glassButton} rounded-2xl px-4 py-3 text-[10px] font-semibold text-[#527da3] sm:px-5 sm:py-3.5 sm:text-xs`}
                            >
                                Rekam Medis ↗
                            </button>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute bottom-0 right-0 z-10 flex h-full w-[48%] items-end justify-center sm:w-[42%] lg:w-[38%]">

                        {fotoHero ? (
                            <img
                                src={fotoHero}
                                alt={`Foto hero dokter ${namaDokter}`}
                                className="h-[105%] max-w-none object-contain object-bottom drop-shadow-[0_18px_22px_rgba(53,91,125,0.16)]"
                            />
                        ) : (
                            <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-white/80 bg-white/45 text-4xl font-bold text-[#7ca9ce] shadow-[0_15px_40px_rgba(75,125,165,0.12)] backdrop-blur-xl sm:h-40 sm:w-40">
                                {inisial}
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-9">

                    <div className="mb-5">
                        <p className="text-[10px] font-extrabold tracking-[0.19em] text-[#80a7c9]">
                            RINGKASAN AKTIVITAS
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#254968]">
                            Aktivitas hari ini
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        <article className={`${glass} rounded-[26px] p-6`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#6288aa]">
                                        Janji temu menunggu
                                    </p>

                                    <p className="mt-1.5 text-xs text-[#91adc7]">
                                        Permintaan belum divalidasi
                                    </p>
                                </div>

                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-white/75 text-lg text-[#79a8cf] shadow-sm">
                                    ◷
                                </span>
                            </div>

                            <div className="mt-5 flex items-end justify-between">
                                <p className="text-5xl font-bold tracking-tight text-[#315f88]">
                                    {loadingDashboard
                                        ? "..."
                                        : dashboard.total_pending}
                                </p>

                                <span className="rounded-full border border-white/80 bg-white/55 px-3 py-1.5 text-[10px] font-semibold text-[#7ba6ca]">
                                    Pending
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    router.push("/dokter/janji-temu")
                                }
                                className={`${glassButton} mt-5 rounded-xl px-4 py-3 text-xs font-semibold text-[#527da3]`}
                            >
                                Validasi Janji Temu →
                            </button>
                        </article>

                        <article className={`${glass} rounded-[26px] p-6`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#6288aa]">
                                        Janji temu hari ini
                                    </p>

                                    <p className="mt-1.5 text-xs text-[#91adc7]">
                                        Janji temu yang disetujui
                                    </p>
                                </div>

                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white bg-white/75 text-lg text-[#79a8cf] shadow-sm">
                                    ✓
                                </span>
                            </div>

                            <div className="mt-5 flex items-end justify-between">
                                <p className="text-5xl font-bold tracking-tight text-[#315f88]">
                                    {loadingDashboard
                                        ? "..."
                                        : dashboard.approved_hari_ini}
                                </p>

                                <span className="rounded-full border border-white/80 bg-white/55 px-3 py-1.5 text-[10px] font-semibold text-[#7ba6ca]">
                                    Approved
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    router.push("/dokter/janji-temu")
                                }
                                className={`${glassButton} mt-5 rounded-xl px-4 py-3 text-xs font-semibold text-[#527da3]`}
                            >
                                Lihat Jadwal Pasien →
                            </button>
                        </article>
                    </div>
                </section>

                <section className="mt-9">

                    <div className="mb-5">
                        <p className="text-[10px] font-extrabold tracking-[0.19em] text-[#80a7c9]">
                            AKSES CEPAT
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#254968]">
                            Menu utama
                        </h2>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">

                        <article className={`${glass} rounded-[26px] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/65`}>
                            <p className="text-[10px] font-bold tracking-[0.15em] text-[#9ab6cf]">
                                MENU 01
                            </p>

                            <div className="mt-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-white to-[#dceefa] text-[#70a4ce] shadow-sm">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="3" y="5" width="18" height="16" rx="3" />
                                        <path d="M16 3v4M8 3v4M3 10h18" />
                                        <path d="m9 15 2 2 4-4" />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#315879]">
                                        Janji Temu Pasien
                                    </h3>

                                    <p className="mt-1 text-xs text-[#88a6c2]">
                                        Validasi konsultasi
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 min-h-[40px] text-xs leading-6 text-[#819fbb]">
                                Periksa permintaan dan kelola status
                                janji temu pasien.
                            </p>

                            <button
                                onClick={() =>
                                    router.push("/dokter/janji-temu")
                                }
                                className={`${glassButton} mt-5 flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold text-[#527da3]`}
                            >
                                Lihat Janji Temu
                                <span>→</span>
                            </button>
                        </article>

                        <article className={`${glass} rounded-[26px] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/65`}>
                            <p className="text-[10px] font-bold tracking-[0.15em] text-[#9ab6cf]">
                                MENU 02
                            </p>

                            <div className="mt-5 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-white to-[#dceefa] text-[#70a4ce] shadow-sm">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    >
                                        <rect x="4" y="3" width="16" height="18" rx="3" />
                                        <path d="M12 8v8M8 12h8" />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#315879]">
                                        Rekam Medis
                                    </h3>

                                    <p className="mt-1 text-xs text-[#88a6c2]">
                                        Catatan pemeriksaan
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 min-h-[40px] text-xs leading-6 text-[#819fbb]">
                                Isi diagnosis, tindakan medis,
                                catatan, dan resep pasien.
                            </p>

                            <button
                                onClick={() =>
                                    router.push("/dokter/rekam-medis")
                                }
                                className={`${glassButton} mt-5 flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold text-[#527da3]`}
                            >
                                Buka Rekam Medis
                                <span>→</span>
                            </button>
                        </article>

                        <article className={`${glass} rounded-[26px] p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/65`}>
                            <p className="text-[10px] font-bold tracking-[0.15em] text-[#9ab6cf]">
                                MENU 03
                            </p>

                            <div className="mt-5 flex items-center gap-4">
                                <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white bg-gradient-to-br from-white to-[#dceefa] shadow-sm">
                                    {fotoDokter ? (
                                        <img
                                            src={fotoDokter}
                                            alt="Foto dokter"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#70a4ce]">
                                            {inisial}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-[#315879]">
                                        Profil Dokter
                                    </h3>

                                    <p className="mt-1 text-xs text-[#88a6c2]">
                                        Informasi akun
                                    </p>
                                </div>
                            </div>

                            <p className="mt-5 min-h-[40px] text-xs leading-6 text-[#819fbb]">
                                Lihat dan kelola informasi profil
                                dokter serta data akun.
                            </p>

                            <button
                                onClick={() =>
                                    router.push("/dokter/profil")
                                }
                                className={`${glassButton} mt-5 flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold text-[#527da3]`}
                            >
                                Lihat Profil Saya
                                <span>→</span>
                            </button>
                        </article>
                    </div>
                </section>

                <section className="mt-9">

                    <div className="mb-5">
                        <p className="text-[10px] font-extrabold tracking-[0.19em] text-[#80a7c9]">
                            INFORMASI DOKTER
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#254968]">
                            Jadwal Praktik
                        </h2>
                    </div>

                    <div className={`${glass} overflow-hidden rounded-[26px] p-3 sm:p-5`}>

                        {loadingDashboard ? (
                            <div className="flex min-h-28 items-center justify-center text-xs text-[#819fbb]">
                                Memuat jadwal praktik...
                            </div>
                        ) : dashboard.jadwal_praktik.length === 0 ? (
                            <div className="flex min-h-28 items-center justify-center text-xs text-[#819fbb]">
                                Belum ada jadwal praktik.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left">
                                    <thead>
                                        <tr className="border-b border-[#a7c9e3]/35">
                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Hari
                                            </th>

                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Jam
                                            </th>

                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Durasi
                                            </th>

                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Poli
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dashboard.jadwal_praktik.map(
                                            (jadwal) => (
                                                <tr
                                                    key={jadwal.id}
                                                    className="border-b border-[#a7c9e3]/20 last:border-0 transition hover:bg-white/30"
                                                >
                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {namaHari(jadwal.hari)}
                                                    </td>

                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {formatJam(jadwal.jam_mulai)}
                                                    </td>

                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {jadwal.durasi} menit
                                                    </td>

                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {jadwal.nama_poli || "-"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <section className="mt-9">

                    <div className="mb-5">
                        <p className="text-[10px] font-extrabold tracking-[0.19em] text-[#80a7c9]">
                            RIWAYAT PEMERIKSAAN
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-[#254968]">
                            Pasien terakhir diperiksa
                        </h2>
                    </div>

                    <div className={`${glass} overflow-hidden rounded-[26px] p-3 sm:p-5`}>

                        {loadingDashboard ? (
                            <div className="flex min-h-28 items-center justify-center text-xs text-[#819fbb]">
                                Memuat data pasien...
                            </div>
                        ) : dashboard.pasien_terbaru.length === 0 ? (
                            <div className="flex min-h-28 items-center justify-center text-xs text-[#819fbb]">
                                Belum ada pasien yang diperiksa.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[580px] text-left">
                                    <thead>
                                        <tr className="border-b border-[#a7c9e3]/35">
                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Nama Pasien
                                            </th>

                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Tanggal Pemeriksaan
                                            </th>

                                            <th className="px-4 py-4 text-xs font-bold text-[#83a4c2]">
                                                Diagnosis
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {dashboard.pasien_terbaru.map(
                                            (pasien) => (
                                                <tr
                                                    key={pasien.medical_record_id}
                                                    className="border-b border-[#a7c9e3]/20 last:border-0 transition hover:bg-white/30"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3 text-xs font-semibold text-[#456b8e]">
                                                            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white bg-white/75 text-xs font-bold text-[#77a5cb]">
                                                                {pasien.nama_pasien
                                                                    ?.charAt(0)
                                                                    .toUpperCase()}
                                                            </span>

                                                            {pasien.nama_pasien}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {formatTanggal(
                                                            pasien.tanggal_pemeriksaan
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                        {pasien.diagnosis}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {pesanError && (
                    <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
                        {pesanError}
                    </div>
                )}

                <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#81abcd]/20 pt-6 text-[10px] text-[#8aa6c0]">
                    <span className="font-bold tracking-[0.18em]">
                        HARMONI HEALTHCARE
                    </span>

                    <span>Dashboard Dokter</span>
                </footer>
            </div>
        </main>
    );
}