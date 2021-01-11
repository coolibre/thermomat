<template>
  <v-dialog v-model="shown" persistent max-width="500px">
    <v-card height="100%">
      <v-card-title>
        <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'">{{
          title
        }}</span>
      </v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="$emit('yes')"
          >Yes</v-btn
        >
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="$emit('no')"
          >No</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ["title", "message", "shown"],
  data: () => ({}),
};
</script>
