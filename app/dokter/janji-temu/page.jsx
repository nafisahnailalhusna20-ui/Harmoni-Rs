"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JanjiTemuDokterPage() {
    const router = useRouter();

    const [janjiTemu, setJanjiTemu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [alasan, setAlasan] = useState("");
    const [janjiDipilih, setJanjiDipilih] = useState(null);

    async function ambilData() {
        try {
            const response = await fetch("/api/dokter/janji-temu");
            const data = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (data.success) {
                setJanjiTemu(data.data);
            } else {
                setPesan(data.message || "Gagal mengambil data.");
            }

        } catch (error) {
            console.error(error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    async function ubahStatus(id, status, alasan_penolakan = "") {
        try {
            const response = await fetch("/api/dokter/janji-temu", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    status,
                    alasan_penolakan
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Status gagal diperbarui.");
                return;
            }

            setPesan(data.message);
            setJanjiDipilih(null);
            setAlasan("");

            await ambilData();

        } catch (error) {
            setPesan("Terjadi kesalahan saat mengubah status.");
        }
    }

    function formatTanggal(tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function warnaStatus(status) {
        if (status === "Approved") {
            return "bg-green-100 text-green-700";
        }

        if (status === "Rejected") {
            return "bg-red-100 text-red-600";
        }

        return "bg-yellow-100 text-yellow-700";
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => router.push("/dokter")}
                    className="text-[#397A63] hover:underline mb-6"
                >
                    ← Kembali ke Dashboard
                </button>

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Janji Temu Pasien
                </h1>

                <p className="text-[#64776D] mt-2">
                    Lihat dan kelola permintaan janji temu pasien.
                </p>

                <div className="mt-8 bg-white/70 border border-white rounded-2xl p-6 shadow-sm">

                    <div className="flex justify-between items-center gap-3">
                        <h2 className="text-xl font-semibold text-[#263D34]">
                            Daftar Janji Temu
                        </h2>

                        <button
                            onClick={ambilData}
                            className="bg-[#DCEBE2] text-[#397A63] px-4 py-2 rounded-xl hover:bg-[#c9dfd1]"
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {pesan && (
                        <p className="mt-4 text-sm text-[#397A63]">
                            {pesan}
                        </p>
                    )}

                    {loading ? (
                        <p className="mt-6 text-[#64776D]">
                            Memuat data janji temu...
                        </p>
                    ) : janjiTemu.length === 0 ? (
                        <p className="mt-6 text-[#64776D]">
                            Belum ada janji temu pasien.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-left">

                                <thead>
                                    <tr className="border-b border-[#C8D8CF] text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Pasien</th>
                                        <th className="p-3">Tanggal</th>
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
                                            <td className="p-3">
                                                {index + 1}
                                            </td>

                                            <td className="p-3">
                                                {item.nama_pasien}
                                            </td>

                                            <td className="p-3 whitespace-nowrap">
                                                {formatTanggal(item.tanggal_booking)}
                                            </td>

                                            <td className="p-3 whitespace-nowrap">
                                                {item.jam_mulai}
                                            </td>

                                            <td className="p-3">
                                                {item.keluhan || "-"}
                                            </td>

                                            <td className="p-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${warnaStatus(item.status)}`}>
                                                    {item.status}
                                                </span>

                                                {item.alasan_penolakan && (
                                                    <p className="text-xs text-red-500 mt-2">
                                                        {item.alasan_penolakan}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {item.status === "Pending" ? (
                                                    <div className="flex flex-col gap-2">

                                                        <button
                                                            onClick={() => ubahStatus(item.id, "Approved")}
                                                            className="bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200"
                                                        >
                                                            Setujui
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setJanjiDipilih(item);
                                                                setAlasan("");
                                                            }}
                                                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
                                                        >
                                                            Tolak
                                                        </button>

                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">
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

                {janjiDipilih && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

                            <h2 className="text-xl font-bold text-[#263D34]">
                                Tolak Janji Temu
                            </h2>

                            <p className="text-sm text-[#64776D] mt-2">
                                Masukkan alasan penolakan untuk pasien{" "}
                                <b>{janjiDipilih.nama_pasien}</b>.
                            </p>

                            <textarea
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                placeholder="Tuliskan alasan penolakan..."
                                rows={4}
                                className="w-full mt-4 p-3 rounded-xl border border-[#C8D8CF] focus:outline-none focus:ring-2 focus:ring-[#397A63]"
                            />

                            <div className="flex gap-3 mt-4">

                                <button
                                    onClick={() => ubahStatus(
                                        janjiDipilih.id,
                                        "Rejected",
                                        alasan
                                    )}
                                    disabled={!alasan.trim()}
                                    className="flex-1 bg-red-500 text-white p-3 rounded-xl disabled:opacity-50"
                                >
                                    Konfirmasi
                                </button>

                                <button
                                    onClick={() => setJanjiDipilih(null)}
                                    className="px-5 bg-gray-200 text-gray-700 rounded-xl"
                                >
                                    Batal
                                </button>

                            </div>

                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}