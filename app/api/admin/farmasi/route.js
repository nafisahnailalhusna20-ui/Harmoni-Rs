import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return false;

    const user = await verifyToken(token);
    return user?.role === "admin";
}

export async function GET() {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(`
            SELECT
                p.id AS prescription_id,
                p.status,
                p.updated_at,
                pasien.full_name AS nama_pasien,
                dokter.full_name AS nama_dokter,
                a.tanggal_booking,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'nama_obat', m.nama,
                            'jumlah', pi.jumlah,
                            'stok', m.stok
                        )
                    ) FILTER (WHERE pi.id IS NOT NULL),
                    '[]'
                ) AS daftar_obat
            FROM prescriptions p
            JOIN medical_records mr
                ON p.medical_record_id = mr.id
            JOIN appointments a
                ON mr.appointment_id = a.id
            JOIN users pasien
                ON a.pasien_id = pasien.id
            JOIN users dokter
                ON a.dokter_id = dokter.id
            LEFT JOIN prescription_items pi
                ON p.id = pi.prescription_id
            LEFT JOIN medicines m
                ON pi.medicine_id = m.id
            GROUP BY
                p.id,
                p.status,
                p.updated_at,
                pasien.full_name,
                dokter.full_name,
                a.tanggal_booking
            ORDER BY p.updated_at DESC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil resep:", error);

        return NextResponse.json(
            { message: "Data resep gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    const client = await pool.connect();

    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { prescription_id, status } = await request.json();

        if (!prescription_id || !["Siap Diambil", "Sudah Diambil"].includes(status)) {
            return NextResponse.json(
                { message: "Data perubahan status tidak valid." },
                { status: 400 }
            );
        }

        await client.query("BEGIN");

        const resep = await client.query(
            `SELECT id, status
             FROM prescriptions
             WHERE id = $1
             FOR UPDATE`,
            [prescription_id]
        );

        if (resep.rowCount === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Resep tidak ditemukan." },
                { status: 404 }
            );
        }

        const statusSekarang = resep.rows[0].status;

        if (
            status === "Siap Diambil" &&
            statusSekarang !== "Menunggu Diproses"
        ) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Resep ini sudah diproses sebelumnya." },
                { status: 400 }
            );
        }

        if (
            status === "Sudah Diambil" &&
            statusSekarang !== "Siap Diambil"
        ) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Resep harus berstatus Siap Diambil terlebih dahulu." },
                { status: 400 }
            );
        }

        if (status === "Siap Diambil") {
            const obat = await client.query(
                `SELECT
                    pi.medicine_id,
                    pi.jumlah,
                    m.nama,
                    m.stok
                 FROM prescription_items pi
                 JOIN medicines m
                    ON pi.medicine_id = m.id
                 WHERE pi.prescription_id = $1
                 FOR UPDATE OF m`,
                [prescription_id]
            );

            if (obat.rowCount === 0) {
                throw new Error("Resep belum memiliki daftar obat.");
            }

            for (const item of obat.rows) {
                if (item.stok < item.jumlah) {
                    throw new Error(
                        `Stok ${item.nama} tidak mencukupi. Stok tersedia: ${item.stok}.`
                    );
                }
            }

            for (const item of obat.rows) {
                await client.query(
                    `UPDATE medicines
                     SET stok = stok - $1
                     WHERE id = $2`,
                    [item.jumlah, item.medicine_id]
                );
            }
        }

        await client.query(
            `UPDATE prescriptions
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [status, prescription_id]
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: `Status resep berhasil diubah menjadi ${status}.`
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Gagal memproses resep:", error);

        return NextResponse.json(
            { message: error.message || "Resep gagal diproses." },
            { status: 500 }
        );

    } finally {
        client.release();
    }
}