
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

const FORM_AWAL = {
    nama: "",
    username: "",
    email: "",
    telepon: "",
    password: "",
};

export default function PasienPage() {
    const [pasien, setPasien] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const [form, setForm] = useState({ ...FORM_AWAL });

    // State penyimpanan pasien
    const [menyimpan, setMenyimpan] = useState(false);
    const [errorForm, setErrorForm] = useState("");
    const [pesan, setPesan] = useState("");
    const [errorHalaman, setErrorHalaman] = useState("");

    // State konfirmasi hapus dan status
    const [targetKonfirmasi, setTargetKonfirmasi] = useState(null);
    const [jenisKonfirmasi, setJenisKonfirmasi] = useState("");
    const [memproses, setMemproses] = useState(false);
    const [errorKonfirmasi, setErrorKonfirmasi] = useState("");

    // State tampilkan password
    const [showPassword, setShowPassword] = useState(false);

    async function ambilPasien() {
        try {
            setLoading(true);
            setErrorHalaman("");

            const response = await fetch("/api/admin/pasien", {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                setErrorHalaman(
                    result.message || "Gagal mengambil data pasien."
                );
                return;
            }

            const dataPasien = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.pasien)
                        ? result.pasien
                        : [];

            const dataNormal = dataPasien.map((item) => ({
                ...item,
                nama: item.full_name ?? item.nama ?? "",
                telepon: item.phone ?? item.telepon ?? "",
            }));

            setPasien(dataNormal);

        } catch (error) {
            console.error("Gagal mengambil data pasien:", error);

            setErrorHalaman(
                "Terjadi kesalahan saat mengambil data pasien."
            );

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilPasien();
    }, []);

    const pasienFiltered = pasien.filter((item) => {
        const keyword = search.toLowerCase();

        const nama = String(item.nama || "").toLowerCase();
        const username = String(item.username || "").toLowerCase();
        const email = String(item.email || "").toLowerCase();
        const telepon = String(item.telepon || "").toLowerCase();

        return (
            nama.includes(keyword) ||
            username.includes(keyword) ||
            email.includes(keyword) ||
            telepon.includes(keyword)
        );
    });

    // Membuka formulir tambah pasien
    function bukaTambah() {
        setForm({ ...FORM_AWAL });
        setErrorForm("");
        setPesan("");
        setShowPassword(false);
        setModalOpen(true);
    }

    // Menutup formulir
    function tutupForm() {
        if (menyimpan) return;

        setModalOpen(false);
        setErrorForm("");
        setShowPassword(false);
        setForm({ ...FORM_AWAL });
    }

    // Menyimpan pasien baru
    async function simpanPasien(e) {
        e.preventDefault();

        if (menyimpan) return;

        setErrorForm("");
        setPesan("");

        const nama = form.nama.trim();
        const username = form.username.trim();
        const email = form.email.trim();
        const telepon = form.telepon.trim();
        const password = form.password;

        if (!nama || !username || !email || !password.trim()) {
            setErrorForm(
                "Nama, username, email, dan password wajib diisi."
            );
            return;
        }

        if (password.length < 8) {
            setErrorForm(
                "Password minimal 8 karakter."
            );
            return;
        }

        const payload = {
            full_name: nama,
            username,
            email,
            phone: telepon,
            password,
        };

        try {
            setMenyimpan(true);

            const response = await fetch("/api/admin/pasien", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                setErrorForm(
                    result.message ||
                    "Gagal menyimpan data pasien."
                );
                return;
            }

            setModalOpen(false);
            setForm({ ...FORM_AWAL });
            setShowPassword(false);

            setPesan(
                "Akun pasien berhasil ditambahkan."
            );

            await ambilPasien();

        } catch (error) {
            console.error("Gagal menyimpan pasien:", error);

            setErrorForm(
                "Terjadi kesalahan saat menyimpan data."
            );

        } finally {
            setMenyimpan(false);
        }
    }

    // Membuka konfirmasi perubahan status
    function bukaKonfirmasiStatus(item) {
        setTargetKonfirmasi(item);
        setJenisKonfirmasi("status");
        setErrorKonfirmasi("");
    }

    // Membuka konfirmasi hapus
    function bukaKonfirmasiHapus(item) {
        setTargetKonfirmasi(item);
        setJenisKonfirmasi("hapus");
        setErrorKonfirmasi("");
    }

    // Membatalkan konfirmasi
    function batalKonfirmasi() {
        if (memproses) return;

        setTargetKonfirmasi(null);
        setJenisKonfirmasi("");
        setErrorKonfirmasi("");
    }

    // Mengaktifkan atau menonaktifkan pasien
    async function handleToggleStatus() {
        if (!targetKonfirmasi || memproses) return;

        const item = targetKonfirmasi;
        const statusBaru = item.is_active === false;

        const aksi = statusBaru
            ? "mengaktifkan"
            : "menonaktifkan";

        setMemproses(true);
        setErrorKonfirmasi("");
        setPesan("");

        try {
            const response = await fetch(
                `/api/admin/pasien/${item.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        is_active: statusBaru,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setErrorKonfirmasi(
                    result.message ||
                    `Gagal ${aksi} akun pasien.`
                );
                return;
            }

            setTargetKonfirmasi(null);
            setJenisKonfirmasi("");

            setPesan(
                statusBaru
                    ? "Akun pasien berhasil diaktifkan."
                    : "Akun pasien berhasil dinonaktifkan."
            );

            await ambilPasien();

        } catch (error) {
            console.error("Gagal mengubah status pasien:", error);

            setErrorKonfirmasi(
                "Terjadi kesalahan saat mengubah status akun."
            );

        } finally {
            setMemproses(false);
        }
    }

    // Menghapus pasien
    async function hapusPasien() {
        if (!targetKonfirmasi || memproses) return;

        setMemproses(true);
        setErrorKonfirmasi("");
        setPesan("");

        try {
            const response = await fetch(
                `/api/admin/pasien/${targetKonfirmasi.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok || result.success === false) {
                setErrorKonfirmasi(
                    result.message ||
                    "Gagal menghapus pasien."
                );
                return;
            }

            setTargetKonfirmasi(null);
            setJenisKonfirmasi("");

            setPesan(
                "Data pasien berhasil dihapus."
            );

            await ambilPasien();

        } catch (error) {
            console.error("Gagal menghapus pasien:", error);

            setErrorKonfirmasi(
                "Terjadi kesalahan saat menghapus data."
            );

        } finally {
            setMemproses(false);
        }
    }

    const namaTarget =
        targetKonfirmasi?.nama ||
        targetKonfirmasi?.username ||
        "pasien ini";

    const akanDiaktifkan =
        targetKonfirmasi?.is_active === false;

    const inputClass =
        "w-full rounded-2xl border border-white/90 bg-white/65 px-4 py-4 text-sm text-[#315A82] outline-none transition focus:border-[#9DC3E8]";

    return (
        <main className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(150,198,238,0.38),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(220,237,251,0.8),transparent_40%),linear-gradient(135deg,#f8fbff_0%,#e8f2fc_55%,#d8eafb_100%)] px-[5%] py-[34px] text-[#315A82]">

            <div className="mx-auto w-full max-w-[1500px]">

                {/* Header */}
                <header className="mb-10 flex flex-col items-start justify-between gap-5 sm:mb-14 sm:flex-row sm:items-center">

                    <div>

                        <div className="text-2xl font-semibold tracking-[9px] text-[#315A82] sm:text-[30px]">
                            HARMONI
                        </div>

                        <div className="mt-2 text-xs tracking-[4px] text-[#7C9FC7]">
                            HOSPITAL INFORMATION SYSTEM
                        </div>

                    </div>

                    <Link
                        href="/admin"
                        className="rounded-full border border-white/85 bg-white/50 px-6 py-3 text-sm text-[#547DA8] shadow-[0_4px_12px_rgba(65,100,135,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/80"
                    >
                        ← Kembali ke dashboard
                    </Link>

                </header>

                {/* Hero */}
                <section className="mb-12 grid grid-cols-1 items-center gap-8 md:mb-14 md:grid-cols-[minmax(0,1fr)_300px] md:gap-12">

                    <div className="min-w-0">

                        <div className="mb-6 flex items-center gap-3.5 text-xs font-semibold tracking-[3px] text-[#7A9FC8]">

                            <span className="h-px w-[42px] bg-[#8DB5DF]" />

                            ADMINISTRATION / MASTER DATA

                        </div>

                        <h1 className="text-[clamp(42px,5.5vw,76px)] font-normal leading-[1.08] tracking-[-3px] text-[#315A82]">

                            Data pasien,

                            <br />

                            <span className="text-[#76A2D0]">
                                lebih terorganisir.
                            </span>

                        </h1>

                        <p className="mt-5 max-w-[680px] text-base leading-[1.8] text-[#789BC2] sm:text-[17px]">
                            Kelola informasi akun dan kontak pasien
                            dalam satu ruang kerja yang terintegrasi.
                        </p>

                    </div>

                    <div className="relative min-w-0 py-6 text-left md:text-right">

                        <span className="pointer-events-none absolute -top-9 left-0 -z-0 text-[130px] font-light leading-none text-[#71A3D3]/[0.16] sm:text-[150px] md:left-auto md:right-0">
                            05
                        </span>

                        <div className="relative z-10">

                            <p className="text-xs tracking-[3px] text-[#7B9FC6]">
                                PATIENT DIRECTORY
                            </p>

                            <p className="my-4 text-[15px] leading-[1.7] text-[#547DA8]">

                                Informasi pasien tersusun

                                <br />

                                dengan lebih rapi.

                            </p>

                            <button
                                type="button"
                                onClick={bukaTambah}
                                className="inline-flex items-center justify-center gap-3.5 rounded-[18px] bg-gradient-to-r from-[#315B83] to-[#679BC8] px-6 py-4 text-sm font-medium text-white shadow-[0_12px_28px_rgba(55,100,145,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(55,100,145,0.25)]"
                            >
                                <span>＋</span>

                                Tambah pasien

                                <span>↗</span>
                            </button>

                        </div>

                    </div>

                </section>

                {/* Daftar pasien */}
                <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/[0.34] shadow-[0_20px_55px_rgba(74,115,153,0.06)] backdrop-blur-[22px] sm:rounded-[34px]">

                    <div className="flex flex-col items-start justify-between gap-6 px-6 py-7 sm:px-9 sm:py-9 md:flex-row md:items-end">

                        <div>

                            <p className="mb-3 text-[11px] tracking-[2.5px] text-[#7D9FC5]">
                                05 — DIRECTORY
                            </p>

                            <h2 className="text-2xl font-normal tracking-[-0.8px] text-[#315A82] sm:text-[30px]">
                                Daftar pasien
                            </h2>

                            <p className="mt-2.5 text-sm text-[#7B9FC6]">
                                Informasi akun dan kontak pasien HARMONI.
                            </p>

                        </div>

                        <input
                            type="text"
                            placeholder="Cari nama, username, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-[17px] border border-white/90 bg-white/[0.55] px-5 py-4 text-sm text-[#315A82] outline-none transition duration-200 placeholder:text-[#8AA9CB] focus:border-[#9DC3E8] focus:bg-white/80 focus:ring-4 focus:ring-[#84B3DE]/[0.12] md:w-[330px]"
                        />

                    </div>

                    {/* Notifikasi berhasil */}
                    {pesan && (
                        <div
                            role="status"
                            className="mx-6 mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3 text-sm text-emerald-700 sm:mx-9"
                        >
                            {pesan}
                        </div>
                    )}

                    {/* Notifikasi gagal */}
                    {errorHalaman && (
                        <div
                            role="alert"
                            className="mx-6 mb-5 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-600 sm:mx-9"
                        >
                            {errorHalaman}
                        </div>
                    )}

                    <div className="overflow-x-auto px-5 pb-7 sm:px-9 sm:pb-8">

                        <table className="w-full min-w-[750px] border-collapse text-left">

                            <thead>
                                <tr className="border-b border-white/80">

                                    {[
                                        "NO.",
                                        "PASIEN",
                                        "USERNAME",
                                        "EMAIL",
                                        "TELEPON",
                                        "STATUS",
                                        "AKSI",
                                    ].map((judul) => (
                                        <th
                                            key={judul}
                                            className="px-3.5 py-5 text-[11px] font-semibold tracking-[1.5px] text-[#789BC2]"
                                        >
                                            {judul}
                                        </th>
                                    ))}

                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center text-sm text-[#86A6C9]"
                                        >
                                            Memuat data pasien...
                                        </td>
                                    </tr>

                                ) : pasienFiltered.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center text-sm text-[#86A6C9]"
                                        >
                                            Belum ada data pasien yang ditemukan.
                                        </td>
                                    </tr>

                                ) : (

                                    pasienFiltered.map((item, index) => (

                                        <tr
                                            key={item.id}
                                            className="transition duration-200 hover:bg-white/25"
                                        >

                                            <td className="border-b border-white/65 px-3.5 py-5 text-sm text-[#426B95]">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            <td className="border-b border-white/65 px-3.5 py-5">

                                                <div className="flex items-center gap-3">

                                                    <span className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] border border-white/80 bg-white/35 text-[#5E8AB6]">

                                                        {item.nama?.charAt(0)?.toUpperCase() || "P"}

                                                    </span>

                                                    <div>

                                                        <p className="text-sm font-medium text-[#315A82]">
                                                            {item.nama || "-"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#8AA9CB]">
                                                            Pasien HARMONI
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            <td className="border-b border-white/65 px-3.5 py-5 text-sm text-[#426B95]">
                                                {item.username || "-"}
                                            </td>

                                            <td className="border-b border-white/65 px-3.5 py-5 text-sm text-[#426B95]">
                                                {item.email || "-"}
                                            </td>

                                            <td className="border-b border-white/65 px-3.5 py-5 text-sm text-[#426B95]">
                                                {item.telepon || "-"}
                                            </td>

                                            {/* Status pasien */}
                                            <td className="border-b border-white/65 px-3.5 py-5">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                                        item.is_active !== false
                                                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            : "border border-rose-200 bg-rose-50 text-rose-700"
                                                    }`}
                                                >

                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            item.is_active !== false
                                                                ? "bg-emerald-500"
                                                                : "bg-rose-500"
                                                        }`}
                                                    />

                                                    {item.is_active !== false
                                                        ? "Aktif"
                                                        : "Nonaktif"}

                                                </span>

                                            </td>

                                            {/* Tombol aksi */}
                                            <td className="border-b border-white/65 px-3.5 py-5">

                                                <div className="flex flex-wrap gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            bukaKonfirmasiStatus(item)
                                                        }
                                                        disabled={memproses}
                                                        className={`rounded-full border px-4 py-2 text-xs font-medium transition duration-200 disabled:opacity-50 ${
                                                            item.is_active !== false
                                                                ? "border-amber-200 bg-amber-50/80 text-amber-700 hover:bg-amber-100"
                                                                : "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100"
                                                        }`}
                                                    >

                                                        {item.is_active !== false
                                                            ? "Nonaktifkan"
                                                            : "Aktifkan"}

                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            bukaKonfirmasiHapus(item)
                                                        }
                                                        disabled={memproses}
                                                        className="rounded-full border border-[#E7A8BC]/45 bg-white/40 px-4 py-2 text-xs text-[#BD718A] transition duration-200 hover:bg-rose-50 disabled:opacity-50"
                                                    >
                                                        Hapus
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </div>

            {/* Modal tambah pasien */}
            {modalOpen && (

                <div
                    onClick={tutupForm}
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2A4665]/35 p-5 backdrop-blur-xl"
                >

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="judul-form-pasien"
                        onClick={(e) => e.stopPropagation()}
                        className="my-auto w-full max-w-[620px] rounded-[30px] border border-white/90 bg-[#EFF6FD]/95 p-6 shadow-[0_25px_70px_rgba(39,76,113,0.2)] sm:p-9"
                    >

                        <div className="mb-7 flex items-start justify-between gap-4">

                            <div>

                                <p className="mb-3 text-[11px] tracking-[2.5px] text-[#7D9FC5]">
                                    MASTER DATA / PASIEN
                                </p>

                                <h2
                                    id="judul-form-pasien"
                                    className="text-2xl font-normal text-[#315A82] sm:text-[29px]"
                                >
                                    Pasien baru
                                </h2>

                                <p className="mt-2.5 text-sm text-[#7B9FC6]">
                                    Lengkapi informasi akun pasien.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={tutupForm}
                                disabled={menyimpan}
                                aria-label="Tutup formulir"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/75 text-xl text-[#7196BD] transition hover:bg-white disabled:opacity-50"
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={simpanPasien}>

                            {/* Nama pasien */}
                            <div className="mb-5">

                                <label
                                    htmlFor="nama-pasien"
                                    className="mb-2 block text-sm text-[#547DA8]"
                                >
                                    Nama pasien
                                </label>

                                <input
                                    id="nama-pasien"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nama: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan nama lengkap"
                                    required
                                    className={inputClass}
                                />

                            </div>

                            {/* Username */}
                            <div className="mb-5">

                                <label
                                    htmlFor="username-pasien"
                                    className="mb-2 block text-sm text-[#547DA8]"
                                >
                                    Username
                                </label>

                                <input
                                    id="username-pasien"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            username: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan username"
                                    autoComplete="username"
                                    required
                                    className={inputClass}
                                />

                            </div>

                            {/* Email */}
                            <div className="mb-5">

                                <label
                                    htmlFor="email-pasien"
                                    className="mb-2 block text-sm text-[#547DA8]"
                                >
                                    Email
                                </label>

                                <input
                                    id="email-pasien"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="nama@email.com"
                                    required
                                    className={inputClass}
                                />

                            </div>

                            {/* Nomor telepon */}
                            <div className="mb-5">

                                <label
                                    htmlFor="telepon-pasien"
                                    className="mb-2 block text-sm text-[#547DA8]"
                                >
                                    Nomor telepon
                                </label>

                                <input
                                    id="telepon-pasien"
                                    type="tel"
                                    value={form.telepon}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            telepon: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan nomor telepon"
                                    className={inputClass}
                                />

                            </div>

                            {/* Input password baru */}
                            <div className="mb-5">

                                <label
                                    htmlFor="password-pasien"
                                    className="mb-2 block text-sm text-[#547DA8]"
                                >
                                    Password
                                </label>

                                <div className="relative">

                                    <input
                                        id="password-pasien"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Minimal 8 karakter"
                                        autoComplete="new-password"
                                        minLength={8}
                                        required
                                        className={`${inputClass} pr-24`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7196BD] transition hover:text-[#315A82]"
                                    >
                                        {showPassword
                                            ? "Sembunyikan"
                                            : "Lihat"}
                                    </button>

                                </div>

                                <p className="mt-2 text-xs text-[#8AA9CB]">
                                    Password digunakan untuk login akun pasien.
                                </p>

                            </div>

                            {/* Error formulir */}
                            {errorForm && (

                                <div
                                    role="alert"
                                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                                >
                                    {errorForm}
                                </div>

                            )}

                            <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={tutupForm}
                                    disabled={menyimpan}
                                    className="rounded-2xl border border-[#D3E3F3] bg-white/55 px-5 py-3 text-sm text-[#6E91B8] transition hover:bg-white/80 disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-2xl bg-gradient-to-r from-[#315B83] to-[#679BC8] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_25px_rgba(55,100,145,0.16)] transition hover:-translate-y-0.5 disabled:opacity-50"
                                >

                                    {menyimpan
                                        ? "Menyimpan..."
                                        : "Tambah pasien"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* Custom modal hapus dan status */}
            <ConfirmModal
                open={targetKonfirmasi !== null}

                title={
                    jenisKonfirmasi === "hapus"
                        ? "Hapus data pasien?"
                        : akanDiaktifkan
                            ? "Aktifkan akun pasien?"
                            : "Nonaktifkan akun pasien?"
                }

                description={
                    jenisKonfirmasi === "hapus"
                        ? `Apakah Anda yakin ingin menghapus ${namaTarget}? Data yang telah dihapus tidak dapat dikembalikan.`
                        : akanDiaktifkan
                            ? `Apakah Anda yakin ingin mengaktifkan kembali akun ${namaTarget}?`
                            : `Apakah Anda yakin ingin menonaktifkan akun ${namaTarget}?`
                }

                onCancel={batalKonfirmasi}

                onConfirm={
                    jenisKonfirmasi === "hapus"
                        ? hapusPasien
                        : handleToggleStatus
                }

                loading={memproses}

                error={errorKonfirmasi}

                confirmText={
                    jenisKonfirmasi === "hapus"
                        ? "Ya, Hapus"
                        : akanDiaktifkan
                            ? "Ya, Aktifkan"
                            : "Ya, Nonaktifkan"
                }

                variant={
                    jenisKonfirmasi === "hapus"
                        ? "danger"
                        : "primary"
                }
            />

        </main>
    );
}
