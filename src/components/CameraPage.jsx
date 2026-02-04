import { useState, useRef } from 'react'

// Gemini API 키 (환경변수에서 가져오기)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// 한국 주요 낚시 대상어종 + 규제 정보 (수산자원관리법 기준)
const koreanFishRegulations = {
  '광어': { minLength: 35, closedSeason: null, warning: null, description: '대표적인 고급 횟감' },
  '넙치': { minLength: 35, closedSeason: null, warning: null, description: '광어의 정식 명칭' },
  '우럭': { minLength: 23, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '볼락류 중 가장 대형' },
  '조피볼락': { minLength: 23, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '우럭의 정식 명칭' },
  '농어': { minLength: 30, closedSeason: null, warning: null, description: '회유성 어종' },
  '감성돔': { minLength: 25, closedSeason: '5월 1일 ~ 6월 30일', warning: null, description: '낚시인 인기 대상어' },
  '참돔': { minLength: 24, closedSeason: null, warning: null, description: '고급 어종, 타이라바 인기' },
  '대구': { minLength: 35, closedSeason: '1월 16일 ~ 2월 15일', warning: null, description: '겨울철 대표 어종' },
  '방어': { minLength: 40, closedSeason: null, warning: null, description: '겨울철 최고급 횟감' },
  '부시리': { minLength: 40, closedSeason: null, warning: null, description: '여름에 맛있음' },
  '고등어': { minLength: 21, closedSeason: null, warning: null, description: '등푸른 생선 대표' },
  '삼치': { minLength: 35, closedSeason: null, warning: null, description: '가을철 대표 낚시어' },
  '전갱이': { minLength: 15, closedSeason: null, warning: null, description: '방파제 낚시 인기' },
  '볼락': { minLength: 15, closedSeason: '4월 1일 ~ 5월 31일', warning: null, description: '야간 낚시 인기' },
  '숭어': { minLength: 25, closedSeason: null, warning: null, description: '겨울 회가 맛있음' },
  '민어': { minLength: 30, closedSeason: '7월 1일 ~ 7월 31일', warning: null, description: '여름 보양식' },
  '조기': { minLength: 15, closedSeason: null, warning: null, description: '명절 제사상 생선' },
  '노래미': { minLength: 15, closedSeason: null, warning: null, description: '연안 루어낚시 대상' },
  '갈치': { minLength: null, closedSeason: null, warning: '날카로운 이빨 주의', description: '은빛 긴 몸체' },
  '복어': { minLength: null, closedSeason: null, warning: '맹독 주의! 전문 조리사만 조리 가능', description: '독성 어종' },
  '쏨뱅이': { minLength: null, closedSeason: null, warning: '등지느러미 독침 주의!', description: '암초 서식' },
  '쏠배감펭': { minLength: null, closedSeason: null, warning: '독침 주의! 찔리면 심한 통증', description: '화려한 지느러미' },
  '가오리': { minLength: null, closedSeason: null, warning: '꼬리 독침 주의!', description: '납작한 몸체' },
  '홍어': { minLength: null, closedSeason: null, warning: null, description: '삭힌 홍어로 유명' },
  '아귀': { minLength: null, closedSeason: null, warning: null, description: '아귀찜으로 유명' },
  '배스': { minLength: null, closedSeason: null, warning: '생태계교란종! 방류 금지', description: '민물 포식자' },
  '블루길': { minLength: null, closedSeason: null, warning: '생태계교란종! 방류 금지', description: '민물 외래종' },
  '붕어': { minLength: null, closedSeason: null, warning: null, description: '민물낚시 대표' },
  '잉어': { minLength: null, closedSeason: null, warning: null, description: '대형 민물고기' },
  '메기': { minLength: null, closedSeason: null, warning: null, description: '야행성 민물고기' },
  '장어': { minLength: null, closedSeason: null, warning: null, description: '보양식 인기' },
  '연어': { minLength: 40, closedSeason: '10월~11월 (산란기)', warning: null, description: '회유성 어종' },
  '송어': { minLength: null, closedSeason: null, warning: null, description: '냉수 민물고기' },
  '향어': { minLength: null, closedSeason: null, warning: null, description: '낚시터 인기어종' },
  '쥐노래미': { minLength: null, closedSeason: null, warning: null, description: '연안 서식' },
  '돌돔': { minLength: 24, closedSeason: null, warning: null, description: '바위틈 서식, 고급어종' },
  '벵에돔': { minLength: null, closedSeason: null, warning: null, description: '갯바위 낚시 인기' },
  '참치': { minLength: null, closedSeason: null, warning: null, description: '대형 회유어종' },
  '문어': { minLength: null, closedSeason: null, warning: null, description: '연체동물, 문어낚시 인기' },
  '주꾸미': { minLength: null, closedSeason: null, warning: null, description: '가을철 별미' },
  '오징어': { minLength: null, closedSeason: null, warning: null, description: '에깅 낚시 인기' },
  '한치': { minLength: null, closedSeason: null, warning: null, description: '제주 특산' },
  '꽃게': { minLength: null, closedSeason: '6월~8월 (산란기)', warning: null, description: '게장으로 유명' },
  '대게': { minLength: null, closedSeason: null, warning: null, description: '겨울철 별미' },
}

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 미리보기
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsAnalyzing(true)
    setResult(null)
    setError(null)

    // Base64로 변환
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1]
      await analyzeWithGemini(base64)
    }
    reader.readAsDataURL(file)
  }

  const analyzeWithGemini = async (base64Image) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `이 사진의 물고기 어종을 분석해주세요. 한국에서 흔히 볼 수 있는 어종명으로 알려주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:
{
  "isFish": true 또는 false,
  "name": "한국어 어종명 (예: 광어, 우럭, 농어)",
  "nameEn": "영어 어종명",
  "confidence": 0-100 사이 숫자,
  "info": "크기, 특징 등 간단한 설명",
  "habitat": "서식지"
}

물고기가 아니면 isFish를 false로 설정하세요.`
                  },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Image
                    }
                  }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `API 오류: ${response.status}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!content) {
        throw new Error('응답이 비어있습니다')
      }

      // JSON 파싱
      let parsed
      try {
        // JSON 블록 추출
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('JSON 형식 없음')
        }
      } catch (parseErr) {
        console.error('파싱 오류:', content)
        throw new Error('응답 파싱 실패')
      }

      // 규제 정보 추가
      const regulation = koreanFishRegulations[parsed.name] || {}

      setResult({
        ...parsed,
        minLength: regulation.minLength || null,
        closedSeason: regulation.closedSeason || null,
        warning: regulation.warning || null,
        description: regulation.description || parsed.info
      })

    } catch (err) {
      console.error('Gemini 분석 오류:', err)
      setError(err.message || '분석 중 오류가 발생했습니다')
    }

    setIsAnalyzing(false)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return { main: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' }
    if (confidence >= 50) return { main: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
    return { main: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' }
  }

  const resetAnalysis = () => {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="h-full gradient-abyss pt-16 px-5 overflow-y-auto relative flex flex-col">
      <div
        className="absolute top-40 right-0 w-64 h-64 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(80, 140, 160, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 pt-4 shrink-0">
        <div className="flex items-end gap-3 mb-1">
          <h1 className="font-sans text-[24px] font-semibold text-white/90 tracking-tight leading-none">
            AI 어종 인식
          </h1>
          <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase pb-1">
            Gemini 2.0 Flash
          </span>
        </div>
        <p className="font-sans text-[12px] text-white/40 leading-relaxed">
          물고기 사진을 업로드하면 AI가 정확하게 어종을 분석합니다
        </p>
      </div>

      {/* Upload / Preview Area */}
      <div
        onClick={!previewUrl ? handleUploadClick : undefined}
        className={`relative z-10 rounded-2xl overflow-hidden transition-all duration-300 shrink-0 ${!previewUrl ? 'cursor-pointer active:scale-[0.98]' : ''} ${previewUrl ? 'max-h-[40vh]' : 'flex-1 min-h-0'}`}
        style={{
          background: previewUrl ? 'transparent' : 'linear-gradient(145deg, rgba(60, 100, 120, 0.2) 0%, rgba(40, 80, 100, 0.08) 100%)',
          border: '1px solid rgba(80, 140, 160, 0.15)',
        }}
      >
        {/* 업로드된 이미지 미리보기 */}
        {previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="분석 이미지"
              className="w-full h-full object-contain"
            />
            {/* 다시 촬영 버튼 */}
            <button
              onClick={resetAnalysis}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/80 text-[12px] font-medium hover:bg-black/70 transition-colors"
            >
              다시 촬영
            </button>
          </>
        )}

        {isAnalyzing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50">
            <div className="relative w-20 h-20">
              <div
                className="absolute inset-0 rounded-2xl animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.2) 0%, transparent 50%)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-teal-400/30 border-t-teal-400/80 rounded-full animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <span className="block font-sans text-[13px] text-teal-300/90 mb-1">Gemini AI 분석 중</span>
              <span className="font-mono text-[10px] text-white/40">Analyzing with AI...</span>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-28 h-28 flex items-center justify-center rounded-2xl bg-white/5">
              <img src="/camera1.png" alt="카메라" className="w-20 h-20 object-contain opacity-50" />
            </div>
            <div className="text-center">
              <span className="block font-sans text-[14px] text-white/50 mb-1">사진을 업로드하세요</span>
              <span className="font-mono text-[10px] text-white/20 tracking-wider">Tap to select image</span>
            </div>
          </div>
        ) : null}

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/10 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/10 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/10 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/10 rounded-br-lg" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="relative z-10 mt-5 p-4 rounded-xl bg-red-500/15 border border-red-500/30">
          <p className="font-sans text-[13px] text-red-300">{error}</p>
          <button
            onClick={resetAnalysis}
            className="mt-2 text-[12px] text-red-200/70 underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* AI Disclaimer */}
      {!result && !error && (
        <div
          className="relative z-10 mt-5 p-4 rounded-xl backdrop-blur-sm"
          style={{
            background: 'linear-gradient(145deg, rgba(100, 100, 100, 0.12) 0%, rgba(80, 80, 80, 0.06) 100%)',
            border: '1px solid rgba(150, 150, 150, 0.1)',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/50 mt-1.5 shrink-0" />
            <p className="font-sans text-[12px] text-white/40 leading-relaxed">
              Google Gemini AI로 분석합니다. 정확한 어종 판별이 가능합니다.
            </p>
          </div>
        </div>
      )}

      {/* AI Result */}
      {result && (
        <div className="relative z-10 mt-6 animate-fadeUp">
          <div
            className="p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(60, 110, 110, 0.2) 0%, rgba(40, 85, 85, 0.08) 100%)',
              border: '1px solid rgba(100, 160, 160, 0.15)',
            }}
          >
            {/* Accent line */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{
                background: `linear-gradient(180deg, ${getConfidenceColor(result.confidence).main}, ${getConfidenceColor(result.confidence).main}88)`,
              }}
            />

            {/* 어종 인식 실패 */}
            {result.isFish === false ? (
              <div className="text-center py-4">
                <div className="text-[40px] mb-3">🐟</div>
                <h2 className="font-sans text-[20px] font-light text-white/70 mb-2">물고기가 아닙니다</h2>
                <p className="font-sans text-[12px] text-white/40">물고기 사진을 업로드해 주세요</p>
              </div>
            ) : (
              <>
                {/* Confidence */}
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-sans text-[11px] text-white/45">신뢰도</span>
                    <span
                      className="font-mono text-[14px] font-semibold"
                      style={{ color: getConfidenceColor(result.confidence).main }}
                    >
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${result.confidence}%`,
                        background: `linear-gradient(90deg, ${getConfidenceColor(result.confidence).main}, ${getConfidenceColor(result.confidence).main}99)`,
                      }}
                    />
                  </div>
                </div>

                {/* Fish Name */}
                <div className="mb-4">
                  <h2 className="font-sans text-[32px] font-light text-white/90 tracking-tight leading-none mb-1">
                    {result.name}
                  </h2>
                  <p className="font-mono text-[10px] text-white/30 tracking-wider">{result.nameEn}</p>
                </div>

                {/* Fish Info */}
                <div className="space-y-2 mb-4">
                  {result.info && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">📏</span>
                      <span className="font-sans text-[12px] text-white/50">{result.info}</span>
                    </div>
                  )}
                  {result.habitat && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">🌊</span>
                      <span className="font-sans text-[12px] text-white/50">서식지: {result.habitat}</span>
                    </div>
                  )}
                  {result.description && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px]">💡</span>
                      <span className="font-sans text-[12px] text-white/50">{result.description}</span>
                    </div>
                  )}
                </div>

                {/* 규제 정보 */}
                {(result.minLength || result.closedSeason) && (
                  <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-sans text-[13px] font-semibold text-blue-300/90 mb-3 flex items-center gap-2">
                      <span>📋</span> 규제 정보
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-white/40 mb-1">최소 체장</p>
                        <p className="font-sans text-[16px] font-semibold text-blue-300">
                          {result.minLength ? `${result.minLength}cm` : '규정 없음'}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-[10px] text-white/40 mb-1">금어기</p>
                        <p className="font-sans text-[12px] font-semibold text-orange-300">
                          {result.closedSeason || '없음'}
                        </p>
                      </div>
                    </div>
                    {result.minLength && (
                      <p className="mt-3 text-[11px] text-white/40">
                        ⚠️ 최소 체장 미만 포획 시 과태료가 부과될 수 있습니다
                      </p>
                    )}
                  </div>
                )}

                {/* 경고 메시지 */}
                {result.warning && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/15 border border-red-500/30">
                    <div className="flex items-start gap-2">
                      <span className="text-[16px]">⚠️</span>
                      <p className="font-sans text-[13px] font-semibold text-red-300 leading-relaxed">
                        {result.warning}
                      </p>
                    </div>
                  </div>
                )}

                {/* Badge */}
                <div className="mt-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                    style={{
                      background: getConfidenceColor(result.confidence).bg,
                      color: getConfidenceColor(result.confidence).main,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: getConfidenceColor(result.confidence).main }}
                    />
                    {result.confidence >= 70 && '높은 신뢰도'}
                    {result.confidence >= 50 && result.confidence < 70 && '보통 신뢰도'}
                    {result.confidence < 50 && '낮은 신뢰도'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-24" />
    </div>
  )
}
