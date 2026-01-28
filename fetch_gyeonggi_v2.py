import json
import urllib.request
import urllib.parse
import time

def fetch_polygon(search_terms):
    """OSM에서 수역 폴리곤 가져오기"""
    regex = "|".join(search_terms)
    query = f'''[out:json][timeout:60];
area["name"="경기도"]->.g;
(
  way["natural"="water"]["name"~"{regex}"](area.g);
  relation["natural"="water"]["name"~"{regex}"](area.g);
  way["water"]["name"~"{regex}"](area.g);
  relation["water"]["name"~"{regex}"](area.g);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except Exception as e:
        print(f"  오류: {e}")
        return None


def extract_all_coords(osm_data):
    """모든 폴리곤 좌표 추출"""
    results = {}

    if not osm_data or 'elements' not in osm_data:
        return results

    for el in osm_data['elements']:
        el_name = el.get('tags', {}).get('name', '')
        if not el_name:
            continue

        coords = None
        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})

        elif el['type'] == 'relation' and 'members' in el:
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = []
                    for pt in member['geometry']:
                        coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
                    break

        if coords and len(coords) >= 3:
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            results[el_name] = coords

    return results


# 검색어 목록
search_terms = [
    "원천호수", "광교호수", "서호", "축만제", "신대",
    "물왕", "백운", "왕송", "기흥", "반월",
    "사음", "남양호", "대왕", "운중", "낙생",
    "고모", "서랑", "기산", "산정", "발랑", "마지",
    "갈치", "서현", "공릉", "애룡", "마장", "금파",
    "초리", "봉암", "오전", "일왕", "만석거", "일월"
]

print("=== 경기도 저수지/호수 일괄 검색 ===\n")

osm_data = fetch_polygon(search_terms)

if osm_data:
    all_results = extract_all_coords(osm_data)
    print(f"발견된 수역: {len(all_results)}개\n")

    for name in all_results:
        print(f"  - {name} ({len(all_results[name])}좌표)")
else:
    print("검색 실패")
    all_results = {}

# 기존 데이터 로드
existing_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json'
try:
    with open(existing_path, 'r', encoding='utf-8') as f:
        existing = json.load(f)
        zones = existing.get('zones', [])
except:
    zones = []

# 새 데이터 매핑
zone_mapping = {
    "원천호수": {"city": "수원시", "reason": "농업용 저수지로 낚시 금지"},
    "광교호수": {"city": "수원시", "reason": "농업용 저수지로 낚시 금지"},
    "서호": {"city": "수원시", "reason": "농업용 저수지로 낚시 금지"},
    "축만제": {"city": "수원시", "reason": "농업용 저수지로 낚시 금지"},
    "백운호수": {"city": "의왕시", "reason": "농업용 저수지로 낚시 금지"},
    "왕송호수": {"city": "의왕시", "reason": "농업용 저수지로 낚시 금지"},
    "기흥호수": {"city": "용인시", "reason": "농업용 저수지로 낚시 금지"},
    "반월호수": {"city": "군포시", "reason": "농업용 저수지로 낚시 금지"},
}

# 기존 이름 목록
existing_names = {z['name'] for z in zones}
id_counter = 310 if zones else 300

for name, coords in all_results.items():
    if name in existing_names:
        continue

    # 매핑에서 찾기
    matched = None
    for key, info in zone_mapping.items():
        if key in name:
            matched = info
            break

    if not matched:
        # 기본값
        matched = {"city": "경기도", "reason": "낚시 금지"}

    zones.append({
        "id": id_counter,
        "name": name,
        "type": "prohibited",
        "restriction": matched["reason"],
        "region": f"경기도 {matched['city']}",
        "geometry": "polygon",
        "coordinates": coords
    })
    id_counter += 1

# 저장
with open(existing_path, 'w', encoding='utf-8') as f:
    json.dump({"zones": zones, "total": len(zones)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 총 {len(zones)}개 구역 저장 완료 ===")
