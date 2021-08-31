<template>
  <div>
    <h3>My Profile</h3>
    <div>
      <MyInfo v-if="user !== null" :user="user"></MyInfo>
    </div>
    <div>
      <button data-toggle="modal" data-target="#editModal">Edit my information</button>
    </div>
    <div>
      <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editModalLabel">Edit My Details</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
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
                <tr id="deleteImageField" class="dividers">
                  <th><label for="deleteImage">Delete your current profile picture? </label></th>
                  <th><input type="checkbox" id="deleteImage" v-model="deletePhoto"></th>
                </tr>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="editUser()">
              Confirm Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MyInfo from "@/components/MyInfo";

export default {
name: "MyProfile",
  components: {MyInfo},
  data() {
    return {
      user: null,
      first: "",
      last: "",
      email: "",
      newPassword: "",
      currentPassword: "",
      image: null,
      imageMime: null,
      deletePhoto: false,
      updatedValues: false
    }
  },
  created() {
    const userId = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");
    if (userId === null || token === null) {
      //The user is not logged in
      alert("Whoops! Something went wrong getting your login info. Please log in, or try closing and re-opening the tab");
      this.$router.push("/");
    } else {
      this.axios.get('http://localhost:4941/api/v1/users/'+userId, {headers: {'X-Authorization': token}})
      .then((response) => {
        if (response.data.email) {
          this.user = response.data;
          this.user.attendeeId = userId;
        } else {
          alert("Whoops! Your userId does not match your log-in token. Please log-in again");
        }
      }).catch((err) => {
        console.log(err);
        alert("Sorry! Something went wrong getting your info.");
        sessionStorage.clear();
        this.$router.push("/");
      })
    }
  },
  methods: {
    editUser() {
      if (this.newPassword !== "" && this.currentPassword.length === 0) {
        alert("Please provide your current password to change your password");
      } else if (this.email.length > 0 && !this.email.test('.+@.+')){
        alert("Please ensure that your new email is valid")
      } else {
        let newInfo = {}
        if (this.first.length > 0) {
          newInfo.firstName = this.first;
          this.updatedValues = true;
        }
        if (this.last.length > 0) {
          newInfo.lastName = this.last;
          this.updatedValues = true;
        }
        if (this.email.length > 0) {
          newInfo.email = this.email;
          this.updatedValues = true;
        }
        if (this.newPassword.length > 0) {
          newInfo.currentPassword = this.currentPassword;
          newInfo.password = this.newPassword;
          this.updatedValues = true;
        }
        if (!this.updatedValues) {
          console.log(this.image)
          console.log(this.imageMime)
          if (this.deletePhoto == true) {
            this.removePhoto()
            newInfo.firstName = this.user.firstName
          } else if (this.image !== null && this.imageMime !== null) {
            this.updatePhoto()
            newInfo.firstName = this.user.firstName
          }

        }
        const userId = sessionStorage.getItem("id");
        const token = sessionStorage.getItem("token");
        this.axios.patch('http://localhost:4941/api/v1/users/'+userId, newInfo, {headers: {'X-Authorization': token}})
        .then(() => {
          if (this.deletePhoto) {
            this.removePhoto()
          } else {
            this.updatePhoto()
          }
        }).catch((err) => {
          if (err.response.status === 400) {
            const errorMessage = err.response.statusText.split(":");
            alert("Sorry, "+errorMessage[1])
          } else if (err.response.status === 403) {
            alert("Whoops! Your id and your log-in information seem to not match. Please log-in again");
            sessionStorage.clear();
            this.$router.push('/');
          }
        })
      }
    },

    removePhoto() {
      console.log("removing")
      const userId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("token");
      this.axios.delete('http://localhost:4941/api/v1/users/'+userId+'/image',
          {headers: {'X-Authorization': token}})
          .then(() => {
            alert('Details updated successfully!');
            this.$router.go();
          })
          .catch((err) => {
            console.log(err);
            alert("Sorry, we could not delete your profile image");
          })
    },

    updatePhoto() {
      console.log("updating")
      const userId = sessionStorage.getItem("id");
      const token = sessionStorage.getItem("token");
      this.axios.put('http://localhost:4941/api/v1/users/'+userId+'/image', this.image,
          {headers: {'X-Authorization': token, 'Content-Type': this.imageMime}})
          .then(() => {
            alert('Details updated successfully!');
            this.$router.go();
          })
          .catch((err) => {
            console.log(err);
            alert("Sorry, we could not update your profile image");
          })
    },

    onFilePicked(event) {
      const files = event.target.files;
      this.imageMime = files[0].type
      this.image = files[0]
    }
  }
}
</script>

<style scoped>
button {
  border-radius: 4px;
  padding: 6px 14px;
  background-color: #4CAF50;
  color: whitesmoke;
}
</style>