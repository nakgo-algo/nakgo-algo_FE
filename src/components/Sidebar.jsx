import { useEffect, useRef } from 'react'

const pages = ['map', 'check', 'regulations', 'fines', 'camera']

const navLabels = [
  '위치 보기',
  '위반 판단',
  '규정 확인',
  '벌금 안내',
  'AI 분석',
]

export default function Sidebar({ isOpen, onClose, currentPage, onNavigate }) {
  const sidebarRef = useRef(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)

  // 사이드바 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 스와이프로 닫기
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = startXRef.current
  }

  const handleTouchMove = (e) => {
    currentXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = startXRef.current - currentXRef.current
    if (diff > 50) {
      onClose()
    }
  }

  const handleNavClick = (page) => {
    onNavigate(page)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 h-full z-[70] w-[75vw] max-w-[280px] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(15, 35, 55, 0.95) 0%, rgba(10, 25, 40, 0.98) 100%)',
          borderRight: '1px solid rgba(100, 150, 180, 0.15)',
          boxShadow: isOpen ? '4px 0 24px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {/* Header */}
        <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-6 border-b border-white/10">
          <div className="flex flex-col leading-none">
            <span className="font-sans text-[22px] font-semibold tracking-[0.06em] text-white/90">
              낚고
            </span>
            <span className="font-sans text-[22px] font-light tracking-[0.1em] text-white/50">
              알고
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col py-4">
          {pages.map((page, index) => {
            const isActive = currentPage === page

            return (
              <button
                key={page}
                onClick={() => handleNavClick(page)}
                className={`flex items-center gap-4 px-6 py-4 bg-transparent border-none cursor-pointer text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10'
                    : 'hover:bg-white/5 active:bg-white/10'
                }`}
              >
                {/* Active Indicator */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'bg-white/20'
                  }`}
                />

                <span
                  className={`font-sans text-[15px] tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-normal text-white/60'
                  }`}
                >
                  {navLabels[index]}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Disclaimer */}
        <div className="absolute bottom-0 left-0 right-0 pb-[calc(env(safe-area-inset-bottom)+16px)] px-6">
          <p className="font-mono text-[9px] text-white/25 tracking-wider leading-relaxed">
            본 서비스의 정보는 참고용이며
            <br />
            법적 효력이 없습니다
          </p>
        </div>
      </aside>
    </>
  )
}
