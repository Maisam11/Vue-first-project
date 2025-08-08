<template>
    <span>
      {{ item.appointments?.length || 0 }} Appointments
    </span>
  </template>
  
  <script>
  export default {
    props: {
      item: { type: Object, required: true }
    }
  };
  </script>
  