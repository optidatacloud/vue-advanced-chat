<template>
  <div class="vac-message-file-container">
    <div
      v-if="isImage && !isSVG"
      :ref="'imageRef' + index"
      class="vac-message-image-container"
      @mouseover="imageHover = true"
      @mouseleave="imageHover = false"
      @click.prevent.stop="openFile($event, 'preview')"
    >
      <progress-bar
        v-if="file.progress >= 0"
        :progress="file.progress"
        :style="{ top: `${imageResponsive.loaderTop}px` }"
      />
      <loader
        v-else
        :show="isImageLoading"
        type="message-file"
        :message-id="message._id"
        :style="{ top: `${imageResponsive.loaderTop}px` }"
      >
        <template v-for="(idx, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </loader>
      <div
        class="vac-message-image"
        :class="{
          'vac-blur-loading':
            isImageLoading && message.senderId === currentUserId
        }"
        :style="{
          'background-image': `url('${
            isImageLoading ? file.preview || file.url : file.url
          }')`,
          'max-height': `${imageResponsive.maxHeight}px`
        }"
      >
        <transition name="vac-fade-image">
          <div
            v-if="!messageSelectionEnabled && imageHover && !isImageLoading"
            class="vac-image-buttons"
          >
            <div
              class="vac-svg-button vac-button-view"
              @click.prevent.stop="openFile($event, 'preview')"
            >
              <slot :name="'eye-icon_' + message._id">
                <svg-icon name="eye" />
              </slot>
            </div>
            <div
              class="vac-svg-button vac-button-download"
              @click.prevent.stop="openFile($event, 'download')"
            >
              <slot :name="'document-icon_' + message._id">
                <svg-icon name="document" />
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div
      v-else-if="isVideo"
      class="vac-video-container"
      @click.prevent="openFile($event, 'preview')"
    >
      <progress-bar v-if="file.progress >= 0" :progress="file.progress" />
      <video controls>
        <source :src="file.url" />
      </video>
    </div>

    <div v-else class="vac-file-wrapper vac-text-container">
      <progress-bar v-if="file.progress >= 0" :progress="file.progress" :style="{ top: '44px' }" />
      <div
        class="vac-file-container"
        :class="{ 'vac-file-container-progress': file.progress >= 0 }"
        @click="openFile($event, isPreviewable() ? 'preview' : 'download')"
      >
        <div class="vac-svg-button">
          <slot v-if="isPreviewable()" name="file-icon">
            <svg-icon name="file" />
          </slot>
          <slot v-else name="document-icon">
            <svg-icon name="document" />
          </slot>
        </div>
        <div class="vac-text-ellipsis">
          {{ file.name }}
        </div>
        <div v-if="file.extension" class="vac-text-ellipsis vac-text-extension">
          {{ file.extension }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../../../../../components/Loader/Loader'
import ProgressBar from '../../../../../components/ProgressBar/ProgressBar'
import SvgIcon from '../../../../../components/SvgIcon/SvgIcon'

import { isImageFile, isVideoFile, isTextFile, isPdfFile, isSVGFile } from '../../../../../utils/media-file'

export default {
  name: 'MessageFile',
  components: { SvgIcon, Loader, ProgressBar },

  props: {
    currentUserId: { type: [String, Number], required: true },
    message: { type: Object, required: true },
    file: { type: Object, required: true },
    index: { type: Number, required: true },
    messageSelectionEnabled: { type: Boolean, required: true }
  },

  emits: ['open-file'],

  data() {
    return {
      imageResponsive: '',
      imageLoading: false,
      imageHover: false
    }
  },

  computed: {
    isImageLoading() {
      return this.file.url.indexOf('blob:http') !== -1 || this.imageLoading
    },
    isImage() {
      return isImageFile(this.file)
    },
    isVideo() {
      return isVideoFile(this.file)
    },
    isText() {
      return isTextFile(this.file)
    },
    isPdf() {
      return isPdfFile(this.file)
    },
    isSVG() {
      return isSVGFile(this.file)
    }
  },

  watch: {
    file: {
      immediate: true,
      handler() {
        this.checkImgLoad()
      }
    }
  },

  mounted() {
    const ref = this.$refs['imageRef' + this.index]

    if (ref) {
      this.imageResponsive = {
        maxHeight: ref.clientWidth - 18,
        loaderTop: ref.clientHeight / 2 - 9
      }
    }
  },

  methods: {
    isPreviewable() {
      return this.isText || this.isPdf || this.isSVG
    },
    checkImgLoad() {
      if (!isImageFile(this.file)) return
      this.imageLoading = true
      const image = new Image()
      image.src = this.file.url
      image.addEventListener('load', () => (this.imageLoading = false))
    },
    openFile(event, action) {
      if (!this.messageSelectionEnabled) {
        event.stopPropagation()
        this.$emit('open-file', { file: this.file, 'action': action })
      }
    }
  }
}
</script>
