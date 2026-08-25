<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        $request->validate(['message' => 'required|string']);
        $term = strtolower(trim($request->input('message')));

        $greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
        if (in_array($term, $greetings)) {
            return response()->json([
                'reply' => "Hello! I'm the CED E-Services Assistant. How can I help you today? You can ask me about document requests, faculty schedules, or alumni verification."
            ]);
        }

        $cleanTerm = preg_replace('/[^a-z0-9\s]/', '', $term);

        $stopWords = ['how', 'the', 'what', 'when', 'where', 'why', 'who', 'and', 'for', 'you', 'can', 'are', 'is', 'do', 'does', 'to', 'a', 'in', 'of', 'i', 'my', 'me', 'get', 'want', 'need'];
        
        $words = array_filter(explode(' ', $cleanTerm), function($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });

        if (empty($words)) {
            $words = explode(' ', $cleanTerm);
        }

        $faqs = Faq::where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('question', 'like', "%{$word}%")
                  ->orWhere('answer', 'like', "%{$word}%");
            }
        })->get();

        if ($faqs->isEmpty()) {
            return response()->json([
                'reply' => "I'm sorry, I couldn't find an exact answer to that. However, if you are a student or alumni, you can log in and submit a direct inquiry through the 'My Inquiries' tab, and our staff will assist you."
            ]);
        }

        $scoredFaqs = $faqs->map(function ($faq) use ($words) {
            $score = 0;
            $content = strtolower($faq->question . ' ' . $faq->answer);
            foreach ($words as $word) {
                if (str_contains($content, $word)) {
                    $score++;
                }
            }
            $faq->relevance_score = $score;
            return $faq;
        })->filter(function($faq) {
            return $faq->relevance_score > 0;
        })->sortByDesc('relevance_score')->take(2);

        $reply = "Here is the best information I found for you:\n\n";
        foreach ($scoredFaqs as $faq) {
            $reply .= "**" . $faq->question . "**\n" . $faq->answer . "\n\n";
        }

        return response()->json(['reply' => trim($reply)]);
    }
}