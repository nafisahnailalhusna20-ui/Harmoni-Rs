"use client";

import { useEffect, useState } from "react";

export default function JanjiTemuPage() {
    const [janjiTemu, setJanjiTemu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");

    const daftarHari = [
        "-", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
    ];

    async function ambilData() {
        try {
            const response = await fetch("/api/admin/janji-temu");
            const data = await response.json();

            if (data.success) {
                setJanjiTemu(data.data);
            } else {
                setPesan(data.message || "Data gagal dimuat.");
            }
        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        });
    }

    function warnaStatus(status) {
        if (status === "Approved") return "bg-green-100 text-green-700";
        if (status === "Rejected") return "bg-red-100 text-red-700";
        if (status === "Selesai") return "bg-blue-100 text-blue-700";
        if (status === "Dibatalkan") return "bg-gray-200 text-gray-700";

        return "bg-yellow-100 text-yellow-700";
    }

    async function ubahStatus(id, status) {
        let alasan = "";

        if (status === "Rejected") {
            alasan = window.prompt("Masukkan alasan penolakan:");

            if (!alasan || !alasan.trim()) {
                return;
            }
        }

        try {
            const response = await fetch("/api/admin/janji-temu", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    status,
                    alasan_penolakan: alasan
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Status gagal diperbarui.");
                return;
            }

            setPesan(data.message);
            await ambilData();

        } catch (error) {
            console.error("Gagal mengubah status:", error);
            setPesan("Terjadi kesalahan saat mengubah status.");
        }
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Janji Temu
                </h1>

                <p className="text-[#64776D] mt-2">
                    Kelola pendaftaran dan kunjungan pasien rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">

                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Janji Temu
                        </h2>

                        <span className="bg-[#DCEBE2] text-[#397A63] px-4 py-2 rounded-xl">
                            Total: {janjiTemu.length} pendaftaran
                        </span>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat data...
                        </p>
                    ) : janjiTemu.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada janji temu pasien.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Pasien</th>
                                        <th className="p-3">Dokter</th>
                                        <th className="p-3">Poli</th>
                                        <th className="p-3">Tanggal</th>
                                        <th className="p-3">Hari</th>
                                        <th className="p-3">Jam</th>
                                        <th className="p-3">Keluhan</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {janjiTemu.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-200 text-[#263D34]"
                                        >
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{item.nama_pasien}</td>
                                            <td className="p-3">{item.nama_dokter}</td>
                                            <td className="p-3">{item.nama_poli || "-"}</td>
                                            <td className="p-3 whitespace-nowrap">
                                                {formatTanggal(item.tanggal_booking)}
                                            </td>
                                            <td className="p-3">
                                                {daftarHari[Number(item.hari)] || "-"}
                                            </td>
                                            <td className="p-3">
                                                {String(item.jam_mulai).slice(0, 5)}
                                            </td>
                                            <td className="p-3">{item.keluhan}</td>

                                            <td className="p-3">
                                                <span className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${warnaStatus(item.status)}`}>
                                                    {item.status}
                                                </span>

                                                {item.alasan_penolakan && (
                                                    <p className="text-xs text-red-600 mt-2">
                                                        Alasan: {item.alasan_penolakan}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {item.status === "Pending" ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => ubahStatus(item.id, "Approved")}
                                                            className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
                                                        >
                                                            Setujui
                                                        </button>

                                                        <button
                                                            onClick={() => ubahStatus(item.id, "Rejected")}
                                                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">
                                                        Sudah diproses
                                                    </span>
                                                )}
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