@extends('frontend.layouts.app')

@section('content')
    @php
        // Check user role
        $userRole = null;
        $isAdmin = false;
        $isStaff = false;
        $isMember = false;
        $userId = session('user_id');
        
        if ($userId) {
            if (isset($current_user) && $current_user && $current_user->id == $userId) {
                $userRole = $current_user->role;
                $isAdmin = ($current_user->role === 'admin');
                $isStaff = ($current_user->role === 'staff');
                $isMember = ($current_user->role === 'member');
            } else {
                try {
                    $checkUser = \App\Models\User::find($userId);
                    if ($checkUser) {
                        $userRole = $checkUser->role;
                        $isAdmin = ($checkUser->role === 'admin');
                        $isStaff = ($checkUser->role === 'staff');
                        $isMember = ($checkUser->role === 'member');
                    }
                } catch (\Exception $e) {
                    // Ignore
                }
            }
        }
        
        // Get role-specific data
        $pendingSubmissions = 0;
        $approvedSubmissions = 0;
        $rejectedSubmissions = 0;
        if ($isStaff && $userId) {
            $pendingSubmissions = \App\Models\GisLocation::where('user_id', $userId)->where('status', 'pending')->count();
            $approvedSubmissions = \App\Models\GisLocation::where('user_id', $userId)->where('status', 'approved')->count();
            $rejectedSubmissions = \App\Models\GisLocation::where('user_id', $userId)->where('status', 'rejected')->count();
        }
    @endphp
    
    @if($isAdmin)
        <div class="alert alert-info" style="background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #b8d4da;">
            <strong>👑 Admin Access:</strong> 
            <a href="/admin/dashboard" style="color: #0d6efd; text-decoration: underline; margin: 0 10px;">Dashboard</a> | 
            <a href="/admin/users" style="color: #0d6efd; text-decoration: underline;">Manage Users</a>
        </div>
    @endif
    
    @if($isStaff)
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">🛠 Staff Dashboard</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 24px; font-weight: bold; color: #1f2937;">{{ $pendingSubmissions }}</div>
                    <div style="font-size: 14px; color: #6b7280;">Pending</div>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 24px; font-weight: bold; color: #1f2937;">{{ $approvedSubmissions }}</div>
                    <div style="font-size: 14px; color: #6b7280;">Approved</div>
                </div>
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-size: 24px; font-weight: bold; color: #1f2937;">{{ $rejectedSubmissions }}</div>
                    <div style="font-size: 14px; color: #6b7280;">Rejected</div>
                </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Your Role:</strong> Field Data Collector - Submit locations for admin approval
                </p>
            </div>
            <div style="margin-top: 15px;">
                <a href="/staff/my-submissions" style="background: #ffffff; padding: 12px 20px; border-radius: 8px; color: #1f2937; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 500; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'">
                    <span>📋</span> View My Submissions
                </a>
            </div>
        </div>
    @endif
    
    @if($isMember)
        <div class="card" style="background: #ffffff; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">🧑 Member Features</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <a href="/member/favorites" style="background: #f9fafb; padding: 12px; border-radius: 8px; color: #1f2937; text-decoration: none; display: flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'; this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'; this.style.background='#f9fafb'">
                    <span>⭐</span> My Favorites
                </a>
                <a href="/member/suggest" style="background: #f9fafb; padding: 12px; border-radius: 8px; color: #1f2937; text-decoration: none; display: flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'; this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'; this.style.background='#f9fafb'">
                    <span>💡</span> Suggest Place
                </a>
                <a href="/member/my-suggestions" style="background: #f9fafb; padding: 12px; border-radius: 8px; color: #1f2937; text-decoration: none; display: flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.borderColor='#0d6efd'; this.style.color='#0d6efd'; this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#1f2937'; this.style.background='#f9fafb'">
                    <span>📋</span> My Suggestions
                </a>
            </div>
        </div>
    @endif
    
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">📍</span> My Geographic Locations
        </h1>
        <div style="display: flex; gap: 10px; align-items: center;">
            @if($isAdmin)
                <a href="/admin/users" class="btn" style="background: #0d6efd; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">
                    <span>👥</span> Manage Users
                </a>
            @endif
            @if($isAdmin || $isStaff)
                <a href="/gis/create" class="btn btn-add-location">
                    <span>➕</span> Add Location
                </a>
            @endif
        </div>
    </div>

    <div class="card">
        <h3 class="search-title">Search Locations</h3>
        <form method="GET" action="/gis" id="searchForm">
            <label for="search" class="search-label">Search Locations</label>
            <div class="search-wrapper">
                <div class="search-icon-wrapper">
                    <span>🔍</span>
                </div>
                <input type="text" id="search" name="search" value="{{ $search_query ?? '' }}" 
                       placeholder="Search locations by name..." 
                       class="search-input">
                <button type="submit" class="btn btn-search">
                    <span>🔍</span> Search
                </button>
            </div>
        </form>
    </div>

    @if(session('gis_success'))
        <div class="alert alert-success">{{ session('gis_success') }}</div>
    @endif

    @if(session('gis_error'))
        <div class="alert alert-error">{{ session('gis_error') }}</div>
    @endif

    @if($search_query ?? null)
        <div class="alert alert-info">
            <p style="margin: 0;">
                <strong>Search Results:</strong> Found {{ $gis_locations->count() }} location(s) matching "{{ $search_query }}"
                <a href="/gis" style="margin-left: 10px; color: #0d6efd; text-decoration: none; font-weight: 500;">Clear search</a>
            </p>
        </div>
    @endif

    @if($gis_locations->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0;">
                @if($search_query ?? null)
                    No locations found matching "{{ $search_query }}". <a href="/gis" class="link">View all locations</a> or <a href="/gis/create" class="link">add a new location</a>
                @else
                    No locations found. <a href="/gis/create" class="link">Add your first location</a>
                @endif
            </p>
        </div>
    @else
        <div class="locations-list">
            @foreach($gis_locations as $gis)
            <div class="card location-card">
                <div class="location-content">
                    @if($gis->image)
                    <div class="location-image-wrapper">
                        <img src="/uploads/{{ $gis->image }}" alt="{{ $gis->location }}"
                             onerror="this.style.display='none'"
                             class="location-image">
                    </div>
                    @endif
                    <div class="location-details">
                        <h3 class="location-name">
                            {{ $gis->location }}
                        </h3>
                        <p class="location-coords">
                            Lat: {{ $gis->latitude }} &nbsp;&nbsp;&nbsp;&nbsp; Lng: {{ $gis->longitude }}
                        </p>
                        @if($gis->category)
                        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                            {{ $gis->category }}
                        </p>
                        @endif
                        @if($gis->notes)
                        <p style="margin: 10px 0; color: #475569; font-size: 14px;">{{ Str::limit($gis->notes, 100) }}</p>
                        @endif
                    </div>
                </div>
                <div class="location-actions">
                    @php
                        // Only show edit/delete buttons for admin and staff
                        // Staff can edit any approved location (including those from member suggestions)
                        $canEdit = false;
                        if ($isAdmin) {
                            $canEdit = true; // Admin can edit/delete any location
                        } elseif ($isStaff && isset($gis) && $gis->status === 'approved') {
                            $canEdit = true; // Staff can edit any approved location
                        }
                        // Check if location is favorited (for members)
                        $isFavorited = false;
                        if ($isMember && isset($current_user)) {
                            $isFavorited = \App\Models\Favorite::where('user_id', $current_user->id)
                                ->where('location_id', $gis->id)
                                ->exists();
                        }
                    @endphp
                    @if($isMember)
                        @if($isFavorited)
                            <form method="POST" action="/member/favorites/{{ $gis->id }}/remove" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn" style="background: #ffc107; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                                    <span>⭐</span> Remove Favorite
                                </button>
                            </form>
                        @else
                            <form method="POST" action="/member/favorites/{{ $gis->id }}/add" style="display: inline;">
                                @csrf
                                <button type="submit" class="btn" style="background: #6c757d; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                                    <span>⭐</span> Add to Favorites
                                </button>
                            </form>
                        @endif
                    @elseif($canEdit)
                        <a href="/gis/{{ $gis->id }}/edit" class="btn btn-edit">
                            <span>✏️</span> Edit
                        </a>
                        <form method="POST" action="/gis/{{ $gis->id }}/delete" class="location-delete-form"
                              onsubmit="return confirm('Are you sure you want to delete {{ $gis->location }}? This action cannot be undone.');">
                            @csrf
                            <button type="submit" class="btn btn-delete">
                                <span>🗑️</span> Delete
                            </button>
                        </form>
                    @endif
                </div>
            </div>
            @endforeach
        </div>
    @endif

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
            max-width: 200px;
            flex-shrink: 0;
        }

        .search-title {
            margin-bottom: 16px;
            color: #1e293b;
            font-weight: 600;
            font-size: 20px;
        }

        .search-label {
            display: block;
            margin-bottom: 10px;
            font-weight: 500;
            color: #2c3e50;
            font-size: 15px;
        }

        .search-wrapper {
            display: flex;
            gap: 0;
            margin-bottom: 0;
        }

        .search-icon-wrapper {
            background: #0d6efd;
            padding: 16px 18px;
            border-radius: 10px 0 0 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .search-icon-wrapper span {
            color: white;
            font-size: 18px;
        }

        .search-input {
            flex: 1;
            padding: 16px 18px;
            border: 2px solid #d1d5db;
            border-left: none;
            border-right: none;
            background: #ffffff;
            color: #2c3e50;
            font-size: 16px;
            outline: none;
        }

        .search-input:focus {
            border-color: #0d6efd;
        }

        .btn-search {
            margin: 0;
            border-radius: 0 10px 10px 0;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            width: auto;
            border: 2px solid #0d6efd;
            min-height: 52px;
        }

        .location-card {
            margin-bottom: 20px;
            position: relative;
        }

        .location-content {
            display: flex;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 20px;
        }

        .location-image-wrapper {
            flex-shrink: 0;
        }

        .location-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 12px;
            border: 3px solid #0d6efd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .location-details {
            flex: 1;
            min-width: 0;
        }

        .location-name {
            margin: 0 0 12px 0;
            color: #0d6efd;
            font-weight: 600;
            font-size: 22px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .location-coords {
            margin: 0;
            color: #64748b;
            font-weight: 400;
            font-size: 15px;
            word-break: break-word;
        }

        .location-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .btn-edit {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: white;
            border: 2px solid #0d6efd;
            color: #0d6efd;
        }

        .btn-edit:hover {
            background: #f0f7ff;
        }

        .location-delete-form {
            flex: 1;
        }

        .btn-delete {
            width: 100%;
            background: #fef2f2;
            border: 2px solid #fecaca;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-delete:hover {
            background: #fee2e2;
            border-color: #fca5a5;
        }

        @media screen and (max-width: 768px) {
            .page-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 16px !important;
            }

            .btn-add-location {
                width: 100% !important;
                max-width: 100% !important;
                justify-content: center !important;
            }

            .search-wrapper {
                flex-direction: column !important;
            }

            .search-icon-wrapper {
                border-radius: 10px 10px 0 0 !important;
                padding: 12px !important;
            }

            .search-input {
                border: 2px solid #d1d5db !important;
                border-radius: 0 !important;
                border-left: 2px solid #d1d5db !important;
                border-right: 2px solid #d1d5db !important;
            }

            .btn-search {
                border-radius: 0 0 10px 10px !important;
                width: 100% !important;
                justify-content: center !important;
            }

            .location-content {
                flex-direction: column !important;
                gap: 16px !important;
            }

            .location-image {
                width: 100% !important;
                height: auto !important;
                max-height: 250px !important;
            }

            .location-name {
                font-size: 20px !important;
            }

            .location-actions {
                flex-direction: column !important;
                gap: 10px !important;
            }

            .btn-edit,
            .location-delete-form {
                width: 100% !important;
            }

            .btn-edit,
            .btn-delete {
                width: 100% !important;
            }
        }

        @media (max-width: 480px) {
            .location-name {
                font-size: 18px;
            }

            .location-coords {
                font-size: 14px;
            }
        }
    </style>
    @endpush
@endsection

