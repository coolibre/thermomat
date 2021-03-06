<template>
  <div>
    <v-item-group v-if="$vuetify.breakpoint.xsOnly" v-model="window" mandatory>
      <v-item
        v-for="day in days"
        :key="day"
        v-slot:default="{ active, toggle }"
      >
        <v-btn
          color="deep-orange darken-4"
          :input-value="active"
          icon
          @click="toggle"
        >
          <v-icon>mdi-record</v-icon>
        </v-btn>
      </v-item>
    </v-item-group>
    <v-row align="center">
      <v-item-group
        v-if="$vuetify.breakpoint.smAndUp"
        v-model="window"
        class="shrink mr-6"
        mandatory
      >
        <v-item
          v-for="day in days"
          :key="day"
          v-slot:default="{ active, toggle }"
        >
          <div>
            <v-btn
              color="deep-orange darken-4"
              :input-value="active"
              icon
              @click="toggle"
            >
              <v-icon>mdi-record</v-icon>
            </v-btn>
          </div>
        </v-item>
      </v-item-group>

      <v-col>
        <v-window
          class="elevation-1"
          v-model="window"
          :vertical="$vuetify.breakpoint.smAndUp"
        >
          <v-window-item v-for="day in days" :key="day">
            <div class="d-flex flex-column mb-6">
              <v-card flat min-height="45vh">
                <v-card-text>
                  <v-container>
                    <v-row align="center">
                      <strong
                        :class="
                          $vuetify.breakpoint.xsOnly
                            ? 'body-1 pl-5'
                            : 'title pl-5'
                        "
                        >{{ plan.name }}</strong
                      >
                      <strong
                        :class="
                          $vuetify.breakpoint.xsOnly
                            ? 'body-1 pl-5'
                            : 'title pl-5'
                        "
                        >{{ day }}</strong
                      >
                      <v-spacer></v-spacer>
                      <div>
                        <v-btn
                          v-if="editMode"
                          color="deep-orange darken-4"
                          outlined
                          justify="center"
                          :small="$vuetify.breakpoint.xsOnly"
                          @click="
                            $emit('showCopyDialog', {
                              day,
                              plan,
                              temps: temperatures[day],
                            })
                          "
                          >copy to...</v-btn
                        >
                      </div>
                      <div v-if="$vuetify.breakpoint.smAndUp">
                        <v-switch
                          color="deep-orange darken-4"
                          class="float-right pl-5"
                          v-model="editMode"
                          label="edit"
                        ></v-switch>
                      </div>
                      <div v-if="$vuetify.breakpoint.smAndUp">
                        <v-switch
                          class="float-right pl-5 pr-5"
                          v-model="active"
                          color="deep-orange darken-4"
                          label="active"
                        ></v-switch>
                      </div>
                    </v-row>
                    <v-row v-if="$vuetify.breakpoint.xsOnly" align="center">
                      <div>
                        <v-switch
                          color="deep-orange darken-4"
                          class="float-right pl-5"
                          v-model="editMode"
                          label="edit"
                        ></v-switch>
                      </div>
                      <div>
                        <v-switch
                          class="float-right pl-5 pr-5"
                          v-model="active"
                          color="deep-orange darken-4"
                          label="active"
                        ></v-switch>
                      </div>
                    </v-row>
                  </v-container>

                  <v-row>
                    <Temperatures
                      :temperatures="temperatures[day]"
                      :editMode="editMode"
                      v-on:deleteTemp="onDeleteTemp"
                    ></Temperatures>
                  </v-row>
                  <v-btn
                    v-if="editMode"
                    absolute
                    dark
                    fab
                    bottom
                    left
                    small
                    color="deep-orange darken-4"
                    @click="deletePlan"
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="editMode"
                    absolute
                    dark
                    fab
                    bottom
                    right
                    small
                    color="deep-orange darken-4"
                    @click="addTempDialog = true"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
    <AddTemperatureDialog
      :shown="addTempDialog"
      @save="onAddTemp"
      @close="addTempDialog = false"
    />
  </div>
</template>
<script>
import Temperatures from "./Temperatures";
import AddTemperatureDialog from "./AddTemperatureDialog";
import util from "./../util";
export default {
  props: ["plan", "planActive", "update"],
  data: () => ({
    temperatures: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
    window: 0,
    editMode: false,
    addTempDialog: false,
    active: false,
  }),
  components: { Temperatures, AddTemperatureDialog },
  computed: {
    days: function() {
      return util.days;
    },
    today: function() {
      const dayName = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      return this.days.indexOf(dayName);
    },
  },
  watch: {
    active: function(newVal, oldVal) {
      this.activatePlan(oldVal);
    },
    planActive: function(newVal) {
      this.active = newVal;
    },
    update: function(newVal) {
      if (newVal) this.init();
    },
  },
  methods: {
    async init() {
      await this.getTemps();
      this.active = this.planActive;
      this.window = this.today;
    },
    async activatePlan(active) {
      const room = this.plan.room;
      const name = this.plan.name;
      if (!active) await this.$api.activatePlan(room, name);
      else await this.$api.deactivatePlan(room, name);
      this.$emit("planUpdate");
    },
    async deletePlan() {
      await this.$api.deletePlan(this.plan.room, this.plan.name);
      this.$emit("planUpdate");
    },
    async getTemps() {
      const result = await this.$api.getAllTemperatures(
        this.plan.room,
        this.plan.name
      );
      const sorted = result.response.sort((a, b) => {
        const date1 = new Date(a.time);
        const date2 = new Date(b.time);
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
      });
      // reset temperatures
      const resetTemps = {};
      for (const day of this.days) {
        resetTemps[day] = [];
      }
      Object.assign(this.temperatures, resetTemps);
      for (const temp of sorted) {
        this.temperatures[temp.day].push(temp);
      }
    },
    allowedStep: (m) => m % 5 === 0,
    async onAddTemp(res) {
      await this.$api.addTemperature(
        this.plan.room,
        this.plan.name,
        this.days[this.window],
        this.toDate(res.time),
        res.temp
      );
      this.addTempDialog = false;
      await this.getTemps();
    },
    async onDeleteTemp(evt) {
      await this.$api.deleteTemperature(
        this.plan.room,
        this.plan.name,
        this.days[this.window],
        evt.time
      );
      this.addTempDialog = false;
      await this.getTemps();
    },
    toDate(timeString) {
      const date = new Date(0);
      const split = timeString.split(":");
      date.setHours(split[0]);
      date.setMinutes(split[1]);
      return date;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
