"""
PandaSave Backend - Flask Application
A comprehensive money tracking and savings application backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
import json
import sqlite3

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pandaSave.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=30)

# Initialize database
db = SQLAlchemy(app)

# ===== Database Models =====

class User(db.Model):
    """User model for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    subscribe_newsletter = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subscribe_newsletter': self.subscribe_newsletter,
            'created_at': self.created_at.isoformat()
        }


class Transaction(db.Model):
    """Transaction model"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # income, expense, savings
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert transaction to dictionary"""
        return {
            'id': self.id,
            'type': self.type,
            'category': self.category,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }


class Goal(db.Model):
    """Savings goal model"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0)
    deadline = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert goal to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'targetAmount': self.target_amount,
            'currentAmount': self.current_amount,
            'deadline': self.deadline.isoformat(),
            'created_at': self.created_at.isoformat()
        }


class NewsletterSubscriber(db.Model):
    """Newsletter subscriber model"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'email': self.email,
            'subscribed_at': self.subscribed_at.isoformat()
        }


# ===== Helper Functions =====

def generate_token(user_id):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token


def verify_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def token_required(f):
    """Decorator for routes requiring authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        user_id = verify_token(token)
        if user_id is None:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return f(user, *args, **kwargs)
    
    return decorated


# ===== API Routes =====

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PandaSave Backend',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# ===== Authentication Routes =====

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not all(k in data for k in ['name', 'email', 'password']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 409
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            subscribe_newsletter=data.get('subscribe_newsletter', False)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Account created successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@app.route('/api/auth/signin', methods=['POST'])
def signin():
    """User signin endpoint"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'message': 'Missing email or password'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Signed in successfully',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


# ===== Transaction Routes =====

@app.route('/api/transactions/<int:user_id>', methods=['GET'])
@token_required
def get_transactions(current_user, user_id):
    """Get all transactions for a user"""
    if current_user.id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'goals': [g.to_dict() for g in goals]
    }), 200


@app.route('/api/transactions/add', methods=['POST'])
@token_required
def add_transaction(current_user):
    """Add a new transaction"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['type', 'category', 'amount', 'date']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Create transaction
        transaction = Transaction(
            user_id=current_user.id,
            type=data['type'],
            category=data['category'],
            amount=data['amount'],
            date=datetime.fromisoformat(data['date']).date(),
            description=data.get('description', '')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction added successfully',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@app.route('/api/transactions/<int:trans_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, trans_id):
    """Delete a transaction"""
    transaction = Transaction.query.get(trans_id)
    
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    
    if transaction.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transaction deleted successfully'}), 200


# ===== Goals Routes =====

@app.route('/api/goals/add', methods=['POST'])
@token_required
def add_goal(current_user):
    """Add a new savings goal"""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['name', 'targetAmount', 'deadline']
        if not data or not all(k in data for k in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Create goal
        goal = Goal(
            user_id=current_user.id,
            name=data['name'],
            target_amount=data['targetAmount'],
            deadline=datetime.fromisoformat(data['deadline']).date(),
            current_amount=data.get('currentAmount', 0)
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'message': 'Goal added successfully',
            'goal': goal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
@token_required
def update_goal(current_user, goal_id):
    """Update a savings goal"""
    try:
        goal = Goal.query.get(goal_id)
        
        if not goal:
            return jsonify({'message': 'Goal not found'}), 404
        
        if goal.user_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'name' in data:
            goal.name = data['name']
        if 'targetAmount' in data:
            goal.target_amount = data['targetAmount']
        if 'currentAmount' in data:
            goal.current_amount = data['currentAmount']
        if 'deadline' in data:
            goal.deadline = datetime.fromisoformat(data['deadline']).date()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Goal updated successfully',
            'goal': goal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
@token_required
def delete_goal(current_user, goal_id):
    """Delete a savings goal"""
    goal = Goal.query.get(goal_id)
    
    if not goal:
        return jsonify({'message': 'Goal not found'}), 404
    
    if goal.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'}), 200


# ===== Newsletter Routes =====

@app.route('/api/newsletter/subscribe', methods=['POST'])
def subscribe_newsletter():
    """Subscribe to newsletter"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data:
            return jsonify({'message': 'Email is required'}), 400
        
        # Check if already subscribed
        existing = NewsletterSubscriber.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'message': 'Email already subscribed'}), 409
        
        # Add subscriber
        subscriber = NewsletterSubscriber(email=data['email'])
        db.session.add(subscriber)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully subscribed to newsletter',
            'subscriber': subscriber.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


@app.route('/api/newsletter/unsubscribe/<email>', methods=['POST'])
def unsubscribe_newsletter(email):
    """Unsubscribe from newsletter"""
    try:
        subscriber = NewsletterSubscriber.query.filter_by(email=email).first()
        
        if not subscriber:
            return jsonify({'message': 'Email not found'}), 404
        
        db.session.delete(subscriber)
        db.session.commit()
        
        return jsonify({'message': 'Successfully unsubscribed from newsletter'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


# ===== User Profile Routes =====

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get user profile"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200


@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    try:
        data = request.get_json()
        
        if 'name' in data:
            current_user.name = data['name']
        if 'subscribe_newsletter' in data:
            current_user.subscribe_newsletter = data['subscribe_newsletter']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500


# ===== Statistics Routes =====

@app.route('/api/statistics/<int:user_id>', methods=['GET'])
@token_required
def get_statistics(current_user, user_id):
    """Get user statistics"""
    if current_user.id != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    
    # Calculate totals
    total_income = sum(t.amount for t in transactions if t.type == 'income')
    total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
    total_savings = sum(t.amount for t in transactions if t.type == 'savings')
    
    # Category breakdown
    categories = {}
    for t in transactions:
        if t.type == 'expense':
            categories[t.category] = categories.get(t.category, 0) + t.amount
    
    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'total_savings': total_savings,
        'balance': total_income - total_expenses + total_savings,
        'categories': categories,
        'transaction_count': len(transactions)
    }), 200


# ===== Error Handlers =====

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors"""
    return jsonify({'message': 'Bad request'}), 400


@app.errorhandler(401)
def unauthorized(error):
    """Handle 401 errors"""
    return jsonify({'message': 'Unauthorized'}), 401


@app.errorhandler(403)
def forbidden(error):
    """Handle 403 errors"""
    return jsonify({'message': 'Forbidden'}), 403


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'message': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    db.session.rollback()
    return jsonify({'message': 'Internal server error'}), 500


# ===== Database Initialization =====

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")


# ===== Main =====

if __name__ == '__main__':
    # Create tables on first run
    create_tables()
    
    # Run the app
    print("🐼 PandaSave Backend is starting...")
    print("📍 Running on http://localhost:5000")
    print("📚 API Documentation available at http://localhost:5000/api")
    
    app.run(debug=True, host='localhost', port=5000)
