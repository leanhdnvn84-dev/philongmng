// "Ghi nhớ đăng nhập 7 ngày" (V191): remembered sessions last 7 days, others 8 hours (both slide with activity).
export const REMEMBER_COOKIE = 'pl_rm'
export const REMEMBER_MAX_AGE = 7 * 24 * 3600
export const SESSION_MAX_AGE = 8 * 3600
export const maxAgeFor = (remember: boolean) => (remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE)
