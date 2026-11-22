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
            deskripsi: "Kelola unit pelayanan dan informasi poli rumah sakit.",
            href: "/admin/poli",
            kategori: "MASTER DATA",
        },
        {
            nama: "Manajemen Dokter",
            deskripsi: "Atur data dokter serta penempatan poli.",
            href: "/admin/dokter",
            kategori: "MASTER DATA",
        },
        {
            nama: "Manajemen Obat",
            deskripsi: "Pantau data obat dan ketersediaan stok.",
            href: "/admin/obat",
            kategori: "FARMASI",
        },
        {
            nama: "Manajemen Jadwal",
            deskripsi: "Kelola jadwal praktik dokter rumah sakit.",
            href: "/admin/jadwal",
            kategori: "OPERASIONAL",
        },
        {
            nama: "Manajemen Pasien",
            deskripsi: "Lihat dan kelola data pasien terdaftar.",
            href: "/admin/pasien",
            kategori: "DATA PASIEN",
        },
        {
            nama: "Manajemen Janji Temu",
            deskripsi: "Periksa dan verifikasi pengajuan konsultasi.",
            href: "/admin/janji-temu",
            kategori: "PELAYANAN",
        },
    ];

    const statistikItems = [
        {
            label: "Total pasien",
            angka: statistik.pasien,
            catatan: "Terdaftar di sistem",
        },
        {
            label: "Dokter aktif",
            angka: statistik.dokter,
            catatan: "Tenaga medis",
        },
        {
            label: "Janji temu",
            angka: statistik.janjiTemu,
            catatan: "Seluruh data booking",
        },
        {
            label: "Obat menipis",
            angka: statistik.obat,
            catatan: "Perlu pemeriksaan stok",
        },
    ];

    if (!admin) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#eaf2fb]">
                <p className="text-sm tracking-wide text-[#6484a8]">
                    Menyiapkan HARMONI...
                </p>
            </main>
        );
    }

    return (
        <main className="harmoni-admin relative min-h-screen overflow-hidden text-[#29476b]">
            {/* Ambient background */}
            <div className="admin-light admin-light-one" />
            <div className="admin-light admin-light-two" />

            {/* Header */}
            <header className="admin-header sticky top-0 z-30">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 md:px-12">
                    <Link href="/admin" className="group">
                        <h1 className="text-[22px] font-bold tracking-[0.14em] text-[#315b88]">
                            HARMONI
                        </h1>

                        <p className="mt-1 text-[10px] tracking-[0.16em] text-[#829bb8]">
                            HOSPITAL INFORMATION SYSTEM
                        </p>
                    </Link>

                    <div className="flex items-center gap-5">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-[#315b88]">
                                {admin.username}
                            </p>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#91a9c5]">
                                Administrator
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="admin-logout"
                        >
                            Keluar
                            <span>↗</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-[1500px] px-6 pb-12 pt-10 md:px-12 md:pt-14">
                {/* Hero */}
                <section className="admin-hero">
                    <div className="admin-hero-copy">
                        <p className="admin-eyebrow">
                            ADMINISTRATION / OVERVIEW
                        </p>

                        <h2>
                            Rumah sakit,
                            <br />
                            <span>dalam satu kendali.</span>
                        </h2>

                        <p className="admin-hero-description">
                            Selamat datang kembali, {admin.username}.
                            Berikut ringkasan aktivitas dan pengelolaan
                            rumah sakit hari ini.
                        </p>
                    </div>

                    <div className="admin-hero-note">
                        <span className="admin-note-line" />

                        <p>
                            CARE THROUGH
                            <br />
                            CONNECTION
                        </p>

                        <span className="admin-note-year">
                            HARMONI · 2026
                        </span>
                    </div>
                </section>

                {/* Statistics */}
                <section className="admin-stat-section">
                    <div className="admin-section-heading">
                        <div>
                            <p className="admin-eyebrow">
                                SYSTEM OVERVIEW
                            </p>

                            <h3>Ringkasan data</h3>
                        </div>

                        <p className="admin-section-caption">
                            Data yang tercatat dalam sistem
                        </p>
                    </div>

                    <div className="admin-stat-panel">
                        {statistikItems.map((item, index) => (
                            <div
                                key={item.label}
                                className={`admin-stat-item ${index === 0 ? "admin-stat-featured" : ""
                                    }`}
                            >
                                <p className="admin-stat-label">
                                    {item.label}
                                </p>

                                <h4>{item.angka}</h4>

                                <p className="admin-stat-note">
                                    {item.catatan}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Management */}
                <section className="admin-management-section">
                    <div className="admin-section-heading">
                        <div>
                            <p className="admin-eyebrow">
                                WORKSPACE
                            </p>

                            <h3>Pengelolaan rumah sakit</h3>
                        </div>

                        <p className="admin-section-caption">
                            Pilih area pengelolaan
                        </p>
                    </div>

                    <div className="admin-menu-list">
                        {menuAdmin.map((menu, index) => (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                className="admin-menu-item"
                            >
                                <div className="admin-menu-index">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                                <div className="admin-menu-content">
                                    <p className="admin-menu-category">
                                        {menu.kategori}
                                    </p>

                                    <h4>{menu.nama}</h4>

                                    <p className="admin-menu-description">
                                        {menu.deskripsi}
                                    </p>
                                </div>

                                <div className="admin-menu-action">
                                    <span>Buka</span>
                                    <span className="admin-menu-arrow">↗</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer information */}
                <section className="admin-bottom-note">
                    <div>
                        <p className="admin-eyebrow">
                            ABOUT THE SYSTEM
                        </p>

                        <h3>HARMONI</h3>
                    </div>

                    <p>
                        Sistem informasi rumah sakit untuk mendukung
                        pengelolaan data, pelayanan, dan aktivitas
                        operasional secara terintegrasi.
                    </p>

                    <span className="admin-bottom-tag">
                        BUILT WITH CARE.
                    </span>
                </section>

                <footer className="admin-footer">
                    <span>© HARMONI 2026</span>

                    <span>Hospital Information System</span>
                </footer>
            </div>
        </main>
    );
}