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
    let client;

    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            prescription_id,
            status
        } = await request.json();

        if (
            !Number.isInteger(Number(prescription_id)) ||
            Number(prescription_id) <= 0 ||
            !["Siap Diambil", "Sudah Diambil"].includes(status)
        ) {
            return NextResponse.json(
                { message: "Data perubahan status tidak valid." },
                { status: 400 }
            );
        }

        client = await pool.connect();

        await client.query("BEGIN");

        const resep = await client.query(
            `SELECT id, status
             FROM prescriptions
             WHERE id = $1
             FOR UPDATE`,
            [Number(prescription_id)]
        );

        if (resep.rowCount === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                { message: "Resep tidak ditemukan." },
                { status: 404 }
            );
        }

        const statusSekarang = resep.rows[0].status;

        // Tahap 1: Resep diproses dan disiapkan.
        if (status === "Siap Diambil") {
            if (statusSekarang !== "Menunggu Diproses") {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Resep ini sudah diproses sebelumnya." },
                    { status: 409 }
                );
            }

            const obat = await client.query(
                `SELECT
                    pi.medicine_id,
                    pi.jumlah,
                    m.nama,
                    m.stok,
                    m.tanggal_kadaluarsa
                 FROM prescription_items pi
                 JOIN medicines m
                    ON pi.medicine_id = m.id
                 WHERE pi.prescription_id = $1
                 FOR UPDATE OF m`,
                [Number(prescription_id)]
            );

            if (obat.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Resep belum memiliki daftar obat." },
                    { status: 400 }
                );
            }

            for (const item of obat.rows) {
                if (item.stok < item.jumlah) {
                    await client.query("ROLLBACK");

                    return NextResponse.json(
                        {
                            message: `Stok ${item.nama} tidak mencukupi. Stok tersedia: ${item.stok}.`
                        },
                        { status: 400 }
                    );
                }

                if (
                    item.tanggal_kadaluarsa &&
                    new Date(item.tanggal_kadaluarsa) < new Date()
                ) {
                    await client.query("ROLLBACK");

                    return NextResponse.json(
                        {
                            message: `Obat ${item.nama} sudah melewati tanggal kedaluwarsa.`
                        },
                        { status: 400 }
                    );
                }
            }

            // Stok belum dikurangi pada tahap ini.
        }

        // Tahap 2: Obat diserahkan kepada pasien.
        if (status === "Sudah Diambil") {
            if (statusSekarang !== "Siap Diambil") {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    {
                        message: "Resep harus berstatus Siap Diambil terlebih dahulu."
                    },
                    { status: 409 }
                );
            }

            const obat = await client.query(
                `SELECT
                    pi.medicine_id,
                    pi.jumlah,
                    m.nama,
                    m.stok,
                    m.tanggal_kadaluarsa
                 FROM prescription_items pi
                 JOIN medicines m
                    ON pi.medicine_id = m.id
                 WHERE pi.prescription_id = $1
                 FOR UPDATE OF m`,
                [Number(prescription_id)]
            );

            if (obat.rowCount === 0) {
                await client.query("ROLLBACK");

                return NextResponse.json(
                    { message: "Resep belum memiliki daftar obat." },
                    { status: 400 }
                );
            }

            for (const item of obat.rows) {
                if (item.stok < item.jumlah) {
                    await client.query("ROLLBACK");

                    return NextResponse.json(
                        {
                            message: `Stok ${item.nama} tidak mencukupi. Stok tersedia: ${item.stok}.`
                        },
                        { status: 400 }
                    );
                }

                if (
                    item.tanggal_kadaluarsa &&
                    new Date(item.tanggal_kadalu) < new Date()
                ) {
                    await client.query("ROLLBACK");

                    return NextResponse.json(
                        {
                            message: `Obat ${item.nama} sudah melewati tanggal kedaluwarsa.`
                        },
                        { status: 400 }
                    );
                }
            }

            // Kurangi stok hanya ketika obat benar-benar diserahkan.
            for (const item of obat.rows) {
                const hasilStok = await client.query(
                    `UPDATE medicines
                     SET stok = stok - $1
                     WHERE id = $2
                       AND stok >= $1
                     RETURNING id`,
                    [item.jumlah, item.medicine_id]
                );

                if (hasilStok.rowCount === 0) {
                    throw new Error(
                        `Stok ${item.nama} tidak mencukupi.`
                    );
                }
            }
        }

        await client.query(
            `UPDATE prescriptions
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [status, Number(prescription_id)]
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: status === "Siap Diambil"
                ? "Resep berhasil diproses dan siap diambil."
                : "Obat berhasil diserahkan. Stok telah diperbarui."
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Gagal memproses resep:", error);

        return NextResponse.json(
            { message: error.message || "Resep gagal diproses." },
            { status: 500 }
        );

    } finally {
        if (client) {
            client.release();
        }
    }
}
