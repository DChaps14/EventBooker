<template>
  <div class="well">
    <div>
      <img :src="image" height="250">
    </div>
    <div><h2>{{$props.user.firstName}} {{$props.user.lastName}}</h2></div>
    <div>
      <h3>{{$props.user.email}}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyInfo",
  props: {'user': Object},
  data() {
    return {
      image: ""
    }
  },
  created() {
    this.axios.get('http://localhost:4941/api/v1/users/' + this.$props.user.attendeeId + '/image').then(() => {
      this.image = 'http://localhost:4941/api/v1/users/' + this.$props.user.attendeeId + '/image';
    }).catch((err) => {
      if (err.response.status === 404) {
        this.image = 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Ficons8%2Fandroid%2F256%2FUsers-User-icon.png&f=1&nofb=1'
      }
    });
  }
}
</script>

<style scoped>
.well {
  width: 40%;
  margin-left: auto;
  margin-right: auto;
}
</style>