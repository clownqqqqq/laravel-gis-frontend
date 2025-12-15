@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">📋</span> My Place Suggestions
        </h1>
        <div style="display: flex; gap: 10px;">
            <a href="/member/suggest" class="btn btn-add-location">
                <span>💡</span> Suggest New Place
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
        $resolvedSuggestions = $suggestions->where('status', 'resolved');
        $dismissedSuggestions = $suggestions->where('status', 'dismissed');
    @endphp

    @if($suggestions->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0; font-size: 18px;">
                📭 You haven't submitted any place suggestions yet.
            </p>
            <a href="/member/suggest" style="display: inline-block; margin-top: 20px; color: #0d6efd; text-decoration: none; padding: 10px 20px; background: #e3f2fd; border-radius: 8px;">
                💡 Suggest Your First Place
            </a>
        </div>
    @else
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div class="card" style="background: linear-gradient(135deg, #fff3cd 0%, #ffc107 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #856404;">Pending</h4>
                <div style="font-size: 32px; font-weight: bold; color: #856404;">{{ $pendingSuggestions->count() }}</div>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #d4edda 0%, #28a745 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #155724;">Accepted</h4>
                <div style="font-size: 32px; font-weight: bold; color: #155724;">{{ $resolvedSuggestions->count() }}</div>
            </div>
            <div class="card" style="background: linear-gradient(135deg, #f8d7da 0%, #dc3545 100%);">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #721c24;">Dismissed</h4>
                <div style="font-size: 32px; font-weight: bold; color: #721c24;">{{ $dismissedSuggestions->count() }}</div>
            </div>
        </div>

        <!-- Pending Suggestions -->
        @if($pendingSuggestions->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px;">⏳ Pending Review ({{ $pendingSuggestions->count() }})</h2>
        <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            @foreach($pendingSuggestions as $suggestion)
            <div class="card" style="border-left: 4px solid #ffc107;">
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
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #1e293b;">{{ $locationName ?: 'Place Suggestion' }}</h3>
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

                    <div style="display: grid; gap: 10px;">
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
                        
                        <p style="margin: 0; color: #64748b; font-size: 14px;">
                            <strong>📅 Submitted:</strong> {{ $suggestion->created_at->format('M d, Y h:i A') }}
                        </p>
                        
                        <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px; font-style: italic;">
                            ⏳ Waiting for admin review...
                        </p>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        <!-- Resolved Suggestions -->
        @if($resolvedSuggestions->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px; margin-top: 30px;">✅ Accepted ({{ $resolvedSuggestions->count() }})</h2>
        <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            @foreach($resolvedSuggestions as $suggestion)
            <div class="card" style="border-left: 4px solid #28a745;">
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
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #1e293b;">{{ $locationName ?: 'Place Suggestion' }}</h3>
                        <span style="padding: 4px 12px; background: #d4edda; color: #155724; border-radius: 4px; font-size: 12px; font-weight: 500;">
                            ✅ ACCEPTED
                        </span>
                    </div>

                    @if($suggestion->admin_response)
                    <div style="padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 15px;">
                        <strong style="color: #155724; display: block; margin-bottom: 5px;">💬 Admin Response:</strong>
                        <p style="margin: 0; color: #155724;">{{ $suggestion->admin_response }}</p>
                    </div>
                    @else
                    <div style="padding: 15px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #155724;">
                            ✅ <strong>Your suggestion has been accepted!</strong> The location has been created in the system.
                        </p>
                    </div>
                    @endif

                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                        <strong>📅 Reviewed:</strong> {{ $suggestion->updated_at->format('M d, Y h:i A') }}
                    </p>
                </div>
            </div>
            @endforeach
        </div>
        @endif

        <!-- Dismissed Suggestions -->
        @if($dismissedSuggestions->count() > 0)
        <h2 style="color: #1e293b; margin-bottom: 15px; margin-top: 30px;">❌ Dismissed ({{ $dismissedSuggestions->count() }})</h2>
        <div style="display: grid; gap: 20px;">
            @foreach($dismissedSuggestions as $suggestion)
            <div class="card" style="border-left: 4px solid #6c757d; opacity: 0.9;">
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
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #1e293b;">{{ $locationName ?: 'Place Suggestion' }}</h3>
                        <span style="padding: 4px 12px; background: #e2e3e5; color: #383d41; border-radius: 4px; font-size: 12px; font-weight: 500;">
                            ❌ DISMISSED
                        </span>
                    </div>

                    @if($suggestion->admin_response)
                    <div style="padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 15px;">
                        <strong style="color: #721c24; display: block; margin-bottom: 5px;">💬 Admin Response:</strong>
                        <p style="margin: 0; color: #721c24;">{{ $suggestion->admin_response }}</p>
                    </div>
                    @else
                    <div style="padding: 15px; background: #e2e3e5; border-left: 4px solid #6c757d; border-radius: 4px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #383d41;">
                            This suggestion was dismissed by the admin.
                        </p>
                    </div>
                    @endif

                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                        <strong>📅 Dismissed:</strong> {{ $suggestion->updated_at->format('M d, Y h:i A') }}
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

