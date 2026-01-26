import json
import urllib.request
import urllib.parse
import time

def fetch_water_geom(name, region=None):
    """OSM에서 수역 폴리곤 데이터 가져오기"""
    # 이름에서 '저수지', '호수' 등 제거한 버전도 시도
    search_names = [name]
    if "저수지" in name:
        search_names.append(name.replace("저수지", ""))
        search_names.append(name.replace("저수지", "호"))
    if "호수" in name:
        search_names.append(name.replace("호수", "저수지"))
        search_names.append(name.replace("호수", ""))

    for search_name in search_names:
        query = f'''[out:json][timeout:30];
area["name"="대한민국"]->.korea;
(
  way["name"="{search_name}"]["water"="reservoir"](area.korea);
  way["name"="{search_name}"]["natural"="water"](area.korea);
  way["name"="{search_name}"]["landuse"="reservoir"](area.korea);
  relation["name"="{search_name}"]["water"="reservoir"](area.korea);
  relation["name"="{search_name}"]["natural"="water"](area.korea);
);
out geom;'''

        url = "https://overpass-api.de/api/interpreter"
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')

        try:
            req = urllib.request.Request(url, data=data)
            with urllib.request.urlopen(req, timeout=35) as response:
                result = json.loads(response.read().decode('utf-8'))
                if result and 'elements' in result and len(result['elements']) > 0:
                    return result
        except Exception as e:
            continue

    return None

def extract_coords(osm_data):
    """OSM 데이터에서 좌표 추출"""
    coords = []
    if not osm_data or 'elements' not in osm_data:
        return coords

    for el in osm_data['elements']:
        if 'geometry' in el:
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})

    return coords

# 경기도 낚시금지/제한구역 목록 (CSV에서 추출)
gyeonggi_waters = [
    {"name": "원천저수지", "city": "수원시", "type": "prohibited", "reason": "농업용"},
    {"name": "서호저수지", "city": "수원시", "type": "prohibited", "reason": "농업용"},
    {"name": "신대저수지", "city": "수원시", "type": "prohibited", "reason": "농업용"},
    {"name": "고모저수지", "city": "포천시", "type": "prohibited", "reason": "농업용"},
    {"name": "서랑저수지", "city": "오산시", "type": "prohibited", "reason": "농업용"},
    {"name": "기산저수지", "city": "포천시", "type": "prohibited", "reason": "농업용"},
    {"name": "산정저수지", "city": "포천시", "type": "prohibited", "reason": "농업용"},
    {"name": "물왕호수", "city": "시흥시", "type": "prohibited", "reason": "농업용"},
    {"name": "사음저수지", "city": "이천시", "type": "prohibited", "reason": "수질보전"},
    {"name": "발랑저수지", "city": "파주시", "type": "restricted", "reason": "농업용"},
    {"name": "마지저수지", "city": "파주시", "type": "restricted", "reason": "농업용"},
    {"name": "반월저수지", "city": "군포시", "type": "prohibited", "reason": "농업용"},
    {"name": "갈치저수지", "city": "군포시", "type": "prohibited", "reason": "농업용"},
    {"name": "대왕저수지", "city": "성남시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "운중저수지", "city": "성남시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "서현저수지", "city": "성남시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "낙생저수지", "city": "성남시", "type": "prohibited", "reason": "농업용"},
    {"name": "기흥저수지", "city": "용인시", "type": "prohibited", "reason": "농업용"},
    {"name": "공릉저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "애룡저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "마장저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "금파저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "초리저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "봉암저수지", "city": "파주시", "type": "prohibited", "reason": "농업용"},
    {"name": "남양호", "city": "평택시/화성시", "type": "prohibited", "reason": "농업용"},
    {"name": "보통리저수지", "city": "화성시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "대벽저류지", "city": "김포시", "type": "prohibited", "reason": "농업용"},
    {"name": "백운호수", "city": "의왕시", "type": "prohibited", "reason": "농업용"},
    {"name": "오전저수지", "city": "의왕시", "type": "prohibited", "reason": "농업용"},
    {"name": "왕송호수", "city": "의왕시", "type": "prohibited", "reason": "농업용"},
    {"name": "일왕저수지", "city": "수원시", "type": "prohibited", "reason": "농업용"},
    {"name": "일월저수지", "city": "수원시", "type": "prohibited", "reason": "농업용"},
]

# 남한강은 하천이라 별도 처리 필요 (폴리곤 안됨)
# 삼화리농수로, 문호리농수로도 작은 수로라 OSM에 없을 가능성 높음

results = []
id_counter = 1

print(f"=== 경기도 낚시금지구역 {len(gyeonggi_waters)}개 좌표 수집 ===\n")

for i, water in enumerate(gyeonggi_waters):
    print(f"[{i+1}/{len(gyeonggi_waters)}] {water['name']} ({water['city']})...", end=" ", flush=True)

    osm_data = fetch_water_geom(water['name'])
    coords = extract_coords(osm_data)

    if coords and len(coords) > 5:
        results.append({
            "id": id_counter,
            "name": water['name'],
            "type": water['type'],
            "restriction": "낚시 금지" if water['type'] == 'prohibited' else "낚시 제한",
            "region": f"경기도 {water['city']}",
            "reason": water['reason'],
            "coordinates": coords
        })
        print(f"✓ {len(coords)}개 좌표")
        id_counter += 1
    else:
        print("✗ 데이터 없음")

    time.sleep(0.5)

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results), "region": "경기도"}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 수역 저장 ===")
print(f"저장 위치: {output_path}")
