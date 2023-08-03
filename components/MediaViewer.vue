<template>
  <video
    class="mediaviewer"
    v-if="file && isVideo(file)"
    :src="file.path"
    autoplay
    muted
    loop
  ></video>
  <img v-else-if="file && isImage(file)" :src="file.path" class="mediaviewer" />
</template>
<script>
export default {
  props: ["file"],
  methods: {
    isVideo(file) {
      if (["mp4", "mov", "webm"].includes(file.ext)) return true;
      return false;
    },
    isImage(file) {
      if (["png", "jpg", "jpeg", "gif", "svg"].includes(file.ext)) return true;
      return false;
    },
  },
};
</script>
<style lang="scss">
.mediaviewer {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
