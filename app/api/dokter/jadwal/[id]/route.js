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

// ================= PUT: EDIT JADWAL =================
export async function PUT(request, { params }) {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { success: false, message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const hari = Number(body.hari);
        const jam_mulai = body.jam_mulai;
        const durasi = Number(body.durasi);

        if (
            !Number.isInteger(hari) ||
            hari < 1 ||
            hari > 7 ||
            !jam_mulai ||
            !Number.isInteger(durasi) ||
            durasi < 15 ||
            durasi > 240
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Hari, jam, atau durasi jadwal tidak valid."
                },
                { status: 400 }
            );
        }

        const bentrok = await pool.query(
            `SELECT id
             FROM schedules
             WHERE dokter_id = $1
               AND hari = $2
               AND jam_mulai = $3
               AND id <> $4`,
            [dokter.id, hari, jam_mulai, id]
        );

        if (bentrok.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Jadwal pada hari dan jam tersebut sudah tersedia."
                },
                { status: 409 }
            );
        }

        const result = await pool.query(
            `UPDATE schedules
             SET hari = $1,
                 jam_mulai = $2,
                 durasi = $3
             WHERE id = $4
               AND dokter_id = $5
             RETURNING id, hari, jam_mulai, durasi`,
            [hari, jam_mulai, durasi, id, dokter.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Jadwal tidak ditemukan atau bukan milik Anda."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Jadwal praktik berhasil diperbarui.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Gagal mengedit jadwal:", error);

        return NextResponse.json(
            { success: false, message: "Jadwal gagal diperbarui." },
            { status: 500 }
        );
    }
}

// ================= DELETE: HAPUS JADWAL =================
export async function DELETE(request, { params }) {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { success: false, message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const result = await pool.query(
            `DELETE FROM schedules
             WHERE id = $1
               AND dokter_id = $2
             RETURNING id`,
            [id, dokter.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Jadwal tidak ditemukan atau bukan milik Anda."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Jadwal praktik berhasil dihapus."
        });
    } catch (error) {
        console.error("Gagal menghapus jadwal:", error);

        return NextResponse.json(
            { success: false, message: "Jadwal gagal dihapus." },
            { status: 500 }
        );
    }
}