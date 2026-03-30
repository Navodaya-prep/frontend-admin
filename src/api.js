const BASE = `${import.meta.env.VITE_API_URL ?? '/api'}/admin`

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

export const listMockTests = (key) => request('GET', '/mocktests', key)
export const createMockTest = (key, body) => request('POST', '/mocktests', key, body)
export const listQuestions = (key, testId) => request('GET', `/mocktests/${testId}/questions`, key)
export const addQuestion = (key, testId, body) => request('POST', `/mocktests/${testId}/questions`, key, body)
