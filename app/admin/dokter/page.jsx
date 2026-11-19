"use client";

import { useEffect, useState } from "react";

export default function DokterPage() {
    const [dokter, setDokter] = useState([]);
    const [poli, setPoli] = useState([]);
    const [loading, setLoading] = useState(true);

    async function ambilData() {
        try {
            const [resDokter, resPoli] = await Promise.all([
                fetch("/api/admin/dokter"),
                fetch("/api/admin/poli")
            ]);

            const dataDokter = await resDokter.json();
            const dataPoli = await resPoli.json();

            if (dataDokter.success) setDokter(dataDokter.data);
            if (dataPoli.success) setPoli(dataPoli.data);

        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-8">
            <div className="max-w-6xl mx-auto">

                <h1 className="text-3xl font-bold text-[#263D34]">
                    Manajemen Dokter
                </h1>

                <p className="text-[#64776D] mt-2">
                    Kelola data dokter dan poli rumah sakit.
                </p>

                <div className="mt-8 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-[#263D34]">
                        Daftar Dokter
                    </h2>

                    {loading ? (
                        <p className="mt-4">Memuat data...</p>
                    ) : dokter.length === 0 ? (
                        <p className="mt-4 text-gray-500">
                            Belum ada dokter terdaftar.
                        </p>
                    ) : (
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-[#397A63]">
                                        <th className="p-3">No.</th>
                                        <th className="p-3">Nama Dokter</th>
                                        <th className="p-3">Username</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Poli</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dokter.map((item, index) => (
                                        <tr key={item.id} className="border-b border-gray-200">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{item.full_name}</td>
                                            <td className="p-3">{item.username}</td>
                                            <td className="p-3">{item.email}</td>
                                            <td className="p-3">{item.nama_poli || "-"}</td>
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