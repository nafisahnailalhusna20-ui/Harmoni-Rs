"use client";

import { useEffect, useState } from "react";

export default function JanjiTemuPage() {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const hariIni = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Makassar"
    });

    useEffect(() => {
        async function ambilJadwal() {
            try {
                const response = await fetch("/api/pasien/janji-temu");
                const data = await response.json();

                if (data.success) {
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

        ambilJadwal();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

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

    const inputStyle = "w-full p-3 rounded-xl border border-[#C8D8CF] bg-white/80 text-[#263D34] focus:outline-none focus:ring-2 focus:ring-[#397A63]";

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Pendaftaran Janji Temu
                </h1>

                <p className="text-[#64776D] mt-2">
                    Daftarkan kunjungan pemeriksaan kesehatan Anda.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">

                    <h2 className="text-xl font-semibold text-[#263D34]">
                        Formulir Pendaftaran
                    </h2>

                    {pesan && (
                        <p className={`mt-4 text-sm ${berhasil ? "text-[#397A63]" : "text-red-600"}`}>
                            {pesan}
                        </p>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat jadwal dokter...
                        </p>
                    ) : jadwal.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada jadwal praktik dokter yang tersedia.
                        </p>
                    ) : (
                        <form onSubmit={daftarJanjiTemu} className="mt-6 space-y-5">

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Pilih Dokter dan Jadwal
                                </label>

                                <select
                                    name="schedule_id"
                                    value={form.schedule_id}
                                    onChange={handleChange}
                                    required
                                    className={inputStyle}
                                >
                                    <option value="">Pilih jadwal dokter</option>

                                    {jadwal.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_dokter} - {item.nama_poli} - {daftarHari[Number(item.hari)]} ({String(item.jam_mulai).slice(0, 5)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Tanggal Kunjungan
                                </label>

                                <input
                                    type="date"
                                    name="tanggal_booking"
                                    value={form.tanggal_booking}
                                    onChange={handleChange}
                                    min={hariIni}
                                    required
                                    className={inputStyle}
                                />

                                <p className="text-sm text-[#64776D] mt-2">
                                    Pilih tanggal sesuai hari praktik dokter.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm text-[#263D34] mb-2">
                                    Keluhan
                                </label>

                                <textarea
                                    name="keluhan"
                                    value={form.keluhan}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    placeholder="Ceritakan keluhan yang sedang Anda rasakan..."
                                    className={inputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={menyimpan}
                                className="w-full bg-[#397A63] text-white p-3 rounded-xl hover:bg-[#2e6551] disabled:opacity-50"
                            >
                                {menyimpan ? "Mengirim..." : "Daftar Janji Temu"}
                            </button>

                        </form>
                    )}

                </div>
            </div>
        </main>
    );
}