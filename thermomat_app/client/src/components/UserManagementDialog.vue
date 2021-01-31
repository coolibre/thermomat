<template>
  <v-dialog v-model="isShown" persistent max-width="500px">
    <v-card height="100%">
      <v-card-title>
        <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'"
          >Usermanagement</span
        >
      </v-card-title>
      <v-container>
        <div>
          <v-btn
            v-if="user.isAdmin"
            class="add-button"
            relative
            dark
            small
            fab
            color="deep-orange darken-4"
            @click="userAddDialogShown = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-data-table :headers="headers" :items="users" sort-by="name">
            <template v-slot:[`item.isAdmin`]="{ item }">
              <v-simple-checkbox
                v-model="item.isAdmin"
                disabled
              ></v-simple-checkbox>
            </template>
            <template v-slot:[`item.edit`]="{ item }">
              <v-btn
                dark
                small
                fab
                color="deep-orange darken-4"
                @click="userEditClick(item)"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <template v-if="user.isAdmin" v-slot:[`item.delete`]="{ item }">
              <v-btn
                dark
                small
                fab
                color="deep-orange darken-4"
                @click="userDeleteClick(item)"
              >
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </div>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :small="$vuetify.breakpoint.xsOnly"
          outlined
          color="deep-orange darken-4"
          text
          @click="$emit('close')"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
    <UserDialog
      :administrator="user.isAdmin"
      :shown="userAddDialogShown"
      @close="userAddDialogShown = false"
      @save="init"
    ></UserDialog>
    <UserDialog
      edit="true"
      :shown="userEditDialogShown"
      @close="userEditDialogShown = false"
      :admin="selectedUser.isAdmin"
      :name="selectedUser.name"
      @save="init"
      :administrator="user.isAdmin"
    ></UserDialog>
    <YesNoDialog
      title="Delete User"
      :message="`Do you want to delete user ${selectedUser.name}?`"
      :shown="userDeleteDialogShown"
      @no="userDeleteDialogShown = false"
      @yes="deleteUser"
    ></YesNoDialog>
  </v-dialog>
</template>
<script>
import UserDialog from "./UserDialog";
import YesNoDialog from "./YesNoDialog";
export default {
  props: ["shown"],
  components: { UserDialog, YesNoDialog },
  data: () => ({
    users: [],
    user: {},
    selectedUser: {},
    headers: [
      {
        text: "Username",
        align: "start",
        value: "name",
      },
      { text: "is Admin?", value: "isAdmin", sortable: false },
      { text: "edit", value: "edit", sortable: false },
    ],
    userAddDialogShown: false,
    userEditDialogShown: false,
    userDeleteDialogShown: false,
  }),
  methods: {
    async init() {
      const user = await this.$api.getUser();
      this.user = user.response;
      if (this.user.isAdmin) {
        const users = await this.$api.getUsers();
        this.users = users.response;
        if (this.user.isAdmin) {
          this.headers[3] = {
            text: "delete",
            value: "delete",
            sortable: false,
          };
        }
      } else {
        this.users = [this.user];
      }
    },
    userEditClick(user) {
      this.selectedUser = user;
      this.userEditDialogShown = true;
    },
    userDeleteClick(user) {
      this.selectedUser = user;
      this.userDeleteDialogShown = true;
    },
    async deleteUser() {
      await this.$api.deleteUser(this.selectedUser.name);
      this.userDeleteDialogShown = false;
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  computed: {
    isShown: function() {
      return this.shown;
    },
  },
};
</script>

<style>
.add-button {
  float: right;
  margin-right: 16px;
}
</style>
