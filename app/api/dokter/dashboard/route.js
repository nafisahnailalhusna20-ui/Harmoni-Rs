import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekDokter() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    if (user?.role !== "dokter") {
        return null;
    }

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

        // Menghitung jumlah janji temu Pending
        const hasilPending = await pool.query(
            `SELECT COUNT(*) AS total
             FROM appointments
             WHERE dokter_id = $1
             AND status = 'Pending'`,
            [dokter.id]
        );

        // Menghitung janji temu Approved hari ini
        const hasilApprovedHariIni = await pool.query(
            `SELECT COUNT(*) AS total
             FROM appointments
             WHERE dokter_id = $1
             AND status = 'Approved'
             AND tanggal_booking = CURRENT_DATE`,
            [dokter.id]
        );

        // Mengambil 5 pasien terakhir yang sudah diperiksa
        const hasilPasienTerbaru = await pool.query(
            `SELECT
                mr.id AS medical_record_id,
                mr.created_at AS tanggal_pemeriksaan,
                a.id AS appointment_id,
                pasien.full_name AS nama_pasien,
                a.tanggal_booking,
                mr.diagnosis
             FROM medical_records mr
             JOIN appointments a
                ON mr.appointment_id = a.id
             JOIN users pasien
                ON a.pasien_id = pasien.id
             WHERE a.dokter_id = $1
             ORDER BY mr.created_at DESC
             LIMIT 5`,
            [dokter.id]
        );

        // Mengambil jadwal praktik dokter
        const hasilJadwal = await pool.query(
            `SELECT
                s.id,
                s.hari,
                s.jam_mulai,
                s.durasi,
                p.nama AS nama_poli
             FROM schedules s
             JOIN users dokter
                ON s.dokter_id = dokter.id
             LEFT JOIN poli p
                ON dokter.poli_id = p.id
             WHERE s.dokter_id = $1
             ORDER BY s.hari, s.jam_mulai`,
            [dokter.id]
        );

        return NextResponse.json({
            success: true,
            data: {
                total_pending: Number(
                    hasilPending.rows[0].total
                ),
                approved_hari_ini: Number(
                    hasilApprovedHariIni.rows[0].total
                ),
                pasien_terbaru: hasilPasienTerbaru.rows,
                jadwal_praktik: hasilJadwal.rows
            }
        });

    } catch (error) {
        console.error(
            "Gagal mengambil data dashboard dokter:",
            error
        );

        return NextResponse.json(
            {
                message: "Data dashboard dokter gagal dimuat."
            },
            { status: 500 }
        );
    }
}