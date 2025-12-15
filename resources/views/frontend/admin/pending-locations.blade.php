@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">⏳</span> Pending Location Submissions
        </h1>
        <div style="display: flex; gap: 10px;">
            <a href="/admin/dashboard" class="btn btn-add-location">
                <span>👑</span> Dashboard
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

    @if($locations->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0; font-size: 18px;">
                ✅ No pending location submissions. All locations have been reviewed!
            </p>
            <a href="/admin/dashboard" style="display: inline-block; margin-top: 20px; color: #0d6efd; text-decoration: none;">
                ← Back to Dashboard
            </a>
        </div>
    @else
        <div class="card" style="background: #fff3cd; border: 1px solid #ffc107; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404;">
                <strong>ℹ️</strong> You have <strong>{{ $locations->count() }}</strong> location(s) waiting for review. 
                Review each submission and approve or reject with feedback.
            </p>
        </div>

        <div style="display: grid; gap: 20px;">
            @foreach($locations as $location)
            <div class="card" style="border-left: 4px solid #4facfe;">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px;">
                    <!-- Location Details -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #1e293b;">{{ $location->location }}</h3>
                            <span style="padding: 4px 12px; background: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                ⏳ PENDING
                            </span>
                        </div>

                        @if($location->image)
                        <div style="margin-bottom: 15px;">
                            <img src="/uploads/{{ $location->image }}" 
                                 alt="{{ $location->location }}"
                                 style="max-width: 300px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;"
                                 onerror="this.style.display='none'">
                        </div>
                        @endif

                        <div style="display: grid; gap: 10px; margin-bottom: 15px;">
                            <p style="margin: 0; color: #64748b;">
                                <strong>📍 Coordinates:</strong> 
                                {{ number_format($location->latitude, 6) }}, {{ number_format($location->longitude, 6) }}
                            </p>
                            
                            @if($location->category)
                            <p style="margin: 0; color: #64748b;">
                                <strong>🏷️ Category:</strong> {{ $location->category }}
                            </p>
                            @endif
                            
                            <p style="margin: 0; color: #64748b;">
                                <strong>👤 Submitted by:</strong> 
                                {{ $location->user->username }} ({{ $location->user->email }})
                            </p>
                            
                            <p style="margin: 0; color: #64748b;">
                                <strong>📅 Submitted:</strong> 
                                {{ $location->created_at->format('M d, Y h:i A') }}
                            </p>
                            
                            @if($location->notes)
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                <strong style="color: #495057;">📝 Notes:</strong>
                                <p style="margin: 5px 0 0 0; color: #475569;">{{ $location->notes }}</p>
                            </div>
                            @endif
                        </div>
                    </div>

                    <!-- Review Actions -->
                    <div style="min-width: 300px;">
                        <div class="card" style="background: #f8f9fa; padding: 20px;">
                            <h4 style="margin: 0 0 15px 0; color: #495057;">Review Action</h4>
                            
                            <form method="POST" action="/admin/locations/{{ $location->id }}/review" style="display: grid; gap: 15px;">
                                @csrf
                                
                                <div>
                                    <label style="display: block; margin-bottom: 5px; color: #495057; font-weight: 500;">
                                        Feedback (Optional)
                                    </label>
                                    <textarea name="admin_feedback" 
                                              rows="3" 
                                              placeholder="Add feedback for the staff member..."
                                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;"></textarea>
                                </div>
                                
                                <div style="display: flex; gap: 10px;">
                                    <button type="submit" 
                                            name="action" 
                                            value="approve"
                                            style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                                        ✅ Approve
                                    </button>
                                    <button type="submit" 
                                            name="action" 
                                            value="reject"
                                            style="flex: 1; padding: 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                                        ❌ Reject
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
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

            .card[style*="grid-template-columns: 1fr auto"] {
                grid-template-columns: 1fr !important;
                gap: 15px !important;
            }

            .card[style*="grid-template-columns: 1fr auto"] > div:last-child {
                width: 100%;
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
        }
    </style>
    @endpush
@endsection

