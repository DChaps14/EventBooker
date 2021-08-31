<template>
  <div>
    <h3>Search</h3>
    <div class="searchBar">
      <div>
        <input id="search" type="search" placeholder="Search" v-on:keyup.enter="submitSearch()">
      </div>
      <div>
        <button type="submit" v-on:click="submitSearch()">Search</button>
      </div>
    </div>
    <div class="btn-group" v-if="lastQuery!==''">
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
    <div class="filterInfo" v-if="results.length>0">
      <h5 id="filtersSelected">Currently selected filters: {{selectedFilterNames.join(", ")}}</h5>
    </div>
    <div id="results">
      <SearchResult v-for="result in results" v-bind:key="result.id" v-bind:result="result"></SearchResult>
    </div>
    <div class="pagination-info" v-if="results.length>0">
      <div id="resultsNumber">
        <h5 v-if="currentPage === maxPage">Viewing events {{currentPage*10 + 1}} to {{totalEvents}}</h5>
        <h5 v-else>Viewing events {{currentPage*10 + 1}} to {{currentPage*10 + 10}}</h5>
      </div>
      <h5 id="pageNumber">Page {{currentPage + 1}} of {{maxPage + 1}}</h5>
      <div v-if="maxPage != 0">
        <nav aria-label="Event Pagination">
          <ul class="pagination">
            <template v-if="currentPage !== 0">
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
    </div>
    <div v-else-if="lastQuery!==''">
      <h4>Sorry, no events in our database match your search criteria!</h4>
    </div>
  </div>
</template>

<script>
import SearchResult from "@/components/SearchResult";
export default {
  name: "Search.vue",
  components: {SearchResult},
  data() {
    return {
      results: [],
      lastQuery: "",
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
    this.axios.get('http://localhost:4941/api/v1/events/categories').then((response) => {
      this.eventCategories = response.data;
    }).catch(() => {
      alert("Sorry, something went wrong retrieving information from the back-end");
      this.$router.push('/');
    });
  },
  methods: {

    setSort(sort) {
      this.currentSort = sort;
      console.log(this.currentSort);
      this.currentPage = 0;
      this.submitSearch();
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
      this.submitSearch();
    },

    setPage(pageOperation) {
      if (pageOperation == -2|| this.currentPage + pageOperation < 0) {
        this.currentPage = 0
      } else if (pageOperation == 2 || this.currentPage + pageOperation > this.maxPage) {
        this.currentPage = this.maxPage;
      } else {
        this.currentPage += pageOperation;
      }
      this.submitSearch();
    },

    submitSearch() {
      let query = document.getElementById('search').value;
      query = query.toLowerCase();
      if (query.length < 1) {
        alert("Please provide a search query")
      } else {
        this.lastQuery = query;

        let url = 'http://localhost:4941/api/v1/events?sortBy=' + this.currentSort + '&q=' + query;
        let i = 0;
        while (i < this.currentFilter.length) {
          url = url + '&categoryIds[]=' + this.currentFilter[i]
          i++;
        }

        this.axios.get(url).then((response) => {
          this.totalEvents = response.data.length;
          this.maxPage = Math.floor(this.totalEvents / 10)
        });
        console.log("max page:" +this.maxPage);

        url = url + '&count=10&startIndex=' + (this.currentPage * 10)

        this.axios.get(url)
            .then((response) => {
              this.getCategoryNames(response.data)
              this.modifyResults(response.data)
            }, (error) => {
              console.log(error)
              alert("Sorry, something went wrong retrieving information from the back-end");
              this.$router.push('/');
            });
      }
    },

    modifyResults(resultList) {
      let modifiedResults = [];
      for (let i=0; i < resultList.length; i++) {
        let result = resultList[i];
        let title = result.title.toLowerCase();
        console.log(title);
        if (title.includes(this.lastQuery)) {
          let dateTime = new Date(result.date);
          result.fullDate = dateTime;
          result.date = dateTime.toLocaleDateString();
          result.time = dateTime.toLocaleTimeString();
          result.imageURL = 'http://localhost:4941/api/v1/events/'+result.eventId+'/image'
          console.log(result.categoryNames);
          modifiedResults.push(result);
        }
      }

      this.results = modifiedResults;
    },

    getCategoryNames(data) {
      for (let a=0; a<data.length;a++) {
        let result = data[a]
        let categoryNames = [];
        for (let i = 0; i < result.categories.length; i++) {
          const categoryId = result.categories[i];
          for (let j = 0; j < this.eventCategories.length; j++) {
            if (this.eventCategories[j].id == categoryId) {
              categoryNames.push(this.eventCategories[j].name);
              break;
            }
          }
        }
        result.categoryNames = categoryNames;
      }
    }
  }
}
</script>

<style scoped>
  #search {
    margin-bottom: 20px;
    border: none;
    border-bottom: 2px solid black;
  }
  button {
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #4CAF50;
    color: whitesmoke;
  }
</style>