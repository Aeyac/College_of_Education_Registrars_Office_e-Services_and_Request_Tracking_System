<?php

use App\Services\HtmlSanitizer;

beforeEach(function () {
    $this->sanitizer = new HtmlSanitizer;
});

test('it removes script elements', function () {
    $clean = $this->sanitizer->clean('<p>Registrar office</p><script>alert(1)</script>');

    expect($clean)->toBe('<p>Registrar office</p>');
});

test('it removes inline event handlers', function (string $payload) {
    $clean = $this->sanitizer->clean($payload);

    expect($clean)->not->toContain('onerror')
        ->and($clean)->not->toContain('onload')
        ->and($clean)->not->toContain('onclick')
        ->and($clean)->not->toContain('onfocus');
})->with([
    'img onerror' => '<img src="x" onerror="alert(1)">',
    'svg onload' => '<svg onload="alert(1)"></svg>',
    'body onload' => '<div onmouseover="alert(1)">hover</div>',
    'details ontoggle' => '<details ontoggle="alert(1)" open>x</details>',
]);

test('it removes script bearing url schemes from links', function (string $payload) {
    $clean = $this->sanitizer->clean($payload);

    expect($clean)->not->toContain('javascript:')
        ->and($clean)->not->toContain('vbscript:')
        ->and($clean)->not->toContain('data:text/html');
})->with([
    'lowercase' => '<a href="javascript:alert(1)">click</a>',
    'mixed case' => '<a href="JaVaScRiPt:alert(1)">click</a>',
    'padded' => '<a href="  javascript:alert(1)">click</a>',
    'entity encoded' => '<a href="javascript&#58;alert(1)">click</a>',
    'tab separated' => "<a href=\"java\tscript:alert(1)\">click</a>",
    'vbscript' => '<a href="vbscript:msgbox(1)">click</a>',
]);

test('it drops form controls and other active content', function () {
    $clean = $this->sanitizer->clean(
        '<form action="https://evil.test"><input name="a"><button>go</button></form>'
        .'<style>body{display:none}</style>'
        .'<meta http-equiv="refresh" content="0;url=https://evil.test">'
        .'<base href="https://evil.test/">'
        .'<object data="x"></object>'
        .'<embed src="y">'
    );

    expect($clean)->not->toContain('<form')
        ->and($clean)->not->toContain('<input')
        ->and($clean)->not->toContain('<button')
        ->and($clean)->not->toContain('<style')
        ->and($clean)->not->toContain('<meta')
        ->and($clean)->not->toContain('<base')
        ->and($clean)->not->toContain('<object')
        ->and($clean)->not->toContain('<embed');
});

test('it keeps embeds from the allowlisted video hosts', function () {
    $youtube = $this->sanitizer->clean(
        '<iframe class="ql-video" frameborder="0" src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'
    );

    $vimeo = $this->sanitizer->clean(
        '<iframe src="https://player.vimeo.com/video/76979871/"></iframe>'
    );

    expect($youtube)->toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"')
        ->and($vimeo)->toContain('src="https://player.vimeo.com/video/76979871/"');
});

test('it drops embeds from every other host', function (string $payload) {
    $clean = $this->sanitizer->clean($payload);

    expect($clean)->not->toContain('<iframe');
})->with([
    'unknown host' => '<iframe src="https://evil.test/embed"></iframe>',
    'lookalike host' => '<iframe src="https://www.youtube.com.evil.test/embed/1"></iframe>',
    'insecure scheme' => '<iframe src="http://www.youtube.com/embed/1"></iframe>',
    'userinfo trick' => '<iframe src="https://www.youtube.com@evil.test/embed/1"></iframe>',
    'relative url' => '<iframe src="/admin/evil"></iframe>',
    'no scheme' => '<iframe src="//evil.test/x"></iframe>',
]);

test('it preserves the formatting the editor toolbar can produce', function () {
    $html = '<h1>Registrar</h1><h3>Schedule</h3>'
        .'<p><strong>Bold</strong> <em>italic</em> <u>under</u> <s>struck</s></p>'
        .'<ul><li>First</li></ul><ol><li>Second</li></ol>'
        .'<blockquote>Quoted guidance</blockquote>'
        .'<p><a href="https://ced.example.edu">Registrar site</a></p>';

    $clean = $this->sanitizer->clean($html);

    expect($clean)->toContain('<h1>Registrar</h1>')
        ->and($clean)->toContain('<h3>Schedule</h3>')
        ->and($clean)->toContain('<strong>Bold</strong>')
        ->and($clean)->toContain('<em>italic</em>')
        ->and($clean)->toContain('<u>under</u>')
        ->and($clean)->toContain('<s>struck</s>')
        ->and($clean)->toContain('<li>First</li>')
        ->and($clean)->toContain('<li>Second</li>')
        ->and($clean)->toContain('<blockquote>Quoted guidance</blockquote>')
        ->and($clean)->toContain('href="https://ced.example.edu"');
});

test('it preserves the inline styles the editor writes for color and alignment', function () {
    $clean = $this->sanitizer->clean(
        '<p><span style="color:#ff9900;background-color:#ffffcc;'
        .'font-size:large;text-align:center">Reminder</span></p>'
    );

    expect($clean)->toContain('color:#ff9900')
        ->and($clean)->toContain('background-color:#ffffcc')
        ->and($clean)->toContain('font-size:large')
        ->and($clean)->toContain('text-align:center');
});

test('it strips inline styles that are not formatting', function () {
    $clean = $this->sanitizer->clean(
        '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999">overlay</div>'
    );

    expect($clean)->not->toContain('position')
        ->and($clean)->not->toContain('z-index')
        ->and($clean)->toContain('overlay');
});

test('it preserves pasted images stored as base64 data uris', function () {
    $clean = $this->sanitizer->clean(
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ'
        .'AAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" alt="dot">'
    );

    expect($clean)->toContain('data:image/png;base64,')
        ->and($clean)->toContain('alt="dot"');
});

test('it drops data uris that are not real images', function (string $payload) {
    $clean = $this->sanitizer->clean($payload);

    expect($clean)->not->toContain('src=');
})->with([
    'html' => '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
    'svg' => '<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Pjwvc2NyaXB0Pjwvc3ZnPg==">',
]);

test('it adds noopener and noreferrer to links that open a new tab', function () {
    $clean = $this->sanitizer->clean('<a href="https://ced.example.edu" target="_blank">Registrar</a>');

    expect($clean)->toContain('target="_blank"')
        ->and($clean)->toContain('rel="noreferrer noopener"');
});

test('it returns an empty string for empty input', function (?string $input) {
    expect($this->sanitizer->clean($input))->toBe('');
})->with([null, '', '   ']);

test('it does not remove the text of a stripped element', function () {
    $clean = $this->sanitizer->clean('<p>Enrolment <script>alert(1)</script>closes Friday</p>');

    expect($clean)->toContain('Enrolment')
        ->and($clean)->toContain('closes Friday');
});

test('the chat profile leaves the assistant emphasis markers for the client to expand', function () {
    $clean = $this->sanitizer->cleanChat("**Registrar** open <strong>Monday</strong>\nCall 1234");

    expect($clean)->toContain('**Registrar**')
        ->and($clean)->toContain('&lt;strong&gt;Monday&lt;/strong&gt;')
        ->and($clean)->toContain("\nCall 1234");
});

test('the chat profile leaves no unescaped angle brackets behind', function (string $payload) {
    $clean = $this->sanitizer->cleanChat($payload);

    expect($clean)->not->toContain('<')
        ->and($clean)->not->toContain('>')
        ->and($clean)->toContain('&lt;');
})->with([
    'script element' => 'Hello <script>alert(1)</script>',
    'img onerror' => 'Hello <img src="x" onerror="alert(1)">',
    'javascript link' => 'Click <a href="javascript:alert(1)">here</a>',
    'svg onload' => 'Hello <svg onload="alert(1)"></svg>',
    'iframe' => 'Hello <iframe src="https://evil.test/steal"></iframe>',
    'style block' => 'Hello <style>body{display:none}</style>',
]);

test('the chat profile preserves angle brackets used as ordinary text', function () {
    $clean = $this->sanitizer->cleanChat('Enrolment closes when the count is < 10 & seats remain');

    expect($clean)->toBe('Enrolment closes when the count is &lt; 10 &amp; seats remain');
});

test('the chat profile returns an empty string for empty input', function (?string $input) {
    expect($this->sanitizer->cleanChat($input))->toBe('');
})->with([null, '', '   ']);

test('the chat profile tolerates invalid utf8 instead of blanking the reply', function () {
    expect($this->sanitizer->cleanChat("Registrar \xB1\x31 open"))->not->toBe('');
});
