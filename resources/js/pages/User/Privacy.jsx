import InfoPageLayout from '@/Components/InfoPageLayout';
import Section from '@/Components/Section';
import Bullet from '@/Components/Bullet';

export default function Privacy({ userRole }) {
    return (
        <InfoPageLayout
            title="Privacy Policy"
            description="How we collect, use, and protect your information."
            userRole={userRole}
        >
            <div className="text-slate-600 leading-relaxed">
                <p className="text-lg text-slate-700 mb-10">
                    CED E-Services ("we," "our," or "us") operates the website and online services for processing
                    document requests and scheduling meetings. This Privacy Policy outlines how we collect, use, and
                    protect your information when you access or use our platform.
                </p>

                <Section title="1. Information We Collect">
                    <p className="mb-4">We collect personal information that you directly provide when submitting requests or scheduling appointments:</p>
                    <ul className="space-y-2.5">
                        <Bullet><strong className="text-slate-800">Contact Information:</strong> Full name, email address, phone number, and physical mailing address (if physical document delivery is required).</Bullet>
                        <Bullet><strong className="text-slate-800">Identification Details:</strong> Student, employee, or reference numbers necessary to verify your record for document issuance.</Bullet>
                        <Bullet><strong className="text-slate-800">Appointment Details:</strong> Date, time, reason for meeting, and any supporting notes submitted during registration.</Bullet>
                        <Bullet><strong className="text-slate-800">Technical Data:</strong> IP address, browser type, and standard server log data collected automatically when accessing the site.</Bullet>
                    </ul>
                </Section>

                <Section title="2. How We Use Your Information">
                    <p className="mb-4">Your data is used strictly for administrative and operational purposes, including:</p>
                    <ul className="space-y-2.5">
                        <Bullet>Processing, issuing, and verifying your requested official documents.</Bullet>
                        <Bullet>Confirming, rescheduling, or managing your requested meeting slots.</Bullet>
                        <Bullet>Sending system notifications, status updates, and administrative reminders.</Bullet>
                        <Bullet>Maintaining system security and preventing unauthorized access.</Bullet>
                    </ul>
                </Section>

                <Section title="3. Sharing and Disclosure">
                    <p className="mb-4">We do not sell, rent, or trade your personal information. We may share data under the following conditions:</p>
                    <ul className="space-y-2.5">
                        <Bullet><strong className="text-slate-800">Authorized Staff:</strong> Internal administrators and officials responsible for fulfilling document requests or attending meetings.</Bullet>
                        <Bullet><strong className="text-slate-800">Legal Requirements:</strong> When required by applicable laws, regulations, or lawful court orders.</Bullet>
                    </ul>
                </Section>

                <Section title="4. Data Security & Retention">
                    <p>We implement security measures designed to safeguard your personal records against unauthorized disclosure, alteration, or access. Your data is retained only for as long as necessary to fulfill document requests, record-keeping requirements, or legal compliance.</p>
                </Section>

                <Section title="5. Your Rights">
                    <p>Depending on applicable local regulations, you have the right to request access to, correction of, or deletion of your personal data maintained on our platform, subject to identity verification and valid record-keeping obligations.</p>
                </Section>
            </div>
        </InfoPageLayout>
    );
}