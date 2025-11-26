const createModuleId = (accountId, moduleName) => {
  return `${accountId}_${moduleName}`;
};
const CURRENT_ACCOUNT_ID = '12345';
export const MODULE_NAMES = {
  USERS: createModuleId(CURRENT_ACCOUNT_ID, 'users'),
  FILES: createModuleId(CURRENT_ACCOUNT_ID, 'files'),
  FILE_HISTORIES: createModuleId(CURRENT_ACCOUNT_ID, 'file_histories'),
  SHEETS: 'sheets'
};
export { CURRENT_ACCOUNT_ID, createModuleId };
export default {
  MODULE_NAMES,
  CURRENT_ACCOUNT_ID,
  createModuleId
};