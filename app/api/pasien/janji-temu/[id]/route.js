import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function PATCH(request, { params }) {
    try {
        // Ambil token login pasien
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return Response.json(
                { message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        // Verifikasi token
        const user = await verifyToken(token);

        if (!user || user.role !== "pasien") {
            return Response.json(
                { message: "Akses ditolak." },
                { status: 403 }
            );
        }

        // Ambil ID janji temu dari URL
        const { id } = await params;

        // Batalkan janji temu milik pasien yang masih Pending
        const result = await pool.query(
            `UPDATE appointments
       SET status = 'Dibatalkan'
       WHERE id = $1
         AND pasien_id = $2
         AND status = 'Pending'
       RETURNING id, status`,
            [id, user.id]
        );

        // Jika janji temu tidak ditemukan atau tidak memenuhi syarat
        if (result.rows.length === 0) {
            return Response.json(
                {
                    message:
                        "Janji temu tidak ditemukan atau tidak dapat dibatalkan."
                },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Janji temu berhasil dibatalkan.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Gagal membatalkan janji temu:", error);

        return Response.json(
            { message: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}