"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DokterPage() {
    const router = useRouter();
    const [dokter, setDokter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function ambilDataDokter() {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.success) {
                    router.push("/login");
                    return;
                }

                if (data.user.role !== "dokter") {
                    router.push("/login");
                    return;
                }

                setDokter(data.user);

            } catch (error) {
                console.error("Gagal mengambil data dokter:", error);
            } finally {
                setLoading(false);
            }
        }

        ambilDataDokter();
    }, [router]);

    async function logout() {
        await fetch("/api/logout", {
            method: "POST"
        });

        router.push("/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8F0EC] text-[#397A63]">
                Memuat dashboard...
            </div>
        );
    }

    if (!dokter) return null;

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#263D34]">
                            Dashboard Dokter
                        </h1>

                        <p className="text-[#64776D] mt-2">
                            Selamat datang, {dokter.username}.
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="bg-red-100 text-red-600 px-5 py-2 rounded-xl hover:bg-red-200"
                    >
                        Logout
                    </button>
                </div>

                <div className="mt-8 bg-white/70 border border-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#263D34]">
                        Halo, Dokter!
                    </h2>

                    <p className="text-[#64776D] mt-2">
                        Selamat bekerja. Kelola konsultasi dan rekam medis
                        pasien melalui dashboard ini.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-white">
                        <h3 className="text-lg font-semibold text-[#263D34]">
                            Janji Temu Pasien
                        </h3>

                        <p className="text-sm text-[#64776D] mt-2">
                            Lihat dan validasi janji temu pasien yang masuk.
                        </p>

                        <button
                            onClick={() => router.push("/dokter/janji-temu")}
                            className="mt-5 bg-[#397A63] text-white px-5 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            Lihat Janji Temu
                        </button>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-white">
                        <h3 className="text-lg font-semibold text-[#263D34]">
                            Rekam Medis
                        </h3>

                        <p className="text-sm text-[#64776D] mt-2">
                            Catat hasil pemeriksaan, diagnosis, tindakan,
                            dan resep obat pasien.
                        </p>

                        <button
                            onClick={() => router.push("/dokter/rekam-medis")}
                            className="mt-5 bg-[#397A63] text-white px-5 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            Buka Rekam Medis
                        </button>
                    </div>

                </div>

            </div>
        </main>
    );
}