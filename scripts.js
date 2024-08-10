function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet);
        
        // Clear previous items and suggestions
        items = [];
        suggestionsDiv.innerHTML = '';

        // Extract items from the column named 'list'
        if (json.length > 0) {
          items = json.map(row => row[Object.keys(row)[1]]).filter(item => item);
          showSuggestions(); // Update suggestions based on the new list
        }
      } catch (error) {
        console.error('Error reading file:', error);
        showMessage('Error reading file.');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    showMessage('Please upload a valid Excel file.');
  }
}
