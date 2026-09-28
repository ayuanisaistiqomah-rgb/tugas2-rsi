USE review_kantin;

-- =====================================================================
-- 1) Bersihkan sisa uji coba sebelumnya
-- =====================================================================
DELETE FROM dbo.LIKES;
DELETE FROM dbo.FLAGS;
DELETE FROM dbo.AUDIT_LOGS;

-- Kembalikan data seed pertemuan 3 yang sempat berubah saat uji coba
UPDATE dbo.MENU_ITEMS
SET name = N'Kwetiau Goreng Spesial', price = 15000, is_available = 1
WHERE id = 1;
DELETE FROM dbo.MENU_ITEMS WHERE id > 20;
DELETE FROM dbo.STALLS     WHERE id > 10;
DELETE FROM dbo.USERS      WHERE id > 15;

-- Reset penomoran ID
DBCC CHECKIDENT ('dbo.LIKES',      RESEED, 0);
DBCC CHECKIDENT ('dbo.FLAGS',      RESEED, 0);
DBCC CHECKIDENT ('dbo.AUDIT_LOGS', RESEED, 0);
DBCC CHECKIDENT ('dbo.MENU_ITEMS', RESEED, 20);
DBCC CHECKIDENT ('dbo.STALLS',     RESEED, 10);
DBCC CHECKIDENT ('dbo.USERS',      RESEED, 15);

-- =====================================================================
-- 2) Seed LIKES (8 baris) - customer me-like review milik customer lain
-- =====================================================================
INSERT INTO dbo.LIKES (review_id, user_id) VALUES
  (4, 13), (6, 15), (9, 13), (11, 14),
  (13, 12), (13, 14), (15, 12), (16, 13);

-- Samakan like_count di REVIEWS dengan jumlah like
UPDATE dbo.REVIEWS
SET like_count = (SELECT COUNT(*) FROM dbo.LIKES l WHERE l.review_id = REVIEWS.id);

-- =====================================================================
-- 3) Seed FLAGS (8 baris) - dilaporkan oleh customer & owner warung
-- =====================================================================
INSERT INTO dbo.FLAGS (review_id, reported_by, reason, status) VALUES
  (2,  2,  N'Isi ulasan tidak mencerminkan rasa makanan',  'pending'),
  (3,  9,  N'Menyebut harga yang tidak sesuai daftar menu', 'resolved'),
  (5,  14, N'Berisi tautan promosi',                        'dismissed'),
  (7,  5,  N'Ulasan ditulis sebelum warung buka',           'pending'),
  (9,  13, N'Bahasa tidak pantas',                          'resolved'),
  (12, 7,  N'Rating tidak sesuai isi komentar',             'dismissed'),
  (13, 15, N'Ulasan terindikasi salin-tempel',              'pending'),
  (16, 12, N'Mengandung informasi pribadi',                 'pending');

-- =====================================================================
-- 4) Seed AUDIT_LOGS (8 baris) - jejak aktivitas yang konsisten dgn data
-- =====================================================================
INSERT INTO dbo.AUDIT_LOGS (user_id, action, target_table, target_id, metadata) VALUES
  (1,  'LOGIN',  'USERS',      1,  N'{"ip":"192.168.1.10"}'),
  (4,  'UPDATE', 'MENU_ITEMS', 10, N'{"price":{"old":5000,"new":6000}}'),
  (9,  'UPDATE', 'STALLS',     2,  N'{"description":"Nasi goreng dadakan"}'),
  (13, 'CREATE', 'REVIEWS',    7,  N'{"stall_id":4,"rating":4}'),
  (15, 'CREATE', 'REVIEWS',    9,  N'{"stall_id":5,"rating":4}'),
  (12, 'LIKE',   'REVIEWS',    13, NULL),
  (2,  'FLAG',   'REVIEWS',    2,  N'{"reason":"Isi ulasan tidak mencerminkan rasa makanan"}'),
  (1,  'UPDATE', 'FLAGS',      2,  N'{"status":"resolved"}');