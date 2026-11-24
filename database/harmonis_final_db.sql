
CREATE TABLE poli (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT NOT NULL,
    ikon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(10) NOT NULL
        CHECK (role IN ('admin', 'dokter', 'pasien')),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    birth_date DATE,
    photo TEXT,
    poli_id INT REFERENCES poli(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    dokter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hari SMALLINT NOT NULL CHECK (hari BETWEEN 1 AND 7),
    jam_mulai TIME NOT NULL,
    durasi SMALLINT NOT NULL DEFAULT 30 CHECK (durasi = 30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (dokter_id, hari, jam_mulai)
);

CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(120) NOT NULL,
    deskripsi TEXT NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('keras', 'biasa')),
    stok INT NOT NULL DEFAULT 0 CHECK (stok >= 0),
    gambar TEXT,
    tanggal_kadaluarsa DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    pasien_id INT NOT NULL REFERENCES users(id),
    dokter_id INT NOT NULL REFERENCES users(id),
    schedule_id INT NOT NULL REFERENCES schedules(id),
    tanggal_booking DATE NOT NULL,
    keluhan TEXT NOT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Selesai', 'Dibatalkan')),
    alasan_penolakan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slot yang ditolak atau dibatalkan bisa dipesan kembali.
CREATE UNIQUE INDEX uq_appointments_slot_aktif
ON appointments (schedule_id, tanggal_booking)
WHERE status IN ('Pending', 'Approved', 'Selesai');

CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE
        REFERENCES appointments(id) ON DELETE RESTRICT,
    diagnosis TEXT NOT NULL,
    tindakan TEXT NOT NULL,
    catatan TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INT NOT NULL UNIQUE
        REFERENCES medical_records(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu Diproses'
        CHECK (status IN ('Menunggu Diproses', 'Siap Diambil', 'Sudah Diambil')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INT NOT NULL
        REFERENCES prescriptions(id) ON DELETE RESTRICT,
    medicine_id INT NOT NULL
        REFERENCES medicines(id) ON DELETE RESTRICT,
    jumlah INT NOT NULL CHECK (jumlah > 0),
    UNIQUE (prescription_id, medicine_id)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_poli ON users(poli_id);
CREATE INDEX idx_schedules_dokter ON schedules(dokter_id);
CREATE INDEX idx_medicines_nama ON medicines(nama);
CREATE INDEX idx_appointments_pasien ON appointments(pasien_id);
CREATE INDEX idx_appointments_dokter ON appointments(dokter_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

INSERT INTO poli (nama, deskripsi, ikon) VALUES
('Poli Umum', 'Melayani pemeriksaan kesehatan umum dan konsultasi kesehatan.', NULL),
('Poli Gigi', 'Melayani pemeriksaan dan perawatan kesehatan gigi dan mulut.', NULL),
('Poli Anak', 'Melayani pemeriksaan kesehatan bayi dan anak-anak.', NULL),
('Poli Mata', 'Melayani pemeriksaan dan perawatan kesehatan mata.', NULL),
('Poli Jantung', 'Melayani pemeriksaan dan konsultasi kesehatan jantung.', NULL),
('Poli Kulit', 'Melayani pemeriksaan dan perawatan kesehatan kulit.', NULL);

INSERT INTO medicines (nama, deskripsi, tipe, stok, gambar, tanggal_kadaluarsa) VALUES
('Paracetamol 500mg', 'Obat untuk meredakan demam dan nyeri.', 'biasa', 100, NULL, '2027-12-31'),
('Amoxicillin 500mg', 'Antibiotik untuk mengatasi infeksi bakteri.', 'keras', 80, NULL, '2027-10-31'),
('Cetirizine 10mg', 'Obat untuk membantu meredakan gejala alergi.', 'biasa', 60, NULL, '2027-08-31'),
('Ibuprofen 400mg', 'Obat untuk meredakan nyeri dan peradangan.', 'keras', 75, NULL, '2027-11-30'),
('Antasida', 'Obat untuk membantu meredakan gejala asam lambung.', 'biasa', 90, NULL, '2027-09-30'),
('Vitamin C 500mg', 'Suplemen vitamin untuk membantu memenuhi kebutuhan vitamin C.', 'biasa', 120, NULL, '2028-06-30');

-- Cek tabel dan data awal:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT * FROM poli ORDER BY id;
SELECT * FROM medicines ORDER BY id;

SELECT id, username, email, role, full_name
FROM users;

SELECT id, nama FROM poli ORDER BY id;
SELECT * FROM users
WHERE role = 'dokter';

SELECT id, username, full_name, role
FROM users
WHERE role = 'dokter';


SELECT * FROM schedules;
SELECT * FROM medicines ORDER BY id;

DELETE FROM medicines;

INSERT INTO medicines
(nama, deskripsi, tipe, stok, tanggal_kadaluarsa)
VALUES
('Omeprazole 20mg', 'Obat untuk membantu mengurangi produksi asam lambung.', 'keras', 80, '2027-08-15'),

('Loratadine 10mg', 'Obat antihistamin untuk membantu meredakan gejala alergi.', 'biasa', 65, '2027-10-20'),

('Metformin 500mg', 'Obat untuk membantu mengontrol kadar gula darah.', 'keras', 100, '2028-01-12'),

('Oralit', 'Larutan rehidrasi untuk membantu mengganti cairan dan elektrolit tubuh.', 'biasa', 120, '2027-06-30'),

('Salbutamol 2mg', 'Obat untuk membantu meredakan penyempitan saluran pernapasan.', 'keras', 50, '2027-09-18'),

('Zinc 20mg', 'Suplemen mineral zinc untuk membantu memenuhi kebutuhan zinc tubuh.', 'biasa', 90, '2028-03-25');


SELECT id, username, email, full_name, role
FROM users
WHERE role = 'pasien'
ORDER BY id;


SELECT * FROM users;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'medical_records'
ORDER BY ordinal_position;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'prescriptions'
ORDER BY ordinal_position;

SELECT id, nama, stok
FROM medicines
ORDER BY id;

ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

SELECT * FROM prescriptions
ORDER BY id DESC;

SELECT * FROM prescription_items
ORDER BY id DESC;

SELECT
    pi.prescription_id,
    m.nama AS nama_obat,
    pi.jumlah AS jumlah_resep,
    m.stok AS stok_sekarang
FROM prescription_items pi
JOIN medicines m ON pi.medicine_id = m.id
WHERE pi.prescription_id = 1;

SELECT
    id,
    username,
    email,
    role,
    full_name,
    phone
FROM users
WHERE role = 'pasien'
ORDER BY id DESC;

SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'prescriptions'
AND column_name = 'status';

ALTER TABLE users
ADD COLUMN hero_photo TEXT;


SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jadwal_dokter'
ORDER BY ordinal_position;

SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
      table_name ILIKE '%jadwal%'
      OR table_name ILIKE '%dokter%'
  )
ORDER BY table_name, ordinal_position;

SELECT current_database() AS nama_database,
       current_schema() AS schema_aktif;

	   SELECT schemaname, tablename
FROM pg_tables
ORDER BY schemaname, tablename;



SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'schedules'
ORDER BY ordinal_position;

ALTER TABLE public.schedules
ADD COLUMN IF NOT EXISTS jam_selesai TIME;
UPDATE public.schedules
SET jam_selesai = jam_mulai + (durasi::INTEGER * INTERVAL '1 minute')
WHERE jam_selesai IS NULL;

SELECT
    id,
    dokter_id,
    hari,
    jam_mulai,
    jam_selesai,
    durasi,
    is_active
FROM public.schedules
ORDER BY id;