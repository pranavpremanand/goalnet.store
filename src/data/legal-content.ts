import type { LegalDocument } from "@/components/pages/legal/LegalPage";

export const shippingPolicy: LegalDocument = {
  title: "Shipping & Delivery Policy",
  intro: [
    "At GOALNET, we aim to make ordering your favourite football products simple and convenient. This policy explains our order processing, shipping charges and delivery procedures.",
  ],
  related: [
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Returns & Refunds Policy", href: "/returns-refunds" },
  ],
  sections: [
    { heading: "1. Delivery Coverage", blocks: [
      { type: "paragraph", text: "We aim to deliver to serviceable locations across India." },
      { type: "paragraph", text: "Delivery availability may depend on the destination and the courier service operating in that area. If a location cannot be served, we'll inform the customer where reasonably possible." },
    ] },
    { heading: "2. Shipping Charges", blocks: [
      { type: "paragraph", text: "Our standard shipping charge is ₹80 per order, subject to the parcel size, weight and delivery destination." },
      { type: "paragraph", text: "For orders containing multiple items, shipping is calculated based on the combined parcel and applicable courier charges. An additional shipping charge may apply where necessary. Any applicable charge will be communicated to the customer before the order is confirmed." },
      { type: "paragraph", text: "Shipping charges, if applicable, will be displayed separately at checkout." },
      { type: "paragraph", text: "Any free-shipping offer or promotional shipping rate will be subject to the conditions stated in that offer." },
    ] },
    { heading: "3. Order Processing Time", blocks: [
      { type: "paragraph", text: "Orders are generally processed within 2–3 business days after successful payment confirmation." },
      { type: "paragraph", text: "Processing time may vary due to:" },
      { type: "unordered-list", items: ["High order volumes.", "Product or size availability.", "Public holidays.", "Unforeseen operational delays."] },
      { type: "paragraph", text: "Order processing time is separate from the estimated delivery time." },
      { type: "paragraph", text: "If an unexpected delay materially affects your order, we'll make reasonable efforts to communicate the update." },
    ] },
    { heading: "4. Estimated Delivery Time", blocks: [
      { type: "paragraph", text: "The estimated delivery time is generally 5–10 business days after dispatch, depending on the destination and courier service." },
      { type: "paragraph", text: "This is an estimate, not a guaranteed delivery date. Remote locations, courier disruptions, weather conditions, public holidays and other circumstances outside our reasonable control may affect delivery." },
      { type: "paragraph", text: "The order's processing period is additional to the estimated transit period." },
    ] },
    { heading: "5. Order Confirmation", blocks: [
      { type: "paragraph", text: "After successful payment, customers should retain their order confirmation or transaction reference for future enquiries." },
      { type: "paragraph", text: "An order confirmation indicates that the order has been received. If an order cannot be fulfilled because of an availability or operational issue, we'll contact the customer to discuss the appropriate next steps." },
    ] },
    { heading: "6. Shipment Updates", blocks: [
      { type: "paragraph", text: "If shipment or tracking information is available, we'll share the relevant details through the contact information provided with the order." },
      { type: "paragraph", text: "Customers should ensure their phone number, email address and delivery address are accurate when placing an order." },
      { type: "paragraph", text: "Please contact us if you believe your shipment has been delayed beyond the expected delivery period." },
    ] },
    { heading: "7. Delivery Address and Contact Details", blocks: [
      { type: "paragraph", text: "Customers are responsible for providing complete and accurate delivery information." },
      { type: "paragraph", text: "If an address or contact detail needs to be corrected, contact us as soon as possible. Changes may not be possible after dispatch." },
      { type: "paragraph", text: "GOALNET cannot guarantee successful delivery where incorrect or incomplete information supplied by the customer prevents the courier from completing the delivery." },
      { type: "paragraph", text: "This provision does not exclude any rights a customer may have under applicable law." },
    ] },
    { heading: "8. Missed Delivery Attempts", blocks: [
      { type: "paragraph", text: "If a customer is unavailable at the time of delivery, the courier may attempt redelivery or provide further instructions, depending on its procedures." },
      { type: "paragraph", text: "Customers should respond to courier communications and follow any instructions provided." },
      { type: "paragraph", text: "If a parcel is returned to us after unsuccessful delivery, we'll contact the customer to discuss the available options. Any additional shipping charges will be communicated before a reshipment is arranged, where applicable and permitted by law." },
    ] },
    { heading: "9. Delayed, Lost or Damaged Shipments", blocks: [
      { type: "paragraph", text: "If your shipment appears delayed, lost or damaged during transit, please contact us with your order details." },
      { type: "paragraph", text: "We'll review the available shipment information and coordinate with the courier where appropriate." },
      { type: "paragraph", text: "If the product arrives damaged or incorrect, please refer to our Returns & Refunds Policy." },
    ] },
    { heading: "10. Contact Us", blocks: [
      { type: "paragraph", text: "For shipping and delivery enquiries: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Please include your order number and the email address or phone number associated with your order." },
    ] },
  ],
};

export const returnsPolicy: LegalDocument = {
  title: "Returns & Refunds Policy",
  intro: [
    "At GOALNET, we want customers to receive the products they ordered in the expected condition.",
    "Please read this policy before placing an order. It explains when a return or refund request may be accepted and how to contact us if something goes wrong.",
  ],
  related: [
    { label: "Shipping & Delivery Policy", href: "/shipping-policy" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
  ],
  sections: [
    { heading: "1. Eligible Return Situations", blocks: [
      { type: "paragraph", text: "Subject to verification and applicable consumer protection laws, we accept return or replacement requests for the following situations:" },
      { type: "subheading", text: "Wrong Product Delivered" },
      { type: "paragraph", text: "If you receive a product that differs from the product ordered, contact us within 48 hours of delivery." },
      { type: "paragraph", text: "We'll review the order details and the product received to determine whether an incorrect item was supplied." },
      { type: "subheading", text: "Product Received Damaged" },
      { type: "paragraph", text: "If your product arrives visibly damaged, contact us within 48 hours of delivery." },
      { type: "paragraph", text: "Please provide clear photographs and the requested unboxing evidence so we can assess the condition in which the product arrived." },
      { type: "subheading", text: "Manufacturing or Product Defects" },
      { type: "paragraph", text: "If you discover a product defect, contact us as soon as reasonably possible with photographs or videos showing the issue." },
      { type: "paragraph", text: "We'll assess the claim and determine the appropriate remedy in accordance with applicable law and the circumstances of the case." },
    ] },
    { heading: "2. Unboxing Video and Supporting Evidence", blocks: [
      { type: "paragraph", text: "To help us verify claims involving damaged or incorrect products, customers should record a continuous unboxing video before opening or removing the product from its original packaging." },
      { type: "paragraph", text: "Where possible, the video should clearly show:" },
      { type: "unordered-list", items: ["The unopened parcel and its condition.", "The shipping label, without publicly exposing unnecessary personal information.", "The opening of the parcel.", "The product received and any visible damage or discrepancy."] },
      { type: "paragraph", text: "Please retain the original packaging until the issue has been resolved." },
      { type: "paragraph", text: "We may also request photographs, order details or other reasonable information needed to investigate a claim." },
      { type: "paragraph", text: "Unboxing videos are strongly requested as evidence for damaged or incorrect deliveries. If a video is unavailable, we'll assess the other evidence and circumstances rather than treating the absence of a video as an automatic waiver of rights that cannot legally be excluded." },
      { type: "paragraph", text: "Providing evidence does not automatically guarantee approval. Each claim will be reviewed fairly, consistently and in accordance with applicable law." },
    ] },
    { heading: "3. Reporting Timeframe", blocks: [
      { type: "paragraph", text: "Please report a wrong or damaged delivery within 48 hours of receiving the parcel so that we can investigate the issue promptly." },
      { type: "paragraph", text: "Include:" },
      { type: "unordered-list", items: ["Your order number.", "A description of the issue.", "Clear photographs of the product and packaging.", "The unboxing video, if available."] },
      { type: "paragraph", text: "If you discover a defect that could not reasonably have been identified immediately upon delivery, contact us as soon as you discover it. Applicable statutory rights will not be excluded by this reporting timeframe." },
    ] },
    { heading: "4. Situations Not Normally Eligible for Returns", blocks: [
      { type: "paragraph", text: "Unless required by applicable law, returns are not normally accepted solely because:" },
      { type: "unordered-list", items: ["A customer changes their mind after ordering.", "A customer selects a size that doesn't fit as expected, despite receiving the size ordered.", "The customer no longer wants the product.", "The product has been used, washed, altered or damaged after delivery by the customer."] },
      { type: "paragraph", text: "Please consult our Size Guide and product information before ordering." },
      { type: "paragraph", text: "These conditions do not affect a customer's rights where the product is defective, misdescribed, incorrect or otherwise subject to a remedy under applicable law." },
    ] },
    { heading: "5. How to Request a Return", blocks: [
      { type: "paragraph", text: "To request assistance:" },
      { type: "ordered-list", items: ["Email contactgoalnet@gmail.com within the applicable reporting period.", "Use the subject line Return Request — [Order Number].", "Explain whether the product was incorrect, damaged or defective.", "Attach the available photographs, unboxing video and other supporting evidence.", "Wait for our response and instructions before sending anything back."] },
      { type: "paragraph", text: "Please do not send a product to an address that has not been provided or confirmed by our support team." },
    ] },
    { heading: "6. Review and Verification", blocks: [
      { type: "paragraph", text: "We'll review the order information and evidence provided." },
      { type: "paragraph", text: "Where necessary, we may request additional information to understand the issue. Claims that cannot be substantiated may be declined after a fair review, subject to applicable law." },
      { type: "paragraph", text: "We'll communicate the outcome and any next steps to the customer." },
    ] },
    { heading: "7. Replacement or Refund", blocks: [
      { type: "paragraph", text: "Where a claim is approved, our preferred resolution is:" },
      { type: "ordered-list", items: ["Replacement: We'll arrange a replacement if the appropriate product is available.", "Refund: If a replacement cannot reasonably be provided, we'll arrange a refund where appropriate.", "Other legally required remedies: Where applicable law provides a different or additional remedy, those rights will be respected."] },
      { type: "paragraph", text: "The available resolution will depend on the issue, product availability and applicable legal requirements." },
    ] },
    { heading: "8. Return Shipping Costs", blocks: [
      { type: "paragraph", text: "For an approved claim involving a wrong, damaged or defective product, GOALNET will cover reasonable return shipping costs where a return shipment is required." },
      { type: "paragraph", text: "Please contact us before arranging a return so we can provide instructions." },
      { type: "paragraph", text: "Customers should not incur return shipping costs without first contacting us, except where necessary to exercise a right available under applicable law." },
    ] },
    { heading: "9. Refund Processing", blocks: [
      { type: "paragraph", text: "Once a refund is approved, we'll communicate the refund method and expected processing timeframe." },
      { type: "paragraph", text: "Refunds will generally be made to the original payment method where supported by the payment provider. If that is not possible, we'll contact the customer to arrange an appropriate alternative, subject to applicable requirements." },
      { type: "paragraph", text: "The time taken for the amount to appear in the customer's account may depend on the payment provider or bank." },
      { type: "paragraph", text: "Any refund will include the amounts required to be refunded under applicable law." },
    ] },
    { heading: "10. Exchanges for Size or Preference", blocks: [
      { type: "paragraph", text: "Please review the Size Guide and product details carefully before placing an order." },
      { type: "paragraph", text: "Size exchanges or returns for preference-related reasons are not routinely offered. However, if the supplied product differs from the order or is otherwise eligible for a remedy under applicable law, please contact us." },
    ] },
    { heading: "11. Contact Us", blocks: [
      { type: "paragraph", text: "For return, replacement and refund enquiries: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Subject: Return Request — [Order Number]" },
      { type: "paragraph", text: "We'll review your request and guide you through the next steps." },
    ] },
  ],
};

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  intro: [
    "At GOALNET, we respect your privacy and take the protection of your personal information seriously.",
    "This Privacy Policy explains how we collect, use, store and share information when you visit our website, create an account, place an order or contact us through our available channels.",
    "By using our website, you acknowledge that you have had the opportunity to read this policy. Any consent required for specific processing activities will be obtained separately where applicable.",
  ],
  related: [{ label: "Terms & Conditions", href: "/terms" }],
  sections: [
    { heading: "1. Information We Collect", blocks: [
      { type: "paragraph", text: "Depending on how you use our services, we may collect the following information." },
      { type: "subheading", text: "Personal Information" },
      { type: "unordered-list", items: ["Name.", "Email address.", "Phone number.", "Shipping address.", "Billing address, where applicable."] },
      { type: "subheading", text: "Account Information" },
      { type: "paragraph", text: "If you create an account, we may process information associated with your account, such as your name, contact details and account preferences." },
      { type: "subheading", text: "Order Information" },
      { type: "paragraph", text: "We may collect and maintain:" },
      { type: "unordered-list", items: ["Products and sizes ordered.", "Order history.", "Order status.", "Delivery information.", "Customer support enquiries.", "Cancellation, return and refund records."] },
      { type: "subheading", text: "Payment Information" },
      { type: "paragraph", text: "Payments may be processed through third-party payment providers, such as Razorpay or Stripe, depending on the payment options available at checkout." },
      { type: "paragraph", text: "We may receive payment status, transaction references, payment method details and information necessary to reconcile or manage an order." },
      { type: "paragraph", text: "Your payment may be processed directly by the payment provider. We do not claim to store complete card details on our own systems unless this functionality is specifically implemented and disclosed." },
      { type: "paragraph", text: "Please refer to the relevant payment provider's privacy policy for information about its processing activities." },
      { type: "subheading", text: "Technical Information" },
      { type: "paragraph", text: "Depending on the website configuration, we or our service providers may collect technical information such as IP address, browser type, device information, website activity and diagnostic data." },
      { type: "paragraph", text: "Analytics and advertising technologies will be used only as configured on the website and subject to applicable consent and legal requirements." },
    ] },
    { heading: "2. How We Use Your Information", blocks: [
      { type: "paragraph", text: "We may use your information to:" },
      { type: "unordered-list", items: ["Create and manage customer accounts.", "Process and fulfil orders.", "Confirm successful payments.", "Arrange delivery.", "Respond to product availability enquiries.", "Handle customer service requests.", "Process eligible cancellations, returns and refunds.", "Prevent fraud and investigate suspicious transactions.", "Maintain website security.", "Improve website functionality and the shopping experience.", "Maintain records required for accounting, tax and legal compliance.", "Comply with lawful requests from competent authorities."] },
      { type: "paragraph", text: "We will not use your personal information for purposes incompatible with this policy or applicable law." },
    ] },
    { heading: "3. Payments and Third-Party Providers", blocks: [
      { type: "paragraph", text: "To accept online payments, our website may use third-party payment gateways, including Razorpay or Stripe, depending on the provider selected for the live website." },
      { type: "paragraph", text: "Payment providers may process information necessary to authenticate, authorise and complete transactions." },
      { type: "paragraph", text: "Their handling of personal information is governed by their respective policies and terms." },
      { type: "paragraph", text: "We do not control the independent privacy practices of third-party payment providers. Please review their applicable policies before using their services." },
    ] },
    { heading: "4. Cookies and Similar Technologies", blocks: [
      { type: "paragraph", text: "Our website may use cookies or similar technologies to support essential functions, maintain sessions, remember preferences and improve website performance." },
      { type: "paragraph", text: "If we enable analytics tools such as Google Analytics 4 or advertising tools such as Meta Pixel, these services may collect information about website usage or interactions, subject to their configuration and applicable requirements." },
      { type: "paragraph", text: "We will update this policy when such tools are implemented." },
      { type: "paragraph", text: "Where consent is required, non-essential tracking technologies will be activated only after the appropriate consent is obtained." },
      { type: "paragraph", text: "You may also be able to control cookies through your browser settings. Disabling certain cookies may affect website functionality." },
    ] },
    { heading: "5. When We Share Information", blocks: [
      { type: "paragraph", text: "We may share the information necessary to operate our services with:" },
      { type: "unordered-list", items: ["Payment providers that process transactions.", "Courier and delivery partners that fulfil shipments.", "Website hosting and technical service providers.", "Customer communication services, where used.", "Professional advisers, where reasonably necessary.", "Government authorities or other parties where disclosure is required or permitted by applicable law."] },
      { type: "paragraph", text: "We share only the information reasonably necessary for the relevant purpose, subject to applicable requirements." },
      { type: "paragraph", text: "We do not sell personal information to advertisers." },
    ] },
    { heading: "6. WhatsApp and Instagram Enquiries", blocks: [
      { type: "paragraph", text: "Customers may contact us through Instagram or WhatsApp for product availability, ordering assistance or related enquiries." },
      { type: "paragraph", text: "Information shared through these platforms may be processed by the relevant platform under its own privacy terms." },
      { type: "paragraph", text: "Please avoid sharing unnecessary sensitive personal information through social media messages." },
    ] },
    { heading: "7. Data Retention", blocks: [
      { type: "paragraph", text: "We retain personal information for as long as reasonably necessary to fulfil the purposes described in this policy, including order fulfilment, customer support, accounting, dispute resolution and legal compliance." },
      { type: "paragraph", text: "Retention periods may vary depending on the type of information and applicable legal requirements." },
      { type: "paragraph", text: "When information is no longer required, we will take reasonable steps to delete it or otherwise handle it in accordance with applicable law." },
    ] },
    { heading: "8. Data Security", blocks: [
      { type: "paragraph", text: "We take reasonable measures to protect personal information against unauthorised access, disclosure, alteration, loss and misuse." },
      { type: "paragraph", text: "However, no website, online service or electronic transmission can be guaranteed to be completely secure." },
      { type: "paragraph", text: "Customers should use strong passwords, protect their account credentials and contact us if they suspect unauthorised activity associated with their account." },
    ] },
    { heading: "9. Your Privacy Rights", blocks: [
      { type: "paragraph", text: "Subject to applicable law, you may have rights to request access to, correction of, or deletion of certain personal information, and to exercise other rights available to you." },
      { type: "paragraph", text: "You may contact us to raise a privacy concern or make a request." },
      { type: "paragraph", text: "We may need to verify your identity before responding. Some information may need to be retained where required by law or necessary to resolve a legitimate dispute." },
    ] },
    { heading: "10. Children's Privacy", blocks: [
      { type: "paragraph", text: "Our website is intended for people who can lawfully use the service and make purchases under applicable law." },
      { type: "paragraph", text: "We do not knowingly collect personal information from children in circumstances where such collection is prohibited. If you believe a child has provided personal information inappropriately, contact us so we can assess the matter and take appropriate action." },
    ] },
    { heading: "11. Third-Party Websites", blocks: [
      { type: "paragraph", text: "Our website may contain links to third-party services, including payment providers or social media platforms." },
      { type: "paragraph", text: "We are not responsible for the privacy practices or content of third-party websites. Please review their policies when using them." },
    ] },
    { heading: "12. Changes to This Policy", blocks: [
      { type: "paragraph", text: "We may update this Privacy Policy when our website, services, technologies or legal obligations change." },
      { type: "paragraph", text: "The updated version will be published on this page with a revised Last updated date." },
      { type: "paragraph", text: "Material changes will be communicated where required by applicable law." },
    ] },
    { heading: "13. Contact Us", blocks: [
      { type: "paragraph", text: "For privacy-related questions or requests: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Subject: Privacy Request" },
      { type: "paragraph", text: "Please include enough information for us to understand your request without sending unnecessary sensitive information." },
    ] },
  ],
};

export const termsConditions: LegalDocument = {
  title: "Terms & Conditions",
  intro: [
    "Welcome to GOALNET.",
    "These Terms & Conditions govern your access to and use of the GOALNET website and your purchases through our online store.",
    "Please read them carefully before placing an order. By accessing the website or placing an order, you agree to these terms to the extent permitted by applicable law.",
    "Nothing in these terms is intended to exclude or limit any consumer rights that cannot legally be excluded or limited.",
  ],
  related: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Shipping & Delivery Policy", href: "/shipping-policy" },
    { label: "Returns & Refunds Policy", href: "/returns-refunds" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
  ],
  sections: [
    { heading: "1. About GOALNET", blocks: [
      { type: "paragraph", text: "GOALNET is a football retail brand operating in India." },
      { type: "paragraph", text: "For enquiries about the website, products or orders, contact: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Seller/legal details required for publication: To be confirmed before launch." },
      { type: "paragraph", text: "Any additional legal seller details required under applicable law will be displayed on the website or otherwise made available to customers." },
    ] },
    { heading: "2. Eligibility", blocks: [
      { type: "paragraph", text: "You may use the website and place orders only if you are legally capable of entering into the relevant transaction under applicable law." },
      { type: "paragraph", text: "If you are below the age at which you may independently enter into a purchase transaction, you should use the website with the involvement of a parent or legal guardian as required by law." },
    ] },
    { heading: "3. Products and Descriptions", blocks: [
      { type: "paragraph", text: "We aim to display accurate product descriptions, photographs, colours, sizes, fabric details and other relevant information." },
      { type: "paragraph", text: "However, minor differences may occur due to lighting, photography, screen settings or variations between product batches." },
      { type: "paragraph", text: "Customers should review the product description and Size Guide before placing an order." },
      { type: "paragraph", text: "If a product materially differs from its description or is otherwise subject to a remedy under applicable law, the customer's legal rights will apply." },
    ] },
    { heading: "4. Product Availability", blocks: [
      { type: "paragraph", text: "Product availability may vary by design, season and size." },
      { type: "paragraph", text: "Adding an item to a cart or wishlist does not guarantee that the item will remain available until checkout." },
      { type: "paragraph", text: "If an order cannot be fulfilled after payment, we will contact the customer and arrange an appropriate resolution, including a refund where required." },
    ] },
    { heading: "5. Prices and Shipping Charges", blocks: [
      { type: "paragraph", text: "Prices will be displayed in Indian Rupees (INR)." },
      { type: "paragraph", text: "Applicable shipping charges and other mandatory charges will be disclosed before the customer confirms the purchase." },
      { type: "paragraph", text: "Promotional offers, discounts and free-shipping offers may be subject to specific conditions, which will be stated when the offer is presented." },
      { type: "paragraph", text: "We reserve the right to correct genuine pricing or listing errors before an order is accepted, subject to applicable law. If an error affects an order that has already been placed, we will communicate with the customer and follow the applicable legal requirements." },
    ] },
    { heading: "6. Placing an Order", blocks: [
      { type: "paragraph", text: "Customers must provide accurate contact, billing and delivery information." },
      { type: "paragraph", text: "After an order is submitted, the website may display an order confirmation or reference number." },
      { type: "paragraph", text: "An order confirmation indicates that the order has been received. Where further verification is necessary, we may contact the customer before proceeding." },
      { type: "paragraph", text: "If we cannot accept or fulfil an order, we will inform the customer and arrange any required refund." },
    ] },
    { heading: "7. Payments", blocks: [
      { type: "paragraph", text: "Online payments are processed through the payment gateway available at checkout." },
      { type: "paragraph", text: "Payment options may include supported UPI, card, net banking or other methods provided by the payment gateway." },
      { type: "paragraph", text: "Cash on Delivery is not available at launch." },
      { type: "paragraph", text: "Customers should complete payment through the supported checkout process and retain their transaction reference." },
      { type: "paragraph", text: "If payment fails or remains pending, the order may not be processed until the payment status is verified." },
      { type: "paragraph", text: "If a payment is debited but the order is not confirmed, please contact us with the transaction reference so we can investigate." },
    ] },
    { heading: "8. Order Processing and Delivery", blocks: [
      { type: "paragraph", text: "Orders are generally processed within 2–3 business days after successful payment confirmation." },
      { type: "paragraph", text: "Estimated delivery is generally 5–10 business days after dispatch, depending on the destination and courier service." },
      { type: "paragraph", text: "These are estimates, not guarantees. Delays may occur because of circumstances outside our reasonable control." },
      { type: "paragraph", text: "Shipping charges, multiple-item orders and delivery procedures are explained in our Shipping & Delivery Policy." },
    ] },
    { heading: "9. Order Cancellations", blocks: [
      { type: "paragraph", text: "Customers may request cancellation before dispatch." },
      { type: "paragraph", text: "Once an order has been dispatched, cancellation is not ordinarily available under our standard process. Customers should contact us if they believe they have a legally applicable cancellation right or another remedy." },
      { type: "paragraph", text: "Approved cancellations and refunds will be handled in accordance with our Cancellation Policy and applicable law." },
    ] },
    { heading: "10. Returns, Replacements and Refunds", blocks: [
      { type: "paragraph", text: "Returns and refunds are handled under our Returns & Refunds Policy." },
      { type: "paragraph", text: "Customers should inspect delivered products and report incorrect or damaged deliveries promptly." },
      { type: "paragraph", text: "Evidence such as photographs, an unboxing video and order information may be requested to investigate a claim. Evidence requirements will be applied consistently with applicable consumer protection laws." },
      { type: "paragraph", text: "Nothing in our returns policy removes any statutory remedy available to a customer." },
    ] },
    { heading: "11. Customer Accounts", blocks: [
      { type: "paragraph", text: "Customers are responsible for keeping their login credentials confidential and for providing accurate account information." },
      { type: "paragraph", text: "Please contact us promptly if you suspect unauthorised access to your account." },
      { type: "paragraph", text: "We may restrict or suspend access where reasonably necessary to address suspected fraud, security threats or unlawful use, subject to applicable law." },
    ] },
    { heading: "12. Acceptable Website Use", blocks: [
      { type: "paragraph", text: "Customers must not:" },
      { type: "unordered-list", items: ["Use the website for unlawful activities.", "Attempt to interfere with website security or functionality.", "Submit false information or fraudulent orders.", "Attempt to gain unauthorised access to systems or accounts.", "Upload malicious code or engage in activities that disrupt the service.", "Misuse website content in violation of applicable law."] },
      { type: "paragraph", text: "We may take reasonable measures to protect the website and its customers against misuse." },
    ] },
    { heading: "13. Intellectual Property", blocks: [
      { type: "paragraph", text: "The GOALNET name, logo, original website design, original marketing content and other original materials owned by GOALNET may not be copied, reproduced or used commercially without appropriate permission, except where permitted by law." },
      { type: "paragraph", text: "Third-party names, logos, club crests, trademarks and other intellectual property remain the property of their respective owners." },
      { type: "paragraph", text: "Nothing on this website should be interpreted as implying a sponsorship, partnership, endorsement or official affiliation with a football club, sportswear brand, player or governing body unless that relationship is expressly confirmed." },
      { type: "paragraph", text: "Customers may not reproduce website content in a way that infringes third-party rights." },
    ] },
    { heading: "14. Promotions and Discounts", blocks: [
      { type: "paragraph", text: "Promotional offers may have specific eligibility requirements, expiry dates, product exclusions or usage limits." },
      { type: "paragraph", text: "Any conditions will be communicated with the relevant promotion." },
      { type: "paragraph", text: "We reserve the right to withdraw or correct an offer where necessary, subject to applicable law and any rights already acquired by customers." },
    ] },
    { heading: "15. Website Availability", blocks: [
      { type: "paragraph", text: "We aim to keep the website available and functional but do not guarantee uninterrupted access." },
      { type: "paragraph", text: "Maintenance, technical failures, third-party service disruptions or other circumstances may temporarily affect the website." },
      { type: "paragraph", text: "We will take reasonable steps to address material technical issues." },
    ] },
    { heading: "16. Limitation of Liability", blocks: [
      { type: "paragraph", text: "To the extent permitted by law, GOALNET will not be responsible for indirect losses arising from circumstances beyond its reasonable control." },
      { type: "paragraph", text: "Nothing in these terms excludes liability for matters that cannot legally be excluded, including applicable consumer rights, legally required remedies or liability that cannot lawfully be limited." },
      { type: "paragraph", text: "Where a product or service fails to meet applicable legal requirements, the remedies provided by law remain available." },
    ] },
    { heading: "17. Privacy", blocks: [
      { type: "paragraph", text: "Personal information is handled in accordance with our Privacy Policy." },
      { type: "paragraph", text: "Customers should review that policy to understand how their information may be used and shared." },
    ] },
    { heading: "18. Changes to These Terms", blocks: [
      { type: "paragraph", text: "We may update these Terms & Conditions to reflect changes in our services, website features or legal requirements." },
      { type: "paragraph", text: "The updated terms will be published on this page with a revised Last updated date." },
      { type: "paragraph", text: "Changes will not remove rights that customers have already acquired under applicable law." },
    ] },
    { heading: "19. Governing Law and Disputes", blocks: [
      { type: "paragraph", text: "These terms are governed by the laws of India, subject to applicable consumer protection laws and rules concerning jurisdiction." },
      { type: "paragraph", text: "Customers may exercise any rights available to them before competent consumer dispute resolution authorities or other competent forums." },
      { type: "paragraph", text: "We encourage customers to contact us first so we can attempt to resolve concerns promptly." },
    ] },
    { heading: "20. Contact Us", blocks: [
      { type: "paragraph", text: "For questions about these Terms & Conditions: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Subject: Terms & Conditions Enquiry" },
    ] },
  ],
};

export const cancellationPolicy: LegalDocument = {
  title: "Cancellation Policy",
  intro: [
    "At GOALNET, we aim to process every order accurately and efficiently. This policy explains how customers can request cancellation and what happens after an order has been dispatched.",
  ],
  related: [
    { label: "Returns & Refunds Policy", href: "/returns-refunds" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  sections: [
    { heading: "1. Cancelling an Order Before Dispatch", blocks: [
      { type: "paragraph", text: "Customers may request cancellation before their order has been dispatched." },
      { type: "paragraph", text: "To request cancellation, email contactgoalnet@gmail.com with the subject: Cancellation Request — [Order Number]" },
      { type: "paragraph", text: "Please include the email address or phone number associated with your order." },
      { type: "paragraph", text: "Cancellation requests are subject to verification of the order status. Sending a request does not automatically mean the cancellation has been completed." },
      { type: "paragraph", text: "We recommend contacting us as soon as possible if you need to cancel an order." },
    ] },
    { heading: "2. Orders That Have Already Been Dispatched", blocks: [
      { type: "paragraph", text: "Once an order has been dispatched, cancellation is not available under our standard cancellation process." },
      { type: "paragraph", text: "If your order has already been dispatched, please contact us if:" },
      { type: "unordered-list", items: ["You believe the wrong product was sent.", "Your product arrives damaged or defective.", "You have another concern that may qualify for a remedy under applicable law."] },
      { type: "paragraph", text: "Eligible claims will be handled in accordance with our Returns & Refunds Policy and applicable legal requirements." },
      { type: "paragraph", text: "Nothing in this policy excludes any cancellation, return or refund right that cannot legally be excluded." },
    ] },
    { heading: "3. Refunds for Approved Cancellations", blocks: [
      { type: "paragraph", text: "If a cancellation is approved after payment has been completed, the applicable refund will be initiated through the original payment method where supported." },
      { type: "paragraph", text: "If the original payment method cannot be used, we'll contact you to arrange an appropriate alternative, subject to applicable requirements." },
      { type: "paragraph", text: "The time taken for the refund to appear in your account may depend on the payment provider or bank." },
      { type: "paragraph", text: "Any refund required by law will be handled in accordance with the applicable requirements." },
    ] },
    { heading: "4. Cancellation Requests After Payment", blocks: [
      { type: "paragraph", text: "If you have paid for an order but have not received an order confirmation, contact us with your payment transaction reference." },
      { type: "paragraph", text: "We'll verify the payment and order status before advising you on the next steps." },
      { type: "paragraph", text: "Please do not place repeated orders solely because a payment confirmation appears delayed." },
    ] },
    { heading: "5. Changes to an Order", blocks: [
      { type: "paragraph", text: "If you need to change a size, product, delivery address or other order detail, contact us as soon as possible before dispatch." },
      { type: "paragraph", text: "Changes cannot be guaranteed once order processing has advanced or the parcel has been dispatched." },
      { type: "paragraph", text: "If the requested change cannot be made, we'll explain the available options." },
    ] },
    { heading: "6. Orders We Cannot Fulfil", blocks: [
      { type: "paragraph", text: "In some circumstances, an order may need to be cancelled by GOALNET because of product unavailability, an inability to fulfil the order or another legitimate operational issue." },
      { type: "paragraph", text: "If this happens after payment, we'll contact the customer and arrange an appropriate resolution, including a refund where required." },
    ] },
    { heading: "7. Contact Us", blocks: [
      { type: "paragraph", text: "For cancellation requests: contactgoalnet@gmail.com" },
      { type: "paragraph", text: "Subject: Cancellation Request — [Order Number]" },
      { type: "paragraph", text: "Please include your order number and request details so we can review your order promptly." },
    ] },
  ],
};