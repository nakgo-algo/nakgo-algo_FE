import json
import urllib.request
import urllib.parse
import time

def fetch_river_polygons():
    """OSM에서 대전 하천 폴리곤 데이터 가져오기 (riverbank, natural=water+water=river)"""
    query = '''[out:json][timeout:120];
area["name"="대전광역시"]->.daejeon;
(
  // riverbank 폴리곤
  way["waterway"="riverbank"](area.daejeon);
  relation["waterway"="riverbank"](area.daejeon);

  // natural=water + water=river 폴리곤
  way["natural"="water"]["water"="river"](area.daejeon);
  relation["natural"="water"]["water"="river"](area.daejeon);

  // 하천 면적 (area)
  way["waterway"="river"]["area"="yes"](area.daejeon);
);
out geom;'''

    url = "https://overpass-api.de/api/interpreter"
    data = urllib.parse.urlencode({'data': query}).encode('utf-8')

    print("OSM에서 대전 하천 폴리곤 데이터 요청 중...")
    try:
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"응답 받음: {len(result.get('elements', []))}개 요소")
            return result
    except Exception as e:
        print(f"Error: {e}")
        return None


def extract_polygon_coords(osm_data, river_names):
    """OSM 데이터에서 하천별 폴리곤 좌표 추출"""
    polygons = {name: [] for name in river_names}

    if not osm_data or 'elements' not in osm_data:
        return polygons

    for el in osm_data['elements']:
        name = el.get('tags', {}).get('name', '')

        # 하천 이름 매칭
        matched_river = None
        for river_name in river_names:
            if river_name in name:
                matched_river = river_name
                break

        if not matched_river:
            # 이름이 없는 경우 위치로 판단 (나중에 처리)
            continue

        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
            if len(coords) >= 3:
                # 폴리곤이 닫혀있는지 확인
                if coords[0] != coords[-1]:
                    coords.append(coords[0])  # 닫기
                polygons[matched_river].append(coords)

        elif el['type'] == 'relation' and 'members' in el:
            # relation의 outer 멤버에서 좌표 추출
            for member in el['members']:
                if member.get('role') == 'outer' and 'geometry' in member:
                    coords = []
                    for pt in member['geometry']:
                        coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
                    if len(coords) >= 3:
                        if coords[0] != coords[-1]:
                            coords.append(coords[0])
                        polygons[matched_river].append(coords)

    return polygons


def merge_adjacent_polygons(polygons_list):
    """인접한 폴리곤들을 하나의 MultiPolygon으로 병합"""
    if not polygons_list:
        return []
    return polygons_list  # 일단 개별 폴리곤으로 유지


# 메인 실행
print("=== 대전 하천 폴리곤 데이터 수집 ===\n")

river_names = ["갑천", "유등천", "대전천"]

# OSM 폴리곤 데이터 가져오기
osm_data = fetch_river_polygons()

if osm_data:
    # 모든 요소 출력 (디버깅)
    print("\n=== OSM 데이터 분석 ===")
    elements = osm_data.get('elements', [])

    for el in elements:
        tags = el.get('tags', {})
        name = tags.get('name', '(무명)')
        waterway = tags.get('waterway', '')
        natural = tags.get('natural', '')
        water = tags.get('water', '')
        el_type = el.get('type', '')

        geom_count = 0
        if 'geometry' in el:
            geom_count = len(el['geometry'])
        elif 'members' in el:
            geom_count = sum(len(m.get('geometry', [])) for m in el['members'] if 'geometry' in m)

        print(f"  {el_type}: {name} (waterway={waterway}, natural={natural}, water={water}) - {geom_count}개 좌표")

    # 폴리곤 추출
    polygons = extract_polygon_coords(osm_data, river_names)

    print("\n=== 추출된 폴리곤 ===")
    for name, polys in polygons.items():
        print(f"  {name}: {len(polys)}개 폴리곤")

    # fishingZones.js용 데이터 생성
    results = []
    restriction = "금지행위: 훌치기 낚시 및 떡밥·어분을 사용한 낚시행위\n※ 지렁이 및 인조 미끼를 사용한 낚시에 한하여 1인당 1대 허용\n위반 시 과태료: 1회 50만원, 2회 100만원, 3회 150만원 이하"

    river_info = {
        "갑천": {"section": "금강 합류점 ~ 모세골교 (23.88km)"},
        "유등천": {"section": "갑천 합류점 ~ 만성교 (11.52km)"},
        "대전천": {"section": "유등천 합류점 ~ 옥계교 (7.86km)"},
    }

    id_counter = 99  # 기존 ID 유지

    for river_name in river_names:
        polys = polygons[river_name]

        if polys:
            # 여러 폴리곤이 있으면 MultiPolygon 형태로
            if len(polys) == 1:
                results.append({
                    "id": id_counter,
                    "name": river_name,
                    "type": "restricted",
                    "restriction": restriction,
                    "region": "대전광역시",
                    "section": river_info[river_name]["section"],
                    "geometry": "polygon",
                    "coordinates": polys[0]
                })
            else:
                # MultiPolygon
                results.append({
                    "id": id_counter,
                    "name": river_name,
                    "type": "restricted",
                    "restriction": restriction,
                    "region": "대전광역시",
                    "section": river_info[river_name]["section"],
                    "geometry": "multipolygon",
                    "coordinates": polys
                })
            id_counter += 1
        else:
            print(f"  경고: {river_name} 폴리곤 데이터 없음")

    # 결과 저장
    output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/daejeon_river_polygons.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"rivers": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

    print(f"\n=== 완료: {output_path}에 저장 ===")
else:
    print("OSM 데이터를 가져오지 못했습니다.")
