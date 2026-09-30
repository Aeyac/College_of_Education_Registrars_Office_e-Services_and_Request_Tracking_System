<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Strips every construct that can execute script from rich-text HTML while
 * preserving the subset of markup the Quill editor is able to produce.
 */
class HtmlSanitizer
{
    /**
     * Mirrors the client-side DOMPurify allowlist in
     * resources/js/Utils/sanitizeHtml.js. The element and attribute lists have
     * to agree, otherwise the second layer to run would silently drop
     * legitimate formatting. The one deliberate exception is
     * iframe[allowfullscreen], which HTML Purifier only honours under
     * HTML.Trusted, so it is allowed on the client for existing content.
     */
    private const ALLOWED_HTML = 'a,blockquote,br,code,div,em,h1,h2,h3,h4,h5,h6,hr,i,'
        .'iframe,img,li,ol,p,pre,s,small,span,strike,strong,sub,sup,table,tbody,td,'
        .'tfoot,th,thead,tr,u,ul';

    /**
     * HTML.Allowed is a bare element list because declaring attributes inside it
     * and via HTML.AllowedAttributes at the same time is not supported; the
     * latter wins outright and silently drops the former. "*" applies the
     * attribute to every allowed element.
     */
    private const ALLOWED_ATTRS = [
        '*.class' => true,
        '*.style' => true,
        'a.href' => true,
        'a.rel' => true,
        'a.target' => true,
        'a.title' => true,
        'iframe.frameborder' => true,
        'iframe.height' => true,
        'iframe.src' => true,
        'iframe.title' => true,
        'iframe.width' => true,
        'img.alt' => true,
        'img.height' => true,
        'img.src' => true,
        'img.title' => true,
        'img.width' => true,
        'td.colspan' => true,
        'td.rowspan' => true,
        'th.colspan' => true,
        'th.rowspan' => true,
    ];

    /**
     * Quill expresses color, background, size and alignment as inline styles.
     * CSS.AllowedProperties is subtractive, so this narrows HTML Purifier's
     * built-in set to the properties the editor's toolbar can actually emit.
     */
    private const ALLOWED_CSS_PROPERTIES = [
        'background-color' => true,
        'color' => true,
        'font-family' => true,
        'font-size' => true,
        'text-align' => true,
        'text-decoration' => true,
    ];

    /**
     * Matches only the embed URLs the video toolbar can produce, and only over
     * https. HTML.SafeIframe fatals without one of the two allowlist directives,
     * and a regexp takes precedence over the host-based one because the host
     * variant cannot pin the scheme or the path.
     */
    private const SAFE_IFRAME_URL = '%^https://(?:www\.)?(?:youtube\.com/embed/'
        .'|youtube-nocookie\.com/embed/|player\.vimeo\.com/video/)%';

    private const ALLOWED_FRAME_TARGETS = ['_blank', '_self'];

    /**
     * Remove any HTML that is capable of scripting, storing state, or
     * navigating the user off-site, and return what is safe to store.
     */
    public function clean(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $purifier = new HTMLPurifier($this->announcementConfig());

        $clean = $purifier->purify($html);

        /*
         * A rejected embed keeps its empty shell because only the src
         * attribute is host-checked. Drop the shell so the editor does not
         * round-trip an empty frame, while leaving accepted embeds alone.
         */
        $withoutEmptyFrames = preg_replace(
            '/<iframe\b(?![^>]*\ssrc=)[^>]*><\/iframe>/i',
            '',
            $clean
        );

        return $withoutEmptyFrames ?? $clean;
    }

    /**
     * Neutralize markup in chat assistant prose.
     *
     * An assistant reply is text, not authored rich text, so nothing in it is
     * meant to be markup and escaping is both stricter and more faithful than
     * filtering: a stray "<" in "less than < 5" survives instead of eating the
     * rest of the line. The client still runs its own allowlist over the
     * result, so this is a second gate rather than the only one, but it keeps
     * an injected payload from ever leaving the server.
     */
    public function cleanChat(?string $text): string
    {
        if ($text === null || trim($text) === '') {
            return '';
        }

        return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private function baseConfig(): HTMLPurifier_Config
    {
        $config = HTMLPurifier_Config::createDefault();

        $config->set('Core.Encoding', 'utf-8');

        /*
         * Sanitizing runs on administrator saves rather than on every page
         * render, so rebuilding the definitions per call costs nothing
         * meaningful and avoids depending on a writable serializer directory
         * at deploy time.
         */
        $config->set('Cache.DefinitionImpl', null);

        return $config;
    }

    private function announcementConfig(): HTMLPurifier_Config
    {
        $config = $this->baseConfig();

        $config->set('HTML.Allowed', self::ALLOWED_HTML);
        $config->set('HTML.AllowedAttributes', self::ALLOWED_ATTRS);
        $config->set('CSS.AllowedProperties', self::ALLOWED_CSS_PROPERTIES);

        /*
         * The data scheme is required because the editor has no uploader
         * wired up, so pasted images are stored inline as base64. HTML Purifier
         * validates the decoded bytes are really a jpeg, gif or png, which
         * keeps data:text/html and SVG payloads out.
         */
        $config->set('URI.AllowedSchemes', [
            'data' => true,
            'http' => true,
            'https' => true,
            'mailto' => true,
        ]);

        $config->set('HTML.SafeIframe', true);
        $config->set('URI.SafeIframeRegexp', self::SAFE_IFRAME_URL);
        $config->set('HTML.TargetNoopener', true);
        $config->set('HTML.TargetNoreferrer', true);
        $config->set('Attr.AllowedFrameTargets', self::ALLOWED_FRAME_TARGETS);

        return $config;
    }
}
