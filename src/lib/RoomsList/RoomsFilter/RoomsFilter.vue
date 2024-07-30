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
  // components: {
  // },

  // props: {
  // },

  emits: [
    'filter-rooms',
    'click-archived-rooms'
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
    // filterSelected() {
    //   if (this.filterSelected === 'archived') {
    //     this.$emit('click-archived-rooms')
    //     return
    //   }

    //   console.log(`filterSelected: ${this.filterSelected}`)
    //   this.$emit('filter-rooms', this.filterSelected)
    // }
  },

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
      // console.log(`setFilterOption`)
      // console.log(`option clicked`, option)
      // console.log(`this.filterSelected`, this.filterSelected)

      if (this.filterSelected === 'all' && option === 'all') {
        return
      }

      if (this.filterSelected === option) {
        this.resetFilterApplied()
      } else {
        this.filterSelected = option
      }

      if (option === 'archived') {
        this.$emit('click-archived-rooms')
      }
      // this.$emit('click-outro-room')
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
