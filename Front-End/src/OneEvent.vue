<template>
  <div>
    <h1>{{ event.title }}</h1>
    <img :src="event.eventPhoto" height="500">
    <h2>Date and Time: {{event.date}} at {{event.time}}</h2>
    <h3 class="pre-formatted">{{event.description}}</h3>
    <h3 v-if="event.venue !== null">Taking place at {{event.venue}}</h3>
    <h4 v-if="categoryNames !== null && categoryNames.length > 0">{{categoryNames.join(", ")}}</h4>
    <div id="hostInfo">
      <h3>Hosted by {{event.organizerFirstName}} {{event.organizerLastName}}</h3>
      <img :src="event.organiserPhoto" height="200">
    </div>
    <h5 v-if="attendees.length > 0">Currently {{event.attendeeCount}} users are attending</h5>
    <h5 v-else>Currently no users are attending</h5>
    <h5 v-if="event.capacity">with a maximum attendee count of {{event.capacity}}</h5>
    <div v-if="event.capacity">
      <p>Total capacity reached:</p>
      <div class="progress">
        <div class="progress-bar" role="progressbar" :aria-valuenow="parseInt(event.attendeeCount/event.capacity)*100" aria-valuemin="0"
             aria-valuemax="100" :style="'width: '+(event.attendeeCount/event.capacity)*100+'%'">
          {{ parseInt((event.attendeeCount/event.capacity)*100) }}%
        </div>
      </div>
    </div>
    <h5 v-if="event.isOnline">Available to attend online: use url {{event.url}} to access</h5>
    <h5 v-if="parseFloat(event.fee) > 0">Cost of attendance: ${{event.fee}}</h5>
    <h5 v-else>Free to attend</h5>


    <div class="well">
      <h4>Attendees:</h4>
      <div v-if="attendees.length > 0" class="attendeeInfo">
        <table class="list-group" id="attendeeList">
          <tr class="list-group-item" v-for="attendee in attendees" v-bind:key="attendee.id">
            <Attendee v-bind:attendee="attendee" v-bind:organizer-id="event.organizerId"></Attendee>
          </tr>
        </table>
      </div>
    </div><br>


    <div v-if="isMyEvent">
      <table class="centered">
        <tr><span>You are the organiser of this event</span></tr>
      </table>
    </div>
    <div v-else-if="event.capacity !== attendees.length && isLoggedIn && attendanceStatus==='pending'">
      <table class="centered" v-if="new Date(event.date) > new Date()">
        <tr><span>You have requested to attend this event</span></tr>
        <tr><button @click="removeAttendance()">Remove Request</button></tr>
      </table>
      <table v-else class="centered">
        <tr><span>You requested to attend this event</span></tr>
      </table>
    </div>
    <div v-else-if="isLoggedIn && attendanceStatus==='accepted'">
      <table class="centered" v-if="new Date(event.date) > new Date()">
        <tr><span>You are attending this event</span></tr>
        <tr><button @click="removeAttendance()">Remove Request</button></tr>
      </table>
      <table v-else class="centered">
        <tr><span>You attended this event</span></tr>
      </table>
    </div>
    <div v-else-if="isLoggedIn && attendanceStatus==='rejected'">
      <table class="centered">
        <tr><span>You were rejected from attending this event</span></tr>
      </table>
    </div>
    <div v-else-if="event.capacity !== attendees.length && isLoggedIn">
      <table class="centered" v-if="new Date(event.date) > new Date()">
        <tr><span>You are not attending this event</span></tr>
        <tr><button @click="requestAttendance()">Request Attendance</button></tr>
      </table>
      <table class="centered" v-else>
        <tr><span>You did not attend this event</span></tr>
      </table>
    </div>
    <div v-else-if="!isLoggedIn">
      <table class="centered">
      <tr><span>To request attendance to events, please register an account or log in</span></tr>
    </table>
    </div><br>

    <div class="well">
      <div v-if="similarEvents.length > 0" class="similarEvents">
        <h4>Similar Events to this one include:</h4>
        <table class="list-group" id="eventList">
          <tr class="list-group-item" v-for="simEvent in similarEvents" v-bind:key="simEvent.id">
            <th>{{simEvent.title}}</th>
            <br>
            <th>{{simEvent.date.substr(0,10)}}</th>
          </tr>
        </table>
      </div>
    </div>

    <div v-if="isMyEvent">
      <MyEvent :event="event"></MyEvent>
    </div>
  </div>
</template>

<script>
import Attendee from './components/Attendee'
import MyEvent from "@/MyEvent";

export default {
  name: "OneEvent",

  components: {MyEvent, Attendee},

  data() {
    return {
      event: {},
      categoryNames: null,
      eventId: this.$route.params.eventId,
      similarEvents: [],
      attendees: [],
      defaultUserImage: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Ficons8%2Fandroid%2F256%2FUsers-User-icon.png&f=1&nofb=1',
      isLoggedIn: sessionStorage.getItem("token") !== null,
      attendanceStatus: null,
      isMyEvent: false
    }
  },
  created() {
    this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId).then((response) => {
      this.event = response.data;
      this.isMyEvent = this.event.organizerId == sessionStorage.getItem('id');
      console.log(response.data)
      this.modifyEntries();
      this.getAttendees();
      this.getEventPhotos();
      this.findSimilarEvents();
      this.getCategoryNames();
    })
  },

  mounted() {
  },

  methods: {
    modifyEntries() {
      let dateTime = this.event.date;
      this.event.fullDate = dateTime;
      let date = new Date(dateTime);
      this.event.date = date.toLocaleDateString();
      this.event.time = date.toLocaleTimeString();
      this.event.eventPhoto = 'http://localhost:4941/api/v1/events/' + this.eventId + '/image'
    },
    getAttendees() {
      const userId = sessionStorage.getItem("id");
      this.axios.get('http://localhost:4941/api/v1/events/' + this.eventId + '/attendees', {headers: {'x-Authorization': sessionStorage.getItem('token')}}).then((response) => {
        this.attendees = response.data;
        if (userId !== null) {
          for (let i = 0; i < this.attendees.length; i++) {
            if (this.attendees[i].attendeeId == userId) {
              this.attendanceStatus = this.attendees[i].status;
              break;
            }
          }
        }
      }).catch(() => {
        alert("Sorry, something went wrong retrieving information from the back-end");
        this.$router.push('/');
      });
    },
    getEventPhotos() {
      this.axios.get('http://localhost:4941/api/v1/users/' + this.event.organizerId + '/image').then(() => {
        this.event.organiserPhoto = 'http://localhost:4941/api/v1/users/' + this.event.organizerId + '/image';
      }).catch((err) => {
        if (err.response.status == 404) {
          this.event.organiserPhoto = this.defaultUserImage;
        }
      })
    },

    getCategoryNames() {
      this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
        let categoryNames = [];
        for (let i = 0; i < this.event.categories.length; i++) {
          const categoryId = this.event.categories[i];
          for (let j = 0; j < response.data.length; j++) {
            if (response.data[j].id === categoryId) {
              categoryNames.push(response.data[j].name);
              break;
            }
          }
        }
        this.categoryNames = categoryNames;
      }).catch((err) => {
        console.log(err)
        alert("Something went wrong when getting the category names")
      })
    },

    findSimilarEvents() {
      const categories = this.event.categories;
      let url = 'http://localhost:4941/api/v1/events?categoryIds[]='+categories[0];

      let i = 1;
      while (i < categories.length) {
        url += '&categoryIds[]='+categories[i];
        i++;
      }
      this.axios.get(url).then((response) => {
        for (let i=0; i < response.data.length; i++) {
          console.log(response.data[i]);
          if (response.data[i].eventId != this.eventId) {
            this.similarEvents.push(response.data[i]);
          }
        }

      }).catch(() => {
        alert("Sorry, something went wrong retrieving information from the back-end");
        this.$router.push('/');
      });
    },

    requestAttendance() {
      this.axios.post('http://localhost:4941/api/v1/events/'+this.eventId+'/attendees', {}, {headers: {'X-Authorization': sessionStorage.getItem('token')}})
      .then(() => {
        this.$router.go();
      }).catch((err) => {
        console.log(err.response)
        if (err.response.status === 403) {
          alert("Sorry," + err.response.statusText.split(':')[1])
        }
      })
    },
    removeAttendance() {
      this.axios.delete('http://localhost:4941/api/v1/events/'+this.eventId+'/attendees', {headers: {'X-Authorization': sessionStorage.getItem('token')}})
          .then(() => {
            this.$router.go();
          }).catch(() => {
        alert("Sorry, something went wrong retrieving information from the back-end");
        this.$router.push('/');
      });
    }
  }
}
</script>

<style scoped>
.list-group {
  width: 500px;
}
.pre-formatted {
  white-space: pre-wrap;
}
.centered {
  margin-left: auto;
  margin-right: auto;
}

.attendeeInfo #attendeeList {
  margin-left: auto;
  margin-right: auto;
}

.similarEvents #eventList {
  margin-left: auto;
  margin-right: auto;
}
.progress {
  width: 300px;
  margin-left: auto;
  margin-right: auto;
}
.progress-bar {
  min-width: 2em;
}
.well {
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}
</style>