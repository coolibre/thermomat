<template>
  <v-dialog v-model="shown" persistent max-width="600px">
    <v-card height="100%">
      <v-card-title>
        <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'">Add temperature</span>
      </v-card-title>
      <v-container>
        <v-row>
          <v-col align-self="center">
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="selectedTime"
              :nudge-right="40"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="selectedTime"
                  color="deep-orange darken-4"
                  label="Selected Time"
                  prepend-icon="mdi-clock"
                  readonly
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-if="menu"
                v-model="selectedTime"
                full-width
                :allowed-minutes="allowedStep"
                color="deep-orange darken-4"
                header-color="deep-orange"
                format="24hr"
                @click:minute="$refs.menu.save(selectedTime)"
              ></v-time-picker>
            </v-menu>
          </v-col>
          <v-col align-self="center">
            <div class="hidden-xs-only display-4 text-center">{{selectedTemp.toFixed(1)}}°</div>
            <div class="hidden-sm-and-up display-1 text-center">{{selectedTemp.toFixed(1)}}°</div>
            <v-slider
              height="100%"
              track-color="deep-orange"
              color="deep-orange darken-4"
              step="0.5"
              max="30"
              min="5"
              v-model="selectedTemp"
            ></v-slider>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="toggleTempDialog(false)"
        >Close</v-btn>
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="save"
        >Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: ["shown"],
  data: () => ({
    selectedTime: "00:00",
    selectedTemp: 20,
    menu: false
  }),
  components: {},
  methods: {
    save() {
      this.$emit("temperatureAdded", this.selectedTemp);
    }
  }
};
</script>