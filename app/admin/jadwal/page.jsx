"use client";

import { useEffect, useState } from "react";

export default function JadwalPage() {
    const [jadwal, setJadwal] = useState([]);
    const [dokter, setDokter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [jadwalDipilih, setJadwalDipilih] = useState(null);
    const [pesan, setPesan] = useState("");
    const [loadingStatus, setLoadingStatus] = useState(null);

    const formAwal = {
        dokter_id: "",
        hari: "",
        jam_mulai: ""
    };

    const [form, setForm] = useState(formAwal);

    const daftarHari = [
        { id: 1, nama: "Senin" },
        { id: 2, nama: "Selasa" },
        { id: 3, nama: "Rabu" },
        { id: 4, nama: "Kamis" },
        { id: 5, nama: "Jumat" },
        { id: 6, nama: "Sabtu" },
        { id: 7, nama: "Minggu" }
    ];

    async function ambilData() {
        try {
            const [resJadwal, resDokter] = await Promise.all([
                fetch("/api/admin/jadwal"),
                fetch("/api/admin/dokter")
            ]);

            const dataJadwal = await resJadwal.json();
            const dataDokter = await resDokter.json();

            if (dataJadwal.success) {
                setJadwal(dataJadwal.data);
            }

            if (dataDokter.success) {
                setDokter(dataDokter.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setPesan("Data jadwal gagal dimuat.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function bukaTambah() {
        setJadwalDipilih(null);
        setForm(formAwal);
        setPesan("");
        setTampilForm(true);
    }

    function bukaEdit(item) {
        setJadwalDipilih(item);

        setForm({
            dokter_id: String(item.dokter_id),
            hari: String(item.hari),
            jam_mulai: String(item.jam_mulai).slice(0, 5)
        });

        setPesan("");
        setTampilForm(true);
    }

    function keteranganJam(jam) {
        if (!jam) return "";

        const angkaJam = Number(jam.split(":")[0]);

        if (angkaJam >= 4 && angkaJam < 11) return "Pagi";
        if (angkaJam >= 11 && angkaJam < 15) return "Siang";
        if (angkaJam >= 15 && angkaJam < 18) return "Sore";

        return "Malam";
    }

    async function simpanJadwal(e) {
        e.preventDefault();
        setPesan("");

        try {
            const url = jadwalDipilih
                ? `/api/admin/jadwal/${jadwalDipilih.id}`
                : "/api/admin/jadwal";

            const response = await fetch(url, {
                method: jadwalDipilih ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Jadwal gagal disimpan.");
                return;
            }

            setPesan(data.message);
            setTampilForm(false);
            setJadwalDipilih(null);
            setForm(formAwal);

            await ambilData();
        } catch (error) {
            console.error("Simpan jadwal:", error);
            setPesan("Terjadi kesalahan saat menyimpan jadwal.");
        }
    }

    async function ubahStatusJadwal(item) {
        const statusBaru = !item.is_active;

        const konfirmasi = confirm(
            statusBaru
                ? "Aktifkan kembali jadwal dokter ini?"
                : "Nonaktifkan jadwal dokter ini?"
        );

        if (!konfirmasi) return;

        setLoadingStatus(item.id);
        setPesan("");

        try {
            const response = await fetch(
                `/api/admin/jadwal/${item.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        is_active: statusBaru
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Status jadwal gagal diubah.");
                return;
            }

            setPesan(data.message);
            await ambilData();
        } catch (error) {
            console.error("Ubah status jadwal:", error);
            setPesan("Terjadi kesalahan saat mengubah status jadwal.");
        } finally {
            setLoadingStatus(null);
        }
    }

    async function hapusJadwal(id) {
        const yakin = confirm("Yakin ingin menghapus jadwal ini?");

        if (!yakin) return;

        try {
            const response = await fetch(`/api/admin/jadwal/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Jadwal gagal dihapus.");
                return;
            }

            setPesan(data.message);
            await ambilData();
        } catch (error) {
            console.error("Hapus jadwal:", error);
            setPesan("Terjadi kesalahan saat menghapus jadwal.");
        }
    }

    function namaHari(id) {
        return daftarHari.find(
            (hari) => hari.id === Number(id)
        )?.nama || "-";
    }

    const inputStyle =
        "w-full rounded-xl border border-[#D7E3DC] bg-white px-4 py-3 text-[#263D34] outline-none transition focus:border-[#397A63] focus:ring-2 focus:ring-[#397A63]/15";

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10 md:px-10">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold tracking-widest text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="text-3xl font-bold text-[#263D34]">
                        Manajemen Jadwal
                    </h1>

                    <p className="mt-2 text-[#718078]">
                        Kelola waktu praktik dokter dengan mudah.
                    </p>
                </div>

                <section className="rounded-3xl border border-white bg-white/80 p-5 shadow-[0_8px_30px_rgba(38,61,52,0.06)] md:p-8">

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[#263D34]">
                                Daftar Jadwal Dokter
                            </h2>

                            <p className="mt-1 text-sm text-[#819087]">
                                Atur hari dan waktu praktik setiap dokter.
                            </p>
                        </div>

                        <button
                            onClick={bukaTambah}
                            className="rounded-xl bg-[#397A63] px-5 py-3 font-semibold text-white transition hover:bg-[#2E6551]"
                        >
                            + Tambah Jadwal
                        </button>
                    </div>

                    {pesan && (
                        <div className="mt-5 rounded-xl bg-[#E8F3EC] px-4 py-3 text-sm text-[#397A63]">
                            {pesan}
                        </div>
                    )}

                    {tampilForm && (
                        <form
                            onSubmit={simpanJadwal}
                            className="mt-7 rounded-2xl border border-[#E1EAE4] bg-[#F8FAF8] p-5 md:p-6"
                        >
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[#263D34]">
                                    {jadwalDipilih
                                        ? "Edit Jadwal"
                                        : "Tambah Jadwal Baru"}
                                </h3>

                                <p className="mt-1 text-sm text-[#819087]">
                                    Lengkapi informasi jadwal praktik dokter.
                                </p>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#40564A]">
                                        Nama Dokter
                                    </label>

                                    <select
                                        name="dokter_id"
                                        value={form.dokter_id}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    >
                                        <option value="">Pilih Dokter</option>

                                        {dokter.map((item) => (
                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[#40564A]">
                                        Hari Praktik
                                    </label>

                                    <select
                                        name="hari"
                                        value={form.hari}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    >
                                        <option value="">Pilih Hari</option>

                                        {daftarHari.map((hari) => (
                                            <option
                                                key={hari.id}
                                                value={hari.id}
                                            >
                                                {hari.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-[#40564A]">
                                        Jam Mulai Praktik
                                    </label>

                                    <input
                                        type="time"
                                        name="jam_mulai"
                                        value={form.jam_mulai}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    />

                                    {form.jam_mulai && (
                                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#E8F3EC] px-4 py-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#397A63]">
                                                ◷
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-[#263D34]">
                                                    {form.jam_mulai} ·{" "}
                                                    {keteranganJam(form.jam_mulai)}
                                                </p>

                                                <p className="text-xs text-[#718078]">
                                                    Durasi praktik 30 menit per sesi
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setJadwalDipilih(null);
                                        setForm(formAwal);
                                    }}
                                    className="rounded-xl border border-[#D7E3DC] bg-white px-6 py-3 font-semibold text-[#64776D] transition hover:bg-[#F1F5F2]"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-[#397A63] px-6 py-3 font-semibold text-white transition hover:bg-[#2E6551]"
                                >
                                    {jadwalDipilih
                                        ? "Simpan Perubahan"
                                        : "Simpan Jadwal"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-7">
                        {loading ? (
                            <div className="py-12 text-center text-[#819087]">
                                Memuat data jadwal...
                            </div>
                        ) : jadwal.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#D7E3DC] bg-[#F8FAF8] px-5 py-14 text-center">
                                <div className="mb-3 text-4xl text-[#397A63]">
                                    ◷
                                </div>

                                <h3 className="font-semibold text-[#263D34]">
                                    Belum Ada Jadwal
                                </h3>

                                <p className="mt-2 text-sm text-[#819087]">
                                    Jadwal praktik dokter yang ditambahkan akan muncul di sini.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px] text-left">
                                    <thead>
                                        <tr className="border-b border-[#D7E3DC] text-sm text-[#397A63]">
                                            <th className="px-4 py-4">No.</th>
                                            <th className="px-4 py-4">Nama Dokter</th>
                                            <th className="px-4 py-4">Poli</th>
                                            <th className="px-4 py-4">Hari</th>
                                            <th className="px-4 py-4">Jam Praktik</th>
                                            <th className="px-4 py-4">Durasi</th>
                                            <th className="px-4 py-4">Status</th>
                                            <th className="px-4 py-4">Aksi</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {jadwal.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-[#EDF1EE] text-sm text-[#40564A] transition hover:bg-[#F8FAF8]"
                                            >
                                                <td className="px-4 py-4">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-4 font-semibold">
                                                    {item.nama_dokter}
                                                </td>

                                                <td className="px-4 py-4">
                                                    {item.nama_poli || "-"}
                                                </td>

                                                <td className="px-4 py-4">
                                                    {namaHari(item.hari)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="rounded-lg bg-[#E8F3EC] px-3 py-1.5 font-semibold text-[#397A63]">
                                                        {String(item.jam_mulai).slice(0, 5)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    {item.durasi} menit
                                                </td>

                                                <td className="px-4 py-4">
                                                    {item.is_active ? (
                                                        <span className="rounded-full bg-[#E4F4E8] px-3 py-1.5 text-xs font-semibold text-[#287A45]">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-[#F1E8E8] px-3 py-1.5 text-xs font-semibold text-[#A34D4D]">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => bukaEdit(item)}
                                                            className="rounded-lg bg-[#E8F3EC] px-3 py-2 font-medium text-[#397A63] hover:bg-[#D8EADF]"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => ubahStatusJadwal(item)}
                                                            disabled={loadingStatus === item.id}
                                                            className={`rounded-lg px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${item.is_active
                                                                    ? "bg-[#FFF2D9] text-[#9A6A17] hover:bg-[#F9E5B8]"
                                                                    : "bg-[#E4F4E8] text-[#287A45] hover:bg-[#D1EBD8]"
                                                                }`}
                                                        >
                                                            {loadingStatus === item.id
                                                                ? "Memproses..."
                                                                : item.is_active
                                                                    ? "Nonaktifkan"
                                                                    : "Aktifkan"}
                                                        </button>

                                                        <button
                                                            onClick={() => hapusJadwal(item.id)}
                                                            className="rounded-lg bg-[#FCE9E9] px-3 py-2 font-medium text-[#C45B5B] hover:bg-[#F8DADA]"
                                                        >
                                                            Hapus
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
            </div>
        </main>
    );
}