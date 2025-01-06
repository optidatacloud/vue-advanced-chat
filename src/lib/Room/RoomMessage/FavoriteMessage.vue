<template>
    <room-message
      :current-user-id="currentUserId"
      :message="messageCasted"
      :index="index"
      :messages="messagesCasted"
      :edited-message-id="editedMessageId"
      :message-actions="messageActions"
      :room-users="roomUsers"
      :text-messages="textMessages"
      :new-messages="newMessages"
      :show-reaction-emojis="showReactionEmojis && room.isCurrentUserInRoom"
      :show-new-messages-divider="showNewMessagesDivider"
      :text-formatting="textFormatting"
      :link-options="linkOptions"
      :username-options="usernameOptions"
      :message-selection-enabled="messageSelectionEnabled"
      :selected-messages="selectedMessages"
      :emoji-data-source="emojiDataSource"
      :max-message-rows="maxMessageRows"
      :message-context-menu="messageContextMenu"
    />
</template>

<script>

import RoomMessage from './RoomMessage.vue'

export default {
  name: 'FavoriteMessage',

  components: {
    RoomMessage
  },

  props: {
    currentUserId: { type: [String, Number], required: true },
    textMessages: { type: Object, required: true },
    index: { type: Number, required: true },
    message: { type: String, required: true },
    messages: { type: String, required: true },
    editedMessageId: { type: [String, Number], default: null },
    roomUsers: { type: Array, default: () => [] },
    messageActions: { type: Array, required: true },
    newMessages: { type: Array, default: () => [] },
    showReactionEmojis: { type: Boolean, required: true },
    showNewMessagesDivider: { type: Boolean, required: true },
    textFormatting: { type: Object, required: true },
    linkOptions: { type: Object, required: true },
    usernameOptions: { type: Object, required: true },
    messageSelectionEnabled: { type: Boolean, required: true },
    selectedMessages: { type: Array, default: () => [] },
    emojiDataSource: { type: String, default: undefined },
    maxMessageRows: { type: Number, default: 0 },
    messageContextMenu: { type: Object, default: () => ({ state: 'closed', messageId: null }) }
  },

  computed: {
    messagesCasted() {
      return this.castArray(this.messages)
    },

    messageCasted() {
      return this.castArray(this.message)
    }
  },

  methods: {
    castArray(val) {
      return !val ? [] : Array.isArray(val) ? val : JSON.parse(val)
    }
  }
}

</script>
