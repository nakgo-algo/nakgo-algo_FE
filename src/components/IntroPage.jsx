export default function IntroPage({ onStart }) {
  return (
    <div className="h-full w-full bg-slate-900 flex flex-col px-6">
      {/* Top spacing */}
      <div className="flex-1 min-h-[15vh]" />

      {/* Content */}
      <div className="flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white leading-tight">
            낚고
          </h1>
          <h1 className="text-5xl font-light text-slate-500 leading-tight">
            알고
          </h1>
        </div>

        {/* Description */}
        <div className="mb-12">
          <p className="text-xl text-white mb-2">
            낚시하기 전에,
          </p>
          <p className="text-xl text-white mb-6">
            이 구역부터 확인하세요
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            금지구역, 금어기, 체장 규정까지<br />
            한눈에 확인하세요
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex-1 flex flex-col justify-end pb-12">
        {/* CTA Button */}
        <button
          onClick={onStart}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-xl transition-colors"
        >
          시작하기
        </button>

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          본 서비스의 정보는 참고용이며 법적 효력이 없습니다
        </p>
      </div>
    </div>
  )
}
