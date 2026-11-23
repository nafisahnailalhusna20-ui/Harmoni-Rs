import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
    try {
        // ========================================
        // 1. CEK LOGIN PASIEN
        // ========================================

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Silakan login terlebih dahulu.",
                },
                { status: 401 }
            );
        }

        // ========================================
        // 2. VALIDASI TOKEN DAN ROLE
        // ========================================

        const user = await verifyToken(token);

        if (!user || user.role !== "pasien") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Akses ditolak.",
                },
                { status: 401 }
            );
        }

        // ========================================
        // 3. AMBIL DATA REKAM MEDIS
        // ========================================

        const result = await pool.query(
            `
            SELECT
                mr.id,
                mr.diagnosis,
                mr.tindakan,
                mr.catatan,
                mr.created_at,

                -- Data janji temu
                a.id AS appointment_id,
                a.tanggal_booking,

                -- Data dokter
                dokter.id AS dokter_id,
                dokter.full_name AS nama_dokter,
                dokter.photo AS foto_dokter,

                -- Data poli
                p.nama AS nama_poli,

                -- Data resep
                pr.id AS prescription_id,
                pr.status AS status_resep,

                -- Daftar obat dalam resep
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'nama_obat', m.nama,
                                'jumlah', pi.jumlah
                            )
                            ORDER BY m.nama
                        )
                        FROM prescription_items pi

                        JOIN medicines m
                            ON pi.medicine_id = m.id

                        WHERE pi.prescription_id = pr.id
                    ),
                    '[]'::json
                ) AS resep

            FROM medical_records mr

            JOIN appointments a
                ON mr.appointment_id = a.id

            JOIN users dokter
                ON a.dokter_id = dokter.id

            LEFT JOIN poli p
                ON dokter.poli_id = p.id

            LEFT JOIN prescriptions pr
                ON pr.medical_record_id = mr.id

            WHERE a.pasien_id = $1

            ORDER BY mr.created_at DESC
            `,
            [user.id]
        );

        // ========================================
        // 4. KIRIM DATA KE HALAMAN REKAM MEDIS
        // ========================================

        return NextResponse.json({
            success: true,
            data: result.rows,
        });

    } catch (error) {
        console.error(
            "Gagal mengambil rekam medis pasien:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Rekam medis gagal dimuat.",
            },
            { status: 500 }
        );
    }
}