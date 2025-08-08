<template>
  <section class="feedback" id="feedback">
    <v-container>
      <h2 class="fw-bold feedback-showleft text-center">
        Feedbacks from my clients
      </h2>

      <div class="feedback-boxes d-flex gap-3">
        <div v-for="(feedback, index) in feedbacks" :key="index">
          <v-card
            class="feedback-box"
            style="
              box-shadow: 0px 10px 60px 0px rgba(96, 98, 146, 0.1);
              border-radius: 10px;
            "
          >
            <div class="feedback-profile d-flex align-center">
              <v-avatar size="50">
                <img :src="feedback.image" alt="profile pic" />
              </v-avatar>
              <div class="icons ml-3">
                <v-icon v-for="(star, i) in 5" :key="i" color="#FF9900"
                  >mdi-star</v-icon
                >
              </div>
            </div>
            <p class="mt-3">{{ feedback.feedbackText }}</p>
            <h5 class="mt-2">{{ feedback.name }}</h5>
            <p class="mt-1">{{ feedback.designation }}</p>
          </v-card>
        </div>
      </div>
    </v-container>
  </section>
</template>

<script>
export default {
  name: "FeedbackComp",
  data() {
    return {
      feedbacks: [
        {
          image: require("@/assets/feedbackprofile1.png"),
          feedbackText:
            "With 10 years of experience were there are busy preoccupied with whether or not they could they didn't stop to think.",
          name: "Jack Latam",
          designation: "Founder & CEO at Creative Study",
        },
        {
          image: require("@/assets/feedbackprofile2.png"),
          feedbackText:
            "With 10 years of experience were there are busy preoccupied with whether or not they could they didn't stop to think.",
          name: "Jack Latam",
          designation: "Founder & CEO at Creative Study",
        },
      ],
    };
  },
};
</script>

<style scoped>
.feedback {
  padding: 50px 5%;
}

.feedback-showleft {
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

.feedback p {
  color: black;
}

.feedback-boxes {
  margin-top: 2rem;
}

.feedback-box {
  padding: 1.5rem;
  width: 100%;
}

@media (max-width: 888px) {
  .feedback-boxes {
    flex-wrap: wrap;
  }
}

.feedback-box .feedback-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.feedback-box .feedback-profile .img img {
  border-radius: 50%;
  width: 50px;
}

.feedback-box .feedback-profile .icons i {
  margin: 2px;
}
</style>
