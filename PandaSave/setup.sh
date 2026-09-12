#!/bin/bash
# PandaSave Startup Script for Linux/macOS

echo "🐼 Welcome to PandaSave - Smart Money Tracker!"
echo "=================================================="
echo ""

# Check Python
echo "✓ Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "  Found Python $PYTHON_VERSION"
echo ""

# Check pip
echo "✓ Checking pip installation..."
if ! command -v pip3 &> /dev/null; then
    echo "✗ pip3 not found. Please install pip"
    exit 1
fi
echo "  pip3 is ready"
echo ""

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "✓ Creating virtual environment..."
    python3 -m venv venv
    echo "  Virtual environment created"
fi
echo ""

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate
echo "  Virtual environment activated"
echo ""

# Install dependencies
echo "✓ Installing dependencies..."
pip install -q -r requirements.txt
echo "  Dependencies installed"
echo ""

# Create database
echo "✓ Initializing database..."
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('  Database initialized')
"
echo ""

# Create logs directory
mkdir -p logs

# Summary
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Start the backend server (this terminal):"
echo "   python app.py"
echo ""
echo "2. In a new terminal, start frontend server:"
echo "   python -m http.server 8000"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:8000"
echo ""
echo "4. Create an account and start tracking money!"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: cat QUICK_START.md"
echo "   - Full Docs: cat README.md"
echo "   - API Docs: cat API_DOCUMENTATION.md"
echo ""
echo "=================================================="
echo "🐼 Happy Saving!"
echo "=================================================="
