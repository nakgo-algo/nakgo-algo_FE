import json
import re

# fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

# fishingZones 배열 추출
match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
if not match:
    print("fishingZones 배열을 찾을 수 없습니다.")
    exit(1)

zones_str = match.group(1)
zones = json.loads(zones_str)

print(f"기존 구역 수: {len(zones)}")

# 경기도 저수지 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json', 'r', encoding='utf-8') as f:
    gyeonggi_data = json.load(f)

new_zones = gyeonggi_data['zones']
print(f"추가할 경기도 구역: {len(new_zones)}개")

# 기존 최대 ID 찾기
max_id = max(z['id'] for z in zones)
print(f"기존 최대 ID: {max_id}")

# ID 재할당
for i, zone in enumerate(new_zones):
    zone['id'] = max_id + 1 + i

# 병합
zones.extend(new_zones)

print(f"최종 구역 수: {len(zones)}")

# zoneStyles 추출
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1) if styles_match else ''

# 새 파일 작성
output = 'export const fishingZones = ' + json.dumps(zones, ensure_ascii=False, indent=2) + ';\n'

if styles_str:
    output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("\n=== fishingZones.js 업데이트 완료 ===")
print("추가된 경기도 저수지/호수:")
for z in new_zones:
    print(f"  - {z['name']} ({z['region']})")
