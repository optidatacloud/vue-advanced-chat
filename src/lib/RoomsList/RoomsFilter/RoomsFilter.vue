<template>
  <div class="vac-rooms-filter-container">
    <div
      v-for="option in filterOptions" :key="option.name"
      class="vac-filter-option"
      :class="{ 'vac-filter-selected': isOptionSelected(option.name) }"
      @click.prevent.stop="setFilterOption(option.name)"
    >
      <span class="vac-filter-option-name" v-html="translate(option.label)" />
    </div>
  </div>
</template>

<script>

import { translate } from '../../../utils/i18n'

export default {
  name: 'RoomsFilter',

  components: { },

  props: {
    roomFilterSelected: { type: String, required: true }
  },

  emits: [
    'filter-rooms',
    'click-archived-rooms',
    'click-unread-rooms',
    'click-group-rooms',
    'reset-filter-rooms',
    'set-room-filter-selected'
  ],

  data() {
    return {
      previousOption: 'all',
      filterOptions: [
        { name: 'all', label: 'All' },
        { name: 'unread', label: 'Unread' },
        { name: 'groups', label: 'Groups' },
        { name: 'archived', label: 'Archived' }
      ]
    }
  },

  computed: { },

  watch: { },

  mounted() { },

  methods: {
    isOptionSelected(option) {
      return option === this.roomFilterSelected
    },
    resetFilterApplied() {
      this.setFilterOption('all')
      this.deselectPreviousOption()
    },
    deselectPreviousOption() {
      if (!this.previousOption || this.previousOption === 'all') {
        return
      }

      this.sendCorrectSignal(this.previousOption)
      this.previousOption = null
    },
    setFilterOption(option) {
      if (this.roomFilterSelected === 'all' && option === 'all') {
        return
      }

      if (this.roomFilterSelected === option) {
        this.resetFilterApplied()
        return
      } else {
        this.previousOption = this.roomFilterSelected
        this.$emit('set-room-filter-selected', option)
      }

      this.sendCorrectSignal(option)
      this.deselectPreviousOption()
    },
    translate(str) {
      return translate(str)
    },
    sendCorrectSignal(option) {
      let signalToEmit = ''
      switch (option) {
      case 'archived':
        signalToEmit = 'click-archived-rooms'
        break
      case 'unread':
        signalToEmit = 'click-unread-rooms'
        break
      case 'groups':
        signalToEmit = 'click-group-rooms'
        break
      case 'all':
      default:
        signalToEmit = 'reset-filter-rooms'
        break
      }
      this.$emit(signalToEmit)
    }
  }
}
</script>
