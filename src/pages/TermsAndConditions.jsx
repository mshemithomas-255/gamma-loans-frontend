// src/components/TermsAndConditions.jsx
import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        Loan Application Terms and Conditions
      </h1>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">1. Eligibility</h2>
        <p>
          To apply for a loan, you must meet the following eligibility criteria:
        </p>
        <ul className="list-disc pl-6">
          <li>Be at least 18 years old.</li>
          <li>Be a legal resident of Kenya.</li>
          <li>
            Have a valid identification document (e.g., passport, driver's
            license, etc.).
          </li>
          <li>Have a verifiable source of income.</li>
        </ul>
        <p>
          If you do not meet these criteria, your loan application will not be
          processed.
        </p>

        <h2 className="text-2xl font-semibold">2. Loan Application</h2>
        <p>By submitting an application for a loan, you:</p>
        <ul className="list-disc pl-6">
          <li>
            Confirm that all information provided is accurate, complete, and up
            to date.
          </li>
          <li>
            Agree to undergo a credit assessment and authorize us to check your
            credit history.
          </li>
          <li>
            Understand that providing false or misleading information may result
            in rejection of your application.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">3. Loan Terms</h2>
        <p>
          The terms of the loan, including the loan amount, interest rate,
          repayment schedule, and fees, will be provided to you upon approval.
          By accepting the loan, you agree to the following:
        </p>
        <ul className="list-disc pl-6">
          <li>
            <strong>Loan Amount:</strong> The total loan amount will be
            determined based on your application.
          </li>
          <li>
            <strong>Interest Rate:</strong> The interest rate will be specified
            at the time of approval.
          </li>
          <li>
            <strong>Repayment Terms:</strong> You must repay the loan in full
            within the agreed time frame.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">4. Fees and Charges</h2>
        <ul className="list-disc pl-6">
          <li>
            <strong>Application Fee:</strong> [If applicable, insert fee
            information].
          </li>
          <li>
            <strong>Late Fees:</strong> A late fee of [insert amount or
            percentage] may be charged if your payment is late.
          </li>
          <li>
            <strong>Other Fees:</strong> Any additional fees will be outlined in
            your loan agreement.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">5. Repayment</h2>
        <p>
          Repayments are due in accordance with the agreed repayment schedule.
          Failure to repay may result in penalties, additional fees, and legal
          action.
        </p>

        <h2 className="text-2xl font-semibold">6. Loan Default</h2>
        <p>
          Failure to repay the loan according to the agreed terms may result in:
        </p>
        <ul className="list-disc pl-6">
          <li>Additional charges and fees.</li>
          <li>A negative impact on your credit score.</li>
          <li>
            Collection efforts, including third-party collection agencies.
          </li>
          <li>Legal action to recover the outstanding balance.</li>
        </ul>

        <h2 className="text-2xl font-semibold">7. Personal Information</h2>
        <p>
          By applying for a loan, you consent to the collection, use, and
          sharing of your personal and financial information as necessary to
          process your application and manage your loan account.
        </p>

        <h2 className="text-2xl font-semibold">
          8. Cancellation and Early Repayment
        </h2>
        <ul className="list-disc pl-6">
          <li>
            You may cancel the loan agreement within [insert period] days of
            approval without penalty.
          </li>
          <li>
            Early repayment of the loan is permitted without penalty, but any
            outstanding fees must still be paid.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">9. Amendments</h2>
        <p>
          We reserve the right to amend these terms and conditions at any time.
          Any changes will be communicated to you, and your continued use of the
          Services after the amendments will be considered your acceptance of
          the new terms.
        </p>

        <h2 className="text-2xl font-semibold">10. Dispute Resolution</h2>
        <p>
          If a resolution cannot be reached, the dispute may be settled through
          [arbitration/mediation] as specified in the loan agreement.
        </p>

        <h2 className="text-2xl font-semibold">11. Governing Law</h2>
        <p>This Agreement shall be governed by the laws of [jurisdiction].</p>

        <h2 className="text-2xl font-semibold">12. Contact Information</h2>
        <p>For any questions or concerns, please contact us at:</p>
        <p>J&H LTD.</p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
