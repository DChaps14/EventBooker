<template>
  <div class="attendees">
    <div v-if="attendees.length>1">
      <div v-for="attendee in attendees" v-bind:key="attendee.id">
        <div v-if="attendee.attendeeId != myId">
          <p>{{attendee.firstName}} {{attendee.lastName}}: {{attendee.status}}</p>
          <button v-if="attendee.status !== 'rejected'" @click="changeAttendance('rejected', attendee.attendeeId)">Remove from Event</button>
          <button v-if="attendee.status !== 'accepted'" @click="changeAttendance('accepted', attendee.attendeeId)">Add to Event</button>
        </div>
      </div>
    </div>
    <div v-else>
      <span>No requested attendees yet</span>
    </div>
    <button @click="routeBack()">Back to event</button>
  </div>
</template>

<script>
export default {
name: "ControlAttendance",
  data() {
    return {
      attendees: [],
      myId: sessionStorage.getItem('id')
    }
  },
  created() {
    if (sessionStorage.getItem('id') === null || sessionStorage.getItem('token') === null) {
      alert("Whoops! Looks like you aren't logged in at the moment. Please log to visit this page");
      this.$router.push("/")
    }

    this.axios.get('http://localhost:4941/api/v1/events/'+this.$route.params.eventId+'/attendees', {headers: {'X-Authorization': sessionStorage.getItem("token")}})
    .then((response) => {
      this.attendees = response.data;
    }).catch(() => {
      alert("Sorry! Looks like you can't access this page at the moment");
      this.$router.push("/")
    })
  },
  methods: {
    changeAttendance(status, id) {
      this.axios.patch('http://localhost:4941/api/v1/events/'+this.$route.params.eventId+'/attendees/'+id,
          {"status":status}, {headers: {'X-Authorization': sessionStorage.getItem("token")}})
      .catch((err) => {
          alert("Sorry, something went wrong retrieving information from the back-end");
          this.$router.push('/');
          console.log(err)
        });
    },
    routeBack() {
      this.$router.back();
    }
  }
}
</script>

<style scoped>

</style>