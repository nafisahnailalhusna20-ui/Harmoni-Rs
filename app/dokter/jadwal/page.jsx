"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JadwalDokterPage() {
    const router = useRouter();

    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [menyimpan, setMenyimpan] = useState(false);

    const [form, setForm] = useState({
        hari: "1",
        jam_mulai: "09:00",
        durasi: "60",
    });

    const daftarHari = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu",
    ];

    async function ambilJadwal() {
        setLoading(true);
        setPesan("");

        try {
            const response = await fetch("/api/dokter/jadwal");
            const data = await response.json();

            if (!response.ok || !data.success) {
                setPesan(data.message || "Jadwal gagal dimuat.");
                return;
            }

            setJadwal(data.data || []);
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat mengambil jadwal.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilJadwal();
    }, []);

    function bukaTambah() {
        setEditId(null);
        setForm({
            hari: "1",
            jam_mulai: "09:00",
            durasi: "60",
        });
        setModalOpen(true);
    }

    function bukaEdit(item) {
        setEditId(item.id);
        setForm({
            hari: String(item.hari),
            jam_mulai: String(item.jam_mulai).slice(0, 5),
            durasi: String(item.durasi),
        });
        setModalOpen(true);
    }

    async function simpanJadwal(e) {
        e.preventDefault();
        setMenyimpan(true);
        setPesan("");

        try {
            const response = await fetch(
                editId
                    ? `/api/dokter/jadwal/${editId}`
                    : "/api/dokter/jadwal",
                {
                    method: editId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        hari: Number(form.hari),
                        jam_mulai: form.jam_mulai,
                        durasi: Number(form.durasi),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setPesan(data.message || "Jadwal gagal disimpan.");
                return;
            }

            setModalOpen(false);
            await ambilJadwal();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat menyimpan jadwal.");
        } finally {
            setMenyimpan(false);
        }
    }

    async function hapusJadwal(id) {
        const yakin = window.confirm(
            "Yakin ingin menghapus jadwal praktik ini?"
        );

        if (!yakin) return;

        try {
            const response = await fetch(
                `/api/dokter/jadwal/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                setPesan(data.message || "Jadwal gagal dihapus.");
                return;
            }

            await ambilJadwal();
        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat menghapus jadwal.");
        }
    }

    function formatJam(jam) {
        return String(jam).slice(0, 5).replace(":", ".");
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f7fbff] via-[#e5f3ff] to-[#c9e5fa] px-5 py-8 sm:px-8 lg:px-10">

            {/* Background dekorasi */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#a9d5f5]/45 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-white/70 blur-[100px]" />

            <div className="relative mx-auto max-w-7xl">

                {/* Header */}
                <header className="flex flex-col justify-between gap-5 border-b border-[#8eb6d7]/30 pb-6 sm:flex-row sm:items-center">

                    <div>
                        <p className="text-[11px] font-bold tracking-[0.22em] text-[#7198bb]">
                            HARMONI HEALTHCARE
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#234766] sm:text-4xl">
                            Jadwal Praktik Saya
                        </h1>

                        <p className="mt-2 text-sm text-[#7898b7]">
                            Kelola hari dan waktu praktik dalam satu ruang kerja.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/dokter")}
                        className="rounded-full border border-white/80 bg-white/55 px-5 py-3 text-sm font-semibold text-[#52799c] shadow-sm backdrop-blur-xl transition hover:bg-white/80"
                    >
                        ← Dashboard
                    </button>
                </header>

                {/* Hero */}
                <section className="mt-7 rounded-[30px] border border-white/75 bg-gradient-to-br from-white/70 via-white/40 to-[#c6e0f5]/50 p-6 shadow-[0_25px_70px_rgba(76,117,161,.10)] backdrop-blur-2xl sm:p-9">

                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-[#7198bb]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#83b7df]" />
                                DOCTOR WORKSPACE
                            </span>

                            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#234766] sm:text-4xl">
                                Waktu praktik,
                                <br />
                                <span className="font-medium text-[#7099c3]">
                                    dalam kendali Anda.
                                </span>
                            </h2>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-[#7393b2]">
                                Atur jadwal konsultasi agar pasien dapat
                                melihat ketersediaan waktu praktik Anda.
                            </p>
                        </div>

                        <div className="flex min-w-[190px] flex-col items-start rounded-[25px] border border-white/75 bg-white/40 p-5 shadow-sm backdrop-blur-xl md:items-end">

                            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#7f9fc3]">
                                JADWAL TERDAFTAR
                            </p>

                            <p className="mt-2 text-5xl font-light tracking-tight text-[#477ba7]">
                                {String(jadwal.length).padStart(2, "0")}
                            </p>

                            <button
                                type="button"
                                onClick={bukaTambah}
                                className="mt-4 rounded-full bg-gradient-to-r from-[#477da9] to-[#76a8d2] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(71,125,169,.25)] transition hover:-translate-y-0.5"
                            >
                                + Tambah Jadwal
                            </button>
                        </div>
                    </div>
                </section>

                {/* Daftar jadwal */}
                <section className="mt-8 rounded-[30px] border border-white/75 bg-white/45 p-5 shadow-[0_25px_70px_rgba(76,117,161,.10)] backdrop-blur-2xl sm:p-8">

                    <div className="flex flex-col justify-between gap-4 border-b border-[#c9dced]/60 pb-6 sm:flex-row sm:items-center">

                        <div>
                            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#8aa8c9]">
                                SCHEDULE DIRECTORY
                            </p>

                            <h2 className="mt-2 text-2xl font-medium text-[#345b84]">
                                Daftar jadwal praktik
                            </h2>

                            <p className="mt-2 text-sm text-[#829fbe]">
                                Jadwal yang tersimpan pada akun dokter Anda.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={ambilJadwal}
                            className="rounded-full border border-white/80 bg-white/60 px-5 py-3 text-sm font-semibold text-[#527da8] shadow-sm transition hover:bg-white/90"
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {pesan && (
                        <div className="mt-5 rounded-2xl border border-[#f0cdd5] bg-[#fff5f7]/80 px-4 py-3 text-sm text-[#b66e83]">
                            {pesan}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex min-h-[250px] items-center justify-center text-sm text-[#819fbb]">
                            Memuat jadwal praktik...
                        </div>
                    ) : jadwal.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white bg-white/60 text-2xl text-[#7da9d0] shadow-sm">
                                01
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-[#345b84]">
                                Belum ada jadwal praktik
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-[#829fbe]">
                                Tambahkan jadwal praktik pertama Anda
                                melalui tombol Tambah Jadwal.
                            </p>

                            <button
                                type="button"
                                onClick={bukaTambah}
                                className="mt-5 rounded-full bg-[#477da9] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#376b98]"
                            >
                                + Buat Jadwal Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {jadwal.map((item) => (
                                <article
                                    key={item.id}
                                    className="group rounded-[25px] border border-white/80 bg-gradient-to-br from-white/75 to-[#eaf5fd]/70 p-5 shadow-[0_12px_35px_rgba(76,117,161,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(76,117,161,.14)]"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div>
                                            <p className="text-[10px] font-semibold tracking-[0.17em] text-[#8aa8c9]">
                                                HARI PRAKTIK
                                            </p>

                                            <h3 className="mt-2 text-2xl font-semibold text-[#315879]">
                                                {daftarHari[Number(item.hari) - 1] || "-"}
                                            </h3>
                                        </div>

                                        <span className="rounded-full border border-[#d6e9f8] bg-white/65 px-3 py-1.5 text-[10px] font-semibold text-[#6c9bc4]">
                                            AKTIF
                                        </span>
                                    </div>

                                    <div className="mt-5 rounded-[20px] border border-white/80 bg-gradient-to-br from-white/70 to-[#dceefa]/70 p-4">

                                        <p className="text-[10px] font-semibold tracking-[0.15em] text-[#8aa8c9]">
                                            WAKTU PRAKTIK
                                        </p>

                                        <p className="mt-2 text-3xl font-medium tracking-tight text-[#477ba7]">
                                            {formatJam(item.jam_mulai)}
                                        </p>

                                        <p className="mt-1 text-xs text-[#829fbe]">
                                            {item.durasi} menit
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-b border-[#d5e5f3]/70 pb-4 text-sm">
                                        <span className="text-[#829fbe]">
                                            Poli
                                        </span>

                                        <span className="font-semibold text-[#52769e]">
                                            {item.nama_poli || "-"}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex gap-3">

                                        <button
                                            type="button"
                                            onClick={() => bukaEdit(item)}
                                            className="flex-1 rounded-xl border border-[#d5e5f4] bg-white/65 px-4 py-2.5 text-xs font-semibold text-[#527da8] transition hover:bg-white"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => hapusJadwal(item.id)}
                                            className="flex-1 rounded-xl border border-[#f0dce1] bg-[#fff5f6]/70 px-4 py-2.5 text-xs font-semibold text-[#b77d8b] transition hover:bg-[#ffeaee]"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </article>
                            ))}

                        </div>
                    )}

                    <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#c9dced]/60 pt-5 text-[10px] tracking-[0.12em] text-[#91abc7] sm:flex-row">
                        <span>HARMONI · DOCTOR WORKSPACE</span>
                        <span>PERSONAL PRACTICE SCHEDULE</span>
                    </footer>
                </section>
            </div>

            {/* Modal tambah / edit */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#28496c]/25 px-4 py-8 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setModalOpen(false);
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-xl rounded-[30px] border border-white/80 bg-[#f5f9fe]/90 p-6 shadow-[0_30px_100px_rgba(39,75,116,.25)] backdrop-blur-2xl sm:p-8">

                        <div className="flex items-start justify-between gap-4">

                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#8aa8c9]">
                                    SCHEDULE MANAGEMENT
                                </p>

                                <h2 className="mt-2 text-2xl font-medium text-[#365d85]">
                                    {editId ? "Edit jadwal" : "Jadwal baru"}
                                </h2>

                                <p className="mt-2 text-sm text-[#8aa3bf]">
                                    Lengkapi informasi waktu praktik.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-white/70 text-xl text-[#7798ba] transition hover:bg-white"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={simpanJadwal} className="mt-7 space-y-5">

                            <div>
                                <label className="mb-2 block text-xs font-medium text-[#55789e]">
                                    Hari praktik
                                </label>

                                <select
                                    value={form.hari}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            hari: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496f] outline-none focus:border-[#8bb9e8] focus:ring-4 focus:ring-[#b8d9f5]/35"
                                >
                                    {daftarHari.map((hari, index) => (
                                        <option key={hari} value={index + 1}>
                                            {hari}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-[#55789e]">
                                    Jam mulai
                                </label>

                                <input
                                    type="time"
                                    required
                                    value={form.jam_mulai}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            jam_mulai: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496f] outline-none focus:border-[#8bb9e8] focus:ring-4 focus:ring-[#b8d9f5]/35"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-[#55789e]">
                                    Durasi praktik
                                </label>

                                <select
                                    value={form.durasi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            durasi: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-sm text-[#29496f] outline-none focus:border-[#8bb9e8] focus:ring-4 focus:ring-[#b8d9f5]/35"
                                >
                                    <option value="30">30 menit</option>
                                    <option value="45">45 menit</option>
                                    <option value="60">60 menit</option>
                                    <option value="90">90 menit</option>
                                    <option value="120">120 menit</option>
                                    <option value="180">180 menit</option>
                                    <option value="240">240 menit</option>
                                </select>
                            </div>

                            {pesan && (
                                <p className="rounded-xl bg-[#fff1f4] px-4 py-3 text-sm text-[#b66e83]">
                                    {pesan}
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-[#d5e5f4] bg-white/65 px-5 py-3 text-sm font-semibold text-[#7798ba] transition hover:bg-white"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="rounded-xl bg-gradient-to-r from-[#477da9] to-[#76a8d2] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(71,125,169,.22)] transition hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {menyimpan
                                        ? "Menyimpan..."
                                        : editId
                                        ? "Simpan Perubahan"
                                        : "Simpan Jadwal"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}