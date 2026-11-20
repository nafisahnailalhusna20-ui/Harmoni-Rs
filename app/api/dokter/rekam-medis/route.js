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
                a.id AS appointment_id,
                a.tanggal_booking,
                a.keluhan,
                pasien.full_name AS nama_pasien,
                pasien.phone AS telepon_pasien
            FROM appointments a
            JOIN users pasien ON a.pasien_id = pasien.id
            LEFT JOIN medical_records mr
                ON a.id = mr.appointment_id
            WHERE a.dokter_id = $1
            AND a.status = 'Approved'
            AND mr.id IS NULL
            ORDER BY a.tanggal_booking ASC`,
            [dokter.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data rekam medis:", error);

        return NextResponse.json(
            { message: "Data rekam medis gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            appointment_id,
            diagnosis,
            tindakan,
            catatan
        } = await request.json();

        if (
            !appointment_id ||
            !diagnosis?.trim() ||
            !tindakan?.trim()
        ) {
            return NextResponse.json(
                { message: "Janji temu, diagnosis, dan tindakan wajib diisi." },
                { status: 400 }
            );
        }

        const cekJanji = await pool.query(
            `SELECT id
             FROM appointments
             WHERE id = $1
             AND dokter_id = $2
             AND status = 'Approved'`,
            [appointment_id, dokter.id]
        );

        if (cekJanji.rowCount === 0) {
            return NextResponse.json(
                { message: "Janji temu tidak ditemukan atau belum disetujui." },
                { status: 404 }
            );
        }

        const cekRekamMedis = await pool.query(
            `SELECT id
             FROM medical_records
             WHERE appointment_id = $1`,
            [appointment_id]
        );

        if (cekRekamMedis.rowCount > 0) {
            return NextResponse.json(
                { message: "Rekam medis untuk janji temu ini sudah dibuat." },
                { status: 409 }
            );
        }

        const result = await pool.query(
            `INSERT INTO medical_records
                (appointment_id, diagnosis, tindakan, catatan)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                appointment_id,
                diagnosis.trim(),
                tindakan.trim(),
                typeof catatan === "string" ? catatan.trim() : null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Rekam medis berhasil disimpan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menyimpan rekam medis:", error);

        return NextResponse.json(
            { message: "Rekam medis gagal disimpan." },
            { status: 500 }
        );
    }
}