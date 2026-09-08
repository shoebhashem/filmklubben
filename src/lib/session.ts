export function getSessionId(): string {
  try {
    const key = 'filmklubben_session'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('filmklubben_admin_token')
  } catch {
    return null
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem('filmklubben_admin_token', token)
  } catch {
    // storage unavailable
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem('filmklubben_admin_token')
  } catch {
    // storage unavailable
  }
}
