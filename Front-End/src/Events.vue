<template>
  <div>
    <div class="btn-group">
      <div id="filterButton">
        <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Filter By <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a v-for="category in eventCategories" v-bind:key="category.id" v-on:click="setFilter(category)">{{
              category.name
            }} <span v-if="selectedFilterNames.includes(category.name)">&#10004;</span></a></li>
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
      <SearchResult v-for="event in events" v-bind:key="event.id" v-bind:result="event"></SearchResult>
    </div>

    <div id="resultsNumber" v-if="events.length > 0">
      <h5 v-if="currentPage === maxPage">Viewing events {{currentPage*10 + 1}} to {{totalEvents}}</h5>
      <h5 v-else>Viewing events {{currentPage*10 + 1}}-{{currentPage*10 + 10}}</h5>
    </div>
    <h5 v-if="events.length > 0" id="pageNumber">Viewing page {{currentPage + 1}} of {{maxPage + 1}}</h5>
    <nav aria-label="Event Pagination">
      <ul class="pagination">
        <template v-if="currentPage !== 0 ">
          <li class="page-item"><button class="page-link" v-on:click="setPage(-2)">First</button></li>
          <li class="page-item"><button class="page-link" v-on:click="setPage(-1)">Previous</button></li>
        </template>

        <template v-if="currentPage !== maxPage">
          <li class="page-item"><button class="page-link" v-on:click="setPage(1)">Next</button></li>
          <li class="page-item"><button class="page-link" v-on:click="setPage(2)">Last</button></li>
        </template>
      </ul>
    </nav>
  </div>
</template>

<script>
import SearchResult from "@/components/SearchResult";

export default {
  name: "Events",
  components: {SearchResult},
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
  mounted() {
    this.axios.get('http://localhost:4941/api/v1/events').then((response) => {
      this.totalEvents = response.data.length;
      this.maxPage = Math.floor(this.totalEvents/10)
    }).catch(() => {
      alert("Sorry, something went wrong retrieving event information");
      this.$router.push('/');
    });

    this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
      this.eventCategories = response.data;
      this.getEvents();
    }).catch(() => {
      alert("Sorry, something went wrong retrieving event information");
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
          }).catch(() => {
            alert("Sorry, something went wrong retrieving event information");
            this.$router.push('/');
      });
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
            }).catch(() => {
              alert("Sorry, something went wrong retrieving event information");
              this.$router.push('/');
            });
      }
    }
  }
}
</script>

<style scoped>
  .dropdown {
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 20px;
    align-self: start;
  }
  .pagination {
    margin-left: 50px;
  }
  button {
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #4CAF50;
    color: whitesmoke;
  }
</style>