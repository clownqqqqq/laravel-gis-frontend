<?php
// Database connection test
// Upload to: public_html/geocrud/public/test-db-connection.php
// Access via: https://geocrud.bytevortexz.com/test-db-connection.php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Connection Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .test { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .success { border-left-color: #28a745; }
        .error { border-left-color: #dc3545; }
        .warning { border-left-color: #ffc107; }
        h1 { color: #333; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Database Connection Test</h1>
    
    <?php
    try {
        // Test 1: Database connection
        echo '<div class="test">';
        echo '<h3>Test 1: Database Connection</h3>';
        $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
        echo '<p class="success">✅ Database connection successful!</p>';
        echo '<p><strong>Database:</strong> ' . \Illuminate\Support\Facades\DB::connection()->getDatabaseName() . '</p>';
        echo '</div>';
        
        // Test 2: Check users table
        echo '<div class="test">';
        echo '<h3>Test 2: Users Table</h3>';
        $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
        echo '<p class="success">✅ Users table accessible!</p>';
        echo '<p><strong>Total users:</strong> ' . $userCount . '</p>';
        echo '</div>';
        
        // Test 3: Check auth_token column
        echo '<div class="test">';
        echo '<h3>Test 3: Auth Token Column</h3>';
        $usersWithTokens = \Illuminate\Support\Facades\DB::table('users')
            ->whereNotNull('auth_token')
            ->count();
        echo '<p class="success">✅ Auth token column exists!</p>';
        echo '<p><strong>Users with tokens:</strong> ' . $usersWithTokens . '</p>';
        echo '</div>';
        
        // Test 4: Sample user data
        echo '<div class="test">';
        echo '<h3>Test 4: Sample User Data</h3>';
        $sampleUser = \Illuminate\Support\Facades\DB::table('users')
            ->select('id', 'username', 'email', 'role')
            ->first();
        if ($sampleUser) {
            echo '<p class="success">✅ User data accessible!</p>';
            echo '<pre>' . json_encode($sampleUser, JSON_PRETTY_PRINT) . '</pre>';
        } else {
            echo '<p class="warning">⚠️ No users found in database</p>';
        }
        echo '</div>';
        
        // Test 5: Check token lookup
        echo '<div class="test">';
        echo '<h3>Test 5: Token Lookup Test</h3>';
        $testToken = '010129beeff74ecf2a60ea312f2902fc3397507e93b980ca18b6d9963b07c26b';
        $userByToken = \Illuminate\Support\Facades\DB::table('users')
            ->where('auth_token', $testToken)
            ->first();
        if ($userByToken) {
            echo '<p class="success">✅ Token lookup works!</p>';
            echo '<p><strong>Found user:</strong> ' . $userByToken->username . ' (ID: ' . $userByToken->id . ')</p>';
        } else {
            echo '<p class="warning">⚠️ Test token not found (this is normal if you logged in with a different token)</p>';
            $anyToken = \Illuminate\Support\Facades\DB::table('users')
                ->whereNotNull('auth_token')
                ->select('id', 'username', \Illuminate\Support\Facades\DB::raw('LEFT(auth_token, 20) as token_preview'))
                ->first();
            if ($anyToken) {
                echo '<p><strong>Sample token user:</strong> ' . $anyToken->username . ' (ID: ' . $anyToken->id . ', Token: ' . $anyToken->token_preview . '...)</p>';
            }
        }
        echo '</div>';
        
        echo '<div class="test success">';
        echo '<h3>✅ All Database Tests Passed!</h3>';
        echo '<p>Your database connection is working correctly.</p>';
        echo '</div>';
        
    } catch (\Exception $e) {
        echo '<div class="test error">';
        echo '<h3>❌ Database Error</h3>';
        echo '<p><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
        echo '</div>';
    }
    ?>
    
    <div class="test">
        <h3>Environment Info</h3>
        <p><strong>DB_HOST:</strong> <?php echo env('DB_HOST', 'not set'); ?></p>
        <p><strong>DB_DATABASE:</strong> <?php echo env('DB_DATABASE', 'not set'); ?></p>
        <p><strong>DB_USERNAME:</strong> <?php echo env('DB_USERNAME', 'not set'); ?></p>
        <p><strong>DB_PASSWORD:</strong> <?php echo env('DB_PASSWORD') ? '***set***' : 'not set'; ?></p>
    </div>
</body>
</html>

