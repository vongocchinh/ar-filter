import React, { useEffect, useRef, useState } from 'react';
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
];

const CameraKit = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cameraKitRef = useRef<CameraKitType | null>(null);
    const sessionRef = useRef<CameraKitSession | null>(null);
    const lensesCache = useRef<Map<string, any>>(new Map());
    const [selectedLensIndex, setSelectedLensIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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

                // Pre-load tất cả lens vào cache
                console.log('Loading all lenses...');
                for (const lensItem of LENS_LIST) {
                    try {
                        const lens = await cameraKit.lensRepository.loadLens(
                            lensItem.id,
                            lensItem.groupId
                        );
                        lensesCache.current.set(lensItem.id, lens);
                        console.log(`Loaded lens: ${lensItem.name}`);
                    } catch (err) {
                        console.error(`Failed to load lens ${lensItem.name}:`, err);
                    }
                }

                // Apply lens đầu tiên
                const firstLens = LENS_LIST[0];
                const cachedLens = lensesCache.current.get(firstLens.id);
                if (cachedLens) {
                    await session.applyLens(cachedLens);
                }
            } catch (error) {
                console.error('Error initializing Camera Kit:', error);
            }
        };

        initCameraKit();
    }, []);

    // Hàm chuyển đổi lens
    const handleLensChange = async (index: number) => {
        if (!cameraKitRef.current || !sessionRef.current || isLoading) return;

        try {
            setIsLoading(true);
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

    return (
        <div className='w-full h-full flex flex-col'>
            {/* Canvas */}
            <div className='flex-1 relative flex justify-center items-center'>
                <canvas ref={canvasRef} id="canvas" />
            </div>

            {/* Lens Buttons */}
            <div className='p-4 bg-gray-900 flex gap-2 overflow-x-auto fixed bottom-0 left-0 right-0'>
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
    );
};

export default CameraKit;