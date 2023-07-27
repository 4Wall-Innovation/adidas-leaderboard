<template>
  <div
    class="display"
    :style="`width:${displayRes.w}px;height:${displayRes.h}px;`"
    @click="run()"
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
          :style="`transition-delay: ${
            state == 'leaderboard' ? 1 + index * 0.2 : index * 0.06
          }s;`"
        >
          <span class="position">{{ index + 1 }}.</span>
          <span class="name">{{ entry.name }} {{ entry.surname }}</span>
          <div class="score">
            <AnimatedInteger :number="entry.Score" />
          </div>
        </div>
      </div>
      <img src="~/assets/images/adidas-logo.png" alt="" class="logo" />
    </div>
    <div class="ads" :class="{ show: state == 'ads' }">
      <MediaViewer :file="adData" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      displayRes: { w: 1024, h: 512 },
      entries: [],
      adData: {},
      state: "",
      auto: true,
      leaderboardSeconds: 10,
      adSeconds: 10,
      timeout: null,
    };
  },
  mounted() {
    this.run();
  },
  methods: {
    async run() {
      clearTimeout(this.timeout);
      await this.changeState();
      if (this.auto) {
        this.timeout = setTimeout(() => {
          this.run(true);
        }, (this.state == "leaderboard" ? this.leaderboardSeconds : this.adSeconds) * 1000);
      }
    },
    async getData() {
      try {
        let { data } = await this.$axios.get("/api/data");
        this.entries = data;
      } catch (error) {
        console.error(error);
      }
    },
    clearLeaderboard() {
      this.entries = [];
    },
    async getAd() {
      try {
        let { data } = await this.$axios.get("/api/ad");
        if (!data) throw "No data";
        this.adData = data;
      } catch (error) {
        console.error(error);
      }
    },
    async changeState(state) {
      if (!state) {
        if (this.state == "leaderboard") state = "ads";
        else state = "leaderboard";
      }
      if (state == "leaderboard") {
        await this.getData();
        await new Promise((r) => setTimeout(r, 250));
        this.state = "leaderboard";
      } else if (state == "ads") {
        await this.getAd();
        this.state = "ads";
        await new Promise((r) => setTimeout(r, 1000));
        this.clearLeaderboard();
      }
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
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transition: all 0.6s 0.2s ease;
    z-index: 1;

    background: rgb(0, 71, 135);
    background: radial-gradient(
      circle,
      rgba(0, 71, 135, 1) 0%,
      rgba(0, 28, 81, 1) 100%
    );
    color: #fff;
    &.show {
      transition: all 1s 0s ease;
      opacity: 1;
      .entries .entry {
        transition: all 0.6s ease;
        transform: translateX(0px);
        opacity: 1;
      }
      .logo {
        transition: 1s 2.5s all ease;
        opacity: 1;
      }
    }
    .header {
      font-size: 60px;
      text-align: center;
      margin: 10px 0 20px 0;
      font-weight: bold;
    }
    .entries {
      display: flex;
      flex-direction: column;
      width: 70%;
      gap: 10px;
      .entry {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 30px;
        height: 50px;
        font-size: 28px;
        border: 1px #fff solid;
        border-radius: 30px;
        transform: translateX(1000px);
        opacity: 0;
        .position {
          width: 200px;
        }
        .score {
          display: flex;
          justify-content: flex-end;
          width: 200px;
        }
      }
    }
    .logo {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 86px;
      filter: invert(1);
      transition: 1s 0s all ease;
      opacity: 0;
    }
  }
  .ads {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: all 1s ease;
    &.show {
      opacity: 1;
    }
  }
}
</style>
