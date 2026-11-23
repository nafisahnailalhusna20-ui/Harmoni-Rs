"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPasien() {
    const router = useRouter();

    const [namaPasien, setNamaPasien] = useState("Pasien");
    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);

    useEffect(() => {
        let masihAktif = true;

        async function ambilProfil() {
            try {
                const response = await fetch("/api/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                const data = await response.json();

                if (!masihAktif) return;

                if (response.ok) {
                    const user = data.user || data.data || data;

                    setNamaPasien(
                        user.full_name ||
                        user.nama ||
                        user.name ||
                        user.username ||
                        "Pasien"
                    );
                }
            } catch (error) {
                console.error("Gagal mengambil profil:", error);
            } finally {
                if (masihAktif) {
                    setLoading(false);
                    setLogoutLoading(false);
                }
            }
        }

        ambilProfil();

        return () => {
            masihAktif = false;
        };
    }, []);

    async function handleLogout() {
        if (logoutLoading) return;

        setLogoutLoading(true);

        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Logout gagal.");
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Gagal logout:", error);
            alert("Logout gagal. Silakan coba kembali.");
        } finally {
            setLogoutLoading(false);
        }
    }

    const layanan = [
        {
            nomor: "01",
            label: "APPOINTMENT",
            judul: "Janji Temu",
            deskripsi:
                "Temukan jadwal pemeriksaan yang sesuai dan atur kunjunganmu dengan lebih mudah.",
            href: "/pasien/janji-temu",
            simbol: "◷",
            warna: "from-[#E5F1FF] to-[#F7FBFF]",
        },
        {
            nomor: "02",
            label: "MEDICAL RECORD",
            judul: "Rekam Medis",
            deskripsi:
                "Seluruh catatan pemeriksaan dan informasi kesehatan tersimpan dalam satu tempat.",
            href: "/pasien/rekam-medis",
            simbol: "＋",
            warna: "from-[#E8F4F5] to-[#F8FCFC]",
        },
        {
            nomor: "03",
            label: "VISIT ARCHIVE",
            judul: "Riwayat Kunjungan",
            deskripsi:
                "Telusuri kembali perjalanan pemeriksaan dan kunjungan yang pernah dilakukan.",
            href: "/pasien/riwayat",
            simbol: "↻",
            warna: "from-[#EDEBFA] to-[#FAF9FF]",
        },
        {
            nomor: "04",
            label: "PERSONAL DATA",
            judul: "Profil Saya",
            deskripsi:
                "Pastikan informasi pribadi dan data akunmu selalu tersimpan dengan benar.",
            href: "/pasien/profil",
            simbol: "⌘",
            warna: "from-[#F5EAF2] to-[#FFFAFD]",
        },
    ];

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#F3F7FC] text-[#31577F]">

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-48 -top-48 h-[650px] w-[650px] rounded-full bg-[#C9E2FF]/50 blur-[130px]" />

                <div className="absolute -bottom-56 -left-48 h-[600px] w-[600px] rounded-full bg-[#DCEBFA]/60 blur-[130px]" />

                <div className="absolute left-[38%] top-[42%] h-[300px] w-[300px] rounded-full bg-white/50 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">

                <header className="flex flex-col gap-5 border-b border-[#DCE8F5] py-7 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-[0.25em] text-[#31577F] sm:text-[27px]">
                                HARMONI
                            </h1>
                        </div>

                        <span className="h-7 w-px bg-[#BBD2EA]" />

                        <p className="text-xs tracking-[0.12em] text-[#7A9FC5]">
                            Hospital Information System
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="hidden items-center gap-2.5 rounded-full border border-white/80 bg-white/55 px-4 py-2.5 shadow-[0_5px_20px_rgba(74,115,160,0.06)] backdrop-blur-xl sm:flex">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>

                            <span className="text-[11px] tracking-wide text-[#7898B9]">
                                Patient portal
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={logoutLoading}
                            className="rounded-full border border-white/90 bg-white/65 px-5 py-2.5 text-sm text-[#527CA7] shadow-[0_5px_20px_rgba(74,115,160,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(74,115,160,0.13)] disabled:cursor-wait disabled:opacity-60"
                        >
                            {logoutLoading ? "Keluar..." : "Keluar ↗"}
                        </button>
                    </div>
                </header>

                <section className="grid gap-10 py-12 lg:grid-cols-[1fr_310px] lg:items-end lg:py-16">

                    <div>
                        <div className="mb-6 flex items-center gap-3">
                            <span className="h-px w-9 bg-[#83ACD6]" />

                            <p className="text-[10px] font-semibold tracking-[0.32em] text-[#83A5C9]">
                                PERSONAL HEALTH SPACE
                            </p>
                        </div>

                        <h2 className="max-w-3xl text-[38px] font-medium leading-[1.16] tracking-[-0.04em] text-[#31577F] sm:text-5xl lg:text-[58px]">
                            Selamat datang,
                            <br />

                            <span className="font-normal text-[#7CA8D5]">
                                {loading ? "..." : namaPasien}.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-xl text-sm leading-7 text-[#7899BA] sm:text-base">
                            Ruang pribadimu untuk mengakses layanan kesehatan,
                            memantau pemeriksaan, dan menjaga informasi tetap
                            terorganisir.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-[26px] border border-white/90 bg-white/40 p-6 shadow-[0_18px_50px_rgba(91,132,176,0.07)] backdrop-blur-2xl">

                        <div className="absolute -right-5 -top-8 h-32 w-32 rounded-full border border-[#C5DDF5]/70" />

                        <div className="absolute -right-1 -top-4 h-24 w-24 rounded-full border border-[#C5DDF5]/50" />

                        <div className="relative">
                            <p className="text-[10px] tracking-[0.25em] text-[#8BAAC9]">
                                YOUR CARE SPACE
                            </p>

                            <div className="mt-5 flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-light tracking-tight text-[#4776A4]">
                                        H+
                                    </p>

                                    <p className="mt-2 text-xs leading-5 text-[#88A6C4]">
                                        Health, made
                                        <br />
                                        more personal.
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/90 bg-gradient-to-br from-white/90 to-[#DCEBFA] text-xl text-[#719CC8] shadow-[0_8px_24px_rgba(105,151,197,0.12)]">
                                    ✳
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#88A8C9]">
                            THE PATIENT DIRECTORY
                        </p>

                        <h3 className="text-2xl font-medium tracking-tight text-[#31577F] sm:text-3xl">
                            Layanan kesehatan
                        </h3>
                    </div>

                    <p className="max-w-sm text-sm leading-6 text-[#86A4C3]">
                        Empat ruang layanan yang dirancang untuk menemani
                        perjalanan perawatanmu.
                    </p>
                </section>

                <section className="grid gap-5 lg:grid-cols-12">

                    <Link
                        href={layanan[0].href}
                        className="group relative flex min-h-[330px] flex-col justify-between overflow-hidden rounded-[30px] border border-white/90 bg-gradient-to-br from-white/75 via-[#F5FAFF]/65 to-[#DCEEFF]/70 p-7 shadow-[0_20px_60px_rgba(88,132,179,0.09)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(88,132,179,0.16)] sm:p-9 lg:col-span-7"
                    >
                        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-[#BBD9F5]/60 transition duration-700 group-hover:scale-110" />

                        <div className="pointer-events-none absolute -right-5 top-8 h-52 w-52 rounded-full border border-[#C8E0F7]/60" />

                        <div className="relative flex items-start justify-between">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/65 text-2xl text-[#6F9FCB] shadow-[0_8px_25px_rgba(92,143,192,0.10)]">
                                {layanan[0].simbol}
                            </div>

                            <span className="text-[11px] tracking-[0.25em] text-[#91B2D2]">
                                {layanan[0].nomor} / 04
                            </span>
                        </div>

                        <div className="relative mt-10">
                            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#8CAFD1]">
                                {layanan[0].label}
                            </p>

                            <h4 className="mt-3 text-3xl font-medium tracking-tight text-[#31577F] sm:text-4xl">
                                {layanan[0].judul}
                            </h4>

                            <p className="mt-4 max-w-md text-sm leading-7 text-[#789BBF]">
                                {layanan[0].deskripsi}
                            </p>
                        </div>

                        <div className="relative mt-8 flex items-center justify-between border-t border-white/80 pt-5">
                            <span className="text-xs tracking-wide text-[#729BC3]">
                                Buka layanan
                            </span>

                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/65 text-[#6F9FCB] transition duration-300 group-hover:rotate-45 group-hover:bg-white">
                                ↗
                            </span>
                        </div>
                    </Link>

                    <div className="grid gap-5 lg:col-span-5">

                        {layanan.slice(1).map((item) => (
                            <Link
                                key={item.nomor}
                                href={item.href}
                                className="group relative flex items-center gap-5 overflow-hidden rounded-[25px] border border-white/90 bg-white/45 p-5 shadow-[0_12px_35px_rgba(88,132,179,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_20px_45px_rgba(88,132,179,0.12)] sm:p-6"
                            >
                                <div
                                    className={`flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[22px] border border-white/90 bg-gradient-to-br ${item.warna} text-2xl text-[#709CC6] shadow-[0_8px_25px_rgba(92,143,192,0.08)] transition duration-300 group-hover:scale-105`}
                                >
                                    {item.simbol}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] tracking-[0.2em] text-[#9AB5D1]">
                                            {item.nomor}
                                        </span>

                                        <span className="h-px w-5 bg-[#C5D9ED]" />
                                    </div>

                                    <h4 className="mt-2 text-lg font-medium text-[#3C6792] transition group-hover:text-[#6598C8] sm:text-xl">
                                        {item.judul}
                                    </h4>

                                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#87A4C1] sm:text-sm">
                                        {item.deskripsi}
                                    </p>
                                </div>

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/60 text-sm text-[#7DA5CC] transition duration-300 group-hover:rotate-45 group-hover:bg-white">
                                    ↗
                                </span>
                            </Link>
                        ))}

                    </div>
                </section>

                <footer className="mt-14 flex flex-col gap-4 border-t border-[#DCE8F5] py-7 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-[#5E87B0]">
                            HARMONI
                        </p>

                        <p className="mt-1 text-[10px] tracking-wide text-[#9AB4CF]">
                            Hospital Information System
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-[#B9D2EA]" />

                        <p className="text-xs text-[#89A7C6]">
                            A healthier journey, one step at a time.
                        </p>
                    </div>
                </footer>

            </div>
        </main>
    );
}