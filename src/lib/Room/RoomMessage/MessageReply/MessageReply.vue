<template>
  <div class="vac-reply-message">
    <div class="vac-reply-username">
      {{ replyUsername }}
    </div>

    <div v-if="isImage" class="vac-image-reply-container">
      <img class="vac-message-image vac-message-image-reply" :src="firstFile.url" />
    </div>

    <div v-else-if="isVideo" class="vac-video-reply-container">
      <video controls>
        <source :src="firstFile.url" />
      </video>
    </div>

    <audio-player
      v-else-if="isAudio"
      :src="firstFile.url"
      :message-selection-enabled="false"
      @update-progress-time="progressTime = $event"
      @hover-audio-progress="hoverAudioProgress = $event"
    >
      <template v-for="(idx, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </audio-player>

    <div v-else-if="isOtherFile" class="vac-file-container">
      <div class="vac-reply-file-icon">
        <i :class="fileIconClass" />
      </div>
      <div class="vac-reply-file-info">
        <div class="vac-text-ellipsis vac-reply-file-name">
          {{ firstFile.name }}
        </div>
        <div
          class="vac-text-ellipsis vac-file-extension-and-size"
        >
          {{ fileExtensionAndSize }}
        </div>
      </div>
    </div>

    <div class="vac-reply-content">
      <format-message
        :message-id="message.replyMessage._id"
        :content="message.replyMessage.content"
        :users="roomUsers"
        :text-formatting="textFormatting"
        :link-options="linkOptions"
        :reply="true"
      />
    </div>
  </div>
</template>

<script>
import FormatMessage from '../../../../components/FormatMessage/FormatMessage'

import AudioPlayer from '../AudioPlayer/AudioPlayer'

import {
  isAudioFile,
  isImageFile,
  isVideoFile
} from '../../../../utils/media-file'

import { humanFileSize } from '../../../../utils/adhoc'

export default {
  name: 'MessageReply',
  components: { AudioPlayer, FormatMessage },

  props: {
    message: { type: Object, required: true },
    textFormatting: { type: Object, required: true },
    linkOptions: { type: Object, required: true },
    roomUsers: { type: Array, required: true }
  },

  computed: {
    replyUsername() {
      const { senderId } = this.message.replyMessage
      const replyUser = this.roomUsers.find(user => user._id === senderId)
      return replyUser ? replyUser.username : ''
    },
    firstFile() {
      return this.message.replyMessage?.files?.length
        ? this.message.replyMessage.files[0]
        : {}
    },
    isAudio() {
      return isAudioFile(this.firstFile)
    },
    isImage() {
      return isImageFile(this.firstFile)
    },
    isVideo() {
      return isVideoFile(this.firstFile)
    },
    isOtherFile() {
      return (
        this.message.replyMessage.files?.length &&
        !this.isAudio &&
        !this.isVideo &&
        !this.isImage
      )
    },
    fileIconClass() {
      return Optidata.MimeTypeIcons.getIconByMimeType(this.firstFile.type)
    },
    fileExtensionAndSize() {
      return `${this.firstFile.extension} · ${humanFileSize(this.firstFile.size, true)}`
    }
  }
}
</script>
