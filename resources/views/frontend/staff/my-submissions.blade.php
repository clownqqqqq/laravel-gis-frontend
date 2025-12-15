@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">📋</span> My Location Submissions
        </h1>
        <div style="display: flex; gap: 10px;">
            <a href="/gis/create" class="btn btn-add-location">
                <span>➕</span> Add New Location
            </a>
            <a href="/gis" class="btn" style="background: #6c757d; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
                📍 All Locations
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">{{ session('error') }}</div>
    @endif

    @php
        $pendingLocations = $locations->where('status', 'pending');
        $approvedLocations = $locations->where('status', 'approved');
        $rejectedLocations = $locations->where('status', 'rejected');
    @endphp

    @if($locations->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0; font-size: 18px;">
                📭 You haven't submitted any locations yet.
            </p>
            <a href="/gis/create" style="display: inline-block; margin-top: 20px; color: #0d6efd; text-decoration: none; padding: 10px 20px; background: #e3f2fd; border-radius: 8px;">
                ➕ Submit Your First Location
            </a>
        </div>
    @else
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div class="card" style="background: linear-gradient(135deg, #fff3cd 0%, #ffc107 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #856404;">Pending</h4>
                <div style="font-size: 32px; font-weight: bold; color: #856404;">{{ $pendingLocations->count() }}</div>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #d4edda 0%, #28a745 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #155724;">Approved</h4>
                <div style="font-size: 32px; font-weight: bold; color: #155724;">{{ $approvedLocations->count() }}</div>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #f8d7da 0%, #dc3545 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #721c24;">Rejected</h4>
                <div style="font-size: 32px; font-weight: bold; color: #721c24;">{{ $rejectedLocations->count() }}</div>
            </div>
        </div>

        <!-- Pending Locations -->
        @if($pendingLocations->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px;">⏳ Pending Review ({{ $pendingLocations->count() }})</h2>
        <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            @foreach($pendingLocations as $location)
            <div class="card" style="border-left: 4px solid #ffc107;">
                <div style="display: flex; gap: 20px;">
                    @if($location->image)
                    <div style="flex-shrink: 0;">
                        <img src="/uploads/{{ $location->image }}" 
                             alt="{{ $location->location }}"
                             style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
                             onerror="this.style.display='none'">
                    </div>
                    @endif
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #1e293b;">{{ $location->location }}</h3>
                            <span style="padding: 4px 12px; background: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                ⏳ PENDING
                            </span>
                        </div>

                        <div style="display: grid; gap: 8px;">
                            <p style="margin: 0; color: #64748b;">
                                <strong>📍 Coordinates:</strong> 
                                {{ number_format((float)$location->latitude, 6) }}, {{ number_format((float)$location->longitude, 6) }}
                            </p>
                            
                            @if($location->category)
                            <p style="margin: 0; color: #64748b;">
                                <strong>🏷️ Category:</strong> {{ $location->category }}
                            </p>
                            @endif
                            
                            @if($location->notes)
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                <strong style="color: #495057;">📝 Notes:</strong>
                                <p style="margin: 5px 0 0 0; color: #475569;">{{ $location->notes }}</p>
                            </div>
                            @endif
                            
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                <strong>📅 Submitted:</strong> {{ $location->created_at->format('M d, Y h:i A') }}
                            </p>
                            
                            <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; font-style: italic;">
                                ⏳ Waiting for admin review...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        <!-- Approved Locations -->
        @if($approvedLocations->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px; margin-top: 30px;">✅ Approved ({{ $approvedLocations->count() }})</h2>
        <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            @foreach($approvedLocations as $location)
            <div class="card" style="border-left: 4px solid #28a745;">
                <div style="display: flex; gap: 20px;">
                    @if($location->image)
                    <div style="flex-shrink: 0;">
                        <img src="/uploads/{{ $location->image }}" 
                             alt="{{ $location->location }}"
                             style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
                             onerror="this.style.display='none'">
                    </div>
                    @endif
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #1e293b;">{{ $location->location }}</h3>
                            <span style="padding: 4px 12px; background: #d4edda; color: #155724; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                ✅ APPROVED
                            </span>
                        </div>

                        @if($location->admin_feedback)
                        <div style="padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 15px;">
                            <strong style="color: #155724; display: block; margin-bottom: 5px;">💬 Admin Feedback:</strong>
                            <p style="margin: 0; color: #155724;">{{ $location->admin_feedback }}</p>
                        </div>
                        @else
                        <div style="padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 15px;">
                            <p style="margin: 0; color: #155724;">
                                ✅ <strong>Your location has been approved!</strong> It's now visible to all users.
                            </p>
                        </div>
                        @endif

                        <div style="display: grid; gap: 8px;">
                            <p style="margin: 0; color: #64748b;">
                                <strong>📍 Coordinates:</strong> 
                                {{ number_format((float)$location->latitude, 6) }}, {{ number_format((float)$location->longitude, 6) }}
                            </p>
                            
                            @if($location->category)
                            <p style="margin: 0; color: #64748b;">
                                <strong>🏷️ Category:</strong> {{ $location->category }}
                            </p>
                            @endif
                            
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                <strong>📅 Approved:</strong> {{ $location->updated_at->format('M d, Y h:i A') }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        <!-- Rejected Locations -->
        @if($rejectedLocations->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px; margin-top: 30px;">❌ Rejected ({{ $rejectedLocations->count() }})</h2>
        <div style="display: grid; gap: 20px;">
            @foreach($rejectedLocations as $location)
            <div class="card" style="border-left: 4px solid #dc3545; opacity: 0.9;">
                <div style="display: flex; gap: 20px;">
                    @if($location->image)
                    <div style="flex-shrink: 0;">
                        <img src="/uploads/{{ $location->image }}" 
                             alt="{{ $location->location }}"
                             style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
                             onerror="this.style.display='none'">
                    </div>
                    @endif
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #1e293b;">{{ $location->location }}</h3>
                            <span style="padding: 4px 12px; background: #f8d7da; color: #721c24; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                ❌ REJECTED
                            </span>
                        </div>

                        @if($location->admin_feedback)
                        <div style="padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 15px;">
                            <strong style="color: #721c24; display: block; margin-bottom: 5px;">💬 Admin Feedback:</strong>
                            <p style="margin: 0; color: #721c24;">{{ $location->admin_feedback }}</p>
                        </div>
                        @else
                        <div style="padding: 15px; background: #e2e3e5; border-left: 4px solid #6c757d; border-radius: 4px; margin-bottom: 15px;">
                            <p style="margin: 0; color: #383d41;">
                                This location was rejected by the admin.
                            </p>
                        </div>
                        @endif

                        <div style="display: grid; gap: 8px;">
                            <p style="margin: 0; color: #64748b;">
                                <strong>📍 Coordinates:</strong> 
                                {{ number_format((float)$location->latitude, 6) }}, {{ number_format((float)$location->longitude, 6) }}
                            </p>
                            
                            @if($location->category)
                            <p style="margin: 0; color: #64748b;">
                                <strong>🏷️ Category:</strong> {{ $location->category }}
                            </p>
                            @endif
                            
                            @if($location->notes)
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                <strong style="color: #495057;">📝 Notes:</strong>
                                <p style="margin: 5px 0 0 0; color: #475569;">{{ $location->notes }}</p>
                            </div>
                            @endif
                            
                            <p style="margin: 0; color: #64748b; font-size: 14px;">
                                <strong>📅 Rejected:</strong> {{ $location->updated_at->format('M d, Y h:i A') }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif
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

        .page-header > div {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
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

            .card[style*="grid-template-columns"] {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
            }

            .card[style*="grid-template-columns: 1fr auto"] {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }

            .card[style*="display: flex"][style*="gap: 10px"] {
                flex-direction: column;
                gap: 10px !important;
            }

            .card[style*="display: flex"][style*="gap: 10px"] .btn {
                width: 100%;
            }

            .card img[style*="width: 200px"] {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
            }
        }

        @media screen and (max-width: 480px) {
            .page-header h1 {
                font-size: 20px;
            }

            .page-header h1 span {
                font-size: 24px;
            }

            .card[style*="font-size: 32px"] {
                font-size: 24px !important;
            }
        }
    </style>
    @endpush
@endsection

