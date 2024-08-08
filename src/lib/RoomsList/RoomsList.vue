<template>
  <div
    v-show="showRoomsList"
    class="vac-rooms-container"
    :class="{
      'vac-rooms-container-full': isMobile,
      'vac-app-border-r': !isMobile
    }"
  >
    <slot name="rooms-header" />

    <slot name="rooms-list-search">
      <rooms-search
        :text-messages="textMessages"
        :show-search="showSearch"
        :show-add-room="showAddRoom"
        @search-room="searchRoom"
        @add-room="$emit('add-room')"
      >
        <template v-for="(idx, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </rooms-search>

      <rooms-filter
        :unread-rooms="unreadRooms"
        :archived-rooms="archivedRooms"
        :group-rooms="groupRooms"
        :rooms="rooms"
        :room-filter-selected="roomFilterSelected"
        @click-archived-rooms="$emit('click-archived-rooms', !showArchivedRooms)"
        @click-unread-rooms="$emit('click-unread-rooms', !showUnreadRooms)"
        @click-group-rooms="$emit('click-group-rooms', !showGroupRooms)"
        @set-room-filter-selected="$emit('set-room-filter-selected', $event)"
        @reset-filter-rooms="handleResetFilterRooms"
      />
    </slot>

    <loader :show="loadingRooms" type="rooms">
      <template v-for="(idx, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </loader>

    <!-- Displayed when user searches for something and result it's empty -->
    <div v-if="!loadingRooms && roomsQuery.length && !customSearchRooms.length && !roomsToDisplay.length" class="vac-rooms-empty xesquedele pinto">
      <slot name="rooms-empty">
        {{ textMessages.ROOMS_EMPTY }}
      </slot>
    </div>

    <!-- Displayed when user has no archived rooms -->
    <div v-if="!loadingRooms && !roomsQuery.length && showArchivedRooms && !archivedRooms.length" class="vac-rooms-empty">
      <slot name="rooms-empty">
        {{ textMessages.ARCHIVED_ROOMS_EMPTY }}
      </slot>
    </div>
    <!-- Displayed when user has no unread rooms -->
    <div v-else-if="!loadingRooms && !roomsQuery.length && showUnreadRooms && !unreadRooms.length" class="vac-rooms-empty">
      <slot name="rooms-empty">
        {{ textMessages.UNREAD_ROOMS_EMPTY }}
      </slot>
    </div>
    <!-- Displayed when user has no group rooms -->
    <div v-else-if="!loadingRooms && !roomsQuery.length && showGroupRooms && !groupRooms.length" class="vac-rooms-empty">
      <slot name="rooms-empty">
        {{ textMessages.GROUP_ROOMS_EMPTY }}
      </slot>
    </div>

    <div v-if="!loadingRooms && roomsToDisplay.length" id="rooms-list" class="vac-room-list">
      <transition-group :name="roomListTransition">
        <div
          v-for="fRoom in roomsToDisplay"
          :id="fRoom.roomId"
          :key="fRoom.roomId"
          class="vac-room-item"
          :class="{
            'vac-room-selected': selectedRoomId === fRoom.roomId && !shouldShowCallContent(fRoom),
            'vac-ongoing-call': shouldShowCallContent(fRoom)
          }"
          @click="openRoom(fRoom)"
        >
          <room-call-content
            v-if="shouldShowCallContent(fRoom)"
            :current-user-id="currentUserId"
            :room="fRoom"
            :call="call"
            :text-messages="textMessages"
            @accept-call="$emit('accept-call', $event)"
            @hang-up-call="$emit('hang-up-call', $event)"
            @return-to-call="$emit('return-to-call', $event)"
          />
          <room-content
            v-else
            :current-user-id="currentUserId"
            :room="fRoom"
            :text-formatting="textFormatting"
            :link-options="linkOptions"
            :text-messages="textMessages"
            :selected-room-id="selectedRoomId"
            :room-actions="roomActions"
            @room-action-handler="$emit('room-action-handler', $event)"
          >
            <template v-for="(idx, name) in $slots" #[name]="data">
              <slot :name="name" v-bind="data" />
            </template>
          </room-content>
        </div>
      </transition-group>
      <transition name="vac-fade-message">
        <div v-if="noRoomToShow && !loadingRooms" id="infinite-loader-rooms">
          <loader :show="showLoader" :infinite="true" type="infinite-rooms">
            <template v-for="(idx, name) in $slots" #[name]="data">
              <slot :name="name" v-bind="data" />
            </template>
          </loader>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Loader from '../../components/Loader/Loader'

import RoomsSearch from './RoomsSearch/RoomsSearch'
import RoomsFilter from './RoomsFilter/RoomsFilter'
import RoomContent from './RoomContent/RoomContent'
import RoomCallContent from './RoomCallContent/RoomCallContent'

import filteredItems from '../../utils/filter-items'

export default {
  name: 'RoomsList',
  components: {
    Loader,
    RoomsSearch,
    RoomsFilter,
    RoomContent,
    RoomCallContent
  },

  props: {
    currentUserId: { type: [String, Number], required: true },
    textMessages: { type: Object, required: true },
    showRoomsList: { type: Boolean, required: true },
    showSearch: { type: Boolean, required: true },
    showAddRoom: { type: Boolean, required: true },
    textFormatting: { type: Object, required: true },
    linkOptions: { type: Object, required: true },
    isMobile: { type: Boolean, required: true },
    rooms: { type: Array, required: true },
    archivedRooms: { type: Array, required: true },
    customSearchRooms: { type: Array, required: false, default: () => [] },
    unreadRooms: { type: Array, required: true },
    groupRooms: { type: Array, required: true },
    loadingRooms: { type: Boolean, required: true },
    roomsLoaded: { type: Boolean, required: true },
    room: { type: Object, required: true },
    customSearchRoomEnabled: { type: [Boolean, String], default: false },
    roomActions: { type: Array, required: true },
    scrollDistance: { type: Number, required: true },
    call: { type: Object, required: true },
    showArchivedRooms: { type: Boolean, required: true, default: false },
    showUnreadRooms: { type: Boolean, required: true, default: false },
    showGroupRooms: { type: Boolean, required: true, default: false },
    roomFilterSelected: { type: String, required: true }
  },

  emits: [
    'add-room',
    'search-room',
    'room-action-handler',
    'loading-more-rooms',
    'fetch-room',
    'fetch-more-rooms',
    'accept-call',
    'hang-up-call',
    'return-to-call',
    'click-archived-rooms',
    'click-unread-rooms',
    'click-group-rooms',
    'reset-filter-rooms',
    'set-room-filter-selected'
  ],

  data() {
    return {
      filteredRooms: [],
      observer: null,
      showLoader: true,
      loadingMoreRooms: false,
      selectedRoomId: '',
      roomsQuery: ''
    }
  },

  computed: {
    noRoomToShow() {
      return (
        !this.rooms.length &&
        !this.archivedRooms.length &&
        !this.unreadRooms.length &&
        !this.groupRooms.length &&
        !this.customSearchRooms.length
      )
    },
    roomsToDisplay() {
      if (!this.roomsQuery.length) {
        if (this.showUnreadRooms) {
          return this.unreadRooms
        }
        if (this.showArchivedRooms) {
          return this.archivedRooms
        }
        if (this.showGroupRooms) {
          return this.groupRooms
        }
        return this.rooms
      }

      if (this.customSearchRoomEnabled) {
        return this.customSearchRooms
      }

      return this.filteredRooms
    },
    roomListTransition() {
      if (this.showArchivedRooms) {
        return 'rooms-archived'
      }
      if (this.showUnreadRooms) {
        return 'rooms-unread'
      }
      if (this.showGroupRooms) {
        return 'rooms-group'
      }
      return 'rooms'
    }
  },

  watch: {
    rooms: {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal.length !== oldVal.length || this.roomsLoaded) {
          this.loadingMoreRooms = false
        }
      }
    },
    loadingRooms(val) {
      if (!val) {
        setTimeout(() => this.initIntersectionObserver())
      }
    },
    loadingMoreRooms(val) {
      this.$emit('loading-more-rooms', val)
    },
    roomsLoaded: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadingMoreRooms = false
          if (!this.loadingRooms) {
            this.showLoader = false
          }
        } else {
          this.showLoader = true
        }
      }
    },
    room: {
      immediate: true,
      handler(val) {
        if (val && !this.isMobile) this.selectedRoomId = val.roomId
      }
    },
    /**
     * If user change rooms view, then reset the search.
     */
    showArchivedRooms() {
      this.resetRoomsQueryAndInitObserver()
    },
    showUnreadRooms() {
      this.resetRoomsQueryAndInitObserver()
    },
    showGroupRooms() {
      this.resetRoomsQueryAndInitObserver()
    }
  },

  methods: {
    resetRoomsQueryAndInitObserver() {
      this.roomsQuery = ''
      setTimeout(() => this.initIntersectionObserver())
    },
    handleResetFilterRooms() {
      this.$emit('set-room-filter-selected', 'all')
      this.$emit('click-archived-rooms', false)
      this.$emit('click-unread-rooms', false)
      this.$emit('click-group-rooms', false)
    },
    initIntersectionObserver() {
      if (this.observer) {
        this.showLoader = true
        this.observer.disconnect()
      }

      const loader = this.$el.querySelector('#infinite-loader-rooms')

      if (loader) {
        const options = {
          root: this.$el.querySelector('#rooms-list'),
          rootMargin: `${this.scrollDistance}px`,
          threshold: 0
        }

        this.observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            this.loadMoreRooms()
          }
        }, options)

        this.observer.observe(loader)
      }
    },
    searchRoom(ev) {
      this.roomsQuery = ev.target.value
      if (this.customSearchRoomEnabled) {
        this.$emit('search-room', ev.target.value)
      } else {
        this.filteredRooms = filteredItems(
          this.rooms,
          ['roomName', 'email'],
          ev.target.value
        )
      }
    },
    openRoom(room) {
      this.roomsQuery = ''
      if (room.roomId === this.room.roomId && !this.isMobile) return
      if (!this.isMobile) this.selectedRoomId = room.roomId
      this.$emit('fetch-room', { room })
    },
    loadMoreRooms() {
      if (this.loadingMoreRooms) return

      if (this.roomsLoaded) {
        this.loadingMoreRooms = false
        this.showLoader = false
        return
      }

      this.$emit('fetch-more-rooms')
      this.loadingMoreRooms = true
    },
    shouldShowCallContent: function(room) {
      const hasCallEnded = room.call && room.call.statusEnded
      const canAcceptCall = room.call && !room.call.attendance.statusCallEnded && !room.call.attendance.statusDeclined

      return !hasCallEnded && canAcceptCall
    }
  }
}
</script>
