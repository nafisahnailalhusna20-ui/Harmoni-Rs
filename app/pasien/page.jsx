"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PasienPage() {
    const router = useRouter();
    const [pasien, setPasien] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function ambilData() {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok || !data.success) {
                    router.push("/login");
                    return;
                }

                if (data.user.role !== "pasien") {
                    router.push("/login");
                    return;
                }

                setPasien(data.user);
            } catch (error) {
                console.error("Gagal mengambil data pasien:", error);
            } finally {
                setLoading(false);
            }
        }

        ambilData();
    }, [router]);

    async function logout() {
        await fetch("/api/logout", {
            method: "POST"
        });

        router.push("/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E8F0EC]">
                Memuat dashboard...
            </div>
        );
    }

    if (!pasien) return null;

    return (
        <main className="min-h-screen bg-[#E8F0EC] p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#263D34]">
                            Dashboard Pasien
                        </h1>

                        <p className="text-[#64776D] mt-2">
                            Selamat datang, {pasien.username}.
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
                        Selamat Datang
                    </h2>

                    <p className="text-[#64776D] mt-2">
                        Gunakan dashboard ini untuk melakukan pendaftaran
                        janji temu dan melihat layanan kesehatan rumah sakit.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-white">
                        <h3 className="text-lg font-semibold text-[#263D34]">
                            Janji Temu
                        </h3>

                        <p className="text-sm text-[#64776D] mt-2">
                            Lihat jadwal dokter dan buat janji temu pemeriksaan.
                        </p>

                        <button
                            onClick={() => router.push("/pasien/janji-temu")}
                            className="mt-5 bg-[#397A63] text-white px-5 py-2 rounded-xl hover:bg-[#2e6551]"
                        >
                            Buat Janji Temu
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}