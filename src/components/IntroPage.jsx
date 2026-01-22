export default function IntroPage({ onStart }) {
  return (
    <div className="h-full w-full gradient-deep flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(100, 160, 180, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(80, 140, 160, 0.1) 0%, transparent 40%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-12">
          <div className="flex flex-col leading-none">
            <span className="font-sans text-[32px] font-semibold tracking-[0.08em] text-white/90">
              낚고
            </span>
            <span className="font-sans text-[32px] font-light tracking-[0.12em] text-white/50">
              알고
            </span>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="font-sans text-[22px] font-medium leading-relaxed text-white/85 mb-4">
          낚시하기 전에,
          <br />
          이 구역부터 확인하세요
        </h1>

        {/* Sub Message */}
        <p className="font-sans text-[14px] text-white/40 mb-12 leading-relaxed">
          금지구역, 금어기, 체장 규정까지
          <br />
          한눈에 확인하세요
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="px-8 py-4 font-sans text-[15px] font-semibold text-white/90 border-none cursor-pointer btn-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(70, 130, 145, 0.85) 0%, rgba(50, 105, 120, 0.9) 100%)',
            borderRadius: '14px',
          }}
        >
          알고 낚시하기
        </button>
      </div>

      {/* Disclaimer */}
      <p className="absolute bottom-8 left-0 right-0 text-center font-mono text-[9px] text-white/20 tracking-wider px-8">
        본 서비스의 정보는 참고용이며 법적 효력이 없습니다
      </p>
    </div>
  )
}
