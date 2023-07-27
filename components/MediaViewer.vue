<template>
  <video
    v-if="file && isVideo(file)"
    :src="file.path"
    autoplay
    muted
    loop
  ></video>
  <img v-else-if="file && isImage(file)" :src="file.path" />
</template>
<script>
export default {
  props: ["file"],
  methods: {
    isVideo(file) {
      if (["mp4", "mov"].includes(file.ext)) return true;
      return false;
    },
    isImage(file) {
      if (["png", "jpg", "jpeg", "gif", "svg"].includes(file.ext)) return true;
      return false;
    },
  },
};
</script>
