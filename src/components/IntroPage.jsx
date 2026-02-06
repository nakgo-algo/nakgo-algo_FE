import { useEffect, useState } from 'react'

// 물결 SVG 컴포넌트 - 화면 하단에서 출렁이는 애니메이션
function WaveLayer({ delay = 0, opacity = 0.15, yOffset = 0 }) {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      style={{
        opacity,
        transform: `translateY(${yOffset}px)`,
        animation: `wave ${4 + delay}s ease-in-out infinite`,
        animationDelay: `${delay * 0.5}s`,
      }}
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      height="180"
    >
      <path
        fill="#0f766e"
        d="M0,100 C320,180 420,20 720,100 C1020,180 1120,20 1440,100 L1440,200 L0,200 Z"
      />
    </svg>
  )
}

// 작은 물고기 아이콘
function SmallFish({ style, direction = 1 }) {
  return (
    <svg
      width="24"
      height="12"
      viewBox="0 0 24 12"
      fill="none"
      style={{
        ...style,
        transform: `scaleX(${direction})`,
      }}
    >
      <path
        d="M18 6C18 6 14 0 8 0C2 0 0 6 0 6C0 6 2 12 8 12C14 12 18 6 18 6Z"
        fill="currentColor"
      />
      <path d="M20 1L24 6L20 11V1Z" fill="currentColor" />
      <circle cx="5" cy="6" r="1.5" fill="#0f172a" />
    </svg>
  )
}

// 낚시 찌 아이콘 - 물결 위에 둥둥
function FloatingBobber() {
  return (
    <div
      className="absolute"
      style={{
        bottom: '120px',
        right: '15%',
        animation: 'float 3s ease-in-out infinite',
      }}
    >
      {/* 낚시줄 */}
      <div
        className="absolute w-px bg-slate-500/30"
        style={{
          height: '80px',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      {/* 찌 */}
      <svg width="16" height="32" viewBox="0 0 16 32" fill="none">
        <ellipse cx="8" cy="8" rx="4" ry="4" fill="#ef4444" />
        <rect x="7" y="12" width="2" height="12" fill="#fafafa" />
        <ellipse cx="8" cy="28" rx="3" ry="4" fill="#334155" />
      </svg>
    </div>
  )
}

export default function IntroPage({ onStart }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col relative overflow-hidden">
      {/* 스타일 정의 */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-20px) translateY(-5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes swim {
          0% { transform: translateX(-30px); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateX(calc(100vw + 30px)); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 배경 물고기들 - 천천히 수영 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute text-slate-700/40"
          style={{
            top: '25%',
            animation: 'swim 18s linear infinite',
            animationDelay: '0s',
          }}
        >
          <SmallFish direction={1} />
        </div>
        <div
          className="absolute text-slate-700/30"
          style={{
            top: '40%',
            animation: 'swim 22s linear infinite',
            animationDelay: '5s',
          }}
        >
          <SmallFish direction={1} />
        </div>
        <div
          className="absolute text-slate-700/25"
          style={{
            top: '55%',
            animation: 'swim 25s linear infinite',
            animationDelay: '12s',
          }}
        >
          <SmallFish direction={1} />
        </div>
      </div>

      {/* 물결 레이어 - 하단에 겹겹이 */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] pointer-events-none">
        <WaveLayer delay={2} opacity={0.08} yOffset={30} />
        <WaveLayer delay={1} opacity={0.12} yOffset={15} />
        <WaveLayer delay={0} opacity={0.18} yOffset={0} />
        <FloatingBobber />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col px-6 relative z-10">
        {/* 상단 여백 */}
        <div className="flex-1 min-h-[15vh]" />

        {/* 메인 콘텐츠 */}
        <div
          className="flex flex-col"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out',
          }}
        >
          {/* 로고 */}
          <div className="mb-8">
            <h1
              className="text-5xl font-bold text-white leading-tight"
              style={{
                animation: isVisible ? 'fadeUp 0.6s ease-out forwards' : 'none',
              }}
            >
              낚고
            </h1>
            <h1
              className="text-5xl font-light text-teal-600/80 leading-tight"
              style={{
                animation: isVisible ? 'fadeUp 0.6s ease-out 0.1s forwards' : 'none',
                opacity: isVisible ? 1 : 0,
              }}
            >
              알고
            </h1>
          </div>

          {/* 설명 */}
          <div
            className="mb-12"
            style={{
              animation: isVisible ? 'fadeUp 0.6s ease-out 0.2s forwards' : 'none',
              opacity: isVisible ? 1 : 0,
            }}
          >
            <p className="text-xl text-white/90 mb-2">낚시하기 전에,</p>
            <p className="text-xl text-white/90 mb-6">이 구역부터 확인하세요</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              금지구역, 금어기, 체장 규정까지
              <br />
              한눈에 확인하세요
            </p>
          </div>
        </div>

        {/* 하단 영역 */}
        <div
          className="flex-1 flex flex-col justify-end pb-16"
          style={{
            animation: isVisible ? 'fadeUp 0.6s ease-out 0.4s forwards' : 'none',
            opacity: isVisible ? 1 : 0,
          }}
        >
          {/* CTA */}
          <button
            onClick={onStart}
            className="flex items-center gap-2 text-white text-lg group"
          >
            <span className="group-hover:text-teal-400 transition-colors">
              시작하기
            </span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 group-hover:text-teal-400 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 면책조항 */}
          <p className="text-[10px] text-slate-600 mt-6">
            본 서비스의 정보는 참고용이며 법적 효력이 없습니다
          </p>
        </div>
      </div>
    </div>
  )
}
