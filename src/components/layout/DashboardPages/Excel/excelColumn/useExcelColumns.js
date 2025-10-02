export function useExcelColumns() {
  
  const getColumnsForStep = () => {
    return [
      { field: "column1", label: "Name", type: "string", width: "255px"},
      { field: "column2", label: "Email", type: "string", width: "255px" },
      { field: "column3", label: "Age", type: "number", width: "255px" },
      { field: "column4", label: "Mobile", type: "number", width: "255px" },
    ];
  };

  const getEditorRef = (index) => {
    return `customEditor${index}`;
  };

  const getTypeForStep = (index) => {
    return `custom${index}`;
  };

  return { getColumnsForStep, getEditorRef, getTypeForStep };
}