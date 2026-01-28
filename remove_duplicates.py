import json
import re

# fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
zones = json.loads(match.group(1))

print(f"정리 전: {len(zones)}개 구역")

# 이름 기반 중복 제거 (더 많은 좌표를 가진 것 유지)
seen = {}
for zone in zones:
    name = zone['name']
    coords_count = len(zone.get('coordinates', []))

    if name not in seen:
        seen[name] = zone
    else:
        # 더 많은 좌표를 가진 것 유지
        existing_count = len(seen[name].get('coordinates', []))
        if coords_count > existing_count:
            print(f"중복 교체: {name} ({existing_count} → {coords_count} 좌표)")
            seen[name] = zone
        else:
            print(f"중복 제거: {name} ({coords_count} 좌표, 기존 {existing_count} 유지)")

unique_zones = list(seen.values())

# ID 재할당
for i, zone in enumerate(unique_zones):
    zone['id'] = i + 1

print(f"정리 후: {len(unique_zones)}개 구역")

# zoneStyles 추출
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1) if styles_match else ''

# 새 파일 작성
output = 'export const fishingZones = ' + json.dumps(unique_zones, ensure_ascii=False, indent=2) + ';\n'
if styles_str:
    output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("\n=== 중복 제거 완료 ===")
