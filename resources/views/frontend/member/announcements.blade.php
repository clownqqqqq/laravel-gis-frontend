@extends('frontend.layouts.app')

@section('content')
    <div class="page-header">
        <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin: 0;">
            <span style="font-size: 36px;">📢</span> Announcements
        </h1>
        <a href="/gis" class="btn btn-add-location">
            <span>←</span> Back to Locations
        </a>
    </div>

    @if($announcements->isEmpty())
        <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #64748b; margin: 0;">
                No announcements at this time.
            </p>
        </div>
    @else
        <div style="display: grid; gap: 20px;">
            @foreach($announcements as $announcement)
            <div class="card" style="border-left: 4px solid #0d6efd;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #1e293b;">{{ $announcement->title }}</h3>
                    <span style="color: #64748b; font-size: 12px;">
                        {{ $announcement->created_at->format('M d, Y') }}
                    </span>
                </div>
                <p style="color: #475569; margin: 0; line-height: 1.6;">
                    {{ $announcement->content }}
                </p>
            </div>
            @endforeach
        </div>
    @endif
@endsection

