
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function JanjiTemuPage() {
    const [janjiTemu, setJanjiTemu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [kataKunci, setKataKunci] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [memproses, setMemproses] = useState(null);

    // State modal penolakan
    const [targetTolak, setTargetTolak] = useState(null);
    const [alasanTolak, setAlasanTolak] = useState("");
    const [errorTolak, setErrorTolak] = useState("");
    const dialogRef = useRef(null);

    async function ambilData() {
        setLoading(true);

        try {
            const response = await fetch("/api/admin/janji-temu");
            const data = await response.json();

            if (response.ok && data.success) {
                setJanjiTemu(
                    Array.isArray(data.data) ? data.data : []
                );
                setPesan("");
                return true;
            }

            setPesan(
                data.message || "Data janji temu gagal dimuat."
            );
            return false;

        } catch (error) {
            console.error("Gagal mengambil data:", error);

            setPesan(
                "Terjadi kesalahan saat mengambil data."
            );
            return false;

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    // Mengontrol modal penolakan
    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (targetTolak && !dialog.open) {
            dialog.showModal();
        } else if (!targetTolak && dialog.open) {
            dialog.close();
        }
    }, [targetTolak]);

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function formatHari(hari) {
        if (!hari) return "-";

        const daftarHari = [
            "-",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu",
        ];

        const angkaHari = Number(hari);

        if (angkaHari >= 1 && angkaHari <= 7) {
            return daftarHari[angkaHari];
        }

        return hari;
    }

    function formatJam(jam) {
        if (!jam) return "-";

        return String(jam).slice(0, 5);
    }

    function warnaStatus(status) {
        if (status === "Approved") {
            return "bg-emerald-100 text-emerald-700";
        }

        if (status === "Rejected") {
            return "bg-rose-100 text-rose-600";
        }

        if (status === "Selesai") {
            return "bg-blue-100 text-blue-700";
        }

        if (status === "Dibatalkan") {
            return "bg-slate-100 text-slate-600";
        }

        return "bg-amber-100 text-amber-700";
    }

    function namaStatus(status) {
        if (status === "Approved") return "Disetujui";
        if (status === "Rejected") return "Ditolak";
        if (status === "Pending") return "Menunggu";

        return status || "-";
    }

    // Membuka modal alasan penolakan
    function bukaModalTolak(item) {
        if (memproses !== null) return;

        setTargetTolak(item);
        setAlasanTolak("");
        setErrorTolak("");
    }

    // Menutup modal alasan penolakan
    function tutupModalTolak() {
        if (memproses !== null) return;

        setTargetTolak(null);
        setAlasanTolak("");
        setErrorTolak("");
    }

    // Memperbarui status janji temu
    async function ubahStatus(id, status, alasan = "") {
        if (memproses !== null) return false;

        const alasanBersih = alasan.trim();

        if (status === "Rejected") {
            if (!alasanBersih) {
                setErrorTolak(
                    "Alasan penolakan wajib diisi."
                );
                return false;
            }

            if (alasanBersih.length > 500) {
                setErrorTolak(
                    "Alasan penolakan maksimal 500 karakter."
                );
                return false;
            }
        }

        setMemproses(id);
        setPesan("");
        setErrorTolak("");

        try {
            const response = await fetch(
                "/api/admin/janji-temu",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id,
                        status,
                        alasan_penolakan:
                            status === "Rejected"
                                ? alasanBersih
                                : "",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.success === false) {
                const message =
                    data.message || "Status gagal diperbarui.";

                if (status === "Rejected") {
                    setErrorTolak(message);
                } else {
                    setPesan(message);
                }

                return false;
            }

            const berhasilDimuat = await ambilData();

            if (berhasilDimuat) {
                setPesan(
                    data.message ||
                    (
                        status === "Rejected"
                            ? "Janji temu berhasil ditolak."
                            : "Janji temu berhasil disetujui."
                    )
                );
            }

            return true;

        } catch (error) {
            console.error("Gagal mengubah status:", error);

            const message =
                "Terjadi kesalahan saat mengubah status.";

            if (status === "Rejected") {
                setErrorTolak(message);
            } else {
                setPesan(message);
            }

            return false;

        } finally {
            setMemproses(null);
        }
    }

    // Menjalankan penolakan setelah alasan diisi
    async function konfirmasiTolak(e) {
        e.preventDefault();

        if (!targetTolak || memproses !== null) return;

        const alasan = alasanTolak.trim();

        if (!alasan) {
            setErrorTolak(
                "Silakan masukkan alasan penolakan."
            );
            return;
        }

        const berhasil = await ubahStatus(
            targetTolak.id,
            "Rejected",
            alasan
        );

        if (berhasil) {
            setTargetTolak(null);
            setAlasanTolak("");
            setErrorTolak("");
        }
    }

    const dataTersaring = janjiTemu.filter((item) => {
        const pencarian = kataKunci.toLowerCase();

        const cocokPencarian = [
            item.nama_pasien,
            item.nama_dokter,
            item.nama_poli,
            item.keluhan,
        ].some((nilai) =>
            String(nilai || "")
                .toLowerCase()
                .includes(pencarian)
        );

        const cocokStatus =
            filterStatus === "Semua" ||
            item.status === filterStatus;

        return cocokPencarian && cocokStatus;
    });

    const jumlahMenunggu = janjiTemu.filter(
        (item) => item.status === "Pending"
    ).length;

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(120deg,#f9fbff_0%,#edf5ff_55%,#dcecff_100%)] px-6 py-8 text-[#315D87] sm:px-10 lg:px-16">

            <div className="mx-auto w-full max-w-[1500px]">

                {/* Header */}
                <header className="flex w-full flex-col justify-between gap-5 border-b border-white/80 pb-6 sm:flex-row sm:items-center">

                    <div className="flex flex-wrap items-center gap-4">

                        <Link
                            href="/admin"
                            className="text-2xl font-bold tracking-[5px] text-[#315D87] sm:text-3xl"
                        >
                            HARMONI
                        </Link>

                        <span className="hidden h-6 w-px bg-[#A8C5E2] sm:block" />

                        <p className="text-xs tracking-[1.5px] text-[#789DC5] sm:text-sm">
                            Hospital Information System
                        </p>

                    </div>

                    <Link
                        href="/admin"
                        className="inline-flex w-fit items-center gap-3 rounded-full border border-white/80 bg-white/40 px-6 py-3 text-sm text-[#4779AA] shadow-sm transition hover:bg-white/75"
                    >
                        <span>←</span>
                        Dashboard
                    </Link>

                </header>

                {/* Hero */}
                <section className="mt-12 mb-12 grid w-full grid-cols-1 items-center gap-10 md:grid-cols-[1.5fr_0.7fr] lg:mt-16 lg:mb-16">

                    <div className="min-w-0">

                        <p className="mb-8 text-xs font-semibold tracking-[3px] text-[#7298C0] sm:text-sm">
                            ───　ADMINISTRATION / APPOINTMENT
                        </p>

                        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#294D73] sm:text-5xl lg:text-6xl">

                            Jadwal kunjungan,

                            <br />

                            <span className="font-normal text-[#78A5D5]">
                                lebih terorganisir.
                            </span>

                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-[#7298C0] sm:text-lg">
                            Kelola pendaftaran dan jadwal kunjungan pasien
                            dalam satu ruang kerja yang terintegrasi.
                        </p>

                    </div>

                    <div className="relative flex min-w-0 flex-col items-start text-left md:items-end md:text-right">

                        <span className="absolute -top-16 right-0 -z-0 select-none text-[130px] font-bold leading-none text-[#B8D5F2]/45 sm:text-[160px] lg:text-[180px]">
                            06
                        </span>

                        <div className="relative z-10 mt-2">

                            <p className="text-xs tracking-[4px] text-[#7298C0] sm:text-sm">
                                APPOINTMENT DIRECTORY
                            </p>

                            <p className="mt-8 max-w-xs text-base leading-8 text-[#648DB9] sm:text-lg">

                                Setiap kunjungan,

                                <br />

                                tercatat dengan lebih rapi.

                            </p>

                        </div>

                    </div>

                </section>

                {/* Statistik */}
                <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

                    <div className="rounded-3xl border border-white/85 bg-white/45 p-6 shadow-sm backdrop-blur-xl">

                        <p className="text-sm text-[#789DC5]">
                            Total Pendaftaran
                        </p>

                        <p className="mt-3 text-3xl font-semibold text-[#315D87]">
                            {janjiTemu.length}
                        </p>

                    </div>

                    <div className="rounded-3xl border border-white/85 bg-white/45 p-6 shadow-sm backdrop-blur-xl">

                        <p className="text-sm text-[#789DC5]">
                            Menunggu Persetujuan
                        </p>

                        <p className="mt-3 text-3xl font-semibold text-amber-600">
                            {jumlahMenunggu}
                        </p>

                    </div>

                    <div className="rounded-3xl border border-white/85 bg-white/45 p-6 shadow-sm backdrop-blur-xl">

                        <p className="text-sm text-[#789DC5]">
                            Data Ditampilkan
                        </p>

                        <p className="mt-3 text-3xl font-semibold text-[#5B91C2]">
                            {dataTersaring.length}
                        </p>

                    </div>

                </section>

                {/* Daftar janji temu */}
                <section className="w-full overflow-hidden rounded-[30px] border border-white/85 bg-white/45 shadow-[0_15px_50px_rgba(99,145,190,0.08)] backdrop-blur-2xl sm:rounded-[36px]">

                    <div className="flex flex-col justify-between gap-5 border-b border-white/75 px-6 py-7 sm:flex-row sm:items-center sm:px-8">

                        <div>

                            <p className="text-xs tracking-[2px] text-[#789DC5]">
                                06 — APPOINTMENT
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold text-[#315D87]">
                                Daftar janji temu
                            </h2>

                            <p className="mt-2 text-sm text-[#789DC5]">
                                Informasi jadwal dan status kunjungan pasien.
                            </p>

                        </div>

                        <span className="w-fit rounded-2xl bg-[#DCEBFA]/75 px-5 py-3 text-sm text-[#5685B7]">
                            {janjiTemu.length} pendaftaran
                        </span>

                    </div>

                    {/* Pencarian dan filter */}
                    <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-8">

                        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5">

                            <span className="text-lg text-[#789DC5]">
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={kataKunci}
                                onChange={(e) =>
                                    setKataKunci(e.target.value)
                                }
                                placeholder="Cari pasien, dokter, poli, atau keluhan..."
                                className="w-full min-w-0 bg-transparent text-sm text-[#315D87] outline-none placeholder:text-[#91ABC7]"
                            />

                            {kataKunci && (

                                <button
                                    type="button"
                                    onClick={() => setKataKunci("")}
                                    className="text-lg text-[#789DC5]"
                                >
                                    ×
                                </button>

                            )}

                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value)
                            }
                            className="rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5 text-sm text-[#5685B7] outline-none"
                        >

                            <option value="Semua">
                                Semua Status
                            </option>

                            <option value="Pending">
                                Menunggu
                            </option>

                            <option value="Approved">
                                Disetujui
                            </option>

                            <option value="Rejected">
                                Ditolak
                            </option>

                            <option value="Selesai">
                                Selesai
                            </option>

                            <option value="Dibatalkan">
                                Dibatalkan
                            </option>

                        </select>

                        <button
                            type="button"
                            onClick={ambilData}
                            disabled={loading || memproses !== null}
                            className="rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5 text-sm text-[#5685B7] transition hover:bg-white/80 disabled:opacity-50"
                        >
                            ↻ Perbarui
                        </button>

                    </div>

                    {/* Notifikasi */}
                    {pesan && (

                        <div
                            role="status"
                            className="mx-6 mb-5 rounded-2xl border border-blue-200/50 bg-blue-100/40 px-5 py-4 text-sm text-[#477AA9] sm:mx-8"
                        >
                            {pesan}
                        </div>

                    )}

                    {loading ? (

                        <div className="flex flex-col items-center py-20 text-[#789DC5]">

                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#D5E6F7] border-t-[#5B91C2]" />

                            <p className="text-sm">
                                Memuat data janji temu...
                            </p>

                        </div>

                    ) : dataTersaring.length === 0 ? (

                        <div className="px-6 py-20 text-center">

                            <p className="text-lg font-medium text-[#315D87]">

                                {janjiTemu.length === 0
                                    ? "Belum ada janji temu"
                                    : "Data tidak ditemukan"}

                            </p>

                            <p className="mt-2 text-sm text-[#789DC5]">

                                {janjiTemu.length === 0
                                    ? "Pendaftaran pasien akan muncul di sini."
                                    : "Coba ubah kata kunci atau filter status."}

                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto px-6 sm:px-8">

                            <table className="w-full min-w-[1250px] table-fixed border-collapse text-left text-sm text-[#334F69]">

                                <thead>

                                    <tr className="border-b border-[#8CB1D5]/40 text-xs font-semibold tracking-[1px] text-[#5685B7]">

                                        <th className="w-14 px-3 py-5 text-center">
                                            NO.
                                        </th>

                                        <th className="w-[145px] px-3 py-5">
                                            PASIEN
                                        </th>

                                        <th className="w-[145px] px-3 py-5">
                                            DOKTER
                                        </th>

                                        <th className="w-[120px] px-3 py-5">
                                            POLI
                                        </th>

                                        <th className="w-[160px] px-3 py-5">
                                            TANGGAL
                                        </th>

                                        <th className="w-[90px] px-3 py-5">
                                            HARI
                                        </th>

                                        <th className="w-[80px] px-3 py-5">
                                            JAM
                                        </th>

                                        <th className="w-[210px] px-3 py-5">
                                            KELUHAN
                                        </th>

                                        <th className="w-[135px] px-3 py-5">
                                            STATUS
                                        </th>

                                        <th className="w-[150px] px-3 py-5 text-center">
                                            AKSI
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {dataTersaring.map((item, index) => (

                                        <tr
                                            key={item.id}
                                            className="border-b border-[#8CB1D5]/20 transition hover:bg-white/30"
                                        >

                                            <td className="px-3 py-6 text-center text-[#89A4BE]">
                                                {index + 1}
                                            </td>

                                            <td className="px-3 py-6 font-semibold text-[#315D87]">
                                                {item.nama_pasien || "-"}
                                            </td>

                                            <td className="px-3 py-6">
                                                {item.nama_dokter || "-"}
                                            </td>

                                            <td className="px-3 py-6">

                                                <span className="inline-block rounded-xl bg-[#DCEBFA]/65 px-3 py-2 text-xs text-[#5685B7]">
                                                    {item.nama_poli || "-"}
                                                </span>

                                            </td>

                                            <td className="whitespace-nowrap px-3 py-6">
                                                {formatTanggal(item.tanggal_booking)}
                                            </td>

                                            <td className="px-3 py-6">
                                                {formatHari(item.hari)}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-6">
                                                {formatJam(item.jam_mulai)}
                                            </td>

                                            <td className="break-words px-3 py-6 leading-7 text-[#6F8CA8]">
                                                {item.keluhan || "-"}
                                            </td>

                                            <td className="px-3 py-6">

                                                <span
                                                    className={`inline-block whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold ${warnaStatus(item.status)}`}
                                                >
                                                    {namaStatus(item.status)}
                                                </span>

                                                {item.alasan_penolakan && (

                                                    <p className="mt-2 break-words text-xs leading-5 text-rose-500">
                                                        Alasan: {item.alasan_penolakan}
                                                    </p>

                                                )}

                                            </td>

                                            <td className="px-3 py-6">

                                                {item.status === "Pending" ? (

                                                    <div className="flex flex-col gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                ubahStatus(item.id, "Approved")
                                                            }
                                                            disabled={memproses !== null}
                                                            className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50"
                                                        >

                                                            {memproses === item.id
                                                                ? "Memproses..."
                                                                : "Setujui"}

                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                bukaModalTolak(item)
                                                            }
                                                            disabled={memproses !== null}
                                                            className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-200 disabled:opacity-50"
                                                        >
                                                            Tolak
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-[#819BB4]">
                                                        Sudah diproses
                                                    </span>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                    {!loading && dataTersaring.length > 0 && (

                        <div className="border-t border-[#8CB1D5]/20 px-6 py-5 text-xs text-[#89A5C0]">

                            Menampilkan {dataTersaring.length} dari{" "}
                            {janjiTemu.length} pendaftaran

                        </div>

                    )}

                </section>

                <footer className="mt-8 text-center text-xs tracking-[2px] text-[#91ABC7]">
                    HARMONI · HOSPITAL INFORMATION SYSTEM
                </footer>

            </div>

            {/* Custom modal alasan penolakan */}
            <dialog
                ref={dialogRef}
                aria-labelledby="judul-penolakan"
                onCancel={(e) => {
                    e.preventDefault();
                    tutupModalTolak();
                }}
                className="fixed inset-0 m-auto max-h-[90vh] w-[92%] max-w-lg overflow-y-auto rounded-[30px] border border-white/90 bg-[#F5F9FE] p-6 text-[#315D87] shadow-[0_30px_100px_rgba(39,75,116,.25)] backdrop:bg-[#29496b]/30 backdrop:backdrop-blur-md sm:p-8"
            >

                {targetTolak && (

                    <>

                        <div className="mb-6 flex items-start justify-between">

                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F0D5D8] bg-[#FCF2F5] text-[#CE7B84]">

                                <svg
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="16"
                                        rx="2"
                                    />

                                    <path d="M16 3v4" />
                                    <path d="M8 3v4" />
                                    <path d="M3 10h18" />
                                    <path d="m10 13 4 4" />
                                    <path d="m14 13-4 4" />

                                </svg>

                            </div>

                            <button
                                type="button"
                                onClick={tutupModalTolak}
                                disabled={memproses !== null}
                                aria-label="Tutup modal"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/75 text-xl text-[#789DC5] transition hover:bg-white disabled:opacity-50"
                            >
                                ×
                            </button>

                        </div>

                        <p className="mb-3 text-[10px] font-medium tracking-[0.18em] text-[#83A5C7]">
                            HARMONI · APPOINTMENT
                        </p>

                        <h2
                            id="judul-penolakan"
                            className="text-2xl font-semibold tracking-tight text-[#315779]"
                        >
                            Tolak janji temu?
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-[#7196BB]">
                            Berikan alasan penolakan agar pasien
                            mengetahui mengapa pengajuannya
                            tidak disetujui.
                        </p>

                        {/* Informasi janji temu */}
                        <div className="mt-5 rounded-2xl border border-[#C8DFF2]/70 bg-[#EAF3FC]/80 p-5">

                            <p className="mb-4 text-[10px] font-medium tracking-[0.15em] text-[#83A5C7]">
                                INFORMASI JANJI TEMU
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <p className="text-xs text-[#83A5C7]">
                                        Pasien
                                    </p>

                                    <p className="mt-1 break-words text-sm font-semibold text-[#315779]">
                                        {targetTolak.nama_pasien || "-"}
                                    </p>

                                </div>

                                <div>

                                    <p className="text-xs text-[#83A5C7]">
                                        Dokter
                                    </p>

                                    <p className="mt-1 break-words text-sm font-medium text-[#315779]">
                                        {targetTolak.nama_dokter || "-"}
                                    </p>

                                </div>

                                <div>

                                    <p className="text-xs text-[#83A5C7]">
                                        Poli
                                    </p>

                                    <p className="mt-1 text-sm text-[#52799F]">
                                        {targetTolak.nama_poli || "-"}
                                    </p>

                                </div>

                                <div>

                                    <p className="text-xs text-[#83A5C7]">
                                        Jadwal
                                    </p>

                                    <p className="mt-1 text-sm text-[#52799F]">

                                        {formatTanggal(
                                            targetTolak.tanggal_booking
                                        )}

                                        {" · "}

                                        {formatJam(
                                            targetTolak.jam_mulai
                                        )}

                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Form alasan penolakan */}
                        <form
                            onSubmit={konfirmasiTolak}
                            className="mt-6"
                        >

                            <label
                                htmlFor="alasan-penolakan"
                                className="mb-3 block text-sm font-medium text-[#52799F]"
                            >

                                Alasan penolakan{" "}

                                <span className="text-[#CE7B84]">
                                    *
                                </span>

                            </label>

                            <textarea
                                id="alasan-penolakan"
                                value={alasanTolak}
                                onChange={(e) => {
                                    setAlasanTolak(e.target.value);
                                    setErrorTolak("");
                                }}
                                placeholder="Tuliskan alasan penolakan janji temu..."
                                rows={4}
                                maxLength={500}
                                required
                                autoFocus
                                disabled={memproses !== null}
                                className="w-full resize-y rounded-2xl border border-white/90 bg-white/80 px-4 py-4 text-sm leading-7 text-[#315779] outline-none transition placeholder:text-[#A0B7CF] focus:border-[#8DB9E3] focus:bg-white focus:ring-4 focus:ring-[#B8D9F5]/30 disabled:opacity-60"
                            />

                            <div className="mt-2 flex items-center justify-between gap-3">

                                <p className="text-xs text-[#83A5C7]">
                                    Alasan wajib diisi.
                                </p>

                                <p className="text-xs tabular-nums text-[#83A5C7]">
                                    {alasanTolak.length}/500
                                </p>

                            </div>

                            {/* Error penolakan */}
                            {errorTolak && (

                                <div
                                    role="alert"
                                    className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                                >
                                    {errorTolak}
                                </div>

                            )}

                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={tutupModalTolak}
                                    disabled={memproses !== null}
                                    className="flex-1 rounded-full border border-[#B8D1E9]/60 bg-[#EAF3FC] px-5 py-3.5 text-sm font-medium text-[#52799F] transition hover:bg-[#D5E9FB] disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        memproses !== null ||
                                        !alasanTolak.trim()
                                    }
                                    className="flex-1 rounded-full bg-[#CE7B84] px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-rose-200/50 transition hover:bg-[#B96770] disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {memproses !== null
                                        ? "Memproses..."
                                        : "Tolak janji temu"}

                                </button>

                            </div>

                        </form>

                    </>

                )}

            </dialog>

        </main>
    );
}
