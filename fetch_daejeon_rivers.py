import json
import urllib.request
import urllib.parse
import time

def fetch_river_line(name):
    """OSM에서 하천 선형 데이터 가져오기"""
    query = f'''[out:json][timeout:60];
area["name"="대전광역시"]->.daejeon;
(
  way["name"="{name}"]["waterway"="river"](area.daejeon);
  way["name"="{name}"]["waterway"="stream"](area.daejeon);
  way["name"="{name}"]["natural"="water"](area.daejeon);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")
        return None

def extract_line_coords(osm_data):
    """OSM 데이터에서 선형 좌표 추출 (way별로 분리)"""
    all_ways = []
    if not osm_data or 'elements' not in osm_data:
        return all_ways

    for el in osm_data['elements']:
        if 'geometry' in el:
            way_coords = []
            for pt in el['geometry']:
                way_coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
            if len(way_coords) > 2:
                all_ways.append(way_coords)

    return all_ways

# 대전 하천 목록
daejeon_rivers = [
    {"name": "갑천", "section": "금강 합류점 ~ 모세골교", "length": "23.88km"},
    {"name": "유등천", "section": "갑천 합류점 ~ 만성교", "length": "11.52km"},
    {"name": "대전천", "section": "유등천 합류점 ~ 옥계교", "length": "7.86km"},
]

results = []
id_counter = 1

print("=== 대전 하천 금지구역 좌표 수집 ===\n")

for river in daejeon_rivers:
    print(f"{river['name']} ({river['section']})...", end=" ", flush=True)

    osm_data = fetch_river_line(river['name'])
    ways = extract_line_coords(osm_data)

    if ways:
        # 각 way를 별도의 polyline으로 저장
        for i, way_coords in enumerate(ways):
            results.append({
                "id": id_counter,
                "name": river['name'],
                "type": "prohibited",
                "restriction": "낚시 금지",
                "region": "대전광역시",
                "section": river['section'],
                "geometry": "polyline",  # 폴리라인으로 표시
                "coordinates": way_coords
            })
            id_counter += 1
        print(f"✓ {len(ways)}개 구간, 총 {sum(len(w) for w in ways)}개 좌표")
    else:
        print("✗ 데이터 없음")

    time.sleep(1)

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_rivers.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"rivers": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 하천 구간 저장 ===")
