<template>
  <v-dialog v-model="isShown" persistent max-width="500px">
    <v-form ref="form" v-model="valid">
      <v-card height="100%">
        <v-card-title>
          <span :class="$vuetify.breakpoint.xsOnly ? 'title' : 'headline'"
            >{{ edit ? "Edit" : "Add" }} User</span
          >
        </v-card-title>
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-if="!edit"
                color="deep-orange darken-4"
                v-model="username"
                label="Name"
              ></v-text-field>
              <v-text-field
                v-if="edit"
                disabled
                color="deep-orange darken-4"
                v-model="username"
                label="Name"
                :rules="[required]"
              ></v-text-field>
            </v-col>
            <v-col v-if="administrator" cols="6">
              <v-switch
                color="deep-orange darken-4"
                v-model="isAdmin"
                class="ma-2"
                label="Is Admin?"
              ></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                color="deep-orange darken-4"
                v-model="password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                label="Password"
                :rules="passwordRule"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                color="deep-orange darken-4"
                v-model="passwordMatch"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                name="repeat"
                label="Repeat Password"
                :rules="passwordConfirmRule"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
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
            @click="$emit('close')"
            >Close</v-btn
          >
          <v-btn
            :disabled="!valid"
            :small="$vuetify.breakpoint.xsOnly"
            outlined
            color="deep-orange darken-4"
            text
            @click="save"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
<script>
export default {
  props: ["name", "admin", "shown", "edit", "administrator"],
  data: function() {
    return {
      valid: false,
      password: "",
      passwordMatch: "",
      showPassword: false,
      isAdmin: false,
      isAdminChanged: false,
      username: "",
      isShown: "",
    };
  },
  methods: {
    validateField() {
      this.$refs.form.validate();
    },
    save() {
      if (this.administrator) {
        this.$api.addUser(this.username, this.password, this.isAdmin);
      } else {
        this.$api.updatePassword(this.password);
      }
      this.$emit("save");
      this.close();
    },
    close() {
      this.$emit("close");
    },
    matches() {
      if (this.password !== this.passwordMatch) {
        return "Passwords do not match!";
      }
      return true;
    },
    required(value) {
      return !!value || "Required!";
    },
  },
  computed: {
    passwordRule: function() {
      if (this.isAdminChanged || (this.edit && this.password === "")) {
        return [];
      }
      return [this.required];
    },
    passwordConfirmRule: function() {
      if (this.isAdminChanged || (this.edit && this.password === "")) {
        return [];
      }
      return [this.required, this.matches];
    },
  },
  watch: {
    password: "validateField",
    passwordMatch: "validateField",
    isAdmin: function() {
      this.isAdminChanged = !this.isAdminChanged;
      this.validateField();
    },
    admin: function(val) {
      this.isAdmin = val;
    },
    name: function(val) {
      this.username = val;
    },
    shown: function(val) {
      if (!val) {
        this.isAdminChanged = false;
        this.password = "";
        this.passwordMatch = "";
      }
      this.isShown = val;
    },
  },
};
</script>
