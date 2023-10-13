<template>
	<transition-group v-if="!message.deleted" name="vac-slide-left" tag="span">
    <div class="vac-message-reactions-container" :class="{'message-me' : message.senderId === currentUserId}">
      <div
        class="vac-reactions-container"
>
      <span
        v-for="(reaction, key) in message.reactions"
        v-show="reaction.length"
        :key="key + 0"
        class="vac-reactions"
        @click="sendMessageReaction({ unicode: key }, reaction)"
      >
			{{ key }}
		</span>
        <span v-if="getTotalReactionCount() > 1" class="reaction-counter">{{ getTotalReactionCount() }}</span>
      </div>
    </div>
</transition-group>
</template>

<script>
export default {
	name: 'MessageReactions',

	props: {
		currentUserId: { type: [String, Number], required: true },
		message: { type: Object, required: true }
	},

	emits: ['send-message-reaction'],

	methods: {
		sendMessageReaction(emoji, reaction) {
			this.$emit('send-message-reaction', { emoji, reaction })
		},
    getTotalReactionCount() {
      if (!this.$props.message.reactions || typeof this.$props.message.reactions !== 'object') {
        return 0
      }

      const reactionArrays = Object.values(this.$props.message.reactions)
      return reactionArrays.reduce((count, reactionArray) => count + reactionArray.length, 0)
    }
	}
}
</script>
