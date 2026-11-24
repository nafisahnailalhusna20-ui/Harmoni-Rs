"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DaftarPoli() {
    const [dataPoli, setDataPoli] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function ambilDataPoli() {
            try {
                const response = await fetch("/api/public/poli");
                const hasil = await response.json();

                if (response.ok) {
                    setDataPoli(hasil.data || []);
                }
            } catch (error) {
                console.error("Gagal mengambil data poli:", error);
            } finally {
                setLoading(false);
            }
        }

        ambilDataPoli();
    }, []);

    const ikonPoli = [
        "✚",
        "⌁",
        "♡",
        "◉",
        "✦",
        "✧",
    ];

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4f8ff] via-[#e8f2ff] to-[#dcecff] text-[#193b60]">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#a9d5ff]/30 blur-3xl" />

            <div className="pointer-events-none absolute -right-32 top-[600px] h-[450px] w-[450px] rounded-full bg-[#b9dcff]/40 blur-3xl" />

            {/* Navbar */}
            <nav className="relative z-10 mx-auto max-w-7xl px-5 pt-6 sm:px-8">
                <div className="flex items-center justify-between rounded-[26px] border border-white/80 bg-white/55 px-5 py-4 shadow-[0_12px_40px_rgba(74,125,180,0.08)] backdrop-blur-2xl sm:px-8">

                    <Link href="/" className="group flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#78baf0] to-[#397bb9] text-xl font-semibold text-white shadow-lg shadow-blue-200/70 transition duration-300 group-hover:rotate-6 group-hover:scale-105">
                            +
                        </div>

                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[#285781] sm:text-lg">
                                HARMONI
                                <span className="ml-1 font-normal text-[#6a9bc9]">
                                    HEALTHCARE
                                </span>
                            </h2>

                            <p className="mt-0.5 text-[9px] font-medium tracking-[0.22em] text-[#8aaed1] sm:text-[10px]">
                                HOSPITAL INFORMATION SYSTEM
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link
                            href="/"
                            className="rounded-full px-3 py-2 text-sm font-medium text-[#648bb3] transition hover:bg-white/70 hover:text-[#285781]"
                        >
                            Beranda
                        </Link>

                        <Link
                            href="/login"
                            className="rounded-full bg-[#285781] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/60 transition duration-300 hover:-translate-y-0.5 hover:bg-[#356d9f] hover:shadow-xl"
                        >
                            Login
                            <span className="ml-2">↗</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">

                <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/40 px-7 py-10 shadow-[0_25px_80px_rgba(76,130,185,0.10)] backdrop-blur-2xl sm:px-12 sm:py-14 lg:px-16">

                    {/* Decorative circles */}
                    <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/70" />
                    <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border border-white/60" />

                    <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">

                        {/* Hero text */}
                        <div>
                            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/90 bg-white/65 px-4 py-2 shadow-sm backdrop-blur-xl">
                                <span className="h-2 w-2 rounded-full bg-[#65b5ed] shadow-[0_0_12px_rgba(101,181,237,0.8)]" />

                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5488b8]">
                                    Layanan Kesehatan
                                </span>
                            </div>

                            <h1 className="max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-[#193b60] sm:text-5xl lg:text-6xl">
                                Temukan layanan
                                <span className="block bg-gradient-to-r from-[#356caa] via-[#4b91cc] to-[#76bce9] bg-clip-text text-transparent">
                                    yang tepat untukmu.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-sm leading-7 text-[#7196bc] sm:text-base sm:leading-8">
                                Pilih poliklinik sesuai kebutuhan pemeriksaan
                                dan temukan layanan kesehatan di HARMONI
                                dengan lebih mudah.
                            </p>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="h-[2px] w-10 rounded-full bg-gradient-to-r from-[#5aafe8] to-[#b6dcf8]" />

                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b9bc6]">
                                    {dataPoli.length} Poliklinik tersedia
                                </p>
                            </div>
                        </div>

                        {/* Hero visual */}
                        <div className="relative mx-auto hidden w-full max-w-[300px] lg:block">
                            <div className="absolute inset-0 scale-110 rounded-full border border-white/60" />
                            <div className="absolute inset-5 rounded-full border border-white/60" />

                            <div className="relative rounded-[32px] border border-white/90 bg-white/55 p-6 shadow-[0_25px_70px_rgba(66,123,181,0.15)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2">

                                <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.15em] text-[#7da4ca]">
                                    <span>HARMONI</span>

                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                        HEALTHCARE
                                    </span>
                                </div>

                                <div className="my-9 flex justify-center">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border border-white/90 bg-gradient-to-br from-white/80 to-[#d8ebff]/80 shadow-[0_15px_40px_rgba(92,157,211,0.15)]">
                                        <span className="text-6xl font-light text-[#5aa8e3]">
                                            +
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/70 pt-4 text-[10px] font-bold tracking-[0.15em] text-[#7da4ca]">
                                    <span>CARE WITH COMFORT</span>
                                    <span>01 — 06</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Poliklinik */}
            <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">

                <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#80a7cd]">
                            Our Medical Services
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#234c75] sm:text-4xl">
                            Daftar
                            <span className="ml-2 bg-gradient-to-r from-[#427bb2] to-[#73b5e4] bg-clip-text text-transparent">
                                Poliklinik
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-sm text-sm leading-6 text-[#83a4c6]">
                        Layanan profesional untuk kebutuhan kesehatan
                        dalam satu tempat.
                    </p>
                </div>

                {loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-64 animate-pulse rounded-[28px] border border-white/80 bg-white/40"
                            />
                        ))}
                    </div>
                ) : dataPoli.length === 0 ? (
                    <div className="rounded-[28px] border border-white/80 bg-white/45 px-6 py-16 text-center shadow-lg shadow-blue-100/40 backdrop-blur-xl">
                        <p className="text-sm text-[#789bbd]">
                            Belum ada data poliklinik yang tersedia.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {dataPoli.map((poli, index) => (
                            <article
                                key={poli.id}
                                className="group relative overflow-hidden rounded-[28px] border border-white/85 bg-white/45 p-7 shadow-[0_12px_35px_rgba(83,135,184,0.07)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-white hover:bg-white/65 hover:shadow-[0_25px_55px_rgba(83,135,184,0.16)]"
                            >
                                {/* Card decoration */}
                                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/80 transition duration-500 group-hover:scale-125" />

                                <div className="relative flex items-start justify-between">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/90 bg-gradient-to-br from-white/90 to-[#dceeff]/80 text-2xl text-[#58a5df] shadow-[0_10px_25px_rgba(92,157,211,0.12)] transition duration-500 group-hover:rotate-3 group-hover:scale-105">
                                        {ikonPoli[index % ikonPoli.length]}
                                    </div>

                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/90 bg-white/65 text-lg text-[#77b6e4] shadow-sm transition duration-300 group-hover:translate-x-1 group-hover:bg-[#dceeff]">
                                        →
                                    </span>
                                </div>

                                <div className="relative mt-7">
                                    <h3 className="text-xl font-bold tracking-tight text-[#2d5d8c] transition group-hover:text-[#397db5]">
                                        {poli.nama}
                                    </h3>

                                    <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#7b9fc3]">
                                        {poli.deskripsi ||
                                            "Informasi layanan poliklinik HARMONI Healthcare."}
                                    </p>
                                </div>

                                <div className="relative mt-6 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#78bce9]" />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ab7d4]">
                                        Medical Service
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="relative mt-12 overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-[#dcecff]/80 via-white/50 to-[#cce5ff]/70 px-7 py-9 shadow-[0_20px_60px_rgba(76,130,185,0.10)] backdrop-blur-2xl sm:px-10">

                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/70" />

                    <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="text-xl font-bold text-[#285781] sm:text-2xl">
                                Mulai perjalanan sehatmu.
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[#7b9fc3]">
                                Masuk ke akun HARMONI untuk membuat janji
                                temu dengan dokter.
                            </p>
                        </div>

                        <Link
                            href="/login"
                            className="shrink-0 rounded-full bg-gradient-to-r from-[#356caa] to-[#579bd1] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            Buat Janji Temu
                            <span className="ml-3">↗</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative border-t border-white/70 bg-white/25 px-6 py-7 text-center backdrop-blur-xl">
                <p className="text-xs tracking-wide text-[#8aaaca]">
                    © 2026 HARMONI Healthcare
                    <span className="mx-2 text-[#b2cce4]">·</span>
                    Hospital Information System
                </p>
            </footer>
        </main>
    );
}
