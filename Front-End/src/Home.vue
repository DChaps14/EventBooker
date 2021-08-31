<template>
  <div>
    <h4>Home Page</h4>
    <h2>Welcome to Eventful!</h2>
  </div>
</template>

<script>
export default {
name: "Home.vue",

  created() {
    if (sessionStorage.getItem('refreshed')) {
      sessionStorage.removeItem('refreshed')
    } else {
      sessionStorage.setItem('refreshed', "true");
      this.$router.go();
    }
  }
}
</script>

<style scoped>

</style>