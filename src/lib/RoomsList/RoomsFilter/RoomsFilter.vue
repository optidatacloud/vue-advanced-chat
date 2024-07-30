<template>
  <div class="vac-rooms-filter-container">
    <div
      v-for="option in filterOptions" :key="option"
      class="vac-filter-option"
      :class="{ 'vac-filter-selected': isFilterSelected(option.name) }"
      @click="setFilterOption(option.name)"
    >
      <span class="vac-filter-option-name" v-html="translate(option.name)" />
      <span class="vac-filter-option-counter" v-html="option.counter" />
      <div v-if="option.hasUnreadMessage" class="vac-has-unread-message" />
    </div>
  </div>
</template>

<script>

import { translate } from '../../../utils/i18n'

export default {
  name: 'RoomsFilter',
  // components: {
  // },

  // props: {
  // },

  emits: [
    'filter-rooms'
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
        'groups': {
          name: 'groups',
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

  // computed: {
  // },

  watch: {
    filterSelected() {
      console.log(`filterSelected: ${this.filterSelected}`)
      // this.$emit('filter-rooms', this.filterSelected)
    }
  },

  mounted() {
    this.checkUnreadMessages()
    this.checkRoomsCounter()
  },

  methods: {
    isFilterSelected(option) {
      return option === this.filterSelected
    },
    setFilterOption(option) {
      this.filterSelected = option
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

      if (this.filterOptions['groups'].hasUnreadMessage || this.filterOptions['unread'].hasUnreadMessage) {
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
        Number(this.filterOptions['groups'].counter) + Number(this.filterOptions['unread'].counter)
      )
    }
  }
}
</script>
