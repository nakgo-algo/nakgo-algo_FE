import { useEffect, useRef, useState } from 'react'
import KakaoMap from './KakaoMap'
import useUserLocation from '../hooks/useUserLocation'

// 모바일 접속 QR 코드 컴포넌트
function MobileQRCode() {
  const [showQR, setShowQR] = useState(false)
  const networkUrl = 'http://192.168.1.19:3000'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(networkUrl)}`

  return (
    <>
      {/* QR 버튼 */}
      <button
        onClick={() => setShowQR(!showQR)}
        className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center"
        title="모바일 접속 QR"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="3" height="3" />
          <rect x="18" y="14" width="3" height="3" />
          <rect x="14" y="18" width="3" height="3" />
          <rect x="18" y="18" width="3" height="3" />
        </svg>
      </button>

      {/* QR 모달 */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-xl p-5 mx-4 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-gray-800 font-semibold mb-1">모바일 접속</h3>
            <p className="text-gray-500 text-sm mb-4">같은 Wi-Fi에서 스캔</p>
            <img src={qrUrl} alt="QR Code" className="w-32 h-32 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-mono">{networkUrl}</p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function MapPage({ locationStatus, onLocationAllow, onLocationDeny }) {
  const {
    location,
    defaultCenter,
    startWatching,
    stopWatching,
    getCurrentPosition
  } = useUserLocation()

  const watchIdRef = useRef(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    if (locationStatus === 'pending') {
      setShowPermissionModal(true)
    } else {
      setShowPermissionModal(false)
    }
  }, [locationStatus])

  useEffect(() => {
    if (locationStatus === 'active' && isMapReady) {
      getCurrentPosition()
        .then(() => {
          watchIdRef.current = startWatching()
        })
        .catch((err) => {
          console.error('위치 가져오기 실패:', err)
        })
    }

    return () => {
      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [locationStatus, isMapReady, getCurrentPosition, startWatching, stopWatching])

  const handleMapReady = () => {
    setIsMapReady(true)
  }

  const handleAllowClick = () => {
    onLocationAllow()
    setShowPermissionModal(false)
  }

  const handleDenyClick = () => {
    onLocationDeny()
    setShowPermissionModal(false)
  }

  return (
    <>
      {/* Kakao Map - 전체 화면 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        <KakaoMap
          userLocation={locationStatus === 'active' ? location : null}
          defaultCenter={defaultCenter}
          onMapReady={handleMapReady}
        />
      </div>

      {/* QR 코드 버튼 */}
      <div style={{ position: 'absolute', bottom: '24px', right: '16px', zIndex: 20 }}>
        <MobileQRCode />
      </div>

      {/* 범례 */}
      <div style={{ position: 'absolute', bottom: '24px', left: '16px', zIndex: 20 }}>
        <div className="flex items-center gap-4 text-[11px] text-white drop-shadow-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            금지
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            제한
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            내 위치
          </span>
        </div>
      </div>

      {/* Location Permission Modal */}
      {showPermissionModal && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
          className="bg-black/40 flex flex-col items-center justify-center px-6"
        >
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              위치 접근 권한
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              현재 위치의 낚시 가능 여부를 확인하려면 위치 접근을 허용해 주세요.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleAllowClick}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                허용
              </button>
              <button
                onClick={handleDenyClick}
                className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
