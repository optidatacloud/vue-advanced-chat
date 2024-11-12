<template>
    <div :data-type="type" :data-url="message.hero_url || ':url'" class="position-relative">
        <a :href="message.hero_url || ':url'" target="_blank" class="stretched-link" />
        <div class="rounded position-relative overflow-hidden">
            <div v-if="message.meta['og:image']">
                <img loading="lazy" :src="message.meta['og:image']" class="img-fluid rounded w-100 max-vh-40" />

                <div class="link-hero-overlay position-absolute bottom-0 p-1 w-100">
                    <!-- title -->
                    <div class="row">
                        <h5 class="text-white fw-bold text-truncate">
                            {{ message.meta['og:title'] || '' }}
                        </h5>
                    </div>
                    <!-- description -->
                    <div class="row d-none d-md-block">
                        <div class="col-12">
                            <p class="text-muted text-truncate">
                                {{ message.meta['og:description'] || message.hero_url || ':url' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="link-hero-short p-1 w-100">
                <div class="row">
                    <!-- url -->
                    <div class="text-muted">
                        {{ message.hero_url || ':url' }}
                    </div>
                    <!-- description -->
                    <div class="text-truncate link-hero-short-description">
                        {{ message.meta['og:description'] || '' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'HeroLink',

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
