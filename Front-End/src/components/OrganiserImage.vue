<template>
  <div>
    <img :src="image" height="75">
  </div>
</template>

<script>
export default {
  name: "OrganiserImage",
  props: ['event'],
  data() {
    return {
      image: ""
    }
  },
  created() {
    this.axios.get('http://localhost:4941/api/v1/events/' + this.$props.event.eventId).then((response) => {
      const id = response.data.organizerId;
      this.axios.get('http://localhost:4941/api/v1/users/' + id + '/image').then(() => {
        this.image = 'http://localhost:4941/api/v1/users/' + id + '/image';
      }).catch((err) => {
        if (err.response.status === 404) {
          this.image = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Ficons8%2Fandroid%2F256%2FUsers-User-icon.png&f=1&nofb=1'
        }
      });
    })
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>