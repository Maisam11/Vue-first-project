<template>
    <section class="about" id="about">
      <v-container>
        <v-row class="align-items-center">
          <v-col cols="12" md="6" class="text-center text-md-start mb-4 mb-md-0">
            <img :src="aboutbanner" alt="about banner img" class="about-showleft" max-width="500">
          </v-col>
  
          <v-col cols="12" md="6" class="text-md-start">
            <div class="icon about-showright mb-3">
              <v-icon class="white--text" size="40">mdi-cogs</v-icon>
            </div>
            <h2 class="fw-bold about-showright">
              We Repair your all <br /> Smart Devices
            </h2>
            <p class="my-4 about-showright">
              You mug dropped a clanger barmy David brown bread bleeding crikey say <br /> chimney pot me old mucker bugger super the lorem dummy text.
            </p>
            <v-btn class="about-showright" color="#4B4AEF" dark>
              <a href="#" class="text-decoration-none" style="text-transform: none;">Contact Now</a>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </template>
  
  <script>
  export default {
    name: 'AboutComp',
    data(){
      return{
        aboutbanner:"https://www.shutterstock.com/image-vector/mobile-phone-repair-service-perhaps-600w-2545313707.jpg"
      }
    },
  };
  </script>
  
  <style scoped>
  .about {
    padding: 50px 5%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .about-showleft {
    opacity: 0;
    transform: translateX(-100px);
    animation: slideInLeft both;
    animation-timeline: view(60% 0%);
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .about-showright {
    opacity: 0;
    transform: translateX(5%);
    animation: slideInright both;
    animation-timeline: view(60% 0%);
  }
  
  @keyframes slideInright {
    from {
      opacity: 0;
      transform: translateX(5%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  p {
    color: #5c5a6f;
  }
  
  .about .v-btn {
    border-radius: 5px;
    background-color: #4b4aef;
  }
  
  .about .v-btn:hover {
    outline: 1px solid #4b4aef;
    background-color: white !important;
    color: #4b4aef;
  }
  
  .about .v-btn a {
    color: white;
    font-size: 14px;
  }
  
  .about .v-btn:hover a {
    color: #4b4aef;
  }
  
  .about .icon i {
    background-color: #4b4aef;
    border-radius: 50%;
    color: white;
    padding: 7px 8px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .about img {
    width: 100%;
    max-width: 500px;
    height: auto;
  }
  </style>