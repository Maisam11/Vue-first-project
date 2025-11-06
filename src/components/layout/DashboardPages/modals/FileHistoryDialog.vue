<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="headline">File History - {{ fileName }}</span>
        <v-spacer></v-spacer>
        <GenericButton icon="mdi-close" @click="dialog = false"></GenericButton>
      </v-card-title>
      <v-card-text>
        <v-tabs v-model="activeSheetTab">
          <v-tab v-for="sheet in sheets" :key="sheet.name">
            {{ sheet.name }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeSheetTab">
          <v-tab-item v-for="sheet in sheets" :key="sheet.name">
            <v-list v-if="getSheetHistories(sheet.name).length > 0">
              <v-list-item 
                v-for="history in getSheetHistories(sheet.name)" 
                :key="history.id"
                :class="{ 'active-history': history.id === currentHistoryId }"
              >
                <v-list-item-icon>
                  <v-icon :color="getHistoryIconColor(history.changeType)">
                    {{ getHistoryIcon(history.changeType) }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    Version {{ history.version }} - {{ formatDate(history.timestamp) }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Changed by: {{ history.changedBy }} | 
                    Type: {{ history.changeType }} |
                    Rows: {{ getHistoryDataLength(history) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <GenericButton small color="primary" @click="previewHistory(history)" > Preview </GenericButton>
                </v-list-item-action>
                <v-list-item-action>
                  <GenericButton small color="success" @click="handleRevert(history)"
                    :loading="revertingHistoryId === history.id"
                    :disabled="revertingHistoryId !== null" >
                    Revert </GenericButton>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info">
              No history found for this sheet.
            </v-alert>
          </v-tab-item>
        </v-tabs-items>
        <v-divider class="my-4" v-if="previewHistoryData"></v-divider>
        <div v-if="previewHistoryData">
          <h3>Preview - Version {{ previewHistoryData.version }}</h3>
          <GenericExcelSheet
            :value="getPreviewData(previewHistoryData)"
            :columns="previewColumns"
            editorRef="previewEditor"
            type="preview"
            :readonly="true"
          />
        </div>
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
      activeSheetTab: 0,
      previewHistoryData: null,
      currentHistoryId: null,
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
    sheets() {
      return this.file?.sheets || [];
    },
    histories() {
      return this.getFileHistories(this.file?.id) || [];
    },
    ...mapGetters("files", ["getFileHistories"]),
  },
  methods: {
    ...mapActions("files", ["fetchFileHistories", "revertToHistory"]),
    getSheetHistories(sheetName) {
      return this.histories
        .filter(history => history.sheetName === sheetName)
        .sort((a, b) => b.version - a.version);
    },
    getHistoryIcon(changeType) {
      const icons = {
        'created': 'mdi-plus',
        'updated': 'mdi-pencil',
        'reverted': 'mdi-history'
      };
      return icons[changeType] || 'mdi-file-document';
    },
    getHistoryIconColor(changeType) {
      const colors = {
        'created': 'success',
        'updated': 'primary',
        'reverted': 'warning'
      };
      return colors[changeType] || 'grey';
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    getHistoryDataLength(history) {
      if (Array.isArray(history.data)) {
        return history.data.length;
      } else if (history.data && Array.isArray(history.data.data)) {
        return history.data.data.length;
      }
      return 0;
    },
    getPreviewData(history) {
      if (Array.isArray(history.data)) {
        return history.data;
      } else if (history.data && Array.isArray(history.data.data)) {
        return history.data.data;
      }
      return [];
    },
    previewHistory(history) {
      this.previewHistoryData = history;
    },
    async handleRevert(history) { 
      try {
        if (!history || !history.id) {
          throw new Error('Invalid history data');
        }
        if (confirm(`Are you sure you want to revert to Version ${history.version}? This will replace the current sheet data with the data from this version.`)) {
          this.revertingHistoryId = history.id;
          console.log('Starting revert for history:', history.id);
          await this.revertToHistory({
            fileId: this.file.id,
            historyId: history.id
          });
          this.currentHistoryId = history.id;
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
          const latestHistory = this.histories[0];
          if (latestHistory) {
            this.currentHistoryId = latestHistory.id;
          }
        } catch (error) {
          console.error('Error loading histories:', error);
          this.$toast.error('Failed to load histories');
        }
      }
    }
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.loadHistories();
        this.previewHistoryData = null;
        this.revertingHistoryId = null;
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

<style scoped>
.active-history {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}
</style>