<template>
  <div
    class="display"
    :style="`width:${displayRes.w}px;height:${displayRes.h}px;`"
    @click="run()"
  >
    <video
      v-if="runNewLeaderboard"
      src="videos/newLeaderboard.webm"
      autoplay
      muted
      class="new__leaderboard"
    ></video>
    <div
      v-if="runSurpriseWinner"
      class="surprise__winner"
      :class="{
        badge0: highlightedUser?.badge == 0,
        badge1: highlightedUser?.badge == 1,
        badge2: highlightedUser?.badge == 2,
      }"
    >
      <video
        v-if="highlightedUser?.badge == 0"
        src="videos/fast.webm"
        autoplay
        muted
      ></video>
      <video
        v-else-if="highlightedUser?.badge == 1"
        src="videos/superFast.webm"
        autoplay
        muted
      ></video>
      <video
        v-else-if="highlightedUser?.badge == 2"
        src="videos/crazyFast.webm"
        autoplay
        muted
      ></video>

      <div class="surprise__name">
        {{ highlightedUser?.name }} {{ highlightedUser?.surname }}
      </div>
      <div class="surprise__plaque">
        <div class="name">
          {{ highlightedUser?.name }} {{ highlightedUser?.surname }}
        </div>
        <div class="you__are">you are</div>
        <div class="games">
          <div class="game">
            {{ renderTime(highlightedUser?.game1) }}
            <div class="unit">CS</div>
          </div>
          <div class="game">
            {{ renderTime(highlightedUser?.game2) }}
            <div class="unit">CFF</div>
          </div>
          <div class="game">
            {{ renderTime(highlightedUser?.game3) }}
            <div class="unit">XC</div>
          </div>
        </div>
        <div class="total">
          <div class="number">{{ renderNumber(highlightedUser?.total) }}</div>
          <div class="unit">POINTS</div>
        </div>
      </div>
    </div>

    <div class="leaderboard" :class="{ show: state == 'leaderboard' }">
      <video
        src="videos/header.webm"
        ref="headerVideo"
        autoplay
        muted
        class="header"
      ></video>

      <div class="entries">
        <div class="table__header">
          <div class="gap"></div>
          <div class="column__header">CS</div>
          <div class="column__header">CFF</div>
          <div class="column__header">XC</div>
          <div class="column__header">POINTS</div>
        </div>
        <div class="top__three">
          <div
            v-for="(entry, index) in topThreeEntries"
            :key="`entry-${index}`"
            class="entry"
          >
            <div class="entry__row">
              <span class="position">{{ entry.position }}</span>
              <span class="name">{{ entry.name }} {{ entry.surname }}</span>
              <div class="game__time">{{ renderTime(entry.game1) }}</div>
              <div class="game__time">{{ renderTime(entry.game2) }}</div>
              <div class="game__time">{{ renderTime(entry.game3) }}</div>
              <div class="score">
                {{ renderNumber(entry.total) }}
              </div>
            </div>
          </div>
        </div>
        <div
          v-for="(entry, index) in entries"
          :key="`entry-${index}`"
          class="entry"
        >
          <div class="entry__row">
            <span class="position">{{ entry.position }}</span>
            <span class="name">{{ entry.name }} {{ entry.surname }}</span>
            <div class="game__time">{{ renderTime(entry.game1) }}</div>
            <div class="game__time">{{ renderTime(entry.game2) }}</div>
            <div class="game__time">{{ renderTime(entry.game3) }}</div>
            <div class="score">
              {{ renderNumber(entry.total) }}
            </div>
          </div>
          <img
            v-if="index < 6"
            class="divider"
            src="~/assets/images/divider.png"
            alt=""
          />
        </div>
      </div>
      <div v-show="tickerEntries.length > 0" class="ticker">
        <img class="divider" src="~/assets/images/dividerGreen.png" alt="" />
        <div ref="tickerSlider" class="ticker__slider">
          <div
            v-for="(tickerEntry, index) in tickerEntries"
            :key="`tickerEntry-${index}`"
            class="ticker__entry"
          >
            <span class="position">{{ tickerEntry.position }}</span>
            <span class="name"
              >{{ tickerEntry.name }} {{ tickerEntry.surname }}</span
            >
            <div class="game__time">{{ renderTime(tickerEntry.game1) }}</div>
            <div class="game__time">{{ renderTime(tickerEntry.game2) }}</div>
            <div class="game__time">{{ renderTime(tickerEntry.game3) }}</div>
            <div class="score">
              {{ renderNumber(tickerEntry.total) }}
            </div>
          </div>
        </div>
        <img class="divider" src="~/assets/images/dividerGreen.png" alt="" />
      </div>
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
      socket: null,
      displayRes: { w: 768, h: 512 },
      entries: [],
      topThreeEntries: [],
      tickerEntries: [],
      runNewLeaderboard: false,
      runSurpriseWinner: false,
      adData: {},
      state: "",
      auto: true,
      leaderboardSeconds: 27.5,
      adSeconds: 24,
      tickerPreDelaySeconds: 8,
      timeout: null,
      highlightedUser: null,
      tickerAnimations: [],
    };
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      reconnection: true,
      teardown: false,
      transports: ["websocket"],
    });
    this.socket.on("highlightUser", this.highlightUser);
    this.run();
    this.highlightUser({ name: "Jake" });
  },
  methods: {
    async highlightUser(user) {
      this.highlightedUser = user;
      this.runSurpriseWinner = true;
      await new Promise((r) => setTimeout(r, 22000));
      this.runSurpriseWinner = false;
    },
    async runAnimationNewLeaderboard() {
      this.runNewLeaderboard = true;
      await new Promise((r) => setTimeout(r, 10000));
      this.runNewLeaderboard = false;
    },
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
        let {
          entries,
          topThreeEntries,
          tickerEntries,
          topTenUpdates,
          topTenUpdated,
        } = data;
        this.entries = entries;
        this.topThreeEntries = topThreeEntries;
        if (topTenUpdated) this.runAnimationNewLeaderboard();
        if (tickerEntries) {
          this.tickerEntries = tickerEntries;
          this.runTicker(this.tickerEntries.length);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async runTicker(numOfEntries) {
      let tickerEl = this.$refs.tickerSlider;
      tickerEl.style.transform = "translateX(0px)";
      await new Promise((r) =>
        setTimeout(r, this.tickerPreDelaySeconds * 1000)
      );

      if (numOfEntries <= 1) return;

      let timing = {
        delay: 0,
        duration: 600,
        iterations: 1,
        easing: "ease",
        fill: "forwards",
      };
      for (let index = 0; index < numOfEntries; index++) {
        timing.delay =
          (index + 1) *
          (((this.leaderboardSeconds - this.tickerPreDelaySeconds) * 1000) /
            numOfEntries);
        let steps = [
          { transform: `translateX(${index * -1200}px)` },
          { transform: `translateX(${(index + 1) * -1200}px)` },
        ];
        let tickerAnimation = tickerEl.animate(steps, timing);
        this.tickerAnimations.push(tickerAnimation);
      }
    },
    renderTime(milliseconds) {
      return `${Math.round((milliseconds / 1000) * 100) / 100}"`;
    },
    renderNumber(number) {
      if (number != undefined) return number.toLocaleString("en-US");
      return "";
    },
    resetLeaderboard() {
      this.entries = [];
      for (let animation of this.tickerAnimations) {
        animation.pause();
      }
      this.tickerAnimations = [];
    },

    async changeState(state) {
      if (!state) {
        if (this.state == "leaderboard") state = "ads";
        else state = "leaderboard";
      }
      if (state == "leaderboard") {
        await this.getData();
        let headerVideo = this.$refs.headerVideo;
        headerVideo.currentTime = 0;
        headerVideo.play();
        await new Promise((r) => setTimeout(r, 250));
        this.state = "leaderboard";
        await new Promise((r) => setTimeout(r, 1000));
        this.adData = {};
      } else if (state == "ads") {
        this.adData = { filename: "1", ext: "webm", path: "/ads/1.webm" };
        this.state = "ads";
        await new Promise((r) => setTimeout(r, 1000));
        this.resetLeaderboard();
      }
    },
  },
};
</script>
<style lang="scss">
@font-face {
  font-family: adineuePRO;
  src: url("@/assets/fonts/adineuePRO-Regular.otf") format("opentype");
}
@font-face {
  font-family: adineuePRO;
  font-weight: bold;
  src: url("@/assets/fonts/adineuePRO-Bold.otf") format("opentype");
}
@font-face {
  font-family: adineuePRO;
  font-weight: bold;
  font-style: italic;
  src: url("@/assets/fonts/adineuePRO-BoldItalic.otf") format("opentype");
}
@font-face {
  font-family: adineuePRO;
  font-weight: bolder;
  src: url("@/assets/fonts/adineuePRO-Black.otf") format("opentype");
}
@font-face {
  font-family: adineuePRO;
  font-weight: lighter;
  src: url("@/assets/fonts/adineuePRO-Light.otf") format("opentype");
}
body {
  background: #fff;
  margin: 0;
  font-family: adineuePRO;
}
.display {
  position: absolute;
  background: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .new__leaderboard {
    position: absolute;
    z-index: 22;
  }
  .surprise__winner {
    position: absolute;
    z-index: 25;
    .surprise__name {
      position: absolute;
      top: 200px;
      left: 50px;
      text-align: center;
      z-index: 20;
      width: 668px;
      z-index: 20;
      opacity: 0;
      font-weight: bolder;
      font-style: italic;
      font-size: 64px;
      animation: surpriseNameSlide 4s 7.5s forwards;
    }
    &.badge0 {
      .surprise__name {
        color: #000;
      }
    }
    &.badge1 {
      .surprise__name {
        color: #b7e747;
      }
    }
    &.badge2 {
      .surprise__name {
        color: #000;
      }
    }
    @keyframes surpriseNameSlide {
      0% {
        opacity: 0;
        transform: translateX(-200px);
      }
      10% {
        opacity: 1;
        transform: translateX(0px);
      }
      90% {
        opacity: 1;
        transform: translateX(0px);
      }
      100% {
        opacity: 0;
        transform: translateX(200px);
      }
    }
    .surprise__plaque {
      position: absolute;
      top: 50px;
      width: 400px;
      height: 400px;
      left: 184px;
      color: #fff;
      opacity: 0;
      overflow: hidden;
      width: 0px;
      animation: surprisePlaqueReveal 7s 13s forwards;

      .name {
        position: absolute;
        top: 63px;
        left: 100px;
        text-align: center;
        width: 200px;
        font-weight: bold;
        font-style: italic;
        font-size: 24px;
      }
      .you__are {
        position: absolute;
        top: 88px;
        left: 100px;
        text-align: center;
        width: 200px;
        color: #b7e747;
        font-style: italic;
        font-weight: bold;
      }
      .games {
        position: absolute;
        top: 242px;
        left: 85px;
        text-align: right;
        width: 100px;
        font-weight: bold;
        .game {
          display: flex;
          justify-content: flex-end;
          gap: 2px;
          height: 20px;

          .unit {
            color: #b7e747;
            width: 32px;
            text-align: center;
          }
        }
      }
      .total {
        position: absolute;
        top: 243px;
        left: 219px;
        text-align: left;
        width: 100px;

        .number {
          font-weight: bold;
          font-size: 34px;
          font-weight: bold;
          line-height: 35px;
        }
        .unit {
          color: #b7e747;
          font-weight: bold;
        }
      }
    }

    @keyframes surprisePlaqueReveal {
      0% {
        opacity: 0;
        width: 0px;
      }
      10% {
        opacity: 1;
      }
      30% {
        width: 600px;
      }
      92% {
        opacity: 1;
      }
      100% {
        opacity: 0;
        width: 600px;
      }
    }
  }

  .highlight {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    padding: 100px;
    background: #0008;
    opacity: 0;
    transition: 0.5s all ease;
    &.show {
      opacity: 1;
      .container {
        transform: scale(1);
      }
    }
    .container {
      transform: scale(0);
      transition: 0.5s all ease;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      border-radius: 20px;
      background: #fff;
      .title {
        font-size: 60px;
        font-weight: bold;
      }
      .name {
        font-size: 72px;
      }
    }
  }
  .leaderboard {
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transition: all 0.4s 0.2s ease;
    z-index: 1;
    color: #fff;
    background: #000;
    .header {
      position: absolute;
      top: -26px;
    }

    &.show {
      transition: all 0.4s 0s ease;
      opacity: 1;
    }

    .entries {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 130px;
      position: relative;
      z-index: 3;
      width: 100%;
      height: 100%;
      .table__header {
        display: flex;
        width: 600px;
        color: #b7e747;
        .gap {
          width: 260px;
        }
        .column__header {
          width: 80px;
          letter-spacing: 1.4px;
        }
      }

      .entry {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: normal;
        font-size: 14px;
        height: 27px;
        min-height: 27px;
        .entry__row {
          display: flex;
          width: 600px;

          .position {
            width: 25px;
            margin-right: 35px;
            text-align: right;
            font-weight: bold;
          }
          .name {
            width: 200px;
            font-weight: bold;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            width: 190px;
            margin-right: 10px;
          }
          .game__time {
            width: 80px;
            letter-spacing: 2px;
          }
          .score {
            letter-spacing: 2px;
            font-weight: bold;
          }
        }
      }
      .top__three {
        .entry {
          font-size: 21px;
          margin-bottom: 2px;
          height: 31.5px;
          min-height: 31.5px;
          .position {
            color: #b7e747;
            font-weight: bold;
            font-style: italic;
          }
          .name {
            font-weight: bold;
            font-style: italic;
          }
        }
        margin-bottom: 6px;
      }
      .divider {
        margin: 2px 0px;
      }
    }
    .ticker {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      height: 100%;
      .ticker__slider {
        display: flex;
        justify-content: left;
        gap: 600px;
        margin-left: 84px;
        transform: translateX(0px);

        .ticker__entry {
          display: flex;
          align-items: center;
          font-weight: normal;
          font-size: 24px;
          width: 600px;
          min-width: 600px;

          .position {
            width: 25px;
            margin-right: 35px;
            text-align: right;
            color: #b7e747;
            font-weight: bold;
            font-style: italic;
          }
          .name {
            width: 190px;
            margin-right: 10px;
            font-weight: bold;
            font-style: italic;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
          .game__time {
            width: 80px;
            letter-spacing: 2px;
          }
          .score {
            letter-spacing: 2px;
            font-weight: bold;
          }
        }
      }
      .divider {
        position: relative;
      }
    }
  }

  .ads {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 20;
    transition: all 1s ease;
    &.show {
      opacity: 1;
    }
  }
}
</style>
