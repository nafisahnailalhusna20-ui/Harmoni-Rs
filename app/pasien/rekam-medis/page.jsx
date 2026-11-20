"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RekamMedisPasienPage() {
    const router = useRouter();

    const [rekamMedis, setRekamMedis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");

    async function ambilRekamMedis() {
        try {
            setLoading(true);

            const response = await fetch("/api/pasien/rekam-medis");
            const data = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                setPesan(data.message || "Rekam medis gagal dimuat.");
                return;
            }

            setRekamMedis(data.data || []);
            setPesan("");

        } catch (error) {
            console.error("Gagal mengambil rekam medis:", error);
            setPesan("Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilRekamMedis();
    }, []);

    function formatTanggal(tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Makassar"
        });
    }

    function warnaStatus(status) {
        if (status === "Sudah Diambil") {
            return "bg-green-100 text-green-700";
        }

        if (status === "Siap Diambil") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-yellow-100 text-yellow-700";
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10 md:px-10">
            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => router.push("/pasien")}
                    className="text-[#397A63] hover:underline mb-8"
                >
                    ← Kembali ke Dashboard
                </button>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="text-3xl font-bold text-[#263D34] mt-2">
                        Riwayat Rekam Medis
                    </h1>

                    <p className="text-[#64776D] mt-2">
                        Lihat hasil pemeriksaan dan catatan medis Anda.
                    </p>
                </div>

                <div className="bg-white/80 border border-white rounded-2xl p-6 shadow-sm">

                    <div className="flex justify-between items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[#263D34]">
                                Riwayat Pemeriksaan
                            </h2>

                            <p className="text-sm text-[#64776D] mt-1">
                                Catatan pemeriksaan dan resep obat dari dokter.
                            </p>
                        </div>

                        <button
                            onClick={ambilRekamMedis}
                            className="bg-[#E3EFE9] text-[#397A63] px-4 py-2 rounded-xl hover:bg-[#d5e7de]"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p className="text-center py-12 text-[#64776D]">
                            Memuat data rekam medis...
                        </p>
                    ) : pesan ? (
                        <p className="text-center py-12 text-red-600">
                            {pesan}
                        </p>
                    ) : rekamMedis.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold text-[#263D34]">
                                Belum Ada Rekam Medis
                            </h3>

                            <p className="text-[#64776D] mt-2">
                                Hasil pemeriksaan dari dokter akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {rekamMedis.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-[#DCE9E1] rounded-xl p-5"
                                >

                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 border-b border-[#E5EDE8] pb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#263D34]">
                                                {item.nama_dokter}
                                            </h3>

                                            <p className="text-sm text-[#64776D] mt-1">
                                                {item.nama_poli || "Poli tidak tersedia"}
                                            </p>
                                        </div>

                                        <span className="text-sm text-[#397A63] bg-[#E3EFE9] px-3 py-1 rounded-full">
                                            {formatTanggal(item.tanggal_booking)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                                        <div>
                                            <p className="text-sm text-[#64776D]">
                                                Diagnosis
                                            </p>

                                            <p className="text-[#263D34] mt-1">
                                                {item.diagnosis || "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-[#64776D]">
                                                Tindakan
                                            </p>

                                            <p className="text-[#263D34] mt-1">
                                                {item.tindakan || "-"}
                                            </p>
                                        </div>

                                        <div className="md:col-span-2">
                                            <p className="text-sm text-[#64776D]">
                                                Catatan Dokter
                                            </p>

                                            <p className="text-[#263D34] mt-1 whitespace-pre-line">
                                                {item.catatan || "-"}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-6 pt-5 border-t border-[#E5EDE8]">

                                        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                            <h4 className="font-semibold text-[#263D34]">
                                                Resep Obat
                                            </h4>

                                            {item.status_resep && (
                                                <span className={`text-xs px-3 py-1 rounded-full ${warnaStatus(item.status_resep)}`}>
                                                    {item.status_resep}
                                                </span>
                                            )}
                                        </div>

                                        {item.resep && item.resep.length > 0 ? (
                                            <div className="space-y-2">
                                                {item.resep.map((obat, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between items-center gap-3 bg-[#F3F7F4] rounded-lg px-4 py-3"
                                                    >
                                                        <span className="text-[#263D34]">
                                                            {obat.nama_obat}
                                                        </span>

                                                        <span className="text-sm text-[#64776D]">
                                                            Jumlah: {obat.jumlah}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[#64776D]">
                                                Tidak ada resep obat untuk pemeriksaan ini.
                                            </p>
                                        )}

                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}