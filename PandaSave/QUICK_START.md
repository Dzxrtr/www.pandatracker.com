# 🚀 PandaSave Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Install Backend Dependencies (1 minute)

Open a terminal/command prompt and navigate to the PandaSave folder:

```bash
cd path/to/PandaSave
pip install -r requirements.txt
```

### Step 2: Start the Backend Server (30 seconds)

```bash
python app.py
```

**Expected Output:**
```
🐼 PandaSave Backend is starting...
📍 Running on http://localhost:5000
```

Keep this terminal open! The backend needs to be running.

### Step 3: Open the Frontend (30 seconds)

**Option A: Direct File Opening**
- Navigate to the PandaSave folder
- Double-click `index.html`

**Option B: Local Server (Recommended)**

Open a new terminal and run:

```bash
# From PandaSave directory
python -m http.server 8000
```

Then visit: `http://localhost:8000`

### Step 4: Create Your Account (1 minute)

1. Click "Create Account"
2. Fill in your details:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (min. 6 characters)
3. Optionally subscribe to newsletter
4. Click "Sign Up"

✅ You're in! Start tracking your money!

## 💡 Quick Tips

### First Transaction
1. Go to "Track Money" tab
2. Select Type: Income / Expense / Savings
3. Choose a category
4. Enter amount and date
5. Add description (optional)
6. Click "Add Transaction"

### View Dashboard
1. Overview tab shows summary cards and charts
2. Charts update automatically as you add transactions
3. Recent transactions appear in the dashboard

### Use Calculators
- **Expense Calculator**: Add multiple expenses to see total
- **Savings Goal**: Calculate monthly savings needed
- **Budget Breakdown**: See recommended spending allocation
- **Compound Interest**: Calculate investment growth

### Create Goals
1. Go to "Goals" tab
2. Enter goal name (e.g., "Vacation")
3. Set target amount
4. Set deadline
5. Progress updates as you save

## 📊 Understanding Your Dashboard

**Summary Cards:**
- 💰 **Income**: Money coming in
- 💸 **Expenses**: Money going out
- 💎 **Savings**: Money saved
- 📊 **Balance**: Total remaining

**Charts:**
- **Spending Distribution**: Pie chart of expense categories
- **Income vs Expenses**: Weekly comparison

**Sections:**
- **Overview**: Quick snapshot of finances
- **Track Money**: Add/view all transactions
- **Calculator**: Financial tools and calculators
- **Reports**: Weekly summaries and analytics
- **Goals**: Create and track savings goals
- **Settings**: Profile and preferences

## 🔒 Important Security Notes

**Default Setup:**
- Uses SQLite database (local storage)
- Passwords are hashed and secure
- Data stored on your computer

**Before Going Live:**
1. Change SECRET_KEY in app.py
2. Set up proper database (PostgreSQL/MySQL)
3. Enable HTTPS
4. Configure CORS properly
5. Add rate limiting
6. Enable input validation

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | Change port in app.py: `app.run(port=5001)` |
| Can't connect to backend | Make sure `python app.py` is running |
| Transactions not saving | Check browser console (F12) for errors |
| Charts not showing | Refresh page or clear cache |
| Database errors | Delete `pandaSave.db` and restart |

## 📁 File Checklist

Ensure all files exist:
- ✅ `index.html` - Login/Signup page
- ✅ `dashboard.html` - Main app
- ✅ `app.py` - Backend server
- ✅ `requirements.txt` - Python packages
- ✅ `css/style.css` - Styling
- ✅ `js/auth.js` - Authentication
- ✅ `js/dashboard.js` - Dashboard logic
- ✅ `js/calculator.js` - Calculator functions
- ✅ `README.md` - Full documentation
- ✅ `QUICK_START.md` - This file

## 🎯 Next Steps

1. ✅ Add 5-10 transactions
2. ✅ Explore all dashboard tabs
3. ✅ Set a savings goal
4. ✅ Check your reports
5. ✅ Use calculators for planning
6. ✅ Subscribe to newsletter

## 📞 Need Help?

**Check These First:**
1. Browser console (F12 → Console tab)
2. Terminal where backend is running
3. README.md for detailed info

**Common Issues:**
- **Network Error**: Backend not running
- **No Data**: Make sure transactions are added
- **Charts Blank**: Try refreshing page
- **Login Issues**: Check email/password, clear cache

## 🎉 Success!

You're all set! Your PandaSave money tracker is ready to help you:
- Track every dollar
- Visualize spending
- Plan savings goals
- Make smart financial decisions

**Start tracking today! 🐼💰**

---

Questions? Check README.md for complete documentation!
