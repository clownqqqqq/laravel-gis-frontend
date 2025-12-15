@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">💡</span> Suggest New Place
        </h1>
        <div style="display: flex; gap: 10px;">
            <a href="/member/my-suggestions" class="btn" style="background: #ffa726; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
                <span>📋</span> View My Suggestions
            </a>
            <a href="/gis" class="btn btn-add-location">
                <span>←</span> Back to Locations
            </a>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <div class="card">
        <h3>Place Suggestion Form</h3>
        <p style="color: #64748b; margin-bottom: 20px;">
            Suggest a new location that should be added to the system. Your suggestion will be reviewed by administrators.
        </p>
        <form method="POST" action="/member/suggest" id="suggestForm" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="image">Location Image (Optional)</label>
                <input type="file" id="image" name="image" accept="image/*">
                <small style="color: #6c757b; font-size: 12px;">Upload a photo of the location (Max: 2MB)</small>
            </div>

            <div class="form-group">
                <label for="location">Location Name *</label>
                <input type="text" id="location" name="location" required 
                       value="{{ old('location') }}" 
                       placeholder="Enter location name">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="latitude">Latitude *</label>
                    <input type="number" id="latitude" name="latitude" required step="any"
                           value="{{ old('latitude') }}" 
                           placeholder="e.g., 14.5995">
                </div>

                <div class="form-group">
                    <label for="longitude">Longitude *</label>
                    <input type="number" id="longitude" name="longitude" required step="any"
                           value="{{ old('longitude') }}" 
                           placeholder="e.g., 120.9842">
                </div>
            </div>

            <button type="submit" class="btn btn-primary" style="background: #28a745; color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                <span>✅</span> Submit Suggestion
            </button>
        </form>
    </div>

    <div class="card" style="background: #f8f9fa; margin-top: 20px;">
        <h4 style="color: #495057; margin-bottom: 10px;">ℹ️ How to Get Coordinates</h4>
        <ul style="color: #6c757b; line-height: 1.8;">
            <li>Use Google Maps: Right-click on a location → Click coordinates → Copy</li>
            <li>Use your phone's GPS: Enable location services and use a maps app</li>
            <li>Format: Latitude (e.g., 14.5995), Longitude (e.g., 120.9842)</li>
        </ul>
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

