import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekPasien() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    if (user?.role !== "pasien") return null;

    return user;
}

function tanggalMakassar() {
    const bagianTanggal = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Makassar",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const tahun = bagianTanggal.find(
        item => item.type === "year"
    ).value;

    const bulan = bagianTanggal.find(
        item => item.type === "month"
    ).value;

    const hari = bagianTanggal.find(
        item => item.type === "day"
    ).value;

    return `${tahun}-${bulan}-${hari}`;
}

export async function GET(request) {
    try {
        const user = await cekPasien();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const riwayat = searchParams.get("riwayat");

        // Mengambil riwayat janji temu pasien
        if (riwayat === "true") {
            const result = await pool.query(`
                SELECT
                    a.id,
                    a.tanggal_booking,
                    a.keluhan,
                    a.status,

                    dokter.full_name AS nama_dokter,
                    p.nama AS nama_poli,

                    s.jam_mulai,
                    s.durasi

                FROM appointments a

                LEFT JOIN users dokter
                    ON a.dokter_id = dokter.id

                LEFT JOIN poli p
                    ON dokter.poli_id = p.id

                LEFT JOIN schedules s
                    ON a.schedule_id = s.id

                WHERE a.pasien_id = $1

                ORDER BY
                    a.tanggal_booking DESC,
                    a.id DESC
            `, [user.id]);

            return NextResponse.json({
                success: true,
                data: result.rows
            });
        }

        // Mengambil jadwal dokter yang masih aktif untuk booking
        const hariIni = tanggalMakassar();
        const batasTanggal = "2026-12-31";

        const result = await pool.query(`
            WITH daftar_tanggal AS (
                SELECT generate_series(
                    $1::date,
                    $2::date,
                    INTERVAL '1 day'
                )::date AS tanggal
            )

            SELECT
                s.id,
                s.dokter_id,
                s.hari,
                s.jam_mulai,
                s.durasi,

                dokter.full_name AS nama_dokter,
                dokter.photo AS foto_dokter,

                p.nama AS nama_poli,

                COALESCE(
                    json_agg(
                        TO_CHAR(t.tanggal, 'YYYY-MM-DD')
                        ORDER BY t.tanggal
                    ) FILTER (WHERE t.tanggal IS NOT NULL),
                    '[]'::json
                ) AS tanggal_tersedia

            FROM schedules s

            JOIN users dokter
                ON s.dokter_id = dokter.id

            LEFT JOIN poli p
                ON dokter.poli_id = p.id

            LEFT JOIN daftar_tanggal t
                ON EXTRACT(ISODOW FROM t.tanggal) = s.hari

                AND NOT EXISTS (
                    SELECT 1
                    FROM appointments a
                    WHERE a.schedule_id = s.id
                    AND a.tanggal_booking = t.tanggal
                    AND a.status NOT IN ('Rejected', 'Dibatalkan')
                )

            WHERE s.is_active = TRUE

            GROUP BY
                s.id,
                dokter.id,
                p.id

            ORDER BY
                s.hari,
                s.jam_mulai
        `, [hariIni, batasTanggal]);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data janji temu:", error);

        return NextResponse.json(
            { message: "Data janji temu gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await cekPasien();

        if (!user) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            schedule_id,
            tanggal_booking,
            keluhan
        } = await request.json();

        if (!schedule_id || !tanggal_booking || !keluhan?.trim()) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal_booking)) {
            return NextResponse.json(
                { message: "Format tanggal tidak valid." },
                { status: 400 }
            );
        }

        const hariIni = tanggalMakassar();

        if (
            tanggal_booking < hariIni ||
            tanggal_booking > "2026-12-31"
        ) {
            return NextResponse.json(
                { message: "Tanggal kunjungan tidak valid." },
                { status: 400 }
            );
        }

        // Pastikan jadwal tersedia dan masih aktif
        const jadwal = await pool.query(`
            SELECT id, dokter_id
            FROM schedules
            WHERE id = $1
            AND is_active = TRUE
            AND hari = EXTRACT(ISODOW FROM $2::date)
        `, [schedule_id, tanggal_booking]);

        if (jadwal.rowCount === 0) {
            return NextResponse.json(
                {
                    message:
                        "Jadwal tidak tersedia atau sudah dinonaktifkan."
                },
                { status: 400 }
            );
        }

        const dokterId = jadwal.rows[0].dokter_id;

        const sudahDipesan = await pool.query(`
            SELECT id
            FROM appointments
            WHERE schedule_id = $1
            AND tanggal_booking = $2
            AND status NOT IN ('Rejected', 'Dibatalkan')
        `, [schedule_id, tanggal_booking]);

        if (sudahDipesan.rowCount > 0) {
            return NextResponse.json(
                {
                    message: "Jadwal pada tanggal tersebut sudah dipesan."
                },
                { status: 409 }
            );
        }

        const result = await pool.query(`
            INSERT INTO appointments (
                pasien_id,
                dokter_id,
                schedule_id,
                tanggal_booking,
                keluhan
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            user.id,
            dokterId,
            schedule_id,
            tanggal_booking,
            keluhan.trim()
        ]);

        return NextResponse.json({
            success: true,
            message: "Janji temu berhasil didaftarkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal mendaftar janji temu:", error);

        return NextResponse.json(
            { message: "Pendaftaran janji temu gagal." },
            { status: 500 }
        );
    }
}