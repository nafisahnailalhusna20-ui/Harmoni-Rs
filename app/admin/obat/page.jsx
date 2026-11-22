"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function formatTanggalLokal(tanggal) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
    const hari = String(tanggal.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}

export default function ObatPage() {
    const [obat, setObat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [obatDipilih, setObatDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

    const [batasTanggal, setBatasTanggal] = useState({
        hariIni: "",
        tanggalMaksimal: "",
    });

    const formAwal = {
        nama: "",
        deskripsi: "",
        tipe: "",
        stok: "",
        gambar: "",
        tanggal_kadaluarsa: "",
    };

    const [form, setForm] = useState(formAwal);

    useEffect(() => {
        const sekarang = new Date();

        const hariIni = formatTanggalLokal(sekarang);

        const tanggalBatas = new Date(sekarang);
        tanggalBatas.setFullYear(
            tanggalBatas.getFullYear() + 10
        );

        setBatasTanggal({
            hariIni,
            tanggalMaksimal: formatTanggalLokal(tanggalBatas),
        });

        ambilData();
    }, []);

    async function ambilData() {
        try {
            const response = await fetch("/api/admin/obat");
            const data = await response.json();

            if (data.success) {
                setObat(data.data);
            } else {
                setPesan(data.message || "Data obat gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil data obat:", error);
            setPesan("Terjadi kesalahan saat mengambil data obat.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    function bukaTambah() {
        setObatDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setObatDipilih(item);

        setForm({
            nama: item.nama,
            deskripsi: item.deskripsi,
            tipe: item.tipe,
            stok: String(item.stok),
            gambar: item.gambar || "",
            tanggal_kadaluarsa: item.tanggal_kadaluarsa
                ? String(item.tanggal_kadaluarsa).slice(0, 10)
                : "",
        });

        setPesan("");
        setTampilForm(true);
    }

    async function simpanObat(e) {
        e.preventDefault();
        setPesan("");

        const tanggalKadaluarsa = form.tanggal_kadaluarsa;

        if (tanggalKadaluarsa) {
            if (
                !batasTanggal.hariIni ||
                !batasTanggal.tanggalMaksimal
            ) {
                setPesan("Batas tanggal sedang dimuat. Coba lagi.");
                return;
            }

            if (
                tanggalKadaluarsa < batasTanggal.hariIni ||
                tanggalKadaluarsa > batasTanggal.tanggalMaksimal
            ) {
                setPesan(
                    `Tanggal kedaluwarsa harus antara ${batasTanggal.hariIni} dan ${batasTanggal.tanggalMaksimal}.`
                );
                return;
            }
        }

        try {
            const url = obatDipilih
                ? `/api/admin/obat/${obatDipilih.id}`
                : "/api/admin/obat";

            const response = await fetch(url, {
                method: obatDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Data obat gagal disimpan.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setObatDipilih(null);
            setForm(formAwal);

            await ambilData();
        } catch (error) {
            console.error("Gagal menyimpan obat:", error);
            setPesan("Terjadi kesalahan saat menyimpan obat.");
        }
    }

    async function hapusObat(id) {
        const yakin = confirm("Yakin ingin menghapus obat ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/obat/${id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Obat gagal dihapus.");
                return;
            }

            setPesan(data.message);
            await ambilData();
        } catch (error) {
            console.error("Gagal menghapus obat:", error);
            setPesan("Terjadi kesalahan saat menghapus obat.");
        }
    }

    const totalObat = obat.length;

    const stokMenipis = obat.filter(
        (item) => Number(item.stok) <= 10
    ).length;

    const inputStyle =
        "w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496B] shadow-sm outline-none transition placeholder:text-[#8AA5C0] focus:border-[#8BB9E8] focus:bg-white/90 focus:ring-4 focus:ring-[#B9D9F5]/30";

    const labelStyle =
        "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6687A9]";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#EAF3FC] text-[#29496B]">

            {/* Background atmosphere */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#D9EAFE]/80 blur-[100px]" />
                <div className="absolute right-[-100px] top-[18%] h-[500px] w-[500px] rounded-full bg-[#B9D9F5]/60 blur-[110px]" />
                <div className="absolute bottom-[-180px] left-[35%] h-[450px] w-[450px] rounded-full bg-white/70 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-12">

                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/80 pb-6">

                    <Link href="/admin" className="group">
                        <div className="flex items-baseline gap-3">
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
                    </Link>

                    <Link
                        href="/admin"
                        className="rounded-full border border-white/80 bg-white/45 px-5 py-2.5 text-sm text-[#52799F] backdrop-blur-xl transition hover:bg-white/80 hover:text-[#29496B]"
                    >
                        <span className="mr-2">←</span>
                        Dashboard
                    </Link>
                </header>

                {/* Hero section */}
                <section className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_300px] lg:items-end lg:py-20">

                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="h-px w-9 bg-[#8CB8E2]" />

                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7197BC]">
                                Pharmacy / Administration
                            </p>
                        </div>

                        <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#29496B] sm:text-6xl lg:text-7xl">
                            Ruang
                            <br />

                            <span className="font-light text-[#79A9D8]">
                                persediaan obat.
                            </span>
                        </h1>

                        <p className="mt-7 max-w-lg text-sm leading-7 text-[#6F91B4] sm:text-base">
                            Pantau ketersediaan obat dan kelola
                            persediaan rumah sakit dalam satu tempat.
                        </p>
                    </div>

                    {/* Hero side */}
                    <div className="relative flex flex-col items-start gap-6 lg:items-end lg:text-right">

                        <div className="relative">
                            <span className="pointer-events-none absolute -right-2 -top-14 text-[110px] font-light leading-none text-[#B5D5F2]/45">
                                03
                            </span>

                            <div className="relative">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#7399BD]">
                                    Pharmacy inventory
                                </p>

                                <p className="mt-3 text-sm leading-6 text-[#52799F]">
                                    Semua persediaan,
                                    <br />
                                    tercatat dengan rapi.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={bukaTambah}
                            className="group flex min-h-[58px] items-center gap-5 rounded-[22px] border border-white/70 bg-gradient-to-br from-[#426F9B] to-[#79A9D4] px-7 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(61,112,160,0.65)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_-18px_rgba(61,112,160,0.7)] active:translate-y-0"
                        >
                            <span className="text-xl font-light">+</span>
                            Tambah obat
                            <span className="ml-3 transition-transform group-hover:translate-x-1">
                                ↗
                            </span>
                        </button>
                    </div>
                </section>

                {/* Main glass panel */}
                <section className="rounded-[30px] border border-white/85 bg-white/45 p-5 shadow-[0_25px_80px_-45px_rgba(67,111,153,0.35)] backdrop-blur-2xl sm:rounded-[38px] sm:p-8 lg:p-10">

                    {/* Panel heading */}
                    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#C9DDF0]/70 pb-7">

                        <div>
                            <div className="mb-4 flex items-center gap-3">
                                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#8BAAC9]">
                                    01
                                </span>

                                <span className="h-px w-6 bg-[#B4D0EA]" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#789CBD]">
                                    Pharmacy directory
                                </span>
                            </div>

                            <h2 className="text-2xl font-semibold tracking-tight text-[#29496B] sm:text-3xl">
                                Daftar obat
                            </h2>

                            <p className="mt-2 text-sm text-[#7797B7]">
                                Informasi persediaan yang terhubung dengan HARMONI.
                            </p>
                        </div>

                        {/* Mini statistics */}
                        <div className="flex items-center gap-6">

                            <div className="border-l border-[#BCD5EC] pl-5">
                                <p className="text-3xl font-light text-[#527FA9] sm:text-4xl">
                                    {totalObat}
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8AA8C5]">
                                    Jenis obat
                                </p>
                            </div>

                            <div className="border-l border-[#BCD5EC] pl-5">
                                <p className="text-3xl font-light text-[#527FA9] sm:text-4xl">
                                    {stokMenipis}
                                </p>

                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8AA8C5]">
                                    Stok rendah
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Feedback message */}
                    {pesan && (
                        <div className="mt-5 rounded-2xl border border-[#C8DFF2] bg-white/65 px-5 py-3 text-sm text-[#52799F]">
                            {pesan}
                        </div>
                    )}

                    {/* Add / edit form */}
                    {tampilForm && (
                        <form
                            onSubmit={simpanObat}
                            className="mt-7 rounded-[26px] border border-white/90 bg-white/55 p-5 shadow-sm backdrop-blur-xl sm:p-7"
                        >
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#86A7C8]">
                                        Pharmacy record
                                    </p>

                                    <h3 className="mt-2 text-xl font-semibold text-[#29496B]">
                                        {obatDipilih
                                            ? "Perbarui informasi obat"
                                            : "Tambah obat baru"}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setObatDipilih(null);
                                        setPesan("");
                                    }}
                                    className="rounded-full px-4 py-2 text-sm text-[#7899BA] transition hover:bg-white/80 hover:text-[#29496B]"
                                >
                                    ✕ Tutup
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>
                                    <label className={labelStyle}>
                                        Nama obat
                                    </label>

                                    <input
                                        type="text"
                                        name="nama"
                                        placeholder="Contoh: Paracetamol 500mg"
                                        value={form.nama}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>
                                        Jenis obat
                                    </label>

                                    <select
                                        name="tipe"
                                        value={form.tipe}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    >
                                        <option value="">
                                            Pilih jenis obat
                                        </option>

                                        <option value="keras">
                                            Obat Keras
                                        </option>

                                        <option value="biasa">
                                            Obat Biasa
                                        </option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelStyle}>
                                        Deskripsi
                                    </label>

                                    <textarea
                                        name="deskripsi"
                                        placeholder="Tuliskan deskripsi singkat obat..."
                                        value={form.deskripsi}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>
                                        Jumlah stok
                                    </label>

                                    <input
                                        type="number"
                                        name="stok"
                                        min="0"
                                        step="1"
                                        placeholder="Jumlah persediaan"
                                        value={form.stok}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label className={labelStyle}>
                                        Tanggal kedaluwarsa
                                    </label>

                                    <input
                                        type="date"
                                        name="tanggal_kadaluarsa"
                                        value={form.tanggal_kadaluarsa}
                                        onChange={handleChange}
                                        min={batasTanggal.hariIni}
                                        max={batasTanggal.tanggalMaksimal}
                                        className={inputStyle}
                                    />

                                    <p className="mt-2 text-xs leading-5 text-[#8AA5C0]">
                                        Maksimal 10 tahun dari hari ini.
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelStyle}>
                                        Link gambar
                                    </label>

                                    <input
                                        type="text"
                                        name="gambar"
                                        placeholder="Link gambar obat (opsional)"
                                        value={form.gambar}
                                        onChange={handleChange}
                                        className={inputStyle}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setObatDipilih(null);
                                        setPesan("");
                                    }}
                                    className="rounded-2xl border border-[#D5E4F2] bg-white/60 px-6 py-3 text-sm text-[#6687A9] transition hover:bg-white"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-2xl bg-gradient-to-r from-[#426F9B] to-[#79A9D4] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#83AED5]/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    {obatDipilih
                                        ? "Simpan perubahan"
                                        : "Simpan obat"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Table */}
                    <div className="mt-7 overflow-hidden rounded-[24px] border border-white/90 bg-white/35">

                        {loading ? (
                            <div className="px-6 py-16 text-center">
                                <p className="text-sm text-[#7899BA]">
                                    Sedang memuat data obat...
                                </p>
                            </div>
                        ) : obat.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <p className="text-lg font-medium text-[#52799F]">
                                    Belum ada obat terdaftar
                                </p>

                                <p className="mt-2 text-sm text-[#8AA5C0]">
                                    Tambahkan data obat untuk mulai mengelola persediaan.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left">

                                    <thead>
                                        <tr className="border-b border-[#C9DDF0]/70 bg-[#E5F0FA]/55 text-[10px] uppercase tracking-[0.15em] text-[#789CBD]">
                                            <th className="px-5 py-5 font-semibold">
                                                No.
                                            </th>

                                            <th className="px-5 py-5 font-semibold">
                                                Nama obat
                                            </th>

                                            <th className="px-5 py-5 font-semibold">
                                                Jenis
                                            </th>

                                            <th className="px-5 py-5 font-semibold">
                                                Stok
                                            </th>

                                            <th className="px-5 py-5 font-semibold">
                                                Kedaluwarsa
                                            </th>

                                            <th className="px-5 py-5 text-right font-semibold">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {obat.map((item, index) => {
                                            const stokRendah =
                                                Number(item.stok) <= 10;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-[#D7E6F3]/65 text-sm text-[#456887] transition duration-200 last:border-b-0 hover:bg-white/55"
                                                >
                                                    <td className="px-5 py-5 text-xs text-[#8BA9C6]">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="font-semibold text-[#29496B]">
                                                            {item.nama}
                                                        </p>

                                                        {item.deskripsi && (
                                                            <p className="mt-1 max-w-xs truncate text-xs text-[#8AA5C0]">
                                                                {item.deskripsi}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <span className="inline-flex rounded-full border border-[#C9DDF0] bg-[#EDF5FC]/75 px-3 py-1.5 text-xs text-[#668DB5]">
                                                            {item.tipe === "keras"
                                                                ? "Obat Keras"
                                                                : "Obat Biasa"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <span
                                                            className={`inline-flex items-center gap-2 font-medium ${stokRendah
                                                                ? "text-[#C47D75]"
                                                                : "text-[#527FA9]"
                                                                }`}
                                                        >
                                                            {item.stok}

                                                            {stokRendah && (
                                                                <span className="rounded-full bg-[#FBE8E5] px-2 py-1 text-[10px]">
                                                                    Rendah
                                                                </span>
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5 text-xs text-[#7899BA]">
                                                        {item.tanggal_kadaluarsa
                                                            ? String(
                                                                item.tanggal_kadaluarsa
                                                            ).slice(0, 10)
                                                            : "-"}
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    bukaEdit(item)
                                                                }
                                                                className="rounded-xl border border-[#C5DDF1] bg-[#EAF4FC]/80 px-3.5 py-2 text-xs font-medium text-[#527FA9] transition hover:border-[#8DB9E0] hover:bg-white"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    hapusObat(item.id)
                                                                }
                                                                className="rounded-xl border border-[#F0D5D8] bg-[#FFF0F1]/75 px-3.5 py-2 text-xs font-medium text-[#C47D85] transition hover:border-[#E6AEB5] hover:bg-white"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#91ABC4]">
                            HARMONI · Pharmacy management
                        </p>

                        <p className="text-xs text-[#8AA5C0]">
                            {totalObat} data obat tersimpan
                        </p>
                    </div>
                </section>

                <footer className="relative py-8 text-center">
                    <p className="text-[10px] tracking-[0.2em] text-[#91ABC4]">
                        CARE THROUGH CONNECTION
                    </p>
                </footer>
            </div>
        </main>
    );
}