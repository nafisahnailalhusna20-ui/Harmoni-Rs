import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EAF1F9] text-[#193653]">

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#C5DDF5]/70 blur-[120px]" />

        <div className="absolute right-[-180px] top-[15%] h-[650px] w-[650px] rounded-full bg-[#B5D0EF]/60 blur-[140px]" />

        <div className="absolute bottom-[-250px] left-[30%] h-[600px] w-[600px] rounded-full bg-white/80 blur-[140px]" />
      </div>


      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/50 bg-[#F7FAFD]/65 backdrop-blur-2xl">

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* BRAND */}
          <Link href="/" className="flex items-center gap-3">

            <img
              src="/images/harmoni-logo.png"
              alt="HARMONI Healthcare"
              className="h-12 w-auto object-contain"
            />

            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-[0.16em]">
                HARMONI
              </p>

              <p className="mt-1 text-[9px] tracking-[0.25em] text-[#829BB7]">
                HEALTHCARE
              </p>
            </div>

          </Link>


          {/* MENU */}
          <div className="hidden items-center gap-9 md:flex">

            <a
              href="#tentang"
              className="text-sm text-[#7189A5] transition hover:text-[#315F91]"
            >
              Tentang
            </a>

            <a
              href="#layanan"
              className="text-sm text-[#7189A5] transition hover:text-[#315F91]"
            >
              Layanan
            </a>

            <Link
              href="/poli"
              className="text-sm text-[#7189A5] transition hover:text-[#315F91]"
            >
              Informasi Poli
            </Link>

            <Link
              href="/dokter-kami"
              className="text-sm text-[#7189A5] transition hover:text-[#315F91]"
            >
              Dokter Kami
            </Link>

            <Link
              href="/obat"
              className="text-sm text-[#7189A5] transition hover:text-[#315F91]"
            >
              Informasi Obat
            </Link>

          </div>


          {/* AUTH */}
          <div className="flex items-center gap-3">

            <Link
              href="/login"
              className="px-3 py-2 text-sm text-[#42678E] transition hover:text-[#193653]"
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-[#193653] px-6 py-2.5 text-sm text-white shadow-[0_8px_24px_rgba(25,54,83,0.16)] transition hover:bg-[#315F91]"
            >
              Daftar
            </Link>

          </div>

        </nav>

      </header>


      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-24 md:pt-20">

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr]">


          {/* HERO LEFT */}
          <div className="max-w-2xl">

            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-[#6F98C3]" />

              <p className="text-[11px] font-medium tracking-[0.24em] text-[#6F98C3]">
                DIGITAL HEALTHCARE EXPERIENCE
              </p>
            </div>


            <h1 className="text-[clamp(2.7rem,5.5vw,5rem)] font-medium leading-[1.08] tracking-[-0.055em]">

              Kesehatan yang
              <span className="block text-[#527EAD]">
                lebih dekat.
              </span>

            </h1>


            <p className="mt-7 max-w-lg text-base leading-8 text-[#7189A5] md:text-lg">
              Kenali dokter, temukan layanan poli, dan kelola
              pemeriksaan kesehatan dengan lebih mudah
              melalui HARMONI.
            </p>


            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/register"
                className="group inline-flex items-center gap-4 rounded-full bg-[#315F91] px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_28px_rgba(49,95,145,0.2)] transition hover:-translate-y-0.5 hover:bg-[#244D7D]"
              >
                Mulai menggunakan

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/dokter-kami"
                className="inline-flex items-center rounded-full border border-white/90 bg-white/35 px-7 py-3.5 text-sm text-[#42678E] backdrop-blur-xl transition hover:bg-white/70"
              >
                Kenali dokter
              </Link>

            </div>


            {/* SMALL INFORMATION */}
            <div className="mt-12 flex items-center gap-8 border-t border-white/70 pt-6">

              <div>
                <p className="text-sm font-medium text-[#31577F]">
                  Informasi Poli
                </p>

                <p className="mt-1 text-xs text-[#8AA0BA]">
                  Pilihan layanan
                </p>
              </div>

              <div className="h-9 w-px bg-white/80" />

              <div>
                <p className="text-sm font-medium text-[#31577F]">
                  Dokter Kami
                </p>

                <p className="mt-1 text-xs text-[#8AA0BA]">
                  Jadwal praktik
                </p>
              </div>

            </div>

          </div>


          {/* HERO GLASS PANEL */}
          <div className="relative mx-auto w-full max-w-[460px]">

            {/* Glow behind glass */}
            <div className="absolute inset-8 rounded-[3rem] bg-[#9FC5ED]/40 blur-[70px]" />


            {/* Main glass */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/35 p-7 shadow-[0_25px_80px_rgba(60,100,145,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[32px] md:p-9">


              {/* Soft reflection */}
              <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/50 bg-white/15" />

              <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full border border-white/40" />


              <div className="relative">


                {/* Logo area */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-[10px] tracking-[0.22em] text-[#8AA5C4]">
                      WELCOME TO
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                      HARMONI
                    </h2>

                    <p className="mt-1 text-sm text-[#7892B0]">
                      Healthcare
                    </p>
                  </div>


                  <div className="flex h-[105px] w-[105px] items-center justify-center rounded-[2rem] border border-white/90 bg-white/50 p-3 shadow-[0_12px_35px_rgba(70,110,155,0.1)] backdrop-blur-2xl">

                    <img
                      src="/images/harmoni-logo.png"
                      alt="Logo HARMONI"
                      className="h-full w-full object-contain"
                    />

                  </div>

                </div>


                {/* Glass information */}
                <div className="mt-9 rounded-[1.8rem] border border-white/85 bg-white/35 p-6 backdrop-blur-2xl">

                  <div className="flex items-center justify-between">

                    <p className="text-[10px] tracking-[0.2em] text-[#8AA5C4]">
                      YOUR HEALTH JOURNEY
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white/50 text-lg text-[#527EAD]">
                      +
                    </span>

                  </div>


                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    Pelayanan dalam satu sistem
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#7892B0]">
                    Informasi kesehatan dan proses pemeriksaan
                    yang lebih terorganisir.
                  </p>


                  <div className="mt-6 flex items-center justify-between border-t border-white/70 pt-4">

                    <span className="text-xs text-[#8AA5C4]">
                      HARMONI Healthcare
                    </span>

                    <span className="text-xs text-[#8AA5C4]">
                      Easy access
                    </span>

                  </div>

                </div>


                {/* Two different features */}
                <div className="mt-4 grid grid-cols-2 gap-4">

                  <div className="rounded-[1.5rem] border border-white/80 bg-white/25 p-5 backdrop-blur-xl">

                    <p className="text-[9px] tracking-[0.16em] text-[#8AA5C4]">
                      MEDICAL RECORD
                    </p>

                    <p className="mt-3 text-sm font-medium text-[#31577F]">
                      Riwayat
                    </p>

                    <p className="mt-1 text-xs text-[#7892B0]">
                      Pemeriksaan
                    </p>

                  </div>


                  <div className="rounded-[1.5rem] border border-white/80 bg-white/25 p-5 backdrop-blur-xl">

                    <p className="text-[9px] tracking-[0.16em] text-[#8AA5C4]">
                      PHARMACY
                    </p>

                    <p className="mt-3 text-sm font-medium text-[#31577F]">
                      Resep
                    </p>

                    <p className="mt-1 text-xs text-[#7892B0]">
                      & Obat
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ABOUT */}
      <section
        id="tentang"
        className="border-y border-white/60 bg-white/25 px-6 py-16 backdrop-blur-2xl md:py-20"
      >

        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[0.7fr_1.3fr]">

          <div>
            <p className="text-[11px] tracking-[0.22em] text-[#6F98C3]">
              ABOUT HARMONI
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-tight">
              Lebih mudah.
              <span className="block text-[#527EAD]">
                Lebih terhubung.
              </span>
            </h2>
          </div>


          <p className="max-w-2xl text-sm leading-8 text-[#7189A5] md:text-base">
            HARMONI Healthcare merupakan sistem informasi
            rumah sakit yang membantu pasien mengakses
            informasi poli dan dokter, mengatur janji temu,
            serta melihat riwayat pemeriksaan dan resep
            melalui satu sistem digital.
          </p>

        </div>

      </section>


      {/* SERVICES */}
      <section
        id="layanan"
        className="mx-auto max-w-7xl px-6 py-20 md:py-24"
      >

        <div className="mb-12">

          <p className="text-[11px] tracking-[0.22em] text-[#6F98C3]">
            OUR SERVICES
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
            Layanan yang tersedia
          </h2>

        </div>


        {/* Editorial feature list */}
        <div className="divide-y divide-white/70 border-y border-white/70">


          {/* Service 1 */}
          <Link
            href="/poli"
            className="group flex flex-col justify-between gap-4 py-7 transition md:flex-row md:items-center"
          >

            <div className="flex items-center gap-6">

              <span className="text-xs text-[#9AB0C9]">
                01
              </span>

              <div>
                <h3 className="text-lg font-medium transition group-hover:text-[#527EAD]">
                  Informasi Poliklinik
                </h3>

                <p className="mt-2 text-sm text-[#8198B4]">
                  Temukan layanan poli yang tersedia.
                </p>
              </div>

            </div>

            <span className="text-xl text-[#7898BC] transition group-hover:translate-x-2">
              →
            </span>

          </Link>


          {/* Service 2 */}
          <Link
            href="/dokter-kami"
            className="group flex flex-col justify-between gap-4 py-7 transition md:flex-row md:items-center"
          >

            <div className="flex items-center gap-6">

              <span className="text-xs text-[#9AB0C9]">
                02
              </span>

              <div>
                <h3 className="text-lg font-medium transition group-hover:text-[#527EAD]">
                  Informasi Dokter
                </h3>

                <p className="mt-2 text-sm text-[#8198B4]">
                  Kenali dokter dan jadwal praktiknya.
                </p>
              </div>

            </div>

            <span className="text-xl text-[#7898BC] transition group-hover:translate-x-2">
              →
            </span>

          </Link>


          {/* Service 3 */}
          <Link
            href="/register"
            className="group flex flex-col justify-between gap-4 py-7 transition md:flex-row md:items-center"
          >

            <div className="flex items-center gap-6">

              <span className="text-xs text-[#9AB0C9]">
                03
              </span>

              <div>
                <h3 className="text-lg font-medium transition group-hover:text-[#527EAD]">
                  Janji Temu Online
                </h3>

                <p className="mt-2 text-sm text-[#8198B4]">
                  Atur jadwal pemeriksaan melalui akun pasien.
                </p>
              </div>

            </div>

            <span className="text-xl text-[#7898BC] transition group-hover:translate-x-2">
              →
            </span>

          </Link>


          {/* Service 4 */}
          <Link
            href="/login"
            className="group flex flex-col justify-between gap-4 py-7 transition md:flex-row md:items-center"
          >

            <div className="flex items-center gap-6">

              <span className="text-xs text-[#9AB0C9]">
                04
              </span>

              <div>
                <h3 className="text-lg font-medium transition group-hover:text-[#527EAD]">
                  Riwayat Pemeriksaan & Resep
                </h3>

                <p className="mt-2 text-sm text-[#8198B4]">
                  Akses catatan pemeriksaan dan informasi obat.
                </p>
              </div>

            </div>

            <span className="text-xl text-[#7898BC] transition group-hover:translate-x-2">
              →
            </span>

          </Link>


        </div>

      </section>


      {/* FINAL CTA */}
      <section className="px-6 pb-20">

        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/30 px-8 py-12 shadow-[0_20px_70px_rgba(65,105,150,0.08)] backdrop-blur-3xl md:px-14 md:py-16">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

            <div>

              <p className="text-[10px] tracking-[0.2em] text-[#7898BC]">
                HARMONI HEALTHCARE
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-tight">
                Mulai dari langkah yang lebih mudah.
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#8198B4]">
                Akses layanan HARMONI melalui akun pasien Anda.
              </p>

            </div>


            <Link
              href="/register"
              className="inline-flex shrink-0 items-center justify-center gap-4 rounded-full bg-[#193653] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#315F91]"
            >
              Daftar sebagai pasien
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/70 bg-white/30 px-6 py-7 backdrop-blur-2xl">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <img
              src="/images/harmoni-logo.png"
              alt="Logo HARMONI"
              className="h-10 w-auto object-contain"
            />

            <div>
              <p className="text-xs font-semibold tracking-[0.15em]">
                HARMONI HEALTHCARE
              </p>

              <p className="mt-1 text-xs text-[#8AA0BA]">
                Sistem Informasi Rumah Sakit
              </p>
            </div>

          </div>


          <p className="text-xs text-[#8AA0BA]">
            © 2026 HARMONI Healthcare
          </p>

        </div>

      </footer>

    </main>
  );
}