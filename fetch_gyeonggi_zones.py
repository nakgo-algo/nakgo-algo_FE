import json
import urllib.request
import urllib.parse
import time
import csv

# 경기도 CSV 파일 읽기
csv_path = '/Users/heoyoungjae/Downloads/경기도낚시금지및제한구역지정현황 (2).csv'

zones_data = []
with open(csv_path, 'r', encoding='cp949') as f:
    reader = csv.reader(f)
    header = next(reader)  # 헤더 건너뛰기
    for row in reader:
        if len(row) >= 8 and row[2]:  # 명칭이 있는 경우만
            zones_data.append({
                'type': 'prohibited' if row[0] == '금지구역' else 'restricted',
                'city': row[1],
                'name': row[2],
                'designated_date': row[3],
                'reason': row[7] if row[7] else '낚시금지'
            })

print(f"CSV에서 {len(zones_data)}개 구역 로드")

def fetch_reservoir_polygon(name, city):
    """OSM에서 저수지/하천 폴리곤 가져오기"""
    # 검색어 정리 (괄호 내용 제거)
    search_name = name.split('(')[0].strip()

    query = f'''[out:json][timeout:60];
area["name"="경기도"]->.gyeonggi;
(
  // 저수지 검색
  way["natural"="water"]["name"~"{search_name}"](area.gyeonggi);
  relation["natural"="water"]["name"~"{search_name}"](area.gyeonggi);

  // 호수 검색
  way["water"="reservoir"]["name"~"{search_name}"](area.gyeonggi);
  way["water"="lake"]["name"~"{search_name}"](area.gyeonggi);

  // 하천 검색
  way["waterway"="riverbank"]["name"~"{search_name}"](area.gyeonggi);
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
        print(f"  → 오류: {e}")
        return None


def extract_polygon(osm_data, name):
    """OSM 데이터에서 폴리곤 추출"""
    if not osm_data or 'elements' not in osm_data:
        return None

    search_name = name.split('(')[0].strip()

    for el in osm_data['elements']:
        el_name = el.get('tags', {}).get('name', '')

        # 이름 매칭
        if search_name not in el_name and el_name not in search_name:
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


print("\n=== 경기도 낚시금지구역 폴리곤 데이터 수집 ===\n")

results = []
id_counter = 300  # 기존 데이터와 충돌 방지

for i, zone in enumerate(zones_data):
    name = zone['name']
    city = zone['city']

    print(f"[{i+1}/{len(zones_data)}] {city} {name}")

    osm_data = fetch_reservoir_polygon(name, city)

    if osm_data and osm_data.get('elements'):
        coords = extract_polygon(osm_data, name)

        if coords:
            print(f"  → 폴리곤 발견 ({len(coords)}개 좌표)")

            # 제한 사유에 따른 설명
            reason_text = zone['reason']
            if reason_text == '농업용':
                restriction = '농업용 저수지로 낚시 금지'
            elif '수질' in reason_text:
                restriction = '수질보전을 위해 낚시 금지'
            elif '상수원' in reason_text:
                restriction = '상수원보호구역으로 낚시 금지'
            else:
                restriction = reason_text if reason_text else '낚시 금지'

            results.append({
                "id": id_counter,
                "name": name,
                "type": zone['type'],
                "restriction": restriction,
                "region": f"경기도 {city}",
                "geometry": "polygon",
                "coordinates": coords
            })
            id_counter += 1
        else:
            print(f"  → 폴리곤 추출 실패")
    else:
        print(f"  → OSM 데이터 없음")

    time.sleep(1.5)  # API 제한 방지

# 결과 저장
output_path = '/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/gyeonggi_zones.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({"zones": results, "total": len(results)}, f, ensure_ascii=False, indent=2)

print(f"\n=== 완료: {len(results)}개 구역 저장 ===")
print(f"저장 위치: {output_path}")
