@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">🔍</span> Search Places
        </h1>
        <a href="/gis" class="btn btn-add-location">
            <span>←</span> Back to Locations
        </a>
    </div>

    <div class="card">
        <h3>Search & Filter</h3>
        <form method="GET" action="/gis" style="display: grid; gap: 15px;">
            <div>
                <label for="search" style="display: block; margin-bottom: 5px;">Search by Name</label>
                <input type="text" id="search" name="search" value="{{ request('search') }}" 
                       placeholder="Enter location name..." 
                       style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            <div>
                <label for="category" style="display: block; margin-bottom: 5px;">Filter by Category</label>
                <select id="category" name="category" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                    <option value="">All Categories</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat }}" {{ request('category') == $cat ? 'selected' : '' }}>{{ $cat }}</option>
                    @endforeach
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="background: #0d6efd; color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                <span>🔍</span> Search
            </button>
        </form>
    </div>

    <div class="card" style="background: #f8f9fa; margin-top: 20px;">
        <h4 style="color: #495057; margin-bottom: 10px;">ℹ️ Search Tips</h4>
        <ul style="color: #6c757b; line-height: 1.8;">
            <li>Search by location name, category, or description</li>
            <li>Use the category filter to narrow down results</li>
            <li>Only approved locations are shown in search results</li>
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

