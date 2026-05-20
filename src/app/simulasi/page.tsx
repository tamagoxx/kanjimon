'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai' | 'seisan' | 'hinshitsu' | 'genka' | 'anzen' | 'gino2';
  // GINO2 sections:
  // houkoku=報告書, teian=提案, kiban=基本, eisei=衛生, kankyo=環境, anzen=安全
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  // Optional bilingual fields for Karier CBT with furigana
  questionJa?: string;     // Japanese text with furigana
  questionId?: string;     // Indonesian translation
  optionsJa?: string[];    // Japanese options
  optionsId?: string[];    // Indonesian options
  explanationJa?: string;  // Japanese explanation
  explanationId?: string;  // Indonesian explanation
}

// Furigana mapping for common business terms
const FURIGANA_MAP: Record<string, string> = {
  "生産管理": "せいさんかんり",
  "作業管理": "さぎょうかんり",
  "工程分析": "こうていぶんせき",
  "稼働分析": "かどうぶんせき",
  "連合作業": "れんごうさぎょう",
  "動作経済": "どうさけいざい",
  "作業域": "さぎょういき",
  "5S活動": "ご・エスかつどう",
  "工程管理": "こうていかんり",
  "緩衝": "かんしょう",
  "見込生産": "みこみせいさん",
  "多種少量生産": "たしゅしょうりょうせいさん",
  "広義": "こうぎ",
  "品質管理": "ひんしつかんり",
  "現品管理": "げんぴんかんり",
  "設備管理": "せつびかんり",
  "設備保全": "せつびほぜん",
  "日常保全": "にちじょうほぜん",
  "重点設備": "じゅうてんせつび",
  "劣化": "れっか",
  "原価管理": "げんかかんり",
  "在庫管理": "ざいこかんり",
  "棚卸": "たなおろし",
  "物流": "ぶつりゅう",
  "物流コスト": "ぶつりゅうこすと",
  "包装": "ほうそう",
  "原価低減": "げんかていげん",
  "製造直接費": "せいぞうちょくせつひ",
  "製造間接費": "せいぞうかんせつひ",
  "安全衛生": "あんぜんえいせい",
  "納期遅延": "のうきちえん",
  "外注": "がいちゅう",
  "労働災害": "ろうどうさいがい",
  "不安全行為": "ふあんぜんこうい",
  "不安全状態": "ふあんぜんじょうたい",
  "四大公害": "よんだいこうがい",
  "水俣病": "みなみびょう",
  "大気汚染": "たいきおせん",
  "報告書": "ほうこくしょ",
  "提案": "ていあん",
  "基本": "きほん",
  "衛生": "えいせい",
  "環境": "かんきょう",
  "安全": "あんぜん",
  "品質": "ひんしつ",
  "改善": "かいぜん",
  "管理": "かんり",
  "工程": "こうてい",
  "作業": "さぎょう",
  "検査": "けんさ",
  "測定": "そくてい",
  "材料": "ざいりょう",
  "製品": "せいひん",
  "在庫": "ざいこ",
  "製造": "せいぞう",
  "設備": "せつび",
  "機械": "きかい",
  "工具": "こうぐ",
  "部品": "ぶひん",
  "工場": "こうじょう",
  "現場": "げんば",
  "手順": "てじゅん",
  "標準": "ひょうじゅん",
  "異常": "いじょう",
  "原因": "げんいん",
  "結果": "けっか",
  "対策": "たいさく",
  "計画": "けいかく",
  "実行": "じっこう",
  "確認": "かくにん",
  "記録": "きろく",
  "報告": "ほうこく",
  "指示": "しじ",
  "教育": "きょういく",
  "訓練": "くんれん",
  "新人": "しんじん",
  "先輩": "せんぱい",
  "同僚": "どうりょう",
  "上司": "じょうし",
  "部下": "ぶか",
  "会社": "かいしゃ",
  "部署": "ぶしょ",
  "会議": "かいぎ",
  "説明": "せつめい",
  "理解": "りかい",
  "質問": "しつもん",
  "回答": "かいとう",
  "内容": "ないよう",
  "目的": "もくてき",
  "手段": "しゅだん",
  "方法": "ほうほう",
  "形": "かたち",
  "状態": "じょうたい",
  "状況": "じょうきょう",
  "条件": "じょうけん",
  "基準": "きじゅん",
  "規格": "きかく",
  "仕様": "しよう",
  "要求": "ようきゅう",
  "必要": "ひつよう",
  "重要": "じゅうよう",
  "優先": "ゆうせん",
  "有効": "ゆうこう",
  "可能": "かのう",
  "不可能": "ふかのう",
  "問題": "もんだい",
  "解決": "かいけつ",
  "防止": "ぼうし",
  "予防": "よぼう",
  "発生": "はっせい",
  "影響": "えいきょう",
  "評価": "ひょうか",
  "分析": "ぶんせき",
  "比較": "ひかく",
  "視察": "しさつ",
  "監査": "かんさ",
  "認証": "にんしょう",
  "許可": "きょか",
  "申請": "しんせい",
  "承認": "しょうにん",
  "否决": "ふけつ",
  "決定": "けってい",
  "結論": "けつろん",
  "提案書": "ていあんしょ",
  "仕様書": "しようしょ",
  "検査票": "けんさひょう",
  "記録票": "きろくひょう",
  "不良品": "ふりょうひん",
  "検査済": "けんさずみ",
  "，未": "み",
  "検査前": "けんさまえ",
  "完了": "かんりょう",
  "中止": "ちゅうし",
  "延期": "えんき",
  "延長": "えんちょう",
  "短縮": "たんしゅく",
  "増加": "ぞうか",
  "減少": "げんしょう",
  "変更": "へんこう",
  "修正": "しゅうせい",
  "是正": "ぜせい",
  "適切": "てきせつ",
  "不当": "ふとう",
  "違法": "いほう",
  "法令": "ほうれい",
  "規則": "きそく",
  "規定": "きてい",
  "法律": "ほうりつ",
  "条例": "じょうれい",
  "税金": "ぜいきん",
  "費用": "ひよう",
  "コスト": "こすと",
  "価格": "かかく",
  "价钱": "かけん",
  "予算": "よさん",
  "実績": "じっせき",
  "目標": "もくひょう",
  "達成": "たっせい",
  "進捗": "しんちょく",
  "準備": "じゅんび",
  "段取り": "だんどり",
  "配置": "はいち",
  "移動": "いどう",
  "供給": "きょうきゅう",
  "需要": "じゅよう",
  "生産": "せいさん",
  "消費": "しょうひ",
  "補充": "ほじゅう",
  "発注": "はっちゅう",
  "受領": "じゅりょう",
  "納品": "のうひん",
  "出荷": "しゅっか",
  "輸送": "ゆそう",
  "保管": "ほかん",
  "倉庫": "そうこ",
  "荷役": "にやっ",
  "荷扱い": "にあつかい",
  "荷受人": "にうけにん",
  "荷送人": "におくりにん",
  "荷姿": "にすがた",
  "荷口": "にぐち",
  "数量": "すうりょう",
  "重さ": "おもさ",
  "容積": "ようせき",
  "面積": "めんせき",
  "体積": "たいせき",
  "温度": "おんど",
  "湿度": "しつど",
  "圧力": "あつりょく",
  "電圧": "でんあつ",
  "電流": "でんりゅう",
  "電力": "でんりょく",
  "電源": "でんげん",
  "スイッチ": "すいっち",
  "ボタン": "ぼたん",
  "レバー": "ればー",
  "ダイヤル": "だいやる",
  "スイッチ類": "すいっちるい",
  "工具類": "こうぐるい",
  "機械類": "きかいるい",
  "設備類": "せつびるい",
  "器具類": "きぐるい",
  "冶具": "ージ",
  "用量": "ようりょう",
  "成分": "せいぶん",
  "材質": "ざいしつ",
  "加工": "かこう",
  "組立": "くみたて",
  "分解": "ぶんかい",
  "取出": "とりだし",
  "取付け": "とりつけ",
  "外れ": "はずれ",
  "嵌め": "はめ",
  "締め": "しめ",
  "緩み": "ゆるみ",
  "汚れ": "よごれ",
  "損傷": "そんしょう",
  "磨耗": "まもう",
  "疲労": "ひろう",
  "錆び": "さび",
  "腐食": "ふしょく",
  "割れ": "われ",
  "欠け": "かけ",
  "歪み": "ゆがみ",
  "Hooks": "ぶあつ",
  "板金": "いたがね",
  "锻造": "たんぞう",
  "铸造": "ちゅうぞう",
  "焊接": "はんじょう",
  "熔接": "ようせつ",
  "切削": "せっさく",
  "研削": "けんさく",
  "研磨": "けんま",
  "熱処理": "ねつしょり",
  "表面処理": "ひょうめんしょり",
  "塗装": "とそう",
  "鍍金": "めっき",
  "化成処理": "かせいしょり",
  "ディズ": "でぃー",
  "ストリップ": "ストリップ",
  "パネル": "ぱねる",
  "ボックス": "ぼっくす",
  "フレーム": "ふれーむ",
  "サポート": "さぽーと",
  "取っ手": "とって",
  "把手": "とって",
  "足": "あし",
  "脚": "きゃく",
  "柱": "はしら",
  "壁": "かべ",
  "天井": "てんじょう",
  "床": "ゆか",
  "屋根": "やね",
  "扉": "とびら",
  "窓": "まど",
  "階段": "かいだん",
  "昇降": "しょうこう",
  "通路": "つうろ",
  "出口": "でぐち",
  "入口": "いりぐち",
  "非常口": "ひじょうぐち",
  "避難口": "ひなんぐち",
  "詰所": "詰め所",
  "休憩所": "きゅうけいじょ",
  "待合所": "まちあいじょ",
  "洗濯所": "せんたくじょ",
  "洗手所": "せんしんじょ",
  "便所": "べんじょ",
  "風呂": "ふろ",
  "湯沸": "ゆわき",
  "給湯": "ゅうとう",
  "排水": "はいすい",
  "供水": "きょうすい",
  "電球": "でんきゅう",
  "灯泡": "とうとう",
  "照明": "しょうめい",
  "光熱": "こうねつ",
  "水源": "すいげん",
  "燃料": "ねんりょう",
  "油": "あぶら",
  "油脂": "ゆし",
  "水油": "みずあぶら",
  "軽油": "けいゆ",
  "重油": "じゅうゆ",
  "润滑油": "じゅんかつゆ",
  "グリス": "ぐりす",
  "挥発油": "きはつゆ",
  "シンナー": "しんなー",
  "涂料": "とりょう",
  "ペンキ": "ぺんき",
  "ニス": "にす",
  "ボデー": "ぼでー",
  "車体": "しゃたい",
  "車輪": "しゃりん",
  "タイヤ": "たいや",
  "ホイール": "ほいーる",
  "ドア": "どあ",
  "ウィンドウ": "りんどう",
  "ガラス": "がらす",
  "鏡": "かがみ",
  "alski": "あるしき",
  "anto": "あんとう",
  "マップ": "まっぷ",
  "スケール": "すけーる",
  "メジャー": "めじゃー",
  "水位": "すいい",
  "水圧": "すいあつ",
  "水量": "すいりょう",
  "水温": "すいおん",
  "気泡": "きほう",
  "泡": "あわ",
  "沫": "あわ",
  "水滴": "すいてき",
  "蒸気": "じょうき",
  "蒸発": "じょうはつ",
  "凝縮": "ぎょうしゅく",
  "冷却": "れいきゃく",
  "加熱": "かねつ",
  "保温": "ほおん",
  "保冷": "ほれい",
  "着火": "ちゃっか",
  "消火": "しょうか",
  "消化": "しょうか",
  "発火": "はっか",
  "爆発": "ばくはつ",
  "燃烧": "ねんしょう",
  "黒煙": "こくえん",
  "煤煙": "ばいえん",
  "粉塵": "ふんじん",
  "塵埃": "じんあい",
  "污染": "おせん",
  "汚水": "おすい",
  "汚泥": "おでい",
  "浄化": "じょうか",
  "処理": "しょり",
  "廃水": "はいすい",
  "産業廃棄物": "さんぎょうはいきぶつ",
  "一般廃棄物": "いっぱんはいきぶつ",
  "有害物質": "ゆうかいぶっしつ",
  "危険物": "きけんぶつ",
  "可燃性": "かねんせい",
  "不燃性": "ふねんせい",
  "引火性": "いんかせい",
  "爆発性": "ばくはつせい",
  "有毒": "ゆうどく",
  "有害": "ゆうがい",
  "无害": "むがい",
  "無害": "むがい",
  "的安全性": "あんぜんせい",
  "信頼性": "しんらいせい",
  "耐久性": "たいきゅうせい",
  "保全性": "ほぜんせい",
  "操作性": "そうさせい",
  "生産性": "せいさんせい",
  "効率": "こうりつ",
  "能率": "のうりつ",
  "歩留まり": "ぶどまり",
  "良品": "りょうひん",
  "不良": "ふりょう",
  "欠点": "けってん",
  "缺陷": "けっかん",
  "傷": "きず",
  "まさつ": "まさつ",
  "摩擦": "まさつ",
  "衝撃": "しょうげき",
  "振動": "しんどう",
  "騒音": "そうおん",
  "ノイズ": "のいず",
  "不良率": "ふりょうりつ",
  "良品率": "りょうひんりつ",
  "歩留まり率": "ぶどまりりつ",
  "稼働率": "かどうりつ",
  "設備稼働率": "せつびかどうりつ",
  "負荷": "ふか",
  "過負荷": "かふか",
  "定格": "ていかく",
  "最大": "さいだい",
  "最小": "さいしょう",
  "平均": "へいきん",
  "合計": "ごうけい",
  "総合": "そうごう",
  "部分": "ぶぶん",
  "全体": "ぜんたい",
  "全て": "すべて",
  "一部": "いちぶ",
  "半数": "はんすう",
  "当該": "とうがい",
  "特定": "とくてい",
  "不特定": "ふとくてい",
  "各種": "かくしゅ",
  "多様": "たよう",
  "複数": "ふくすう",
  "単一": "たんいつ",
  "複合": "ふくごう",
  "詳細": "しょうさい",
  "概要": "がいよう",
  "要点": "ようてん",
  "重点": "じゅうてん",
  "視点": "してん",
  "焦点": "しょうてん",
  "外観": "がいかん",
  "表面": "ひょうめん",
  "内部": "ないぶ",
  "外部": "がいぶ",
  "背面": "はいめん",
  "側面": "そくめん",
  "上面": "じょうめん",
  "下面": "かめん",
  "右側面": "みぎそくめん",
  "左側面": "ひだりそくめん",
  "四面": "しめん",
  "八方": "はっぽう",
  "四方": "しほう",
  "三角": "さんかく",
  "四角": "しかく",
  "丸": "まる",
  "円形": "えんけい",
  "楕円": "だえん",
  "球": "きゅう",
  "円筒": "えんとう",
  "角柱": "かくちゅう",
  "錐体": "すいたい",
  "立体": "りったい",
  "平面": "へいめん",
  "垂直": "すいちょく",
  "水平": "すいへい",
  "直角": "ちょっかく",
  "傾斜": "けいしゃ",
  "角度": "かくど",
  "轻重": "けいじゅう",
  "高低": "こうてい",
  "早晚": "そうばん",
  "遅速": "ちそく",
  "急峻": "きゅうしゅん",
  "緩慢": "かんまん",
  "順序": "じゅんじょ",
  "流れ": "ながれ",
  "流れ作業": "ながれさぎょう",
  "組作業": "くみさぎょう",
  "個人作業": "こじんさぎょう",
  "班作業": "はんさぎょう",
  "連絡": "れんらく",
  "通信": "つうしん",
  "不通": "ふつう",
  "電話": "でんわ",
  "FAX": "ふぁっくす",
  "メール": "めーる",
  "手紙": "てがみ",
  "文章": "ぶんしょう",
  "書類": "しょるい",
  "資料": "しりょう",
  "データ": "でーた",
  "情報": "じょうほう",
  "知識": "ちしき",
  "技術": "ぎじゅつ",
  "技能": "ぎのう",
  "資格": "しかく",
  "経験": "けいけん",
  "熟練": "じゅくれん",
  "中途": "ちゅうと",
  "新規": "しんき",
  "既存": "きぞん",
  "新任": "しんにん",
  "兼任": "けんにん",
  "担当": "たんとう",
  "主管": "かんしゅ",
  "統管": "とうかん",
  "負責": "ふせき",
  "主導": "しゅどう",
  "促進": "そくしん",
  "推進": "すいしん",
  "獎励": "しょうれい",
  "強制": "きょうせい",
  "命令": "めいれい",
  "注意": "ちゅうい",
  "警告": "けいこく",
  "禁止": "きんし",
  "免除": "めんじょ",
  "特例": "とくれい",
  "適用": "てきよう",
  "応用": "おうよう",
  "利用": "りよう",
  "使用": "しよう",
  "共用": "きょうよう",
  "専用": "せんよう",
  "転用": "てんよう",
  "流用": "りゅうよう",
  "開発": "かいはつ",
  "研究": "けんきゅう",
  "設計": "せっけい",
  "試作": "しさく",
  "試験": "しけん",
  "実験": "じっけん",
  "審査": "しんさ",
  "認定": "にんてい",
  "登録": "とうろく",
  "認可": "にんか",
  "批准": "ひじゅん",
  "同意": "どうい",
  "了承": "りょうかい",
  "承諾": "しょうだく",
  "証明": "しょうめい",
  "証拠": "しょうこ",
  "証憑": "しょうひょう",
  "領収": "りょうしゅう",
  "inko": "いんこ",
  "invoice": "いのeys",
  "送り状": "おくりじょう",
  "明細": "めいさい",
  "注文": "ちゅうもん",
  "受注": "じゅちゅう",
  "取消": "とりけし",
  "提前": "提前",
  "削減": "さくげん",
  "拡大": "かくだい",
  "縮小": "しゅくしょう",
  "開示": "かいじ",
  "公開": "こうかい",
  "非公開": "ひこうかい",
  "発表": "はっぴょう",
  "披露": "ひろう",
  "発売": "はつばい",
  "販売": "はんばい",
  "売上": "うりあげ",
  "収益": "しゅうえき",
  "利益": "りえき",
  "損失": "そんしつ",
  "負債": "ふさい",
  "資産": "しさん",
  "資本": "しほん",
  "投資": "とうし",
  "融資": "ゆうし",
  "金庫": "きんこ",
  "銀行": "ぎんこう",
  "請求": "せいきゅう",
  "支払い": "しはらい",
  "代金": "だいきん",
  "手形": "てがた",
  "小切手": "こぎって",
  "約束": "やくそく",
  "契約": "けいやく",
  "更改": "こうかい",
  "改訂": "かいてい",
  "改正": "かいせい",
  "更新": "こうしん",
  "書換": "かきかえ",
  "交換": "こうかん",
  "互换": "ごかん",
  "代替": "だいたい",
  "置换": "ちかん",
  "設置": "せっち",
  "装着": "そうちゃく",
  "取外し": "とりはずし",
  "据付け": "すえつけ",
  "据置": "すえおき",
  "解体": "かいたい",
  "撤去": "てっきょ",
  "移転": "いてん",
  "搬入": "はんにゅう",
  "搬出": "はんしゅつ",
  "輸送費": "ゆそうひ",
  "旅費": "りょひ",
  "交通費": "こうつうひ",
  "消耗品": "しょうもうひん",
  "備品": "びひん",
  "消耗": "しょうもう",
  "inventory": "いんべんтари",
  "stock": "すトック",
  "入庫": "にゅうこ",
  "出庫": "しゅっこ",
  "入库": "にゅうこ",
  "出库": "しゅっこ",
  "warehouse": "ウェアハウス",
  "cargo": "かご",
  "货物": "かもつ",
  "旅客": "りょかく",
  "航空": "こうくう",
  "海上": "かいじょう",
  "陸上": "りくじょう",
  "鉄運": "てつうん",
  "船荷": "ふなに",
  "空輸": "くうゆ",
  "配送": "はいそう",
  "直通": "ちょくつう",
  "事故": "じこ",
  "故障": "こしょう",
  "破損": "はそん",
  "寿命": "じゅみょう",
  "保ち": "もち",
  "保つ": "もつ",
  "整備": "せいび",
  "修理": "しゅうり",
  "修復": "しゅうふく",
  "点検": "てんけん",
  "正常": "せいじょう",
  "不安定": "ふあんてい",
  "安定": "あんてい",
  "調和": "ちょうわ",
  "適合": "てきごう",
  "一致": "いっち",
  "不一致": "ふいっち",
  "不適切": "ふてきせつ",
  "妥当": "だとう",
  "正しい": "ただしい",
  "違う": "ちがう",
  "検証": "けんしょう",
  "計量": "けいりょう",
  "計測": "けいそく",
  "監視": "かんし",
  "観察": "かんさつ",
  " inspection": "いんすぺくしょん",
  "測定器": "そくていき",
  "計測器": "けいそくき",
  "検査具": "けんさぐ",
  "ゲージ": "げーじ",
  "ノギス": "ノギス",
  "マイクロ meter": "まいくろめーとる",
  "卡尺": "卡尺",
  "電流計": "でんりゅうけい",
  "電圧計": "でんあつけい",
  "電力計": "でんりょくけい",
  "温度計": "おんどけい",
  "圧力計": "あつりょくけい",
  "水分計": "すいぶんけい",
  "厚度計": "あつどけい",
  "硬度計": "こうどけい",
  "粗さ計": "あらさけい",
  " поверхност": "あらさ",
  "あらさ": "あらさ",
  "表面粗さ": "ひょうめんあらさ",
  "instrument": "いんすument",
  " tolerance": "トレランス",
  "upper": "アッパー",
  "lower": "ロウワー",
  "上限": "じょうげん",
  "下限": "かげん",
  "公差": "こうさ",
  "间隙": "かんげき",
  "隙間": "すきま",
  "振れ": "ぶり",
  "振れ止め": "ぶりどめ",
  "狂い": "くるい",
  "ゆがみ": "ゆがみ",
  "曲がり": "まがり",
  "そり": "そり",
  "膨胀": "ぼうちょう",
  "収縮": "しゅうしゅく",
  "膨張": "ぼうちょう",
  "伸び": "のび",
  "縮み": "ちじみ",
  "たわみ": "たわみ",
  "撓み": "たわみ",
  "挫け": "くだけ",
  "折れ": "おれ",
  "破れ": "やぶれ",
  "切れ": "きれ",
  "缺口": "かけた",
  "龟裂": "きれつ",
  "クラック": "くらっく",
  "被打": "うたれ",
  "被打痕": "うたれこん",
  "打痕": "だこん",
  "へこみ": "へこみ",
  "凹み": "くぼみ",
  "压痕": "あっこん",
  "突起": "とっき",
  "出っ張り": "でっぱり",
  "在现场": "げんばで",
  "現地": "げんち",
  "現場作業": "げんばさぎょう",
  "製造現場": "せいぞうげんば",
  "作業手順": "さぎょうてじゅん",
  "作業指示": "さぎょうしじ",
  "作業員": "さぎょういん",
  "作業者": "さぎょうしゃ",
  "担当者": "たんとうしゃ",
  "責任者": "せきにんしゃ",
  "管理者": "かんりしゃ",
  "監督者": "かんとくしゃ",
  "指導者": "しどうしゃ",
  "教育者": "きょういくしゃ",
  "受講者": "じゅこうしゃ",
  "参加者": "さんかしゃ",
  "出席者": "しゅっせきしゃ",
  "参加": "さんか",
  "出席": "しゅっせき",
  "欠席": "けっせき",
  "協力": "きょうりょく",
  "連携": "れんけい",
  "提携": "ていけい",
  "協調": "きょうちょう",
  "文献": "ぶんけん",
  " Reference": "リファレンス",
  "記載": "きさい",
  "消去": "しょうきょ",
  "削除": "さくじょ",
  "追加": "ついか",
  "補正": "ほせい",
  "改良": "かいりょう",
  "改革": "かいかく",
  "革命": "かくめい",
  "打底": "ていちゃく",
  "定着": "ちゃくりく",
  "具体化": "ぐたいか",
  "抽象化": "ちゅうしょうか",
  "本質": "ほんしつ",
  "原則": "げんそく",
  "原理": "げんり",
  "法則": "ほうそく",
  "理論": "りろん",
  "実際": "じっさい",
  "現実": "げんじつ",
  "仮想": "かそう",
  "想像": "そうぞう",
  "空想": "くうそう",
  "理想": "りそう",
  "意図": "いと",
  "方針": "ほうしん",
  "戦略": "せんりゃく",
  "戦術": "せんじゅつ",
  "策": "さく",
  "案": "あん",
  "主意": "しゅい",
  "主義": "しゅぎ",
  "思想": "しそう",
  "概念": "がいねん",
  "定義": "ていぎ",
  "定理": "ていり",
  "真実": "しんじつ",
  "事実": "じじつ",
  "実在": "じつざい",
  "存在": "そんざい",
  "消滅": "しょうめつ",
  "生成": "せいせい",
  "成長": "せいちょう",
  "発展": "はってん",
  "退化": "たいか",
  "変化": "へんか",
  "変革": "へんかく",
  "刷新": "さっしん",
  "革新": "かくしん",
  "bios": "びおうす",
  "micro": "まいくろ",
  "electronics": "でんし",
  "制御": "せいぎょ",
  "操作": "そうさ",
  "取扱": "とりあつかい",
  "保守": "ほしゅ",
  "保全": "ほぜん",
  "再生": "さいせい",
  "再利用": "さいりよう",
  "廃棄": "はいき",
  "处分": "しょぶん",
  "賠償": "ばいしょう",
  "补偿": "ほしょう",
  "补习": "ほしゅう",
  "seminar": "せみなー",
  "培训": "ぷりこう",
  "training": "トレニング",
  " education": "えど",
  " 教育": "きょういく",
  "研修": "けんしゅう",
  "涵養": "かんよう",
  "習得": "しゅうとく",
  "獲得": "かくとく",
  " mastery": "ますたー",
  " skill": "すキル",
  " capability": "ケイパビリティ",
  "力量": "りきりょう",
  " abilities": "アビリティ",
  " 能": "のう",
  "技量": "ぎりょう",
  "手腕": "しゅわん",
  "力量評価": "りきりょうひょうか",
  "人事": "じんじ",
  "、組織": "そしき",
  "culture": "カルチャー",
  "風土": "ふうど",
  "雰囲気": "ふんいき",
  "気運": "きうん",
  "機運": "きうん",
  " motion": "モーション",
  " logo": "ログ",
  " brand": "ブランド",
  " culture": "カルチャー",
  " identity": "アイデンティティ",
  " mission": "ミッション",
  " vision": "ビジョン",
  " value": "バリュー",
  " philosophy": "フィロソフィ",
  " way": "ウェイ",
  " creeds": "クリード",
  " principles": "プリンシプル",
  " standard": "スタンダード",
  " norms": "ノーム",
  " motto": "モットー",
  " slogan": "スローガン",
  " long": "ロンダ",
  " term": "たむ",
  " short": "しょう",
  " long-term": "ちょうき",
  " short-term": "たんき",
  "年度": "ねんど",
  "中間": "ちゅうかん",
  "期末": "きまつ",
  "期首": "きしゅ",
  "決算": "けっさん",
  "予決": "よけつ",
  "予知": "よち",
  "予測": "よそく",
  "予報": "よほう",
  "進行": "しんこう",
  "推移": "すいい",
  "転帰": "てんき",
  "動向": "どうこう",
  "傾向": "けいこう",
  "趨勢": "すうせい",
  "大势": "たいせい",
  "潮流": "ちょうりゅう",
  " trend": "トレンド",
  " direction": "ダイレクション",
  " tendency": "テンでんcy",
  "动向": "どうこう",
  "iso": "アイ・エス・オー",
  "jis": "ジス",
  "jis規格": "ジスきかく",
  "iso9001": "アイ・エス・オー・キュウ・ゼロ・イチ",
  "iso14001": "アイ・エス・オー・イチ・ヨンム・イッ",
  "是正処置": "ぜせいしょち",
  "恒久処置": "こうきゅうしょち",
  "、再発防止": "さいはつぼうし",
  "安全管理": "あんぜんかんり",
  "、安全衛生": "あんぜんえいせい",
  "衛生管理": "えいせいかんり",
  "健康管理": "けんこうかんり",
  "、環境管理": "かんきょうかんり",
  "苦情": "くじょう",
  "クレーム": "くれーむ",
  "施主": "せし",
  "家主": "いえぬし",
  "货主": "かにぬし",
  "荷主": "にぬし",
  "問い": "とい",
  "照会": "しょうかい",
  "打听": "ちょうたつ",
  "依頼": "いらい",
  "要員": "よういん",
  "求人": "きゅうじん",
  "応募": "おうぼ",
  "募集": "ぼしゅう",
  "採用": "さいよう",
  "解雇": "かいこ",
  "辞職": "しょく",
  " 퇴직": "たいしょく",
  "、休職": "きゅうしょく",
  "，复職": "ふくしょく",
  "配転": "はいてん",
  "転勤": "きんてい",
  "出向": "しゅっこう",
  "。左膀": "さぱん",
  "右膀": "うぱん",
  "右腕": "みぎうで",
  "左腕": "ひだりうで",
  "食指": "しょくし",
  "拇指": "ぼし",
  "物指": "ものさし",
  "指": "ゆび",
  "手首": "てくび",
  "足首": "あしくび",
  "膝盖": "ひざ",
  "肘": "ひじ",
  "肩": "かた",
  "背中": "せなか",
  "胸": "むね",
  "腹": "はら",
  "腰": "こし",
  "头": "あたま",
  "頭": "あたま",
  "額": "ひたい",
  "顔": "かお",
  "目": "め",
  "耳": "みみ",
  "鼻": "はな",
  "口": "くち",
  "歯": "は",
  "舌": "した",
  "首": "くび",
  "holiday": "ホリデー",
  "weekday": "エイチ・デイ",
  "weekend": "ウィークエンド",
  " workday": "ワークデー",
  " today": "トゥデイ",
  " tomorrow": "トゥモロー",
  " yesterday": "イエスタデイ",
  " now": "ナウ",
  " then": "デン",
  " just": "ジャスト",
  " already": "オールEDI",
  " yet": "イェット",
  " still": "スティル",
  " always": "オールウェイズ",
  " never": "ネバー",
  " usually": "ユージュ Ally",
  " sometimes": "サムetimes",
  " often": "オフトン",
  " rarely": "レアリ",
  " almost": "アル most",
  " nearly": "ニアリー",
  " perhaps": "パーレps",
  " maybe": "メイビー",
  " probably": "プロバブ",
  " likely": "ライクリ",
  " unlikely": "アンライクリ",
  " certainly": "晒主",
  " definitely": "デフィニ",
  " absolutely": "アブソ",
  " not": "ノート",
  " only": "オンリ",
  " also": "オウルソ",
  " too": "トゥー",
  " very": "ヴェリ",
  " so": "ソヴ",
  " much": "マッチ",
  " more": "モー",
  " most": "モースト",
  " less": "レス",
  " least": "リースト",
  " such": "サッチ",
  " many": "メニ",
  " few": "フー",
  " several": "セバラ",
  " some": "サム",
  " any": "エニ",
  " all": "オール",
  " each": "イーチ",
  " every": "エブリ",
  " no": "ノ",
  " none": "ナーン",
  " another": "ア Nazar",
  " other": "オザー",
  " others": "オザーズ",
  " everybody": "エブリバディ",
  " everyone": "エブリワン",
  " everything": "エブリシング",
  " everywhere": "エブリウェア",
  " someone": "サムワン",
  " something": "サムシング",
  " somewhere": "サムウェア",
  " anyone": "エニワン",
  " anything": "エニシング",
  " anywhere": "エニウェア",
  " nobody": "ノーバディ",
  " nothing": "ナッシング",
  " nowhere": "ノウウェア",
  " left": "レフト",
  " right": "ライト",
  " center": "センタ",
  " middle": "ミドル",
  " front": "フロント",
  " back": "バック",
  " top": "トップ",
  " bottom": "ボトム",
  " side": "サイド",
  " up": "アップ",
  " down": "ダウン",
  " inside": "インサイド",
  " outside": "アウトサイド",
  " between": "中間",
  " among": "諸",
  " through": "通",
  " across": "横",
  " along": "沿",
  " around": "回",
  " near": "近",
  " far": "遠",
  " here": "ここ",
  " there": "そこ",
  " where": "どこ",
  " who": "誰",
  " what": "何",
  " when": "いつ",
  " why": "なぜ",
  " how": "どう",
  " which": "どれ",
  " this": "これ",
  " that": "それ",
  " these": "これら",
  " those": "それら",
  " somebody": "サムバディ",
  " section": "セクション",
  " department": "デパートメント",
  " division": "ディビジョン",
  " unit": "ユニット",
  " team": "チーム",
  " group": "グループ",
  " person": "パーソン",
  " man": "マン",
  " woman": "woman",
  " child": "チャイルド",
  " people": "ピープル",
  " staff": "スタッフ",
  " crew": "クルー",
  " member": "メンバー",
  " personnel": "パーソン而不",
  " employee": " employee",
  " worker": " worker",
  " officer": " officer",
  " chief": " chief",
  " head": "ヘッド",
  " leader": "リーダー",
  " manager": "マネージャー",
  " supervisor": "スーパーバイザー",
  " director": "ダイレクター",
  " president": "プレジデント",
  " owner": "オーナー",
  " executive": "エグゼクティブ",
  " senior": "シニア",
  " junior": "ジュニ",
  " superior": "上野",
  " subordinate": "ぶか",
  " colleague": "同僚",
  " coworker": "同事",
  " peer": "ピア",
  " partner": "パートナー",
  " customer": "顧客",
  " client": "クライアント",
  " consumer": "消費者",
  " user": "ユーザー",
  " maker": "メーカー",
  " seller": "seller",
  " buyer": "バイヤー",
  " supplier": "サプライヤー",
  " vendor": "ベンダー",
  " dealer": "ディーラー",
  " retailer": "リテイラー",
  " wholesaler": "ホールセーラー",
  " distributor": "ディストリビューター",
  " manufacturer": "ufactura",
  "assembler": " assember",
  " fabricator": "ファブリケーター",
  " constructor": "コンストラクター",
  " producer": "プロデューサー",
  " generator": "ジェネレーター",
  " processor": "プロセッサー",
  " formatter": "フォーマッター",
  " inspector": "インスペクター",
  " tester": "テスター",
  " analyst": "アナリスト",
  " engineer": "エンジニア",
  " designer": "デザイナー",
  " planner": "プランナー",
  " coordinator": "コーディネーター",
  " administrator": "アドミニストレーター",
  " clerk": "cler",
  " secretary": " секретар",
  " assistant": "ア sistant",
  " trainee": "トレーナー",
  " apprentice": " apprentice",
  " intern": " интерн",
  " recruit": " recruit",
  " veteran": " veteran",
  " retiree": " retiree",
};

// Per-character furigana fallback for single-kanji not in FURIGANA_MAP
// Covers ~300 most common JISL2 kanji readings relevant to business/technical Japanese
const CHAR_FURIGANA: Record<string, string> = {
  // Common nouns
  "問": "もん", "答": "とう", "題": "だい", "文": "ぶん", "理": "り",
  "学": "がく", "生": "せい", "産": "さん", "業": "ぎょう", "会": "かい", "社": "しゃ",
  "計": "けい", "時": "じ", "開": "かい", "発": "はつ",
  "表": "ひょう", "現": "げん", "在": "ざい", "本": "ほん", "中": "ちゅう",
  "大": "だい", "小": "しょう", "高": "こう", "低": "てい", "新": "しん",
  "古": "こ", "今": "こん", "先": "さき", "後": "ご", "当": "とう", "毎": "まい",
  // Numbers
  "一": "いち", "二": "に", "三": "さん", "四": "よん", "五": "ご",
  "六": "ろく", "七": "なな", "八": "はち", "九": "きゅう", "十": "じゅう",
  "百": "ひゃく", "千": "せん", "万": "まん", "億": "おく", "半": "はん", "倍": "ばい",
  // Directions / positions
  "上": "じょう", "下": "か", "左": "ひだり", "右": "みぎ", "前": "まえ",
  "東": "ひがし", "西": "にし", "南": "みなみ", "北": "きた",
  // Time
  "日": "にち", "月": "げつ", "火": "か", "水": "すい", "木": "もく", "金": "きん", "土": "ど",
  "年": "ねん", "分": "ふん", "秒": "びょう", "回": "かい", "度": "ど",
  // Nature
  "山": "さん", "川": "かわ", "海": "かい", "空": "そら", "星": "ほし",
  // People / body
  "人": "じん", "男": "だん", "女": "じょ", "子": "こ", "父": "ちち", "母": "はは",
  "目": "もく", "耳": "じ", "口": "く", "手": "て", "足": "あし",
  "体": "たい", "心": "しん", "頭": "あたま", "顔": "かお",
  // Colors
  "白": "はく", "黒": "こく", "青": "あお", "赤": "あか", "黄": "おう",
  // Money / measures
  "円": "えん", "料": "りょう", "費": "ひ", "値": "ち", "価": "か",
  // Business core terms
  "仕": "し", "事": "じ",
  // (duplicates removed)
  "本店": "ほんてん", "支部": "しぶ",
  "品": "ひん", "物": "ぶつ", "商品": "しょうひん",
  "原料": "げんりょう", "材料": "ざいりょう",
  // Work / production
  "作": "さく", "製": "せい", "造": "ぞう", "造的": "ぞうてき",
  "作業": "さぎょう", "工数": "こうすう", "工程": "こうてい",
  "計画": "けいかく", "立案": "りつあん",
  "管理": "かんり", "統制": "とうせい", "制御": "せいぎょ",
  "総": "そう", "目的": "もくてき", "関係": "かんけい",
  "連": "れん", "関": "かん", "係": "けい", "準備": "じゅんび",
  "活動": "かつどう",
  // 2-char verb/noun combos (also used as terms)
  // (duplicates removed)
  "場": "じょう", "位置": "いち",
  "象": "しょう",
  "形": "かたち",
  "性": "せい", "質": "しつ", "品質": "ひんしつ", "確保": "かくほ",
  "安全": "あんぜん", "確認": "かくにん", "検査": "けんさ",
  "試験": "しけん", "調査": "ちょうさ",
  // Analysis / methods
  "分析": "ぶんせき", "方法": "ほうほう", "策": "さく",
  "判断": "はんだん", "評価": "ひょうか", "判定": "はんてい",
  "決定": "けってい", "選択": "せんたく", "選定": "せんてい",
  // Understanding / communication
  "理解": "りかい", "説明": "せつめい", "質問": "しつもん", "回答": "かいとう",
  "問題": "もんだい",
  // Importance
  "必要": "ひつよう", "重要": "じゅうよう", "大切": "たいせつ", "必須": "ひっす",
  // Standards
  "基本": "きほん", "基準": "きじゅん", "標準": "ひょうじゅん",
  "規範": "きはん", "典型": "てんけい", "普通": "ふつう",
  "一般": "いっぱん", "特殊的": "とくしゅ", "共通": "きょうつう", "特有": "とくゆう",
  // Structure
  "形式": "けいしき", "構造": "こうぞう", "仕組み": "しくみ",
  "体系": "たいけい", "組織": "そしき", "機構": "きこう",
  "機械": "きかい", "装置": "そうち", "設備": "せつび",
  "器": "き", "具": "ぐ", "工具": "こうぐ", "道具": "どうぐ",
  // Manufacturing
  "製造": "せいぞう", "生産": "せいさん", "加工": "かこう",
  "組立": "くみたて", "装配": "そうとう",
  "測定": "そくてい", "計測": "けいそく",
  // Adjustment
  "調整": "ちょうせい", "調和": "ちょうわ", "平衡": "へいこう",
  "安定": "あんてい", "危険": "きけん",
  "損害": "そんがい", "損失": "そんしつ", "被害": "ひがい",
  "故障": "こしょう", "異常": "いじょう", "正常": "せいじょう",
  // Correctness
  "適切": "てきせつ", "妥当": "だとう", "有効": "ゆうこう", "無効": "むこう",
  "確実": "かくじつ", "正確": "せいかく", "精密": "せいみつ", "丁寧": "ていねい",
  // Caution
  "注意": "ちゅうい", "用心": "ようじん", "警戒": "けいかい",
  "監視": "かんし", "観察": "かんさ", "観測": "かんそく",
  // Procurement / contracts
  "調達": "ちょうたつ", "購入": "こうにゅう", "注文": "ちゅうもん", "契約": "けいやく",
  "合意": "ごうい", "承認": "しょうにん", "許可": "きょか", "認可": "にんか",
  "却下": "きゃっか", "拒否": "きょひ", "取消": "とりけし",
  // Stoppage
  "中止": "ちゅうし", "中断": "ちゅうだん", "停止": "ていし",
  "終了": "しゅうりょう", "完了": "かんりょう", "達成": "たっせい",
  // Results
  "成功": "せいこう", "失敗": "しっぱい", "結果": "けっか",
  "成果": "せいか", "効果": "こうか", "影響": "えいきょう",
  "結論": "けつろん", "理由": "りゆう", "原因": "げんいん",
  "根拠": "こんきょ", "証拠": "しょうこ", "事実": "じじつ", "実情": "じつじょう",
  // Situation
  "状況": "じょうきょう", "状態": "じょうたい", "形勢": "けいせい",
  "局面": "きょくめん", "場面": "ばめん", "分野": "ぶんや",
  "領域": "りょういき", "範囲": "はんい", "規模": "きぼ", "程度": "ていど",
  // Money / finance
  "概算": "がいさん", "予算": "よさん", "費用": "ひよう",
  "価格": "かかく", "値段": "ねだん", "料金": "りょうきん",
  "手数料": "てすうりょう", "税金": "ぜいきん",
  "公金": "こうきん", "資金": "しきん", "投資": "とうし",
  "金融": "きんゆう", "銀行": "ぎんこう",
  // Organizations
  "企業": "きぎょう", "団体": "だんたい", "機関": "きかん",
  "部署": "ぶしょ", "部門": "ぶもん", "課": "か",
  "担当": "たんとう", "責任": "せきにん", "権限": "けんげん",
  "権利": "けんり", "義務": "ぎむ",
  // Ability
  "能力": "のうりょく", "性能": "せいのう", "機能": "きのう",
  "仕様": "しよう", "性格": "せいかく", "特徴": "とくちょう",
  "特性": "とくせい", "属性": "ぞくせい", "種類": "しゅるい",
  // Types / forms
  "型": "かた", "像": "ぞう", "影": "えい",
  "様": "よう", "式": "しき",
  "示": "し", "標": "ひょう", "誌": "し",
  "記録": "きろく", "記憶": "きおく", "保存": "ほぞん", "保管": "ほかん",
  "蓄積": "ちくせき",
  // Measurement
  "推": "すい", "測": "そく", "量": "りょう",
  // Workplace
  "職": "しょく", "勤": "きん", "務": "む",
  "役": "やく", "働": "どう", "処": "しょ", "置": "ち", "布": "ふ",
  "画": "が", "段": "だん", "段階": "だんかい", "階": "かい", "層": "そう", "級": "きゅう",
  "班": "はん", "組": "くみ", "部": "ぶ", "署": "しょ", "局": "きょく", "所": "じょ",
  // Verbs
  "行": "こう", "来": "き",
  "去": "きょ", "帰": "き", "返": "へん",
  "複": "ふく", "写": "しゃ", "印": "いん", "刷": "さつ", "印刷": "いんさつ",
  "電": "でん", "話": "わ", "信": "しん", "通": "つう", "通信": "つうしん",
  // Discussion
  "合": "ごう", "同": "どう", "等": "とう",
  "論": "ろん", "議": "ぎ", "面": "めん",
  "点": "てん", "項": "こう", "件": "けん",
  "課題": "かだい", "案件": "あんけん", "項目": "こうもく", "事項": "じこう",
  // Others
  "状": "じょう", "況": "きょう", "態": "たい",
  // (duplicates removed)
  "相": "そう", "互": "ご",
  "及": "きゅう", "至": "し", "致": "ち",
  "与": "よ", "給": "きゅう", "供": "きょう", "提": "てい",
  "該": "がい",
  "変": "へん", "更": "こう",
  "限": "げん", "界": "かい",
  "除": "じょ",
  "対": "たい",
  // (duplicates removed)
  // Common extra
  "以": "い", "不": "ふ", "有": "ゆう", "無": "む",
  "京": "きょう", "都": "と", "府": "ふ", "県": "けん",
  "市": "し", "区": "く", "町": "ちょう", "村": "そん",
  "号": "ごう", "番": "ばん", "第": "だい", "類": "るい",
  "方": "ほう", "法": "ほう", "規則": "きそく", "制": "せい",
  "格": "かく", "規": "き", "範": "はん",
  "見": "けん", "聞": "ぶん", "語": "ご", "読": "どく",
  "書": "しょ",
  "何": "なん", "誰": "だれ", "どこ": "どこ",
  // (duplicates removed)
  "利用": "りよう", "使用": "しよう", "適用": "てきよう", "応用": "おうよう",
  "提供": "ていきょう", "開発": "かいはつ", "研究": "けんきゅう",
  "改善": "かいぜん", "改革": "かいかく", "変革": "へんかく",
  "完成": "かんせい",
  "大小": "だいしょう", "多少": "たしょう", "約": "やく",
  "在我": "ざいが",
  "在庫": "ざいこ",
  "配分": "はいぶん",
};


// Apply furigana to Japanese text using known term map + per-character fallback
// Strategy: replace known multi-char terms first (with ruby), then process remaining kanji
function applyFurigana(text: string): string {
  let result = text;

  // First pass: replace known multi-char terms with character-level ruby markup
  // Sort longest first to avoid partial replacements
  const terms = Object.keys(FURIGANA_MAP).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    if (!result.includes(term)) continue;
    const reading = FURIGANA_MAP[term];
    const ruby = term.split('').map((kanji, idx) => {
      const rc = reading[idx] || '';
      return (rc && rc !== kanji)
        ? `<ruby><rb>${kanji}</rb><rt>${rc}</rt></ruby>`
        : kanji;
    }).join('');
    result = result.replace(new RegExp(escapeRegExp(term), 'g'), ruby);
  }

  // Second pass: wrap remaining bare kanji with per-character CHAR_FURIGANA
  // Split text by <ruby>...</ruby> tags, only process non-ruby parts
  const parts: string[] = [];
  let lastIndex = 0;
  const KANJI = /[一-龥]/g;

  // Split result by ruby tags - find each <ruby> block and push non-ruby content
  let rubyTagStart = result.indexOf('<ruby>');
  while (rubyTagStart !== -1) {
    if (rubyTagStart > lastIndex) {
      parts.push(result.substring(lastIndex, rubyTagStart));
    }
    const rubyEnd = result.indexOf('</ruby>', rubyTagStart);
    lastIndex = rubyEnd !== -1 ? rubyEnd + 7 : rubyTagStart + 6;
    rubyTagStart = result.indexOf('<ruby>', lastIndex);
  }
  if (lastIndex < result.length) {
    parts.push(result.substring(lastIndex));
  }

  // Now process each non-ruby part for remaining kanji using CHAR_FURIGANA
  const processed = parts.map(part => {
    return part.replace(KANJI, (char) => {
      const reading = CHAR_FURIGANA[char];
      if (reading) {
        return `<ruby><rb>${char}</rb><rt>${reading}</rt></ruby>`;
      }
      return char;
    });
  });

  return processed.join('');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// FuriganaQuestion component renders a question with furigana + Indonesian translation
function FuriganaQuestion({
  q,
  showExplanation,
  answers,
  onAnswer,
}: {
  q: Question;
  showExplanation: boolean;
  answers: Record<number, number>;
  onAnswer: (optionIndex: number) => void;
}) {
  const hasBilingual = !!(q.questionJa && q.questionId);

  if (!hasBilingual) {
    // Fallback: render original question format
    return (
      <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
        <p className="text-lg text-white whitespace-pre-line mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((option, i) => {
            const isSelected = answers[q.id] === i;
            const isCorrect = i === q.correctIndex;
            return (
              <button
                key={i}
                onClick={() => !showExplanation && onAnswer(i)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  showExplanation
                    ? isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : isSelected
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                        : 'bg-[#2D2D44] text-[#636E72]'
                    : isSelected
                      ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                      : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] border border-transparent'
                }`}
              >
                <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                {option}
                {showExplanation && isCorrect && <span className="ml-2">✓</span>}
                {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>
        {showExplanation && (
          <div className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl">
            <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 Explanation</h4>
            <p className="text-[#B2BEC3]">{q.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
      {/* Question with Furigana */}
      <div className="mb-6">
        <p className="text-lg text-white leading-relaxed mb-2">
          {q.questionJa}
        </p>
        <p className="text-sm text-[#74B9FF] italic" dangerouslySetInnerHTML={{ __html: applyFurigana(q.questionJa!) }} />
        <p className="text-xs text-[#636E72] mt-1">{q.questionId}</p>
      </div>

      {/* Options with furigana + translation */}
      <div className="space-y-3">
        {(q.optionsJa || q.options).map((optionJa, i) => {
          const optionId = q.optionsId?.[i] || '';
          const isSelected = answers[q.id] === i;
          const isCorrect = i === q.correctIndex;

          return (
            <button
              key={i}
              onClick={() => !showExplanation && onAnswer(i)}
              disabled={showExplanation}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                showExplanation
                  ? isCorrect
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : isSelected
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-[#2D2D44] text-[#636E72]'
                  : isSelected
                    ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                    : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] border border-transparent'
              }`}
            >
              <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
              <span className="text-sm">{optionJa}</span>
              {optionId && <span className="text-xs text-[#636E72] block ml-8 mt-0.5">{optionId}</span>}
              {showExplanation && isCorrect && <span className="ml-2">✓</span>}
              {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation with furigana + translation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl"
        >
          <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 解説 (Pembahasan)</h4>
          <p className="text-[#B2BEC3] text-sm mb-1" dangerouslySetInnerHTML={{ __html: applyFurigana(q.explanationJa || q.explanation) }} />
          {q.explanationId && <p className="text-[#636E72] text-xs mt-2">{q.explanationId}</p>}
        </motion.div>
      )}
    </div>
  );
}

// CBT Karier Bisnis Manufacturing - Source: Google Drive PDF (40 questions)
// Q1-10: 生産管理 | Q11-20: 品質管理 | Q21-30: 原価管理 | Q31-40: 安全衛生・物流
// Format: FULL BILINGUAL - Japanese + Indonesian with furigana
const KARIER_QUESTIONS: Question[] = [
  // Q1-10: 生産管理 (Seisan Kanri - Production Management)
  { 
    id: 1, section: 'seisan',
    question: '問題 1．広義の生産管理に関する管理活動として最も不適切なものは、次のうちどれか。',
    options: ['ア. Manajemen pembelian（こうばいかんり）', 'イ. Manajemen biaya（げんかかんり）', 'ウ. Manajemen sumber daya manusia（じんじかんり）', 'エ. Manajemen peralatan（せつびかんり）'],
    correctIndex: 2, 
    explanation: '広義の生産管理不包括人事管理（じんじかんり）。人事管理属于HR领域，不是直接的生产管理活动。生产管理包括：购买管理、原价管理、设备管理。正确答案：ウ.',
    questionJa: '問題 1．広義の生産管理（こうぎのせいさんかんり）に関する管理活動として最も不適切なものは、次のうちどれか。',
    questionId: 'Manajemen kegiatan terkait manajemen produksi dalam arti luas yang paling tidak tepat adalah?',
    optionsJa: ['ア. 管理購入（こうばいかんり）', 'イ. 管理原价（げんかかんり）', 'ウ. 管理人事（じんじかんり）', 'エ. 管理装備（せつびかんり）'],
    optionsId: ['Manajemen pembelian', 'Manajemen biaya', 'Manajemen SDM', 'Manajemen peralatan'],
    explanationJa: '広義の生産管理（せいさんかんり）は購入管理（こうばいかんり）、原价管理（げんかかんり）、設備管理（せつびかんり）を含みますが、人事管理（じんじかんり）は含みません。人事管理は人力资源管理の分野であり、直接的な生産管理活動ではありません。正确答案：ウ.',
    explanationId: 'Manajemen produksi dalam arti luas (広義の生産管理) mencakup manajemen pembelian (購入管理), manajemen biaya (原价管理), dan manajemen peralatan (設備管理). Tetapi TIDAK mencakup manajemen SDM (人事管理) yang termasuk dalam bidang HR. Jawaban benar: C.'
  },
  { 
    id: 2, section: 'seisan',
    question: '問題 2．作業管理の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。',
    options: ['ア. Mengejar metode kerja yang rasional dan memiliki produktivitas tinggi', 'イ. Merencanakan produksi dan mengendalikan produksi', 'ウ. Menstandarkan metode kerja dan menetapkan waktu standar', 'エ. Menyusun prosedur operasi dan panduan kerja'],
    correctIndex: 0, 
    explanation: '作業管理の核心是追求合理、高效的作业方法（提高生产率）。而生产计划的制定属于生产管理（生産管理）的范畴，而非作业管理的核心内容。イ是正确的作业管理内容。正确答案：ア.',
    questionJa: '問題 2．作業管理（さぎょうかんり）の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。',
    questionId: 'Berikut ini adalah pernyataan tentang konten implementasi manajemen作业 (作業管理) yang paling kurang relevan?',
    optionsJa: ['ア. 合理的で生産性の高い作業方法を追求する', 'イ. 生産を計画し、管理する', 'ウ. 作業方法を標準化し、标准時間を設定する', 'エ. 作業手順書と作業指南书を作成する'],
    optionsId: ['Mengejar metode kerja yang rasional dan produktif tinggi', 'Merencanakan dan mengendalikan produksi', 'Menstandarkan metode kerja dan menetapkan waktu standar', 'Menyusun prosedur operasi dan panduan kerja'],
    explanationJa: '作業管理（さぎょうかんり）の核心は合理的で効率的な作業方法（生産性向上）を追求することです。生産計画（せいさんけいかく）の策定は生産管理（せいさんかんり）の范畴であり、作業管理の核心内容ではありません。正确答案：ア.',
    explanationId: 'Inti dari manajemen作业 (作業管理) adalah mengejar metode kerja yang rasional dan efisien untuk meningkatkan produktivitas. Penyusunan rencana produksi (生産計画) termasuk dalam ranah manajemen produksi (生産管理), bukan konten inti dari manajemen作业. Jawaban benar: A.'
  },
  { 
    id: 3, section: 'seisan',
    question: '問題 3．改善を目的とした工程分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'イ. Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi atau penumpukan, tetapi tidak dapat mengurangi proses pengerjaan atau pemeriksaan.', 'ウ. Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'エ. Saat melakukan analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkan indeks tersebut.'],
    correctIndex: 0, 
    explanation: '在工序分析中，如果发现不必要的加工或检查工序，可以进行改善或消除。活性示数高表示效率好，降低它不是改善方向。金型交换是准备活动而非加工。正确答案：ア.',
    questionJa: '問題 3．改善を目的とした工程分析（かいぜんをも 목적으로にした こうていぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis proses (工程分析) yang bertujuan untuk perbaikan yang paling tepat adalah?',
    optionsJa: ['ア. 作業者の工程分析において、作業者が汚れた表面を検査することは品質検査とみなされる。', 'イ. 製品の工程分析では、运输や堆積の改善はできるが、加工作業や検査作業の削減はできない。', 'ウ. 製品の工程分析において、金型交換は加工作業とみなされる。', 'エ. 运输工程分析において、活性示数が高い場合、物の置き方を変えてそれだけを下げる。'],
    optionsId: ['Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi/tumpukan, tetapi tidak dapat mengurangi proses pengerjaan/pemeriksaan.', 'Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'Saat analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkannya.'],
    explanationJa: '工程分析（こうていぶんせき）において、不必要な加工作業や検査作業を発見した場合は、改善や解消ができます。活性示数が高い場合は効率がよいことを意味し、それを下げるのは改善の方向ではありません。金型交換は準備活動（準備作業）であり、加工作業ではありません。正确答案：ア.',
    explanationId: 'Dalam analisis proses (工程分析), jika menemukan proses pengerjaan atau pemeriksaan yang tidak perlu, dapat dilakukan perbaikan atau eliminasi. Indeks aktivitas yang tinggi menunjukkan efisiensi yang baik, dan menurunkannya bukan arah perbaikan. Penggantian cetakan (金型交換) adalah kegiatan persiapan (準備活動), bukan pekerjaan pemrosesan. Jawaban benar: A.'
  },
  { 
    id: 4, section: 'seisan',
    question: '問題 4．稼働分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Analisis aktivitas bertujuan untuk menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'イ. Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya digunakan untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'ウ. Metode pengambilan sampel kerja (work sampling) membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'エ. Saat menganalisis pekerjaan yang bersifat siklik dengan metode work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'],
    correctIndex: 1, 
    explanation: '稼働分析的对象是操作员或机器的状态（作业中、待机中、休息中、故障中等）。连续观测法（連続観測法）不仅用于改善工作系统，还用于确定设定标准时间时的宽裕率。正确答案：イ.',
    questionJa: '問題 4．稼働分析（かどうぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis aktivitas (稼働分析) yang paling tepat adalah?',
    optionsJa: ['ア. 稼働分析は、工程内の原材料、部品、半製品を分析し、 содержимоеと加工時間を分析して、より効率的な作業システムを設計することを目的とする。', 'イ. 連続観測法による稼働分析は、作業システムの改善だけでなく、标准時間を設定する際の緩慢率を決定するためにも使用される。', 'ウ. ワークサンプリング法は、連続観測法の分析負担を軽減し事前の調査なしで行える。', 'エ. ワークサンプリング法で作業性の高い作業を分析する場合、観察は作業サイクルと同じ間隔で行わなければならない。'],
    optionsId: ['Analisis aktivitas bertujuan menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'Metode work sampling membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'Saat menganalisis pekerjaan siklik dengan work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'],
    explanationJa: '稼働分析（かどうぶんせき）の对象は Operator や機械の状態（作業中、待机中、休息中、故障中等）です。連続観測法（れんぞくかんそくほう）は作業システムの改善だけでなく、标准時間を設定する際の緩慢率（かんまんりつ）を決定するためにも使用されます。正确答案：イ.',
    explanationId: 'Objek analisis aktivitas (稼働分析) adalah status operator atau mesin (sedang bekerja, standby, istirahat, rusak, dll). Metode observasi berkelanjutan (連続観測法) digunakan tidak hanya untuk meningkatkan sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran (緩慢率) saat menetapkan waktu standar. Jawaban benar: B.'
  },
  { 
    id: 5, section: 'seisan',
    question: '問題 5．連合作業分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya menggunakan analisis aktivitas, bukan analisis kerja gabungan.', 'イ. Dalam diagram orang–mesin (man–machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'ウ. Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya menggunakan analisis kerja gabungan daripada metode PTS.', 'エ. Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'],
    correctIndex: 2, 
    explanation: '当多名作业人员并行同时在一个对象上工作时，应使用联合作业分析（連合作業分析）而非PTS法。PTS法适用于个别作业，联合作业分析可以掌握等待、协调、不同步的时间。正确答案：ウ.',
    questionJa: '問題 5．連合作業分析（れんごうさぎょうぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis kerja gabungan (連合作業分析) yang paling tepat adalah?',
    optionsJa: ['ア. 1人の作業者が1台の機械を操作する場合、効率を上げるために連合作業分析ではなく、稼働分析を使用するべきである。', 'イ. 連合作業分析に使用される人間関係機械図（マン・マシン・チャート）では、個人作業や機械の自動操作は記録せず、一緒に 수행される作業部分のみを記録する。', 'ウ. 複数の作業者が同一の对象に並行して同時に作業する場合、作業を改善するためにPTS法ではなく連合作業分析を使用するべきである。', 'エ. 1人の作業者が同時に操作できる機械数を検討する場合、連合作業分析では機械の游休時間は記録せず、作業者の作業時間のみを記録する。'],
    optionsId: ['Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya gunakan analisis aktivitas, bukan analisis kerja gabungan.', 'Dalam diagram orang-mesin (man-machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya gunakan analisis kerja gabungan daripada metode PTS.', 'Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'],
    explanationJa: '複数の作業者が並行して同一の对象に同時に作業する場合、連合作業分析（れんごうさぎょうぶんせき）を使用すべきです。PTS法（ PTSほう）は個別作業に適用され、連合作業分析は待機時間、协调時間、同期はずれ時間を把握できます。正确答案：ウ.',
    explanationId: 'Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada objek yang sama, sebaiknya gunakan analisis kerja gabungan (連合作業分析). Metode PTS适用于个别作业, analisis kerja gabungan dapat memahami waktu tunggu, koordinasi, dan waktu tidak sinkron. Jawaban benar: C.'
  },
  { 
    id: 6, section: 'seisan',
    question: '問題 6．動作経済の原則に関する分類項目として最も不適切なものは、次のうちどれか。',
    options: ['ア. Klasifikasi yang berkaitan dengan penggunaan tubuh', 'イ. Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'ウ. Klasifikasi yang berkaitan dengan penanganan bahan', 'エ. Klasifikasi yang berkaitan dengan area kerja（さぎょういかんれんぶ）'],
    correctIndex: 2, 
    explanation: '動作経済的原则分为3大类：①身体的使用分类、②工具和设备的设计分类、③作業域的分类。材料处理（材料的取り扱い）不属于主要分类。正确答案：ウ.',
    questionJa: '問題 6．動作経済（どうさけいざい）の原則に関する分類項目として最も不適切なものは、次のうちどれか。',
    questionId: 'Kategori klasifikasi prinsip ekonomi gerakan (動作経済の原則) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 身体の使用に関する分類', 'イ. 工具や機器の設計に関する分類', 'ウ. 材料の取り扱いに関する分類', 'エ. 作業域（さぎょういき）に関する分類'],
    optionsId: ['Klasifikasi yang berkaitan dengan penggunaan tubuh', 'Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'Klasifikasi yang berkaitan dengan penanganan bahan', 'Klasifikasi yang berkaitan dengan area kerja (作業域)'],
    explanationJa: '動作経済（どうさけいざい）の原則は3つの大きな分類に分けられます：①身体の使用に関する分類、②工具や機器の設計に関する分類、③作業域（さぎょういき）の分類。材料的取り扱い（ざいりょうてのhandling）は主な分類には属しません。正确答案：ウ.',
    explanationId: 'Prinsip ekonomi gerakan (動作経済の原則) dibagi menjadi 3 klasifikasi utama: (1) klasifikasi yang berkaitan dengan penggunaan tubuh, (2) klasifikasi yang berkaitan dengan desain alat dan peralatan, (3) klasifikasi yang berkaitan dengan area kerja (作業域). Penanganan bahan (材料的取り扱い) tidak termasuk dalam klasifikasi utama. Jawaban benar: C.'
  },
  { 
    id: 7, section: 'seisan',
    question: '問題 7．5S活動に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'イ. Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'ウ. Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'エ. Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'],
    correctIndex: 2, 
    explanation: '5S的顺序是：整理→整顿→清扫→清洁→躾。清洁（清掃）是5S中的第三步，是独立的步骤，而不是仅通过整理、整顿、躾就能自动实现。跳过清扫步骤是不正确的。正确答案：ウ.',
    questionJa: '問題 7．5S活動（ご・エスかつどう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang aktivitas 5S (5S活動) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 不要なものは定められた規則に従って捨てる。', 'イ. 守るべき規則を視覚的に表示し所有人都に情報を伝える。', 'ウ. 整理、整顿、習慣化を行えば自動的にクリーンな職場が创设される。', 'エ. 部品保管棚には保管品名と責任者を明記する。'],
    optionsId: ['Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'],
    explanationJa: '5Sの顺序は：整理（せいり）→整顿（せいとん）→清掃（せいそう）→清潔（せいけつ）→躾（しつけ）です。清掃（せいそう）は5Sの第三ステップであり、獨立したステップです。整理、整顿、躾だけでは自動的に実現されるものではありません。清掃ステップをスキップするのは不適切です。正确答案：ウ.',
    explanationId: 'Urutan 5S adalah: Seiri (整理) → Seiton (整顿) → Seiso (清掃) → Seiketsu (清潔) → Shitsuke (躾). Pembersihan (清掃/Seiso) adalah langkah ketiga dalam 5S dan merupakan langkah independen, bukan sesuatu yang akan terjadi secara otomatis hanya dengan Seiri, Seiton, dan Shitsuke. Melewati langkah pembersihan tidak tepat. Jawaban benar: C.'
  },
  { 
    id: 8, section: 'seisan',
    question: '問題 8．工程管理における緩衝に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'イ. Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'ウ. Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'エ. Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'],
    correctIndex: 0, 
    explanation: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.',
    questionJa: '問題 8．工程管理（こうていかんり）における緩衝（かんしょう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang buffer (緩衝) dalam manajemen proses (工程管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 生産ラインのある工程にボトルネックがある場合、すべての工程間に半製品在庫を置くことでライン全体の生産能力を高めることができる。', 'イ. 緩衝の種類は、品目（在庫）、容量（作業者/機械）、時間の3つの形式がある。', 'ウ. 原材料の納期遅延があっても生産計画を維持するために安全在庫が必要である。', 'エ. 予測困難な要因による生産時間损失を避けるために、工程内在庫が使用される。'],
    optionsId: ['Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'],
    explanationJa: '生産ラインのある工程にボトルネックがあっても、すべての工程間に半製品在庫を置いてもライン全体の生産能力を高めることはできません。緩衝はボトルネック工程の前にのみ置き、ラインの停止を防ぐためのものであり、すべての工程に置く必要はありません。正确答案：ア.',
    explanationId: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲（緩衝）应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.'
  },
  { 
    id: 9, section: 'seisan',
    question: '問題 9．見込生産に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'イ. Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'ウ. Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'エ. Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'],
    correctIndex: 2, 
    explanation: '見込生産（見込生産）的特点是：厂商自行预测市场需求，并根据预测将产品投放市场。是订单生产的反面。正确答案：ウ.',
    questionJa: '問題 9．見込生産（みこみせいさん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang produksi berdasarkan perkiraan (見込生産) yang paling tepat adalah?',
    optionsJa: ['ア. 特定の顧客からの注文に基づく生産形態である。', 'イ. 主要な製品の仕様は顧客が確定するため、受注を受けるまで仕様は確定しない。', 'ウ. 生産者が市場の需要を自ら予測し、その予測に基づいて製品を 시장에 출시한다。', 'エ. 注文の変動に対応するために、容量生産能力 통해調整が行われる。'],
    optionsId: ['Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'],
    explanationJa: '見込生産（みこみせいさん）の特徴は：生産者が市場の需要を自ら予測し、その予測に基づいて製品を市場に送り出すことです。注文生産の反対概念です。正确答案：ウ.',
    explanationId: 'Ciri-ciri produksi berdasarkan perkiraan (見込生産) adalah: produsen sendiri memprediksi permintaan pasar dan mengirimkan produk ke pasar berdasarkan prediksi tersebut. Merupakan kebalikan dari produksi berdasarkan pesanan. Jawaban benar: C.'
  },
  { 
    id: 10, section: 'seisan',
    question: '問題 10．多種少量生産に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'イ. Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'ウ. Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'エ. Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'],
    correctIndex: 3, 
    explanation: '多种少量生産（多種少量生産）的特点：因产品种类多，每种产品的工序各不相同，工序间相互重叠变得复杂。与少种多量生产、个别生产不同。正确答案：エ.',
    questionJa: '問題 10．多種少量生産（たしゅしょうりょうせいさん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang produksi multi-varietas volume kecil (多種少量生産) yang paling tepat adalah?',
    optionsJa: ['ア. 生产lineに向いており、生産性が高くコストの低い製品生産することを目的とする。', 'イ. 特定の注文があるたびに一度だけの生産形態である。', 'ウ. 様々な製品が交替しながら生産され、各製品の合計产出が計算される生産形態である。', 'エ. 原材料や部品から完成品までの生産プロセスが非常に多様で、製品ごとに生産プロセスが異なり、工程が相互に重なり合って複雑になる。'],
    optionsId: ['Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'],
    explanationJa: '多種少量生産（たしゅしょうりょうせいさん）の特徴は：製品種類が多いため、各製品の工程が異なり、工程が相互に重なり合って複雑になります。少種多量生産や個別生産とは異なります。正确答案：エ.',
    explanationId: 'Ciri-ciri produksi multi-varietas volume kecil (多種少量生産) adalah: karena banyak jenis produk, setiap produk memiliki proses produksi yang berbeda, dan proses saling tumpang tindih sehingga menjadi kompleks. Berbeda dengan produksi sedikit varietas volume besar atau produksi个别. Jawaban benar: D.'
  },
  // Q11-20: 品質管理 (Hinshitsu Kanri - Quality Management)
  { 
    id: 11, section: 'hinshitsu',
    question: '問題 11．＜工数と日程に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。',
    options: ['ア. A:1 B:4 C:5 D:7', 'イ. A:2 B:3 C:6 D:7', 'ウ. A:2 B:3 C:5 D:8', 'エ. A:1 B:4 C:6 D:8'],
    correctIndex: 0, 
    explanation: 'A=余力管理(1)→调整产能与负荷的管理; B=バックワード法(4)→基于交货期制定日程的方法; C=有限山積法(5)→基于作业时间表分配负荷的方法; D=ディスパッチング法(7)→单件生产中的排程方法. 正确答案：ア (A-1, B-4, C-5, D-7).',
    questionJa: '問題 11．＜工数と日程（こうすうと にちてい）に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。',
    questionId: 'Kombinasi yang paling tepat antara＜statement tentang工数 dan日程＞dan＜istilah＞adalah?',
    optionsJa: ['ア. A:1 B:4 C:5 D:7', 'イ. A:2 B:3 C:6 D:7', 'ウ. A:2 B:3 C:5 D:8', 'エ. A:1 B:4 C:6 D:8'],
    optionsId: ['A:1 B:4 C:5 D:7', 'A:2 B:3 C:6 D:7', 'A:2 B:3 C:5 D:8', 'A:1 B:4 C:6 D:8'],
    explanationJa: 'A=余力管理（よりょくかんり）(1)→能力と負荷の調整管理; B=バックワード法（バックワードほう）(4)→納期に基づいて日程を立てる方法; C=有限山積法（ゆうげんやま積みほう）(5)→作業時間表に基づいて負荷を配分する方法; D=ディスパッチング法（ディスパッチングほう）(7)→单个生産におけるスケジューリング方法。正确答案：ア (A-1, B-4, C-5, D-7).',
    explanationId: 'A=Manajemen kapasitas cadangan (余力管理/よりょくかんり) (1) → manajemen penyesuaian kapasitas dan beban; B=Metode backward (バックワード法) (4) → metode penjadwalan berdasarkan tanggal pengiriman; C=Metode堆积 terbatas (有限山積法) (5) → metode distribusi beban berdasarkan jadwal kerja; D=Metode dispatching (ディスパッチング法) (7) → metode penjadwalan dalam produksi tunggal. Jawaban benar: A (A-1, B-4, C-5, D-7).'
  },
  { 
    id: 12, section: 'hinshitsu',
    question: '問題 12．生産統制の管理業務と生産計画との関係性に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 现品管理与材料计划、运输管理相关。', 'イ. 进度管理涉及根据中等日程计划展开物资计划和外包计划。', 'ウ. 余力管理与小日程计划的作业开始日期控制相关。', 'エ. 作业分配与工数计划的修正相关。'],
    correctIndex: 0, 
    explanation: '現品管理是管理实际物品如材料、零部件及生产中运输和分配的活动。因此它与材料计划和运输管理密切相关。正确答案：ア.',
    questionJa: '問題 12．生産統制（せいさんとうせい）の管理業務と生産計画（せいさんけいかく）との関係性に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang hubungan antara kegiatan manajemen controle produksi (生産統制) dan rencana produksi (生産計画) yang paling tepat adalah?',
    optionsJa: ['ア. 現品管理（げんぴんかんり）は材料計画（ 材料けいかく）や輸送管理（ゆそうかんり）与相关。', 'イ. 進捗管理（しんちょくかんり）は中期日程計画に基づいて材料計画や外包計画を展開する。与相关。', 'ウ. 余力管理（よりょくかんり）は小日程計画の作業開始日制御与相关。', 'エ. 作業配分（さぎょうはいぶん）は工数計画の修正と相关。'],
    optionsId: ['現品管理与材料计划、运输管理相关。', '进度管理涉及根据中等日程计划展开物资计划和外包计划。', '余力管理与小日程计划的作业开始日期控制相关。', '作业分配与工数计划的修正相关。'],
    explanationJa: '現品管理（げんぴんかんり）は実際の品物、材料、部品及び生産过程中的輸送や分配的活動を管理することです。だから材料計画（ 材料けいかく）や輸送管理（ゆそうかんり）と密接に関連しています。正确答案：ア.',
    explanationId: 'Manajemen barang nyata (現品管理/げんぴんかんり) mengelola aktivitas seperti material, komponen, dan transportasi serta distribusi dalam proses produksi. Oleh karena itu, ini sangat berkaitan erat dengan perencanaan material (材料計画) dan manajemen transportasi (輸送管理). Jawaban benar: A.'
  },
  { 
    id: 13, section: 'hinshitsu',
    question: '問題 13．以下に示す作業分配に関する記述において、（）に当てはまる＜語句＞の組合せとして最も適切なものは？',
    options: ['ア. A:8 B:4 C:6 D:2', 'イ. A:2 B:3 C:5 D:8', 'ウ. A:8 B:4 C:6 D:2', 'エ. A:1 B:4 C:5 D:7'],
    correctIndex: 2, 
    explanation: '正确的组合是A-8(順序づけ法), B-4(バックワード法), C-6(無限山積法), D-2(工数計画)。这是关于作业分配与术语组合的匹配题。正确答案：ウ (A-8, B-4, C-6, D-2).',
    questionJa: '問題 13．以下に示す作業配分（さぎょうはいぶん）に関する記述において、（）に当てはまる＜語句＞の組合せとして最も適切なものは？',
    questionId: 'Dalam pernyataan tentang分配作業 (作業配分) berikut ini, kombinasi＜istilah＞yang paling tepat untuk mengisi（）adalah?',
    optionsJa: ['ア. A:8 B:4 C:6 D:2', 'イ. A:2 B:3 C:5 D:8', 'ウ. A:8 B:4 C:6 D:2', 'エ. A:1 B:4 C:5 D:7'],
    optionsId: ['A:8 B:4 C:6 D:2', 'A:2 B:3 C:5 D:8', 'A:8 B:4 C:6 D:2', 'A:1 B:4 C:5 D:7'],
    explanationJa: '正しい組合せはA-8（順序づけ法）、B-4（バックワード法）、C-6（無限山積法）、D-2（工数計画）です。これは作業配分と用語の組合せに関する匹配問題です。正确答案：ウ（A-8, B-4, C-6, D-2）。',
    explanationId: 'Kombinasi yang benar adalah A-8 (順序づけ法/metode pengurutan), B-4 (バックワード法/metode backward), C-6 (無限山積法/metode堆积 tak terbatas), D-2 (工数計画/rencana jam kerja). Ini adalah soal pencocokan tentang作业配분 dan terminologi. Jawaban benar: C (A-8, B-4, C-6, D-2).'
  },
  { 
    id: 14, section: 'hinshitsu',
    question: '問題 14．現品管理に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'イ. Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'ウ. Untuk memudahkan pemeriksaan jumlah barang, sebaiknya menggunakan wadah standar, menetapkan cara pengemasan standar, dan menyeragamkan cara penempatan saat penyimpanan sementara.', 'エ. Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'],
    correctIndex: 1, 
    explanation: '現品管理活动中，制备准备（製作手配）是执行生产计划的活动。核查实际物品与账簿差异的活动是盘点（棚卸），而非制备准备。イ的描述混淆了两者。正确答案：イ.',
    questionJa: '問題 14．現品管理（げんぴんかんり）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen barang nyata (現品管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 実際の品物の取り扱いや保管において、物品の破損や品質低下を防止するように努める必要がある。', 'イ. 製作手配（せいさくてはい）は、実際の物品数量と帳簿記載数量との差異を核查するために行われる。', 'ウ. 物品数量の検査を容易にするため、標準コンテナを使用し、標準包装方式を設定し、一時保管時の配置方法を統一する。', 'エ. 原材料と半製品について、保管場所と保管方法を明確に定める必要がある。'],
    optionsId: ['Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'Untuk memudahkan pemeriksaan jumlah barang, sebaiknya gunakan wadah standar, tetapkan cara pengemasan standar, dan seragamkan cara penempatan saat penyimpanan sementara.', 'Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'],
    explanationJa: '現品管理（げんぴんかんり）の活動において、製作手配（せいさくてはい）は生産計画を実行する活動です。実際の物品と帳簿の差異を核查する活動は棚卸（たなおろし）であり、製作手配ではありません。イの記述は両者を混同しています。正确答案：イ.',
    explanationId: 'Dalam kegiatan manajemen barang nyata (現品管理), persiapan produksi (製作手配/せいさくてはい) adalah aktivitas untuk menjalankan rencana produksi. Aktivitas untuk memeriksa perbedaan antara barang nyata dan catatan buku adalah inventory count (棚卸/たなおろし), bukan persiapan produksi. Pernyataan B mencampuradukkan keduanya. Jawaban benar: B.'
  },
  { 
    id: 15, section: 'hinshitsu',
    question: '問題 15．設備管理の機能に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'イ. Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'ウ. Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'エ. Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'],
    correctIndex: 3, 
    explanation: '设备管理功能包括：建设进度管理→设备预算管理；设备设计→设备预算编制；维护计划→维护预算编制。而作业标准制定主要用于质量管理和作业指导，与维护预算编制无直接关系。正确答案：エ.',
    questionJa: '問題 15．設備管理（せつびかんり）の機能に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang fungsi manajemen peralatan (設備管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 建設工事工程管理（けんせつこうじこうていかんり）は設備予算管理（せつびよさんかんり）に役立つ。', 'イ. 設備計画（せつびけいかく）に基づいて行われる設備設計（せつびせっけい）は設備予算算出（せつびよさんさんしゅつ）に役立つ。', 'ウ. 維持管理計画（じほかんりけいかく）は維持予算算出（じほよさんさんしゅつ）に役立つ。', 'エ. 作業標準設定（さぎょうひょうじゅんせってい）は維持予算算出（じほよさんさんしゅつ）に役立つ。'],
    optionsId: ['Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'],
    explanationJa: '設備管理（せつびかんり）の機能には：建設工程管理→設備予算管理；設備設計→設備予算編成；維持計画→維持予算編成が含まれます。作業標準設定（さぎょうひょうじゅんせってい）は主に品質管理和作業指導に使用され、維持予算編成とは直接の関係がありません。正确答案：エ.',
    explanationId: 'Fungsi manajemen peralatan (設備管理) termasuk: manajemen jadwal konstruksi → manajemen anggaran peralatan; desain peralatan → penyusunan anggaran peralatan; rencana pemeliharaan → penyusunan anggaran pemeliharaan. Penetapan standar kerja (作業標準設定) terutama digunakan untuk manajemen kualitas dan panduan kerja, tidak memiliki hubungan langsung dengan penyusunan anggaran pemeliharaan. Jawaban benar: D.'
  },
  { 
    id: 16, section: 'hinshitsu',
    question: '問題 16．設備保全の目的に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'イ. Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'ウ. Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'エ. Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'],
    correctIndex: 0, 
    explanation: '设备维护的目的包括：确保安全、保证产品质量、节能降耗。员工福祉属于人力资源管理范畴，不是设备维护的直接目的。正确答案：ア.',
    questionJa: '問題 16．設備保全（せつびほぜん）の目的に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang tujuan pemeliharaan peralatan (設備保全) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 設備保全の目的には従業員福祉（じゅうろうねんふく）が含まれる。', 'イ. 設備保全の目的には安全確保（あんぜんかくほ）が含まれる。', 'ウ. 設備保全の目的には製品品質保証（せいひんひんしつほしょう）が含まれる。', 'エ. 設備保全の目的には省エネ对策（しょうえねたいさく）が含まれる。'],
    optionsId: ['Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'],
    explanationJa: '設備保全（せつびほぜん）の目的には：安全確保、产品品質保証、省エネルギー低減が含まれます。従業員福祉（じゅうろうねんふく）は人力资源管理（じんり資源かんり）の範畴に属し、設備保全の直接的な目的ではありません。正确答案：ア.',
    explanationId: 'Tujuan pemeliharaan peralatan (設備保全) meliputi: memastikan keselamatan, menjamin kualitas produk, dan penghematan energi. Kesejahteraan karyawan (従業員福祉) termasuk dalam ranah manajemen sumber daya manusia, bukan tujuan langsung dari pemeliharaan peralatan. Jawaban benar: A.'
  },
  { 
    id: 17, section: 'hinshitsu',
    question: '問題 17．日常保全に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'イ. Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'ウ. Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'エ. Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'],
    correctIndex: 3, 
    explanation: '日常保全中，详细检查和设备修理原则上应由专职维修部门进行，而非由操作该机器的操作员进行。当发现设备异常时，应按规程向维修部门报告。エ的表述不正确。正确答案：エ.',
    questionJa: '問題 17．日常保全（にちじょうほぜん）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pemeliharaan harian (日常保全) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 設備に異常の兆候が見つかった場合は、规程に従って速やかに維持部門に報告する必要がある。', 'イ. 检查用ハンマーを使用して異常な音を検出することは、日常検査活動の一つである。', 'ウ. 部品の交換は、必要に応じて行われる。例えば、生産工程の切り替え時やすりへり合った場合。', 'エ. 原則として、詳細な検査と設備修理は 해당機械を操作する作業者が行う。'],
    optionsId: ['Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'],
    explanationJa: '日常保全（にちじょうほぜん）では、詳細な検査と設備修理は原則的に專門の維持部門が行い該当機械を操作する作業者ではありません。設備に異常が見つかった場合は、规程に従って維持部門に報告する必要があります。エの記述は不適切です。正确答案：エ.',
    explanationId: 'Dalam pemeliharaan harian (日常保全), pemeriksaan rinci dan perbaikan peralatan pada prinsipnya dilakukan oleh departemen pemeliharaan khusus, bukan oleh operator yang mengoperasikan mesin tersebut. Ketika ditemukan abnormalitas pada peralatan, harus dilaporkan ke departemen pemeliharaan sesuai aturan. Pernyataan D tidak tepat. Jawaban benar: D.'
  },
  { 
    id: 18, section: 'hinshitsu',
    question: '問題 18．生産設備の劣化によって生じる損失に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Biaya transportasi akan meningkat.', 'イ. Output produksi akan menurun.', 'ウ. Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'エ. Kualitas produk akan menurun.'],
    correctIndex: 0, 
    explanation: '生产设备劣化不会直接导致运输费用增加。运输费用与物流活动相关，与设备状态无直接关系。设备劣化会导致：产量下降、原材料消耗率恶化、产品质量下降。正确答案：ア.',
    questionJa: '問題 18．生産設備（せいさんせつび）の劣化（れっか）によって生じる損失（そんしつ）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang kerugian yang disebabkan oleh deteriorasi peralatan produksi (生産設備の劣化) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 輸送費（ゆそうひ）が増加する。', 'イ. 生産輸出（せいさんかすい）が低下する。', 'ウ. 原材料消費率（げんりょうしょうひりつ）が悪化する（増加する）。', 'エ. 製品品質（せいひんひんしつ）が低下する。'],
    optionsId: ['Biaya transportasi akan meningkat.', 'Output produksi akan menurun.', 'Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'Kualitas produk akan menurun.'],
    explanationJa: '生産設備（せいさんせつび）の劣化（れっか）は直接的に輸送費（ゆそうひ）の増加をもたらしません。輸送費は物流活動と関連しており、設備状態とは直接の関係がありません。設備劣化会导致：生産出力低下、原材料消費率悪化和製品品質低下。正确答案：ア.',
    explanationId: 'Deteriorasi peralatan produksi (生産設備の劣化) tidak secara langsung menyebabkan peningkatan biaya transportasi (輸送費). Biaya transportasi berkaitan dengan aktivitas logistik, tidak memiliki hubungan langsung dengan kondisi peralatan. Deteriorasi peralatan menyebabkan: penurunan output produksi, memburuknya rasio konsumsi bahan baku, dan penurunan kualitas produk. Jawaban benar: A.'
  },
  { 
    id: 19, section: 'hinshitsu',
    question: '問題 19．設備保全における重点設備（じゅうてんせつび）の選定対象となる設備として最も不適切なものは、次のうちどれか。',
    options: ['ア. 进入磨损故障期的设备（接近使用寿命末期）', 'イ. 用于生产重要产品的设备', 'ウ. 没有备用产能的设备', 'エ. 损坏时会导致成本大幅增加的设备'],
    correctIndex: 0, 
    explanation: '已进入磨损故障期的设备意味着接近使用寿命末期。此时应进行更换或大修，而非作为维护重点。维护对此类设备效果低且不经济。正确答案：ア.',
    questionJa: '問題 19．設備保全（せつびほぜん）における重点設備（じゅうてんせつび）の選定対象となる設備として最も不適切なものは、次のうちどれか。',
    questionId: 'Peralatan yang paling tidak tepat sebagai target seleksi重点設備 (重点設備) dalam pemeliharaan peralatan (設備保全) adalah?',
    optionsJa: ['ア. 摩耗故障期間（まもうこしょうきかん）已进入の設備（使用寿命末期に近づいている）', 'イ. 重要な 제품을生産するための設備', 'ウ. 予備容量（よびようりょう）のない設備', 'エ. 損傷時に生产成本が大幅に増加する設備'],
    optionsId: ['Peralatan yang已进入 masa kerusakan akibat keausan (dekat akhir umur pakai)', 'Peralatan yang digunakan untuk memproduksi produk penting', 'Peralatan yang tidak memiliki kapasitas cadangan produksi', 'Peralatan yang, jika rusak, akan menyebabkan peningkatan besar pada biaya produksi'],
    explanationJa: '已进入摩耗故障期間（まもうこしょうきかん）の設備は使用寿命末期に近づいています。此时应进行更换或大修，而非作为維持重点。維持对此类设备效果低且不経済。正确答案：ア.',
    explanationId: 'Peralatan yang已进入 masa kerusakan akibat keausan (摩耗故障期間) berarti mendekati akhir umur pakai. Pada saat ini harus dilakukan penggantian atau perbaikan besar, bukan dijadikan重点維持対象. Pemeliharaan terhadap peralatan jenis ini efeknya rendah dan tidak ekonomis. Jawaban benar: A.'
  },
  { 
    id: 20, section: 'hinshitsu',
    question: '問題 20．資材管理における＜分類＞と＜対象資材＞との組合せとして最も適切なものは？',
    options: ['ア. 常備材料・非常備材料 (管理面)', 'イ. 直接材料・間接材料 (使用目的)', 'ウ. 有材・無材 (形態)', 'エ. 原材料・完成品 (状態)'],
    correctIndex: 1, 
    explanation: '资材管理的分类：管理面分类→常备材料/非常备材料；使用目的分类→直接材料/间接材料；形态分类→有材/无材；状态分类→原材料/在制品/完成品。正确答案：イ (直接材料・間接材料 = 使用目的).',
    questionJa: '問題 20．資材管理（しつかんり）における＜分類（ぶんるい）＞と＜対象資材（たいしょうしざい）＞との組合せとして最も適切なものは？',
    questionId: 'Kombinasi yang paling tepat antara＜klasifikasi (分類)＞dan＜material target (対象資材)＞dalam manajemen material (資材管理)?',
    optionsJa: ['ア. 常備材料・非常備材料（じょうびざいりょう・ひじょうびざいりょう）(管理面）', 'イ. 直接材料・間接材料（ちょくせつざいりょう・かんせつざいりょう）(使用目的）', 'ウ. 有材・無材（ゆうざい・むざい）(形態）', 'エ. 原材料・完成品（げん材料・かんせいひん）(状態）'],
    optionsId: ['常備材料・非常備材料 (管理面)', '直接材料・間接材料 (使用目的)', '有材・無材 (形態)', '原材料・完成品 (状態)'],
    explanationJa: '資材管理（しつかんり）の分類：管理面分類→常備材料/非常備材料；使用目的分類→直接材料/間接材料；形態分類→有材/無材；状態分類→原材料/仕掛品/完成品。正确答案：イ（直接材料・間接材料＝使用目的）。',
    explanationId: 'Klasifikasi manajemen material (資材管理): berdasarkan aspek manajemen →常備材料/非常備材料; berdasarkan tujuan penggunaan →直接材料/間接材料; berdasarkan bentuk →有材/無材; berdasarkan kondisi →原材料/仕掛品/完成品. Jawaban benar: B (直接材料・間接材料 = 使用目的).'
  },
  // Q21-30: 原価管理 (Genka Kanri - Cost Management)
  { 
    id: 21, section: 'genka',
    question: '問題 21．在庫管理（ざいこかんり）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'イ. Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'ウ. Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'エ. Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'],
    correctIndex: 3, 
    explanation: '定量订货方式（定量発注法）需要监控库存水平，必要时调整安全库存和订货点。定期订货法的公式是：订货量=最高库存-现有库存+订货间隔期间的平均需求量。正确答案：エ.',
    questionJa: '問題 21．在庫管理（ざいこかんり）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen persediaan (在庫管理) yang paling tepat adalah?',
    optionsJa: ['ア. 在庫管理の狙いは、在庫数量を減少させて収益性を向上させることであり、それにより在庫切れや納期遅延が発生する可能性がある。', 'イ. 定期発注法（ていきはっちゅうほう）では、発注数量を次のように計算する：', 'ウ. モーターのような重要な高价品に対して、定量発注法（ていたいはっちゅうほう）が最も 적합である。', 'エ. 定量発注法では、在庫数量の監視を行い、必要に応じて安全在庫や発注点の調整を行う必要がある。'],
    optionsId: ['Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'],
    explanationJa: '定量発注法（ていたいはっちゅうほう）では、在庫水準の監視を行い、必要に応じて安全在庫（あんぜんざいこ）や発注点（はっちゅうてん）の調整が必要です。定期発注法（ていきはっちゅうほう）の公式は：発注数量＝最高在庫－現在在庫＋発注間隔期間の平均需要量です。正确答案：エ.',
    explanationId: 'Dalam metode pemesanan dengan jumlah tetap (定量発注法), perlu dilakukan pemantauan tingkat persediaan dan penyesuaian terhadap安全在庫 (stok pengaman) dan発注点 (titik pemesanan) bila diperlukan. Rumus metode pemesanan berkala (定期発注法) adalah: jumlah pesanan =最高在庫 - 現在在庫 + rata-rata permintaan selama interval pemesanan. Jawaban benar: D.'
  },
  { 
    id: 22, section: 'genka',
    question: '問題 22．棚卸（たなおろし）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 定期盘点（定期棚卸）是为了年度或季度财务报表而进行的。', 'イ. 在实物上应贴上货架标签、物品标签和盘点卡。', 'ウ. 经常盘点（常時棚卸）需要停止仓库全部作业。', 'エ. 进行盘点时，需要标准化工作程序和管理方式以保证准确性。'],
    correctIndex: 2, 
    explanation: '定期盘点是为了年度或季度财务报表而进行的，需要停止仓库全部作业。而经常盘点是在日常工作中随时进行盘点，不需要停止全部活动。正确答案：ウ.',
    questionJa: '問題 22．棚卸（たなおろし）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang inventory count (棚卸) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 定期棚卸（ていきたなおろし）は年度または四半期財務報告のために行われる。', 'イ. 実際の物品には棚札（たなふだ）、現品札（げんぴんふだ）、棚卸カード（たなおろしかーど）を貼る必要がある。', 'ウ. 常時棚卸（じょうじたなおろし）は倉庫のすべての作業を停止して行われる。', 'エ. 棚卸を行う際、正確性を保証するために作業手順と管理方法を標準化する必要がある。'],
    optionsId: ['定期盘点是为了年度或季度财务报表而进行的。', '在实物上应贴上货架标签、物品标签和盘点卡。', '经常盘点需要停止仓库全部作业。', '进行盘点时，需要标准化工作程序和管理方式以保证准确性。'],
    explanationJa: '定期棚卸（ていきたなおろし）は年度または四半期財務報告のために行われるため、倉庫のすべての作業を停止する必要があります。常時棚卸（じょうじたなおろし）は日常業務の中で随時行われるものであり、すべての活動を停止する必要はありません。正确答案：ウ.',
    explanationId: 'Inventory count berkala (定期棚卸) dilakukan untuk laporan keuangan tahunan atau kuartalan, sehingga perlu menghentikan semua aktivitas gudang. Inventory count terus-menerus (常時棚卸) dilakukan kapan saja dalam pekerjaan sehari-hari, tidak perlu menghentikan semua aktivitas. Jawaban benar: C.'
  },
  { 
    id: 23, section: 'genka',
    question: '問題 23．物流コストにおける機能別分類に関する費用項目として最も不適切なものは、次のうちどれか。',
    options: ['ア. 运输费（ゆそうひ）', 'イ. 包装费（ほうそうひ）', 'ウ. 流通加工费（りゅうつうかこうひ）', 'エ. 销售运输费（うりあげうんちん）'],
    correctIndex: 3, 
    explanation: '物流成本的功能分类包括：运输费、保管费、包装费、流通加工费、装卸费、物流信息管理费。销售运输费属于销售费用，不属于物流成本的功能分类。正确答案：エ.',
    questionJa: '問題 23．物流コスト（ぶつりゅうこすと）における機能別分類（きのうべつぶんるい）に関する費用項目（ひようこうもく）として最も不適切なものは、次のうちどれか。',
    questionId: 'Item biaya yang paling tidak tepat untuk klasifikasi berdasarkan fungsi dalam biaya logistik (物流コスト) adalah?',
    optionsJa: ['ア. 輸送費（ゆそうひ）', 'イ. 包装費（ほうそうひ）', 'ウ. 流通加工費（りゅうつうかこうひ）', 'エ. 売上輸送費（うりあげゆそうひ）'],
    optionsId: ['Biaya transportasi (运输费)', 'Biaya pengemasan (包装费)', 'Biaya加工流通 (流通加工费)', 'Biaya transportasi penjualan (销售运输费)'],
    explanationJa: '物流コスト（ぶつりゅうこすと）の機能別分類には：輸送費、保管費、包装費、流通加工費、荷役費、物流情報管理費含まれます。売上輸送費（うりあげゆそうひ）は販売費用（はんばいひよう）に属し、物流コストの機能別分類には属しません。正确答案：エ.',
    explanationId: 'Klasifikasi berdasarkan fungsi dalam biaya logistik (物流コスト) meliputi: biaya transportasi (輸送費), biaya penyimpanan, biaya pengemasan (包装費), biaya加工流通 (流通加工費), biaya bongkar muat, dan biaya manajemen informasi logistik. Biaya transportasi penjualan (売上輸送費) termasuk dalam biaya penjualan (販売費用), tidak termasuk dalam klasifikasi fungsi biaya logistik. Jawaban benar: D.'
  },
  { 
    id: 24, section: 'genka',
    question: '問題 24．倉庫内のロケーション管理（ろけーしょんかんり）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 固定位置管理中，物品按顺序存放在空出的可用位置。', 'イ. 自由位置管理中，物品与位置没有固定关系，因此无法高效利用存储空间。', 'ウ. 为提高拣货工作效率而放置在拣货区域的库存称为主动型库存（アクティブ型）。', 'エ. 当存在主动型和备用型库存时，不需要区分它们的放置位置。'],
    correctIndex: 2, 
    explanation: '主动型库存（アクティブ型在庫）是放置在拣货区域的库存，用于提高拣货工作效率。正确答案：ウ.',
    questionJa: '問題 24．倉庫内（そうこなえ）のロケーション管理（ろけーしょんかんり）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen lokasi (ロケーション管理) di dalam gudang yang paling tepat adalah?',
    optionsJa: ['ア. 固定ロケーション管理では、品目を空いた使用可能な場所に順番に保管する。', 'イ. フリーロケーション管理では、品目と場所に固定された関係がないため、保管空間を効率的に利用できない。', 'ウ. 、ピッキング作業の効率を上げるためにピッキングエリアに配置された在庫をアクティブ型（アクティブがた）と呼ぶ。', 'エ. アクティブ型とバックアップ型の在庫が存在する場合，它们的配置位置を区別する必要はない。'],
    optionsId: ['Dalam固定位置管理 (固定ロケーション), barang disimpan secara berurutan di tempat kosong yang tersedia.', 'Dalam自由位置管理 (フリーロケーション), karena tidak ada hubungan tetap antara barang dan lokasi, ruang penyimpanan tidak dapat digunakan secara efisien.', 'Persediaan yang ditempatkan di area picking untuk meningkatkan efisiensi kerja picking называется актив型 (アクティブ型).', 'Ketika terdapat persediaan тип aktip dan cadangan, tidak perlu区分 tempat penempatannya.'],
    explanationJa: 'アクティブ型在庫（アクティブがたざいこ）は、ピッキングエリアに配置された在庫であり、ピッキング作業の効率を上げるために使用されます。正确答案：ウ.',
    explanationId: 'Persediaan tipe aktif (アクティブ型在庫/アクティブがたざいこ) adalah persediaan yang ditempatkan di area picking untuk meningkatkan efisiensi pekerjaan picking. Jawaban benar: C.'
  },
  { 
    id: 25, section: 'genka',
    question: '問題 25．包装（ほうそう）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 按形状分类，包装分为三种：个体包装、内包装、外包装。', 'イ. 内包装是位于商品外包装内部的包装。', 'ウ. 按目的分类，包装分为工业包装和商业包装。', 'エ. 用于运输货物的包装是以销售为目的的商业包装。'],
    correctIndex: 3, 
    explanation: '按目的分类，包装分为工业包装和商业包装。工业包装用于运输和保护产品，商业包装用于销售。发货运送用的包装属于工业包装，而非商业包装。正确答案：エ.',
    questionJa: '問題 25．包装（ほうそう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pengemasan (包装) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 形状による分類では、包装は個装（かくそう）、内装（ないそう）、外装（がいそう）の3種類に分類される。', 'イ. 内装（ないそう）は商品の外装内部に位置する包装である。', 'ウ. 目的による分類では、包装は工業包装（こうぎょうほうそう）と商業包装（しょうぎょうほうそう）に分類される。', 'エ. 貨物輸送用の包装は販売目的の商業包装（しょうぎょうほうそう）である。'],
    optionsId: ['Menurut klasifikasi berdasarkan bentuk, kemasan terbagi menjadi tiga: pengemasan individual (個装), pengemasan dalam (内装), dan pengemasan luar (外装).', 'Pengemasan dalam (内装) adalah kemasan yang berada di dalam kemasan luar barang.', 'Menurut klasifikasi berdasarkan tujuan, kemasan terbagi menjadi pengemasan industri (工業包装) dan pengemasan komersial (商業包装).', 'Kemasan untuk pengiriman barang adalah pengemasan komersial yang bertujuan untuk penjualan.'],
    explanationJa: '目的による分類では、包装は工業包装（こうぎょうほうそう）と商業包装（しょうぎょうほうそう）に分類されます。工業包装は輸送と製品の保護に使用され、商業包装は販売に使用されます。貨物輸送用包装は工業包装に属し、商業包装ではありません。正确答案：エ.',
    explanationId: 'Menurut klasifikasi berdasarkan tujuan, kemasan terbagi menjadi pengemasan industri (工業包装) dan pengemasan komersial (商業包装). Pengemasan industri digunakan untuk transportasi dan perlindungan produk, sedangkan pengemasan komersial digunakan untuk penjualan. Kemasan untuk pengiriman barang termasuk dalam pengemasan industri, bukan pengemasan komersial. Jawaban benar: D.'
  },
  { 
    id: 26, section: 'genka',
    question: '問題 26．品質と品質特性（ひんしつとくとくせい）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 品质特性应尽可能定量表示。', 'イ. 真正的特性是顾客想要的品质特性，代用特性是在无法直接测量真正特性时的替代特性。', 'ウ. 品质必须在整个产品生命周期中保持。', 'エ. 安全性是品质特性之一。'],
    correctIndex: 0, 
    explanation: '品质特性应尽可能定量（定量化）表示，而非仅定性表示。定性表示不符合品质管理原则。正确答案：ア.',
    questionJa: '問題 26．品質と品質特性（ひんしつとくとくせい）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang kualitas dan karakteristik kualitas (品質と品質特性) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 品質特性はできるだけ定性的に表す必要がある。', 'イ. 真の特性（しんのとくせい）は顧客が望む品質特性であり、代用特性（だいようとくせい）は真の特性を直接測定できない場合の代替特性である。', 'ウ. 品質は製品の全ライフサイクルを通じて維持されなければならない。', 'エ. 安全性（あんぜんせい）は品質特性の一つである。'],
    optionsId: ['Karakteristik kualitas sebaiknya dinyatakan secara kualitatif sebanyak mungkin.', '真の特性 adalah karakteristik kualitas yang diinginkan pelanggan, 代用特性 adalah karakteristik pengganti ketika真の特性 tidak dapat diukur langsung.', 'Kualitas harus dijaga sepanjang seluruh siklus hidup produk.', 'Keamanan adalah salah satu karakteristik kualitas.'],
    explanationJa: '品質特性（ひんしつとくせい）はできるだけ定量的に（ていりょうてきに）表す必要があり、定性的な表示だけでは品質管理原則に反します。真正的特性（しんのとくせい）は顧客が望む品質特性であり、代用特性（だいようとくせい）は真の特性を直接測定できない場合の代替特性です。正确答案：ア.',
    explanationId: 'Karakteristik kualitas sebaiknya dinyatakan secara kuantitatif (定量的に) sebanyak mungkin, bukan hanya secara kualitatif. Pernyataan kualitatif saja tidak sesuai dengan prinsip manajemen kualitas. 真の特性 (shin no tokusei) adalah karakteristik kualitas yang diinginkan pelanggan, sedangkan 代用特性 (daiyou tokusei) adalah karakteristik pengganti ketika 真の特性 tidak dapat diukur langsung. Jawaban benar: A.'
  },
  { 
    id: 27, section: 'genka',
    question: '問題 27．品質改善（ひんしつかいぜん）に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？',
    options: ['ア. ①:カタヨリ ②:16.0 ③:3.0 ④:A', 'イ. ①:バラツキ ②:16.0 ③:3.0 ④:A', 'ウ. ①:カタヨリ ②:16.0 ③:3.0 ④:B', 'エ. ①:バラツキ ②:16.0 ③:3.0 ④:B'],
    correctIndex: 3, 
    explanation: '①数据总是存在偏差（バラツキ）；②标准偏差4.0→方差16.0；③方差9.0→标准偏差3.0；④两个工程均值相同(50.0)，A的SD=4.0，B的SD=3.0，B更稳定。正确答案：エ (①:バラツキ, ②:16.0, ③:3.0, ④:B).',
    questionJa: '問題 27．品質改善（ひんしつかいぜん）に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？',
    questionId: 'Dalam pernyataan tentang perbaikan kualitas (品質改善), kombinasi istilah yang paling tepat untuk mengisi () adalah?',
    optionsJa: ['ア. ①:カタヨリ ②:16.0 ③:3.0 ④:A', 'イ. ①:バラツキ ②:16.0 ③:3.0 ④:A', 'ウ. ①:カタヨリ ②:16.0 ③:3.0 ④:B', 'エ. ①:バラツキ ②:16.0 ③:3.0 ④:B'],
    optionsId: ['①:カタヨリ ②:16.0 ③:3.0 ④:A', '①:バラツキ ②:16.0 ③:3.0 ④:A', '①:カタヨリ ②:16.0 ③:3.0 ④:B', '①:バラツキ ②:16.0 ③:3.0 ④:B'],
    explanationJa: '①データには常にバラツキがある；②標準偏差4.0→分散16.0；③分散9.0→標準偏差3.0；④二つの工程の平均値は同じ(50.0)で、AのSD=4.0、BのSD=3.0、Bの方が安定している。正确答案：エ (①:バラツキ, ②:16.0, ③:3.0, ④:B).',
    explanationId: '①数据 всегда существует отклонение (バラツキ); ② стандартное отклонение 4.0 → дисперсия 16.0; ③ дисперсия 9.0 → стандартное отклонение 3.0; ④ оба процесса имеют одинаковое среднее (50.0), но A SD=4.0, B SD=3.0, поэтому B более стабилен. Jawaban benar: E (①:バラツキ, ②:16.0, ③:3.0, ④:B).'
  },
  { 
    id: 28, section: 'hinshitsu',
    question: '問題 28．検査の考え方（けんさのかんがえかた）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 外包接受检查的原则是进行全数检查。', 'イ. 当产品价格低廉且允许一定比例的不良品混入时使用抽样检查。', 'ウ. 将实际合格的批次判定为不合格的错误是生产者危险。', 'エ. 全数检查并不能保证所有产品都是合格品。'],
    correctIndex: 0, 
    explanation: '外包接受检查并非原则上是全数检查。应根据物品的重要性和成本选择全数检查或抽样检查。全数检查并非基本原则。正确答案：ア.',
    questionJa: '問題 28．検査の考え方（けんさのかんがえかた）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang konsep inspeksi (検査の考え方) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 外注接受検査（がいいちうけinspection）の原則は全数検査（ぜんすうけんさ）である。', 'イ. 製品価格が安く一定割合の不良品混入が許される場合、抜取検査（ぬわりけんさ）が使用される。', 'ウ. 実際の合格ロットを不合格と判定する错误は生産者危険（せいさんしゃきけん）である。', 'エ. 全数検査を行ってもすべての製品が合格品である保证はない。'],
    optionsId: ['Prinsip pemeriksaan penerimaan外包 adalah pemeriksaan penuh (全数検査).', 'Pemeriksaan sampling (抜取検査) digunakan ketika harga produk rendah dan混入一定比例 defect diperbolehkan.', 'Kesalahan menilai batch yang sebenarnya合格 sebagai tidak合格 adalah生产者危険 (risiko produsen).', 'Pemeriksaan penuh tidak menjamin semua produk adalah produk qualified.'],
    explanationJa: '外注接受検査（がいいちうけinspection）は原則的に全数検査（ぜんすうけんさ）ではありません。物品の重要性とコストに応じて全数検査または抜取検査（ぬわりけんさ）を選択する必要があります。全数検査は基本原則ではありません。正确答案：ア.',
    explanationId: 'Pemeriksaan penerimaan外包 (いいちうけinspection) bukan prinsipnya pemeriksaan penuh (全数検査). Harus memilih pemeriksaan penuh atau pemeriksaan sampling (抜取検査) sesuai dengan kepentingan dan biaya item. Pemeriksaan penuh buka prinsip dasar. Jawaban benar: A.'
  },
  { 
    id: 29, section: 'hinshitsu',
    question: '問題 29．品質保証（ひんしつほしょう）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. ISO9001是国际标准，JIS没有对应标准。', 'イ. 根据PL法，即使没有过失也可以要求损害赔偿（无过失责任）。', 'ウ. 品质保证活动中，品质管理可以全部委托给生产部门。', 'エ. 可追溯性是指产品有问题时，公布并回收、修理产品的活动。'],
    correctIndex: 1, 
    explanation: 'ISO 9001是国际标准，日本发布了同等版本JIS Q 9001。根据PL法（制造物责任法），消费者无需证明过失即可要求损害赔偿（无过失责任）。正确答案：イ.',
    questionJa: '問題 29．品質保証（ひんしつほしょう）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang penjaminan kualitas (品質保証) yang paling tepat adalah?',
    optionsJa: ['ア. ISO9001は国際標準であり、JISには対応規格がない。', 'イ. PL法（PLほう）では、過失がなくても損害賠償を請求できる（無過失責任）。', 'ウ. 品質保証活動では、品質管理をすべて生産部門に委託できる。', 'エ. トレーサビリティ（トレーサビリティ）は產品に問題があった場合、公布して回収、修理する活動である。'],
    optionsId: ['ISO9001 adalah standar internasional, JIS tidak memiliki standar yang sesuai.', 'Menurut PL法 (Hukum Tanggung Jawab Produk), bahkan tanpa kesalahan dapat meminta ganti rugi (tanggung jawab tanpa kesalahan).', 'Dalam kegiatan penjaminan kualitas, manajemen kualitas dapat sepenuhnya dipercayakan kepada departemen produksi.', 'Tracerabilidade adalah aktivitas mempublikasikan, mengumpulkan, dan memperbaiki produk ketika ada masalah.'],
    explanationJa: 'ISO 9001は国際標準であり、日本は同等バージョンJIS Q 9001发布了。根据PL法（製造物責任法），消費者は過失を証明なくても損害賠償を請求できます（無過失責任）。正确答案：イ.',
    explanationId: 'ISO 9001 adalah standar internasional, Jepang telah menerbitkan versi yang setara JIS Q 9001. Menurut PL法 (Hukum Tanggung Jawab Produk/製造物責任法), konsumen dapat meminta ganti rugi tanpa membuktikan kesalahan (tanggung jawab tanpa kesalahan/無過失責任). Jawaban benar: B.'
  },
  { 
    id: 30, section: 'genka',
    question: '問題 30．コストコントロールの内容（こすとコントロールのないよう）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 成本控制是降低目标成本的活动。', 'イ. 成本降低是降低标准成本的活动。', 'ウ. 成本控制是将实际成本降至标准成本的活动。', 'エ. 成本控制是在设计阶段将估算成本降至目标成本的活动。'],
    correctIndex: 2, 
    explanation: '成本控制（コストコントロール）是将实际成本降至标准成本的活动。成本降低（原価低減）是在设计阶段降低目标成本的活动，两者概念不同。正确答案：ウ.',
    questionJa: '問題 30．コストコントロールの内容（こすとコントロールのないよう）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang konten kontrol biaya (コストコントロールの内容) yang paling tepat adalah?',
    optionsJa: ['ア. コストコントロールは目標原価を引き下げる活動である。', 'イ. 原価低減（げんかていげん）は標準原価を引き下げる活動である。', 'ウ. コストコントロールは実際原価を標準原価に一致させる活動である。', 'エ. コストコントロールは設計段階で見積原価を目標原価に引き下げる活動である。'],
    optionsId: ['Kontrol biaya adalah aktivitas menurunkan biaya target.', 'Penurunan biaya adalah aktivitas menurunkan biaya standar.', 'Kontrol biaya adalah aktivitas menyesuaikan biaya aktual dengan biaya standar.', 'Kontrol biaya adalah aktivitas menurunkan biaya estimasi ke biaya target pada tahap desain.'],
    explanationJa: 'コストコントロールは実際原価を標準原価に一致させる活動です。原価低減（げんかていげん）は設計段階で目標原価を下げる活動であり、两者の概念は異なります。正确答案：ウ.',
    explanationId: 'Kontrol biaya (コストコントロール) adalah aktivitas menyesuaikan biaya aktual dengan biaya standar. Penurunan biaya (原価低減/げんかていげん) adalah aktivitas menurunkan biaya target pada tahap desain, keduanya adalah konsep yang berbeda. Jawaban benar: C.'
  },
  // Q31-40: 安全衛生・物流 (Anzen Eisei / Safety & Logistics)
  { 
    id: 31, section: 'anzen',
    question: '問題 31．原価（げんか）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 现行成本是基于现有技术估算的成本。', 'イ. 沉没成本被认为是选择替代方案时，被抛弃的替代方案所丧失的最大利益。', 'ウ. 标准成本是在标准操业度下，使用标准方法、标准能率和标准成本率计算的成本。', 'エ. 部分成本是根据计算目的，仅汇总特定成本要素的成本。'],
    correctIndex: 1, 
    explanation: '选项I描述的是机会费用的定义（选择替代方案时丧失的最大利益），而非沉没成本的定义。沉没成本是已发生且无法收回的费用。正确答案：イ.',
    questionJa: '問題 31．原価（げんか）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang biaya (原価) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 现行原価（げんこうげんか）は現在の技術に基づいて估算された成本である。', 'イ. 埋没原価（まいぼつげんか）は、代替案を選択する際に、捨てられた代替案が失った最大利益であるとされている。', 'ウ. 標準原価（ひょうじゅんげんか）は、標準操業度下で、標準方法、標準能率、標準原価率を使用して計算された成本である。', 'エ. 部分原価（ぶぶんげんか）は、計算目的のために、特定の原価要素のみを集計した成本である。'],
    optionsId: ['Biaya saat ini adalah biaya yang diestimasi berdasarkan teknologi yang ada.', 'Biaya tersembunyi (埋没原価) dianggap sebagai manfaat maksimum yang hilang dari alternatif yang ditinggalkan ketika memilih alternatif lain.', 'Biaya standar adalah biaya yang dihitung menggunakan metode standar, tingkat efisiensi standar, dan tarif biaya standar dalam kondisi operasi standar.', 'Biaya parsial adalah biaya yang hanya mengumpulkan elemen biaya tertentu sesuai dengan tujuan perhitungan.'],
    explanationJa: '選択肢イは機会費用（けいかひよう）の定義（代替案を選択する際に失う最大利益）を描述しており、埋没原価（まいぼつげんか）の定義ではありません。埋没原価は既に発生し取り戻せない費用です。正确答案：イ.',
    explanationId: 'Pilihan B menjelaskan definisi biaya peluang (機会費用/けいかひよう) - yaitu manfaat maksimum yang hilang ketika memilih alternatif lain, bukan definisi biaya tersembunyi (埋没原価/まいぼつげんか). Biaya tersembunyi adalah biaya yang sudah terjadi dan tidak dapat dipulihkan. Jawaban benar: B.'
  },
  { 
    id: 32, section: 'genka',
    question: '問題 32．製造直接費（せいぞうちょくせつひ）及び製造間接費（せいぞうかんせつひ）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 制造直接费和制造间接费是根据操业度分类的。', 'イ. 将制造直接费按产品汇总叫做直课。', 'ウ. 将制造间接费按一定标准分配到产品叫做配赋。', 'エ. 与机器维护相关的劳务费是制造间接费。'],
    correctIndex: 0, 
    explanation: '制造直接费和制造间接费是根据与产品的关系分类的，而非根据作业度分类。按作业度分类的是变动费和固定费。正确答案：ア.',
    questionJa: '問題 32．製造直接費（せいぞうちょくせつひ）及び製造間接費（せいぞうかんせつひ）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang biaya langsung manufaktur (製造直接費) dan biaya tidak langsung manufaktur (製造間接費) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 製造直接費と製造間接費は操業度（そうぎょうど）による分類である。', 'イ. 製造直接費を作順に集計することを直課（ちょっか）という。', 'ウ. 製造間接費を一種の基準で製品に分配することを配賦（はいふ）という。', 'エ. 機械維持に関連する labor cost は製造間接費である。'],
    optionsId: ['Biaya langsung manufaktur dan biaya tidak langsung manufaktur diklasifikasikan berdasarkan tingkat operasi (操業度).', 'Mengakumulasikan biaya langsung manufaktur per produk disebut 直接課 (直課/ちょっか).', 'Mendistribusikan biaya tidak langsung manufaktur ke produk sesuai standar tertentu disebut 配賦 (配賦/はいふ).', 'Biaya tenaga kerja yang terkait dengan pemeliharaan mesin adalah biaya tidak langsung manufaktur.'],
    explanationJa: '製造直接費と製造間接費は产品との関係による分類であり、操業度による分類ではありません。操業度による分類は変動費（へんどうひ）と固定費（こていひ）です。直課（ちょっか）は製造直接費を作順に集計することであり、配賦（はいふ）は製造間接費を一種の基準で製品に分配することです。正确答案：ア.',
    explanationId: 'Biaya langsung manufaktur dan biaya tidak langsung manufaktur diklasifikasikan berdasarkan hubungan dengan produk, bukan berdasarkan tingkat operasi (操業度). Klasifikasi berdasarkan tingkat operasi adalah biaya variabel (変動費) dan biaya tetap (固定費). 直課 (ちょっか) adalah mengalokasikan biaya langsung manufaktur per produk, dan 配賦 (はいふ) adalah mendistribusikan biaya tidak langsung manufaktur ke produk sesuai standar tertentu. Jawaban benar: A.'
  },
  { 
    id: 33, section: 'genka',
    question: '問題 33．原価低減（げんかていげん）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 成本降低效果最大的是在制造阶段。', 'イ. 成本降低包括原价策划阶段的成本降低和制造阶段的成本改善。', 'ウ. IE直接有助于设计阶段的成本改善。', 'エ. 为了降低直接材料费，需要缩短消费时间。'],
    correctIndex: 1, 
    explanation: '原价降低效果约70-80%在设计阶段（原价策划阶段）就已决定，而非制造阶段。IE在制造阶段对原价改善有直接贡献。正确答案：イ.',
    questionJa: '問題 33．原価低減（げんかていげん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pengurangan biaya (原価低減) yang paling tepat adalah?',
    optionsJa: ['ア. 原価低減の効果は製造段階（せいぞうだんかい）で最大である。', 'イ. 原価低減には原价企画段階（げんかけいかくだんかい）の原価低減と製造段階の改善が含まれる。', 'ウ. IEは設計段階（せっけいだんかい）の原価改善に直接貢献する。', 'エ. 直接材料費（ちょくせつざいりょうひ）を低減するためには、消費時間（しょうひじかん）を短縮する必要がある。'],
    optionsId: ['Efek pengurangan biaya paling besar pada tahap manufaktur.', 'Pengurangan biaya mencakup pengurangan biaya pada tahap perencanaan biaya (原价企画段階) dan perbaikan pada tahap manufaktur.', 'IE berkontribusi langsung pada perbaikan biaya pada tahap desain.', 'Untuk mengurangi biaya material langsung, perlu memperpendek waktu konsumsi.'],
    explanationJa: '原价低減効果は約70〜80%が設計段階（げんかけいかくだんかい）(原价企画段階）で既に決定されます，而非製造段階。IEは製造段階での原価改善に直接貢献します。正确答案：イ.',
    explanationId: 'Efek pengurangan biaya sekitar 70-80% sudah ditentukan pada tahap desain (原价企画段階), bukan pada tahap manufaktur. IE berkontribusi langsung pada perbaikan biaya pada tahap manufaktur. Jawaban benar: B.'
  },
  { 
    id: 34, section: 'anzen',
    question: '問題 34．日常的に 발생하는納期遅延（のうきちえん）に対処するための調査方法として最も不適切なものは？',
    options: ['ア. 生产能力与现有工作量的平衡调查（是否能力不足）', 'イ. 日程管理的实施情况调查', 'ウ. 调查是否轻易投入紧急订单或计划外工作', 'エ. 调查所有工序是否确保了增加库存的空间'],
    correctIndex: 3, 
    explanation: '在所有工序增加库存并不是解决交货延迟的根本方法，反而会造成空间和成本的浪费。需要的是供需平衡的改善。正确答案：エ.',
    questionJa: '問題 34．日常的に 발생하는納期遅延（のうきちえん）に対処するための調査方法として最も不適切なものは？',
    questionId: 'Metode investigasi yang paling tidak tepat untuk menangani keterlambatan pengiriman (納期遅延) yang terjadi sehari-hari adalah?',
    optionsJa: ['ア. 生産能力と现有工作量（げんざい工作量）のバランス調査（能力不足かどうか）', 'イ. 日程管理（にちていかんり）の実施状況調査', 'ウ. 特急品（とっきゅうひん）や計画外作業（けいかくがいさく）の安易な投入調査', 'エ. すべての工程が在庫増加スペースを確保しているかの調査'],
    optionsId: ['Investigasi keseimbangan kapasitas produksi dan workload yang ada (apakah kapasitas tidak mencukupi)', 'Investigasi situasi implementasi manajemen jadwal (日程管理)', 'Investigasi apakah ada投机 투입 pesanan urgent atau pekerjaan di luar rencana', 'Investigasi apakah semua proses telah memastikan ruang untuk menambah persediaan'],
    explanationJa: 'すべての工程に在庫を増やすことは納期遅延を解決する根本的な方法ではなく、むしろ空間とコストの無駄になります。需要と供給のバランス改善が必要です。正确答案：エ.',
    explanationId: 'Menambah persediaan di semua proses bukanlah metode fundamental untuk menyelesaikan keterlambatan pengiriman, justru akan membuang ruang dan biaya. Yang dibutuhkan adalah perbaikan keseimbangan supply dan demand. Jawaban benar: D.'
  },
  { 
    id: 35, section: 'anzen',
    question: '問題 35．資材部門（しつぶぶもん）の外注品納期遅延（がいいちゅうなぬきちえん）対策として最も不適切なものは？',
    options: ['ア. 与供应商定期召开会议并确认进度情况', 'イ. 用图表分析交付实绩把握延迟模式', 'ウ. 要求供应商在最终交付日期一次性交付全部数量', 'エ. 对可能延迟的采购品活用カムアップ系统'],
    correctIndex: 2, 
    explanation: '要求供应商一次性全部交付大批量货物会导致库存积压和资金占用问题，不是有效的交货延迟对策。正确答案：ウ.',
    questionJa: '問題 35．資材部門（しつぶぶもん）の外注品納期遅延（がいいちゅうなぬきちえん）対策として最も不適切なものは？',
    questionId: 'Langkah countermeasures yang paling tidak tepat untuk mengatasi keterlambatan pengiriman barang subcontract (外注品納期遅延) dari departemen material adalah?',
    optionsJa: ['ア. 納入業者（のうにゅうぎょうしゃ）との定例ミーティング（ていれいミーティング）を開き進捗状況を确认する', 'イ. 納入実績グラフ（のうにゅうじっせきグラフ）で遅延パターン（ちえんパターン）を分析する', 'ウ. 納入業者に対して最終交付日（さいしゅうこうふび）に全量一回納入させる', 'エ. 遅延可能性がある購入品（こうにゅうひん）にカムアップシステムを活用する'],
    optionsId: ['Mengadakan pertemuan rutin dengan supplier dan mengkonfirmasi status kemajuan', 'Menganalisis pola keterlambatan dengan grafik kinerja pengiriman', 'Meminta supplier untuk pengiriman seluruh jumlah sekaligus pada tanggal pengiriman akhir', 'Memanfaatkan sistem comeback untuk pembelian yang mungkin terlambat'],
    explanationJa: '納入業者に対して全量一回納入させることは、在庫積み上げと資金占有の問題を引き起こし、納期遅延对策として有効ではありません。正确答案：ウ.',
    explanationId: 'Meminta supplier untuk entregar seluruh jumlah sekaligus akan menyebabkan masalah penumpukan persediaan dan penggunaan dana, bukan对策 yang efektif untuk keterlambatan pengiriman. Jawaban benar: C.'
  },
  { 
    id: 36, section: 'anzen',
    question: '問題 36．目で見る管理（めみるかんり）が適切に行われている職場の状態として最も適切なものは？',
    options: ['ア. 使用流动数曲线显示工序间的物料数量和停留时间', 'イ. 作业人员离开岗位去取零部件', 'ウ. 将生产所需油脂类大量堆积在保管库深处', 'エ. 接到库存询问时员工反复确认才回答'],
    correctIndex: 0, 
    explanation: '流动数曲线（流動数曲線）可以可视化显示工序间的物料流动和停滞情况，便于发现问题。是目视管理的有效工具。正确答案：ア.',
    questionJa: '問題 36．目で見る管理（めみるかんり）が適切に行われている職場（しょくば）の状態として最も適切なものは？',
    questionId: 'Kondisi tempat kerja di mana manajemen visual (目で見る管理) dilakukan dengan tepat yang paling tepat adalah?',
    optionsJa: ['ア. 流動数曲線（りゅうどうすうきょくせん）を使用して工程間の物の流れと滞留を表示する', 'イ. 作業員が自分の 자리를離れて部品を取りに行っている', 'ウ. 生産に必要な油脂類を保管庫の奥に大量堆积している', 'エ. 在庫問い合わされると従業員が繰り返し確認して答える'],
    optionsId: ['Menggunakan kurva jumlah aliran (流動数曲線) untuk menampilkan aliran dan stagnasi material antar proses', 'Pekerja meninggalkan pos mereka untuk mengambil komponen', 'Menumpuk大量的 minyak dan lemak yang diperlukan untuk produksi di belakang gudang penyimpanan', 'Ketika ada pertanyaan tentang persediaan, karyawan berulang kali mengkonfirmasi sebelum menjawab'],
    explanationJa: '流動数曲線（りゅうどうすうきょくせん）は工程間の物料の流れと停滞状況を可視化して、問題を発見しやすくするものであり、目視管理（しかんかんり）の有効なツールです。正确答案：ア.',
    explanationId: 'Kurva jumlah aliran (流動数曲線/りゅうどうすうきょくせん) dapat memvisualisasikan aliran dan stagnasi material antar proses, membuatnya mudah untuk menemukan masalah, dan merupakan alat yang efektif untuk manajemen visual (目視管理). Jawaban benar: A.'
  },
  { 
    id: 37, section: 'anzen',
    question: '問題 37．安全衛生活動（あんぜんえいせいかつどう）の推進に関する記述として最も不適切なものは？',
    options: ['ア. 依据劳动安全卫生法，雇主有确保安全工作环境的义务', 'イ. 劳动灾害只因不安全行为而产生', 'ウ. 积极活用ヒヤリ・ハット活动', 'エ. 推进机械和设备本身的本质安全化'],
    correctIndex: 1, 
    explanation: '劳动灾害是不安全行为和不安全状态的组合造成的，仅强调人为因素而忽视设备、环境、制度等系统因素是不全面的。正确答案：イ.',
    questionJa: '問題 37．安全衛生活動（あんぜんえいせいかつどう）の推進に関する記述として最も不適切なものは？',
    questionId: 'Pernyataan tentang promosi aktivitas kesehatan dan keselamatan (安全衛生活動) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 労働安全衛生法（ろうどうあんせんえいせいほう）に基づき、事業者は安全な職場環境（あんぜんなしょくばかんきょう）を確保する義務がある', 'イ. 労働災害（ろうどうさいがい）は不安全行為（ふあんぜんこうい）ののみによって発生する', 'ウ. ヒヤリ・ハット活動（ヒヤリ・ハットかつどう）を積極的に活用する', 'エ. 機械や設備本身的本質安全化（ほんしつあんぜんか）を進める'],
    optionsId: ['Berdasarkan Undang-Undang Keselamatan dan Kesehatan Kerja (労働安全衛生法), pemberi kerja memiliki kewajiban untuk memastikan lingkungan kerja yang aman', 'Kecelakaan kerja hanya disebabkan oleh perilaku tidak aman (不安全行為)', 'Mengaktifkan kegiatan Hiyari-Hat (ヒヤリ・ハット活動)', 'Mendorong keamanan intrinsik mesin dan peralatan itu sendiri'],
    explanationJa: '労働災害は不安全行為（ふあんぜんこうい）と不安全状態（ふあんぜんじょうたい）の組合せによって発生します。人の要因のみを強調して、设备、環境、制度などのシステム要因を見落とすのは不完全です。正确答案：イ.',
    explanationId: 'Kecelakaan kerja disebabkan oleh kombinasi perilaku tidak aman (不安全行為) dan kondisi tidak aman (不安全状態). Hanya menekankan faktor manusia dan mengabaikan faktor sistem seperti peralatan, lingkungan, dan sistem adalah tidak lengkap. Jawaban benar: B.'
  },
  { 
    id: 38, section: 'anzen',
    question: '問題 38．特別教育（とくべつきょういく）を受けなくても従事できる業務は？',
    options: ['ア. 1吨以上起重机的挂钩作业', 'イ. 小型锅炉以外锅炉的操作业务', 'ウ. 5吨以上起重机的操作业务', 'エ. 最大载重1吨未满的叉车操作业务'],
    correctIndex: 3, 
    explanation: '根据安卫则，最大荷载1吨以下的叉车只需特殊教育即可从事，不需要执照。而1吨以上起重机挂钩、锅炉操作、5吨以上起重机操作都需要国家资格证书。正确答案：エ.',
    questionJa: '問題 38．特別教育（とくべつきょういく）を受けなくても従事できる業務（じゅうじかのうむ）は？',
    questionId: 'Pekerjaan yang dapat dilakukan tanpa接受特別教育 (特別教育) adalah?',
    optionsJa: ['ア. つり上げ1トン以上のクレーン玉掛け（く레ーンたまかけ）', 'イ. 小型ボコラー（しょうがたボコラー）以外のボカラーの操作業務（そうさぎょうむ）', 'ウ. 5トン以上のクレーン（く레ーン）の操作業務', 'エ. 最大載重（さいだいさいじゅう）1トン未満のフォークリフト（フォークリフト）操作業務'],
    optionsId: ['Pekerjaan pengaitan crane dengan angkat 1 ton atau lebih', 'Pekerjaan pengoperasian boiler selain boiler kecil', 'Pekerjaan pengoperasian crane 5 ton atau lebih', 'Pekerjaan pengoperasian forklift dengan muatan maksimal kurang dari 1 ton'],
    explanationJa: '安衛則（あんえいそく）によると、最大載重1トン未満のフォークライトは特別教育だけで従事でき、資格書は不要です。1トン以上のクレーン玉掛け、ボカラー操作、5トン以上のクレーン操作には国家資格が必要です。正确答案：エ.',
    explanationId: 'Menurut aturan keselamatan (安衛則), forklift dengan muatan maksimal kurang dari 1 ton dapat dilakukan hanya dengan pendidikan khusus, tanpa perlu sertifikat. Pekerjaan pengaitan crane 1 ton atau lebih, pengoperasian boiler, dan pengoperasian crane 5 ton atau lebih memerlukan sertifikat nasional. Jawaban benar: D.'
  },
  { 
    id: 39, section: 'anzen',
    question: '問題 39．四大公害病（よんだいこうがいびょう）と原因物質（げんいんぶっしつ）の組合せとして最も適切なものは？',
    options: ['ア. 水俣病-砒素', 'イ. イタイイタイ病-カドミウム', 'ウ. 新潟水俣病-六価クロム', 'エ. 四日市喘息-硫黄化合物'],
    correctIndex: 3, 
    explanation: '四大公害：水俣病（有机水银/甲基汞）、イタイイタイ病（镉/Cd）、新潟水俣病（有机水银）、四日市哮喘（硫氧化物/SOx）。エ的正确：水俣病对应有机水银，四日市哮喘对应硫化物。正确答案：エ.',
    questionJa: '問題 39．四大公害病（よんだいこうがいびょう）と原因物質（げんいんぶっしつ）の組合せとして最も適切なものは？',
    questionId: 'Kombinasi penyakit empat besar bencana polusi (四大公害病) dan zat penyebab (原因物質) yang paling tepat adalah?',
    optionsJa: ['ア. 水俣病（みなみびょう）－ヒ素（ひそ）', 'イ. イタイイタイ病－カドミウム（カドミウム）', 'ウ. 新潟水俣病（にいがたみなみびょう）－六価クロム（ろっかクロム）', 'エ. 四日市喘息（よっかいちあかくせい）－硫黄化合物（いおうかごうぶつ）'],
    optionsId: ['Penyakit Minamata - Arsen', 'Penyakit Itai-Itai - Kadmium', 'Penyakit Minamata Niigata - Krom heksavalen', 'Asma Yokkaichi - Senyawa sulfur'],
    explanationJa: '四大公害：水俣病（有機水銀/甲基Hg）、イタイイタイ病（カドミウム/Cd）、新潟水俣病（有機水銀）、四日市喘息（硫氧化物/SOx）。エの正确的是：水俣病は有機水銀に対応し、四日市喘息は硫化物に対応します。正确答案：エ.',
    explanationId: 'Empat penyakit besar polusi: Penyakit Minamata (水俣病) - merkuri organik (有機水銀), Penyakit Itai-Itai (イタイイタイ病) - kadmium (Cd), Penyakit Minamata Niigata (新潟水俣病) - merkuri organik, Asma Yokkaichi (四日市喘息) - oksida sulfur (SOx). Opsi D tepat: penyakit Minamata correspond to merkuri organik, dan asma Yokkaichi correspond to sulfida. Jawaban benar: D.'
  },
  { 
    id: 40, section: 'anzen',
    question: '問題 40．大気汚染防止法（たいきおせんぼうしかほう）に関する記述として最も適切なものは？',
    options: ['ア. 煤烟浓度的测量结果须保存10年', 'イ. 设施变更时也需要申报', 'ウ. 排放标准根据污染物质种类和设施种类、规模设定', 'エ. 记录有永久保存的义务'],
    correctIndex: 2, 
    explanation: '排放标准的设定依据是污染物质种类和设施种类（规模）。浓度测量结果需保存3年。设施变更时需申报。正确答案：ウ.',
    questionJa: '問題 40．大気汚染防止法（たいきおせんぼうしかほう）に関する記述として最も適切なものは？',
    questionId: 'Pernyataan tentang Undang-Undang Pencegahan Polusi Udara (大気汚染防止法) yang paling tepat adalah?',
    optionsJa: ['ア. 煤煙濃度（ばいえんのうど）の測定結果（そくてい結果）は10年間保存する必要がある', 'イ. 施設変更（しせつへんこう）の際も申告（しんこく）が必要である', 'ウ. 排出基準（はいしゅつきじゅん）は污染物質種類（おうせんぶっしつしゅるい）と施設種類（しせつしゅるい）、規模（きぼ）によって設定される', 'エ. 記録（きろく）は永久保存（えいきゅうほぞん）の義務がある'],
    optionsId: ['Hasil pengukuran konsentrasi jelaga (煤煙濃度) harus disimpan selama 10 tahun', 'Perlu declare saat ada perubahan fasilitas', 'Standar emisi ditetapkan berdasarkan jenis zat pencemar dan jenis serta skala fasilitas', 'Rekor memiliki kewajiban untuk disimpan permanen'],
    explanationJa: '排出基準（はいしゅつきじゅん）の設定根拠は污染物質種類と施設種類（規模）です。濃度測定結果（のうどそくてい結果）は3年間保存する必要があります。施設変更時は申告が必要です。正确答案：ウ.',
    explanationId: 'Dasar penetapan standar emisi (排出基準) adalah jenis zat pencemar dan jenis serta skala fasilitas. Hasil pengukuran konsentrasi harus disimpan selama 3 tahun. Perlu declaration saat ada perubahan fasilitas. Jawaban benar: C.'
  },
];
const GINO2_QUESTIONS: Question[] = [
  {
    id: 1,
    section: 'gino2',
    question: '問題1. 生産管理に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題1. 生産管理(せいさんかんり)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 1. Manakah yang paling tidak tepat mengenai deskripsi 生产管理 (Manajemen Produksi)?',
    options: [
      'Manajemen adalah prosedur dan kegiatan untuk merencanakan, mengoperasikan, dan mengendalikan berbagai sumber daya sesuai dengan tujuan manajemen.',
      'Kegiatan penting dalam 生产管理 (manajemen produksi) adalah manajemen terkait QCD.',
      'SDCAサイクル adalah proses di mana P dari PDCAサイクル digantikan oleh S dari Simplify.',
      'Manajemen terkait pencegahan timbulnya 廃棄物 (limbah), penggunaan sumber daya secara sirkuler, dan pembuangan yang tepat juga merupakan bagian dari 生产管理.'
    ],
    optionsJa: [
      '管理(かんり)とは、経営目的(けいえいもくてき)に沿って、種々の資源(しゅじゅしげん)を適切(てきせつ)に計画(けいかく)・運用(うんよう)し、統制(とうせい)する手続(てつづき)や活動(かつどう)である。',
      '生産管理(せいさんかんり)の重要(じゅうよう)な活動(かつどう)として、QCD有关的管理(かんり)がある。',
      'SDCAサイクル(える) adalah proses di mana P dari PDCAサイクル digantikan oleh S dari Simplify.',
      '廃棄物の発生(はいきぶつはっせい)を抑制(よくせい)し、资源(しげん)の循環的利用(じゅんかんてきりよう)和適正(てきせい)な処分(しょぶん)有关的管理(かんり) juga merupakan bagian dari 生产管理.'
    ],
    optionsId: [
      'Manajemen adalah prosedur dan kegiatan untuk perencanaan, pengoperasian, dan pengendalian berbagai sumber daya sesuai dengan tujuan manajemen.',
      'Kegiatan penting dalam manajemen produksi adalah manajemen terkait QCD.',
      'SDCA cycle adalah proses di mana P dari PDCA cycle diganti dengan S dari Simplify.',
      'Manajemen terkait pencegahan limbah, penggunaan sumber daya secara sirkuler, dan pembuangan yang tepat juga merupakan bagian dari manajemen produksi.'
    ],
    correctIndex: 2,
    explanation: 'SDCAサイクル adalah standarisasi PDCA, di mana P (Plan) diganti dengan S (Standardize). SDCA bukan menggantikan P dengan S dari Simplify, melainkan merupakan siklus standarisasi dari PDCA.',
    explanationJa: 'SDCAサイクル(える) adalah standardization dari PDCA, di mana P (Plan) diganti dengan S (Standardize). SDCA bukan menggantikan P dengan S dari Simplify.',
    explanationId: 'SDCA cycle adalah standarisasi dari PDCA, di mana P (Plan) diganti dengan S (Standardize). SDCA bukan pengganti P dengan S dari Simplify, melainkan merupakan siklus standarisasi dari PDCA.'
  },
  {
    id: 2,
    section: 'gino2',
    question: '問題2. 方法研究に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題2. 方法研究(ほうほうけんきゅう)に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 2. Manakah deskripsi yang paling tepat mengenai 方法研究 (Studi Metode)?',
    options: [
      'Metode untuk mengevaluasi efisiensi pelaksanaan metode kerja atau metode produksi dan menetapkan waktu standar.',
      'Menetapkan pekerjaan standar dan waktu standar melalui analisis dan perbaikan metode kerja.',
      'Membagi pekerjaan menjadi elemen kerja atau elemen gerakan dan mengukur waktu yang diperlukan untuk menyelesaikan pekerjaan yang dibagi.',
      'Menganalisis metode kerja atau metode produksi, standardisasi, integrasi untuk merancang dan meningkatkan proses produksi.'
    ],
    optionsJa: [
      '作業(さぎょう)または製造方法(せいぞうほうほう)の実施効率(じっしきこうりつ)の評価(ひょうか)および標準時間(ひょうじゅんじかん)を設定(せってい)するための手法(しゅほう)。',
      '作業方法(さぎょうほうほう)の分析(ぶんせき)・改善(かいぜん)によって、標準作業(ひょうじゅんさぎょう)と標準時間(ひょうじゅんじかん)を設定(せってい)し、この標準(ひょうじゅん)を維持(い)する一連(いちれん)の...',
      '作業を要素作業(ようそさぎょう)または要素動作(ようそどうさ)に分割(ぶんかつ)し、その分割(ぶんかつ)した作業(さぎょう)を遂行(すいこう)するの所需(よう)時間(じかん)を測定(そくてい)する...',
      '作業(さぎょう)または製造方法(せいぞうほうほう)を分析(ぶんせき)して、標準化(ひょうじゅんか)、総合化(そうごうか)によって作業方法(さぎょうほうほう)または製造工程(せいぞうこうてい)を設計(せっけい)・改善(かいぜん)するため...'
    ],
    optionsId: [
      'Metode untuk mengevaluasi efisiensi pelaksanaan metode kerja atau metode produksi dan menetapkan waktu standar.',
      'Menetapkan pekerjaan standar dan waktu standar melalui analisis dan perbaikan metode kerja.',
      'Membagi pekerjaan menjadi elemen kerja atau elemen gerakan dan mengukur waktu yang diperlukan untuk menyelesaikan pekerjaan yang dibagi.',
      'Menganalisis metode kerja atau metode produksi, melalui standardisasi dan integrasi untuk merancang dan meningkatkan proses produksi.'
    ],
    correctIndex: 3,
    explanation: '方法研究 adalah menganalisis metode kerja atau produksi, melalui standardisasi dan integrasi untuk merancang dan meningkatkan proses produksi.',
    explanationJa: '方法研究(ほうほうけんきゅう) adalah menganalisis metode kerja atau produksi, melalui standardisasi(ひょうじゅんか)和 integrasi(そうごうか) untuk merancang(せっけい)和 meningkatkan(かいぜん) proses produksi.',
    explanationId: 'Studi Metode adalah menganalisis metode kerja atau produksi, melalui standardisasi dan integrasi untuk merancang dan meningkatkan proses produksi.'
  },
  {
    id: 3,
    section: 'gino2',
    question: '問題3. サーブリッグ分析に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題3. サーブリッグ分析(さらぶりっぐぶんせき)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 3. Manakah deskripsi yang paling tidak tepat mengenai サーブリッグ分析 (Analisis Servicve)?',
    options: [
      'Analisis サーブリッグ adalah metode analisis yang lebih detail dibandingkan analisis proses pekerja.',
      'Untuk pekerjaan yang hanya menggunakan tangan dominan, hanya menganalisis gerakan tangan dominan.',
      'Untuk pekerjaan yang menggunakan beberapa alat, dapat digunakan untuk meningkatkan gerakan mencari dan mengganti alat.',
      'Untuk gerakan keterlambatan yang tidak dapat dihindari, dapat diterapkan prinsip ekonomi gerakan untuk perbaikan.'
    ],
    optionsJa: [
      'サーブリッグ分析(さらぶりっぐぶんせき)は、作業者工程分析(さぎょうしゃこうていぶんせき)よりも更(さら)에 detail(しょうさい)에 분석(ぶんせき)하는手法(しゅほう)이다.',
      '利き手(ききて)だけを使っている作業(さぎょう)に対しては、利き手(ききて)の動き(うごき)だけを分析(ぶんせき)する。',
      '複数(ふくすう)の工具(こうぐ)を使う作業(さぎょう)に対しては、探す(さがす)や、持ち換える(こう)動作(どうさ)を改善(かいぜん)するために用いる(もち)ことができる。',
      '避けられない(さ人不)遅延(ちえん)の動作(どうさ)に対しては、動作経済(どうさけいざい)の原則(げんそく)を適用(てきよう)し改善(かいぜん)することができる。'
    ],
    optionsId: [
      'Analisis Servicve adalah metode analisis yang lebih detail dibandingkan analisis proses pekerja.',
      'Untuk pekerjaan yang hanya menggunakan tangan dominan, hanya menganalisis gerakan tangan dominan.',
      'Untuk pekerjaan yang menggunakan beberapa alat, dapat digunakan untuk meningkatkan gerakan mencari dan mengganti alat.',
      'Untuk gerakan keterlambatan yang tidak dapat dihindari, dapat diterapkan prinsip ekonomi gerakan untuk perbaikan.'
    ],
    correctIndex: 1,
    explanation: '对于只使用利き手的工作，应该是分析两只手的动作，而不是只分析利き手。',
    explanationJa: '利き手(ききて)だけを使っている作业(さぎょう)に対しては、两只手(りょうて)の动作(どうさ)を分析(ぶんせき)する，而不是只分析利き手。',
    explanationId: 'Untuk pekerjaan yang hanya menggunakan tangan dominan, seharusnya menganalisis gerakan kedua tangan, bukan hanya tangan dominan.'
  },
  {
    id: 4,
    section: 'gino2',
    question: '問題4. 時間研究に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題4. 時間研究(じかんけんきゅう)に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 4. Manakah deskripsi yang paling tepat mengenai 時間研究 (Studi Waktu)?',
    options: [
      'DM単位 adalah satuan pengukuran dalam metode stopwatch, dan kalkulasi agregat lebih kompleks dibandingkan dengan pengukuran dalam detik.',
      'Metode continue dalam metode stopwatch adalah metode untuk mengembalikan stopwatch ke 0 setiap langkah dan mendapatkan waktu setiap langkah secara langsung.',
      'Jika pekerjaan yang diamati lebih cepat dari pace standar, koefisien rating akan bernilai lebih kecil dari 100.',
      'Dalam perbaikan melalui studi waktu, fokus pada elemen kerja dengan variasi besar dan menganalisis gerakan secara efektif untuk menentukan mengapa variasi besar terjadi.'
    ],
    optionsJa: [
      'ストップウォッチ法(ほう)の測定単位(そくていたんい)であるDM単位(たんい)は、秒単位(びょうたんい)での測定(そくてい)よりも集計(しゅうけい)の計算(けいさん)가複雑(ふくざつ)となる。',
      'ストップウォッチ法(ほう)の測定方法(そくていほうほう)である継続法(けいぞくほう)は、ステップごとにストップウォッチを0に戻(もど)して、各ステップ(プ)の時間(じかん)を直接求(ちょくせくと)める方法(ほうほう)である。',
      '観測(かんそく)した作業(さぎょう)が標準的(ひょうじゅんてき)な作業ペース(たい)より速(はや)い場合(ばあい)におけるレイティング係数(けいすら)は、100보다도小(ちい)さな値(あたい)となる。',
      '時間研究(じかんけんきゅう)による改善(かいぜん)において、バラツキが大(おお)きい要素作業(ようそさぎょう)에着目(ちゃくもく)し、なぜバラツキが大(おお)きいのかを考察(けんとう)するため...'
    ],
    optionsId: [
      'DM unit adalah satuan pengukuran dalam metode stopwatch, dan kalkulasi agregat lebih kompleks dibandingkan dengan pengukuran dalam detik.',
      'Metode continue dalam metode stopwatch adalah metode untuk mengembalikan stopwatch ke 0 setiap langkah dan mendapatkan waktu setiap langkah secara langsung.',
      'Jika pekerjaan yang diamati lebih cepat dari pace standar, koefisien rating akan bernilai lebih kecil dari 100.',
      'Dalam perbaikan melalui studi waktu, fokus pada elemen kerja dengan variasi besar dan untuk menentukan mengapa variasi besar terjadi, analisis gerakan secara efektif.'
    ],
    correctIndex: 3,
    explanation: 'Dalam studi waktu, fokus pada elemen kerja dengan variasi besar dan melakukan analisis gerakan secara efektif adalah benar.',
    explanationJa: '時間研究(じかんけんきゅう)による改善(かいぜん)において、要素作業(ようそさぎょう)의 variasi(バラツキ)가 크고, 分析動作(どうさぶんせき)을 효과적(こうかてき)으로 수행하는 것이 정확하다.',
    explanationId: 'Dalam studi waktu, fokus pada elemen kerja dengan variasi besar dan melakukan analisis gerakan secara efektif adalah benar.'
  },
  {
    id: 5,
    section: 'gino2',
    question: '問題5. 作業改善の進め方に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題5. 作業改善(さぎょうかいぜん)の進(すす)め方(かた)に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 5. Manakah deskripsi yang paling tepat mengenai cara melaksanakan 作業改善 (Perbaikan Kerja)?',
    options: [
      'Prinsip rasionalisasi adalah istilah kolektif untuk standardisasi, simplifikasi, dan spesialisasi, dan merupakan cara berpikir untuk melakukan aktivitas perusahaan secara efisien.',
      'Prinsip ekonomi gerakan diklasifikasikan menjadi 3 prinsip: prinsip gerakan yang diperlukan, prinsip gerakan yang tidak diperlukan, dan prinsip gerakan yang tidak jelas diperlukan.',
      'Dalam perbaikan kerja, strategi yang mengubah urutan kerja tidak dianjurkan.',
      'H dalam 5W1H adalah horizontal expansion, perluasan horizontal dari strategi perbaikan.'
    ],
    optionsJa: [
      '合理化(ごうりか)の原則(げんそく)とは、標準化(ひょうじゅんか)、単純化(たんじゅんか)、専門化(せんもんか)の総称(そうしょう)であり、企業活動(きぎょうかつどう)を効率的(こうりつてき)に行う(おこな)ための考(かんが)え方(かた)である。',
      '動作経済(どうさけいざい)の原則(げんそく)は、必要(ひつよう)な動作(どうさ)に関する原則、不必要(ふひつよう)な動作(どうさ)に関する原則、必要性(ひつようせい)가 불명(ふめい)한 동작(どうさ)に関する原則의 3가지로 분류(ぶんるいせいり)整理(せいり)されている。',
      '作業(さぎょう)の改善(かいぜん)では、作業順序(さぎょうじゅんじょ)를 바꾸어버리는(いれかえてしまう)ような方策(ほうさく)은 좋(この)ましくない(よくましくない)。',
      '5W1HにおけるHは、改善方策(かいぜんほうさく)の水平展開(すいへいてんかい)、horizontal expansionのHである。'
    ],
    optionsId: [
      'Prinsip rasionalisasi adalah istilah kolektif untuk standardisasi, simplifikasi, dan spesialisasi, dan merupakan cara berpikir untuk melakukan aktivitas perusahaan secara efisien.',
      'Prinsip ekonomi gerakan diklasifikasikan menjadi 3: prinsip gerakan yang diperlukan, prinsip gerakan yang tidak diperlukan, dan prinsip gerakan yang tidak jelas diperlukan.',
      'Dalam perbaikan kerja, strategi yang mengubah urutan kerja tidak dianjurkan.',
      'H dalam 5W1H adalah horizontal expansion, perluasan horizontal dari strategi perbaikan.'
    ],
    correctIndex: 0,
    explanation: 'Prinsip rasionalisasi adalah istilah kolektif untuk standardisasi, simplifikasi, dan spesialisasi.',
    explanationJa: '合理化(ごうりか)の原則(げんそく)とは、標準化(ひょうじゅんか)、単純化(たんじゅんか)、専門化(せんもんか)の総称(そうしょう)である。',
    explanationId: 'Prinsip rasionalisasi adalah istilah kolektif untuk standardisasi, simplifikasi, dan spesialisasi.'
  },
  {
    id: 6,
    section: 'gino2',
    question: '問題6. 作業改善の活動に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題6. 作業改善(さぎょうかいぜん)の活動(かつどう)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 6. Manakah deskripsi yang paling tidak tepat mengenai kegiatan 作業改善 (Perbaikan Kerja)?',
    options: [
      'Karena kotak suku cadang berada di luar area kerja maksimum operator, sehingga menimbulkan berjalan saat mengambil suku cadang, jadi memindahkan lokasi kotak suku cadang ke dalam area kerja maksimum.',
      'Untuk mencegah tabrakan antara forklift di jalur pengiriman, dan memperlancar aliran barang, ditetapkan aturan satu arah.',
      'Alat yang digunakan bersama oleh beberapa operator saat persiapan disimpan oleh operator terakhir, namun ditempatkan di lokasi yang mudah dijangkau oleh semua operator.',
      'Dalam pekerjaan inspeksi kualitas, kesalahan adjudicator yang menganggap produk tidak memenuhi syarat sebagai memenuhi syarat disebut kesalahan tipo I.'
    ],
    optionsJa: [
      '部品箱(ぶひんばこ)이作業者(さぎょうしゃ)의最大作業域(さいだいさぎょういき)を超える位置(いち)にあるため、部品(ぶひん)을取得(と)する際に歩行(ほこう)が発生(はっせい)するので部品箱(ぶひんばこ)의 배치(はいち)를最大作業域内(さいだいさぎょういきない)에変更(へんこう)する。',
      '搬送通路(はんそうつうろ)でのすれ違い時(じ)の中央台車(ちゅうおうだいしゃ)同士の干渉(かんしょう)을防止(ふせ)し、モノの流れ(なが)が良(よ)くなるため、台車(だいしゃ)使用時(しようじ)는一方通行(いっぽうつうこう)のルール(るーる)を設定(せってい)する。',
      '複数作業者(ふくすうさぎょうしゃ)가準備作業(じゅんびさぎょう)時に共有(きょうゆう)して使用(しよう)する工具(こうぐ)은最後(さいご)使用者(しようしゃ)가保管管理(ほかんかんり)しているが、各作業者(かくさぎょうしゃ)가取(と)りに行(い)きやすい場所(ばしょ)에工具置台(こうぐお)を作製(さくせい)하여保管管理(ほかんかんり)한다.',
      '品質検査(ひんしつけんさ)の作業(さぎょう)において、不適合品(ふてきごうひん)であるにもかかわらず適合品(てきごうひん)として判断(はんだん)する生産者危険(せいさんしゃきけん)とも呼(まね)第一種(だいいっしゅ)の誤り(あやまり)である。'
    ],
    optionsId: [
      'Karena kotak suku cadang berada di luar area kerja maksimum operator, sehingga menimbulkan berjalan saat mengambil suku cadang, jadi memindahkan lokasi kotak suku cadang ke dalam area kerja maksimum.',
      'Untuk mencegah tabrakan antara forklift di jalur pengiriman, dan memperlancar aliran barang, ditetapkan aturan satu arah.',
      'Alat yang digunakan bersama oleh beberapa operator saat persiapan disimpan oleh operator terakhir, namun ditempatkan di lokasi yang mudah dijangkau oleh semua operator.',
      'Dalam pekerjaan inspeksi kualitas, kesalahan adjudicator yang menganggap produk tidak memenuhi syarat sebagai memenuhi syarat disebut kesalahan tipo I.'
    ],
    correctIndex: 3,
    explanation: 'Kesalahan adjudicator yang menganggap produk tidak memenuhi syarat sebagai memenuhi syarat disebut 生产者危険 (risiko producer), bukan 誤り (kesalahan).',
    explanationJa: '品質検査(ひんしつけんさ)에서 不適合品(ふてきごうひん)을 적합品(てきごうひん)으로 판단(はんだん)하는 것은 生産者危険(せいさんしゃきけん)이라 한다.',
    explanationId: 'Dalam pekerjaan inspeksi kualitas, kesalahan adjudicator yang menganggap produk tidak memenuhi syarat sebagai memenuhi syarat disebut risiko producer.'
  },
  {
    id: 7,
    section: 'gino2',
    question: '問題7. 5S活動に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題7. 5S活動(かつどう)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 7. Manakah deskripsi yang paling tidak tepat mengenai kegiatan 5S?',
    options: [
      'Dalam kegiatan 5S, aturan tentang 躾 (pembinaan) memiliki alasan, jadi tidak boleh diubah.',
      'Untuk mempromosikan dan mempertahankan kegiatan 5S, pengawas membuat checklist dengan menentukan tanggal, frekuensi, item inspeksi, dan standar evaluasi, dan patroli tempat kerja.',
      'Untuk mengaktifkan kegiatan 5S, evaluasi berdasarkan efek, inovasi, dan usaha dari kegiatan, dan lakukan evaluasi melalui self-inspeksi dan inspeksi mutual, dan siapkan sistem penghargaan.',
      'Untuk melaksanakan kegiatan 5S selama 1 tahun dengan tepat, pemimpin 5S merangkum kegiatan tahun lalu, mengklarifikasi tugas, menetapkan kebijakan dasar dan tugas prioritas untuk tahun ini, dan mempublikasikan ke tempat kerja.'
    ],
    optionsJa: [
      '5S活動(かつどう)において躾(しつけ)に関するルール(るーる)은理由(りゆう)가 있어서決(き)めているので、変更(へんこう)してはならない。',
      '5S活動(かつどう)の推進維持(すいしんいじ)のため、巡回者(じゅんかいしゃ)가日時(にちじ)、頻度(ひんど)、チェック項目(ひょうかきじゅん)、評価基準(ひょうかきじゅん)을決定(けってい)하고チェックリスト(ちぇぐりすと)를 作製(さくせい)し、職場(しょくば)を巡回(じゅんかい)する。',
      '5S活動(かつどう)の活性化(かっせいか)のため、活動(かつどう)の効果(こうか)、工夫(くふう)、努力(どりょく)을評価基準(ひょうかきじゅん)とし、自己点検(じこてんけん)、相互点検(そうごてんけん)などにより評価(ひょうか)を行(おこな)い表彰(ひょうしょう)する制度(せいど)를設(もう)ける。',
      '1年間(ねんかん)の5S活動(かつどう)を適切(てきせつ)に実施(じっし)するため、5S推進リーダー(すいしんりーだー)는昨年度(さくねんど)の活動(かつどう)を総括(そうかつ)して課題(かだい)を示明(めいかくか)し、本年度(ほんねんど)の基本方針(きほんほうしん)や重点課題(じゅうてんかだい)を設定(せってい)し職場(しょくば)에公表(こうひょう)し周知(しゅうち)する。'
    ],
    optionsId: [
      'Dalam kegiatan 5S, aturan tentang pembiayaan (pembinaan) memiliki alasan, jadi tidak boleh diubah.',
      'Untuk mempromosikan dan mempertahankan kegiatan 5S, pengawas membuat checklist dengan menentukan tanggal, frekuensi, item inspeksi, dan standar evaluasi, dan patroli tempat kerja.',
      'Untuk mengaktifkan kegiatan 5S, evaluasi berdasarkan efek, inovasi, dan usaha dari kegiatan, dan lakukan evaluasi melalui self-inspeksi dan inspeksi mutual, dan siapkan sistem penghargaan.',
      'Untuk melaksanakan kegiatan 5S selama 1 tahun dengan tepat, pemimpin 5S merangkum kegiatan tahun lalu, mengklarifikasi tugas, menetapkan kebijakan dasar dan tugas prioritas untuk tahun ini, dan mempublikasikan ke tempat kerja.'
    ],
    correctIndex: 0,
    explanation: 'Aturan 躾 dalam 5S bisa diubah sesuai kebutuhan, tidak boleh diubah adalah tidak tepat.',
    explanationJa: '5S活動(かつどう)에서의 躾(しつけ)에 관한 규칙(ルール)은 필요(ひつよう)에 따라 변경(へんこう)될 수 있으므로, 변경하면 안 된다는 것은 올바르지 않다.',
    explanationId: 'Aturan tentang pembinaan (躾) dalam 5S dapat diubah sesuai kebutuhan, jadi pernyataan bahwa tidak boleh diubah adalah tidak tepat.'
  },
  {
    id: 8,
    section: 'gino2',
    question: '問題8. 工程管理に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題8. 工程管理(こうていかんり)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 8. Manakah deskripsi yang paling tidak tepat mengenai 工程管理 (Manajemen Proses)?',
    options: [
      '基準日程(きじゅんにってい) adalah periode standar yang diperlukan untuk kegiatan produksi.',
      'QCD dikatakan sebagai 3要素(ようそ) kebutuhan untuk mencapai kepuasan pelanggan.',
      'Untuk membuat rencana produksi dengan tingkat akurasi yang tinggi, penting untuk meningkatkan reliabilitas informasi pesanan dan akurasi data perencanaan.',
      'Jika tanggal pengiriman pesanan lebih panjang dari periode produksi, необходимо сделать предварительный заказ (事前手配).'
    ],
    optionsJa: [
      '基準日程(きじゅんにってい)は、生産活動(せいさんかつどう)に必要な標準的(ひょうじゅんてき)な期間(きかん)のことである。',
      'QCDは、顧客満足(かかくまんぞく)を得るための需要(え)的(じゅよう)の3要素(ようそ)という言葉(い)으로도 있다.',
      '精度(せいど)の高い生産計画(せいさんけいかく)を立てる(た)ためには、受注情報(じゅちゅうじょうほう)의頼性(らいせい)이나計画資料(けいかくしりょう)の精度(せいど)를 향상(こうじょう)させることが重要(じゅうよう)이다.',
      '受注納期(じゅちゅうのうき)이生産期間(せいさんきかん)より長(なが)い場合(ばあい)에는 먼저 준비(せんこうてはい)를 해야 한다.'
    ],
    optionsId: [
      'Jadwal standar adalah periode standar yang diperlukan untuk kegiatan produksi.',
      'QCD dikatakan sebagai 3 elemen permintaan untuk mencapai kepuasan pelanggan.',
      'Untuk membuat rencana produksi dengan akurasi tinggi, penting untuk meningkatkan reliabilitas informasi pesanan dan akurasi data perencanaan.',
      'Jika tanggal pengiriman pesanan lebih panjang dari periode produksi, perlu melakukan persiapan sebelumnya.'
    ],
    correctIndex: 3,
    explanation: 'Jika tanggal pengiriman lebih panjang dari periode produksi, bukan perlu memesan lebih awal, melainkan物流 (logistics) yang perlu diatur.',
    explanationJa: '受注納期(じゅちゅうのうき)이生産期間(せいさんきかん)보다 길면, 오히려 구매(こうにゅう)를 미루는(おく) 것이 일반적이다.',
    explanationId: 'Jika tanggal pengiriman lebih panjang dari periode produksi, justru membeli lebih lambat adalah umum.'
  },
  {
    id: 9,
    section: 'gino2',
    question: '問題9. 少種多量生産に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題9. 少種多量生産(しょうしゅたりょうせいさん)に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 9. Manakah deskripsi yang paling tepat mengenai 少種多量生産 (Produksi Banyak Varian Sedikit)?',
    options: [
      'Dari aspek material, karena jenis komponen meningkat, beban persediaan meningkat, dan jika perubahan model sering, produktivitas menurun.',
      'Ini adalah bentuk produksi di mana produksi batch kecil atau produksi individual.',
      'Ketika volume produksi menurun, karena biaya awal besar, ada kemungkinan kesulitan pengembalian investasi peralatan, sehingga diperlukan perencanaan dan persiapan yang matang.',
      'Karena prosedur produksi dari material dan komponen ke produk sangat beragam, aliran proses produksi berbeda untuk setiap produk, dan aliran proses juga rumit.'
    ],
    optionsJa: [
      '資材面(しざいめん)からは部品(ぶひん)の種類(しゅるい)が多(おお)くなるため棚卸資産(たなおろししさん)の負担(ふたん)が増(ふ)え、機種(きしゅ)chuk切换(きり)가頻発(ひんぱつ)하면生産性(せいさんせい)이低下(ていか)する.',
      '少量(しょうりょう)のロット生産(せいさん)や個別生産(こべつせいさん)における生産形態(せいさんけいたい)である.',
      '生産量(せいさんりょう)が減(へ)少(しょう)した場合、イニシャルコスト(いにしゃるこすと)가大き(おお)いために設備投資(せつびとうし)の回収(かいしゅう)가困難(こんなん)になる可能性(かのうせい)もあるため、周到(しゅうとう)な計画(けいかく)와 준비(じゅんび)が必要(ひつよう)になる.',
      '材料(ざいりょう)や部品(ぶひん)から製品(せいひん)を生産(せいさん)する手順(てじゅん)が多様(たよう)であるため、生産工程(せいさんこうてい)の流(なが)れはそれぞれの製品により異(こと)なり、工程(こうてい)の流(なが)れも錯綜(さくそう)する.'
    ],
    optionsId: [
      'Dari aspek material, karena jenis komponen meningkat, beban persediaan meningkat, dan jika perubahan model sering, produktivitas menurun.',
      'Ini adalah bentuk produksi di mana produksi batch kecil atau produksi individual.',
      'Ketika volume produksi menurun, karena biaya awal besar, ada kemungkinan kesulitan pengembalian investasi peralatan, sehingga diperlukan perencanaan dan persiapan yang matang.',
      'Karena prosedur produksi dari material dan komponen ke produk sangat beragam, aliran proses produksi berbeda untuk setiap produk, dan aliran proses juga rumit.'
    ],
    correctIndex: 2,
    explanation: 'Ketika volume produksi menurun, karena biaya awal besar, ada kemungkinan kesulitan pengembalian investasi peralatan.',
    explanationJa: '生産量(せいさんりょう) 감소할 때, 이니셜コスト(いにしゃるこすと)가 크기 때문에 투자 회수(かいしゅう)가 어려워질 수 있다.',
    explanationId: 'Ketika volume produksi menurun, karena biaya awal besar, ada kemungkinan kesulitan pengembalian investasi peralatan.'
  },
  {
    id: 10,
    section: 'gino2',
    question: '問題10. 製品の流し方による分類の記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題10. 製品(せいひん)の流(なが)し方(かた)による分類(ぶんるい)の記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 10. Manakah deskripsi yang paling tidak tepat mengenai klasifikasi berdasarkan cara aliran produk?',
    options: [
      'Dalam produksi batch, semakin besar ukuran batch,的趋势(とうせい)是生產期間(せいさんきかん) menjadi lebih pendek.',
      'Produksi batch adalah bentuk produksi antara produksi individual dan produksi kontinu.',
      'Tidak ekonomis untuk memasukkan jalur peralatan khusus ke dalam proses produksi individual.',
      'Produksi kontinu umumnya merupakan aliran tipe flow shop dari sudut pandang tata letak berdasarkan produk.'
    ],
    optionsJa: [
      'ロット生産(せいさん)において、ロットサイズ(ろっとさいず)が大(おお)きくなるにつれて、生産期間(せいさんきかん)は短(みじか)くなる傾向(けいこう)がある.',
      'ロット生産(せいさん)은個別生産(こべつせいさん)와連続生産(れんぞくせいさん)の中間的(ちゅうかんてき)な生産形態(せいさんけいたい)である.',
      '個別生産(こべつせいさん)の生産工程(せいさんこうてい)에専用設備(せんようせつび)라인(らいん)을 넣는 것은 경제적(けいざいてき)으로 bukan이다.',
      '連続生産(れんぞくせいさん)은、製品別配置(せいひんべつはいち)の観点(かんてん)から可以看到(一般に-flow shop-type)이다.'
    ],
    optionsId: [
      'Dalam produksi batch, semakin besar ukuran batch, kecenderungan periode produksi menjadi lebih pendek.',
      'Produksi batch adalah bentuk produksi antara produksi individual dan produksi kontinu.',
      'Tidak ekonomis untuk memasukkan jalur peralatan khusus ke dalam proses produksi individual.',
      'Produksi kontinu umumnya merupakan aliran tipe flow shop dari sudut pandang tata letak berdasarkan produk.'
    ],
    correctIndex: 0,
    explanation: 'Dalam produksi batch, semakin besar ukuran batch, Lead Time (waktu tunggu) menjadi lebih panjang.',
    explanationJa: 'ロット生産において、ロットサイズが大きくなるにつれて、リードタイム(waiting time)는 오히려 길어진다.',
    explanationId: 'Dalam produksi batch, semakin besar ukuran batch, lead time menjadi lebih panjang, bukan lebih pendek.'
  },
  {
    id: 11,
    section: 'gino2',
    question: '問題11. 日程計画の項目と以下の項目内容との組合せとして最も適切なものは、次のうちどれか。',
    questionJa: '問題11. 日程計画(にっていけいかく)の項目(こうもく)와以下の項目内容(くこうもくないよう)와의 조합(くみあい)として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 11. Kombinasi yang paling tepat antara item jadwal dan konten item berikut adalah?',
    options: [
      '1. 番手を指定(はんていを指定) 2. バックワード法 3. 順序づけ法',
      '1. 基準日程(きじゅんにってい) 2. フォワード法 3. 順序づけ法',
      '1. 基準日程(きじゅんにってい) 2. バックワード法 3. ディスパッチング法',
      '1. 番手を指定(はんていを指定) 2. フォワード法 3. ディスパッチング法'
    ],
    optionsJa: [
      '1. 手配番数(てはいばんすう) 2. バックワード法(ばっくわードほう) 3. 順序づけ法(じゅんじょづけほう)',
      '1. 基準日程(きじゅんにってい) 2. フォワード法(ふぉわードほう) 3. 順序づけ法(じゅんじょづけほう)',
      '1. 基準日程(きじゅんにってい) 2. バックワード法(ばっくわードほう) 3. ディスパッチング法(でぃすぱっちんぐほう)',
      '1. 手配番数(てはいばんすう) 2. フォワード法(ふぉわードほう) 3. ディスパッチング法(でぃすぱっちんぐほう)'
    ],
    optionsId: [
      '1. 指定 nomor pengorderan 2. Metode backward 3. Metode pengurutan',
      '1. Jadwal standar 2. Metode forward 3. Metode pengurutan',
      '1. Jadwal standar 2. Metode backward 3. Metode dispatching',
      '1. 指定 nomor pengorderan 2. Metode forward 3. Metode dispatching'
    ],
    correctIndex: 2,
    explanation: '1. 基準日程 adalah jadwal standar, 2. バックワード法 adalah metode backward, 3. ディスパッチング法 adalah metode dispatching.',
    explanationJa: '1. 基準日程(きじゅんにってい)은 표준 일정, 2. バックワード法(ばっくわードほう)은 역방향 법, 3. ディスパッチング法(でぃすぱっちんぐほう)은 디스패칭 법이다.',
    explanationId: '1. Jadwal standar, 2. Metode backward, 3. Metode dispatching.'
  },
  {
    id: 12,
    section: 'gino2',
    question: '問題12. 製作手配に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題12. 製作手配(せいさくてはい)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 12. Manakah deskripsi yang paling tidak tepat mengenai 製作手配 (Persiapan Produksi)?',
    options: [
      '製作手配(せいさくてはい)는 管理部門(かんりぶもん)에서 各担当部門(かくたんとうぶもん)에 해당(がいとう)하는 전표(でんぴょう)를 발행(はっこう) 및 배포(はいふ)함으로써, 各担当部門(かくたんとうぶもん)이 사전 준비(じぜんじゅんび)를 하도록 하는 활동이다.',
      '作業予定表(さぎょうよていひょう)은 部門別(ぶもんべつ) atau 工程別(こうていべつ)의 일정(スケジュール)을 지시(しじ)하기 위해使用的(しようする) 문서(もうひょう)이다.',
      '製作手配(せいさくてはい) 이후의 업무(ぎょうむ)는 현장 작업(げんばさぎょう)에 밀착(みっちゃく)된 처리가 필요(ひつよう)하기 때문에, 工程管理(こうていかんり)의 중심 업무(ちゅうしんぎょうむ)는 제조 현장(せいぞうげんば)으로 이전(うつ)한다.',
      '창고(そうこ)에서 材料(ざいりょう)를 引出(ひら)할 때는 移動票(いどうひょう)을 사용(しよう)하여 지시(しじ)한다.'
    ],
    optionsJa: [
      '製作手配(せいさくてはい)は、管理部門(かんりぶもん)から各担当部門(かくたんとうぶもん)へ該当(がいとう)する伝票(でんぴょう)を発行(はっこう)および配布(はいふ)することにより、各担当部門(かくたんとうぶもん)に事前準備(じぜんじゅんび)をさせる活動(かつどう)である。',
      '作業予定表(さぎょうよていひょう)은 部門別(ぶもんべつ)あるいは工程別(こうていべつ)のスケジュール(すけじゅーる)을指示(しじ)するために用(もち)いる帳票(ちょうひょう)である。',
      '製作手配(せいさくてはい)以降(いこう)の業務(ぎょうむ)は、現場作業(げんばさぎょう)に密着一(みっちゃく)した処理(しょり)が必要(ひつよう)なために、工程管理(こうていかんり)の中心業務(ちゅうしんぎょうむ)は製造現場(せいぞうげんば)に移(うつ)る。',
      '倉庫(そうこ)から資材(しざい)を払(はら)い出(だ)すときにあた, 移動票(いどうひょう)を用(もち)いて指示(しじ)する。'
    ],
    optionsId: [
      'Pembuatan produksi dilakukan dengan menerbitkan dan mendistribusikan slip yang relevan dari departemen manajemen ke setiap departemen terkait, untuk membuat setiap departemen persiapan di awal.',
      'Jadwal kerja adalah formulir yang digunakan untuk menunjukkan jadwal departemen atau proses untuk memberikan instruksi.',
      'Bisnis setelah produksi dan distribusi diikat ke pemrosesan yang diperlukan di tempat kerja, jadi pusat manajemen proses bergerak ke lantai produksi.',
      'Saat mengeluarkan material dari gudang, gunakan slip bergerak untuk instruksi.'
    ],
    correctIndex: 3,
    explanation: 'Menurut 分納(ぶんのう) 방법, 材料(ざいりょう) dikeluarkan dari gudang(そうこ) menggunakan 移動票(いどうひょう) bukan.',
    explanationJa: '창고에서 자재를 지급할 때는 현금 지급票据(げんきんきゅうふひょう)를 사용한다.',
    explanationId: 'Ketika mengeluarkan material dari gudang, menggunakan slip bergerak untuk instruksi, pernyataan ini tidak tepat.'
  },
  {
    id: 13,
    section: 'gino2',
    question: '問題13. 連続生産において一般に生産数量の管理に利用される進捗管理の調査方法として最も適切なものは、次のうちどれか。',
    questionJa: '問題13. 連続生産(れんぞくせいさん)において一般(いっぱん)에 생산数量(せいさんすうりょう)의 관리(かんり)에 이용(りよう)되는進捗管理(しんちょくかんり)의 조사 방법(ちょうさほうほう)으로서 가장 적절(てきせつ)한 것은 다음 중 어느 것인가.',
    questionId: 'Soal 13. Metode investigasi manajemen kemajuan yang paling tepat untuk manajemen jumlah produksi dalam produksi kontinu adalah?',
    options: [
      '差立盤(さしだてばん)',
      'カムアップシステム',
      '流動数曲線(りゅうどうすうきょくせん)',
      '製造台帳(せいぞうだいちょう)による進度票(しんどひょう)'
    ],
    optionsJa: [
      '差立盤(さしだてばん)',
      'カムアップシステム(かむあっぷしすてむ)',
      '流動数曲線(りゅうどうすうきょくせん)',
      '製造台帳(せいぞうだいちょう)による進度票(しんどひょう)'
    ],
    optionsId: [
      'Papan dispaching',
      'Sistem camshaft',
      'Grafik alir',
      'Laporan progres melalui buku besar produksi'
    ],
    correctIndex: 2,
    explanation: '流動数曲線 (Grafik Alir) adalah metode yang digunakan untuk mengelola jumlah produksi dalam produksi kontinu.',
    explanationJa: '流動数曲線(りゅうどうすうきょくせん)은 연속 생산에서 생산 수량을 관리하는 데 사용되는 방법이다.',
    explanationId: 'Grafik Alir adalah metode yang digunakan untuk mengelola jumlah produksi dalam produksi kontinu.'
  },
  {
    id: 14,
    section: 'gino2',
    question: '問題14. 生産性の測定指標に関する項目と以下の項目内容との組合せとして最も適切なものは、次のうちどれか。',
    questionJa: '問題14. 生産性(せいさんせい)の測定指標(そくていひょうじゅん)에 관한 항목(こうもく)과 아래의 항목 내용(かこうもくないよう)의 조합(くみあい)으로서 가장 적절(てきせつ)한 것은 다음 중 어느 것인가.',
    questionId: 'Soal 14. Kombinasi yang paling tepat antara item indikator pengukuran produktivitas dan konten item berikut adalah?',
    options: [
      '1. 歩留率(ぶどまりりつ) 2. 稼働率(かどうりつ) 3. 作業能率(さぎょうのうりつ) 4. 操業度(そうぎょうど)',
      '1. 操業度(そうぎょうど) 2. 作業能率(さぎょうのうりつ) 3. 歩留率(ぶどまりりつ) 4. 生産性(せいさんせい)',
      '1. 歩留率(ぶどまりりつ) 2. 稼働率(かどうりつ) 3. 生産性(せいさんせい) 4. 操業度(そうぎょうど)',
      '1. 操業度(そうぎょうど) 2. 作業能率(さぎょうのうりつ) 3. 稼働率(かどうりつ) 4. 生産性(せいさんせい)'
    ],
    optionsJa: [
      '1. 歩留率(ぶどまりりつ) 2. 稼働率(かどうりつ) 3. 作業能率(さぎょうのうりつ) 4. 操業度(そうぎょうど)',
      '1. 操業度(そうぎょうど) 2. 作業能率(さぎょうのうりつ) 3. 歩留率(ぶどまりりつ) 4. 生産性(せいさんせい)',
      '1. 歩留率(ぶどまりりつ) 2. 稼働率(かどうりつ) 3. 生産性(せいさんせい) 4. 操業度(そうぎょうど)',
      '1. 操業度(そうぎょうど) 2. 作業能率(さぎょうのうりつ) 3. 稼働率(かどうりつ) 4. 生産性(せいさんせい)'
    ],
    optionsId: [
      '1. 歩留 rate 2. 稼働 rate 3. 作業能率 rate 4. 操業度',
      '1. 操業度 2. 作業能率 3. 歩留率 4. Produktivitas',
      '1. 歩留率 2. 稼働率 3. Produktivitas 4. 操業度',
      '1. 操業度 2. 作業能率 3. 稼働率 4. Produktivitas'
    ],
    correctIndex: 0,
    explanation: '1. 歩留率 =材料的消费率, 2. 稼働率 = 机械设备有效利用程度, 3. 作業能率 = 実績工数和标准工数的比率, 4. 操業度 = 工场整体生产能力或设备能力的利用率.',
    explanationJa: '1. 歩留率(ぶどまりりつ)=材料的消费率, 2. 稼働率(かどうりつ)=机械设备有效利用程度, 3. 作業能率(さぎょうのうりつ)=実績工数和標準工数的比率, 4. 操業度(そうぎょうど)=工场全体生产能力或设备能力的利用率.',
    explanationId: '1. 歩留率 = rasio konsumsi material, 2. 稼働率 = tingkat pemanfaatan efektif mesin dan peralatan, 3. 作業能率 = rasio jam kerja aktual dan standar, 4. 操業度 = tingkat pemanfaatan kapasitas produksi atau peralatan pabrik.'
  },
  {
    id: 15,
    section: 'gino2',
    question: '問題15. 設備の定義の1つである有形固定資産として最も不適切なものは、次のうちどれか。',
    questionJa: '問題15. 設備(せつび)의 정의(ていぎ) 중 하나인 有形固定資産(ゆうけいこうていさん)로서 가장 부적절(ふてきせつ)한 것은 다음 중 어느 것인가.',
    questionId: 'Soal 15. Yang paling tidak tepat sebagai aktiva tetap berwujud, yang merupakan salah satu definisi peralatan, adalah?',
    options: [
      '搬运及输送机械·设备(うんぱんおよびゆそうきかい·せつび)',
      '土地及建物和地基(とちおよびたてものとそのきそ)',
      '生产设备的软件(せいさんせつびを制するソフトウェア)',
      '事务用机器·设备(じむようきき·せつび)'
    ],
    optionsJa: [
      '運搬(うんぱん)および輸送(ゆそう)機械(きかい)・設備(せつび)',
      '土地(とち)および建物(たてもの得其基礎(きそ)',
      '生産設備(せいさんせつび)を制(せい)するソフトウェア(そふとうぇあ)',
      '事務用(じむよう)機器(きき)・設備(せつび)'
    ],
    optionsId: [
      'Mesin dan peralatan pengangkutan dan transportasi',
      'Tanah dan bangunan serta dasarnya',
      'Perangkat lunak yang mengontrol peralatan produksi',
      'Mesin dan peralatan untuk urusan kantor'
    ],
    correctIndex: 2,
    explanation: '生产设备的软件(せいさんせつびを制するソフトウェア) bukan固定资产(こていさんさん) karena 软件(そふとうぇあ)是无形固定资产(むけいけいこうていさん).',
    explanationJa: '生産設備(せいさんせつび)を制(せい)するソフトウェア(そふとうぇあ)는 无形固定资产(むけいけいこうていさん)이므로 有形固定资产(ゆうけいこうていさん)에 해당하지 않는다.',
    explanationId: 'Perangkat lunak yang mengontrol peralatan produksi bukan aktiva tetap berwujud karena merupakan aktiva tetap tidak berwujud.'
  },
  {
    id: 16,
    section: 'gino2',
    question: '問題16. 設備保全の目的に関する項目として最も関連性が低いものは、次のうちどれか。',
    questionJa: '問題16. 設備保全(せつびほぜん)の目的(もくてき)に関する項目(こうもく)로서 가장 관련성(かんれんせい)이 낮은(ひくい) 것은 다음 중 어느 것인가.',
    questionId: 'Soal 16. Item yang paling tidak terkait dengan tujuan pemeliharaan peralatan adalah?',
    options: [
      '作業者(さぎょうしゃ)에 대한 안전(あんぜん)의 확보(かくほ)',
      '製品(せいひん)의 研究開発(けんきゅうかいはつ)의 용이화(よういか)',
      '生産物(せいさんぶつ)の 品責(ひんしつ) 유지(いじ)',
      '장기(ちょうき)에 걸친 設備(せつび)の 利用(りよう)'
    ],
    optionsJa: [
      '作業者(さぎょうしゃ)に対する安全(あんぜん)の確保(かくほ)',
      '製品(せいひん)の研究開発(けんきゅうかいはつ)の容易化(よういか)',
      '生産物(せいさんぶつ)の品質(ひんしつ)の維持(いじ)',
      '長期間(ちょうきかん)에わたる設備(せつび)の利用(りよう)'
    ],
    optionsId: [
      'Menjamin keselamatan operator',
      'Memudahkan riset dan pengembangan produk',
      'Mempertahankan kualitas produk',
      'Pemanfaatan peralatan dalam jangka panjang'
    ],
    correctIndex: 1,
    explanation: 'Pemeliharaan peralatan(せつびほぜん) tidak secara langsung berhubungan dengan Facilitation of product R&D(製品の研究開発の容易化).',
    explanationJa: '設備保全(せつびほぜん)은製品(せいひん)의 研究開発(けんきゅうかいはつ)의 容易化(よういか)와 직접적인 관련이 없다.',
    explanationId: 'Pemeliharaan peralatan tidak secara langsung berhubungan dengan Fasilitasi R&D produk.'
  },
  {
    id: 17,
    section: 'gino2',
    question: '問題17. 設備保全におけるTPMに関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題17. 設備保全(せつびほぜん)におけるTPMに関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Soal 17. Deskripsi yang paling tepat tentang TPM dalam pemeliharaan peralatan adalah?',
    options: [
      'TPM(える)에서는 設備(せつび)의 自動化(じどうか)나 無人化(むじんか) 등은 대상(たいしょう)로 하지 않는다.',
      'TPM에서는 小集団活動(しょうしゅうだんかつどう)의 取組み(とりくみ)이 중요(じゅうよう)하다.',
      'TPM은 기업(きぎょう)에서의 生産部門(せいさんぶもん)이 전문(せんもん)とする 활동(かつどう)이다.',
      '경영탑(けいえいトップ)이 참가(さんか)하는 것은킥오프까지이면 좋다.'
    ],
    optionsJa: [
      'TPMでは、設備(せつび)の自動化(じどうか)や無人化(むじんか)等(とう)은 대상(たいしょう)과 하지 않는다.',
      'TPMでは、小集団活動(しょうしゅうだんかつどう)の取(と)り組(く)み、重要(じゅうよう)이다.',
      'TPMは、企業(きぎょう)における生産部門(せいさんぶもん)가専門(せんもん)とする活動(かつどう)이다.',
      '経営トップ(けいえいトップ)이 참가(さんか)하는 것은킥오프までで 좋다.'
    ],
    optionsId: [
      'Dalam TPM, otomasi atau unmanned equipment bukan merupakan target.',
      'Dalam TPM, kegiatan kelompok kecil sangat penting.',
      'TPM adalah kegiatan yang dikhususkan untuk departemen produksi di perusahaan.',
      'Keikutsertaan manajemen puncak hanya sampai kick-off.'
    ],
    correctIndex: 1,
    explanation: 'TPM에서는 小集団活動(しょうしゅうだんかつどう)의 取組み(とりくみ)이 중요(じゅうよう)하다고 규정하고 있다.',
    explanationJa: 'TPM(える)에서는 小集団活動(しょうしゅうだんかつどう)의 取組み(とりくみ)이 중요(じゅうよう)하다고 규정하고 있다.',
    explanationId: 'Dalam TPM, kegiatan kelompok kecil sangat penting.'
  },
  {
    id: 18,
    section: 'gino2',
    question: '問題18. 設備保全における設備の検査・整備・修理に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題18. 設備保全(せつびほぜん)における設備(せつび)の 検査(けんさ)・整備(せいび)・修理(しゅうり)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 18. Deskripsi yang paling tidak tepat tentang inspeksi, pemeliharaan, dan perbaikan peralatan dalam pemeliharaan peralatan adalah?',
    options: [
      '突発故障(とっぱつこしょう)은 계획(けいかく)していた保全(ほぜん) 일정을 변경(へんこう)하여 대응(たいおう)할 것이 필요(ひつよう)한 경우가 많다.',
      '製造部門(せいぞうぶもん)における整備活動(せいびかつどう)에는 清掃(せいそう), 注油(ちゅうゆ) 등 기본적인 5S에 포함(ほうがん)되는整備(せいび)가 있다.',
      '일상(にちじょう)의 점검(てんけん)・検査活動(けんさかつどう)에서는 먼저日程計画表(にっていけいかくひょう)을 작성(さくせい)하고, 그에 따라 실시(じっしゃ)한다.',
      '設備(せつび)에 대한 検査(けんさ)의 標準化(ひょうじゅんか)에서는 製品(せいひん)의 品質基準(ひんしつきじゅん)을 작성(さくせい)하고, 品質基準表(ひんしつきじゅんひょう)로서整備(せいび)한다.'
    ],
    optionsJa: [
      '突発故障(とっぱつこしょう)은、計画(けいかく)していた保全(ほぜん)スケジュール(すけじゅーる)을 변경(へんこう)하여 대응(たいおう)할 것이 필요(ひつよう)한 경우(ばあい)가 많다.',
      '製造部門(せいぞうぶもん)における整備活動(せいびかつどう)には、清掃(せいそう)、注油(ちゅうゆ)など基本(きほんてき)な5Sに包摂(ほうせつ)される整備(せいび)がある.',
      '日常(にちじょう)の点検(てんけん)・検査活動(けんさかつどう)では、まず日程計画表(にっていけいかくひょう)を作成(さくせい)し、それに従(したが)って実施(じっし)する.',
      '設備(せつび)에 대한 検査(けんさ)의 標準化(ひょうじゅんか)では、製品の品質基準(ひんしつきじゅん)을 작성(さくせい)하고, 品質基準表(ひんしつきじゅんひょう)로서整備(せいび)한다.'
    ],
    optionsId: [
      'Gangguan tiba-tiba seringkali memerlukan perubahan jadwal pemeliharaan yang direncanakan.',
      'Kegiatan pemeliharaan di departemen produksi mencakup pemeliharaan dasar yang termasuk dalam 5S seperti pembersihan dan pelumasan.',
      'Dalam kegiatan inspeksi harian, pertama buat jadwal dan lakukan sesuai jadwal.',
      'Dalam standardisasi inspeksi peralatan, buat standar kualitas produk dan jaga sebagai standar kualitas.'
    ],
    correctIndex: 3,
    explanation: '標準化(ひょうじゅんか)에서는 設備(せつび)의 検査(けんさ)만을 표준화할 뿐, 製品(せいひん)의 品質基準(ひんしつきじゅん) 같이는 무관(むかん)하다.',
    explanationJa: '標準化(ひょうじゅんか)에서는 設備(せつび)의 検査(けんさ)만을 표준화하고, 製品(せいひん)의 品質基準(ひんしつきじゅん)과는 무관하다.',
    explanationId: 'Dalam standardisasi, hanya inspeksi peralatan yang distandardisasi, tidak terkait dengan standar kualitas produk.'
  },
  {
    id: 19,
    section: 'gino2',
    question: '問題19. 1ヵ月の生産設備の実働時間が160時間、不働時間が40時間であったときの稼働率として適切なものは、次のうちどれか。',
    questionJa: '問題19. 1ヵ月(いっかげつ)の生産設備(せいさんせつび)の実働時間(じつどうじかん)가 160時間(じかん)、不働時間(ふどうじかん)가 40時間(じかん)であったときの稼働率(かどうりつ)として適切(てきせつ)なものは、次のうちどれか。',
    questionId: 'Soal 19. Jika waktu operasi aktual peralatan produksi adalah 160 jam dan waktu non-operasi adalah 40 jam dalam sebulan, mana yang merupakan tingkat operasi yang tepat?',
    options: [
      '25%',
      '33%',
      '75%',
      '80%'
    ],
    optionsJa: [
      '25%(25パーセント)',
      '33%(33パーセント)',
      '75%(75パーセント)',
      '80%(80パーセント)'
    ],
    optionsId: [
      '25 persen',
      '33 persen',
      '75 persen',
      '80 persen'
    ],
    correctIndex: 3,
    explanation: '稼働率(かどうりつ) = 実働時間(じつどうじかん) / (実働時間(じつどうじかん) + 不働時間(ふどうじかん)) × 100 = 160 / (160 + 40) × 100 = 80%.',
    explanationJa: '稼働率(かどうりつ) = 実働時間(じつどうじかん) / (実働時間(じつどうじかん) + 不働時間(ふどうじかん)) × 100 = 160 / (160 + 40) × 100 = 80%.',
    explanationId: 'Tingkat operasi = Waktu operasi aktual / (Waktu operasi aktual + Waktu non-operasi) × 100 = 160 / (160 + 40) × 100 = 80%.'
  },
  {
    id: 20,
    section: 'gino2',
    question: '問題20. 資材管理に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題20. 資材管理(しざいかんり)に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 20. Deskripsi yang paling tidak tepat tentang manajemen material adalah?',
    options: [
      '資材管理(しざいかんり)是指(とは)所需品质(しょていひんしつ)의 資材(しざい)를 필요(ひつよう)할 때必要量(ひつようりょう)だけ 적정(てきせい)한 价格(かかく)로 調達(ちょうたつ)하고, 要求元(ようきゅうもと)에 타이밍리(タイムリー)에 供給(きょうきゅう)하기 위한 管理活動(かんりかつどう)이다.',
      '資材管理(しざいかんり)에서는 購買管理(こうばいかんり), 外注管理(がいちゅうかんり), 그리고 在庫管理(ざいこかんり)의 管理機能(かんりきのう)의 展開(てんかい)가 중요(じゅうよう)하다.',
      '資材の 分類方法(ぶんるいほうほう)의 1つ인 入手方法(にゅうしゅほうほう)からの 分類(ぶんるい)에서는、素材(そざい)、粗形材(ほぼかたざい)、部品(ぶひん)、半製品(はんせいひん)から構成(こうせい)된다.',
      '資材業務(しざいぎょうむ)의 実施順序(じっじゅんじょ)としては、要求(ようきゅう) → 調達(ちょうたつ) → 受入検収(うけいれけんしゅう) → 保管(ほかん)가 일반적(いっぱんてき)이다.'
    ],
    optionsJa: [
      '資材管理(しざいかんり)とは、所定(しょてい)の品質(ひんしつ)の資材(しざい)を必要(ひつよう)なとき必要量(ひつようりょう)だけ適正(てきせい)な価格(かかく)で調達(ちょうたつ)し、要求元(ようきゅうもと)에 타이밍리(タイムリー)에 공급(きょうきゅう)하기 위한管理活動(かんりかつどう)이다.',
      '資材管理(しざいかんり)では、購買管理(こうばいかんり)、外注管理(がいちゅうかんり)、そして在庫管理(ざいこかんり)の管理機能(かんりきのう)の展開(てんかい)重要(じゅうよう)이다.',
      '資材(しざい)の分類方法(ぶんるいほうほう)の1つである入手方法(にゅうしゅほうほう)からの分類(ぶんるい)では、素材(そざい)、粗形材(ほぼかたざい)、部品(ぶひん)、半製品(はんせいひん)から構成(こうせい)される.',
      '資材業務(しざいぎょうむ)の実施順序(じっじゅんじょ)としては、要求(ようきゅう)→調達(ちょうたつ)→受入検収(うけいれけんしゅう)→保管(ほかん)적이다.'
    ],
    optionsId: [
      'Manajemen material adalah kegiatan manajemen untuk memperoleh material dengan kualitas yang ditentukan, dalam jumlah yang diperlukan, pada harga yang wajar, dan mengirimkannya ke yang membutuhkan tepat waktu.',
      'Dalam manajemen material, pengembangan fungsi manajemen seperti manajemen pembelian, manajemen outsourcing, dan manajemen persediaan adalah penting.',
      'Dalam klasifikasi berdasarkan metode perolehan, salah satu metode klasifikasi material, terdiri dari bahan baku, bahan kasar, komponen, dan semi-produksi.',
      'Urutan pelaksanaan bisnis material umumnya adalah permintaan → pengadaan → penerimaan dan inspeksi → penyimpanan.'
    ],
    correctIndex: 2,
    explanation: '入手方法(にゅうしゅほうほう)からの 分類(ぶんるい)은 素材(そざい)、部品(ぶひん)、半製品(はんせいひん)으로 구성(こうせい)되며, 粗形材(ほぼかたざい)는 포함(ほうがん)되지 않는다.',
    explanationJa: '入手方法(にゅうしゅほうほう)からの分類(ぶんるい)은 素材(そざい)、部品(ぶひん)、半製品(はんせいひん)으로 구성되며, 粗形材(ほぼかたざい)는 포함되지 않는다.',
    explanationId: 'Klasifikasi berdasarkan metode perolehan terdiri dari bahan baku, komponen, dan semi-produksi,不包括 bahan kasar.'
  },
  {
    id: 21,
    section: 'gino2',
    question: '問題21. 部品在庫において、部品の導入価格(とうにゅうかかく)이発注量(はっちゅうりょう)의 多寡(たか)나 市況(しきょう)에 따라 변동(へんどう)하는 경우, 해당 부품의 在庫残高金額(ざいこざんだかきんがく) 산정 방법(さんていほうほう)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionJa: '問題21. 部品在庫(ぶひんざいこ)において、部品(ぶひん)の購入単価(こうにゅうたんか)가発注量(はっちゅうりょう)の多寡(たか)や市況(しきょう)により変動(へんどう)する場合がある。このよう(よう)な場合(ばあい)の当該部品(とうがいぶひん)の在庫残高金額(ざいこざんだかきんがく)の算定方法(さんていほうほう)として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 21. Dalam persediaan komponen, ketika harga beli komponen berfluktuasi tergantung pada kuantitas pesanan atau kondisi pasar, mana yang paling tidak tepat sebagai metode penghitungan jumlah saldo persediaan komponen?',
    options: [
      '期首取得原価法(きしゅしゅとくげんかほう)',
      '移動平均法(いどうへいきんほう)',
      '総平均法(そうへいきんほう)',
      '先入先出法(さきいれさきだしほう)'
    ],
    optionsJa: [
      '期首取得原価法(きしゅしゅとくげんかほう)',
      '移動平均法(いどうへいきんほう)',
      '総平均法(そうへいきんほう)',
      '先入先出法(さきいれさきだしほう)'
    ],
    optionsId: [
      'Metode biaya akuisisi awal',
      'Metode rata-rata bergerak',
      'Metode rata-rata total',
      'Metode FIFO'
    ],
    correctIndex: 0,
    explanation: '当(とう)該(がい)、部(ぶ)品(ひん)の 取(と)得(とく)단가(たんか)가 변동(へんどう)하는 경우, 期首取得原価法(きしゅしゅとくげんかほう)은 사요(利用可能)하지 않다.',
    explanationJa: '해당 부품의 도입가격이 변동하는 경우, 期首取得原価法(きしゅしゅとくげんかほう)은 사용할 수 없다.',
    explanationId: 'Ketika harga beli komponen berfluktuasi, metode biaya akuisisi awal tidak dapat digunakan.'
  },
  {
    id: 22,
    section: 'gino2',
    question: '問題22. 集中購買方式と分散購買方式の利点に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題22. 集中購買方式(しゅうちゅうこうばいほうしき)와 分散購買方式(ぶんさんこうばいほうしき)の 利点(りてん)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 22. Deskripsi yang paling tidak tepat tentang keuntungan metode pembelian terpusat dan terdistribusi adalah?',
    options: [
      '集中購買(しゅうちゅうこうばい)은 집중 주문(しゅうちゅうちゅうだん)을 통해 購買価格(こうばいかかく)의 할인을 받을 수 있다.',
      '集中購買(しゅうちゅうこうばい)은 購買事務手続(こうばいじむてつづき)을 통일(とういつ)할 수 있다.',
      '分散購買(ぶんさんこうばい)은 資材(しざい)의 標準化(ひょうじゅんか)가 용이(ようい)해진다.',
      '分散購買(ぶんさんこうばい)은 각 공장(かくこうじょう)이 입지(りっち)하는 地域企業(ちいききぎょう)에 기여(こうけん)할 수 있다.'
    ],
    optionsJa: [
      '集中購買(しゅうちゅうこうばい)은集中発注(しゅうちゅうはっちゅう)에 의해 구매가격(こうばいかかく)의 할인을 받을 수 있다.',
      '集中購買(しゅうちゅうこうばい)은구매사무절차(こうばいじむてつづき)를 통일(とういつ)할 수 있다.',
      '分散購買(ぶんさんこうばい)은자재(しざい)의 표준화(ひょうじゅんか)가 용이(ようい)해진다.',
      '分散購買(ぶんさんこうばい)은각 공장(かくこうじょう)이 입지(りっち)하는 지역기업(ちいききぎょう)에 기여(こうけん)할 수 있다.'
    ],
    optionsId: [
      'Pembelian terpusat dapat memperoleh diskon harga pembelian melalui pemesanan terpusat.',
      'Pembelian terpusat dapat menyatukan prosedur administrasi pembelian.',
      'Pembelian terdistribusi memfasilitasi standardisasi material.',
      'Pembelian terdistribusi dapat berkontribusi pada perusahaan lokal di mana setiap pabrik beroperasi.'
    ],
    correctIndex: 2,
    explanation: '分散購買(ぶんさんこうばい)에서는 標準化(ひょうじゅんか)가 어려워지며, 集中購買(しゅうちゅうこうばい)에서의み 標準化(ひょうじゅんか)가 용이(ようい)해진다.',
    explanationJa: '分散購買(ぶんさんこうばい)에서는 표준화(ひょうじゅんか)가 어려워지며, 集中購買(しゅうちゅうこうばい) 통해서만 표준화(ひょうじゅんか)가 용이(ようい)해진다.',
    explanationId: 'Dalam pembelian terdistribusi, standardisasi menjadi sulit, dan hanya pembelian terpusat yang memfasilitasi standardisasi.'
  },
  {
    id: 23,
    section: 'gino2',
    question: '問題23. 物流に関する記述として不適切なものは、次のうちどれか。',
    questionJa: '問題23. 物流(ぶつりゅう)에 관한 기술(ぎじゅつ)으로서 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 23. Deskripsi yang tidak tepat tentang logistik adalah?',
    options: [
      '調達物流(ちょうたつぶつりゅう)은 제조업체(せいぞうぎょうしゃ)나 도매·소매업체(おろし·こうりぎょうしゃ)가調達先(ちょうたつさき)에서 물건을 사는 행동(こうい)에 수반(ともな)되어 발생하는物流(ぶつりゅう)이다.',
      '生産物流(せいさんぶつりゅう)은 제조회사의 사내物流(しゃないぶつりゅう)으로, 자재를 보관(ほかん)하기 위한 이동(いどう), 생산현장(せいさんげんば)에 공급(きょうきゅう)하기 위한 이동, 작업공정간(さぎょうこうていかん)의 부품(ぶひん)·반제품(はんせいひん)의 이동(いどう), 완제품(せいひん)의 창고(そうこ) 이동(いどう) 등이 이에 해당(がいとう)한다.',
      '販売物流(はんばいぶつりゅう)은 판매점(はんばいてん)이 일반소비자(いっぱんしょうひしゃ)에 대해 실시(じっ)하는物流(ぶつりゅう)서비스로, 제조회사(せいぞうがいしゃ)·도매회사(はんばいがいしゃ)로부터 판매점(はんばいてん)의 판매(はんばい)에 수반(ともな)되는物流サービス(ぶつりゅうサービス)는 포함(ほうがん)되지 않는다.',
      '回収物流(かいしゅうぶつりゅう)은 부적합품(ふてきごうひん), 사용완료(しようずみ)의 제품(せいひん)·상풍(しょうひん), 폐기물(はいきぶつ), 리サイクル품(りさいくるひん) 등에 관한 수송(ゆそう)이다.'
    ],
    optionsJa: [
      '調達物流(ちょうたつぶつりゅう)은 제조업자(せいぞうぎょうしゃ)나 도매·소매업자(おろし·こうりぎょうしゃ)가調達先(ちょうたつさき)에서 물건을 사는 행동(こうい)에 수반(ともな)되어 발생하는物流(ぶつりゅう)이다.',
      '生産物流(せいさんぶつりゅう)은 제조회사의 사내物流(しゃないぶつりゅう)으로, 자재를 보관(ほかん)하기 위한 이동(いどう), 생산현장(せいさんげんば)에 공급(きょうきゅう)하기 위한 이동, 작업공정간(さぎょうこうていかん)의 부품(ぶひん)·반제품(はんせいひん)의 이동(いどう), 완제품(せいひん)의 창고(そうこ) 이동(いどう) 등이 이에 해당(がいとう)한다.',
      '販売物流(はんばいぶつりゅう)은 판매점(はんばいてん)이 일반소비자(っぽんしょうひしゃ)에 대해 실시(じっ)하는物流(ぶつりゅう)서비스로, 제조회사(せいぞうがいしゃ)·도매회사(はんばいがいしゃ)로부터 판매점(はんばいてん)의 판매(はんばい)에 수반(ともな)되는物流サービス(ぶつりゅうサービス)는 포함(ほうがん)되지 않는다.',
      '回収物流(かいしゅうぶつりゅう)은 부적합품(ふてきごうひん), 사용완료(しようずみ)의 제품(せいひん)·상풍(しょうひん), 폐기물(はいきぶつ), 리사이클품(りさいくるひん) 등에 관한 수송(ゆそう)이다.'
    ],
    optionsId: [
      'Logistik distribusi adalah logistik yang terjadi sehubungan dengan tindakan membeli barang dari pemasok oleh produsen atau grosir.',
      'Logistik produksi adalah logistik internal perusahaan manufaktur, termasuk pergerakan untuk menyimpan material, pergerakan untuk supplying ke lokasi produksi, pergerakan komponen dan semi-produksi antara proses, dan pergerakan produk jadi ke gudang.',
      'Logistik penjualan adalah layanan logistik yang dilakukan oleh toko pengecer kepada konsumen umum, dan tidak termasuk layanan logistik yang menyertai penjualan dari produsen atau grosir ke toko.',
      'Logistik pengumpulan adalah pengangkutan tentang produk tidak sesuai, produk bekas, limbah, dan barang daur ulang.'
    ],
    correctIndex: 2,
    explanation: '販売物流(はんばいぶつりゅう)은 제조회사(せいぞうがいしゃ)·도매회사(はんばいがいしゃ)에서부터 판매점(はんばいてん)으로의物流(ぶつりゅう)이므로, 제조회사等的 판매에 수반되는物流サービス도 포함된다.',
    explanationJa: '販売物流(はんばいぶつりゅう)은 제조회사(せいぞうがいしゃ)·도매회사(はんばいがいしゃ)에서부터 판매점(はんばいてん)으로의物流(ぶつりゅう)이므로, 그에 수반되는物流サービス(ぶつりゅうサービス)도 포함된다.',
    explanationId: 'Logistik penjualan mencakup juga layanan logistik yang menyertai penjualan dari produsen atau grosir ke pengecer.'
  },
  {
    id: 24,
    section: 'gino2',
    question: '問題24. 保管機能に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題24. 保管機能(ほかんきのう)에 관한 기술(ぎじゅつ)으로서 가장 적절(てきせつ)한 것은?',
    questionId: 'Soal 24. Deskripsi yang paling tepat tentang fungsi penyimpanan adalah?',
    options: [
      '保管効率(ほかんこうりつ)와 入出庫効率(にゅうしゅっここうりつ)은 トレードオフ(Trade-off)关系(かんけい)에 있다.',
      'DC型センター(디시형센터)란 流通加工(りゅうつうかこう)을 중심(ちゅうしん)으로 하는物流拠点(ぶつりゅうきょてん)을 가리킨다.',
      'フリーロ케이션에서는 매출(うりあげ)이나 생산량(せいさんりょう)이 변동(へんどう)하여 재고의 증감(ぞうげん)이 큰 경우, 保管場所(ほかんばしょ)의 공백(あ) 또는 부족(ふそく)이 발생(はっせい)할 가능성이 있으며 柔軟性(じゅうなんせい)이 없어진다.',
      '일정 기간(いっていきかん)의 피킹 수(ぴっきんくすう)에 대응(たいおう)하는 수(かず)를 피킹 영역(ぴっきんくりーえあ)에置いて두는 재고는 리저브 형(りざーぶ)가 재고(ぞうか)라고 불린다.'
    ],
    optionsJa: [
      '保管効率(ほかんこうりつ)와 入出庫効率(にゅうしゅっここうりつ)은 トレードオフ(てれーどおふ)の関係(かんけい)にある.',
      'DC型センター(디시がたせんたー)とは、流通加工(りゅうつうかこう)を中心(ちゅうしん)とする物流拠点(ぶつりゅうきょてん)を指(さし)す.',
      'フリーロケーション(ふりーロ케이션)では、売上(うりあげ)や生産量(せいさんりょう)の変動(へんどう)が大きく、在庫(ざいこ)の増減(ぞうげん)이大きい場合、保管場所(ほかんばしょ)の空き(あ) أو不足(ふそく)が発生(はっせい)する可能性(かのうせい)があり、柔軟性(じゅうなんせい)가 becoming.',
      '一定期間(いっていきかん)のピッキング数(ぴっきんくすう)に対応(たいおう)した数(かず)를ピッキングエリア(ぴっきんぐりーあ)에置いて(お)く在庫(ざいこ)は、リザーブ型(りざーぶ가)在庫(ざいこ)와 불려.'
    ],
    optionsId: [
      'Efisiensi penyimpanan dan efisiensi masuk-keluar memiliki hubungan trade-off.',
      'Pusat tipe DC adalah pusat logistik yang berpusat pada pemrosesan distribusi.',
      'Di lokasi bebas, ketika penjualan atau volume produksi berfluktuasi dan perubahan inventaris besar, mungkin ada kekosongan atau kekurangan ruang penyimpanan, dan kehilangan fleksibilitas.',
      'Inventaris yang disimpan di area picking sesuai dengan jumlah picking untuk periode tertentu disebut inventaris tipe cadangan.'
    ],
    correctIndex: 0,
    explanation: '保管効率(ほかんこうりつ)와 入出庫効率(にゅうしゅっここうりつ)은 トレードオフ(Trade-off) 관계에 있어, 효율이 높은 경우 높은 입출고 효율을 동시에 달성하는 것은 어렵다.',
    explanationJa: '保管効率(ほかんこうりつ)와 入出庫効率(にゅうしゅっここうりつ)은 トレードオフ(Trade-off) 관계에 있어, 효율이 높은 경우 높은 입출고 효율을 동시에 달성하는 것은 어렵다.',
    explanationId: 'Efisiensi penyimpanan dan efisiensi masuk-keluar memiliki hubungan trade-off, dan sulit untuk mencapai efisiensi masuk-keluar yang tinggi pada saat yang sama dengan efisiensi penyimpanan yang tinggi.'
  },
  {
    id: 25,
    section: 'gino2',
    question: '問題25. 、一般的な 商品(しょうひん)의 包装(ほうそう)의 機能(きのう)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionJa: '問題25. 般的(はんてき)な 商品(しょうひん)の 包装(ほうそう)の 機能(きのう)として最も不適切なものは、次のうちどれか。',
    questionId: 'Soal 25. Yang paling tidak tepat sebagai fungsi kemasan produk umum adalah?',
    options: [
      '内容物(ないようぶつ)에 대한 保護(ほご)',
      '内容物(ないようぶつ)에 관한 情報提供(じょうほうていきょう)',
      '荷役時(にやくじ)における 取扌扱い(とりあつか)の 利便性(りべんせい)',
      '配送時(はいそうじ)における 誤配送(ごはいそう)防止(ふせい)'
    ],
    optionsJa: [
      '内容物(ないようぶつ)に対する保護(ほご)',
      '内容物(ないようぶつ)に関する情報提供(じょうほうていきょう)',
      '荷役時(にやくじ)における取扱(とりあつか)いの利便性(りべんせい)',
      '配送時(はいそうじ)における誤配送(ごはいそう)防止(ふせい)'
    ],
    optionsId: [
      'Perlindungan terhadap isi',
      'Penyediaan informasi tentang isi',
      'Kenyamanan penanganan saat pemuatan',
      'Pencegahan pengiriman salah saat pengiriman'
    ],
    correctIndex: 3,
    explanation: '誤配送(ごはいそう)防止(ふせい)는 包装(ほうそう)의 機能(きのう)이 아니라, 配送管理(はいそうかんり)의 機能(きのう)에 해당한다.',
    explanationJa: '誤配送(ごはいそう)防止(ふせい)는 包装(ほうそう)의 機能(きのう)이 아니라, 配送管理(はいそうかんり)의 機能(きのう)에 해당한다.',
    explanationId: 'Pencegahan pengiriman salah bukan fungsi kemasan, melainkan fungsi manajemen pengiriman.'
  },
  {
    id: 26,
    section: 'gino2',
    question: '問題26. 品質管理に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題26. 品質管理(ひんしつかんり)에 관한 기술(ぎじゅつ)으로서 가장 적절(てきせつ)한 것은?',
    questionId: 'Soal 26. Deskripsi yang paling tepat tentang manajemen kualitas adalah?',
    options: [
      '製造品質(せいぞうひんしつ)은 ねらい(目標)의 品質(ひんしつ)이라고도 불린다.',
      '代用特性(だいようとくせい)은 真(しん)の 特性(とくせい)을 直接測定(ちょくせつそくてい)하는 것이 어려운 경우에 사용된다.',
      '検査基準(けんさきじゅん)은 消費者(しょうひしゃ)에 제시(ていじ)해야 할 品質(ひんしつ)의 水準(すいじゅん)이다.',
      '品質特性(ひんしつとくせい)은 제조 목적(せいぞうもくてき)을 만족(まんぞく)시키는지 여부(よいぶ)를 결정(けってい)하는 고유(こゆう)의 성질(せいしつ)·성능(せいのう)의 것이다.'
    ],
    optionsJa: [
      '製造品質(せいぞうひんしつ)은 ねらい(目標)의 品質(ひんしつ)이라고도 불린다.',
      '代用特性(だいようとくせい)은 真(しん)の 特性(とくせい)을 直接測定(ちょくせつそくてい)하는 것이 困難(こんなん)な 場合(ばあい)에 用い(もち)られる.',
      '検査基準(けんさきじゅん)은 消費者(しょうひしゃ)에 示(しめ)すべき 品質(ひんしつ)の 水準(すいじゅん)이다.',
      '品質特性(ひんしつとくせい)은 製造目的(せいぞうもくてき)を 満окon(まんぞく)，是否(よいぶ)를 결정(けってい)하는 고유(こゆう)의 성질(せいしつ)·性能(せいのう)의 것이다.'
    ],
    optionsId: [
      'Kualitas manufaktur juga disebut kualitas target.',
      'Karakteristik pengganti digunakan ketika karakteristik sebenarnya sulit diukur langsung.',
      'Standar inspeksi adalah standar kualitas yang harus ditunjukkan kepada konsumen.',
      'Karakteristik kualitas adalah sifat dan kinerja unik yang menentukan apakah tujuan manufaktur terpenuhi.'
    ],
    correctIndex: 1,
    explanation: '代用特性(だいようとくせい)은 真(しん)의 特性(とくせい)을 直接測定(ちょくせつそくてい)하는 것이 困難(こんなん)한 場合(ばあい)에 使用(しよう)되는 것이며, 이는 적절(てきせつ)한 설명이다.',
    explanationJa: '代用特性(だいようとくせい)은 真(しん)の 特性(とくせい)을 直接測定(ちょくせつそくてい)하는 것이 困難(こんなん)한 場合(ばあい)에 使用(しよう)되는 것이며, 이는 적절(てきせつ)한 설명이다.',
    explanationId: 'Karakteristik pengganti digunakan ketika karakteristik sebenarnya sulit diukur langsung, yang merupakan deskripsi yang tepat.'
  },
  {
    id: 27,
    section: 'gino2',
    question: '問題27. グラフの種類と目的に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題27. グラフ(ぐらふ)의 種類(しゅるい)와 目的(もくてき)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 27. Deskripsi yang paling tidak tepat tentang jenis dan tujuan grafik adalah?',
    options: [
      '帯グラフ(おびぐらふ): 항목(こうもく)의 带(おび)을 区切(くぎ)って 항목(こうもく)의 内訳(うちわけ)를 나타낸 그래프.',
      '折れ線グラフ(おれせんぐらふ): 時系列(じけいれつ)의 推移(すいい)을 点(てん)과 線(せん)으로 结ん(むす)んだ 그래프.',
      '円グラフ(まるぐらふ): 円(まる)을 扇形(おうぎ形(がた))에 区切(くぎ)って 항목(こうもく) 内訳(うちわけ)를 나타낸 그래프.',
      '層グラフ(そうぐらふ): 放射能(ほうしゃせん)의 軸(じく)상에 항목(こうもく)ごとに値(あたい)를 プロット(ぷろっと)した 点(てん)을 線(せん)으로 结ん(むす)んで 나타낸 그래프.'
    ],
    optionsJa: [
      '帯グラフ(おびぐらふ): 項目(こうもく)の帯(おび)を区切(くぎ)って項目(こうもくの内訳(うちわけ)を表(あらわ)したグラフ.',
      '折れ線グラフ(おれせんぐらふ): 時系列(じけいれつ)の推移(すいい)을 点(てん)과 線(せん)으로 结ん(むす)んだ 그래프.',
      '円グラフ(まるぐらふ): 円(まる)을 扇形(おうぎ形(がた))に区切(くぎ)って項目内(こうもくない)の訳(うちわけ)를 표기(ひょうき)한 그래프.',
      '層グラフ(そうぐらふ): 放射能(ほうしゃせん)의 軸(じく)上に項目(こうもく)ごとに値(あたい)를 プロット(ぷろっと)한 点(てん)을 線(せん)으로 结ん(むす)んで表(あらわ)した 그래프.'
    ],
    optionsId: [
      'Grafik pita: Grafik yang menunjukkan rincian setiap item dengan membagi pita item.',
      'Grafik garis: Grafik yang menghubungkan titik dan garis dengan tren waktu.',
      'Grafik lingkaran: Grafik yang menunjukkan rincian dalam item dengan membagi lingkaran menjadi sektor.',
      'Grafik lapisan: Grafik yang menyatakan titik-titik yang diplot untuk setiap item pada sumbu radial dihubungkan dengan garis.'
    ],
    correctIndex: 3,
    explanation: '層グラフ(そうぐらふ)는 방사능 축이 아니라, 항목별로 값을 계층적으로 나타낸 그래프이다.',
    explanationJa: '層グラフ(そうぐらふ)는 방사능 축이 아니라, 항목별로 값을 계층적으로 나타낸 그래프이다.',
    explanationId: 'Grafik lapisan bukan sumbu radial, melainkan grafik yang menunjukkan nilai setiap item secara hierarkis.'
  },
  {
    id: 28,
    section: 'gino2',
    question: '問題28. 抜取検査の条件に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題28. 抜取検査(ぬきとりけんさ)の 条件(じょうけん)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 28. Deskripsi yang paling tidak tepat tentang kondisi inspeksi sampel adalah?',
    options: [
      '抜取検査(ぬきとりけんさ)에서는 로트(批量)의 区切(くぎ)りが明確(めいかく)になっている 必要(ひつよう)가 있다.',
      '抜取検査(ぬきとりけんさ)에는 生产자危険(せいさんしゃきけん)과 消費者危険(しょうひしゃきけん)이라는 위험(ふ好吧)があり, 両者(りょうしゃ)은 독립(どくりつ)의 관계(かんけい)에 있어, 消費者危険(しょうひしゃきけん)을 작게 하는 方法(ほうほう)을 검토(けんとう)한다.',
      'サンプル(さんぷる)는 로트(批量)를 代表(だいひょう)하도록, 通常(つうじょう)은 랜덤 샘플링(らんだむさんぷりんぐ)을 실시(じっ)한다.',
      '抜取検査(ぬきとりけんさ)는 로트(批量) 중에 일정(いちじょう) 수준의 不適合品(ふてきごうひん)의 혼입(こんにゅう)이 허용(ゆる)되는 경우에 적용(てきよう)되기 때문에 不適合品率(ふてきごうひんりつ)이 제로(ぜろ)임을 보증(ほしょう)할 수 없다.'
    ],
    optionsJa: [
      '抜取検査(ぬきとりけんさ)では、ロット(ろっと)의 区切(くぎ)りが明確(めいかく)になっている 必要(ひつよう)がある.',
      '抜取検査(ぬきとりけんさ)には、生産者危険(せいさんしゃきけん)と消費者危険(しょうひしゃきけん)という リスク(りすく)があり、両者(りょうしゃ)은 독립(どくりつ)の 関係(かんけい)にあるのに対して、消費者危険(しょうひしゃきけん)を 小(ちいさく)する 方法(ほうほう)を 検討(けんとう)する.',
      'サンプル(さんぷる)는ロット(ろっと)를 代表(だいひょう)하도록、通常(つうじょう)는 랜덤サンプリング(らんだむさんぷりんぐ)을 실시(じっ)한다.',
      '抜取検査(ぬきとりけんさ)는ロット(ろっと)中(ちゅう)에 있는 정도(ていど)의 不適合品(ふてきごうひん)の 混入(こんにゅう)가 许容(きょよう)される 場合(ばあい)에 適用(てきよう)되기 때문에 不適合品率(ふてきごうひんりつ)이 ゼロ(ぜろ)임을 保証(ほしょう)할 수 없다.'
    ],
    optionsId: [
      'Dalam inspeksi sampel, perlu untuk memiliki batas lot yang jelas.',
      'Inspeksi sampel memiliki risiko seperti risiko produsen dan risiko konsumen, dan keduanya terkait secara independen, dan metode untuk mengurangi risiko konsumen dipertimbangkan.',
      'Sampel biasanya diambil secara acak untuk mewakili lot.',
      'Inspeksi sampel tidak dapat menjamin tingkat cacat nol karena diterapkan ketika tingkat cacat tertentu di lot dapat ditoleransi.'
    ],
    correctIndex: 1,
    explanation: '生産者危険(せいさんしゃきけん)과 消費者危険(しょうひしゃきけん)은 독립(どくりつ)의 관계가 아니라, 대립(たいりつ)하는 관계이다.',
    explanationJa: '生産者危険(せいさんしゃきけん)과 消費者危険(しょうひしゃきけん)은 독립(どくりつ)の 관계가 아니라, 대립(たいりつ)하는 관계이다.',
    explanationId: 'Risiko produsen dan risiko konsumen bukan hubungan independen, melainkan hubungan yang saling berlawanan.'
  },
  {
    id: 29,
    section: 'gino2',
    question: '問題29. 製造物責任に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題29. 製造物責任(せいぞうぶつせきにん)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 29. Deskripsi yang paling tidak tepat tentang tanggung jawab produk adalah?',
    options: [
      '製造上(せいぞうじょう)의 欠陥(けっかん)은, 제조물(せいぞうぶつ)이 설계(せっけい)나 仕様(しよう)대로 제조(せいぞう)되지 않아 안전성(あんぜんせい)을 결여(けつぎょ)한 것을 말한다.',
      '製造物責任法(せいぞうぶつせきにんほう)에서는 제조자(せいぞうしゃ)에 过失(かしつ)가 있고, 제조한 제품(せいひん)으로 피해(ひがい)가 발생(はっせい)했을 때, 피해자(ひがいしゃ)에게 배상(ばいしょう)하도록 규정(きてい)하고 있다.',
      '製造者(せいぞうしゃ) 또는 販売者(はんばいしゃ)는, 安全設計(あんぜんせっけい)에서는 예기(よき)하지 않은 使用方法(しようほうほう)이나 誤使用(ごしょう) 등에 대응(たいおう)할 수 없는 경우, 使用者(しようしゃ)에게 주의(ちゅうい)를 환기(かんき)하기 위한 警告(けいこく)라벨의 부착(ふちゃく)이나 使用上(しようじょう)의 주의(ちゅうい) 등을 明記(めいき)하는 것이 중요(じゅうよう)하다.',
      '製品(せいひん)의 欠陥(けっかん)에 의한 사고(じこ)의 発生(はっせい)에 대한 事後(じご)의 대응(たいおう)은, 소송(そしょう)의提起(ていき)에 대비(そな)하는 製造物責任防御(せいぞうぶつせきにんぼうぎょ) 소비자(しょうひしゃ)에 안전한 제품(せいひん)을 공급(きょうきゅう)하는 製品安全(せいひんあんぜん)의 두 가지로 분류(ぶんるい)하여考える(かんがえる) 수 있다.'
    ],
    optionsJa: [
      '製造上(せいぞうじょう)の欠陥(けっかん)は、製造物(せいぞうぶつ)が設計(せっけい)나仕様(しよう)どおりに製造(せいぞう)されなかったために安全(あんぜんせい)を欠(か)いたことをいう.',
      '製造物責任法(せいぞうぶつせきにんほう)では、製造者(せいぞうしゃ)に過失(かしつ)があり、製造(せいぞう)した製品(せいひん)で被害(ひがい)が発生(はっせい)したときに被害者(ひがいしゃ)に賠償(ばいしょう)することとされている.',
      '製造者(せいぞうしゃ)または販売者(はんばいしゃ)は、安全設計(あんぜんせっけい)では予期(よき)しない使(つか)い方(かた)나誤使用(ごしょう)などに対応(たいおう)できない場合、使用者(しようしゃ)に注意(ちゅうい)を喚起(かんき)するための警告(けいこく)ラベル(らべる)の貼付(ふちゃく)や使用上(しようじょう)の注意(ちゅうい)などを明記(めいき)することが重要(じゅうよう)である.',
      '製品(せいひん)の欠陥(けっかん)による事故(じこ)の発生(はっせい)に対する事前(じぜん)の対応(たいおう)は、訴訟(そしょう)の提起(ていき)に備(そな)える製造物責任防御(せいぞうぶつせきにんぼうぎょ消費者(しょうひしゃ)に安全(あんぜん)な製品(せいひん)を供給(きょうきゅう)する製品安全(せいひんあんぜん)の2つに分(わ)けて考(かんが)えることができる.'
    ],
    optionsId: [
      'Cacat dalam manufaktur adalah ketika produk tidak dibuat sesuai desain atau spesifikasi, yang menyebabkan hilangnya keamanan.',
      'Hukum tanggung jawab produk menetapkan bahwa jika produsen lalai dan kerusakan terjadi akibat produk yang diproduksi, kompensasi harus dibayarkan kepada korban.',
      'Produsen atau penjual harus memberikan label peringatan dan mencatat peringatan penggunaan untuk mengingatkan pengguna jika tidak dapat mengatasi penggunaan yang tidak terduga atau penyalahgunaan dalam desain yang aman.',
      'Responspre-emptif terhadap kecelakaan yang disebabkan oleh cacat produk dapat dibagi menjadi dua: pertahanan tanggung jawab produk untuk mempersiapkan mengajukan gugatan dan keamanan produk untuk menyediakan produk yang aman kepada konsumen.'
    ],
    correctIndex: 1,
    explanation: '製造物責任法(せいぞうぶつせきにんほう)에서는 무과실(むかしつ)책임 원칙이 적용되므로, 过失(かしつ)가 있다는 입증(にゅうしょう)은 필요(ひつよう)하지 않다.',
    explanationJa: '製造物責任法(せいぞうぶつせきにんほう)에서는 무과실(むかしつ)책임 원칙이 적용되므로, 过失(かしつ)가 있다는 입증(にゅうしょう)은 필요(ひつよう)하지 않다.',
    explanationId: 'Dalam hukum tanggung jawab produk, prinsip tanggung jawab tanpa kesalahan diterapkan, sehingga tidak perlu membuktikan bahwa ada kelalaian.'
  },
  {
    id: 30,
    section: 'gino2',
    question: '問題30. 原価管理活動に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題30. 原価管理活動(げんかかんりかつどう)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 30. Deskripsi yang paling tidak tepat tentang aktivitas manajemen biaya adalah?',
    options: [
      '標準原価計算(ひょうじゅんげんかけいさん)은 企画・開発段階(きかく・かいはつだんかい)의 原価低減(げんかていげん)에有帮助(やくだつ)하는 原価管理手法(げんかかんりしゅほう)이다.',
      '原価企画(げんかきかく)은 제품(せいひん)의 开发・設計段階(せっけいだんかい)において 原価(げんか)를 만들어가는 原価管理手法(げんかかんりしゅほう)이다.',
      'IE를 활용(かつよう)하여 제조 작업(せいぞうさぎょう)의 개선(かいぜん)을 수행(じっこ)하는 것은 原価改善(げんかかいぜん)에 도움이 된다.',
      '源流管理(げんりゅうかんり)로서 제품(せいひん)의 开发・設計段階(せっけいだんかい)において VE(ブイイー)를 활용(かつよう)하는 것은 原価企画(げんかきかく)에 도움이 된다.'
    ],
    optionsJa: [
      '標準原価計算(ひょうじゅんげんかけいさん)은 企画・開発段階(きかく・かいはつだんかい)の 原価低減(げんかていげん)에有帮助(やくだつ)하는 原価管理手法(げんかかんりしゅほう)이다.',
      '原価企画(げんかきかく)은 제품(せいひん)의 開発・設計段階(せっけいだんかい)において 原価(げんか)를 만들어가는 原価管理手法(げんかかんりしゅほう)이다.',
      'IE(アイイー)를活用(かつよう)하여製造作業(せいぞうさぎょう)の改善(かいぜん)をを行う(おこな) 것은 原価改善(げんかかいぜん)에有帮助(やくだつ).',
      '源流管理(げんりゅうかんり)로서製品(せいひん)の開発・設計段階(せっけいだんかい)においてVE(ヴイイー)를活用(かつよう)하는 것은 原価企画(げんかきかく)에有帮助(やくだつ)한다.'
    ],
    optionsId: [
      'Kalkulasi biaya standar adalah teknik manajemen biaya yang membantu mengurangi biaya pada tahap perencanaan dan pengembangan.',
      'Perencanaan biaya adalah teknik manajemen biaya yang membentuk biaya pada tahap pengembangan dan desain produk.',
      'Menerapkan IE untuk meningkatkan operasi manufaktur membantu perbaikan biaya.',
      'Menggunakan VE pada tahap pengembangan dan desain produk sebagai manajemen sumber daya membantu perencanaan biaya.'
    ],
    correctIndex: 0,
    explanation: '標準原価計算(ひょうじゅんげんかけいさん)은 이미 발생한 原価(げんか)의 管理(かんり)가 목적(もくてき)이므로, 企画・開発段階(きかく・かいはつだんかい)의 原価低減(げんかていげん)에는 도움이 되지 않는다.',
    explanationJa: '標準原価計算(ひょうじゅんげんかけいさん)은 이미 발생한 原価(げんか)의 管理(かんり)가 목적(もくてき)이므로, 企画・開発段階(きかく・かいはつだんかい)의 原価低減(げんかていげん)에는 도움이 되지 않는다.',
    explanationId: 'Kalkulasi biaya standar adalah untuk mengelola biaya yang sudah terjadi, sehingga tidak membantu pengurangan biaya pada tahap perencanaan dan pengembangan.'
  },
  {
    id: 31,
    section: 'gino2',
    question: '問題31. 原価の構成に関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題31. 原価(げんか)の 構成(こうせい)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 31. Deskripsi yang paling tidak tepat tentang komposisi biaya adalah?',
    options: [
      '原価(げんか)의 3要素(ようそ)는 材料費(ざいりょうひ), 労務費(ろうむひ) 및 経費(けいひ)로 구성(こうせい)된다.',
      '総原価(そうげんか)와 製造原価(せいぞうげんか)는 같다.',
      '原価(げんか)는 操業度(そうぎょうど)와의 관련(かんれん)에 의해 固定費(こていひ)와 変動費(へんどうひ)로 분류(ぶんるい)된다.',
      '原価(げんか)는 製品(せいひん)과의 관련(かんれん)에 의해 直接費(ちょくせつひ)와 間接費(かんせつひ)로 분류(ぶんるい)된다.'
    ],
    optionsJa: [
      '原価(げんか)の3要素(ようそ)은 材料費(ざいりょうひ)、労務費(ろうむひ)및 経費(けいひ)에서 구성(こうせい)된다.',
      '総原価(そうげんか)와 製造原価(せいぞうげんか)는 같다(ひと).',
      '原価(げんか)는 操業度(そうぎょうど)와의 관련(かんれん)에 의해 固定費(こていひ)와 変動費(へんどうひ)로 분류(ぶんるい)된다.',
      '原価(げんか)는 製品(せいひん)との関連(かんれん)에 의해 直接費(ちょくせつひ)와 間接費(かんせつひ)로 분류(ぶんるい)된다.'
    ],
    optionsId: [
      'Tiga elemen biaya terdiri dari biaya material, biaya tenaga kerja, dan biaya overhead.',
      'Total biaya dan biaya produksi adalah sama.',
      'Biaya diklasifikasikan menjadi biaya tetap dan biaya variabel berdasarkan hubungannya dengan tingkat operasi.',
      'Biaya diklasifikasikan menjadi biaya langsung dan biaya tidak langsung berdasarkan hubungannya dengan produk.'
    ],
    correctIndex: 1,
    explanation: '総原価(そうげんか)는 製造原価(せいぞうげんか)에 販売費(はんばいひ)및 一般管理費(いっぱんかんりひ)를 加算(かさん)한 것이므로, 等しい(ひと)하지 않다.',
    explanationJa: '総原価(そうげんか)는 製造原価(せいぞうげんか)에 販売費(はんばいひ) 및 一般管理費(いっぱんかんりひ)를 加算(かさん)한 것이므로, 等しい(ひと)하지 않다.',
    explanationId: 'Total biaya adalah biaya produksi ditambah biaya penjualan dan biaya umum, sehingga tidak sama.'
  },
  {
    id: 32,
    section: 'gino2',
    question: '問題32. 標準原価計算の管理サイクルにおけるステップに関する記述として最も不適切なものは、次のうちどれか。',
    questionJa: '問題32. 標準原価計算(ひょうじゅんげんかけいさん)の 管理サイクル(かんりサイクル)における ステップ(すてップ)에 관한 기술(ぎじゅつ)으로서 가장 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 32. Deskripsi yang paling tidak tepat tentang langkah-langkah dalam siklus manajemen kalkulasi biaya standar adalah?',
    options: [
      '原価標準(げんかひょうじゅん)의 설정(せってい)',
      '生産活動(せいさんかつどう)의 실시(じっし)와 原価(げんか)의 추정(みつも)',
      '原価標準(げんかひょうじゅん)과 実際原価(じっさいげんか)의 차이 분석(さいぶんせき)·원인 추구(げんいんついきゅう)',
      '시정 조치(せいさくそち)의 수립(たて)和 실행(じっこう)'
    ],
    optionsJa: [
      '原価標準(げんかひょうじゅん)の設定(せってい)',
      '生産活動(せいさんかつどう)の実施(じっし)와 原価(げんか)の見積(みつも)',
      '原価標準(げんかひょうじゅん)と実際原価(じっさいげんか)の差異分析(さいぶんせき)・原因追求(げんいんついきゅう)',
      '是正措置(せいさくそち)の策定(さくてい)・実行(じっこう)'
    ],
    optionsId: [
      'Penetapan standar biaya',
      'Pelaksanaan aktivitas produksi dan estimasi biaya',
      'Analisis varians antara biaya standar dan biaya aktual, pencarian penyebab',
      'Penyusunan dan pelaksanaan tindakan korektif'
    ],
    correctIndex: 1,
    explanation: '원가 표준과 실제 원가의 차이 분석에서 원가 추정이 먼저 수행되어야 한다.',
    explanationJa: '원가 표준과 실제 원가의 차이 분석에서 원가 추정이 먼저 수행되어야 한다.',
    explanationId: 'Dalam analisis varians antara biaya standar dan aktual, estimasi biaya harus dilakukan terlebih dahulu.'
  },
  {
    id: 33,
    section: 'gino2',
    question: '問題33. VEのアプローチによる原価低減に関する記述として適切なものは、次のうちどれか。',
    questionJa: '問題33. VE(ブイイー)의 접근 방식(アプローチ)에 의한 原価低減(げんかていげん)에 관한 기술(ぎじゅつ)으로서 적절(てきせつ)한 것은?',
    questionId: 'Soal 33. Deskripsi yang tepat tentang pengurangan biaya melalui pendekatan VE adalah?',
    options: [
      '제품 설계(せいひんせっけい)において, 보다 저렴(より安宜)한 代替材料(だいたいざいりょう)로 변경(へんこう)한다.',
      '生産管理(せいさんかんり)において, 手待(てま)ち 시간(じかん), 段取(だんど)리 시간(じかん) 등의 시간(じかん)을 단축(たんしゅく)한다.',
      '品質管理(ひんしつかんり)において, 不適合品(ふてきごうひん)의 발생(はっせい)을 방지(ぼうし)한다.',
      '在庫管理(ざいこかんり)において, 在庫(ざいこ)를 감소(げんしょう)시킨다.'
    ],
    optionsJa: [
      '製品設計(せいひんせっけい)において、より低廉(てitchen)な代替材料(だいたいざいりょう)に変更(へんこう)する.',
      '生産管理(せいさんかんり)において、手待(てま)ち時間(じかん)、段取(だんど)り時間(じかん)どの時間(じかん)を短縮(たんしゅく)する.',
      '品質管理(ひんしつかんり)において、不適合品(ふてきごうひん)の発生(はっせい)を防止(ぼうし)する.',
      '在庫管理(ざいこかんり)において、在庫(ざいこ)を削減(さくげん)する.'
    ],
    optionsId: [
      'Dalam desain produk, ubah ke bahan pengganti yang lebih murah.',
      'Dalam manajemen produksi, skurangi waktu tunggu, waktu setup, dll.',
      'Dalam manajemen kualitas, cegah terjadinya produk cacat.',
      'Dalam manajemen persediaan, kurangi inventaris.'
    ],
    correctIndex: 0,
    explanation: 'VE의 접근 방식에서는 代替材料(だいたいざいりょう)를 利用(りよう)하여 原価低減(げんかていげん)을 实现(じつげん)한다.',
    explanationJa: 'VE(ブイイー)の 접근方式(あ 프로치)에서는 代替材料(だいたいざいりょう)를 利用(りよう)하여 原価低減(げんかていげん)을 实现(じつげん)한다.',
    explanationId: 'Dalam pendekatan VE, pengurangan biaya dicapai dengan menggunakan bahan pengganti.'
  },
  {
    id: 34,
    section: 'gino2',
    question: '問題34. 納期管理の考え方に関する記述として不適切なものは、次のうちどれか。',
    questionJa: '問題34. 納期管理(のうきかんり)의 考(かんが)え方(かた)에 관한 기술(ぎじゅつ)으로서 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 34. Deskripsi yang tidak tepat tentang konsep manajemen tenggat adalah?',
    options: [
      '納期管理(のうきかんり)의 目的(もくてき)은 指定(き)된 納期(のうき)대로 品物(しなもの)을 顧客(かかく) 또는 後工程(あとこうてい)에 交付(のうにゅう)하는 것이다.',
      '指定(き)된 納期(のうき)대로라는 것은 早期納入(そうきのうにゅう)을 방지(ふせ)하는 것도 포함(ほうがん)된다.',
      '納期(のうき)를 지키면 販売活動(はんばいかつどう)을 有利(ゆうり)에 할 수 있다.',
      '個別受注生産(こべつじゅちゅうせいさん)의 納期管理(のうきかんり)에서는 生産速度(せいさんそくど)의 維持(いじ)를 중시(じゅうし)한 管理(かんり)가 가장 중요하다.'
    ],
    optionsJa: [
      '納期管理(のうきかんり)の目的(もくてき)은決められた納期(のうき)どおりに品物(しなもの)を顧客(かかく)または後工程(あとこうてい)に納入(のうにゅう)することである.',
      '決められた納期(のうき)どおりとは、早期納入(そうきのうにゅう)を防ぐ(ふせ)ことも含まれる.',
      '納期(のうき)を守(まも)ることにより販売活動(はんばいかつどう)を有利(ゆうり)にすることができる.',
      '個別受注生産(こべつじゅちゅうせいさん)の納期管理(のうきかんり)では、生産速度(せいさんそくど)を維持(いじ)することを重視(じゅうし)した管理(かんり)が最も重要(じゅうよう)である.'
    ],
    optionsId: [
      'Tujuan manajemen tenggat adalah mengirimkan barang kepada pelanggan atau proses berikutnya pada tenggat yang ditentukan.',
      'Pada tenggat yang ditentukan juga termasuk pencegahan pengiriman awal.',
      'Dengan menjaga tenggat, aktivitas penjualan dapat dilakukan dengan menguntungkan.',
      'Dalam manajemen tenggat produksi sesuai pesanan, manajemen yang mengutamakan mempertahankan kecepatan produksi adalah yang paling penting.'
    ],
    correctIndex: 3,
    explanation: '個別受注生産(こべつじゅちゅうせいさん)에서는 品質(ひんしつ) 관리와 工程(こうてい) 管理(かんり)가 가장 중요(じゅうよう)하며, 生産速度(せいさんそくど)의 維持(いじ)만으로는 부족(ふそく)하다.',
    explanationJa: '個別受注生産(こべつじゅちゅうせいさん)에서는 品質(ひんしつ) 관리와 工程(こうてい) 管理(かんり)가 가장 중요(じゅうよう)하며, 生産速度(せいさんそくど)の 維持(いじ)만으로는 부족(ふそく)하다.',
    explanationId: 'Dalam produksi sesuai pesanan, kualitas dan manajemen proses adalah yang paling penting, dan hanya mempertahankan kecepatan produksi tidak cukup.'
  },
  {
    id: 35,
    section: 'gino2',
    question: '問題35. 物流部門における納入時のトラブルを未然に防止する方法として最も不適切なものは、次のうちどれか。',
    questionJa: '問題35. 物流部門(ぶつりゅうぶもん)における 納入時(のうにゅうじ)の トラブル(ちらく)를 未然(みぜん)에 防止(ふせい)する方法(ほうほう)으로서 가장 부적절(ふてきせつ)なものは?',
    questionId: 'Soal 35. Cara yang paling tidak tepat untuk mencegah masalah saat pengiriman di departemen logistik adalah?',
    options: [
      '納入時(のうにゅうじ)에 产品(せいひん)의 파손(はそん)이나scratch(きず)가 없도록 梱包方法(こんぽうほうほう)을工夫(くふう)한다.',
      '納入時(のうにゅうじ)의 運行作業(うんぱんさぎょう)을 효율적(こうりつてき)으로 수행(おこな)하기 위해 運行作業(うんぱんさぎょう)을 표준화(ひょうじゅんか)한다.',
      '納入時(のうにゅうじ)에 정확(ただ)히 배송(はいそう)되도록 住所(じゅうしょ)나 宛先(あてさき)을 数据库(データベース)로 管理(かんり)한다.',
      '納入時(のうにゅうじ)에 道路(どうろ)혼잡(こんざつ)을 고려(ふ)하고, 배송 시간(はいそうじかん)을 최소화(さいしょうか)하도록 ルート(ると)를 고착(こちゃく)화한다.'
    ],
    optionsJa: [
      '納入時(のうにゅうじ)에製品(せいひん)의파손(はそん)나傷(きず)가없도록梱包方法(こんぽうほうほう)을工夫(くふう)한다.',
      '納入時(のうにゅうじ)の運送作業(うんぱんさぎょう)を効率的(こうりつてき)に行う(おこな)ために、作業(さぎょう)를標準化(ひょうじゅんか)한다.',
      '納入時(のうにゅうじ)に正確(ただ)く配送(はいそう)されるように、住所(じゅうしょ)や宛先(あてさき)をデータベース(でーたべース)で管理(かんり)する.',
      '納入時(のうにゅうじ)に道路(どうろ)混雑(こんざつ)を踏(ふ)まえ、配送時間(はいそうじかん)を最小化(さいしょうか)するように、ルート(ると)를固定(こてい)化する.'
    ],
    optionsId: [
      'Buat metode pengemasan untuk mencegah kerusakan atau goresan pada produk saat pengiriman.',
      'Standardisasi operasi pengangkutan untuk melakukan pengiriman secara efisien.',
      'Kelola alamat dengan database untuk pengiriman yang akurat.',
      'Pertimbangkan kemacetan jalan dan pertimbangkan untuk membekukan rute untuk meminimalkan waktu pengiriman.'
    ],
    correctIndex: 3,
    explanation: '道路(どうろ)혼잡(こんざつ)을 고려(ふ)할 때, 오히려 ルoute(ると)를 유연(ゆうぜん)하게 변경(へんこう)해야 한다.',
    explanationJa: '道路(どうろ)혼잡(こんざつ)을 고려(ふ)할 때, 오히려 루트(ると)를 유연(ゆうぜん)하게 변경(へんこう)해야 한다.',
    explanationId: 'Ketika mempertimbangkan kemacetan jalan, justru harus mengubah rute secara fleksibel, bukan membekukannya.'
  },
  {
    id: 36,
    section: 'gino2',
    question: '問題36. 納期遅延に関する再発防止対策として不適切なものは、次のうちどれか。',
    questionJa: '問題36. 納期遅延(のうきちえん)에 관한 再発防止(さいはつぼうし)対策(たいさく)에 부적절(ふてきせつ)한 것은?',
    questionId: 'Soal 36. Yang tidak tepat sebagai tindakan untuk mencegah kekambuhan keterlambatan tenggat adalah?',
    options: [
      '対応策(たいおうさく)를 실시(じっし)하고, 그 결과(けっか)에 대해서도 책임(せきにん)을 지도록 노력(つと)한다.',
      '가능한 한, 下流工程(かりゅうこうてい)において 遅延(ちえん)의 原因(げんいん)을 발견(はっけん)한다.',
      '긴급 대응(きんきゅうたいおう)과 根本的(こんぽんてき) 대응策(たいおうさく)으로 分類(ぶんるい)하여 考(かんが)える.',
      '納期遅延(のうきちえん)의 原因(げんいん)을 철저히 추궁(てっていてきついきゅう)하고, 책임 체제(せきにんたいせい)를 정리(せいり)한다.'
    ],
    optionsJa: [
      '対応策(たいおうさく)を実行(じっこう)し、その結果(けっか)についても責任(せきにん)を持(も)たせるように努(つと)める.',
      '可能(かのう)な限(かぎ)り、下流工程(かりゅうこうてい)において遅延(ちえん)の原因(げんいん)を 발견(はっけん)する.',
      '緊急(きんきゅう)対応(たいおう)するとこсь, 根本的(こんぽんてき)対応策(たいおうさく)에分(わ)けて 考(かんが)える.',
      '納期遅延(のうきちえん)の原因(げんいん)를 철저히(てっていてき)에追究(ついきゅう)하고, 責任体制(せきにんたいせい)를整(ととの)える.'
    ],
    optionsId: [
      'Berusaha memastikan bahwa tanggung jawab juga ditanggung untuk hasil dari tindakan korektif.',
      'Jika mungkin, menemukan penyebab penundaan di proses hilir.',
      'Pertimbangkan untuk membagi menjadi respons darurat dan tindakan respons fundamental.',
      'Selidiki彻底原因 keterlambatan tenggat dan perbaiki sistem tanggung jawab.'
    ],
    correctIndex: 1,
    explanation: '遅延(ちえん)의 原因(げんいん)은 下流工程(かりゅうこうてい)이 아닌 上流工程(じょうりゅうこうてい)에서 발견(はっけん)해야 한다.',
    explanationJa: '遅延(ちえん)の 原因(げんいん)은 下流工程(かりゅうこうてい)이 아닌 上流工程(じょうりゅうこうてい)에서 발견(はっけん)해야 한다.',
    explanationId: 'Penyebab keterlambatan harus ditemukan di proses hulu, bukan di proses hilir.'
  },
  {
    id: 37,
    section: 'gino2',
    question: '問題37. 労働災害発生状況を示す尺度に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題37. 労働災害(ろうどうさいがい)発生状況(はっせいじょうきょう)을 表示(ひょうじ)하는 尺度(しゃくど)에 관한 기술(ぎじゅつ)으로서 가장 적절(てきせつ)한 것은?',
    questionId: 'Soal 37. Deskripsi yang paling tepat tentang skala yang menunjukkan situasi发生的劳工灾害 adalah?',
    options: [
      '強度率(きょうどりつ)은 1,000 延(の)べ実労働時間(じつろうどうじかん)당 에 발생하는 延(の)べ労働損失日数(ろうどうそんしつにっすう)이다.',
      '度数率(どすうりつ)은 10万(じゅうまん) 延(の)べ実労働時間(じつろうどうじかん)当たり에 발생하는 死傷者数(ししょうしゃすう)이다.',
      '度数率(どすうりつ)은 労働時間(ろうどうじかん)나 労働日数(ろうどうにっすう)에 변동(へんどう)이 많은 사업장(じぎょうじょう)에는 부적합(ふてきごう)이다.',
      '年千人率(ねんせんにんりつ)은 연간 평균 노동자 수 1,000명당 1년(ねんかん)에 발생하는 延(の)べ労働損失日数(ろうどうそんしつにっすう)이다.'
    ],
    optionsJa: [
      '強度率(きょうどりつ)은 1,000 延(の)べ実労働時間(じつろうどうじかん)당 에 발생하는 延(の)べ労働損失日数(ろうどうそんしつにっすう)이다.',
      '度数率(どすうりつ)은 10万(じゅうまん) 延(の)べ実労働時間(じつろうどうじかん)当たり에 발생하는 死傷者数(ししょうしゃすう)이다.',
      '度数率(どすうりつ)은 労働時間(ろうどうじかん)나 労働日数(ろうどうにっすう)に変動(へんどう)が多い事業場(じぎょうじょう)には不向き(ふむき)이다.',
      '年千人率(ねんせんにんりつ)은 年間平均労働者数(ねんかんへいきんろうどうしゃすう) 1,000人(にん)당 1年間(ねんかん)에 발생하는 延(の)べ労働損失日数(ろうどうそんしつにっすう)이다.'
    ],
    optionsId: [
      'Tingkat intensitas adalah jumlah hari kerugian tenaga kerja per 1.000 jam kerja aktual.',
      'Tingkat frekuensi adalah jumlah korban cidera per 100.000 jam kerja aktual.',
      'Tingkat frekuensi tidak cocok untuk usaha dengan fluktuasi besar dalam jam kerja atau hari kerja.',
      'Tingkat per seribu orang adalah jumlah hari kerugian tenaga kerja yang terjadi dalam setahun per 1.000 pekerja rata-rata pertahun.'
    ],
    correctIndex: 0,
    explanation: '強度率(きょうどりつ)은 1,000 延(の)べ実労働時間(じつろうどうじかん)당 延(の)べ労働損失日数(ろうどうそんしつにっすう)로서, 重度(じゅうど)를 나타내는 尺度(しゃくど)이다.',
    explanationJa: '強度率(きょうどりつ)은 1,000 延(の)べ実労働時間(じつろうどうじかん)당 延(の)べ労働損失日数(ろうどうそんしつにっすう)로서, 重度(じゅうど)를 나타내는 尺度(しゃくど)이다.',
    explanationId: 'Tingkat intensitas adalah jumlah hari kerugian tenaga kerja per 1.000 jam kerja aktual, yang merupakan skala yang menunjukkan tingkat keparahan.'
  },
  {
    id: 38,
    section: 'gino2',
    question: '問題38. 労働安全衛生法令に定める労働者の就業に当たっての安全衛生教育に関する記述として最も適切なものは、次のうちどれか。',
    questionJa: '問題38. 労働安全衛生法令(ろうどうあんぜんえいせいほうれい)에 규정(きてい)된 労働者(ろうどうしゃ)의 就業(しゅうぎょう)에 당(あ)たって의 安全衛生教育(あんぜんえいせいきょういく)에 관한 기술(ぎじゅつ)으로서 가장 적절(てきせつ)한 것은?',
    questionId: 'Soal 38. Deskripsi yang paling tepat tentang pendidikan keselamatan dan kesehatan kerja yang ditentukan oleh undang-undang keselamatan dan kesehatan kerja adalah?',
    options: [
      '作業内容変更時(さぎょうないようへんこうじ)의 教育(きょういく)은, 변경(へんこう)하는 業務(ぎょうむ)이 危険有害業務(きけんゆうがいぎょうむ)에 해당(たいおう)하는 경우에 제한(せいげん)할 수 있다.',
      '새로 功能(かのう)을 務(つと)めることとなった 作業主任者(さぎょうしゅにんしゃ)는, 규정(さだ)められた 職長等(しょくちょうとう)の 安全衛生教育(あんぜんえいせいきょういく)을 수강(じゅこう)해야 한다.',
      '고용入れ時(やといいれじ)의 安全衛生教育(あんぜんえいせいきょういく)은 규정(さだ)められた 教育科目(きょういくかもく)의 전부 또는 일부에 대해, 職業訓練(しょくぎょうくんれん)를 받은 자 등으로서 충분(じゅうぶん)한 知識技能(ちしきぎのう)이 있으면, 그 部分(ぶぶん)을省略(しょうりゃく)할 수 있다.',
      '政令(せいれい)으로 규정(さだ)める 就業制限(しゅうぎょうせいげん)에 해당(たいおう)하는 業務従事者(ぎょうむじゅうじしゃ)는, 安全衛生水準向上(あんぜんえいせいすいじゅんこうじょう)를 위한 教育(きょういく)을 수강(じゅこう)해야 한다.'
    ],
    optionsJa: [
      '作業内容変更時(さぎょうないようへんこうじ)の教育(きょういく)은、变更(へんこう)する業務(ぎょうむ)가危険有害業務(きけんゆうがいぎょうむ)場合(ばあい)에限定(げんてい)할 수 있다.',
      '新たに職務(しんくにしょくむ)에就(つ)くこととなった作業主任者(さぎょうしゅにんしゃ)는、所定(さだ)められた職長等(しょくちょうとう)の安全衛生教育(あんぜんえいせいきょういく)을 수강(じゅこう)해야 한다.',
      '雇入れ時(やといいれじ)の安全衛生教育(あんぜんえいせいきょういく)은、所定(さだ)められた教育科目(きょういくかもく)의全部(ぜんぶ)または一部(いちぶ)に関し、職業訓練(しょくぎょうくんれん)을 받은者(もの)などで十分(じゅうぶん)な知識技能(ちしきぎのう)가あれば、その一部(いちぶ)を省略(しょうりゃく)할 수 있다.',
      '政令(せいれい)で定(さだ)める就業制限(しゅうぎょうせいげん)にかかる業務従業者(ぎょうむじゅうじしゃ)는、安全衛生水準向上(あんぜんえいせいすいじゅんこうじょう)の教育(きょういく)을 수강(じゅこう)해야 한다.'
    ],
    optionsId: [
      'Pendidikan saat perubahan konten kerja dapat dibatasi untuk kasus di mana bisnis yang diubah adalah bisnis yang berbahaya.',
      'Peranggung jawab kerja yang baru harus menyelesaikan pendidikan keselamatan dan kesehatan yang ditentukan untuk pemimpin dll.',
      'Pendidikan keselamatan dan kesehatan saat onboarding dapat mengurangi bagian dari program jika Anda memiliki pengetahuan dan keterampilan yang cukup dari pelatihan kejuruan.',
      'Pekerja yang terkena batasan kerja harus menyelesaikan pendidikan untuk meningkatkan standar keselamatan dan kesehatan.'
    ],
    correctIndex: 2,
    explanation: '교육 시간의 전부 또는 일부를 管徇(かんけいえん)받을 경우, 그 부분을 省略(しょうりゃく)할 수 있다.',
    explanationJa: '교육 시간의 전부 또는 일부를 管徇(かんけいえん)받을 경우, 그 부분을 省略(しょうりゃく)할 수 있다.',
    explanationId: 'Jika Anda telah menerima pelatihan kejuruan untuk seluruh atau sebagian dari mata pelajaran yang ditentukan, bagian tersebut dapat dihilangkan.'
  },
  {
    id: 39,
    section: 'gino2',
    question: '問題39. 環境基本法において具体的な数値による環境基準が定められている項目として適切なものは、次のうちどれか。',
    questionJa: '問題39. 環境基本法(かんきょうきほんほう)において 具体的(ぐたいてき)な 数値(すうち)에 의한 環境基準(かんきょうきじゅん)가 定(さだ)められている 項目(こうもく)로서 적절(てきせつ)한 것은?',
    questionId: 'Soal 39. Item yang tepat sebagai item yang memiliki standar lingkungan dengan nilai spesifik yang ditetapkan dalam Undang-Undang Basic Lingkungan adalah?',
    options: [
      '振動(しんどう)',
      '悪臭(あくしゅう)',
      '土壌汚染(どじょうおせん)',
      '地盤沈下(じばんちんか)'
    ],
    optionsJa: [
      '振動(しんどう)',
      '悪臭(あくしゅう)',
      '土壌汚染(どじょうおせん)',
      '地盤沈下(じばんちんか)'
    ],
    optionsId: [
      'Getaran',
      'Bau tidak sedap',
      'Pencemaran tanah',
      'Penurunan permukaan tanah'
    ],
    correctIndex: 2,
    explanation: '環境基本法(かんきょうきほんほう)에서 구체적(ぐたいてき)인 数値(すうち)에 의한 環境基準(かんきょうきじゅん)이 定(さだ)められている 것은 土壌汚染(どじょうおせん)이다.',
    explanationJa: '環境基本法(かんきょうきほんほう)에서 구체적(ぐたいてき)인 数値(すうち)에 의한 環境基準(かんきょうきじゅん)이 定(さだ)められている 것은 土壌汚染(どじょうおせん)이다.',
    explanationId: 'Dalam Undang-Undang Basic Lingkungan, standar lingkungan dengan nilai spesifik ditetapkan untuk pencemaran tanah.'
  },
  {
    id: 40,
    section: 'gino2',
    question: '問題40. 以下に示す手順で行う環境管理活動として最も適切なものは、次のうちどれか。',
    questionJa: '問題40. 以下(いか)에示す 手順(てじゅん)으로 行(おこな)う 環境管理活動(かんきょうかんりかつどう)으로서 가장 적절(てきせつ)한ものは?',
    questionId: 'Soal 40. Aktivitas manajemen lingkungan yang paling tepat dilakukan dengan prosedur yang diunjukkan berikut ini adalah?',
    options: [
      '汚染(おせん)의 レベル(れべる)를 개선(かいぜん)할 때',
      '環境アセスメント(かんきょうアセスメント)를 수행(じっこう)할 때',
      '緊急事態(きんきゅうじたい)에 대응(たいおう)할 때',
      '기업(きぎょう)으로 行(おこな)うべき 環境課題(かんきょうかだい)를 발견(はっけん)할 때'
    ],
    optionsJa: [
      '汚染(おせん)のレベル(れべる)を改善(かいぜん)するとき',
      '環境アセスメント(かんきょうアセスメント)を実行(じっこう)するとき',
      '緊急事態(きんきゅうじたい)に対応(たいおう)するとき',
      '企業(きぎょう)として行うべき環境課題(かんきょうかだい)を見出(みだ)すとき'
    ],
    optionsId: [
      'Ketika meningkatkan tingkat pencemaran',
      'Ketika melakukan penilaian dampak lingkungan',
      'Ketika merespons keadaan darurat',
      'Ketika mengidentifikasi masalah lingkungan yang harus dilakukan oleh perusahaan'
    ],
    correctIndex: 2,
    explanation: '手順(てじゅん)은 ①応急処置(おうきゅうしょち)의 実施(じっし) ②必要箇所(ひつようかしょ)에 連絡(れんらく) ③近隣(きんりん)에 広報(こうほう) ④復旧(ふっきゅう)를 위한 措置(そち) ⑤再発防止(さいはつぼうし)로, 이는 緊急事態(きんきゅうじたい)에 대응(たいおう)하는 절차(て続き)이다.',
    explanationJa: '手順(てじゅん)은 ①応急処置(おうきゅうしょち)의 実施(じっし) ②必要箇所(ひつようかしょ)에 連絡(れんらく) ③近隣(きんりん)에 広報(こうほう) ④復旧(ふっきゅう)를 위한 措置(そち) ⑤再発防止(さいはつぼうし)로, 이는 緊急事態(きんきゅうじたい)에 대응(たいおう)하는 절차이다.',
    explanationId: 'Prosedur adalah ① implementasi pertolongan pertama ② menghubungi tempat yang diperlukan ③ menyebarkan ke lingkungan sekitar ④ langkah untuk memulihkan ⑤ mencegah terulang, yang merupakan prosedur untuk merespons keadaan darurat.'
  }
];


const SSW_QUESTIONS: Question[] = [
  { id: 1, section: 'moji', question: 'SSW(ii) の正式名称は？', options: ['Standard Software Workshop ii', 'Specialized Sheet Worker ii', 'Steel Structure Welding ii', 'Standard Specification Writing ii'], correctIndex: 2, explanation: 'SSW(ii) = Steel Structure Welding (ii級) = Kompetensi las struktur baja tingkat ii' },
  { id: 2, section: 'moji', question: '「熔接」の読み方は？', options: ['ようせつ', 'ゆうせつ', 'ようせつ', 'ゆせつ'], correctIndex: 0, explanation: '熔接（ようせつ）= welding. 「熔」= mencairkan, 「接」= menyambung' },
  { id: 3, section: 'moji', question: '「構造用鋼材」の読み方は？', options: ['こうぞうようこうざい', 'こうちくようはがね', 'けんぞうようはまだ', 'こうそうよう钢材'], correctIndex: 0, explanation: '構造用鋼材 = こうぞうようこうざい = structural steel material' },
  { id: 4, section: 'moji', question: '「板」の読み方は？', options: ['いた', 'ことは', 'かん', 'ぶつ'], correctIndex: 0, explanation: '板 = いた = plate / sheet (baja plat) digunakan dalam manufacturing' },
  { id: 5, section: 'moji', question: '「開先」の読み方は？', options: ['かいせん', 'ひらきさき', 'かいさき', ' 开始'], correctIndex: 0, explanation: '開先（かいせん）= grooving (groove untuk las). 開先加工 = groove machining' },
  { id: 6, section: 'moji', question: '「不下」の意味は？', options: ['降らない', '现场不使用', '现场 Super', '不下（ふげ）= tidak turun/material'], correctIndex: 3, explanation: '不下 = ふげ = material yang tidak diturunkan/digunakan (synonym: 不使用材)' },
  { id: 7, section: 'moji', question: '「仮付け」の読み方は？', options: ['かりつけ', 'かみつけ', 'かりどこ', 'たとえつけ'], correctIndex: 0, explanation: '仮付け（かりつけ）= tack welding = pengelasan sementara untuk holding' },
  { id: 8, section: 'moji', question: '「通り止め」の読み方は？', options: ['とおりどめ', 'かようどめ', 'つうurd', 'とめない'], correctIndex: 0, explanation: '通り止め = とおりどめ = welding stopper / stop welding at specific point' },
  { id: 9, section: 'bunpou', question: '「 steel plate ___ 切断 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を / を', 'が / に / を / に', 'の / で / を / に', 'を / で / を / に'], correctIndex: 3, explanation: '钢板を切断で加工を行う = memotong dan memproses plat baja.「を」object,「で」 alat/purpose,「を」object,「に」direction' },
  { id: 10, section: 'bunpou', question: '「開先 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を', 'に / で / に', 'の / の / を', 'を / で / を'], correctIndex: 3, explanation: '開先を加工を行う = melakukan groove machining.「を」(objek),「で」= menggunakan,「を」(objek)' },
  { id: 11, section: 'bunpou', question: '「この钢材 ___ 使用 ___ 済み ___ です」\n正しいのは？', options: ['は / が / を', 'は / に / だ', 'が / は / だ', 'は / だ / に'], correctIndex: 1, explanation: 'この钢材は使用済みだ = Material ini sudah dipakai. 使用済み = しようずみ = already used' },
  { id: 12, section: 'bunpou', question: '「仮付け ___ 行い ___ ます ___ 」\n正しい敬語は？', options: ['を / を / ます', 'に / を / します', 'を / を / します', 'は / が / です'], correctIndex: 2, explanation: '仮付けを行う → 仮付け为您做します (keigo). いたします = humble form of します' },
  { id: 13, section: 'bunpou', question: '「不通」の反対は？', options: ['不通（ふつう）', '痛通（つうつう）', '通了（とおり）', '通線（つうせん）'], correctIndex: 2, explanation: '不通（ふつう）= blocked/not passable. 通了（とおり）= can pass through / 完了した' },
  { id: 14, section: 'bunpou', question: '「検査 ___ 合格 ___ しました」\n正しい助詞は？', options: ['は / が', 'が / に', 'を / に', 'の / を'], correctIndex: 1, explanation: '検査が合格しました = inspection passed.「が」subject,「に」direction (result)' },
  { id: 15, section: 'dokkai', question: '「 SSW(ii) 試験では、構造用鋼材に対する熔接技術と安全管理が出題範囲です。実技試験では、板熔接と-tube熔接が表示されます。」\n\n質問：実技試験の内容は？', options: [' только 学科試験', '板熔接と-tube熔接', '安全管理の面接', '材料の切断'], correctIndex: 1, explanation: '板熔接 = plat welding. tube熔接 = pipa welding. 实技 = じつぎ = practical test' },
  { id: 16, section: 'dokkai', question: '「不开 ERP 系统，你们就无法进行工程管理。」\n\n質問：この文の意図は？', options: ['ERP系统很难使用', '不开ERP就无法管理工程', '他们没有电脑', '需要先买机器'], correctIndex: 1, explanation: '不开 = tidak membuka. 无法 = tidak bisa. 工程管理 = 工程管理 (engineering management). 隐含：必须使用系统才能管理' },
  { id: 17, section: 'dokkai', question: '「熔接施工 hier werden 检查后，后续加工に進みます。」\n\n質問：熔接施工後の工程は？', options: ['検査してから次工程', 'そのまま終了', 'やり直し', '在庫保管'], correctIndex: 0, explanation: '検査して = after inspection. 后续加工 = こうずいかこう = subsequent processing. 進みます = proceeds to' },
  { id: 18, section: 'dokkai', question: '「 nosso factory 采用了严格的品质管理系统，所有钢材均经过来料檢驗后才入庫。」\n\n質問：品質管理在哪裡做？', options: ['入库前（来料检验）', '出厂前', '生产中', '随机抽查'], correctIndex: 0, explanation: '来料检验 = らいりけんせき = incoming material inspection. 入庫前 = sebelum storage. 严格的 = ketat' },
  { id: 19, section: 'dokkai', question: '「安全第一が 우리 工場の 基本方針です。作業员は защитный снаряжение 를 필수로 착용해야 합니다。」\n\n質問：作業員に必要なことは？', options: ['英語能力', ' защитный снаряжение 필수 착용', '資格所持', '中国語堪能'], correctIndex: 1, explanation: '保護具 = ほごぐ = protective equipment. 着用 = ちゃくよう = to wear. 必须 = ひつぜん = wajib/mandatory' },
  { id: 20, section: 'dokkai', question: '「この钢材は 不通 のため、使用できません。」\n\n質問：钢材的问题是什么？', options: ['型号不对', '已不通（使用済み）', '太贵了', '刚到货'], correctIndex: 1, explanation: '不通 = ふつう = blocked / 不使用. 已经完成焊接且检查不合格的材料不能再次使用' },
];

// Demo questions - real N5 style
const DEMO_QUESTIONS: Question[] = [
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
  { id: 11, section: 'bunpou', question: '「わたし ___ がくせい です」\n正しい助詞は？', options: ['の', 'は', 'を', 'に'], correctIndex: 1, explanation: '「は」は主題を示す助詞 (topic marker) = I am a student.' },
  { id: 12, section: 'bunpou', question: '「ねこ ___ みず ___ のみます」', options: ['が / を', 'を / が', 'は / を', 'に / が'], correctIndex: 1, explanation: '「を」は直接目的語、「が」は主語を示す。= The cat drinks water.' },
  { id: 13, section: 'bunpou', question: '「これから ___ いきます」\n正しいのは？', options: ['に', 'へ', 'で', 'を'], correctIndex: 1, explanation: '「へ」は方向を示す。= I will go from now on.' },
  { id: 14, section: 'bunpou', question: 'Which sentence is correct?', options: ['私 は 走る.', '私 は 走ります.', '私 走る.', 'は私 走ります.'], correctIndex: 1, explanation: '「ます」は動詞の丁寧形。= I run (polite).' },
  { id: 15, section: 'bunpou', question: '「 tome ___ 」\nWhat comes after 止め?', options: ['ます', 'って', 'て', 'た'], correctIndex: 2, explanation: '「止めて」(te-form) = stop (command/polite request)' },
  { id: 16, section: 'bunpou', question: '「 ___ 図書館 ___ 本 ___ 読みます」', options: ['で / を', 'に / が', 'へ / を', 'で / が'], correctIndex: 0, explanation: '「で」は場所、「を」は目的語。= I read books at the library.' },
  { id: 17, section: 'bunpou', question: 'Which is the te-form of 食べる?', options: ['食べます', '食べて', '食べた', '食べって'], correctIndex: 1, explanation: '「て」form of 食べる → 食べて (tabete)' },
  { id: 18, section: 'bunpou', question: '「 ___ 、雨です ___ 」\nComplete with contrast', options: ['しかし / です', 'でも / だ', 'けれど / です', 'それでは /'], correctIndex: 2, explanation: '「けれど」= but/however (contrasting sentence)' },
  { id: 19, section: 'bunpou', question: '「 university ___ 行きます ___ 」\n正しい助詞は？', options: ['に / が', 'へ / を', 'に / を', 'で / に'], correctIndex: 2, explanation: '「に」= destination, 「を」= object (go to university).' },
  { id: 20, section: 'bunpou', question: 'Which is the past tense of 飲む?', options: ['飲んでいます', '飲みます', '飲みました', '飲むでしょう'], correctIndex: 2, explanation: '「ました」= past tense polite. 飲みました = drank.' },
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
  gino2: { name: 'GINO2 令和3年度', description: 'CBT GINO2 Manufakturing', icon: '🎯', duration: '40 questions' },
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
  const examType = searchParams.get('type') || 'n5';

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const timerDuration = examType === 'karier' || examType === 'ssw' || examType === 'gino2' ? 90 * 60 : 30 * 60;
  const [timeLeft, setTimeLeft] = useState(timerDuration);

  const filteredQuestions = useMemo(() => {
    if (examType === 'karier') return KARIER_QUESTIONS;
    if (examType === 'ssw') return SSW_QUESTIONS;
    if (examType === 'gino2') return GINO2_QUESTIONS;
    return DEMO_QUESTIONS;
  }, [examType]);

  const currentQ = filteredQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

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
    const startTimerDuration = examType === 'karier' || examType === 'ssw' || examType === 'gino2' ? 90 * 60 : 30 * 60;
    setTimeLeft(startTimerDuration);
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
  };

  const scores = useMemo(() => {
    const total = filteredQuestions.length;
    const sectionKeys = examType === 'karier'
      ? ['seisan', 'hinshitsu', 'genka', 'anzen'] as const
      : examType === 'gino2'
      ? ['gino2'] as const
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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">
              {examType === 'karier' ? '/ CBT Karier Bisnis' : examType === 'ssw' ? '/ SSW(ii) Industrial' : examType === 'gino2' ? '/ GINO2 令和3年度' : '/ JLPT N5 Simulation'}
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                {examType === 'karier' ? '💼 CBT Karier Bisnis Manufacturing' : examType === 'ssw' ? '📋 CBT SSW(ii) Industrial Product' : examType === 'gino2' ? '🎯 CBT GINO2 令和3年度 後期' : '📝 JLPT N5 Simulation'}
              </h1>
              <p className="text-[#636E72]">
                {examType === 'karier' ? 'Simulasi CBT Karier Bisnis Manufaktur — 40 soal, 90 menit' : examType === 'ssw' ? 'Simulasi SSW(ii) Steel Structure Welding — 20 soal, 90 menit' : examType === 'gino2' ? 'Simulasi CBT GINO2 令和3年度 後期 — 40 soal, 90 menit' : 'Simulasi ujian N5 dengan 25 soal'}
              </p>
            </motion.div>

            {examType === 'n5' && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(SECTION_INFO).filter(([k]) => ['moji', 'bunpou', 'dokkai'].includes(k)).map(([key, info]) => (
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
                  💼 Start CBT Karier Bisnis (40 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}

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

            {examType === 'gino2' && (
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
                  🎯 Start CBT GINO2 (40 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}
          </>
        )}

        <AnimatePresence>
          {examStarted && !examFinished && currentQ && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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

              {examType === 'karier' || examType === 'gino2' ? (
                <FuriganaQuestion q={currentQ} showExplanation={showExplanation} answers={answers} onAnswer={handleAnswer} />
              ) : (
                <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
                  <p className="text-lg text-white whitespace-pre-line mb-6">{currentQ.question}</p>
                  <div className="space-y-3">
                    {currentQ.options.map((option, i) => {
                      const isSelected = answers[currentQ.id] === i;
                      const isCorrect = i === currentQ.correctIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => !showExplanation && handleAnswer(i)}
                          disabled={showExplanation}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                            showExplanation
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
                          {showExplanation && isCorrect && <span className="ml-2">✓</span>}
                          {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                        </button>
                      );
                    })}
                  </div>
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
              )}

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

        <AnimatePresence>
          {examFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-8 mb-6">
                <div className="text-6xl mb-4">{scores.passed ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {scores.passed ? 'LULUS! Congratulations!' : 'Belum Lulus'}
                </h2>
                <p className="text-5xl font-bold text-[#6C5CE7] mb-4">{scores.percentage}%</p>
                <p className="text-[#636E72] mb-6">
                  {scores.correct}/{scores.total} questions correct
                </p>

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

                <div className={`p-4 rounded-xl ${scores.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={scores.passed ? 'text-green-400' : 'text-red-400'}>
                    {scores.passed
                      ? '✨ Skor kamu di atas 80%! Kamu siap untuk CBT!'
                      : '📖 Kamu perlu skor 80% untuk lulus. Terus belajar!'}
                  </p>
                </div>
              </div>

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
