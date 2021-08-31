<template>
  <div>
   <h2>Login</h2>
    <div id="emailField" class="dividers">
      <label for="email">Email address: </label>
      <input id="email" type="text" v-model="email" placeholder="Email">
    </div>
    <div id="passwordField" class="dividers">
      <label for="password">Password: </label>
      <input id="password" type="password" v-model="password" placeholder="Password">
    </div>
    <div>
      <button id="submitButton" v-on:click="login()" v-on:keyup.enter="login()">Login</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: ""
    }
  },
  methods: {

    login() {
      if (sessionStorage.getItem("token")) {
        alert("You are already logged in");
        this.$router.push('/');
      } else {
        this.axios.post('http://localhost:4941/api/v1/users/login', {"email": this.email, "password": this.password})
            .then((response) => {
              if (sessionStorage) {
                sessionStorage.setItem("token", response.data.token);
                sessionStorage.setItem("id", response.data.userId);
              }
              this.$router.push('/')
            }).catch((err) => {
              if (err.response.status === 400) {
                alert("Incorrect email or password; please try again")
              }
            })
      }
    },

    checkValues() {
      if (this.email.length === 0) {
        return "Please enter an email";
      } else if (this.password.length === 0) {
        return "Please enter a password";
      }
      return null;
    },

    getToken() {
      if (sessionStorage) {
        return sessionStorage.getItem("token");
      }
    }
  }
}
</script>

<style scoped>
.dividers {
  margin-bottom: 30px;
  margin-top: 30px;
}
label {
  padding-right: 15px;
}
input {
  border: none;
  border-bottom: 2px solid black;
}
</style>