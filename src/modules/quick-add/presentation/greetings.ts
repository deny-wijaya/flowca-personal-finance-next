/** Sapaan pembuka Koko. Halaman penuh (mobile) dan panel desktop punya copy berbeda di desain. */
export function quickAddGreeting(firstName: string, variant: "page" | "panel") {
  return variant === "page"
    ? `Hai ${firstName}! Mau catat apa? Ketik, tekan mikrofon untuk bicara, atau foto notanya. Aku isi detailnya, kamu tinggal cek lalu simpan.`
    : `Hai ${firstName}! Ketik, bicara, atau seret foto nota ke sini. Aku isi detailnya, kamu tinggal cek.`;
}
