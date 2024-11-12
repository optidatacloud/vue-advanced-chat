
<template>
  <div :data-type="type" :data-url="message?.hero_url || ':url'" class="position-relative">
    <iframe :src="message?.hero_url || ':url'" class="w-100 rounded" style="height: 400px;" />
  </div>
</template>

<script>

export default {
  name: 'HeroLinkIframe',

  props: {
    message: { type: Object, required: true },
    type: { type: String, required: true }
  },

  emits: [

  ],

  data() {
    return {

    }
  },

  watch: {},

  methods: {}
}

</script>

<style>
</style>
