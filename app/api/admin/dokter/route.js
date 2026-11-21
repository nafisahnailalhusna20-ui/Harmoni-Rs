import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";

function cekAdmin(request) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    return token;
}

function emailGmailValid(email) {
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email);
}

export async function GET(request) {
    try {
        const token = cekAdmin(request);

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Akses hanya untuk admin." },
                { status: 403 }
            );
        }

        const result = await pool.query(`
            SELECT
                users.id,
                users.username,
                users.email,
                users.full_name,
                users.phone,
                users.poli_id,
                poli.nama AS nama_poli
            FROM users
            LEFT JOIN poli ON users.poli_id = poli.id
            WHERE users.role = 'dokter'
            ORDER BY users.id ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data dokter:", error);

        return NextResponse.json(
            { success: false, message: "Data dokter gagal diambil." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const token = cekAdmin(request);

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const user = await verifyToken(token);

        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Akses hanya untuk admin." },
                { status: 403 }
            );
        }

        const body = await request.json();

        const username = String(body.username || "").trim();
        const email = String(body.email || "").trim();
        const password = String(body.password || "");
        const full_name = String(body.full_name || "").trim();
        const phone = String(body.phone || "").trim();
        const poli_id = Number(body.poli_id);

        if (!username || !email || !password || !full_name || !poli_id) {
            return NextResponse.json(
                { success: false, message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 30) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username harus terdiri dari 3–30 karakter."
                },
                { status: 400 }
            );
        }

        if (!emailGmailValid(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email wajib menggunakan @gmail.com."
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password minimal 6 karakter."
                },
                { status: 400 }
            );
        }

        if (phone && !/^[0-9]{10,15}$/.test(phone)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon harus terdiri dari 10–15 digit."
                },
                { status: 400 }
            );
        }

        const poli = await pool.query(
            "SELECT id FROM poli WHERE id = $1",
            [poli_id]
        );

        if (poli.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Poli tidak ditemukan." },
                { status: 400 }
            );
        }

        const password_hash = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
                (username, email, password_hash, role, full_name, phone, poli_id)
             VALUES ($1, $2, $3, 'dokter', $4, $5, $6)`,
            [
                username,
                email,
                password_hash,
                full_name,
                phone || null,
                poli_id
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message: "Dokter berhasil ditambahkan."
            },
            { status: 201 }
        );

    } catch (error) {
        if (error.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username atau email sudah digunakan."
                },
                { status: 409 }
            );
        }

        console.error("Gagal menambahkan dokter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Dokter gagal ditambahkan."
            },
            { status: 500 }
        );
    }
}