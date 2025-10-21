import React from 'react'
import ContentModal from '../../../../components/Modal/ContentModal'

interface PrivacyPolicyModalProps {
  show: boolean
  onHide: () => void
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ show, onHide }) => {
  return (
    <ContentModal
      show={show}
      onHide={onHide}
      title="Privacy Policy"
      size="xl"
      closeText="I Understand"
    >
      <div className="privacy-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <p className="mb-6">
          This Privacy Policy describes how we collect, use, disclose, and protect your personal 
          information when you use our educational platform. We are committed to protecting your 
          privacy and ensuring transparency in how we handle your data.
        </p>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">1. Information We Collect</h5>
          
          <h6 className="fw-semibold mb-2">1.1 Information You Provide</h6>
          <p className="mb-3">When you create an account or use our services, we collect:</p>
          <ul className="mb-4">
            <li>Name and email address</li>
            <li>Profile information (optional photo, bio)</li>
            <li>Educational role (student, teacher, parent)</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Communications you send to us</li>
          </ul>

          <h6 className="fw-semibold mb-2">1.2 Information Collected Automatically</h6>
          <p className="mb-3">When you use our platform, we automatically collect:</p>
          <ul className="mb-4">
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Learning activity (exercises completed, videos watched, progress data)</li>
            <li>Device information (browser type, operating system, IP address)</li>
            <li>Log data (access times, error logs, performance metrics)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h6 className="fw-semibold mb-2">1.3 Information from Third Parties</h6>
          <p className="mb-3">We may receive information from:</p>
          <ul>
            <li>Social login providers (e.g., Google) when you sign in through them</li>
            <li>Schools or institutions that create accounts for their students</li>
            <li>Analytics and service providers that help us improve our platform</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">2. How We Use Your Information</h5>
          <p className="mb-3">We use the information we collect to:</p>
          <ul>
            <li><strong>Provide our services:</strong> Enable account creation, authentication, and access to educational content</li>
            <li><strong>Personalize learning:</strong> Tailor content recommendations and learning paths based on your progress</li>
            <li><strong>Track progress:</strong> Monitor and display your learning achievements and performance analytics</li>
            <li><strong>Process payments:</strong> Handle subscription billing and payment processing</li>
            <li><strong>Communicate with you:</strong> Send important updates, notifications, and respond to your inquiries</li>
            <li><strong>Improve our platform:</strong> Analyze usage patterns to enhance features and user experience</li>
            <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
            <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">3. How We Share Your Information</h5>
          <p className="mb-3">We may share your information in the following circumstances:</p>
          
          <h6 className="fw-semibold mb-2">3.1 Within Your School or Institution</h6>
          <p className="mb-3">
            If you're enrolled through a school, your teachers and administrators may access your 
            learning data, progress, and performance to support your education.
          </p>

          <h6 className="fw-semibold mb-2">3.2 With Service Providers</h6>
          <p className="mb-3">
            We work with trusted third-party service providers who help us operate our platform, 
            including:
          </p>
          <ul className="mb-4">
            <li>Cloud hosting and storage providers</li>
            <li>Payment processors</li>
            <li>Analytics services</li>
            <li>Customer support tools</li>
            <li>Email delivery services</li>
          </ul>

          <h6 className="fw-semibold mb-2">3.3 For Legal Reasons</h6>
          <p className="mb-3">We may disclose your information when required by law or to:</p>
          <ul className="mb-4">
            <li>Comply with legal obligations, court orders, or government requests</li>
            <li>Enforce our Terms and Conditions</li>
            <li>Protect our rights, property, or safety, or that of our users</li>
            <li>Prevent fraud or security threats</li>
          </ul>

          <h6 className="fw-semibold mb-2">3.4 Business Transfers</h6>
          <p className="mb-3">
            If we are involved in a merger, acquisition, or sale of assets, your information may 
            be transferred as part of that transaction.
          </p>

          <p className="alert alert-info">
            <i className="fas fa-shield-alt me-2"></i>
            <strong>We do not sell your personal information to third parties for marketing purposes.</strong>
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">4. Cookies and Tracking Technologies</h5>
          <p className="mb-3">
            We use cookies and similar technologies to enhance your experience and collect information 
            about how you use our platform.
          </p>

          <h6 className="fw-semibold mb-2">Types of Cookies We Use:</h6>
          <ul className="mb-3">
            <li><strong>Essential cookies:</strong> Required for the platform to function properly</li>
            <li><strong>Performance cookies:</strong> Help us understand how users interact with our platform</li>
            <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytics cookies:</strong> Collect data about usage patterns and performance</li>
          </ul>

          <p className="mb-3">
            You can control cookies through your browser settings. However, disabling certain cookies 
            may affect the functionality of our platform.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">5. Data Security</h5>
          <p className="mb-3">
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul className="mb-3">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Employee training on data protection practices</li>
            <li>Incident response and breach notification procedures</li>
          </ul>
          <p className="mb-3">
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">6. Data Retention</h5>
          <p className="mb-3">
            We retain your personal information for as long as necessary to:
          </p>
          <ul>
            <li>Provide our services and maintain your account</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce our agreements</li>
            <li>Support legitimate business purposes</li>
          </ul>
          <p className="mt-3">
            When you delete your account, we will delete or anonymize your personal information within 
            a reasonable timeframe, unless we are required to retain it for legal purposes.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">7. Your Privacy Rights</h5>
          <p className="mb-3">Depending on your location, you may have the following rights:</p>
          
          <ul className="mb-3">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Objection:</strong> Object to certain processing of your information</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            <li><strong>Withdraw consent:</strong> Withdraw previously given consent at any time</li>
          </ul>

          <p className="mb-3">
            To exercise these rights, please contact us through your account settings or via our 
            support channels. We will respond to your request within the timeframe required by 
            applicable law.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">8. Children's Privacy</h5>
          <p className="mb-3">
            Our platform may be used by students of all ages, including those under 13 (or applicable 
            age in your jurisdiction). We comply with applicable children's privacy laws, including 
            COPPA (Children's Online Privacy Protection Act) in the United States.
          </p>
          <p className="mb-3">
            For users under the applicable age:
          </p>
          <ul>
            <li>We require parental or school consent before collecting personal information</li>
            <li>We collect only information necessary to provide educational services</li>
            <li>Parents and schools can review and delete their child's information</li>
            <li>We do not enable public profiles or direct messaging for young users</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">9. International Data Transfers</h5>
          <p className="mb-3">
            Your information may be transferred to and processed in countries other than your country 
            of residence. These countries may have different data protection laws than your jurisdiction.
          </p>
          <p className="mb-3">
            When we transfer data internationally, we ensure appropriate safeguards are in place, such as:
          </p>
          <ul>
            <li>Standard contractual clauses approved by regulatory authorities</li>
            <li>Adequacy decisions recognizing equivalent data protection</li>
            <li>Other legally compliant transfer mechanisms</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">10. Third-Party Links and Services</h5>
          <p className="mb-3">
            Our platform may contain links to third-party websites, services, or content. We are not 
            responsible for the privacy practices of these third parties. We encourage you to review 
            their privacy policies before providing any personal information.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">11. California Privacy Rights (CCPA)</h5>
          <p className="mb-3">
            If you are a California resident, you have additional rights under the California Consumer 
            Privacy Act (CCPA):
          </p>
          <ul>
            <li>Right to know what personal information is collected, used, and shared</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we don't sell your data)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">12. European Privacy Rights (GDPR)</h5>
          <p className="mb-3">
            If you are located in the European Economic Area (EEA), UK, or Switzerland, you have rights 
            under the General Data Protection Regulation (GDPR), including:
          </p>
          <ul>
            <li>Legal bases for processing (consent, contract, legitimate interest)</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
            <li>Data protection impact assessments for high-risk processing</li>
            <li>Designated data protection officer (if applicable)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">13. Changes to This Privacy Policy</h5>
          <p className="mb-3">
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            technology, legal requirements, or other factors. We will notify you of material changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our platform</li>
            <li>Sending you an email notification</li>
            <li>Displaying a prominent notice on our platform</li>
          </ul>
          <p className="mt-3">
            Your continued use of our platform after changes become effective constitutes your 
            acceptance of the revised Privacy Policy.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">14. Contact Us</h5>
          <p className="mb-3">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data 
            practices, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@yourplatform.com</li>
            <li><strong>Support:</strong> Through the "Contact Us" link on our platform</li>
            <li><strong>Mail:</strong> [Your Company Address]</li>
          </ul>
          <p className="mt-3">
            We will respond to your inquiry within a reasonable timeframe as required by applicable law.
          </p>
        </section>

        <div className="alert alert-primary mt-6">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Your Privacy Matters:</strong> We are committed to protecting your privacy and 
          being transparent about our data practices. By using our platform, you acknowledge that 
          you have read and understood this Privacy Policy.
        </div>
      </div>
    </ContentModal>
  )
}

export default PrivacyPolicyModal

