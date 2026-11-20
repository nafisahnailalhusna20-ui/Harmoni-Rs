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

export async function PUT(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

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

        if (!usernameBersih || !emailBersih || !namaBersih) {
            return NextResponse.json(
                { message: "Username, email, dan nama wajib diisi." },
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

        if (
            password != null &&
            typeof password !== "string"
        ) {
            return NextResponse.json(
                { message: "Password tidak valid." },
                { status: 400 }
            );
        }

        let result;

        if (password && password.trim()) {
            if (password.length < 6) {
                return NextResponse.json(
                    { message: "Password minimal 6 karakter." },
                    { status: 400 }
                );
            }

            const passwordHash = await bcrypt.hash(password, 10);

            result = await pool.query(
                `UPDATE users
                 SET username=$1, email=$2, password_hash=$3,
                     full_name=$4, phone=$5, address=$6, birth_date=$7
                 WHERE id=$8 AND role='pasien'
                 RETURNING id, username, email, full_name,
                           phone, address, birth_date`,
                [
                    usernameBersih,
                    emailBersih,
                    passwordHash,
                    namaBersih,
                    teleponBersih || null,
                    address?.trim() || null,
                    birth_date || null,
                    id
                ]
            );

        } else {
            result = await pool.query(
                `UPDATE users
                 SET username=$1, email=$2, full_name=$3,
                     phone=$4, address=$5, birth_date=$6
                 WHERE id=$7 AND role='pasien'
                 RETURNING id, username, email, full_name,
                           phone, address, birth_date`,
                [
                    usernameBersih,
                    emailBersih,
                    namaBersih,
                    teleponBersih || null,
                    address?.trim() || null,
                    birth_date || null,
                    id
                ]
            );
        }

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Data pasien berhasil diperbarui.",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Edit pasien:", error);

        return NextResponse.json({
            message: error.code === "23505"
                ? "Username atau email sudah digunakan."
                : "Gagal memperbarui data pasien."
        }, {
            status: error.code === "23505" ? 409 : 500
        });
    }
}

export async function DELETE(request, { params }) {
    try {
        if (!(await cekAdmin())) {
            return NextResponse.json(
                { message: "Akses ditolak." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id=$1 AND role='pasien'
             RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: "Pasien tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Pasien berhasil dihapus."
        });

    } catch (error) {
        console.error("Hapus pasien:", error);

        return NextResponse.json({
            message: "Pasien gagal dihapus. Periksa apakah pasien masih memiliki data terkait."
        }, { status: 500 });
    }
}