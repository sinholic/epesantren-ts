-- Migration Script: MySQL to PostgreSQL
-- This script converts MySQL schema and stored procedures to PostgreSQL

-- ============================================
-- 1. CONVERT STORED PROCEDURES TO FUNCTIONS
-- ============================================

-- Procedure: InsertDebitFromBulan
-- Converted to PostgreSQL function
CREATE OR REPLACE FUNCTION insert_debit_from_bulan()
RETURNS void AS $$
BEGIN
    INSERT INTO debit (
        debit_date, 
        debit_desc, 
        debit_value, 
        user_user_id, 
        debit_input_date, 
        debit_last_update,
        account_id, 
        student_id, 
        recipient, 
        pos_id, 
        jurnal_id, 
        ppdb_nisn, 
        ppdb_participant_id, 
        created_by
    )
    SELECT  
        bulan_date_pay,  
        'Pembayaran Siswa',  
        bulan_bill,  
        user_user_id,  
        bulan_input_date,  
        bulan_last_update,  
        NULL AS account_id,  
        student_student_id,  
        (SELECT user_full_name FROM users WHERE user_id = bulan.user_user_id) AS recipient,  
        (SELECT pos_id FROM pos WHERE jurnal_id = 3 AND pos_name LIKE '%' || (SELECT name FROM unit WHERE id = (SELECT unit_id FROM student WHERE student_id = bulan.student_student_id))) AS pos_id,  
        jurnal_id,  
        NULL AS ppdb_nisn, 
        NULL AS ppdb_participant_id, 
        'query' AS created_by
    FROM bulan
    WHERE (student_student_id, bulan_date_pay) NOT IN (
        SELECT student_id, debit_date
        FROM debit 
        WHERE student_id IS NOT NULL AND debit_date IS NOT NULL
    ) 
    AND bulan_date_pay IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Procedure: UpdateParticipantIdPpdbBayar
-- Converted to PostgreSQL function
CREATE OR REPLACE FUNCTION update_participant_id_ppdb_bayar()
RETURNS void AS $$
BEGIN
    UPDATE ppdb_bayar AS t
    SET ppdb_participant_id = s.id
    FROM ppdb_participant AS s
    WHERE t.nisn = s.nisn;
END;
$$ LANGUAGE plpgsql;

-- Procedure: update_bebas_total_pay
-- Converted to PostgreSQL function
CREATE OR REPLACE FUNCTION update_bebas_total_pay()
RETURNS void AS $$
BEGIN
    UPDATE bebas
    SET bebas_total_pay = subquery.total_bebas_pay_bill
    FROM (
        SELECT 
            b.student_student_id, 
            SUM(bp.bebas_pay_bill) AS total_bebas_pay_bill, 
            bp.bebas_bebas_id
        FROM bebas b
        JOIN bebas_pay bp ON b.bebas_id = bp.bebas_bebas_id
        WHERE bp.jurnal_id = 0
        GROUP BY b.student_student_id, bp.bebas_bebas_id
    ) AS subquery 
    WHERE bebas.bebas_id = subquery.bebas_bebas_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to debit table
ALTER TABLE debit 
ADD COLUMN IF NOT EXISTS account_id INTEGER,
ADD COLUMN IF NOT EXISTS student_id INTEGER,
ADD COLUMN IF NOT EXISTS recipient VARCHAR(150),
ADD COLUMN IF NOT EXISTS pos_id INTEGER,
ADD COLUMN IF NOT EXISTS jurnal_id INTEGER,
ADD COLUMN IF NOT EXISTS ppdb_nisn CHAR(20),
ADD COLUMN IF NOT EXISTS ppdb_participant_id INTEGER,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

-- Add missing columns to bebas_pay table
ALTER TABLE bebas_pay
ADD COLUMN IF NOT EXISTS jurnal_id INTEGER DEFAULT 0;

-- ============================================
-- 3. CREATE MISSING TABLES
-- ============================================

-- Table: unit (if not exists)
CREATE TABLE IF NOT EXISTS unit (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: ppdb_participant
CREATE TABLE IF NOT EXISTS ppdb_participant (
    id SERIAL PRIMARY KEY,
    nisn VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    no_pendaftaran VARCHAR(100) NOT NULL,
    tanggal_daftar DATE NOT NULL,
    period_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    id_jarak INTEGER NOT NULL,
    asal_sekolah VARCHAR(255) NOT NULL,
    nama_peserta VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    nomor_hp VARCHAR(12) NOT NULL,
    jenis_kelamin VARCHAR(1) NOT NULL,
    jumlah_saudara_kandung VARCHAR(2) NOT NULL,
    tinggi_badan VARCHAR(3) NOT NULL,
    berat_badan VARCHAR(3) NOT NULL,
    tinggal_bersama VARCHAR(100) NOT NULL,
    nik VARCHAR(16) NOT NULL,
    no_kk VARCHAR(20) NOT NULL,
    tempat_lahir VARCHAR(50) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    agama VARCHAR(20) NOT NULL,
    kebutuhan_khusus VARCHAR(50) NOT NULL,
    photo VARCHAR(100),
    alamat VARCHAR(50) NOT NULL,
    rt VARCHAR(3) NOT NULL,
    rw VARCHAR(3) NOT NULL,
    nama_dusun VARCHAR(50) NOT NULL,
    nama_kelurahan VARCHAR(50) NOT NULL,
    nama_kecamatan VARCHAR(50) NOT NULL,
    nama_kabupaten VARCHAR(50) NOT NULL,
    nama_provinsi VARCHAR(50) NOT NULL,
    kode_pos VARCHAR(5) NOT NULL,
    alamat_tinggal VARCHAR(50) NOT NULL,
    rt_tinggal VARCHAR(3) NOT NULL,
    rw_tinggal VARCHAR(3) NOT NULL,
    nama_dusun_tinggal VARCHAR(50) NOT NULL,
    nama_kelurahan_tinggal VARCHAR(50) NOT NULL,
    nama_kecamatan_tinggal VARCHAR(50) NOT NULL,
    nama_kabupaten_tinggal VARCHAR(50) NOT NULL,
    nama_provinsi_tinggal VARCHAR(50) NOT NULL,
    kode_pos_tinggal VARCHAR(5) NOT NULL,
    transportasi VARCHAR(50) NOT NULL,
    nama_ayah VARCHAR(50) NOT NULL,
    tahun_lahir_ayah INTEGER,
    pendidikan_ayah VARCHAR(50) NOT NULL,
    pekerjaan_ayah VARCHAR(50) NOT NULL,
    penghasilan_ayah VARCHAR(50) NOT NULL,
    nama_ibu VARCHAR(50) NOT NULL,
    tahun_lahir_ibu INTEGER,
    pendidikan_ibu VARCHAR(50) NOT NULL,
    pekerjaan_ibu VARCHAR(50) NOT NULL,
    penghasilan_ibu VARCHAR(50) NOT NULL,
    nama_wali VARCHAR(50),
    tahun_lahir_wali INTEGER,
    pendidikan_wali VARCHAR(50),
    pekerjaan_wali VARCHAR(50),
    penghasilan_wali VARCHAR(50),
    hubungan_wali VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: ppdb_bayar
CREATE TABLE IF NOT EXISTS ppdb_bayar (
    id SERIAL PRIMARY KEY,
    nisn VARCHAR(15),
    ppdb_participant_id INTEGER,
    payment_id INTEGER,
    amount DECIMAL(10, 2),
    payment_date DATE,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: jurnal
CREATE TABLE IF NOT EXISTS jurnal (
    jurnal_id SERIAL PRIMARY KEY,
    jurnal_name VARCHAR(100),
    jurnal_desc TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. ADD FOREIGN KEY CONSTRAINTS
-- ============================================

-- Add foreign keys for debit table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'debit_student_id_fkey'
    ) THEN
        ALTER TABLE debit 
        ADD CONSTRAINT debit_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'debit_pos_id_fkey'
    ) THEN
        ALTER TABLE debit 
        ADD CONSTRAINT debit_pos_id_fkey 
        FOREIGN KEY (pos_id) REFERENCES pos(pos_id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'debit_ppdb_participant_id_fkey'
    ) THEN
        ALTER TABLE debit 
        ADD CONSTRAINT debit_ppdb_participant_id_fkey 
        FOREIGN KEY (ppdb_participant_id) REFERENCES ppdb_participant(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_debit_student_id ON debit(student_id);
CREATE INDEX IF NOT EXISTS idx_debit_date ON debit(debit_date);
CREATE INDEX IF NOT EXISTS idx_debit_ppdb_participant_id ON debit(ppdb_participant_id);
CREATE INDEX IF NOT EXISTS idx_ppdb_participant_nisn ON ppdb_participant(nisn);
CREATE INDEX IF NOT EXISTS idx_ppdb_bayar_nisn ON ppdb_bayar(nisn);
CREATE INDEX IF NOT EXISTS idx_ppdb_bayar_participant_id ON ppdb_bayar(ppdb_participant_id);

-- ============================================
-- 6. DATA TYPE CONVERSIONS
-- ============================================

-- Note: These conversions should be done during data migration
-- MySQL YEAR type -> PostgreSQL INTEGER
-- MySQL UNSIGNED -> PostgreSQL INTEGER (no unsigned in PostgreSQL)
-- MySQL BLOB -> PostgreSQL BYTEA
-- MySQL TIMESTAMP(0) -> PostgreSQL TIMESTAMP

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON FUNCTION insert_debit_from_bulan() IS 'Insert debit records from bulan payments';
COMMENT ON FUNCTION update_participant_id_ppdb_bayar() IS 'Update ppdb_bayar with participant IDs';
COMMENT ON FUNCTION update_bebas_total_pay() IS 'Update bebas total payment from bebas_pay records';
