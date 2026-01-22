import { useEffect, useRef, useState } from 'react'
import { fishingZones, zoneStyles } from '../data/fishingZones'

const KAKAO_APP_KEY = 'b9b5e7099ba2f552e538754158f6bac2'

export default function KakaoMap({ userLocation, defaultCenter, onMapReady }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const polygonsRef = useRef([])
  const selectedPolygonRef = useRef(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // Kakao SDK 동적 로드
  useEffect(() => {
    // 이미 로드되어 있으면 바로 초기화
    if (window.kakao && window.kakao.maps) {
      initializeMap()
      return
    }

    // 스크립트 동적 로드
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`
    script.async = true

    script.onload = () => {
      console.log('Kakao SDK 스크립트 로드 완료')
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('Kakao Maps 로드 완료')
          initializeMap()
        })
      }
    }

    script.onerror = (e) => {
      console.error('Kakao SDK 로드 실패:', e)
      setLoadError('지도를 불러올 수 없습니다.')
    }

    document.head.appendChild(script)

    return () => {
      // 클린업
      polygonsRef.current.forEach(({ polygon }) => {
        polygon.setMap(null)
      })
      polygonsRef.current = []
    }
  }, [])

  // 지도 초기화 함수
  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container) {
      console.error('Map container를 찾을 수 없습니다.')
      return
    }

    const initialCenter = userLocation || defaultCenter

    const options = {
      center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
      level: 7
    }

    try {
      const map = new window.kakao.maps.Map(container, options)
      mapRef.current = map
      console.log('지도 생성 성공')

      // 지도 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl()
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

      setIsMapLoaded(true)
      onMapReady?.()

      // 금지구역 폴리곤 생성
      createFishingZonePolygons(map)
    } catch (err) {
      console.error('지도 생성 에러:', err)
      setLoadError('지도를 생성할 수 없습니다.')
    }
  }

  // 금지구역 폴리곤 생성
  const createFishingZonePolygons = (map) => {
    fishingZones.forEach((zone) => {
      const style = zoneStyles[zone.type]

      const path = zone.coordinates.map(
        (coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng)
      )

      const polygon = new window.kakao.maps.Polygon({
        path: path,
        strokeWeight: style.strokeWeight,
        strokeColor: style.strokeColor,
        strokeOpacity: style.strokeOpacity,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity
      })

      polygon.setMap(map)

      window.kakao.maps.event.addListener(polygon, 'click', () => {
        handlePolygonClick(polygon, zone.type)
      })

      window.kakao.maps.event.addListener(polygon, 'mouseover', () => {
        if (selectedPolygonRef.current !== polygon) {
          polygon.setOptions({
            fillOpacity: style.fillOpacity + 0.1,
            strokeWeight: style.strokeWeight + 1
          })
        }
      })

      window.kakao.maps.event.addListener(polygon, 'mouseout', () => {
        if (selectedPolygonRef.current !== polygon) {
          polygon.setOptions({
            fillOpacity: style.fillOpacity,
            strokeWeight: style.strokeWeight
          })
        }
      })

      polygonsRef.current.push({ polygon, zone })
    })
  }

  // 폴리곤 클릭 핸들러
  const handlePolygonClick = (clickedPolygon, zoneType) => {
    const style = zoneStyles[zoneType]

    if (selectedPolygonRef.current && selectedPolygonRef.current !== clickedPolygon) {
      const prevZone = polygonsRef.current.find(
        ({ polygon }) => polygon === selectedPolygonRef.current
      )
      if (prevZone) {
        const prevStyle = zoneStyles[prevZone.zone.type]
        selectedPolygonRef.current.setOptions({
          fillOpacity: prevStyle.fillOpacity,
          strokeWeight: prevStyle.strokeWeight,
          strokeOpacity: prevStyle.strokeOpacity
        })
      }
    }

    if (selectedPolygonRef.current === clickedPolygon) {
      clickedPolygon.setOptions({
        fillOpacity: style.fillOpacity,
        strokeWeight: style.strokeWeight,
        strokeOpacity: style.strokeOpacity
      })
      selectedPolygonRef.current = null
      return
    }

    clickedPolygon.setOptions({
      fillOpacity: style.selectedFillOpacity,
      strokeWeight: style.selectedStrokeWeight,
      strokeOpacity: style.selectedStrokeOpacity
    })
    selectedPolygonRef.current = clickedPolygon
  }

  // 사용자 위치 마커 업데이트
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !userLocation) return

    const position = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)

    if (!userMarkerRef.current) {
      const markerContent = document.createElement('div')
      markerContent.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background: rgba(59, 130, 246, 0.9);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
        "></div>
      `

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 0.5,
        xAnchor: 0.5
      })

      overlay.setMap(mapRef.current)
      userMarkerRef.current = overlay
      mapRef.current.setCenter(position)
    } else {
      userMarkerRef.current.setPosition(position)
    }
  }, [userLocation, isMapLoaded])

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <p className="text-white/50">{loadError}</p>
      </div>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
