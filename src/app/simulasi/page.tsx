'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// CBT Questions for Karier Bisnis Manufacturing (50 questions, 90 minutes)
// Topics: 生産管理, 作業管理, 工程分析, 稼働分析, 5S, 品質管理, 原価管理, 在庫管理, 安全衛生, 環境法
const KARIER_QUESTIONS: Question[] = [
  // Q1-10: 生産管理 (Production Management)
  { id: 1, section: 'moji', question: '「生産管理」の読み方は？', options: ['せいさんかんり', 'せいぞうかんり', 'せいきんかんり', 'せいさんかんり'], correctIndex: 0, explanation: '生産管理 = せいさんかんり = production management. 製造管理不同的是製造管理.' },
  { id: 2, section: 'moji', question: '「広義の生産管理」に関与しない管理活動は？', options: ['購買管理', '人事管理', '原価管理', '設備管理'], correctIndex: 1, explanation: '人事管理（じんじかんり）は直接的な生産管理活動ではない。生産管理は購買・原価・設備を含むが、人事管理は含まない。' },
  { id: 3, section: 'moji', question: '「作業管理」の実施内容として関連性が低いものは？', options: ['合理的な生産性の高い作業方法の追求', '生産計画の策定と生産統制', '作業方法の標準化と標準時間の設定', '作業手順書の作成と作業指導'], correctIndex: 1, explanation: '生産計画の策定は生産管理の範囲。作業管理は作業方法・手順・標準時間・指導の設定が主要内容。' },
  { id: 4, section: 'moji', question: '「工程分析」の目的として最も適切なものは？', options: ['材料の流れを分析して配置を改善する', '作業者の動きを分析して効率化する', '機械の能力を分析して増強する', 'コストを分析して削減する'], correctIndex: 1, explanation: '工程分析（こうていぶんせき）は作業者工程分析と製品工程分析があり、作業のやり方を改善するのが目的。' },
  { id: 5, section: 'moji', question: '「稼働分析」の主対象は？', options: ['材料・部品・中間製品', '作業者または機械の状態', '生产成本の分析', '品質検査の判定'], correctIndex: 1, explanation: '稼働分析（かどうぶんせき）は作業者または機械の状態（作業中・待機中・休止中・故障中）を観測・分析する。' },
  { id: 6, section: 'moji', question: '「連合作業分析」で使用される図表は？', options: ['フローダイアグラム', 'マンマシンチャート', 'PERT図', 'パレート図'], correctIndex: 1, explanation: 'マンマシンチャート（Man-Machine Chart）は人・機械の動作を時系列で記録し、同期を取って分析する。' },
  { id: 7, section: 'moji', question: '「動作経済の原則」に分類されない項目は？', options: ['身体の使用に関する分類', '工具や設備の設計に関する分類', '材料の取り扱いに関する分類', '作業域に関する分類'], correctIndex: 2, explanation: '動作経済の原則は3分類：身体の使用・工具や設備の設計・作業域。材料の取り扱いは含まない。' },
  { id: 8, section: 'moji', question: '「5S活動」で「整理」に該当しないものは？', options: ['不要品はルールを決めて廃棄する', '守るべきルールを見える化して周知する', '整理・整頓・躾で清潔な職場が実現できる', '部品棚に収納物と管理者の表示をする'], correctIndex: 2, explanation: '5Sは「整理→整頓→清掃→清潔→躾」の順。清潔（せいけつ）は躾（しつけ）の結果であり、「整理・整頓・躾で実現」は手順を飛んでいる。' },
  { id: 9, section: 'moji', question: '「工程管理における緩衝」に関与しない策は？', options: ['全工程の不平衡を是正する', '能力・時間・物の緩衝を取る', '安全在庫を確保する', '予測困難な要因による時間ロスを防止する'], correctIndex: 0, explanation: 'ボトルネック工程があっても全工程に仕掛品在庫を置いても全体の生産能力は上がらない。緩衝は個別の工程間を守るもの。' },
  { id: 10, section: 'moji', question: '「見込生産」の特徴は？', options: ['顧客の注文に応じて生産する', '製品仕様は受注まで不確定である', '生産者側が市場予測して出荷する', '受注変動に対して生産能力を調整する'], correctIndex: 2, explanation: '見込生産（みこみせいさん）は生産者側の需要予測に基づいて製品を出荷する方式。受注生産の反対。' },
  // Q11-20: 品質管理 (Quality Control)
  { id: 11, section: 'bunpou', question: '「品質管理」の目的として正しいものは？', options: ['コストを最小限に抑える', '製品の規格を維持すること', '納期を短縮すること', '自動化を推進すること'], correctIndex: 1, explanation: '品質管理（ひんしつかんり）は製品の品質を规格通り維持・管理すること。QC = Quality Control。' },
  { id: 12, section: 'bunpou', question: '「全数検査」の限界として正しいものは？', options: ['検査コストが最もかかる', '全ての不良品を発見できる', '人間のミスで見落とすことがある', '検査時間が長い'], correctIndex: 2, explanation: '全数検査でも人間のミスや測定器具の精度問題で見落とす可能性がある。100%保証はできない。' },
  { id: 13, section: 'bunpou', question: '「抜取検査」が適用される条件は？', options: ['製品価格が高く不合格混入が許されない', '製品価格が安くてある程度の不適合品混入が許される', '全数検査が法律で義務付けられている', '重要な安全部品'], correctIndex: 1, explanation: '抜取検査（ぬきとりけんさ）は製品価値が低く、多少の不良混入を許容できる場合に適用される。' },
  { id: 14, section: 'bunpou', question: '「生産者危険」の意味は？', options: ['不合格品を合格としてしまう誤り', '合格品を不合格にしてしまう誤り', '検査コストが高くなるリスク', '納期が遅れるリスク'], correctIndex: 1, explanation: '生産者危険（せいさんしゃきけん）は実際の合格ロットを不合格判定ことで生産者に損失を与えるリスク。' },
  { id: 15, section: 'moji', question: '「品質保証活動」の範囲として最も不適切なものは？', options: ['製造部門だけの品質管理', '全社的な品質確保活動', '顧客満足度の向上', '製品の追跡可能性確保'], correctIndex: 0, explanation: '品質保証は製造部門だけでなく全社的な活動。製造部門だけに任せるのは原則に反する。' },
  { id: 16, section: 'moji', question: '「トレーサビリティ」の説明として正しいものは？', options: ['製品の追跡可能性', '製品の価格管理', '製品の在庫管理', '製品の物流管理'], correctIndex: 0, explanation: 'トレーサビリティは製品に問題がある時、その情報を追跡し回収・修理の活動を行うこと。' },
  { id: 17, section: 'moji', question: '「ISO9001」と"JIS"の関係として正しいものは？', options: ['ISO9001の对应JISはない', 'ISO9001に対応ずるJIS Q 9001がある', 'JISはISOより先に制定されている', '両方は同一の規格'], correctIndex: 1, explanation: 'ISO9001は国際規格であり、日本は同等品としてJIS Q 9001制定了。' },
  { id: 18, section: 'moji', question: '「製造物責任法」で過失がない場合の損害賠償は？', options: ['請求できない', '請求できる', '一部のみ請求可能', '裁判所が決める'], correctIndex: 1, explanation: '製造物責任法（せいぞうぶつせきにんほう）では過失がなくても損害賠償請求ができる（無過失責任）。' },
  { id: 19, section: 'moji', question: '「品質特性」の説明として最も適切なものは？', options: ['产品价格', '製品の魅力的なデザイン', '製品の機能・性能に関する事項', '製品の納期'], correctIndex: 2, explanation: '品質特性（ひんしつとくせい）とは製品の機能・性能・耐久性など品質を表す特性。' },
  { id: 20, section: 'moji', question: '「QC工程図」で管理項目が適切でないものは？', options: ['外観検査（チェック項目）', '寸法検査（管理項目）', '機能検査（チェック項目）', 'コスト管理（管理項目）'], correctIndex: 3, explanation: 'QC工程図の管理項目は品質関連項目（外観・寸法・機能など）が中心。コストは直接的管理項目ではない。' },
  // Q21-30: 原価管理・コスト管理
  { id: 21, section: 'bunpou', question: '「コストコントロール」の内容として正しいものは？', options: ['目標原価を引き下げる活動', '標準原価を引き下げる活動', '実際原価を標準原価まで引き下げる活動', '設計段階で原価見積額を目標原価まで引き下げる活動'], correctIndex: 2, explanation: 'コストコントロールは実際原価を標準原価に一致させる活動。目標原価管理とは異なる概念。' },
  { id: 22, section: 'bunpou', question: '「原価低減」の効果が高い段階は？', options: ['製造段階', '設計段階', '検査段階', '包装段階'], correctIndex: 1, explanation: '原価低減の効果は約70-80%が設計段階（源流段階）で決まる。ここが最も効果が高い。' },
  { id: 23, section: 'bunpou', question: '「IE」と原価低減の関係として正しいものは？', options: ['設計段階で直接的役割', '製造段階で直接的役割', '検査段階で直接的役割', '物流段階で直接的役割'], correctIndex: 1, explanation: 'IE（Industrial Engineering）は製造段階での原価改善に直接的に貢献するツール。' },
  { id: 24, section: 'moji', question: '「成行原価」の説明として正しいものは？', options: ['目標となる原価', '現状の技術を基準に見積もった原価', '標準的な操業度での原価', '特定の要素だけを集計した原価'], correctIndex: 1, explanation: '成行原価（なりゆきげんか）は現在の技術でそのまま見積もった原価で、改善・最適化を織り込まない。' },
  { id: 25, section: 'moji', question: '「埋没原価」の説明として正しいものは？', options: ['最も大きい利益', '選択を放弃することで生じると見込まれる受益', '既に支出して取り戻せない費用', '市場竞争优势'], correctIndex: 2, explanation: '埋没原価（まいぼつげんか）は既に発生して取り戻せない費用で、将来の意思決定に影響を与えてはならない。' },
  { id: 26, section: 'moji', question: '「機会費用」の説明として正しいものは？', options: ['埋没原価のこと', '代替案を選択して放弃した最大利益', '標準原価のこと', '直接材料費のこと'], correctIndex: 1, explanation: '機会費用（きかいひよう）はある代替案を選択して他の代替案を放弃することで失われる最大利益。' },
  { id: 27, section: 'moji', question: '「標準原価」の計算要素として正しくないものは？', options: ['標準の操業度', '標準の方法', '標準の能率', '市場の価格'], correctIndex: 3, explanation: '標準原価は操業度・方法・能率・原価率に基づいて算出される。市场价格は計算要素ではない。' },
  { id: 28, section: 'moji', question: '「部分原価」の説明として正しいものは？', options: ['全ての原価要素を集計', '特定の原価要素だけを集計', '標準原価のこと', '実際原価のこと'], correctIndex: 1, explanation: '部分原価（ぶぶんげんか）は計算目的により特定原価要素だけを集計した原価（例：変動費のみ）。' },
  { id: 29, section: 'moji', question: '「製造直接費」と「製造間接費」の分類根拠は？', options: ['操業度による分類', '製品との関係による分類', '機能による分類', '発生場所による分類'], correctIndex: 1, explanation: '直接費・間接費は製品への紐付けの容易さで分類。操業度による分類は変動費・固定費との違い。' },
  { id: 30, section: 'moji', question: '「直課」と「配賦」の説明として正しいものは？', options: ['直課は間接費，配賦は直接費', '直課は直接費，配賦は間接費の分配', '両方とも直接費', '両方とも間接費'], correctIndex: 1, explanation: '直課（ちょっか）は直接費を製品に直接集計。配賦（はいふ）は間接費を一定の基準で製品に分配。' },
  // Q31-40: 在庫管理・物流管理
  { id: 31, section: 'bunpou', question: '「現品管理」の注意点として最も不適切なものは？', options: ['取り扱い・保管中の損傷防止', '生産準備での現物と帳簿の差異確認', '検査数量確認のための非標準容器使用', '原材料・製品の明確な保管場所与方法の制定'], correctIndex: 2, explanation: '現品管理では標準容器・標準包装・保管方法の表示を行い検査効率を上げる。非標準容器的使用は逆効果。' },
  { id: 32, section: 'bunpou', question: '「安全在庫」の目的として正しいものは？', options: ['コスト削減', '納期遅延防止', '品質向上', '自動化推進'], correctIndex: 1, explanation: '安全在庫（あんぜんざいこ）は納入遅延や需要変動に対応するためのバッファ在庫で納期を守る。' },
  { id: 33, section: 'moji', question: '「流動数曲線」の用途は？', options: ['コストの推移を示す', '工程内の物の個数と滞留時間を示す', '作業員の稼働率を示す', '不良品の発生傾向を示す'], correctIndex: 1, explanation: '流動数曲線（りゅうどうすうきょくせん）は工程にある物の個数と滞留時間を視覚的に表示する。' },
  { id: 34, section: 'moji', question: '「棚卸」の目的として正しいものは？', options: ['販売価格的决定', '在庫の数を実際に数えて確認すること', '製品の品質を確認すること', '作業員の数を確かめること'], correctIndex: 1, explanation: '棚卸（たなおろし）は実際の在庫数量を調べて帳簿との差額を確認し、適切な在庫管理を行う。' },
  { id: 35, section: 'moji', question: '「物流コスト」の要素として該当しないものは？', options: ['輸送コスト', '保管コスト', '加工コスト', '包装コスト'], correctIndex: 2, explanation: '物流コストは輸送・保管・包装・荷役・情報コストなど。加工コストは製造コストに含む。' },
  { id: 36, section: 'moji', question: '「倉庫内のロケーション管理」として適切なものは？', options: ['只要存放就行', '決めた場所に決めた数量だけを置く', '有多少放多少', '定期的に場所を移動する'], correctIndex: 1, explanation: 'ロケーション管理は住所・数量・特性を明確にして置くことで効率的な出入庫を可能にする。' },
  { id: 37, section: 'moji', question: '「包装」の目的として最も不適切なものは？', options: ['製品の保護', '輸送効率の向上', '外観の美化だけ', '情報伝達'], correctIndex: 2, explanation: '包装は保護・効率化・情報伝達が目的。外観の美化だけは目的ではない。' },
  { id: 38, section: 'moji', question: '「かんばん方式」の説明として正しいものは？', options: ['一人の作業者が一人の機械を担当する', '後工程が前工程に必要な数量を命令する', '全工程を一括管理する', '検査段階で品質を管理する'], correctIndex: 1, explanation: 'かんばん方式は後工程が前工程に必要な数量を命令する後拉式生産方式。JIT生産の代表的な手法。' },
  { id: 39, section: 'moji', question: '「ABC分析」の用途は？', options: ['生産計画の立案', '在庫の重要度分類', '作業員の配置', '機械の保养計画'], correctIndex: 1, explanation: 'ABC分析は在庫項目を重要度（年間消費額順）に基づいて分類し、重要な項目に最適な管理手法を適用する。' },
  { id: 40, section: 'moji', question: '「定量発注方式」の特徴は？', options: ['発注量が常に同じ', '発注タイミングが常に同じ', '需要予測に基づいて発注', '定期的に発注'], correctIndex: 0, explanation: '定量発注方式是在庫が再注文点を下回ったら固定数量を注文する方法。発注量は常に同じ。' },
  // Q41-50: 安全衛生・環境管理・納期管理
  { id: 41, section: 'bunpou', question: '「安全衛生管理」で「不安全行動の撲滅」だけが効果的か？', options: ['はい、が最も効果的', 'いいえ、複合的な要因の検討が必要', 'はい、人間が最も重要', 'いいえ、機械設備が最も重要'], correctIndex: 1, explanation: '労働災害は不安全行動と不安全状態の組み合わせで発生。人間因子だけでなく機械・環境・制度の複合的分析が必要。' },
  { id: 42, section: 'bunpou', question: '「ヒヤリ・ハット情報」の活用として正しいものは？', options: ['事故が起きてから収集する', '常習的に収集・分析して改善に活用する', '定期的に廃棄する', '上層部の報告에만使用'], correctIndex: 1, explanation: 'ヒヤリ・ハットは実際の事故前に情報を積極的に発掘し、改善活動に繋げることが重要。' },
  { id: 43, section: 'moji', question: '「特別教育」を受ければ従事できる業務は？', options: ['つり上げ1トン以上のクレーン玉掛け業務', '小型ボイラーを除くボイラー取扱業務', 'つり上げ5トン以上のクレーン運転業務', '最大荷重1トン未満のフォークリフト運転業務'], correctIndex: 3, explanation: '労働安全衛生法令により、最大荷重1トン未満のフォークライトは特別教育で従事可能。1トン以上はブレス必需。' },
  { id: 44, section: 'moji', question: '「四大公害病」と原因物質の正しい組み合わせは？', options: ['水俣病・と素', 'イタイイタイ病・カドミウム', '新潟水俣病・六価クロム', '四日市喘息・窒素化合物'], correctIndex: 1, explanation: '四日市喘息は硫黄化合物（SOx）が原因。水俣病は Methyl水銀、イタイイタイ病はカドミウム。' },
  { id: 45, section: 'moji', question: '「大気汚染防止法」で事業者が守るべき記録保存期間は？', options: ['10年', '5年', '3年', '1年'], correctIndex: 2, explanation: 'ばい煙発生施設の濃度測定結果は3年間保存義務付けられている。10年ではない。' },
  { id: 46, section: 'moji', question: '「ばい煙排出基準」の設定根拠として正しいものは？', options: ['施設の規模のみ', '汚染物質の種類と施設の規模', '事業者の希望', '市场价格'], correctIndex: 1, explanation: '排出基準は汚染物質の種類と施設の種類の両方に基づいて設定。' },
  { id: 47, section: 'moji', question: '「納期遅延対策」として最も不適切なものは？', options: ['生産能力と仕事量のバランス調査', '日程管理の実施状況調査', '特急品・計画外作業の安易な投入調査', '全工程の在庫増加スペース確保調査'], correctIndex: 3, explanation: '在庫増加は問題の根本解決にならず、スペース・コストの浪费になる。必要なのは需給バランスの改善。' },
  { id: 48, section: 'moji', question: '「納期遅延対策」として適切なものは？', options: ['大口発注を一括納入させる', 'カムアップシステムを活用する', '在庫を全工程で増加する', '納期遅延を無視する'], correctIndex: 1, explanation: 'カムアップシステム（カムアップ）は調達品を必要時に合わせて納入する方式で、現場での管理性を向上させる。' },
  { id: 49, section: 'moji', question: '「納入実績グラフ」からもたらされる効果は？', options: ['市场价格の予測', 'サプライヤーの評価', '社内政治', '製品のデザイン'], correctIndex: 1, explanation: '納入実績をグラフ化すると納期遅延のパターンが明確になり、サプライヤー別の評価・改善点が分かる。' },
  { id: 50, section: 'dokkai', question: '【読解】ある工場では、工程間の滞留時間を可視化するため毎日流動数曲線を活用している。報告書によると、粉塵処理工程の滞留時間が先週より増加傾向にあり、原因を调查中という。工程間で滞留時間が増加傾向の最も考えられる理由は？', options: ['工程の効率が上がった', '後工程の処理速度が速くなった', '前工程からくる数量が多いまたは処理速度が追い付かない', '空気が湿気が多いために品質が低下した'], correctIndex: 2, explanation: '流動数曲線で滞留時間が増加ということは、受け取る量に対して処理速度が追い付けていない、または前工程からの供給过多。前工程が早くて後工程が追いつかない状況が最も一般的。' },
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
  moji: { name: '文字 (Moji)', description: 'Kanji & Vocabulary', icon: '漢', duration: '25 questions' },
  bunpou: { name: '文法 (Bunpou)', description: 'Grammar', icon: '📖', duration: '25 questions' },
  dokkai: { name: '読解 (Dokkai)', description: 'Reading Comprehension', icon: '📚', duration: '25 questions' },
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
    let correct = { moji: 0, bunpou: 0, dokkai: 0 };
    let totalSection = { moji: 0, bunpou: 0, dokkai: 0 };

    filteredQuestions.forEach(q => {
      totalSection[q.section as keyof typeof totalSection]++;
      if (answers[q.id] === q.correctIndex) {
        correct[q.section as keyof typeof correct]++;
      }
    });

    return {
      total,
      correct: correct.moji + correct.bunpou + correct.dokkai,
      moji: { correct: correct.moji, total: totalSection.moji },
      bunpou: { correct: correct.bunpou, total: totalSection.bunpou },
      dokkai: { correct: correct.dokkai, total: totalSection.dokkai },
      percentage: total > 0 ? Math.round(((correct.moji + correct.bunpou + correct.dokkai) / total) * 100) : 0,
      passed: total > 0 && ((correct.moji + correct.bunpou + correct.dokkai) / total) >= 0.8,
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
                  📋 Start CBT SSW(ii) (20 soal)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 30 menit • Skor kelulusan: 80%</p>
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
                      'bg-[#00B894]/20 text-[#00B894]'
                    }`}>
                      {SECTION_INFO[currentQ.section as keyof typeof SECTION_INFO].name}
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
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { key: 'moji' as const, label: 'Moji', icon: '漢' },
                    { key: 'bunpou' as const, label: 'Bunpou', icon: '📖' },
                    { key: 'dokkai' as const, label: 'Dokkai', icon: '📚' },
                  ].map(s => {
                    const sectionScore = scores[s.key];
                    return (
                      <div key={s.key} className="p-3 bg-[#2D2D44] rounded-xl">
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-lg font-bold text-white">
                          {'correct' in sectionScore ? `${sectionScore.correct}/${sectionScore.total}` : sectionScore}
                        </div>
                        <div className="text-xs text-[#636E72]">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Pass/Fail indicator */}
                <div className={`p-4 rounded-xl ${scores.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={scores.passed ? 'text-green-400' : 'text-red-400'}>
                    {scores.passed
                      ? '✨ Skor kamu di atas 80%! Kamu siap untuk N5!'
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