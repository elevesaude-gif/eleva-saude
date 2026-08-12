"use client";

import { useEffect, type MouseEvent } from "react";

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/DaX6oULMMbd1nkrwudmpMj?s=cl&p=i&ilr=2&amv=2";

type AnalyticsWindow = Window & {
  fbq?: (action: string, event: string) => void;
  gtag?: (
    action: string,
    event: string,
    parameters: Record<string, string>,
  ) => void;
};

type WhatsAppGroupCtaProps = {
  className: string;
  iconClassName: string;
};

export function WhatsAppGroupCta({
  className,
  iconClassName,
}: WhatsAppGroupCtaProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracking = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      fbclid: params.get("fbclid") || "",
    };

    try {
      sessionStorage.setItem("eleve_tracking", JSON.stringify(tracking));
    } catch {
      // Storage may be unavailable in privacy-restricted browsers.
    }
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const analyticsWindow = window as AnalyticsWindow;

    analyticsWindow.fbq?.("trackCustom", "WhatsAppGroupClick");
    analyticsWindow.gtag?.("event", "whatsapp_group_click", {
      event_category: "engagement",
      event_label: "grupo_vip_eleve",
    });

    window.location.assign(WHATSAPP_GROUP_URL);
  }

  return (
    <a
      href={WHATSAPP_GROUP_URL}
      className={className}
      onClick={handleClick}
      rel="noopener noreferrer"
      aria-label="Entrar gratuitamente no Grupo VIP eLeve Saúde no WhatsApp"
    >
      <span className={iconClassName} aria-hidden="true">
        🟢
      </span>
      <span>ENTRAR GRATUITAMENTE NO WHATSAPP</span>
    </a>
  );
}
