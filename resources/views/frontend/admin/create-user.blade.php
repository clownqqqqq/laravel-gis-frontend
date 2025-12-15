@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">➕</span> Create New User
        </h1>
        <a href="/admin/users" class="btn btn-add-location">
            <span>←</span> Back to Users
        </a>
    </div>

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <div class="card">
        <h3>User Information</h3>
        <form method="POST" action="/admin/users/create">
            @csrf
            <div class="form-row">
                <div class="form-group">
                    <label for="username">Username *</label>
                    <input type="text" id="username" name="username" required 
                           value="{{ old('username') }}" 
                           placeholder="Enter username">
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required 
                           value="{{ old('email') }}" 
                           placeholder="Enter email">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="password">Password *</label>
                    <input type="password" id="password" name="password" required 
                           minlength="6" 
                           placeholder="Minimum 6 characters">
                </div>

                <div class="form-group">
                    <label for="role">Role *</label>
                    <select id="role" name="role" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                        <option value="">Select Role</option>
                        <option value="admin" {{ old('role') == 'admin' ? 'selected' : '' }}>👑 Admin</option>
                        <option value="staff" {{ old('role') == 'staff' ? 'selected' : '' }}>🛠 Staff</option>
                        <option value="member" {{ old('role') == 'member' ? 'selected' : '' }}>🧑 Member</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="firstname">First Name</label>
                    <input type="text" id="firstname" name="firstname" 
                           value="{{ old('firstname') }}" 
                           placeholder="Enter first name">
                </div>

                <div class="form-group">
                    <label for="lastname">Last Name</label>
                    <input type="text" id="lastname" name="lastname" 
                           value="{{ old('lastname') }}" 
                           placeholder="Enter last name">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="mobile_number">Mobile Number</label>
                    <input type="tel" id="mobile_number" name="mobile_number" 
                           value="{{ old('mobile_number') }}" 
                           placeholder="+1234567890">
                </div>

                <div class="form-group">
                    <label for="assigned_area">Assigned Area (for Staff)</label>
                    <input type="text" id="assigned_area" name="assigned_area" 
                           value="{{ old('assigned_area') }}" 
                           placeholder="e.g., Downtown, North District">
                </div>
            </div>

            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" style="background: #28a745; color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <span>✅</span> Create User
                </button>
                <a href="/admin/users" class="btn" style="background: #6c757d; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; display: inline-block;">
                    Cancel
                </a>
            </div>
        </form>
    </div>

    <div class="card" style="background: #f8f9fa; margin-top: 20px;">
        <h4 style="color: #495057; margin-bottom: 10px;">ℹ️ Role Information</h4>
        <ul style="color: #6c757d; line-height: 1.8;">
            <li><strong>👑 Admin:</strong> Full system access, manage users, approve/reject submissions</li>
            <li><strong>🛠 Staff:</strong> Submit locations, view submission status, receive notifications</li>
            <li><strong>🧑 Member:</strong> Browse locations, save favorites, suggest places, report issues</li>
        </ul>
    </div>
@endsection

