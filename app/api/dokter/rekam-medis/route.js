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

// Mengambil antrean pasien dan daftar obat
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
                pasien.phone AS telepon_pasien,
                p.nama AS nama_poli
            FROM appointments a
            JOIN users pasien ON a.pasien_id = pasien.id
            JOIN users dokter ON a.dokter_id = dokter.id
            LEFT JOIN poli p ON dokter.poli_id = p.id
            LEFT JOIN medical_records mr
                ON a.id = mr.appointment_id
            WHERE a.dokter_id = $1
            AND a.status = 'Approved'
            AND mr.id IS NULL
            ORDER BY a.tanggal_booking ASC`,
            [dokter.id]
        );

        const obat = await pool.query(
            `SELECT id, nama, stok, tanggal_kadaluarsa
             FROM medicines
             WHERE tanggal_kadaluarsa IS NULL
                OR tanggal_kadaluarsa >= CURRENT_DATE
             ORDER BY nama ASC`
        );

        return NextResponse.json({
            success: true,
            data: result.rows,
            medicines: obat.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data:", error);

        return NextResponse.json(
            { message: "Data gagal dimuat." },
            { status: 500 }
        );
    }
}

// Menyimpan rekam medis sekaligus resep
export async function POST(request) {
    const client = await pool.connect();

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
            catatan,
            resep
        } = await request.json();

        if (
            !appointment_id ||
            !diagnosis?.trim() ||
            !tindakan?.trim() ||
            !Array.isArray(resep) ||
            resep.length === 0
        ) {
            return NextResponse.json(
                { message: "Diagnosis, tindakan, dan minimal satu obat wajib diisi." },
                { status: 400 }
            );
        }

        const obatTerpilih = new Set();

        for (const item of resep) {
            const obatId = Number(item.obat_id);
            const jumlah = Number(item.jumlah);

            if (
                !Number.isInteger(obatId) ||
                obatId <= 0 ||
                !Number.isInteger(jumlah) ||
                jumlah <= 0 ||
                obatTerpilih.has(obatId)
            ) {
                return NextResponse.json(
                    { message: "Data obat atau jumlah obat tidak valid." },
                    { status: 400 }
                );
            }

            obatTerpilih.add(obatId);
        }

        await client.query("BEGIN");

        const cekJanji = await client.query(
            `SELECT id
             FROM appointments
             WHERE id = $1
             AND dokter_id = $2
             AND status = 'Approved'
             FOR UPDATE`,
            [appointment_id, dokter.id]
        );

        if (cekJanji.rowCount === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Janji temu tidak ditemukan atau sudah diproses." },
                { status: 404 }
            );
        }

        for (const item of resep) {
            const cekObat = await client.query(
                `SELECT id
                 FROM medicines
                 WHERE id = $1
                 AND (
                    tanggal_kadaluarsa IS NULL
                    OR tanggal_kadaluarsa >= CURRENT_DATE
                 )`,
                [Number(item.obat_id)]
            );

            if (cekObat.rowCount === 0) {
                throw new Error("Salah satu obat tidak ditemukan atau sudah kedaluwarsa.");
            }
        }
        const rekamMedis = await client.query(
            `INSERT INTO medical_records
                (appointment_id, diagnosis, tindakan, catatan)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
                appointment_id,
                diagnosis.trim(),
                tindakan.trim(),
                typeof catatan === "string" ? catatan.trim() : ""
            ]
        );

        const medicalRecordId = rekamMedis.rows[0].id;

        const hasilResep = await client.query(
            `INSERT INTO prescriptions (medical_record_id)
             VALUES ($1)
             RETURNING id`,
            [medicalRecordId]
        );

        const prescriptionId = hasilResep.rows[0].id;

        for (const item of resep) {
            await client.query(
                `INSERT INTO prescription_items
                    (prescription_id, medicine_id, jumlah)
                 VALUES ($1, $2, $3)`,
                [
                    prescriptionId,
                    Number(item.obat_id),
                    Number(item.jumlah)
                ]
            );
        }

        await client.query(
            `UPDATE appointments
             SET status = 'Selesai'
             WHERE id = $1`,
            [appointment_id]
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Rekam medis dan resep berhasil disimpan."
        }, { status: 201 });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Gagal menyimpan rekam medis:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                { message: "Rekam medis untuk janji temu ini sudah dibuat." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: error.message || "Rekam medis dan resep gagal disimpan." },
            { status: 500 }
        );

    } finally {
        client.release();
    }
}