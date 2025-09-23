<template>
  <section class="blog" id="blog">
    <v-container>
      <h2 class="fw-bold blog-showdown text-center">Blog</h2>
      <p class="blog-showdown text-center">
        "Discover fresh perspectives and valuable insights in our blog section.
        Dive into trending topics and expert <br />
        advice. Join us on this journey of exploration!
      </p>

      <v-row class="blog-cards">
        <v-col
          v-for="(blog, index) in blogs"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          class="d-flex justify-center"
          style="margin-top: 40px"
        >
          <v-card class="card" style="box-shadow: none">
            <img :src="blog.image" alt="Card Image" class="card-image" />

            <v-card-text class="card-content">
              <div class="card-date">{{ blog.date }}</div>
              <div class="card-title">{{ blog.title }}</div>
              <div class="card-description">{{ blog.description }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="blog-lowerpart blog-showdown">
        <v-col cols="12" md="8">
          <h2 class="fw-bold">Subscribe to get latest news</h2>
          <p class="mt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ut
            laoreet diam. Duis eget nunc blandit, viverra tellus quis, sodales
            mauris. Suspendisse fermentum orci lorem, vitae congue enim bibendum
            non. Etiam nec est est. Cras laoreet tempus sapien, eu fermentum ex
            euismod sit amet.
          </p>
          <v-btn
            color="#FF9900"
            class="mt-4 py-5 px-6 sub-btn"
            style="text-transform: none"
            rounded
            >Subscribe Now</v-btn
          >
        </v-col>
        <v-col cols="12" md="4" class="text-right">
          <img :src="blogsub" alt="subscribe image" />
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script>
export default {
  name: "BlogComp",
  data() {
    return {
      blogsub: require("@/assets/blog-subscribe.png"),
      blogs: [
        {
          image: "https://t3.ftcdn.net/jpg/05/19/73/36/360_F_519733648_tSMSHwqxw3TrbgFSXNKJVKncdkC0siTq.jpg",
          date: "03 January 2024",
          title: "Unlocking the Secrets of Effective Cell Phone Repairs",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore veniam dolore...",
        },
        {
          image: "https://www.diyfixtool.com/cdn/shop/articles/05qOG26wzVLHG2nlWpelvCF-1..v1683302270_jpg_JPEG_1600x900_71.png?v=1701080915",
          date: "23 January 2024",
          title:
            "Essential Tips for Mobile Phone Repairs: A Comprehensive Guide",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore veniam dolore...",
        },
        {
          image: "https://www.shutterstock.com/image-vector/phone-ai-artificial-intelligence-robot-260nw-2486564043.jpg",
          date: "28 January 2024",
          title:
            "Navigating Common Mobile Repair Issues: Solutions and Strategies",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore veniam dolore...",
        },
      ],
    };
  },
};
</script>

<style scoped>
.blog {
  text-align: center;
  padding: 50px 5%;
  width: 100%;
}

.blog-showdown {
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

.blog-cards .card {
  background: #fff;
  overflow: hidden;
  padding: 0;
  width: 100%;
  text-align: left;
}

.blog-cards .card-image {
  width: 100%;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.blog-cards .card:hover .card-image {
  transform: scale(1.1);
}

.blog-cards .card-content {
  padding: 15px;
}

.blog-cards .card-date {
  font-size: 14px;
  color: #777;
  margin-bottom: 5px;
}

.blog-cards .card-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.blog-cards .card-description {
  font-size: 14px;
  color: #555;
}

@media (max-width: 768px) {
  .blog-cards .card {
    width: 100%;
  }
  .blog-cards .card-image {
    height: 250px;
  }
}

.blog-lowerpart {
  color: white;
  background: linear-gradient(
    92deg,
    #0ddcf2 0%,
    #3370ff 28.65%,
    #570afe 83.95%
  );
  text-align: left;
  padding: 2rem;
  height: auto;
  position: relative;
  top: 7rem;
  border-radius: 15px;
  overflow: hidden;
}

.blog-lowerpart p {
  margin: 2rem 0;
  color: white;
}

.blog-lowerpart img {
  width: 280px;
  height: 300px;
  position: absolute;
  top: 0;
  right: 0;
}

.blog-lowerpart .v-btn {
  background-color: #ff9900;
  border-radius: 50px;
  font-size: 14px;
  padding: 10px 22px;
  font-weight: 500;
  color: white;
  border: none;
}
</style>
