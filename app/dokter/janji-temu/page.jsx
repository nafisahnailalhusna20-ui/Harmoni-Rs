"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function JanjiTemuDokterPage() {
    const router = useRouter();

    const [janjiTemu, setJanjiTemu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [alasan, setAlasan] = useState("");
    const [janjiDipilih, setJanjiDipilih] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [memproses, setMemproses] = useState(null);

    async function ambilData() {
        setLoading(true);

        try {
            const response = await fetch("/api/dokter/janji-temu", {
                cache: "no-store",
            });

            const data = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (data.success) {
                setJanjiTemu(data.data || []);
                setPesan("");
            } else {
                setPesan(data.message || "Gagal mengambil data.");
            }
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    async function ubahStatus(id, status, alasan_penolakan = "") {
        setMemproses(id);
        setPesan("");

        try {
            const response = await fetch("/api/dokter/janji-temu", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    status,
                    alasan_penolakan,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Status gagal diperbarui.");
                return;
            }

            setPesan(data.message || "Status berhasil diperbarui.");
            setJanjiDipilih(null);
            setAlasan("");

            await ambilData();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat mengubah status.");
        } finally {
            setMemproses(null);
        }
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    }

    function namaStatus(status) {
        const nama = {
            Pending: "Menunggu",
            Approved: "Disetujui",
            Rejected: "Ditolak",
            Selesai: "Selesai",
            Dibatalkan: "Dibatalkan",
        };

        return nama[status] || status || "-";
    }

    function warnaStatus(status) {
        const warna = {
            Pending: "border-[#F2D9A5] bg-[#FFF8E8] text-[#B98532]",
            Approved: "border-[#BBD9F3] bg-[#EDF6FF] text-[#477BAE]",
            Rejected: "border-[#F0C8D0] bg-[#FFF1F4] text-[#C16D83]",
            Selesai: "border-[#C9C9F2] bg-[#F1F0FF] text-[#7774B8]",
            Dibatalkan: "border-[#D9E1EA] bg-[#F5F8FC] text-[#8296AC]",
        };

        return warna[status] || "border-[#D9E1EA] bg-[#F5F8FC] text-[#8296AC]";
    }

    const janjiTersaring = useMemo(() => {
        const kata = search.toLowerCase().trim();

        return janjiTemu.filter((item) => {
            const nama = String(item.nama_pasien || "").toLowerCase();
            const keluhan = String(item.keluhan || "").toLowerCase();

            const cocokSearch =
                nama.includes(kata) || keluhan.includes(kata);

            const cocokStatus =
                filterStatus === "Semua" || item.status === filterStatus;

            return cocokSearch && cocokStatus;
        });
    }, [janjiTemu, search, filterStatus]);

    const jumlahPending = janjiTemu.filter(
        (item) => item.status === "Pending"
    ).length;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#edf6fd_0%,#dcecf9_45%,#eaf4fc_100%)] px-5 py-7 text-[#234766] sm:px-8 lg:px-12">
            <div className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-white/60 blur-[100px]" />
            <div className="pointer-events-none absolute -right-40 top-[520px] h-[450px] w-[450px] rounded-full bg-[#B9D9F3]/50 blur-[110px]" />
            <div className="pointer-events-none absolute left-[35%] top-[1000px] h-[300px] w-[500px] rounded-full bg-[#C9E3F7]/40 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">
                <header className="flex flex-col gap-5 border-b border-[#8EB6D7]/25 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xl font-bold tracking-[0.28em] text-[#315B86] sm:text-2xl">
                            HARMONI
                        </p>

                        <p className="mt-1 text-[10px] tracking-[0.22em] text-[#7CA5D5] sm:text-xs">
                            HOSPITAL INFORMATION SYSTEM
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/dokter")}
                        className="inline-flex w-fit items-center gap-3 rounded-full border border-white/80 bg-white/40 px-6 py-3 text-sm text-[#4779AD] shadow-[0_8px_24px_rgba(83,132,185,0.08)] backdrop-blur-xl transition hover:bg-white/75"
                    >
                        <span className="text-lg">←</span>
                        Dashboard Dokter
                    </button>
                </header>

                <section className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end lg:py-16">
                    <div>
                        <div className="mb-7 flex items-center gap-4">
                            <span className="h-px w-10 bg-[#7CA5D5]" />

                            <p className="text-xs font-semibold tracking-[0.3em] text-[#7CA5D5]">
                                DOCTOR / APPOINTMENT
                            </p>
                        </div>

                        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-[-0.04em] text-[#315B86] sm:text-5xl lg:text-6xl">
                            Jadwal konsultasi,
                            <br />

                            <span className="font-normal text-[#79A8DE]">
                                lebih terorganisir.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-[#7299C3] sm:text-lg">
                            Periksa permintaan kunjungan pasien, validasi jadwal,
                            dan siapkan pelayanan dalam satu ruang kerja.
                        </p>
                    </div>

                    <div className="relative flex flex-col gap-5 lg:items-end">
                        <div className="relative text-left lg:text-right">
                            <span className="absolute -right-2 -top-16 select-none text-[150px] font-light leading-none text-[#6C9BC7]/10">
                                01
                            </span>

                            <p className="relative text-[10px] tracking-[0.18em] text-[#7D9FBE]">
                                APPOINTMENT OVERVIEW
                            </p>

                            <p className="relative mt-3 text-sm leading-7 text-[#52799F]">
                                {janjiTemu.length} janji temu terdaftar
                                <br />
                                <span className="font-medium text-[#477BAE]">
                                    {jumlahPending} menunggu validasi
                                </span>
                            </p>
                        </div>

                        <button
                            onClick={ambilData}
                            disabled={loading}
                            className="group flex items-center gap-5 rounded-[22px] border border-white/70 bg-gradient-to-br from-[#426F99] to-[#79A9D0] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(65,110,155,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(65,110,155,0.3)] disabled:opacity-60"
                        >
                            <span className="text-xl font-light">↻</span>
                            {loading ? "Memuat data..." : "Refresh janji temu"}
                            <span className="transition-transform duration-300 group-hover:rotate-45">
                                ↗
                            </span>
                        </button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[30px] border border-white/85 bg-white/35 shadow-[0_25px_80px_rgba(80,125,170,0.09)] backdrop-blur-2xl">
                    <div className="flex flex-col gap-5 border-b border-white/70 px-6 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-9">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#7CA5D5]">
                                01 — APPOINTMENT
                            </p>

                            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[#315B86] sm:text-3xl">
                                Daftar janji temu
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#789BBF]">
                                Informasi kunjungan dan status konsultasi pasien.
                            </p>
                        </div>

                        <span className="w-fit rounded-full border border-white/80 bg-white/45 px-5 py-2.5 text-xs text-[#527DA3] backdrop-blur-xl">
                            {janjiTersaring.length} data ditampilkan
                        </span>
                    </div>

                    <div className="grid gap-3 border-b border-white/70 px-6 py-5 sm:px-9 md:grid-cols-[1fr_210px]">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8AAACB]">
                                ⌕
                            </span>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama pasien atau keluhan..."
                                className="w-full rounded-2xl border border-white/85 bg-white/45 py-3.5 pl-11 pr-4 text-sm text-[#315B86] outline-none backdrop-blur-xl transition placeholder:text-[#9AB5D3] focus:border-[#9FC5E8] focus:bg-white/70 focus:ring-4 focus:ring-[#C8E0F5]/40"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-2xl border border-white/85 bg-white/45 px-4 py-3.5 text-sm text-[#527DA3] outline-none backdrop-blur-xl transition focus:border-[#9FC5E8] focus:bg-white/70 focus:ring-4 focus:ring-[#C8E0F5]/40"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Pending">Menunggu</option>
                            <option value="Approved">Disetujui</option>
                            <option value="Rejected">Ditolak</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                    </div>

                    {pesan && (
                        <div className="mx-6 mt-5 rounded-2xl border border-[#C9DFF2] bg-[#F1F8FF]/80 px-5 py-3 text-sm text-[#527DA3] sm:mx-9">
                            {pesan}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-[#789BBF]">
                            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#CFE3F4] border-t-[#719FC7]" />
                            <p className="text-sm">Memuat janji temu pasien...</p>
                        </div>
                    ) : janjiTersaring.length === 0 ? (
                        <div className="px-6 py-20 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/45 text-2xl text-[#8AAACB]">
                                ♡
                            </div>

                            <h3 className="mt-5 text-lg font-medium text-[#456B9B]">
                                {janjiTemu.length === 0
                                    ? "Belum ada janji temu"
                                    : "Data tidak ditemukan"}
                            </h3>

                            <p className="mt-2 text-sm text-[#8AAACB]">
                                {janjiTemu.length === 0
                                    ? "Janji temu pasien akan muncul di halaman ini."
                                    : "Coba ubah kata kunci atau filter status."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[950px] text-left">
                                    <thead>
                                        <tr className="border-b border-white/75 bg-[#EAF4FC]/35 text-[10px] font-semibold tracking-[0.12em] text-[#7198BB]">
                                            <th className="px-6 py-5">NO.</th>
                                            <th className="px-6 py-5">PASIEN</th>
                                            <th className="px-6 py-5">TANGGAL</th>
                                            <th className="px-6 py-5">JAM</th>
                                            <th className="px-6 py-5">KELUHAN</th>
                                            <th className="px-6 py-5">STATUS</th>
                                            <th className="px-6 py-5 text-center">AKSI</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {janjiTersaring.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-white/65 text-[#456B9B] transition hover:bg-white/30"
                                            >
                                                <td className="px-6 py-5 text-sm text-[#9AB5D3]">
                                                    {String(index + 1).padStart(2, "0")}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-[#315B86]">
                                                        {item.nama_pasien}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#789BBF]">
                                                    {formatTanggal(item.tanggal_booking)}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#527DA3]">
                                                    {item.jam_mulai}
                                                </td>

                                                <td className="max-w-[230px] px-6 py-5 text-sm leading-6 text-[#789BBF]">
                                                    {item.keluhan || "-"}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="space-y-2">
                                                        <span className={`inline-flex rounded-full border px-3.5 py-1.5 text-[11px] font-medium ${warnaStatus(item.status)}`}>
                                                            {namaStatus(item.status)}
                                                        </span>

                                                        {item.alasan_penolakan && (
                                                            <p className="max-w-[180px] text-xs leading-5 text-[#C16D83]">
                                                                {item.alasan_penolakan}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    {item.status === "Pending" ? (
                                                        <div className="flex min-w-[115px] flex-col gap-2">
                                                            <button
                                                                onClick={() => ubahStatus(item.id, "Approved")}
                                                                disabled={memproses === item.id}
                                                                className="rounded-xl bg-gradient-to-r from-[#DCEEFF] to-[#C6E2FA] px-4 py-2.5 text-xs font-semibold text-[#426F99] transition hover:from-[#CDE6FA] hover:to-[#B5D8F5] disabled:opacity-50"
                                                            >
                                                                {memproses === item.id ? "Memproses..." : "Setujui"}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setJanjiDipilih(item);
                                                                    setAlasan("");
                                                                }}
                                                                disabled={memproses === item.id}
                                                                className="rounded-xl border border-[#F0D2DA] bg-[#FFF5F7]/80 px-4 py-2.5 text-xs font-medium text-[#B96F84] transition hover:bg-[#FCE8EE] disabled:opacity-50"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-[#9AB5D3]">
                                                            Sudah diproses
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="space-y-4 p-5 lg:hidden">
                                {janjiTersaring.map((item, index) => (
                                    <article
                                        key={item.id}
                                        className="rounded-[24px] border border-white/85 bg-white/40 p-5 backdrop-blur-xl"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] tracking-[0.15em] text-[#9AB5D3]">
                                                    APPOINTMENT / {String(index + 1).padStart(2, "0")}
                                                </p>

                                                <h3 className="mt-2 font-medium text-[#315B86]">
                                                    {item.nama_pasien}
                                                </h3>
                                            </div>

                                            <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${warnaStatus(item.status)}`}>
                                                {namaStatus(item.status)}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/75 pt-4">
                                            <div>
                                                <p className="text-xs text-[#9AB5D3]">Tanggal</p>
                                                <p className="mt-1 text-sm text-[#527DA3]">
                                                    {formatTanggal(item.tanggal_booking)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#9AB5D3]">Jam</p>
                                                <p className="mt-1 text-sm text-[#527DA3]">
                                                    {item.jam_mulai}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-xs text-[#9AB5D3]">Keluhan</p>
                                                <p className="mt-1 break-words text-sm leading-6 text-[#789BBF]">
                                                    {item.keluhan || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        {item.alasan_penolakan && (
                                            <p className="mt-4 rounded-xl bg-[#FFF1F4]/80 p-3 text-xs text-[#B96F84]">
                                                Alasan penolakan: {item.alasan_penolakan}
                                            </p>
                                        )}

                                        {item.status === "Pending" && (
                                            <div className="mt-5 grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => ubahStatus(item.id, "Approved")}
                                                    disabled={memproses === item.id}
                                                    className="rounded-xl bg-gradient-to-r from-[#DCEEFF] to-[#C6E2FA] px-4 py-3 text-sm font-semibold text-[#426F99] transition hover:from-[#CDE6FA] hover:to-[#B5D8F5] disabled:opacity-50"
                                                >
                                                    {memproses === item.id ? "Memproses..." : "Setujui"}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setJanjiDipilih(item);
                                                        setAlasan("");
                                                    }}
                                                    disabled={memproses === item.id}
                                                    className="rounded-xl border border-[#F0D2DA] bg-[#FFF5F7]/80 px-4 py-3 text-sm font-medium text-[#B96F84] transition hover:bg-[#FCE8EE] disabled:opacity-50"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                    {!loading && janjiTersaring.length > 0 && (
                        <div className="border-t border-white/75 px-6 py-4 text-xs text-[#9AB5D3] sm:px-9">
                            Menampilkan {janjiTersaring.length} dari {janjiTemu.length} janji temu
                        </div>
                    )}
                </section>
                <footer className="mt-10 flex flex-col gap-4 border-t border-white/70 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs tracking-[0.2em] text-[#6D97C3]">
                            HARMONI
                        </p>

                        <p className="mt-1 text-[11px] text-[#9AB5D3]">
                            Hospital Information System
                        </p>
                    </div>

                    <p className="text-xs text-[#8BAACD]">
                        A healthier journey, one step at a time.
                    </p>
                </footer>
            </div>
            {janjiDipilih && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1D3D60]/35 p-4 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setJanjiDipilih(null);
                        }
                    }}
                >
                    <div className="my-8 w-full max-w-lg rounded-[30px] border border-white/90 bg-gradient-to-br from-[#F9FCFF] via-[#F1F7FF] to-[#E0EEFF] p-6 shadow-[0_35px_100px_rgba(36,76,119,0.22)] sm:p-8">
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#7CA5D5]">
                            APPOINTMENT / REJECTION
                        </p>

                        <h2 className="mt-3 text-2xl font-medium text-[#315B86]">
                            Tolak janji temu
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-[#789BBF]">
                            Berikan alasan penolakan untuk pasien{" "}
                            <span className="font-semibold text-[#456B9B]">
                                {janjiDipilih.nama_pasien}
                            </span>
                            .
                        </p>

                        <textarea
                            value={alasan}
                            onChange={(e) => setAlasan(e.target.value)}
                            placeholder="Tuliskan alasan penolakan..."
                            rows={4}
                            className="mt-5 w-full resize-none rounded-2xl border border-white/90 bg-white/60 p-4 text-sm text-[#315B86] outline-none backdrop-blur-xl transition placeholder:text-[#9AB5D3] focus:border-[#9FC5E8] focus:bg-white/80 focus:ring-4 focus:ring-[#C8E0F5]/40"
                        />

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                onClick={() => {
                                    setJanjiDipilih(null);
                                    setAlasan("");
                                }}
                                className="flex-1 rounded-2xl border border-white/90 bg-white/45 px-5 py-3 text-sm text-[#789BBF] transition hover:bg-white/80"
                            >
                                Batal
                            </button>

                            <button
                                onClick={() =>
                                    ubahStatus(
                                        janjiDipilih.id,
                                        "Rejected",
                                        alasan
                                    )
                                }
                                disabled={!alasan.trim() || memproses === janjiDipilih.id}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-[#426F99] to-[#79A9D0] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(65,110,155,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {memproses === janjiDipilih.id
                                    ? "Memproses..."
                                    : "Konfirmasi penolakan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}