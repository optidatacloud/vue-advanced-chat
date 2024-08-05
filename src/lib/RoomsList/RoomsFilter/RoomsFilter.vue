<template>
  <div class="vac-rooms-filter-container">
    <div
      v-for="option in filterOptions" :key="option.name"
      class="vac-filter-option"
      :class="{ 'vac-filter-selected': isFilterSelected(option.name) }"
      @click.prevent.stop="setFilterOption(option.name)"
    >
      <span class="vac-filter-option-name" v-html="translate(option.label)" />
      <!-- <span class="vac-filter-option-counter" v-html="option.counter" /> -->
      <!-- <div v-if="option.hasUnreadMessage" class="vac-has-unread-message" :title="translate('You have unread messages')" /> -->
    </div>
  </div>
</template>

<script>

import { translate } from '../../../utils/i18n'

export default {
  name: 'RoomsFilter',

  components: { },

  props: {
    unreadRooms: { type: Array, default: () => [] },
    archivedRooms: { type: Array, default: () => [] },
    groupRooms: { type: Array, default: () => [] },
    rooms: { type: Array, default: () => [] }
  },

  emits: [
    'filter-rooms',
    'click-archived-rooms',
    'click-unread-rooms',
    'click-group-rooms',
    'reset-filter-rooms'
  ],

  data() {
    return {
      previousOption: 'all',
      filterSelected: 'all',
      filterOptions: {
        'all': {
          name: 'all',
          label: 'All',
          counter: null,
          hasUnreadMessage: null
        },
        'unread': {
          name: 'unread',
          label: 'Unread',
          counter: null,
          hasUnreadMessage: null
        },
        'group': {
          name: 'group',
          label: 'Group',
          counter: null,
          hasUnreadMessage: null
        },
        'archived': {
          name: 'archived',
          label: 'Archived',
          counter: null,
          hasUnreadMessage: null
        }
      }
    }
  },

  computed: { },

  watch: {
    unreadRooms() {
      this.filterOptions['unread'].counter = this.unreadRooms.length
      this.filterOptions['unread'].hasUnreadMessage = this.unreadRooms.length > 0

      if (this.unreadRooms.length > 0) {
        this.filterOptions['all'].hasUnreadMessage = true
      }
    },
    archivedRooms() {
      this.filterOptions['archived'].counter = this.archivedRooms.length
    },
    groupRooms() {
      this.filterOptions['group'].counter = this.groupRooms.length
    },
    rooms() {
      this.filterOptions['all'].counter = this.rooms.length
    }
  },

  mounted() { },

  methods: {
    isFilterSelected(option) {
      return option === this.filterSelected
    },
    resetFilterApplied() {
      this.setFilterOption('all')
      this.deselectPreviousOption()
    },
    deselectPreviousOption() {
      if (!this.previousOption || this.previousOption === 'all') {
        return
      }

      switch (this.previousOption) {
      case 'archived':
        this.$emit('click-archived-rooms')
        break
      case 'unread':
        this.$emit('click-unread-rooms')
        break
      case 'group':
        this.$emit('click-group-rooms')
        break
      case 'all':
      default:
        break
      }
      this.previousOption = null
    },
    setFilterOption(option) {
      if (this.filterSelected === 'all' && option === 'all') {
        return
      }

      if (this.filterSelected === option) {
        this.resetFilterApplied()
        return
      } else {
        this.previousOption = this.filterSelected
        this.filterSelected = option
      }

      switch (option) {
      case 'archived':
        this.$emit('click-archived-rooms')
        break
      case 'unread':
        this.$emit('click-unread-rooms')
        break
      case 'group':
        this.$emit('click-group-rooms')
        break
      default:
        this.$emit('reset-filter-rooms')
        break
      }
      this.deselectPreviousOption()
    },
    translate(str) {
      return translate(str)
    }
  }
}
</script>
