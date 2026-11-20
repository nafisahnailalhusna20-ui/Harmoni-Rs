"use client";

import { useEffect, useState } from "react";

export default function JanjiTemuPage() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [poliDipilih, setPoliDipilih] = useState("Semua Poli");
    const [dokterDipilih, setDokterDipilih] = useState(null);
    const [menyimpan, setMenyimpan] = useState(false);
    const [pesan, setPesan] = useState("");
    const [berhasil, setBerhasil] = useState(false);

    const [form, setForm] = useState({
        schedule_id: "",
        tanggal_booking: "",
        keluhan: ""
    });

    const daftarHari = [
        "-", "Senin", "Selasa", "Rabu",
        "Kamis", "Jumat", "Sabtu", "Minggu"
    ];

    useEffect(() => {
        ambilJadwal();
    }, []);

    async function ambilJadwal() {
        try {
            const response = await fetch("/api/pasien/janji-temu");
            const data = await response.json();

            if (response.ok && data.success) {
                setJadwal(data.data);
            } else {
                setPesan(data.message || "Jadwal gagal dimuat.");
            }
        } catch (error) {
            setPesan("Terjadi kesalahan saat mengambil jadwal.");
        } finally {
            setLoading(false);
        }
    }

    const daftarPoli = [
        "Semua Poli",
        ...new Set(jadwal.map((item) => item.nama_poli))
    ];

    const jadwalFilter = jadwal.filter((item) =>
        poliDipilih === "Semua Poli" ||
        item.nama_poli === poliDipilih
    );

    const daftarDokter = Object.values(
        jadwalFilter.reduce((hasil, item) => {
            if (!hasil[item.dokter_id]) {
                hasil[item.dokter_id] = {
                    id: item.dokter_id,
                    nama: item.nama_dokter,
                    poli: item.nama_poli,
                    jadwal: []
                };
            }

            hasil[item.dokter_id].jadwal.push(item);

            return hasil;
        }, {})
    );

    function formatTanggal(tanggal) {
        const [tahun, bulan, hari] = tanggal.split("-");

        const namaBulan = [
            "Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"
        ];

        return `${Number(hari)} ${namaBulan[Number(bulan) - 1]} ${tahun}`;
    }

    function bukaForm(dokter) {
        setDokterDipilih(dokter);

        setForm({
            schedule_id: String(dokter.jadwal[0].id),
            tanggal_booking: "",
            keluhan: ""
        });

        setPesan("");
        setBerhasil(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((formSebelumnya) => ({
            ...formSebelumnya,
            [name]: value,
            ...(name === "schedule_id" ? {
                tanggal_booking: ""
            } : {})
        }));

        setPesan("");
        setBerhasil(false);
    }

    const jadwalTerpilih = dokterDipilih?.jadwal.find(
        (item) => String(item.id) === form.schedule_id
    );

    async function daftarJanjiTemu(e) {
        e.preventDefault();

        setPesan("");
        setBerhasil(false);
        setMenyimpan(true);

        try {
            const response = await fetch("/api/pasien/janji-temu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Pendaftaran gagal.");
                return;
            }

            setPesan("Janji temu berhasil didaftarkan!");
            setBerhasil(true);

            await ambilJadwal();

            setForm({
                schedule_id: "",
                tanggal_booking: "",
                keluhan: ""
            });

        } catch (error) {
            setPesan("Terjadi kesalahan saat mendaftar.");
        } finally {
            setMenyimpan(false);
        }
    }

    const inputStyle =
        "w-full rounded-xl border border-[#C8D8CF] bg-white p-3 text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10">

            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[#263D34]">
                        Cari Dokter
                    </h1>

                    <p className="mt-2 text-[#64776D]">
                        Temukan dokter dan pilih jadwal konsultasi yang sesuai.
                    </p>
                </div>

                <div className="mb-8 flex flex-wrap items-center gap-3">

                    <label className="font-medium text-[#263D34]">
                        Pilih Poli:
                    </label>

                    <select
                        value={poliDipilih}
                        onChange={(e) => setPoliDipilih(e.target.value)}
                        className="rounded-xl border border-[#C8D8CF] bg-white px-4 py-3 text-[#263D34] outline-none"
                    >
                        {daftarPoli.map((poli) => (
                            <option key={poli} value={poli}>
                                {poli}
                            </option>
                        ))}
                    </select>

                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white/60 p-10 text-center text-[#64776D]">
                        Memuat daftar dokter...
                    </div>
                ) : daftarDokter.length === 0 ? (
                    <div className="rounded-2xl bg-white/60 p-10 text-center text-[#64776D]">
                        Belum ada dokter dengan jadwal praktik tersedia.
                    </div>
                ) : (

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {daftarDokter.map((dokter) => (

                            <div
                                key={dokter.id}
                                className="flex flex-col rounded-2xl border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#DCEBE3] text-2xl font-bold text-[#397A63]">
                                        {dokter.nama?.charAt(0)?.toUpperCase() || "D"}
                                    </div>

                                    <div>
                                        <p className="text-sm text-[#81948A]">
                                            Dokter Spesialis
                                        </p>

                                        <h2 className="text-lg font-bold text-[#263D34]">
                                            {dokter.nama}
                                        </h2>

                                        <p className="text-sm text-[#64776D]">
                                            {dokter.poli}
                                        </p>
                                    </div>

                                </div>

                                <div className="my-5 border-t border-[#DCE5DF]" />

                                <div className="flex-1">

                                    <h3 className="mb-3 font-semibold text-[#263D34]">
                                        Jadwal Praktik
                                    </h3>

                                    <div className="space-y-3">

                                        {dokter.jadwal.map((item) => (

                                            <div
                                                key={item.id}
                                                className="rounded-xl bg-[#E8F0EC] p-3"
                                            >
                                                <p className="font-medium text-[#263D34]">
                                                    {daftarHari[Number(item.hari)]}
                                                </p>

                                                <p className="mt-1 text-sm text-[#64776D]">
                                                    Pukul {String(item.jam_mulai).slice(0, 5)}
                                                </p>

                                                <p className="mt-1 text-xs text-[#64776D]">
                                                    Durasi konsultasi 30 menit
                                                </p>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                                <button
                                    onClick={() => bukaForm(dokter)}
                                    className="mt-6 w-full rounded-xl bg-[#397A63] px-4 py-3 font-semibold text-white transition hover:bg-[#2e6551]"
                                >
                                    Pesan Janji Temu
                                </button>

                            </div>

                        ))}

                    </div>

                )}

                {pesan && !dokterDipilih && (
                    <p className="mt-5 text-center text-red-600">
                        {pesan}
                    </p>
                )}

            </div>

            {dokterDipilih && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">

                    <div className="my-8 w-full max-w-xl rounded-2xl border border-white/70 bg-[#F7FAF8] p-6 shadow-2xl">

                        <div className="mb-6 flex items-center justify-between">

                            <div>
                                <h2 className="text-2xl font-bold text-[#263D34]">
                                    Pesan Janji Temu
                                </h2>

                                <p className="mt-1 text-sm text-[#64776D]">
                                    {dokterDipilih.nama} - {dokterDipilih.poli}
                                </p>
                            </div>

                            <button
                                onClick={() => setDokterDipilih(null)}
                                className="text-2xl text-[#64776D] hover:text-red-500"
                            >
                                ×
                            </button>

                        </div>

                        {pesan && (
                            <p className={`mb-4 text-sm ${berhasil ? "text-[#397A63]" : "text-red-600"
                                }`}>
                                {pesan}
                            </p>
                        )}

                        {!berhasil && (

                            <form onSubmit={daftarJanjiTemu} className="space-y-5">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Pilih Jadwal Praktik
                                    </label>

                                    <select
                                        name="schedule_id"
                                        value={form.schedule_id}
                                        onChange={handleChange}
                                        required
                                        className={inputStyle}
                                    >
                                        {dokterDipilih.jadwal.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {daftarHari[Number(item.hari)]} - {String(item.jam_mulai).slice(0, 5)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Pilih Tanggal Kunjungan
                                    </label>

                                    <select
                                        name="tanggal_booking"
                                        value={form.tanggal_booking}
                                        onChange={handleChange}
                                        required
                                        disabled={!jadwalTerpilih}
                                        className={inputStyle}
                                    >
                                        <option value="">
                                            Pilih tanggal kunjungan
                                        </option>

                                        {jadwalTerpilih?.tanggal_tersedia?.map((tanggal) => (
                                            <option key={tanggal} value={tanggal}>
                                                {formatTanggal(tanggal)}
                                            </option>
                                        ))}
                                    </select>

                                    {jadwalTerpilih?.tanggal_tersedia?.length === 0 && (
                                        <p className="mt-2 text-sm text-red-500">
                                            Belum ada tanggal praktik yang tersedia.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#263D34]">
                                        Keluhan
                                    </label>

                                    <textarea
                                        name="keluhan"
                                        value={form.keluhan}
                                        onChange={handleChange}
                                        rows="4"
                                        required
                                        placeholder="Ceritakan keluhan yang sedang Anda rasakan..."
                                        className={inputStyle}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={menyimpan}
                                    className="w-full rounded-xl bg-[#397A63] p-3 font-semibold text-white hover:bg-[#2e6551] disabled:opacity-50"
                                >
                                    {menyimpan ? "Mengirim..." : "Konfirmasi Janji Temu"}
                                </button>

                            </form>

                        )}

                        {berhasil && (
                            <button
                                onClick={() => setDokterDipilih(null)}
                                className="mt-4 w-full rounded-xl bg-[#397A63] p-3 font-semibold text-white"
                            >
                                Selesai
                            </button>
                        )}

                    </div>

                </div>

            )}

        </main>
    );
}