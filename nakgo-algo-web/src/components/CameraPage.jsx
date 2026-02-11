import { useState, useRef, useEffect } from 'react'
import api from '../api'

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''

export default function CameraPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [showManualSelect, setShowManualSelect] = useState(false)
  const [speciesList, setSpeciesList] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/fish/species')
      .then(setSpeciesList)
      .catch(() => {})
  }, [])

  const fishList = speciesList.map(s => s.name)
  const regulationMap = Object.fromEntries(
    speciesList.map(s => [s.name, { minLength: s.minLength, bannedMonths: s.bannedMonths }])
  )

  const formatBannedMonths = (months) => {
    if (!months || months.length === 0) return null
    return `${months[0]}월 ~ ${months[months.length - 1]}월`
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setShowManualSelect(false)

    await analyzeWithHuggingFace(file)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const analyzeWithHuggingFace = async (file) => {
    try {
      const base64 = await fileToBase64(file)
      const fishNames = fishList.join(', ')

      const response = await fetch('/hf-api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-VL-7B-Instruct',
          messages: [
            {
              role: 'system',
              content: `당신은 물고기 어종 판별 전문가입니다. 사용자가 보내는 사진을 보고 어떤 물고기인지 판별해주세요. 다음 목록 중에서 가장 가까운 어종을 골라 이름만 답해주세요: ${fishNames}. 목록에 없는 물고기면 가장 비슷한 것을 골라주세요. 물고기가 아니면 "물고기 아님"이라고만 답해주세요. 반드시 어종 이름만 답하세요.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:${file.type || 'image/jpeg'};base64,${base64}` },
                },
                {
                  type: 'text',
                  text: '이 물고기의 어종을 알려주세요.',
                },
              ],
            },
          ],
          max_tokens: 100,
        }),
      })

      if (!response.ok) throw new Error(`API 오류: ${response.status}`)

      const data = await response.json()
      const answer = data.choices?.[0]?.message?.content || ''
      console.log('AI 응답:', answer)

      const matchedFish = matchFishFromAnswer(answer)

      if (matchedFish) {
        const reg = regulationMap[matchedFish]
        setResult({
          isFish: true, name: matchedFish, aiResponse: answer, confidence: 85,
          minLength: reg?.minLength || null,
          closedSeason: formatBannedMonths(reg?.bannedMonths),
        })
      } else if (!answer.includes('물고기 아님') && !answer.includes('아닙니다') && !answer.includes('아님')) {
        setResult({ isFish: true, name: '어종 미확인', aiResponse: answer, confidence: 40 })
        setShowManualSelect(true)
      } else {
        setResult({ isFish: false, aiResponse: answer })
      }
    } catch (err) {
      setError(err.message)
      setShowManualSelect(true)
    }
    setIsAnalyzing(false)
  }

  const matchFishFromAnswer = (answer) => {
    const cleaned = answer.trim()
    for (const name of fishList) {
      if (cleaned === name) return name
    }
    for (const name of fishList) {
      if (answer.includes(name)) return name
    }
    return null
  }

  const handleManualSelect = (fishName) => {
    const reg = regulationMap[fishName]
    setResult({
      isFish: true, name: fishName, confidence: 100,
      minLength: reg?.minLength || null,
      closedSeason: formatBannedMonths(reg?.bannedMonths),
    })
    setShowManualSelect(false)
  }

  const reset = () => {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setShowManualSelect(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="h-full bg-slate-900 pt-16 pb-8 px-5 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white mb-1">AI 어종 인식</h1>
        <p className="text-sm text-slate-400">사진으로 어종 분석</p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => !previewUrl && fileInputRef.current?.click()}
        className={`relative rounded-xl overflow-hidden ${!previewUrl ? 'cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-600' : ''}`}
        style={{ minHeight: previewUrl ? 'auto' : '200px' }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="분석 이미지" className="w-full max-h-[40vh] object-contain bg-slate-800 rounded-xl" />
            <button onClick={reset} className="absolute top-2 right-2 px-3 py-1.5 bg-slate-800/90 text-white text-xs rounded-lg">
              다시
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">탭하여 사진 선택</span>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-slate-400 text-sm">분석 중...</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Manual Select */}
      {showManualSelect && (
        <div className="mt-4">
          <p className="text-slate-400 text-sm mb-2">어종 직접 선택</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {fishList.map((fish) => (
              <button
                key={fish}
                onClick={() => handleManualSelect(fish)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700"
              >
                {fish}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4">
          {!result.isFish ? (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400">물고기가 아닌 것 같습니다</p>
              {result.aiResponse && <p className="text-slate-500 text-xs mt-1">AI: {result.aiResponse}</p>}
              <button onClick={() => setShowManualSelect(true)} className="mt-2 text-teal-400 text-sm">
                직접 선택하기
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              {/* Name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{result.name}</h3>
                </div>
                {result.confidence && (
                  <span className="text-xs text-slate-500">{result.confidence}%</span>
                )}
              </div>
              {result.aiResponse && <p className="text-slate-500 text-xs mb-2">AI: {result.aiResponse}</p>}

              {/* Regulations */}
              {(result.minLength || result.closedSeason) && (
                <div className="flex gap-4 py-3 border-t border-slate-700 text-sm">
                  {result.minLength && (
                    <div>
                      <p className="text-slate-500 text-xs">최소 체장</p>
                      <p className="text-white">{result.minLength}cm</p>
                    </div>
                  )}
                  {result.closedSeason && (
                    <div>
                      <p className="text-slate-500 text-xs">금어기</p>
                      <p className="text-yellow-400">{result.closedSeason}</p>
                    </div>
                  )}
                </div>
              )}

              {result.confidence < 100 && (
                <button onClick={() => setShowManualSelect(true)} className="mt-3 text-teal-400 text-sm">
                  다른 어종 선택
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  )
}
