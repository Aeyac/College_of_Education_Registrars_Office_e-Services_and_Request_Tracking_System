import InfoPageLayout from '@/Components/InfoPageLayout';
import Section from '@/Components/Section';
import Bullet from '@/Components/Bullet';

export default function Terms({ userRole }) {
    return (
        <InfoPageLayout
            title="Terms of Service"
            description="Rules and guidelines for using the CED E-Services platform."
            userRole={userRole}
        >
            <div className="text-slate-600 leading-relaxed">
                <p className="text-lg text-slate-700 mb-10">
                    By accessing or using the CED E-Services platform, you agree to comply with and be bound by the
                    following Terms and Conditions.
                </p>

                <Section title="1. Services Provided">
                    <p className="mb-4">CED E-Services provides an online system allowing users to:</p>
                    <ul className="space-y-2.5">
                        <Bullet>Submit official requests for documents.</Bullet>
                        <Bullet>Schedule appointments or meetings with designated representatives.</Bullet>
                    </ul>
                </Section>

                <Section title="2. User Responsibilities">
                    <p className="mb-4">By submitting any request or scheduling an appointment, you agree that:</p>
                    <ul className="space-y-2.5">
                        <Bullet><strong className="text-slate-800">Accuracy:</strong> All information, identifiers, and supporting details you provide are accurate, truthful, and complete.</Bullet>
                        <Bullet><strong className="text-slate-800">Identity Verification:</strong> You are requesting documents or appointments only for yourself or as an authorized representative. Providing fraudulent or misleading information may result in cancellation of requests and reporting to relevant authorities.</Bullet>
                        <Bullet><strong className="text-slate-800">Account Security:</strong> You are responsible for keeping any registration reference numbers or login credentials confidential.</Bullet>
                    </ul>
                </Section>

                <Section title="3. Document Requests & Processing">
                    <ul className="space-y-2.5">
                        <Bullet>Processing times for requested documents may vary depending on availability, administrative verification, or peak schedules.</Bullet>
                        <Bullet>Submitting a request does not guarantee immediate document release if prerequisites, clearance, or fees (if applicable) are not met.</Bullet>
                    </ul>
                </Section>

                <Section title="4. Meeting Scheduling & Attendance">
                    <ul className="space-y-2.5">
                        <Bullet>Scheduled appointments are subject to administrative availability and confirmation.</Bullet>
                        <Bullet>Users are expected to arrive on time for scheduled meetings. Missed appointments may require rescheduling through the system.</Bullet>
                        <Bullet>CED E-Services reserves the right to reschedule or cancel appointments due to unexpected operational changes.</Bullet>
                    </ul>
                </Section>

                <Section title="5. Prohibited Activities">
                    <p className="mb-4">Users must not:</p>
                    <ul className="space-y-2.5">
                        <Bullet>Use the site to submit false, malicious, or spam requests.</Bullet>
                        <Bullet>Attempt to gain unauthorized access to site infrastructure, databases, or other users' data.</Bullet>
                        <Bullet>Interfere with the proper operation of the registration service.</Bullet>
                    </ul>
                </Section>

                <Section title="6. Limitation of Liability">
                    <p>CED E-Services is provided on an "as is" and "as available" basis. We are not liable for delays, temporary downtime, or service disruptions caused by technical failures, incomplete user information, or external events beyond our control.</p>
                </Section>

                <Section title="7. Changes to Terms">
                    <p>We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the modified terms.</p>
                </Section>
            </div>
        </InfoPageLayout>
    );
}