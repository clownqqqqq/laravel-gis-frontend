@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">👑</span> Admin Dashboard
        </h1>
        <a href="/admin/users" class="btn btn-add-location">
            <span>👥</span> Manage Users
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">{{ session('error') }}</div>
    @endif

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Total Users</h3>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $total_users }}</div>
        </div>
        
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Total Locations</h3>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $total_locations }}</div>
        </div>
        
        <a href="/admin/pending-locations" style="text-decoration: none; display: block;">
            <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #0d6efd; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 2px 8px rgba(13,110,253,0.1)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Pending Requests</h3>
                <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $pending_requests }}</div>
                @if($pending_requests > 0)
                    <div style="margin-top: 10px; font-size: 12px; color: #0d6efd;">Click to review →</div>
                @endif
            </div>
        </a>
        
        <a href="/admin/suggestions" style="text-decoration: none; display: block;">
            <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #0d6efd; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 2px 8px rgba(13,110,253,0.1)'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Place Suggestions</h3>
                <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $pending_suggestions ?? 0 }}</div>
                @if(($pending_suggestions ?? 0) > 0)
                    <div style="margin-top: 10px; font-size: 12px; color: #0d6efd;">Click to review →</div>
                @endif
            </div>
        </a>
        
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Staff Members</h3>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $total_staff }}</div>
        </div>
        
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Members</h3>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $total_members }}</div>
        </div>
        
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; border-left: 4px solid #6b7280;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; font-weight: 500;">Blocked Users</h3>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937;">{{ $blocked_users }}</div>
        </div>
    </div>

    <div class="card">
        <h3 style="color: #1f2937; margin-bottom: 20px;">Quick Actions</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="/admin/users" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                👥 View All Users
            </a>
            <a href="/admin/users?role=staff" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                🛠 View Staff
            </a>
            <a href="/admin/users?status=blocked" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                🚫 View Blocked Users
            </a>
            <a href="/admin/pending-locations" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                ⏳ Review Pending Locations ({{ $pending_requests }})
            </a>
            <a href="/admin/suggestions" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                💡 Review Place Suggestions ({{ $pending_suggestions ?? 0 }})
            </a>
            <a href="/gis" class="btn" style="background: #ffffff; color: #1f2937; text-decoration: none; padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                📍 View All Locations
            </a>
        </div>
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

            .page-header .btn {
                width: 100%;
                justify-content: center;
            }

            .card h3 {
                font-size: 12px;
            }

            .card div[style*="font-size: 36px"] {
                font-size: 28px !important;
            }

            .card div[style*="font-size: 12px"] {
                font-size: 11px !important;
            }

            .card[style*="display: flex"] {
                flex-direction: column;
            }

            .card[style*="display: flex"] .btn {
                width: 100%;
                text-align: center;
                justify-content: center;
            }
        }

        @media screen and (max-width: 480px) {
            .page-header h1 {
                font-size: 20px;
            }

            .page-header h1 span {
                font-size: 24px;
            }

            .card div[style*="font-size: 36px"] {
                font-size: 24px !important;
            }
        }
    </style>
    @endpush
@endsection

