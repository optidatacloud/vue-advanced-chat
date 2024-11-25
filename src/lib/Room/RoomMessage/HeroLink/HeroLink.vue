<template>
    <div :data-type="type" :data-url="opengraph.url || ':url'" class="position-relative">
        <a :href="opengraph.url || ':url'" target="_blank" class="stretched-link" />
        <div class="rounded position-relative overflow-hidden">
            <div v-if="opengraph.image">
                <img loading="lazy" :src="opengraph.image" class="img-fluid rounded w-100 max-vh-40" />

                <div class="link-hero-overlay position-absolute bottom-0 p-1 w-100">
                    <!-- title -->
                    <div class="row">
                        <h5 class="text-white fw-bold text-truncate">
                            {{ opengraph.title || '' }}
                        </h5>
                    </div>
                    <!-- description -->
                    <div class="row d-none d-md-block">
                        <div class="col-12">
                            <p class="text-muted text-truncate">
                                {{ opengraph.description || opengraph.url || ':url' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="link-hero-short p-1 w-100">
                <div class="row">
                    <!-- url -->
                    <div class="text-muted">
                        {{ opengraph.url || ':url' }}
                    </div>
                    <!-- description -->
                    <div class="text-truncate link-hero-short-description">
                        {{ opengraph.description || '' }}
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
    opengraph: { type: Object, required: true }
  },

  emits: [

  ],

  data() {
    return {

    }
  },

  watch: {
    // opengraph: {
    //   handler() {
    //     console.log('opengraph', this.opengraph)
    //     alert('aqui')
    //   },
    //   deep: true
    // }
  },

  methods: {}
}

</script>

<style>
</style>
