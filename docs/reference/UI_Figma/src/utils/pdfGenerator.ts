import { Report, LayoutType, UserSettings } from '../types';
import { Translations } from '../i18n/translations';
import { formatCoordinates } from './geocoding';

export const generatePDF = async (
  report: Report,
  layout: LayoutType,
  settings: UserSettings,
  t: Translations
): Promise<Blob> => {
  // Generate HTML for PDF
  const html = generatePDFHTML(report, layout, settings, t);

  // Use browser print API to generate PDF
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '297mm'; // A4 height
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      reject(new Error('Failed to access iframe document'));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for images to load
    iframe.onload = () => {
      setTimeout(() => {
        // For web, we'll create a simplified blob
        // In a real implementation, you'd use a library like jsPDF or pdfmake
        const blob = new Blob([html], { type: 'text/html' });
        document.body.removeChild(iframe);
        resolve(blob);
      }, 500);
    };
  });
};

const generatePDFHTML = (
  report: Report,
  layout: LayoutType,
  settings: UserSettings,
  t: Translations
): string => {
  const showWatermark = settings.plan === 'free';
  const photosPerPage = layout === 'standard' ? 2 : 1;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getWeatherText = () => {
    switch (report.weather) {
      case 'sunny': return t.sunny;
      case 'cloudy': return t.cloudy;
      case 'rainy': return t.rainy;
      case 'snowy': return t.snowy;
      default: return t.noWeather;
    }
  };

  // 位置情報テキストの生成
  // 住所がある場合は住所も表示、ない場合は緯度経度のみ
  const locationText = report.location
    ? formatCoordinates(report.location.lat, report.location.lng)
    : '-';
  
  const addressText = report.location?.address || '-';

  const totalPages = Math.ceil(report.photos.length / photosPerPage) + 2; // +2 for cover and comment

  // Generate photo pages HTML
  let photoHTML = '';
  for (let i = 0; i < report.photos.length; i += photosPerPage) {
    const pagePhotos = report.photos.slice(i, i + photosPerPage);
    const pageNumber = Math.floor(i / photosPerPage) + 3; // +3 for cover and comment pages

    if (layout === 'standard') {
      photoHTML += `
        <section class="photo-page-2">
          ${pagePhotos.map((photo, idx) => `
            <div class="photo-frame photo-slot-2">
              <img class="photo" src="${photo.uri}" />
            </div>
          `).join('')}
          <div class="footer">
            <div>${t.photoLabel} ${i + 1}${pagePhotos.length > 1 ? ` - ${i + pagePhotos.length}` : ''}</div>
            <div>${pageNumber}/${totalPages}</div>
          </div>
        </section>
      `;
    } else {
      pagePhotos.forEach((photo, idx) => {
        photoHTML += `
          <section class="photo-page-1">
            <div class="photo-frame">
              <img class="photo" src="${photo.uri}" />
            </div>
            <div class="footer">
              <div>${t.photoLabel} ${i + idx + 1}</div>
              <div>${pageNumber + idx}/${totalPages}</div>
            </div>
          </section>
        `;
      });
    }
  }

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 portrait; margin: 12mm; }

    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Noto Sans", Arial, sans-serif;
      font-size: 11pt;
      color: #111;
    }

    section {
      page-break-after: always;
      padding: 12mm;
    }

    .no-break { break-inside: avoid; page-break-inside: avoid; }
    .muted { color: #666; }
    .h1 { font-size: 22pt; font-weight: 800; margin-bottom: 8mm; }
    .h2 { font-size: 14pt; font-weight: 700; margin: 0 0 6mm; }

    .kv {
      display: grid;
      grid-template-columns: 35mm 1fr;
      row-gap: 3mm;
      column-gap: 4mm;
      align-items: baseline;
    }
    .k { font-weight: 700; }
    
    .watermark {
      position: fixed;
      right: 12mm;
      bottom: 12mm;
      font-size: 9pt;
      color: rgba(0,0,0,0.25);
    }

    .photo-frame {
      border: 1px solid #ddd;
      border-radius: 3mm;
      overflow: hidden;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .photo-page-2 { 
      display: flex; 
      flex-direction: column; 
      gap: 6mm;
      min-height: 260mm;
    }
    .photo-slot-2 { 
      flex: 1;
      min-height: 120mm;
    }

    .photo-page-1 .photo-frame { 
      height: 240mm;
      width: 100%;
    }

    .footer {
      position: fixed;
      left: 12mm;
      right: 12mm;
      bottom: 8mm;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #444;
    }

    .comment-section {
      white-space: pre-wrap;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <section class="no-break">
    <div class="h1">${t.reportTitle}</div>

    <div class="kv">
      <div class="k">${t.site}</div>
      <div>${report.siteName}</div>
      
      <div class="k">${t.createdAt}</div>
      <div>${formatDate(report.createdAt)}</div>
      
      <div class="k">${t.location}</div>
      <div>${addressText !== '-' ? addressText + '<br/>' : ''}${locationText}</div>
      
      <div class="k">${t.weather}</div>
      <div>${getWeatherText()}</div>
      
      <div class="k">${t.photos}</div>
      <div>${report.photos.length} ${t.photoCount}</div>
      
      <div class="k">${t.pages}</div>
      <div>${totalPages} ${t.pages}</div>
    </div>

    ${showWatermark ? `<div class="watermark">${t.watermark}</div>` : ''}
  </section>

  <!-- Comment Page -->
  <section>
    <div class="h2">${t.comment}</div>
    <div class="comment-section">${report.comment || '-'}</div>
  </section>

  <!-- Photo Pages -->
  ${photoHTML}
</body>
</html>
  `;
};
