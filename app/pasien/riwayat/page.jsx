"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RiwayatJanjiTemuPage() {
    const [riwayat, setRiwayat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pesan, setPesan] = useState("");
    const [pesanPembatalan, setPesanPembatalan] = useState("");
    const [sedangMembatalkan, setSedangMembatalkan] = useState(null);

    async function ambilRiwayat() {
        try {
            const response = await fetch(
                "/api/pasien/janji-temu?riwayat=true"
            );

            const data = await response.json();

            if (!response.ok) {
                setPesan(data.message || "Riwayat gagal dimuat.");
                return;
            }

            setRiwayat(data.data || []);
            setPesan("");
        } catch (error) {
            setPesan("Terjadi kesalahan saat mengambil riwayat.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ambilRiwayat();
    }, []);

    async function batalkanJanjiTemu(id) {
        const yakin = window.confirm(
            "Apakah kamu yakin ingin membatalkan janji temu ini?"
        );

        if (!yakin) return;

        setSedangMembatalkan(id);
        setPesanPembatalan("");

        try {
            const response = await fetch(
                `/api/pasien/janji-temu/${id}`,
                {
                    method: "PATCH"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setPesanPembatalan(
                    data.message || "Janji temu gagal dibatalkan."
                );
                return;
            }

            setRiwayat((dataLama) =>
                dataLama.map((item) =>
                    String(item.id) === String(id)
                        ? { ...item, status: "Dibatalkan" }
                        : item
                )
            );

            setPesanPembatalan(
                "Janji temu berhasil dibatalkan."
            );
        } catch (error) {
            setPesanPembatalan(
                "Terjadi kesalahan saat membatalkan janji temu."
            );
        } finally {
            setSedangMembatalkan(null);
        }
    }

    function formatTanggal(tanggal) {
        return new Date(tanggal).toLocaleDateString("id-ID", {
            timeZone: "Asia/Makassar",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function formatJam(jam) {
        if (!jam) return "-";
        return jam.slice(0, 5);
    }

    function warnaStatus(status) {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            case "Selesai":
                return "bg-blue-100 text-blue-700";

            case "Dibatalkan":
                return "bg-gray-200 text-gray-600";

            default:
                return "bg-yellow-100 text-yellow-700";
        }
    }

    return (
        <main className="min-h-screen bg-[#E8F0EC] px-5 py-10">
            <div className="max-w-5xl mx-auto">

                <p className="text-sm font-semibold text-[#397A63]">
                    HARMONI HEALTHCARE
                </p>

                <h1 className="text-3xl font-bold text-[#263D34] mt-2">
                    Riwayat Janji Temu
                </h1>

                <p className="text-[#64776D] mt-2">
                    Lihat jadwal konsultasi dan status janji temu kamu.
                </p>

                <div className="mt-6">
                    <Link
                        href="/pasien/janji-temu"
                        className="inline-block bg-[#397A63] text-white px-5 py-3 rounded-xl hover:bg-[#2e6551]"
                    >
                        Buat Janji Temu
                    </Link>
                </div>

                {pesanPembatalan && (
                    <div className="mt-5 bg-white p-4 rounded-xl text-sm text-[#397A63]">
                        {pesanPembatalan}
                    </div>
                )}

                {loading ? (
                    <p className="mt-8 text-[#64776D]">
                        Memuat riwayat janji temu...
                    </p>
                ) : pesan ? (
                    <div className="mt-8 bg-white p-5 rounded-xl text-red-600">
                        {pesan}
                    </div>
                ) : riwayat.length === 0 ? (
                    <div className="mt-8 bg-white rounded-2xl p-8 text-center shadow-sm">
                        <h2 className="text-lg font-semibold text-[#263D34]">
                            Belum ada janji temu
                        </h2>

                        <p className="text-[#64776D] mt-2">
                            Janji temu yang kamu buat akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                        {riwayat.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-white"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div>
                                        <p className="text-sm text-[#64776D]">
                                            Dokter
                                        </p>

                                        <h2 className="text-lg font-semibold text-[#263D34] mt-1">
                                            {item.nama_dokter || "Dokter"}
                                        </h2>

                                        <p className="text-sm text-[#397A63] mt-1">
                                            {item.nama_poli || "Poli"}
                                        </p>
                                    </div>

                                    <span
                                        className={`text-xs font-medium px-3 py-2 rounded-full ${warnaStatus(item.status)}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <div className="border-t border-[#E5ECE7] mt-5 pt-4 space-y-3">
                                    <div>
                                        <p className="text-sm text-[#64776D]">
                                            Tanggal Kunjungan
                                        </p>

                                        <p className="font-medium text-[#263D34]">
                                            {formatTanggal(item.tanggal_booking)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-[#64776D]">
                                            Jam Praktik
                                        </p>

                                        <p className="font-medium text-[#263D34]">
                                            {formatJam(item.jam_mulai)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-[#64776D]">
                                            Keluhan
                                        </p>

                                        <p className="text-[#263D34]">
                                            {item.keluhan || "-"}
                                        </p>
                                    </div>
                                </div>

                                {item.status === "Pending" && (
                                    <button
                                        type="button"
                                        onClick={() => batalkanJanjiTemu(item.id)}
                                        disabled={sedangMembatalkan === item.id}
                                        className="w-full mt-5 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sedangMembatalkan === item.id
                                            ? "Sedang membatalkan..."
                                            : "Batalkan Janji Temu"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
}