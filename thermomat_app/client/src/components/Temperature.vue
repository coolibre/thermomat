<template>
  <v-card class="d-inline-block mx-auto">
    <v-container>
      <v-row justify="space-around">
        <v-col>
          <div
            class="align-center"
            :class="$vuetify.breakpoint.mdAndUp ? 'display-1' : 'headline'"
          >
            {{ fromDate(time) }}
          </div>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col>
          <div
            class="align-center"
            :class="$vuetify.breakpoint.mdAndUp ? 'display-1' : 'headline'"
          >
            {{ temp.toString().padStart(2, "0") }}°
          </div>
        </v-col>
        <v-divider v-if="editMode" vertical></v-divider>
        <v-col v-if="editMode" class="align-center">
          <v-btn
            dark
            small
            fab
            color="deep-orange darken-4"
            @click="onDeleteTemp"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
export default {
  props: ["editMode", "time", "temp"],

  data: () => ({}),
  methods: {
    onDeleteTemp() {
      this.$emit("deleteTemp", { time: this.time });
    },
    fromDate(dateString) {
      const date = new Date(dateString);
      const hours = date.getHours().toString();
      const minutes = date.getMinutes().toString();
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    },
  },
};
</script>
