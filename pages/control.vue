<template>
  <div class="container">
    <div class="stats">
      <h2>Total Users: {{ entries?.length }}</h2>
      <h2>Finished Users: {{ finishedUsers }}</h2>
    </div>
    <div class="header my-2">
      <b-form-input
        v-model="searchString"
        @input="filterEntries()"
        placeholder="Search"
      ></b-form-input>
      <b-button class="reload" variant="primary" @click="getData()"
        >Reload</b-button
      >
    </div>
    <b-table
      :items="filteredEntries"
      :fields="fields"
      sticky-header
      @row-clicked="rowClicked"
    >
      <template #cell(timestamp)="row">
        <template v-if="row.item.timestamp">
          {{ new Date(row.item.timestamp * 1000).toLocaleTimeString() }}
          {{
            new Date(row.item.timestamp * 1000).toLocaleDateString()
          }}</template
        ></template
      >
    </b-table>
    <b-modal id="highlightModal" title="Highlight user?" :hide-footer="true">
      <h3>{{ highlightUser?.name }} {{ highlightUser?.surname }}</h3>
      <b-button variant="primary" @click="hightlightOptionSelected(true)"
        >Yes</b-button
      >
      <b-button @click="hightlightOptionSelected(false)">No</b-button>
    </b-modal>
  </div>
</template>
<script>
export default {
  computed: {
    finishedUsers() {
      return this.entries?.filter((entry) => !!entry.finished)?.length;
    },
  },
  data() {
    return {
      socket: null,
      entries: [],
      filteredEntries: [],
      searchString: "",
      highlightUser: null,
      fields: [
        { key: "adidasid", sortable: true },
        { key: "name", sortable: true },
        { key: "surname", sortable: true },
        { key: "total", sortable: true },
        { key: "timestamp", sortable: true },
      ],
    };
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      reconnection: true,
      teardown: false,
      transports: ["websocket"],
    });
    this.socket.on("updatedEntries", (entries) => {
      console.log(entries);
      this.entries = entries;
      this.filterEntries();
    });

    this.getData();
  },
  methods: {
    async getData() {
      let { data } = await this.$axios.get("/api/alldata");
      this.entries = data;
      this.filterEntries();
    },
    filterEntries() {
      if (this.searchString == "") return (this.filteredEntries = this.entries);
      this.filteredEntries = this.entries.filter((entry) =>
        JSON.stringify(entry)
          .toLowerCase()
          .includes(this.searchString.toLowerCase())
      );
    },
    rowClicked(item) {
      this.highlightUser = item;
      this.$bvModal.show("highlightModal");
    },
    hightlightOptionSelected(option) {
      if (option) {
        this.socket.emit("highlightUser", this.highlightUser);
      }
      this.$bvModal.hide("highlightModal");
    },
  },
};
</script>
<style lang="scss">
.container {
  padding: 10px 0px;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  .stats {
    display: flex;
    gap: 50px;
  }
  .header {
    display: flex;
    gap: 20px;
    .reload {
      min-width: 100px;
    }
  }
  .b-table-sticky-header {
    flex-grow: 1;
    max-height: none;
  }
}
</style>
