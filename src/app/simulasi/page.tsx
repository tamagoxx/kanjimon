'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai' | 'seisan' | 'hinshitsu' | 'genka' | 'anzen';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// CBT Karier Bisnis Manufacturing - Source: Google Drive PDF (40 questions)
// Q1-10: 生産管理 | Q11-20: 品質管理 | Q21-30: 原価管理 | Q31-40: 安全衛生・物流
// Format: Soal dalam Bahasa Indonesia + reading Jepang dalam （）
// ⚠ Q11, Q13, Q20, Q27-40 = soal kombinasi/matching (lihat explanation untuk jawaban)
const KARIER_QUESTIONS: Question[] = [
  { id: 1, section: 'seisan', question: '問題 1．広義の生産管理に関する管理活動として最も不適切なものは、次のうちどれか。', options: ['ア. Manajemen pembelian（こうばいかんり）', 'イ. Manajemen biaya（げんかかんり）', 'ウ. Manajemen sumber daya manusia（じんじかんり）', '工. Manajemen peralatan（せつびかんり）'], correctIndex: 2, explanation: '広義の生産管理不包括人事管理（じんじかんり）。人事管理属于HR领域，不是直接的生产管理活动。生产管理包括：购买管理、原价管理、设备管理。正确答案：ウ.' },
  { id: 2, section: 'seisan', question: '問題 2．作業管理の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。', options: ['ア. Mengejar metode kerja yang rasional dan memiliki produktivitas tinggi', 'イ. Merencanakan produksi dan mengendalikan produksi', 'ウ. Menstandarkan metode kerja dan menetapkan waktu standar', 'エ. Menyusun prosedur operasi dan panduan kerja'], correctIndex: 0, explanation: '作業管理の核心是追求合理、高效的作业方法（提高生产率）。而生产计划的制定属于生产管理（生産管理）的范畴，而非作业管理的核心内容。イ是正确的作业管理内容。正确答案：ア.' },
  { id: 3, section: 'seisan', question: '問題 3．改善を目的とした工程分析に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'イ. Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi atau penumpukan, tetapi tidak dapat mengurangi proses pengerjaan atau pemeriksaan.', 'ウ. Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'エ. Saat melakukan analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkan indeks tersebut.'], correctIndex: 0, explanation: '在工序分析中，如果发现不必要的加工或检查工序，可以进行改善或消除。活性示数高表示效率好，降低它不是改善方向。金型交换是准备活动而非加工。正确答案：ア.' },
  { id: 4, section: 'seisan', question: '問題 4．稼働分析に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Analisis aktivitas bertujuan untuk menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'イ. Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya digunakan untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'ウ. Metode pengambilan sampel kerja (work sampling) membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'エ. Saat menganalisis pekerjaan yang bersifat siklik dengan metode work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'], correctIndex: 1, explanation: '稼働分析的对象是操作员或机器的状态（作业中、待机中、休息中、故障中等）。连续观测法（連続観測法）不仅用于改善工作系统，还用于确定设定标准时间时的宽裕率。正确答案：イ.' },
  { id: 5, section: 'seisan', question: '問題 5．連合作業分析に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya menggunakan analisis aktivitas, bukan analisis kerja gabungan.', 'イ. Dalam diagram orang–mesin (man–machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'ウ. Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya menggunakan analisis kerja gabungan daripada metode PTS.', 'エ. Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'], correctIndex: 2, explanation: '当多名作业人员并行同时在一个对象上工作时，应使用联合作业分析（連合作業分析）而非PTS法。PTS法适用于个别作业，联合作业分析可以掌握等待、协调、不同步的时间。正确答案：ウ.' },
  { id: 6, section: 'seisan', question: '問題 6．動作経済の原則に関する分類項目として最も不適切なものは、次のうちどれか。', options: ['ア. Klasifikasi yang berkaitan dengan penggunaan tubuh', 'イ. Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'ウ. Klasifikasi yang berkaitan dengan penanganan bahan', 'エ. Klasifikasi yang berkaitan dengan area kerja（さぎょういかんれんぶ）'], correctIndex: 2, explanation: '動作経済的原则分为3大类：①身体的使用分类、②工具和设备的设计分类、③作業域的分类。材料处理（材料的取り扱い）不属于主要分类。正确答案：ウ.' },
  { id: 7, section: 'seisan', question: '問題 7．5S活動に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'イ. Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'ウ. Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'エ. Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'], correctIndex: 2, explanation: '5S的顺序是：整理→整顿→清扫→清洁→躾。清洁（清掃）是5S中的第三步，是独立的步骤，而不是仅通过整理、整顿、躾就能自动实现。跳过清扫步骤是不正确的。正确答案：ウ.' },
  { id: 8, section: 'seisan', question: '問題 8．工程管理における緩衝に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'イ. Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'ウ. Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'エ. Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'], correctIndex: 0, explanation: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.' },
  { id: 9, section: 'seisan', question: '問題 9．見込生産に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'イ. Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'ウ. Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'エ. Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'], correctIndex: 2, explanation: '見込生産（見込生産）的特点是：厂商自行预测市场需求，并根据预测将产品投放市场。是订单生产的反面。正确答案：ウ.' },
  { id: 10, section: 'seisan', question: '問題 10．多種少量生産に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'イ. Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'ウ. Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'エ. Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'], correctIndex: 3, explanation: '多种少量生産（多種少量生産）的特点：因产品种类多，每种产品的工序各不相同，工序间相互重叠变得复杂。与少种多量生产、个别生产不同。正确答案：エ.' },
  { id: 11, section: 'hinshitsu', question: '問題 11．＜工数と日程に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。', options: ['ア. A:1 B:4 C:5 D:7', 'イ. A:2 B:3 C:6 D:7', 'ウ. A:2 B:3 C:5 D:8', 'エ. A:1 B:4 C:6 D:8'], correctIndex: 0, explanation: 'A=余力管理(1)→调整产能与负荷的管理; B=バックワード法(4)→基于交货期制定日程的方法; C=有限山積法(5)→基于作业时间表分配负荷的方法; D=ディスパッチング法(7)→单件生产中的排程方法. 正确答案：ア (A-1, B-4, C-5, D-7).' },
  { id: 12, section: 'hinshitsu', question: '問題 12．生産統制の管理業務と生産計画との関係性に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. 现品管理与材料计划、运输管理相关。', 'イ. 进度管理涉及根据中等日程计划展开物资计划和外包计划。', 'ウ. 余力管理与小日程计划的作业开始日期控制相关。', 'エ. 作业分配与工数计划的修正相关。'], correctIndex: 0, explanation: '現品管理是管理实际物品如材料、零部件及生产中运输和分配的活动。因此它与材料计划和运输管理密切相关。正确答案：ア.' },
  { id: 13, section: 'hinshitsu', question: '問題 13．以下に示す作業分配に関する記述において、（）に当てはまる＜語句＞の組合せとして最も適切なものは？', options: ['ア. A:8 B:4 C:6 D:2', 'イ. A:2 B:3 C:5 D:8', 'ウ. A:8 B:4 C:6 D:2', 'エ. A:1 B:4 C:5 D:7'], correctIndex: 2, explanation: '正确的组合是A-8(順序づけ法), B-4(バックワード法), C-6(無限山積法), D-2(工数計画)。这是关于作业分配与术语组合的匹配题。正确答案：ウ (A-8, B-4, C-6, D-2).' },
  { id: 14, section: 'hinshitsu', question: '問題 14．現品管理に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'イ. Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'ウ. Untuk memudahkan pemeriksaan jumlah barang, sebaiknya menggunakan wadah standar, menetapkan cara pengemasan standar, dan menyeragamkan cara penempatan saat penyimpanan sementara.', 'エ. Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'], correctIndex: 1, explanation: '現品管理活动中，制备准备（製作手配）是执行生产计划的活动。核查实际物品与账簿差异的活动是盘点（棚卸），而非制备准备。イ的描述混淆了两者。正确答案：イ.' },
  { id: 15, section: 'hinshitsu', question: '問題 15．設備管理の機能に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'イ. Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'ウ. Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'エ. Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'], correctIndex: 3, explanation: '设备管理功能包括：建设进度管理→设备预算管理；设备设计→设备预算编制；维护计划→维护预算编制。而作业标准制定主要用于质量管理和作业指导，与维护预算编制无直接关系。正确答案：エ.' },
  { id: 16, section: 'hinshitsu', question: '問題 16．設備保全の目的に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'イ. Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'ウ. Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'エ. Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'], correctIndex: 0, explanation: '设备维护的目的包括：确保安全、保证产品质量、节能降耗。员工福祉属于人力资源管理范畴，不是设备维护的直接目的。正确答案：ア.' },
  { id: 17, section: 'hinshitsu', question: '問題 17．日常保全に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'イ. Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'ウ. Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'エ. Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'], correctIndex: 3, explanation: '日常保全中，详细检查和设备修理原则上应由专职维修部门进行，而非由操作该机器的操作员进行。当发现设备异常时，应按规程向维修部门报告。エ的表述不正确。正确答案：エ.' },
  { id: 18, section: 'hinshitsu', question: '問題 18．生産設備の劣化によって生じる損失に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Biaya transportasi akan meningkat.', 'イ. Output produksi akan menurun.', 'ウ. Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'エ. Kualitas produk akan menurun.'], correctIndex: 0, explanation: '生产设备劣化不会直接导致运输费用增加。运输费用与物流活动相关，与设备状态无直接关系。设备劣化会导致：产量下降、原材料消耗率恶化、产品质量下降。正确答案：ア.' },
  { id: 19, section: 'hinshitsu', question: '問題 19．設備保全における重点設備の選定対象となる設備として最も不適切なものは、次のうちどれか。', options: ['ア. 进入磨损故障期的设备（接近使用寿命末期）', 'イ. 用于生产重要产品的设备', 'ウ. 没有备用产能的设备', 'エ. 损坏时会导致成本大幅增加的设备'], correctIndex: 0, explanation: '已进入磨损故障期的设备意味着接近使用寿命末期。此时应进行更换或大修，而非作为维护重点。维护对此类设备效果低且不经济。正确答案：ア.' },
  { id: 20, section: 'hinshitsu', question: '問題 20．資材管理における＜分類＞と＜対象資材＞との組合せとして最も適切なものは？', options: ['ア. 常備材料・非常備材料 (管理面)', 'イ. 直接材料・間接材料 (使用目的)', 'ウ. 有材・無材 (形態)', 'エ. 原材料・完成品 (状態)'], correctIndex: 1, explanation: '资材管理的分类：管理面分类→常备材料/非常备材料；使用目的分类→直接材料/间接材料；形态分类→有材/无材；状态分类→原材料/在制品/完成品。正确答案：イ (直接材料・間接材料 = 使用目的).' },
  { id: 21, section: 'genka', question: '問題 21．在庫管理に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'イ. Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'ウ. Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'エ. Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'], correctIndex: 3, explanation: '定量订货方式（定量発注法）需要监控库存水平，必要时调整安全库存和订货点。定期订货法的公式是：订货量=最高库存-现有库存+订货间隔期间的平均需求量。正确答案：エ.' },
  { id: 22, section: 'genka', question: '問題 22．棚卸に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 定期盘点（定期棚卸）是为了年度或季度财务报表而进行的。', 'イ. 在实物上应贴上货架标签、物品标签和盘点卡。', 'ウ. 经常盘点（常時棚卸）需要停止仓库全部作业。', 'エ. 进行盘点时，需要标准化工作程序和管理方式以保证准确性。'], correctIndex: 2, explanation: '定期盘点是为了年度或季度财务报表而进行的，需要停止仓库全部作业。而经常盘点是在日常工作中随时进行盘点，不需要停止全部活动。正确答案：ウ.' },
  { id: 23, section: 'genka', question: '問題 23．物流コストにおける機能別分類に関する費用項目として最も不適切なものは、次のうちどれか。', options: ['ア. 运输费（ゆそうひ）', 'イ. 包装费（ほうそうひ）', 'ウ. 流通加工费（りゅうつうかこうひ）', 'エ. 销售运输费（うりあげうんちん）'], correctIndex: 3, explanation: '物流成本的功能分类包括：运输费、保管费、包装费、流通加工费、装卸费、物流信息管理费。销售运输费属于销售费用，不属于物流成本的功能分类。正确答案：エ.' },
  { id: 24, section: 'genka', question: '問題 24．倉庫内のロケーション管理に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. 固定位置管理中，物品按顺序存放在空出的可用位置。', 'イ. 自由位置管理中，物品与位置没有固定关系，因此无法高效利用存储空间。', 'ウ. 为提高拣货工作效率而放置在拣货区域的库存称为主动型库存（アクティブ型）。', 'エ. 当存在主动型和备用型库存时，不需要区分它们的放置位置。'], correctIndex: 2, explanation: '主动型库存（アクティブ型在庫）是放置在拣货区域的库存，用于提高拣货工作效率。正确答案：ウ.' },
  { id: 25, section: 'genka', question: '問題 25．包装に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 按形状分类，包装分为三种：个体包装、内包装、外包装。', 'イ. 内包装是位于商品外包装内部的包装。', 'ウ. 按目的分类，包装分为工业包装和商业包装。', 'エ. 用于运输货物的包装是以销售为目的的商业包装。'], correctIndex: 3, explanation: '按目的分类，包装分为工业包装和商业包装。工业包装用于运输和保护产品，商业包装用于销售。发货运送用的包装属于工业包装，而非商业包装。正确答案：エ.' },
  { id: 26, section: 'genka', question: '問題 26．品質と品質特性に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 品质特性应尽可能定量表示。', 'イ. 真正的特性是顾客想要的品质特性，代用特性是在无法直接测量真正特性时的替代特性。', 'ウ. 品质必须在整个产品生命周期中保持。', 'エ. 安全性是品质特性之一。'], correctIndex: 0, explanation: '品质特性应尽可能定量（定量化）表示，而非仅定性表示。定性表示不符合品质管理原则。正确答案：ア.' },
  { id: 27, section: 'genka', question: '問題 27．品質改善に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？', options: ['ア. ①:カタヨリ ②:16.0 ③:3.0 ④:A', 'イ. ①:バラツキ ②:16.0 ③:3.0 ④:A', 'ウ. ①:カタヨリ ②:16.0 ③:3.0 ④:B', 'エ. ①:バラツキ ②:16.0 ③:3.0 ④:B'], correctIndex: 3, explanation: '①数据总是存在偏差（バラツキ）；②标准偏差4.0→方差16.0；③方差9.0→标准偏差3.0；④两个工程均值相同(50.0)，A的SD=4.0，B的SD=3.0，B更稳定。正确答案：エ (①:バラツキ, ②:16.0, ③:3.0, ④:B).' },
  { id: 28, section: 'hinshitsu', question: '問題 28．検査の考え方に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 外包接受检查的原则是进行全数检查。', 'イ. 当产品价格低廉且允许一定比例的不良品混入时使用抽样检查。', 'ウ. 将实际合格的批次判定为不合格的错误是生产者危险。', 'エ. 全数检查并不能保证所有产品都是合格品。'], correctIndex: 0, explanation: '外包接受检查并非原则上是全数检查。应根据物品的重要性和成本选择全数检查或抽样检查。全数检查并非基本原则。正确答案：ア.' },
  { id: 29, section: 'hinshitsu', question: '問題 29．品質保証に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. ISO9001是国际标准，JIS没有对应标准。', 'イ. 根据PL法，即使没有过失也可以要求损害赔偿（无过失责任）。', 'ウ. 品质保证活动中，品质管理可以全部委托给生产部门。', 'エ. 可追溯性是指产品有问题时，公布并回收、修理产品的活动。'], correctIndex: 1, explanation: 'ISO 9001是国际标准，日本发布了同等版本JIS Q 9001。根据PL法（制造物责任法），消费者无需证明过失即可要求损害赔偿（无过失责任）。正确答案：イ.' },
  { id: 30, section: 'genka', question: '問題 30．コストコントロールの内容に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. 成本控制是降低目标成本的活动。', 'イ. 成本降低是降低标准成本的活动。', 'ウ. 成本控制是将实际成本降至标准成本的活动。', 'エ. 成本控制是在设计阶段将估算成本降至目标成本的活动。'], correctIndex: 2, explanation: '成本控制（コストコントロール）是将实际成本降至标准成本的活动。成本降低（原価低減）是在设计阶段降低目标成本的活动，两者概念不同。正确答案：ウ.' },
  { id: 31, section: 'genka', question: '問題 31．原価に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 现行成本是基于现有技术估算的成本。', 'イ. 沉没成本被认为是选择替代方案时，被抛弃的替代方案所丧失的最大利益。', 'ウ. 标准成本是在标准操业度下，使用标准方法、标准能率和标准成本率计算的成本。', 'エ. 部分成本是根据计算目的，仅汇总特定成本要素的成本。'], correctIndex: 1, explanation: '选项I描述的是机会费用的定义（选择替代方案时丧失的最大利益），而非沉没成本的定义。沉没成本是已发生且无法收回的费用。正确答案：イ.' },
  { id: 32, section: 'genka', question: '問題 32．製造直接費及び製造間接費に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. 制造直接费和制造间接费是根据操业度分类的。', 'イ. 将制造直接费按产品汇总叫做直课。', 'ウ. 将制造间接费按一定标准分配到产品叫做配赋。', 'エ. 与机器维护相关的劳务费是制造间接费。'], correctIndex: 0, explanation: '制造直接费和制造间接费是根据与产品的关系分类的，而非根据作业度分类。按作业度分类的是变动费和固定费。正确答案：ア.' },
  { id: 33, section: 'genka', question: '問題 33．原価低減に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. 成本降低效果最大的是在制造阶段。', 'イ. 成本降低包括原价策划阶段的成本降低和制造阶段的成本改善。', 'ウ. IE直接有助于设计阶段的成本改善。', 'エ. 为了降低直接材料费，需要缩短消费时间。'], correctIndex: 1, explanation: '原价降低效果约70-80%在设计阶段（原价策划阶段）就已决定，而非制造阶段。IE在制造阶段对原价改善有直接贡献。正确答案：イ.' },
  { id: 34, section: 'anzen', question: '問題 34．日常的に発生する納期遅れに対処するための調査方法として最も不適切なものは？', options: ['ア. 生产能力与现有工作量的平衡调查（是否能力不足）', 'イ. 日程管理的实施情况调查', 'ウ. 调查是否轻易投入紧急订单或计划外工作', 'エ. 调查所有工序是否确保了增加库存的空间'], correctIndex: 3, explanation: '在所有工序增加库存并不是解决交货延迟的根本方法，反而会造成空间和成本的浪费。需要的是供需平衡的改善。正确答案：エ.' },
  { id: 35, section: 'anzen', question: '問題 35．資材部門の外注品納期遅延対策として最も不適切なものは？', options: ['ア. 与供应商定期召开会议并确认进度情况', 'イ. 用图表分析交付实绩把握延迟模式', 'ウ. 要求供应商在最终交付日期一次性交付全部数量', 'エ. 对可能延迟的采购品活用カムアップ系统'], correctIndex: 2, explanation: '要求供应商一次性全部交付大批量货物会导致库存积压和资金占用问题，不是有效的交货延迟对策。正确答案：ウ.' },
  { id: 36, section: 'anzen', question: '問題 36．目で見る管理が適切に行われている職場の状態として最も適切なものは？', options: ['ア. 使用流动数曲线显示工序间的物料数量和停留时间', 'イ. 作业人员离开岗位去取零部件', 'ウ. 将生产所需油脂类大量堆积在保管库深处', 'エ. 接到库存询问时员工反复确认才回答'], correctIndex: 0, explanation: '流动数曲线（流動数曲線）可以可视化显示工序间的物料流动和停滞情况，便于发现问题。是目视管理的有效工具。正确答案：ア.' },
  { id: 37, section: 'anzen', question: '問題 37．安全衛生活動の推進に関する記述として最も不適切なものは？', options: ['ア. 依据劳动安全卫生法，雇主有确保安全工作环境的义务', 'イ. 劳动灾害只因不安全行为而产生', 'ウ. 积极活用ヒヤリ・ハット活动', 'エ. 推进机械和设备本身的本质安全化'], correctIndex: 1, explanation: '劳动灾害是不安全行为和不安全状态的组合造成的，仅强调人为因素而忽视设备、环境、制度等系统因素是不全面的。正确答案：イ.' },
  { id: 38, section: 'anzen', question: '問題 38．特別教育を受けなくても従事できる業務は？', options: ['ア. 1吨以上起重机的挂钩作业', 'イ. 小型锅炉以外锅炉的操作业务', 'ウ. 5吨以上起重机的操作业务', 'エ. 最大载重1吨未满的叉车操作业务'], correctIndex: 3, explanation: '根据安卫则，最大荷载1吨以下的叉车只需特殊教育即可从事，不需要执照。而1吨以上起重机挂钩、锅炉操作、5吨以上起重机操作都需要国家资格证书。正确答案：エ.' },
  { id: 39, section: 'anzen', question: '問題 39．四大公害病と原因物質の組合せとして最も適切なものは？', options: ['ア. 水俣病-砷', 'イ. イタイイタイ病-镉', 'ウ. 新潟水俣病-六价铬', 'エ. 四日市哮喘-硫黄化合物'], correctIndex: 3, explanation: '四大公害：水俣病（有机水银/甲基汞）、イタイイタイ病（镉/Cd）、新潟水俣病（有机水银）、四日市哮喘（硫氧化物/SOx）。エ的正确：水俣病对应有机水银，四日市哮喘对应硫化物。正确答案：エ.' },
  { id: 40, section: 'anzen', question: '問題 40．大気汚染防止法に関する記述として最も適切なものは？', options: ['ア. 煤烟浓度的测量结果须保存10年', 'イ. 设施变更时也需要申报', 'ウ. 排放标准根据污染物质种类和设施种类、规模设定', 'エ. 记录有永久保存的义务'], correctIndex: 2, explanation: '排放标准的设定依据是污染物质种类和设施种类（规模）。浓度测量结果需保存3年。设施变更时需申报。正确答案：ウ.' },
  { id: 2, section: 'bunpou', question: '問題 2．作業管理の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。', options: ['ア. Mengejar metode kerja yang rasional dan memiliki produktivitas tinggi', 'イ. Merencanakan produksi dan mengendalikan produksi', 'ウ. Menstandarkan metode kerja dan menetapkan waktu standar', 'エ. Menyusun prosedur operasi dan panduan kerja'], correctIndex: 0, explanation: '作業管理の核心是追求合理、高效的作业方法（提高生产率）。而生产计划的制定属于生产管理（生産管理）的范畴，而非作业管理的核心内容。正确答案：ア.' },
  { id: 3, section: 'bunpou', question: '問題 3．改善を目的とした工程分析に関する記述として最も適切なものは、次のうちどれか.', options: ['ア. Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'イ. Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi atau penumpukan, tetapi tidak dapat mengurangi proses pengerjaan atau pemeriksaan.', 'ウ. Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'エ. Saat melakukan analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkan indeks tersebut.'], correctIndex: 0, explanation: '.operator在检查产品表面污渍时进行的质量检查属于质量检查（品質検査）。在工序分析中，如果发现不必要的加工或检查工序，可以进行改善或消除。正确答案：ア.' },
  { id: 4, section: 'bunpou', question: '問題 4．稼働分析に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Analisis aktivitas bertujuan untuk menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'イ. Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya digunakan untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'ウ. Metode pengambilan sampel kerja (work sampling) membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'エ. Saat menganalisis pekerjaan yang bersifat siklik dengan metode work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'], correctIndex: 1, explanation: '稼働分析的对象是操作员或机器的状态（作业中、待机中、休息中、故障中等）。连续观测法（連続観測法）不仅用于改善工作系统，还用于确定设定标准时间时的宽裕率。正确答案：イ.' },
  { id: 5, section: 'bunpou', question: '問題 5．連合作業分析に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya menggunakan analisis aktivitas, bukan analisis kerja gabungan.', 'イ. Dalam diagram orang–mesin (man–machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'ウ. Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya menggunakan analisis kerja gabungan daripada metode PTS.', 'エ. Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'], correctIndex: 2, explanation: '当多名作业人员并行同时在一个对象上工作时，应使用联合作业分析（連合作業分析）而非PTS法。PTS法适用于个别作业，联合作业分析可以掌握等待、协调、不同步的时间。正确答案：ウ.' },
  { id: 6, section: 'bunpou', question: '問題 6．動作経済の原則に関する分類項目として最も不適切なものは、次のうちどれか。', options: ['ア. Klasifikasi yang berkaitan dengan penggunaan tubuh', 'イ. Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'ウ. Klasifikasi yang berkaitan dengan penanganan bahan', 'エ. Klasifikasi yang berkaitan dengan area kerja（さぎょういかんれんぶ）'], correctIndex: 2, explanation: '動作经济的原则分为3大类：①身体的使用分类、②工具和设备的设计分类、③作业域的分类。材料处理（材料的取り扱い）不属于主要分类。正确答案：ウ.' },
  { id: 7, section: 'bunpou', question: '問題 7．5S活動に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'イ. Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'ウ. Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'エ. Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'], correctIndex: 2, explanation: '5S的顺序是：整理→整顿→清扫→清洁→躾。清洁（清掃）是5S中的第三步，是独立的步骤，而不是仅通过整理、整顿、躾就能自动实现。跳过清扫步骤是不正确的。正确答案：ウ.' },
  { id: 8, section: 'bunpou', question: '問題 8．工程管理における緩衝に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'イ. Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'ウ. Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'エ. Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'], correctIndex: 0, explanation: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.' },
  { id: 9, section: 'bunpou', question: '問題 9．見込生産に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'イ. Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'ウ. Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'エ. Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'], correctIndex: 2, explanation: '见込生产（見込生産）的特点是：厂商自行预测市场需求，并根据预测将产品投放市场。是订单生产的反面。正确答案：ウ.' },
  { id: 10, section: 'bunpou', question: '問題 10．多種少量生産に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'イ. Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'ウ. Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'エ. Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'], correctIndex: 3, explanation: '多种少量生产（多種少量生産）的特点：因产品种类多，每种产品的工序各不相同，工序间相互重叠变得复杂。与少种多量生产、个别生产不同。正确答案：エ.' },
  { id: 11, section: 'bunpou', question: '問題 11．＜工数と日程に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation untuk jawaban A/B/C/D]', '[A] Manajemen yang menyesuaikan kapasitas dan beban kerja', '[B] Metode penjadwalan berdasarkan tanggal pengiriman', '[C] Metode pembagian beban berdasarkan jam kerja (負荷工数)', '[D] Metode penjadwalan dalam produksi satuan'], correctIndex: 0, explanation: 'A=負荷工数管理(调整产能与负荷的管理), B=日程計画法(基于交货期制定日程的方法), C=割付计划(基于作业时间表分配负荷的方法), D=ロット生產計画(单件生产中的排程方法). 正确答案需对照原文组合.' },
  { id: 12, section: 'bunpou', question: '問題 12．生産統制の管理業務と生産計画との関係性に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Manajemen barang fisik berkaitan dengan perencanaan material dan manajemen transportasi.', 'イ. Manajemen kemajuan berkaitan dengan pelaksanaan rencana material dan rencana outsourcing berdasarkan rencana jangka menengah.', 'ウ. Manajemen kapasitas cadangan berkaitan dengan pengendalian jadwal mulai kerja dalam rencana jangka pendek.', 'エ. Pembagian pekerjaan berkaitan dengan penyesuaian rencana jam kerja.'], correctIndex: 0, explanation: '现品管理（現品管理）是管理实际物品如材料、零部件及生产中运输和分配的活动。因此它与材料计划（材料計画）和运输管理（運輸管理）密切相关。正确答案：ア.' },
  { id: 13, section: 'bunpou', question: '問題 13．以下に示す作業分配に関する記述において、（ ）に当てはまる＜語句＞の組合せとして最も適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 工数管理で調整する', '[B] 日程計画法', '[C] 負荷工数で割付', '[D] ロット生産計画'], correctIndex: 2, explanation: '正确的组合是A-8, B-4, C-6, D-2 (ウ)。这是关于作业分配与术语组合的匹配题，需对照原文表格选择正确答案。正确答案：ウ (A-8, B-4, C-6, D-2).' },
{ id: 14, section: 'genka', question: '問題 14．現品管理に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'イ. Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'ウ. Untuk memudahkan pemeriksaan jumlah barang, sebaiknya menggunakan wadah standar, menetapkan cara pengemasan standar, dan menyeragamkan cara penempatan saat penyimpanan sementara.', 'エ. Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'], correctIndex: 1, explanation: '現品管理活动中，制备准备（製作手配）是执行生产计划的活动。核查实际物品与账簿差异的活动是盘点（棚卸），而非制备准备。イ的描述混淆了两者。正确答案：イ.' },
  { id: 15, section: 'bunpou', question: '問題 15．設備管理の機能に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'イ. Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'ウ. Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'エ. Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'], correctIndex: 3, explanation: '设备管理功能包括：建设进度管理→设备预算管理；设备设计→设备预算编制；维护计划→维护预算编制。而作业标准制定（作業標準設定）主要用于质量管理和作业指导，与维护预算编制无直接关系。正确答案：エ.' },
  { id: 16, section: 'bunpou', question: '問題 16．設備保全の目的に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'イ. Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'ウ. Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'エ. Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'], correctIndex: 0, explanation: '设备维护的目的包括：确保安全、保证产品质量、节能降耗。员工福祉（福利厚生）属于人力资源管理范畴，不是设备维护的直接目的。正确答案：ア.' },
  { id: 17, section: 'bunpou', question: '問題 17．日常保全に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'イ. Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'ウ. Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'エ. Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'], correctIndex: 3, explanation: '日常保全中，详细检查和设备修理原则上应由操作该机器的操作员进行。当发现设备异常时，应按规程向维修部门报告这也是正确的。因此，最不适当的表述需要仔细辨别。正确答案需参照原文。' },
  { id: 18, section: 'bunpou', question: '問題 18．生産設備の劣化によって生じる損失に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Biaya transportasi akan meningkat.', 'イ. Output produksi akan menurun.', 'ウ. Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'エ. Kualitas produk akan menurun.'], correctIndex: 0, explanation: '生产设备劣化不会直接导致运输费用（物流費）增加。运输费用与物流活动相关，与设备状态无直接关系。而设备劣化会导致：产量下降、原材料消耗率恶化、产品质量下降。正确答案：ア.' },
  { id: 19, section: 'bunpou', question: '問題 19．設備保全における重点設備の選定対象となる設備として最も不適切なものは、次のうちどれか。', options: ['ア. Peralatan yang sedang berada dalam masa kerusakan akibat keausan.', 'イ. Peralatan yang digunakan untuk memproduksi produk penting.', 'ウ. Peralatan yang tidak memiliki kapasitas cadangan produksi.', 'エ. Peralatan yang, jika rusak, akan menyebabkan peningkatan besar pada biaya produksi.'], correctIndex: 0, explanation: '已进入磨损故障期（摩耗故障期間）的设备意味着接近使用寿命末期。此时应进行更换或大修，而非作为维护重点。维护对此类设备效果低且不经济。正确答案：ア.' },
  { id: 20, section: 'bunpou', question: '問題 20．資材管理における＜分類＞と＜対象資材＞との組合せとして最も適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 常備材料・非常備材料 (管理面)', '[B] 直接材料・間接材料 (使用目的)', '[C] 有材・無材 (形状)', '[D] 原材料・完成品 (状態)'], correctIndex: 1, explanation: '资材管理的分类：管理面分类→常备材料/非常备材料；使用目的分类→直接材料/间接材料；形态分类→有材/无材；状态分类→原材料/在制品/完成品。正确答案需对照原文表格。' },
  { id: 21, section: 'bunpou', question: '問題 21．在庫管理に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'イ. Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'ウ. Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'エ. Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'], correctIndex: 3, explanation: '定期订货法（定期発注法）的公式是：订货量=最高库存-现有库存+订货间隔期间的平均需求量。正确答案：エ（定量订货方式需要监控库存水平，必要时调整安全库存和订货点）。' },
  { id: 22, section: 'bunpou', question: '問題 22．棚卸に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Pemeriksaan persediaan berkala (定期棚卸) dilakukan terutama untuk tujuan laporan keuangan', 'イ. Pada barang fisik, sebaiknya ditempelkan label rak (棚札), label barang (現品札), dan kartu inventaris (棚卸カード)', 'ウ. Pemeriksaan persediaan terus-menerus (常時棚卸) dilakukan dengan menghentikan seluruh aktivitas gudang', 'エ. Saat melakukan pemeriksaan persediaan, perlu menstandarkan prosedur kerja dan tata cara administrasi untuk menjamin akurasi'], correctIndex: 2, explanation: '定期盘点（定期棚卸）是为了年度或季度财务报表而进行的，需要停止仓库全部作业。而经常盘点（常時棚卸）是在日常工作中随时进行盘点，不需要停止全部活动。正确答案：ウ.' },
  { id: 23, section: 'bunpou', question: '問題 23．物流コストにおける機能別分類に関する費用項目として最も不適切なものは、次のうちどれか。', options: ['ア. Biaya transportasi（ゆそうひ）', 'イ. Biaya pengemasan（ほうそうひ）', 'ウ. Biaya pengolahan distribusi（りゅうつうかこうひ）', 'エ. Biaya transportasi penjualan（うりあげうんちん）'], correctIndex: 3, explanation: '物流成本的功能分类包括：运输费、保管费、包装费、流通加工费、装卸费、物流信息管理费。销售运输费（売上げ运费）属于销售费用，不属于物流成本的功能分类。正确答案：エ.' },
  { id: 24, section: 'bunpou', question: '問題 24．倉庫内のロケーション管理に関する記述として最も適切なものは、次のうちどれか。', options: ['ア. Dalam manajemen lokasi tetap (固定ロケーション), barang disimpan secara berurutan di tempat kosong yang tersedia.', 'イ. Dalam manajemen lokasi fleksibel (フリーロケーション), karena tidak ada hubungan tetap antara barang dan lokasi, ruang penyimpanan tidak dapat digunakan secara efisien.', 'ウ. Persediaan yang ditempatkan untuk meningkatkan efisiensi kerja di area pengambilan barang disebut persediaan tipe aktif (アクティブ型).', 'エ. Ketika terdapat persediaan tipe aktif dan tipe cadangan, manajemen lokasi tidak perlu membedakan penempatannya.'], correctIndex: 2, explanation: '主动型库存（アクティブ型在庫）是放置在拣货区域的库存，用于提高拣货工作效率。正确答案：ウ.' },
  { id: 25, section: 'bunpou', question: '問題 25．包装に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Klasifikasi pengemasan berdasarkan bentuk terdiri dari tiga jenis: pengemasan individu (個装), pengemasan dalam (内装), dan pengemasan luar (外装).', 'イ. Pengemasan dalam adalah pengemasan yang berada di dalam kemasan luar barang.', 'ウ. Klasifikasi pengemasan berdasarkan tujuan terdiri dari dua jenis: pengemasan industri (工業包装) dan pengemasan komersial (商業包装).', 'エ. Pengemasan untuk pengiriman barang merupakan pengemasan komersial yang bertujuan untuk penjualan.'], correctIndex: 3, explanation: '按目的分类，包装分为工业包装和商业包装。工业包装用于运输和保护产品，商业包装用于销售。发货运送用的包装属于工业包装，而非商业包装。正确答案：エ.' },
  { id: 26, section: 'bunpou', question: '問題 26．品質と品質特性に関する記述として最も不適切なものは、次のうちどれか。', options: ['ア. Karakteristik kualitas sebaiknya dinyatakan secara kualitatif sebanyak mungkin.', 'イ. 真の特性(adalah karakteristik yang diinginkan pelanggan), 代用特性(adalah karakteristik pengganti jika yang真の特性 tidak dapat diukur langsung).', 'ウ. Kualitas harus dijaga sepanjang siklus hidup produk.', 'エ. Keamanan adalah salah satu karakteristik kualitas.'], correctIndex: 0, explanation: '品质特性应尽可能定量（定量化）表示，而非仅定性表示。定性表示不符合品质管理原则。真正的特性是顾客想要的品质特性，代用特性是在无法直接测量真正特性时的替代特性。正确答案：ア.' },
  { id: 27, section: 'bunpou', question: '問題 27．品質改善に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[①] データには常に…がある (バラツキ/カタヨリ)', '[②] 標準偏差=4.0の分散', '[③] 分散=9.0の標準偏差', '[④] より安定した工程は？'], correctIndex: 3, explanation: '①数据总是存在偏差（バラツキ）；②标准偏差4.0→方差16.0；③方差9.0→标准偏差3.0；④两个工程均值相同(50.0)，但A的标准偏差=4.0，B的标准偏差=3.0，B更稳定。正确答案需组合①②③④对应选项。' },
  { id: 28, section: 'bunpou', question: '問題 28．検査の考え方に関する記述として最も不適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 全数検査は購入検査の基本である', '[I] 抜取検査は経済価値が低く、多少の不良混入が許される場合に使用', '[U] 生産者危険は実際の合格ロットを不合格と判定するリスク'], correctIndex: 0, explanation: '全数检查并非采购检查的基本原则。采购检查应根据物品的重要性和成本选择全数检查或抽样检查。对于外部购入物品进行全面检查不是基本原则。正确答案：A.' },
  { id: 29, section: 'bunpou', question: '問題 29．品質保証に関する記述として最も適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] ISO9001とJIS Q 9001は同等の規格である', '[I] PL法では過失がなくても損害賠償を請求できる（無過失責任）', '[U] トレーサビリティは問題発生時に追跡・回収・修理できること'], correctIndex: 1, explanation: 'ISO 9001是国际标准，日本发布了同等版本JIS Q 9001。根据PL法（制造物责任法），消费者无需证明过失即可要求损害赔偿（无过失责任）。正确答案：I.' },
  { id: 30, section: 'bunpou', question: '問題 30．コストコントロールの内容に関する記述として最も適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI -lihat explanation]', '[A] コストコントロールは目標原価を引き下げる活動である', '[I] 原価低減は標準原価を引き下げる活動である', '[U] コストコントロールは実際原価を標準原価に一致させる活動である'], correctIndex: 2, explanation: '成本控制（コストコントロール）是将实际成本降至标准成本的活动。成本降低（原价低減）是在设计阶段降低目标成本的活动，两者概念不同。正确答案：U.' },
  { id: 31, section: 'bunpou', question: '問題 31．原価に関する記述として最も不適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 成行原価は改善・最適化を織り込まないコストである', '[I] 埋没原価は既に発生し取り戻せない費用で、将来の意思決定に影響を与えてはならない', '[U] 機会費用は代替案を選択して他の代替案を放棄することで失われる最大利益である'], correctIndex: 1, explanation: '机会费用（機会費用）是指选择某个替代方案而放弃的其他替代方案中可能获得的最大利益。而埋没原价的定义是已发生且无法收回的费用。选项I描述的是机会费用的定义，而非埋没原价的定义。正确答案：I.' },
  { id: 32, section: 'bunpou', question: '問題 32．製造直接費及び製造間接費に関する記述として最も不適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 直接費・間接費は操業度による分類である', '[I] 直課は直接費を製品に集計すること', '[U] 配賦は間接費を一定の基準で製品に分配すること'], correctIndex: 0, explanation: '制造直接费和制造间接费是根据与产品的关系分类的，而非根据作业度分类。按作业度分类的是变动费和固定费。直课是将直接费用直接计入产品，配赋是将间接费用按一定标准分配到产品。正确答案：A.' },
  { id: 33, section: 'bunpou', question: '問題 33．原価低減に関する記述として最も適切なものは、次のうちどれか。', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 製造段階で原价低減の効果は約70～80%である', '[I] 原価企画は生産前に目標原価を設定し、製品設計に反映させる', '[U] IEは製造段階での原价改善に直接貢献する'], correctIndex: 1, explanation: '原价降低效果约70-80%在设计阶段（原价策划阶段）就已决定，而非制造阶段。IE在制造阶段对原价改善有直接贡献。正确答案：I.' },
  { id: 34, section: 'bunpou', question: '問題 34．日常的に 발생하는納期遅れに対処するための調査方法として最も不適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 生産能力と仕事量のバランス調査', '[I] 日程管理の実施状況調査', '[U] 特急品・計画外作業の安易な投入調査', '[E] 全工程の在庫増加スペース確保調査'], correctIndex: 3, explanation: '在所有工序增加库存并不是解决交货延迟的根本方法，反而会造成空间和成本的浪费。需要的是供需平衡的改善。正确答案：E.' },
  { id: 35, section: 'bunpou', question: '問題 35．資材部門の外注品納期遅延対策として最も不適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 納入業者との定例ミーティングとスケジュール管理', '[I] 納入実績グラフで遅延パターン分析', '[U] 全量を一回で納入させる', '[E] 複数年にわたる長期契約の締結'], correctIndex: 2, explanation: '要求供应商一次性全部交付大批量货物会导致库存积压和资金占用问题，不是有效的交货延迟对策。正确答案：U.' },
  { id: 36, section: 'bunpou', question: '問題 36．目で見る管理が適切に行われている職場の状態として最も適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 流動数曲線で工程間の物の流れと滞留を可視化している', '[I] 作業員が自分の 자리를離れて部品を取りに行っている', '[U] 在庫不足が発生してから補充している', '[E] 標準作業書が作成されていない'], correctIndex: 0, explanation: '流动数曲线（流動数曲線）可以可视化显示工序间的物料流动和停滞情况，便于发现问题。是目视管理的有效工具。正确答案：A.' },
  { id: 37, section: 'bunpou', question: '問題 37．安全衛生活動の推進に関する記述として最も不適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 労働安全衛生法に基づき、事業者は安全な職場環境を確保する義務がある', '[I] 労働災害は不安全行為のみで発生する', '[U] ヒヤリ・ハット活動を積極的に活用する', '[E] 機械や设备的本質安全化を進める'], correctIndex: 1, explanation: '劳动灾害是不安全行为和不安全状态的组合造成的，仅强调人为因素而忽视设备、环境、制度等系统因素是不全面的。正确答案：I.' },
  { id: 38, section: 'bunpou', question: '問題 38．特別教育を受けなくても従事できる業務は？', options: ['[SOAL KOMBINASI - lihat explanation]', '[A] 最大荷重1トン未満のフォークリフト運転', '[I] つり上げ1トン以上のクレーン玉掛け', '[U] 小型ボイラーの取扱', '[E] 特定化学物質取扱作業'], correctIndex: 0, explanation: '根据安卫则，最大荷载1吨以下的叉车和1吨以下的起重机挂钩作业只需特殊教育即可从事，不需要执照。正确答案：A.' },
  { id: 39, section: 'bunpou', question: '問題 39．四大公害病と原因物質の組合せとして最も適切なものは？', options: ['[SOAL KOMBINASI - lihat explanation]', '[水俣病] イタイイタイ病:カドミウム', '[イタイイタイ病] 新潟水俣病:水銀', '[四日市喘息] 四日市喘息:硫黄化合物(SOx)', '[水俣病] 水俣病:有機水銀'], correctIndex: 3, explanation: '四大公害：水俣病（有机水银/甲基汞）、イタイイタイ病（镉/Cd）、新潟水俣病（有机水银）、四日市哮喘（硫氧化物/SOx）。エ的四日市哮喘对应硫化物，是正确答案。' },
  ];

// CBT Questions for SSW(ii) Industrial Product Manufacturing
const SSW_QUESTIONS: Question[] = [
  { id: 1, section: 'moji', question: 'SSW(ii) の正式名称は？', options: ['Standard Software Workshop ii', 'Specialized Sheet Worker ii', 'Steel Structure Welding ii', 'Standard Specification Writing ii'], correctIndex: 2, explanation: 'SSW(ii) = Steel Structure Welding (ii級) = Kompetensi las struktur baja tingkat ii' },
  { id: 2, section: 'moji', question: '「熔接」の読み方は？', options: ['ようせつ', 'ゆうせつ', 'ようせつ', 'ゆせつ'], correctIndex: 0, explanation: '熔接（ようせつ）= welding. 「熔」= mencairkan, 「接」= menyambung' },
  { id: 3, section: 'moji', question: '「構造用鋼材」の読み方は？', options: ['こうぞうようこうざい', 'こうちくようはがね', 'けんぞうようはまだ', 'こうそうよう钢材'], correctIndex: 0, explanation: '構造用鋼材 = こうぞうようこうざい = structural steel material' },
  { id: 4, section: 'moji', question: '「板」の読み方は？', options: ['いた', 'ことは', 'かん', 'ぶつ'], correctIndex: 0, explanation: '板 = いた = plate / sheet (baja plat) digunakan dalam manufacturing' },
  { id: 5, section: 'moji', question: '「開先」の読み方は？', options: ['かいせん', 'ひらきさき', 'かいさき', ' начинать'], correctIndex: 0, explanation: '開先（かいせん）= grooving (groove untuk las). 開先加工 = groove machining' },
  { id: 6, section: 'moji', question: '「不下」の意味は？', options: ['降らない', '现场不使用', '现场 Super', '不下（ふげ）= tidak turun/material'], correctIndex: 3, explanation: '不下 = ふげ = material yang tidak diturunkan/digunakan (synonym: 不使用材)' },
  { id: 7, section: 'moji', question: '「仮付け」の読み方は？', options: ['かりつけ', 'かみつけ', 'かりどこ', 'たとえつけ'], correctIndex: 0, explanation: '仮付け（かりつけ）= tack welding = pengelasan sementara untuk holding' },
  { id: 8, section: 'moji', question: '「通り止め」の読み方は？', options: ['とおりどめ', 'かようどめ', 'つうurd', 'とめない'], correctIndex: 0, explanation: '通り止め = とおりどめ = welding stopper / stop welding at specific point' },
  // Bunpou
  { id: 9, section: 'bunpou', question: '「 steel plate ___ 切断 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を / を', 'が / に / を / に', 'の / で / を / に', 'を / で / を / に'], correctIndex: 3, explanation: '钢板を切断で加工を行う = memotong dan memproses plat baja.「を」object,「で」 alat/purpose,「を」object,「に」direction' },
  { id: 10, section: 'bunpou', question: '「開先 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を', 'に / で / に', 'の / の / を', 'を / で / を'], correctIndex: 3, explanation: '開先を加工を行う = melakukan groove machining.「を」(objek),「で」= menggunakan,「を」(objek)' },
  { id: 11, section: 'bunpou', question: '「この钢材 ___ 使用 ___ 済み ___ です」\n正しいのは？', options: ['は / が / を', 'は / に / だ', 'が / は / だ', 'は / だ / に'], correctIndex: 1, explanation: 'この钢材は使用済みだ = Material ini sudah dipakai. 使用済み = しようずみ = already used' },
  { id: 12, section: 'bunpou', question: '「仮付け ___ 行い ___ ます ___ 」\n正しい敬語は？', options: ['を / を / ます', 'に / を / します', 'を / を / します', 'は / が / です'], correctIndex: 2, explanation: '仮付けを行う → 仮付けを为您做します (keigo). いたします = humble form of します' },
  { id: 13, section: 'bunpou', question: '「不通」の反対は？', options: ['不通（ふつう）', '痛通（つうつう）', '通了（とおり）', '通線（つうせん）'], correctIndex: 2, explanation: '不通（ふつう）= blocked/not passable. 通了（とおり）= can pass through / 完了した' },
  { id: 14, section: 'bunpou', question: '「検査 ___ 合格 ___ しました」\n正しい助詞は？', options: ['は / が', 'が / に', 'を / に', 'の / を'], correctIndex: 1, explanation: '検査が合格しました = inspection passed.「が」subject,「に」direction (result)' },
  // Dokkai
  { id: 15, section: 'dokkai', question: '「 SSW(ii) 試験では、構造用鋼材に対する熔接技術と安全管理が出題範囲です。実技試験では、板熔接と-tube熔接が表示されます。」\n\n質問：実技試験の内容は？', options: [' только 学科試験', '板熔接と-tube熔接', '安全管理の面接', '材料の切断'], correctIndex: 1, explanation: '板熔接 = plat welding. tube熔接 = pipa welding. 实技 = じつぎ = practical test' },
  { id: 16, section: 'dokkai', question: '「不开 ERP 系统，你们就无法进行工程管理。」\n\n質問：この文の意図は？', options: ['ERP系统很难使用', '不开ERP就无法管理工程', '他们没有电脑', '需要先买机器'], correctIndex: 1, explanation: '不开 = tidak membuka. 无法 = tidak bisa. 工程管理 = 工程管理 (engineering management). 隐含：必须使用系统才能管理' },
  { id: 17, section: 'dokkai', question: '「熔接施工 hier werden 检查后，后续加工に進みます。」\n\n質問：熔接施工後の工程は？', options: ['検査してから次工程', 'そのまま終了', 'やり直し', '在庫保管'], correctIndex: 0, explanation: '検査して = after inspection. 后续加工 = こうずいかこう = subsequent processing. 進みます = proceeds to' },
  { id: 18, section: 'dokkai', question: '「 nosso factory 采用了严格的品质管理系统，所有钢材均经过来料檢驗后才入庫。」\n\n質問：品質管理在哪裡做？', options: ['入库前（来料检验）', '出厂前', '生产中', '随机抽查'], correctIndex: 0, explanation: '来料检验 = らいりけんせき = incoming material inspection. 入庫前 = sebelum storage. 严格的 = ketat' },
  { id: 19, section: 'dokkai', question: '「安全第一が 우리 工場の 基本方針です。作業员は защитный снаряжение 를 필수로 착용해야 합니다。」\n\n質問：作業員に必要なことは？', options: ['英語能力', ' защитный снаряжение 필수 착용', '資格所持', '中国語堪能'], correctIndex: 1, explanation: '保護具 = ほごぐ = protective equipment. 着用 = ちゃくよう = to wear. 必须 = ひつぜん = wajib/mandatory' },
  { id: 20, section: 'dokkai', question: '「この钢材は 不通 のため、使用できません。」\n\n質問：钢材的问题是什么？', options: ['型号不对', '已不通（使用済み）', '太贵了', '刚到货'], correctIndex: 1, explanation: '不通 = ふつう = blocked / 不使用. 已经完成焊接且检查不合格的材料不能再次使用' },
];

// Demo questions - real N5 style
const DEMO_QUESTIONS: Question[] = [
  // Moji (Kanji/Vocabulary) - Questions 1-10
  { id: 1, section: 'moji', question: 'あの人は 先生です。\n「あの」の意味は？', options: ['this', 'that', 'which', 'who'], correctIndex: 1, explanation: '「あの」は離れている人或いものを指す。= That (over there)' },
  { id: 2, section: 'moji', question: '「あした」の漢字は？', options: ['今日', '昨日', '明日', '毎日'], correctIndex: 2, explanation: '「明日」= tomorrow (あした)' },
  { id: 3, section: 'moji', question: '「いぬ」の漢字は？', options: ['猫', '鳥', '犬', '魚'], correctIndex: 2, explanation: '「犬」= dog (いぬ)' },
  { id: 4, section: 'moji', question: '「みず」の漢字は？', options: ['火', '水', '木', '土'], correctIndex: 1, explanation: '「水」= water (みず)' },
  { id: 5, section: 'moji', question: '「大きい」の反対は？', options: ['長い', '短い', '小さい', '高い'], correctIndex: 2, explanation: '「小さい」= small (ちいさい) / 「大きい」= big (おおきい)' },
  { id: 6, section: 'moji', question: '「さんぽ」の漢字は？', options: ['散歩', '参加', '産業', '残念'], correctIndex: 0, explanation: '「散歩」= walk/stroll (さんぽする)' },
  { id: 7, section: 'moji', question: '「あける」の漢字は？', options: ['開ける', '閉める', '見る', '買う'], correctIndex: 0, explanation: '「開ける」= to open (あける)' },
  { id: 8, section: 'moji', question: 'Which kanji means "mountain"?', options: ['川', '山', '田', '火'], correctIndex: 1, explanation: '「山」= mountain (やま)' },
  { id: 9, section: 'moji', question: '「わかる」の意味は？', options: ['to ask', 'to know', 'to understand', 'to think'], correctIndex: 2, explanation: '「分かるる」= to understand (わかります)' },
  { id: 10, section: 'moji', question: '「ともだち」の漢字は？', options: ['同士', '友達', '社会', '家族'], correctIndex: 1, explanation: '「友達」= friend (ともだち)' },
  // Bunpou (Grammar) - Questions 11-20
  { id: 11, section: 'bunpou', question: '「わたし ___ がくせい 입니다」\n正しい助詞は？', options: ['の', 'は', 'を', 'に'], correctIndex: 1, explanation: '「は」は主題を示す助詞 (topic marker) = I am a student.' },
  { id: 12, section: 'bunpou', question: '「ねこ ___ みず ___ のみます」', options: ['が / を', 'を / が', 'は / を', 'に / が'], correctIndex: 1, explanation: '「を」は直接目的語、「が」は主語を示す。= The cat drinks water.' },
  { id: 13, section: 'bunpou', question: '「これから ___ いきます」\n正しいのは？', options: ['に', 'へ', 'で', 'を'], correctIndex: 1, explanation: '「へ」は方向を示す。= I will go from now on.' },
  { id: 14, section: 'bunpou', question: 'Which sentence is correct?', options: ['私 は 走る.', '私 は 走ります.', '私 走る.', 'は私 走ります.'], correctIndex: 1, explanation: '「ます」は動詞の丁寧形。= I run (polite).' },
  { id: 15, section: 'bunpou', question: '「 tome ___ 」\nWhat comes after 止め?', options: ['ます', 'って', 'て', 'た'], correctIndex: 2, explanation: '「止めて」(te-form) = stop (command/polite request)' },
  { id: 16, section: 'bunpou', question: '「 ___ 图书馆 ___ 本 ___ 読みます」', options: ['で / を', 'に / が', 'へ / を', 'で / が'], correctIndex: 0, explanation: '「で」は場所、「を」は目的語。= I read books at the library.' },
  { id: 17, section: 'bunpou', question: 'Which is the te-form of 食べる?', options: ['食べます', '食べて', '食べた', '食べって'], correctIndex: 1, explanation: '「て」form of 食べる → 食べて (tabete)' },
  { id: 18, section: 'bunpou', question: '「 ___ 、雨です ___ 」\nComplete with contrast', options: ['しかし / です', 'でも / だ', 'けれど / です', 'それでは /'], correctIndex: 2, explanation: '「けれど」= but/however (contrasting sentence)' },
  { id: 19, section: 'bunpou', question: '「 university ___ 行きます ___ 」\n正しい助詞は？', options: ['に / が', 'へ / を', 'に / を', 'で / に'], correctIndex: 2, explanation: '「に」= destination, 「を」= object (go to university).' },
  { id: 20, section: 'bunpou', question: 'Which is the past tense of 飲む?', options: ['飲んでいます', '飲みます', '飲みました', '飲むでしょう'], correctIndex: 2, explanation: '「ました」= past tense polite. 飲みました = drank.' },
  // Dokkai (Reading Comprehension) - Questions 21-25
  { id: 21, section: 'dokkai', question: '私の名前は田中です。京都に住んでいます。学生です。\n\n質問：田中さんの職業は？', options: ['先生', '学生', '医者', '社員'], correctIndex: 1, explanation: '「学生です」= I am a student.' },
  { id: 22, section: 'dokkai', question: '今日は晴です。午前中は図書館で勉強します。午後は友達と映画を見ます。\n\n質問：午前に何をする？', options: ['映画を見る', '勉強する', '買い物をする', '寝る'], correctIndex: 1, explanation: '「午前中は図書館で勉強します」= Study at library in the morning.' },
  { id: 23, section: 'dokkai', question: '小林さんは毎朝パンを食べます。牛奶喝了咖啡。\n\n質問：小林さんは何を食べますか？', options: ['お寿司', 'パン', 'カレー', 'ラーメン'], correctIndex: 1, explanation: '「パンを食べます」= eats bread' },
  { id: 24, section: 'dokkai', question: '（A:）すみません、駅はどこですか？\n（B:）あの银行的左です。\n\n質問：駅はどこ？', options: ['右', '左', '前', '後ろ'], correctIndex: 1, explanation: '「左です」= It is on the left.' },
  { id: 25, section: 'dokkai', question: '私は日本の音楽が好きです。周末常常听日本歌曲。\n\n質問：話者は何が好き？', options: ['映画', '食べ物', '日本の音楽', '読書'], correctIndex: 2, explanation: '「日本の音楽が好きです」= I like Japanese music.' },
];

const SECTION_INFO = {
  moji: { name: '文字 (Moji)', description: 'Kanji & Vocabulary', icon: '漢', duration: '10 questions' },
  bunpou: { name: '文法 (Bunpou)', description: 'Grammar', icon: '📖', duration: '10 questions' },
  dokkai: { name: '読解 (Dokkai)', description: 'Reading Comprehension', icon: '📚', duration: '5 questions' },
  seisan: { name: '生産管理', description: 'Production Management', icon: '🏭', duration: '10 questions' },
  hinshitsu: { name: '品質管理', description: 'Quality Management', icon: '✅', duration: '10 questions' },
  genka: { name: '原価管理', description: 'Cost Management', icon: '💴', duration: '10 questions' },
  anzen: { name: '安全衛生・物流', description: 'Safety & Logistics', icon: '⚠️', duration: '10 questions' },
};

export default function SimulasiPage() {
  return (
    <Suspense fallback={<SimulasiLoading />}>
      <SimulasiContent />
    </Suspense>
  );
}

function SimulasiLoading() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );
}

function SimulasiContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get('type') || 'n5'; // 'n5' | 'karier' | 'ssw'

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const timerDuration = examType === 'karier' ? 90 * 60 : examType === 'ssw' ? 90 * 60 : 30 * 60;
  const [timeLeft, setTimeLeft] = useState(timerDuration);

  const filteredQuestions = useMemo(() => {
    if (examType === 'karier') return KARIER_QUESTIONS;
    if (examType === 'ssw') return SSW_QUESTIONS;
    return DEMO_QUESTIONS;
  }, [examType]);

  const currentQ = filteredQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished]);

  const handleAnswer = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setExamFinished(true);
    }
  };

  const startExam = () => {
    setExamStarted(true);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
    const startTimerDuration = examType === 'karier' ? 90 * 60 : examType === 'ssw' ? 90 * 60 : 30 * 60;
    setTimeLeft(startTimerDuration);
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
  };

  // Calculate scores
  const scores = useMemo(() => {
    const total = filteredQuestions.length;
    const sectionKeys = examType === 'karier'
      ? ['seisan', 'hinshitsu', 'genka', 'anzen'] as const
      : ['moji', 'bunpou', 'dokkai'] as const;

    let correctCount: Record<string, number> = {};
    let totalSection: Record<string, number> = {};
    sectionKeys.forEach(k => { correctCount[k] = 0; totalSection[k] = 0; });

    filteredQuestions.forEach(q => {
      totalSection[q.section] = (totalSection[q.section] || 0) + 1;
      if (answers[q.id] === q.correctIndex) {
        correctCount[q.section] = (correctCount[q.section] || 0) + 1;
      }
    });

    const totalCorrect = Object.values(correctCount).reduce((a, b) => a + b, 0);
    const passed = total > 0 && (totalCorrect / total) >= 0.8;

    return {
      total,
      correct: totalCorrect,
      sectionScores: sectionKeys.map(k => ({
        key: k,
        correct: correctCount[k] || 0,
        total: totalSection[k] || 0,
        ...SECTION_INFO[k],
      })),
      percentage: total > 0 ? Math.round((totalCorrect / total) * 100) : 0,
      passed,
    };
  }, [filteredQuestions, answers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">
                {examType === 'karier' ? '/ CBT Karier Bisnis' : examType === 'ssw' ? '/ SSW(ii) Industrial' : '/ JLPT N5 Simulation'}
              </span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!examStarted && !examFinished && (
          <>
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                {examType === 'karier' ? '💼 CBT Karier Bisnis Manufacturing' : examType === 'ssw' ? '📋 CBT SSW(ii) Industrial Product' : '📝 JLPT N5 Simulation'}
              </h1>
              <p className="text-[#636E72]">
                {examType === 'karier' ? 'Simulasi CBT Karier Bisnis Manufaktur — 50 soal, 90 menit' : examType === 'ssw' ? 'Simulasi SSW(ii) Steel Structure Welding — 20 soal, 90 menit' : 'Simulasi ujian N5 dengan 25 soal'}
              </p>
            </motion.div>

            {/* Section Cards - N5 only */}
            {examType === 'n5' && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(SECTION_INFO).map(([key, info]) => (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => startExam()}
                      className="p-6 bg-[#1A1A2E] rounded-xl border border-[#2D2D44] hover:border-[#6C5CE7] transition-all text-center group"
                    >
                      <div className="text-4xl mb-3">{info.icon}</div>
                      <h3 className="font-bold text-white mb-1">{info.name}</h3>
                      <p className="text-sm text-[#636E72] mb-2">{info.description}</p>
                      <p className="text-xs text-[#6C5CE7]">{info.duration}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Full Test */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <button
                    onClick={() => startExam()}
                    className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                  >
                    🎯 Start Full N5 Test (25 soal)
                  </button>
                  <p className="text-xs text-[#636E72] mt-3">Waktu: 30 menit • Skor kelulusan: 80%</p>
                </motion.div>
              </>
            )}

            {/* Karier CBT */}
            {examType === 'karier' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <button
                  onClick={() => startExam()}
                  className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                >
                  💼 Start CBT Karier Bisnis (50 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}

            {/* SSW CBT */}
            {examType === 'ssw' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <button
                  onClick={() => startExam()}
                  className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                >
                  📋 Start CBT SSW(ii) (20 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}
          </>
        )}

        {/* In Exam */}
        <AnimatePresence>
          {examStarted && !examFinished && currentQ && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress Bar */}
              <div className="mb-6 p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-bold">Q{currentQuestion + 1}/{filteredQuestions.length}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQ.section === 'moji' ? 'bg-[#E17055]/20 text-[#E17055]' :
                      currentQ.section === 'bunpou' ? 'bg-[#6C5CE7]/20 text-[#6C5CE7]' :
                      currentQ.section === 'dokkai' ? 'bg-[#00B894]/20 text-[#00B894]' :
                      currentQ.section === 'seisan' ? 'bg-[#FDCB6E]/20 text-[#FDCB6E]' :
                      currentQ.section === 'hinshitsu' ? 'bg-[#74B9FF]/20 text-[#74B9FF]' :
                      currentQ.section === 'genka' ? 'bg-[#A29BFE]/20 text-[#A29BFE]' :
                      'bg-[#55EFC4]/20 text-[#55EFC4]'
                    }`}>
                      {SECTION_INFO[currentQ.section].name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#636E72]">Answered: {Object.keys(answers).length}/{filteredQuestions.length}</span>
                    <div className={`px-3 py-1 rounded-full font-bold ${timeLeft <= 60 ? 'bg-red-500/20 text-red-400' : 'bg-[#6C5CE7]/20 text-[#6C5CE7]'}`}>
                      ⏱ {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-[#2D2D44] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894] transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
                <p className="text-lg text-white whitespace-pre-line mb-6">{currentQ.question}</p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, i) => {
                    const isSelected = answers[currentQ.id] === i;
                    const isCorrect = i === currentQ.correctIndex;
                    const showResult = showExplanation;

                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => !showExplanation && handleAnswer(i)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                              : isSelected
                                ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                : 'bg-[#2D2D44] text-[#636E72]'
                            : isSelected
                              ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                              : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] hover:border border-[#3D3D54]'
                        }`}
                      >
                        <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {option}
                        {showResult && isCorrect && <span className="ml-2">✓</span>}
                        {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl"
                  >
                    <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 Explanation</h4>
                    <p className="text-[#B2BEC3]">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowExplanation(false);
                    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
                  }}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-[#2D2D44] rounded-xl font-medium text-[#B2BEC3] hover:bg-[#3D3D54] transition-colors disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={!showExplanation}
                  className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {currentQuestion < filteredQuestions.length - 1 ? 'Next →' : 'Finish'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {examFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Result Card */}
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-8 mb-6">
                <div className="text-6xl mb-4">{scores.passed ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {scores.passed ? 'LULUS! Congratulations!' : 'Belum Lulus'}
                </h2>
                <p className="text-5xl font-bold text-[#6C5CE7] mb-4">{scores.percentage}%</p>
                <p className="text-[#636E72] mb-6">
                  {scores.correct}/{scores.total} questions correct
                </p>

                {/* Section Breakdown */}
                <div className={`grid gap-4 mb-6 ${examType === 'karier' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {scores.sectionScores.map(s => (
                    <div key={s.key} className="p-3 bg-[#2D2D44] rounded-xl">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-lg font-bold text-white">
                        {s.correct}/{s.total}
                      </div>
                      <div className="text-xs text-[#636E72]">{s.name}</div>
                    </div>
                  ))}
                </div>

                {/* Pass/Fail indicator */}
                <div className={`p-4 rounded-xl ${scores.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={scores.passed ? 'text-green-400' : 'text-red-400'}>
                    {scores.passed
                      ? '✨ Skor kamu di atas 80%! Kamu siap untuk CBT!'
                      : '📖 Kamu perlu skor 80% untuk lulus. Terus belajar!'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetExam}
                  className="px-6 py-3 bg-[#2D2D44] rounded-xl font-medium text-[#B2BEC3] hover:bg-[#3D3D54] transition-colors"
                >
                  ← Back to Menu
                </button>
                <button
                  onClick={() => startExam()}
                  className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                >
                  🔄 Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}