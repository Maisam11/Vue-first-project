<template>
  <section class="faq" id="faq">
    <v-container>
      <h2 class="fw-bold faq-showdown text-center">FAQ</h2>
      <p class="faq-showdown text-center">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have
      </p>

      <v-row class="faq-banner pt-4" justify="center">
        <v-col class="text-center">
          <img :src="faqbanner" alt="faq banner image" width="100%" />
        </v-col>

        <v-col class="accordion">
          <v-expansion-panels>
            <v-expansion-panel v-for="(item, index) in faqItems" :key="index">
              <v-expansion-panel-header>
                <h5>{{ item.question }}</h5>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p>{{ item.answer }}</p>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script>
export default {
  name: "FAQComp",
  data() {
    return {
      faqItems: [
        {
          question: "Is repair facility only available at home?",
          answer:
            "The choice depends on your business’s needs and resources. If you can’t afford to add an accountant to your payroll but need insight during tax season, you have the option to hire a short-term contractor.",
        },
        {
          question: "Is repair facility only available at home?",
          answer:
            "The choice depends on your business’s needs and resources. If you can’t afford to add an accountant to your payroll but need insight during tax season, you have the option to hire a short-term contractor.",
        },
        {
          question: "Is repair facility only available at home?",
          answer:
            "The choice depends on your business’s needs and resources. If you can’t afford to add an accountant to your payroll but need insight during tax season, you have the option to hire a short-term contractor.",
        },
        {
          question: "Is repair facility only available at home?",
          answer:
            "The choice depends on your business’s needs and resources. If you can’t afford to add an accountant to your payroll but need insight during tax season, you have the option to hire a short-term contractor.",
        },
      ],
      faqbanner: "https://phofix.juragancode.id/assets/img/faq-banner.png",
    };
  },
};
</script>

<style scoped>
.faq {
  text-align: center;
  padding: 50px 5%;
}

.faq-showdown {
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

p {
  color: #5c5a6f;
}

.faq-banner {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
}

.accordion {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .faq-banner {
    flex-direction: column;
  }
  .accordion {
    margin-top: 0;
  }
  .img {
    max-width: 45%;
  }
}

@media (max-width: 768px) {
  .accordion {
    width: 100%;
  }
}
</style>
