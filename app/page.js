import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E8F0EC] text-[#263D34]">

      <nav className="bg-white/80 border-b border-[#DCE9E1]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold text-[#397A63]">
              HARMONI
            </h1>
            <p className="text-xs tracking-widest text-[#64776D]">
              HEALTHCARE
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[#397A63] px-4 py-2 hover:underline"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="bg-[#397A63] text-white px-5 py-2.5 rounded-xl hover:bg-[#2e6551]"
            >
              Daftar
            </Link>
          </div>

        </div>
      </nav>


      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div>
            <p className="text-sm font-semibold tracking-widest text-[#397A63] mb-4">
              SELAMAT DATANG DI HARMONI HEALTHCARE
            </p>

            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Kesehatan Anda,
              <span className="text-[#397A63]">
                {" "}Prioritas Kami.
              </span>
            </h2>

            <p className="text-[#64776D] text-lg mt-6 leading-relaxed">
              Kami hadir untuk membantu Anda mendapatkan
              pelayanan kesehatan yang mudah, nyaman,
              dan terorganisir melalui layanan rumah sakit
              berbasis digital.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/register"
                className="bg-[#397A63] text-white px-6 py-3 rounded-xl hover:bg-[#2e6551]"
              >
                Buat Janji Temu
              </Link>

              <a
                href="#tentang"
                className="border border-[#397A63] text-[#397A63] px-6 py-3 rounded-xl hover:bg-white"
              >
                Tentang Kami
              </a>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#DCE9E1]">
            <div className="bg-[#E3EFE9] rounded-2xl p-10 text-center">

              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#397A63] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  H
                </span>
              </div>

              <h3 className="text-2xl font-bold text-[#397A63]">
                HARMONI HEALTHCARE
              </h3>

              <p className="text-[#64776D] mt-3">
                Pelayanan kesehatan dalam satu sistem
                yang terintegrasi.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section id="tentang" className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <p className="text-sm font-semibold text-[#397A63]">
            TENTANG HARMONI
          </p>

          <h2 className="text-3xl font-bold mt-3">
            Pelayanan Kesehatan Lebih Mudah
          </h2>

          <p className="text-[#64776D] leading-relaxed mt-5">
            HARMONI Healthcare merupakan sistem informasi
            rumah sakit yang membantu proses pelayanan
            kesehatan, mulai dari informasi poli dan dokter,
            pendaftaran janji temu, hingga akses riwayat
            pemeriksaan pasien.
          </p>

        </div>
      </section>

      <section id="layanan" className="max-w-7xl mx-auto px-6 py-20">

        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#397A63]">
            LAYANAN KAMI
          </p>

          <h2 className="text-3xl font-bold mt-3">
            Kemudahan dalam Satu Sistem
          </h2>

          <p className="text-[#64776D] mt-3">
            Akses berbagai layanan kesehatan melalui HARMONI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white p-7 rounded-2xl border border-[#DCE9E1] shadow-sm">
            <h3 className="font-bold text-xl">
              Informasi Poli
            </h3>
            <p className="text-[#64776D] mt-3">
              Temukan informasi layanan poli yang tersedia
              di rumah sakit.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#DCE9E1] shadow-sm">
            <h3 className="font-bold text-xl">
              Informasi Dokter
            </h3>
            <p className="text-[#64776D] mt-3">
              Kenali dokter dan lihat jadwal praktik
              sebelum melakukan konsultasi.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-[#DCE9E1] shadow-sm">
            <h3 className="font-bold text-xl">
              Janji Temu Online
            </h3>
            <p className="text-[#64776D] mt-3">
              Daftarkan jadwal pemeriksaan secara online
              melalui akun pasien.
            </p>
          </div>

        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto bg-[#397A63] rounded-3xl p-10 md:p-14 text-center text-white">

          <h2 className="text-3xl font-bold">
            Mulai Perjalanan Kesehatan Anda
          </h2>

          <p className="mt-4 text-white/80">
            Daftar akun pasien untuk mengakses layanan
            HARMONI Healthcare.
          </p>

          <Link
            href="/register"
            className="inline-block mt-7 bg-white text-[#397A63] px-7 py-3 rounded-xl font-semibold hover:bg-[#E8F0EC]"
          >
            Daftar Sekarang
          </Link>

        </div>
      </section>

      <footer className="bg-white border-t border-[#DCE9E1] py-7 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">

          <div>
            <h3 className="font-bold text-[#397A63]">
              HARMONI HEALTHCARE
            </h3>

            <p className="text-sm text-[#64776D]">
              Sistem Informasi Rumah Sakit
            </p>
          </div>

          <p className="text-sm text-[#64776D]">
            © 2026 HARMONI Healthcare
          </p>

        </div>
      </footer>

    </main>
  );
}