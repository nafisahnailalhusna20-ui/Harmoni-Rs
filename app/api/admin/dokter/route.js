import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function cekAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return false;

    const user = await verifyToken(token);
    return user?.role === "admin";
}

function validasiEmail(email) {
    const formatEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return formatEmail.test(email);
}

function validasiTelepon(phone) {
    if (!phone) return true;

    return /^[0-9]{10,15}$/.test(phone);
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
            SELECT users.id, users.username, users.email,
                   users.full_name, users.phone, users.poli_id,
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
            { message: "Data dokter gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const {
            username,
            email,
            password,
            full_name,
            phone,
            poli_id
        } = await request.json();

        const usernameBersih =
            typeof username === "string" ? username.trim() : "";

        const emailBersih =
            typeof email === "string" ? email.trim() : "";

        const namaBersih =
            typeof full_name === "string" ? full_name.trim() : "";

        const teleponBersih =
            typeof phone === "string" ? phone.trim() : "";

        if (
            !usernameBersih ||
            !emailBersih ||
            !password ||
            !namaBersih ||
            !poli_id
        ) {
            return NextResponse.json(
                { message: "Semua data wajib diisi." },
                { status: 400 }
            );
        }

        if (!validasiEmail(emailBersih)) {
            return NextResponse.json(
                { message: "Format email tidak valid." },
                { status: 400 }
            );
        }

        if (phone != null && typeof phone !== "string") {
            return NextResponse.json(
                { message: "Nomor telepon harus berupa angka." },
                { status: 400 }
            );
        }

        if (!validasiTelepon(teleponBersih)) {
            return NextResponse.json(
                { message: "Nomor telepon harus terdiri dari 10–15 digit angka." },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { message: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (username, email, password_hash, role, full_name, phone, poli_id)
            VALUES ($1, $2, $3, 'dokter', $4, $5, $6)
            RETURNING id, username, email, full_name, role, poli_id`,
            [
                usernameBersih,
                emailBersih,
                passwordHash,
                namaBersih,
                teleponBersih || null,
                poli_id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Dokter berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menambahkan dokter:", error);

        return NextResponse.json({
            message: error.code === "23505"
                ? "Username atau email sudah digunakan."
                : "Dokter gagal ditambahkan."
        }, {
            status: error.code === "23505" ? 409 : 500
        });
    }
}