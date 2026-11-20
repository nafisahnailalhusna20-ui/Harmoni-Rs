"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JadwalDokterPage() {
    const router = useRouter();

    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");

    const daftarHari = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
        "Minggu"
    ];

    async function ambilJadwal() {
        try {
            const response = await fetch("/api/dokter/jadwal");
            const data = await response.json();

            if (!response.ok || !data.success) {
                setPesan(data.message || "Jadwal gagal dimuat.");
                return;
            }

            setJadwal(data.data);
        } catch (error) {
            console.error("Gagal mengambil jadwal:", error);
            setPesan("Terjadi kesalahan saat mengambil jadwal.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilJadwal();
    }, []);

    function keteranganWaktu(jam) {
        const angkaJam = Number(String(jam).slice(0, 2));

        if (angkaJam >= 5 && angkaJam < 11) return "Pagi";
        if (angkaJam >= 11 && angkaJam < 15) return "Siang";
        if (angkaJam >= 15 && angkaJam < 18) return "Sore";
        return "Malam";
    }

    function formatJam(jam) {
        return String(jam).slice(0, 5).replace(":", ".");
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10 md:px-10">
            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => router.push("/dokter")}
                    className="text-[#397A63] hover:underline mb-6"
                >
                    ← Kembali ke Dashboard
                </button>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="text-3xl font-bold text-[#263D34] mt-2">
                        Jadwal Praktik Saya
                    </h1>

                    <p className="text-[#64776D] mt-2">
                        Lihat hari dan waktu praktik yang telah ditetapkan.
                    </p>
                </div>

                <section className="bg-white/80 border border-white rounded-2xl p-6 md:p-8 shadow-sm">

                    <div className="flex justify-between items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-[#263D34]">
                                Jadwal Praktik
                            </h2>

                            <p className="text-sm text-[#64776D] mt-1">
                                Jadwal ini dikelola oleh administrator.
                            </p>
                        </div>

                        <button
                            onClick={ambilJadwal}
                            className="bg-[#DCEBE2] text-[#397A63] px-4 py-2 rounded-xl hover:bg-[#cce1d4]"
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center py-12 text-[#64776D]">
                            Memuat jadwal praktik...
                        </p>
                    ) : pesan ? (
                        <p className="text-center py-12 text-red-500">
                            {pesan}
                        </p>
                    ) : jadwal.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-3">📅</p>

                            <h3 className="font-semibold text-[#263D34]">
                                Belum Ada Jadwal Praktik
                            </h3>

                            <p className="text-sm text-[#64776D] mt-2">
                                Silakan hubungi administrator untuk pengaturan jadwal.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {jadwal.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-[#DCE8E0] rounded-2xl p-5 hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-[#64776D]">
                                                Hari Praktik
                                            </p>

                                            <h3 className="text-xl font-bold text-[#263D34] mt-1">
                                                {daftarHari[Number(item.hari) - 1]}
                                            </h3>
                                        </div>

                                        <span className="bg-[#E8F0EC] text-[#397A63] text-xs font-semibold px-3 py-2 rounded-full">
                                            Aktif
                                        </span>
                                    </div>

                                    <div className="mt-5 bg-[#E8F3EC] rounded-xl p-4">
                                        <p className="text-sm text-[#64776D]">
                                            Waktu Praktik
                                        </p>

                                        <p className="text-2xl font-bold text-[#397A63] mt-1">
                                            {formatJam(item.jam_mulai)}
                                        </p>

                                        <p className="text-sm text-[#64776D] mt-1">
                                            {keteranganWaktu(item.jam_mulai)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 text-sm">
                                        <span className="text-[#64776D]">
                                            Poli
                                        </span>

                                        <span className="font-semibold text-[#263D34]">
                                            {item.nama_poli || "-"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mt-3 text-sm">
                                        <span className="text-[#64776D]">
                                            Durasi
                                        </span>

                                        <span className="font-semibold text-[#263D34]">
                                            {item.durasi} menit
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}