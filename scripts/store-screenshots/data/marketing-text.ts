/**
 * Marketing text for Google Play Store screenshot overlays.
 *
 * Persona-driven, culturally authentic — NOT machine-translated.
 * Each phrase uses words the target user (field/construction worker) naturally says.
 *
 * Screens:
 *   1 = Home (report timeline)
 *   2 = Editor top (basic info, weather, GPS)
 *   3 = Editor bottom (comments + photos)
 *   4 = PDF Preview (export)
 */

export interface MarketingText {
  locale: string;
  screen1: string; // Home
  screen2: string; // Editor top
  screen3: string; // Editor bottom
  screen4: string; // PDF Preview
}

export const marketingTexts: MarketingText[] = [
  {
    locale: 'ja',
    screen1: '現場の記録、スマホにまとまる',
    screen2: '撮って、書いて、すぐ完成',
    screen3: '写真もコメントも、まとめて残す',
    screen4: '提出できるPDF、ワンタップで',
  },
  {
    locale: 'en',
    screen1: 'All your site reports, one place',
    screen2: 'Snap, note, done—auto-fills the rest',
    screen3: 'Photos and notes, kept together',
    screen4: 'Export a clean PDF in one tap',
  },
  {
    locale: 'fr',
    screen1: 'Vos rapports de chantier, au m\u00eame endroit',
    screen2: 'Photo, commentaire, c\u2019est pr\u00eat',
    screen3: 'Photos et remarques, tout au m\u00eame endroit',
    screen4: 'Un PDF pro en un seul geste',
  },
  {
    locale: 'es',
    screen1: 'Tus informes de obra, siempre a mano',
    screen2: 'Foto, nota, listo—se llena solo',
    screen3: 'Fotos y observaciones, todo junto',
    screen4: 'PDF listo para entregar, en un toque',
  },
  {
    locale: 'de',
    screen1: 'Alle Bauberichte an einem Ort',
    screen2: 'Foto, Notiz, fertig—Wetter und Ort automatisch',
    screen3: 'Fotos und Anmerkungen zusammen erfasst',
    screen4: 'Fertiges PDF mit einem Fingertipp',
  },
  {
    locale: 'it',
    screen1: 'I tuoi rapporti di cantiere, sempre in ordine',
    screen2: 'Scatta, annota, fatto—meteo e posizione in automatico',
    screen3: 'Foto e note di sopralluogo, tutto insieme',
    screen4: 'PDF pronto da consegnare, con un tap',
  },
  {
    locale: 'pt',
    screen1: 'Seus relat\u00f3rios de obra, tudo organizado',
    screen2: 'Fotografou, anotou, pronto—clima e local autom\u00e1ticos',
    screen3: 'Fotos e anota\u00e7\u00f5es de vistoria, juntas',
    screen4: 'PDF pronto pra entregar, em um toque',
  },
  {
    locale: 'ru',
    screen1: '\u0412\u0441\u0435 \u043e\u0442\u0447\u0451\u0442\u044b \u0441 \u043e\u0431\u044a\u0435\u043a\u0442\u0430\u2014\u0432 \u043e\u0434\u043d\u043e\u043c \u043c\u0435\u0441\u0442\u0435',
    screen2: '\u0421\u0444\u043e\u0442\u043a\u0430\u043b, \u0437\u0430\u043f\u0438\u0441\u0430\u043b\u2014\u043e\u0442\u0447\u0451\u0442 \u0433\u043e\u0442\u043e\u0432',
    screen3: '\u0424\u043e\u0442\u043e \u0438 \u0437\u0430\u043c\u0435\u0442\u043a\u0438\u2014\u0432\u0441\u0451 \u0432 \u043e\u0434\u043d\u043e\u043c \u043e\u0442\u0447\u0451\u0442\u0435',
    screen4: '\u0413\u043e\u0442\u043e\u0432\u044b\u0439 PDF \u043e\u0434\u043d\u0438\u043c \u043d\u0430\u0436\u0430\u0442\u0438\u0435\u043c',
  },
  {
    locale: 'zh-Hans',
    screen1: '\u73b0\u573a\u8bb0\u5f55\uff0c\u4e00\u76ee\u4e86\u7136',
    screen2: '\u62cd\u7167\u3001\u5907\u6ce8\uff0c\u81ea\u52a8\u586b\u5199',
    screen3: '\u7167\u7247\u4e0e\u5907\u6ce8\uff0c\u7edf\u4e00\u5f52\u6863',
    screen4: '\u4e00\u952e\u5bfc\u51fa\uff0c\u63d0\u4ea4\u5c31\u7eea',
  },
  {
    locale: 'zh-Hant',
    screen1: '\u5de5\u5730\u7d00\u9304\uff0c\u624b\u6a5f\u641e\u5b9a',
    screen2: '\u62cd\u7167\u3001\u8a3b\u8a18\uff0c\u81ea\u52d5\u5e36\u5165',
    screen3: '\u7167\u7247\u548c\u8aaa\u660e\uff0c\u6574\u5408\u5728\u4e00\u8d77',
    screen4: '\u4e00\u9375\u532f\u51fa\uff0c\u96a8\u6642\u63d0\u4ea4',
  },
  {
    locale: 'ko',
    screen1: '\ud604\uc7a5 \ubcf4\uace0\uc11c, \ud55c\uacf3\uc5d0 \uc815\ub9ac',
    screen2: '\ucc0d\uace0, \uc4f0\uace0, \ubc14\ub85c \uc644\uc131',
    screen3: '\uc0ac\uc9c4\uacfc \uba54\ubaa8, \ud568\uaed8 \uae30\ub85d',
    screen4: '\uc81c\ucd9c\uc6a9 PDF, \uc6d0\ud130\uce58\ub85c \uc644\uc131',
  },
  {
    locale: 'hi',
    screen1: '\u0938\u093e\u0907\u091f \u0915\u0940 \u0938\u093e\u0930\u0940 \u0930\u093f\u092a\u094b\u0930\u094d\u091f, \u090f\u0915 \u091c\u0917\u0939',
    screen2: '\u092b\u093c\u094b\u091f\u094b, \u0928\u094b\u091f\u2014\u092c\u093e\u0915\u0940 \u0905\u092a\u0928\u0947 \u0906\u092a \u092d\u0930\u0947',
    screen3: '\u092b\u093c\u094b\u091f\u094b \u0914\u0930 \u091f\u093f\u092a\u094d\u092a\u0923\u0940, \u0938\u093e\u0925 \u092e\u0947\u0902 \u0938\u0947\u0935',
    screen4: '\u0924\u0948\u092f\u093e\u0930 PDF, \u092c\u0938 \u090f\u0915 \u091f\u0948\u092a \u092e\u0947\u0902',
  },
  {
    locale: 'id',
    screen1: 'Semua laporan lapangan, rapi di HP',
    screen2: 'Foto, catat, langsung jadi',
    screen3: 'Foto dan catatan, tersimpan lengkap',
    screen4: 'PDF siap kirim, satu ketukan',
  },
  {
    locale: 'th',
    screen1: '\u0e23\u0e32\u0e22\u0e07\u0e32\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e07\u0e32\u0e19 \u0e23\u0e27\u0e21\u0e44\u0e27\u0e49\u0e43\u0e19\u0e21\u0e37\u0e2d\u0e16\u0e37\u0e2d',
    screen2: '\u0e16\u0e48\u0e32\u0e22 \u0e40\u0e02\u0e35\u0e22\u0e19 \u0e40\u0e2a\u0e23\u0e47\u0e08\u0e40\u0e25\u0e22',
    screen3: '\u0e23\u0e39\u0e1b\u0e41\u0e25\u0e30\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01 \u0e40\u0e01\u0e47\u0e1a\u0e44\u0e27\u0e49\u0e14\u0e49\u0e27\u0e22\u0e01\u0e31\u0e19',
    screen4: 'PDF \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e2a\u0e48\u0e07 \u0e41\u0e04\u0e48\u0e41\u0e15\u0e30\u0e04\u0e23\u0e31\u0e49\u0e07\u0e40\u0e14\u0e35\u0e22\u0e27',
  },
  {
    locale: 'vi',
    screen1: 'B\u00e1o c\u00e1o hi\u1ec7n tr\u01b0\u1eddng, g\u1ecdn trong \u0111i\u1ec7n tho\u1ea1i',
    screen2: 'Ch\u1ee5p, ghi ch\u00fa, xong ngay',
    screen3: '\u1ea2nh v\u00e0 ghi ch\u00fa, l\u01b0u c\u00f9ng m\u1ed9t ch\u1ed7',
    screen4: 'PDF s\u1eb5n s\u00e0ng n\u1ed9p, ch\u1ec9 m\u1ed9t ch\u1ea1m',
  },
  {
    locale: 'tr',
    screen1: 'Saha raporlar\u0131n, hepsi bir arada',
    screen2: '\u00c7ek, yaz, tamam\u2014hava ve konum otomatik',
    screen3: 'Foto ve notlar, hepsi bir raporda',
    screen4: 'Teslime haz\u0131r PDF, tek dokunusla',
  },
  {
    locale: 'nl',
    screen1: 'Al je werkrapporten op \u00e9\u00e9n plek',
    screen2: 'Foto, notitie, klaar\u2014weer en locatie automatisch',
    screen3: "Foto's en opmerkingen, alles bij elkaar",
    screen4: 'Kant-en-klare PDF met \u00e9\u00e9n tik',
  },
  {
    locale: 'pl',
    screen1: 'Raporty z budowy, wszystko w jednym miejscu',
    screen2: 'Zdj\u0119cie, notatka, gotowe\u2014pogoda i lokalizacja automatycznie',
    screen3: 'Zdj\u0119cia i uwagi, razem w raporcie',
    screen4: 'PDF gotowy do oddania, jednym klikni\u0119ciem',
  },
  {
    locale: 'sv',
    screen1: 'Alla byggrapporter p\u00e5 ett st\u00e4lle',
    screen2: 'Fota, anteckna, klart\u2014v\u00e4der och plats fylls i automatiskt',
    screen3: 'Bilder och anteckningar, samlade',
    screen4: 'F\u00e4rdig PDF med ett tryck',
  },
];

/** Lookup by locale string */
export const marketingTextMap: Record<string, MarketingText> = {};
for (const entry of marketingTexts) {
  marketingTextMap[entry.locale] = entry;
}
