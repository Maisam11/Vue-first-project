<template>
     <div :class="customClass" :style="customStyle" class="card">
        <div v-if="icon" class="icon my-3 rounded-circle" :style="{ width: '50px', backgroundColor: iconBgColor }">
      <v-icon color="white" font-size="23px">{{ icon }}</v-icon>
    </div>
      <img v-if="image" :src="image" :alt="title" :style="imageStyle" class="card-image" />
  
      <h3 v-if="title" :style="{ color: titleColor, fontWeight: isBold ? 'bold' : 'normal' }" class="card-title py-3">
      {{ title }}
    </h3>
      <p v-if="description" class="card-description">{{ description }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      icon: String,
      iconBgColor: String,
      image: String,
      title: String,
      titleColor: String,
      isBold: Boolean,
      description: String,
      customClass: String,
      customStyle: Object,
      imageStyle: Object,
    },
    
  };
  </script>

  <style scoped>
  .icon{
    padding: 10px 12px;
  }
.card:hover {
  box-shadow: 0px 15px 30px 0px rgba(3, 3, 214, 0.1) !important;
}

.card:hover .icon {
  box-shadow: 1px 1px 10px 2px rgba(53, 65, 159, 0.347);
}
.card-description{
    color: #5c5a6f;
}
</style>