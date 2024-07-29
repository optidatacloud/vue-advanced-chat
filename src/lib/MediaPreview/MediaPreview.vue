
<template>
  <div
    ref="modal"
    tabindex="0"
    class="vac-media-preview"
    @click.stop="closeModal"
    @keydown.esc="closeModal"
  >
      <div v-if="isImage" class="vac-media-preview-container">
        <div v-if="isSVG" class="vac-svg-preview">
          <div v-if="loadSVG(file)" v-html="fileContent" />
          <loader v-else show="true" type="messages" />
        </div>
        <div v-else class="vac-image-preview" :style="{ 'background-image': `url('${file.url}')` }" />
      </div>

      <div v-else-if="isVideo" class="vac-media-preview-container">
        <video controls autoplay>
          <source :src="file.url" />
        </video>
      </div>

      <div v-else-if="isPdf" class="vac-media-preview-container">
				<div class="vac-iframe-preview-container">
          <iframe
            :src="file.url"
            title="PDF Viewer"
            class="vac-iframe-preview-pdf"
            @load="onIframeFinishedLoading"
          />
					<loader :show="isLoadingIframe" type="messages" />
				</div>
			</div>

      <div v-else-if="isText" class="vac-media-preview-container">
        <div class="vac-text-preview-container" @click.stop.prevent="null">
          <div v-if="fileContent" class="vac-preview-text">
            <code>
              {{ fileContent }}
            </code>
          </div>
          <loader v-else-if="isFetchingFile" show="true" type="messages" />
          <div v-else>
            <div class="vac-media-preview-container">
              <span>
                {{ translate('Was not possible to load file content at this time, try downloading instead') }}
              </span>
              <div class="vac-preview-download-button" @click.stop.prevent="downloadFile($event, file)">
                <slot :name="'document-icon_' + file.url">
                  <svg-icon name="document" />
                  <span>{{ translate('Download') }}</span>
                </slot>
              </div>
            </div>
          </div>
        </div>
			</div>

      <div v-else class="vac-media-preview-container">
        <div class="vac-preview-failed-container" @click.stop.prevent="null">
          <span>{{ translate('Can not preview file, try downloading instead') }}</span>
          <div class="vac-preview-download-button" @click.stop.prevent="downloadFile($event, file)">
            <slot :name="'document-icon_' + file.url">
              <svg-icon name="document" />
              <span>{{ translate('Download') }}</span>
            </slot>
          </div>
        </div>
      </div>

    <div class="vac-preview-download-button" @click.stop.prevent="downloadFile($event, file)">
      <slot :name="'document-icon_' + file.url">
        <svg-icon name="document" />
        <span>{{ translate('Download') }}</span>
      </slot>
    </div>

    <div class="vac-svg-button">
      <slot name="preview-close-icon">
        <svg-icon name="close-outline" param="preview" />
      </slot>
    </div>

    <div v-if="showArrows" class="vac-carousel-arrows">
      <button class="vac-carousel-arrow" @click.stop.prevent="prevMedia()">
        <i class="bi bi-chevron-left" />
      </button>
      <button class="vac-carousel-arrow" @click.stop.prevent="nextMedia()">
        <i class="bi bi-chevron-right" />
      </button>
    </div>
  </div>
</template>

<script>

import Loader from '../../components/Loader/Loader'
import SvgIcon from '../../components/SvgIcon/SvgIcon'

import { isImageFile, isVideoFile, isPdfFile, isTextFile, isSVGFile } from '../../utils/media-file'
import { translate } from '../../utils/i18n/index'

export default {
  name: 'MediaPreview',
  components: {
    Loader,
    SvgIcon
  },

  props: {
    files: { type: Array, required: true },
    index: { type: Number, required: true }
  },

  emits: ['close-media-preview'],

  data() {
    return {
      isLoadingIframe: true,
      file: this.files[this.index],
      showArrows: this.files.length > 1,
      fileIndex: this.index,
      fileContent: null,
      cachedFiles: {},
      isFetchingFile: false
    }
  },

  computed: {
    isImage() {
      return isImageFile(this.file)
    },
    isSVG() {
      return isSVGFile(this.file)
    },
    isVideo() {
      return isVideoFile(this.file)
    },
    isPdf() {
      return isPdfFile(this.file)
    },
    isText() {
      const temp = isTextFile(this.file)
      if (temp) {
        this.getFileContent(this.file)
      }
      return temp
    }
  },

  mounted() {
    this.$refs.modal.focus()
  },

  methods: {
    prevMedia() {
      this.fileIndex = this.fileIndex - 1 < 0 ? this.files.length - 1 : this.fileIndex - 1
      this.file = this.files[this.fileIndex]
      this.fileContent = null
    },
    nextMedia() {
      this.fileIndex = this.fileIndex + 1 > this.files.length - 1 ? 0 : this.fileIndex + 1
      this.file = this.files[this.fileIndex]
      this.fileContent = null
    },
    translate(str) {
      return translate(str)
    },
    closeModal() {
      this.$emit('close-media-preview')
    },
    downloadFile(event, file) {
      event.preventDefault()
      event.stopPropagation()
      window.open(file.downloadUrl, '_self')
    },
    onIframeFinishedLoading() {
      this.isLoadingIframe = false
    },
    async getFileContent(file) {
      this.isFetchingFile = true

      const url = file?.downloadUrl ?? file?.previewUrl

      if (this.cachedFiles[url]) {
        this.fileContent = this.cachedFiles[url]
        this.isFetchingFile = false
        return this.fileContent
      }

      try {
        await fetch(url)
          .then(async res => {
            this.fileContent = await res.text()
          })
      } catch (error) {
        this.fileContent = null
      }

      this.cachedFiles[url] = this.fileContent
      this.isFetchingFile = false
      return this.fileContent
    },
    sanitizeSVG(svg) {
      if (!svg || !svg.length) {
        return ''
      }
      return svg.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    },
    async loadSVG(file) {
      const svg = await this.getFileContent(file)

      if (!svg) {
        return null
      }

      const sanitized = this.sanitizeSVG(svg)
      this.fileContent = sanitized
      return sanitized
    }
  }
}
</script>
