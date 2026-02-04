<template>
  <v-card flat dense class="py-4 ma-3 d-flex">
    <v-btn color="primary" @click="openDialog">Open Dialog</v-btn>
    <FeedbackDialog :dialog="dialog" @closeDialog="closeDialog" ref="childRef"/>
    <v-btn @click="hitChildFunc">Hit Child Function</v-btn>
  </v-card>
</template>

<script>
import FeedbackDialog from "./dialog/FeedbackDialog.vue";

export default {
  name: "FeedbackComp",
  components: {
    FeedbackDialog,
  },
  data() {
    return {
      dialog: false,
    };
  },

  methods: {
    openDialog() {
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
    },

    hitChildFunc() {
      this.$refs.childRef.childFunc1();
      this.$refs.childRef.childFunc2();
    },
  },
};
</script>