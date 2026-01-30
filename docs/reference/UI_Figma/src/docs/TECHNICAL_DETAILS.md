# 技術実装の詳細（開発者向け）

## 📋 概要
このドキュメントは、Repologの実装における技術的な詳細、設計判断、ベストプラクティスを説明します。

---

## 🕐 24時間表記の実装

### 設計判断

#### なぜ `en-GB` ロケールを使用するのか？

```javascript
// ❌ 悪い例: ロケール依存
date.toLocaleTimeString() // ユーザーの端末設定に依存

// ❌ 悪い例: 'en-US'（アメリカ英語）
date.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
}) // "03:30 PM" になる可能性が高い

// ✅ 良い例: 'en-GB'（イギリス英語）+ hour12: false
date.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}) // 確実に "15:30" になる
```

**理由:**
1. `en-GB` は24時間表記がデフォルト
2. `hour12: false` を明示することで、将来のブラウザ/OSの変更に対しても安定
3. ロケール非依存で一貫した表示が可能

### 実装箇所一覧

| ファイル | 関数/箇所 | 目的 |
|----------|-----------|------|
| `/components/Home.tsx` | `formatTime()` | タイムライン表示 |
| `/components/ReportEditor.tsx` | 作成日時表示 | 編集画面 |
| `/components/PDFPreview.tsx` | メタ情報表示 | プレビュー画面 |
| `/utils/pdfGenerator.ts` | `formatDate()` | PDF生成 |

### タイムゾーンの扱い

```javascript
// すべての日時は端末のローカルタイムゾーンで保存・表示
const now = new Date(); // 端末のタイムゾーンで現在時刻を取得

// ファイル名用のフォーマット（UTCではなくローカル）
const dateStr = new Date(report.createdAt)
  .toISOString()              // "2026-01-26T15:30:00.000Z"
  .replace(/[-:]/g, '')       // "20260126T153000.000Z"
  .slice(0, 13)               // "20260126T1530"
  .replace('T', '_');         // "20260126_1530"
```

**設計判断:**
- UTCではなくローカル時刻を使用する理由:
  - 現場作業者は「今ここで」の時刻が重要
  - タイムゾーンをまたぐ作業は稀
  - 直感的でわかりやすい

---

## 🌤️ 天気アイコンの実装

### アイコンマッピング

```typescript
// types/index.ts
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'none';

// components/Home.tsx
const getWeatherIcon = (weather: string) => {
  const iconClass = "w-4 h-4 text-gray-500";
  
  switch (weather) {
    case 'sunny':  return <Sun className={iconClass} />;
    case 'cloudy': return <Cloud className={iconClass} />;
    case 'rainy':  return <CloudRain className={iconClass} />;
    case 'snowy':  return <CloudSnow className={iconClass} />;
    default:       return null;
  }
};
```

### デザイン判断

#### サイズとカラー
```css
w-4 h-4        /* 16px × 16px */
text-gray-500  /* 中間のグレー色 */
```

**理由:**
- 16px: 時刻テキスト（14px）より少し大きく、視認性を確保
- グレー: 主張しすぎず、情報として適切なコントラスト

#### 配置位置
```jsx
<div className="flex items-center gap-2">
  <span>15:30</span>                      {/* 時刻 */}
  {getWeatherIcon(report.weather)}        {/* 天気 */}
  {report.pdfGenerated && <Badge>PDF</Badge>}  {/* PDF */}
</div>
```

**理由:**
- 時系列情報（時刻）の隣に配置
- PDFバッジの前に配置（視線の流れ: 時刻 → 天気 → PDF）

### パフォーマンス考慮

```typescript
// ✅ 良い実装: 関数をコンポーネント外で定義
const getWeatherIcon = (weather: string) => { ... }

// ❌ 悪い実装: map内で毎回定義
{reports.map(report => {
  const getIcon = (w) => { ... }  // 毎回新しい関数が作られる
  return <div>{getIcon(report.weather)}</div>
})}
```

**最適化:**
- アイコン取得関数はコンポーネントレベルで1回だけ定義
- Reactのレンダリング最適化が効きやすい

---

## 🔍 検索UIの簡素化

### 変更前の問題点

```jsx
// 冗長: 虫眼鏡ボタンと検索バーの両方が存在
<Button onClick={() => {}}>  {/* 何もしないボタン */}
  <Search />
</Button>
<Input placeholder="検索..." />
```

**問題:**
1. ボタンが機能していない（`onClick={() => {}}`）
2. ユーザーを混乱させる（どちらで検索するの？）
3. スペースの無駄

### 変更後の設計

```jsx
// シンプル: 設定ボタンだけ
<Button onClick={onOpenSettings}>
  <Settings />
</Button>

// 検索は検索バーで直接行う
<Input 
  type="search"
  placeholder={t.search}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**メリット:**
1. 明確な操作フロー
2. リアルタイム検索（入力中に結果が更新）
3. モバイルフレンドリー

---

## 📌 ピン留め機能の視覚的強化

### 実装方法

#### 条件付きスタイリング

```typescript
<div
  className={`rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer ${
    report.isPinned 
      ? 'bg-blue-50 border-2 border-blue-200'  // ピン留め
      : 'bg-white'                              // 通常
  }`}
>
```

#### CSS クラスの説明

| クラス | 効果 | 値 |
|--------|------|-----|
| `bg-blue-50` | 背景色（薄い青） | `#eff6ff` |
| `border-2` | 枠線の太さ | 2px |
| `border-blue-200` | 枠線の色（青） | `#bfdbfe` |
| `bg-white` | 背景色（白） | `#ffffff` |

### デザインシステムの一貫性

```typescript
// Tailwind のカラーパレット（50-900）
bg-blue-50   // 最も薄い
bg-blue-100
bg-blue-200  // 枠線
...
bg-blue-900  // 最も濃い
```

**選択理由:**
- `blue-50`: 十分に薄く、テキストの可読性を損なわない
- `blue-200`: 枠線として適度に目立つ
- 両方とも同じ色相（青）で統一感がある

### ソートロジック

```typescript
filtered.sort((a, b) => {
  // 1. ピン留めが優先
  if (a.isPinned && !b.isPinned) return -1;
  if (!a.isPinned && b.isPinned) return 1;
  
  // 2. 同じピン状態なら日時で降順
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

**ソート順:**
1. ピン留めレポート（新しい順）
2. 通常レポート（新しい順）

---

## 🎨 スタイリングのベストプラクティス

### Tailwind CSS の使い方

#### ユーティリティファースト
```jsx
// ✅ 良い例: Tailwind のユーティリティクラス
<div className="flex items-center gap-2 text-sm text-gray-500">

// ❌ 悪い例: カスタムCSS
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
```

#### レスポンシブデザイン
```jsx
// モバイル: 1列、デスクトップ: 2列
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

| ブレークポイント | 幅 | 使用場面 |
|------------------|-----|----------|
| デフォルト | 0px~ | モバイル |
| `sm:` | 640px~ | タブレット |
| `md:` | 768px~ | 小型デスクトップ |
| `lg:` | 1024px~ | デスクトップ |

### アクセシビリティ

#### タップターゲットサイズ
```jsx
// ✅ 良い例: 44×44px以上
<Button size="icon" className="h-9 w-9">  {/* 36px */}
  <MoreVertical className="w-5 h-5" />   {/* アイコン20px */}
</Button>

// より安全: 44×44px
<Button size="icon" className="h-11 w-11">
```

**WCAG 2.1 推奨:**
- 最小: 44×44px
- 理想: 48×48px

#### カラーコントラスト
```jsx
// 時刻（グレー on 白背景）
<span className="text-gray-500">15:30</span>

// コントラスト比: 4.5:1 以上（WCAG AA基準）
```

---

## 📦 データ構造

### Report型の定義

```typescript
export interface Report {
  id: string;
  siteName: string;
  createdAt: Date;
  location?: Location;
  weather: WeatherType;
  comment: string;
  photos: Photo[];
  isPinned: boolean;
  pdfGenerated: boolean;
}
```

### ローカルストレージのスキーマ

```json
{
  "repolog_reports": "[{...}, {...}]",
  "repolog_settings": "{...}",
  "repolog_pdf_exports": "{count: 3, month: 0}"
}
```

**データ永続化:**
- `localStorage.setItem()` で保存
- JSON.stringify() でシリアライズ
- JSON.parse() でデシリアライズ

### 日付のシリアライズ

```typescript
// 保存時
localStorage.setItem('reports', JSON.stringify(reports));
// Date → 文字列（ISO 8601形式）

// 読み込み時
const parsed = JSON.parse(savedReports);
const reportsWithDates = parsed.map(r => ({
  ...r,
  createdAt: new Date(r.createdAt),  // 文字列 → Date
}));
```

---

## 🔧 デバッグ方法

### コンソールでの確認

```javascript
// Home画面のレポート一覧を確認
console.log('Filtered reports:', filteredReports);

// 特定のレポートの詳細
console.log('Report:', reports.find(r => r.id === 'xxx'));

// 時間フォーマットのテスト
const date = new Date('2026-01-26T15:30:00');
console.log('24h format:', date.toLocaleTimeString('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}));
```

### React Developer Tools

1. ブラウザ拡張をインストール
2. Components タブで状態を確認
3. Profiler タブでパフォーマンスを測定

### ローカルストレージの確認

```javascript
// ブラウザのコンソールで実行
localStorage.getItem('repolog_reports');
localStorage.getItem('repolog_settings');
```

---

## 🧪 テストシナリオ

### 単体テスト（推奨）

```typescript
describe('formatTime', () => {
  it('should format time in 24-hour format', () => {
    const date = new Date('2026-01-26T15:30:00');
    const result = formatTime(date);
    expect(result).toBe('15:30');
  });
  
  it('should handle midnight correctly', () => {
    const date = new Date('2026-01-26T00:00:00');
    const result = formatTime(date);
    expect(result).toBe('00:00');
  });
});

describe('getWeatherIcon', () => {
  it('should return Sun icon for sunny weather', () => {
    const icon = getWeatherIcon('sunny');
    expect(icon.type).toBe(Sun);
  });
  
  it('should return null for none weather', () => {
    const icon = getWeatherIcon('none');
    expect(icon).toBeNull();
  });
});
```

### 統合テスト

```typescript
describe('Home screen', () => {
  it('should display pinned reports first', () => {
    // Setup
    const pinnedReport = { id: '1', isPinned: true, createdAt: new Date('2026-01-25') };
    const normalReport = { id: '2', isPinned: false, createdAt: new Date('2026-01-26') };
    
    // Render
    render(<Home reports={[normalReport, pinnedReport]} />);
    
    // Assert
    const reportCards = screen.getAllByRole('article');
    expect(reportCards[0]).toHaveTextContent('1');
  });
});
```

---

## 🚀 パフォーマンス最適化

### useMemo の使用

```typescript
const filteredReports = useMemo(() => {
  let filtered = [...reports];
  
  // フィルタリングロジック
  if (filter === 'pinned') {
    filtered = filtered.filter(r => r.isPinned);
  }
  
  // 検索ロジック
  if (searchQuery.trim()) {
    filtered = filtered.filter(r => 
      r.siteName.includes(searchQuery)
    );
  }
  
  // ソート
  filtered.sort(/* ... */);
  
  return filtered;
}, [reports, filter, searchQuery]);
```

**メリット:**
- 依存配列が変わらない限り再計算しない
- 大量のレポートがある場合に効果的

### 画像の最適化

```typescript
// 将来の実装: 画像圧縮
const compressImage = async (uri: string) => {
  // ImageManipulator などで圧縮
  // 幅: 1200px、品質: 80%
  return compressedUri;
};
```

---

## 📚 参考リンク

### JavaScript Date API
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: toLocaleTimeString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString)

### React Hooks
- [React Hooks Reference](https://react.dev/reference/react)
- [useMemo](https://react.dev/reference/react/useMemo)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

---

## 🔄 今後の技術的改善

### 1. TypeScript型安全性の強化
```typescript
// 現在: string
weather: string

// 改善案: より厳格な型
weather: WeatherType  // 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'none'
```

### 2. エラーハンドリング
```typescript
try {
  const result = formatTime(date);
  return result;
} catch (error) {
  console.error('Failed to format time:', error);
  return '--:--';  // フォールバック値
}
```

### 3. 国際化の拡張
```typescript
// 言語ごとに異なる日付フォーマット
const getLocaleDateFormat = (lang: string) => {
  switch(lang) {
    case 'ja': return 'YYYY年MM月DD日 HH:mm';
    case 'en': return 'DD/MM/YYYY HH:mm';
    default: return 'DD/MM/YYYY HH:mm';
  }
};
```

---

このドキュメントは継続的に更新されます。
質問や提案があれば、Issue を作成してください。
