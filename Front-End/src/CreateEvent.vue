<template>
  <div>
    <div class="btn-group">
      <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Select Event Categories <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
        <li><a v-for="category in eventCategories" v-bind:key="category.id" v-on:click="addCategory(category)">
          {{category.name}} <span v-if="selectedCategoryNames.includes(category.name)">&#10004;</span>
        </a></li>
      </ul>
    </div>
    <div class="categoriesInfo">
      <h5 id="categoriesSelected">Currently selected categories: {{selectedCategoryNames.join(", ")}}</h5>
    </div>
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
        <th><input id="url" type="url" v-model="url" placeholder="Event Link"></th>
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
        <th><label for="fee">Event Fee: </label></th>
        <th><input id="fee" type="number" v-model="fee"></th>
      </tr>
    </table>
    <div>
      <button id="submitButton" v-on:click="createEvent()">Create Event</button>
    </div>
  </div>
</template>

<script>
export default {
name: "CreateEvent",
  data() {
    return {
      eventCategories: [],
      online: false,
      categories: [],
      selectedCategoryNames: [],
      control: false,
      title: "",
      desc: "",
      capacity: 0,
      venue: "",
      url: "",
      fee: 0,
      date: null,
      time: null,
      imageData: null,
      imageMime: null
    }
  },
  created() {
    this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
      this.eventCategories = response.data;
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });
  },
  methods: {
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
    createEvent() {
      const errorMessage = this.checkValues();
      if (errorMessage) {
        alert(errorMessage);
      } else {
        const data = {
          "title": this.title,
          "description": this.desc,
          "categoryIds": this.categories,
          "date": this.date + " " + this.time + ":00",
          "isOnline": this.online,
          "url": this.url,
          "venue": this.venue,
          "requiresAttendanceControl": this.control,
          "fee": this.fee
        };
        if (parseInt(this.capacity) > 0) {
          data.capacity = parseInt(this.capacity);
        }
        if (parseFloat(this.fee) > 0) {
          data.fee = parseFloat(this.fee)
        }

        console.log(data);
        this.axios.post('http://localhost:4941/api/v1/events', data, {headers: {"X-Authorization": sessionStorage.getItem("token")}})
            .then((response) => {
              const eventId = response.data.eventId;
              this.axios.put('http://localhost:4941/api/v1/events/' + eventId + '/image', this.imageData,
                  {headers: {"X-Authorization": sessionStorage.getItem("token"), 'Content-Type': this.imageMime}})
                  .then(() => {
                    this.$router.push('/events/organising')
                  })
              this.axios.post('http://localhost:4941/api/v1/events/' + eventId + '/attendees', {},
                  {headers: {"X-Authorization": sessionStorage.getItem("token") }})
            }).catch((err) => {
          console.log(err)
          alert("Sorry,"+err.response.statusText.split(':')[1])
        })
      }
    },
    onFilePicked(event) {
      const files = event.target.files;
      this.imageMime = files[0].type
      this.imageData = files[0]
    },

    checkValues() {
      if (this.title.length === 0) {
        return "Please provide a title for your event"
      } else if (this.desc.length === 0) {
        return "Please provide a description for your event"
      } else if (this.categories.length === 0) {
        return "Please provide at least one category for your event"
      } else if (this.date === null) {
        return "Please provide a date for your event"
      } else if (new Date(this.date) < new Date()) {
        return "Please ensure that your event's date is in the future"
      } else if (this.online && this.url.length === 0) {
        return "Please provide a url for your online event"
      } else if (this.time === null) {
        return "Please provide a time for your event"
      } else if (!this.online && this.venue.length === 0) {
        return "Please provide a venue for your event"
      } else if (this.imageData === null || this.imageMime === null) {
        return "Please provide an image for your event. The image must be a .jpg, .gif, or .png"
      } else if (isNaN(parseInt(this.capacity))) {
        return "Please provide a number for the event's capacity"
      } else if (isNaN(parseInt(this.fee))) {
        return "Please provide a number for the event's fee"
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
.userInputs {
  margin-left: auto;
  margin-right: auto;
}
#profileImage {
  margin: 0 auto;
}
th, td {
  padding: 30px;
}
#submitButton {
  margin-top: 50px;
  margin-bottom: 50px;
}
input[type=text]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=password]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=url]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=number]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=time]{
  border: none;
  border-bottom: 2px solid black;
}
input[type=date]{
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