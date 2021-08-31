<template>
  <div>
    <nav class="navbar navbar-inverse">
      <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="nav navbar-nav">
            <li>
              <router-link class="nav-link" aria-current="page" :to="{name: 'home'}">Home</router-link>
            </li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">All Events <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li id="nav-to-search">
                  <router-link class="nav-link" :to="{ name: 'search'}" id="search-link">Search</router-link>
                </li>
                <li id="nav-to-events">
                  <router-link class="nav-link" :to="{name: 'events'}" id="events-link">View all Events</router-link>
                </li>
              </ul>
            </li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Profile <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li id="nav-to-profile" v-if="loggedIn">
                  <router-link class="nav-link" :to="{name: 'myProfile'}" id="profile-link">My Profile</router-link>
                </li>
                <li id="nav-to-login" v-if="!loggedIn">
                <router-link class="nav-link" :to="{name: 'login'}" id="login-link">Login</router-link>
                </li>
                <li id="nav-to-register" v-if="!loggedIn">
                  <router-link class="nav-link" :to="{name: 'register'}" id="register-link">Register</router-link>
                </li>
                <li id="logout" v-if="loggedIn">
                  <a data-toggle="modal" data-target="#logoutModal">Logout</a>
                </li>
              </ul>
            </li>
            <li class="dropdown" v-if="loggedIn">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">My Events <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li id="nav-to-createEvent">
                  <router-link class="nav-link" :to="{name: 'createEvent'}" id="createEvent-link">Create New Event</router-link>
                </li>
                <li id="nav-to-organising">
                  <router-link class="nav-link" :to="{name: 'organisingEvents'}" id="organising-link">My Events</router-link>
                </li>
                <li id="nav-to-attending">
                  <router-link class="nav-link" :to="{name: 'attendingEvents'}" id="attending-link">Events I'm Attending</router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="logoutModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="logoutModalLabel">Log Out</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are you sure that you want to log out?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Close
            </button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="logout()">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
    <div >
      <router-view></router-view>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      loggedIn: sessionStorage.getItem('token')
    }
  },
  methods: {
    logout() {
      sessionStorage.clear();
      console.log(this.$route.path)
      if (this.$route.path === "/") {
        this.$router.go();
      } else {
        this.$router.push("/");
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.dropdown-menu {
  background-color: #dddddd;
  color: white;
}
</style>
