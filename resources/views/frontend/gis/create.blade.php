@extends('frontend.layouts.app')

@section('content')
    <h1>Add New GIS Location</h1>
    <p class="subtitle" style="text-align: center;">Fill out the form below to add a new geographic location.</p>

    @if($errors->any())
        <div class="alert alert-error">{{ $errors->first() }}</div>
    @endif

    <div class="card">
        <form method="POST" action="/gis/create" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="image">Location Image (Optional):</label>
                <input type="file" id="image" name="image" accept="image/*">
            </div>

            <div class="form-group">
                <label for="location">Location Name:</label>
                <input type="text" id="location" name="location" required value="{{ old('location') }}" placeholder="e.g., MU, City Hall, etc.">
            </div>

            <div class="form-group">
                <label for="latitude">Latitude:</label>
                <input type="number" id="latitude" name="latitude" step="0.00000001" required value="{{ old('latitude') }}" placeholder="e.g., 8.14954800">
                <small>Enter a decimal number between -90 and 90</small>
            </div>

            <div class="form-group">
                <label for="longitude">Longitude:</label>
                <input type="number" id="longitude" name="longitude" step="0.00000001" required value="{{ old('longitude') }}" placeholder="e.g., 123.84147700">
                <small>Enter a decimal number between -180 and 180</small>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Add Location</button>
                <a href="/gis" class="btn btn-secondary">Cancel</a>
            </div>
        </form>
    </div>

    @push('styles')
    <style>
        .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            flex-wrap: wrap;
        }

        .form-actions .btn {
            flex: 1;
            min-width: 140px;
        }

        .btn-primary {
            background: #0d6efd !important;
        }

        .btn-secondary {
            background: #6c757d !important;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .btn-secondary:hover {
            background: #5a6268 !important;
        }

        @media screen and (max-width: 768px) {
            .form-actions {
                flex-direction: column !important;
                margin-top: 24px !important;
                gap: 10px !important;
            }

            .form-actions .btn {
                width: 100% !important;
                min-width: unset !important;
                flex: none !important;
            }
        }
    </style>
    @endpush
@endsection

