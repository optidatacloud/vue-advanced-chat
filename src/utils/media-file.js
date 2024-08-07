import { IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, PDF_TYPES, TEXT_TYPES, SVG_TYPES } from './constants'

function checkMediaType(types, file) {
  if (!file || !file.type) return
  return types.some(t => file.type.toLowerCase().includes(t))
}

export function isImageFile(file) {
  return checkMediaType(IMAGE_TYPES, file)
}

export function isVideoFile(file) {
  return checkMediaType(VIDEO_TYPES, file)
}

export function isImageVideoFile(file) {
  return checkMediaType(IMAGE_TYPES, file) || checkMediaType(VIDEO_TYPES, file)
}

export function isAudioFile(file) {
  return checkMediaType(AUDIO_TYPES, file)
}

export function isPdfFile(file) {
  return checkMediaType(PDF_TYPES, file)
}

export function isTextFile(file) {
  return checkMediaType(TEXT_TYPES, file)
}

export function isSVGFile(file) {
  return checkMediaType(SVG_TYPES, file)
}
