// 낚시 금지/제한 구역 mock 데이터
// type: 'prohibited' (금지) | 'restricted' (제한)

export const fishingZones = [
  // 서울 한강 일부 구역 (금지)
  {
    id: 1,
    name: '한강 여의도 수중보 구역',
    type: 'prohibited',
    coordinates: [
      { lat: 37.5283, lng: 126.9311 },
      { lat: 37.5290, lng: 126.9380 },
      { lat: 37.5250, lng: 126.9385 },
      { lat: 37.5245, lng: 126.9315 },
    ]
  },
  // 부산 해운대 (제한)
  {
    id: 2,
    name: '해운대 해수욕장 주변',
    type: 'restricted',
    coordinates: [
      { lat: 35.1590, lng: 129.1600 },
      { lat: 35.1600, lng: 129.1680 },
      { lat: 35.1550, lng: 129.1690 },
      { lat: 35.1540, lng: 129.1610 },
    ]
  },
  // 인천 연안부두 (금지)
  {
    id: 3,
    name: '인천 연안부두',
    type: 'prohibited',
    coordinates: [
      { lat: 37.4520, lng: 126.6010 },
      { lat: 37.4540, lng: 126.6080 },
      { lat: 37.4500, lng: 126.6100 },
      { lat: 37.4480, lng: 126.6030 },
    ]
  },
  // 제주 성산포 (제한)
  {
    id: 4,
    name: '성산포 항구',
    type: 'restricted',
    coordinates: [
      { lat: 33.4610, lng: 126.9420 },
      { lat: 33.4630, lng: 126.9500 },
      { lat: 33.4580, lng: 126.9520 },
      { lat: 33.4560, lng: 126.9440 },
    ]
  },
  // 강릉 주문진 (금지)
  {
    id: 5,
    name: '주문진 방파제',
    type: 'prohibited',
    coordinates: [
      { lat: 37.8950, lng: 128.8300 },
      { lat: 37.8970, lng: 128.8350 },
      { lat: 37.8940, lng: 128.8380 },
      { lat: 37.8920, lng: 128.8330 },
    ]
  },
  // 목포 (제한)
  {
    id: 6,
    name: '목포 삼학도 주변',
    type: 'restricted',
    coordinates: [
      { lat: 34.7850, lng: 126.3850 },
      { lat: 34.7880, lng: 126.3920 },
      { lat: 34.7840, lng: 126.3950 },
      { lat: 34.7810, lng: 126.3880 },
    ]
  },
  // 여수 (금지)
  {
    id: 7,
    name: '여수 엑스포 해양공원',
    type: 'prohibited',
    coordinates: [
      { lat: 34.7470, lng: 127.7450 },
      { lat: 34.7500, lng: 127.7520 },
      { lat: 34.7460, lng: 127.7550 },
      { lat: 34.7430, lng: 127.7480 },
    ]
  },
  // 울산 (제한)
  {
    id: 8,
    name: '울산 대왕암 공원',
    type: 'restricted',
    coordinates: [
      { lat: 35.4960, lng: 129.4350 },
      { lat: 35.4990, lng: 129.4420 },
      { lat: 35.4950, lng: 129.4450 },
      { lat: 35.4920, lng: 129.4380 },
    ]
  },
]

// 구역 타입별 스타일 설정
export const zoneStyles = {
  prohibited: {
    fillColor: '#8B4D4D',      // 붉은 계열 (채도 낮음)
    fillOpacity: 0.35,
    strokeColor: '#6B3D3D',
    strokeWeight: 2,
    strokeOpacity: 0.6,
    // 선택됐을 때 스타일
    selectedFillOpacity: 0.55,
    selectedStrokeWeight: 3,
    selectedStrokeOpacity: 0.9,
  },
  restricted: {
    fillColor: '#9E8B4D',      // 노랑/주황 계열 (채도 낮음)
    fillOpacity: 0.35,
    strokeColor: '#7E6B3D',
    strokeWeight: 2,
    strokeOpacity: 0.6,
    // 선택됐을 때 스타일
    selectedFillOpacity: 0.55,
    selectedStrokeWeight: 3,
    selectedStrokeOpacity: 0.9,
  }
}
