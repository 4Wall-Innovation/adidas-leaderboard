<template>
  <div class="animated__integer" :class="{ pulse }">
    {{ renderNumber(displayNumber) }}
  </div>
</template>

<script>
export default {
  props: { number: { default: 0 }, time: { default: 0.05 } },

  data() {
    return {
      displayNumber: 0,
      interval: false,
      pulse: false,
    };
  },

  ready() {
    this.displayNumber = this.number ? this.number : 0;
  },
  methods: {
    renderNumber(number) {
      return number.toLocaleString("en-US");
    },
  },
  watch: {
    number: {
      immediate: true,
      handler() {
        this.pulse = false;
        clearInterval(this.interval);
        if (this.number < this.displayNumber) {
          return (this.displayNumber = 0);
        } else if (this.number == this.displayNumber) {
          return;
        }

        this.interval = window.setInterval(() => {
          if (this.displayNumber != this.number) {
            this.displayNumber += this.number < this.displayNumber ? -1 : 1;
          } else {
            this.pulse = true;
            clearInterval(this.interval);
          }
        }, (this.time / Math.abs(this.number - this.displayNumber)) * 1000);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.animated__integer {
  &.pulse {
    animation: pulse 1s forwards;
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1);
      }
    }
  }
}
</style>
