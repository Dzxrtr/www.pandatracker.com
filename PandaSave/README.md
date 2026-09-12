# 🐼 PandaSave - Smart Money Tracker & Savings App

Welcome to **PandaSave**, your intelligent companion for tracking money, managing expenses, and achieving your financial goals!

## 📋 Features

✨ **Core Features:**
- 💰 **Track Income & Expenses** - Monitor every transaction with ease
- 📊 **Visual Pie Charts** - See spending patterns at a glance
- 🧮 **Built-in Calculator** - Calculate expenses, savings goals, and compound interest
- 📈 **Weekly Reports** - Get comprehensive financial summaries
- 🎯 **Savings Goals** - Set and track your financial objectives
- 🔐 **Secure & Private** - Your data is encrypted and secure
- 📧 **Newsletter Subscription** - Get money-saving tips and updates
- 💻 **User-Friendly Dashboard** - Beautiful, intuitive interface with glowing effects

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (optional, for any frontend tooling)

### Installation

#### 1. **Clone or Download the Project**
```bash
cd PandaSave
```

#### 2. **Backend Setup**

**Install Python Dependencies:**
```bash
pip install -r requirements.txt
```

**Initialize the Database:**
```bash
python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

**Start the Backend Server:**
```bash
python app.py
```

You should see:
```
🐼 PandaSave Backend is starting...
📍 Running on http://localhost:5000
```

The backend will create a SQLite database (`pandaSave.db`) automatically.

#### 3. **Frontend Setup**

No build process needed! Simply open in your browser:

```bash
# Option 1: Open index.html directly
# Just double-click index.html in the PandaSave folder

# Option 2: Use a local server (recommended)
# Python 3.x
python -m http.server 8000

# Then visit http://localhost:8000
```

## 📁 Project Structure

```
PandaSave/
├── index.html              # Sign-up and Login page
├── dashboard.html          # Main application dashboard
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
├── README.md              # This file
│
├── css/
│   └── style.css          # All styles with glowing effects
│
├── js/
│   ├── auth.js            # Authentication logic
│   ├── dashboard.js       # Dashboard & transaction management
│   └── calculator.js      # Financial calculators
│
└── README.md
```

## 🔐 Authentication

### Sign Up
1. Go to `http://localhost:8000` (or your local server)
2. Click "Create Account"
3. Enter your details
4. Optionally subscribe to newsletter
5. Click "Sign Up"

### Sign In
1. Go to the login page
2. Enter your email and password
3. Click "Sign In"

**Note:** Credentials are stored securely with password hashing.

## 💰 Features Explained

### 1. **Dashboard Overview**
- View summary cards: Total Income, Expenses, Savings, and Balance
- See spending distribution in real-time pie charts
- View recent transactions at a glance

### 2. **Track Money**
- Add income, expenses, and savings transactions
- Categorize transactions (Salary, Food, Transport, etc.)
- Add descriptions for better record-keeping
- View all transactions sorted by date

### 3. **Financial Calculators**

**Expense Calculator:**
- Sum up multiple expenses quickly
- Format: `Item: amount, Item: amount`

**Savings Goal Calculator:**
- Calculate monthly savings needed for a goal
- Input target amount and number of months

**Budget Breakdown:**
- Automatically calculate 50/30/20 budget rule
- See recommended allocation for housing, food, transport, and savings

**Compound Interest Calculator:**
- Calculate investment growth over time
- See how your money can grow with interest

### 4. **Weekly Reports**
- Get weekly income and expense summaries
- Track your savings rate
- See category-based spending breakdown

### 5. **Savings Goals**
- Create financial goals (vacation, car, house, etc.)
- Set target amounts and deadlines
- Track progress with visual progress bars
- Monitor days remaining to reach goals

### 6. **Settings**
- Update your profile information
- Manage newsletter preferences
- Export your financial data as JSON

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in to account

### Transactions
- `GET /api/transactions/<user_id>` - Get all transactions
- `POST /api/transactions/add` - Add new transaction
- `DELETE /api/transactions/<trans_id>` - Delete transaction

### Goals
- `POST /api/goals/add` - Create new goal
- `PUT /api/goals/<goal_id>` - Update goal
- `DELETE /api/goals/<goal_id>` - Delete goal

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe/<email>` - Unsubscribe

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Statistics
- `GET /api/statistics/<user_id>` - Get user statistics

## 💾 Data Storage

**Local Storage (Browser):**
- User info
- Transactions
- Goals
- Newsletter subscribers

**SQLite Database (Backend):**
- User accounts with hashed passwords
- Transactions with full details
- Savings goals with progress
- Newsletter subscriptions

Data automatically syncs between frontend and backend when the API is available.

## 🎨 Customization

### Change App Name
1. Edit all `PandaSave` text in HTML files
2. Update CSS variables in `css/style.css`
3. Modify company name in footer

### Change Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #6366f1;      /* Main color */
    --secondary-color: #ec4899;    /* Accent color */
    --success-color: #10b981;      /* Success/Income */
    --danger-color: #ef4444;       /* Danger/Expense */
    /* ... more colors ... */
}
```

### Change Emoji
Find 🐼 emoji markers in the code and replace with your preferred emoji.

## 🛡️ Security Considerations

**Production Deployment:**

1. **Change Secret Key:**
   ```python
   # In app.py
   app.config['SECRET_KEY'] = 'your-unique-secret-key-here'
   ```

2. **Use Environment Variables:**
   ```python
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
   ```

3. **Enable HTTPS:**
   - Use a reverse proxy like Nginx
   - Set up SSL certificates

4. **Use Production Database:**
   - Replace SQLite with PostgreSQL or MySQL
   - Update connection string in app.py

5. **CORS Security:**
   - Restrict CORS to your domain only
   - In app.py: `CORS(app, resources={r"/api/*": {"origins": ["your-domain.com"]}})`

## 🐛 Troubleshooting

**"Connection refused" error?**
- Make sure backend server is running: `python app.py`
- Check if port 5000 is available

**Charts not showing?**
- Make sure Chart.js CDN is accessible
- Check browser console for errors (F12)

**Can't save transactions?**
- Check browser console for error messages
- Verify backend is running
- Clear browser cache and try again

**Database locked error?**
- Close other instances of the app
- Delete `pandaSave.db` and restart the backend

## 📱 Browser Compatibility

- ✅ Chrome/Chromium (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Want to add features? Here are ideas:
- Multi-currency support
- Budget alerts and notifications
- Export to PDF/Excel
- Recurring transactions
- Receipt image upload
- Integration with bank APIs
- Mobile app (React Native/Flutter)

## 📄 License

This project is free to use and modify for personal and commercial purposes.

## 💬 Support

**Having issues?**
1. Check the Troubleshooting section
2. Review the API error messages in browser console (F12)
3. Verify all files are in correct directories
4. Ensure Python and dependencies are installed correctly

## 🎉 Getting Started Checklist

- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Start backend: `python app.py`
- [ ] Open index.html in browser or start local server
- [ ] Create an account
- [ ] Add your first transaction
- [ ] Check out the dashboard and charts
- [ ] Explore the calculator features
- [ ] Set a savings goal
- [ ] Subscribe to the newsletter

## 🚀 Future Enhancements

- Dark/Light theme toggle
- Multi-language support
- Voice commands for transactions
- AI-powered spending insights
- Automatic categorization with machine learning
- Social sharing of goals and achievements
- Integration with payment apps

---

**Happy Saving with PandaSave! 🐼💰**

Made with ❤️ for your financial wellness.
