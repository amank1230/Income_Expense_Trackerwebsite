const balance = document.querySelector("#balance");
const inc_amt = document.querySelector("#inc-amt");
const exp_amt = document.querySelector("#exp-amt");
const trans = document.querySelector("#trans");
const form = document.querySelector("#form");
const description = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const togglePieChartBtn = document.querySelector("#togglePieChart");
const pieChartContainer = document.querySelector(".chart-container");
let pieChart; // Variable to hold the Chart.js instance

const localStorageTrans = JSON.parse(localStorage.getItem("trans"));
let transactions = localStorageTrans !== null ? localStorageTrans : [];

function loadTransactionDetails(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "exp" : "inc");
  item.innerHTML = `
    ${transaction.description}
    <span>${sign} ₹ ${Math.abs(transaction.amount)}</span>
    <button class="btn-del" onclick="removeTrans(${transaction.id})">x</button>
  `;
  trans.appendChild(item);
}

function removeTrans(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id != id);
    config();
    updateLocalStorage();
    renderPieChart(); // Update pie chart after deleting transaction
  }
}

function updateAmount() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const totalIncome = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0);
  const totalExpenses = Math.abs(amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => (acc += item), 0));

  const total = totalIncome - totalExpenses;
  balance.innerHTML = `₹ ${total}`;
  inc_amt.innerHTML = `₹ ${totalIncome}`;
  exp_amt.innerHTML = `₹ ${totalExpenses}`;
}

function config() {
  trans.innerHTML = "";
  transactions.forEach(loadTransactionDetails);
  updateAmount();
}

function addTransaction(e) {
  e.preventDefault();
  if (description.value.trim() == "" || amount.value.trim() == "") {
    alert("Please enter description and amount.");
  } else {
    const transaction = {
      id: uniqueId(),
      description: description.value,
      amount: +amount.value,
    };
    transactions.push(transaction);
    loadTransactionDetails(transaction);
    description.value = "";
    amount.value = "";
    updateAmount();
    updateLocalStorage();
    renderPieChart(); // Update pie chart after adding transaction
  }
}

function uniqueId() {
  return Math.floor(Math.random() * 10000000);
}

form.addEventListener("submit", addTransaction);

window.addEventListener("load", function () {
  config();
});

function updateLocalStorage() {
  localStorage.setItem("trans", JSON.stringify(transactions));
}

// Function to calculate total income and total expenses
function calculateTotals() {
  const totalIncome = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const totalExpenses = Math.abs(transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0));

  return {
    income: totalIncome,
    expenses: totalExpenses
  };
}

// Function to render pie chart
function renderPieChart() {
  const totals = calculateTotals();
  const totalIncome = totals.income;
  const totalExpenses = totals.expenses;

  // Check if totalIncome is greater than zero to prevent division by zero
  if (totalIncome === 0) {
    if (pieChart) {
      pieChart.destroy(); // Destroy the chart if it exists
    }
    pieChartContainer.style.display = "none"; // Hide the pie chart container
    return; // Exit the function
  }

  const expensePercentage = ((totalExpenses / totalIncome) * 100).toFixed(2);
  const incomePercentage = 100 - expensePercentage;

  const pieData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [incomePercentage, expensePercentage],
      backgroundColor: ['#1dd1a1', '#ee5253'],
      borderWidth: 1
    }]
  };

  if (pieChart) {
    pieChart.destroy(); // Destroy the existing chart if it exists
  }

  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: pieData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom'
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const dataset = data.datasets[tooltipItem.datasetIndex];
            const total = dataset.data.reduce((previousValue, currentValue) => previousValue + currentValue);
            const currentValue = dataset.data[tooltipItem.index];
            const percentage = currentValue.toFixed(2) + "%";
            return percentage;
          }
        }
      }
    }
  });

  // Display the pie chart container
  pieChartContainer.style.display = "block";
}

// Event listener for toggle pie chart button
togglePieChartBtn.addEventListener('click', renderPieChart);
