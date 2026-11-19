import pool from "./lib/db.js";
import { hash } from "bcryptjs";

async function buatAdmin() {
    try {
        const passwordHash = await hash("admin123", 10);

        await pool.query(
            `INSERT INTO users
            (username, email, password_hash, role, full_name)
            VALUES ($1, $2, $3, $4, $5)`,
            [
                "admin",
                "admin@harmoni.com",
                passwordHash,
                "admin",
                "Administrator HARMONI"
            ]
        );

        console.log("Akun admin berhasil dibuat!");
    } catch (error) {
        console.error("Gagal membuat admin:", error.message);
    } finally {
        await pool.end();
    }
}

buatAdmin();