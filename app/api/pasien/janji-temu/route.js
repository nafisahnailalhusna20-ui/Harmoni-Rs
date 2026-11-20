import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekPasien() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    if (user?.role !== "pasien") return null;

    return user;
}

export async function GET() {
    try {
        const user = await cekPasien();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(`
            SELECT
                s.id,
                s.dokter_id,
                s.hari,
                s.jam_mulai,
                dokter.full_name AS nama_dokter,
                p.nama AS nama_poli
            FROM schedules s
            JOIN users dokter ON s.dokter_id = dokter.id
            LEFT JOIN poli p ON dokter.poli_id = p.id
            WHERE dokter.role = 'dokter'
            ORDER BY s.hari, s.jam_mulai
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal dokter gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await cekPasien();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { schedule_id, tanggal_booking, keluhan } =
            await request.json();

        if (!schedule_id || !tanggal_booking || !keluhan?.trim()) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        const tanggal = new Date(`${tanggal_booking}T00:00:00Z`);

        if (
            Number.isNaN(tanggal.getTime()) ||
            tanggal.toISOString().slice(0, 10) !== tanggal_booking
        ) {
            return NextResponse.json(
                { message: "Tanggal kunjungan tidak valid." },
                { status: 400 }
            );
        }

        const jadwal = await pool.query(
            `SELECT id, dokter_id, hari
             FROM schedules
             WHERE id = $1`,
            [schedule_id]
        );

        if (jadwal.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        const hariTanggal = tanggal.getUTCDay() || 7;

        if (hariTanggal !== Number(jadwal.rows[0].hari)) {
            return NextResponse.json(
                { message: "Tanggal tidak sesuai dengan hari praktik dokter." },
                { status: 400 }
            );
        }

        const tanggalHariIni = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Makassar"
        });

        if (tanggal_booking < tanggalHariIni) {
            return NextResponse.json(
                { message: "Tanggal kunjungan tidak boleh di masa lalu." },
                { status: 400 }
            );
        }

        const bentrok = await pool.query(
            `SELECT id FROM appointments
             WHERE schedule_id = $1
             AND tanggal_booking = $2
             AND status IN ('Pending', 'Approved')`,
            [schedule_id, tanggal_booking]
        );

        if (bentrok.rowCount > 0) {
            return NextResponse.json(
                { message: "Jadwal tersebut sudah dipesan pasien lain." },
                { status: 409 }
            );
        }

        const result = await pool.query(
            `INSERT INTO appointments
                (pasien_id, dokter_id, schedule_id, tanggal_booking, keluhan)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                user.id,
                jadwal.rows[0].dokter_id,
                schedule_id,
                tanggal_booking,
                keluhan.trim()
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Janji temu berhasil didaftarkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal mendaftarkan janji temu:", error);

        return NextResponse.json(
            { message: "Pendaftaran janji temu gagal." },
            { status: 500 }
        );
    }
}