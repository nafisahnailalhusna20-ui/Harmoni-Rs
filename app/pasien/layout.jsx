"use client";

import { usePathname, useRouter } from "next/navigation";

const MENU_PASIEN = [
    {
        nama: "Beranda",
        href: "/pasien",
    },
    {
        nama: "Janji Temu",
        href: "/pasien/janji-temu",
    },
    {
        nama: "Rekam Medis",
        href: "/pasien/rekam-medis",
    },
    {
        nama: "Riwayat Kunjungan",
        href: "/pasien/riwayat",
    },
        {
        nama: "Cari Obat",
        href: "/pasien/obat",
    },
    {
        nama: "Profil Saya",
        href: "/pasien/profil",
    },
];

export default function PasienLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    async function logout() {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
        } finally {
            router.push("/login");
        }
    }

    return (
        <div className="min-h-screen bg-[#eaf4fc] p-3 sm:p-6 lg:p-8">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1500px] gap-5">

                {/* SIDEBAR */}
                <aside className="flex w-[230px] shrink-0 flex-col rounded-[32px] border border-white/70 bg-white/35 p-5 shadow-[0_20px_60px_rgba(70,120,165,0.12)] backdrop-blur-3xl">

                    {/* Logo */}
                    <div className="mb-8 px-3 pt-3">
                        <h1 className="text-2xl font-extrabold tracking-[0.25em] text-[#315f88]">
                            HARMONI
                        </h1>

                        <p className="mt-2 text-[10px] tracking-[0.12em] text-[#7198bb]">
                            Hospital Information
                        </p>
                    </div>

                    {/* Menu */}
                    <nav className="flex flex-col gap-2">
                        {MENU_PASIEN.map((menu) => {
                            const aktif = pathname === menu.href;

                            return (
                                <button
                                    key={menu.href}
                                    onClick={() => router.push(menu.href)}
                                    className={`rounded-2xl px-4 py-4 text-left text-sm transition-all duration-300 ${
                                        aktif
                                            ? "bg-white/85 font-semibold text-[#2b5a84] shadow-[0_8px_25px_rgba(75,125,165,0.14)]"
                                            : "text-[#6388a9] hover:bg-white/50 hover:text-[#2b5a84]"
                                    }`}
                                >
                                    {menu.nama}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout di paling bawah */}
                    <div className="mt-auto pt-8">
                        <div className="mb-4 border-t border-white/60" />

                        <button
                            onClick={logout}
                            className="w-full rounded-2xl border border-white/70 bg-white/45 px-4 py-4 text-left text-sm font-semibold text-[#6b8eae] transition hover:bg-white/80 hover:text-[#315f88]"
                        >
                            ↗ Keluar
                        </button>

                        <p className="mt-4 px-2 text-[10px] text-[#8aa9c6]">
                            HARMONI Healthcare
                        </p>
                    </div>
                </aside>

                {/* ISI HALAMAN */}
                <div className="min-w-0 flex-1">
                    {children}
                </div>

            </div>
        </div>
    );
}