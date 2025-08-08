<template>
  <a :href="`mailto:${item.email}`" style="color: green;">
    {{ item.email }}
  </a>
</template>

<script>
export default {
  props: {
    item: Object,
  },
};
</script>