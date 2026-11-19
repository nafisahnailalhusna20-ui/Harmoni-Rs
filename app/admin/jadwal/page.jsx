"use client";

import { useEffect, useState } from "react";

export default function JadwalPage() {
    const [jadwal, setJadwal] = useState([]);
    const [dokter, setDokter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tampilForm, setTampilForm] = useState(false);
    const [jadwalDipilih, setJadwalDipilih] = useState(null);
    const [pesan, setPesan] = useState("");

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

            if (dataJadwal.success) setJadwal(dataJadwal.data);
            if (dataDokter.success) setDokter(dataDokter.data);

        } catch (error) {
            console.error("Gagal mengambil data:", error);
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
            setPesan("Terjadi kesalahan saat menyimpan jadwal.");
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
            setPesan("Terjadi kesalahan saat menghapus jadwal.");
        }
    }

    function namaHari(id) {
        return daftarHari.find(
            (hari) => hari.id === Number(id)
        )?.nama || "-";
    }

    const inputStyle = "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white/80 text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Jadwal
                </h1>

                <p className="text-[#64776D] mt-2">
                    Atur jadwal praktik dokter rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">

                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Jadwal Dokter
                        </h2>

                        <button
                            onClick={bukaTambah}
                            className="bg-[#397A63] text-white px-4 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            + Tambah Jadwal
                        </button>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {tampilForm && (
                        <form
                            onSubmit={simpanJadwal}
                            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <select
                                name="dokter_id"
                                value={form.dokter_id}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="">Pilih Dokter</option>

                                {dokter.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.full_name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="hari"
                                value={form.hari}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="">Pilih Hari</option>

                                {daftarHari.map((hari) => (
                                    <option key={hari.id} value={hari.id}>
                                        {hari.nama}
                                    </option>
                                ))}
                            </select>

                            <div className="md:col-span-2">
                                <label className="block text-sm text-[#263D34] mb-2">
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

                                <p className="text-sm text-[#64776D] mt-2">
                                    Durasi setiap sesi praktik adalah 30 menit.
                                </p>
                            </div>

                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551]"
                                >
                                    {jadwalDipilih ? "Simpan Perubahan" : "Simpan Jadwal"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTampilForm(false);
                                        setJadwalDipilih(null);
                                    }}
                                    className="px-5 bg-gray-200 text-gray-700 rounded-xl"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat data...
                        </p>
                    ) : jadwal.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada jadwal praktik dokter.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Dokter</th>
                                        <th className="p-3">Poli</th>
                                        <th className="p-3">Hari</th>
                                        <th className="p-3">Jam Mulai</th>
                                        <th className="p-3">Durasi</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {jadwal.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200 text-[#263D34]"
                                        >
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{item.nama_dokter}</td>
                                            <td className="p-3">{item.nama_poli || "-"}</td>
                                            <td className="p-3">{namaHari(item.hari)}</td>
                                            <td className="p-3">
                                                {String(item.jam_mulai).slice(0, 5)}
                                            </td>
                                            <td className="p-3">{item.durasi} menit</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => bukaEdit(item)}
                                                        className="bg-[#DCEBE2] text-[#397A63] px-3 py-1 rounded-lg"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => hapusJadwal(item.id)}
                                                        className="bg-red-100 text-red-600 px-3 py-1 rounded-lg"
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
            </div>
        </main>
    );
}