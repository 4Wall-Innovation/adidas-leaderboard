<template>
  <div class="container">
    <h2>New Entry</h2>
    <b-form-input
      v-model="user.adidasid"
      placeholder="Adidas Id"
    ></b-form-input>
    <b-form-input v-model="user.name" placeholder="Name"></b-form-input>
    <b-form-input v-model="user.surname" placeholder="Surname"></b-form-input>
    <b-form-input v-model="user.game1" placeholder="Game 1"></b-form-input>
    <b-form-input v-model="user.game2" placeholder="Game 2"></b-form-input>
    <b-form-input v-model="user.game3" placeholder="Game 3"></b-form-input>
    <b-form-input v-model="user.total" placeholder="Total"></b-form-input>

    <b-button class="reload" variant="primary" @click="sendData()"
      >Send</b-button
    >
  </div>
</template>
<script>
export default {
  data() {
    return {
      user: {
        adidasid: "",
        name: "",
        surname: "",
        game1: 0,
        game2: 0,
        game3: 0,
        total: 0,
      },
    };
  },
  mounted() {},
  methods: {
    async sendData() {
      await this.$axios.put("/api/data", this.user);
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
