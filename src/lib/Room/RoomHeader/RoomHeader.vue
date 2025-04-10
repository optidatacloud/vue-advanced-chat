<template>
  <div class="vac-room-header vac-app-border-b">
    <slot name="room-header">
      <div class="vac-room-wrapper">
        <transition name="vac-slide-up">
          <div v-if="messageSelectionEnabled" class="vac-room-selection">
            <div
              class="vac-selection-cancel"
              @click="$emit('cancel-message-selection')"
            >
              <span class="x-icon vac-item-clickable">
                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" fill="currentColor" enable-background="new 0 0 24 24" xml:space="preserve">
                  <path d="M19.6004 17.2L14.3004 11.9L19.6004 6.60005L17.8004 4.80005L12.5004 10.2L7.20039 4.90005L5.40039 6.60005L10.7004 11.9L5.40039 17.2L7.20039 19L12.5004 13.7L17.8004 19L19.6004 17.2Z" />
                </svg>
              </span>

              <div class="vac-selection-count-container">
                <span class="vac-selection-button-count">
                  {{ selectedMessagesTotal }}
                </span>
                {{ textMessages.COUNT_SELECT_MESSAGE }}
              </div>
            </div>
            <div
              v-for="action in messageSelectionActions"
              :id="action.name"
              :key="action.name"
            >
              <div v-if="action.name === 'forwardMessages'" class="vac-item-clickable forward-messages" :title="action.title" @click="messageSelectionActionHandler(action)">
                  <button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send">
                      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
                      <path d="m21.854 2.147-10.94 10.939"/>
                    </svg>
                    <span>{{ translate('Forward') }}</span>
                  </button>
              </div>

              <div
                v-else
                class="vac-selection-button"
                @click="messageSelectionActionHandler(action)"
              >
                {{ action.title }}
              </div>
            </div>
          </div>
        </transition>
        <template
          v-if="!messageSelectionEnabled && messageSelectionAnimationEnded"
        >
          <div
            v-if="!singleRoom"
            class="vac-svg-button vac-toggle-button"
            :class="{
              'vac-rotate-icon-init': !isMobile,
              'vac-rotate-icon': !showRoomsList && !isMobile
            }"
            @click="$emit('toggle-rooms-list')"
          >
            <slot name="toggle-icon">
              <svg-icon name="toggle" />
            </slot>
          </div>
          <div
            class="vac-info-wrapper"
            :class="{ 'vac-item-clickable': roomInfoEnabled }"
            @click="$emit('room-info')"
          >
            <slot name="room-header-avatar">
              <img v-show="room.avatar" :src="room.avatar" class="vac-avatar" />
            </slot>
            <slot name="room-header-info">
              <div class="vac-text-ellipsis">
                <div class="vac-room-name vac-text-ellipsis">
                  {{ room.roomName }}
                  <i v-if="room.whatsappGroupId" class="bi bi-whatsapp" />
                </div>
                <div v-if="typingUsers" class="vac-room-info vac-text-ellipsis">
                  {{ typingUsers }}
                </div>
                <div v-else-if="room.roomInfo" class="vac-room-info vac-text-ellipsis">
                  <span v-if="room.whatsappGroupId">
                    {{ translate('Integrated with WhatsApp.') }}
                  </span>
                  {{ room.roomInfo }}
                </div>
                <div v-else class="vac-room-info vac-text-ellipsis">
                  {{ userStatus }}
                </div>
              </div>
            </slot>
          </div>
          <slot v-if="room.roomId" name="room-options">
            <div
              v-if="menuActions.length"
              class="vac-svg-button vac-room-options"
              @click="menuOpened = !menuOpened"
            >
              <slot name="menu-icon">
                <svg-icon name="menu" />
              </slot>
            </div>
            <transition v-if="menuActions.length" name="vac-slide-left">
              <div
                v-if="menuOpened"
                v-click-outside="closeMenu"
                class="vac-menu-options"
              >
                <div class="vac-menu-list">
                  <div v-for="action in menuActions" :key="action.name">
                    <div
                      class="vac-menu-item"
                      @click="menuActionHandler(action)"
                    >
                      {{ action.title }}
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </slot>
        </template>
      </div>
      <div v-if="isCallInProgress" class="vac-room-call-ongoing" @click="returnToCallClick">
        <div class="vac-room-call-ongoing-info">
          <span v-if="isAttendanceAccepted" class="vac-room-call-ongoing-title">
            {{ textMessages.ROOM_CALL_RETURN_TO_CALL }}
          </span>
          <span v-else-if="isAttendancePending || isAttendanceDeclined" class="vac-room-call-ongoing-title">
            {{ textMessages.ROOM_CALL_JOIN }}
          </span>
          <span v-else class="vac-room-call-ongoing-title">
            {{ textMessages.ROOM_CALL_ONGOING }}
          </span>
          <span class="vac-room-call-ongoing-duration">
            {{ callDuration ?? '--:--' }}
          </span>
        </div>
      </div>
    </slot>
  </div>
</template>

<script>
import SvgIcon from '../../../components/SvgIcon/SvgIcon'
import { translate } from '../../../utils/i18n'

import vClickOutside from '../../../utils/on-click-outside'
import typingText from '../../../utils/typing-text'

export default {
  name: 'RoomHeader',
  components: {
    SvgIcon
  },

  directives: {
    clickOutside: vClickOutside
  },

  props: {
    currentUserId: { type: [String, Number], required: true },
    textMessages: { type: Object, required: true },
    singleRoom: { type: Boolean, required: true },
    showRoomsList: { type: Boolean, required: true },
    isMobile: { type: Boolean, required: true },
    roomInfoEnabled: { type: Boolean, required: true },
    menuActions: { type: Array, required: true },
    room: { type: Object, required: true },
    messageSelectionEnabled: { type: Boolean, required: true },
    messageSelectionActions: { type: Array, required: true },
    selectedMessagesTotal: { type: Number, required: true },
    call: { type: Object, required: true }
  },

  emits: [
    'toggle-rooms-list',
    'room-info',
    'menu-action-handler',
    'cancel-message-selection',
    'message-selection-action-handler',
    'return-to-call'
  ],

  data() {
    return {
      menuOpened: false,
      messageSelectionAnimationEnded: true,
      callInterval: null,
      callDuration: null
    }
  },

  computed: {
    typingUsers() {
      return typingText(this.room, this.currentUserId, this.textMessages)
    },
    userStatus() {
      if (!this.room.users || this.room.users.length !== 2) return

      const user = this.room.users.find(u => u._id !== this.currentUserId)

      if (!user?.status) return

      let text = ''

      if (user.status.state === 'online') {
        text = this.textMessages.IS_ONLINE
      } else if (user.status.lastChanged) {
        text = this.textMessages.LAST_SEEN + user.status.lastChanged
      }

      return text
    },
    isCallInProgress() {
      return this.call && this.call.statusInProgress
    },
    isAttendancePending() {
      return this.call && this.call.attendance.statusPending
    },
    isAttendanceAccepted() {
      return this.call && this.call.attendance.statusAccepted
    },
    isAttendanceDeclined() {
      return this.call && this.call.attendance.statusDeclined
    }
  },

  watch: {
    messageSelectionEnabled(val) {
      if (val) {
        this.messageSelectionAnimationEnded = false
      } else {
        setTimeout(() => {
          this.messageSelectionAnimationEnded = true
        }, 300)
      }
    },
    isCallInProgress(value) {
      if (value) {
        this.setupCallDurationUpdate()
      } else {
        clearInterval(this.callInterval)
      }
    }
  },
  mounted() {
    if (this.isCallInProgress) {
      this.setupCallDurationUpdate()
    }
  },

  methods: {
    translate(str) {
      return translate(str)
    },
    menuActionHandler(action) {
      this.closeMenu()
      this.$emit('menu-action-handler', action)
    },
    closeMenu() {
      this.menuOpened = false
    },
    messageSelectionActionHandler(action) {
      this.$emit('message-selection-action-handler', action)
    },
    returnToCallClick() {
      this.$emit('return-to-call')
    },
    updateCallDuration() {
      if (!this.call) return
      const duration = (new Date() - new Date(this.call.startedAt)) / 1000
      const hours = String(Math.floor(duration / 3600)).padStart(2, '0')
      const minutes = String(Math.floor((duration % 3600) / 60)).padStart(2, '0')
      const seconds = String(Math.floor(duration % 60)).padStart(2, '0')
      this.callDuration = `${hours}:${minutes}:${seconds}`
    },
    setupCallDurationUpdate() {
      this.updateCallDuration()

      this.callInterval = setInterval(() => {
        this.updateCallDuration()
      }, 1000)
    }
  }
}
</script>
