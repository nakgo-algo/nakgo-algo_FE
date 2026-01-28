import json
import urllib.request
import urllib.parse
import re

def fetch_polygon(name):
    """OSM에서 저수지 폴리곤 가져오기"""
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
        print(f"오류: {e}")
        return None


def extract_coords(osm_data):
    if not osm_data or 'elements' not in osm_data:
        return None

    for el in osm_data['elements']:
        if el['type'] == 'way' and 'geometry' in el:
            coords = []
            for pt in el['geometry']:
                coords.append({"lat": round(pt['lat'], 6), "lng": round(pt['lon'], 6)})
            if len(coords) >= 3:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                return coords
    return None


print("원천저수지 데이터 가져오기...")
osm_data = fetch_polygon("원천")
coords = extract_coords(osm_data)

if coords:
    print(f"발견: {len(coords)}개 좌표")

    # fishingZones.js 읽기
    with open('/Users/heoyoungjae/Desktop/Study_React/fishing-app/nakgo-algo/src/data/fishingZones.js', 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.search(r'export const fishingZones = (\[[\s\S]*?\]);', content)
    zones = json.loads(match.group(1))

    max_id = max(z['id'] for z in zones)

    # 원천저수지 추가
    zones.append({
        "id": max_id + 1,
        "name": "원천저수지",
        "type": "prohibited",
        "restriction": "농업용 저수지로 낚시 금지",
        "region": "경기도 수원시",
        "geometry": "polygon",
        "coordinates": coords
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
else:
    print("원천저수지 데이터 없음")
