<template>
  <div>
    <h3>Sign Up</h3>
    <label class="title">Any fields marked with</label><label class="mandatory">*</label><label>are mandatory</label>
    <div class="userInputs">
      <table class="userTable">
        <tr id="firstnameFields" class="dividers">
          <th><label for="fname">First Name: </label><label class="mandatory">*</label></th>
          <th><input id="fname" type="text" v-model="first" placeholder="First Name"></th>
        </tr>
        <tr id="lastNameFields" class="dividers">
          <th><label for="lname">Last Name: </label><label class="mandatory">*</label></th>
          <th><input id="lname" type="text" v-model="last" placeholder="Last Name"></th>
        </tr>
        <tr id="emailField" class="dividers">
          <th><label for="email">Email address: </label><label class="mandatory">*</label></th>
          <th><input id="email" type="text" v-model="email" placeholder="Email"></th>
        </tr>
        <tr id="passwordField" class="dividers">
          <th><label for="password">Password: </label><label class="mandatory">*</label></th>
          <th><input id="password" type="password" v-model="password" placeholder="Password"></th>
        </tr>
        <tr id="backupPasswordField" class="dividers">
          <th><label for="password">Reenter password: </label><label class="mandatory">*</label></th>
          <th><input id="backupPassword" type="password" v-model="backupPassword" placeholder="Reenter password"></th>
        </tr>
        <tr id="imageField" class="dividers">
          <th><label for="profileImage">Upload a Profile Photo:</label></th>
          <th><input id="profileImage" type="file" accept=".gif, .png, .jpeg" @change="onFilePicked"></th>
        </tr>
      </table>
    </div>
    <div>
      <button id="submitButton" v-on:click="register()" @keyup.enter="register()">Register</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",

  data() {
    return {
      first: "",
      last: "",
      email: "",
      password: "",
      backupPassword: "",
      image: null,
      loggedIn: false,
      imageType: null
    }
  },

  methods: {

    register() {
      const errorMessage = this.checkValues();
      if (!errorMessage) {
        if (this.getToken() == null) {

          const data = {"firstName": this.first, "lastName": this.last, "email": this.email, "password": this.password}
          this.axios.post('http://localhost:4941/api/v1/users/register', data).then(() => {
            this.login();
          }).catch((err) => {
            console.log(err.response)
            alert("Sorry,"+err.response.statusText.split(':')[1]);
          })
        } else {
          alert("You are already logged in; please log out to register a new account");
          this.$router.push('/');
        }
      } else {
        alert(errorMessage);
      }
    },

    checkValues() {
      if (this.first.length === 0) {
        return "Please provide a first name";
      } else if (this.last.length === 0) {
        return "Please provide a last name";
      } else if (this.email.length === 0 || !this.email.includes('@')) {
        return "Please provide a valid email";
      } else if (this.password.length < 8 || /^\s*$/.test(this.password)) {
        return "Please provide a password longer than 8 characters";
      } else if (this.password !== this.backupPassword) {
        return "The passwords do not match"
      }
      return null;
    },

    getToken() {
      if (sessionStorage) {
        return sessionStorage.getItem("token");
      }
    },


    login() {
      this.axios.post('http://localhost:4941/api/v1/users/login', {"email": this.email,"password": this.password})
      .then((response) => {
        if (sessionStorage) {
          sessionStorage.setItem("token", response.data.token);
          sessionStorage.setItem("id", response.data.userId);
        }
        if (this.image !== null) {
          this.axios.put('http://localhost:4941/api/v1/users/' + response.data.userId + '/image', this.image,
              {headers: {'X-Authorization': response.data.token, 'Content-Type': this.imageType}})
              .then(() => {
                this.$router.push('/')
              })
              .catch((err) => {
                console.log(err);
                alert("Sorry, we could not upload your profile image");
              })
        }
        this.$router.push('/')
      }).catch(() => {
        alert("Sorry, an error occurred while logging in. Please try logging in again");
      })

    },

    onFilePicked(event) {
      const files = event.target.files;
      this.imageType = files[0].type
      this.image = files[0]
    }
  }
}
</script>

<style scoped>
th, td {
  padding: 30px;
}
.title {
  margin-right: 10px;
}
.mandatory {
  color: red;
  margin-right: 10px;
}

.userTable {
  margin-left: auto;
  margin-right: auto;
}
input[type=text]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=password]{
  border: none;
  border-bottom: 2px solid black;
}
button {
  border-radius: 4px;
  padding: 12px 28px;
  background-color: #4CAF50;
  color: whitesmoke;
}
</style>