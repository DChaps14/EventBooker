<template>
  <div v-if="attending !== null" class="card">
    <div class="well">
      <div class="card-body">
        <img :src="result.imageURL" class="card-img-top" id="result_img" height="250">
        <h4 class="card-title">{{result.title}}</h4>
        <h5 class="card-subtitle">{{result.date}}, {{result.time}}</h5>
        <p class="card-text">Number of Attendees: {{result.numAcceptedAttendees}}</p>
        <p class="card-text">Categories: {{result.categoryNames.join(", ")}}</p>
        <p class="card-text">Organised by: {{result.organizerFirstName}} {{result.organizerLastName}}</p>
        <OrganiserImage v-bind:event="result"></OrganiserImage>
        <router-link v-if="myEvent() == true" id="linkToMyEvent" :to="{name: 'myEvent', params: {eventId: result.eventId}}">
          <button>
            View My Event
          </button>
        </router-link>
        <router-link v-else id="linkToEvent" :to="{name: 'event', params: {eventId: result.eventId}}">
          <button>
            View Event
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import OrganiserImage from "@/components/OrganiserImage";

export default {
name: "EventAttending",
  components: {OrganiserImage},
  props: ['result'],
  data() {
    return {
      loggedIn: false,
      organizerId: null,
      attending: null
    }
  },
  created() {
    this.attendingEvent()
  },
  mounted() {
    if (sessionStorage.getItem("id")) {
      this.loggedIn = true;
    }
  },
  methods: {
    attendingEvent() {
      this.axios.get('http://localhost:4941/api/v1/events/'+this.$props.result.eventId+"/attendees")
          .then((response) => {
            for (let i=0; i<response.data.length; i++) {
              console.log(response.data[i].attendeeId)
              if (response.data[i].attendeeId == sessionStorage.getItem('id')) {
                this.attending = true;
                break;
              }
            }
          }).catch(() => {
            this.attending = null;
      });
    },
    myEvent() {
      this.axios.get('http://localhost:4941/api/v1/events/'+this.$props.result.eventId)
          .then((response) => {
            this.organizerId = response.data.organizerId;
            if (this.loggedIn && response.data.organizerId == sessionStorage.getItem('id')) {
              return true
            } else {
              return false
            }
          }).catch(() => {
        return false
      })
    }
  }
}
</script>

<style scoped>
.card{
  float: none;
  margin-top: 30px;
  margin-bottom: 30px;
}

#result_img {
  margin: 0 auto;
  float: none;
}

#linkToEvent {
  color: black;
}
.well {
  width: 40%;
  margin-left: auto;
  margin-right: auto;
}
button {
  border-radius: 4px;
  padding: 6px 14px;
  background-color: #4CAF50;
  color: whitesmoke;
}
</style>