import { whatsappLink } from "@/lib/format";

export function WhatsAppButton({ number }: { number: string }) {
  const href = whatsappLink(number, "Bonjour Herman FASHION, je souhaite avoir des informations sur vos formations.");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à Herman FASHION sur WhatsApp"
      className="group fixed bottom-5 left-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_30px_-10px_rgba(37,211,102,.7)] transition-transform duration-300 hover:-translate-y-1 md:bottom-7 md:left-7"
      style={{ height: 52, width: 52 }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100">WhatsApp</span>
    </a>
  );
}
