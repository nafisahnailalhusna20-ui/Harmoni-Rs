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

    return (
        <main className="min-h-screen bg-[#f8fafc]">
            <nav className="flex items-center justify-between border-b bg-white px-8 py-5">
                <Link href="/" className="text-xl font-bold text-teal-700">
                    HARMONI HEALTHCARE
                </Link>

                <div className="flex items-center gap-5">
                    <Link href="/" className="text-sm text-gray-600 hover:text-teal-700">
                        Beranda
                    </Link>
                    <Link href="/login" className="text-sm text-gray-600 hover:text-teal-700">
                        Login
                    </Link>
                </div>
            </nav>

            <section className="mx-auto max-w-6xl px-6 py-14">
                <div className="mb-10 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-700">
                        Layanan Kami
                    </p>

                    <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
                        Daftar Poliklinik
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-500">
                        Temukan layanan kesehatan yang tersedia di HARMONI Healthcare
                        sesuai dengan kebutuhan Anda.
                    </p>
                </div>

                {loading ? (
                    <p className="py-12 text-center text-gray-500">
                        Memuat data poliklinik...
                    </p>
                ) : dataPoli.length === 0 ? (
                    <p className="py-12 text-center text-gray-500">
                        Belum ada data poliklinik yang tersedia.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {dataPoli.map((poli) => (
                            <div
                                key={poli.id}
                                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                                    P
                                </div>

                                <h2 className="text-lg font-semibold text-gray-800">
                                    {poli.nama}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    {poli.deskripsi || "Informasi layanan poliklinik HARMONI Healthcare."}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 rounded-2xl bg-teal-700 px-6 py-9 text-center text-white">
                    <h2 className="text-xl font-semibold">
                        Butuh pemeriksaan kesehatan?
                    </h2>

                    <p className="mt-2 text-sm text-teal-50">
                        Masuk atau daftar akun untuk membuat janji temu dengan dokter.
                    </p>

                    <Link
                        href="/login"
                        className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                    >
                        Buat Janji Temu
                    </Link>
                </div>
            </section>

            <footer className="border-t bg-white px-6 py-6 text-center text-sm text-gray-500">
                © 2026 HARMONI Healthcare. All rights reserved.
            </footer>
        </main>
    );
}