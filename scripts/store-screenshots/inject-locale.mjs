/**
 * 指定ロケールのサンプルデータをDBに注入するスクリプト
 *
 * 使い方: node inject-locale.mjs <locale>
 * 例:     node inject-locale.mjs fr
 *
 * 入力:  /tmp/repolog_base.db, /tmp/RKStorage_base.db
 * 出力:  /tmp/repolog_out.db,  /tmp/RKStorage_out.db
 */
import { Buffer } from 'node:buffer';
// eslint-disable-next-line import/no-unresolved -- sql.js is an optional devDependency for screenshot tooling
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';

const locale = process.argv[2];
if (!locale) { console.error('Usage: node inject-locale.mjs <locale>'); process.exit(1); }

// ── サンプルデータ定義 ──
const DATA = {
  en:       { reportName: 'Exterior Wall Tile Condition Survey', author: 'John Smith', address: '742 Oakridge Drive, Austin, TX 78701', addressLocale: 'en-US', comment: 'Horizontal crack (approx. 0.3 mm wide) identified on the south-facing 3rd-floor exterior wall.\nSounding test revealed hollow areas behind 3 adjacent tiles.\nRecommend removal and re-bonding of affected tiles with full adhesion check.' },
  ja:       { reportName: '外壁タイル劣化調査', author: '田中 太郎', address: '埼玉県緑川市朝日台二丁目8-15', addressLocale: 'ja-JP', comment: '南面3階外壁に横方向クラック(幅0.3mm程度)及び浮きを確認。\n打診調査で周辺3枚に浮き音あり。\n補修要。' },
  fr:       { reportName: 'Diagnostic façade — fissures et décollements', author: 'Jean Dupont', address: '27 rue des Cerisiers, 75011 Paris', addressLocale: 'fr-FR', comment: "Fissure horizontale d'environ 0,3 mm relevée sur la façade sud au 3e étage.\nLe sondage au marteau a révélé un son creux derrière 3 carreaux adjacents, indiquant un décollement du support.\nRéparation recommandée." },
  es:       { reportName: 'Inspección de fachada — fisuras y desprendimientos', author: 'Juan García', address: 'Calle de los Almendros 14, 3.ºB, 28012 Madrid', addressLocale: 'es-ES', comment: 'Se detecta fisura horizontal de aproximadamente 0,3 mm de ancho en la fachada sur, planta 3.ª.\nLa inspección por percusión revela oquedades detrás de 3 azulejos colindantes.\nSe recomienda retirar y adherir nuevamente las piezas afectadas.' },
  de:       { reportName: 'Fassadeninspektion — Risse und Ablösungen', author: 'Max Mustermann', address: 'Lindenstraße 42, 10117 Berlin', addressLocale: 'de-DE', comment: 'An der Südfassade im 3. OG wurde ein horizontaler Riss (Breite ca. 0,3 mm) festgestellt.\nDie Klopfprüfung ergab Hohlstellen hinter 3 angrenzenden Fliesen.\nSanierung mit vollflächiger Verklebung wird empfohlen.' },
  it:       { reportName: 'Perizia facciata — fessurazioni e distacchi', author: 'Mario Rossi', address: 'Via dei Tigli 18, 00185 Roma RM', addressLocale: 'it-IT', comment: 'Riscontrata fessurazione orizzontale di circa 0,3 mm sulla facciata sud al 3° piano.\nLa battitura ha evidenziato suono vuoto dietro 3 piastrelle adiacenti, sintomo di distacco dal supporto.\nSi raccomanda il rifacimento delle piastrelle interessate.' },
  pt:       { reportName: 'Inspeção de fachada — fissuras e desplacamento', author: 'João da Silva', address: 'Rua das Palmeiras 310, Pinheiros, São Paulo - SP, 05413-020', addressLocale: 'pt-BR', comment: 'Identificada fissura horizontal com aproximadamente 0,3 mm de largura na fachada sul, 3.º pavimento.\nTeste de percussão revelou som cavo em 3 pastilhas adjacentes, indicando desplacamento.\nRecomenda-se remoção e reassentamento com argamassa colante.' },
  ru:       { reportName: 'Обследование фасада — трещины и отслоения облицовки', author: 'Иванов Иван Иванович', address: 'ул. Берёзовая, д. 17, г. Москва, 125009', addressLocale: 'ru-RU', comment: 'На южном фасаде 3-го этажа выявлена горизонтальная трещина шириной ≈ 0,3 мм.\nПростукивание выявило пустоты за 3 смежными плитками.\nРекомендуется демонтаж и повторная укладка с полноконтактным приклеиванием.' },
  'zh-Hans':{ reportName: '外墙饰面砖空鼓与裂缝检测报告', author: '张 伟', address: '上海市浦东新区银杏路86号翠园小区3号楼', addressLocale: 'zh-CN', comment: '南立面3层外墙发现水平方向裂缝，宽度约0.3mm。\n敲击检测显示相邻3块面砖存在空鼓现象。\n建议铲除后采用聚合物砂浆重新粘贴，并加强养护。' },
  'zh-Hant':{ reportName: '外牆磁磚劣化調查報告', author: '陳 志明', address: '台北市大安區和平東路二段47巷12號3樓', addressLocale: 'zh-TW', comment: '南側3樓外牆發現水平向裂縫，寬度約0.3mm。\n敲擊檢測顯示周邊3片磁磚有空心音，研判為黏著力不足造成浮離。\n建議拆除後以彈性黏著劑重新鋪貼，並進行拉拔試驗確認。' },
  ko:       { reportName: '외벽 타일 균열 및 들뜸 조사 보고서', author: '김 민수', address: '서울특별시 강남구 은행나무로 23길 8, 301호', addressLocale: 'ko-KR', comment: '남측 3층 외벽에서 수평 방향 균열(폭 약 0.3mm)을 확인하였으며,\n타진 조사 결과 인접 타일 3매에서 공동음이 감지됨.\n해당 타일 철거 후 폴리머 모르타르로 재시공할 것을 권고함.' },
  hi:       { reportName: 'बाहरी दीवार टाइल स्थिति निरीक्षण रिपोर्ट', author: 'राहुल शर्मा', address: 'फ्लैट 302, विशाल अपार्टमेंट, सरोजिनी नगर, नई दिल्ली 110023', addressLocale: 'hi-IN', comment: 'दक्षिण दिशा की तीसरी मंज़िल की बाहरी दीवार पर लगभग 0.3 मिमी चौड़ी क्षैतिज दरार पाई गई।\nटैपिंग परीक्षण में आसपास की 3 टाइलों के पीछे खोखलापन पाया गया।\nप्रभावित टाइलें हटाकर पॉलिमर चिपकने वाले से पुनः जोड़ने की सिफ़ारिश की जाती है।' },
  id:       { reportName: 'Laporan Inspeksi Dinding Luar — Retak dan Pengelupasan', author: 'Budi Santoso', address: 'Jl. Kenanga No. 15, RT 03/RW 07, Menteng, Jakarta Pusat 10310', addressLocale: 'id-ID', comment: 'Ditemukan retak horizontal selebar ±0,3 mm pada dinding luar sisi selatan lantai 3.\nUji ketuk menunjukkan suara kopong di balik 3 keramik yang berdekatan, mengindikasikan pengelupasan dari substrat.\nDisarankan untuk membongkar dan memasang ulang dengan perekat semen polimer.' },
  th:       { reportName: 'รายงานตรวจสอบผนังภายนอก — รอยร้าวและการหลุดร่อน', author: 'สมชาย ศรีสุข', address: '89/12 ซอยสุขุมวิท 24 แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110', addressLocale: 'th-TH', comment: 'พบรอยร้าวในแนวนอนกว้างประมาณ 0.3 มม. บริเวณผนังภายนอกด้านทิศใต้ ชั้น 3\nการเคาะทดสอบพบเสียงกลวงหลังกระเบื้อง 3 แผ่นที่อยู่ติดกัน\nแสดงว่ากระเบื้องหลุดร่อนจากผนัง แนะนำให้รื้อและปูใหม่ด้วยกาวซีเมนต์โพลิเมอร์' },
  vi:       { reportName: 'Báo cáo kiểm tra tường ngoài — nứt và bong tróc gạch ốp', author: 'Nguyễn Văn An', address: '45/3 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh 700000', addressLocale: 'vi-VN', comment: 'Phát hiện vết nứt ngang rộng khoảng 0,3 mm tại tường ngoài mặt nam tầng 3.\nKết quả gõ kiểm tra cho thấy 3 viên gạch ốp liền kề có hiện tượng bong rỗ.\nĐề nghị tháo dỡ và ốp lại bằng keo dán xi-măng polymer, kiểm tra bám dính sau thi công.' },
  tr:       { reportName: 'Dış Cephe Kaplama Tespit Raporu — Çatlak ve Kabarmalar', author: 'Mehmet Yılmaz', address: 'Akasya Mah. Çınar Sok. No: 9, D: 5, 34710 Kadıköy/İstanbul', addressLocale: 'tr-TR', comment: 'Güney cephesindeki 3. kat dış duvarında yaklaşık 0,3 mm genişliğinde yatay çatlak tespit edilmiştir.\nVurma testi sonucunda bitişik 3 seramiğin arkasında boşluk saptanmıştır.\nİlgili karoların sökülüp polimer yapıştırıcı ile yeniden kaplanması önerilmektedir.' },
  nl:       { reportName: 'Gevelinspectie — scheuren en loslating tegels', author: 'Jan Jansen', address: 'Keizersgracht 274, 1016 EV Amsterdam', addressLocale: 'nl-NL', comment: 'Op de zuidgevel, 3e verdieping, is een horizontale scheur van circa 0,3 mm breed aangetroffen.\nDe kloptest wees op holle klank achter 3 aangrenzende tegels, wat duidt op onthechting van de ondergrond.\nVerwijdering en herplaatsing met polymeer-tegellijm wordt aanbevolen.' },
  pl:       { reportName: 'Przegląd elewacji — rysy i odspojenia okładziny', author: 'Jan Kowalski', address: 'ul. Lipowa 23 m. 7, 00-312 Warszawa', addressLocale: 'pl-PL', comment: 'Na elewacji południowej, III piętro, stwierdzono poziomą rysę o szerokości ok. 0,3 mm.\nPróba młotkowa wykazała odgłos pusty za 3 sąsiednimi płytkami, co świadczy o odspojeniu od podłoża.\nZaleca się demontaż i ponowne mocowanie z użyciem kleju cementowo-polimerowego.' },
  sv:       { reportName: 'Fasadbesiktning — sprickor och plattsläpp', author: 'Erik Svensson', address: 'Björkvägen 15, 112 34 Stockholm', addressLocale: 'sv-SE', comment: 'En horisontell spricka på ca 0,3 mm bredd har påträffats på södra fasaden, våning 3.\nKnackprov visar ihåligt ljud bakom 3 intilliggande plattor, vilket tyder på bristande vidhäftning.\nÅtgärd rekommenderas: avlägsnande och omläggning med polymermodifierat fästbruk.' },
};

const d = DATA[locale];
if (!d) { console.error('Unknown locale: ' + locale); process.exit(1); }

const SQL = await initSqlJs();

// ── Report DB ──
const reportBuf = readFileSync('/tmp/repolog_base.db');
const reportDb = new SQL.Database(reportBuf);
reportDb.run('DELETE FROM reports');
reportDb.run('DELETE FROM photos');
reportDb.run(`INSERT INTO reports (id,created_at,updated_at,report_name,weather,location_enabled,lat,lng,lat_lng_captured_at,address,address_source,address_locale,comment,tags_json,pinned,author_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ['r_screenshot_001','2026-03-30T01:04:27.796Z','2026-03-30T01:05:47.870Z', d.reportName,'cloudy',1,35.6236,139.5658,'2026-03-30T00:59:17.308Z', d.address,'manual', d.addressLocale, d.comment,'[]',0, d.author]);
reportDb.run(`INSERT INTO photos (id,report_id,local_uri,width,height,created_at,order_index) VALUES (?,?,?,?,?,?,?)`,
  ['p_mnchk0zl_t74txead','r_screenshot_001','file:///data/user/0/com.dooooraku.repolog/files/repolog/reports/r_screenshot_001/photos/p_mnchk0zl_t74txead.jpg',640,480,'2026-03-30T01:04:45.825Z',0]);
writeFileSync('/tmp/repolog_out.db', Buffer.from(reportDb.export()));
reportDb.close();

// ── AsyncStorage ──
const rkBuf = readFileSync('/tmp/RKStorage_base.db');
const rkDb = new SQL.Database(rkBuf);
rkDb.run(`UPDATE catalystLocalStorage SET value = ? WHERE key = 'app-template-i18n'`,
  [JSON.stringify({ state: { lang: locale }, version: 0 })]);
const settingsRow = rkDb.exec(`SELECT value FROM catalystLocalStorage WHERE key = 'repolog-settings'`);
if (settingsRow[0]?.values[0]) {
  const settings = JSON.parse(settingsRow[0].values[0][0]);
  settings.state.authorName = d.author;
  rkDb.run(`UPDATE catalystLocalStorage SET value = ? WHERE key = 'repolog-settings'`, [JSON.stringify(settings)]);
}
writeFileSync('/tmp/RKStorage_out.db', Buffer.from(rkDb.export()));
rkDb.close();

console.log(`OK: ${locale} — ${d.reportName} / ${d.author}`);
