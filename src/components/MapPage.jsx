import { useEffect, useRef, useState } from 'react'
import KakaoMap from './KakaoMap'
import useUserLocation from '../hooks/useUserLocation'

export default function MapPage({ locationStatus, onLocationAllow, onLocationDeny }) {
  const {
    location,
    permissionStatus,
    defaultCenter,
    startWatching,
    stopWatching,
    getCurrentPosition
  } = useUserLocation()

  const watchIdRef = useRef(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)

  // 위치 권한 상태에 따른 모달 표시
  useEffect(() => {
    if (locationStatus === 'pending') {
      setShowPermissionModal(true)
    } else {
      setShowPermissionModal(false)
    }
  }, [locationStatus])

  // 위치 권한 허용 시 실시간 추적 시작
  useEffect(() => {
    if (locationStatus === 'active' && isMapReady) {
      // 먼저 현재 위치 가져오기
      getCurrentPosition()
        .then(() => {
          // 실시간 추적 시작
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

      {/* Map Legend */}
      <div style={{ position: 'absolute', bottom: '160px', left: '16px', right: '16px', zIndex: 20 }}>
        <div className="card-slate px-5 py-4 flex justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#8B4D4D', boxShadow: '0 0 8px rgba(139, 77, 77, 0.4)' }}
            />
            <span className="font-sans text-[11px] text-white/55">금지</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#9E8B4D', boxShadow: '0 0 8px rgba(158, 139, 77, 0.4)' }}
            />
            <span className="font-sans text-[11px] text-white/55">제한</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: '#3B82F6', boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' }}
            />
            <span className="font-sans text-[11px] text-white/55">내 위치</span>
          </div>
        </div>
      </div>

      {/* Location Permission Modal */}
      {showPermissionModal && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
          className="bg-black/45 backdrop-blur-md flex flex-col items-center justify-center px-8 gap-6 animate-fadeUp"
        >
          <div className="glass-strong p-8 max-w-sm w-full text-center">
            <h2 className="font-sans text-xl font-medium text-white/90 leading-relaxed mb-3">
              위치 정보 접근 권한이
              <br />
              필요합니다
            </h2>
            <p className="font-sans text-sm text-white/45 leading-relaxed mb-8">
              현재 위치의 낚시 가능 여부를 확인하려면
              위치 접근을 허용해 주세요.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleAllowClick}
                className="w-full py-4 font-sans text-sm font-semibold text-white border-none cursor-pointer btn-soft"
                style={{
                  background: 'linear-gradient(135deg, rgba(70, 130, 140, 0.9) 0%, rgba(50, 100, 115, 0.95) 100%)'
                }}
              >
                위치 접근 허용
              </button>
              <button
                onClick={handleDenyClick}
                className="w-full py-3 bg-transparent text-white/40 font-sans text-sm border-none cursor-pointer rounded-xl"
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
