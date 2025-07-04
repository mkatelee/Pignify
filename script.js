function addPigRow() {
  const tbody = document.getElementById("pigTableBody");
  const index = tbody.children.length + 1;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index}</td>
    <td><input type="number" class="form-control weight" placeholder="0" oninput="calculateTotal()"></td>
    <td><input type="number" class="form-control price" placeholder="0" oninput="calculateTotal()"></td>
    <td><input type="text" class="form-control breed" placeholder="e.g. Landrace"></td>
    <td><input type="number" class="form-control age" placeholder="0"></td>
    <td>
      <select class="form-select vaccinated">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    </td>
    <td><span class="total">₱ 0.00</span></td>
    <td>
      <button class="btn btn-sm btn-primary" onclick="showVaccinationHistory(this)">History</button>
      <button class="btn btn-sm btn-danger" onclick="deletePigRow(this)"><i class="bi bi-trash"></i></button>
    </td>
  `;
  tbody.appendChild(row);
}

function calculateTotal() {
  let total = 0;
  document.querySelectorAll("#pigTableBody tr").forEach(row => {
    const weight = parseFloat(row.querySelector(".weight")?.value) || 0;
    const price = parseFloat(row.querySelector(".price")?.value) || 0;
    const sum = weight * price;
    row.querySelector(".total").textContent = `₱ ${sum.toFixed(2)}`;
    total += sum;
  });
  document.getElementById("totalOutput").textContent = `Total Price: ₱ ${total.toFixed(2)}`;
}

function deletePigRow(btn) {
  btn.closest("tr").remove();
  calculateTotal();
}

function showVaccinationHistory(btn) {
  const row = btn.closest("tr");
  const pigNumber = row.cells[0].innerText;
  const breed = row.querySelector(".breed").value || "Unknown";
  const age = row.querySelector(".age").value || "Unknown";
  const vaccinated = row.querySelector(".vaccinated").value;

  const list = document.getElementById("vaccineHistoryList");
  list.innerHTML = `
    <li class="list-group-item"><strong>Pig #:</strong> ${pigNumber}</li>
    <li class="list-group-item"><strong>Breed:</strong> ${breed}</li>
    <li class="list-group-item"><strong>Age:</strong> ${age} month(s)</li>
    <li class="list-group-item"><strong>Vaccinated:</strong> ${vaccinated}</li>
  `;

  new bootstrap.Modal(document.getElementById("vaccinationModal")).show();
}

function saveTransaction() {
  const rows = document.querySelectorAll("#pigTableBody tr");
  if (rows.length === 0) {
    const emptyModal = new bootstrap.Modal(document.getElementById("emptyWarningModal"));
    emptyModal.show();
    return;
  }

  let pigs = [];
  let grandTotal = 0;

  rows.forEach((row, idx) => {
    const weight = parseFloat(row.querySelector(".weight").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const breed = row.querySelector(".breed").value || "Unknown";
    const age = row.querySelector(".age").value || "Unknown";
    const vaccinated = row.querySelector(".vaccinated").value;

    const total = weight * price;
    grandTotal += total;

    pigs.push({ id: idx + 1, weight, price, breed, age, vaccinated, total });
  });

  const transaction = {
    buyer: document.getElementById("buyer").value || "Anonymous",
    pigs,
    total: grandTotal,
    date: new Date().toLocaleString()
  };

  let saved = JSON.parse(localStorage.getItem("transactions")) || [];
  saved.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(saved));

  // Show success modal (no alert!)
  const modal = new bootstrap.Modal(document.getElementById("saveSuccessModal"));
  modal.show();
}

  let defaultFeedTypes = ["Starter", "Grower", "Finisher", "Breeder"];
    let confirmAction = null;

    document.addEventListener("DOMContentLoaded", () => {
      const toggle = document.getElementById("darkModeToggle");
      const body = document.getElementById("mainBody");

      if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("bg-dark", "text-light");
        toggle.checked = true;
      }

      toggle?.addEventListener("change", () => {
        if (toggle.checked) {
          body.classList.add("bg-dark", "text-light");
          localStorage.setItem("darkMode", "enabled");
        } else {
          body.classList.remove("bg-dark", "text-light");
          localStorage.setItem("darkMode", "disabled");
        }
      });
      loadFeedRows(); // ✅ Load from localStorage

      populateDeleteFeedDropdown();
      populateFeedFilterDropdown();
    });

    function getFeedTypes() {
      const customTypes = JSON.parse(localStorage.getItem("customFeedTypes")) || [];
      return [...defaultFeedTypes, ...customTypes];
    }

    function populateFeedDropdown(selectElement) {
      const types = getFeedTypes();
      selectElement.innerHTML = "";
      types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        selectElement.appendChild(option);
      });
    }

    function populateDeleteFeedDropdown() {
      const select = document.getElementById("deleteFeedSelect");
      const customTypes = JSON.parse(localStorage.getItem("customFeedTypes")) || [];
      select.innerHTML = "";

      if (customTypes.length === 0) {
        const opt = document.createElement("option");
        opt.text = "No custom feeds";
        opt.disabled = true;
        select.appendChild(opt);
        return;
      }

      customTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
      });
    }

    function populateFeedFilterDropdown() {
      const filterSelect = document.getElementById("filterType");
      if (!filterSelect) return;

      filterSelect.innerHTML = `<option value="">All Types</option>`;
      const types = getFeedTypes();
      types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        filterSelect.appendChild(option);
      });
    }

    function confirmAddFeedType() {
      const input = document.getElementById("customFeedInput");
      const newType = input.value.trim();
      if (!newType) return alert("Please enter a valid feed name.");

      const existing = JSON.parse(localStorage.getItem("customFeedTypes")) || [];
      if (existing.includes(newType) || defaultFeedTypes.includes(newType)) {
        return alert("Feed type already exists.");
      }

      showModal(`Are you sure you want to add "${newType}" as a new feed type?`, () => {
        existing.push(newType);
        localStorage.setItem("customFeedTypes", JSON.stringify(existing));
        input.value = "";
        document.querySelectorAll(".feed-select").forEach(populateFeedDropdown);
        populateDeleteFeedDropdown();
        populateFeedFilterDropdown();
        showSuccess(`Feed type "${newType}" added successfully!`);
      });
    }

    function confirmDeleteFeedType() {
      const select = document.getElementById("deleteFeedSelect");
      const selected = select.value;
      if (!selected) return alert("Please select a feed type to delete.");

      showModal(`Are you sure you want to delete "${selected}"?`, () => {
        const feeds = JSON.parse(localStorage.getItem("customFeedTypes")) || [];
        const updated = feeds.filter(type => type !== selected);
        localStorage.setItem("customFeedTypes", JSON.stringify(updated));
        document.querySelectorAll(".feed-select").forEach(populateFeedDropdown);
        populateDeleteFeedDropdown();
        populateFeedFilterDropdown();
        showSuccess(`Feed type "${selected}" deleted successfully!`);
      });
    }
function addFeedRow(data = {}) {
  const tbody = document.getElementById("feedTableBody");
  const row = document.createElement("tr");

  const now = new Date();
const timestamp = data.timestamp || now.toISOString();


  row.innerHTML = `
    <td><select class="form-select feed-select"></select></td>
    <td><input type="number" class="form-control qty" placeholder="0"></td>
    <td><input type="number" class="form-control price" placeholder="0"></td>
    <td><span class="total">₱ 0.00</span></td>
    <td>
      <button class="btn btn-sm btn-danger" onclick="confirmDeleteRow(this)">
        <i class="bi bi-trash"></i>
      </button>
      <div class="small text-muted mt-1" data-timestamp="${timestamp}">
  ${new Date(timestamp).toLocaleString()}
</div>

    </td>
  `;

  tbody.appendChild(row);
  const feedSelect = row.querySelector(".feed-select");
  const qtyInput = row.querySelector(".qty");
  const priceInput = row.querySelector(".price");

  populateFeedDropdown(feedSelect);

  // Load saved values
  feedSelect.value = data.feedType || "";
  qtyInput.value = data.qty || "";
  priceInput.value = data.price || "";

  // Add event listeners
  qtyInput.oninput = priceInput.oninput = () => {
    calculateFeedTotals();
    saveFeedRows();
  };
  feedSelect.onchange = () => {
    saveFeedRows();
  };

  calculateFeedTotals();
}


function saveFeedRows() {
  const rows = document.querySelectorAll("#feedTableBody tr:not(#noRecordsRow)");
  const data = [];

  rows.forEach(row => {
    const feedType = row.querySelector(".feed-select")?.value;
    const qty = parseFloat(row.querySelector(".qty")?.value) || 0;
    const price = parseFloat(row.querySelector(".price")?.value) || 0;
    const timestamp = row.querySelector("td:last-child .text-muted")?.textContent;

    data.push({ feedType, qty, price, timestamp });
  });

  localStorage.setItem("savedFeedRows", JSON.stringify(data));
}

function loadFeedRows() {
  const saved = JSON.parse(localStorage.getItem("savedFeedRows")) || [];
  saved.forEach(row => addFeedRow(row));
}


   function confirmDeleteRow(button) {
  showModal("Are you sure you want to remove this feed row?", () => {
    button.closest("tr").remove();
    calculateFeedTotals();
    saveFeedRows(); // ✅ Save after delete
    showSuccess("Feed row deleted successfully!");
  });
}


    function calculateFeedTotals() {
      const rows = document.querySelectorAll("#feedTableBody tr:not(#noRecordsRow)");
      let grandTotal = 0;

      rows.forEach(row => {
        const qty = parseFloat(row.querySelector(".qty")?.value) || 0;
        const price = parseFloat(row.querySelector(".price")?.value) || 0;
        const totalCell = row.querySelector(".total");
        if (!totalCell) return;
        const total = qty * price;
        totalCell.textContent = `₱ ${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
        grandTotal += total;
      });

      document.getElementById("grandTotal").textContent = grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 });

    }

function applyFeedFilters() {
  const type = document.getElementById("filterType").value;
  const startInput = document.getElementById("startDate").value;
  const endInput = document.getElementById("endDate").value;

  const rows = document.querySelectorAll("#feedTableBody tr:not(#noRecordsRow)");
  let grandTotal = 0;
  let visibleCount = 0;

  rows.forEach(row => {
   const feedType = row.querySelector(".feed-select")?.value;
const qty = parseFloat(row.querySelector(".qty")?.value) || 0;
const price = parseFloat(row.querySelector(".price")?.value) || 0;

const rawTimestamp = row.querySelector("td:last-child .text-muted")?.getAttribute("data-timestamp");
const rowDateOnly = rawTimestamp ? new Date(rawTimestamp).toISOString().slice(0, 10) : null;

const startDateValue = document.getElementById("startDate").value;
const endDateValue = document.getElementById("endDate").value;

const typeMatch = !type || feedType === type;
const dateMatch =
  (!startDateValue || rowDateOnly >= startDateValue) &&
  (!endDateValue || rowDateOnly <= endDateValue);

const show = typeMatch && dateMatch;
row.style.display = show ? "" : "none";
if (show) {
  grandTotal += qty * price;
  visibleCount++;
}});

  document.getElementById("noRecordsRow").style.display = visibleCount === 0 ? "" : "none";
  document.getElementById("grandTotal").textContent = grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 });

}



    function showModal(message, onConfirm) {
      document.getElementById("confirmMessage").innerText = message;
      const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
      confirmAction = onConfirm;
      modal.show();
    }

    function showSuccess(message) {
      document.getElementById("toastMsg").innerText = message;
      const toast = new bootstrap.Toast(document.getElementById("successToast"));
      toast.show();
    }

    document.getElementById("confirmYesBtn").addEventListener("click", () => {
      if (confirmAction) confirmAction();
      const modal = bootstrap.Modal.getInstance(document.getElementById("confirmModal"));
      modal.hide();
    });
  function exportToCSV() {
  const rows = document.querySelectorAll("#feedTableBody tr:not(#noRecordsRow)");
  let csv = "Feed Type,Quantity (kg),Price per kg (₱),Total (₱),Timestamp\n";

  let exportCount = 0;

  rows.forEach(row => {
    if (row.style.display === "none") return; // Only export visible rows

    const type = row.querySelector(".feed-select")?.value || "";
    const qty = row.querySelector(".qty")?.value || "";
    const price = row.querySelector(".price")?.value || "";
    const total = (parseFloat(qty) * parseFloat(price)).toLocaleString('en-PH', { minimumFractionDigits: 2 });

    const time = row.querySelector("td:last-child .text-muted")?.textContent || "";

    csv += `"${type}",${qty},${price},${total},"${time}"\n`;
    exportCount++;
  });

  if (exportCount === 0) {
    alert("No filtered data to export.");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `feed-cost-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

function confirmDateFilter() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!start && !end) {
    return alert("Please select at least a start or end date.");
  }

  showModal(`Do you want to filter results from ${start || "beginning"} to ${end || "now"}?`, () => {
    applyFeedFilters();
    showSuccess("Date filter applied successfully.");
  });
}
function confirmDateFilter() {
  const startInput = document.getElementById("startDate").value;
  const endInput = document.getElementById("endDate").value;

  if (!startInput || !endInput) {
    showModal("Please select both a start date and an end date before applying the filter.");
    return;
  }

  applyFeedFilters(); // ✅ Only runs when both dates are selected
}

