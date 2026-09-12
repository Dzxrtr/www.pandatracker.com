// ===== Calculator JavaScript =====

// Calculate expenses
function calculateExpenses() {
    const itemsInput = document.getElementById('expense-items').value;
    
    if (!itemsInput.trim()) {
        alert('Please enter items with amounts');
        return;
    }
    
    try {
        let total = 0;
        const items = itemsInput.split(',');
        
        items.forEach(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                const amount = parseFloat(parts[1].trim());
                if (!isNaN(amount) && amount > 0) {
                    total += amount;
                }
            }
        });
        
        if (total === 0) {
            alert('No valid amounts found. Format: Item: amount, Item: amount');
            return;
        }
        
        document.getElementById('expenseResult').textContent = `$${total.toFixed(2)}`;
        
        // Show animation
        const resultElement = document.querySelector('.calc-result');
        resultElement.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            resultElement.style.animation = '';
        }, 500);
        
    } catch (error) {
        alert('Error calculating expenses. Please check your input format.');
    }
}

// Calculate savings goal
function calculateSavingsGoal() {
    const goalAmount = parseFloat(document.getElementById('goal-amount').value);
    const months = parseInt(document.getElementById('goal-months').value);
    
    if (!goalAmount || goalAmount <= 0) {
        alert('Please enter a valid goal amount');
        return;
    }
    
    if (!months || months <= 0) {
        alert('Please enter a valid number of months');
        return;
    }
    
    const monthlyAmount = goalAmount / months;
    document.getElementById('savingResult').textContent = `$${monthlyAmount.toFixed(2)}`;
    
    // Show animation
    const resultElement = document.querySelector('.calc-result');
    resultElement.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        resultElement.style.animation = '';
    }, 500);
}

// Calculate budget
function calculateBudget() {
    const income = parseFloat(document.getElementById('income-amount').value);
    
    if (!income || income <= 0) {
        alert('Please enter a valid monthly income');
        return;
    }
    
    // 50/30/20 rule modified
    const housing = income * 0.30;
    const food = income * 0.20;
    const transport = income * 0.10;
    const savings = income * 0.15;
    const other = income * 0.25;
    
    document.getElementById('budgetHousing').textContent = `$${housing.toFixed(2)}`;
    document.getElementById('budgetFood').textContent = `$${food.toFixed(2)}`;
    document.getElementById('budgetTransport').textContent = `$${transport.toFixed(2)}`;
    document.getElementById('budgetSavings').textContent = `$${savings.toFixed(2)}`;
    document.getElementById('budgetOther').textContent = `$${other.toFixed(2)}`;
}

// Calculate compound interest
function calculateCompoundInterest() {
    const principal = parseFloat(document.getElementById('principal').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const years = parseInt(document.getElementById('years').value);
    
    if (!principal || principal <= 0) {
        alert('Please enter a valid principal amount');
        return;
    }
    
    if (!rate || rate < 0) {
        alert('Please enter a valid interest rate');
        return;
    }
    
    if (!years || years <= 0) {
        alert('Please enter a valid number of years');
        return;
    }
    
    // Compound interest formula: A = P(1 + r/100)^t
    const finalAmount = principal * Math.pow(1 + (rate / 100), years);
    const interest = finalAmount - principal;
    
    document.getElementById('interestResult').textContent = `$${finalAmount.toFixed(2)}`;
    
    // Show detailed info
    console.log(`Principal: $${principal.toFixed(2)}`);
    console.log(`Interest Earned: $${interest.toFixed(2)}`);
    console.log(`Final Amount: $${finalAmount.toFixed(2)}`);
}

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);
