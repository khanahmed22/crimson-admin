export function chunkText(text, size = 12) {
  const lines = text.split("\n");
  const chunks = [];
  for (let i = 0; i < lines.length; i += size) {
    chunks.push(lines.slice(i, i + size).join("\n"));
  }
  return chunks;
}
