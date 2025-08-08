export function useExcelColumns() {
  const getColumnsForStep = () => {
    return [
      { field: "column1", label: "Name", type: "string" },
      { field: "column2", label: "Email", type: "string" },
      { field: "column3", label: "Age", type: "number" },
      { field: "column4", label: "Mobile", type: "number" },
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