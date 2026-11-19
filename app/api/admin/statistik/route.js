import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM users WHERE role = 'pasien') AS total_pasien,
                (SELECT COUNT(*) FROM users WHERE role = 'dokter') AS dokter_aktif,
                (SELECT COUNT(*) FROM appointments) AS total_janji_temu,
                (SELECT COUNT(*) FROM medicines WHERE stok <= 10) AS obat_menipis
        `);

        const data = result.rows[0];

        return NextResponse.json({
            success: true,
            statistik: {
                totalPasien: Number(data.total_pasien),
                dokterAktif: Number(data.dokter_aktif),
                janjiTemu: Number(data.total_janji_temu),
                obatMenipis: Number(data.obat_menipis),
            },
        });

    } catch (error) {
        console.error("Statistik error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gagal mengambil data statistik.",
            },
            { status: 500 }
        );
    }
}
