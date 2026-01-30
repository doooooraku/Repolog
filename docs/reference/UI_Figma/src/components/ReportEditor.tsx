import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Report, Photo, WeatherType, Location, MAX_COMMENT_LENGTH, FREE_MAX_PHOTOS_PER_REPORT } from '../types';
import { ArrowLeft, FileText, Camera, Image as ImageIcon, Trash2, Sun, Cloud, CloudRain, CloudSnow, MapPin, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

import { toast } from 'sonner';
import { getAddressFromCoordinates, formatCoordinates } from '../utils/geocoding';

// dnd-kit imports for drag and drop functionality
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Image compression library
import imageCompression from 'browser-image-compression';

interface ReportEditorProps {
  report: Report | null;
  onBack: () => void;
  onOpenPDFPreview: (report: Report) => void;
}

/**
 * ドラッグ可能な写真コンポーネント
 * 
 * 役割：
 * - 1枚1枚の写真をドラッグ&ドロップできるようにする
 * - ドラッグ中は半透明にして視覚的フィードバックを提供
 * - 削除ボタンも表示
 */
const SortablePhoto: React.FC<{
  photo: Photo;
  index: number;
  onDelete: (id: string) => void;
}> = ({ photo, index, onDelete }) => {
  // useSortable：このコンポーネントをドラッグ可能にするフック
  const {
    attributes,    // ドラッグに必要な属性（aria-roledescription など）
    listeners,     // ドラッグイベントのリスナー（onPointerDown など）
    setNodeRef,    // このコンポーネントのDOM参照を設定
    transform,     // ドラッグ中の移動量（x, y）
    transition,    // アニメーションのトランジション
    isDragging,    // ドラッグ中かどうか
  } = useSortable({ id: photo.id });

  // ドラッグ中のスタイル
  const style = {
    transform: CSS.Transform.toString(transform),  // 移動量をCSS transformに変換
    transition,  // スムーズなアニメーション
    opacity: isDragging ? 0.5 : 1,  // ドラッグ中は半透明
    cursor: 'grab',  // カーソルを手の形に
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group touch-none"
    >
      <img
        src={photo.uri}
        alt={`Photo ${index + 1}`}
        className="w-full aspect-[4/3] object-cover rounded-xl border shadow-sm pointer-events-none select-none"
        draggable={false}
      />
      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full pointer-events-none">
        {index + 1}
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 rounded-full shadow-lg"
        onClick={(e) => {
          e.stopPropagation();  // ドラッグイベントを防ぐ
          onDelete(photo.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}  // ドラッグ開始を防ぐ
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const ReportEditor: React.FC<ReportEditorProps> = ({
  report,
  onBack,
  onOpenPDFPreview,
}) => {
  const { t, addReport, updateReport, settings } = useApp();
  
  const [siteName, setSiteName] = useState('');
  const [comment, setComment] = useState('');
  const [weather, setWeather] = useState<WeatherType>('none');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (report) {
      setSiteName(report.siteName);
      setComment(report.comment);
      setWeather(report.weather);
      setPhotos(report.photos);
      setLocation(report.location);
    }
  }, [report]);

  /**
   * ドラッグ&ドロップのセンサー設定
   * 
   * 役割：
   * - PointerSensor：マウスやタッチでのドラッグを検知
   * - TouchSensor：モバイルでのタッチ操作を検知
   * - activationConstraint：誤操作を防ぐため、少し動かしたらドラッグ開始
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,  // 8ピクセル動かしたらドラッグ開始
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,      // 200ミリ秒（0.2秒）長押ししたらドラッグ開始
        tolerance: 5,    // 5ピクセル以内の揺れは許容
      },
    })
  );

  /**
   * ドラッグが終了した時の処理
   * 
   * どう動くか：
   * 1. ユーザーが画像を別の位置にドロップ
   * 2. active（ドラッグした画像）とover（ドロップ先）の情報を取得
   * 3. 配列の並び順を入れ替え
   * 4. 画面が自動的に更新される
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // ドロップ先が存在し、元の位置と違う場合のみ処理
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        // 元の位置と新しい位置を探す
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // arrayMove：配列の要素を移動させるヘルパー関数
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * 位置情報を取得する関数
   * 
   * どう動くか：
   * 1. ブラウザに「位置情報を教えて」とお願い
   * 2. ユーザーが許可すると、緯度経度を取得
   * 3. その緯度経度から住所を取得
   * 4. 両方を保存
   */
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      // Geolocation APIで位置情報を取得
      if (!navigator.geolocation) {
        toast.error(t.geolocationNotSupported);
        setIsLoadingLocation(false);
        return;
      }

      // Permissions Policy チェック（iframe環境での制限を検知）
      try {
        // Permissions API で位置情報が許可されているか確認
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        if (permissionStatus.state === 'denied') {
          console.warn('Geolocation permission is denied');
        }
      } catch (permError) {
        // Permissions API が使えない場合やポリシーエラーの場合
        console.warn('Permissions API check failed:', permError);
      }

      // HTTPS チェック（localhost以外）
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext && !isLocalhost) {
        toast.error(t.httpsRequired);
        setIsLoadingLocation(false);
        return;
      }

      console.log('Requesting geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // 位置情報取得成功
          console.log('Geolocation success:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 住所を取得（バックグラウンドで）
          const address = await getAddressFromCoordinates(
            lat,
            lng,
            settings.language as any
          );

          // 位置情報を保存
          const newLocation: Location = {
            lat,
            lng,
            address: address || undefined,
            addressFetchedAt: new Date(),
          };

          setLocation(newLocation);
          toast.success(t.locationObtained);
          setIsLoadingLocation(false);
        },
        (error: GeolocationPositionError) => {
          // 位置情報取得失敗
          console.error('Geolocation error details:', {
            code: error.code,
            message: error.message,
            errorName: 
              error.code === 1 ? 'PERMISSION_DENIED' :
              error.code === 2 ? 'POSITION_UNAVAILABLE' :
              error.code === 3 ? 'TIMEOUT' : 'UNKNOWN'
          });
          
          // エラーコードで分岐（数値で比較）
          // 1: PERMISSION_DENIED - ユーザーが位置情報の使用を拒否、またはPermissions Policyでブロック
          // 2: POSITION_UNAVAILABLE - 位置情報を取得できない
          // 3: TIMEOUT - タイムアウト
          if (error.code === 1) {
            // Permissions Policyエラーを検知
            if (error.message.includes('permissions policy') || error.message.includes('document')) {
              toast.error('Location is disabled in preview mode. Enable it in app settings when deployed.');
            } else {
              toast.error(t.locationDenied);
            }
          } else if (error.code === 2) {
            toast.error(t.locationUnavailable);
          } else if (error.code === 3) {
            toast.error(t.locationTimeout);
          } else {
            toast.error(t.locationError + ': ' + error.message);
          }
          
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,  // 高精度モード（GPS優先）
          timeout: 15000,  // 15秒でタイムアウト
          maximumAge: 0,  // キャッシュを使わない（常に最新の位置情報を取得）
        }
      );
    } catch (error) {
      console.error('Location error:', error);
      toast.error(t.locationError);
      setIsLoadingLocation(false);
    }
  };

  /**
   * 住所を再取得する関数
   * 
   * すでに緯度経度がある場合に、住所だけ再取得
   */
  const handleRefreshAddress = async () => {
    if (!location) return;

    setIsLoadingLocation(true);

    try {
      const address = await getAddressFromCoordinates(
        location.lat,
        location.lng,
        settings.language as any
      );

      setLocation({
        ...location,
        address: address || undefined,
        addressFetchedAt: new Date(),
      });

      if (address) {
        toast.success(t.addressUpdated);
      } else {
        toast.warning(t.addressNotAvailable);
      }
    } catch (error) {
      console.error('Address refresh error:', error);
      toast.error(t.addressUpdateFailed);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSave = () => {
    if (!siteName.trim()) {
      toast.error('Site name is required');
      return;
    }

    const reportData: Report = {
      id: report?.id || Date.now().toString(),
      siteName: siteName.trim(),
      createdAt: report?.createdAt || new Date(),
      weather,
      comment: comment.trim(),
      photos,
      isPinned: report?.isPinned || false,
      pdfGenerated: report?.pdfGenerated || false,
      location: settings.includeLocation ? location : undefined,
    };

    if (report) {
      updateReport(report.id, reportData);
      toast.success('Report updated');
    } else {
      addReport(reportData);
      toast.success('Report created');
    }

    onBack();
  };

  /**
   * アルバムから写真を追加する関数
   * 
   * どう動くか：
   * 1. ファイル選択ダイアログを表示
   * 2. ユーザーが写真を選択
   * 3. 選んだ写真を読み込んで追加
   */
  const handleAddPhotos = async () => {
    // Check limits for free plan
    if (settings.plan === 'free' && photos.length >= FREE_MAX_PHOTOS_PER_REPORT) {
      toast.error(`Free plan limit: ${FREE_MAX_PHOTOS_PER_REPORT} photos per report`);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newPhotos: Photo[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check limit
        if (settings.plan === 'free' && photos.length + newPhotos.length >= FREE_MAX_PHOTOS_PER_REPORT) {
          toast.error(`Free plan limit: ${FREE_MAX_PHOTOS_PER_REPORT} photos per report`);
          break;
        }

        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              const photo: Photo = {
                id: `${Date.now()}-${i}`,
                uri: e.target.result as string,
                order: photos.length + newPhotos.length,
                capturedAt: new Date(),
              };
              newPhotos.push(photo);
              resolve(null);
            }
          };
          reader.readAsDataURL(file);
        });
      }

      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} photos added`);
    };

    input.click();
  };

  /**
   * カメラで撮影する関数
   * 
   * どう動くか：
   * 1. スマホのカメラアプリを起動
   * 2. ユーザーが写真を撮影
   * 3. 撮った写真を自動的に圧縮（軽量化）
   * 4. 圧縮した写真を追加
   * 
   * なぜ圧縮するか：
   * - スマホのカメラは数MBの大きな写真を撮る
   * - そのまま保存すると読み込みが遅くなる
   * - 圧縮すると数百KBになり、サクサク動く
   */
  const handleTakePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Free版の枚数制限チェック
    if (settings.plan === 'free' && photos.length >= FREE_MAX_PHOTOS_PER_REPORT) {
      toast.error(`Free plan limit: ${FREE_MAX_PHOTOS_PER_REPORT} photos per report`);
      e.target.value = '';  // input要素をリセット
      return;
    }

    const file = files[0];
    
    try {
      // 画像を圧縮
      // maxSizeMB: 1 → 最大1MBまで圧縮
      // maxWidthOrHeight: 1920 → 幅または高さを最大1920pxに縮小
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,  // バックグラウンドで処理（画面が固まらない）
      });

      // 圧縮した画像をBase64文字列に変換
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto: Photo = {
            id: Date.now().toString(),
            uri: event.target.result as string,
            order: photos.length,
            capturedAt: new Date(),
          };
          setPhotos([...photos, newPhoto]);
          toast.success('Photo added');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Photo compression error:', error);
      toast.error('Failed to process photo');
    }

    // input要素をリセット（同じ画像を再選択可能にする）
    e.target.value = '';
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter((p) => p.id !== photoId));
    toast.success('Photo deleted');
  };

  const weatherOptions: { type: WeatherType; icon: React.ReactNode; label: string }[] = [
    { type: 'sunny', icon: <Sun className="w-5 h-5" />, label: t.sunny },
    { type: 'cloudy', icon: <Cloud className="w-5 h-5" />, label: t.cloudy },
    { type: 'rainy', icon: <CloudRain className="w-5 h-5" />, label: t.rainy },
    { type: 'snowy', icon: <CloudSnow className="w-5 h-5" />, label: t.snowy },
  ];

  const remainingChars = MAX_COMMENT_LENGTH - comment.length;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* AppBar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate max-w-[200px]">
            {siteName || t.reportEditor}
          </h1>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            handleSave();
            // After save, open PDF preview
            if (siteName.trim()) {
              const reportData: Report = {
                id: report?.id || Date.now().toString(),
                siteName: siteName.trim(),
                createdAt: report?.createdAt || new Date(),
                weather,
                comment: comment.trim(),
                photos,
                isPinned: report?.isPinned || false,
                pdfGenerated: false,
                location: settings.includeLocation ? location : undefined,
              };
              onOpenPDFPreview(reportData);
            }
          }}
        >
          <FileText className="w-4 h-4 mr-1" />
          {t.pdf}
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Basic Info Section */}
          <section className="bg-white rounded-lg border p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">基本情報</h2>
            
            {/* Site Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="siteName">{t.siteName} *</Label>
                <span
                  className={`text-xs ${
                    siteName.length >= 30
                      ? 'text-red-600'
                      : siteName.length >= 29
                      ? 'text-orange-600'
                      : 'text-gray-500'
                  }`}
                >
                  {siteName.length}/30
                </span>
              </div>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    setSiteName(e.target.value);
                  }
                }}
                placeholder={t.siteNamePlaceholder}
                className="mt-1"
              />
            </div>

            {/* Created At (read-only) */}
            <div>
              <Label>{t.createdAt}</Label>
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  const d = report?.createdAt ? new Date(report.createdAt) : new Date();
                  const dateStr = d.toLocaleDateString('en-CA');
                  const timeStr = d.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  return `${dateStr} ${timeStr}`;
                })()}
              </div>
            </div>

            {/* Weather */}
            <div>
              <Label>{t.weather}</Label>
              <div className="flex gap-2 mt-2">
                {weatherOptions.map((option) => (
                  <Button
                    key={option.type}
                    variant={weather === option.type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWeather(option.type)}
                    className="flex-1"
                  >
                    {option.icon}
                    <span className="ml-1 hidden sm:inline">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Section */}
            {settings.includeLocation && (
              <div>
                <Label>{t.location}</Label>
                
                {!location ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleGetLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t.obtaining}
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        {t.getLocation}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-600">
                            {t.locationObtained}
                          </span>
                        </div>
                        {location.address && (
                          <div className="text-sm text-gray-700 mb-1">
                            {location.address}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 font-mono">
                          {formatCoordinates(location.lat, location.lng)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRefreshAddress}
                          disabled={isLoadingLocation}
                          title="住所を再取得"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(undefined)}
                          title="位置情報を削除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Comment Section */}
          <section className="bg-white rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t.comment}</h2>
              <span
                className={`text-xs ${
                  comment.length >= MAX_COMMENT_LENGTH
                    ? 'text-red-600'
                    : comment.length >= MAX_COMMENT_LENGTH * 0.975
                    ? 'text-orange-600'
                    : 'text-gray-500'
                }`}
              >
                {comment.length}/{MAX_COMMENT_LENGTH}
                {comment.length >= MAX_COMMENT_LENGTH && ' ' + t.maxLengthReached}
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                  setComment(e.target.value);
                }
              }}
              placeholder={t.commentPlaceholder}
              rows={6}
              className="resize-none"
            />
          </section>

          {/* Photos Section */}
          <section className="bg-white rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {t.photos} ({photos.length})
              </h2>
              {settings.plan === 'free' && (
                <span className="text-xs text-gray-500">
                  Max {FREE_MAX_PHOTOS_PER_REPORT} for Free
                </span>
              )}
            </div>

            {/* Photo Grid with Drag & Drop */}
            {photos.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={photos.map((p) => p.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <SortablePhoto
                        key={photo.id}
                        photo={photo}
                        index={index}
                        onDelete={handleDeletePhoto}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* カメラで撮影ボタン */}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById('camera-input')?.click()}
              >
                <Camera className="w-4 h-4 mr-2" />
                {t.takePhoto}
              </Button>
              
              {/* アルバムから追加ボタン */}
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleAddPhotos}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {t.addFromAlbum}
              </Button>
            </div>

            {/* 隠しinput要素：カメラ呼び出し用 */}
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleTakePhoto}
            />
          </section>
        </div>
      </div>

      {/* Bottom Save Button (Mobile) */}
      <div className="bg-white border-t p-4 sm:hidden">
        <Button className="w-full" onClick={handleSave}>
          {t.save}
        </Button>
      </div>
    </div>
  );
};
