import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                schedules.id,
                schedules.dokter_id,
                users.full_name AS nama_dokter,
                users.photo,
                poli.nama AS nama_poli,
                schedules.hari,
                schedules.jam_mulai,
                schedules.durasi
            FROM schedules
            JOIN users ON schedules.dokter_id = users.id
            LEFT JOIN poli ON users.poli_id = poli.id
            WHERE users.role = 'dokter'
            ORDER BY schedules.hari, schedules.jam_mulai
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil jadwal publik:", error);

        return NextResponse.json(
            { message: "Jadwal dokter gagal dimuat." },
            { status: 500 }
        );
    }
}