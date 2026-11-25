import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { hash } from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request) {
    try {
        const formData = await request.formData();

        const full_name = formData.get("full_name");
        const username = formData.get("username");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const password = formData.get("password");
        const confirm_password = formData.get("confirm_password");
        const poli_id = formData.get("poli_id");
        const sk_dokter = formData.get("sk_dokter");

        // ================= VALIDASI FIELD =================

        if (
            !full_name ||
            !username ||
            !email ||
            !phone ||
            !password ||
            !confirm_password ||
            !poli_id ||
            !sk_dokter
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Semua field wajib diisi, termasuk dokumen SK dokter.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI SK =================

        if (!(sk_dokter instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Dokumen SK dokter wajib diunggah.",
                },
                { status: 400 }
            );
        }

        if (sk_dokter.size === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File SK dokter tidak boleh kosong.",
                },
                { status: 400 }
            );
        }

        // Maksimal ukuran file 5 MB
        const maksimalUkuran = 5 * 1024 * 1024;

        if (sk_dokter.size > maksimalUkuran) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Ukuran file SK maksimal 5 MB.",
                },
                { status: 400 }
            );
        }

        // Format file yang diperbolehkan
        const tipeFileDiizinkan = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        if (!tipeFileDiizinkan.includes(sk_dokter.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "File SK harus berupa PDF, JPG, atau PNG.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI PASSWORD =================

        if (password !== confirm_password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Konfirmasi password tidak sama.",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Password minimal 6 karakter.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI NAMA =================

        if (full_name.trim().length > 120) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nama lengkap maksimal 120 karakter.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI USERNAME =================

        const usernameBersih = username.trim();

        if (
            usernameBersih.length < 3 ||
            usernameBersih.length > 30
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username harus terdiri dari 3–30 karakter.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI EMAIL =================

        const emailBersih = email.trim().toLowerCase();

        const emailValid =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailBersih);

        if (!emailValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email harus menggunakan format Gmail yang valid.",
                },
                { status: 400 }
            );
        }

        // ================= VALIDASI TELEPON =================

        const phoneBersih = phone.trim();

        if (!/^[0-9]{10,15}$/.test(phoneBersih)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon harus terdiri dari 10–15 angka.",
                },
                { status: 400 }
            );
        }

        // ================= CEK USERNAME DAN EMAIL =================

        const cekUser = await pool.query(
            `SELECT id
             FROM users
             WHERE LOWER(username) = LOWER($1)
                OR LOWER(email) = LOWER($2)`,
            [usernameBersih, emailBersih]
        );

        if (cekUser.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Username atau email sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        // ================= CEK NOMOR TELEPON =================

        const cekPhone = await pool.query(
            `SELECT id
             FROM users
             WHERE phone = $1
               AND phone IS NOT NULL`,
            [phoneBersih]
        );

        if (cekPhone.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Nomor telepon sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        // ================= VALIDASI POLI =================

        const cekPoli = await pool.query(
            `SELECT id
             FROM poli
             WHERE id = $1`,
            [poli_id]
        );

        if (cekPoli.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Poliklinik yang dipilih tidak valid.",
                },
                { status: 400 }
            );
        }

        // ================= SIMPAN FILE SK =================

        const ekstensiFile = path.extname(sk_dokter.name).toLowerCase();

        const namaFile =
            `${crypto.randomUUID()}${ekstensiFile}`;

        const folderUpload = path.join(
            process.cwd(),
            "uploads",
            "sk-dokter"
        );

        await fs.mkdir(folderUpload, {
            recursive: true,
        });

        const lokasiFile = path.join(
            folderUpload,
            namaFile
        );

        const bufferFile = Buffer.from(
            await sk_dokter.arrayBuffer()
        );

        await fs.writeFile(lokasiFile, bufferFile);

        // Lokasi file yang disimpan di database
        const skPath = path.join(
            "uploads",
            "sk-dokter",
            namaFile
        );

        // ================= HASH PASSWORD =================

        const passwordHash = await hash(password, 10);

        // ================= SIMPAN AKUN DOKTER =================

        await pool.query(
            `INSERT INTO users (
                username,
                email,
                password_hash,
                role,
                full_name,
                phone,
                poli_id,
                sk_dokter,
                status_verifikasi
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                usernameBersih,
                emailBersih,
                passwordHash,
                "dokter",
                full_name.trim(),
                phoneBersih,
                poli_id,
                skPath,
                "menunggu",
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Pendaftaran berhasil. Akun Anda menunggu verifikasi SK oleh admin.",
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Register dokter error:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username, email, atau nomor telepon sudah terdaftar.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan pada server.",
            },
            { status: 500 }
        );
    }
}