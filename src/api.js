const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(error.message || `API 오류: ${res.status}`)
  }

  return res.json()
}

const api = {
  // 인증
  auth: {
    kakaoLogin: (kakaoToken) =>
      request('/auth/kakao', { method: 'POST', body: JSON.stringify({ accessToken: kakaoToken }) }),
    verify: () => request('/auth/verify'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // 프로필
  profile: {
    get: () => request('/profile'),
    updateNickname: (nickname) =>
      request('/profile/nickname', { method: 'PUT', body: JSON.stringify({ nickname }) }),
  },

  // AI 어종 분석
  fish: {
    analyze: (imageBase64, fileType) =>
      request('/fish/analyze', { method: 'POST', body: JSON.stringify({ image: imageBase64, fileType }) }),
    list: () => request('/fish/species'),
    check: (species, length) =>
      request('/fish/check', { method: 'POST', body: JSON.stringify({ species, length }) }),
  },

  // 규정
  regulations: {
    getAll: () => request('/regulations'),
    getRegion: (regionId) => request(`/regulations/${regionId}`),
  },

  // 벌금
  fines: {
    list: () => request('/fines'),
  },

  // 낚시 포인트
  points: {
    list: () => request('/points'),
    create: (data) => request('/points', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/points/${id}`, { method: 'DELETE' }),
  },

  // 게시판
  posts: {
    list: (search = '') => request(`/posts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    create: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/posts/${id}`),
    delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
    getComments: (postId) => request(`/posts/${postId}/comments`),
    addComment: (postId, text) =>
      request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) }),
  },

  // 오류 제보
  reports: {
    list: (status) => request(`/reports${status && status !== 'all' ? `?status=${status}` : ''}`),
    create: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  },

  // 낚시 구역 (지도용)
  zones: {
    list: () => request('/zones'),
  },
}

export default api
