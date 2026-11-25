
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../../components/ConfirmModal";

export default function FarmasiPage() {
    const router = useRouter();

    const [resep, setResep] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [error, setError] = useState("");
    const [proses, setProses] = useState(null);

    // Pencarian dan filter
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");

    // Custom modal konfirmasi
    const [targetResep, setTargetResep] = useState(null);
    const [statusTujuan, setStatusTujuan] = useState("");
    const [errorModal, setErrorModal] = useState("");

    async function ambilData() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/admin/farmasi", {
                cache: "no-store",
            });

            const data = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message || "Data resep gagal dimuat."
                );
            }

            setResep(
                Array.isArray(data.data) ? data.data : []
            );

        } catch (err) {
            console.error("Gagal mengambil resep:", err);

            setError(
                err.message || "Terjadi kesalahan saat memuat resep."
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    // Membuka modal
    function bukaKonfirmasi(item, status) {
        if (proses !== null) return;

        setTargetResep(item);
        setStatusTujuan(status);
        setErrorModal("");
        setPesan("");
    }

    // Menutup modal
    function batalKonfirmasi() {
        if (proses !== null) return;

        setTargetResep(null);
        setStatusTujuan("");
        setErrorModal("");
    }

    // Memperbarui status resep
    async function ubahStatus() {
        if (!targetResep || proses !== null) return;

        const id = targetResep.prescription_id;
        const status = statusTujuan;

        const transisiValid =
            (
                targetResep.status === "Menunggu Diproses" &&
                status === "Siap Diambil"
            ) ||
            (
                targetResep.status === "Siap Diambil" &&
                status === "Sudah Diambil"
            );

        if (!transisiValid) {
            setErrorModal("Perubahan status tidak valid.");
            return;
        }

        try {
            setProses(id);
            setPesan("");
            setError("");
            setErrorModal("");

            const response = await fetch("/api/admin/farmasi", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prescription_id: id,
                    status: status,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                setErrorModal(
                    data.message || "Status gagal diperbarui."
                );
                return;
            }

            setTargetResep(null);
            setStatusTujuan("");

            setPesan(
                data.message || "Status resep berhasil diperbarui."
            );

            await ambilData();

        } catch (err) {
            console.error("Gagal memperbarui status:", err);

            setErrorModal(
                err.message ||
                "Terjadi kesalahan saat memperbarui status."
            );

        } finally {
            setProses(null);
        }
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Makassar",
        });
    }

    function warnaStatus(status) {
        if (status === "Menunggu Diproses") {
            return "border border-amber-200 bg-amber-50 text-amber-700";
        }

        if (status === "Siap Diambil") {
            return "border border-blue-200 bg-blue-50 text-blue-700";
        }

        if (status === "Sudah Diambil") {
            return "border border-emerald-200 bg-emerald-50 text-emerald-700";
        }

        return "border border-slate-200 bg-slate-50 text-slate-600";
    }

    // Statistik
    const jumlahMenunggu = resep.filter(
        (item) => item.status === "Menunggu Diproses"
    ).length;

    const jumlahSiap = resep.filter(
        (item) => item.status === "Siap Diambil"
    ).length;

    const jumlahSelesai = resep.filter(
        (item) => item.status === "Sudah Diambil"
    ).length;

    // Filter dan pencarian resep
    const resepFiltered = resep.filter((item) => {
        const keyword = search.trim().toLowerCase();

        const cocokSearch = [
            item.nama_pasien,
            item.nama_dokter,
            item.prescription_id,
        ].some((value) =>
            String(value || "").toLowerCase().includes(keyword)
        );

        const cocokStatus =
            filterStatus === "Semua" ||
            item.status === filterStatus;

        return cocokSearch && cocokStatus;
    });

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#EAF3FC] text-[#29496B]">

            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/80 blur-[100px]" />

                <div className="absolute right-[-120px] top-[15%] h-[550px] w-[550px] rounded-full bg-[#B9D9F5]/60 blur-[110px]" />

                <div className="absolute bottom-[-180px] left-[30%] h-[500px] w-[600px] rounded-full bg-[#D5E9FB]/80 blur-[100px]" />

            </div>

            <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-12">

                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/80 pb-6">

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="group text-left"
                    >

                        <div className="flex flex-wrap items-baseline gap-3">

                            <span className="text-2xl font-bold tracking-[0.22em] text-[#29496B] sm:text-3xl">
                                HARMONI
                            </span>

                            <span className="hidden text-[10px] tracking-[0.18em] text-[#7598BB] sm:inline">
                                Hospital Information System
                            </span>

                        </div>

                        <p className="mt-1 text-[10px] tracking-[0.22em] text-[#7899BA] sm:hidden">
                            HOSPITAL INFORMATION SYSTEM
                        </p>

                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="rounded-full border border-white/80 bg-white/45 px-5 py-2.5 text-sm text-[#52799F] backdrop-blur-xl transition hover:bg-white/80 hover:text-[#29496B]"
                    >
                        ← Dashboard
                    </button>

                </header>

                {/* Hero */}
                <section className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_300px] lg:items-end lg:py-20">

                    <div>

                        <div className="mb-6 flex items-center gap-3">

                            <span className="h-px w-9 bg-[#8CB8E2]" />

                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7197BC]">
                                Administration / Pharmacy
                            </p>

                        </div>

                        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-[#29496B] sm:text-6xl lg:text-7xl">

                            Pelayanan farmasi,

                            <br />

                            <span className="font-light text-[#79A9D8]">
                                lebih terintegrasi.
                            </span>

                        </h1>

                        <p className="mt-7 max-w-xl text-sm leading-7 text-[#6F91B4] sm:text-base">
                            Kelola resep dan status pengambilan obat
                            pasien dalam satu ruang kerja yang
                            terintegrasi dengan HARMONI.
                        </p>

                    </div>

                    <div className="relative flex flex-col items-start gap-6 lg:items-end lg:text-right">

                        <div className="relative">

                            <span className="pointer-events-none absolute -right-2 -top-14 select-none text-[130px] font-light leading-none text-[#B5D5F2]/50">
                                07
                            </span>

                            <div className="relative">

                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7399BD]">
                                    PHARMACY MANAGEMENT
                                </p>

                                <p className="mt-3 text-sm leading-6 text-[#52799F]">

                                    Setiap resep,

                                    <br />

                                    tercatat dengan rapi.

                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={ambilData}
                            disabled={loading || proses !== null}
                            className="flex min-h-[58px] items-center justify-between gap-5 rounded-[22px] border border-white/70 bg-gradient-to-br from-[#426F9B] to-[#79A9D4] px-7 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(61,112,160,0.65)] transition hover:-translate-y-1 disabled:opacity-50"
                        >

                            <span className="text-xl">↻</span>

                            Perbarui data

                            <span>↗</span>

                        </button>

                    </div>

                </section>

                {/* Statistik resep */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    {[
                        {
                            label: "TOTAL RESEP",
                            value: resep.length,
                            description: "Seluruh resep terdaftar",
                            color: "text-[#527FA9]",
                        },
                        {
                            label: "MENUNGGU DIPROSES",
                            value: jumlahMenunggu,
                            description: "Resep menunggu proses",
                            color: "text-amber-600",
                        },
                        {
                            label: "SIAP DIAMBIL",
                            value: jumlahSiap,
                            description: "Menunggu pengambilan",
                            color: "text-[#527FA9]",
                        },
                        {
                            label: "SUDAH DIAMBIL",
                            value: jumlahSelesai,
                            description: "Resep selesai diproses",
                            color: "text-emerald-600",
                        },
                    ].map((stat, index) => (

                        <div
                            key={stat.label}
                            className="rounded-[26px] border border-white/90 bg-white/45 p-6 shadow-[0_15px_40px_rgba(83,122,164,.06)] backdrop-blur-xl"
                        >

                            <div className="mb-5 flex items-center gap-3">

                                <span className="text-[10px] text-[#91ABC4]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <span className="h-px w-5 bg-[#B4D0EA]" />

                                <p className="text-[10px] font-semibold tracking-[0.12em] text-[#789CBD]">
                                    {stat.label}
                                </p>

                            </div>

                            <p className={`text-4xl font-light ${stat.color}`}>
                                {String(stat.value).padStart(2, "0")}
                            </p>

                            <p className="mt-3 text-xs text-[#8AA5C0]">
                                {stat.description}
                            </p>

                        </div>

                    ))}

                </section>

                {/* Panel utama */}
                <section className="rounded-[30px] border border-white/85 bg-white/45 p-5 shadow-[0_25px_80px_-45px_rgba(67,111,153,0.35)] backdrop-blur-2xl sm:rounded-[38px] sm:p-8 lg:p-10">

                    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#C9DDF0]/70 pb-7">

                        <div>

                            <div className="mb-4 flex items-center gap-3">

                                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8BAAC9]">
                                    07
                                </span>

                                <span className="h-px w-6 bg-[#B4D0EA]" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789CBD]">
                                    Prescription Directory
                                </span>

                            </div>

                            <h2 className="text-2xl font-semibold tracking-tight text-[#29496B] sm:text-3xl">
                                Daftar resep pasien
                            </h2>

                            <p className="mt-2 text-sm text-[#7797B7]">
                                Informasi resep yang dibuat oleh dokter.
                            </p>

                        </div>

                        <div className="flex items-center gap-4 border-l border-[#BCD5EC] pl-5">

                            <span className="text-4xl font-light text-[#527FA9]">
                                {String(resep.length).padStart(2, "0")}
                            </span>

                            <div>

                                <p className="text-sm text-[#7797B7]">
                                    resep terdaftar
                                </p>

                                <p className="mt-1 text-xs text-[#91ABC4]">
                                    Data farmasi HARMONI
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Search dan filter */}
                    <div className="my-6 flex flex-col gap-3 sm:flex-row">

                        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/90 bg-white/55 px-5 py-3.5">

                            <span className="text-xl text-[#789CBD]">
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari pasien, dokter, atau ID resep..."
                                className="w-full min-w-0 bg-transparent text-sm text-[#315779] outline-none placeholder:text-[#91ABC7]"
                            />

                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value)
                            }
                            className="rounded-2xl border border-white/90 bg-white/55 px-5 py-3.5 text-sm text-[#527FA9] outline-none sm:min-w-[220px]"
                        >

                            <option value="Semua">
                                Semua status
                            </option>

                            <option value="Menunggu Diproses">
                                Menunggu Diproses
                            </option>

                            <option value="Siap Diambil">
                                Siap Diambil
                            </option>

                            <option value="Sudah Diambil">
                                Sudah Diambil
                            </option>

                        </select>

                    </div>

                    {/* Notifikasi sukses */}
                    {pesan && (

                        <div
                            role="status"
                            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm text-emerald-700"
                        >
                            {pesan}
                        </div>

                    )}

                    {/* Notifikasi error */}
                    {error && (

                        <div
                            role="alert"
                            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-sm text-rose-600"
                        >
                            {error}
                        </div>

                    )}

                    {/* Loading */}
                    {loading ? (

                        <div className="flex min-h-52 flex-col items-center justify-center gap-4">

                            <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#D5E6F7] border-t-[#5B91C2]" />

                            <p className="text-sm text-[#789CBD]">
                                Memuat data resep...
                            </p>

                        </div>

                    ) : resepFiltered.length === 0 ? (

                        <div className="rounded-[24px] border border-white/80 bg-white/35 px-6 py-16 text-center">

                            <p className="text-lg font-medium text-[#52799F]">

                                {resep.length === 0
                                    ? "Belum ada resep terdaftar"
                                    : "Resep tidak ditemukan"}

                            </p>

                            <p className="mt-2 text-sm text-[#8AA5C0]">

                                {resep.length === 0
                                    ? "Resep dari dokter akan muncul di sini."
                                    : "Coba ubah kata kunci atau filter status."}

                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {resepFiltered.map((item) => (

                                <article
                                    key={item.prescription_id}
                                    className="overflow-hidden rounded-[26px] border border-white/90 bg-white/55 shadow-[0_10px_35px_rgba(83,122,164,.07)] transition duration-300 hover:bg-white/70"
                                >

                                    {/* Informasi pasien */}
                                    <div className="flex flex-wrap items-start justify-between gap-5 border-b border-[#D5E6F4]/70 p-5 sm:p-7">

                                        <div className="flex items-start gap-4">

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-[#EAF3FC] text-lg font-medium text-[#527FA9]">

                                                {String(
                                                    item.nama_pasien || "P"
                                                ).charAt(0).toUpperCase()}

                                            </div>

                                            <div>

                                                <p className="text-[10px] tracking-[0.15em] text-[#91ABC4]">

                                                    RESEP #{String(
                                                        item.prescription_id
                                                    ).padStart(3, "0")}

                                                </p>

                                                <h3 className="mt-2 text-lg font-semibold text-[#315779]">

                                                    {item.nama_pasien || "-"}

                                                </h3>

                                                <p className="mt-2 text-sm text-[#7196BB]">

                                                    Dokter: {item.nama_dokter || "-"}

                                                </p>

                                                <p className="mt-1 text-xs text-[#91ABC4]">

                                                    Tanggal konsultasi:{" "}
                                                    {formatTanggal(
                                                        item.tanggal_booking
                                                    )}

                                                </p>

                                            </div>

                                        </div>

                                        <span
                                            className={`inline-flex rounded-full px-4 py-2 text-xs font-medium ${warnaStatus(item.status)}`}
                                        >

                                            {item.status}

                                        </span>

                                    </div>

                                    {/* Daftar obat */}
                                    <div className="p-5 sm:p-7">

                                        <div className="mb-4 flex items-center justify-between">

                                            <h4 className="text-xs font-semibold tracking-[0.15em] text-[#7196BB]">
                                                DAFTAR OBAT
                                            </h4>

                                            <span className="text-xs text-[#91ABC4]">

                                                {Array.isArray(item.daftar_obat)
                                                    ? item.daftar_obat.length
                                                    : 0} jenis obat

                                            </span>

                                        </div>

                                        <div className="overflow-hidden rounded-2xl border border-[#DCE8F4]/80">

                                            <div className="flex justify-between bg-[#EAF3FC]/80 px-5 py-3 text-[10px] font-semibold tracking-[0.12em] text-[#789CBD]">

                                                <span>NAMA OBAT</span>

                                                <span>JUMLAH</span>

                                            </div>

                                            {Array.isArray(item.daftar_obat) &&
                                            item.daftar_obat.length > 0 ? (

                                                item.daftar_obat.map(
                                                    (obat, index) => (

                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-4 border-t border-[#DCE8F4]/70 bg-white/40 px-5 py-4"
                                                        >

                                                            <div className="flex items-center gap-3">

                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#80A9D2]" />

                                                                <span className="text-sm font-medium text-[#45698F]">

                                                                    {obat.nama_obat}

                                                                </span>

                                                            </div>

                                                            <span className="rounded-xl border border-white/90 bg-[#EAF3FC] px-4 py-2 text-sm font-semibold tabular-nums text-[#527FA9]">

                                                                {obat.jumlah}

                                                            </span>

                                                        </div>

                                                    )
                                                )

                                            ) : (

                                                <p className="px-5 py-5 text-sm text-[#91ABC4]">
                                                    Tidak ada data obat.
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                    {/* Tombol aksi */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#D5E6F4]/70 bg-[#EDF5FC]/35 px-5 py-5 sm:px-7">

                                        <div>

                                            <p className="text-[10px] tracking-[0.15em] text-[#91ABC4]">
                                                PRESCRIPTION STATUS
                                            </p>

                                            <p className="mt-1 text-xs text-[#7196BB]">

                                                {item.status === "Menunggu Diproses"
                                                    ? "Resep menunggu proses farmasi."
                                                    : item.status === "Siap Diambil"
                                                        ? "Resep siap diambil pasien."
                                                        : item.status === "Sudah Diambil"
                                                            ? "Pengambilan telah selesai."
                                                            : item.status}

                                            </p>

                                        </div>

                                        {item.status === "Menunggu Diproses" && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    bukaKonfirmasi(
                                                        item,
                                                        "Siap Diambil"
                                                    )
                                                }
                                                disabled={
                                                    proses !== null ||
                                                    !Array.isArray(item.daftar_obat) ||
                                                    item.daftar_obat.length === 0
                                                }
                                                className="rounded-2xl bg-gradient-to-r from-[#426F9B] to-[#79A9D4] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#83AED5]/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                                            >

                                                {proses === item.prescription_id
                                                    ? "Memproses..."
                                                    : "Proses resep"}

                                            </button>

                                        )}

                                        {item.status === "Siap Diambil" && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    bukaKonfirmasi(
                                                        item,
                                                        "Sudah Diambil"
                                                    )
                                                }
                                                disabled={proses !== null}
                                                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                            >

                                                {proses === item.prescription_id
                                                    ? "Memproses..."
                                                    : "Tandai sudah diambil"}

                                            </button>

                                        )}

                                        {item.status === "Sudah Diambil" && (

                                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">

                                                <span>✓</span>

                                                Pengambilan selesai

                                            </span>

                                        )}

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                    {/* Footer panel */}
                    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 px-1">

                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#91ABC4]">
                            HARMONI · Pharmacy management
                        </p>

                        <p className="text-xs text-[#8AA5C0]">

                            Menampilkan {resepFiltered.length} dari{" "}
                            {resep.length} resep

                        </p>

                    </div>

                </section>

                <footer className="py-8 text-center">

                    <p className="text-[10px] tracking-[0.2em] text-[#91ABC4]">
                        HARMONI · HOSPITAL INFORMATION SYSTEM
                    </p>

                </footer>

            </div>

            {/* Custom modal perubahan status */}
            <ConfirmModal
                open={targetResep !== null}

                title={
                    statusTujuan === "Siap Diambil"
                        ? "Proses resep pasien?"
                        : "Konfirmasi pengambilan?"
                }

                description={
                    statusTujuan === "Siap Diambil"
                        ? `Apakah Anda yakin ingin memperbarui resep ${targetResep?.nama_pasien || "pasien ini"} menjadi Siap Diambil?`
                        : `Apakah Anda yakin ingin menandai resep ${targetResep?.nama_pasien || "pasien ini"} sebagai Sudah Diambil?`
                }

                onCancel={batalKonfirmasi}

                onConfirm={ubahStatus}

                loading={proses !== null}

                error={errorModal}

                confirmText={
                    statusTujuan === "Siap Diambil"
                        ? "Ya, Proses"
                        : "Ya, Konfirmasi"
                }

                variant="primary"
            />

        </main>
    );
}
