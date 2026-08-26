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

        // =========================================================
        // 0. PROFANITY & INAPPROPRIATE LANGUAGE FILTER
        // =========================================================
        $badWords = [
            'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'motherfucker', 
            'putangina', 'tangina', 'gago', 'bobo', 'tanga', 'inutil', 'ulol', 
            'punyeta', 'hayop', 'gaga', 'kupal', 'tarantado', 'stupid', 'idiot', 'pakyu'
        ];
        
        foreach ($badWords as $word) {
            if (str_contains($term, $word)) {
                return response()->json([
                    'reply' => "I detected inappropriate language in your message. Please maintain a polite and professional tone. How else can I assist you with CED E-Services?"
                ]);
            }
        }

        // =========================================================
        // 1. THE BRAIN: Comprehensive System Knowledge Base
        // =========================================================
        $knowledgeBase = [
            [
                'tags' => ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening', 'sup', 'help'],
                'answer' => "Hello there! I'm the CED E-Services Assistant. I know everything about the system—from document requests, alumni verification, faculty schedules, to our development team. How can I help you today?"
            ],
            [
                'tags' => ['developer', 'programmer', 'team', 'creator', 'made', 'build', 'built', 'create', 'scrum', 'author', 'who made'],
                'answer' => "The CED E-Services Portal was conceptualized, designed, and developed by a brilliant team of aspiring IT professionals:\n\n- **Jay-ar S. De Guzman** (Scrum Master | Frontend & Backend)\n- **Mel Joseph T. Velasco** (Frontend & Backend)\n- **Aaron A. Castro** (Frontend & Backend)\n- **Reazel Keith D. Herbas** (Frontend Programmer)\n- **Dan Loyd S. Francia** (Frontend Programmer)\n- **Sheryn Mae P. De Vera** (Documentator & Frontend)\n- **Jayveelyn C. Vicente** (Quality Assurance)"
            ],
            [
                'tags' => ['course', 'program', 'degree', 'major', 'offer', 'study', 'bachelor', 'btled', 'bsed', 'beed', 'bcaed', 'bped'],
                'answer' => "The College of Education proudly offers the following degree programs:\n\n- **BCAEd:** Bachelor of Culture and Arts Education\n- **BECEd:** Bachelor of Early Childhood Education\n- **BEEd:** Bachelor of Elementary Education\n- **BPEd:** Bachelor of Physical Education\n- **BSEd:** Bachelor of Secondary Education (Majors: English, Filipino, Math, Science, Social Studies, Values Ed)\n- **BTLEd:** Bachelor of Technology and Livelihood Education (Majors: Agri-Fisheries, Home Economics, Industrial Arts)"
            ],
            [
                'tags' => ['time', 'long', 'day', 'process', 'processing', 'wait', 'duration', 'fast', 'quick'],
                'answer' => "The standard processing time for document requests is **3-5 working days** upon submission of complete requirements. This depends on the volume of requests. You can track your request's real-time status on your Dashboard."
            ],
            [
                'tags' => ['alumni', 'verify', 'verification', 'diploma', 'tor', 'graduate', 'transcript', 'graduated', 'past student'],
                'answer' => "If you are an Alumni, you need to verify your identity before requesting documents. Go to your Dashboard and click **Upload Docs**. You must upload a clear copy of your **Diploma** or **Official Transcript of Records (TOR)**. An admin will review and approve it."
            ],
            [
                'tags' => ['appointment', 'meet', 'schedule', 'consultation', 'talk', 'professor', 'faculty', 'teacher', 'instructor', 'room'],
                'answer' => "To see when a professor is available, go to the **Faculty Schedules** tab. If you need to schedule a specific appointment or meeting, please submit a message via the **My Inquiries** tab so the admin can assist you."
            ],
            [
                'tags' => ['claim', 'representative', 'authorization', 'proxy', 'behalf', 'get', 'pickup', 'release'],
                'answer' => "If you cannot claim your requested document personally, your authorized representative must present three things:\n1. An **authorization letter**\n2. A **photocopy of your valid ID**\n3. Their **own valid ID**."
            ],
            [
                'tags' => ['mission', 'vision', 'philosophy', 'goal', 'about', 'history', 'objective'],
                'answer' => "**Our Mission:** To develop highly competent, morally upright educators.\n**Our Vision:** A premier center of excellence in teacher education.\n**Philosophy:** Education is a lifelong process of holistic development."
            ],
            [
                'tags' => ['service', 'feature', 'system', 'portal', 'what can i do'],
                'answer' => "Our system allows you to:\n1. Request documents (Internship Cert, COBC, etc.)\n2. Track request status in real-time\n3. View Faculty Consultation Hours\n4. Verify Alumni status\n5. Communicate directly with the office via Inquiry Threads\n6. Download the Academic Calendar."
            ],
            [
                'tags' => ['document', 'internship certificate', 'cobc', 'course description', 'golden grain', 'yearbook', 'soft copy', 'hard copy', 'format', 'request'],
                'answer' => "You can request the following documents via the portal:\n- Internship Certificate\n- Copy of COBC\n- Course Description\n- Golden Grain (Yearbook)\n\nYou can choose between **Hard Copy** or **Soft Copy** delivery modes."
            ],
            [
                'tags' => ['contact', 'phone', 'email', 'call', 'reach', 'location', 'where', 'address'],
                'answer' => "You can reach the CED Registrar's Office through:\n- **Phone:** +63 (234) 567-8901\n- **Email:** info@cedservices.com\n- Or simply use the **My Inquiries** tab in your dashboard!"
            ],
            [
                'tags' => ['calendar', 'academic calendar', 'date', 'event'],
                'answer' => "You can view and download the official **Academic Calendar** directly from your Dashboard. Just look for the 'Academic Calendar' button under the Quick Actions section."
            ],
            [
                'tags' => ['privacy', 'policy', 'data', 'security', 'personal information', 'term', 'condition', 'rule', 'prohibited', 'liability'],
                'answer' => "We take your privacy seriously. Your data (contact info, student numbers, documents) is used strictly for administrative and operational purposes. We do not sell or trade your information. You can read the full Privacy Policy and Terms of Service via the sidebar links."
            ],
            [
                'tags' => ['inquiry', 'message', 'question', 'ask', 'chat', 'thread', 'support', 'wrong'],
                'answer' => "If you have specific concerns, noticed an error in your request, or want to schedule an appointment, use the **My Inquiries** tab. It works like a chat messenger where you can talk directly to the Admin, edit your messages, and even attach files!"
            ],
            [
                'tags' => ['password', 'profile', 'picture', 'update', 'change', 'account', 'login', 'register'],
                'answer' => "To update your personal details, email, password, or profile picture, go to the **Profile Settings** tab located in the sidebar navigation."
            ]
        ];

        // =========================================================
        // 2. FUZZY REGEX MATCHING ALGORITHM
        // =========================================================
        $bestStaticMatch = null;
        $highestScore = 0;

        foreach ($knowledgeBase as $item) {
            $score = 0;
            foreach ($item['tags'] as $tag) {
                // Gumagamit ng \b (word boundary) at (s|es)? para ma-detect ang plural form (e.g. developer = developers)
                if (preg_match("/\b" . preg_quote($tag, '/') . "(s|es|d|ed)?\b/i", $term)) {
                    // Mas mataas ang score kung ang tag ay multi-word (e.g. "internship certificate" > "document")
                    $score += (str_word_count($tag) > 1) ? 3 : 1; 
                }
            }
            
            if ($score > $highestScore) {
                $highestScore = $score;
                $bestStaticMatch = $item['answer'];
            }
        }

        // Ibalik agad ang system knowledge kung may tumugmang tags (Score > 0)
        if ($bestStaticMatch && $highestScore > 0) {
            return response()->json(['reply' => $bestStaticMatch]);
        }

        // =========================================================
        // 3. DATABASE FAQ FALLBACK
        // =========================================================
        // Kung walang hardcoded system knowledge na tumugma, hahanapin niya sa FAQs table
        $cleanTerm = preg_replace('/[^a-z0-9\s]/', '', $term);
        $stopWords = ['how', 'the', 'what', 'when', 'where', 'why', 'who', 'and', 'for', 'you', 'can', 'are', 'is', 'do', 'does', 'to', 'a', 'in', 'of', 'i', 'my', 'me'];
        
        $words = array_filter(explode(' ', $cleanTerm), function($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });

        if (empty($words)) { $words = explode(' ', $cleanTerm); }

        $faqs = Faq::where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('question', 'like', "%{$word}%")
                  ->orWhere('answer', 'like', "%{$word}%");
            }
        })->get();

        if ($faqs->isNotEmpty()) {
            $scoredFaqs = $faqs->map(function ($faq) use ($words) {
                $score = 0;
                $content = strtolower($faq->question . ' ' . $faq->answer);
                foreach ($words as $word) {
                    if (str_contains($content, $word)) $score++;
                }
                $faq->relevance_score = $score;
                return $faq;
            })->filter(fn($faq) => $faq->relevance_score > 0)->sortByDesc('relevance_score')->take(2);

            if ($scoredFaqs->isNotEmpty()) {
                $reply = "Here is what I found in our FAQ records:\n\n";
                foreach ($scoredFaqs as $faq) {
                    $reply .= "**" . $faq->question . "**\n" . $faq->answer . "\n\n";
                }
                return response()->json(['reply' => trim($reply)]);
            }
        }

        // =========================================================
        // 4. ABSOLUTE FALLBACK
        // =========================================================
        return response()->json([
            'reply' => "I'm sorry, I couldn't completely understand your question. \n\nHowever, you can easily submit a direct message to our staff via the **My Inquiries** tab on your dashboard, and they will personally assist you!"
        ]);
    }
}