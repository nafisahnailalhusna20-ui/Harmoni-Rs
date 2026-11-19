"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [pesan, setPesan] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setPesan("");
        setLoading(true);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                setPesan(data.message);
                return;
            }

            if (data.role === "admin") {
                router.push("/admin");
            } else if (data.role === "dokter") {
                router.push("/dokter");
            } else {
                router.push("/pasien");
            }

        } catch {
            setPesan("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#f4f8f6] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#28765d]"> HARMONI </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Hospital Information System
                    </p>

                    <div className="mt-7">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Selamat Datang
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                            Silakan masuk menggunakan akun Anda.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#28765d]"
                            required
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#28765d]"
                            required
                        />
                    </div>

                    {pesan && (
                        <p className="text-sm text-red-600 mb-4">
                            {pesan}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#28765d] hover:bg-[#205e4a] text-white rounded-lg py-3 text-sm font-medium disabled:opacity-60"
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </button>

                </form>

                <p className="text-center text-xs text-gray-400 mt-8">
                    © 2026 HARMONI Hospital Information System
                </p>

            </div>
        </main>
    );
}