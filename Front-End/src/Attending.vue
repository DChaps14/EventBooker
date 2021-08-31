<template>
  <div>
    <h3>Events I'm Attending</h3>
    <div class="btn-group">
      <div id="filterButton">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Filter By <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a v-for="category in eventCategories" v-bind:key="category.id" v-on:click="setFilter(category)">{{
              category.name
            }}</a></li>
        </ul>
      </div>
      <div id="sortButton">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Sort By <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a v-on:click="setSort('DATE_ASC')">Date (first to last)</a></li>
          <li><a v-on:click="setSort('DATE_DESC')">Date (last to first)</a></li>
          <li><a v-on:click="setSort('ATTENDEES_ASC')">Number of Attendees (Ascending)</a></li>
          <li><a v-on:click="setSort('ATTENDEES_DESC')">Number of Attendees (Descending)</a></li>
        </ul>
      </div>
    </div>
    <div class="filterInfo">
      <h5 id="filtersSelected">Currently selected filters: {{selectedFilterNames.join(", ")}}</h5>
    </div>
    <div id="events">
      <EventAttending v-for="event in events" v-bind:key="event.id" v-bind:result="event"></EventAttending>
    </div>
  </div>
</template>

<script>
import EventAttending from "@/components/EventAttending";

export default {
  name: "Attending",
  components: {EventAttending},
  data() {
    return {
      events: [],
      eventCategories: [],
      selectedFilterNames: [],
      currentSort: 'DATE_ASC',
      currentFilter: [],
      maxPage: 0,
      currentPage: 0,
      totalEvents: 0
    }
  },
  created() {
    if (sessionStorage.getItem('id') === null || sessionStorage.getItem('token') === null) {
      alert("Whoops! Looks like you aren't logged in at the moment. Please log to visit this page");
      this.$router.push("/")
    }
  },
  mounted() {
    this.axios.get('http://localhost:4941/api/v1/events').then((response) => {
      this.totalEvents = response.data.length;
      this.maxPage = Math.floor(this.totalEvents/10)
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });

    this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
      this.eventCategories = response.data;
      this.getEvents();
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });
  },

  methods: {

    setSort(sort) {
      this.currentSort = sort;
      this.getEvents();
    },

    setFilter(category) {
      if (this.currentFilter.includes(category.id)) {
        const index = this.currentFilter.indexOf(category.id);
        this.currentFilter.splice(index, 1);
        this.selectedFilterNames.splice(index, 1);
      } else {
        this.currentFilter.push(category.id);
        this.selectedFilterNames.push(category.name)
      }
      this.currentPage = 0;
      this.getEvents();
    },

    setPage(pageOperation) {
      if (pageOperation == -2|| this.currentPage + pageOperation < 0) {
        this.currentPage = 0
      } else if (pageOperation == 2 || this.currentPage + pageOperation > this.maxPage) {
        this.currentPage = this.maxPage;
      } else {
        this.currentPage += pageOperation;
      }
      this.getEvents();
    },

    getEvents() {
      let url = 'http://localhost:4941/api/v1/events?sortBy='+this.currentSort+'&count=10&startIndex='+(this.currentPage*10);
      let i = 0;
      while (i < this.currentFilter.length) {
        url = url + '&categoryIds[]='+this.currentFilter[i]
        i++;
      }
      this.axios.get(url)
          .then((response) => {
            this.getCategoryNames(response.data).then(() => {
              this.modifyEvents(response.data)
              if (this.currentPage === 0) {
                this.maxPage = Math.floor(response.data.length / 10)
              }
            })
          }, (error) => {
              alert("Sorry, something went wrong retrieving information from the back-end");
              this.$router.push('/');
            console.log(error);
          })
    },

    modifyEvents(resultList) {
      let modifiedResults = [];
      for (let i=0; i < resultList.length; i++) {
        let result = resultList[i];
        let dateTime = new Date(result.date);
        result.fullDate = dateTime;
        result.date = dateTime.toLocaleDateString();
        result.time = dateTime.toLocaleTimeString();
        result.imageURL = 'http://localhost:4941/api/v1/events/'+result.eventId+'/image'
        modifiedResults.push(result);
      }
      this.events = modifiedResults;
    },

    async getCategoryNames(data) {
      for (let a=0; a<data.length;a++) {
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
              result.categoryNames = categoryNames;
            });
      }
    }
  }
}
</script>

<style scoped>

</style>