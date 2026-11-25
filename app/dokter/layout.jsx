"use client";

import { usePathname, useRouter } from "next/navigation";

const MENU_DOKTER = [
    { nama: "Beranda", href: "/dokter" },
    { nama: "Janji Temu", href: "/dokter/janji-temu" },
    { nama: "Rekam Medis", href: "/dokter/rekam-medis" },
    { nama: "Cari Obat", href: "/dokter/obat" },
        { nama: "Jadwal Saya", href: "/dokter/jadwal" },
    { nama: "Profil Dokter", href: "/dokter/profil" },
];

// Beranda hanya aktif di "/dokter"; menu lain tetap aktif di sub-halamannya.
function menuAktif(pathname, href) {
    if (href === "/dokter") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DokterLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();

    async function logout() {
        try {
            await fetch("/api/logout", {
                method: "POST",
            });
        } finally {
            router.push("/login");
        }
    }

    return (
        <div className="harmoni-scene relative min-h-screen overflow-hidden p-3 text-[#244968] sm:p-5">
            <style>{`
                @keyframes harmoniRise {
                    from { opacity: 0; transform: translate3d(0, 16px, 0); }
                    to { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                @keyframes harmoniOrbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .harmoni-enter { animation: harmoniRise .9s cubic-bezier(.16,.78,.25,1) both; }

                /* ---------- Latar belakang (terlihat menembus kaca) ---------- */
                .harmoni-scene {
                    background:
                        radial-gradient(70% 50% at 8% 0%, #ffffff 0%, transparent 62%),
                        linear-gradient(165deg, #eaf4fc 0%, #d3e6f7 55%, #c2dbf1 100%);
                }
                .hs { position: absolute; border-radius: 9999px; pointer-events: none; }
                .hs-1 { width: 520px; height: 520px; left: -150px; top: 140px; background: linear-gradient(145deg, #ffffff 0%, #9fc8ec 100%); opacity: .9; }
                .hs-2 { width: 430px; height: 430px; right: -70px; top: -90px; background: linear-gradient(145deg, #e3f0fb 0%, #6aa3d4 100%); opacity: .85; }
                .hs-3 { width: 470px; height: 470px; right: 6%; bottom: -150px; background: linear-gradient(145deg, #bcdcf5 0%, #4a86b8 100%); opacity: .8; }
                .hs-4 { width: 720px; height: 720px; left: 28%; top: 26%; border: 1px solid rgba(255,255,255,.75); }
                .hs-5 { width: 240px; height: 240px; left: 16%; bottom: 6%; background: linear-gradient(145deg, #ffffff 0%, #7fb2de 100%); opacity: .85; }

                /* ---------- Jendela kaca utama ---------- */
                .harmoni-window {
                    position: relative; z-index: 1;
                    background: linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.12));
                    backdrop-filter: blur(40px) saturate(1.7);
                    -webkit-backdrop-filter: blur(40px) saturate(1.7);
                    border: 1px solid rgba(255,255,255,.7);
                    box-shadow: 0 40px 100px rgba(55,105,155,.2), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(255,255,255,.3);
                }

                /* ---------- Panel kaca di dalam jendela ---------- */
                .harmoni-panel {
                    position: relative; overflow: hidden; isolation: isolate;
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.5), transparent 55%),
                        linear-gradient(145deg, rgba(255,255,255,.36), rgba(255,255,255,.1));
                    backdrop-filter: blur(28px) saturate(1.6);
                    -webkit-backdrop-filter: blur(28px) saturate(1.6);
                    border: 1px solid rgba(255,255,255,.6);
                    box-shadow: 0 10px 30px rgba(55,105,155,.1), inset 0 1px 0 rgba(255,255,255,.95);
                }
                .harmoni-tile { transition: transform .45s cubic-bezier(.2,.7,.2,1), background .45s ease, box-shadow .45s ease; }
                .harmoni-tile:hover, .harmoni-tile:focus-visible {
                    transform: translateY(-3px);
                    background:
                        radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.75), transparent 58%),
                        linear-gradient(145deg, rgba(255,255,255,.5), rgba(255,255,255,.18));
                    box-shadow: 0 18px 44px rgba(55,105,155,.16), inset 0 1px 0 rgba(255,255,255,1);
                }
                .harmoni-chip {
                    background: rgba(255,255,255,.5);
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,.95);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                }
                .harmoni-chip-on {
                    background: rgba(255,255,255,.92);
                    border: 1px solid #fff;
                    box-shadow: 0 6px 16px rgba(75,125,165,.18), inset 0 1px 0 #fff;
                }
                .harmoni-focus:focus-visible { outline: 2px solid #3f78a8; outline-offset: 3px; }
                .harmoni-hairline { background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent); height: 1px; }
                .harmoni-title {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }

                /* ---------- Bola kaca ---------- */
                .harmoni-sphere {
                    width: 210px; height: 210px; border-radius: 9999px;
                    background: radial-gradient(circle at 32% 26%, #ffffff 0, rgba(255,255,255,.75) 11%, #b9d9f3 42%, #5f98cb 100%);
                    box-shadow: inset -20px -26px 50px rgba(255,255,255,.35), inset 10px 10px 30px rgba(255,255,255,.5), 0 40px 80px rgba(60,110,160,.35);
                }
                .harmoni-ring {
                    position: absolute; inset: -34px; border-radius: 9999px;
                    border: 1px solid rgba(255,255,255,.85);
                    box-shadow: 0 0 30px rgba(255,255,255,.4);
                    animation: harmoniOrbit 40s linear infinite;
                }
                .harmoni-ring::after {
                    content: ""; position: absolute; top: 12%; left: 8%; width: 14px; height: 14px; border-radius: 9999px;
                    background: #fff; box-shadow: 0 0 16px 4px rgba(255,255,255,.9);
                }
                .harmoni-name {
                    display: block; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1.08; letter-spacing: -.045em; font-weight: 700;
                    text-wrap: balance;
                }
                .harmoni-name span {
                    background: linear-gradient(100deg, #315f88 8%, #6798c5 50%, #3e78a8 92%);
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                }


                /* ---------- Hero dokter ---------- */
                @keyframes harmoniFloatImage {
                    0%, 100% { transform: translate3d(0,0,0); }
                    50% { transform: translate3d(0,-9px,0); }
                }
                .harmoni-hero-photo { animation: harmoniFloatImage 7s ease-in-out infinite; filter: drop-shadow(0 28px 34px rgba(45,83,119,.28)); }
                .harmoni-disc {
                    position: absolute; border-radius: 9999px; pointer-events: none;
                    background: linear-gradient(145deg, rgba(255,255,255,.7), rgba(111,166,214,.45));
                    border: 1px solid rgba(255,255,255,.75);
                    box-shadow: inset 0 2px 24px rgba(255,255,255,.6), 0 24px 60px rgba(70,120,170,.15);
                }

                @media (prefers-reduced-motion: reduce) {
                    .harmoni-enter, .harmoni-ring, .harmoni-hero-photo { animation: none !important; }
                    .harmoni-tile { transition: none !important; }
                    .harmoni-tile:hover { transform: none !important; }
                }
            `}</style>

            {/* bentuk latar */}
            <div className="hs hs-1" aria-hidden="true" />
            <div className="hs hs-2" aria-hidden="true" />
            <div className="hs hs-3" aria-hidden="true" />
            <div className="hs hs-4" aria-hidden="true" />
            <div className="hs hs-5" aria-hidden="true" />

            <div className="harmoni-window mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1400px] gap-5 rounded-[32px] p-3 sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[40px] sm:p-5">
                {/* ================= SIDEBAR (layar lebar) ================= */}
                <aside className="harmoni-panel hidden w-[230px] shrink-0 flex-col rounded-[30px] p-4 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-5rem)]">
                    <div className="px-3 pb-6 pt-4">
                        <h1 className="text-2xl font-extrabold tracking-[0.25em] text-[#315f88]">
                            HARMONI
                        </h1>
                        <p className="mt-2 text-[11px] text-[#7198bb]">
                            Hospital Information System
                        </p>
                    </div>

                    <div className="harmoni-hairline mb-4" />

                    <nav aria-label="Menu dokter" className="flex flex-col gap-1.5">
                        {MENU_DOKTER.map((menu) => {
                            const aktif = menuAktif(pathname, menu.href);

                            return (
                                <button
                                    key={menu.href}
                                    onClick={() => router.push(menu.href)}
                                    aria-current={aktif ? "page" : undefined}
                                    className={`harmoni-focus rounded-2xl px-4 py-3.5 text-left text-sm transition-all duration-300 ${
                                        aktif
                                            ? "harmoni-chip-on font-semibold text-[#2b5a84]"
                                            : "text-[#6388a9] hover:bg-white/50 hover:text-[#2b5a84]"
                                    }`}
                                >
                                    {menu.nama}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto">
                        <div className="harmoni-hairline mb-4" />

                        <button
                            onClick={logout}
                            className="harmoni-chip harmoni-focus w-full rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-[#5c82a5] transition hover:bg-white/80 hover:text-[#315f88]"
                        >
                            Keluar
                        </button>

                        <p className="mt-4 px-2 text-[10px] tracking-[0.12em] text-[#8aa9c6]">
                            HARMONI HEALTHCARE
                        </p>
                    </div>
                </aside>

                {/* ================= ISI HALAMAN ================= */}
                <div className="min-w-0 flex-1">
                    {/* Menu untuk layar kecil */}
                    <nav
                        aria-label="Menu dokter"
                        className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden"
                    >
                        {MENU_DOKTER.map((menu) => {
                            const aktif = menuAktif(pathname, menu.href);

                            return (
                                <button
                                    key={menu.href}
                                    onClick={() => router.push(menu.href)}
                                    aria-current={aktif ? "page" : undefined}
                                    className={`harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                                        aktif
                                            ? "harmoni-chip-on text-[#2b5a84]"
                                            : "harmoni-chip text-[#6388a9]"
                                    }`}
                                >
                                    {menu.nama}
                                </button>
                            );
                        })}
                        <button
                            onClick={logout}
                            className="harmoni-chip harmoni-focus shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold text-[#5c82a5]"
                        >
                            Keluar
                        </button>
                    </nav>

                    {children}
                </div>
            </div>
        </div>
    );
}
