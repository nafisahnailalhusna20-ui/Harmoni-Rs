import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return false;

    const user = await verifyToken(token);
    return user?.role === "admin";
}

// Mengambil semua jadwal dokter
export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(`
            SELECT
                schedules.id,
                schedules.dokter_id,
                users.full_name AS nama_dokter,
                poli.nama AS nama_poli,
                schedules.hari,
                schedules.jam_mulai,
                schedules.durasi,
                COALESCE(schedules.is_active, TRUE) AS is_active
            FROM schedules
            JOIN users ON schedules.dokter_id = users.id
            LEFT JOIN poli ON users.poli_id = poli.id
            ORDER BY schedules.hari, schedules.jam_mulai
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

// Menambahkan jadwal dokter
export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const dokter_id = Number(body.dokter_id);
        const hari = Number(body.hari);
        const jam_mulai = body.jam_mulai;
        const durasi = Number(body.durasi ?? 30);

        // Validasi input
        if (
            !dokter_id ||
            !hari ||
            !jam_mulai ||
            !Number.isInteger(durasi)
        ) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (!Number.isInteger(dokter_id) || dokter_id <= 0) {
            return NextResponse.json(
                { message: "Dokter tidak valid." },
                { status: 400 }
            );
        }

        if (hari < 1 || hari > 7) {
            return NextResponse.json(
                { message: "Hari tidak valid." },
                { status: 400 }
            );
        }

        if (!Number.isFinite(durasi) || durasi <= 0) {
            return NextResponse.json(
                { message: "Rentang jam praktik tidak valid." },
                { status: 400 }
            );
        }

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(jam_mulai)) {
            return NextResponse.json(
                { message: "Format jam praktik tidak valid." },
                { status: 400 }
            );
        }

        // Pastikan dokter tersedia
        const cekDokter = await pool.query(
            `SELECT id
             FROM users
             WHERE id = $1
             AND role = 'dokter'`,
            [dokter_id]
        );

        if (cekDokter.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        // Konversi jam mulai menjadi menit
        const [jam, menit] = jam_mulai.split(":").map(Number);
        const menitMulai = jam * 60 + menit;
        const menitSelesai = menitMulai + durasi;

        // Jadwal tidak boleh melewati tengah malam
        if (menitSelesai > 24 * 60) {
            return NextResponse.json(
                {
                    message:
                        "Jam selesai praktik tidak boleh melewati tengah malam."
                },
                { status: 400 }
            );
        }

        // Cek jadwal yang bertabrakan
        const cekBentrok = await pool.query(
            `SELECT id
             FROM schedules
             WHERE dokter_id = $1
             AND hari = $2
             AND (
                EXTRACT(HOUR FROM jam_mulai) * 60
                + EXTRACT(MINUTE FROM jam_mulai)
             ) < $4
             AND (
                EXTRACT(HOUR FROM jam_mulai) * 60
                + EXTRACT(MINUTE FROM jam_mulai)
                + COALESCE(durasi, 30)
             ) > $3
             LIMIT 1`,
            [
                dokter_id,
                hari,
                menitMulai,
                menitSelesai
            ]
        );

        if (cekBentrok.rowCount > 0) {
            return NextResponse.json(
                {
                    message:
                        "Jadwal dokter bertabrakan dengan jadwal lain pada hari tersebut."
                },
                { status: 409 }
            );
        }

        // Simpan jadwal
        const result = await pool.query(
            `INSERT INTO schedules
                (dokter_id, hari, jam_mulai, durasi, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             RETURNING *`,
            [
                dokter_id,
                hari,
                jam_mulai,
                durasi
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Jadwal dokter berhasil ditambahkan.",
                data: result.rows[0]
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Gagal menambahkan jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal dokter gagal ditambahkan." },
            { status: 500 }
        );
    }
}