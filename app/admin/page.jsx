"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    const [admin, setAdmin] = useState(null);
    const [statistik, setStatistik] = useState({
        pasien: 0,
        dokter: 0,
        janjiTemu: 0,
        obat: 0,
    });

    useEffect(() => {
        async function ambilData() {
            try {
                const cekLogin = await fetch("/api/me");
                const dataUser = await cekLogin.json();

                if (!cekLogin.ok || dataUser.user?.role !== "admin") {
                    router.push("/login");
                    return;
                }

                setAdmin(dataUser.user);

                const response = await fetch("/api/admin/statistik");
                const data = await response.json();

                if (data.success) {
                    setStatistik({
                        pasien: data.statistik.totalPasien,
                        dokter: data.statistik.dokterAktif,
                        janjiTemu: data.statistik.janjiTemu,
                        obat: data.statistik.obatMenipis,
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            }
        }

        ambilData();
    }, [router]);

    async function handleLogout() {
        await fetch("/api/logout", {
            method: "POST",
        });

        router.push("/login");
    }

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f8f6] text-gray-500">
                Memuat dashboard...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f8f6]">
            <header className="bg-white border-b px-8 py-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#28765d]">
                        HARMONI
                    </h1>
                    <p className="text-sm text-gray-500">
                        Hospital Information System
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {admin.username}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                    >
                        Keluar
                    </button>
                </div>
            </header>

            <section className="p-8">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Dashboard Admin
                </h2>

                <p className="text-gray-500 mt-1">
                    Selamat datang di halaman pengelolaan rumah sakit.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Total Pasien</p>
                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.pasien}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Dokter Aktif</p>
                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.dokter}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Janji Temu</p>
                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.janjiTemu}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">Obat Menipis</p>
                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.obat}
                        </h3>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Informasi Sistem
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                        Dashboard HARMONI digunakan untuk mengelola data
                        dan aktivitas rumah sakit melalui satu sistem.
                    </p>
                </div>
            </section>
        </main>
    );
}
