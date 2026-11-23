"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STATUS = {
    Pending: {
        label: "Menunggu",
        dot: "bg-amber-300",
        badge: "bg-amber-50/80 text-amber-700 border-amber-100",
        number: "text-amber-600",
    },
    Approved: {
        label: "Disetujui",
        dot: "bg-blue-300",
        badge: "bg-blue-50/80 text-blue-700 border-blue-100",
        number: "text-blue-600",
    },
    Selesai: {
        label: "Selesai",
        dot: "bg-sky-300",
        badge: "bg-sky-50/80 text-sky-700 border-sky-100",
        number: "text-sky-600",
    },
    Rejected: {
        label: "Ditolak",
        dot: "bg-rose-200",
        badge: "bg-rose-50/80 text-rose-600 border-rose-100",
        number: "text-rose-500",
    },
    Dibatalkan: {
        label: "Dibatalkan",
        dot: "bg-slate-300",
        badge: "bg-slate-100/80 text-slate-500 border-slate-200",
        number: "text-slate-500",
    },
};

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const date = new Date(
        `${tanggal}`.slice(0, 10) + "T00:00:00"
    );

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getStatus(status) {
    return STATUS[status] || STATUS.Pending;
}

function Icon({ name, className = "w-5 h-5" }) {
    const icons = {
        arrow: (
            <path
                d="M5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        ),
        calendar: (
            <>
                <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M7 3v4m10-4v4M3 10h18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </>
        ),
        clock: (
            <>
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </>
        ),
        search: (
            <>
                <circle
                    cx="10.8"
                    cy="10.8"
                    r="6.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                />
                <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
            </>
        ),
        location: (
            <>
                <path
                    d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            </>
        ),
    };

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
}

function DoctorPhoto({ item }) {
    const [imageError, setImageError] = useState(false);

    const photo = item.foto_dokter;

    if (photo && !imageError) {
        return (
            <img
                src={photo}
                alt={`Foto ${item.nama_dokter || "dokter"}`}
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e5edff] via-[#eef1ff] to-[#f5eaff]">
            <div className="flex flex-col items-center gap-2 text-[#7798c8]">
                <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    className="h-12 w-12"
                >
                    <circle
                        cx="32"
                        cy="21"
                        r="11"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    />
                    <path
                        d="M12 55c1-13 9-20 20-20s19 7 20 20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                </svg>
                <span className="text-[9px] font-semibold tracking-[0.2em]">
                    HARMONI
                </span>
            </div>
        </div>
    );
}

export default function RiwayatPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("Semua");
    const [cancelLoading, setCancelLoading] = useState(null);

    async function loadRiwayat() {
        try {
            setLoading(true);

            const response = await fetch(
                "/api/pasien/janji-temu?riwayat=true",
                {
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (response.ok && result.success) {
                setData(result.data || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Gagal memuat riwayat:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadRiwayat();
    }, []);

    const jumlah = useMemo(() => {
        return {
            total: data.length,
            pending: data.filter(
                (item) => item.status === "Pending"
            ).length,
            approved: data.filter(
                (item) => item.status === "Approved"
            ).length,
            selesai: data.filter(
                (item) => item.status === "Selesai"
            ).length,
        };
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const keyword = search.toLowerCase();

            const cocokSearch =
                (item.nama_dokter || "")
                    .toLowerCase()
                    .includes(keyword) ||
                (item.nama_poli || "")
                    .toLowerCase()
                    .includes(keyword) ||
                (item.keluhan || "")
                    .toLowerCase()
                    .includes(keyword);

            const cocokStatus =
                filter === "Semua" ||
                item.status === filter;

            return cocokSearch && cocokStatus;
        });
    }, [data, search, filter]);

    async function batalkanJanji(id) {
        const yakin = window.confirm(
            "Batalkan janji temu ini? Riwayat tetap tersimpan."
        );

        if (!yakin) return;

        try {
            setCancelLoading(id);

            const response = await fetch(
                `/api/pasien/janji-temu/${id}`,
                {
                    method: "PATCH",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(
                    result.message ||
                    "Janji temu gagal dibatalkan."
                );
                return;
            }

            await loadRiwayat();
        } catch (error) {
            console.error(
                "Gagal membatalkan janji:",
                error
            );

            alert(
                "Terjadi kesalahan saat membatalkan janji temu."
            );
        } finally {
            setCancelLoading(null);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#edf3ff] text-[#355d8b]">
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#dce9ff]/70 blur-[110px]" />
                <div className="absolute -right-40 top-10 h-[550px] w-[550px] rounded-full bg-[#e5ddff]/60 blur-[130px]" />
                <div className="absolute bottom-0 left-1/3 h-[400px] w-[600px] rounded-full bg-[#d9edff]/50 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-14 lg:py-12">
                <header className="mb-10 flex items-center justify-between gap-4">
                    <Link
                        href="/pasien"
                        className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-5 py-3 text-sm font-medium text-[#6285b3] shadow-[0_8px_24px_rgba(89,123,174,0.08)] backdrop-blur-2xl transition hover:bg-white/80"
                    >
                        <span className="transition group-hover:-translate-x-1">
                            ←
                        </span>
                        Dashboard
                    </Link>

                    <div className="hidden items-center gap-3 sm:flex">
                        <span className="h-2 w-2 rounded-full bg-[#b5cdea]" />
                        <span className="text-[10px] font-semibold tracking-[0.28em] text-[#8aa7cb]">
                            HARMONI · PATIENT SPACE
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8aa7cb]">
                        <span className="h-2 w-2 rounded-full bg-[#b9d9d0]" />
                        Portal pasien
                    </div>
                </header>

                {/* Header */}
                <section className="relative mb-8 overflow-hidden rounded-[34px] border border-white/80 bg-white/45 p-7 shadow-[0_30px_90px_rgba(93,126,177,0.10)] backdrop-blur-3xl sm:p-10 lg:p-14">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-[340px] w-[340px] rounded-full border border-[#d4e3fb]/70" />
                    <div className="pointer-events-none absolute -right-5 -top-12 h-[250px] w-[250px] rounded-full border border-[#d4e3fb]/60" />

                    <div className="relative flex flex-col justify-between gap-9 lg:flex-row lg:items-end">
                        <div className="max-w-3xl">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="h-px w-8 bg-[#a9c5e8]" />
                                <p className="text-[10px] font-semibold tracking-[0.28em] text-[#91afd4]">
                                    YOUR PERSONAL CARE JOURNAL
                                </p>
                            </div>

                            <h1 className="text-4xl font-semibold tracking-[-0.055em] text-[#365f91] sm:text-5xl lg:text-6xl">
                                Riwayat
                                <span className="ml-3 font-normal text-[#88a9d5]">
                                    kunjungan.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-[#8ba6c8] sm:text-base">
                                Semua catatan konsultasi dan jadwal dokter
                                tersimpan rapi dalam satu ruang.
                            </p>
                        </div>

                        <Link
                            href="/pasien/janji-temu"
                            className="group inline-flex shrink-0 items-center justify-between gap-8 rounded-full border border-white/30 bg-[#789dce] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(103,145,197,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#6f95c7]"
                        >
                            Buat janji baru
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition group-hover:translate-x-1 group-hover:bg-white/30">
                                <Icon name="arrow" />
                            </span>
                        </Link>
                    </div>

                    <div className="relative mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[#dce8f8]/80 pt-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#426b9e]">
                                {String(jumlah.total).padStart(2, "0")}
                            </span>
                            <span className="text-xs text-[#91aaca]">
                                Total kunjungan
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#c69a58]">
                                {String(jumlah.pending).padStart(2, "0")}
                            </span>
                            <span className="text-xs text-[#91aaca]">
                                Menunggu konfirmasi
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#789bc9]">
                                {String(jumlah.approved).padStart(2, "0")}
                            </span>
                            <span className="text-xs text-[#91aaca]">
                                Disetujui
                            </span>
                        </div>
                    </div>
                </section>

                {/* Status overview */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            label: "Menunggu",
                            value: jumlah.pending,
                            color: "text-[#c69a58]",
                            orb: "bg-[#fff1cf]/80",
                        },
                        {
                            label: "Disetujui",
                            value: jumlah.approved,
                            color: "text-[#779ac8]",
                            orb: "bg-[#dce9ff]/90",
                        },
                        {
                            label: "Selesai",
                            value: jumlah.selesai,
                            color: "text-[#83adc9]",
                            orb: "bg-[#dff1fa]/90",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="group relative overflow-hidden rounded-[26px] border border-white/80 bg-white/45 px-6 py-5 shadow-[0_18px_50px_rgba(92,126,174,0.07)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/65"
                        >
                            <div
                                className={`absolute -right-4 -top-7 h-24 w-24 rounded-full ${item.orb} blur-2xl`}
                            />

                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#91aaca]">
                                        {item.label}
                                    </p>
                                    <p
                                        className={`mt-2 text-3xl font-semibold tracking-tight ${item.color}`}
                                    >
                                        {item.value}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.orb} shadow-inner`}
                                >
                                    <span className="h-2 w-2 rounded-full bg-current opacity-50" />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Appointment list */}
                <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/40 p-5 shadow-[0_30px_90px_rgba(93,126,177,0.09)] backdrop-blur-3xl sm:p-8 lg:p-10">
                    <div className="mb-8 flex flex-col gap-6 border-b border-[#dce8f8]/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] text-[#98b3d5]">
                                APPOINTMENT JOURNAL
                            </p>

                            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#426991] sm:text-3xl">
                                Janji temu kamu
                            </h2>

                            <p className="mt-2 text-sm text-[#91aaca]">
                                Catatan perjalanan konsultasimu.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/90 bg-white/60 px-4 py-3 shadow-[0_8px_24px_rgba(91,125,174,0.05)] backdrop-blur-xl sm:w-72">
                                <Icon
                                    name="search"
                                    className="h-4 w-4 shrink-0 text-[#91afd3]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari dokter atau poli..."
                                    className="w-full bg-transparent text-sm text-[#426991] outline-none placeholder:text-[#a6bad3]"
                                />
                            </label>

                            <select
                                value={filter}
                                onChange={(event) =>
                                    setFilter(event.target.value)
                                }
                                className="rounded-2xl border border-white/90 bg-white/60 px-4 py-3 text-sm text-[#7898bc] outline-none backdrop-blur-xl"
                            >
                                <option value="Semua">Semua status</option>
                                <option value="Pending">Menunggu</option>
                                <option value="Approved">Disetujui</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Rejected">Ditolak</option>
                                <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-5 lg:grid-cols-2">
                            {[1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="h-64 animate-pulse rounded-[28px] border border-white/80 bg-white/50"
                                />
                            ))}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cdddf1] bg-white/25 px-6 py-16 text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/70 text-[#91afd3] shadow-sm">
                                <Icon
                                    name="calendar"
                                    className="h-7 w-7"
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-[#52769f]">
                                Belum ada catatan yang cocok
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-[#9ab0cc]">
                                Coba ubah pencarian atau pilih status yang
                                berbeda.
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute bottom-8 left-[19px] top-8 hidden w-px bg-gradient-to-b from-[#c7d9f0] via-[#dce6f6] to-transparent sm:block" />

                            <div className="space-y-5">
                                {filteredData.map((item, index) => {
                                    const status = getStatus(item.status);

                                    // Pembatalan hanya untuk Pending
                                    const canCancel =
                                        item.status === "Pending";

                                    return (
                                        <article
                                            key={item.id}
                                            className="group relative sm:pl-12"
                                        >
                                            <div className="absolute left-[12px] top-8 z-10 hidden h-4 w-4 items-center justify-center rounded-full border-[3px] border-[#edf3ff] bg-[#9eb9dc] shadow-[0_0_0_5px_rgba(255,255,255,0.55)] sm:flex" />

                                            <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/55 p-5 shadow-[0_18px_50px_rgba(87,120,169,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:bg-white/75 sm:p-6">
                                                <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#e2ebff]/50 blur-3xl transition group-hover:bg-[#d9e7ff]/70" />

                                                <div className="relative flex flex-col gap-5 sm:flex-row">
                                                    {/* Foto dokter */}
                                                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[25px] border-[5px] border-white/90 bg-[#e9f0ff] shadow-[0_12px_30px_rgba(94,128,179,0.16)] sm:h-32 sm:w-32">
                                                        <DoctorPhoto item={item} />

                                                        <div className="absolute bottom-2 left-2 right-2 rounded-full border border-white/50 bg-white/60 px-2 py-1 text-center text-[8px] font-semibold tracking-[0.15em] text-[#7293bd] backdrop-blur-md">
                                                            HARMONI CARE
                                                        </div>
                                                    </div>

                                                    {/* Detail janji */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-[9px] font-semibold tracking-[0.2em] text-[#9bb5d7]">
                                                                    DOKTER PILIHAN
                                                                </p>

                                                                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#426991]">
                                                                    {item.nama_dokter ||
                                                                        "Dokter"}
                                                                </h3>

                                                                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#91aaca]">
                                                                    <Icon
                                                                        name="location"
                                                                        className="h-3.5 w-3.5"
                                                                    />
                                                                    {item.nama_poli ||
                                                                        "Poli"}
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium ${status.badge}`}
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                                                />
                                                                {status.label}
                                                            </span>
                                                        </div>

                                                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div className="rounded-2xl border border-white/80 bg-[#edf3ff]/65 px-4 py-3">
                                                                <div className="flex items-center gap-2 text-[10px] text-[#9ab2d1]">
                                                                    <Icon
                                                                        name="calendar"
                                                                        className="h-3.5 w-3.5"
                                                                    />
                                                                    TANGGAL
                                                                </div>

                                                                <p className="mt-2 text-sm font-semibold text-[#52769f]">
                                                                    {formatTanggal(
                                                                        item.tanggal_booking
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <div className="rounded-2xl border border-white/80 bg-[#edf3ff]/65 px-4 py-3">
                                                                <div className="flex items-center gap-2 text-[10px] text-[#9ab2d1]">
                                                                    <Icon
                                                                        name="clock"
                                                                        className="h-3.5 w-3.5"
                                                                    />
                                                                    JAM PRAKTIK
                                                                </div>

                                                                <p className="mt-2 text-sm font-semibold text-[#52769f]">
                                                                    {item.jam_mulai
                                                                        ? String(
                                                                            item.jam_mulai
                                                                        ).slice(
                                                                            0,
                                                                            5
                                                                        )
                                                                        : "-"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Keluhan */}
                                                <div className="relative mt-5 rounded-2xl border border-[#e2eafa]/90 bg-white/45 px-4 py-4">
                                                    <p className="text-[9px] font-semibold tracking-[0.16em] text-[#a0b7d5]">
                                                        CATATAN KUNJUNGAN
                                                    </p>

                                                    <p className="mt-2 break-words text-sm leading-6 text-[#7898bc]">
                                                        {item.keluhan ||
                                                            "Tidak ada keluhan yang dicatat."}
                                                    </p>

                                                    {item.status ===
                                                        "Rejected" &&
                                                        item.alasan_penolakan && (
                                                            <div className="mt-3 rounded-xl bg-[#f7eff5]/70 px-3 py-2.5">
                                                                <p className="text-[9px] font-semibold tracking-[0.12em] text-[#b28ca5]">
                                                                    CATATAN DOKTER
                                                                </p>

                                                                <p className="mt-1 text-xs leading-5 text-[#a1849a]">
                                                                    {
                                                                        item.alasan_penolakan
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                </div>

                                                {/* Footer */}
                                                <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
                                                    <span className="text-[10px] tracking-[0.12em] text-[#a1b6d1]">
                                                        JOURNAL NO.{" "}
                                                        {String(
                                                            index + 1
                                                        ).padStart(2, "0")}
                                                    </span>

                                                    {canCancel && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                batalkanJanji(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                cancelLoading ===
                                                                item.id
                                                            }
                                                            className="rounded-full border border-[#e7dce8]/80 bg-[#fbf5fa]/70 px-4 py-2 text-xs font-medium text-[#a78ca7] transition hover:border-[#dfcddd] hover:bg-[#f8edf6] disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {cancelLoading ===
                                                                item.id
                                                                ? "Membatalkan..."
                                                                : "Batalkan janji"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                <footer className="py-8 text-center">
                    <p className="text-[9px] font-medium tracking-[0.25em] text-[#a2b8d4]">
                        HARMONI HEALTHCARE · YOUR CARE, YOUR JOURNEY
                    </p>
                </footer>
            </div>
        </main>
    );
}