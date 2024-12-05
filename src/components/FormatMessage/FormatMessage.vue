<template>
  <div
    class="vac-format-message-wrapper"
    :class="{ 'vac-text-ellipsis': singleLine }"
  >
    <template v-for="(message, i) in parsedMessage" :key="i">
      <!-- Open Graph -->
      <div v-if="message.og">
        <!-- image -->
        <hero-link v-if="message.og.type === 'image'" :opengraph="message.og" />
        <!-- spotify/youtube -->
        <hero-link-iframe v-else-if="message.og.type === 'iframe'" :opengraph="message.og" />
      </div>

      <div
        v-if="message.markdown"
        class="markdown"
        :class="{ 'vac-emoji-message': containsOnlyOneEmoji(message) }"
        @click="openTag"
        v-html="message.value"
      />
      <div
        v-else
        class="vac-format-container"
        :class="{ 'vac-text-ellipsis': singleLine }"
      >
        <component
          :is="message.url ? 'a' : 'span'"
          :class="{
            'vac-text-ellipsis': singleLine,
            'vac-text-tag': !singleLine && !reply && message.tag
          }"
          :href="message.href"
          :target="message.href ? linkOptions.target : null"
          :rel="message.href ? linkOptions.rel : null"
        >
          <template v-if="deleted">
            <slot
              :name="
                roomList
                  ? 'deleted-icon-room_' + roomId
                  : 'deleted-icon_' + messageId
              "
            >
              <svg-icon
                name="deleted"
                class="vac-icon-deleted"
                :class="{ 'vac-icon-deleted-room': roomList }"
              />
            </slot>
            {{ textMessages.MESSAGE_DELETED }}
          </template>
          <template v-else-if="message.url && message.image">
            <div class="vac-image-link-container">
              <div
                class="vac-image-link"
                :style="{
                  'background-image': `url('${message.value}')`,
                  height: message.height
                }"
              />
            </div>
            <div class="vac-image-link-message">
              {{ message.value }}
            </div>
          </template>
          <template v-else>
            {{ message.value }}
          </template>
        </component>
      </div>
    </template>
  </div>
</template>

<script>
import SvgIcon from '../SvgIcon/SvgIcon'

import markdown from '../../utils/markdown'
import { IMAGE_TYPES } from '../../utils/constants'
import { containsOnlyEmojis, emojiCount } from '../../utils/emoji'

import HeroLink from '../../lib/Room/RoomMessage/HeroLink/HeroLink.vue'
import HeroLinkIframe from '../../lib/Room/RoomMessage/HeroLinkIframe/HeroLinkIframe.vue'

export default {
  name: 'FormatMessage',
  components: { SvgIcon, HeroLink, HeroLinkIframe },

  props: {
    shouldDisplayOG: { type: Boolean, default: true },
    messageId: { type: String, default: '' },
    roomId: { type: String, default: '' },
    roomList: { type: Boolean, default: false },
    content: { type: [String, Number], required: true },
    deleted: { type: Boolean, default: false },
    users: { type: Array, default: () => [] },
    linkify: { type: Boolean, default: true },
    singleLine: { type: Boolean, default: false },
    reply: { type: Boolean, default: false },
    textFormatting: { type: Object, required: true },
    textMessages: { type: Object, default: () => {} },
    linkOptions: { type: Object, required: true }
  },

  emits: ['open-user-tag'],

  computed: {
    parsedMessage() {
      if (this.deleted) {
        return [{ value: this.textMessages.MESSAGE_DELETED }]
      }

      let options
      if (!this.textFormatting.disabled) {
        options = {
          textFormatting: {
            linkify: this.linkify,
            linkOptions: this.linkOptions,
            singleLine: this.singleLine,
            reply: this.reply,
            users: this.users,
            ...this.textFormatting
          }
        }
      } else {
        options = {}
      }

      const message = markdown(this.content, options)

      message.forEach(m => {
        m.markdown = this.checkType(m, 'markdown')
        m.tag = this.checkType(m, 'tag')
        m.image = this.checkImageType(m)

        if (this.shouldDisplayOG && Math.random() > 0.8) {
          m.og = {
            type: 'image',
            image: 'https://via.placeholder.com/150',
            url: 'https://via.placeholder.com/150',
            title: 'Optidata cloud',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            domain: 'optidata.cloud'
          }
        }
      })

      return message
    }
  },

  methods: {
    containsOnlyOneEmoji(message) {
      const div = document.createElement('div')
      div.innerHTML = message.value
      const text = div.textContent || div.innerText || ''
      return emojiCount(text) === 1 && containsOnlyEmojis(text)
    },
    checkType(message, type) {
      return message.types && message.types.indexOf(type) !== -1
    },
    checkImageType(message) {
      let index = message.value.lastIndexOf('.')
      const slashIndex = message.value.lastIndexOf('/')
      if (slashIndex > index) index = -1

      const type = message.value.substring(index + 1, message.value.length)

      const isMedia =
        index > 0 && IMAGE_TYPES.some(t => type.toLowerCase().includes(t))

      if (isMedia) this.setImageSize(message)

      return isMedia
    },
    setImageSize(message) {
      const image = new Image()
      image.src = message.value

      image.addEventListener('load', onLoad)

      function onLoad(img) {
        const ratio = img.path[0].width / 150
        message.height = Math.round(img.path[0].height / ratio) + 'px'
        image.removeEventListener('load', onLoad)
      }
    },
    openTag(event) {
      const userId = event.target.getAttribute('data-user-id')
      if (!this.singleLine && userId) {
        const user = this.users.find(u => String(u._id) === userId)
        this.$emit('open-user-tag', user)
      }
    }
  }
}
</script>
