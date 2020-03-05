<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        v-for="temp in temperatures"
        :key="temp.time"
        cols="12"
        :md="editMode === true ? 4 : 3"
        sm="6"
        xs="1"
      >
        <Temperature
          :time="temp.time"
          :temp="temp.temp"
          :editMode="editMode"
          v-on:deleteTemp="onDeleteTemp"
        ></Temperature>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Temperature from "./Temperature";
export default {
  props: ["editMode", "temperatures", "day"],
  data: () => ({}),
  components: { Temperature },
  methods: {
    onDeleteTemp(evt) {
      this.$emit("deleteTemp", evt);
    }
  }
};
</script>