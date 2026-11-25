
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function DokterPage() {
    const [dokter, setDokter] = useState([]);
    const [poli, setPoli] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // STATE KONFIRMASI HAPUS
    const [hapusTarget, setHapusTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [hapusError, setHapusError] = useState("");
    const dialogRef = useRef(null);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        full_name: "",
        phone: "",
        poli_id: "",
    });

    async function ambilData() {
        try {
            setLoading(true);

            const [dokterRes, poliRes] = await Promise.all([
                fetch("/api/admin/dokter"),
                fetch("/api/admin/poli"),
            ]);

            const dokterData = await dokterRes.json();
            const poliData = await poliRes.json();

            if (dokterData.success) {
                const dataDokter =
                    dokterData.data?.dokter ??
                    dokterData.data ??
                    [];

                setDokter(
                    Array.isArray(dataDokter)
                        ? dataDokter
                        : []
                );
            }

            if (poliData.success) {
                const dataPoli =
                    poliData.data?.poli ??
                    poliData.data ??
                    [];

                setPoli(
                    Array.isArray(dataPoli)
                        ? dataPoli
                        : []
                );
            }
        } catch (err) {
            console.error(err);
            setError("Data dokter gagal dimuat.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    // MEMBUKA DAN MENUTUP MODAL
    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (hapusTarget && !dialog.open) {
            dialog.showModal();
        } else if (!hapusTarget && dialog.open) {
            dialog.close();
        }
    }, [hapusTarget]);

    function resetForm() {
        setForm({
            username: "",
            email: "",
            password: "",
            full_name: "",
            phone: "",
            poli_id: "",
        });

        setShowForm(false);
        setError("");
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((sebelumnya) => ({
            ...sebelumnya,
            [name]: value,
        }));

        if (name === "email") {
            setError("");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        const emailInput = form.email.trim();

        if (!emailInput) {
            setError("Email harus diisi.");
            return;
        }

        if (/\s/.test(emailInput)) {
            setError("Email tidak boleh mengandung spasi.");
            return;
        }

        const bagianEmail = emailInput.split("@");

        if (bagianEmail.length !== 2) {
            setError("Format email tidak valid.");
            return;
        }

        const namaAkun = bagianEmail[0];
        const domainEmail = bagianEmail[1].toLowerCase();

        if (
            !namaAkun ||
            !/^[a-zA-Z0-9._+-]+$/.test(namaAkun) ||
            namaAkun.startsWith(".") ||
            namaAkun.endsWith(".") ||
            namaAkun.includes("..")
        ) {
            setError("Nama akun email tidak valid.");
            return;
        }

        if (domainEmail !== "gmail.com") {
            setError("Gunakan format email @gmail.com.");
            return;
        }

        const email = `${namaAkun}@gmail.com`;

        if (form.password.length < 6) {
            setError("Password minimal 6 karakter.");
            return;
        }

        if (!form.poli_id) {
            setError("Silakan pilih poli.");
            return;
        }

        try {
            const payload = {
                ...form,
                username: form.username.trim(),
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                email,
                poli_id: Number(form.poli_id),
            };

            const response = await fetch("/api/admin/dokter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.message ||
                    "Data dokter gagal disimpan."
                );
                return;
            }

            setSuccess("Dokter berhasil ditambahkan.");

            resetForm();
            await ambilData();
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan saat menyimpan data.");
        }
    }

    // MENGUBAH STATUS DOKTER
    async function handleToggleStatus(item) {
        const aktif = item.is_active !== false;

        const aksi = aktif
            ? "menonaktifkan"
            : "mengaktifkan";

        const yakin = confirm(
            `Yakin ingin ${aksi} akun dokter ${item.full_name || item.username}?`
        );

        if (!yakin) return;

        try {
            const response = await fetch(
                `/api/admin/dokter/${item.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        is_active: !aktif,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                alert(
                    result.message ||
                    `Gagal ${aksi} akun dokter.`
                );
                return;
            }

            setSuccess(
                `Akun dokter berhasil ${
                    aktif ? "dinonaktifkan" : "diaktifkan"
                }.`
            );

            await ambilData();
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat mengubah status akun.");
        }
    }

    // MEMBUKA KONFIRMASI HAPUS
    function bukaKonfirmasiHapus(item) {
        setHapusError("");
        setHapusTarget(item);
    }

    // MEMBATALKAN PENGHAPUSAN
    function batalHapus() {
        if (deleting) return;

        setHapusTarget(null);
        setHapusError("");
    }

    // MENGHAPUS DATA DOKTER
    async function handleHapus() {
        if (!hapusTarget || deleting) return;

        setDeleting(true);
        setHapusError("");
        setSuccess("");

        try {
            const response = await fetch(
                `/api/admin/dokter/${hapusTarget.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setHapusError(
                    result.message ||
                    "Data dokter gagal dihapus."
                );
                return;
            }

            setHapusTarget(null);
            setSuccess("Data dokter berhasil dihapus.");

            await ambilData();
        } catch (err) {
            console.error(err);
            setHapusError(
                "Terjadi kesalahan saat menghapus data."
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#eaf3fc] text-[#29496b]">

            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 h-[650px] w-[650px] rounded-full bg-white/90 blur-[110px]" />

                <div className="absolute right-[-180px] top-[100px] h-[700px] w-[700px] rounded-full bg-[#b9d8f5]/70 blur-[130px]" />

                <div className="absolute bottom-[-250px] left-[25%] h-[600px] w-[800px] rounded-full bg-[#d5e9fb]/80 blur-[120px]" />

                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-[#eaf3fc]/40 to-[#c9e1f7]/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-8 sm:px-10 lg:px-14">

                {/* HEADER */}
                <header className="flex items-center justify-between border-b border-white/80 pb-7">

                    <div className="flex items-center gap-3">

                        <h1 className="text-3xl font-bold tracking-[0.2em] text-[#315b83]">
                            HARMONI
                        </h1>

                        <span className="hidden border-l border-[#8fb6dc]/60 pl-3 text-[11px] tracking-[0.12em] text-[#7198bd] sm:block">
                            Hospital Information System
                        </span>

                    </div>

                    <Link
                        href="/admin"
                        className="rounded-full border border-white/80 bg-white/35 px-5 py-3 text-sm text-[#426b92] backdrop-blur-xl transition duration-300 hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(75,125,170,0.12)]"
                    >
                        ← Dashboard
                    </Link>

                </header>

                {/* HERO */}
                <section className="relative flex flex-col justify-between gap-10 py-14 lg:flex-row lg:items-end lg:py-16">

                    <div className="max-w-2xl">

                        <p className="mb-7 max-w-xs text-sm leading-7 text-[#789bbf]">
                            Tempat mengenal orang-orang
                            <br />
                            di balik pelayanan rumah sakit.
                        </p>

                        <h2 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#29496b] sm:text-7xl lg:text-[82px]">
                            Tim medis
                            <br />

                            <span className="font-light text-[#79a9d5]">
                                HARMONI.
                            </span>
                        </h2>

                        <p className="mt-8 max-w-sm text-base leading-8 text-[#7196bb]">
                            Kelola profil dokter dan penempatan poli
                            dalam satu ruang kerja.
                        </p>

                    </div>

                    <div className="flex flex-col items-start gap-5 lg:items-end">

                        <div className="relative text-right">

                            <span className="absolute -right-2 -top-16 select-none text-[150px] font-light leading-none text-[#6c9bc7]/10">
                                01
                            </span>

                            <p className="relative text-[10px] tracking-[0.18em] text-[#7d9fbe]">
                                MEDICAL DIRECTORY
                            </p>

                            <p className="relative mt-3 text-sm leading-7 text-[#52799f]">
                                Semua tenaga medis,
                                <br />
                                tersusun dengan rapi.
                            </p>

                        </div>

                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            className="group flex items-center gap-5 rounded-[22px] border border-white/70 bg-gradient-to-br from-[#426f99] to-[#79a9d0] px-8 py-5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(65,110,155,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(65,110,155,0.3)]"
                        >
                            <span className="text-xl font-light">
                                +
                            </span>

                            Tambah dokter

                            <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                                ↗
                            </span>
                        </button>

                    </div>

                </section>

                {/* DAFTAR DOKTER */}
                <section className="rounded-[34px] border border-white/85 bg-white/35 p-5 shadow-[0_25px_80px_rgba(80,125,170,0.08)] backdrop-blur-2xl sm:p-8 lg:p-12">

                    <div className="flex flex-col justify-between gap-6 border-b border-[#a9c9e7]/35 pb-8 sm:flex-row sm:items-center">

                        <div>

                            <p className="text-[10px] tracking-[0.18em] text-[#83a5c7]">
                                DIREKTORI TENAGA MEDIS
                            </p>

                            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#315779]">
                                Daftar dokter
                            </h3>

                            <p className="mt-3 text-sm text-[#7b9cbd]">
                                Informasi dokter yang terdaftar dan
                                terhubung dengan poli.
                            </p>

                        </div>

                        <div className="flex items-center gap-4 border-l border-[#a9c9e7]/50 pl-5">

                            <span className="text-5xl font-light tracking-tight text-[#5b88b2]">
                                {dokter.length
                                    .toString()
                                    .padStart(2, "0")}
                            </span>

                            <span className="text-xs leading-5 text-[#83a5c7]">
                                dokter
                                <br />
                                terdaftar
                            </span>

                        </div>

                    </div>

                    {/* NOTIFIKASI BERHASIL */}
                    {success && (
                        <div className="mt-6 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-5 py-3 text-sm text-emerald-700">
                            {success}
                        </div>
                    )}

                    {/* NOTIFIKASI ERROR */}
                    {!showForm && error && (
                        <div className="mt-6 rounded-2xl border border-red-200/70 bg-red-50/70 px-5 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* FORM TAMBAH DOKTER */}
                    {showForm && (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 rounded-[26px] border border-white/90 bg-white/55 p-6 shadow-[0_15px_45px_rgba(75,125,170,0.08)] backdrop-blur-xl sm:p-8"
                        >

                            <div className="mb-7 flex items-center justify-between">

                                <div>

                                    <p className="text-[10px] tracking-[0.16em] text-[#83a5c7]">
                                        MEDICAL PROFILE
                                    </p>

                                    <h4 className="mt-2 text-xl font-semibold text-[#315779]">
                                        Dokter baru
                                    </h4>

                                </div>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-full px-4 py-2 text-sm text-[#789bbf] transition hover:bg-white/70"
                                >
                                    Tutup ×
                                </button>

                            </div>

                            {error && (
                                <div className="mb-5 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                                {[
                                    {
                                        label: "Nama lengkap",
                                        name: "full_name",
                                        placeholder: "Nama dokter",
                                    },
                                    {
                                        label: "Username",
                                        name: "username",
                                        placeholder: "Username",
                                    },
                                    {
                                        label: "Email",
                                        name: "email",
                                        placeholder: "nama@gmail.com",
                                    },
                                    {
                                        label: "Nomor telepon",
                                        name: "phone",
                                        placeholder: "Nomor telepon",
                                    },
                                    {
                                        label: "Password",
                                        name: "password",
                                        placeholder: "Minimal 6 karakter",
                                    },
                                ].map((field) => (

                                    <label
                                        key={field.name}
                                        className="block"
                                    >

                                        <span className="mb-2 block text-xs font-medium tracking-wide text-[#587b9e]">
                                            {field.label}
                                        </span>

                                        <input
                                            type={
                                                field.name === "password"
                                                    ? "password"
                                                    : field.name === "email"
                                                        ? "email"
                                                        : "text"
                                            }
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            autoCapitalize={
                                                field.name === "email"
                                                    ? "none"
                                                    : undefined
                                            }
                                            autoComplete={
                                                field.name === "email"
                                                    ? "email"
                                                    : field.name === "password"
                                                        ? "new-password"
                                                        : undefined
                                            }
                                            spellCheck={
                                                field.name === "email"
                                                    ? false
                                                    : undefined
                                            }
                                            maxLength={
                                                field.name === "email"
                                                    ? 254
                                                    : undefined
                                            }
                                            className="w-full rounded-2xl border border-white/90 bg-white/60 px-4 py-3.5 text-sm text-[#315779] outline-none transition placeholder:text-[#a1b9d2] focus:border-[#8db9e3] focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(141,185,227,0.12)]"
                                        />

                                    </label>
                                ))}

                                <label className="block">

                                    <span className="mb-2 block text-xs font-medium tracking-wide text-[#587b9e]">
                                        Poli
                                    </span>

                                    <select
                                        name="poli_id"
                                        value={form.poli_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-2xl border border-white/90 bg-white/60 px-4 py-3.5 text-sm text-[#315779] outline-none transition focus:border-[#8db9e3] focus:bg-white/90"
                                    >

                                        <option
                                            value=""
                                            className="bg-white text-[#315779]"
                                        >
                                            Pilih poli
                                        </option>

                                        {poli.map((item) => {
                                            const namaPoli =
                                                item.nama_poli ??
                                                item.nama ??
                                                item.name ??
                                                item.poli_name ??
                                                "";

                                            return (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                    className="bg-white text-[#315779]"
                                                >
                                                    {namaPoli}
                                                </option>
                                            );
                                        })}

                                    </select>

                                </label>

                            </div>

                            <div className="mt-7 flex flex-wrap gap-3">

                                <button
                                    type="submit"
                                    className="rounded-full bg-[#426f99] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[#426f99]/15 transition hover:bg-[#315779]"
                                >
                                    Tambah dokter
                                </button>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-full border border-[#b8d1e9]/60 bg-white/50 px-7 py-3 text-sm text-[#6d91b4] transition hover:bg-white/80"
                                >
                                    Batal
                                </button>

                            </div>

                        </form>
                    )}

                    {/* TABEL DOKTER */}
                    <div className="mt-8 overflow-x-auto rounded-[22px] border border-white/90 bg-white/30">

                        <table className="w-full min-w-[850px] border-collapse text-left">

                            <thead>
                                <tr className="border-b border-[#b8d1e9]/40 bg-white/30 text-[10px] tracking-[0.12em] text-[#7d9fbe]">

                                    <th className="px-6 py-5 font-medium">
                                        No.
                                    </th>

                                    <th className="px-6 py-5 font-medium">
                                        Nama dokter
                                    </th>

                                    <th className="px-6 py-5 font-medium">
                                        Username
                                    </th>

                                    <th className="px-6 py-5 font-medium">
                                        Email
                                    </th>

                                    <th className="px-6 py-5 font-medium">
                                        Poli
                                    </th>

                                    <th className="px-6 py-5 font-medium">
                                        Status
                                    </th>

                                    <th className="px-6 py-5 text-right font-medium">
                                        Aksi
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-16 text-center text-sm text-[#83a5c7]"
                                        >
                                            Memuat data dokter...
                                        </td>
                                    </tr>

                                ) : dokter.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-16 text-center text-sm text-[#83a5c7]"
                                        >
                                            Belum ada data dokter.
                                        </td>
                                    </tr>

                                ) : (

                                    dokter.map((item, index) => (

                                        <tr
                                            key={item.id}
                                            className="border-b border-[#b8d1e9]/30 transition duration-200 last:border-0 hover:bg-white/35"
                                        >

                                            <td className="px-6 py-6 text-sm text-[#91afcc]">
                                                {(index + 1)
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </td>

                                            <td className="px-6 py-6 text-sm font-semibold text-[#315779]">
                                                {item.full_name ??
                                                    item.nama_dokter}
                                            </td>

                                            <td className="px-6 py-6 text-sm text-[#6387aa]">
                                                {item.username}
                                            </td>

                                            <td className="px-6 py-6 text-sm text-[#6387aa]">
                                                {item.email}
                                            </td>

                                            <td className="px-6 py-6">

                                                <span className="inline-flex rounded-full border border-[#b8d6f2]/60 bg-[#eaf4fc]/50 px-4 py-2 text-xs text-[#6d96bd]">
                                                    {item.nama_poli ??
                                                        item.poli ??
                                                        "-"}
                                                </span>

                                            </td>

                                            <td className="px-6 py-6">

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

                                            <td className="px-6 py-6">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleToggleStatus(item)
                                                        }
                                                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition ${
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
                                                        onClick={() =>
                                                            bukaKonfirmasiHapus(item)
                                                        }
                                                        className="rounded-xl border border-[#F0D5D8] bg-[#FCF2F5] px-3.5 py-1.5 text-xs text-[#CE7B84] transition hover:bg-[#F9E8EC]"
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

                    <div className="mt-7 flex flex-col justify-between gap-3 text-[10px] tracking-[0.12em] text-[#91afcc] sm:flex-row sm:items-center">

                        <p>HARMONI · MEDICAL DIRECTORY</p>

                        <p>
                            {dokter.length} tenaga medis terhubung
                        </p>

                    </div>

                </section>

                {/* FOOTER */}
                <footer className="flex justify-between px-2 py-8 text-[10px] tracking-[0.1em] text-[#91afcc]">

                    <span>HARMONI · 2026</span>

                    <span>CARE THROUGH CONNECTION</span>

                </footer>

            </div>

            {/* CUSTOM MODAL KONFIRMASI HAPUS */}
            <dialog
                ref={dialogRef}
                aria-labelledby="judul-hapus"
                aria-describedby="deskripsi-hapus"
                onCancel={(e) => {
                    e.preventDefault();
                    batalHapus();
                }}
                className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-40px)] max-w-md overflow-y-auto rounded-[30px] border border-white/90 bg-white/95 p-8 text-[#29496b] shadow-[0_25px_80px_rgba(80,125,170,0.25)] backdrop:bg-[#29496b]/30 backdrop:backdrop-blur-sm"
            >

                {hapusTarget && (
                    <>
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#F0D5D8] bg-[#FCF2F5] text-[#CE7B84]">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
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
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 10v6" />
                                <path d="M14 10v6" />
                            </svg>

                        </div>

                        <p className="mb-3 text-[10px] tracking-[0.18em] text-[#83a5c7]">
                            HARMONI · KONFIRMASI
                        </p>

                        <h2
                            id="judul-hapus"
                            className="text-2xl font-semibold tracking-tight text-[#315779]"
                        >
                            Hapus data dokter?
                        </h2>

                        <p
                            id="deskripsi-hapus"
                            className="mt-4 text-sm leading-7 text-[#7196bb]"
                        >
                            Apakah kamu yakin ingin menghapus dokter{" "}

                            <strong className="font-semibold text-[#315779]">
                                {hapusTarget.full_name ||
                                    hapusTarget.nama_dokter ||
                                    hapusTarget.username}
                            </strong>

                            ? Data yang telah dihapus tidak dapat
                            dikembalikan.
                        </p>

                        <div className="mt-5 rounded-2xl border border-[#b8d1e9]/40 bg-[#eaf3fc]/70 p-4">

                            <p className="text-[10px] tracking-wider text-[#83a5c7]">
                                INFORMASI DOKTER
                            </p>

                            <p className="mt-2 text-sm font-medium text-[#315779]">
                                {hapusTarget.full_name ||
                                    hapusTarget.username}
                            </p>

                            <p className="mt-1 text-xs text-[#7196bb]">
                                {hapusTarget.nama_poli ||
                                    hapusTarget.poli ||
                                    "-"}
                            </p>

                        </div>

                        {hapusError && (
                            <div
                                role="alert"
                                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                            >
                                {hapusError}
                            </div>
                        )}

                        <div className="mt-8 flex gap-3">

                            <button
                                type="button"
                                autoFocus
                                onClick={batalHapus}
                                disabled={deleting}
                                className="flex-1 rounded-full border border-[#b8d1e9]/60 bg-[#eaf3fc] px-5 py-3 text-sm font-medium text-[#52799f] transition hover:bg-[#d5e9fb] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleHapus}
                                disabled={deleting}
                                className="flex-1 rounded-full bg-[#CE7B84] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-rose-200/50 transition hover:bg-[#b96770] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting
                                    ? "Menghapus..."
                                    : "Ya, Hapus"}
                            </button>

                        </div>

                    </>
                )}

            </dialog>

        </main>
    );
}
