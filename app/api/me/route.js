import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";


async function ambilUserLogin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = await verifyToken(token);

    return user || null;
}

export async function GET() {
    try {
        const user = await ambilUserLogin();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        const result = await pool.query(
            `SELECT id, username, email, full_name, phone,
                    address, birth_date, photo, role
             FROM users
             WHERE id = $1`,
            [user.id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, message: "Data pengguna tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal mengambil profil:", error);

        return NextResponse.json(
            { success: false, message: "Profil gagal dimuat." },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const user = await ambilUserLogin();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Silakan login terlebih dahulu." },
                { status: 401 }
            );
        }

        let data;
        let foto = null;

        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();

            data = {
                username: formData.get("username"),
                email: formData.get("email"),
                full_name: formData.get("full_name"),
                phone: formData.get("phone"),
                address: formData.get("address"),
                birth_date: formData.get("birth_date")
            };

            foto = formData.get("photo");

        } else {
            data = await request.json();
        }

        const {
            username,
            email,
            full_name,
            phone,
            address,
            birth_date
        } = data;

        const usernameBersih = typeof username === "string" ? username.trim() : "";
        const emailBersih = typeof email === "string" ? email.trim() : "";
        const namaBersih = typeof full_name === "string" ? full_name.trim() : "";
        const teleponBersih = typeof phone === "string" ? phone.trim() : "";

        if (!usernameBersih || !emailBersih || !namaBersih) {
            return NextResponse.json(
                { success: false, message: "Username, email, dan nama lengkap wajib diisi." },
                { status: 400 }
            );
        }

        const formatEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!formatEmail.test(emailBersih)) {
            return NextResponse.json(
                { success: false, message: "Format email tidak valid." },
                { status: 400 }
            );
        }

        if (phone !== undefined && phone !== null && typeof phone !== "string") {
            return NextResponse.json(
                { success: false, message: "Nomor telepon tidak valid." },
                { status: 400 }
            );
        }

        if (teleponBersih && !/^[0-9]{10,15}$/.test(teleponBersih)) {
            return NextResponse.json(
                { success: false, message: "Nomor telepon harus terdiri dari 10–15 angka." },
                { status: 400 }
            );
        }

        let fotoPath = null;

        if (foto && foto.size > 0) {
            if (user.role !== "dokter") {
                return NextResponse.json(
                    { success: false, message: "Unggah foto hanya tersedia untuk dokter." },
                    { status: 403 }
                );
            }

            const formatFoto = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp"
            };

            if (!formatFoto[foto.type]) {
                return NextResponse.json(
                    { success: false, message: "Foto harus berformat JPG, PNG, atau WebP." },
                    { status: 400 }
                );
            }

            if (foto.size > 2 * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, message: "Ukuran foto maksimal 2 MB." },
                    { status: 400 }
                );
            }

            const namaFile = randomUUID() + formatFoto[foto.type];
            const folderFoto = path.join(process.cwd(), "public", "uploads");

            await mkdir(folderFoto, { recursive: true });

            const bufferFoto = Buffer.from(await foto.arrayBuffer());

            await writeFile(
                path.join(folderFoto, namaFile),
                bufferFoto
            );

            fotoPath = "/uploads/" + namaFile;
        }

        const result = await pool.query(
            `UPDATE users
             SET username = $1,
                 email = $2,
                 full_name = $3,
                 phone = $4,
                 address = $5,
                 birth_date = $6,
                 photo = CASE
                    WHEN $7::text IS NOT NULL THEN $7
                    ELSE photo
                 END
             WHERE id = $8
             RETURNING id, username, email, full_name,
                       phone, address, birth_date, photo, role`,
            [
                usernameBersih,
                emailBersih,
                namaBersih,
                teleponBersih || null,
                typeof address === "string" ? address.trim() || null : null,
                birth_date || null,
                fotoPath,
                user.id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Profil berhasil diperbarui.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Gagal memperbarui profil:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                { success: false, message: "Username atau email sudah digunakan." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Profil gagal diperbarui." },
            { status: 500 }
        );
    }
}