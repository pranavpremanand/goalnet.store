import type { FAQGroup } from "@/components/pages/legal/FaqAccordion";

const answer = (text: string) => [{ type: "paragraph" as const, text }];

export const faqGroups: FAQGroup[] = [
  {
    title: "About GOALNET",
    questions: [
      {
        question: "What is GOALNET?",
        blocks: answer("GOALNET is a football brand for fans who want to express their love for the game through club, country and retro-inspired football products, including jerseys. Our tagline is “Where Football Lives Beyond 90 Minutes.”"),
      },
      {
        question: "Where is GOALNET based?",
        blocks: answer("GOALNET operates from Kerala, India, and aims to serve customers across India, subject to delivery availability."),
      },
      {
        question: "What products do you offer?",
        blocks: [
          { type: "paragraph", text: "Our collection may include products such as:" },
          { type: "unordered-list", items: ["Club jerseys.", "National team jerseys.", "Retro jerseys.", "Player jerseys.", "Different sleeve styles and fits.", "Selected designs from different seasons."] },
          { type: "paragraph", text: "Available designs, sizes and styles depend on current product availability." },
        ],
      },
    ],
  },
  {
    title: "Products and Sizing",
    questions: [
      { question: "What sizes are available?", blocks: answer("Available sizes depend on the specific product. Please check the size options shown on the product page before ordering.") },
      { question: "How do I choose the right size?", blocks: answer("Refer to our Size Guide before placing your order. Compare the measurements with a similar item you already own, where possible, and review the fit information provided on the product page. If you're unsure about a size, contact us before ordering.") },
      { question: "What are your products made from?", blocks: answer("Fabric composition and product details may vary by design. Please refer to the individual product page for the available fabric information. Where specified, products may feature breathable DotNet fabric.") },
      { question: "Are all products the same fit?", blocks: answer("No. Fit and construction may vary depending on the product and style. Please check the product description for the specific product's fit and other relevant details.") },
      { question: "Can I order a product with a specific player's name and number?", blocks: answer("Player names and numbers are available only on designs where the relevant option is offered. Please check the product images and description or contact us to confirm availability before placing your order.") },
      { question: "Are the product photographs accurate?", blocks: answer("We aim to display clear product photographs and accurate descriptions. Minor visual differences may occur because of lighting, photography and individual screen settings. Please refer to the written product details as well as the images.") },
    ],
  },
  {
    title: "Orders and Payments",
    questions: [
      { question: "How can I place an order?", blocks: answer("You can browse the website, select your preferred product and size, add the product to your cart and proceed to checkout. Follow the checkout instructions to provide your delivery details and complete payment. You can also contact us through Instagram or WhatsApp to enquire about product availability and ordering options.") },
      { question: "Which payment methods are accepted?", blocks: answer("Online payments are accepted through the payment gateway available at checkout. The supported options may include UPI, credit cards, debit cards and other methods enabled by the payment provider. Please check the checkout page for the payment options currently available.") },
      { question: "Do you offer Cash on Delivery?", blocks: answer("No. Cash on Delivery is not available at launch. Orders must be paid for using an available online payment method.") },
      { question: "How will I know if my order has been placed successfully?", blocks: answer("After successful payment and order confirmation, the website should display your order confirmation and reference details. Please save your order number and payment transaction reference for future enquiries. If money has been debited but your order is not confirmed, contact us with your transaction details.") },
      { question: "Can I change my order after placing it?", blocks: answer("Contact us as soon as possible if you need to change your size, product or delivery information. Changes may be possible before dispatch but cannot be guaranteed. Once an order has been dispatched, changes cannot normally be made.") },
      { question: "Can I cancel my order?", blocks: answer("You may request cancellation before dispatch. Once the order has been dispatched, cancellation is not available under our standard cancellation process. Please read our Cancellation Policy for details and information about applicable exceptions.") },
    ],
  },
  {
    title: "Shipping and Delivery",
    questions: [
      { question: "Do you deliver across India?", blocks: answer("We aim to deliver across India to locations serviced by our courier partners. Delivery availability depends on the destination and courier service.") },
      { question: "How much does shipping cost?", blocks: answer("Our standard shipping charge is ₹80 per order, subject to parcel weight, destination and applicable courier charges. Orders containing multiple items may incur an additional shipping charge if the combined parcel costs more to ship. Any applicable shipping charge will be displayed or communicated before the order is confirmed.") },
      { question: "How long does delivery take?", blocks: answer("Orders are generally processed within 2–3 business days after successful payment confirmation. Delivery is generally estimated at 5–10 business days after dispatch. These are estimates, and actual delivery times may vary depending on your location and courier operations.") },
      { question: "How can I track my order?", blocks: answer("If tracking information is available for your shipment, we'll share the relevant details with you. If you have not received an update or believe your order is delayed, contact us with your order number.") },
      { question: "What happens if I'm unavailable when the courier arrives?", blocks: answer("The courier may attempt redelivery or provide further instructions, depending on its procedures. Please respond to courier communications and follow the instructions provided. If the parcel is returned to us after unsuccessful delivery, contact us to discuss the available options.") },
      { question: "Can I change my delivery address?", blocks: answer("Contact us as soon as possible if your delivery address is incorrect. We may be able to update the address before dispatch, but changes cannot be guaranteed after the parcel has been handed over to the courier.") },
    ],
  },
  {
    title: "Returns and Refunds",
    questions: [
      { question: "Can I return a product?", blocks: answer("Returns are accepted only for products that arrive damaged, defective or incorrect. Report the issue within 24 hours of delivery with your order ID, reason and clear photos or videos. All requests are subject to verification and approval. Change-of-mind, preference and incorrect-size returns are not accepted. See our Returns & Refunds Policy for details.") },
      { question: "What should I do if I receive the wrong product?", blocks: answer("Contact GOALNET through Instagram DM (@goalnetofficial) or our official WhatsApp channel within 24 hours of delivery. Provide your order ID, explain the issue and share clear photos or videos of the product.") },
      { question: "What should I do if my product arrives damaged or defective?", blocks: answer("Contact GOALNET through Instagram DM (@goalnetofficial) or our official WhatsApp channel within 24 hours of delivery. Include your order ID, explain the issue and share clear photos or videos showing it. GOALNET will verify the request and let you know whether it is approved.") },
      { question: "What happens after my return is approved?", blocks: answer("You can choose a GOALNET-arranged reverse pickup, or book a courier yourself using the return address GOALNET provides. For self-arranged shipping, send us the receipt and tracking number; reasonable return shipping costs are reimbursed after verification. Please do not ship anything before your return is approved.") },
      { question: "Can I return a product if I ordered the wrong size?", blocks: answer("No. Returns are not accepted for incorrect size selection when the product supplied matches the order. Please check the product's size information before ordering. This does not affect any statutory consumer rights.") },
      { question: "When is my refund processed?", blocks: answer("GOALNET inspects the returned product after receiving it. If the reported issue is verified, refund processing begins after inspection. We will update you on the refund status and expected processing time. Refunds are sent to the original payment method or another mutually agreed method.") },
      { question: "Who pays for return shipping?", blocks: answer("GOALNET bears reasonable return shipping costs for verified damaged, defective or incorrect products. GOALNET pays for arranged reverse pickup. If you book the courier, pay first and share the receipt and tracking number; reasonable costs are reimbursed after verification.") },
      { question: "How can I contact GOALNET about a return?", blocks: answer("Contact us through Instagram DM at @goalnetofficial or our official WhatsApp channel. You can also email contactgoalnet@gmail.com or visit https://goalnet.in. Include your order ID, reason for return and clear photos or videos showing the issue.") },
    ],
  },
  {
    title: "Account and Support",
    questions: [
      { question: "Do I need an account to place an order?", blocks: answer("No. You can place an order as a guest without creating an account. Account creation is also supported by the website.") },
      { question: "I forgot my password. What should I do?", blocks: answer("Use the password recovery option on the login page, if available, and follow the instructions. If you continue to experience difficulties, contact our support email.") },
      { question: "How can I contact GOALNET?", blocks: answer("For product availability, return requests, order questions and other assistance, DM @goalnetofficial on Instagram or contact us through our official WhatsApp channel. You can also email contactgoalnet@gmail.com or visit https://goalnet.in. Include your order ID when asking about an existing order.") },
    ],
  },
];