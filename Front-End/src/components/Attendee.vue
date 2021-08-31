<template>
  <div class="attendee">
    <th><div>
      <img :src="image" height="100">
    </div></th>
    <th><div>
      <span>{{attendee.firstName}} {{attendee.lastName}}</span>
    </div></th>
    <th><div v-if="attendee.attendeeId === organizerId">
      <span>Organiser</span>
    </div>
    <div v-else>
      <span v-if="attendee.status === 'accepted'">Attendee</span>
      <span v-else-if="attendee.status === 'pending'">Attendee (pending approval)</span>
      <span v-else>Rejected</span>
    </div></th>
  </div>
</template>

<script>
export default {
  name: "Attendee",
  props: ['attendee', 'organizerId'],
  data() {
    return {
      image: ""
    }
  },
  created() {
    this.axios.get('http://localhost:4941/api/v1/users/' + this.$props.attendee.attendeeId + '/image').then(() => {
      this.image = 'http://localhost:4941/api/v1/users/' + this.$props.attendee.attendeeId + '/image';
    }).catch((err) => {
      if (err.response.status === 404) {
        this.image = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Ficons8%2Fandroid%2F256%2FUsers-User-icon.png&f=1&nofb=1'
      }
    });
  }
}
</script>

<style scoped>
th {
  padding-left: 15px;
  padding-right: 15px;
}
</style>