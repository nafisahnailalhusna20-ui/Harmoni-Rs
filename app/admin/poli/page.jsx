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
                throw new Error(
                    hasil.message || "Data poli gagal dimuat."
                );
            }

            setDaftarPoli(
                Array.isArray(hasil.data) ? hasil.data : []
            );
        } catch (error) {
            console.error("Gagal mengambil data poli:", error);
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

                if (aktif) {
                    await ambilPoli();
                }
            } catch (error) {
                console.error("Gagal memeriksa sesi:", error);
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

                    // Tetap menjaga kompatibilitas API lama.
                    // Ikon tidak lagi ditampilkan di form.
                    ikon: poliDipilih?.ikon || "",
                }),
            });

            const hasil = await response.json();

            if (!response.ok) {
                setPesan(
                    hasil.message || "Data gagal disimpan."
                );
                return;
            }

            setTampilForm(false);
            setPoliDipilih(null);

            setForm({
                nama: "",
                deskripsi: "",
            });

            await ambilPoli();
        } catch (error) {
            console.error("Gagal menyimpan poli:", error);
            setPesan(
                "Terjadi kesalahan saat menyimpan data."
            );
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
            const response = await fetch(
                `/api/admin/poli/${id}`,
                {
                    method: "DELETE",
                }
            );

            const hasil = await response.json();

            if (!response.ok) {
                window.alert(
                    hasil.message || "Data gagal dihapus."
                );
                return;
            }

            await ambilPoli();
        } catch (error) {
            console.error("Gagal menghapus poli:", error);

            window.alert("Data poli gagal dihapus.");
        } finally {
            setMenghapus(null);
        }
    }

    const inputClass =
        "w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496f] shadow-[inset_0_1px_3px_rgba(255,255,255,.9),0_8px_24px_rgba(83,125,170,.06)] outline-none transition placeholder:text-[#8da8c9] focus:border-[#8bb9e8] focus:bg-white/90 focus:ring-4 focus:ring-[#b8d9f5]/35";

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#eaf3fc] text-[#29496f]">

            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-36 -top-40 h-[480px] w-[480px] rounded-full bg-white/75 blur-[90px]" />

                <div className="absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-[#a9cfee]/45 blur-[100px]" />

                <div className="absolute bottom-[-230px] left-[28%] h-[520px] w-[680px] rounded-full bg-[#d4e7f8]/80 blur-[100px]" />

                <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-transparent to-[#9fc4e8]/20" />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/70 bg-white/45 backdrop-blur-2xl">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="group text-left"
                    >
                        <span className="block text-[25px] font-semibold tracking-[0.19em] text-[#345b86] transition group-hover:text-[#5b8fc1]">
                            HARMONI
                        </span>

                        <span className="mt-1 block text-[10px] tracking-[0.22em] text-[#7898bd] sm:text-xs">
                            HOSPITAL INFORMATION SYSTEM
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/admin")}
                        className="rounded-full border border-white/80 bg-white/45 px-4 py-2.5 text-xs font-medium text-[#52769e] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80 sm:px-5 sm:text-sm"
                    >
                        <span className="mr-2">←</span>
                        Kembali ke dashboard
                    </button>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-[1500px] px-5 pb-10 pt-8 sm:px-8 sm:pt-12 lg:px-12">

                {/* Hero: mengikuti susunan halaman Dokter */}
                <section className="mb-12 flex flex-col justify-between gap-10 md:flex-row md:items-center">

                    {/* Hero kiri */}
                    <div className="max-w-3xl">
                        <p className="mb-5 text-[10px] font-semibold tracking-[0.24em] text-[#7a9fc7] sm:text-xs">
                            ADMINISTRATION / MASTER DATA
                        </p>

                        <h1 className="text-4xl font-light leading-[1.12] tracking-[-0.04em] text-[#31577f] sm:text-5xl lg:text-6xl">
                            Ruang pelayanan
                            <br />

                            <span className="font-medium text-[#7099c3]">
                                HARMONI.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-[#7794b6] sm:text-base">
                            Kelola informasi poli sebagai bagian dari
                            pelayanan rumah sakit yang terintegrasi.
                        </p>
                    </div>

                    {/* Hero kanan: nomor besar + tombol */}
                    <div className="relative flex w-full flex-col items-start justify-center md:w-[330px] md:shrink-0 md:items-end md:text-right">

                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-2 top-[-65px] select-none text-[190px] font-semibold leading-none tracking-[-0.1em] text-[#5d91c4]/10 sm:text-[220px]"
                        >
                            01
                        </span>

                        <div className="relative z-10">
                            <p className="text-[10px] font-medium tracking-[0.2em] text-[#7f9fc3] sm:text-xs">
                                POLI DIRECTORY
                            </p>

                            <p className="mt-3 max-w-[260px] text-base leading-7 text-[#4e739c]">
                                Semua unit pelayanan,
                                <br className="hidden md:block" />
                                tersusun dengan rapi.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => bukaForm()}
                            className="relative z-10 mt-7 inline-flex min-h-14 w-full items-center justify-center gap-4 rounded-[22px] border border-white/35 bg-gradient-to-br from-[#315981] to-[#6b9ec9] px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(61,105,151,.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(61,105,151,.30)] active:translate-y-0 md:w-[290px]"
                        >
                            <span className="text-lg">＋</span>

                            Tambah poli

                            <span className="ml-auto text-base">
                                ↗
                            </span>
                        </button>
                    </div>
                </section>

                {/* Daftar poli */}
                <section className="rounded-[30px] border border-white/75 bg-white/45 p-4 shadow-[0_25px_80px_rgba(76,117,161,.12)] backdrop-blur-2xl sm:rounded-[36px] sm:p-7 lg:p-9">

                    {/* Judul daftar dan total poli */}
                    <div className="flex flex-col justify-between gap-5 border-b border-[#c9dced]/70 pb-6 sm:flex-row sm:items-center">

                        <div>
                            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#8aa8c9]">
                                <span className="text-[#527da8]">
                                    01
                                </span>

                                <span className="h-px w-5 bg-[#c4d9ec]" />

                                DIRECTORY
                            </p>

                            <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#345b84] sm:text-3xl">
                                Daftar poli
                            </h2>

                            <p className="mt-2 text-sm text-[#829fbe]">
                                Unit pelayanan yang tersedia di HARMONI.
                            </p>
                        </div>

                        {/* Jumlah poli, seperti jumlah dokter */}
                        <div className="flex items-center gap-4 border-l border-[#c9dced]/80 pl-5">
                            <span className="text-4xl font-light tracking-tight text-[#527da8]">
                                {daftarPoli.length}
                            </span>

                            <div>
                                <p className="text-sm text-[#7798bc]">
                                    poli terdaftar
                                </p>

                                <p className="mt-1 text-xs text-[#91a9c5]">
                                    Data master rumah sakit
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mt-6 overflow-hidden rounded-[22px] border border-white/80 bg-white/55 shadow-[0_10px_35px_rgba(83,122,164,.07)]">

                        {loading ? (
                            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-sm text-[#829fbe]">
                                <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#c8dced] border-t-[#5d8fbe]" />

                                Memuat data poli...
                            </div>
                        ) : pesan && daftarPoli.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-[#7897b8]">
                                    {pesan}
                                </p>

                                <button
                                    type="button"
                                    onClick={ambilPoli}
                                    className="mt-4 text-sm font-medium text-[#4778a5] underline underline-offset-4"
                                >
                                    Coba muat ulang
                                </button>
                            </div>
                        ) : daftarPoli.length === 0 ? (
                            <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
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
                                <table className="w-full min-w-[680px] border-collapse text-left">

                                    <thead>
                                        <tr className="bg-[#eaf3fb]/75 text-[10px] font-semibold tracking-[0.16em] text-[#7898bb]">
                                            <th className="w-20 px-5 py-5">
                                                NO.
                                            </th>

                                            <th className="min-w-48 px-5 py-5">
                                                UNIT PELAYANAN
                                            </th>

                                            <th className="px-5 py-5">
                                                DESKRIPSI
                                            </th>

                                            <th className="w-44 px-5 py-5 text-right">
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
                                                <td className="px-5 py-5 text-xs tabular-nums text-[#a0b5cc]">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#80a9d2] shadow-[0_0_0_4px_rgba(128,169,210,.13)]" />

                                                        <span className="text-sm font-medium text-[#45698f]">
                                                            {poli.nama}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="max-w-[520px] px-5 py-5 text-sm leading-6 text-[#819bb8]">
                                                    {poli.deskripsi || "—"}
                                                </td>

                                                <td className="px-5 py-5">
                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                bukaForm(poli)
                                                            }
                                                            className="rounded-xl border border-[#d5e6f5] bg-[#edf5fc] px-3.5 py-2 text-xs font-medium text-[#5d86b1] transition hover:border-[#a9cce9] hover:bg-white"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                hapusPoli(poli.id)
                                                            }
                                                            disabled={
                                                                menghapus === poli.id
                                                            }
                                                            className="rounded-xl border border-[#f0dce1] bg-[#fff5f6]/80 px-3.5 py-2 text-xs font-medium text-[#b77d8b] transition hover:bg-[#ffeaee] disabled:opacity-50"
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
                <footer className="flex flex-col justify-between gap-2 px-2 pt-7 text-[10px] tracking-[0.12em] text-[#91abc7] sm:flex-row">
                    <span>HARMONI · 2026</span>

                    <span>CARE THROUGH CONNECTION</span>
                </footer>
            </div>

            {/* Form tambah / edit */}
            {tampilForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#28496c]/25 px-4 py-8 backdrop-blur-md"
                    onClick={tutupForm}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="form-poli-title"
                        className="my-auto w-full max-w-xl rounded-[30px] border border-white/80 bg-[#f5f9fe]/90 p-6 shadow-[0_30px_100px_rgba(39,75,116,.25)] backdrop-blur-2xl sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#8aa8c9]">
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
                                    className="mb-2 block text-xs font-medium text-[#55789e]"
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
                                    className="mb-2 block text-xs font-medium text-[#55789e]"
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
                                    className="rounded-2xl border border-[#d7e5f2] bg-white/60 px-5 py-3 text-sm text-[#7793b1] transition hover:bg-white disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-2xl bg-gradient-to-r from-[#315981] to-[#6598c4] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_25px_rgba(61,105,151,.2)] transition hover:-translate-y-0.5 disabled:opacity-50"
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