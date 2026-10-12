export function authReady() {
  const secret = process.env.AUTH_SECRET;
  const googleId = process.env.AUTH_GOOGLE_ID;
  const googleSecret = process.env.AUTH_GOOGLE_SECRET;
  return Boolean(secret && secret.length >= 32 && googleId && googleSecret && !googleId.includes('replace_me') && !googleSecret.includes('replace_me'));
}
