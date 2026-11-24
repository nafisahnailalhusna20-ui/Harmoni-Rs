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

// Mengedit jadwal dokter
export async function PUT(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const idJadwal = Number(id);

        if (!Number.isInteger(idJadwal) || idJadwal <= 0) {
            return NextResponse.json(
                { message: "ID jadwal tidak valid." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const dokter_id = Number(body.dokter_id);
        const hari = Number(body.hari);
        const jam_mulai = body.jam_mulai;
        const durasi = Number(body.durasi ?? 30);

        // Validasi input
        if (
            !dokter_id ||
            !hari ||
            !jam_mulai ||
            !Number.isInteger(durasi)
        ) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (!Number.isInteger(dokter_id) || dokter_id <= 0) {
            return NextResponse.json(
                { message: "Dokter tidak valid." },
                { status: 400 }
            );
        }

        if (hari < 1 || hari > 7) {
            return NextResponse.json(
                { message: "Hari tidak valid." },
                { status: 400 }
            );
        }

        if (![15, 30, 45, 60].includes(durasi)) {
            return NextResponse.json(
                { message: "Durasi praktik tidak valid." },
                { status: 400 }
            );
        }

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(jam_mulai)) {
            return NextResponse.json(
                { message: "Format jam praktik tidak valid." },
                { status: 400 }
            );
        }

        // Pastikan jadwal yang diedit memang ada
        const cekJadwal = await pool.query(
            "SELECT id FROM schedules WHERE id = $1",
            [idJadwal]
        );

        if (cekJadwal.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal tidak ditemukan." },
                { status: 404 }
            );
        }

        // Pastikan dokter tersedia
        const cekDokter = await pool.query(
            `SELECT id
             FROM users
             WHERE id = $1
             AND role = 'dokter'`,
            [dokter_id]
        );

        if (cekDokter.rowCount === 0) {
            return NextResponse.json(
                { message: "Dokter tidak ditemukan." },
                { status: 404 }
            );
        }

        // Konversi waktu menjadi menit
        const [jam, menit] = jam_mulai.split(":").map(Number);
        const menitMulai = jam * 60 + menit;
        const menitSelesai = menitMulai + durasi;

        if (menitSelesai > 24 * 60) {
            return NextResponse.json(
                {
                    message:
                        "Jam selesai praktik tidak boleh melewati tengah malam."
                },
                { status: 400 }
            );
        }

        // Cek bentrok, kecuali jadwal yang sedang diedit
        const cekBentrok = await pool.query(
            `SELECT id
             FROM schedules
             WHERE dokter_id = $1
             AND hari = $2
             AND id <> $5
             AND (
                EXTRACT(HOUR FROM jam_mulai) * 60
                + EXTRACT(MINUTE FROM jam_mulai)
             ) < $4
             AND (
                EXTRACT(HOUR FROM jam_mulai) * 60
                + EXTRACT(MINUTE FROM jam_mulai)
                + COALESCE(durasi, 30)
             ) > $3
             LIMIT 1`,
            [
                dokter_id,
                hari,
                menitMulai,
                menitSelesai,
                idJadwal
            ]
        );

        if (cekBentrok.rowCount > 0) {
            return NextResponse.json(
                {
                    message:
                        "Jadwal dokter bertabrakan dengan jadwal lain pada hari tersebut."
                },
                { status: 409 }
            );
        }

        // Perbarui jadwal
        const result = await pool.query(
            `UPDATE schedules
             SET dokter_id = $1,
                 hari = $2,
                 jam_mulai = $3,
                 durasi = $4
             WHERE id = $5
             RETURNING *`,
            [
                dokter_id,
                hari,
                jam_mulai,
                durasi,
                idJadwal
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Jadwal berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Edit jadwal:", error);

        return NextResponse.json(
            { message: "Jadwal gagal diperbarui." },
            { status: 500 }
        );
    }
}

// Mengaktifkan atau menonaktifkan jadwal
export async function PATCH(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        if (typeof body.is_active !== "boolean") {
            return NextResponse.json(
                { message: "Status jadwal tidak valid." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            `UPDATE schedules
             SET is_active = $1
             WHERE id = $2
             RETURNING *`,
            [body.is_active, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: body.is_active
                ? "Jadwal berhasil diaktifkan."
                : "Jadwal berhasil dinonaktifkan.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Ubah status jadwal:", error);

        return NextResponse.json(
            { message: "Status jadwal gagal diperbarui." },
            { status: 500 }
        );
    }
}

// Menghapus jadwal dokter
export async function DELETE(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const cekJadwal = await pool.query(
            "SELECT id FROM schedules WHERE id = $1",
            [id]
        );

        if (cekJadwal.rowCount === 0) {
            return NextResponse.json(
                { message: "Jadwal tidak ditemukan." },
                { status: 404 }
            );
        }

        const cekBooking = await pool.query(
            `SELECT id
             FROM appointments
             WHERE schedule_id = $1
             LIMIT 1`,
            [id]
        );

        if (cekBooking.rowCount > 0) {
            return NextResponse.json(
                {
                    message:
                        "Jadwal tidak dapat dihapus karena sudah digunakan dalam janji temu pasien. Riwayat booking harus tetap tersimpan."
                },
                { status: 409 }
            );
        }

        await pool.query(
            "DELETE FROM schedules WHERE id = $1",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Jadwal berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus jadwal:", error);

        if (error.code === "23503") {
            return NextResponse.json(
                {
                    message:
                        "Jadwal tidak dapat dihapus karena masih terhubung dengan data lain."
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Jadwal gagal dihapus." },
            { status: 500 }
        );
    }
}