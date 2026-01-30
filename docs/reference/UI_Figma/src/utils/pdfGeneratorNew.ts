/**
 * html2pdf.js を使用した本物のPDF生成
 * 
 * このファイルの役割：
 * - レポートデータを受け取る
 * - HTMLテンプレートを作成
 * - html2pdf.js で本物のPDFに変換
 * - ダウンロード可能なPDFファイルを返す
 */

import { Report, LayoutType, UserSettings } from '../types';
import { Translations } from '../i18n/translations';
import { formatCoordinates } from './geocoding';

/**
 * html2pdf.js のオプション設定
 * 
 * これは「PDFをどう作るか」の設定です
 */
const getPDFOptions = (filename: string) => ({
  margin: 12,  // 余白（mm）
  filename: filename,
  image: { 
    type: 'jpeg' as const,  // 画像形式（JPEGの方が軽い）
    quality: 0.85  // 画質85%（100%だと重すぎる）
  },
  html2canvas: { 
    scale: 2,  // 解像度（2倍で高画質）
    useCORS: true,  // 外部画像も使える
    logging: false,  // ログを出さない
    letterRendering: true  // 文字をキレイに
  },
  jsPDF: { 
    unit: 'mm' as const,  // 単位（ミリメートル）
    format: 'a4' as const,  // A4サイズ
    orientation: 'portrait' as const  // 縦向き
  },
  pagebreak: { 
    mode: ['avoid-all', 'css', 'legacy'] as const  // ページ分割の方法
  }
});

/**
 * PDFを生成する関数
 * 
 * @param report - レポートデータ
 * @param layout - レイアウト（標準/大きく）
 * @param settings - ユーザー設定
 * @param t - 翻訳データ
 * @param onProgress - 進捗コールバック（0-100の数値）
 * @returns PDFのBlobデータ
 */
export const generatePDFWithHtml2pdf = async (
  report: Report,
  layout: LayoutType,
  settings: UserSettings,
  t: Translations,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    // html2pdf.js を動的にインポート
    // ページを開いた時じゃなくて、必要な時だけ読み込む（軽量化）
    const html2pdf = (await import('html2pdf.js@0.10.2')).default;
    
    if (onProgress) onProgress(10);  // 10%完了
    
    // HTMLテンプレートを作成
    const htmlContent = generatePDFHTML(report, layout, settings, t);
    
    if (onProgress) onProgress(20);  // 20%完了
    
    // 一時的なdiv要素を作成（画面には表示しない）
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    document.body.appendChild(element);
    
    if (onProgress) onProgress(30);  // 30%完了
    
    // ファイル名を生成
    // 例：20250126_123045_現場A_Repolog.pdf
    const dateStr = new Date(report.createdAt)
      .toISOString()
      .replace(/[-:]/g, '')
      .slice(0, 15)
      .replace('T', '_');
    const siteName = report.siteName.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, '_');
    const filename = `${dateStr}_${siteName}_Repolog.pdf`;
    
    const options = getPDFOptions(filename);
    
    if (onProgress) onProgress(40);  // 40%完了
    
    // PDFに変換（ここが時間かかる！）
    const pdfBlob = await html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .output('blob');  // Blob形式で出力
    
    if (onProgress) onProgress(90);  // 90%完了
    
    // 一時要素を削除
    document.body.removeChild(element);
    
    if (onProgress) onProgress(100);  // 100%完了
    
    return pdfBlob as Blob;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * PDFのHTMLテンプレートを生成
 * 
 * A4縦のフォーマットで、提出用レポートを作成
 */
const generatePDFHTML = (
  report: Report,
  layout: LayoutType,
  settings: UserSettings,
  t: Translations
): string => {
  const showWatermark = settings.plan === 'free';
  const photosPerPage = layout === 'standard' ? 2 : 1;

  // 日付のフォーマット
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // 天気のテキスト
  const getWeatherText = () => {
    switch (report.weather) {
      case 'sunny': return t.sunny;
      case 'cloudy': return t.cloudy;
      case 'rainy': return t.rainy;
      case 'snowy': return t.snowy;
      default: return t.noWeather;
    }
  };

  // 位置情報テキスト
  const locationText = report.location
    ? formatCoordinates(report.location.lat, report.location.lng)
    : '-';
  
  const addressText = report.location?.address || '-';

  // 総ページ数を計算
  const totalPages = Math.ceil(report.photos.length / photosPerPage) + 2;

  // 写真ページのHTML生成
  let photoHTML = '';
  for (let i = 0; i < report.photos.length; i += photosPerPage) {
    const pagePhotos = report.photos.slice(i, i + photosPerPage);
    const pageNumber = Math.floor(i / photosPerPage) + 3;

    if (layout === 'standard') {
      // 標準レイアウト（2枚/ページ）
      photoHTML += `
        <div class="page photo-page">
          <div class="photo-container-2">
            ${pagePhotos.map((photo) => `
              <div class="photo-frame">
                <img src="${photo.uri}" alt="Photo" class="photo-img" />
              </div>
            `).join('')}
          </div>
          <div class="page-footer">
            <div>${t.photoLabel} ${i + 1}${pagePhotos.length > 1 ? ` - ${i + pagePhotos.length}` : ''}</div>
            <div>${pageNumber}/${totalPages}</div>
          </div>
        </div>
      `;
    } else {
      // 大きいレイアウト（1枚/ページ）
      pagePhotos.forEach((photo, idx) => {
        photoHTML += `
          <div class="page photo-page">
            <div class="photo-container-1">
              <div class="photo-frame">
                <img src="${photo.uri}" alt="Photo" class="photo-img" />
              </div>
            </div>
            <div class="page-footer">
              <div>${t.photoLabel} ${i + idx + 1}</div>
              <div>${pageNumber + idx}/${totalPages}</div>
            </div>
          </div>
        `;
      });
    }
  }

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Noto Sans JP", "Hiragino Sans", sans-serif;
      font-size: 11pt;
      color: #111;
      line-height: 1.6;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 12mm;
      background: white;
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* 表紙ページ */
    .cover-page {
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 24pt;
      font-weight: 800;
      margin-bottom: 10mm;
      color: #000;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-table tr {
      border-bottom: 1px solid #e5e5e5;
    }

    .info-table td {
      padding: 4mm 0;
      vertical-align: top;
    }

    .info-table td:first-child {
      width: 35mm;
      font-weight: 700;
      color: #333;
    }

    .info-table td:last-child {
      color: #111;
    }

    /* コメントページ */
    .comment-page h2 {
      font-size: 14pt;
      font-weight: 700;
      margin-bottom: 6mm;
      padding-bottom: 2mm;
      border-bottom: 2px solid #333;
    }

    .comment-text {
      white-space: pre-wrap;
      line-height: 1.8;
      color: #333;
    }

    /* 写真ページ */
    .photo-page {
      display: flex;
      flex-direction: column;
    }

    .photo-container-2 {
      display: flex;
      flex-direction: column;
      gap: 6mm;
      flex: 1;
    }

    .photo-container-1 {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .photo-frame {
      border: 1px solid #ddd;
      border-radius: 2mm;
      overflow: hidden;
      background: #f9f9f9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 120mm;
    }

    .photo-container-1 .photo-frame {
      width: 100%;
      height: 250mm;
    }

    .photo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    /* ページフッター */
    .page-footer {
      margin-top: 4mm;
      padding-top: 2mm;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #e5e5e5;
    }

    /* ウォーターマーク */
    .watermark {
      position: absolute;
      right: 12mm;
      bottom: 12mm;
      font-size: 8pt;
      color: rgba(0, 0, 0, 0.2);
    }

    /* 印刷時の調整 */
    @media print {
      .page {
        margin: 0;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- 表紙ページ -->
  <div class="page cover-page">
    <h1 class="title">${t.reportTitle}</h1>
    
    <table class="info-table">
      <tr>
        <td>${t.site}</td>
        <td>${report.siteName}</td>
      </tr>
      <tr>
        <td>${t.createdAt}</td>
        <td>${formatDate(report.createdAt)}</td>
      </tr>
      <tr>
        <td>${t.location}</td>
        <td>
          ${addressText !== '-' ? addressText + '<br/>' : ''}${locationText}
        </td>
      </tr>
      <tr>
        <td>${t.weather}</td>
        <td>${getWeatherText()}</td>
      </tr>
      <tr>
        <td>${t.photos}</td>
        <td>${report.photos.length} ${t.photoCount}</td>
      </tr>
      <tr>
        <td>${t.pages}</td>
        <td>${totalPages} ${t.pages}</td>
      </tr>
    </table>

    ${showWatermark ? `<div class="watermark">${t.watermark}</div>` : ''}
  </div>

  <!-- コメントページ -->
  <div class="page comment-page">
    <h2>${t.comment}</h2>
    <div class="comment-text">${report.comment || '-'}</div>
  </div>

  <!-- 写真ページ -->
  ${photoHTML}
</body>
</html>
  `;
};
