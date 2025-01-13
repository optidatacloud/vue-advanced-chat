import { defineCustomElement } from 'vue'

import ChatWindow from './ChatWindow'
import FormatMessage from '../components/FormatMessage/FormatMessage.vue'

export const FormatMessageComponent = defineCustomElement(FormatMessage)
export const VueAdvancedChat = defineCustomElement(ChatWindow)

const FORMAT_MESSAGE_PACKAGE_NAME = 'format-message-component'
const PACKAGE_NAME = 'vue-advanced-chat'

export function register() {
  if (!customElements.get(PACKAGE_NAME)) {
    customElements.define(PACKAGE_NAME, VueAdvancedChat)
  }
  if (!customElements.get(FORMAT_MESSAGE_PACKAGE_NAME)) {
    customElements.define(FORMAT_MESSAGE_PACKAGE_NAME, FormatMessageComponent)
  }
}
