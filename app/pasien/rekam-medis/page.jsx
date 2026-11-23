"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RekamMedisPasienPage() {
    const router = useRouter();

    const [rekamMedis, setRekamMedis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    async function ambilRekamMedis(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await fetch("/api/pasien/rekam-medis", {
                cache: "no-store",
            });

            const result = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setPesan(
                    result.message || "Rekam medis gagal dimuat."
                );
                return;
            }

            setRekamMedis(result.data || []);
            setPesan("");
        } catch (error) {
            console.error("Gagal mengambil rekam medis:", error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        ambilRekamMedis();
    }, []);

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Makassar",
        });
    }

    function inisialDokter(nama) {
        if (!nama) return "DR";

        return nama
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((kata) => kata[0].toUpperCase())
            .join("");
    }

    function getStatusResep(status) {
        const value = (status || "").toLowerCase();

        if (value.includes("diambil")) {
            return "border-[#cde5d9] bg-[#e8f4ee]/80 text-[#6c9a87]";
        }

        if (value.includes("siap")) {
            return "border-[#d2e2f5] bg-[#eaf3ff]/80 text-[#7196c0]";
        }

        return "border-[#e6dfd2] bg-[#f6f1e8]/80 text-[#a28c6b]";
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#eaf2ff] text-[#456b96]">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/80 blur-[120px]" />

                <div className="absolute -right-48 top-20 h-[650px] w-[650px] rounded-full bg-[#c7ddfb]/60 blur-[130px]" />

                <div className="absolute bottom-[-250px] left-[25%] h-[700px] w-[700px] rounded-full bg-[#d4e6ff]/70 blur-[150px]" />

                <div className="absolute left-[45%] top-[35%] h-[300px] w-[300px] rounded-full bg-white/40 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1450px] px-5 py-7 sm:px-8 lg:px-14 lg:py-10">
                <header className="flex items-center justify-between gap-5 border-b border-white/60 pb-7">

                    <div className="flex items-center gap-4">

                        <div className="relative flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/90 bg-gradient-to-br from-white/90 to-[#dceaff]/80 shadow-[inset_0_1px_0_white,0_10px_25px_rgba(94,137,188,0.15)] backdrop-blur-xl">
                            <span className="text-xl font-semibold text-[#75a1d2]">
                                H
                            </span>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold tracking-[0.24em] text-[#426a96] sm:text-xl">
                                HARMONI
                            </h2>

                            <p className="mt-1 text-[9px] tracking-[0.2em] text-[#91accb] sm:text-[10px]">
                                HOSPITAL INFORMATION SYSTEM
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() => router.push("/pasien")}
                        className="group flex items-center gap-3 rounded-full border border-white/80 bg-white/40 px-4 py-3 text-xs text-[#7396bc] shadow-[inset_0_1px_0_white,0_8px_25px_rgba(88,130,180,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_15px_35px_rgba(88,130,180,0.15)] sm:px-6 sm:text-sm"
                    >
                        <span className="transition-transform duration-300 group-hover:-translate-x-1">
                            ←
                        </span>

                        Dashboard
                    </button>

                </header>
                <section className="relative mb-16 mt-14 grid gap-10 lg:mb-20 lg:mt-20 lg:grid-cols-[1fr_320px] lg:items-center">

                    <div className="relative z-10">

                        <div className="mb-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#9bbce1]" />

                            <p className="text-[9px] font-semibold tracking-[0.32em] text-[#87a9cf] sm:text-[10px]">
                                PERSONAL MEDICAL ARCHIVE
                            </p>
                        </div>

                        <h1 className="max-w-4xl text-[38px] font-light leading-[1.15] tracking-[-0.045em] text-[#426990] sm:text-5xl lg:text-[66px]">
                            Your health,
                            <br />

                            <span className="font-medium text-[#8bb4e2]">
                                beautifully documented.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-xl text-sm leading-7 text-[#83a1c2] sm:text-base">
                            Semua perjalanan kesehatan Anda tersimpan
                            dengan rapi, mulai dari hasil pemeriksaan,
                            catatan dokter, hingga resep obat.
                        </p>

                    </div>
                    <div className="relative mx-auto w-full max-w-[320px]">
                        <div className="absolute -inset-5 rounded-[45px] bg-[#c7defb]/50 blur-2xl" />
                        <div className="absolute -right-3 -top-3 h-full w-full rotate-[5deg] rounded-[32px] border border-white/50 bg-[#d7e8fb]/35 shadow-[0_20px_45px_rgba(95,139,190,0.10)] backdrop-blur-xl" />
                        <div className="absolute -bottom-3 -left-3 h-full w-full rotate-[-4deg] rounded-[32px] border border-white/60 bg-white/25 shadow-[0_20px_45px_rgba(95,139,190,0.08)] backdrop-blur-xl" />
                        <div className="relative overflow-hidden rounded-[32px] border border-white/90 bg-gradient-to-br from-white/75 via-white/45 to-[#dceaff]/60 p-7 shadow-[inset_0_1px_0_white,inset_0_-1px_0_rgba(160,195,232,0.3),0_30px_70px_rgba(80,126,180,0.18)] backdrop-blur-3xl">
                            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/60 blur-3xl" />

                            <div className="relative flex items-center justify-between">
                                <p className="text-[9px] font-semibold tracking-[0.25em] text-[#9ab5d5]">
                                    HEALTH RECORDS
                                </p>

                                <span className="h-2 w-2 rounded-full bg-[#a9cbdc] shadow-[0_0_0_5px_rgba(169,203,220,0.18)]" />
                            </div>

                            <div className="relative mt-8 flex items-end justify-between">

                                <div>
                                    <p className="text-6xl font-light tracking-tight text-[#6e9dce]">
                                        {String(rekamMedis.length).padStart(2, "0")}
                                    </p>

                                    <p className="mt-3 text-xs text-[#91accb]">
                                        Total pemeriksaan
                                    </p>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/90 bg-gradient-to-br from-white/90 to-[#dceaff]/80 shadow-[inset_0_1px_0_white,0_12px_25px_rgba(88,130,180,0.12)]">
                                    <span className="text-2xl font-light text-[#8bb1dc]">
                                        +
                                    </span>
                                </div>

                            </div>

                            <div className="relative mt-7 h-px bg-gradient-to-r from-[#c4dcf7] via-white to-transparent" />

                            <p className="relative mt-4 text-[9px] tracking-[0.2em] text-[#a0b8d4]">
                                HARMONI · MEDICAL CENTER
                            </p>

                        </div>
                    </div>

                </section>

                <section>

                    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                        <div>
                            <p className="text-[9px] font-semibold tracking-[0.3em] text-[#9ab5d5]">
                                YOUR HEALTH JOURNEY
                            </p>

                            <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#456d98] sm:text-3xl">
                                Riwayat pemeriksaan
                            </h2>

                            <p className="mt-2 text-sm text-[#8ba8c9]">
                                Catatan medis pribadi Anda.
                            </p>
                        </div>

                        <button
                            onClick={() => ambilRekamMedis(true)}
                            disabled={loading || refreshing}
                            className="flex items-center gap-3 self-start rounded-full border border-white/80 bg-white/45 px-5 py-3 text-xs text-[#7396bc] shadow-[inset_0_1px_0_white,0_8px_25px_rgba(88,130,180,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/75 disabled:opacity-50 sm:self-auto"
                        >
                            <span className={refreshing ? "animate-spin" : ""}>
                                ↻
                            </span>

                            {refreshing ? "Memuat..." : "Perbarui data"}
                        </button>

                    </div>

                    <div className="relative">

                        <div className="absolute -inset-3 rounded-[42px] bg-gradient-to-br from-white/70 via-[#d8e9ff]/40 to-[#c5ddf9]/50 blur-sm" />

                        <div className="relative overflow-hidden rounded-[32px] border border-white/85 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_30px_80px_rgba(77,121,174,0.13)] backdrop-blur-3xl sm:rounded-[40px]">

                            <div className="relative border-b border-white/60 bg-white/20 px-6 py-6 sm:px-10 sm:py-8">

                                <div className="absolute right-0 top-0 h-32 w-64 rounded-full bg-[#d7e9ff]/30 blur-3xl" />

                                <div className="relative flex items-center gap-4">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/90 bg-white/55 shadow-[inset_0_1px_0_white,0_8px_20px_rgba(90,132,181,0.08)]">
                                        <span className="text-lg text-[#8db2dc]">
                                            ◇
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-[#52769e] sm:text-xl">
                                            Medical records
                                        </h3>

                                        <p className="mt-1 text-xs text-[#98b1ce]">
                                            Riwayat dan dokumentasi pemeriksaan
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {loading && (
                                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16">

                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/90 bg-gradient-to-br from-white/80 to-[#dceaff]/70 shadow-[inset_0_1px_0_white,0_15px_35px_rgba(88,130,180,0.12)]">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d4e5f7] border-t-[#8db4df]" />
                                    </div>

                                    <p className="text-sm text-[#8ba8c9]">
                                        Memuat riwayat kesehatan...
                                    </p>

                                </div>
                            )}
                            {!loading && pesan && (
                                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">

                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/90 bg-white/55 text-xl text-[#b08c9b] shadow-[0_12px_30px_rgba(130,110,150,0.08)]">
                                        !
                                    </div>

                                    <p className="text-sm text-[#9c879b]">
                                        {pesan}
                                    </p>

                                    <button
                                        onClick={() => ambilRekamMedis()}
                                        className="mt-5 rounded-full border border-white/90 bg-white/60 px-5 py-2.5 text-xs text-[#789bc3] shadow-sm transition hover:bg-white/90"
                                    >
                                        Coba lagi
                                    </button>

                                </div>
                            )}
                            {!loading && !pesan && rekamMedis.length === 0 && (
                                <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">

                                    <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/90 bg-gradient-to-br from-white/80 to-[#dceaff]/70 shadow-[inset_0_1px_0_white,0_18px_40px_rgba(88,130,180,0.12)]">
                                        <span className="text-3xl font-light text-[#8db4df]">
                                            +
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-medium text-[#52769e]">
                                        Belum ada rekam medis
                                    </h3>

                                    <p className="mt-3 max-w-md text-sm leading-6 text-[#91accb]">
                                        Catatan pemeriksaan akan muncul di sini
                                        setelah dokter menyelesaikan pemeriksaan
                                        Anda.
                                    </p>

                                </div>
                            )}
                            {!loading && !pesan && rekamMedis.length > 0 && (
                                <div className="space-y-8 p-4 sm:p-8 lg:p-10">

                                    {rekamMedis.map((item, index) => {
                                        const resep = Array.isArray(item.resep)
                                            ? item.resep
                                            : [];

                                        return (
                                            <article
                                                key={item.id}
                                                className="group relative"
                                            >
                                                <div className="absolute inset-0 translate-y-3 rounded-[32px] bg-[#bfd7f4]/40 blur-[1px]" />

                                                <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-gradient-to-br from-white/65 via-white/40 to-[#e3efff]/55 shadow-[inset_0_1px_0_white,inset_0_-1px_0_rgba(164,198,234,0.25),0_20px_55px_rgba(80,124,177,0.12)] backdrop-blur-3xl transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[inset_0_1px_0_white,0_30px_70px_rgba(80,124,177,0.18)]">

                                                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/45 blur-[70px]" />

                                                    <div className="relative flex flex-col gap-6 border-b border-white/70 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">

                                                        <div className="flex items-center gap-5">


                                                            <div className="relative shrink-0">

                                                                <div className="absolute -inset-2 rounded-[27px] bg-gradient-to-br from-white/90 via-[#d7e8fb]/80 to-[#bcd5f2]/70 shadow-[0_12px_30px_rgba(83,126,177,0.14)]" />

                                                                <div className="relative h-[82px] w-[82px] overflow-hidden rounded-[22px] border-[3px] border-white/95 bg-gradient-to-br from-[#eaf3ff] to-[#cbdff5] shadow-[inset_0_1px_0_white,0_10px_25px_rgba(83,126,177,0.18)] sm:h-[100px] sm:w-[100px] sm:rounded-[26px]">

                                                                    {item.foto_dokter ? (
                                                                        <img
                                                                            src={item.foto_dokter}
                                                                            alt={`Foto ${item.nama_dokter || "dokter"}`}
                                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-full w-full items-center justify-center">
                                                                            <span className="text-2xl font-medium text-[#7da6d5]">
                                                                                {inisialDokter(item.nama_dokter)}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                </div>

                                                                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white bg-[#b9d8ca] shadow-md" />

                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="text-[9px] font-semibold tracking-[0.24em] text-[#a0b8d4] sm:text-[10px]">
                                                                    ATTENDING PHYSICIAN
                                                                </p>

                                                                <h3 className="mt-2 break-words text-xl font-medium tracking-tight text-[#4b719b] sm:text-2xl">
                                                                    {item.nama_dokter || "Dokter"}
                                                                </h3>

                                                                <p className="mt-1.5 text-sm text-[#8ba8c9]">
                                                                    {item.nama_poli || "Poli tidak tersedia"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                        <div className="sm:text-right">

                                                            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/45 px-4 py-2.5 text-xs text-[#789bc3] shadow-[inset_0_1px_0_white,0_8px_20px_rgba(88,130,180,0.08)] backdrop-blur-xl">
                                                                <span className="text-[#a4bfdc]">
                                                                    ◷
                                                                </span>

                                                                {formatTanggal(
                                                                    item.tanggal_booking ||
                                                                    item.created_at
                                                                )}
                                                            </div>

                                                            <p className="mt-3 text-[9px] tracking-[0.2em] text-[#b0c5dc]">
                                                                RECORD {String(index + 1).padStart(2, "0")}
                                                            </p>

                                                        </div>
                                                    </div>
                                                    <div className="relative grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
                                                        <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_rgba(85,127,178,0.06)] backdrop-blur-xl sm:p-6">

                                                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#d9eaff]/60 blur-2xl" />

                                                            <div className="relative">
                                                                <div className="mb-4 flex items-center gap-3">
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/90 bg-white/55 text-xs text-[#8aafd8] shadow-sm">
                                                                        D
                                                                    </span>

                                                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9ab5d5]">
                                                                        DIAGNOSIS
                                                                    </p>
                                                                </div>

                                                                <p className="text-base leading-7 text-[#52769e]">
                                                                    {item.diagnosis || "-"}
                                                                </p>
                                                            </div>

                                                        </div>

                                                        <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_rgba(85,127,178,0.06)] backdrop-blur-xl sm:p-6">

                                                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#d9eaff]/60 blur-2xl" />

                                                            <div className="relative">
                                                                <div className="mb-4 flex items-center gap-3">
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/90 bg-white/55 text-xs text-[#8aafd8] shadow-sm">
                                                                        T
                                                                    </span>

                                                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9ab5d5]">
                                                                        TINDAKAN
                                                                    </p>
                                                                </div>

                                                                <p className="text-base leading-7 text-[#52769e]">
                                                                    {item.tindakan || "-"}
                                                                </p>
                                                            </div>

                                                        </div>

                                                        <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-gradient-to-br from-white/50 to-[#eaf3ff]/35 p-5 shadow-[inset_0_1px_0_white,0_12px_30px_rgba(85,127,178,0.06)] backdrop-blur-xl sm:col-span-2 sm:p-7">
                                                            <div className="absolute -right-5 -top-12 text-[130px] font-serif leading-none text-white/35">
                                                                “
                                                            </div>

                                                            <div className="relative">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="h-px w-7 bg-[#a7c6e8]" />

                                                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9ab5d5]">
                                                                        CATATAN DOKTER
                                                                    </p>
                                                                </div>

                                                                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[#6486aa] sm:text-base">
                                                                    {item.catatan ||
                                                                        "Tidak ada catatan tambahan dari dokter."}
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </div>

                                                    <div className="relative border-t border-white/70 bg-white/15 px-5 py-6 sm:px-8 sm:py-8">

                                                        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-[0.25em] text-[#a0b8d4]">
                                                                    PHARMACY
                                                                </p>

                                                                <h4 className="mt-2 text-lg font-medium text-[#52769e]">
                                                                    Resep obat
                                                                </h4>
                                                            </div>

                                                            {item.status_resep && (
                                                                <span className={`rounded-full border px-4 py-2 text-xs ${getStatusResep(item.status_resep)}`}>
                                                                    {item.status_resep}
                                                                </span>
                                                            )}

                                                        </div>

                                                        {resep.length > 0 ? (
                                                            <div className="grid gap-3 sm:grid-cols-2">

                                                                {resep.map((obat, obatIndex) => (
                                                                    <div
                                                                        key={`${item.id}-${obatIndex}`}
                                                                        className="group/medicine flex items-center justify-between gap-4 rounded-[20px] border border-white/90 bg-white/40 px-4 py-4 shadow-[inset_0_1px_0_white,0_8px_22px_rgba(88,130,180,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/65 hover:shadow-[0_15px_30px_rgba(88,130,180,0.12)]"
                                                                    >

                                                                        <div className="flex min-w-0 items-center gap-4">

                                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/90 bg-gradient-to-br from-white/80 to-[#dceaff]/70 shadow-[inset_0_1px_0_white,0_7px_16px_rgba(88,130,180,0.08)]">
                                                                                <span className="text-xs font-medium text-[#8aafd8]">
                                                                                    Rx
                                                                                </span>
                                                                            </div>

                                                                            <div className="min-w-0">
                                                                                <p className="break-words text-sm font-medium text-[#52769e]">
                                                                                    {obat.nama_obat}
                                                                                </p>

                                                                                <p className="mt-1 text-[10px] text-[#9ab2ce]">
                                                                                    Jumlah obat
                                                                                </p>
                                                                            </div>

                                                                        </div>

                                                                        <span className="shrink-0 rounded-xl border border-white/90 bg-white/55 px-3 py-2 text-xs text-[#7c9fc6] shadow-sm">
                                                                            {obat.jumlah}
                                                                        </span>

                                                                    </div>
                                                                ))}

                                                            </div>
                                                        ) : (
                                                            <div className="rounded-[20px] border border-white/80 bg-white/30 px-5 py-4 backdrop-blur-xl">
                                                                <p className="text-sm text-[#91aaca]">
                                                                    Tidak ada resep obat untuk pemeriksaan ini.
                                                                </p>
                                                            </div>
                                                        )}

                                                    </div>

                                                </div>

                                            </article>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                    </div>

                </section>

                <footer className="mt-14 flex flex-col justify-between gap-4 border-t border-white/60 pt-7 sm:flex-row sm:items-center">

                    <div>
                        <p className="text-xs font-semibold tracking-[0.25em] text-[#7399c3]">
                            HARMONI
                        </p>

                        <p className="mt-1 text-[10px] text-[#9bb4d1]">
                            Hospital Information System
                        </p>
                    </div>

                    <p className="text-xs text-[#8ca9ca]">
                        Your health, thoughtfully documented.
                    </p>

                </footer>

            </div>
        </main>
    );
}