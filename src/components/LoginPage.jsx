import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage({ onLoginSuccess }) {
  const { loginWithKakao, loginDemo } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleKakaoLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithKakao()
      onLoginSuccess?.()
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
    }
    setIsLoading(false)
  }

  const handleDemoLogin = () => {
    loginDemo()
    onLoginSuccess?.()
  }

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-20 px-6 pb-8">
        <h1 className="text-2xl font-bold text-white mb-2">로그인</h1>
        <p className="text-sm text-slate-400">
          로그인하고 더 많은 기능을 이용하세요
        </p>
      </div>

      {/* Login Benefits */}
      <div className="px-6 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">나만의 포인트 저장</p>
              <p className="text-slate-500 text-xs">즐겨찾는 낚시 장소를 저장하세요</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">조과 기록</p>
              <p className="text-slate-500 text-xs">잡은 물고기를 기록하고 통계를 확인하세요</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">오류 제보</p>
              <p className="text-slate-500 text-xs">잘못된 정보를 신고하고 개선에 참여하세요</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">게시판 활동</p>
              <p className="text-slate-500 text-xs">글쓰기, 댓글로 다른 낚시인과 소통하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Buttons */}
      <div className="px-6 space-y-3">
        {/* Kakao Login */}
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full py-3.5 bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0C4.029 0 0 3.13 0 6.989c0 2.393 1.523 4.508 3.868 5.768l-.986 3.678a.31.31 0 00.466.345l4.269-2.832c.456.045.92.07 1.383.07 4.971 0 9-3.13 9-6.99C18 3.13 13.971 0 9 0z"
              fill="#191919"
            />
          </svg>
          {isLoading ? '로그인 중...' : '카카오로 시작하기'}
        </button>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
        >
          체험용 계정으로 시작
        </button>

        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex-1 flex items-end pb-8 px-6">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
