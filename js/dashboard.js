// ===== Dashboard JavaScript =====

const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let allTransactions = [];
let allGoals = [];
let spendingChart = null;
let incomeExpenseChart = null;
let categoryChart = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initializeDateDisplay();
    loadUserData();
    setupEventListeners();
    displayOverview();
});

// Check authentication
async function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(user);
    updateUserGreeting();
}

// Update user greeting
function updateUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    if (greeting && currentUser) {
        const hour = new Date().getHours();
        let timeGreeting = 'Hello';
        
        if (hour < 12) timeGreeting = 'Good Morning';
        else if (hour < 18) timeGreeting = 'Good Afternoon';
        else timeGreeting = 'Good Evening';
        
        greeting.textContent = `${timeGreeting}, ${currentUser.name}! 🐼`;
    }
}

// Initialize date display
function initializeDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

// Load user data
async function loadUserData() {
    try {
        // Try to load from API
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`${API_BASE_URL}/transactions/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            allTransactions = data.transactions || [];
            allGoals = data.goals || [];
        }
    } catch (error) {
        console.log('Loading from local storage...');
        // Load from local storage
        allTransactions = JSON.parse(localStorage.getItem('transactions_' + currentUser.id) || '[]');
        allGoals = JSON.parse(localStorage.getItem('goals_' + currentUser.id) || '[]');
    }
}

// Save user data
function saveUserData() {
    localStorage.setItem('transactions_' + currentUser.id, JSON.stringify(allTransactions));
    localStorage.setItem('goals_' + currentUser.id, JSON.stringify(allGoals));
}

// Setup event listeners
function setupEventListeners() {
    // Transaction form
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('trans-date').value = today;
        
        transactionForm.addEventListener('submit', handleAddTransaction);
    }
    
    // Goal form
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', handleAddGoal);
    }
    
    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        populateSettingsForm();
        settingsForm.addEventListener('submit', handleSaveSettings);
    }
}

// Handle add transaction
async function handleAddTransaction(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now().toString(),
        type: document.getElementById('trans-type').value,
        category: document.getElementById('trans-category').value,
        amount: parseFloat(document.getElementById('trans-amount').value),
        date: document.getElementById('trans-date').value,
        description: document.getElementById('trans-description').value || 'No description',
        timestamp: new Date().toISOString()
    };
    
    if (transaction.amount <= 0) {
        alert('Amount must be greater than 0!');
        return;
    }
    
    allTransactions.push(transaction);
    saveUserData();
    
    e.target.reset();
    document.getElementById('trans-date').value = new Date().toISOString().split('T')[0];
    
    alert('✅ Transaction added successfully!');
    
    if (document.getElementById('overview').classList.contains('active')) {
        displayOverview();
    }
    
    if (document.getElementById('tracker').classList.contains('active')) {
        displayTrackerTransactions();
    }
    
    // Try to sync with API
    syncToAPI('transaction', transaction);
}

// Handle add goal
function handleAddGoal(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now().toString(),
        name: document.getElementById('goal-name').value,
        targetAmount: parseFloat(document.getElementById('goal-target').value),
        deadline: document.getElementById('goal-deadline').value,
        currentAmount: 0,
        timestamp: new Date().toISOString()
    };
    
    if (goal.targetAmount <= 0) {
        alert('Target amount must be greater than 0!');
        return;
    }
    
    allGoals.push(goal);
    saveUserData();
    
    e.target.reset();
    alert('✅ Goal added successfully!');
    displayGoals();
    
    // Try to sync with API
    syncToAPI('goal', goal);
}

// Sync to API
async function syncToAPI(type, data) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = type === 'transaction' ? '/transactions/add' : '/goals/add';
        
        await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.log('Syncing to API failed, data saved locally');
    }
}

// Switch between tabs
function switchTab(tabName) {
    event?.preventDefault?.();
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Set active nav item
    event?.target?.classList.add('active');
    
    // Load tab-specific content
    switch (tabName) {
        case 'overview':
            displayOverview();
            break;
        case 'tracker':
            displayTrackerTransactions();
            break;
        case 'calculator':
            // Calculator is interactive, no need to load
            break;
        case 'reports':
            displayReports();
            break;
        case 'goals':
            displayGoals();
            break;
        case 'settings':
            populateSettingsForm();
            break;
    }
}

// Display overview
function displayOverview() {
    calculateTotals();
    displayRecentTransactions();
    drawCharts();
}

// Calculate totals
function calculateTotals() {
    const income = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const savings = allTransactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses + savings;
    
    document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('totalSavings').textContent = `$${savings.toFixed(2)}`;
    document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
}

// Display recent transactions
function displayRecentTransactions() {
    const list = document.getElementById('transactionsList');
    const recent = allTransactions.slice(-5).reverse();
    
    if (recent.length === 0) {
        list.innerHTML = '<p class="empty-message">No transactions yet. Add one to get started!</p>';
        return;
    }
    
    list.innerHTML = recent.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-category">${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount amount-${transaction.type}">
                ${transaction.type === 'expense' ? '-' : '+'}$${transaction.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Display tracker transactions
function displayTrackerTransactions() {
    const container = document.getElementById('allTransactions');
    
    if (allTransactions.length === 0) {
        container.innerHTML = '<p class="empty-message">No transactions yet.</p>';
        return;
    }
    
    const grouped = allTransactions.reduce((acc, trans) => {
        const date = trans.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(trans);
        return acc;
    }, {});
    
    const sortedDates = Object.keys(grouped).sort().reverse();
    
    container.innerHTML = sortedDates.map(date => `
        <div class="date-group">
            <h4>${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
            ${grouped[date].map(trans => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${trans.description}</div>
                        <div class="transaction-category">${trans.category}</div>
                    </div>
                    <div class="transaction-amount amount-${trans.type}">
                        ${trans.type === 'expense' ? '-' : '+'}$${trans.amount.toFixed(2)}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Draw charts
function drawCharts() {
    drawSpendingChart();
    drawIncomeExpenseChart();
}

// Draw spending chart
function drawSpendingChart() {
    const ctx = document.getElementById('spendingChart');
    if (!ctx) return;
    
    const categories = {};
    
    allTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    if (spendingChart) {
        spendingChart.destroy();
    }
    
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
    
    spendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: colors.slice(0, data.length || 1),
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Draw income vs expense chart
function drawIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;
    
    const weeks = getLastNWeeks(4);
    
    const incomeData = weeks.map(week => {
        const start = week.start;
        const end = week.end;
        return allTransactions
            .filter(t => t.type === 'income' && t.date >= start && t.date <= end)
            .reduce((sum, t) => sum + t.amount, 0);
    });
    
    const expenseData = weeks.map(week => {
        const start = week.start;
        const end = week.end;
        return allTransactions
            .filter(t => t.type === 'expense' && t.date >= start && t.date <= end)
            .reduce((sum, t) => sum + t.amount, 0);
    });
    
    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }
    
    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeks.map(w => `Week of ${new Date(w.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9'
                    }
                }
            }
        }
    });
}

// Get last N weeks
function getLastNWeeks(n) {
    const weeks = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        
        weeks.push({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    }
    return weeks;
}

// Display reports
function displayReports() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const weekTransactions = allTransactions.filter(t => t.date >= weekStartStr && t.date <= weekEndStr);
    
    const weekIncome = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const weekExpense = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const weekSavings = weekTransactions
        .filter(t => t.type === 'savings')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netSavings = weekIncome - weekExpense + weekSavings;
    const savingsRate = weekIncome > 0 ? ((netSavings / weekIncome) * 100).toFixed(1) : 0;
    
    document.getElementById('weekIncome').textContent = `$${weekIncome.toFixed(2)}`;
    document.getElementById('weekExpense').textContent = `$${weekExpense.toFixed(2)}`;
    document.getElementById('weekSavings').textContent = `$${netSavings.toFixed(2)}`;
    document.getElementById('savingsRate').textContent = `${savingsRate}%`;
    
    drawCategoryChart();
}

// Draw category chart
function drawCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categories = {};
    
    allTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
                label: 'Spending by Category',
                data: data.length > 0 ? data : [0],
                backgroundColor: colors.slice(0, data.length || 1),
                borderColor: '#1e293b',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f1f5f9'
                    }
                }
            }
        }
    });
}

// Display goals
function displayGoals() {
    const container = document.getElementById('goalsList');
    
    if (allGoals.length === 0) {
        container.innerHTML = '<p class="empty-message">No goals yet. Create one to get started!</p>';
        return;
    }
    
    container.innerHTML = allGoals.map(goal => {
        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-item">
                <h4>${goal.name}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="goal-info">
                    <div>$${goal.currentAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</div>
                    <div>${progress.toFixed(0)}% Complete</div>
                </div>
                <div class="goal-info">
                    <div>Target: ${new Date(goal.deadline).toLocaleDateString()}</div>
                    <div>${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Populate settings form
function populateSettingsForm() {
    if (!currentUser) return;
    
    document.getElementById('settings-name').value = currentUser.name;
    document.getElementById('settings-email').value = currentUser.email;
    document.getElementById('settings-newsletter').checked = currentUser.subscribe_newsletter || false;
}

// Handle save settings
function handleSaveSettings(e) {
    e.preventDefault();
    
    currentUser.name = document.getElementById('settings-name').value;
    currentUser.email = document.getElementById('settings-email').value;
    currentUser.subscribe_newsletter = document.getElementById('settings-newsletter').checked;
    
    localStorage.setItem('user', JSON.stringify(currentUser));
    alert('✅ Settings saved successfully!');
    updateUserGreeting();
}

// Export data
function exportData() {
    const data = {
        user: currentUser,
        transactions: allTransactions,
        goals: allGoals,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pandaSave_data_${new Date().getTime()}.json`;
    link.click();
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
}
