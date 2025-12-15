@extends('frontend.layouts.app')

@section('content')
    <h1>Edit GIS Location</h1>
    <p class="subtitle" style="text-align: center;">Update the location details below.</p>

    @if($errors->any())
        <div class="alert alert-error">{{ $errors->first() }}</div>
    @endif

    <div class="card">
        <form method="POST" action="/gis/{{ $gis_location->id }}/edit" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="image">Current Image:</label>
                @if($gis_location->image)
                    <div class="current-image-wrapper">
                        <img src="/uploads/{{ $gis_location->image }}" alt="Current Image" class="current-image">
                    </div>
                @else
                    <p class="no-image-text">No image uploaded</p>
                @endif
                <input type="file" id="image" name="image" accept="image/*">
                <small>Upload a new image to change.</small>
            </div>

            <div class="form-group">
                <label for="location">Location Name:</label>
                <input type="text" id="location" name="location" required value="{{ $gis_location->location }}">
            </div>

            <div class="form-group">
                <label for="latitude">Latitude:</label>
                <input type="number" id="latitude" name="latitude" step="0.00000001" required value="{{ $gis_location->latitude }}">
                <small>Enter a decimal number between -90 and 90</small>
            </div>

            <div class="form-group">
                <label for="longitude">Longitude:</label>
                <input type="number" id="longitude" name="longitude" step="0.00000001" required value="{{ $gis_location->longitude }}">
                <small>Enter a decimal number between -180 and 180</small>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <a href="/gis" class="btn btn-secondary">Cancel</a>
            </div>
        </form>

        <div class="delete-section">
            <form method="POST" action="/gis/{{ $gis_location->id }}/delete" onsubmit="return confirm('Are you sure you want to delete this location? This action cannot be undone.');">
                @csrf
                <button type="submit" class="btn btn-danger">Delete Location</button>
            </form>
        </div>
    </div>

    @push('styles')
    <style>
        .current-image-wrapper {
            margin-bottom: 16px;
        }

        .current-image {
            width: 200px;
            height: 200px;
            max-width: 100%;
            border-radius: 12px;
            object-fit: cover;
            display: block;
            border: 3px solid #0d6efd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .no-image-text {
            color: #64748b;
            margin: 12px 0;
            font-size: 15px;
        }

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
            background: #0d6efd;
        }

        .btn-secondary {
            background: #6c757d;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .btn-secondary:hover {
            background: #5a6268;
        }

        .delete-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 2px solid #e5e7eb;
        }

        .btn-danger {
            background: #dc3545;
            width: 100%;
            max-width: 300px;
        }

        .btn-danger:hover {
            background: #bb2d3b;
        }

        @media screen and (max-width: 768px) {
            .current-image {
                width: 100% !important;
                height: auto;
                max-height: 250px;
            }

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

            .delete-section {
                margin-top: 24px !important;
                padding-top: 24px !important;
            }

            .btn-danger {
                max-width: 100% !important;
                width: 100% !important;
            }
        }
    </style>
    @endpush
@endsection

