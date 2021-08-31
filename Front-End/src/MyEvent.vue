<template>
  <div>
    <button data-toggle="modal" data-target="#editModal">Edit this event</button>
    <button data-toggle="modal" data-target="#deleteModal">Delete this event</button>
    <button id="toAttendees" @click="goToAttendees()">Check Attendees</button>
    <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="logoutModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Event</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="btn-group">
              <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Category<span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li><a v-for="category in eventCategories" v-bind:key="category.id" v-on:click="addCategory(category)">{{
                    category.name
                  }} <span v-if="selectedCategoryNames.includes(category.name)">&#10004;</span></a></li>
              </ul>
            </div>
            <tr class="categoriesInfo">
              <th><h5 id="categoriesSelected">Currently selected categories: {{selectedCategoryNames.join(", ")}}</h5></th>
            </tr>
            <table class="userInputs">
              <tr id="titleFields" class="dividers">
                <th><label for="title">Event Title: </label></th>
                <th><input id="title" type="text" v-model="title" placeholder="Title"></th>
              </tr>
              <tr id="dateFields" class="dividers">
                <th><label for="eventDate">Date of Event: </label></th>
                <th><input type="date" id="eventDate" name="eventDate" v-model="date"></th>
              </tr>
              <tr id="timeFields" class="dividers">
                <th><label for="eventTime">Time of Event: </label></th>
                <th><input type="time" id="eventTime" name="eventTime" v-model="time"></th>
              </tr>
              <tr id="descriptionFields" class="dividers">
                <th><label for="description">Event Description: </label></th>
                <th><input id="description" type="text" v-model="desc" placeholder="Description"></th>
              </tr>
              <tr id="capacityFields" class="dividers">
                <th><label for="capacity">Event Capacity: </label></th>
                <th><input id="capacity" type="number" v-model="capacity"></th>
              </tr>
              <tr id="venueFields" class="dividers">
                <th><label for="venue">Event Venue: </label></th>
                <th><input id="venue" type="text" v-model="venue" placeholder="Venue"></th>
              </tr>
              <tr id="onlineConfirm" class="dividers">
                <th><label for="onlineCheck">Is this an online event?</label></th>
                <th><input id="onlineCheck" type="checkbox" v-model="online"></th>
              </tr>
              <tr id="urlFields" class="dividers" v-if="online">
                <th><label for="url">Event URL: </label></th>
                <th><input id="url" type="text" v-model="url" placeholder="Event Link"></th>
              </tr>
              <tr id="controlConfirm" class="dividers">
                <th><label for="control">Will you need to control the attendance of this event?</label></th>
                <th><input id="control" type="checkbox" v-model="control"></th>
              </tr>
              <tr id="imageField" class="dividers">
                <th><label for="profileImage">Upload an Event Photo:</label></th>
                <th><input id="profileImage" type="file" accept=".png, .jpeg, .gif" @change="onFilePicked($event)"></th>
              </tr>
              <tr id="feeFields" class="dividers">
                <th><label for="fee">Event Capacity: </label></th>
                <th><input id="fee" type="number" v-model="fee"></th>
              </tr>
            </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="editEvent()">
              Confirm Edit
            </button>
          </div>
        </div>
      </div>
    <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="logoutModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Delete this event?</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are you sure that you want to delete your event?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="deleteEvent()">
              Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyEvent",
  props: ['event'],
  data() {
    return {
      eventId: this.$route.params.eventId,
      eventCategories: [],
      online: false,
      categories: [],
      selectedCategoryNames: [],
      control: false,
      title: "",
      desc: "",
      capacity: null,
      venue: "",
      url: "",
      fee: null,
      date: null,
      time: null,
      image: null,
      imageMime: null
    }
  },
  created() {
    if (sessionStorage.getItem('id') === null || sessionStorage.getItem('token') === null) {
      alert("Whoops! Looks like you aren't logged in at the moment. Please log to visit this page");
      this.$router.push("/")
    }
    this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
      this.eventCategories = response.data;
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });
  },
  methods: {
    editEvent() {
      let newTime = false;
      let newEvent = { isOnline: this.online, requiresAttendanceControl: this.control };
      if (this.online !== this.event.isOnline) {
        newEvent.isOnline = this.online;
      }
      if (this.control !== this.event.requiresAttendanceControl) {
        newEvent.requiresAttendanceControl = this.control;
      }
      if (this.title && this.title.length > 0) {
        newEvent.title = this.title;
      }
      if (this.categories.length > 0) {
        newEvent.categoryIds = this.categories;
      }
      if (this.desc && this.desc.length > 0) {
        newEvent.desc = this.desc;
      }
      if (this.capacity !== null && !isNaN(parseInt(this.capacity)) && parseInt(this.capacity) > 0) {
        newEvent.capacity = parseInt(this.capacity);
      }
      if (this.venue.length > 0) {
        newEvent.venue = this.venue;
      }
      if (this.url.length > 0) {
        newEvent.url = this.url;
      }
      if (this.fee !== null && isNaN(parseInt(this.fee)) &&  parseFloat(this.fee) > 0) {
        newEvent.fee = parseFloat(this.fee);
      }
      if (this.time !== null) {
        newTime = true;
      }
      if (this.isOnline !== null) {
        newEvent.isOnline = this.isOnline;
      }
      if (this.control !== null) {
        newEvent.requiresAttendanceControl = this.control;
      }
      if (this.date !== null) {
        if (new Date(this.date) < new Date()) {
          alert("Your events new date cannot be in the past")
        } else {
          if (newTime) {
            newEvent.date = this.date + ' ' + this.time
            console.log(newEvent.date);
          } else {
            newEvent.date = this.date + " " + this.event.date.split(" ")[1];
            console.log(newEvent.date);
          }
        }
      } else if (newTime) {
        newEvent.date = this.event.date.split(" ")[0] + " " + this.time
        console.log(newEvent.date);
      }

      this.axios.patch('http://localhost:4941/api/v1/events/'+this.eventId, newEvent,{headers: {"X-Authorization": sessionStorage.getItem("token")}})
          .then(() => {
            if (this.image !== null && this.imageMime !== null) {
              this.axios.put('http://localhost:4941/api/v1/events/'+this.eventId+'/image', this.image,
                  {headers: {"X-Authorization": sessionStorage.getItem("token"), 'Content-Type': this.imageMime}})
                  .then(() => {
                    this.$router.push('/events/organising')
                  })
            }
            this.$router.push('/events/organising');
          }).catch((err) => {
            alert("Sorry,"+err.response.statusText.split(':')[1])
        })
    },
    deleteEvent() {
      this.axios.delete('http://localhost:4941/api/v1/events/'+this.eventId, {headers: {"X-Authorization": sessionStorage.getItem("token")}})
      .then(() => {
        this.$router.push('/');
      }).catch(() => {
        alert("Something went wrong while trying to delete your event")
        this.$router.push('/');
      })
    },
    addCategory(category) {
      if (this.categories.includes(category.id)) {
        const index = this.categories.indexOf(category.id);
        this.categories.splice(index, 1);
        this.selectedCategoryNames.splice(index, 1);
      } else {
        this.categories.push(category.id);
        this.selectedCategoryNames.push(category.name)
      }
    },
    goToAttendees() {
      this.$router.push('/events/'+this.eventId+'/attendees');
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