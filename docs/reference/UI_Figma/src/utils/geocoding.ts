/**
 * 逆ジオコーディング（緯度経度から住所を取得）
 * 
 * このファイルの役割：
 * - 緯度経度を受け取る
 * - インターネット上のサービス（BigDataCloud API）に問い合わせる
 * - 住所を返す
 * 
 * 例：
 * 入力: lat=35.65910, lng=139.70363
 * 出力: "東京都渋谷区渋谷1丁目"
 */

import { LanguageCode } from '../i18n/translations';

/**
 * BigDataCloud API のレスポンス型定義
 * 
 * APIが返してくる情報の「形」を決めています
 */
interface ReverseGeocodeResponse {
  locality: string;              // 市区町村（例：渋谷区）
  city: string;                  // 市（例：渋谷区）
  principalSubdivision: string;  // 都道府県（例：東京都）
  countryName: string;           // 国（例：日本）
  localityLanguageRequested: string; // リクエストした言語
}

/**
 * 緯度経度から住所を取得する関数
 * 
 * @param lat - 緯度（例：35.65910）
 * @param lng - 経度（例：139.70363）
 * @param language - 言語コード（例：'ja'=日本語、'en'=英語）
 * @returns 住所文字列、取得失敗時は null
 * 
 * 使い方の例：
 * const address = await getAddressFromCoordinates(35.65910, 139.70363, 'ja');
 * // 結果: "東京都渋谷区"
 */
export const getAddressFromCoordinates = async (
  lat: number,
  lng: number,
  language: LanguageCode = 'en'
): Promise<string | null> => {
  try {
    // 言語コードを変換（BigDataCloud APIの形式に合わせる）
    // 'ja' → 'ja', 'zhHans' → 'zh', 'zhHant' → 'zh-TW' など
    const apiLanguage = convertToApiLanguage(language);
    
    // APIのURL（インターネット上の住所を教えてくれるサービスのアドレス）
    const apiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client`;
    
    // パラメータ（サービスに送る情報）
    const params = new URLSearchParams({
      latitude: lat.toString(),      // 緯度を文字列に変換
      longitude: lng.toString(),     // 経度を文字列に変換
      localityLanguage: apiLanguage  // 言語設定
    });
    
    // フェッチ（インターネットから情報を取得）
    // タイムアウト5秒（5秒以内に返事がなければ諦める）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒
    
    const response = await fetch(`${apiUrl}?${params}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId); // タイムアウトをキャンセル
    
    // レスポンスが成功しているか確認
    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }
    
    // JSONデータ（サービスからの返事）を読み取る
    const data: ReverseGeocodeResponse = await response.json();
    
    // 住所を組み立てる
    const address = formatAddress(data, language);
    
    return address;
    
  } catch (error) {
    // エラーが発生した場合（オフライン、タイムアウトなど）
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Geocoding request timed out');
    } else {
      console.error('Geocoding error:', error);
    }
    return null;
  }
};

/**
 * 言語コードをAPI用に変換
 * 
 * Repologの言語コード → BigDataCloud APIの言語コード
 * 
 * @param language - Repologの言語コード
 * @returns APIの言語コード
 */
const convertToApiLanguage = (language: LanguageCode): string => {
  const languageMap: Record<string, string> = {
    'en': 'en',      // 英語
    'ja': 'ja',      // 日本語
    'fr': 'fr',      // フランス語
    'es': 'es',      // スペイン語
    'de': 'de',      // ドイツ語
    'it': 'it',      // イタリア語
    'pt': 'pt',      // ポルトガル語
    'ru': 'ru',      // ロシア語
    'zhHans': 'zh',  // 中国語（簡体字）
    'zhHant': 'zh-TW', // 中国語（繁体字）
    'ko': 'ko',      // 韓国語
    'th': 'th',      // タイ語
    'id': 'id',      // インドネシア語
    'vi': 'vi',      // ベトナム語
    'hi': 'hi',      // ヒンディー語
    'tr': 'tr',      // トルコ語
    'pl': 'pl',      // ポーランド語
    'sv': 'sv',      // スウェーデン語
  };
  
  return languageMap[language] || 'en';
};

/**
 * APIのレスポンスから住所文字列を作成
 * 
 * @param data - APIからのレスポンス
 * @param language - 言語コード
 * @returns フォーマットされた住所
 */
const formatAddress = (
  data: ReverseGeocodeResponse,
  language: LanguageCode
): string => {
  // 日本語の場合：「都道府県 + 市区町村」の順
  // 英語の場合：「市区町村, 都道府県」の順
  
  const parts: string[] = [];
  
  if (language === 'ja') {
    // 日本語形式：東京都渋谷区
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
    if (data.locality || data.city) parts.push(data.locality || data.city);
  } else {
    // 英語形式：Shibuya, Tokyo
    if (data.locality || data.city) parts.push(data.locality || data.city);
    if (data.principalSubdivision) parts.push(data.principalSubdivision);
  }
  
  // パーツを結合
  const separator = language === 'ja' ? '' : ', ';
  const address = parts.filter(Boolean).join(separator);
  
  // 住所が取得できなかった場合
  if (!address) {
    return '-';
  }
  
  return address;
};

/**
 * 緯度経度を指定された桁数で四捨五入
 * 
 * @param value - 緯度または経度
 * @param decimals - 小数点以下の桁数（デフォルト5桁）
 * @returns 四捨五入された値
 * 
 * 例：
 * roundCoordinate(35.689446, 5) → 35.68945
 * roundCoordinate(139.701234, 5) → 139.70123
 */
export const roundCoordinate = (value: number, decimals: number = 5): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * 緯度経度を表示用文字列に変換
 * 
 * @param lat - 緯度
 * @param lng - 経度
 * @returns フォーマットされた文字列
 * 
 * 例：
 * formatCoordinates(35.689446, 139.701234)
 * → "Lat : 35.68945 , Lng : 139.70123"
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const roundedLat = roundCoordinate(lat, 5);
  const roundedLng = roundCoordinate(lng, 5);
  return `Lat : ${roundedLat.toFixed(5)} , Lng : ${roundedLng.toFixed(5)}`;
};
