const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const BASE = `${API_URL}/admin`
export const WS_BASE = API_URL.replace(/^http/, 'ws').replace('/api', '')

function headers(key) {
  return { 'Content-Type': 'application/json', 'X-Admin-Key': key }
}

async function request(method, path, key, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(key),
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Request failed')
  return json.data
}

// ── Mock Tests ────────────────────────────────────────────────────────────────
export const listMockTests = (key) => request('GET', '/mocktests', key)
export const createMockTest = (key, body) => request('POST', '/mocktests', key, body)
export const listQuestions = (key, testId) => request('GET', `/mocktests/${testId}/questions`, key)
export const addQuestion = (key, testId, body) => request('POST', `/mocktests/${testId}/questions`, key, body)

// ── Live Classes ──────────────────────────────────────────────────────────────
export const listLiveClasses = (key) => request('GET', '/live/classes', key)
export const createLiveClass = (key, body) => request('POST', '/live/classes', key, body)
export const endLiveClass = (key, classId) => request('DELETE', `/live/classes/${classId}`, key)
export const pushLiveQuestion = (key, classId, body) => request('POST', `/live/classes/${classId}/questions`, key, body)
export const endLiveQuestion = (key, classId, qid) => request('DELETE', `/live/classes/${classId}/questions/${qid}`, key)
export const getLeaderboard = (key, classId, qid) => request('GET', `/live/classes/${classId}/questions/${qid}/leaderboard`, key)
