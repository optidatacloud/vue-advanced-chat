<template>
  <div class="vac-room-container" :class="[ callStatusClass ]" @click="openRoom()">
    <div class="vac-room-info-container">
      <slot :name="'room-list-item_' + room.roomId">
        <slot :name="'room-list-avatar_' + room.roomId">
          <div v-if="room.avatar" class="vac-avatar" :style="{ 'background-image': `url('${room.avatar}')` }" />
        </slot>
      </slot>

      <div class="vac-name-container vac-text-ellipsis">
        <div class="vac-title-container">
          <div class="vac-room-name vac-text-ellipsis">
            {{ room.roomName }}
          </div>
        </div>
        <i v-if="!isCallInProgress" class="vac-text-last" style="color: #cccccc;">
          <span v-if="!isCurrentUserCaller">
            Incomming voice call
          </span>
          <span v-else>
            Calling...
          </span>
        </i>
        <i v-else class="vac-text-last" style="color: #cccccc;">
          <!-- <span>
            Call in progress
          </span> -->
          <span class="vac-call-timer">
            {{ callDuration ?? '--:--' }}
          </span>
        </i>
      </div>
    </div>

    <div class="vac-call-actions">
      <a v-if="!isCurrentUserCaller && !isCallInProgress" class="btn" role="button" href="#" @click.stop="acceptCall()">
        <i class="bi bi-telephone-fill" style="margin-right: 1rem;" />
      </a>
      <a class="btn btn-danger" role="button" href="#" @click.stop="hangUpCall()">
        <i class="bi bi-x-lg" />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomCallContent',

  props: {
    currentUserId: { type: [String, Number], required: true },
    room: { type: Object, required: true }
  },

  emits: [
    'accept-call',
    'hang-up-call',
    'open-room'
  ],

  data() {
    return {
      callDuration: null,
      callInterval: null
    }
  },

  computed: {
    isCurrentUserCaller() {
      return this.currentUserId === String(this.room.call.userId)
    },
    isCallPending() {
      return this.room.call.status === 0
    },
    isCallInProgress() {
      return this.room.call.status === 1
    },
    callStatusClass() {
      if (this.isCallInProgress) {
        return 'vac-room-call-in-progress'
      } else if (this.isCallPending) {
        return 'vac-room-call-pending'
      } else {
        return ''
      }
    }
  },

  watch: {
    isCallInProgress(value) {
      if (value) {
        this.updateCallDuration()
        this.callInterval = setInterval(() => {
          this.updateCallDuration()
        }, 1000)
      } else {
        clearInterval(this.callInterval)
      }
    }
  },

  methods: {
    acceptCall() {
      this.$emit('accept-call', this.room.call)
    },

    hangUpCall() {
      this.$emit('hang-up-call', this.room.call)
    },

    openRoom() {
      this.$emit('open-room')
    },

    updateCallDuration() {
      const duration = (new Date() - new Date(this.room.call.startedAt)) / 1000
      const minutes = String(Math.floor(duration / 60)).padStart(2, '0')
      const seconds = String(Math.floor(duration % 60)).padStart(2, '0')
      this.callDuration = `${minutes}:${seconds}`
    }
  }
}
</script>
