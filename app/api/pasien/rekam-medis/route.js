import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (user?.role !== "pasien") {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT
                mr.id,
                mr.diagnosis,
                mr.tindakan,
                mr.catatan,
                mr.created_at,
                a.tanggal_booking,
                dokter.full_name AS nama_dokter,
                p.nama AS nama_poli,
                pr.status AS status_resep,

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
                ON mr.id = pr.medical_record_id

            WHERE a.pasien_id = $1

            ORDER BY mr.created_at DESC`,
            [user.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil rekam medis:", error);

        return NextResponse.json(
            { message: "Rekam medis gagal dimuat." },
            { status: 500 }
        );
    }
}