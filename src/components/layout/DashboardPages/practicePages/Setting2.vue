<template>
  <div>
    <h2>{{ message }}</h2>
    <button @click="changeMessage">Change</button>
  </div>
</template>

<script>
export default {
  name: "Setting2File",
  data() {
    return {
      message: "Hello Vue!"
    };
  },

  // 💬 Creation Hooks
  beforeCreate() {
    console.log("👉 beforeCreate: data not ready yet");
  },
  created() {
    console.log("✅ created: data is ready", this.message);
  },

  // 💻 Mounting Hooks
  beforeMount() {
    console.log("🕓 beforeMount: about to show on screen");
  },
  mounted() {
    console.log("🌟 mounted: component is now visible");
  },

  // 🔁 Updating Hooks
  beforeUpdate() {
    console.log("♻️ beforeUpdate: data about to change");
  },
  updated() {
    console.log("✅ updated: data changed on screen");
  },

  // ❌ Destruction Hooks
  beforeDestroy() {
    console.log("⚠️ beforeDestroy: component will be removed");
  },
  destroyed() {
    console.log("💀 destroyed: component is gone");
  },

  methods: {
    changeMessage() {
      this.message = "Message Changed!";
    }
  }
};
</script>
  