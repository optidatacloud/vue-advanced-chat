<template>
  <transition name="vac-slide-up">
    <div v-if="filteredUsersTag.length" class="vac-tags-container">
      <div
        v-for="(user, index) in filteredUsersTag"
        :key="user._id"
        class="vac-tags-box"
        :class="{ 'vac-tags-box-active': index === activeItem }"
        @mouseover="activeItem = index"
        @click="$emit('select-user-tag', user)"
      >
        <div class="vac-tags-info">
          <img v-show="user.avatar" :src="user.avatar" class="vac-avatar vac-tags-avatar" />
          <div class="vac-tags-username">
            {{ user.username }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'RoomUsersTag',

  props: {
    filteredUsersTag: { type: Array, required: true },
    selectItem: { type: Boolean, default: null },
    activeUpOrDown: { type: Number, default: null }
  },

  emits: ['select-user-tag', 'activate-item'],

  data() {
    return {
      activeItem: null
    }
  },

  watch: {
    filteredUsersTag(val, oldVal) {
      if (!oldVal.length || val.length !== oldVal.length) {
        this.activeItem = 0
      }
    },
    selectItem(val) {
      if (val) {
        this.$emit('select-user-tag', this.filteredUsersTag[this.activeItem])
      }
    },
    activeUpOrDown() {
      if (
        this.activeUpOrDown > 0 &&
        this.activeItem < this.filteredUsersTag.length - 1
      ) {
        this.activeItem++
      } else if (this.activeUpOrDown < 0 && this.activeItem > 0) {
        this.activeItem--
      }
      this.$emit('activate-item')
    }
  }
}
</script>
