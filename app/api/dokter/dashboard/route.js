import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekDokter() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    if (user?.role !== "dokter") {
        return null;
    }

    return user;
}

function tanggalMakassar() {
    const bagianTanggal = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Makassar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const tahun = bagianTanggal.find(
        (item) => item.type === "year"
    ).value;

    const bulan = bagianTanggal.find(
        (item) => item.type === "month"
    ).value;

    const hari = bagianTanggal.find(
        (item) => item.type === "day"
    ).value;

    return `${tahun}-${bulan}-${hari}`;
}

export async function GET() {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const hariIni = tanggalMakassar();

        // 1. Jumlah janji temu Pending milik dokter
        const hasilPending = await pool.query(
            `SELECT COUNT(*) AS total
             FROM appointments
             WHERE dokter_id = $1
             AND status = 'Pending'`,
            [dokter.id]
        );

        // 2. Daftar janji temu Approved untuk hari ini
        const hasilJanjiHariIni = await pool.query(
            `SELECT
                a.id,
                a.tanggal_booking,
                a.keluhan,
                a.status,
                pasien.full_name AS nama_pasien,
                s.jam_mulai,
                s.durasi,
                p.nama AS nama_poli
             FROM appointments a
             JOIN users pasien
                ON a.pasien_id = pasien.id
             JOIN schedules s
                ON a.schedule_id = s.id
             LEFT JOIN poli p
                ON p.id = (
                    SELECT dokter.poli_id
                    FROM users dokter
                    WHERE dokter.id = a.dokter_id
                )
             WHERE a.dokter_id = $1
             AND a.status = 'Approved'
             AND a.tanggal_booking = $2
             ORDER BY s.jam_mulai ASC`,
            [dokter.id, hariIni]
        );

        // 3. Jadwal praktik dokter
        const hasilJadwal = await pool.query(
            `SELECT
                s.id,
                s.hari,
                s.jam_mulai,
                s.durasi,
                p.nama AS nama_poli
             FROM schedules s
             JOIN users u
                ON s.dokter_id = u.id
             LEFT JOIN poli p
                ON u.poli_id = p.id
             WHERE s.dokter_id = $1
             ORDER BY s.hari, s.jam_mulai`,
            [dokter.id]
        );

        const hasilPasienTerbaru = await pool.query(
            `SELECT
                mr.id AS medical_record_id,
                pasien.full_name AS nama_pasien,
                mr.diagnosis,
                mr.created_at AS tanggal_pemeriksaan
             FROM medical_records mr
             JOIN appointments a
                ON mr.appointment_id = a.id
             JOIN users pasien
                ON a.pasien_id = pasien.id
             WHERE a.dokter_id = $1
             ORDER BY mr.created_at DESC
             LIMIT 5`,
            [dokter.id]
        );

        return NextResponse.json({
            success: true,
            data: {
                total_pending: Number(
                    hasilPending.rows[0].total
                ),

                janji_temu_hari_ini:
                    hasilJanjiHariIni.rows,

                jadwal_praktik:
                    hasilJadwal.rows,

                pasien_terbaru:
                    hasilPasienTerbaru.rows,
            },
        });

    } catch (error) {
        console.error(
            "Gagal mengambil data dashboard dokter:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Data dashboard dokter gagal dimuat.",
            },
            { status: 500 }
        );
    }
}