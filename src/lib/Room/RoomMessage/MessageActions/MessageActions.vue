<template>
  <div
    class="vac-message-actions-wrapper"
    :style="{ display: message.deleted ? 'none' : '' }"
    :class="{
      'vac-message-me': message.senderId === currentUserId
    }"
  >
    <div
      class="vac-options-container"
    >
      <transition-group :name="message.senderId === currentUserId ? 'vac-slide-left' : 'vac-slide-right'" tag="span">
        <div
          v-if="isMessageActions || isMessageReactions"
          key="1"
          class="vac-blur-container"
        />

        <div
          v-if="isMessageActions"
          ref="actionIcon"
          key="2"
          class="vac-svg-button vac-message-options"
          @click="openOptions"
        >
          <slot :name="'dropdown-icon_' + message._id">
            <svg-icon name="dropdown" param="message" />
          </slot>
        </div>

        <div v-if="isMessageReactions" key="3" v-click-outside="closeEmoji">
          <slot
            name="emoji-picker"
            v-bind="{ emojiOpened }"
            :add-emoji="sendMessageReaction"
          >
            <emoji-picker-container
              class="vac-message-emojis"
              :emoji-opened="emojiOpened"
              :emoji-reaction="true"
              :position-right="message.senderId === currentUserId"
              :message-id="message._id"
              :emoji-data-source="emojiDataSource"
              @add-emoji="sendMessageReaction"
              @open-emoji="openEmoji"
            >
              <template v-for="(idx, name) in $slots" #[name]="data">
                <slot :name="name" v-bind="data" />
              </template>
            </emoji-picker-container>
          </slot>
        </div>
      </transition-group>
    </div>

    <transition
      v-if="filteredMessageActions.length"
      :name="
        message.senderId === currentUserId
          ? 'vac-slide-left'
          : 'vac-slide-right'
      "
    >
      <div
        v-if="optionsOpened"
        ref="menuOptions"
        v-click-outside="closeOptions"
        class="vac-menu-options"
        :class="{
          'vac-menu-left': message.senderId !== currentUserId
        }"
        :style="{ top: `${menuOptionsTop}px` }"
      >
        <div class="vac-menu-list">
          <div v-for="action in filteredMessageActions" :key="action.name">
            <div v-if="!action.shouldHide" class="vac-menu-item" @click="messageActionHandler(action)">
              {{ action.title }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import vClickOutside from '../../../../utils/on-click-outside'

import SvgIcon from '../../../../components/SvgIcon/SvgIcon'
import EmojiPickerContainer from '../../../../components/EmojiPickerContainer/EmojiPickerContainer'
import { findParentBySelector } from '../../../../utils/element-selector'

export default {
  name: 'MessageActions',
  components: { SvgIcon, EmojiPickerContainer },

  directives: {
    clickOutside: vClickOutside
  },

  props: {
    currentUserId: { type: [String, Number], required: true },
    message: { type: Object, required: true },
    messageActions: { type: Array, required: true },
    showReactionEmojis: { type: Boolean, required: true },
    messageHover: { type: Boolean, required: true },
    hoverMessageId: { type: [String, Number], default: null },
    hoverAudioProgress: { type: Boolean, required: true },
    emojiDataSource: { type: String, default: undefined },
    messageContextMenu: { type: Object, default: () => ({ state: 'closed', messageId: null }) }
  },

  emits: [
    'update-emoji-opened',
    'update-options-opened',
    'update-message-hover',
    'message-action-handler',
    'send-message-reaction'
  ],

  data() {
    return {
      menuOptionsTop: 0,
      optionsOpened: false,
      optionsClosing: false,
      emojiOpened: false
    }
  },

  computed: {
    isMessageActions() {
      return (
        this.filteredMessageActions.length &&
        this.messageHover &&
        !this.message.deleted &&
        !this.message.disableActions &&
        !this.hoverAudioProgress
      )
    },
    isMessageReactions() {
      return (
        this.showReactionEmojis &&
        this.messageHover &&
        !this.message.deleted &&
        !this.message.disableReactions &&
        !this.hoverAudioProgress
      )
    },
    filteredMessageActions() {
      const actionsFilteredByUser = this.message.senderId === this.currentUserId
        ? this.messageActions
        : this.messageActions.filter(message => !message.onlyMe)

      const messageType = this.getMessageType()

      return actionsFilteredByUser
        .filter(action => !action?.type || action.type === messageType)
        .map(action => {
          const shouldHide = action.hideIfContentIsNull && this.message.content === ''
          return { ...action, shouldHide }
        })
    }
  },

  watch: {
    emojiOpened(val) {
      this.$emit('update-emoji-opened', val)
      if (val) this.optionsOpened = false
    },
    messageContextMenu(val) {
      if (val.state === 'closed' || Number(val.messageId) !== Number(this.message._id)) {
        return this.closeOptions()
      }

      this.openOptions()
    },
    optionsOpened(val) {
      this.$emit('update-options-opened', val)
    }
  },

  methods: {
    openOptions() {
      if (this.optionsClosing) return

      this.optionsOpened = !this.optionsOpened
      if (!this.optionsOpened) return

      setTimeout(() => {
        const roomFooterRef = findParentBySelector(this.$el, '#room-footer')

        if (
          !roomFooterRef ||
          !this.$refs.menuOptions ||
          !this.$refs.actionIcon
        ) {
          return
        }

        const menuOptionsTop =
          this.$refs.menuOptions.getBoundingClientRect().height

        const actionIconTop = this.$refs.actionIcon.getBoundingClientRect().top
        const roomFooterTop = roomFooterRef.getBoundingClientRect().top

        const optionsTopPosition =
          roomFooterTop - actionIconTop > menuOptionsTop + 50

        if (optionsTopPosition) this.menuOptionsTop = 30
        else this.menuOptionsTop = -menuOptionsTop
      })
    },
    closeOptions() {
      this.optionsOpened = false
      this.optionsClosing = true
      this.updateMessageHover()
      setTimeout(() => (this.optionsClosing = false), 100)
    },
    openEmoji() {
      this.emojiOpened = !this.emojiOpened
    },
    closeEmoji() {
      this.emojiOpened = false
      this.updateMessageHover()
    },
    updateMessageHover() {
      if (this.hoverMessageId !== this.message._id) {
        this.$emit('update-message-hover', false)
      }
    },
    messageActionHandler(action) {
      this.closeOptions()
      this.$emit('message-action-handler', action)
    },
    sendMessageReaction(emoji, reaction) {
      this.$emit('send-message-reaction', { emoji, reaction })
      this.closeEmoji()
    },
    getMessageType() {
      if (this.message.files?.length === 0) {
        return null
      }

      return 'file'
    }
  }
}
</script>
