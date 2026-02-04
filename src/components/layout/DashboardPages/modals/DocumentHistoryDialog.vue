<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">Document History - {{ fileName }}</span>
        <v-spacer></v-spacer>
        <GenericButton icon="mdi-close" @click="dialog = false"></GenericButton>
      </v-card-title>
      <v-card-text>
        <v-list v-if="documentHistories.length > 0">
          <v-list-group 
            v-for="history in documentHistories" 
            :key="history.id"
            :value="history.id === expandedVersion"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>
                  <span v-if="isCurrentVersion(history)" class="text-primary">
                    <strong>Current Version {{ history.version }}</strong> - {{ formatDate(history.timestamp) }}
                  </span>
                  <span v-else>
                    Version {{ history.version }} - {{ formatDate(history.timestamp) }}
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  Changed by: {{ history.changedBy }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="!isCurrentVersion(history)">
                <GenericButton small color="primary" @click="previewVersion(history)">
                  Preview
                </GenericButton>
              </v-list-item-action>
              <v-list-item-action v-if="!isCurrentVersion(history)">
                <GenericButton 
                  small 
                  color="success" 
                  @click="handleRevert(history)"
                  :loading="revertingHistoryId === history.id"
                  :disabled="revertingHistoryId !== null"
                >
                  Revert
                </GenericButton>
              </v-list-item-action>
              <v-list-item-action v-else>
                <h4 class="text-primary">Current Version</h4>
              </v-list-item-action>
            </template>
            <div v-if="previewData && previewData.id === history.id" class="preview-content">
              <v-card class="preview-card">
                <v-card-text>
                  <div v-html="previewContent"></div>
                </v-card-text>
              </v-card>
            </div>
          </v-list-group>
        </v-list>
        <v-alert v-else type="info">No history found for this document.</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <GenericButton color="blue darken-1" text @click="dialog = false" :disabled="revertingHistoryId !== null">
          Close
        </GenericButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "../../../common/GenericButton.vue";
export default {
  name: "DocumentHistoryDialog",
  components: { GenericButton },
  props: {
    value: Boolean,
    file: Object
  },
  data() {
    return {
      previewData: null,
      expandedVersion: null,
      revertingHistoryId: null,
      previewContent: ""
    };
  },
  computed: {
    dialog: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    },
    fileName() {
      return this.file?.name || 'Unknown Document';
    },
    currentVersion() {
      return this.file?.currentVersion || 1;
    },
    documentHistories() {
      const histories = this.getDocumentHistories(this.file?.id) || [];
      return histories
        .sort((a, b) => b.version - a.version);
    },
    ...mapGetters("document", ["getDocumentHistories"]),
  },
  methods: {
    ...mapActions("document", ["fetchDocumentHistories", "revertToHistory"]),
    isCurrentVersion(history) {
      if (this.file?.activeHistoryVersion) {
        return history.version === this.file.activeHistoryVersion;
      }
      return history.version === this.currentVersion;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    previewVersion(history) {
      this.previewData = history;
      if (history.data && history.data.content) {
        this.previewContent = Array.isArray(history.data.content) 
          ? history.data.content.join('')
          : history.data.content;
      } else {
        this.previewContent = '<p>No content available</p>';
      }
    },
    async handleRevert(history) { 
      try {
        if (!history || !history.id) {
          throw new Error('Invalid history data');
        }
        if (confirm(`Are you sure you want to revert to Version ${history.version}?`)) {
          this.revertingHistoryId = history.id;
          console.log('Starting document revert to version:', history.version);
          await this.revertToHistory({
            documentId: this.file.id,
            historyId: history.id
          });
          this.revertingHistoryId = null;
          this.$emit('reverted', history);
          this.$toast.success(`Successfully reverted to Version ${history.version}`);
          await this.loadHistories();
          this.dialog = false;
        }
      } catch (error) {
        console.error('Error reverting document history:', error);
        this.revertingHistoryId = null;
        this.$toast.error('Failed to revert history: ' + error.message);
      }
    },
    async loadHistories() {
      if (this.file?.id) {
        try {
          await this.fetchDocumentHistories(this.file.id);
          this.expandedVersion = null;
          this.previewData = null;
          this.previewContent = "";
        } catch (error) {
          console.error('Error loading document histories:', error);
          this.$toast.error('Failed to load histories: ' + error.message);
        }
      }
    }
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.loadHistories();
        this.previewData = null;
        this.revertingHistoryId = null;
        this.expandedVersion = null;
        this.previewContent = "";
      }
    },
    file: {
      handler() {
        if (this.dialog) {
          this.loadHistories();
        }
      },
      deep: true
    }
  }
};
</script>