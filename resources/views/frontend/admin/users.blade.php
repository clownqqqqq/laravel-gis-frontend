@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">👥</span> User Management
        </h1>
        <div style="display: flex; gap: 10px;">
            <a href="/admin/users/create" class="btn btn-add-location" style="background: #28a745; color: white;">
                <span>➕</span> Create New User
            </a>
            <a href="/admin/dashboard" class="btn btn-add-location">
                <span>👑</span> Dashboard
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">{{ session('error') }}</div>
    @endif

    <div class="card">
        <h3>Search & Filter Users</h3>
        <form method="GET" action="/admin/users" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; align-items: end;">
            <div>
                <label for="search" style="display: block; margin-bottom: 5px;">Search</label>
                <input type="text" id="search" name="search" value="{{ $filters['search'] ?? '' }}" 
                       placeholder="Username, email, name..." 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label for="role" style="display: block; margin-bottom: 5px;">Role</label>
                <select id="role" name="role" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">All Roles</option>
                    <option value="admin" {{ ($filters['role'] ?? '') == 'admin' ? 'selected' : '' }}>Admin</option>
                    <option value="staff" {{ ($filters['role'] ?? '') == 'staff' ? 'selected' : '' }}>Staff</option>
                    <option value="member" {{ ($filters['role'] ?? '') == 'member' ? 'selected' : '' }}>Member</option>
                </select>
            </div>
            <div>
                <label for="status" style="display: block; margin-bottom: 5px;">Status</label>
                <select id="status" name="status" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">All Status</option>
                    <option value="active" {{ ($filters['status'] ?? '') == 'active' ? 'selected' : '' }}>Active</option>
                    <option value="blocked" {{ ($filters['status'] ?? '') == 'blocked' ? 'selected' : '' }}>Blocked</option>
                </select>
            </div>
            <div>
                <button type="submit" class="btn" style="background: #0d6efd; color: white; padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer;">
                    🔍 Search
                </button>
            </div>
        </form>
    </div>

    <div class="card">
        <h3>Users List ({{ $users->total() }} total)</h3>
        
        @if($users->isEmpty())
            <p style="text-align: center; color: #64748b; padding: 40px;">No users found.</p>
        @else
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px; text-align: left;">ID</th>
                            <th style="padding: 12px; text-align: left;">Username</th>
                            <th style="padding: 12px; text-align: left;">Email</th>
                            <th style="padding: 12px; text-align: left;">Name</th>
                            <th style="padding: 12px; text-align: left;">Role</th>
                            <th style="padding: 12px; text-align: left;">Status</th>
                            <th style="padding: 12px; text-align: left;">Created</th>
                            <th style="padding: 12px; text-align: left;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($users as $user)
                            @php
                                $isCurrentUser = isset($current_user) && $current_user && $current_user->id === $user->id;
                            @endphp
                            <tr style="border-bottom: 1px solid #dee2e6; @if($isCurrentUser) background: #f0f7ff; @endif">
                                <td style="padding: 12px;">{{ $user->id }}</td>
                                <td style="padding: 12px; font-weight: 500;">
                                    {{ $user->username }}
                                    @if($isCurrentUser)
                                        <span style="margin-left: 8px; padding: 2px 6px; background: #0d6efd; color: white; border-radius: 3px; font-size: 10px; font-weight: 500;">YOU</span>
                                    @endif
                                </td>
                                <td style="padding: 12px;">{{ $user->email }}</td>
                                <td style="padding: 12px;">{{ $user->firstname }} {{ $user->lastname }}</td>
                                <td style="padding: 12px;">
                                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
                                        @if($user->role == 'admin') background: #ff6b6b; color: white;
                                        @elseif($user->role == 'staff') background: #43e97b; color: white;
                                        @else background: #4facfe; color: white;
                                        @endif">
                                        {{ strtoupper($user->role) }}
                                    </span>
                                </td>
                                <td style="padding: 12px;">
                                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;
                                        @if($user->status == 'active') background: #43e97b; color: white;
                                        @else background: #ff6b6b; color: white;
                                        @endif">
                                        {{ strtoupper($user->status) }}
                                    </span>
                                </td>
                                <td style="padding: 12px; font-size: 12px; color: #64748b;">
                                    {{ $user->created_at->format('M d, Y') }}
                                </td>
                                <td style="padding: 12px;">
                                    <div style="display: flex; gap: 5px;">
                                        @if($isCurrentUser)
                                            <span style="padding: 4px 8px; color: #64748b; font-size: 12px; font-style: italic;">
                                                (Your account)
                                            </span>
                                        @else
                                            <form method="POST" action="/admin/users/{{ $user->id }}/assign-role" style="display: inline;">
                                                @csrf
                                                <select name="role" onchange="this.form.submit()" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                                                    <option value="admin" {{ $user->role == 'admin' ? 'selected' : '' }}>Admin</option>
                                                    <option value="staff" {{ $user->role == 'staff' ? 'selected' : '' }}>Staff</option>
                                                    <option value="member" {{ $user->role == 'member' ? 'selected' : '' }}>Member</option>
                                                </select>
                                            </form>
                                            <form method="POST" action="/admin/users/{{ $user->id }}/toggle-status" style="display: inline;">
                                                @csrf
                                                <button type="submit" 
                                                        style="padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;
                                                        @if($user->status == 'active') background: #ff6b6b; color: white;
                                                        @else background: #43e97b; color: white;
                                                        @endif">
                                                    {{ $user->status == 'active' ? '🚫 Block' : '✅ Unblock' }}
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
                @if($users->previousPageUrl())
                    <a href="{{ $users->previousPageUrl() }}" class="btn" style="background: #6c757d; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px;">
                        ← Previous
                    </a>
                @endif
                
                <span style="padding: 8px 16px; color: #64748b;">
                    Page {{ $users->currentPage() }} of {{ $users->lastPage() }}
                </span>
                
                @if($users->nextPageUrl())
                    <a href="{{ $users->nextPageUrl() }}" class="btn" style="background: #6c757d; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px;">
                        Next →
                    </a>
                @endif
            </div>
        @endif
    </div>

    @push('styles')
    <style>
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .page-header > div {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .btn-add-location {
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        @media screen and (max-width: 768px) {
            .page-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .page-header h1 {
                font-size: 24px;
            }

            .page-header h1 span {
                font-size: 28px;
            }

            .page-header > div {
                width: 100%;
            }

            .page-header .btn {
                flex: 1;
                min-width: 140px;
                justify-content: center;
            }

            .card form[style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }

            .card form[style*="grid-template-columns"] > div:last-child {
                grid-column: 1;
            }

            .card form[style*="grid-template-columns"] button {
                width: 100%;
            }

            .card div[style*="overflow-x: auto"] {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            table {
                min-width: 800px;
            }

            table th,
            table td {
                padding: 8px !important;
                font-size: 13px;
            }

            table th:first-child,
            table td:first-child {
                position: sticky;
                left: 0;
                background: white;
                z-index: 1;
            }

            .card div[style*="display: flex"][style*="gap: 10px"] {
                flex-direction: column;
                gap: 10px !important;
            }

            .card div[style*="display: flex"][style*="gap: 10px"] .btn {
                width: 100%;
                text-align: center;
            }
        }

        @media screen and (max-width: 480px) {
            .page-header h1 {
                font-size: 20px;
            }

            .page-header h1 span {
                font-size: 24px;
            }

            table {
                min-width: 700px;
            }

            table th,
            table td {
                padding: 6px !important;
                font-size: 12px;
            }
        }
    </style>
    @endpush
@endsection

