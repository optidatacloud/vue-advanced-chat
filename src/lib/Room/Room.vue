<template>
  <div
    v-show="(isMobile && !showRoomsList) || !isMobile || singleRoom"
    class="vac-col-messages"
    @drop.prevent="onDropFiles"
    @dragenter.prevent
    @dragover.prevent
    @dragleave.prevent
    @touchstart="touchStart"
  >
    <slot v-if="showNoRoom" name="no-room-selected">
      <div class="vac-container-center vac-room-empty">
        <div>{{ textMessages.ROOM_EMPTY }}</div>
      </div>
    </slot>

    <room-header
      v-else
      :current-user-id="currentUserId"
      :text-messages="textMessages"
      :single-room="singleRoom"
      :show-rooms-list="showRoomsList"
      :is-mobile="isMobile"
      :room-info-enabled="roomInfoEnabled"
      :menu-actions="menuActions"
      :room="room"
      :message-selection-enabled="messageSelectionEnabled"
      :message-selection-actions="messageSelectionActions"
      :selected-messages-total="selectedMessages.length"
      :call="call"
      @toggle-rooms-list="$emit('toggle-rooms-list')"
      @room-info="$emit('room-info')"
      @menu-action-handler="$emit('menu-action-handler', $event)"
      @message-selection-action-handler="messageSelectionActionHandler"
      @cancel-message-selection="messageSelectionEnabled = false"
      @return-to-call="$emit('return-to-call', $event)"
    >
      <template v-for="(i, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </room-header>

    <div
      id="messages-list"
      ref="scrollContainer"
      class="vac-container-scroll"
      :class="{ 'vac-room-call-ongoing': isCallInProgress }"
      @scroll="onContainerScroll"
    >
      <loader :show="isLoadingInitialMessages" type="messages">
        <template v-for="(idx, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </loader>
      <div class="vac-messages-container">
        <div :class="{ 'vac-messages-hidden': isLoadingInitialMessages }">
          <transition name="vac-fade-message">
            <div>
              <div v-if="showNoMessages" class="vac-text-started">
                <slot name="messages-empty">
                  {{ textMessages.MESSAGES_EMPTY }}
                </slot>
              </div>
              <div v-if="showMessagesStarted" class="vac-text-started">
                {{ textMessages.CONVERSATION_STARTED }} {{ messages[0].date }}
              </div>
            </div>
          </transition>
          <div
            v-if="messages.length && !messagesLoadedTop"
            id="infinite-loader-messages-top"
          >
            <loader :show="true" :infinite="true" type="infinite-messages">
              <template v-for="(idx, name) in $slots" #[name]="data">
                <slot :name="name" v-bind="data" />
              </template>
            </loader>
          </div>
          <transition-group :key="roomId" name="vac-fade-message" tag="span">
            <div v-for="(m, i) in messages" :key="m.indexId || m._id">
              <room-message
                :is-whatsapp-group-feature-enabled="isWhatsappGroupFeatureEnabled"
                :has-whatsapp-integration="hasWhatsappIntegration"
                :current-user-id="currentUserId"
                :message="m"
                :index="i"
                :messages="messages"
                :edited-message-id="editedMessageId"
                :message-actions="messageActions"
                :room-users="room.users"
                :text-messages="textMessages"
                :new-messages="newMessages"
                :show-reaction-emojis="showReactionEmojis && room.isCurrentUserInRoom"
                :show-new-messages-divider="showNewMessagesDivider"
                :text-formatting="textFormatting"
                :link-options="linkOptions"
                :username-options="usernameOptions"
                :message-selection-enabled="messageSelectionEnabled"
                :selected-messages="selectedMessages"
                :emoji-data-source="emojiDataSource"
                :max-message-rows="maxMessageRows"
                :message-context-menu="messageContextMenu"
                @context-menu-opened="handleContextMenuOpened"
                @message-added="onMessageAdded"
                @message-action-handler="messageActionHandler"
                @open-file="$emit('open-file', $event)"
                @copy-file-to-drive-folder="$emit('copy-file-to-drive-folder', { roomId, message: $event.message, fileIndex: $event.fileIndex, file: $event.file })"
                @open-user-tag="openUserTag"
                @avatar-click="$emit('avatar-click', $event)"
                @open-failed-message="$emit('open-failed-message', $event)"
                @send-message-reaction="sendMessageReaction"
                @select-message="selectMessage"
                @unselect-message="unselectMessage"
                @message-reaction-click="messageReactionClick"
                @message-reply-click="$emit('message-reply-click', $event)"
                @click-message-username="$emit('click-message-username', $event)"
              >
                <template v-for="(idx, name) in $slots" #[name]="data">
                  <slot :name="name" v-bind="data" />
                </template>
              </room-message>
            </div>
          </transition-group>
        <div
            v-if="messages.length && !messagesLoadedBottom"
            id="infinite-loader-messages-bottom"
          >
            <loader :show="true" :infinite="true" type="infinite-messages">
              <template v-for="(idx, name) in $slots" #[name]="data">
                <slot :name="name" v-bind="data" />
              </template>
            </loader>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!isLoadingInitialMessages">
      <transition name="vac-bounce">
        <div v-if="scrollIcon" class="vac-icon-scroll" @click="scrollToBottom">
          <transition name="vac-bounce">
            <div
              v-if="scrollMessagesCount"
              class="vac-badge-counter vac-messages-count"
            >
              {{ scrollMessagesCount }}
            </div>
          </transition>
          <slot name="scroll-icon">
            <svg-icon name="dropdown" param="scroll" />
          </slot>
        </div>
      </transition>
    </div>

    <room-footer
      :room="room"
      :room-id="roomId"
      :current-user-id="currentUserId"
      :room-message="roomMessage"
      :messages="messages"
      :text-messages="textMessages"
      :show-send-icon="showSendIcon"
      :show-files="showFiles"
      :show-audio="showAudio"
      :show-emojis="showEmojis"
      :show-footer="showFooter"
      :accepted-files="acceptedFiles"
      :capture-files="captureFiles"
      :textarea-action-enabled="textareaActionEnabled"
      :textarea-auto-focus="textareaAutoFocus"
      :user-tags-enabled="userTagsEnabled"
      :emojis-suggestion-enabled="emojisSuggestionEnabled"
      :templates-text="templatesText"
      :text-formatting="textFormatting"
      :link-options="linkOptions"
      :audio-bit-rate="audioBitRate"
      :audio-sample-rate="audioSampleRate"
      :init-reply-message="initReplyMessage"
      :init-edit-message="initEditMessage"
      :dropped-files="droppedFiles"
      :emoji-data-source="emojiDataSource"
      :attachment-options="attachmentOptions"
      :textarea-highlight="textareaHighlight"
      :external-files="externalFiles"
      :allow-sending-external-files="allowSendingExternalFiles"
      :message-text-area-classes="messageTextAreaClasses"
      :disable-message-text-area="disableMessageTextArea"
      :show-attachment-loader="showAttachmentLoader"
      :message-concat-value="messageConcatValue"
      @update-edited-message-id="editedMessageId = $event"
      @edit-message="$emit('edit-message', $event)"
      @send-message="$emit('send-message', $event)"
      @typing-message="$emit('typing-message', $event)"
      @textarea-action-handler="$emit('textarea-action-handler', $event)"
      @attachment-picker-handler="$emit('attachment-picker-handler', $event)"
      @request-permission-to-send-external-files="$emit('request-permission-to-send-external-files', $event)"
      @external-files-removed="$emit('external-files-removed', $event)"
      @new-draft-message="$emit('new-draft-message', $event)"
    >
      <template v-for="(idx, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </room-footer>
  </div>
</template>

<script>
import Loader from '../../components/Loader/Loader'
import SvgIcon from '../../components/SvgIcon/SvgIcon'

import RoomHeader from './RoomHeader/RoomHeader'
import RoomFooter from './RoomFooter/RoomFooter'
import RoomMessage from './RoomMessage/RoomMessage'

import FileUploaderOverlay from '../../utils/uploader-overlay/'
import { nextTick } from 'vue'

export default {
  name: 'ChatRoom',
  components: {
    Loader,
    SvgIcon,
    RoomHeader,
    RoomFooter,
    RoomMessage
  },

  props: {
    isWhatsappGroupFeatureEnabled: { type: Boolean, default: false },
    hasWhatsappIntegration: { type: Boolean, default: false },
    currentUserId: { type: [String, Number], required: true },
    textMessages: { type: Object, required: true },
    singleRoom: { type: Boolean, required: true },
    showRoomsList: { type: Boolean, required: true },
    isMobile: { type: Boolean, required: true },
    rooms: { type: Array, required: true },
    archivedRooms: { type: Array, required: true },
    roomId: { type: [String, Number], required: true },
    loadFirstRoom: { type: Boolean, required: true },
    messages: { type: Array, required: true },
    roomMessage: { type: String, default: null },
    messagesLoadedTop: { type: Boolean, required: true },
    messagesLoadedBottom: { type: Boolean, required: true },
    menuActions: { type: Array, required: true },
    messageActions: { type: Array, required: true },
    messageSelectionActions: { type: Array, required: true },
    autoScroll: { type: Object, required: true },
    showSendIcon: { type: Boolean, required: true },
    showFiles: { type: Boolean, required: true },
    showAudio: { type: Boolean, required: true },
    audioBitRate: { type: Number, required: true },
    audioSampleRate: { type: Number, required: true },
    showEmojis: { type: Boolean, required: true },
    showReactionEmojis: { type: Boolean, required: true },
    showNewMessagesDivider: { type: Boolean, required: true },
    showFooter: { type: Boolean, required: true },
    acceptedFiles: { type: String, required: true },
    captureFiles: { type: String, required: true },
    textFormatting: { type: Object, required: true },
    linkOptions: { type: Object, required: true },
    loadingRooms: { type: Boolean, required: true },
    roomInfoEnabled: { type: Boolean, required: true },
    textareaActionEnabled: { type: Boolean, required: true },
    textareaAutoFocus: { type: Boolean, required: true },
    userTagsEnabled: { type: Boolean, required: true },
    emojisSuggestionEnabled: { type: Boolean, required: true },
    scrollDistance: { type: Number, required: true },
    templatesText: { type: Array, default: null },
    usernameOptions: { type: Object, required: true },
    emojiDataSource: { type: String, default: undefined },
    attachmentOptions: { type: Array, required: true },
    call: { type: Object, required: true },
    textareaHighlight: { type: Boolean, default: false },
    externalFiles: { type: Array, default: () => [] },
    messageTextAreaClasses: { type: Array, default: () => [] },
    disableMessageTextArea: { type: Boolean, default: false },
    showAttachmentLoader: { type: Boolean, default: false },
    messageConcatValue: { type: String, default: '' },
    allowSendingExternalFiles: { type: Boolean, default: null },
    maxMessageRows: { type: Number, default: 0 }
  },

  emits: [
    'toggle-rooms-list',
    'room-info',
    'menu-action-handler',
    'message-selection-action-handler',
    'edit-message',
    'send-message',
    'delete-message',
    'message-action-handler',
    'fetch-messages-top',
    'fetch-messages-bottom',
    'send-message-reaction',
    'typing-message',
    'open-file',
    'copy-file-to-drive-folder',
    'open-user-tag',
    'open-failed-message',
    'textarea-action-handler',
    'message-reaction-click',
    'attachment-picker-handler',
    'return-to-call',
    'request-permission-to-send-external-files',
    'external-files-removed',
    'new-draft-message',
    'message-reply-click',
    'click-message-username',
    'avatar-click'
  ],

  data() {
    return {
      overlayInitialized: false,
      editedMessageId: null,
      initReplyMessage: null,
      initEditMessage: null,
      isLoadingInitialMessages: false,
      observer: null,
      scrollIcon: false,
      scrollMessagesCount: 0,
      newMessages: [],
      messageSelectionEnabled: false,
      selectedMessages: [],
      droppedFiles: [],
      messageContextMenu: { state: 'closed', messageId: null }
    }
  },

  computed: {
    room() {
      return this.rooms.find(room => Number(room.roomId) === Number(this.roomId)) || this.archivedRooms.find(room => Number(room.roomId) === Number(this.roomId)) || {}
    },
    showNoMessages() {
      return (
        this.roomId &&
        !this.messages.length &&
        !this.isLoadingInitialMessages &&
        !this.loadingRooms
      )
    },
    showNoRoom() {
      const noRoomSelected =
        (!this.rooms.length && !this.archivedRooms.length && !this.loadingRooms) ||
        (!this.roomId && !this.loadFirstRoom)

      if (noRoomSelected) {
        this.updateIsLoadingInitialMessages(false)
      }
      return noRoomSelected
    },
    showMessagesStarted() {
      return this.messages.length && this.messagesLoadedTop
    },
    isCallInProgress() {
      return this.call && this.call.statusInProgress
    }
  },

  watch: {
    roomId: {
      immediate: true,
      handler() {
        this.onRoomChanged()
      }
    },
    messages: {
      deep: true,
      handler(newVal, oldVal) {
        newVal.forEach((message, i) => {
          if (
            this.showNewMessagesDivider &&
            !message.seen &&
            message.senderId !== this.currentUserId
          ) {
            this.newMessages.push({
              _id: message._id,
              index: i
            })
          }
        })
        if (oldVal?.length === newVal?.length - 1) {
          this.newMessages = []
        }
        if (oldVal?.length === 0 && newVal?.length > 0) {
          this.updateIsLoadingInitialMessages(false)
        }
      }
    },
    messagesLoadedTop(val) {
      if (val) this.updateIsLoadingInitialMessages(false)
    },
    messagesLoadedBottom(val) {
      if (val) this.updateIsLoadingInitialMessages(false)
    }
  },

  mounted() {
    this.newMessages = []
  },

  methods: {
    updateIsLoadingInitialMessages(val) {
      this.isLoadingInitialMessages = val

      if (!val) {
        setTimeout(() => this.initIntersectionObserver())
      }
    },
    initIntersectionObserver() {
      if (this.observer) {
        this.observer.disconnect()
      }

      const loaderTop = this.$el.querySelector('#infinite-loader-messages-top')
      const loaderBottom = this.$el.querySelector('#infinite-loader-messages-bottom')

      if (loaderTop || loaderBottom) {
        const options = {
          root: this.$el.querySelector('#messages-list'),
          rootMargin: `${this.scrollDistance}px`,
          threshold: 0
        }

        this.observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            const isTop = entry.target.id === 'infinite-loader-messages-top'
            const scrollDirection = isTop ? 'top' : 'bottom'

            if (entry.isIntersecting) {
              this.loadMoreMessages(scrollDirection)
            }
          })
        }, options)

        loaderBottom && this.observer.observe(loaderBottom)
        loaderTop && this.observer.observe(loaderTop)
      }
    },
    preventTopScroll() {
      const container = this.$refs.scrollContainer
      const prevScrollHeight = container.scrollHeight

      const observer = new ResizeObserver(_ => {
        if (container.scrollHeight !== prevScrollHeight) {
          if (this.$refs.scrollContainer) {
            this.$refs.scrollContainer.scrollTo({
              top: container.scrollHeight - prevScrollHeight
            })
            observer.disconnect()
          }
        }
      })

      for (var i = 0; i < container.children.length; i++) {
        observer.observe(container.children[i])
      }
    },
    touchStart(touchEvent) {
      if (this.singleRoom) return

      if (touchEvent.changedTouches.length === 1) {
        const posXStart = touchEvent.changedTouches[0].clientX
        const posYStart = touchEvent.changedTouches[0].clientY

        addEventListener(
          'touchend',
          touchEvent => this.touchEnd(touchEvent, posXStart, posYStart),
          { once: true }
        )
      }
    },
    touchEnd(touchEvent, posXStart, posYStart) {
      if (touchEvent.changedTouches.length === 1) {
        const posXEnd = touchEvent.changedTouches[0].clientX
        const posYEnd = touchEvent.changedTouches[0].clientY

        const swippedRight = posXEnd - posXStart > 100
        const swippedVertically = Math.abs(posYEnd - posYStart) > 50

        if (swippedRight && !swippedVertically) {
          this.$emit('toggle-rooms-list')
        }
      }
    },
    onRoomChanged() {
      this.updateIsLoadingInitialMessages(true)
      this.scrollIcon = false
      this.scrollMessagesCount = 0
      this.resetMessageSelection()

      if (!isNaN(parseInt(this.roomId)) && !this.overlayInitialized) {
        const uploadOverlay = new FileUploaderOverlay()
        uploadOverlay.init()
        this.overlayInitialized = true
      }

      const unwatch = this.$watch(
        () => this.messages,
        val => {
          if (!val || !val.length) return

          const element = this.$refs.scrollContainer
          if (!element) return

          unwatch()

          setTimeout(() => {
            element.scrollTo({ top: element.scrollHeight })
            this.updateIsLoadingInitialMessages(false)
          })
        }
      )
    },
    resetMessageSelection() {
      this.messageSelectionEnabled = false
      this.selectedMessages = []
    },
    selectMessage(message) {
      this.selectedMessages.push(message)
    },
    unselectMessage(messageId) {
      this.selectedMessages = this.selectedMessages.filter(
        message => message._id !== messageId
      )
    },
    onMessageAdded({ message, index, ref }) {
      if (index !== this.messages.length - 1) return

      const autoScrollOffset = ref.offsetHeight + 60

      setTimeout(() => {
        const scrollContainer = this.$refs.scrollContainer
        let scrolledUp = false

        if (scrollContainer) {
          scrolledUp = this.getBottomScroll(scrollContainer) > autoScrollOffset
        }

        if (message.senderId === this.currentUserId) {
          if (message._id !== message.indexId) {
            return
          }

          if (scrolledUp) {
            if (this.autoScroll.send.newAfterScrollUp) {
              this.scrollToBottom()
            }
          } else {
            if (this.autoScroll.send.new) {
              this.scrollToBottom()
            }
          }
        } else {
          if (scrolledUp) {
            if (this.autoScroll.receive.newAfterScrollUp) {
              this.scrollToBottom()
            } else {
              this.scrollIcon = true
              this.scrollMessagesCount++
            }
          } else {
            if (this.autoScroll.receive.new) {
              this.scrollToBottom()
            } else {
              this.scrollIcon = true
              this.scrollMessagesCount++
            }
          }
        }
      })
    },
    onContainerScroll(e) {
      if (!e.target) return

      const bottomScroll = this.getBottomScroll(e.target)
      if (bottomScroll < 60) this.scrollMessagesCount = 0
      this.scrollIcon = bottomScroll > 500 || this.scrollMessagesCount
    },
    loadMoreMessages(scrollDirection) {
      if (this.isLoadingInitialMessages) return

      setTimeout(
        () => {
          const isScrollingTop = scrollDirection === 'top'

          const shouldStopLoadingTop = isScrollingTop && (this.messagesLoadedTop || !this.roomId)
          const shouldStopLoadingBottom = !isScrollingTop && (this.messagesLoadedBottom || !this.roomId)

          if (shouldStopLoadingTop || shouldStopLoadingBottom) {
            return
          }

          const scrollEventName = isScrollingTop ? 'fetch-messages-top' : 'fetch-messages-bottom'

          if (isScrollingTop) {
            this.preventTopScroll()
          }

          this.$emit(scrollEventName)
        },
        // prevent scroll bouncing speed
        500
      )
    },
    async messageActionHandler({ action, message }) {
      switch (action.name) {
      case 'replyMessage':
        this.initReplyMessage = message
        setTimeout(() => {
          this.initReplyMessage = null
        })
        return
      case 'editMessage':
        const tempMessage = { ...message }
        tempMessage.files = []
        this.initEditMessage = tempMessage
        setTimeout(() => {
          this.initEditMessage = null
        })
        return
      case 'deleteMessage':
        return this.$emit('delete-message', message)
      case 'selectMessages':
        this.selectedMessages = [message]
        this.messageSelectionEnabled = true
        return
      case 'copyMessage':
        if (!message?.content) {
          return
        }

        await navigator.clipboard.writeText(message?.content)
        return
      default:
        return this.$emit('message-action-handler', { action, message })
      }
    },
    messageSelectionActionHandler(action) {
      this.$emit('message-selection-action-handler', {
        action,
        messages: this.selectedMessages
      })
      this.resetMessageSelection()
    },
    sendMessageReaction(messageReaction) {
      this.$emit('send-message-reaction', messageReaction)
    },

    messageReactionClick(messageReaction) {
      this.$emit('message-reaction-click', messageReaction)
    },

    getBottomScroll(element) {
      const { scrollHeight, clientHeight, scrollTop } = element
      return scrollHeight - clientHeight - scrollTop
    },
    scrollToBottom() {
      setTimeout(() => {
        const element = this.$refs.scrollContainer
        if (element) {
          element.classList.add('vac-scroll-smooth')
          element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
          setTimeout(() => element.classList.remove('vac-scroll-smooth'))
        }
      }, 50)
    },
    openUserTag(user) {
      this.$emit('open-user-tag', user)
    },
    onDropFiles(event) {
      if (this.showFiles) {
        this.droppedFiles = event.dataTransfer.files
      }
    },
    handleContextMenuOpened(event) {
      this.closeMessageContextMenu()
      nextTick(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        this.messageContextMenu = { state: 'opened', messageId: event.messageId }
      })
    },
    closeMessageContextMenu() {
      this.messageContextMenu = { state: 'closed', messageId: null }
    }
  }
}
</script>
