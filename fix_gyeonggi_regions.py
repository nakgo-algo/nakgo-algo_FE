import json
import re

# fishingZones.js 읽기
with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
    content = f.read()

# fishingZones 배열 추출
match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
zones = json.loads(match.group(1))

# CSV 기반 지역 매핑
region_mapping = {
    "원천저수지": "수원시",
    "서호저수지": "수원시",
    "축만제": "수원시",
    "신대저수지": "수원시",
    "만석거": "수원시",
    "일왕저수지": "수원시",
    "일월저수지": "수원시",
    "고모저수지": "포천시",
    "고모지": "포천시",
    "서랑저수지": "오산시",
    "기산저수지": "포천시",
    "산정저수지": "포천시",
    "산정호수": "포천시",
    "산정제": "포천시",
    "물왕호수": "시흥시",
    "사음저수지": "이천시",
    "발랑저수지": "파주시",
    "마지저수지": "파주시",
    "반월저수지": "군포시",
    "반월호수": "군포시",
    "갈치저수지": "군포시",
    "대왕저수지": "성남시",
    "운중저수지": "성남시",
    "서현저수지": "성남시",
    "낙생저수지": "성남시/용인시",
    "기흥저수지": "용인시",
    "공릉저수지": "파주시",
    "공릉천": "파주시",
    "애룡저수지": "파주시",
    "마장저수지": "파주시",
    "마장호": "파주시",
    "금파저수지": "파주시",
    "초리저수지": "파주시",
    "봉암저수지": "파주시",
    "남양호": "화성시/평택시",
    "보통리저수지": "화성시",
    "대벽저류지": "김포시",
    "백운호수": "의왕시",
    "오전저수지": "의왕시",
    "오전천": "의왕시",
    "왕송호수": "의왕시",
    "왕송호": "의왕시",
}

# type 매핑 (제한구역)
restricted_zones = ["발랑저수지", "마지저수지"]

# 업데이트
updated = 0
for zone in zones:
    name = zone['name']
    if name in region_mapping:
        old_region = zone.get('region', '')
        new_region = f"경기도 {region_mapping[name]}"
        if old_region != new_region:
            zone['region'] = new_region
            updated += 1
            print(f"수정: {name} - {old_region} → {new_region}")

    if name in restricted_zones:
        zone['type'] = 'restricted'
        zone['restriction'] = '제한구역 - 일부 낚시만 허용'

print(f"\n총 {updated}개 지역 정보 수정")

# zoneStyles 추출
styles_match = re.search(r'export const zoneStyles = (\{[\s\S]*?\});', content)
styles_str = styles_match.group(1) if styles_match else ''

# 새 파일 작성
output = 'export const fishingZones = ' + json.dumps(zones, ensure_ascii=False, indent=2) + ';\n'

if styles_str:
    output += '\nexport const zoneStyles = ' + styles_str + ';\n'

with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'w', encoding='utf-8') as f:
    f.write(output)

print("\n=== fishingZones.js 지역 정보 수정 완료 ===")
