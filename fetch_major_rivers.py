import json
import urllib.request
import urllib.parse
import time

def fetch_river_polygon(river_name):
    """OSM에서 주요 하천 폴리곤 데이터 가져오기"""
    query = f'''[out:json][timeout:180];
// 한국 전체 영역
area["name"="대한민국"]->.korea;
(
  // 하천 면적 (natural=water + water=river)
  way["natural"="water"]["water"="river"]["name"~"{river_name}"](area.korea);
  relation["natural"="water"]["water"="river"]["name"~"{river_name}"](area.korea);

  // riverbank
  way["waterway"="riverbank"]["name"~"{river_name}"](area.korea);
  relation["waterway"="riverbank"]["name"~"{river_name}"](area.korea);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    print(f"  {river_name} 데이터 요청 중...")
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=180) as response:
            result = json.loads(response.read().decode('utf-8'))
            elements = result.get('elements', [])
            print(f"  → {len(elements)}개 요소 받음")
            return result
    except Exception as e:
        print(f"  → 오류: {e}")
        return None


def extract_polygons(osm_data, river_name):
    """OSM 데이터에서 폴리곤 좌표 추출"""
    polygons = []

    if not osm_data or 'elements' not in osm_data:
        return polygons

    for el in osm_data['elements']:
        name = el.get('tags', {}).get('name', '')

        # 정확한 이름 매칭 (부분 매칭 허용)
        if river_name not in name:
            continue

        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
            if len(coords) >= 3:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                polygons.append(coords)

        elif el['type'] == 'relation' and 'members' in el:
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = []
                    for pt in member['geometry']:
                        coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
                    if len(coords) >= 3:
                        if coords[0] != coords[-1]:
                            coords.append(coords[0])
                        polygons.append(coords)

    return polygons


# 4대강 + 주요 지류 정의
major_rivers = [
    {
        "name": "한강",
        "search": "한강",
        "region": "서울/경기/강원",
        "restriction": "지역별 낚시 규정 상이\n※ 상수원보호구역 내 낚시 금지\n※ 서울시 한강공원 일부 구간 낚시 가능",
        "type": "restricted"
    },
    {
        "name": "낙동강",
        "search": "낙동강",
        "region": "경북/경남/부산",
        "restriction": "지역별 낚시 규정 상이\n※ 취수장 주변 낚시 금지\n※ 일부 구간 유료 낚시터 운영",
        "type": "restricted"
    },
    {
        "name": "금강",
        "search": "금강",
        "region": "충북/충남/대전/전북",
        "restriction": "지역별 낚시 규정 상이\n※ 금강 본류 일부 구간 낚시 제한\n※ 취수장 주변 낚시 금지",
        "type": "restricted"
    },
    {
        "name": "영산강",
        "search": "영산강",
        "region": "전남/광주",
        "restriction": "지역별 낚시 규정 상이\n※ 취수장 주변 낚시 금지",
        "type": "restricted"
    },
    {
        "name": "섬진강",
        "search": "섬진강",
        "region": "전북/전남/경남",
        "restriction": "지역별 낚시 규정 상이\n※ 은어, 연어 등 특정 어종 보호구역 있음",
        "type": "restricted"
    }
]

print("=== 전국 주요 하천 폴리곤 데이터 수집 ===\n")

all_results = []
id_counter = 200  # 기존 데이터와 충돌 방지

for river in major_rivers:
    print(f"\n[{river['name']}]")

    osm_data = fetch_river_polygon(river['search'])

    if osm_data:
        polygons = extract_polygons(osm_data, river['search'])

        if polygons:
            print(f"  → {len(polygons)}개 폴리곤 추출")

            # 너무 작은 폴리곤 필터링 (10개 미만 좌표)
            valid_polygons = [p for p in polygons if len(p) >= 10]
            print(f"  → {len(valid_polygons)}개 유효 폴리곤")

            if valid_polygons:
                if len(valid_polygons) == 1:
                    all_results.append({
                        "id": id_counter,
                        "name": river['name'],
                        "type": river['type'],
                        "restriction": river['restriction'],
                        "region": river['region'],
                        "geometry": "polygon",
                        "coordinates": valid_polygons[0]
                    })
                else:
                    all_results.append({
                        "id": id_counter,
                        "name": river['name'],
                        "type": river['type'],
                        "restriction": river['restriction'],
                        "region": river['region'],
                        "geometry": "multipolygon",
                        "coordinates": valid_polygons
                    })
                id_counter += 1
        else:
            print("  → 폴리곤 없음")

    time.sleep(2)  # API 제한 방지

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/major_rivers.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"rivers": all_results, "total": len(all_results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(all_results)}개 하천 저장 ===")
print(f"저장 위치: {output_path}")
