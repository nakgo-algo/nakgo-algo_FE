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

print(f"기존 전체 구역 수: {len(zones)}")

# 대전 하천 데이터 (id 99~106) 제거
zones_before = [z for z in zones if z['id'] < 99]
zones_after = [z for z in zones if z['id'] > 106]

print(f"대전 하천 제외 전 구역: {len(zones_before)}개")
print(f"대전 하천 제외 후 구역: {len(zones_after)}개")

# 새 폴리곤 데이터 로드
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_river_polygons.json', 'r', encoding='utf-8') as f:
    polygon_data = json.load(f)

new_rivers = polygon_data['rivers']
print(f"새 폴리곤 데이터: {len(new_rivers)}개 하천")

# 새 데이터 병합
new_zones = zones_before + new_rivers + zones_after

# id 재정렬 (옵션 - 기존 id 유지)
# 대전 하천은 id 99, 100, 101 유지

print(f"최종 구역 수: {len(new_zones)}")

# zoneStyles 추출
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1) if styles_match else ''

# 새 파일 작성
output = 'export const fishingZones = ' + json.dumps(new_zones, ensure_ascii=False, indent=2) + ';\n'

if styles_str:
    output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("\n=== fishingZones.js 업데이트 완료 ===")
print(f"- 기존 8개 세그먼트 제거 (id 99~106)")
print(f"- 새 3개 폴리곤 추가 (갑천, 유등천, 대전천)")
