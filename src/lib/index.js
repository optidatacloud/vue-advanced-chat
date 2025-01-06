import { defineCustomElement } from 'vue'
import ChatWindow from './ChatWindow'
import FavoriteMessage from './Room/RoomMessage/FavoriteMessage.vue'

export const VueAdvancedChat = defineCustomElement(ChatWindow)

const PACKAGE_NAME = 'vue-advanced-chat'

export function register() {
  if (!customElements.get(PACKAGE_NAME)) {
    customElements.define(PACKAGE_NAME, VueAdvancedChat)
  }

  if (!customElements.get('favorite-message')) {
    customElements.define('favorite-message', defineCustomElement(FavoriteMessage))
  }
}

console.warn('test')
