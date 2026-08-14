import Image from "next/image";

const testimonials = [
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-01.png", width: 1087, height: 1447 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-02.png", width: 1079, height: 1458 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-03.png", width: 1097, height: 1434 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-04.png", width: 1111, height: 1416 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-05.png", width: 1257, height: 1251 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-06.png", width: 1157, height: 1360 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-07.png", width: 1021, height: 1540 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-08.png", width: 1170, height: 1344 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-09.png", width: 1050, height: 1498 },
  { src: "/depoimentos/whatsapp/depoimento-whatsapp-10.png", width: 1117, height: 1408 },
];

export function WhatsAppTestimonials({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby={compact ? "checkout-testimonials-title" : "testimonials-title"}
      className={compact
        ? "overflow-hidden rounded-[28px] border border-[#DDE8E4] bg-gradient-to-br from-white to-[#ECFDF5]/60 p-5 shadow-[0_12px_40px_rgba(13,27,42,.055)] sm:p-6"
        : "relative mt-10 overflow-hidden rounded-[32px] bg-[#0D1B2A] px-5 py-8 text-white shadow-[0_22px_60px_rgba(13,27,42,.16)] sm:px-8 sm:py-10 lg:mt-14 lg:px-10"
      }
    >
      {!compact && (
        <>
          <span className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border-[52px] border-[#C9C6F0]/10" />
          <span className="pointer-events-none absolute -bottom-24 left-1/3 size-52 rounded-full bg-[#047857]/20 blur-3xl" />
        </>
      )}

      <div className="relative">
        <div className={compact ? "mb-5" : "mb-7 max-w-2xl"}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#047857]">
            <span aria-hidden>✓</span> Depoimentos verificados
          </div>
          <h2
            id={compact ? "checkout-testimonials-title" : "testimonials-title"}
            className={compact
              ? "font-serif text-2xl font-semibold leading-tight tracking-[-.025em] text-[#0D1B2A]"
              : "font-serif text-3xl font-semibold leading-tight tracking-[-.03em] sm:text-4xl"
            }
          >
            Clientes que já confiaram na eLeve Saúde
          </h2>
          <p className={compact ? "mt-2 text-sm leading-6 text-[#344563]" : "mt-3 text-sm leading-6 text-white/70 sm:text-base"}>
            Depoimentos reais recebidos pelo WhatsApp
          </p>
        </div>

        <div
          className={`-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-6 sm:px-6 ${
            compact
              ? "lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
              : "lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0"
          }`}
          aria-label="Galeria de depoimentos de clientes"
        >
          {testimonials.map((testimonial, index) => (
            <figure
              key={testimonial.src}
              className={`relative w-[78vw] max-w-[290px] shrink-0 snap-center overflow-hidden rounded-[22px] border bg-white p-2 shadow-[0_14px_35px_rgba(13,27,42,.18)] ${
                compact ? "border-[#DDE8E4] lg:w-auto" : "border-white/15 lg:w-auto"
              }`}
            >
              <Image
                src={testimonial.src}
                alt={`Depoimento real de cliente recebido pelo WhatsApp, conversa ${index + 1}`}
                width={testimonial.width}
                height={testimonial.height}
                sizes={compact
                  ? "(max-width: 1023px) 78vw, 220px"
                  : "(max-width: 1023px) 78vw, (max-width: 1279px) 18vw, 220px"
                }
                className="h-auto w-full rounded-[15px]"
              />
            </figure>
          ))}
        </div>

        <p className={`mt-4 flex items-center gap-2 text-[11px] ${compact ? "text-[#344563] lg:hidden" : "text-white/55 lg:hidden"}`}>
          <span aria-hidden>↔</span> Deslize para ver mais depoimentos
        </p>
      </div>
    </section>
  );
}
