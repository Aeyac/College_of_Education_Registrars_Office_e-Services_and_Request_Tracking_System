<?php

namespace App\Services;

use App\Models\FilteredWord;
use Illuminate\Support\Facades\Cache;
use Normalizer;

class ProfanityFilter
{
    /**
     * Check whether the given text contains profanity.
     */
    public function containsProfanity(string $text): bool
    {
        if (trim($text) === '') {
            return false;
        }

        $normalizedText = $this->normalize($text);

        foreach ($this->words() as $word) {
            $normalizedWord = $this->normalizeWord($word);

            if ($normalizedWord === '') {
                continue;
            }

            /*
             * Match the word as a complete word.
             *
             * Example:
             * "ass"     -> detected
             * "ASS"     -> detected
             * "my-ass"  -> detected
             * "class"   -> NOT detected
             */
            if (
                preg_match(
                    '/(?<![\p{L}\p{N}])' . preg_quote($normalizedWord, '/') . '(?![\p{L}\p{N}])/iu',
                    $normalizedText
                )
            ) {
                return true;
            }

            /*
             * Detect obfuscated versions such as:
             *
             * f u c k
             * f.u.c.k
             * f-u-c-k
             * f_u_c_k
             *
             * We allow non-alphanumeric characters between letters.
             */
            $obfuscatedPattern = implode(
                '[^\p{L}\p{N}]*',
                array_map(
                    fn(string $character) => preg_quote($character, '/'),
                    mb_str_split($normalizedWord)
                )
            );

            if (
                preg_match(
                    '/(?<![\p{L}\p{N}])' . $obfuscatedPattern . '(?![\p{L}\p{N}])/iu',
                    $normalizedText
                )
            ) {
                return true;
            }

            /*
             * Detect repeated-character obfuscation.
             *
             * Example:
             * fuuuck
             * fuuuuck
             *
             * Each character is allowed to repeat.
             */
            $repeatedPattern = implode(
                '[^\p{L}\p{N}]*',
                array_map(
                    fn(string $character) =>
                    preg_quote($character, '/') . '+',
                    mb_str_split($normalizedWord)
                )
            );

            if (
                preg_match(
                    '/(?<![\p{L}\p{N}])' . $repeatedPattern . '(?![\p{L}\p{N}])/iu',
                    $normalizedText
                )
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Normalize user input so simple obfuscation techniques
     * cannot bypass the filter.
     */
    private function normalize(string $text): string
    {
        /*
         * Normalize Unicode characters.
         *
         * Example:
         * full-width characters -> normal characters
         */
        if (class_exists(Normalizer::class)) {
            $text = Normalizer::normalize($text, Normalizer::FORM_KC);
        }

        /*
         * Lowercase.
         */
        $text = mb_strtolower($text, 'UTF-8');

        /*
         * Remove zero-width and invisible Unicode characters.
         *
         * This prevents:
         * f\u200Bu\u200Bc\u200Bk
         */
        $text = preg_replace(
            '/[\x{00AD}\x{034F}\x{061C}\x{115F}\x{1160}\x{17B4}\x{17B5}\x{180B}-\x{180F}\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{206F}\x{FEFF}]/u',
            '',
            $text
        );

        /*
         * Normalize common leetspeak substitutions.
         *
         * 0 -> o
         * 1 -> i
         * 3 -> e
         * 4 -> a
         * 5 -> s
         * 7 -> t
         * @ -> a
         * $ -> s
         */
        $text = strtr($text, [
            '0' => 'o',
            '1' => 'i',
            '3' => 'e',
            '4' => 'a',
            '5' => 's',
            '7' => 't',
            '@' => 'a',
            '$' => 's',
        ]);

        return $text;
    }

    /**
     * Normalize words stored in the database.
     */
    private function normalizeWord(string $word): string
    {
        $word = $this->normalize($word);

        /*
         * Filter words should be treated as actual words,
         * not phrases containing punctuation.
         */
        return preg_replace('/[^\p{L}\p{N}]+/u', '', $word);
    }

    /**
     * Retrieve filtered words from cache.
     */
    private function words(): array
    {
        return Cache::rememberForever(
            'filtered_words',
            fn() => FilteredWord::pluck('word')->all()
        );
    }
}