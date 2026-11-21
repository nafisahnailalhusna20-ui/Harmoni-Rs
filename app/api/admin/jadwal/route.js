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

        const { dokter_id, hari, jam_mulai } = await request.json();

        if (!dokter_id || !hari || !jam_mulai) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        const nomorHari = Number(hari);

        if (!Number.isInteger(nomorHari) || nomorHari < 1 || nomorHari > 7) {
            return NextResponse.json(
                { message: "Hari tidak valid." },
                { status: 400 }
            );
        }

        const cekDokter = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND role = 'dokter'",
            [dokter_id]
        );

        if (cekDokter.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        const jam = await pool.query(
            `SELECT $1::time AS mulai,
                    ($1::time + INTERVAL '30 minutes')::time AS selesai`,
            [jam_mulai]
        );

        const jamSelesai = jam.rows[0].selesai;

        const cekBentrok = await pool.query(
            `SELECT id FROM schedules
             WHERE dokter_id = $1
             AND hari = $2
             AND jam_mulai < $3
             AND (jam_mulai + durasi * INTERVAL '1 minute') > $4`,
            [dokter_id, nomorHari, jamSelesai, jam_mulai]
        );

        if (cekBentrok.rowCount > 0) {
            return NextResponse.json(
                { message: "Jadwal dokter bertabrakan dengan jadwal lain." },
                { status: 409 }
            );
        }

        const result = await pool.query(
            `INSERT INTO schedules
            (dokter_id, hari, jam_mulai, durasi, is_active)
            VALUES ($1, $2, $3, 30, TRUE)
            RETURNING *`,
            [dokter_id, nomorHari, jam_mulai]
        );

        return NextResponse.json({
            success: true,
            message: "Jadwal dokter berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menambahkan jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal dokter gagal ditambahkan." },
            { status: 500 }
        );
    }
}