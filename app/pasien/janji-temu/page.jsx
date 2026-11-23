"use client";

import { useEffect, useMemo, useState } from "react";
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

    function namaStatus(status) {
        if (status === "Approved") return "Disetujui";
        if (status === "Rejected") return "Ditolak";
        if (status === "Pending") return "Menunggu";
        if (status === "Selesai") return "Selesai";
        if (status === "Dibatalkan") return "Dibatalkan";

        return status || "-";
    }

    function styleStatus(status) {
        const style = {
            Approved:
                "border-[#C9E3D9] bg-[#E5F2EC]/80 text-[#668F80]",
            Rejected:
                "border-[#E8D3DC] bg-[#F6E9EF]/80 text-[#B48699]",
            Pending:
                "border-[#E8DFC9] bg-[#F5F0E3]/80 text-[#A89265]",
            Selesai:
                "border-[#D0DDF0] bg-[#E9F0FA]/80 text-[#7795BD]",
            Dibatalkan:
                "border-[#DDE2E9] bg-[#EEF0F4]/80 text-[#8C98A8]",
        };

        return style[status] || style.Pending;
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

            setPesan(
                data.message || "Status janji temu berhasil diperbarui."
            );

            await ambilData();
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            setPesan("Terjadi kesalahan saat mengubah status.");
        } finally {
            setMemproses(null);
        }
    }

    const statistik = useMemo(() => {
        return {
            semua: janjiTemu.length,
            pending: janjiTemu.filter(
                (item) => item.status === "Pending"
            ).length,
            approved: janjiTemu.filter(
                (item) => item.status === "Approved"
            ).length,
            rejected: janjiTemu.filter(
                (item) => item.status === "Rejected"
            ).length,
        };
    }, [janjiTemu]);

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

    const kartuStatistik = [
        {
            label: "Seluruh kunjungan",
            value: statistik.semua,
            caption: "TOTAL RECORDS",
            accent: "text-[#6389B4]",
            glow: "from-[#D8E8F8] to-[#F2F7FC]",
            border: "border-[#D5E4F3]",
        },
        {
            label: "Menunggu",
            value: statistik.pending,
            caption: "NEEDS REVIEW",
            accent: "text-[#AA946A]",
            glow: "from-[#F1E8D6] to-[#FAF7EF]",
            border: "border-[#E9DFC9]",
        },
        {
            label: "Disetujui",
            value: statistik.approved,
            caption: "CONFIRMED",
            accent: "text-[#739D8C]",
            glow: "from-[#DCECE5] to-[#F3F8F5]",
            border: "border-[#D1E5DA]",
        },
        {
            label: "Ditolak",
            value: statistik.rejected,
            caption: "DECLINED",
            accent: "text-[#B78B9D]",
            glow: "from-[#F0DFE7] to-[#FAF3F6]",
            border: "border-[#E9D5DF]",
        },
    ];

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#EAF2FC] text-[#345B83]">

            {/* Background atmosphere */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#C9DFF8]/60 blur-[100px]" />

                <div className="absolute -left-48 top-[35%] h-[500px] w-[500px] rounded-full bg-[#DCE9FA]/80 blur-[110px]" />

                <div className="absolute bottom-[-180px] right-[20%] h-[500px] w-[500px] rounded-full bg-[#D5E4F8]/70 blur-[100px]" />

                <div className="absolute inset-0 bg-gradient-to-br from-[#F7FAFF]/70 via-transparent to-[#DCE9F8]/50" />
            </div>

            <div className="relative mx-auto max-w-[1600px] px-5 py-8 sm:px-9 lg:px-14 lg:py-12">

                {/* Header */}
                <header className="flex flex-col gap-6 border-b border-white/70 pb-7 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-3 text-[#345F8D] transition hover:text-[#6D96C2]"
                        >
                            <span className="text-[27px] font-semibold tracking-[0.28em]">
                                HARMONI
                            </span>

                            <span className="h-8 w-px bg-[#9FC2E9]" />

                            <span className="text-sm tracking-[0.12em] text-[#7B9FC5]">
                                Hospital Information System
                            </span>
                        </Link>

                        <p className="mt-3 text-xs tracking-[0.18em] text-[#94ADC9]">
                            ADMINISTRATION · APPOINTMENT MANAGEMENT
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className="group inline-flex items-center gap-3 self-start rounded-full border border-white/90 bg-white/45 px-6 py-3.5 text-sm text-[#648BB5] shadow-[0_8px_22px_rgba(92,132,177,0.10),inset_0_1px_0_white] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_14px_30px_rgba(92,132,177,0.16)] sm:self-auto"
                    >
                        <span className="transition group-hover:-translate-x-1">
                            ←
                        </span>
                        Dashboard
                    </Link>
                </header>

                {/* Hero */}
                <section className="relative mb-12 mt-12 grid gap-10 lg:mb-16 lg:mt-16 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">

                    <div>
                        <div className="mb-7 flex items-center gap-4">
                            <span className="h-px w-12 bg-[#8DB5E2]" />

                            <span className="text-[11px] font-semibold tracking-[0.28em] text-[#83A6CE]">
                                YOUR APPOINTMENT SPACE
                            </span>
                        </div>

                        <h1 className="max-w-4xl text-[clamp(42px,6vw,82px)] font-light leading-[1.08] tracking-[-0.055em] text-[#315B85]">
                            Jadwal kunjungan
                            <br />

                            <span className="bg-gradient-to-r from-[#75A1D2] via-[#91B6DF] to-[#789AC5] bg-clip-text text-transparent">
                                dalam satu alur.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-2xl text-base leading-8 text-[#789BC2] sm:text-lg">
                            Pantau pendaftaran, periksa detail kunjungan,
                            dan kelola persetujuan pasien dengan lebih
                            terstruktur.
                        </p>
                    </div>

                    <div className="relative rounded-[30px] border border-white/80 bg-white/35 p-6 shadow-[0_20px_55px_rgba(91,133,182,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-8">

                        <div className="absolute right-5 top-5 h-16 w-16 rounded-full bg-gradient-to-br from-white/90 to-[#D6E7FA]/70 shadow-[inset_0_2px_5px_white,0_8px_18px_rgba(107,150,196,0.12)]" />

                        <p className="relative text-[10px] font-semibold tracking-[0.25em] text-[#91ACCB]">
                            APPOINTMENT OVERVIEW
                        </p>

                        <div className="relative mt-7 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm text-[#8AA8C9]">
                                    Total pendaftaran
                                </p>

                                <p className="mt-2 text-5xl font-light tracking-tight text-[#426C99]">
                                    {String(statistik.semua).padStart(2, "0")}
                                </p>
                            </div>

                            <button
                                onClick={ambilData}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-gradient-to-br from-white/80 to-[#E2EFFC]/70 px-4 py-3 text-xs font-medium text-[#668DB8] shadow-[0_6px_15px_rgba(89,132,180,0.10),inset_0_1px_0_white] transition hover:-translate-y-1 hover:shadow-[0_12px_22px_rgba(89,132,180,0.16)] disabled:opacity-50"
                            >
                                <span className={loading ? "animate-spin" : ""}>
                                    ↻
                                </span>

                                {loading ? "Memuat" : "Refresh"}
                            </button>
                        </div>

                        <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-[#DCE8F5]">
                            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#91B6DF] via-[#B4CDEB] to-[#D4E3F5]" />
                        </div>
                    </div>
                </section>

                {/* Statistik */}
                <section className="mb-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {kartuStatistik.map((kartu, index) => (
                        <div
                            key={kartu.label}
                            className={`group relative overflow-hidden rounded-[28px] border ${kartu.border} bg-white/35 p-6 shadow-[0_16px_36px_rgba(89,130,177,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_45px_rgba(89,130,177,0.15)] sm:p-7`}
                        >
                            <div className={`absolute -right-8 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${kartu.glow} opacity-80 blur-2xl transition duration-500 group-hover:scale-125`} />

                            <div className="absolute right-6 top-6 h-10 w-10 rounded-full border border-white/70 bg-white/30 shadow-[inset_0_1px_3px_white] sm:right-7 sm:top-7" />

                            <div className="relative">
                                <p className="text-sm text-[#819FC2]">
                                    {kartu.label}
                                </p>

                                <div className="mt-7 flex items-end justify-between gap-3">
                                    <p className={`text-4xl font-light tracking-tight ${kartu.accent}`}>
                                        {kartu.value}
                                    </p>

                                    <span className="text-[9px] font-semibold tracking-[0.18em] text-[#A0B5CE]">
                                        {kartu.caption}
                                    </span>
                                </div>

                                <div className="mt-5 h-px w-full bg-gradient-to-r from-white/90 via-[#D8E5F3] to-transparent" />
                            </div>
                        </div>
                    ))}
                </section>

                {/* Main data panel */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/85 bg-white/38 shadow-[0_28px_75px_rgba(82,125,174,0.12),inset_0_1px_0_white] backdrop-blur-2xl sm:rounded-[38px]">

                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 to-transparent" />

                    {/* Panel heading */}
                    <div className="relative flex flex-col gap-5 border-b border-white/70 px-6 py-7 sm:px-9 sm:py-9 lg:flex-row lg:items-end lg:justify-between">

                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#91ACCB]">
                                RECORDS & MANAGEMENT
                            </p>

                            <h2 className="mt-3 text-2xl font-light tracking-tight text-[#355F89] sm:text-3xl">
                                Daftar janji temu
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#85A3C5]">
                                Data kunjungan pasien beserta jadwal dan
                                status persetujuannya.
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-white/80 bg-white/40 px-4 py-3 shadow-[inset_0_1px_0_white] lg:self-auto">
                            <span className="h-2 w-2 rounded-full bg-[#91B5D9] shadow-[0_0_0_4px_rgba(145,181,217,0.15)]" />

                            <span className="text-xs text-[#7799BE]">
                                {janjiTemu.length} data tersimpan
                            </span>
                        </div>
                    </div>

                    {/* Search and filter */}
                    <div className="relative grid gap-3 px-6 py-6 sm:px-9 lg:grid-cols-[1fr_220px]">

                        <div className="group flex items-center gap-3 rounded-2xl border border-white/90 bg-white/40 px-5 py-4 shadow-[0_7px_20px_rgba(87,130,177,0.05),inset_0_1px_0_white] transition focus-within:border-[#B7D0EC] focus-within:bg-white/65 focus-within:shadow-[0_10px_25px_rgba(87,130,177,0.10)]">
                            <span className="text-xl text-[#91ADCC]">
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={kataKunci}
                                onChange={(e) => setKataKunci(e.target.value)}
                                placeholder="Cari nama pasien, dokter, poli, atau keluhan..."
                                className="w-full bg-transparent text-sm text-[#426B95] outline-none placeholder:text-[#A0B5CE]"
                            />

                            {kataKunci && (
                                <button
                                    onClick={() => setKataKunci("")}
                                    className="rounded-full px-2 text-lg text-[#91ADCC] transition hover:bg-white/70"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-2xl border border-white/90 bg-white/45 px-5 py-4 text-sm text-[#688DB5] outline-none shadow-[0_7px_20px_rgba(87,130,177,0.05),inset_0_1px_0_white] transition focus:border-[#B7D0EC] focus:bg-white/70"
                        >
                            <option value="Semua">Semua status</option>
                            <option value="Pending">Menunggu</option>
                            <option value="Approved">Disetujui</option>
                            <option value="Rejected">Ditolak</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                    </div>

                    {/* Notification */}
                    {pesan && (
                        <div className="mx-6 mb-5 rounded-2xl border border-[#D5E4F2] bg-[#EAF2FA]/80 px-5 py-4 text-sm text-[#6689AF] sm:mx-9">
                            {pesan}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center px-6 py-24 text-[#8AA7C8]">
                            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#D6E4F3] border-t-[#7FA7D2]" />

                            <p className="mt-5 text-sm">
                                Sedang memuat data kunjungan...
                            </p>
                        </div>
                    ) : dataTersaring.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">

                            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/90 bg-gradient-to-br from-white/75 to-[#DFECFA]/70 text-3xl text-[#8BAED4] shadow-[0_15px_35px_rgba(91,135,182,0.12),inset_0_1px_0_white]">
                                ♡
                            </div>

                            <h3 className="mt-6 text-lg font-medium text-[#456D96]">
                                {janjiTemu.length === 0
                                    ? "Belum ada janji temu"
                                    : "Data tidak ditemukan"}
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-[#8AA7C8]">
                                {janjiTemu.length === 0
                                    ? "Pendaftaran pasien akan muncul di bagian ini."
                                    : "Coba ubah kata kunci atau pilih status yang berbeda."}
                            </p>
                        </div>
                    ) : (
                        /* Table */
                        <div className="relative overflow-x-auto px-6 pb-2 sm:px-9">
                            <table className="w-full min-w-[1250px] border-collapse text-left text-sm">

                                <thead>
                                    <tr className="border-b border-[#DCE7F3]/80 text-[10px] font-semibold tracking-[0.15em] text-[#8AA7C8]">
                                        <th className="w-14 px-3 py-5 text-center">
                                            NO.
                                        </th>

                                        <th className="px-3 py-5">
                                            PASIEN
                                        </th>

                                        <th className="px-3 py-5">
                                            DOKTER
                                        </th>

                                        <th className="px-3 py-5">
                                            POLI
                                        </th>

                                        <th className="px-3 py-5">
                                            TANGGAL
                                        </th>

                                        <th className="px-3 py-5">
                                            HARI
                                        </th>

                                        <th className="px-3 py-5">
                                            JAM
                                        </th>

                                        <th className="px-3 py-5">
                                            KELUHAN
                                        </th>

                                        <th className="px-3 py-5">
                                            STATUS
                                        </th>

                                        <th className="px-3 py-5 text-center">
                                            AKSI
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dataTersaring.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="group border-b border-[#DCE7F3]/60 transition duration-200 hover:bg-white/35"
                                        >
                                            <td className="px-3 py-6 text-center text-xs text-[#A0B5CE]">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            <td className="px-3 py-6">
                                                <p className="font-medium text-[#456B93]">
                                                    {item.nama_pasien || "-"}
                                                </p>
                                            </td>

                                            <td className="px-3 py-6 text-[#6F8EAD]">
                                                {item.nama_dokter || "-"}
                                            </td>

                                            <td className="px-3 py-6">
                                                <span className="inline-flex rounded-xl border border-[#D7E5F3] bg-[#EAF2FA]/75 px-3 py-1.5 text-xs text-[#7395B9]">
                                                    {item.nama_poli || "-"}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-6 text-[#6F8EAD]">
                                                {formatTanggal(item.tanggal_booking)}
                                            </td>

                                            <td className="px-3 py-6 text-[#6F8EAD]">
                                                {formatHari(item.hari)}
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-6 font-medium text-[#527BA5]">
                                                {formatJam(item.jam_mulai)}
                                            </td>

                                            <td className="max-w-[200px] px-3 py-6 leading-6 text-[#819BB8]">
                                                {item.keluhan || "-"}
                                            </td>

                                            <td className="px-3 py-6">
                                                <div className="flex flex-col items-start gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${styleStatus(item.status)}`}
                                                    >
                                                        {namaStatus(item.status)}
                                                    </span>

                                                    {item.alasan_penolakan && (
                                                        <p className="max-w-[150px] text-[11px] leading-5 text-[#B48699]">
                                                            {item.alasan_penolakan}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-6">
                                                {item.status === "Pending" ? (
                                                    <div className="flex min-w-[105px] flex-col gap-2">

                                                        <button
                                                            onClick={() =>
                                                                ubahStatus(item.id, "Approved")
                                                            }
                                                            disabled={memproses === item.id}
                                                            className="rounded-xl border border-[#C9E3D9] bg-gradient-to-b from-[#F1F8F4] to-[#E0EFE7] px-3 py-2.5 text-xs font-medium text-[#729B8B] shadow-[0_4px_10px_rgba(111,157,139,0.08),inset_0_1px_0_white] transition hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(111,157,139,0.13)] disabled:opacity-50"
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
                                                            className="rounded-xl border border-[#E8D3DC] bg-gradient-to-b from-[#FBF3F6] to-[#F3E4EB] px-3 py-2.5 text-xs font-medium text-[#B48699] shadow-[0_4px_10px_rgba(181,134,153,0.07),inset_0_1px_0_white] transition hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(181,134,153,0.12)] disabled:opacity-50"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#9AAFC6]">
                                                        Telah diproses
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}
                    {!loading && dataTersaring.length > 0 && (
                        <div className="relative flex flex-col gap-2 border-t border-white/70 px-6 py-5 text-xs text-[#91A9C5] sm:flex-row sm:items-center sm:justify-between sm:px-9">

                            <p>
                                Menampilkan{" "}
                                <span className="font-medium text-[#6389B4]">
                                    {dataTersaring.length}
                                </span>{" "}
                                dari {janjiTemu.length} pendaftaran
                            </p>

                            <p className="tracking-[0.12em]">
                                HARMONI · APPOINTMENT RECORDS
                            </p>
                        </div>
                    )}
                </section>

                {/* Footer page */}
                <footer className="mt-9 flex flex-col gap-3 border-t border-white/70 pt-6 text-[10px] tracking-[0.16em] text-[#9AB1CC] sm:flex-row sm:items-center sm:justify-between">
                    <span>HARMONI HOSPITAL INFORMATION SYSTEM</span>

                    <span>CARE, CONNECTED.</span>
                </footer>
            </div>
        </main>
    );
}