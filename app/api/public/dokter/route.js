import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                users.id,
                users.full_name,
                users.photo,
                poli.nama AS nama_poli
            FROM users
            LEFT JOIN poli ON users.poli_id = poli.id
            WHERE users.role = 'dokter'
            ORDER BY users.full_name ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data dokter:", error);

        return NextResponse.json(
            { message: "Data dokter gagal dimuat." },
            { status: 500 }
        );
    }
}