<template>
  <div>
    <h3>Events I'm Organising</h3>
    <div id="events">
      <SearchResult v-for="event in events" v-bind:key="event.id" v-bind:result="event"></SearchResult>
    </div>
  </div>
</template>

<script>
import SearchResult from "@/components/SearchResult";

export default {
name: "Organising",
  components: {
    SearchResult
  },
  data() {
    return {
      events: []
    }
  },
  created() {
    const userId = sessionStorage.getItem("id")
    if (userId === null || sessionStorage.getItem("token") === null) {
      alert("Whoops! Looks like you aren't logged in at the moment. Please log to visit this page");
      this.$router.push("/")
    }
    this.axios.get('http://localhost:4941/api/v1/events?organizerId='+userId)
    .then((response) => {
          this.getCategoryNames(response.data).then(() => {
            this.modifyEvents(response.data)
      }).catch(() => {
            alert("Sorry, something went wrong retrieving information from the back-end");
            this.$router.push('/');
          });
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });
  },

  methods: {

    modifyEvents(resultList) {
      console.log(resultList)
      let modifiedResults = [];
      for (let i=0; i < resultList.length; i++) {
        let result = resultList[i];
        let dateTime = new Date(result.date);
        result.fullDate = dateTime;
        result.date = dateTime.toLocaleDateString();
        result.time = dateTime.toLocaleTimeString();
        result.imageURL = 'http://localhost:4941/api/v1/events/'+result.eventId+'/image'
        console.log(result.categoryNames);
        modifiedResults.push(result);
      }
      console.log(modifiedResults)
      this.events = modifiedResults;
    },

    async getCategoryNames(data) {
      for (let a = 0; a < data.length; a++) {
        let result = data[a]
        await this.axios.get('http://localhost:4941/api/v1/events/categories')
            .then((response) => {
              let categoryNames = [];
              for (let i = 0; i < result.categories.length; i++) {
                const categoryId = result.categories[i];
                for (let j = 0; j < response.data.length; j++) {
                  if (response.data[j].id == categoryId) {
                    categoryNames.push(response.data[j].name);
                    break;
                  }
                }
              }
              console.log(categoryNames)
              result.categoryNames = categoryNames;
            }).catch(() => {
              alert("Sorry, something went wrong retrieving information from the back-end");
              this.$router.push('/');
            });
      }
    }
  }
}
</script>

<style scoped>

</style>