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

const daftarHari = {
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
    minggu: 7
};

// ================= GET: AMBIL JADWAL DOKTER =================
export async function GET() {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { success: false, message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT
                schedules.id,
                schedules.hari,
                schedules.jam_mulai,
                schedules.durasi,
                poli.nama AS nama_poli
            FROM schedules
            JOIN users ON schedules.dokter_id = users.id
            LEFT JOIN poli ON users.poli_id = poli.id
            WHERE schedules.dokter_id = $1
            ORDER BY schedules.hari, schedules.jam_mulai`,
            [dokter.id]
        );

        return NextResponse.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Gagal mengambil jadwal dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Jadwal dokter gagal dimuat."
            },
            { status: 500 }
        );
    }
}

// ================= POST: TAMBAH JADWAL =================
export async function POST(request) {
    try {
        const dokter = await cekDokter();

        if (!dokter) {
            return NextResponse.json(
                { success: false, message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Bisa menerima hari berupa angka atau nama hari
        let hari;

        if (typeof body.hari === "string") {
            const namaHari = body.hari.trim().toLowerCase();

            if (daftarHari[namaHari]) {
                hari = daftarHari[namaHari];
            } else {
                hari = Number(body.hari);
            }
        } else {
            hari = Number(body.hari);
        }

        const jam_mulai = String(body.jam_mulai || "").trim();
        const durasi = Number(body.durasi);

        // Validasi hari
        if (
            !Number.isInteger(hari) ||
            hari < 1 ||
            hari > 7
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Hari praktik tidak valid."
                },
                { status: 400 }
            );
        }

        // Validasi format jam HH:mm
        if (!/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(jam_mulai)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Format jam praktik tidak valid."
                },
                { status: 400 }
            );
        }

        // Validasi durasi praktik
        if (
            !Number.isInteger(durasi) ||
            durasi < 15 ||
            durasi > 240
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Durasi praktik harus antara 15 sampai 240 menit."
                },
                { status: 400 }
            );
        }

        // Cek jadwal dengan hari dan jam mulai yang sama
        const bentrok = await pool.query(
            `SELECT id
             FROM schedules
             WHERE dokter_id = $1
               AND hari = $2
               AND jam_mulai = $3`,
            [dokter.id, hari, jam_mulai]
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
            `INSERT INTO schedules
                (dokter_id, hari, jam_mulai, durasi)
             VALUES ($1, $2, $3, $4)
             RETURNING id, hari, jam_mulai, durasi`,
            [dokter.id, hari, jam_mulai, durasi]
        );

        return NextResponse.json({
            success: true,
            message: "Jadwal praktik berhasil ditambahkan.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal menambahkan jadwal:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Jadwal gagal ditambahkan."
            },
            { status: 500 }
        );
    }
}