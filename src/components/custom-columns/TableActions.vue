  <template>
    <div>
      <!-- View Icon -->
      <v-icon
        v-if="onView"
        small
        id="view-action-btn"
        class="mr-2 text-info"
        @click="onViewClick"
        title="View"
      >
        mdi-eye
      </v-icon>
  
      <!-- Edit Icon -->
      <v-icon
        v-if="onEdit"
        small
        id="edit-action-btn"
        class="mr-2 text-primary"
        @click="onEditClick"
        title="Edit"
      >
        mdi-pencil
      </v-icon>
  
      <!-- Delete Icon -->
      <v-icon
        v-if="onDelete"
        small
        id="delete-action-btn"
        class="text-error"
        @click="onDeleteClick"
        title="Delete"
      >
        mdi-delete
      </v-icon>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TableActions',
    props: {
      item: { type: Object, required: true },
      onEdit: Function,
      onDelete: Function,
      onView: Function,
    },
    methods: {
      onEditClick() {
        if (this.onEdit) this.onEdit(this.item);
      },
      onDeleteClick() {
        if (this.onDelete) this.onDelete(this.item);
      },
      onViewClick() {
        if (this.onView) this.onView(this.item);
      },
    },
  };
  </script>
  