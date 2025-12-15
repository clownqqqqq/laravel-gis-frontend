@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">💡</span> Place Suggestions from Members
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

    @php
        $pendingSuggestions = $suggestions->where('status', 'pending');
        $resolvedSuggestions = $suggestions->whereIn('status', ['resolved', 'dismissed']);
    @endphp

    @if($pendingSuggestions->isEmpty() && $resolvedSuggestions->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0; font-size: 18px;">
                ✅ No place suggestions yet. Members can suggest new locations to add!
            </p>
            <a href="/admin/dashboard" style="display: inline-block; margin-top: 20px; color: #0d6efd; text-decoration: none;">
                ← Back to Dashboard
            </a>
        </div>
    @else
        @if($pendingSuggestions->count() > 0)
        <div class="card" style="background: #fff3cd; border: 1px solid #ffc107; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404;">
                <strong>ℹ️</strong> You have <strong>{{ $pendingSuggestions->count() }}</strong> suggestion(s) waiting for review. 
                You can create a location from the suggestion or dismiss it.
            </p>
        </div>

        <h2 style="color: #1e293b; margin-bottom: 15px;">Pending Suggestions</h2>
        <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            @foreach($pendingSuggestions as $suggestion)
            <div class="card" style="border-left: 4px solid #ffa726;">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 20px;">
                    <!-- Suggestion Details -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: #1e293b;">
                                @php
                                    $descLines = explode("\n", $suggestion->description);
                                    $locationName = '';
                                    foreach ($descLines as $line) {
                                        if (strpos($line, 'Location:') === 0) {
                                            $locationName = trim(str_replace('Location:', '', $line));
                                            break;
                                        }
                                    }
                                @endphp
                                {{ $locationName ?: 'Place Suggestion' }}
                            </h3>
                            <span style="padding: 4px 12px; background: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px; font-weight: 500;">
                                ⏳ PENDING
                            </span>
                        </div>

                        @if($suggestion->image)
                        <div style="margin-bottom: 15px;">
                            <img src="/uploads/{{ $suggestion->image }}" 
                                 alt="Suggestion image"
                                 style="max-width: 300px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;"
                                 onerror="this.style.display='none'">
                        </div>
                        @endif

                        <div style="display: grid; gap: 10px; margin-bottom: 15px;">
                            @php
                                $latitude = '';
                                $longitude = '';
                                $category = '';
                                $description = '';
                                foreach ($descLines as $line) {
                                    if (strpos($line, 'Coordinates:') === 0) {
                                        $coords = trim(str_replace('Coordinates:', '', $line));
                                        list($latitude, $longitude) = explode(',', $coords);
                                        $latitude = trim($latitude);
                                        $longitude = trim($longitude);
                                    } elseif (strpos($line, 'Category:') === 0) {
                                        $category = trim(str_replace('Category:', '', $line));
                                    } elseif (strpos($line, 'Description:') === 0) {
                                        $description = trim(str_replace('Description:', '', $line));
                                    }
                                }
                            @endphp
                            
                            @if($latitude && $longitude)
                            <p style="margin: 0; color: #64748b;">
                                <strong>📍 Coordinates:</strong> 
                                {{ number_format((float)$latitude, 6) }}, {{ number_format((float)$longitude, 6) }}
                            </p>
                            @endif
                            
                            @if($category)
                            <p style="margin: 0; color: #64748b;">
                                <strong>🏷️ Category:</strong> {{ $category }}
                            </p>
                            @endif
                            
                            @if($description)
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                                <strong style="color: #495057;">📝 Description:</strong>
                                <p style="margin: 5px 0 0 0; color: #475569;">{{ $description }}</p>
                            </div>
                            @endif
                            
                            <p style="margin: 0; color: #64748b;">
                                <strong>👤 Suggested by:</strong> 
                                {{ $suggestion->user->username }} ({{ $suggestion->user->email }})
                            </p>
                            
                            <p style="margin: 0; color: #64748b;">
                                <strong>📅 Submitted:</strong> 
                                {{ $suggestion->created_at->format('M d, Y h:i A') }}
                            </p>
                        </div>
                    </div>

                    <!-- Review Actions -->
                    <div style="min-width: 300px;">
                        <div class="card" style="background: #f8f9fa; padding: 20px;">
                            <h4 style="margin: 0 0 15px 0; color: #495057;">Review Action</h4>
                            
                            <form method="POST" action="/admin/suggestions/{{ $suggestion->id }}/review" style="display: grid; gap: 15px;">
                                @csrf
                                
                                <div>
                                    <label style="display: block; margin-bottom: 5px; color: #495057; font-weight: 500;">
                                        Response (Optional)
                                    </label>
                                    <textarea name="admin_response" 
                                              rows="3" 
                                              placeholder="Add a response to the member..."
                                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;"></textarea>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    <button type="submit" 
                                            name="action" 
                                            value="create_location"
                                            style="width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                                        ✅ Create Location
                                    </button>
                                    <button type="submit" 
                                            name="action" 
                                            value="dismiss"
                                            style="width: 100%; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                                        ❌ Dismiss
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

        @if($resolvedSuggestions->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px; margin-top: 30px;">Resolved Suggestions</h2>
        <div style="display: grid; gap: 20px;">
            @foreach($resolvedSuggestions as $suggestion)
            <div class="card" style="border-left: 4px solid {{ $suggestion->status === 'resolved' ? '#28a745' : '#6c757d' }}; opacity: 0.8;">
                <div>
                    @php
                        $descLines = explode("\n", $suggestion->description);
                        $locationName = '';
                        foreach ($descLines as $line) {
                            if (strpos($line, 'Location:') === 0) {
                                $locationName = trim(str_replace('Location:', '', $line));
                                break;
                            }
                        }
                    @endphp
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #1e293b;">{{ $locationName ?: 'Place Suggestion' }}</h4>
                        <span style="padding: 4px 12px; background: {{ $suggestion->status === 'resolved' ? '#d4edda' : '#e2e3e5' }}; color: {{ $suggestion->status === 'resolved' ? '#155724' : '#383d41' }}; border-radius: 4px; font-size: 12px; font-weight: 500;">
                            {{ strtoupper($suggestion->status) }}
                        </span>
                    </div>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                        Suggested by: {{ $suggestion->user->username }} • {{ $suggestion->created_at->format('M d, Y') }}
                        @if($suggestion->admin_response)
                            <br><strong>Admin Response:</strong> {{ $suggestion->admin_response }}
                        @endif
                    </p>
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
                gap: 15px !important;
            }

            .card[style*="display: flex"][style*="gap: 10px"] {
                flex-direction: column;
                gap: 10px !important;
            }

            .card[style*="display: flex"][style*="gap: 10px"] .btn {
                width: 100%;
            }

            h2 {
                font-size: 20px !important;
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

