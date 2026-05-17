export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `h-${Date.now()}`;
}

export function makeHeadingId(text: string, index: number): string {
  const base = slugify(text);
  return base ? `${base}-${index}` : `h-${index}`;
}
