<template>
    <a @click="goToDetail" class="text-primary text-decoration-none" style="cursor: pointer;">
      {{ item.name }}
    </a>
  </template>
  
  <script>
  export default {
    props: {
      item: { type: Object, required: true },
    },
    methods: {
      goToDetail() {
        this.$router.push({ path: `/user/${this.item.id}` });
      }
    }
  };
  </script>
  