import { useEffect, useRef, useState } from 'react';
import { bootstrapCameraKit, CameraKitSession, CameraKit as CameraKitType } from '@snap/camera-kit';

// Định nghĩa interface cho lens
interface LensItem {
    id: string;
    groupId: string;
    name: string;
}

// Danh sách 10 lens với ID và group khác nhau
const LENS_LIST: LensItem[] = [
    { id: '49bcbaee-a8a4-419f-a37d-35a35ac1c896', groupId: '44b63370-6800-4615-a02e-f69c6ee22b86', name: 'Lens 1' },
    { id: 'e56f2aab-2c0a-41cc-b231-2093f44a5def', groupId: '44b63370-6800-4615-a02e-f69c6ee22b86', name: 'Lens 2' },
    { id: '190cff09-43c1-446b-8ef9-1edc1ec44fab', groupId: '44b63370-6800-4615-a02e-f69c6ee22b86', name: 'Lens 3' },
    { id: 'd878a895-ee32-4443-8c68-cd3b1ec846a7', groupId: '44b63370-6800-4615-a02e-f69c6ee22b86', name: 'Lens 4' },
];

const CameraKit = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cameraKitRef = useRef<CameraKitType | null>(null);
    const sessionRef = useRef<CameraKitSession | null>(null);
    const lensesCache = useRef<Map<string, any>>(new Map());
    const [selectedLensIndex, setSelectedLensIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');

    useEffect(() => {
        const initCameraKit = async () => {
            try {
                // Khởi tạo Camera Kit
                const cameraKit = await bootstrapCameraKit({
                    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzY1MjQ4NDgzLCJzdWIiOiIwYjQ0MWY4OC1jMmVmLTRjNDUtOTZjZC0yZjE3ZDVjMGM2ZDV-U1RBR0lOR35kMzJmNzBhOS0wMGJmLTRlM2ItOWEyOS0yYTdmOWM3NTNjMTQifQ.V0H7dVLVgXDNQOd_aA9w_UBGF-xjaC5lpxzyeTH2p5o',
                });
                cameraKitRef.current = cameraKit;

                // Lấy canvas element
                const liveRenderTarget = canvasRef.current;
                if (!liveRenderTarget) return;

                // Tạo session
                const session = await cameraKit.createSession({ liveRenderTarget });
                sessionRef.current = session;

                // Lấy camera stream
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

                // Set source và play
                await session.setSource(mediaStream);
                await session.play();

                // Không pre-load lens nữa, sẽ load khi người dùng click
                console.log('Camera Kit initialized. Ready for lens selection.');
            } catch (error) {
                console.error('Error initializing Camera Kit:', error);
            }
        };

        initCameraKit();
    }, []);

    // カメラリストを初期化時に取得
    useEffect(() => {
        populateCameraList();
    }, []);

    // Hàm chuyển đổi lens
    const handleLensChange = async (index: number) => {
        if (!cameraKitRef.current || !sessionRef.current || isLoading) return;

        try {
            setIsLoading(true);

            // Nếu index = -1, xóa lens hiện tại
            if (index === -1) {
                setSelectedLensIndex(-1);
                return;
            }

            const selectedLens = LENS_LIST[index];

            // Lấy lens từ cache
            let lens = lensesCache.current.get(selectedLens.id);

            // Nếu chưa có trong cache, load mới
            if (!lens) {
                console.log(`Loading lens on demand: ${selectedLens.name}`);
                lens = await cameraKitRef.current.lensRepository.loadLens(
                    selectedLens.id,
                    selectedLens.groupId
                );
                lensesCache.current.set(selectedLens.id, lens);
            }

            // Apply lens
            await sessionRef.current.applyLens(lens);
            setSelectedLensIndex(index);
        } catch (error) {
            console.error('Error changing lens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const populateCameraList = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameraDevices(videoDevices);

            // カメラリストが空でなく、現在選択されているカメラがない場合はデフォルトを設定
            if (videoDevices.length > 0 && !selectedCameraId) {
                setSelectedCameraId(videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error('Error enumerating devices:', error);
        }
    };

    const handleCameraChange = async (deviceId: string) => {
        if (!sessionRef.current || !deviceId) return;

        try {
            // 新しいカメラストリームを取得
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
            });

            // セッションのソースを新しいカメラストリームに変更
            await sessionRef.current.setSource(mediaStream);
            setSelectedCameraId(deviceId);
        } catch (error) {
            console.error('Error changing camera:', error);
        }
    };

    return <body className="text-gray-200 min-h-screen flex flex-col">

        <div id="app" className="flex-grow flex flex-col items-center justify-start pt-4 pb-48 px-4">

            <header className="mb-4 text-center w-full max-w-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI 顔変形シミュレーター</h1>
                <p className="text-xs text-gray-500 mt-1 mb-3">GPU最適化済み・プロシージャル老化エンジン搭載</p>

                <div className="flex flex-col items-center justify-center gap-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 w-full justify-center">
                        <label htmlFor="camera-select" className="text-xs text-gray-400 font-medium whitespace-nowrap">カメラ:</label>
                        <select
                            id="camera-select"
                            value={selectedCameraId}
                            onChange={(e) => handleCameraChange(e.target.value)}
                            className="camera-select cursor-pointer flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 text-xs"
                        >
                            {cameraDevices.length === 0 ? (
                                <option value="" disabled>カメラを検索中...</option>
                            ) : (
                                cameraDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `カメラ ${cameraDevices.indexOf(device) + 1}`}
                                    </option>
                                ))
                            )}
                        </select>
                        <button
                            onClick={() => populateCameraList()}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition"
                            title="デバイスリストを更新"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                            </svg>
                        </button>
                    </div>
                    <p id="camera-status-text" className="text-[10px] text-gray-500">
                        ※iPhone等は接続後に<span className="text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => populateCameraList()}>更新ボタン</span>を押してください
                    </p>
                </div>
            </header>

            <div className="video-container relative">
                <canvas ref={canvasRef} id="canvas" />

                {/* <div id="loading-indicator" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-20">
                    <div className="spinner mb-4"></div>
                    <p id="loading-text" className="text-blue-400 font-semibold animate-pulse">カメラを起動中...</p>
                </div> */}

                <div id="error-message" className="hidden absolute inset-0 flex flex-col items-center justify-center bg-red-900 bg-opacity-95 z-30 p-6 text-center">
                    <h3 className="text-white font-bold text-lg">カメラエラー</h3>
                    <p id="error-detail" className="text-gray-200 text-sm mt-2 mb-4">カメラにアクセスできませんでした。</p>
                    <div className="text-xs text-left text-gray-300 bg-black/30 p-3 rounded mb-4 space-y-1">
                        <p>• ブラウザのカメラ権限が許可されていますか？</p>
                        <p>• 他のアプリ(Zoom等)がカメラを使用中ではありませんか？</p>
                        <p>• iPhoneの場合は「信頼する」をタップしましたか？</p>
                    </div>
                    <button onClick={() => location.reload()} className="px-4 py-2 bg-white text-red-900 font-bold rounded hover:bg-gray-200 transition">ページを再読み込み</button>
                </div>

                <div id="status-message" className="hidden absolute top-4 left-0 right-0 text-center pointer-events-none z-10">
                    <span className="bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                        2人映ると顔が入れ替わります
                    </span>
                </div>

                <div id="projector-indicator" className="hidden absolute bottom-4 right-4 z-10">
                    <span className="flex items-center gap-2 bg-red-600 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        LIVE OUT
                    </span>
                </div>
            </div>

        </div>

        <div id="control-panel" className="fixed bottom-0 left-0 w-full bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4 pb-8 z-50 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-4xl mx-auto">

                <div className="flex items-center justify-between mb-2 px-2 border-b border-gray-800 pb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">フィルターモード選択</span>
                    <span id="fps-display" className="text-xs font-mono text-green-500">FPS: 0</span>
                </div>

                <div className="flex overflow-x-auto space-x-3 py-2 px-1 scrollbar-hide" id="filter-buttons">
                    <button
                        onClick={() => handleLensChange(-1)}
                        className={`
                            px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                            ${selectedLensIndex === -1
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        disabled={isLoading}
                    >
                        無し
                    </button>
                    {LENS_LIST.map((lens, index) => (
                        <button
                            key={lens.id}
                            onClick={() => handleLensChange(index)}
                            disabled={isLoading}
                            className={`
                            px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                            ${selectedLensIndex === index
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                }
                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        >
                            {lens.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </body>
};

export default CameraKit;