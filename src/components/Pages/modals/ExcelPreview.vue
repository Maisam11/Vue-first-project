<!-- <template>
  <v-dialog v-model="dialog" max-width="1200px" scrollable persistent>
    <v-card>
      <v-card-title class="headline">Excel Preview</v-card-title>
      <v-card-text>
        <v-tabs v-model="activeTab" grow>
          <v-tab>Users</v-tab>
          <v-tab>Addresses</v-tab>
        </v-tabs>
        
        <v-tabs-items v-model="activeTab" class="mt-4">
          <v-tab-item>
            <vue-excel-editor 
              v-model="excelUserData" 
              class="excel-editor"
              no-footer
              add-row-btn
              @add-row="addUserRow"
            >
              <vue-excel-column field="id" label="ID" width="80px" readonly />
              <vue-excel-column field="Name" label="Name" type="string" width="150px" />
              <vue-excel-column field="Email" label="Email" type="string" width="200px" />
              <vue-excel-column field="Date of Birth" label="DOB" type="date" width="120px" />
              <vue-excel-column field="Age" label="Age" type="number" width="80px" />
              <vue-excel-column field="Home Phone" label="Home Phone" type="string" width="120px" />
              <vue-excel-column field="Mobile Phone" label="Mobile Phone" type="string" width="120px" />
              <vue-excel-column 
                field="Is Form Submission" 
                label="Form Submitted" 
                type="select" 
                width="120px"
                :options="['Yes', 'No']"
              />
            </vue-excel-editor>
          </v-tab-item>
          
          <v-tab-item>
            <vue-excel-editor 
              v-model="excelAddressData" 
              class="excel-editor"
              no-footer
              add-row-btn
              @add-row="addAddressRow"
            >
              <vue-excel-column field="userId" label="User ID" width="80px" />
              <vue-excel-column field="User Name" label="User Name" width="150px" readonly />
              <vue-excel-column field="Address Type" label="Type" width="100px" type="select" :options="['Home', 'Work', 'Other']" />
              <vue-excel-column field="Street" label="Street" width="200px" />
              <vue-excel-column field="State" label="State" width="120px" />
              <vue-excel-column field="Province" label="Province" width="120px" />
              <vue-excel-column field="Zip Code" label="Zip Code" width="100px" />
            </vue-excel-editor>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveExcelData" :loading="saving">Save Changes</v-btn>
        <v-btn color="success" @click="downloadExcel">
          <v-icon left>mdi-microsoft-excel</v-icon>
          Export Excel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import * as XLSX from "xlsx";
import { mapActions } from "vuex";
import VueExcelEditor from 'vue-excel-editor';

export default {
  name: "ExcelPreview",
  components: {
    VueExcelEditor
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    users: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dialog: this.show,
      activeTab: 0,
      saving: false,
      excelUserData: [],
      excelAddressData: [],
    };
  },
  watch: {
    show(val) {
      this.dialog = val;
      if (val) {
        this.initializeExcelData();
      }
    },
    dialog(val) {
      if (!val) {
        this.$emit("update:show", false);
      }
    },
  },
  methods: {
    ...mapActions([
      'addUser', 
      'updateUser', 
      'updateFormSubmission',
      'addFormSubmission'
    ]),
    
    initializeExcelData() {
      // Process user data
      this.excelUserData = this.users.map(user => ({
        id: user.id,
        Name: user.name || '',
        Email: user.email || '',
        'Date of Birth': user.dob || '',
        Age: user.age || '',
        'Home Phone': user.homePhone || '',
        'Mobile Phone': user.mobilePhone || '',
        'Is Form Submission': user.isFormSubmission ? 'Yes' : 'No',
      }));

      // Process address data
      this.excelAddressData = [];
      this.users.forEach(user => {
        if (user.addresses && user.addresses.length > 0) {
          user.addresses.forEach((address, index) => {
            this.excelAddressData.push({
              userId: user.id,
              'User Name': user.name || '',
              'Address Type': address.type || `Address ${index + 1}`,
              Street: address.street || '',
              State: address.state || '',
              Province: address.province || '',
              'Zip Code': address.zipCode || '',
            });
          });
        }
      });
    },
    
    addUserRow() {
      this.excelUserData.push({
        id: `temp-${Date.now()}`,
        Name: '',
        Email: '',
        'Date of Birth': '',
        Age: '',
        'Home Phone': '',
        'Mobile Phone': '',
        'Is Form Submission': 'No',
      });
    },
    
    addAddressRow() {
      if (this.excelUserData.length === 0) return;
      
      const firstUser = this.excelUserData[0];
      this.excelAddressData.push({
        userId: firstUser.id,
        'User Name': firstUser.Name,
        'Address Type': 'Home',
        Street: '',
        State: '',
        Province: '',
        'Zip Code': '',
      });
    },
    
    async saveExcelData() {
      this.saving = true;
      
      try {
        // Process user data
        for (const user of this.excelUserData) {
          const userData = {
            id: user.id,
            name: user.Name,
            email: user.Email,
            dob: user['Date of Birth'],
            age: user.Age,
            homePhone: user['Home Phone'],
            mobilePhone: user['Mobile Phone'],
            isFormSubmission: user['Is Form Submission'] === 'Yes',
            addresses: this.excelAddressData
              .filter(addr => addr.userId === user.id)
              .map(addr => ({
                type: addr['Address Type'],
                street: addr.Street,
                state: addr.State,
                province: addr.Province,
                zipCode: addr['Zip Code'],
              }))
          };

          if (user.id.startsWith('temp-')) {
            // New user
            if (userData.isFormSubmission) {
              await this.addFormSubmission(userData);
            } else {
              await this.addUser(userData);
            }
          } else {
            // Existing user
            if (userData.isFormSubmission) {
              await this.updateFormSubmission(userData);
            } else {
              await this.updateUser(userData);
            }
          }
        }

        this.$emit('save-success');
        this.dialog = false;
      } catch (error) {
        console.error('Error saving data:', error);
        this.$emit('save-error', error);
      } finally {
        this.saving = false;
      }
    },
    
    downloadExcel() {
      // Create worksheets
      const userWs = XLSX.utils.json_to_sheet(this.excelUserData.map(user => ({
        Name: user.Name,
        Email: user.Email,
        'Date of Birth': user['Date of Birth'],
        Age: user.Age,
        'Home Phone': user['Home Phone'],
        'Mobile Phone': user['Mobile Phone'],
        'Is Form Submission': user['Is Form Submission'],
      })));

      const addressWs = XLSX.utils.json_to_sheet(this.excelAddressData.map(addr => ({
        'User Name': addr['User Name'],
        'Address Type': addr['Address Type'],
        Street: addr.Street,
        State: addr.State,
        Province: addr.Province,
        'Zip Code': addr['Zip Code'],
      })));

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, userWs, "Users");
      XLSX.utils.book_append_sheet(wb, addressWs, "Addresses");

      // Download
      XLSX.writeFile(wb, "UserData.xlsx");
    },
    
    closeDialog() {
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
.excel-editor {
  height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: auto;
}

.vue-excel-editor {
  font-family: 'Roboto', sans-serif;
}

.vue-excel-editor .vue-excel-table {
  width: 100% !important;
}

.vue-excel-editor .vue-excel-cell {
  padding: 8px 12px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.vue-excel-editor .vue-excel-header {
  background-color: #f5f5f5;
  font-weight: 500;
}

.vue-excel-editor .vue-excel-column {
  min-width: 100px;
}

.vue-excel-editor input {
  width: 100%;
  border: none;
  outline: none;
  padding: 4px;
  font-size: 14px;
}

.vue-excel-editor select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 4px;
  font-size: 14px;
}

.vue-excel-editor .add-row-btn {
  margin: 10px 0;
}
</style> -->