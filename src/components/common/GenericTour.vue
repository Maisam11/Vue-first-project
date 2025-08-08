<template>
  <div>
    <!-- Help Popover -->
    <v-menu
      v-model="showGuidance"
      transition="scale-transition"
      :close-on-content-click="false"
      offset-y
      bottom
      right
      content-class="menu-popover"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          color="primary"
          fab
          fixed
          bottom
          right
          class="ma-4"
          id="help-button"
          @click="showMenu = false"
        >
          <v-icon>mdi-information-variant</v-icon>
        </v-btn>
      </template>

      <v-card color="#2a2f45" dark style="min-width: 300px">
        <v-card-title
          class="blue--text d-flex justify-space-between align-center pa-3"
        >
          <span class="text-subtitle-1 fw-bold">{{ helperTitle }}</span>
          <v-btn icon small @click.stop="showGuidance = false">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </v-card-title>

        <div class="px-3 pb-2">
          <div class="d-flex justify-space-between align-center">
            <span class="fw-bold">User Table Menu</span>
            <v-btn icon small @click.stop="showMenu = !showMenu">
              <v-icon>{{ showMenu ? "mdi-minus" : "mdi-plus" }}</v-icon>
            </v-btn>
          </div>

          <v-list dense v-show="showMenu" class="menu-list">
            <v-list-item
              v-for="(item, index) in helperItems"
              :key="index"
              @click="startTour(item.action)"
            >
              <v-list-item-icon class="icon-tight">
                <v-icon :color="item.color">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="title-tight">
                {{ item.text }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>

        <div class="px-3 pb-2 pt-2">
          <div class="d-flex justify-space-between align-center">
            <span class="fw-bold">Information Menu</span>
            <v-btn icon small @click.stop="showMenu2 = !showMenu2">
              <v-icon>{{ showMenu2 ? "mdi-minus" : "mdi-plus" }}</v-icon>
            </v-btn>
          </div>

          <v-list dense v-show="showMenu2" class="menu-list">
            <v-list-item
              v-for="(item, index) in infoItems"
              :key="'info-' + index"
            >
              <v-list-item-icon class="icon-tight">
                <v-icon :color="item.color">{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <span>{{ item.text }}</span>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-card>
    </v-menu>

    <v-tour
      :name="tourName"
      :steps="currentTourSteps"
      :options="tourOptions"
      :callbacks="tourCallbacks"
    ></v-tour>
  </div>
</template>
<script>
export default {
  name: "GenericTour",
  props: {
    tourName: {
      type: String,
      required: true,
    },
    helperTitle: {
      type: String,
      default: "User Guide",
    },
    helperItems: {
      type: Array,
      required: true,
      validator: (items) =>
        items.every(
          (item) =>
            item.text && item.action && item.icon && item.color !== undefined
        ),
    },
    tourSteps: {
      type: Object,
      required: true,
    },
    initialRoute: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showGuidance: false,
      showMenu: false,
      showMenu2: false,
      currentTourSteps: [],
      pendingTourAction: null,
      infoItems: [
        { text: "View users", icon: "mdi-chart-bar", color: "blue" },
        { text: "Users information", icon: "mdi-information", color: "green" },
        { text: "Help documents", icon: "mdi-help-circle", color: "orange" },
      ],
      tourOptions: {
        highlight: true,
        labels: {
          buttonSkip: "Skip Tour",
          buttonPrevious: "Previous",
          buttonNext: "Next",
          buttonStop: "Finish",
        },
      },
      tourCallbacks: {
        onPreviousStep: this.onTourPrevious,
        onNextStep: this.onTourNext,
      },
    };
  },
  methods: {
    startTour(action) {
      this.showGuidance = false;
      this.pendingTourAction = action;
      this.currentTourSteps = this.tourSteps[action];

      this.$nextTick(() => {
        this.$tours[this.tourName].start(0);
      });
    },

    triggerTargetClick(stepIndex) {
      if (stepIndex > 0) {
        const step = this.currentTourSteps[stepIndex];
        if (step && step.target) {
          this.$nextTick(() => {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
              targetElement.click();
            }
          });
        }
      }
    },

    async onTourNext(currentStep) {
      if (
        currentStep === 0 &&
        this.initialRoute &&
        this.$route.path !== this.initialRoute
      ) {
        const tour = this.$tours[this.tourName];
        const wasRunning = tour.isRunning;

        if (wasRunning) {
          tour.stop();
        }

        await this.$router.push(this.initialRoute);

        this.$nextTick(() => {
          tour.start(1);
        });
      } else {
        this.triggerTargetClick(currentStep);
      }
    },

    async onTourPrevious(currentStep) {
      if (
        currentStep === 1 &&
        this.initialRoute &&
        this.$route.path === this.initialRoute
      ) {
        const tour = this.$tours[this.tourName];
        const wasRunning = tour.isRunning;

        if (wasRunning) {
          tour.stop();
        }

        await this.$router.go(-1);

        this.$nextTick(() => {
          tour.start(0);
        });
      }
    },
  },
};
</script>

<style scoped>
.icon-tight {
  margin-right: 6px !important;
  min-width: 30px;
  display: flex;
  align-items: center;
}
.title-tight {
  margin-left: -6px;
}
.menu-popover {
  transform-origin: right bottom !important;
  bottom: 30px !important;
  top: auto !important;
}
</style>