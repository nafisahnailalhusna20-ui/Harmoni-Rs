"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const daftarHari = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
    7: "Minggu",
};

function jamSelesai(jamMulai, durasi) {
    const [jam, menit] = String(jamMulai)
        .slice(0, 5)
        .split(":")
        .map(Number);

    const totalMenit = jam * 60 + menit + Number(durasi || 30);
    const jamAkhir = Math.floor(totalMenit / 60) % 24;
    const menitAkhir = totalMenit % 60;

    return `${String(jamAkhir).padStart(2, "0")}:${String(menitAkhir).padStart(2, "0")}`;
}

export default function DaftarDokter() {
    const [dataDokter, setDataDokter] = useState([]);
    const [dataJadwal, setDataJadwal] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function ambilData() {
            try {
                const [responseDokter, responseJadwal] = await Promise.all([
                    fetch("/api/public/dokter"),
                    fetch("/api/public/jadwal"),
                ]);

                const hasilDokter = await responseDokter.json();
                const hasilJadwal = await responseJadwal.json();

                if (responseDokter.ok) {
                    setDataDokter(hasilDokter.data || []);
                }

                if (responseJadwal.ok) {
                    setDataJadwal(hasilJadwal.data || []);
                }
            } catch (error) {
                console.error("Gagal mengambil data dokter dan jadwal:", error);
            } finally {
                setLoading(false);
            }
        }

        ambilData();
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

                    <Link href="/poli" className="text-sm text-gray-600 hover:text-teal-700">
                        Daftar Poli
                    </Link>

                    <Link href="/login" className="text-sm text-gray-600 hover:text-teal-700">
                        Login
                    </Link>
                </div>
            </nav>

            <section className="mx-auto max-w-6xl px-6 py-14">
                <div className="mb-10 text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-700">
                        Tenaga Medis
                    </p>

                    <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
                        Dokter Kami
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-gray-500">
                        Kenali dokter yang tersedia di HARMONI Healthcare
                        dan lihat jadwal praktik mereka.
                    </p>
                </div>

                {loading ? (
                    <p className="py-12 text-center text-gray-500">
                        Memuat data dokter...
                    </p>
                ) : dataDokter.length === 0 ? (
                    <p className="py-12 text-center text-gray-500">
                        Belum ada dokter yang tersedia.
                    </p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {dataDokter.map((dokter) => {
                            const jadwalDokter = dataJadwal.filter(
                                (jadwal) => Number(jadwal.dokter_id) === Number(dokter.id)
                            );

                            return (
                                <div
                                    key={dokter.id}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="flex justify-center bg-teal-50 py-7">
                                        {dokter.photo ? (
                                            <img
                                                src={dokter.photo}
                                                alt={`Foto ${dokter.full_name}`}
                                                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-teal-100 text-3xl font-bold text-teal-700">
                                                {dokter.full_name?.charAt(0)?.toUpperCase() || "D"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="text-center">
                                            <h2 className="text-lg font-semibold text-gray-800">
                                                {dokter.full_name}
                                            </h2>

                                            <p className="mt-2 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
                                                {dokter.nama_poli || "Poli belum ditentukan"}
                                            </p>
                                        </div>

                                        <div className="mt-6 border-t border-gray-100 pt-5">
                                            <h3 className="mb-3 text-sm font-semibold text-gray-700">
                                                Jadwal Praktik
                                            </h3>

                                            {jadwalDokter.length === 0 ? (
                                                <p className="text-sm text-gray-500">
                                                    Jadwal belum tersedia.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {jadwalDokter.map((jadwal) => (
                                                        <div
                                                            key={jadwal.id}
                                                            className="rounded-xl bg-gray-50 px-4 py-3"
                                                        >
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {daftarHari[Number(jadwal.hari)] || "-"}
                                                            </p>

                                                            <p className="mt-1 text-sm text-teal-700">
                                                                {String(jadwal.jam_mulai).slice(0, 5)}
                                                                {" - "}
                                                                {jamSelesai(jadwal.jam_mulai, jadwal.durasi)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 rounded-2xl bg-teal-700 px-6 py-9 text-center text-white">
                    <h2 className="text-xl font-semibold">
                        Ingin berkonsultasi dengan dokter?
                    </h2>

                    <p className="mt-2 text-sm text-teal-50">
                        Login terlebih dahulu untuk membuat janji temu.
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