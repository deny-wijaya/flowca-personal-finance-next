/**
 * Membaca waktu kedaluwarsa (`exp`) dari JWT tanpa memeriksa tanda tangannya.
 * Hanya untuk pengecekan cepat di proxy, misalnya "token ini sudah lewat masa berlakunya, langsung ke Login".
 * Pemeriksaan yang sesungguhnya (tanda tangan) tetap dilakukan backend di setiap request.
 */
export function isJwtExpired(token: string, nowMs: number = Date.now()): boolean {
  const payload = token.split(".")[1];
  if (!payload) return true;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof exp !== "number" || exp * 1000 <= nowMs;
  } catch {
    // Token rusak diperlakukan sama seperti token yang sudah kedaluwarsa.
    return true;
  }
}
