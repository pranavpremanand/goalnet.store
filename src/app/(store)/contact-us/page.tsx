import { ContactForm } from "@/components/pages/contact/ContactForm";

export const metadata = {
  title: "Contact GoalNet",
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return <ContactForm />;
}