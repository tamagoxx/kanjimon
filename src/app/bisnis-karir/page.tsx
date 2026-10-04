'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const BISNIS_KARIR_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Dalam penjelasan tentang sistem produksi, manakah pernyataan yang paling tidak tepat (salah)?',
    options: [
      'A. Make or buy adalah menentukan bagian produk yang akan dialihdayakan',
      'B. Design review adalah pemeriksaan desain di setiap tahap',
      'C. Inspeksi adalah penerimaan dan pemeriksaan material',
      'D. Design-in adalah pemasok terlibat pada tahap produksi massal',
    ],
    correctIndex: 3,
    explanation: 'Design-in berarti pemasok terlibat sejak tahap desain, bukan produksi massal. Design-in adalah proses pemasok berkontribusi sejak tahap desain produk.',
  },
  {
    id: 2,
    question: 'Dalam aktivitas manajemen kerja, manakah pernyataan yang paling tidak tepat (salah)?',
    options: [
      'A. Mencari dan mengejar metode kerja yang rasional dan produktif',
      'B. Menetapkan secara terpisah metode, material, peralatan, alat, dan lingkungan kerja',
      'C. Perkiraan waktu kerja oleh pekerja standar',
      'D. Memberikan instruksi metode kerja yang telah distandarkan',
    ],
    correctIndex: 1,
    explanation: 'Manajemen kerja harus dilakukan secara standar dan terpadu, bukan secara terpisah. Semua elemen metode kerja harus dikelola secara menyeluruh.',
  },
  {
    id: 3,
    question: '5 pekerja melakukan perakitan presisi menggunakan kaca pembesar dan pinset. Waktu kerja berbeda hingga 1.5 kali. Dengan merekam pekerja tercepat dan terlambat untuk analisis gerakan, hal apa yang tidak dapat dianalisis?',
    options: [
      'A. Frekuensi therblig',
      'B. Elemen gerakan yang diperlukan',
      'C. Tingkat utilisasi pekerja',
      'D. Urutan gerakan optimal',
    ],
    correctIndex: 2,
    explanation: 'Motion study hanya menganalisis gerakan (therblig), tidak bisa menilai efisiensi kerja atau tingkat utilisasi pekerja secara keseluruhan.',
  },
  {
    id: 4,
    question: 'Dalam analisis therblig, manakah yang paling tidak sesuai dalam kelompok gerakan dasar yang diperlukan?',
    options: [
      'A. Menahan',
      'B. Memegang',
      'C. Melepaskan',
      'D. Memeriksa',
    ],
    correctIndex: 0,
    explanation: '"Menahan" (holding) adalah kondisi, bukan gerakan dasar utama. Gerakan dasar therblig meliputi: mencapai, memegang, melepas, memeriksa, dll.',
  },
  {
    id: 5,
    question: 'Dalam analisis kerja gabungan, manakah pernyataan yang paling tepat?',
    options: [
      'A. Untuk 1 orang – 1 mesin gunakan analisis operasi',
      'B. Tidak mencatat aktivitas terpisah',
      'C. Banyak pekerja bekerja bersama → gunakan analisis gabungan',
      'D. Tidak mencatat waktu mesin',
    ],
    correctIndex: 2,
    explanation: 'Analisis kerja gabungan digunakan saat banyak pekerja bekerja bersama-sama pada satu proses atau lini produksi.',
  },
  {
    id: 6,
    question: 'Dalam pencegahan kesalahan (miss), manakah yang paling tidak tepat?',
    options: [
      'A. Fool proof (poka-yoke) memiliki prinsip bahwa jika salah langkah dilakukan, akan terjadi gangguan atau tidak bisa dilanjutkan',
      'B. Untuk melakukan pemeriksaan kondisi, ada metode checksheet yang menggabungkan indera dan alat',
      'C. Digital picking yang menunjukkan lokasi barang dengan lampu membantu efisiensi saat mengambil barang',
      'D. Untuk mengetahui tempat kerusakan, menggunakan suku cadang yang sudah datang adalah cara yang tepat',
    ],
    correctIndex: 3,
    explanation: 'Untuk mengetahui tempat kerusakan, digunakan diagnosa/gejala kerusakan, bukan suku cadang yang sudah datang.',
  },
  {
    id: 7,
    question: 'Dalam definisi 5S, manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Melaksanakan apa yang telah ditentukan (Seiketsu)',
      'B. Membuang yang tidak diperlukan (Seiri)',
      'C. Membedakan yang perlu dan tidak perlu (Seiton)',
      'D. Berbagi aktivitas 5S dengan departemen lain',
    ],
    correctIndex: 3,
    explanation: '5S fokus pada: Seiri (buang), Seiton (rapi), Seiso (bersih), Seiketsu (standar), Shitsuke (disiplin). Berbagi dengan departemen lain bukan bagian dari definisi 5S.',
  },
  {
    id: 8,
    question: 'Dalam fungsi persediaan dan cadangan (buffer), manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Stok terlalu banyak meningkatkan biaya penyimpanan, terlalu sedikit kehilangan peluang penjualan',
      'B. Cadangan besar → biaya meningkat',
      'C. Produksi berdasarkan pesanan (make-to-order) perlu menyimpan stok cadangan',
      'D. Cadangan bisa dimasukkan dalam perencanaan',
    ],
    correctIndex: 2,
    explanation: 'Produksi berdasarkan pesanan (make-to-order) tidak perlu menyimpan stok cadangan karena produksi dilakukan setelah ada pesanan.',
  },
  {
    id: 9,
    question: 'Dalam produksi berbagai jenis dengan jumlah kecil (多種類少量生産), manakah yang paling tepat?',
    options: [
      'A. Produksi massal dengan jalur produksi',
      'B. Produksi satu kali per pesanan',
      'C. Produksi bergantian per jenis',
      'D. Proses beragam dan alur kerja berbeda-beda',
    ],
    correctIndex: 3,
    explanation: 'Ciri utama produksi berbagai jenis-jumlah kecil: banyak jenis → proses berbeda → alur kerja kompleks.',
  },
  {
    id: 10,
    question: 'Dalam klasifikasi berdasarkan aliran produksi, manakah yang paling tepat?',
    options: [
      'A. Lot kecil → WIP meningkat, waktu produksi memanjang',
      'B. Produksi satuan untuk proses yang sama',
      'C. Produksi kontinu adalah produksi satu jenis produk secara terus-menerus',
      'D. Produksi satuan adalah bentuk tengah antara kontinu dan terputus',
    ],
    correctIndex: 2,
    explanation: 'Produksi kontinu = produksi satu produk secara terus-menerus dalam jumlah besar. Contoh: produksi semen, baja.',
  },
  {
    id: 11,
    question: 'Dalam metode perencanaan jadwal dan istilah terkait, pilih kombinasi yang paling tepat antara A, B, C dengan ①〜④.\n\nA. Waktu standar (waktu yang diperlukan untuk menyelesaikan pekerjaan sesuai standar)\nB. Diagram rencana (diagram yang menunjukkan isi dan jadwal rencana)\nC. Sisa hari (jumlah hari tersisa sebelum batas waktu selesai)\n\n① Jadwal standar   ② Penjadwalan kerja   ③ Waktu cadangan   ④ Diagram Gantt',
    options: [
      'A. A = ④ (Waktu standar = Diagram Gantt)',
      'B. A = ② (Waktu standar = Penjadwalan kerja)',
      'C. B = ① (Diagram rencana = Jadwal standar)',
      'D. C = ③ (Sisa hari = Waktu cadangan)',
    ],
    correctIndex: 3,
    explanation: 'A (標準時間) = Waktu standar. B (計画図) = Diagram rencana. C (余日数) = Sisa hari = 手配余数 = Waktu cadangan.',
  },
  {
    id: 12,
    question: 'Dalam penjelasan tentang persiapan produksi (製作手配), manakah yang paling tepat?',
    options: [
      'A. Pengumpulan instruksi untuk tiap bagian sesuai urutan waktu, membuat dokumen, lalu mendistribusikan agar setiap bagian bisa menyiapkan terlebih dahulu',
      'B. Material, alat, gambar, dan standar kerja disiapkan sebelumnya di tempat kerja',
      'C. Menentukan urutan kerja dan membagi pekerjaan kepada operator dan mesin',
      'D. Kegiatan pengendalian produksi secara keseluruhan oleh manajer lapangan',
    ],
    correctIndex: 0,
    explanation: '製作手配 = menyiapkan dan mendistribusikan instruksi produksi agar setiap bagian dapat menyiapkan pekerjaan terlebih dahulu.',
  },
  {
    id: 13,
    question: 'Dalam produksi kontinu, metode dan objek analisis apa yang paling tepat untuk menganalisis perbedaan antara input dan output antar proses di lapangan?',
    options: [
      'A. 差立盤 = Papan penjadwalan kerja',
      'B. カムアップシステム = Sistem manajemen cam-up',
      'C. 流動数曲線 = Kurva jumlah aliran (grafik jumlah masuk dan keluar terhadap waktu)',
      'D. 製造台帳による進度票 = Kartu progres berdasarkan catatan produksi',
    ],
    correctIndex: 2,
    explanation: '流動数曲線 (Ryuudousuu kyokusen) = Kurva aliran kuantitas, menunjukkan perbandingan input-output terhadap waktu.',
  },
  {
    id: 14,
    question: 'Dalam manajemen kapasitas sisa (余力), manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Memeriksa rencana dan menyeimbangkan pekerjaan agar pengiriman berjalan lancar',
      'B. Untuk mencapai target harian, perlu menyesuaikan jumlah pekerjaan dan kapasitas produksi',
      'C. Perhitungan kapasitas sisa dapat diketahui dengan melihat jumlah pekerjaan dan barang dalam proses',
      'D. Kapasitas sisa adalah sisa dari jumlah kerja saat ini dikurangi beban kerja',
    ],
    correctIndex: 1,
    explanation: 'Kapasitas sisa (余力) = 能力 − 負荷 (kemampuan − beban). Bukan tentang menyesuaikan untuk target harian.',
  },
  {
    id: 15,
    question: 'Di sebuah perusahaan, dalam 10 tahun terakhir terjadi 3 kecelakaan besar. Berdasarkan hukum Heinrich, manakah yang paling tepat?',
    options: [
      'A. Kecelakaan ringan sekitar 30 kasus',
      'B. Kecelakaan ringan sekitar 900 kasus',
      'C. Kecelakaan tanpa cedera sekitar 30 kasus',
      'D. Kecelakaan tanpa cedera (near-miss) sekitar 900 kasus',
    ],
    correctIndex: 3,
    explanation: 'Hukum Heinrich: 1 : 29 : 300 = Kecelakaan fatal : Cedera ringan : Near-miss. 3 kecelakaan besar × 300 = 900 near-miss.',
  },
  {
    id: 16,
    question: 'Dalam fungsi manajemen peralatan (設備管理), manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Saat menyusun anggaran peralatan, melakukan manajemen progres dan biaya konstruksi',
      'B. Saat menyusun anggaran peralatan, melakukan desain berdasarkan rencana peralatan',
      'C. Saat menyusun rencana pemeliharaan, membuat rencana pemeliharaan',
      'D. Saat menyusun anggaran pemeliharaan, melakukan pencatatan dan laporan pemeliharaan',
    ],
    correctIndex: 3,
    explanation: 'Pencatatan dan laporan pemeliharaan adalah bagian dari pelaksanaan pemeliharaan, bukan penyusunan anggaran pemeliharaan.',
  },
  {
    id: 17,
    question: 'Dalam perhitungan efektivitas total peralatan (OEE), manakah yang tidak termasuk?',
    options: [
      'A. Availability Rate (Tingkat waktu operasi - apakah mesin berjalan)',
      'B. Performance Rate (Tingkat performa - kecepatan mesin)',
      'C. Quality Rate (Tingkat produk baik - kualitas)',
      'D. Failure Rate (Tingkat frekuensi kerusakan - berapa sering rusak)',
    ],
    correctIndex: 3,
    explanation: 'OEE = Availability × Performance × Quality. Failure Rate bukan komponen OEE.',
  },
  {
    id: 18,
    question: 'Dalam tindakan pencegahan penurunan kondisi peralatan (設備維持), manakah yang paling tidak tepat?',
    options: [
      'A. 清掃 = Pembersihan (membersihkan mesin)',
      'B. 傾向管理 = Manajemen tren (memantau perubahan kondisi)',
      'C. 不良品的修理 = Perbaikan produk cacat',
      'D. 部品の交換 = Penggantian komponen',
    ],
    correctIndex: 2,
    explanation: 'Perbaikan produk cacat tidak terkait langsung dengan perawatan peralatan. Tindakan pencegahan penurunan kondisi meliputi: membersihan, memantau tren, mengganti komponen.',
  },
  {
    id: 19,
    question: 'Dalam aktivitas pemeriksaan dan inspeksi harian (日常点検), manakah yang paling tidak tepat?',
    options: [
      'A. Pemeliharaan peralatan terdiri dari pemeliharaan harian, inspeksi, dan perbaikan',
      'B. Dalam inspeksi harian, sebaiknya menggunakan checklist',
      'C. Pembersihan serpihan dan kotoran dilakukan oleh bagian maintenance',
      'D. Standar inspeksi mencakup inspeksi harian dan berkala',
    ],
    correctIndex: 2,
    explanation: 'Pembersihan serpihan dan kotoran dilakukan oleh operator (bagian produksi), bukan oleh bagian maintenance.',
  },
  {
    id: 20,
    question: 'Dalam manajemen material, manakah kombinasi yang paling tepat antara "klasifikasi" dan "jenis material"?\n\nA. Klasifikasi berdasarkan manajemen\nB. Klasifikasi berdasarkan tujuan penggunaan\nC. Klasifikasi berdasarkan tingkat proses\nD. Klasifikasi berdasarkan cara memperoleh\n\n① Material biasa / tidak biasa   ② Material langsung / tidak langsung   ③ Barang supply / beli   ④ Bahan, setengah jadi, komponen',
    options: [
      'A. A:② B:① C:③ D:④',
      'B. A:① B:② C:④ D:③',
      'C. A:④ B:③ C:② D:①',
      'D. A:① B:④ C:② D:③',
    ],
    correctIndex: 1,
    explanation: '① berdasarkan 管理 = biasa/tidak biasa. ② berdasarkan 用途 = langsung/tidak langsung. ④ berdasarkan 形態 = bahan/setengah jadi/komponen. ③ supply/beli berdasarkan cara memperoleh.',
  },
  {
    id: 21,
    question: 'Dalam perhitungan kebutuhan komponen (部品表), manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Dalam struktur BOM, nilai komponen paling bawah adalah 0',
      'B. Kebutuhan bersih = kebutuhan − stok awal',
      'C. Dalam summary BOM, tidak bisa membedakan komponen dan sub-assembly',
      'D. Summary BOM digunakan untuk struktur sederhana',
    ],
    correctIndex: 0,
    explanation: 'Komponen paling bawah (leaf component) tetap memiliki kebutuhan > 0 karena merupakan komponen yang sebenarnya dipakai.',
  },
  {
    id: 22,
    question: 'Dalam kelebihan pembelian terpusat dan terdesentralisasi, manakah yang paling tidak tepat?',
    options: [
      'A. Pembelian terpusat dapat menurunkan harga karena pembelian dalam jumlah besar',
      'B. Pembelian terpusat dapat menyatukan sistem pembelian',
      'C. Pembelian terdesentralisasi memudahkan standarisasi material',
      'D. Pembelian terdesentralisasi dapat mendukung industri lokal',
    ],
    correctIndex: 2,
    explanation: 'Pembelian terpusat → murah + standar. Pembelian terdesentralisasi → fleksibel + mendukung industri lokal. Terdesentralisasi justru menyulitkan standarisasi.',
  },
  {
    id: 23,
    question: 'Dalam klasifikasi biaya logistik berdasarkan fungsi, manakah yang paling tepat?',
    options: [
      'A. Biaya logistik variabel, tetap, retur, daur ulang, limbah',
      'B. Logistik pengadaan, internal, penjualan + biaya kemasan, penyimpanan',
      'C. Logistik internal, pembayaran, pengolahan informasi, manajemen',
      'D. Biaya transportasi, penyimpanan, pengemasan, pemrosesan distribusi, pengolahan informasi, manajemen logistik',
    ],
    correctIndex: 3,
    explanation: 'Biaya logistik berdasarkan fungsi = biaya transportasi + penyimpanan + pengemasan + pemrosesan distribusi + pengolahan informasi + manajemen logistik.',
  },
  {
    id: 24,
    question: 'Dalam klasifikasi fungsi pusat logistik (物流センター), manakah yang paling tidak tepat?',
    options: [
      'A. 保管センター = Pusat penyimpanan stok',
      'B. 通過センター = Pusat transit (cross-docking)',
      'C. 流通センター = Pusat proses distribusi',
      'D. 自動化センター = Pusat otomatis bertingkat',
    ],
    correctIndex: 3,
    explanation: 'Fungsi物流センター = simpan / transit / proses distribusi. 自動化 adalah klasifikasi berdasarkan struktur/bangunan, bukan fungsi.',
  },
  {
    id: 25,
    question: 'Dalam fungsi kemasan produk, manakah yang paling tidak tepat?',
    options: [
      'A. Melindungi isi produk',
      'B. Memberikan informasi produk',
      'C. Memudahkan penanganan saat distribusi',
      'D. Mencegah kesalahan pengiriman',
    ],
    correctIndex: 3,
    explanation: 'Fungsi kemasan = proteksi + informasi + kemudahan penanganan. Mencegah kesalahan pengiriman adalah fungsi pelabelan/barcoding, bukan kemasan.',
  },
  {
    id: 26,
    question: 'Dalam konsep manajemen kualitas, manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Tujuan manajemen kualitas adalah membuat produk/jasa berkualitas dengan biaya rendah berdasarkan pengetahuan produsen',
      'B. Manajemen kualitas statistik menggunakan metode statistik berdasarkan data objektif',
      'C. Manajemen kualitas harus mencakup seluruh siklus hidup produk',
      'D. Manajemen kualitas melibatkan perencanaan dan pengendalian sumber daya seperti manusia, material, uang, dan informasi',
    ],
    correctIndex: 0,
    explanation: 'Tujuan manajemen kualitas adalah memenuhi kebutuhan pelanggan, bukan berdasarkan pengetahuan produsen saja. Fokus harus pada pelanggan (顧客志向).',
  },
  {
    id: 27,
    question: 'Diberikan data: 2, 8, 5, 4, 6. Berapakah nilai standar deviasi sampel yang paling mendekati?',
    options: [
      'A. 2.00',
      'B. 2.24',
      'C. 4.00',
      'D. 4.47',
    ],
    correctIndex: 1,
    explanation: 'Rata-rata = 5. Jumlah kuadrat selisih = (9+9+0+1+1) = 20. Varians = 20/(5-1) = 5. Standar deviasi = √5 ≈ 2.24.',
  },
  {
    id: 28,
    question: 'Dalam perbaikan kualitas (品質改善), manakah pernyataan yang paling tidak tepat?',
    options: [
      'A. Dalam QC Story hanya memahami kondisi dan membuat solusi',
      'B. Pencegahan kesalahan dengan poka-yoke',
      'C. Perlu standardisasi untuk mempertahankan hasil',
      'D. Mencari penyebab dan membuat solusi',
    ],
    correctIndex: 0,
    explanation: 'QC Story memiliki banyak langkah (bukan hanya 2): Plan → Do → Check → Act, termasuk rencana pencegahan kekambuhan.',
  },
  {
    id: 29,
    question: 'Dalam tanggung jawab produk (製品責任), manakah pernyataan yang paling tidak tepat? (FMEA: Failure Mode and Effect Analysis)',
    options: [
      'A. Cacat peringatan terjadi jika tidak memberikan informasi bahaya yang tepat',
      'B. FMEA desain adalah metode untuk memprediksi kegagalan dan meningkatkan keandalan',
      'C. Dalam tanggung jawab produk, ganti rugi berdasarkan kesalahan pelaku',
      'D. Cacat produksi terjadi jika tidak sesuai desain/spesifikasi',
    ],
    correctIndex: 2,
    explanation: 'Produk Liability Act (PL法) = tanggung jawab produk tanpa perlu membuktikan kesalahan. Penggantian rugi berdasarkan kerusakan yang ditimbulkan, bukan kesalahan.',
  },
  {
    id: 30,
    question: 'Dalam aktivitas kontrol biaya (コストコントロール), manakah yang paling tepat?',
    options: [
      'A. Menentukan biaya target',
      'B. Menentukan biaya standar',
      'C. Menggunakan analisis selisih untuk mengurangi selisih',
      'D. Menentukan biaya yang diizinkan',
    ],
    correctIndex: 2,
    explanation: 'Kontrol biaya = analisis selisih (差異分析). Membandingkan biaya standar dengan actual untuk mengidentifikasi dan mengurangi varians.',
  },
  {
    id: 31,
    question: 'Dalam biaya langsung dan tidak langsung produksi, manakah yang paling tidak tepat?',
    options: [
      'A. Klasifikasi biaya langsung dan tidak langsung disebut klasifikasi berdasarkan operasi',
      'B. Menghitung biaya langsung ke produk disebut direct costing',
      'C. Mengalokasikan biaya tidak langsung disebut alokasi',
      'D. Gaji karyawan termasuk biaya tidak langsung',
    ],
    correctIndex: 0,
    explanation: 'Klasifikasi biaya langsung dan tidak langsung disebut klasifikasi berdasarkan hubungan dengan produk (产品との関連), bukan berdasarkan operasi.',
  },
  {
    id: 32,
    question: 'Dengan metode average costing, tentukan biaya per unit produk jadi.\n\n〔Data〕\nMaterial: 1.200 unit, 12.000.000 yen\nWork in Process: 900 unit (50% selesai)\nBiaya pemrosesan: 8.400.000 yen\n\n〔Pertanyaan〕\nBerapa biaya per unit?',
    options: [
      'A. 17.000 yen/unit',
      'B. 17.500 yen/unit',
      'C. 18.000 yen/unit',
      'D. 18.500 yen/unit',
    ],
    correctIndex: 2,
    explanation: 'Material cost = 12.000.000 / 1.200 = 10.000/unit. Processing cost = 8.400.000 × 900 / (900 + 300×0,5) = 8.400.000 × 900 / 1.050 = 7.200.000. Total = 12.000.000 + 7.200.000 = 19.200.000. Per unit = 19.200.000 / 900 = 18.000 yen.',
  },
  {
    id: 33,
    question: 'Berdasarkan kondisi berikut, jika menetapkan biaya target dengan metode integrasi (統合法), manakah hasil perhitungan yang benar?\n\n〔Kondisi〕\nHarga jual rencana produk A = 30.000 yen\nLaba target = 6.000 yen\nBiaya saat ini (perkiraan) = 27.000 yen\nPenyesuaian dilakukan sebesar setengah dari selisih',
    options: [
      'A. 22.500 yen',
      'B. 24.000 yen',
      'C. 25.500 yen',
      'D. 27.000 yen',
    ],
    correctIndex: 2,
    explanation: 'Biaya yang diizinkan = 30.000 − 6.000 = 24.000 yen. Selisih = 27.000 − 24.000 = 3.000 yen. Setengah selisih = 1.500 yen. Biaya target = 27.000 − 1.500 = 25.500 yen.',
  },
  {
    id: 34,
    question: 'Dalam langkah penanggulangan keterlambatan pengiriman dalam logistik, manakah yang paling tidak tepat?',
    options: [
      'A. Memperbaiki metode pengemasan agar tidak rusak saat transportasi',
      'B. Menstandarisasi pekerjaan pengiriman dengan membuat manual',
      'C. Menentukan metode kerja berdasarkan keputusan individu pekerja',
      'D. Mencatat rute tercepat dan kondisi lalu lintas',
    ],
    correctIndex: 2,
    explanation: 'Penentuan metode kerja harus berdasarkan standar tim, bukan keputusan individu pekerja. Logistik membutuhkan prosedur standar.',
  },
  {
    id: 35,
    question: 'Dalam penyebab dan solusi keterlambatan produksi, pilih kombinasi yang paling tepat.\n\nUntuk mencegah keterlambatan yang disebabkan oleh kesalahan jumlah material, baiknya menggunakan manajemen ___ .\nDalam produksi, lakukan ___ terlebih dahulu, baru kemudian ___ .\nDalam kasus kekurangan material, ___ tidak terpengaruh.\nYang terpengaruh adalah ___ .\n\n① Manajemen pemesanan   ② Produk (stok)   ③ Manajemen instruksi   ④ Biaya pengiriman   ⑤ Waktu pengiriman',
    options: [
      'A. A:① B:② C:③ D:④',
      'B. A:③ B:② C:① D:④',
      'C. A:③ B:② C:① D:⑤',
      'D. A:① B:② C:③ D:④',
    ],
    correctIndex: 0,
    explanation: 'Gunakan manajemen pemesanan untuk mencegah kesalahan jumlah. Lakukan manajemen produk (stok) terlebih dahulu. Kasus kekurangan material tidak mempengaruhi biaya pengiriman. Yang terpengaruh adalah biaya lain.',
  },
  {
    id: 36,
    question: 'Dalam metode pengendalian progres produksi, manakah yang paling tepat?',
    options: [
      'A. Kurva aliran: sumbu X = waktu, sumbu Y = jumlah kumulatif',
      'B. Diagram segitiga produksi: X = hari, Y = stok kumulatif',
      'C. Gantt chart untuk kapasitas',
      'D. Papan kontrol untuk instruksi kerja',
    ],
    correctIndex: 0,
    explanation: '流動数曲線 (Kurva aliran) Sumbu X = waktu, Sumbu Y = jumlah kumulatif masuk/keluar. Berguna untuk melihat aliran produksi.',
  },
  {
    id: 37,
    question: 'Dalam keselamatan kerja terkait mesin khusus (特定機械), manakah yang paling tidak tepat?',
    options: [
      'A. Mesin tertentu seperti boiler perlu persetujuan desain',
      'B. Pemeriksaan termasuk pemeriksaan struktur',
      'C. Tidak perlu pemeriksaan saat dipasang kembali',
      'D. Harus diperiksa saat pemasangan',
    ],
    correctIndex: 2,
    explanation: 'Mesin yang dipasang kembali (pemindahan) tetap harus diperiksa. Semua pemasukan/pemasangan mesin khusus memerlukan pemeriksaan.',
  },
  {
    id: 38,
    question: 'Dalam prinsip dasar keselamatan manusia, manakah yang paling tepat?',
    options: [
      'A. Pekerja sudah terlatih tetap harus mengulang semua pelatihan',
      'B. Untuk pekerjaan berbahaya, wajib pelatihan khusus dan menyimpan data selama 3 tahun',
      'C. 4S adalah menambahkan disiplin ke 3S',
      'D. 5S dimulai dari pembersihan (seiri)',
    ],
    correctIndex: 1,
    explanation: 'Pekerjaan berbahaya (keselamatan dan kesehatan kerja) wajib pelatihan khusus dan data disimpan selama 3 tahun.',
  },
  {
    id: 39,
    question: 'Dalam pernyataan tentang pencegahan pencemaran lingkungan, manakah yang paling tidak tepat?',
    options: [
      'A. Pencemaran lingkungan utama termasuk hujan asam',
      'B. Dalam UU pencegahan pencemaran udara terdapat aturan tentang gas buang kendaraan sebagai sumber pencemaran bergerak',
      'C. Dalam UU kebisingan terdapat aturan tentang kebisingan dari pabrik dan konstruksi serta batas kebisingan',
      'D. Dalam UU pencemaran air terdapat aturan tentang pembuangan limbah ke perairan umum dan peresapan ke tanah',
    ],
    correctIndex: 0,
    explanation: 'Hujan asam bukan termasuk pencemaran lingkungan utama. Pencemaran utama = pencemaran udara, air, tanah, kebisingan, getaran, bau.',
  },
  {
    id: 40,
    question: 'Di antara zat berikut, manakah yang paling tidak sesuai sebagai pencemar udara utama?',
    options: [
      'A. Oksida sulfur (硫黄酸化物)',
      'B. Kadmium (カドミウム)',
      'C. Asbes (アスベスト)',
      'D. Hidrogen fluorida (フッ化水素)',
    ],
    correctIndex: 2,
    explanation: 'Asbes termasuk pencemar yang dikategorikan terpisah. Pencemar udara utama dalam konteks ini adalah gas industri: SOx, NOx, dust, fluorine.',
  },
];

const PASSING_SCORE = 60; // 60%
const TIME_MINUTES = 90;

const colors = {
  bg: '#0a1519',
  cardBg: '#1a1a2e',
  inputBg: '#212c30',
  darkText: '#c8c4d7',
  lightText: '#d8e4ea',
  brand: '#6c5ce7',
  teal: '#4bddb7',
  gold: '#f0bf63',
  coral: '#ffb4ab',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function OptionButton({
  label,
  text,
  state,
  onClick,
}: {
  label: string;
  text: string;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  onClick: () => void;
}) {
  const borderColors = {
    idle: 'border-[#2D2D44]',
    selected: 'border-[#6C5CE7]',
    correct: 'border-[#4bddb7] bg-[#4bddb7]/10',
    wrong: 'border-[#ff6b6b] bg-[#ff6b6b]/10',
  };
  const textColors = {
    idle: 'text-[#c8c4d7]',
    selected: 'text-white',
    correct: 'text-[#4bddb7]',
    wrong: 'text-[#ff6b6b]',
  };
  const icons = { idle: '', selected: '', correct: '✓', wrong: '✗' };

  return (
    <button
      onClick={onClick}
      disabled={state === 'correct' || state === 'wrong'}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${borderColors[state]} ${state !== 'idle' ? 'opacity-90' : 'hover:border-[#6C5CE7]/60'}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex items-start gap-3">
        <span className={`font-bold text-sm mt-0.5 ${textColors[state]}`}>{label}</span>
        <span className={`flex-1 text-sm ${textColors[state]}`}>{text}</span>
        {state !== 'idle' && <span className={`font-bold ${state === 'correct' ? 'text-[#4bddb7]' : 'text-[#ff6b6b]'}`}>{icons[state]}</span>}
      </div>
    </button>
  );
}

export default function BisnisKarirPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1519] flex items-center justify-center"><span className="text-white/40">Memuat...</span></div>}>
      <BisnisKarirContent />
    </Suspense>
  );
}

function BisnisKarirContent() {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedNow, setSelectedNow] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_MINUTES * 60);

  const questions = BISNIS_KARIR_QUESTIONS;
  const total = questions.length;
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  const result = useMemo(() => {
    if (!finished) return null;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / total) * 100);
    return { correct, score, passed: score >= PASSING_SCORE };
  }, [finished, answers, questions, total]);

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const handleAnswer = (optionIndex: number) => {
    if (selectedNow !== null) return;
    setSelectedNow(optionIndex);
    setAnswers((prev) => ({ ...prev, [currentQ]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQ < total - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedNow(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentQ(0);
    setAnswers({});
    setSelectedNow(null);
    setShowExplanation(false);
    setFinished(false);
    setTimeLeft(TIME_MINUTES * 60);
  };

  // ── Result Screen ──────────────────────────────────────────────
  if (finished && result) {
    return (
      <div className="min-h-screen bg-[#0a1519] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center p-8 rounded-3xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className={`text-6xl font-black mb-4 ${result.passed ? 'text-[#4bddb7]' : 'text-[#ff6b6b]'}`}>
            {result.passed ? '🎉' : '😔'}
          </div>
          <h1 className={`text-2xl font-black mb-2 ${result.passed ? 'text-[#4bddb7]' : 'text-[#ff6b6b]'}`}>
            {result.passed ? 'LULUS!' : 'BELUM LULUS'}
          </h1>
          <p className="text-[#c8c4d7] mb-6">
            {result.passed
              ? 'Selamat! Kamu berhasil melewati ambang batas.'
              : `你需要 ${PASSING_SCORE}% untuk lulus. Coba lagi!`}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <div className="text-2xl font-black text-white">{result.score}%</div>
              <div className="text-xs text-[#c8c4d7]">Skor</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <div className="text-2xl font-black text-[#4bddb7]">{result.correct}/{total}</div>
              <div className="text-xs text-[#c8c4d7]">Benar</div>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <div className="text-2xl font-black text-[#ff6b6b]">{total - result.correct}/{total}</div>
              <div className="text-xs text-[#c8c4d7]">Salah</div>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="w-full py-4 rounded-xl font-bold text-white mb-3"
            style={{ backgroundColor: colors.brand }}
          >
            🔄 Coba Lagi
          </button>
          <Link href="/learn" className="block w-full py-3 rounded-xl font-medium text-[#c8c4d7]" style={{ backgroundColor: colors.inputBg }}>
            ← Kembali ke Belajar
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Start Screen ───────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-[#0a1519]">
        <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[#2D2D44]" style={{ backgroundColor: '#0a1519e6' }}>
          <div className="max-w-md mx-auto px-4 h-16 flex items-center">
            <Link href="/learn" className="flex items-center gap-2 text-[#c8c4d7] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 4L4 10l6 6M4 10h12" />
              </svg>
              <span className="text-sm">Belajar</span>
            </Link>
            <div className="flex-1 text-center">
              <span className="text-base font-bold text-white">Bisnis Karir</span>
            </div>
            <div className="w-16" />
          </div>
        </header>
        <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 rounded-3xl text-center"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="text-5xl mb-4">💼</div>
            <h1 className="text-xl font-black text-white mb-2">CBT Bisnis Karir Reiwa 7</h1>
            <p className="text-[#c8c4d7] text-sm mb-6">Simulasi ujian bisnis karier manufaktur — versi soal lengkap</p>
            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
                <div className="text-lg font-black text-white">{total}</div>
                <div className="text-xs text-[#c8c4d7]">Soal</div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
                <div className="text-lg font-black text-white">{TIME_MINUTES} min</div>
                <div className="text-xs text-[#c8c4d7]">Durasi</div>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
                <div className="text-lg font-black text-[#4bddb7]">{PASSING_SCORE}%</div>
                <div className="text-xs text-[#c8c4d7]">Lulus</div>
              </div>
            </div>
            <div className="text-xs text-[#c8c4d7] mb-6 p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              📌 Setiap jawaban langsung menunjukkan benar/salah + penjelasan
            </div>
            <button
              onClick={() => setStarted(true)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}
            >
              🚀 Mulai Ujian
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Question Screen ─────────────────────────────────────────────
  const selectedAnswer = answers[currentQ];
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  return (
    <div className="min-h-screen bg-[#0a1519] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[#2D2D44]" style={{ backgroundColor: '#0a1519e6' }}>
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-sm text-[#c8c4d7]">
            {currentQ + 1}/{total}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-bold ${timeLeft <= 300 ? 'text-[#ff6b6b] bg-[#ff6b6b]/10' : 'text-[#c8c4d7]'}`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-[#c8c4d7]">
            ✓ {answeredCount}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1" style={{ backgroundColor: colors.inputBg }}>
          <div
            className="h-full rounded-r-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / total) * 100}%`, backgroundColor: colors.brand }}
          />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Question card */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 rounded-2xl mb-5"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="text-xs font-bold text-[#6c5ce7] mb-3">SOAL {currentQ + 1}</div>
          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{currentQuestion.question}</p>
        </motion.div>

        {/* Options */}
        <div className="space-y-3 mb-5">
          {currentQuestion.options.map((opt, i) => {
            let state: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle';
            if (showExplanation) {
              if (i === currentQuestion.correctIndex) state = 'correct';
              else if (i === selectedNow) state = 'wrong';
            } else if (selectedNow === i) {
              state = 'selected';
            }
            const labels = ['A', 'B', 'C', 'D'];
            return (
              <OptionButton
                key={i}
                label={labels[i]}
                text={opt}
                state={state}
                onClick={() => handleAnswer(i)}
              />
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl mb-5"
              style={{ backgroundColor: isCorrect ? '#4bddb720' : '#ff6b6b20', border: `1px solid ${isCorrect ? '#4bddb740' : '#ff6b6b40'}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-black text-sm ${isCorrect ? 'text-[#4bddb7]' : 'text-[#ff6b6b]'}`}>
                  {isCorrect ? '✓ BENAR!' : '✗ KURANG TEPAT'}
                </span>
              </div>
              <p className="text-sm text-[#c8c4d7] leading-relaxed">
                {isCorrect
                  ? 'Jawaban kamu benar! 🎉'
                  : `Jawaban benar: ${['A', 'B', 'C', 'D'][currentQuestion.correctIndex]}`}
              </p>
              {currentQuestion.explanation && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs font-bold text-[#c8c4d7] mb-1">📖 Penjelasan</p>
                  <p className="text-sm text-[#d8e4ea] leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next / Submit */}
        {showExplanation && (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-xl font-bold text-white text-sm"
            style={{ backgroundColor: colors.brand }}
          >
            {currentQ < total - 1 ? 'Soal Berikutnya →' : 'Selesai & Lihat Hasil'}
          </button>
        )}
      </div>
    </div>
  );
}
