import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);
    return user?.role === "admin" ? user : null;
}

export async function GET() {
    try {
        const admin = await cekAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Akses admin diperlukan." },
                { status: 401 }
            );
        }

        const result = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.username,
                u.email,
                u.phone,
                u.sk_dokter,
                u.status_verifikasi,
                p.nama AS nama_poli
            FROM users u
            LEFT JOIN poli p ON p.id = u.poli_id
            WHERE u.role = 'dokter'
              AND u.status_verifikasi = 'menunggu'
            ORDER BY u.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Gagal mengambil pendaftaran dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Data verifikasi gagal dimuat.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const admin = await cekAdmin();

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Akses admin diperlukan." },
                { status: 401 }
            );
        }

        const { dokter_id, keputusan } = await request.json();

        if (
            !dokter_id ||
            !["terverifikasi", "ditolak"].includes(keputusan)
        ) {
            return NextResponse.json(
                { success: false, message: "Data keputusan tidak valid." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE users
             SET status_verifikasi = $1
             WHERE id = $2
               AND role = 'dokter'
               AND status_verifikasi = 'menunggu'
             RETURNING id, full_name, status_verifikasi`,
            [keputusan, dokter_id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Dokter tidak ditemukan atau sudah diproses.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message:
                keputusan === "terverifikasi"
                    ? "Dokter berhasil diverifikasi."
                    : "Pendaftaran dokter ditolak.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Gagal memproses verifikasi dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Keputusan verifikasi gagal disimpan.",
            },
            { status: 500 }
        );
    }
}