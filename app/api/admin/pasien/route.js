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
    const formatEmail =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    return formatEmail.test(email);
}

function validasiTelepon(phone) {
    if (!phone) return true;

    return /^[0-9]{10,15}$/.test(phone);
}

function validasiTanggalLahir(tanggal) {
    if (!tanggal) return true;

    if (typeof tanggal !== "string") return false;

    const formatTanggal = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatTanggal.test(tanggal)) return false;

    if (
        tanggal < "1945-01-01" ||
        tanggal > "2026-12-31"
    ) {
        return false;
    }

    const date = new Date(`${tanggal}T00:00:00Z`);

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === tanggal;
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
            SELECT id, username, email, full_name,
                   phone, address, birth_date,
                   COALESCE(is_active, TRUE) AS is_active
            FROM users
            WHERE role = 'pasien'
            ORDER BY id ASC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil data pasien:", error);

        return NextResponse.json(
            { message: "Data pasien gagal dimuat." },
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
            address,
            birth_date
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
            !namaBersih
        ) {
            return NextResponse.json(
                {
                    message: "Username, email, password, dan nama wajib diisi."
                },
                { status: 400 }
            );
        }

        if (!validasiEmail(emailBersih)) {
            return NextResponse.json(
                { message: "Format email tidak valid. Contoh: nama@gmail.com." },
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
                {
                    message: "Nomor telepon harus terdiri dari 10–15 digit angka."
                },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { message: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        if (!validasiTanggalLahir(birth_date)) {
            return NextResponse.json(
                {
                    message: "Tanggal lahir harus valid dan berada antara tahun 1945–2026."
                },
                { status: 400 }
            );
        }

        if (address != null && typeof address !== "string") {
            return NextResponse.json(
                { message: "Alamat harus berupa teks." },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (username, email, password_hash, role, full_name,
             phone, address, birth_date)
            VALUES ($1, $2, $3, 'pasien', $4, $5, $6, $7)
            RETURNING id, username, email, full_name,
                      phone, address, birth_date`,
            [
                usernameBersih,
                emailBersih,
                passwordHash,
                namaBersih,
                teleponBersih || null,
                address?.trim() || null,
                birth_date || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Pasien berhasil ditambahkan.",
            data: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Gagal menambahkan pasien:", error);

        return NextResponse.json({
            message: error.code === "23505"
                ? "Username atau email sudah digunakan."
                : "Pasien gagal ditambahkan."
        }, {
            status: error.code === "23505" ? 409 : 500
        });
    }
}