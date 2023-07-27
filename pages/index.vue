<template>
  <div
    class="display"
    :style="`width:${displayRes.w}px;height:${displayRes.h}px;`"
  >
    <div class="buttons">
      <button @click="getData">Get Data</button>
      <button @click="state = 'leaderboard'">Leaderboard</button>
      <button @click="state = 'ads'">Ads</button>
    </div>
    <div class="leaderboard" :class="{ show: state == 'leaderboard' }">
      <div class="header">Leaderboard</div>
      <div class="entries">
        <div
          v-for="(entry, index) in entries"
          :key="index"
          class="entry"
          :style="`transition: all 0.6s ${index * 0.2}s ease;`"
        >
          <span class="name">{{ entry.name }} {{ entry.surname }}</span>
          <span class="score">{{ entry.Score }}</span>
        </div>
      </div>
      <img src="~/assets/images/adidas-logo.png" alt="" class="logo" />
    </div>
    <div class="ads"></div>
  </div>
</template>

<script>
export default {
  data() {
    return { displayRes: { w: 900, h: 1080 }, entries: [], state: "" };
  },
  methods: {
    async getData() {
      let { data } = await this.$axios.get("/api/data");
      console.log(data);
      this.entries = data;
      this.state = "leaderboard";
    },
  },
};
</script>
<style lang="scss">
@font-face {
  font-family: TeXGyreAdventor;
  src: url("@/assets/fonts/texgyreadventor-regular.otf") format("opentype");
}
@font-face {
  font-family: TeXGyreAdventor;
  font-weight: bold;
  src: url("@/assets/fonts/texgyreadventor-bold.otf") format("opentype");
}

body {
  background: #000;
  margin: 0;
  font-family: TeXGyreAdventor;
}
.display {
  position: absolute;
  background: #fff;
  overflow: hidden;
  .buttons {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;
    opacity: 0;
  }
  .leaderboard {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transition: all 1s ease;

    background: rgb(0, 71, 135);
    background: radial-gradient(
      circle,
      rgba(0, 71, 135, 1) 0%,
      rgba(0, 28, 81, 1) 100%
    );
    color: #fff;
    &.show {
      opacity: 1;
      .entries .entry {
        transform: translateX(0px);
        opacity: 1;
      }
    }
    .header {
      font-size: 120px;
      text-align: center;
      margin: 50px 0 100px 0;
      font-weight: bold;
    }
    .entries {
      display: flex;
      flex-direction: column;
      width: 70%;
      gap: 20px;
      .entry {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 30px;
        height: 50px;
        font-size: 48px;
        border: 1px #888 solid;
        border-radius: 30px;
        transform: translateX(1000px);
        opacity: 0;
      }
    }
    .logo {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 160px;
      filter: invert(1);
    }
  }
  .ads {
  }
}
</style>
