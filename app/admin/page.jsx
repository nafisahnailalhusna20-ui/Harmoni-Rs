"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

    const menuAdmin = [
        {
            nama: "Manajemen Poli",
            deskripsi: "Kelola data poli rumah sakit.",
            href: "/admin/poli",
        },
        {
            nama: "Manajemen Dokter",
            deskripsi: "Kelola data dokter dan poli.",
            href: "/admin/dokter",
        },
        {
            nama: "Manajemen Obat",
            deskripsi: "Kelola data dan stok obat.",
            href: "/admin/obat",
        },
        {
            nama: "Manajemen Jadwal",
            deskripsi: "Atur jadwal praktik dokter.",
            href: "/admin/jadwal",
        },
        {
            nama: "Manajemen Pasien",
            deskripsi: "Kelola data pasien rumah sakit.",
            href: "/admin/pasien",
        },
        {
            nama: "Manajemen Janji Temu",
            deskripsi: "Kelola dan verifikasi janji temu.",
            href: "/admin/janji-temu",
        },
    ];

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f8f6] text-gray-500">
                Memuat dashboard...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f8f6]">
            <header className="bg-white border-b px-6 md:px-8 py-5 flex justify-between items-center">
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
                        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                    >
                        Keluar
                    </button>
                </div>
            </header>

            <section className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Dashboard Admin
                </h2>

                <p className="text-gray-500 mt-1">
                    Selamat datang di halaman pengelolaan rumah sakit.
                </p>

                {/* Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">
                            Total Pasien
                        </p>

                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.pasien}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">
                            Dokter Aktif
                        </p>

                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.dokter}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">
                            Janji Temu
                        </p>

                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.janjiTemu}
                        </h3>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-500">
                            Obat Menipis
                        </p>

                        <h3 className="text-3xl font-bold text-[#28765d] mt-3">
                            {statistik.obat}
                        </h3>
                    </div>
                </div>

                {/* Menu Pengelolaan */}
                <div className="mt-10">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Menu Pengelolaan
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                        Pilih menu untuk mengelola data rumah sakit.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                        {menuAdmin.map((menu) => (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                className="bg-white p-6 rounded-xl border border-gray-100 hover:border-[#28765d] hover:shadow-md transition group"
                            >
                                <h4 className="text-lg font-semibold text-gray-800 group-hover:text-[#28765d]">
                                    {menu.nama}
                                </h4>

                                <p className="text-sm text-gray-500 mt-2">
                                    {menu.deskripsi}
                                </p>

                                <p className="text-sm font-medium text-[#28765d] mt-5">
                                    Buka menu →
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Informasi Sistem */}
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