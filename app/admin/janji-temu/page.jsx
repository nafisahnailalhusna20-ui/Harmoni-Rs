"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function JanjiTemuPage() {
    const [janjiTemu, setJanjiTemu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [kataKunci, setKataKunci] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [memproses, setMemproses] = useState(null);

    async function ambilData() {
        setLoading(true);

        try {
            const response = await fetch("/api/admin/janji-temu");
            const data = await response.json();

            if (response.ok && data.success) {
                setJanjiTemu(Array.isArray(data.data) ? data.data : []);
                setPesan("");
            } else {
                setPesan(data.message || "Data janji temu gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

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

    async function ubahStatus(id, status) {
        let alasan = "";

        if (status === "Rejected") {
            alasan = window.prompt("Masukkan alasan penolakan:");

            if (!alasan || !alasan.trim()) {
                return;
            }
        }

        setMemproses(id);
        setPesan("");

        try {
            const response = await fetch("/api/admin/janji-temu", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    status,
                    alasan_penolakan: alasan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Status gagal diperbarui.");
                return;
            }

            setPesan(data.message || "Status berhasil diperbarui.");
            await ambilData();
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            setPesan("Terjadi kesalahan saat mengubah status.");
        } finally {
            setMemproses(null);
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
            String(nilai || "").toLowerCase().includes(pencarian)
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

                    <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:px-8">

                        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5">

                            <span className="text-lg text-[#789DC5]">
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={kataKunci}
                                onChange={(e) => setKataKunci(e.target.value)}
                                placeholder="Cari pasien, dokter, poli, atau keluhan..."
                                className="w-full min-w-0 bg-transparent text-sm text-[#315D87] outline-none placeholder:text-[#91ABC7]"
                            />

                            {kataKunci && (
                                <button
                                    onClick={() => setKataKunci("")}
                                    className="text-lg text-[#789DC5]"
                                >
                                    ×
                                </button>
                            )}

                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5 text-sm text-[#5685B7] outline-none"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Pending">Menunggu</option>
                            <option value="Approved">Disetujui</option>
                            <option value="Rejected">Ditolak</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>

                        <button
                            onClick={ambilData}
                            disabled={loading}
                            className="rounded-2xl border border-white/90 bg-white/50 px-5 py-3.5 text-sm text-[#5685B7] transition hover:bg-white/80 disabled:opacity-50"
                        >
                            ↻ Perbarui
                        </button>

                    </div>

                    {pesan && (
                        <div className="mx-6 mb-5 rounded-2xl border border-blue-200/50 bg-blue-100/40 px-5 py-4 text-sm text-[#477AA9] sm:mx-8">
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
                                                    <p className="mt-2 text-xs leading-5 text-rose-500">
                                                        Alasan: {item.alasan_penolakan}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-3 py-6">
                                                {item.status === "Pending" ? (
                                                    <div className="flex flex-col gap-2">

                                                        <button
                                                            onClick={() =>
                                                                ubahStatus(item.id, "Approved")
                                                            }
                                                            disabled={memproses === item.id}
                                                            className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50"
                                                        >
                                                            {memproses === item.id
                                                                ? "Memproses..."
                                                                : "Setujui"}
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                ubahStatus(item.id, "Rejected")
                                                            }
                                                            disabled={memproses === item.id}
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
                        <div className="border-t border-[#8CB1D5]/20 px-6 py-5 text-xs text-[#89A5C0] sm:px-8">
                            Menampilkan {dataTersaring.length} dari{" "}
                            {janjiTemu.length} pendaftaran
                        </div>
                    )}

                </section>

                <footer className="mt-8 text-center text-xs tracking-[2px] text-[#91ABC7]">
                    HARMONI · HOSPITAL INFORMATION SYSTEM
                </footer>

            </div>
        </main>
    );
}