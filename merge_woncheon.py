import json
import re

# gyeonggi_zones.json에서 원천저수지 찾기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json', 'r', encoding='utf-8') as f:
    gyeonggi = json.load(f)

woncheon = None
for zone in gyeonggi['zones']:
    if '원천' in zone['name']:
        woncheon = zone
        break

if not woncheon:
    print("원천저수지 데이터 없음")
    exit()

print(f"원천저수지 발견: {len(woncheon['coordinates'])}개 좌표")

# fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
zones = json.loads(match.group(1))

# 이미 있는지 확인
existing = [z for z in zones if '원천' in z['name']]
if existing:
    print("원천저수지가 이미 존재합니다")
    exit()

max_id = max(z['id'] for z in zones)

# 원천저수지 추가
zones.append({
    "id": max_id + 1,
    "name": "원천저수지",
    "type": "prohibited",
    "restriction": "농업용 저수지로 낚시 금지",
    "region": "경기도 수원시",
    "geometry": "polygon",
    "coordinates": woncheon['coordinates']
})

# zoneStyles 추출
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1) if styles_match else ''

# 새 파일 작성
output = 'export const fishingZones = ' + json.dumps(zones, ensure_ascii=False, indent=2) + ';\n'
if styles_str:
    output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"원천저수지 추가 완료! 총 {len(zones)}개 구역")
