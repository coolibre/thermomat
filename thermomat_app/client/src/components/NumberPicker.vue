<template>
  <div class="d-flex flex-column">
    <div class="d-flex flex-row justify-center">
      <v-btn dark fab small color="deep-orange darken-4" @click="plus">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
    <div class="hidden-xs-only display-4 text-center">{{ format(value) }}</div>
    <div class="hidden-sm-and-up display-1 text-center">
      {{ format(value) }}
    </div>
    <div class="d-flex flex-row justify-center">
      <v-btn dark fab small color="deep-orange darken-4" @click="minus">
        <v-icon>mdi-minus</v-icon>
      </v-btn>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    min: { default: 0 },
    max: { default: 100 },
    step: { default: 1 },
    format: { default: () => this.value },
    init: Number,
  },
  data: () => ({
    value: 0,
  }),
  created: function() {
    this.value = this.min;
  },
  methods: {
    plus() {
      const newVal = this.value + this.step;
      if (newVal <= this.max) this.value = newVal;
    },
    minus() {
      const newVal = this.value - this.step;
      if (newVal >= this.min) this.value = newVal;
    },
  },
  watch: {
    value: function(value) {
      this.$emit("input", value);
    },
    init: function(value) {
      this.value = value;
    },
  },
};
</script>
