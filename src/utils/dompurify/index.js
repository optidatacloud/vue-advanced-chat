import dompurify from 'dompurify'

export function safe(html) {
  return !html || !html.length ? '' : dompurify.sanitize(html)
}
