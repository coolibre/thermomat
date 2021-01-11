<template>
  <v-dialog v-model="shown" persistent max-width="550px">
    <v-card height="100%">
      <v-card-title>
        <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'"
          >Add temperature</span
        >
      </v-card-title>
      <v-container fluid>
        <v-col cols="12">
          <v-row>
            <v-col>
              <TimePicker @input="timeChanged" :step="5"></TimePicker>
            </v-col>
            <v-col>
              <NumberPicker
                @input="temperatureChanged"
                :min="5"
                :max="30"
                :step="0.5"
                :format="formatCelsius"
                :init="this.selectedTemp"
              ></NumberPicker>
            </v-col>
          </v-row>
        </v-col>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="close"
          >Close</v-btn
        >
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="save"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import NumberPicker from "./NumberPicker";
import TimePicker from "./TimePicker";
export default {
  props: ["shown"],
  data: () => ({
    selectedTime: "00:00",
    selectedTemp: 20,
  }),
  components: { NumberPicker, TimePicker },
  methods: {
    save() {
      this.$emit("save", {
        temp: this.selectedTemp,
        time: this.selectedTime,
      });
    },
    formatCelsius(value) {
      return value.toFixed(1) + "°";
    },
    temperatureChanged(value) {
      this.selectedTemp = value;
    },
    timeChanged(value) {
      this.selectedTime = value;
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>
