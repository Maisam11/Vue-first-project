<template>
  <v-card>
    <v-data-table
      v-bind="$attrs"
      :headers="processedHeaders"
      :items="items"
      :loading="loading"
      :search="search"
      :items-per-page="itemsPerPage"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :must-sort="mustSort"
      :multi-sort="multiSort"
      :show-select="showSelect"
      :single-select="singleSelect"
      :show-expand="showExpand"
      :server-items-length="serverItemsLength"
      :dense="dense"
      :mobile-breakpoint="mobileBreakpoint"
      :footer-props="footerProps"
      :no-data-text="noDataText"
      :no-results-text="noResultsText"
      :loading-text="loadingText"
      :item-key="itemKey"
      class="elevation-4"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <slot name="toolbar-actions"></slot>
        </v-toolbar>
      </template>

      <template
        v-for="header in processedHeaders"
        v-slot:[`item.${header.value}`]="{ item }"
      >
        <slot :name="`column-${header.value}`" :item="item">
          <template>
            {{ item[header.value] }}
          </template>
        </slot>
      </template>

      <template v-if="hasActionsColumn" v-slot:actions="{ item }">
        <slot name="column-actions" :item="item">
          <component
            v-if="isComponent(actionsComponent)"
            :is="actionsComponent"
            :item="item"
            :onEdit="$attrs.onEdit"
            :onView="$attrs.onView"
            :onDelete="$attrs.onDelete"
          />
        </slot>
      </template>

      <template
        v-for="header in processedHeaders"
        v-slot:[`header.${header.value}`]="{ header: headerObj }"
      >
        <slot :name="`header-${headerObj.value}`" :header="headerObj">
          {{ headerObj.text }}
        </slot>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <h4 class="mb-4">Contact Information</h4>
          <p><strong>Home Phone: </strong>{{ item.homePhone || "--" }}</p>
          <p><strong>Mobile Phone: </strong> {{ item.mobilePhone || "--" }}</p>
          <h4 class="mb-4">Address Information</h4>
          <template v-if="item.addresses && item.addresses.length">
            <div v-for="(address, index) in item.addresses" :key="index">
              <p>
                {{ `Address ${index + 1}` || "--" }} ::
                <strong class="ms-5">Street:</strong>
                {{ address.street || "--" }}
                <strong class="ms-5">State:</strong>
                {{ address.state || "--" }}
                <strong class="ms-5">Province:</strong>
                {{ address.province || "--" }}
                <strong class="ms-5">Zip Code:</strong>
                {{ address.zipCode || "--" }}
              </p>
            </div>
          </template>
          <template v-else>
            <p>No address information available</p>
          </template>
        </td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    title: { type: String, default: "Table" },
    headers: { type: Array, required: true },
    items: { type: Array, required: true },
    loading: Boolean,
    search: String,
    itemsPerPage: Number,
    page: Number,
    sortBy: [String, Array],
    sortDesc: [Boolean, Array],
    mustSort: Boolean,
    multiSort: Boolean,
    showSelect: Boolean,
    singleSelect: Boolean,
    showExpand: Boolean,
    expanded: Array,
    serverItemsLength: Number,
    dense: Boolean,
    mobileBreakpoint: Number,
    footerProps: Object,
    noDataText: String,
    noResultsText: String,
    loadingText: String,
    itemKey: { type: String, default: "id" },
  },
  computed: {
    processedHeaders() {
      return this.headers.map((header) => ({
        ...header,
      }));
    },
    hasActionsColumn() {
      return this.headers.some((h) => h.value === "actions");
    },
    actionsComponent() {
      if (this.$scopedSlots["column-actions"]) {
        const slotContent = this.$scopedSlots["column-actions"]({ item: {} });
        if (slotContent && slotContent.length > 0) {
          return slotContent[0].componentOptions?.Ctor;
        }
      }
      return null;
    },
  },
  methods: {
    isComponent(obj) {
      if (!obj) return false;
      return (
        (typeof obj === "object" &&
          ("render" in obj || "template" in obj || obj.__file)) ||
        (obj.componentOptions && obj.componentOptions.Ctor)
      );
    },
  },
};
</script>