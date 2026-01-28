import json
import re
import math

def calculate_distance(coord1, coord2):
    """두 좌표 사이의 거리 계산 (도 단위)"""
    return math.sqrt((coord1['lat'] - coord2['lat'])**2 + (coord1['lng'] - coord2['lng'])**2)

def check_zone_continuity(coords, max_gap=0.05):
    """좌표가 연속적인지 확인 (max_gap보다 큰 간격이 있으면 False)"""
    for i in range(len(coords) - 1):
        dist = calculate_distance(coords[i], coords[i+1])
        if dist > max_gap:
            return False, dist, i
    return True, 0, -1

# 기존 fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript 배열 부분 추출
match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
if match:
    json_str = match.group(1)
    zones = json.loads(json_str)
else:
    print("데이터를 파싱할 수 없습니다.")
    exit()

print(f"총 구역 수: {len(zones)}")
print("\n=== 문제 있는 구역 검색 ===\n")

problematic_zones = []
clean_zones = []

for zone in zones:
    coords = zone.get('coordinates', [])
    if len(coords) < 3:
        print(f"❌ {zone['name']}: 좌표 부족 ({len(coords)}개)")
        problematic_zones.append(zone['name'])
        continue

    is_continuous, max_dist, idx = check_zone_continuity(coords)

    if not is_continuous:
        print(f"❌ {zone['name']}: 좌표 불연속 (gap={max_dist:.4f}도, index={idx})")
        problematic_zones.append(zone['name'])
    else:
        clean_zones.append(zone)

print(f"\n=== 결과 ===")
print(f"문제 있는 구역: {len(problematic_zones)}개")
print(f"정상 구역: {len(clean_zones)}개")

if problematic_zones:
    print(f"\n제거할 구역: {problematic_zones}")

# ID 재정렬
for i, zone in enumerate(clean_zones):
    zone['id'] = i + 1

# 새 파일 작성
output = f'''// 낚시 금지/제한 구역 통합 데이터
// 업데이트: 2026-01-26
// 총 {len(clean_zones)}개 구역

export const fishingZones = {json.dumps(clean_zones, ensure_ascii=False, indent=2)};

export const zoneStyles = {{
  prohibited: {{
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    strokeColor: '#CC0000',
    strokeWeight: 2,
    strokeOpacity: 0.8
  }},
  restricted: {{
    fillColor: '#FFA500',
    fillOpacity: 0.35,
    strokeColor: '#CC8400',
    strokeWeight: 2,
    strokeOpacity: 0.8
  }}
}};
'''

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\nfishingZones.js 수정 완료! (총 {len(clean_zones)}개 구역)")
