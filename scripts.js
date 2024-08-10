document.addEventListener('DOMContentLoaded', () => {
  const uploadFileInput = document.getElementById('upload-file');
  const partyNameInput = document.getElementById('party-name');
  const itemInput = document.getElementById('item');
  const priceInput = document.getElementById('price');
  const quantityInput = document.getElementById('quantity');
  const continueBtn = document.getElementById('continue-btn');
  const exitBtn = document.getElementById('exit-btn');
  const restartBtn = document.getElementById('restart-btn');
  const exportBtn = document.getElementById('export-btn');
  const messageDiv = document.getElementById('message');
  const suggestionsDiv = document.getElementById('suggestions');

  let items = [];
  let entries = [];

  uploadFileInput.addEventListener('change', handleFileUpload);
  continueBtn.addEventListener('click', addEntry);
  exitBtn.addEventListener('click', exitProgram);
  restartBtn.addEventListener('click', restartProgram);
  exportBtn.addEventListener('click', exportToExcel);
  itemInput.addEventListener('input', showSuggestions);

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
          
          // Extract items from column B (usually 'B' in Excel is the second column)
          if (json.length > 0) {
            items = json.map(row => row[Object.keys(row)[1]]).filter(item => item); // Column B is index 1
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

  function addEntry() {
    const partyName = partyNameInput.value;
    const item = itemInput.value;
    const price = priceInput.value; // Price is optional
    const quantity = quantityInput.value;

    if (partyName && item && quantity) {
      entries.push({ partyName, item, price: price || 'N/A', quantity }); // Default price to 'N/A' if not provided
      clearInputs(false); // Do not clear party name
    } else {
      showMessage('Party Name, Item, and Quantity are required fields.');
    }
  }

  function exitProgram() {
    showMessage('Exiting...');
    // Handle exiting the program (e.g., clear data or navigate away)
  }

  function restartProgram() {
    entries = [];
    clearInputs(true); // Clear all inputs including party name
    showMessage('Entries cleared');
  }

  function exportToExcel() {
    if (!entries.length) {
      showMessage('No data to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(entries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entries');
    XLSX.writeFile(wb, 'data_entries.xlsx');
  }

  function clearInputs(clearPartyName) {
    if (clearPartyName) {
      partyNameInput.value = '';
    }
    itemInput.value = '';
    priceInput.value = '';
    quantityInput.value = '';
    suggestionsDiv.innerHTML = '';
  }

  function showSuggestions() {
    const input = itemInput.value.toLowerCase();
    suggestionsDiv.innerHTML = '';

    if (input) {
      const filteredItems = items.filter(item => item.toLowerCase().includes(input));
      filteredItems.forEach(item => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.textContent = item;
        suggestionDiv.addEventListener('click', () => {
          itemInput.value = item;
          suggestionsDiv.innerHTML = '';
        });
        suggestionsDiv.appendChild(suggestionDiv);
      });
    }
  }

  function showMessage(message) {
    messageDiv.textContent = message;
  }
});
