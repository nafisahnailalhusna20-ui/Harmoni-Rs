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
             LEFT JOIN poli p ON u.poli_id = p.id
             WHERE a.dokter_id = $1
             AND a.status = 'Approved'
             AND NOT EXISTS (
                 SELECT 1
                 FROM medical_records mr
                 WHERE mr.appointment_id = a.id
             )
             ORDER BY a.tanggal_booking ASC`,
            [user.id]
        );

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

// POST: Menyimpan rekam medis dan resep
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
            catatan,
            resep
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

        // Memastikan resep berisi minimal satu obat
        if (!Array.isArray(resep) || resep.length === 0) {
            return NextResponse.json(
                { message: "Pilih minimal satu obat." },
                { status: 400 }
            );
        }

        // Memastikan ID obat dan jumlahnya valid
        const resepValid = resep.map((item) => ({
            obat_id: Number(item.obat_id),
            jumlah: Number(item.jumlah)
        }));

        if (
            resepValid.some(
                (item) =>
                    !Number.isInteger(item.obat_id) ||
                    item.obat_id <= 0 ||
                    !Number.isInteger(item.jumlah) ||
                    item.jumlah <= 0
            )
        ) {
            return NextResponse.json(
                {
                    message: "Obat dan jumlah harus diisi dengan benar."
                },
                { status: 400 }
            );
        }

        // Obat yang sama tidak boleh dimasukkan dua kali
        const daftarIdObat = resepValid.map(
            (item) => item.obat_id
        );

        if (new Set(daftarIdObat).size !== daftarIdObat.length) {
            return NextResponse.json(
                {
                    message: "Obat yang sama tidak boleh dipilih dua kali."
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
            throw new Error("JANJI_TEMU_TIDAK_DITEMUKAN");
        }

        if (janjiTemu.rows[0].status !== "Approved") {
            throw new Error("JANJI_TEMU_TIDAK_VALID");
        }

        // Memastikan rekam medis belum pernah dibuat
        const cekRekamMedis = await client.query(
            `SELECT id
             FROM medical_records
             WHERE appointment_id = $1`,
            [appointment_id]
        );

        if (cekRekamMedis.rowCount > 0) {
            throw new Error("REKAM_MEDIS_SUDAH_ADA");
        }

        // Memastikan obat tersedia dan stok mencukupi
        const hasilObat = await client.query(
            `SELECT id, nama, stok
             FROM medicines
             WHERE id = ANY($1::int[])
             FOR UPDATE`,
            [daftarIdObat]
        );

        if (hasilObat.rowCount !== daftarIdObat.length) {
            throw new Error("OBAT_TIDAK_DITEMUKAN");
        }

        for (const item of resepValid) {
            const obat = hasilObat.rows.find(
                (data) => data.id === item.obat_id
            );

            if (obat.stok <= 0) {
                throw new Error("STOK_OBAT_HABIS");
            }

            if (item.jumlah > obat.stok) {
                throw new Error("STOK_OBAT_TIDAK_CUKUP");
            }
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
                String(catatan || "").trim()
            ]
        );

        const medicalRecordId = rekamMedis.rows[0].id;

        // Membuat data resep
        const hasilResep = await client.query(
            `INSERT INTO prescriptions (medical_record_id)
             VALUES ($1)
             RETURNING id, status`,
            [medicalRecordId]
        );

        const prescriptionId = hasilResep.rows[0].id;

        // Menyimpan setiap obat dalam resep
        for (const item of resepValid) {
            await client.query(
                `INSERT INTO prescription_items (
                    prescription_id,
                    medicine_id,
                    jumlah
                )
                VALUES ($1, $2, $3)`,
                [
                    prescriptionId,
                    item.obat_id,
                    item.jumlah
                ]
            );
        }

        // Mengubah janji temu menjadi selesai
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
                message: "Rekam medis dan resep berhasil disimpan.",
                data: {
                    medical_record: rekamMedis.rows[0],
                    prescription: hasilResep.rows[0]
                }
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

        const pesanError = {
            JANJI_TEMU_TIDAK_DITEMUKAN:
                "Janji temu tidak ditemukan.",
            JANJI_TEMU_TIDAK_VALID:
                "Janji temu belum disetujui atau sudah selesai.",
            REKAM_MEDIS_SUDAH_ADA:
                "Rekam medis untuk janji temu ini sudah tersedia.",
            OBAT_TIDAK_DITEMUKAN:
                "Obat yang dipilih tidak ditemukan.",
            STOK_OBAT_HABIS:
                "Salah satu obat sedang habis.",
            STOK_OBAT_TIDAK_CUKUP:
                "Jumlah obat melebihi stok yang tersedia."
        };

        if (pesanError[error.message]) {
            const status =
                error.message === "REKAM_MEDIS_SUDAH_ADA"
                    ? 409
                    : 400;

            return NextResponse.json(
                { message: pesanError[error.message] },
                { status }
            );
        }

        console.error("Gagal menyimpan rekam medis dan resep:", error);

        return NextResponse.json(
            { message: "Rekam medis dan resep gagal disimpan." },
            { status: 500 }
        );

    } finally {
        if (client) {
            client.release();
        }
    }
}
