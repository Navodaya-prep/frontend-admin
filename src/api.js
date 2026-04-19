const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const BASE = `${API_URL}/admin`
export const WS_BASE = API_URL.replace(/^http/, 'ws').replace('/api', '')
export const UPLOADS_BASE = API_URL.replace('/api', '')

function headers(token) {
  return { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${token}` 
  }
}

async function request(method, path, token, body) {
  try {
    const url = `${BASE}${path}`
    console.log(`API Request: ${method} ${url}`)
    
    const res = await fetch(url, {
      method,
      headers: headers(token),
      body: body ? JSON.stringify(body) : undefined,
    })
    
    // Check if response is ok
    if (!res.ok) {
      const text = await res.text()
      console.error('API Error Response:', res.status, text)
      throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`)
    }
    
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text()
      console.error('Non-JSON response:', text.substring(0, 200))
      throw new Error('Server returned non-JSON response')
    }
    
    const json = await res.json()
    console.log('API Response:', json)
    
    if (!json.success) throw new Error(json.message || 'Request failed')
    return json.data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// ── Image Upload ──────────────────────────────────────────────────────────────
export async function uploadImage(token, file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${BASE}/upload/image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed: ${res.status} - ${text.substring(0, 100)}`)
  }
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Upload failed')
  return json.data.url // returns relative URL like "/uploads/abc123.jpg"
}

// Build full URL for an uploaded image path
export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${UPLOADS_BASE}${path}`
}

// ── Mock Tests ────────────────────────────────────────────────────────────────
export const listMockTests = (token) => request('GET', '/mocktests', token)
export const createMockTest = (token, body) => request('POST', '/mocktests', token, body)
export const deleteMockTest = (token, testId) => request('DELETE', `/mocktests/${testId}`, token)
export const listQuestions = (token, testId) => request('GET', `/mocktests/${testId}/questions`, token)
export const addQuestion = (token, testId, body) => request('POST', `/mocktests/${testId}/questions`, token, body)
export const updateQuestion = (token, testId, questionId, body) => request('PUT', `/mocktests/${testId}/questions/${questionId}`, token, body)
export const deleteQuestion = (token, testId, questionId) => request('DELETE', `/mocktests/${testId}/questions/${questionId}`, token)
export const reorderQuestions = (token, testId, body) => request('PUT', `/mocktests/${testId}/questions/reorder`, token, body)

// ── Live Classes ──────────────────────────────────────────────────────────────
export const listLiveClasses = (token) => request('GET', '/live/classes', token)
export const createLiveClass = (token, body) => request('POST', '/live/classes', token, body)
export const endLiveClass = (token, classId) => request('DELETE', `/live/classes/${classId}`, token)
export const pushLiveQuestion = (token, classId, body) => request('POST', `/live/classes/${classId}/questions`, token, body)
export const endLiveQuestion = (token, classId, qid) => request('DELETE', `/live/classes/${classId}/questions/${qid}`, token)
export const getLeaderboard = (token, classId, qid) => request('GET', `/live/classes/${classId}/questions/${qid}/leaderboard`, token)

// ── Practice Hub — Subjects ───────────────────────────────────────────────────
export const listSubjects = (token) => request('GET', '/practice/subjects', token).then((d) => d.subjects)
export const createSubject = (token, body) => request('POST', '/practice/subjects', token, body)
export const updateSubject = (token, id, body) => request('PUT', `/practice/subjects/${id}`, token, body)
export const deleteSubject = (token, id) => request('DELETE', `/practice/subjects/${id}`, token)

// ── Practice Hub — Chapters ───────────────────────────────────────────────────
export const listChapters = (token, subjectId) => request('GET', `/practice/subjects/${subjectId}/chapters`, token).then((d) => d.chapters)
export const createChapter = (token, subjectId, body) => request('POST', `/practice/subjects/${subjectId}/chapters`, token, body)
export const updateChapter = (token, id, body) => request('PUT', `/practice/chapters/${id}`, token, body)
export const deleteChapter = (token, id) => request('DELETE', `/practice/chapters/${id}`, token)

// ── Practice Hub — Questions ──────────────────────────────────────────────────
export const listPracticeQuestions = (token, chapterId) => request('GET', `/practice/chapters/${chapterId}/questions`, token).then((d) => d.questions)
export const createPracticeQuestion = (token, chapterId, body) => request('POST', `/practice/chapters/${chapterId}/questions`, token, body)
export const updatePracticeQuestion = (token, id, body) => request('PUT', `/practice/questions/${id}`, token, body)
export const deletePracticeQuestion = (token, id) => request('DELETE', `/practice/questions/${id}`, token)

// ── Recorded Classes — Courses ────────────────────────────────────────────────
export const listAdminCourses = (token) => request('GET', '/courses', token).then((d) => d.courses)
export const createCourse = (token, body) => request('POST', '/courses', token, body)
export const updateCourse = (token, id, body) => request('PUT', `/courses/${id}`, token, body)
export const deleteCourse = (token, id) => request('DELETE', `/courses/${id}`, token)

// ── Recorded Classes — Chapters ───────────────────────────────────────────────
export const listAdminChapters = (token, courseId) => request('GET', `/courses/${courseId}/chapters`, token).then((d) => d.chapters)
export const createCourseChapter = (token, courseId, body) => request('POST', `/courses/${courseId}/chapters`, token, body)
// updateChapter / deleteChapter are shared with practice hub (same model)

// ── Recorded Classes — Lessons ────────────────────────────────────────────────
export const listLessons = (token, chapterId) => request('GET', `/chapters/${chapterId}/lessons`, token).then((d) => d.lessons)
export const createLesson = (token, chapterId, body) => request('POST', `/chapters/${chapterId}/lessons`, token, body)
export const updateLesson = (token, id, body) => request('PUT', `/lessons/${id}`, token, body)
export const deleteLesson = (token, id) => request('DELETE', `/lessons/${id}`, token)

// ── Settings ──────────────────────────────────────────────────────────────────
export const getSettings = (token) => request('GET', '/settings', token).then((d) => d.settings)
export const updateSettings = (token, body) => request('PUT', '/settings', token, body)

// ── Daily Challenge ───────────────────────────────────────────────────────────
export const listChallenges = (token) => request('GET', '/daily-challenge', token).then((d) => d.challenges)
export const createChallenge = (token, body) => request('POST', '/daily-challenge', token, body)
export const updateChallenge = (token, id, body) => request('PUT', `/daily-challenge/${id}`, token, body)
export const deleteChallenge = (token, id) => request('DELETE', `/daily-challenge/${id}`, token)

// ── Doubts ────────────────────────────────────────────────────────────────────
export const listDoubts = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request('GET', `/doubts${qs ? '?' + qs : ''}`, token).then((d) => d.doubts)
}
export const getDoubtWithAnswers = (token, id) =>
  request('GET', `/doubts/${id}/answers`, token)
export const answerDoubt = (token, id, text) => request('POST', `/doubts/${id}/answers`, token, { text })
export const deleteAdminDoubt = (token, id) => request('DELETE', `/doubts/${id}`, token)
