<template>
    <section class="works" id="works">
      <v-container class="px-md-5">
        <v-row>
          <!-- Image Banner -->
          <v-col cols="12" md="5" class="img-banner work-showleft d-flex justify-center">
            <img :src="worksbanner" alt="works-banner" height="100%" max-width="360" />

          </v-col>
  
          <v-col cols="12" md="7">
            <h2 class="fw-bold work-showleft">How it works</h2>
            <p class="mb-5 work-showleft">
              There are many variations of passages of Lorem Ipsum available, but the majority have. Get some more money and you have time
              <span class="text-primary">learn more.</span>
            </p>
  
            <v-row class="box1 mb-4">
              <v-col cols="12" md="6" class="work-showdown">
                <h6 class="fw-bold">
                  <span>1</span> Choose Device
                </h6>
                <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
              </v-col>
              <v-col cols="12" md="6" class="work-showdown">
                <h6 class="fw-bold">
                  <span>2</span> Check Repair & Price
                </h6>
                <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
              </v-col>
            </v-row>
  
            <v-row class="box2 work-showdown">
              <v-col cols="12" md="6">
                <h6 class="fw-bold">
                  <span>3</span> Schedule Repair
                </h6>
                <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
              </v-col>
              <v-col cols="12" md="6" class="work-showdown">
                <h6 class="fw-bold">
                  <span>4</span> Free Pickup & Drop
                </h6>
                <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </template>
  
  <script>
  export default {
    name: "WorksComp",
    data() {
    return {
      worksbanner: "https://phofix.juragancode.id/assets/img/how-it-work-banner.png"
    }
  }
  };
  </script>
  
  <style scoped>
  .works {
    padding: 60px 5%;
  }
  
  .work-showleft {
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
  
  .work-showdown {
    opacity: 0;
    transform: translateY(200px);
    animation: sideIndown both;
    animation-timeline: view(60% 0%);
  }
  
  @keyframes sideIndown {
    from {
      opacity: 0;
      transform: translateY(200px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .works .box1 span,
  .works .box2 span {
    color: white;
    background-color: #4b4aef;
    border-radius: 50%;
    padding: 1px 5px;
    margin-right: 10px;
  }
  
  .img-banner img {
    max-width: 360px;
    display: flex;
    justify-self: center;
  }
  
  @media (max-width: 768px) {
    .img-banner img {
      width: 75%;
      display: flex;
      justify-self: center;
    }
  }
  </style>