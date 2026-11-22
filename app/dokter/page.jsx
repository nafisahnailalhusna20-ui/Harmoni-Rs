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

                if (!responseMe.ok || !dataMe.success) {
                    router.push("/login");
                    return;
                }

                if (dataMe.user.role !== "dokter") {
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

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
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

    const glass =
        "relative overflow-hidden border border-white/75 bg-white/40 shadow-[0_12px_30px_rgba(80,130,175,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl";

    const innerGlass =
        "border border-white/80 bg-white/45 shadow-[0_5px_15px_rgba(80,130,175,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl";

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eaf4fc] text-sm text-[#7198bb]">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#cfe3f4] border-t-[#719fc7]" />
                Memuat dashboard dokter...
            </div>
        );
    }

    if (!dokter) return null;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#edf6fd_0%,#dcecf9_45%,#eaf4fc_100%)] px-5 py-7 text-[#234766] sm:px-8 lg:px-12">
            {/* Background glow */}
            <div className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-white/60 blur-[100px]" />
            <div className="pointer-events-none absolute -right-40 top-[520px] h-[450px] w-[450px] rounded-full bg-[#b9d9f3]/50 blur-[110px]" />
            <div className="pointer-events-none absolute left-[35%] top-[1000px] h-[300px] w-[500px] rounded-full bg-[#c9e3f7]/40 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                {/* Header */}
                <header className="flex items-center justify-between gap-5 border-b border-[#8eb6d7]/25 pb-6">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.2em] text-[#7198bb]">
                            HARMONI HEALTHCARE
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#234766] sm:text-4xl">
                            Dashboard Dokter
                        </h1>

                        <p className="mt-2 text-sm text-[#7898b7]">
                            Selamat datang kembali,{" "}
                            <span className="font-semibold text-[#315e85]">
                                {dokter.username}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className={`${innerGlass} flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#52799c] transition hover:-translate-y-0.5 hover:bg-white/70`}
                    >
                        Keluar
                        <span className="text-[#719fc6]">↗</span>
                    </button>
                </header>

                {/* Hero */}
                <section className={`${glass} mt-7 rounded-[28px] bg-gradient-to-br from-white/65 via-white/35 to-[#c6e0f5]/50 p-7 sm:p-10`}>
                    <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/45 px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-[#7198bb] shadow-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#83b7df]" />
                                DOCTOR WORKSPACE
                            </div>

                            <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#234766] sm:text-4xl">
                                Halo, Dokter!
                            </h2>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-[#7393b2]">
                                Kelola konsultasi, jadwal praktik,
                                dan rekam medis pasien dalam satu
                                ruang kerja yang terintegrasi.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <button
                                    onClick={() =>
                                        router.push("/dokter/janji-temu")
                                    }
                                    className="rounded-xl bg-[#477da9] px-5 py-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(71,125,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[#386f9d]"
                                >
                                    Periksa Janji Temu
                                    <span className="ml-3">→</span>
                                </button>

                                <button
                                    onClick={() =>
                                        router.push("/dokter/rekam-medis")
                                    }
                                    className={`${innerGlass} rounded-xl px-5 py-3 text-xs font-semibold text-[#527da3] transition hover:-translate-y-0.5 hover:bg-white/70`}
                                >
                                    Rekam Medis
                                    <span className="ml-3">↗</span>
                                </button>
                            </div>
                        </div>

                        {/* Foto dokter */}
                        <div className="relative mx-auto flex h-64 w-full max-w-[300px] items-center justify-center">
                            {/* Lingkaran glass di belakang foto */}
                            <div className="absolute h-64 w-64 rounded-full border border-white/70 bg-white/20 shadow-[0_10px_35px_rgba(85,140,185,0.10)] backdrop-blur-xl" />

                            {/* Foto profil */}
                            <div className="relative h-52 w-52 overflow-hidden rounded-full border-[6px] border-white/90 bg-white/50 shadow-[0_15px_35px_rgba(70,120,165,0.20)]">
                                <img
                                    src="/uploads/865f6576-d0a7-42c3-a2ca-7e739b1df574.jpg"
                                    alt="Foto dokter"
                                    className="h-full w-full object-cover object-top"
                                />
                            </div>

                            {/* Aksen dekorasi */}
                            <span className="absolute right-5 top-8 text-2xl text-[#8ab8dd]">
                                ✦
                            </span>

                            <span className="absolute bottom-8 left-7 h-2.5 w-2.5 rounded-full bg-[#8ab8dd]/70" />
                        </div>


                        <section className="mt-9">
                            <div className="mb-5 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#7da2c3]">
                                        RINGKASAN AKTIVITAS
                                    </p>

                                    <h2 className="mt-2 text-xl font-semibold text-[#234766]">
                                        Aktivitas hari ini
                                    </h2>
                                </div>

                                <span className="hidden text-xs text-[#8aa6c0] sm:block">
                                    Statistik dashboard
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <article className={`${glass} rounded-[22px] p-6 transition duration-200 hover:-translate-y-1`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#6487a8]">
                                                Janji temu menunggu
                                            </p>

                                            <p className="mt-2 text-xs text-[#8aa8c5]">
                                                Permintaan yang belum divalidasi
                                            </p>
                                        </div>

                                        <div className={`${innerGlass} flex h-11 w-11 items-center justify-center rounded-xl text-[#719fc6]`}>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-5 w-5"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                            >
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v5l3 2" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-end justify-between">
                                        <p className="text-5xl font-bold tracking-tight text-[#315f88]">
                                            {loadingDashboard
                                                ? "..."
                                                : dashboard.total_pending}
                                        </p>

                                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#c8e0f3]/60">
                                            <div className="h-full w-1/3 rounded-full bg-[#83b5dc]" />
                                        </div>
                                    </div>
                                </article>

                                <article className={`${glass} rounded-[22px] p-6 transition duration-200 hover:-translate-y-1`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#6487a8]">
                                                Janji temu hari ini
                                            </p>

                                            <p className="mt-2 text-xs text-[#8aa8c5]">
                                                Janji temu yang sudah disetujui
                                            </p>
                                        </div>

                                        <div className={`${innerGlass} flex h-11 w-11 items-center justify-center rounded-xl text-[#719fc6]`}>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-5 w-5"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="m5 12 4 4L19 6" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-end justify-between">
                                        <p className="text-5xl font-bold tracking-tight text-[#315f88]">
                                            {loadingDashboard
                                                ? "..."
                                                : dashboard.approved_hari_ini}
                                        </p>

                                        <div className="flex items-center gap-1 rounded-full border border-white/75 bg-white/35 px-3 py-1.5 text-[10px] text-[#7398b8]">
                                            <span className="text-[#83b5dc]">✓</span>
                                            Disetujui
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="mt-9">
                            <div className="mb-5">
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#7da2c3]">
                                    AKSES CEPAT
                                </p>

                                <h2 className="mt-2 text-xl font-semibold text-[#234766]">
                                    Menu utama
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <article className={`${glass} rounded-[22px] p-6 transition duration-200 hover:-translate-y-1`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#8aa9c7]">
                                            MENU 01
                                        </span>

                                        <span className="text-lg text-[#83acd0]">
                                            ↗
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                        <div className={`${innerGlass} flex h-14 w-14 items-center justify-center rounded-2xl text-[#719fc6]`}>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-6 w-6"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    x="3"
                                                    y="5"
                                                    width="18"
                                                    height="16"
                                                    rx="3"
                                                />
                                                <path d="M16 3v4M8 3v4M3 10h18" />
                                                <path d="m9 15 2 2 4-4" />
                                            </svg>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-[#315574]">
                                                Janji Temu Pasien
                                            </h3>

                                            <p className="mt-1 text-xs text-[#819fbb]">
                                                Kelola konsultasi pasien
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-xs leading-6 text-[#819fbb]">
                                        Periksa permintaan konsultasi dan
                                        validasi janji temu pasien.
                                    </p>

                                    <button
                                        onClick={() =>
                                            router.push("/dokter/janji-temu")
                                        }
                                        className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/80 bg-white/45 px-4 py-3 text-xs font-semibold text-[#527da3] shadow-sm transition hover:bg-white/70"
                                    >
                                        Lihat Janji Temu
                                        <span className="text-base text-[#78a4ca]">
                                            →
                                        </span>
                                    </button>
                                </article>

                                <article className={`${glass} rounded-[22px] p-6 transition duration-200 hover:-translate-y-1`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#8aa9c7]">
                                            MENU 02
                                        </span>

                                        <span className="text-lg text-[#83acd0]">
                                            ↗
                                        </span>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                        <div className={`${innerGlass} flex h-14 w-14 items-center justify-center rounded-2xl text-[#719fc6]`}>
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-6 w-6"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    x="4"
                                                    y="3"
                                                    width="16"
                                                    height="18"
                                                    rx="3"
                                                />
                                                <path d="M12 8v8M8 12h8" />
                                            </svg>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-[#315574]">
                                                Rekam Medis
                                            </h3>

                                            <p className="mt-1 text-xs text-[#819fbb]">
                                                Riwayat pemeriksaan pasien
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-xs leading-6 text-[#819fbb]">
                                        Catat hasil pemeriksaan, diagnosis,
                                        tindakan, dan resep obat pasien.
                                    </p>

                                    <button
                                        onClick={() =>
                                            router.push("/dokter/rekam-medis")
                                        }
                                        className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/80 bg-white/45 px-4 py-3 text-xs font-semibold text-[#527da3] shadow-sm transition hover:bg-white/70"
                                    >
                                        Buka Rekam Medis
                                        <span className="text-base text-[#78a4ca]">
                                            →
                                        </span>
                                    </button>
                                </article>
                            </div>
                        </section>

                        <section className="mt-9">
                            <div className="mb-5">
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#7da2c3]">
                                    INFORMASI DOKTER
                                </p>

                                <h2 className="mt-2 text-xl font-semibold text-[#234766]">
                                    Jadwal Praktik
                                </h2>
                            </div>

                            <div className={`${glass} rounded-[22px] p-2 sm:px-5`}>
                                {loadingDashboard ? (
                                    <div className="flex min-h-[130px] items-center justify-center text-xs text-[#819fbb]">
                                        Memuat jadwal praktik...
                                    </div>
                                ) : dashboard.jadwal_praktik.length === 0 ? (
                                    <div className="flex min-h-[130px] items-center justify-center text-xs text-[#819fbb]">
                                        Belum ada jadwal praktik.
                                    </div>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full whitespace-nowrap text-left">
                                            <thead>
                                                <tr className="border-b border-[#8cb3d4]/25">
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Hari
                                                    </th>
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Jam
                                                    </th>
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Durasi
                                                    </th>
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Poli
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dashboard.jadwal_praktik.map(
                                                    (jadwal) => (
                                                        <tr
                                                            key={jadwal.id}
                                                            className="border-b border-[#8cb3d4]/15 transition hover:bg-white/30 last:border-0"
                                                        >
                                                            <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                                {namaHari(jadwal.hari)}
                                                            </td>

                                                            <td className="px-4 py-4 text-xs text-[#6384a3]">
                                                                {formatJam(
                                                                    jadwal.jam_mulai
                                                                )}
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
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#7da2c3]">
                                    RIWAYAT PEMERIKSAAN
                                </p>

                                <h2 className="mt-2 text-xl font-semibold text-[#234766]">
                                    Pasien terakhir diperiksa
                                </h2>
                            </div>

                            <div className={`${glass} rounded-[22px] p-2 sm:px-5`}>
                                {loadingDashboard ? (
                                    <div className="flex min-h-[130px] items-center justify-center text-xs text-[#819fbb]">
                                        Memuat data pasien...
                                    </div>
                                ) : dashboard.pasien_terbaru.length === 0 ? (
                                    <div className="flex min-h-[130px] items-center justify-center text-xs text-[#819fbb]">
                                        Belum ada pasien yang diperiksa.
                                    </div>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full whitespace-nowrap text-left">
                                            <thead>
                                                <tr className="border-b border-[#8cb3d4]/25">
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Nama Pasien
                                                    </th>
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Tanggal Pemeriksaan
                                                    </th>
                                                    <th className="px-4 py-4 text-xs font-semibold text-[#7d9fbe]">
                                                        Diagnosis
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dashboard.pasien_terbaru.map(
                                                    (pasien) => (
                                                        <tr
                                                            key={
                                                                pasien.medical_record_id
                                                            }
                                                            className="border-b border-[#8cb3d4]/15 transition hover:bg-white/30 last:border-0"
                                                        >
                                                            <td className="px-4 py-4">
                                                                <div className="flex items-center gap-3 text-xs font-medium text-[#456b8e]">
                                                                    <span className={`${innerGlass} flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold text-[#719fc6]`}>
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

                        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[#81abcd]/20 pt-5 text-[10px] text-[#8aa6c0]">
                            <span className="font-semibold tracking-[0.12em]">
                                HARMONI HEALTHCARE
                            </span>

                            <span>Dashboard Dokter</span>
                        </footer>
                    </div >
                </main >
                );
}