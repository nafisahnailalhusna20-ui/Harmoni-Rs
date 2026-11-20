"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FarmasiPage() {
    const router = useRouter();

    const [resep, setResep] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [error, setError] = useState("");
    const [proses, setProses] = useState(null);

    async function ambilData() {
        try {
            setLoading(true);

            const response = await fetch("/api/admin/farmasi");
            const data = await response.json();

            if (response.status === 401) {
                router.push("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Data resep gagal dimuat.");
            }

            setResep(data.data || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilData();
    }, []);

    async function ubahStatus(id, status) {
        const konfirmasi = window.confirm(
            `Yakin ingin mengubah status resep menjadi ${status}?`
        );

        if (!konfirmasi) return;

        try {
            setProses(id);
            setPesan("");
            setError("");

            const response = await fetch("/api/admin/farmasi", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prescription_id: id,
                    status: status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Status gagal diperbarui.");
            }

            setPesan(data.message);
            await ambilData();

        } catch (err) {
            setError(err.message);
        } finally {
            setProses(null);
        }
    }

    function formatTanggal(tanggal) {
        if (!tanggal) return "-";

        return new Date(tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Makassar"
        });
    }

    function warnaStatus(status) {
        if (status === "Menunggu Diproses") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (status === "Siap Diambil") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-green-100 text-green-700";
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10">
            <div className="max-w-6xl mx-auto">

                <button
                    onClick={() => router.push("/admin")}
                    className="text-[#397A63] hover:underline mb-8"
                >
                    ← Kembali ke Dashboard
                </button>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-[#397A63]">
                        HARMONI HEALTHCARE
                    </p>

                    <h1 className="text-3xl font-bold text-[#263D34] mt-2">
                        Manajemen Farmasi
                    </h1>

                    <p className="text-[#64776D] mt-2">
                        Kelola resep obat dan proses pengambilan obat pasien.
                    </p>
                </div>

                <section className="bg-white/80 border border-white rounded-2xl p-6 shadow-sm">

                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[#263D34]">
                                Daftar Resep Pasien
                            </h2>

                            <p className="text-sm text-[#64776D] mt-1">
                                Resep yang dibuat oleh dokter.
                            </p>
                        </div>

                        <button
                            onClick={ambilData}
                            className="bg-[#E2EEE8] text-[#397A63] px-5 py-3 rounded-xl hover:bg-[#d3e6dc]"
                        >
                            ↻ Refresh Data
                        </button>
                    </div>

                    {pesan && (
                        <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-5">
                            {pesan}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-5">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-center py-12 text-[#64776D]">
                            Memuat data resep...
                        </p>
                    ) : resep.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold text-[#263D34]">
                                Belum Ada Resep
                            </h3>

                            <p className="text-[#64776D] mt-2">
                                Resep dari dokter akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {resep.map((item) => (
                                <div
                                    key={item.prescription_id}
                                    className="border border-[#DCE9E1] rounded-xl p-5"
                                >
                                    <div className="flex flex-wrap justify-between gap-4">

                                        <div>
                                            <h3 className="text-lg font-bold text-[#263D34]">
                                                {item.nama_pasien}
                                            </h3>

                                            <p className="text-sm text-[#64776D] mt-1">
                                                Dokter: {item.nama_dokter}
                                            </p>

                                            <p className="text-sm text-[#64776D]">
                                                Tanggal konsultasi: {formatTanggal(item.tanggal_booking)}
                                            </p>
                                        </div>

                                        <div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${warnaStatus(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <h4 className="font-semibold text-[#263D34] mb-3">
                                            Daftar Obat
                                        </h4>

                                        <div className="space-y-2">
                                            {item.daftar_obat.map((obat, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-wrap justify-between gap-2 bg-[#F4F8F5] p-3 rounded-lg text-sm"
                                                >
                                                    <span className="text-[#263D34]">
                                                        {obat.nama_obat}
                                                    </span>

                                                    <span className="text-[#64776D]">
                                                        Jumlah: {obat.jumlah}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-5">

                                        {item.status === "Menunggu Diproses" && (
                                            <button
                                                onClick={() => ubahStatus(
                                                    item.prescription_id,
                                                    "Siap Diambil"
                                                )}
                                                disabled={proses === item.prescription_id}
                                                className="bg-[#397A63] text-white px-5 py-3 rounded-xl hover:bg-[#2e6551] disabled:opacity-50"
                                            >
                                                {proses === item.prescription_id
                                                    ? "Memproses..."
                                                    : "Proses Resep"}
                                            </button>
                                        )}

                                        {item.status === "Siap Diambil" && (
                                            <button
                                                onClick={() => ubahStatus(
                                                    item.prescription_id,
                                                    "Sudah Diambil"
                                                )}
                                                disabled={proses === item.prescription_id}
                                                className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {proses === item.prescription_id
                                                    ? "Memproses..."
                                                    : "Tandai Sudah Diambil"}
                                            </button>
                                        )}

                                        {item.status === "Sudah Diambil" && (
                                            <p className="text-green-700 font-medium py-3">
                                                ✓ Obat sudah diambil pasien.
                                            </p>
                                        )}

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