import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 카카오 SDK 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js'
    script.async = true
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized() && KAKAO_JS_KEY) {
        window.Kakao.init(KAKAO_JS_KEY)
      }
      checkLoginStatus()
    }
    script.onerror = () => checkLoginStatus()
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  // 저장된 토큰으로 로그인 상태 복원
  const checkLoginStatus = async () => {
    const token = api.getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const data = await api.get('/auth/verify')
      setUser({ ...data.user, provider: 'kakao' })
    } catch {
      api.clearToken()
    }
    setIsLoading(false)
  }

  // 카카오 로그인 → 백엔드 JWT 발급
  const loginWithKakao = () => {
    return new Promise((resolve, reject) => {
      if (!window.Kakao) {
        loginDemo()
        resolve(user)
        return
      }

      window.Kakao.Auth.login({
        success: async (authObj) => {
          try {
            const data = await api.post('/auth/kakao', {
              accessToken: authObj.access_token,
            })
            api.setToken(data.token)
            const loggedUser = { ...data.user, provider: 'kakao' }
            setUser(loggedUser)
            resolve(loggedUser)
          } catch (err) {
            reject(err)
          }
        },
        fail: (error) => reject(error),
      })
    })
  }

  // 데모 로그인 (로컬만, JWT 없음)
  const loginDemo = () => {
    const demoUser = {
      id: 'demo_' + Date.now(),
      nickname: '낚시인' + Math.floor(Math.random() * 1000),
      profileImage: null,
      provider: 'demo',
    }
    setUser(demoUser)
    return demoUser
  }

  // 로그아웃
  const logout = async () => {
    if (api.getToken()) {
      try {
        await api.post('/auth/logout')
      } catch {}
    }
    api.clearToken()
    if (window.Kakao?.Auth?.getAccessToken()) {
      window.Kakao.Auth.logout(() => {})
    }
    setUser(null)
  }

  // 프로필 업데이트
  const updateProfile = async (updates) => {
    if (updates.nickname && api.getToken()) {
      try {
        const data = await api.put('/profile/nickname', { nickname: updates.nickname })
        setUser((prev) => ({ ...prev, ...data }))
        return
      } catch {}
    }
    setUser((prev) => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        loginWithKakao,
        loginDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
