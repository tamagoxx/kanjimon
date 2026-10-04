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
  { id: 1, question: `問題１。 せいさん生産しすてむシステムにかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'は、せいひん製品のどのぶぶん部分をがいぶいたく外部委託するかをき決めるかつどう活動である。',
      'デザインレビューは、でせっけいしんさ設計審査をおこな行うかつどう活動である。',
      'は、ちょうたつ調達したしざい資材のうけい受入れとけんさ検査をおこな行うかつどう活動である。',
      'デザインインは、がりょうさんだ量産立ちあ上げのぎょうむ業務からかか関わることである。'
    ], correctIndex: 3, explanation: `Design-in berarti pemasok terlibat sejak tahap desain, bukan produksi` },
  { id: 2, question: `問題 ２。 さぎょうかんり作業管理のにかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'もごうりてき合理的でせいさんせい生産性のたか高いさぎょうほうほう作業方法のはっけん発見とついきゅう追求',
      '、ざいりょう材料、せつび設備、こうぐ工具、さぎょうかんきょう作業環境などのこじんべつせってい個人別設定',
      'なさぎょうしゃ作業者によるかぎょうすいこうじかん課業遂行時間のみつも見積り',
      'としてせってい設定されたさぎょうほうほう作業方法の指導'
    ], correctIndex: 1, explanation: `Manajemen kerja harus dilakukan secara standar dan terpadu, bukan terpisah` },
  { id: 3, question: `問題３． ５めい名のさぎょうしゃ作業者が、かくだいきょう拡大鏡、ピンセットとう等をしよう使用するせいみつきき精密機器のくみたてさぎょう組立作業をおこな行ったけっか結果、くみたてじかん組立時間にさいだい最大1.5のきがで出た。さいそくしゃ最速者とさいちしゃ最遅者の２にん人のさぎょうないよう作業内容をビデオカメラによりきろく記録し、さいせい再生してどうさけんきゅう動作研究をおこな行うばあい場合、このどうさけんきゅう動作研究でけんとう検討できないこうもく項目は、つぎ次のうちどれか。`, options: [
      'サーブリッグごとのはっせいひんど発生頻度',
      'をおこな行うためにひつよう必要などうさようそ動作要素',
      'のさぎょうしゃべつかどうりつ作業者別稼働率',
      'などうさ動作のすく少ないくみたてさぎょう組立作業における動作順序'
    ], correctIndex: 2, explanation: `Motion study hanya menganalisis gerakan, tidak bisa menilai efisiensi kerja secara keseluruhan` },
  { id: 4, question: `問題４． サーブリッグぶんせき分析におけるきほんどうさようそ基本動作要素のうち、しごと仕事をするうえ上でひつよう必要などうさ動作であるだいいちるい第一類のどうさようそ動作要素としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'おさえる / holding (holding)',
      'つかむ (memegang)',
      'す (meletakkan)',
      'べる (memeriksa)'
    ], correctIndex: 0, explanation: `“Menahan” adalah kondisi, bukan gerakan utama` },
  { id: 5, question: `問題５． れんごうさぎょうぶんせき連合作業分析にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      '１のさぎょうしゃ作業者が１だい台のきかい機械をたんとう担当するきょうどうさぎょう協同作業について、そのこうりつ効率をたか高めるためのぶんせき分析をおこな行うには、れんごうさぎょうぶんせき連合作業分析ではなく、かどうぶんせき稼働分析のほう方がてき適している。',
      'でりよう利用されるマンマシンチャートには、さぎょうしゃ作業者のたんどくさぎょう単独作業やきかい機械のじどううんてん自動運転をきにゅう記入するのではなく、れんごうさぎょう連合作業をきにゅう記入してぶんせき分析する。',
      'のさぎょうしゃ作業者がどうじへいれつてき同時並列的にきょうどう協同してどういつ同一のたいしょうぶつ対象物にたい対するさぎょう作業のかいぜん改善をおこな行うには、ＰＴＳほう法のぶんせき分析でなく、れんごうさぎょうぶんせき連合作業分析のほう方がてき適している。',
      '１のさぎょうしゃ作業者がどうじ同時にへいこう並行してたんとう担当できるきかい機械のも持ちだいすう台数をけんとう検討するばあい場合、れんごうさぎょうぶんせき連合作業分析ではきかい機械のゆうきゅうじかん遊休時間をきろく記録するのではなく、さぎょうしゃ作業者によるざいりょう材料のと取りつ付け・と取りはず外し、けんさ検査、うんぱん運搬などのさぎょうしゃ作業者のこうどう行動のじかん時間をきろく記録してぶんせき分析する。'
    ], correctIndex: 2, explanation: `` },
  { id: 6, question: `問題６． さぎょう作業ミスにたい対するさぎょうかいぜん作業改善にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'ポカよけとばれるフールプルーフには、いじょう異常がはっせい発生したときにさぎょうしゃ作業者へおと音やひかり光でじょうほう情報をし知らせるちゅういしき注意式というほうほう方法がある。',
      'におけるけんさ検査みすミスをぼうし防止するたいさく対策には、げんどみほん限度見本とじっさい実際をて照らしあ合わせてチェックするほうほう方法がある。',
      'るべきたいしょうぶつ対象物がどこにあるかをランプなどによってしじ指示するデジタルピッキングは、しなもの品物をと取るときのらっか落下をぼうし防止するのにゆうこう有効である。',
      'のいちぎ位置決めのせいかくせい正確性にかん関するみすミスをぼうし防止するには、つ突きあ当てがいどガイドのじぐ治具がゆうこう有効である。'
    ], correctIndex: 2, explanation: `` },
  { id: 7, question: `問題７． ５Ｓのていぎ定義にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'めたことをかなら必ずまも守ること。',
      'なものについたいぶつ異物をじょきょ除去すること。',
      'なものとふひつよう不必要なものをくべつ区別すること。',
      'のぶもん部門の５Ｓにかん関するかつどうないよう活動内容をみな皆できょうゆう共有すること。'
    ], correctIndex: 3, explanation: `` },
  { id: 8, question: `問題８． ざいこ在庫やかんしょう緩衝のきのう機能にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'がおお多すぎるばあい場合には、ほかんひよう保管費用のぞうだい増大・しきんあっか資金悪化・ざいこ在庫のちんぷか陳腐化をひ引きお起こすことがあり、いっぽう一方、せいひんざいこ製品在庫がすく少なすぎてしなぎ品切れをお起こしたばあい場合にははんばいきかい販売機会をうしな失う。',
      'においてかんしょう緩衝のきぼ規模がおお大きくなるばあい場合には、それをいじ維持するこすとコストがぞうだい増大する。',
      'におけるせいひんざいこ製品在庫には、かんしょう緩衝としてあんぜんざいこ安全在庫をかくほ確保することがのぞ望ましい。',
      'にたい対して、じっせき実績におく遅れがしょう生じたばあい場合には、そのたいさく対策の１つとして、せいさんけいかく生産計画やこうていへんせい工程編成のさい際に、あらかじめよゆう余裕となるかんしょう緩衝を組みこ込むことがある。'
    ], correctIndex: 2, explanation: `` },
  { id: 9, question: `問題９． たしゅしょうりょうせいさん多種少量生産にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'は、ラインせいさん生産にてき適しており、たか高いせいさんせい生産性でてい低こすとコストのせいひん製品の生産をめざ目指している。',
      'は、ここ個々のちゅうもん注文におう応じて、そのつど都度１かいかぎ回限りのせいさん生産をおこな行うけいたい形態のことである。',
      'は、ふくすう複数のひんしゅ品種ごとにせいさんりょう生産量をまとめて、それぞれのひんしゅ品種をこうご交互にせいさん生産するけいたい形態のことである。',
      'は、ざいりょう材料やぶひん部品からせいひん製品をせいさん生産するてじゅん手順がたよう多様であるため、せいさんこうてい生産工程のなが流れがそれぞれせいひん製品についてこと異なり、こうてい工程のなが流れもこうさく交錯する。'
    ], correctIndex: 3, explanation: `` },
  { id: 10, question: `問題10. せいひん製品のしかた方によるぶんるい分類にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'ロットでは、１つのロットにふく含まれるすうりょう数量がちい小さくなるにつれて、こうていかんしかかりひん工程間仕掛品はおお多くなり、せいさんきかん生産期間がなが長くなる。',
      'は、かくせいひん各製品のかこうじゅんじょ加工順序や、かこうじかん加工時間がるいじ類似したばあい場合にさいよう採用されるせいさんけいたい生産形態である。',
      'は、どういつ同一のせいひん製品をいっていきかんつづ一定期間続けてせいさん生産するけいたい形態である。',
      'は、ロットせいさん生産とれんぞくせいさん連続生産のちゅうかんてき中間的なせいさんけいたい生産形態である。'
    ], correctIndex: 2, explanation: `` },
  { id: 11, question: `問題11. いか以下にす＜にっていけいかく日程計画のしゅほう手法＞と＜ごく語句＞とのくみあわ組合せとしてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'Ａ：④',
      'Ａ：②',
      'Ｂ：①',
      'Ｃ：③'
    ], correctIndex: 3, explanation: `` },
  { id: 12, question: `問題12.  せいさくてはい製作手配にするきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'は、かくたんとうぶもん各担当部門におこな行わせるぎょうむ業務にたい対しててはい手配すべきひつようじこう必要事項をまとめ、それにたいおう対応したかくしゅでんぴょう各種伝票のだいちょう台帳をつく作り、それぞれのたんとうぶしょ担当部署へがいとう該当するでんぴょう伝票をはっこうおよ発行及びはいふ配布することにより、かくたんとうぶもん各担当部門にじぜんじゅんび事前準備をさせるかつどう活動である。',
      'では、さぎょう作業にひつよう必要なしざい資材、じこうぐ治工具、せっけいず設計図、さぎょうひょうじゅんしょ作業標準書などを、さぎょうかいしまえ作業開始前にそれぞれのしょくば職場に、じぜん事前にじゅんび準備しておく。',
      'は、さぎょう作業スケジュールがじつげんかのう実現可能なようにさぎょうゆうせんじゅんじょ作業優先順序をけってい決定して、ここ個々のさぎょうしゃ作業者やきかい機械にしごと仕事をわ割りあ当てるかつどう活動である。',
      'は、げんじょう現状のせいぞうかつどう製造活動のしんちょくじょうきょう進捗状況をこうりょ考慮したうえ上で、しょうにっていけいかく小日程計画をせいぞうげんば製造現場でじっし実施にうつ移すことができるように、げんばかんりしゃみずか現場管理者自らがたんとう担当しているしょくば職場のかくさぎょうしゃ各作業者やかくきかい各機械にたい対しておこな行うぜんぱんてき全般的なせいさんとうせい生産統制のかつどう活動である。'
    ], correctIndex: 0, explanation: `` },
  { id: 13, question: `問題13. におけるのげんぴん現品のインプットとアウトプットのさい差異をぶんせき分析するちょうさほうほうおよ調査方法及びちょうさたいしょう調査対象としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'さだてばん 差立盤 (dispatch board)',
      'カムアップシステム (cam-up system)',
      'りゅうどうすうきょくせん流動数曲線 (flow-number curve)',
      'せいぞうたいちょう 進度票 (progress ticket)'
    ], correctIndex: 2, explanation: `` },
  { id: 14, question: `問題14.  にするきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'は、こうすうけいかく工数計画でのよそく予測をけんしょう検証しつつ、よそく予測をこ超えたぶぶん部分についてしごと仕事のさいはいぶん再配分をおこな行うよりょく余力をばらんすバランスさせて、のうきかくほ納期確保をはか図ることをもくてき目的としている。',
      'のもくひょう目標をたっせい達成するために、しごとりょう仕事量とせいさんのうりょく生産能力のりょうしゃ両者のちょうせい調整をはか図る。',
      'ちしごとりょう仕事量のはあく把握によるよりょく余力のさんしゅつ算出は、たいしょう対象としているこうてい工程のさぎょうひょう作業票やしかかりひん仕掛品をちょうさ調査することでわかる。',
      'は、こうてい工程におけるげんざい現在のほゆうこうすう保有工数から、げんじょう現状のふかこうすう負荷工数を差しひ引いてのこ残ったぶぶん部分をいう。'
    ], correctIndex: 1, explanation: `` },
  { id: 15, question: `問題15. あるにおいて、かこ過去10ねんかん年間で３のじゅうだいさいがい重大災害がはっせい発生した。このばあい場合、ハインリッヒのほうそく法則によりかんが考えられることとしてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'のじこ事故は、やく約30けんはっせい件発生しているとえられる。',
      'のじこ事故は、やく約900けんはっせい件発生しているとえられる。',
      'は、やく約30件発生していると考えられる。',
      'は、やく約900けんはっせい件発生しているとえられる。'
    ], correctIndex: 3, explanation: `` },
  { id: 16, question: `問題16.  のにかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'をするさい際には、けんせつこうじ建設工事のしんちょく進捗やこすとコストのかんり管理をおこな行う。',
      'をするさい際には、せつびけいかく設備計画をへ経てせつびせっけい設備設計をおこな行う。',
      'をするさい際には、ほぜんけいかく保全計画をさくせい作成する。',
      'をするさい際には、ほぜんきろくほうこく保全記録報告をおこな行う。'
    ], correctIndex: 3, explanation: `` },
  { id: 17, question: `問題17.  のにふく含まれないものは、つぎ次のうちどれか。`, options: [
      '利用可用性稼働率 / Availability rate (Availability)',
      '性能稼働率 / Performance rate (Performance)',
      '品質良品率 / Quality rate (Quality)',
      '故障率 / Failure rate [BUKAN OEE]'
    ], correctIndex: 3, explanation: `` },
  { id: 18, question: `問題18.  のにかん関するこうもく項目としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'そうじ 清掃 (cleaning - machines)',
      'けいこうかんり 傾向管理 (trend monitoring)',
      '不良品修理 / Repair defective products [TIDAK termasuk!]',
      'ぶひんこうかん 部品交換 (parts replacement)'
    ], correctIndex: 2, explanation: `` },
  { id: 19, question: `問題19.  の・けんさとう検査等のかつどう活動にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'は、にちじょうほぜん日常保全、けんさ検査としゅうり修理からなる。',
      'のてんけん点検・けんさかつどう検査活動のじっし実施では、チェックリストをもち用いるとよい。',
      'のじょきょ除去、よご汚れのせいそう清掃などのしょうせいび小整備は、ほぜんぶもん保全部門がおこな行う。',
      'には、にちじょうてんけんきじゅんひょう日常点検基準表やていきてんけんきじゅんひょう定期点検基準表がある。'
    ], correctIndex: 2, explanation: `` },
  { id: 20, question: `問題20.  における＜＞と＜たいしょうしざい対象資材＞とのくみあわ組合せとしてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'Ａ：２  Ｂ：１  Ｃ：３  Ｄ：４',
      'Ａ：１  Ｂ：２  Ｃ：４  Ｄ：３',
      'Ａ：４  Ｂ：３  Ｃ：２  Ｄ：１',
      'Ａ：１  Ｂ：４  Ｃ：２  Ｄ：３'
    ], correctIndex: 1, explanation: `` },
  { id: 21, question: `問題21.  のにかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'ストラクチャでは、もっと最もかい下位のぶひん部品レベルのあたい値が０である。',
      'ストラクチャでのしょうみしょようりょう正味所要量は、しょようりょう所要量－きしゅてもちざいこりょう期首手持在庫量によりもと求める。',
      'サマリーでは、けいさんたいしょう計算対象のぶひん部品がたんぴん単品かくみたてひん組立品かのくべつ区別ができない。',
      'サマリーは、ぶひんこうせい部品構成がたんじゅん単純なものモノやけいぞくせい継続性がないものモノにてきよう適用される。'
    ], correctIndex: 0, explanation: `` },
  { id: 22, question: `問題22. とのりてん利点にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'は、しゅうちゅうはっちゅう集中発注によりこうばいかかく購買価格のひ引きさ下げができる。',
      'は、こうばいじむてつづき購買事務手続をとういつ統一できる。',
      'は、しざい資材のひょうじゅんか標準化がようい容易となる。',
      'は、かくこうじょう各工場がりっち立地するちいききぎょう地域企業にこうけん貢献できる。'
    ], correctIndex: 2, explanation: `しゅうちゅうこうばい集中購買 = murah + standar ぶんさんこうばい分散購買 = fleksibel + lokal` },
  { id: 23, question: `問題23.  をにぶんるい分類したひもく費目としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      '、こていぶつりゅうひ固定物流費、へんぴんぶつりゅうひ返品物流費、かいしゅうぶつりゅうひ回収物流費、はいきぶつりゅうひ廃棄物流費',
      '、しゃないぶつりゅうひ社内物流費、はんばいぶつりゅうひ販売物流費、ほうそうひ包装費、ほかんひ保管費',
      '、しはらいぶつりゅうひ支払物流費、じょうほうしょりひ情報処理費、ぶつりゅうかんりひ物流管理費',
      '、ほかんひ保管費、ほうそうひ包装費、りゅうつうかこうひ流通加工費、じょうほうしょりひ情報処理費、ぶつりゅうかんりひ物流管理費'
    ], correctIndex: 3, explanation: `` },
  { id: 24, question: `問題24. （センター）のとしてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'センター',
      'センター',
      'センター',
      'センター'
    ], correctIndex: 3, explanation: `` },
  { id: 25, question: `問題25.  なのほうそう包装のきのう機能としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'にたい対するほご保護',
      'にかん関するじょうほうていきょう情報提供',
      'におけるとりあつか取扱いのりべんせい利便性',
      'におけるごはいそうぼうし誤配送防止'
    ], correctIndex: 3, explanation: `` },
  { id: 26, question: `問題26. のにかん関するじこう事項としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'のもくてき目的は、かいて買手のたよう多様ながんぼう願望よりもせいさんしゃ生産者のせんもんちしき専門知識をい生かしたひんしつ品質のしなものまた品物又はサービスをけいざいてき経済的につく作りだ出すことにある。',
      'は、データなどのきゃっかんてきじじつ客観的事実にもと基づいたかんり管理をじつげん実現するために、とうけいてきしゅほう統計的手法をひんしつかんり品質管理にてきよう適用するかつどう活動である。',
      'をこうかてき効果的にじっし実施するためには、モノやサービスをちょくせつさんしゅつ直接産出しているぶもん部門だけでなく、せいひん製品のライフサイクルぜんたい全体をたいしょう対象とするひつよう必要がある。',
      'におけるかんり管理では、けいえいもくてき経営目的にそ沿って、ひと人、もの物、かね金、じょうほう情報などさまざま様々なしげん資源をてきせつ適切にけいかく計画し、うんよう運用し、とうせい統制するてつづきおよ手続及びそのかつどう活動をおこな行う。'
    ], correctIndex: 0, explanation: `` },
  { id: 27, question: `問題27.  ２、８、５、４、６という５つのデータがある、ひょうほんひょうじゅんへんさ標本標準偏差のけいさんけっか計算結果のあたい値にもっと最もちか近いものは、つぎ次のうちどれか。`, options: [
      '2.00',
      '2.24',
      '4.00',
      '4.47'
    ], correctIndex: 1, explanation: `` },
  { id: 28, question: `問題28.  にするきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'のＱＣストーリーでは、せんてい選定したテーマにしたが従ってげんじょうはあく現状把握をおこな行い、かだい課題にかん関するよういん要因のかいせき解析にもと基づいてほうさく方策をりつあん立案する。',
      'なさいはつぼうしたいさく再発防止対策として、ポカよけというフールプルーフのかんが考えかた方がある。',
      'のこうか効果をいじ維持させるには、ひょうじゅんか標準化などのはど歯止めていちゃく定着がひつよう必要である。',
      'には、よりげんりゅう源流にあるげんいん原因をついきゅう追究し、たいさく対策をこう講じるひつよう必要がある。'
    ], correctIndex: 0, explanation: `` },
  { id: 29, question: `問題29. にするきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。なお、ＦＭＥＡはFailure Mode and Effect Analysisである。`, options: [
      'しじ指示・けいこくじょう警告上のけっかん欠陥は、せいぞうぶつ製造物からのぞ除くことがふかのう不可能なきけん危険があるばあい場合に、そのきけん危険にかん関するてきせつ適切なじょうほう情報をあた与えなかったばあい場合の欠陥である。',
      'ＦＭＥＡは、せっけいじ設計時にせんざいてき潜在的なこしょう故障をよそく予測し、そのえいきょうど影響度をかいせき解析しせっけい設計のしんらいせい信頼性をたか高めるしゅほう手法である。',
      'においてそんがいばいしょうせいきゅう損害賠償請求をおこな行うさい際は、かがいしゃ加害者のかしつせきにん過失責任のげんそく原則がさいよう採用されている。',
      'のけっかん欠陥は、せいぞうぶつ製造物がせっけい設計やしよう仕様どおりにせいぞう製造されなかったためにあんぜんせい安全性をか欠いたばあい場合のけっかん欠陥である。'
    ], correctIndex: 2, explanation: `` },
  { id: 30, question: `問題30. コストコントロールのかつどう活動にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'もくひょうげんか目標原価をせってい設定するかつどう活動',
      'ひょうじゅんげんか標準原価をせってい設定するかつどう活動',
      'さいぶんせき差異分析をもち用いてさい差異をちい小さくするかつどう活動',
      'きょようげんか許容原価をせってい設定するかつどう活動'
    ], correctIndex: 2, explanation: `` },
  { id: 31, question: `問題31. せいぞうちょくせつひおよ製造直接費及びせいぞうかんせつひ製造間接費にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'せいぞうちょくせつひ製造直接費とせいぞうかんせつひ製造間接費のぶんるい分類は、そうぎょうど操業度によるぶんるい分類とよ呼ばれる。',
      'せいぞうちょくせつひ製造直接費をせいひん製品ごとにしゅうけい集計することを、ちょっか直課という。',
      'せいぞうかんせつひ製造間接費をせいひん製品ごとにはいぶん配分することを、はいふ配賦という。',
      'じゅうぎょういん従業員のしょうよ賞与は、せいぞうかんせつひ製造間接費である。'
    ], correctIndex: 0, explanation: `` },
  { id: 32, question: `問題32.  いか以下の＜じょうけん条件＞にもと基づいたばあい場合、たんじゅんそうごうげんかけいさん単純総合原価計算によるかんせいひんたんいげんか完成品単位原価としてただ正しいものは、つぎ次のうちどれか。なお、ちょくせつざいりょう直接材料はこうてい工程のしてん始点でぜんりょうとうにゅう全量投入されるものとし、（ Ａ ）のきんがく金額はとちゅうけいか途中経過としてけいさん計算すること。`, options: [
      '17,000円／個',
      '17,500円／個',
      '18,000円／個',
      '18,500円／個'
    ], correctIndex: 2, explanation: `material → total unit process → equivalent unit` },
  { id: 33, question: `問題33.  いか以下の＜じょうけん条件＞にもと基づき、とうごうほう統合法によるもくひょうげんかせってい目標原価設定をおこな行ったばあい場合のけいさんけっか計算結果としてただ正しいものは、つぎ次のうちどれか。`, options: [
      '22,500円',
      '24,000円',
      '25,500円',
      '27,000円'
    ], correctIndex: 2, explanation: `きょようげんか許容原価 = ばいか売価 − りえき利益 もくひょうげんか目標原価 = なりゆきげんか成行原価 − selisih penyesuaian` },
  { id: 34, question: `問題34.  ぶつりゅう物流におけるのうきちえんたいさく納期遅延対策にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'せいひん製品のはんそうとちゅう搬送途中などでせいひん製品にはそん破損やきず傷がつかないように、こんぽうほうほう梱包方法をくふう工夫する。',
      'せいひん製品のはんしゅつ搬出・のうにゅうじ納入時のさぎょう作業をマニュアルか化やひょうじゅんか標準化する。',
      'こうていかん工程間のはんそう搬送にたい対しては、さぎょうしゃ作業者のこべつ個別のはんだん判断によりさぎょうほうほう作業方法をき決めておこな行う。',
      'はんそうじかん搬送時間にえいきょう影響するさいたん最短ルートやどうろ道路のこんざつじょうきょう混雑状況をはあく把握・きろく記録する。'
    ], correctIndex: 2, explanation: `` },
  { id: 35, question: `問題35.  いか以下のせいぞうぶもん製造部門でののうきおく納期遅れのよういん要因とたいさく対策にかん関するきじゅつ記述において（ Ａ ）～（ Ｄ ）にはい入るようご用語としてもっと最もてきせつ適切なくみあわ組合せは、つぎ次のうちどれか。`, options: [
      'Ａ：はっちゅうかんり発注管理  Ｂ：せいひん製品  Ｃ：しじかんり指示管理  Ｄ：のうき納期',
      'Ａ：しじかんり指示管理  Ｂ：ぶひん部品  Ｃ：はっちゅうかんり発注管理  Ｄ：げんか原価',
      'Ａ：しじかんり指示管理  Ｂ：ぶひん部品  Ｃ：はっちゅうかんり発注管理  Ｄ：のうき納期',
      'Ａ：はっちゅうかんり発注管理  Ｂ：せいひん製品  Ｃ：しじかんり指示管理  Ｄ：げんか原価'
    ], correctIndex: 0, explanation: `` },
  { id: 36, question: `問題36.  せいさんけいかく生産計画・とうせい統制におけるしんちょくかんり進捗管理のしゅほう手法にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'りゅうどうすうきょくせん流動数曲線は、よこじく横軸にじかん時間、たてじく縦軸にるいせきすうりょう累積数量をとる。',
      'せいぞうさんかくず製造三角図は、よこじく横軸にじかん時間のめも目盛り、たてじく縦軸にるいせきざいこりょう累積在庫量をとる。',
      'ガントチャートは、こうすうけいかく工数計画やよりょくかんり余力管理などのためにもち用いられるずひょう図表の１つである。',
      'かんりばん管理盤は、さぎょうしゃべつまた作業者別又はきかいべつ機械別のさぎょうよてい作業予定のしじ指示、げんぴんかんりおよ現品管理及びさぎょうよりょく作業余力のとうせい統制について、さぎょうでんぴょう作業伝票などをもち用いておこな行うひょうじばん表示盤である。'
    ], correctIndex: 0, explanation: `` },
  { id: 37, question: `問題37.  ぶってきあんぜんか物的安全化のきほん基本となる、とくていきかいとう特定機械等のせいぞうきょかおよ製造許可及びけんさ検査にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'とどうふけんろうどうきょくちょう都道府県労働局長のせいぞうきょか製造許可がひつよう必要なとくていきかい特定機械には、ぼいらボイラーおよ及びだい第１しゅあつりょくようき種圧力容器がふく含まれる。',
      'とくていきかいとう特定機械等をせいぞう製造するさい際に、とどうふけんろうどうきょくちょう都道府県労働局長がおこな行うけんさ検査には、こうぞうけんさ構造検査がふく含まれる。',
      'とどうふけんろうどうきょくちょう都道府県労働局長のきょか許可がひつよう必要なとくていきかいとう特定機械等のなか中でいっていきかんせっち一定期間設置されなかったものをせっち設置するばあい場合には、けんさ検査はひつよう必要ない。',
      'いどうしき移動式をのぞ除くとくていきかいとう特定機械等をせっち設置したもの者は、ろうどうきじゅんかんとくしょちょう労働基準監督署長のけんさ検査をう受けなければならない。'
    ], correctIndex: 2, explanation: `` },
  { id: 38, question: `問題38. じんてきあんぜんか人的安全化のきほん基本にかん関するきじゅつ記述としてもっと最もてきせつ適切なものは、つぎ次のうちどれか。`, options: [
      'しょくぎょうくんれん職業訓練をう受けたものとうじゅうぶん者等十分なちしき知識・ぎのう技能があっても、すべ全てのひつようじこう必要事項についてやといい雇入れじ時のあんぜんえいせい安全衛生のためのきょういく教育をおこな行わなければならない。',
      'ろうどうあんぜんえいせいきそく労働安全衛生規則でさだ定めるきけん危険またはゆうがい有害なぎょうむ業務にろうどうしゃ労働者をじゅうじ従事させるときは、あんぜんえいせい安全衛生のとくべつきょういく特別教育をおこな行い、じゅこうしゃ受講者・かもくとう科目等のきょういくきろく教育記録をさくせい作成し３ねんかんほぞん年間保存しなければならない。',
      '４Ｓは、せいり整理、せいとん整頓、せいそう清掃の３Ｓにしつけ躾をくわ加えたものである。',
      '５Ｓかつどう活動のすす進めかた方としては、まずはじ始めにせいそう清掃からちゃくしゅ着手し、つぎ次にせいり整理、せいとん整頓にすす進むというなが流れがこうりつてき効率的である。'
    ], correctIndex: 1, explanation: `きけんさぎょう危険作業 → とくべつきょういく特別教育（３3ねんほぞん年保存）→ Kerja berbahaya = wajib training khusus + simpan 3 tahun 5S → せいり整理 → せいとん整頓 → せいそう清掃 → せいけつ清潔 → しつけ躾` },
  { id: 39, question: `問題39. かんきょうおせんぼうし環境汚染防止にかん関するきじゅつ記述としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'てんけい典型７こうがい公害には、さんせいう酸性雨がふく含まれる。',
      'たいきおせんぼうしほう大気汚染防止法には、いどうはっせいげん移動発生源であるじどうしゃ自動車のじどうしゃはいしゅつ自動車排出がすガスにたい対するきせい規制がある。',
      'そうおんきせいほう騒音規制法では、こうじょう工場・じぎょうじょう事業場におけるじぎょうかつどう事業活動やけんせつこうじ建設工事にともな伴ってはっせい発生するそうおん騒音のきせい規制とともにじどうしゃそうおん自動車騒音にかん関するきょようげんど許容限度もさだ定めている。',
      'すいしつおだくぼうしほう水質汚濁防止法では、こうじょう工場からこうきょうようすいいき公共用水域へのはいすいまた排水又はちか地下へのしんとう浸透をきせい規制している。'
    ], correctIndex: 0, explanation: `てんけいこうがい典型公害 = pencemaran udara, air, tanah, kebisingan, getaran, bau→ Tidak termasuk hujan asam Setiap hukum mengatur jenis pencemaran yang berbeda` },
  { id: 40, question: `問題40.  たいきおせんぶっしつ大気汚染物質のばいえん煙としてもっと最もふてきせつ不適切なものは、つぎ次のうちどれか。`, options: [
      'いおうさんかぶつ硫黄酸化物',
      'カドミウム',
      'アスベスト',
      'フッ化水素'
    ], correctIndex: 2, explanation: `Pencemar udara utama = gas dan polutan industri Asbes → kategori berbeda` },
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
