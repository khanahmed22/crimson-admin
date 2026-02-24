export function cleanOCRText(raw) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // remove long garbage lines
    .filter((l) => l.length < 120)
    // keep lines that likely contain food + price
    .filter((l) => /\d/.test(l))
    // remove phone numbers
    .filter((l) => !/(\+?\d{10,})/.test(l))
    // remove addresses / headers
    .filter((l) => !/(address|phone|www|http|gst|tax)/i.test(l))
    .slice(0, 80) // 🔥 HARD CAP
    .join("\n");
}
