"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PoliPage() {
    const router = useRouter();

    const [daftarPoli, setDaftarPoli] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [poliDipilih, setPoliDipilih] = useState(null);
    const [pesan, setPesan] = useState("");
    const [menyimpan, setMenyimpan] = useState(false);
    const [menghapus, setMenghapus] = useState(null);

    const [form, setForm] = useState({
        nama: "",
        deskripsi: "",
        ikon: "",
    });

    const ambilPoli = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/poli");
            const hasil = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok || !hasil.success) {
                throw new Error(hasil.message || "Data poli gagal dimuat.");
            }

            setDaftarPoli(Array.isArray(hasil.data) ? hasil.data : []);
        } catch (error) {
            console.error(error);
            setPesan(error.message || "Data poli gagal dimuat.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        let aktif = true;

        async function cekAdmin() {
            try {
                const response = await fetch("/api/me");
                const hasil = await response.json();

                if (!response.ok || hasil.user?.role !== "admin") {
                    router.replace("/login");
                    return;
                }

                if (aktif) await ambilPoli();
            } catch (error) {
                console.error(error);
                router.replace("/login");
            }
        }

        cekAdmin();

        return () => {
            aktif = false;
        };
    }, [router, ambilPoli]);

    function bukaForm(poli = null) {
        setPoliDipilih(poli);

        setForm({
            nama: poli?.nama || "",
            deskripsi: poli?.deskripsi || "",
            ikon: poli?.ikon || "",
        });

        setPesan("");
        setTampilForm(true);
    }

    function tutupForm() {
        if (menyimpan) return;

        setTampilForm(false);
        setPoliDipilih(null);
        setPesan("");
    }

    async function simpanPoli(e) {
        e.preventDefault();

        if (menyimpan) return;

        setMenyimpan(true);
        setPesan("");

        try {
            const url = poliDipilih
                ? `/api/admin/poli/${poliDipilih.id}`
                : "/api/admin/poli";

            const response = await fetch(url, {
                method: poliDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama: form.nama.trim(),
                    deskripsi: form.deskripsi.trim(),
                    ikon: form.ikon.trim(),
                }),
            });

            const hasil = await response.json();

            if (!response.ok) {
                setPesan(hasil.message || "Data gagal disimpan.");
                return;
            }

            setTampilForm(false);
            setPoliDipilih(null);
            setForm({
                nama: "",
                deskripsi: "",
                ikon: "",
            });

            await ambilPoli();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setMenyimpan(false);
        }
    }

    async function hapusPoli(id) {
        const yakin = window.confirm(
            "Yakin ingin menghapus data poli ini?"
        );

        if (!yakin) return;

        setMenghapus(id);

        try {
            const response = await fetch(`/api/admin/poli/${id}`, {
                method: "DELETE",
            });

            const hasil = await response.json();

            if (!response.ok) {
                alert(hasil.message || "Data gagal dihapus.");
                return;
            }

            await ambilPoli();
        } catch (error) {
            console.error(error);
            alert("Data poli gagal dihapus.");
        } finally {
            setMenghapus(null);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#345b84] shadow-sm outline-none transition placeholder:text-[#91a9c5] focus:border-[#8bb9e8] focus:ring-4 focus:ring-[#b8d9f5]/30";

    return (
        <main className="relative min-h-screen overflow-x-hidden bg-[#eaf3fc] text-[#345b84]">

            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-white/70 blur-[90px]" />
                <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-[#b8d7f2]/40 blur-[100px]" />
                <div className="absolute bottom-[-200px] left-[25%] h-[500px] w-[650px] rounded-full bg-[#d7e9f9]/70 blur-[100px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#9fc4e8]/15" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/70 bg-white/40 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1420px] items-center justify-between gap-4 px-6 py-5 sm:px-10 lg:px-12">

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="flex items-center gap-4 text-left"
                    >
                        <span className="text-[25px] font-semibold tracking-[0.19em] text-[#345b86]">
                            HARMONI
                        </span>

                        <span className="hidden h-5 w-px bg-[#c9dced] sm:block" />

                        <span className="hidden text-xs tracking-[0.12em] text-[#7898bd] sm:block">
                            Hospital Information System
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="rounded-full border border-white/80 bg-white/50 px-4 py-2.5 text-xs text-[#52769e] shadow-sm transition hover:bg-white/80 sm:px-5 sm:text-sm"
                    >
                        <span className="mr-2">←</span>
                        Dashboard
                    </button>
                </div>
            </header>

            <div className="relative z-10 mx-auto w-full max-w-[1420px] px-6 pb-10 pt-8 sm:px-10 lg:px-12">

                {/* Hero */}
                <section className="mb-9 grid gap-8 md:grid-cols-[minmax(0,1fr)_270px] md:items-center lg:mb-10">

                    <div className="min-w-0">
                        <p className="mb-5 text-sm leading-7 text-[#7794b6] sm:text-base">
                            Tempat mengenal unit-unit<br className="hidden sm:block" />
                            di balik pelayanan rumah sakit.
                        </p>

                        <h1 className="text-[clamp(3.2rem,5.5vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#294b72]">
                            Ruang pelayanan
                            <br />
                            <span className="font-normal text-[#75a1ce]">
                                HARMONI.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-[600px] text-sm leading-7 text-[#7794b6] sm:text-base">
                            Kelola informasi poli sebagai bagian dari pelayanan
                            rumah sakit yang terintegrasi.
                        </p>
                    </div>

                    {/* Directory side */}
                    <div className="relative flex flex-col items-end py-4 text-right">

                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute right-0 top-[-30px] text-[118px] font-light leading-none tracking-[-0.08em] text-[#6d9fce]/15"
                        >
                            01
                        </span>

                        <div className="relative z-10 w-full max-w-[270px]">
                            <p className="text-[10px] tracking-[0.2em] text-[#7e9fc3] sm:text-xs">
                                POLI DIRECTORY
                            </p>

                            <p className="mt-3 text-sm leading-6 text-[#52779f] sm:text-base">
                                Semua unit pelayanan,
                                tersusun dengan rapi.
                            </p>

                            <button
                                type="button"
                                onClick={() => bukaForm()}
                                className="mt-5 flex h-[62px] w-full items-center justify-between rounded-[20px] border border-white/30 bg-gradient-to-r from-[#315981] to-[#6a9dc8] px-5 text-sm font-medium text-white shadow-[0_10px_25px_rgba(61,105,151,.18)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                            >
                                <span className="text-lg font-normal">+</span>
                                <span>Tambah poli</span>
                                <span aria-hidden="true">↗</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Main directory panel */}
                <section className="rounded-[28px] border border-white/75 bg-white/45 p-5 shadow-[0_18px_50px_rgba(76,117,161,.09)] backdrop-blur-2xl sm:p-7 lg:p-8">

                    {/* Panel heading */}
                    <div className="flex flex-col justify-between gap-5 border-b border-[#c9dced]/70 pb-5 sm:flex-row sm:items-center">

                        <div>
                            <p className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-[#8aa8c9]">
                                <span className="text-[#527da8]">01</span>
                                <span className="h-px w-5 bg-[#c4d9ec]" />
                                DIRECTORY
                            </p>

                            <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#345b84]">
                                Daftar poli
                            </h2>

                            <p className="mt-1.5 text-sm text-[#829fbe]">
                                Unit pelayanan yang tersedia di HARMONI.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:border-l sm:border-[#c9dced] sm:pl-6">
                            <span className="text-4xl font-light tracking-tight text-[#527da8]">
                                {daftarPoli.length}
                            </span>

                            <div>
                                <p className="text-xs text-[#7898bb]">
                                    poli terdaftar
                                </p>
                                <p className="mt-1 text-xs text-[#91a9c5]">
                                    Data master rumah sakit
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mt-5 overflow-hidden rounded-[20px] border border-white/80 bg-white/50">

                        {loading ? (
                            <div className="flex min-h-48 items-center justify-center text-sm text-[#829fbe]">
                                Memuat data poli...
                            </div>
                        ) : pesan && daftarPoli.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-sm text-[#7897b8]">
                                    {pesan}
                                </p>

                                <button
                                    type="button"
                                    onClick={ambilPoli}
                                    className="mt-4 text-sm text-[#4778a5] underline underline-offset-4"
                                >
                                    Coba muat ulang
                                </button>
                            </div>
                        ) : daftarPoli.length === 0 ? (
                            <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
                                <p className="text-lg font-medium text-[#456b94]">
                                    Belum ada data poli
                                </p>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-[#8aa5c2]">
                                    Tambahkan poli pertama untuk mulai
                                    mengelola data pelayanan.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] border-collapse text-left">

                                    <thead>
                                        <tr className="bg-[#eaf3fb]/75 text-[10px] font-medium tracking-[0.15em] text-[#7898bb]">
                                            <th className="w-20 px-5 py-4">
                                                NO.
                                            </th>
                                            <th className="min-w-48 px-5 py-4">
                                                UNIT PELAYANAN
                                            </th>
                                            <th className="px-5 py-4">
                                                DESKRIPSI
                                            </th>
                                            <th className="w-40 px-5 py-4 text-right">
                                                AKSI
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {daftarPoli.map((poli, index) => (
                                            <tr
                                                key={poli.id}
                                                className="border-t border-[#dce8f4]/80 transition hover:bg-white/65"
                                            >
                                                <td className="px-5 py-4 text-xs tabular-nums text-[#a0b5cc]">
                                                    {String(index + 1).padStart(2, "0")}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#80a9d2]" />

                                                        <span className="text-sm font-medium text-[#45698f]">
                                                            {poli.nama}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="max-w-[500px] px-5 py-4 text-sm leading-6 text-[#819bb8]">
                                                    {poli.deskripsi || "—"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => bukaForm(poli)}
                                                            className="rounded-lg border border-[#d5e6f5] bg-[#edf5fc] px-3 py-2 text-xs text-[#5d86b1] transition hover:bg-white"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => hapusPoli(poli.id)}
                                                            disabled={menghapus === poli.id}
                                                            className="rounded-lg border border-[#f0dce1] bg-[#fff5f6]/80 px-3 py-2 text-xs text-[#b77d8b] transition hover:bg-[#ffeaee] disabled:opacity-50"
                                                        >
                                                            {menghapus === poli.id
                                                                ? "..."
                                                                : "Hapus"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="flex flex-col justify-between gap-2 px-2 pt-5 text-[10px] tracking-[0.12em] text-[#91abc7] sm:flex-row">
                    <span>HARMONI · 2026</span>
                    <span>CARE THROUGH CONNECTION</span>
                </footer>
            </div>

            {/* Modal form */}
            {tampilForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#28496c]/30 px-4 py-8 backdrop-blur-md"
                    onClick={tutupForm}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-poli-title"
                        className="my-auto w-full max-w-xl rounded-[28px] border border-white/80 bg-[#f5f9fe]/90 p-6 shadow-[0_30px_90px_rgba(39,75,116,.22)] backdrop-blur-2xl sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-medium tracking-[0.2em] text-[#8aa8c9]">
                                    MASTER DATA / POLI
                                </p>

                                <h3
                                    id="form-poli-title"
                                    className="mt-2 text-2xl font-medium text-[#365d85]"
                                >
                                    {poliDipilih
                                        ? "Perbarui poli"
                                        : "Poli baru"}
                                </h3>

                                <p className="mt-2 text-sm text-[#8aa3bf]">
                                    Lengkapi informasi unit pelayanan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={tutupForm}
                                disabled={menyimpan}
                                aria-label="Tutup form"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/70 text-xl text-[#7798ba] transition hover:bg-white disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={simpanPoli}
                            className="mt-7 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="nama-poli"
                                    className="mb-2 block text-xs text-[#55789e]"
                                >
                                    Nama poli
                                </label>

                                <input
                                    id="nama-poli"
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nama: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Poli THT"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="deskripsi-poli"
                                    className="mb-2 block text-xs text-[#55789e]"
                                >
                                    Deskripsi
                                </label>

                                <textarea
                                    id="deskripsi-poli"
                                    value={form.deskripsi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            deskripsi: e.target.value,
                                        })
                                    }
                                    placeholder="Jelaskan layanan yang tersedia di poli ini"
                                    rows={4}
                                    className={`${inputClass} resize-y`}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="ikon-poli"
                                    className="mb-2 block text-xs text-[#55789e]"
                                >
                                    Ikon{" "}
                                    <span className="text-[#9bb0c8]">
                                        (opsional)
                                    </span>
                                </label>

                                <input
                                    id="ikon-poli"
                                    type="text"
                                    value={form.ikon}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            ikon: e.target.value,
                                        })
                                    }
                                    placeholder="Nama ikon atau URL gambar"
                                    className={inputClass}
                                />
                            </div>

                            {pesan && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-[#f0d9df] bg-[#fff3f5] px-4 py-3 text-sm text-[#b36f7e]"
                                >
                                    {pesan}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={tutupForm}
                                    disabled={menyimpan}
                                    className="rounded-xl border border-[#d7e5f2] bg-white/60 px-5 py-3 text-sm text-[#7793b1] transition hover:bg-white disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-xl bg-gradient-to-r from-[#315981] to-[#6598c4] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_22px_rgba(61,105,151,.18)] transition hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {menyimpan
                                        ? "Menyimpan..."
                                        : poliDipilih
                                            ? "Simpan perubahan"
                                            : "Tambah poli"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}