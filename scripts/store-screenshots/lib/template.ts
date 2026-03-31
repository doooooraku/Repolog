/**
 * Build the full HTML document for a single store screenshot composite.
 *
 * Layout (top → bottom):
 *   - White background (#FFF)
 *   - Marketing text: bold, dark, centered, shrink-to-fit
 *   - App screenshot: rounded corners, subtle shadow
 *
 * All sizes use vh/vw so the same HTML adapts to both
 * Apple (1320×2868) and Google Play (1080×1920) viewports.
 */

export interface BuildHtmlOptions {
  /** Localized marketing text (single line / short phrase) */
  marketingText: string;
  /** Cropped screenshot as base64 data URI */
  screenshotBase64: string;
  /** @font-face CSS rules from fonts.ts */
  fontCss: string;
  /** CSS font-family value from fonts.ts */
  fontStack: string;
  /** BCP-47 locale code (e.g. "ja", "zh-Hans") */
  locale: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildHtml(opts: BuildHtmlOptions): string {
  const { marketingText, screenshotBase64, fontCss, fontStack, locale } = opts;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<style>
  ${fontCss}

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #FFFFFF;
    font-family: ${fontStack};
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ---- Marketing text ---- */
  .text-area {
    flex-shrink: 0;
    width: 100%;
    padding: 5vh 8vw 0 8vw;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 12vh;
    max-height: 18vh;
  }

  #marketing-text {
    color: #1A1A1A;
    font-weight: 700;
    font-size: 4.5vw;
    line-height: 1.35;
    text-align: center;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  /* ---- Screenshot ---- */
  .screenshot-area {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2vh 0 3vh 0;
  }

  .screenshot-area img {
    height: 78vh;
    width: auto;
    max-width: 85vw;
    border-radius: 2.5vw;
    object-fit: contain;
    box-shadow:
      0 0.3vh 0.8vh rgba(0, 0, 0, 0.06),
      0 0.8vh 2vh rgba(0, 0, 0, 0.08),
      0 1.5vh 4vh rgba(0, 0, 0, 0.10);
  }
</style>
</head>
<body>
  <div class="container">
    <div class="text-area">
      <p id="marketing-text">${escapeHtml(marketingText)}</p>
    </div>
    <div class="screenshot-area">
      <img src="${screenshotBase64}" alt="app screenshot" />
    </div>
  </div>

  <script>
    // Shrink-to-fit: reduce font size until text fits within max-height
    (function () {
      var el = document.getElementById('marketing-text');
      var area = el.parentElement;
      var maxH = area.clientHeight;
      var vw = window.innerWidth / 100;
      var size = 4.5; // vw units
      el.style.fontSize = size * vw + 'px';

      while (el.scrollHeight > maxH && size > 2.5) {
        size -= 0.15;
        el.style.fontSize = size * vw + 'px';
      }
    })();
  </script>
</body>
</html>`;
}
