<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\FilteredWord;
use App\Models\RequestService;
use App\Models\RequestStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        Role::firstOrCreate(['name' => 'student']);
        Role::firstOrCreate(['name' => 'alumni']);
        Role::firstOrCreate(['name' => 'admin']);

        User::where('user_type', 'student')->get()->each(fn(User $user) => $user->assignRole('student'));
        User::where('user_type', 'alumni')->get()->each(fn(User $user) => $user->assignRole('alumni'));
        User::where('user_type', 'admin')->get()->each(fn(User $user) => $user->assignRole('admin'));

        // 1. Updated Service Catalog
        RequestService::firstOrCreate(['code' => 'internship_certificate'], ['label' => 'Internship Certificate / PT Certificate', 'is_active' => true, 'sort_order' => 1]);
        RequestService::firstOrCreate(['code' => 'copy_of_copc'], ['label' => 'Request for Copy of COPC', 'is_active' => true, 'sort_order' => 2]);
        RequestService::firstOrCreate(['code' => 'course_description'], ['label' => 'Course Description', 'is_active' => true, 'sort_order' => 3]);
        RequestService::firstOrCreate(['code' => 'golden_grain'], ['label' => 'Golden Grain (Yearbook)', 'is_active' => true, 'sort_order' => 4]);

        // 2. REQUIRED: Request Statuses (Fixes the 404 Error)
        $statuses = [
            ['code' => 'submitted', 'label' => 'Submitted', 'sort_order' => 1],
            ['code' => 'for_review', 'label' => 'For Review', 'sort_order' => 2],
            ['code' => 'processing', 'label' => 'Processing', 'sort_order' => 3],
            ['code' => 'ready_for_release', 'label' => 'Ready for Release', 'sort_order' => 4],
            ['code' => 'released', 'label' => 'Released', 'sort_order' => 5],
            ['code' => 'for_compliance', 'label' => 'For Compliance', 'sort_order' => 6],
            ['code' => 'cancelled', 'label' => 'Cancelled', 'sort_order' => 7],
            ['code' => 'rejected', 'label' => 'Rejected', 'sort_order' => 8],
        ];

        foreach ($statuses as $status) {
            RequestStatus::firstOrCreate(['code' => $status['code']], $status);
        }

        // 3. Profanity Filter Words
        $defaultWords = [
            'fuck',
            'shit',
            'bitch',
            'asshole',
            'dick',
            'pussy',
            'putangina',
            'tangina',
            'gago',
            'bobo',
            'tanga',
            'inutil',
            'ulol',
            'punyeta',
            'hayop',
            'gaga',
            'kupal',
            'tarantado',
        ];

        foreach ($defaultWords as $word) {
            FilteredWord::firstOrCreate(['word' => $word]);
        }

        $defaultFaqs = [
            // A. ABOUT THE CED REGISTRAR'S OFFICE
            ['question' => "What is the College of Education Registrar's Office?", 'answer' => "The CED Registrar's Office assists the College of Education in academic records coordination, curriculum-related concerns, student academic inquiries, verification of academic requirements, and other college-level registrar functions within its authorized scope.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Is the CED Registrar's Office the same as the Office of Admissions?", 'answer' => "No. The CED Registrar's Office is a college-level office. The Office of Admissions handles official university academic records and documents that are under its authority.", 'category' => "About the CED Registrar's Office"],
            ['question' => "What certificates can I request from the CED Registrar's Office?", 'answer' => "The CED Registrar's Office may facilitate Internship/Practice Teaching Certificates and related certifications that are within the records and authority of the College of Education.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I request my Transcript of Records (TOR) from the CED Registrar's Office?", 'answer' => "No. Requests for official Transcript of Records should be processed through the Office of Admissions.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I request a Certificate of Enrollment from the CED Registrar's Office?", 'answer' => "No. Official enrollment certifications are processed by the appropriate university office, particularly the Office of Admissions.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I request a Certificate of Grades from the CED Registrar's Office?", 'answer' => "Official academic record certifications are not issued by the CED Registrar's Office. Students should coordinate with the Office of Admissions or the appropriate authorized office.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I request authentication of my TOR, diploma, or other official academic documents from the CED Registrar's Office?", 'answer' => "No. Authentication or certification of official university academic records should be requested from the office officially responsible for those records.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I request my diploma from the CED Registrar's Office?", 'answer' => "No. Diploma-related concerns should be coordinated with the Office of Admissions or the appropriate university office.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Does the CED Registrar's Office accept payments?", 'answer' => "No. There are no payment transactions in the CED Registrar's Office. Any required university payment must be made only through the officially designated university payment channels.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Should I send proof of payment to the CED Registrar's Office?", 'answer' => "No, unless specifically requested for a transaction coordinated with another authorized university office. The CED Registrar's Office does not collect or process payments.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can I ask the CED Registrar's Office about my academic concerns?", 'answer' => "Yes. Students may inquire about College of Education academic policies, curriculum concerns, prerequisites, academic load, internship-related requirements, and other matters within the scope of the college. If the concern belongs to another office, the student will be referred accordingly.", 'category' => "About the CED Registrar's Office"],
            ['question' => "Can another person process a transaction for me?", 'answer' => "This depends on the nature of the transaction and university policy. Authorization and valid identification may be required for transactions involving personal or academic information.", 'category' => "About the CED Registrar's Office"],

            // B. INTERNSHIP/PRACTICE TEACHING CERTIFICATE
            ['question' => "How can I request an Internship or Practice Teaching Certificate?", 'answer' => "Submit a request to the CED Registrar's Office together with the information and supporting documents required for verification.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "What information may be required for an Internship Certificate?", 'answer' => "The office may request information such as your complete name, student number, degree program, major, semester and school year of internship, cooperating school, duration of internship, grade level handled, and other information necessary for verification.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "Why do I need to provide supporting documents when requesting an Internship Certificate?", 'answer' => "Supporting documents allow the office to verify the accuracy of the information that will appear in the certification.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "Can the CED Registrar certify information that cannot be verified from available records?", 'answer' => "No. The office can only certify information that can be supported by official or verifiable records.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "Can I request that specific information be added to my Internship Certificate?", 'answer' => "You may request it, but the information can only be included if it is relevant, appropriate, and supported by available records.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "Can an Internship Certificate be issued immediately?", 'answer' => "Processing time depends on the completeness of the submitted information, availability of records, verification requirements, and office workload.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "How will I know if my Internship Certificate is ready?", 'answer' => "If the proposed online system is implemented, the status may be viewed through the system or communicated through the contact information provided by the requester.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "What possible statuses may appear for my certificate request?", 'answer' => "The status may appear as Submitted, For Review, For Compliance, Processing, Ready for Release, Released, Returned, or Cancelled, depending on the progress of the request.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "What does \"For Compliance\" mean?", 'answer' => "It means that additional, corrected, or missing information or documents are needed before the office can continue processing the request.", 'category' => "Internship/Practice Teaching Certificate"],
            ['question' => "What should I do if there is an error in the certificate issued to me?", 'answer' => "Immediately contact the CED Registrar's Office and provide the correct information and supporting document, if necessary, so the matter can be reviewed.", 'category' => "Internship/Practice Teaching Certificate"],

            // C. CURRICULUM, PREREQUISITES, AND ENROLLMENT CONCERNS
            ['question' => "What curriculum should I follow?", 'answer' => "Students should generally follow the curriculum officially applicable to their program and admission or curriculum classification, subject to current university rules and approved curriculum changes.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can I take a subject even if I have not completed its prerequisite?", 'answer' => "Generally, prerequisite requirements must first be satisfied before enrolling in the succeeding course unless an approved university policy provides otherwise.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "What is a prerequisite?", 'answer' => "A prerequisite is a course or requirement that must normally be completed before a student may enroll in another specified course.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "What is a co-requisite?", 'answer' => "A co-requisite is a course or requirement that must be taken together with another course or under conditions specified in the approved curriculum.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can prerequisite or co-requisite requirements be waived?", 'answer' => "Students should not assume that prerequisites or co-requisites can be waived. Any exception must be supported by applicable university policy and approved by the proper authority.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can I take Internship if I have not completed the required Field Study or prerequisite courses?", 'answer' => "Internship eligibility is subject to the prerequisites indicated in the approved curriculum and existing university policies. Students should have their academic records evaluated before enrollment.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can I enroll in a subject that is not included in my curriculum?", 'answer' => "No. Students may only enroll in courses included in the study program of the degree they are pursuing.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "What should I do if the course code or course title in my enrollment is different from my curriculum?", 'answer' => "Report the discrepancy immediately to the CED Registrar's Office or your department so the course can be checked against the approved curriculum.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can one course substitute for another course in my curriculum?", 'answer' => "Course substitution is not automatic. It requires proper evaluation and approval in accordance with university policies.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],
            ['question' => "Can I take two courses at the same time if one is a prerequisite of the other?", 'answer' => "Normally, a prerequisite should be completed first. Concurrent enrollment is allowed only when specifically permitted by the approved curriculum or applicable university policy.", 'category' => "Curriculum, Prerequisites, and Enrollment Concerns"],

            // D. SHIFTING, TRANSFERRING, AND CHANGE OF PROGRAM
            ['question' => "I want to shift to another program. What should I do?", 'answer' => "Students should follow the university's official shifting procedures and obtain the required evaluations and approvals from the concerned college, department, and other authorized offices.", 'category' => "Shifting, Transferring, and Change of Program"],
            ['question' => "If I shift to another program, will all my subjects be credited?", 'answer' => "Not necessarily. Crediting depends on the curriculum of the new program, equivalency of courses, grades obtained, and applicable university policies.", 'category' => "Shifting, Transferring, and Change of Program"],
            ['question' => "If I shift to another college but do not secure a slot, can I automatically return to my previous program?", 'answer' => "Returning to the previous program is not necessarily automatic. The student should coordinate with the concerned colleges and the proper university offices regarding admission, availability of slots, and applicable policies.", 'category' => "Shifting, Transferring, and Change of Program"],
            ['question' => "Who evaluates the subjects of a shifting student?", 'answer' => "Evaluation normally involves the receiving academic unit and the appropriate registrar/admission offices based on the approved curriculum and university policies.", 'category' => "Shifting, Transferring, and Change of Program"],

            // E. CROSS-ENROLLMENT AND PETITIONED COURSES
            ['question' => "Can I cross-enroll a subject in another institution?", 'answer' => "Cross-enrollment may be allowed only under conditions established by the university and with prior approval from the proper authorities.", 'category' => "Cross-Enrollment and Petitioned Courses"],
            ['question' => "Can I cross-enroll first and ask for approval afterward?", 'answer' => "Students should secure the required approval before cross-enrolling. Subjects taken without proper authorization may encounter problems in crediting.", 'category' => "Cross-Enrollment and Petitioned Courses"],
            ['question' => "Can students request the opening of a petitioned class?", 'answer' => "Students may submit a request subject to university policies, minimum requirements, availability of faculty, facilities, academic scheduling, and approval by the proper authorities.", 'category' => "Cross-Enrollment and Petitioned Courses"],
            ['question' => "Does submitting a petition guarantee that the class will be opened?", 'answer' => "No. A petition is a request and remains subject to evaluation and approval.", 'category' => "Cross-Enrollment and Petitioned Courses"],

            // F. ACADEMIC LOAD, OVERLOAD, AND COURSE SCHEDULING
            ['question' => "How many units may I enroll in?", 'answer' => "During a regular semester, students should follow the academic load prescribed in their approved curriculum or study program. During the mid-term, a student may enroll in a maximum of nine (9) units. A graduating student may be allowed a higher mid-term load, but it must not exceed twelve (12) units.", 'category' => "Academic Load, Overload, and Course Scheduling"],
            ['question' => "Can I request an overload?", 'answer' => "Yes, subject to University rules and approval. A student may be allowed an overload of not more than six (6) units provided that the student has a GPA of not lower than 2.25 in all courses taken. A senior student may be allowed an extra load of not more than six (6) units of courses specified in the degree program, regardless of GPA. University and college scholars may likewise carry an extra load of not more than six (6) units. Students who are scholastically delinquent are not allowed to carry an overload. Requests for overload must be made using the prescribed form issued by the Office of Admissions.", 'category' => "Academic Load, Overload, and Course Scheduling"],
            ['question' => "Can a graduating student automatically take an overload?", 'answer' => "A graduating student may be permitted to carry an extra load of not more than nine (9) units, subject to the University's prescribed overload procedure and applicable academic policies.", 'category' => "Academic Load, Overload, and Course Scheduling"],
            ['question' => "What should I do if two required subjects have conflicting schedules?", 'answer' => "Immediately consult your academic adviser, department, and/or the CED Registrar's Office. Students should not independently choose arrangements that are inconsistent with official schedules and enrollment policies.", 'category' => "Academic Load, Overload, and Course Scheduling"],

            // G. INC, COMPLETION, AND GRADES
            ['question' => "What does INC mean?", 'answer' => "INC means Incomplete and may be given under circumstances allowed by university academic policies when a student has not completed certain course requirements.", 'category' => "INC, Completion, and Grades"],
            ['question' => "How do I complete an INC?", 'answer' => "The student must comply with the required academic work and follow the university's official completion procedure within the period prescribed by university policy.", 'category' => "INC, Completion, and Grades"],
            ['question' => "Can I complete an INC anytime?", 'answer' => "No. An INC must be completed within the period allowed by university rules. Students are encouraged to process completion requirements as early as possible.", 'category' => "INC, Completion, and Grades"],
            ['question' => "What happens if my INC has already lapsed?", 'answer' => "Once the prescribed completion period has expired, the case will be handled according to the applicable university policy. The CED Registrar's Office may assist in verifying the academic situation, but the student must comply with official university procedures.", 'category' => "INC, Completion, and Grades"],
            ['question' => "Can the College Registrar change my grade?", 'answer' => "No. The College Registrar does not independently change grades. Grade changes or corrections must follow official university procedures and must originate from or be supported by the authorized faculty member and approving authorities.", 'category' => "INC, Completion, and Grades"],
            ['question' => "What should I do if I believe my grade was encoded incorrectly?", 'answer' => "Contact your instructor or department first. Any correction must follow the official grade correction process.", 'category' => "INC, Completion, and Grades"],

            // H. LEAVE OF ABSENCE, READMISSION, AND REACTIVATION
            ['question' => "What is a Leave of Absence (LOA)?", 'answer' => "A Leave of Absence is an officially approved temporary interruption of a student's studies subject to university policies and procedures.", 'category' => "Leave of Absence, Readmission, and Reactivation"],
            ['question' => "Can I simply stop attending classes without filing a Leave of Absence?", 'answer' => "No. Students who need to temporarily discontinue their studies should follow the official university procedure to avoid academic and enrollment complications.", 'category' => "Leave of Absence, Readmission, and Reactivation"],
            ['question' => "I previously went on Leave of Absence. How can I return?", 'answer' => "Students returning from LOA should follow the university's readmission or reactivation procedure and coordinate with the appropriate offices before enrollment.", 'category' => "Leave of Absence, Readmission, and Reactivation"],
            ['question' => "Can I process an INC while on LOA?", 'answer' => "This depends on the status of the INC, the applicable completion period, and existing university policies. The student should have the record evaluated before proceeding.", 'category' => "Leave of Absence, Readmission, and Reactivation"],
            ['question' => "What is readmission?", 'answer' => "Readmission refers to the formal process required for a student who has stopped studying or whose enrollment status requires approval before returning to the university.", 'category' => "Leave of Absence, Readmission, and Reactivation"],

            // I. ADDING, DROPPING, AND CHANGING SUBJECTS
            ['question' => "Can I add or change a subject after enrollment?", 'answer' => "Adding or changing courses may only be done within the official period and following the prescribed university procedures.", 'category' => "Adding, Dropping, and Changing Subjects"],
            ['question' => "Can I drop a subject anytime?", 'answer' => "No. Dropping of courses is subject to university deadlines, procedures, and academic policies.", 'category' => "Adding, Dropping, and Changing Subjects"],
            ['question' => "What happens if I stop attending a class without officially dropping it?", 'answer' => "Failure to officially process the dropping of a course may have academic consequences based on university policy.", 'category' => "Adding, Dropping, and Changing Subjects"],

            // J. GRADUATION AND ACADEMIC EVALUATION
            ['question' => "Who determines if I am already qualified to graduate?", 'answer' => "Graduation eligibility is determined through official academic evaluation based on completion of curriculum requirements and university graduation policies.", 'category' => "Graduation and Academic Evaluation"],
            ['question' => "Can the CED Registrar's Office help check my remaining subjects?", 'answer' => "Yes. The office may assist in reviewing curriculum requirements and identifying possible academic deficiencies, subject to verification against official university records.", 'category' => "Graduation and Academic Evaluation"],
            ['question' => "Does having no remaining classes automatically mean I am cleared for graduation?", 'answer' => "Not necessarily. Graduation may also require completion of other academic, administrative, and institutional requirements.", 'category' => "Graduation and Academic Evaluation"],
            ['question' => "Where should I process official graduation documents?", 'answer' => "Official graduation-related records and documents should be processed through the offices designated by the university.", 'category' => "Graduation and Academic Evaluation"],
            ['question' => "Where can I ask about Latin honors or other academic distinctions?", 'answer' => "Eligibility for academic honors is determined according to the current university academic policies and Student Handbook. Students may inquire with the CED Registrar's Office for guidance, but final evaluation follows official university procedures.", 'category' => "Graduation and Academic Evaluation"],

            // K. STUDENT RECORDS AND DATA PRIVACY
            ['question' => "Can the CED Registrar's Office give my academic information to another person?", 'answer' => "Student information is protected and should only be disclosed in accordance with university policies, the Data Privacy Act, and appropriate authorization.", 'category' => "Student Records and Data Privacy"],
            ['question' => "Can my parent or guardian request my academic information?", 'answer' => "Access to student information is subject to applicable privacy rules, university policies, and appropriate authorization.", 'category' => "Student Records and Data Privacy"],
            ['question' => "Why am I required to provide identification for some requests?", 'answer' => "Identity verification helps protect academic records and personal information from unauthorized access.", 'category' => "Student Records and Data Privacy"],
            ['question' => "Can I submit another student's request using my account?", 'answer' => "No. Users should only submit requests using their own account unless they are formally authorized to act on behalf of another person.", 'category' => "Student Records and Data Privacy"],
            ['question' => "What should I do if my personal information in the system is incorrect?", 'answer' => "Report the error immediately. Changes involving official university records may require supporting documents and processing through the office authorized to maintain the official record.", 'category' => "Student Records and Data Privacy"],

            // L. REFERRALS TO OTHER OFFICES
            ['question' => "What if my concern is not handled by the CED Registrar's Office?", 'answer' => "The office will provide guidance and, when appropriate, refer you to the university office responsible for the transaction.", 'category' => "Referrals to Other Offices"],
            ['question' => "Where should I request my TOR, Diploma, Certificate of Enrollment, or other official academic records?", 'answer' => "These should be coordinated with the Office of Admissions or the appropriate university office responsible for official student records.", 'category' => "Referrals to Other Offices"],
            ['question' => "Where should I inquire about payments, assessment, or refunds?", 'answer' => "The CED Registrar's Office does not process payments. Financial concerns should be directed to the appropriate university accounting, cashier, or finance office.", 'category' => "Referrals to Other Offices"],
            ['question' => "Can the CED Registrar's Office fill out external verification forms from foreign institutions or credential evaluators?", 'answer' => "The office may provide a standard certification for information it is authorized and able to verify. External forms requiring official university records may need to be processed by the Office of Admissions or another authorized university office.", 'category' => "Referrals to Other Offices"],
            ['question' => "What should I do if I am unsure which office handles my concern?", 'answer' => "You may submit an inquiry through the CED Registrar system. The office can identify whether the concern falls within its authority or direct you to the appropriate university office.", 'category' => "Referrals to Other Offices"],
        ];

        foreach ($defaultFaqs as $index => $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'category' => $faq['category'],
                    'sort_order' => $index + 1,
                ],
            );
        }

    }
}
