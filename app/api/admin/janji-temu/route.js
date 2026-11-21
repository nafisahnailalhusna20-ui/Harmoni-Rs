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
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil janji temu:", error);

        return NextResponse.json(
            { message: "Data janji temu gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            id,
            status,
            alasan_penolakan
        } = await request.json();

        if (
            !Number.isInteger(Number(id)) ||
            Number(id) <= 0 ||
            !["Approved", "Rejected"].includes(status)
        ) {
            return NextResponse.json(
                { message: "Data perubahan tidak valid." },
                { status: 400 }
            );
        }

        if (
            status === "Rejected" &&
            (
                typeof alasan_penolakan !== "string" ||
                !alasan_penolakan.trim()
            )
        ) {
            return NextResponse.json(
                { message: "Alasan penolakan wajib diisi." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE appointments
             SET status = $1,
                 alasan_penolakan = $2
             WHERE id = $3
               AND status = 'Pending'
             RETURNING *`,
            [
                status,
                status === "Rejected"
                    ? alasan_penolakan.trim()
                    : null,
                Number(id)
            ]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    message: "Janji temu tidak ditemukan atau sudah diproses."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: status === "Approved"
                ? "Janji temu berhasil disetujui."
                : "Janji temu berhasil ditolak.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal mengubah status janji temu:", error);

        return NextResponse.json(
            { message: "Status janji temu gagal diperbarui." },
            { status: 500 }
        );
    }
}