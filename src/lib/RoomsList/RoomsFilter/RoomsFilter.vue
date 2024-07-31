<template>
  <div class="vac-rooms-filter-container">
    <div
      v-for="option in filterOptions" :key="option.name"
      class="vac-filter-option"
      :class="{ 'vac-filter-selected': isFilterSelected(option.name) }"
      @click.prevent.stop="setFilterOption(option.name)"
    >
      <span class="vac-filter-option-name" v-html="translate(option.name)" />
      <!-- <span class="vac-filter-option-counter" v-html="option.counter" /> -->
      <div v-if="option.hasUnreadMessage" class="vac-has-unread-message" />
    </div>
  </div>
</template>

<script>

import { translate } from '../../../utils/i18n'

export default {
  name: 'RoomsFilter',

  components: { },

  props: { },

  emits: [
    'filter-rooms',
    'click-archived-rooms',
    'click-unread-rooms',
    'click-group-rooms',
    'reset-filter-rooms'
  ],

  data() {
    return {
      filterSelected: 'all',
      filterOptions: {
        'all': {
          name: 'all',
          counter: null,
          hasUnreadMessage: null
        },
        'unread': {
          name: 'unread',
          counter: null,
          hasUnreadMessage: null
        },
        'group': {
          name: 'group',
          counter: null,
          hasUnreadMessage: null
        },
        'archived': {
          name: 'archived',
          counter: null,
          hasUnreadMessage: null
        }
      }
    }
  },

  computed: { },

  watch: { },

  mounted() {
    this.checkUnreadMessages()
    this.checkRoomsCounter()
  },

  methods: {
    isFilterSelected(option) {
      return option === this.filterSelected
    },
    resetFilterApplied() {
      this.setFilterOption('all')
    },
    setFilterOption(option) {
      if (this.filterSelected === 'all' && option === 'all') {
        return
      }

      if (this.filterSelected === option) {
        this.resetFilterApplied()
      } else {
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
    },
    translate(str) {
      return translate(str)
    },
    checkUnreadMessages() {
      const options = Object.fromEntries(Object.entries(this.filterOptions).filter(([k, v]) => {
        return 	k !== 'all' && k !== 'archived'
      }))

      for (const option in options) {
        this.filterOptions[option].hasUnreadMessage = Math.random() > 0.5
      }

      if (this.filterOptions['group'].hasUnreadMessage || this.filterOptions['unread'].hasUnreadMessage) {
        this.filterOptions['all'].hasUnreadMessage = true
      }

      this.filterOptions['archived'].hasUnreadMessage = Math.random() > 0.5
    },
    checkRoomsCounter() {
      const options = Object.fromEntries(Object.entries(this.filterOptions).filter(([k, v]) => {
        return 	k !== 'all'
      }))

      for (const option in options) {
        this.filterOptions[option].counter = Math.floor(Math.random() * 10).toFixed(0)
      }

      this.filterOptions['all'].counter = (
        Number(this.filterOptions['group'].counter) + Number(this.filterOptions['unread'].counter)
      )
    }
  }
}
</script>
