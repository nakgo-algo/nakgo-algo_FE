import json
import urllib.request
import urllib.parse
import time

def fetch_polygon(name):
    """OSM에서 저수지 폴리곤 가져오기 (단일 쿼리)"""
    query = f'''[out:json][timeout:30];
area["name"="경기도"]->.g;
(
  way["natural"="water"]["name"~"{name}"](area.g);
  relation["natural"="water"]["name"~"{name}"](area.g);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except Exception as e:
        return None


def extract_coords(osm_data, name):
    """폴리곤 좌표 추출"""
    if not osm_data or 'elements' not in osm_data:
        return None

    for el in osm_data['elements']:
        el_name = el.get('tags', {}).get('name', '')
        search = name.split('(')[0].strip()

        if search not in el_name:
            continue

        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
            if len(coords) >= 3:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                return coords

        elif el['type'] == 'relation' and 'members' in el:
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = []
                    for pt in member['geometry']:
                        coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
                    if len(coords) >= 3:
                        if coords[0] != coords[-1]:
                            coords.append(coords[0])
                        return coords
    return None


# 경기도 주요 저수지 목록 (CSV에서 추출)
reservoirs = [
    {"name": "원천저수지", "city": "수원시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "서호저수지", "city": "수원시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "신대저수지", "city": "수원시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "물왕호수", "city": "시흥시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "백운호수", "city": "의왕시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "왕송호수", "city": "의왕시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "기흥저수지", "city": "용인시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "반월저수지", "city": "군포시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "사음저수지", "city": "이천시", "type": "prohibited", "reason": "수질보전 및 수생태계 보전"},
    {"name": "남양호", "city": "화성시/평택시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
    {"name": "대왕저수지", "city": "성남시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "운중저수지", "city": "성남시", "type": "prohibited", "reason": "하천유지관리"},
    {"name": "낙생저수지", "city": "성남시", "type": "prohibited", "reason": "농업용 저수지로 낚시 금지"},
]

print("=== 경기도 주요 저수지 폴리곤 수집 ===\n")

results = []
id_counter = 300

for r in reservoirs:
    name = r['name']
    print(f"검색: {name}...", end=" ", flush=True)

    osm_data = fetch_polygon(name)

    if osm_data and osm_data.get('elements'):
        coords = extract_coords(osm_data, name)
        if coords:
            print(f"발견 ({len(coords)}좌표)")
            results.append({
                "id": id_counter,
                "name": name,
                "type": r['type'],
                "restriction": r['reason'],
                "region": f"경기도 {r['city']}",
                "geometry": "polygon",
                "coordinates": coords
            })
            id_counter += 1
        else:
            print("좌표 추출 실패")
    else:
        print("데이터 없음")

    time.sleep(2)

# 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 저수지 저장 ===")
