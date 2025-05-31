// app.js
class ExpenseManager {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.categoryChart = null;
        this.trendChart = null;
        
        this.initializeCharts();
        this.loadExpenses();
        this.setupEventListeners();
    }

    initializeCharts() {
        const chartConfig = {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ₹${context.parsed.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        };

        this.categoryChart = new Chart(document.getElementById('categoryChart'), chartConfig);
        
        this.trendChart = new Chart(document.getElementById('monthlyTrend'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Monthly Spending',
                    data: [],
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ₹' + context.parsed.y.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense({
                amount: parseFloat(document.getElementById('amount').value),
                category: document.getElementById('category').value,
                date: document.getElementById('date').value,
                description: document.getElementById('description').value
            });
        });
    }

    addExpense(expense) {
        this.expenses.push(expense);
        this.saveToLocalStorage();
        this.loadExpenses();
        this.updateCharts();
        document.getElementById('expenseForm').reset();
    }

    deleteExpense(index) {
        this.expenses.splice(index, 1);
        this.saveToLocalStorage();
        this.loadExpenses();
        this.updateCharts();
    }

    saveToLocalStorage() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    loadExpenses() {
        const expenseList = document.getElementById('expenseTable');
        expenseList.innerHTML = '';
        
        this.expenses.forEach((expense, index) => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            expenseElement.innerHTML = `
                <div>${expense.category}</div>
                <div>${expense.description}</div>
                <div>₹${expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                <div>${new Date(expense.date).toLocaleDateString()}</div>
                <button onclick="expenseManager.deleteExpense(${index})">Delete</button>
            `;
            expenseList.appendChild(expenseElement);
        });

        this.updateSummary();
    }

    updateSummary() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById('totalAmount').textContent = 
            `₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        
        const monthly = this.expenses
            .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
            .reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById('monthlyAmount').textContent = 
            `₹${monthly.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    }

    updateCharts() {
        // Update Category Chart
        const categories = [...new Set(this.expenses.map(expense => expense.category))];
        const categoryData = categories.map(category => 
            this.expenses.filter(expense => expense.category === category)
                .reduce((sum, expense) => sum + expense.amount, 0)
        );

        this.categoryChart.data.labels = categories;
        this.categoryChart.data.datasets[0].data = categoryData;
        this.categoryChart.update();

        // Update Trend Chart
        const months = Array.from({length: 12}, (_, i) => 
            new Date(0, i).toLocaleString('en-US', {month: 'short'}));
        const monthlyData = Array(12).fill(0);
        
        this.expenses.forEach(expense => {
            const month = new Date(expense.date).getMonth();
            monthlyData[month] += expense.amount;
        });

        this.trendChart.data.labels = months;
        this.trendChart.data.datasets[0].data = monthlyData;
        this.trendChart.update();
    }
}

// Initialize the app
const expenseManager = new ExpenseManager();

// Set default date to today
document.getElementById('date').value = new Date().toISOString().split('T')[0];