@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">⭐</span> My Favorite Locations
        </h1>
        <a href="/gis" class="btn btn-add-location">
            <span>←</span> Back to Locations
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($favorites->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0;">
                You haven't saved any favorite locations yet. 
                <a href="/gis" class="link">Browse approved locations</a> and click the ⭐ button to add favorites.
            </p>
        </div>
    @else
        <div class="locations-list">
            @foreach($favorites as $location)
            <div class="card location-card">
                <div class="location-content">
                    @if($location->image)
                    <div class="location-image-wrapper">
                        <img src="/uploads/{{ $location->image }}" alt="{{ $location->location }}"
                             onerror="this.style.display='none'"
                             class="location-image">
                    </div>
                    @endif
                    <div class="location-details">
                        <h3 style="margin: 0 0 10px 0; color: #1e293b;">{{ $location->location }}</h3>
                        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                            <span>📍</span> {{ number_format($location->latitude, 6) }}, {{ number_format($location->longitude, 6) }}
                        </p>
                        @if($location->category)
                        <p style="margin: 5px 0; color: #64748b; font-size: 14px;">
                            <span>🏷️</span> {{ $location->category }}
                        </p>
                        @endif
                        @if($location->notes)
                        <p style="margin: 10px 0; color: #475569;">{{ Str::limit($location->notes, 150) }}</p>
                        @endif
                    </div>
                </div>
                <div class="location-actions">
                    <form method="POST" action="/member/favorites/{{ $location->id }}/remove" style="display: inline;">
                        @csrf
                        <button type="submit" class="btn" style="background: #ffc107; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                            <span>⭐</span> Remove from Favorites
                        </button>
                    </form>
                </div>
            </div>
            @endforeach
        </div>
    @endif

    @push('styles')
    <style>
        .location-card {
            margin-bottom: 20px;
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

        .location-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        @media screen and (max-width: 768px) {
            .location-content {
                flex-direction: column !important;
                gap: 16px !important;
            }

            .location-image {
                width: 100% !important;
                height: auto !important;
                max-height: 250px !important;
            }
        }
    </style>
    @endpush
@endsection

