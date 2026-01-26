import json
import re

# 기존 fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

# JavaScript 배열 부분 추출
match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
if match:
    # JSON으로 파싱 가능하게 정리
    json_str = match.group(1)
    existing_zones = json.loads(json_str)
else:
    print("기존 데이터를 파싱할 수 없습니다.")
    exit()

print(f"기존 구역 수: {len(existing_zones)}")

# 기존 이름 목록
existing_names = set(zone['name'] for zone in existing_zones)

# 경기도 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json', 'r', encoding='utf-8') as f:
    gyeonggi_data = json.load(f)

# 새로운 ID 시작점
new_id = max(zone['id'] for zone in existing_zones) + 1
added = 0

for zone in gyeonggi_data['zones']:
    if zone['name'] not in existing_names:
        new_zone = {
            "id": new_id,
            "name": zone['name'],
            "type": zone['type'],
            "restriction": zone['restriction'],
            "region": zone['region'],
            "coordinates": zone['coordinates']
        }
        existing_zones.append(new_zone)
        existing_names.add(zone['name'])
        new_id += 1
        added += 1
        print(f"  추가: {zone['name']} ({zone['region']})")
    else:
        print(f"  중복: {zone['name']} (스킵)")

print(f"\n새로 추가된 구역: {added}개")
print(f"총 구역 수: {len(existing_zones)}")

# 새 파일 작성
output = f'''// 낚시 금지/제한 구역 통합 데이터
// 업데이트: 2026-01-26
// 총 {len(existing_zones)}개 구역

export const fishingZones = {json.dumps(existing_zones, ensure_ascii=False, indent=2)};

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
