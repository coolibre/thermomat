<template>
  <div class="d-flex flex-row">
    <div class="d-flex flex-column">
      <div class="d-flex flex-row justify-center">
        <v-btn dark fab small color="deep-orange darken-4" @click="plusHour">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="hidden-xs-only display-4 text-center">{{formatHour}}</div>
      <div class="hidden-sm-and-up display-1 text-center">{{formatHour}}</div>
      <div class="d-flex flex-row justify-center">
        <v-btn dark fab small color="deep-orange darken-4" @click="minusHour">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex justify-center flex-column">
      <div class="hidden-xs-only display-4 text-center">:</div>
      <div class="hidden-sm-and-up display-1 text-center">:</div>
    </div>
    <div class="d-flex flex-column">
      <div class="d-flex flex-row justify-center">
        <v-btn dark fab small color="deep-orange darken-4" @click="plusMinute">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="hidden-xs-only display-4 text-center">{{formatMinute}}</div>
      <div class="hidden-sm-and-up display-1 text-center">{{formatMinute}}</div>
      <div class="d-flex flex-row justify-center">
        <v-btn dark fab small color="deep-orange darken-4" @click="minusMinute">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    step: { default: 1 },
  },
  data: () => ({
    value: "00:00",
    minute: 0,
    hour: 0,
  }),
  methods: {
    plusMinute() {
      let minute;
      minute = this.minute + this.step;
      if (minute >= 60) minute -= 60;
      this.minute = minute;
    },
    minusMinute() {
      let minute;
      minute = this.minute - this.step;
      if (minute < 0) minute += 60;
      if (minute === 60) minute = 0;
      this.minute = minute;
    },
    plusHour() {
      let hour;
      hour = this.hour + 1;
      if (hour >= 24) hour -= 24;
      this.hour = hour;
    },
    minusHour() {
      let hour;
      hour = this.hour - 1;
      if (hour <= 0) hour += 24;
      this.hour = hour;
    },
    setValue() {
      this.value = `${this.hour
        .toString()
        .padStart("2", 0)}:${this.minute.toString().padStart("2", 0)}`;
    },
  },
  computed: {
    formatHour() {
      return this.hour.toString().padStart(2, "0");
    },
    formatMinute() {
      return this.minute.toString().padStart(2, "0");
    },
  },
  watch: {
    minute: function () {
      this.setValue();
    },
    hour: function () {
      this.setValue();
    },
    value: function (value) {
      this.$emit("input", value);
    },
  },
};
</script>