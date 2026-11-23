import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// ==========================================
// CEK AUTENTIKASI ADMIN
// ==========================================

async function cekAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return false;
        }

        const user = await verifyToken(token);

        const role = String(user?.role || "")
            .trim()
            .toLowerCase();

        return role === "admin";

    } catch (error) {
        console.error("Error autentikasi admin:", error);
        return false;
    }
}

// ==========================================
// GET: AMBIL SEMUA JANJI TEMU
// ==========================================

export async function GET() {
    try {
        const adminValid = await cekAdmin();

        if (!adminValid) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(`
            SELECT
                a.id,
                a.tanggal_booking,
                a.keluhan,
                a.status,
                a.alasan_penolakan,

                pasien.full_name AS nama_pasien,
                dokter.full_name AS nama_dokter,

                p.nama AS nama_poli,

                s.hari,
                s.jam_mulai

            FROM appointments a

            JOIN users pasien
                ON a.pasien_id = pasien.id

            JOIN users dokter
                ON a.dokter_id = dokter.id

            JOIN schedules s
                ON a.schedule_id = s.id

            LEFT JOIN poli p
                ON dokter.poli_id = p.id

            ORDER BY
                a.tanggal_booking DESC,
                a.id DESC
        `);

        return NextResponse.json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("GET JANJI TEMU ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gagal mengambil data janji temu.",
                error: error.message
            },
            { status: 500 }
        );
    }
}

// ==========================================
// PUT: SETUJUI ATAU TOLAK JANJI TEMU
// ==========================================

export async function PUT(request) {
    try {
        const adminValid = await cekAdmin();

        if (!adminValid) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const body = await request.json();

        const id = Number(body.id);
        const status = body.status;
        const alasan_penolakan = body.alasan_penolakan;

        // Validasi ID
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                { message: "ID janji temu tidak valid." },
                { status: 400 }
            );
        }

        // Validasi status
        if (!["Approved", "Rejected"].includes(status)) {
            return NextResponse.json(
                { message: "Status tidak valid." },
                { status: 400 }
            );
        }

        // Validasi alasan penolakan
        if (
            status === "Rejected" &&
            (
                typeof alasan_penolakan !== "string" ||
                !alasan_penolakan.trim()
            )
        ) {
            return NextResponse.json(
                {
                    message: "Alasan penolakan wajib diisi."
                },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `
                UPDATE appointments
                SET
                    status = $1,
                    alasan_penolakan = $2
                WHERE
                    id = $3
                    AND status = 'Pending'
                RETURNING *
            `,
            [
                status,
                status === "Rejected"
                    ? alasan_penolakan.trim()
                    : null,
                id
            ]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    message:
                        "Janji temu tidak ditemukan atau sudah diproses."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                status === "Approved"
                    ? "Janji temu berhasil disetujui."
                    : "Janji temu berhasil ditolak.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("PUT JANJI TEMU ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gagal memperbarui status janji temu.",
                error: error.message
            },
            { status: 500 }
        );
    }
}