import json
import re

# 기존 fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript 배열 부분 추출
match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
if match:
    json_str = match.group(1)
    existing_zones = json.loads(json_str)
else:
    print("기존 데이터를 파싱할 수 없습니다.")
    exit()

print(f"기존 구역 수: {len(existing_zones)}")

# 기존 대전 하천(polyline) 제거
daejeon_rivers = ['갑천', '유등천', '대전천']
filtered_zones = [z for z in existing_zones if z['name'] not in daejeon_rivers]
removed = len(existing_zones) - len(filtered_zones)
print(f"제거된 기존 하천 구역: {removed}개")

# 새 폴리곤 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_rivers_polygon.json', 'r', encoding='utf-8') as f:
    river_data = json.load(f)

# ID 재정렬
for i, zone in enumerate(filtered_zones):
    zone['id'] = i + 1

new_id = len(filtered_zones) + 1

# 새 하천 폴리곤 추가
for river in river_data['rivers']:
    new_zone = {
        "id": new_id,
        "name": river['name'],
        "type": river['type'],
        "restriction": river['restriction'],
        "region": river['region'],
        "section": river.get('section', ''),
        "coordinates": river['coordinates']
    }
    filtered_zones.append(new_zone)
    new_id += 1
    print(f"  추가: {river['name']} (제한구역, {len(river['coordinates'])}개 좌표)")

print(f"\n총 구역 수: {len(filtered_zones)}")

# 새 파일 작성
output = f'''// 낚시 금지/제한 구역 통합 데이터
// 업데이트: 2026-01-27
// 총 {len(filtered_zones)}개 구역

export const fishingZones = {json.dumps(filtered_zones, ensure_ascii=False, indent=2)};

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

print(f"\nfishingZones.js 업데이트 완료!")
