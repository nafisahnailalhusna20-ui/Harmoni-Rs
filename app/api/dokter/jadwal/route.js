import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekDokter() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    if (user?.role !== "dokter") return null;

    return user;
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

        const result = await pool.query(
            `SELECT
                schedules.id,
                schedules.hari,
                schedules.jam_mulai,
                schedules.durasi,
                poli.nama AS nama_poli
            FROM schedules
            JOIN users ON schedules.dokter_id = users.id
            LEFT JOIN poli ON users.poli_id = poli.id
            WHERE schedules.dokter_id = $1
            ORDER BY schedules.hari, schedules.jam_mulai`,
            [dokter.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil jadwal dokter:", error);

        return NextResponse.json(
            { message: "Jadwal dokter gagal dimuat." },
            { status: 500 }
        );
    }
}