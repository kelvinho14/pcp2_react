import React from 'react'
import ContentModal from '../../../../components/Modal/ContentModal'

interface TermsModalProps {
  show: boolean
  onHide: () => void
}

const TermsModal: React.FC<TermsModalProps> = ({ show, onHide }) => {
  return (
    <ContentModal
      show={show}
      onHide={onHide}
      title="Terms and Conditions"
      size="xl"
      closeText="I Understand"
    >
      <div className="terms-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        
        <section className="mb-6">
          <h5 className="fw-bold mb-3">1. Introduction</h5>
          <p>
            Welcome to our educational platform. These Terms and Conditions govern your use of our 
            services and by accessing or using our platform, you agree to be bound by these terms. 
            Please read them carefully before using our services.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">2. Acceptance of Terms</h5>
          <p>
            By creating an account, accessing, or using any part of our platform, you acknowledge 
            that you have read, understood, and agree to be bound by these Terms and Conditions, 
            including our Privacy Policy. If you do not agree to these terms, please do not use 
            our services.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">3. User Accounts and Responsibilities</h5>
          <p className="mb-2">
            <strong>3.1 Account Creation:</strong> You must provide accurate and complete information 
            when creating your account.
          </p>
          <p className="mb-2">
            <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality 
            of your account credentials and for all activities that occur under your account.
          </p>
          <p className="mb-2">
            <strong>3.3 Acceptable Use:</strong> You agree to use the platform only for lawful purposes 
            and in accordance with these terms. You must not:
          </p>
          <ul>
            <li>Share or distribute your account credentials with others</li>
            <li>Use the platform to cheat or violate academic integrity</li>
            <li>Upload malicious software or harmful content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Attempt to gain unauthorized access to the platform</li>
            <li>Copy, reproduce, or redistribute platform content without permission</li>
          </ul>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">4. Educational Services</h5>
          <p className="mb-2">
            <strong>4.1 Service Provision:</strong> We provide educational tools, video lessons, 
            exercises, progress tracking, and other learning materials. The availability of specific 
            features may vary based on your subscription plan.
          </p>
          <p className="mb-2">
            <strong>4.2 Content Accuracy:</strong> While we strive to provide accurate and up-to-date 
            educational content, we do not guarantee its completeness or suitability for specific 
            purposes. Users should verify critical information.
          </p>
          <p className="mb-2">
            <strong>4.3 No Guarantee of Results:</strong> We cannot guarantee specific learning 
            outcomes or academic improvements. Educational success depends on many factors including 
            student effort and engagement.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">5. Intellectual Property Rights</h5>
          <p className="mb-2">
            <strong>5.1 Platform Content:</strong> All content, including but not limited to text, 
            graphics, videos, logos, software, and data compilations, is the property of our platform 
            or our licensors and is protected by intellectual property laws.
          </p>
          <p className="mb-2">
            <strong>5.2 User Content:</strong> You retain ownership of content you create or submit 
            (e.g., exercise answers, uploaded documents). By submitting content, you grant us a 
            non-exclusive, worldwide license to use, display, and process it to provide our services.
          </p>
          <p className="mb-2">
            <strong>5.3 Restrictions:</strong> You may not copy, modify, distribute, sell, or create 
            derivative works from our content without explicit written permission.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">6. Payment and Subscriptions</h5>
          <p className="mb-2">
            <strong>6.1 Fees:</strong> Certain features require a paid subscription. All fees are 
            stated clearly before purchase and are non-refundable except as required by law.
          </p>
          <p className="mb-2">
            <strong>6.2 Billing:</strong> Subscriptions automatically renew unless cancelled before 
            the renewal date. You authorize us to charge your payment method for renewal fees.
          </p>
          <p className="mb-2">
            <strong>6.3 Cancellation:</strong> You may cancel your subscription at any time through 
            your account settings. Cancellation takes effect at the end of the current billing period.
          </p>
          <p className="mb-2">
            <strong>6.4 Price Changes:</strong> We reserve the right to modify subscription prices 
            with at least 30 days' notice. Continued use after price changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">7. Privacy and Data Protection</h5>
          <p>
            Your privacy is important to us. Our collection, use, and protection of your personal 
            information is governed by our Privacy Policy. By using our platform, you consent to 
            our data practices as described in that policy.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">8. Limitation of Liability</h5>
          <p className="mb-2">
            To the maximum extent permitted by law, we shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul>
            <li>Loss of data or information</li>
            <li>Loss of profits or revenue</li>
            <li>Service interruptions or technical failures</li>
            <li>Academic performance or examination results</li>
            <li>Errors or inaccuracies in content</li>
          </ul>
          <p className="mt-3">
            Our total liability shall not exceed the amount you paid for the service in the 
            12 months preceding the claim.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">9. Service Modifications and Termination</h5>
          <p className="mb-2">
            <strong>9.1 Service Changes:</strong> We reserve the right to modify, suspend, or 
            discontinue any part of our services at any time, with or without notice.
          </p>
          <p className="mb-2">
            <strong>9.2 Account Termination:</strong> We may suspend or terminate your account if 
            you violate these terms or engage in fraudulent, abusive, or illegal activities.
          </p>
          <p className="mb-2">
            <strong>9.3 Data Retention:</strong> Upon account termination, we may retain certain 
            data as required by law or for legitimate business purposes.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">10. Third-Party Services</h5>
          <p>
            Our platform may integrate with or link to third-party services (e.g., Google Sign-In, 
            payment processors). We are not responsible for the content, privacy practices, or 
            availability of these third-party services. Your use of them is subject to their own 
            terms and conditions.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">11. Disclaimers</h5>
          <p>
            THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT 
            WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">12. Changes to Terms</h5>
          <p>
            We may update these Terms and Conditions from time to time. We will notify you of 
            material changes via email or through the platform. Your continued use after such 
            changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">13. Governing Law and Disputes</h5>
          <p className="mb-2">
            <strong>13.1 Governing Law:</strong> These terms shall be governed by and construed in 
            accordance with the laws of your jurisdiction, without regard to conflict of law provisions.
          </p>
          <p className="mb-2">
            <strong>13.2 Dispute Resolution:</strong> Any disputes arising from these terms or your 
            use of the platform shall first be attempted to be resolved through good faith negotiations. 
            If unsuccessful, disputes may be submitted to binding arbitration or the courts as 
            appropriate under local law.
          </p>
        </section>

        <section className="mb-6">
          <h5 className="fw-bold mb-3">14. Contact Information</h5>
          <p>
            If you have any questions about these Terms and Conditions, please contact us through 
            the "Contact Us" link or via email at your support email address.
          </p>
        </section>

        <section className="mb-4">
          <h5 className="fw-bold mb-3">15. Severability</h5>
          <p>
            If any provision of these terms is found to be unenforceable or invalid, that provision 
            shall be limited or eliminated to the minimum extent necessary, and the remaining 
            provisions shall remain in full force and effect.
          </p>
        </section>

        <div className="alert alert-info mt-6">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Important:</strong> By using our platform, you acknowledge that you have read, 
          understood, and agree to be bound by these Terms and Conditions.
        </div>
      </div>
    </ContentModal>
  )
}

export default TermsModal

