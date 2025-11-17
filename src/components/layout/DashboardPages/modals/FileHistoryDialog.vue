<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">File History - {{ fileName }}</span>
        <v-spacer></v-spacer>
        <GenericButton icon="mdi-close" @click="dialog = false"></GenericButton>
      </v-card-title>
      <v-card-text>
        <v-list v-if="fileHistories.length > 0">
          <v-list-group 
            v-for="history in fileHistories" 
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
                    <!-- Type: {{ history.changeType }} | -->
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="!isCurrentVersion(history)">
                  <GenericButton small color="primary" @click="previewVersion(history)" > Preview </GenericButton>
                </v-list-item-action>
                <v-list-item-action v-if="!isCurrentVersion(history)">
                  <GenericButton small color="success" @click="handleRevert(history)"
                    :loading="revertingHistoryId === history.id"
                    :disabled="revertingHistoryId !== null" >
                    Revert </GenericButton>
            </v-list-item-action>
              <v-list-item-action v-else>
                <h4 class="text-primary"> Current Version</h4>
                </v-list-item-action>
              </template>
            <div v-if="previewData && previewData.id === history.id" class="text-dark">
            <v-tabs v-model="previewActiveSheet">
      <v-tab v-for="sheet in getPreviewSheets(previewData)" :key="sheet.name">
         {{ sheet.name }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="previewActiveSheet">
        <v-tab-item v-for="sheet in getPreviewSheets(previewData)" :key="sheet.name">
          <GenericExcelSheet
            :value="sheet.data || []"
            :columns="previewColumns"
            editorRef="previewEditor"
            type="preview"
            :readonly="true"
          />
        </v-tab-item>
        </v-tabs-items>
        <v-divider></v-divider>
        </div>
            </v-list-group>
            </v-list>
            <v-alert v-else type="info"> No history found for this file. </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <GenericButton color="blue darken-1" text @click="dialog = false" :disabled="revertingHistoryId !== null">Close</GenericButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import GenericExcelSheet from "../../../common/GenericExcelSheet.vue";
import GenericButton from "../../../common/GenericButton.vue";
export default {
  name: "FileHistoryDialog",
  components: { GenericExcelSheet, GenericButton },
  props: {
    value: Boolean,
    file: Object
  },
  data() {
    return {
      previewActiveSheet: 0,
      previewData: null,
      expandedVersion: null,
      revertingHistoryId: null,
      previewColumns: Array.from({ length: 7 }, (_, i) => ({
        field: String.fromCharCode(65 + i),
        title: String.fromCharCode(65 + i),
        type: "string",
        width: "169px",
      })),
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
      return this.file?.name || 'Unknown File';
    },
    currentVersion() {
      return this.file?.currentVersion || 1;
    },
    localFile() {
      return this.file;
    },
    fileHistories() {
      const histories = this.getFileHistories(this.file?.id) || [];
      return histories
        .sort((a, b) => b.version - a.version);
    },
    ...mapGetters("files", ["getFileHistories"]),
  },
  methods: {
    ...mapActions("files", ["fetchFileHistories", "revertToHistory"]),
    isCurrentVersion(history) {
      return history.version === this.currentVersion;
    },
    getPreviewSheets(history) {
      if (history.data && history.data.sheets) {
        return history.data.sheets;
      }
      return [];
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    previewVersion(history) {
      this.previewData = history;
      this.previewActiveSheet = 0;
    },
    async handleRevert(history) { 
      try {
        if (!history || !history.id) {
          throw new Error('Invalid history data');
        }
        if (confirm(`Are you sure you want to revert to Version ${history.version}? This will replace the current file data with the data from this version.`)) {
          this.revertingHistoryId = history.id;
          console.log('Starting revert for history:', history.id);
          await this.revertToHistory({
            fileId: this.file.id,
            historyId: history.id
          });
          this.revertingHistoryId = null;
          this.$emit('reverted', history);
          this.$toast.success(`Successfully reverted to Version ${history.version}`);
          await this.loadHistories();
          this.dialog = false;
        }
      } catch (error) {
        console.error('Error reverting history:', error);
        this.revertingHistoryId = null;
        this.$toast.error('Failed to revert history: ' + error.message);
      }
    },
    async loadHistories() {
      if (this.file?.id) {
        try {
          await this.fetchFileHistories(this.file.id);
         this.expandedVersion = null;
         this.previewData = null;
        } catch (error) {
          console.error('Error loading histories:', error);
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