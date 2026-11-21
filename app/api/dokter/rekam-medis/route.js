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

// GET: Mengambil daftar pasien dan obat
export async function GET() {
    try {
        const user = await cekDokter();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        // Mengambil pasien yang janji temunya sudah disetujui
        const hasilPasien = await pool.query(
            `SELECT
                a.id AS appointment_id,
                u.full_name AS nama_pasien,
                u.phone AS telepon_pasien,
                a.tanggal_booking,
                a.keluhan,
                p.nama AS nama_poli
             FROM appointments a
             JOIN users u ON a.pasien_id = u.id
             JOIN schedules s ON a.schedule_id = s.id
             JOIN users d ON s.dokter_id = d.id
             LEFT JOIN poli p ON d.poli_id = p.id
             WHERE s.dokter_id = $1
             AND a.status = 'Approved'
             AND NOT EXISTS (
                 SELECT 1
                 FROM medical_records mr
                 WHERE mr.appointment_id = a.id
             )
             ORDER BY a.tanggal_booking ASC`,
            [user.id]
        );

        // Mengambil daftar obat yang tersedia
        const hasilObat = await pool.query(
            `SELECT id, nama, stok
             FROM medicines
             ORDER BY nama ASC`
        );

        return NextResponse.json({
            success: true,
            data: hasilPasien.rows,
            medicines: hasilObat.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data rekam medis:", error);

        return NextResponse.json(
            { message: "Gagal mengambil data pasien dan obat." },
            { status: 500 }
        );
    }
}

// POST: Menyimpan rekam medis
export async function POST(request) {
    let client;
    let transaksiDimulai = false;

    try {
        const user = await cekDokter();

        if (!user) {
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
            !String(diagnosis || "").trim() ||
            !String(tindakan || "").trim()
        ) {
            return NextResponse.json(
                {
                    message: "Diagnosis dan tindakan wajib diisi."
                },
                { status: 400 }
            );
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transaksiDimulai = true;

        // Memastikan janji temu milik dokter yang login
        const janjiTemu = await client.query(
            `SELECT id, status
             FROM appointments
             WHERE id = $1
             AND dokter_id = $2
             FOR UPDATE`,
            [appointment_id, user.id]
        );

        if (janjiTemu.rowCount === 0) {
            await client.query("ROLLBACK");
            transaksiDimulai = false;

            return NextResponse.json(
                { message: "Janji temu tidak ditemukan." },
                { status: 404 }
            );
        }

        if (janjiTemu.rows[0].status !== "Approved") {
            await client.query("ROLLBACK");
            transaksiDimulai = false;

            return NextResponse.json(
                {
                    message: "Janji temu belum disetujui atau sudah selesai."
                },
                { status: 400 }
            );
        }

        // Memastikan rekam medis belum dibuat
        const cekRekamMedis = await client.query(
            `SELECT id
             FROM medical_records
             WHERE appointment_id = $1`,
            [appointment_id]
        );

        if (cekRekamMedis.rowCount > 0) {
            await client.query("ROLLBACK");
            transaksiDimulai = false;

            return NextResponse.json(
                {
                    message: "Rekam medis untuk janji temu ini sudah tersedia."
                },
                { status: 409 }
            );
        }

        // Menyimpan rekam medis
        const rekamMedis = await client.query(
            `INSERT INTO medical_records (
                appointment_id,
                diagnosis,
                tindakan,
                catatan
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                appointment_id,
                String(diagnosis).trim(),
                String(tindakan).trim(),
                typeof catatan === "string"
                    ? catatan.trim() || null
                    : null
            ]
        );

        // Mengubah status janji temu menjadi selesai
        await client.query(
            `UPDATE appointments
             SET status = 'Selesai'
             WHERE id = $1`,
            [appointment_id]
        );

        await client.query("COMMIT");
        transaksiDimulai = false;

        return NextResponse.json(
            {
                success: true,
                message: "Rekam medis berhasil disimpan.",
                data: rekamMedis.rows[0]
            },
            { status: 201 }
        );

    } catch (error) {
        if (client && transaksiDimulai) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Gagal melakukan rollback:", rollbackError);
            }
        }

        console.error("Gagal menyimpan rekam medis:", error);

        return NextResponse.json(
            { message: "Rekam medis gagal disimpan." },
            { status: 500 }
        );

    } finally {
        if (client) {
            client.release();
        }
    }
}
