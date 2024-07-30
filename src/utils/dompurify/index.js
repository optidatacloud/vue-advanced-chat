import dompurify from 'dompurify'

export function sanitize(string) {
  if (!string || !string.length) {
    return ''
  }
  return dompurify.sanitize(string)
}
