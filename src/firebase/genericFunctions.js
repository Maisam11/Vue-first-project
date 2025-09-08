// let dummyDB = {};

// export function get(module) {
//   console.log(`[Generic] Getting all for module: ${module}`);
//   return Object.values(dummyDB[module] || {}).map(item => ({ ...item }));
// }

// export function getById(module, id) {
//   console.log(`[Generic] Getting by ID ${id} for module: ${module}`);
//   return dummyDB[module]?.[id] ? { ...dummyDB[module][id] } : null;
// }

// export function create(module, data) {
//   console.log(`[Generic] Creating in module: ${module}`, data);
//   if (!dummyDB[module]) dummyDB[module] = {};
//   if (dummyDB[module][data.id]) {
//     throw new Error("ID already exists");
//   }
//   dummyDB[module][data.id] = { ...data, sheets: data.sheets || {} };
// }

// export function update(module, id, data) {
//   console.log(`[Generic] Updating ID ${id} in module: ${module}`, data);
//   if (dummyDB[module] && dummyDB[module][id]) {
//     dummyDB[module][id] = { ...dummyDB[module][id], ...data };
//   }
// }

// export function remove(module, id) {
//   console.log(`[Generic] Removing ID ${id} in module: ${module}`);
//   if (dummyDB[module] && dummyDB[module][id]) {
//     delete dummyDB[module][id];
//   }
// }

// export function getPaginated(module, page = 1, limit = 10) {
//   console.log(`[Generic] Getting paginated for module: ${module}, page: ${page}, limit: ${limit}`);
//   const all = get(module);
//   const start = (page - 1) * limit;
//   return all.slice(start, start + limit);
// }