<template>
  <v-app id="inspire">
    <v-container class="deep-orange" fill-height fluid>
      <v-col cols="12">
        <v-row justify="center">
          <v-card class="pa-5">
            <v-text-field color="deep-orange darken-4" v-model="name" label="Name"></v-text-field>
            <v-text-field
              color="deep-orange darken-4"
              v-model="password"
              label="Password"
              :type="'password'"
              @keyup.enter="login"
            ></v-text-field>
            <v-row justify="center">
              <div class="login-message">{{loginMessage}}</div>
            </v-row>
            <v-row justify="center">
              <v-btn color="deep-orange darken-4" outlined justify="center" @click="login">Login</v-btn>
            </v-row>
          </v-card>
        </v-row>
      </v-col>
    </v-container>
  </v-app>
</template>
<script>
export default {
  data: () => ({
    name: "",
    password: "",
    loginMessage: "",
  }),
  methods: {
    async login() {
      const result = await this.$api.login(this.name, this.password);
      if (result.response) {
        this.$router.push("/");
      } else if (result.error) {
        this.loginMessage = result.error.message;
      }
    },
  },
};
</script>
<style>
.login-message {
  color: red;
}
</style>

