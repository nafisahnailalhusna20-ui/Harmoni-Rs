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

// Membatalkan janji temu pasien
export async function PATCH(request, { params }) {
    try {
        const user = await cekPasien();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const result = await pool.query(
            `UPDATE appointments
             SET status = 'Dibatalkan'
             WHERE id = $1
             AND pasien_id = $2
             AND status IN ('Pending', 'Approved')
             RETURNING id, status`,
            [id, user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    message:
                        "Janji temu tidak ditemukan atau tidak dapat dibatalkan."
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Janji temu berhasil dibatalkan.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal membatalkan janji temu:", error);

        return NextResponse.json(
            { message: "Pembatalan janji temu gagal." },
            { status: 500 }
        );
    }
}