<template>
  <v-app id="inspire" class="no-user-select">
    <v-app-bar app color="deep-orange" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="hidden-xs-only display-1">Thermomat</v-toolbar-title>
      <v-toolbar-title
        :class="$vuetify.breakpoint.smAndUp ? 'display-1 pl-10' : 'body-1'"
      >{{rooms[activeRoomIndex] ? rooms[activeRoomIndex].name : ''}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="white" :small="$vuetify.breakpoint.xsOnly" outlined @click="logout">logout</v-btn>
    </v-app-bar>
    <v-navigation-drawer clipped v-model="drawer" app>
      <v-list>
        <v-subheader color="deep-orange">Rooms</v-subheader>
        <v-list-item-group v-model="activeRoomIndex" active-class="deep-orange darken-4">
          <v-list-item
            v-for="(room, index) in rooms"
            :key="room.name"
            link
            @click="onRoomSelected(index)"
          >
            <v-list-item-action>
              <v-icon>mdi-door</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{room.name}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-content v-if="rooms.length > 0">
      <v-container class="fill-height" fluid>
        <v-col class="text-center">
          <DaySelector
            v-for="plan in plans"
            :plan="plan"
            :key="plan.id"
            :planActive="plan.active"
            :update="updateDaySelector"
            v-on:planUpdate="fetchPlans(rooms[activeRoomIndex].name)"
            v-on:showCopyDialog="onShowCopyDialog"
          ></DaySelector>
          <v-spacer></v-spacer>
          <v-btn dark fab bottom middle color="deep-orange darken-4" @click="addPlanDialog=true">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-container>
    </v-content>
    <v-snackbar
      v-if="rooms.length > 0"
      bottom
      :timeout="5000"
      color="deep-orange darken-4"
      v-model="snackbar"
    >{{ snackText }}</v-snackbar>
    <v-snackbar
      v-if="rooms.length === 0"
      bottom
      :timeout="0"
      color="deep-orange darken-4"
      v-model="snackbar"
    >{{ snackText }}</v-snackbar>
    <v-dialog v-model="addPlanDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Add plan</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            :rules="[v => !!v || 'Name is required']"
            v-model="planName"
            color="deep-orange darken-4"
            label="Plan name*"
            required
          ></v-text-field>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :small="$vuetify.breakpoint.xsOnly"
            outlined
            color="deep-orange darken-4"
            @click="addPlanDialog = false"
          >Close</v-btn>
          <v-btn
            :small="$vuetify.breakpoint.xsOnly"
            outlined
            color="deep-orange darken-4"
            @click="addPlan"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showCopyDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'">Copy temperatures to...</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="copySelectedRoom"
            disable-lookup
            :items="rooms"
            item-value="name"
            item-text="name"
            color="deep-orange darken-4"
            item-color="deep-orange darken-4"
            label="Select a room"
            @change="fetchPlans(copySelectedRoom,'copyPlans')"
          ></v-select>
          <v-select
            v-model="copySelectedPlan"
            color="deep-orange darken-4"
            item-color="deep-orange darken-4"
            :items="copyPlans"
            item-value="name"
            item-text="name"
            label="Select a plan"
          ></v-select>
          <v-select
            v-model="copySelectedDay"
            color="deep-orange darken-4"
            item-color="deep-orange darken-4"
            :items="days"
            label="Select a day"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :small="$vuetify.breakpoint.xsOnly"
            color="deep-orange darken-4"
            outlined
            @click="showCopyDialog = false"
          >Close</v-btn>
          <v-btn
            :small="$vuetify.breakpoint.xsOnly"
            color="deep-orange darken-4"
            outlined
            @click="onCopy"
          >Copy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
// eslint no-console off
import DaySelector from "./components/DaySelector";
import sse from "./sse";
import util from "./util";
export default {
  props: {
    source: String,
  },
  data: () => ({
    drawer: null,
    rooms: [],
    plans: [],
    snackText: "",
    snackbar: false,
    activeRoomIndex: 0,
    addPlanDialog: false,
    planName: "",
    showCopyDialog: false,
    copySelectedRoom: "",
    copySelectedDay: "",
    copySelectedPlan: "",
    copyPlans: [],
    days: util.days,
    updateDaySelector: false,
  }),
  components: {
    DaySelector,
  },
  methods: {
    async fetchRooms() {
      const result = await this.$api.getAllRooms();
      this.rooms = result.response;
    },
    async fetchPlans(room, updateList) {
      const response = await this.$api.getAllPlans(room);
      if (updateList) this[updateList] = response.response;
      else this.plans = response.response;
    },
    async init() {
      await this.fetchRooms();
      const rooms = this.rooms;
      if (rooms.length === 0) {
        this.snackText = `No room added yet! Wait for device to request information from server`;
        this.snackbar = true;
        return;
      }
      await this.fetchPlans(rooms[0].name);
    },
    onRoomSelected(index) {
      this.drawer = false;
      this.activeRoomIndex = index;
      const activeRoom = this.rooms[index];
      this.fetchPlans(activeRoom.name);
    },
    async onAddedRoom(room) {
      await this.fetchRooms();
      await this.fetchPlans(room.name);
      this.snackText = `New Room added: ${room.name}`;
      this.snackbar = true;
    },
    async addPlan() {
      const roomName = this.rooms[this.activeRoomIndex].name;
      this.addPlanDialog = false;
      await this.$api.addPlan(roomName, this.planName);
      this.planName = "";
      await this.fetchPlans(roomName);
    },
    async logout() {
      await this.$api.logout();
      this.$router.push("/login");
    },
    onShowCopyDialog(event) {
      this.copySelectedRoom = this.rooms[this.activeRoomIndex].name;
      this.copyPlans = this.plans;
      this.copySelectedPlan = event.plan.name;
      this.copySelectedDay = event.day;
      this.copyTemps = event.temps;
      this.showCopyDialog = true;
    },
    async onCopy() {
      for (const temp of this.copyTemps) {
        await this.addTemp(
          this.copySelectedRoom,
          this.copySelectedPlan,
          this.copySelectedDay,
          temp.time,
          temp.temp
        );
      }
      // trigger update
      this.updateDaySelector = true;
      setTimeout(() => {
        this.updateDaySelector = false;
      }, 0);
      this.showCopyDialog = false;
    },
    async addTemp(room, plan, day, time, temp) {
      await this.$api.addTemperature(room, plan, day, time, temp);
    },
  },
  mounted() {
    sse.listen("addedRoom", this.onAddedRoom.bind(this));
    this.init();
  },
};
</script>
<style scoped>
.no-user-select {
  user-select: none;
}
</style>