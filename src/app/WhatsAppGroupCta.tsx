"use client";

import { useEffect, type MouseEvent } from "react";

const REDIRECT_URL = "/entrar";

type AnalyticsWindow = Window & {
  fbq?: (
    action: string,
    event: string,
    parameters?: Record<string, string | number>,
  ) => void;

  gtag?: (
    action: string,
    event: string,
    parameters?: Record<
      string,
      string | number | (() => void)
    >,
  ) => void;
};

type WhatsAppGroupCtaProps = {
  className: string;
  iconClassName: string;
};

type TrackingData = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  campaign_id: string;
  adset_id: string;
  ad_id: string;
  placement: string;
  site_source_name: string;
  fbclid: string;
};

function safeValue(value: string | null, maxLength = 120) {
  if (!value) return "";
  return value.slice(0, maxLength);
}

function getTrackingData(): TrackingData {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: safeValue(params.get("utm_source"), 80),
    utm_medium: safeValue(params.get("utm_medium"), 80),
    utm_campaign: safeValue(params.get("utm_campaign"), 100),
    utm_content: safeValue(params.get("utm_content"), 100),
    utm_term: safeValue(params.get("utm_term"), 100),

    campaign_id: safeValue(params.get("campaign_id"), 80),
    adset_id: safeValue(params.get("adset_id"), 80),
    ad_id: safeValue(params.get("ad_id"), 80),

    placement: safeValue(params.get("placement"), 80),
    site_source_name: safeValue(params.get("site_source_name"), 50),

    fbclid: safeValue(params.get("fbclid"), 180),
  };
}

export function WhatsAppGroupCta({
  className,
  iconClassName,
}: WhatsAppGroupCtaProps) {
  useEffect(() => {
    const tracking = getTrackingData();

    try {
      /*
       * Última origem conhecida.
       */
      sessionStorage.setItem(
        "eleve_tracking",
        JSON.stringify(tracking),
      );

      /*
       * First touch:
       * preserva a primeira origem que trouxe esse navegador.
       */
      if (!localStorage.getItem("eleve_first_touch")) {
        localStorage.setItem(
          "eleve_first_touch",
          JSON.stringify({
            ...tracking,
            captured_at: new Date().toISOString(),
          }),
        );
      }

      /*
       * Last touch:
       * atualiza sempre que houver nova visita.
       */
      localStorage.setItem(
        "eleve_last_touch",
        JSON.stringify({
          ...tracking,
          captured_at: new Date().toISOString(),
        }),
      );
    } catch {
      // Storage pode estar indisponível em navegadores
      // com restrições de privacidade.
    }
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const analyticsWindow = window as AnalyticsWindow;
    const tracking = getTrackingData();

    /*
     * META PIXEL
     *
     * Evento propositalmente genérico.
     * Não enviamos peso, medicamento, dose, condição,
     * diagnóstico ou outros dados relacionados à saúde.
     */
    analyticsWindow.fbq?.(
      "trackCustom",
      "JoinGroupClick",
      {
        page_variant: "lp_grupo_v1",
        cta_id: "cta_principal",
      },
    );

    /*
     * GOOGLE ANALYTICS 4
     *
     * Aqui conseguimos cruzar o clique com IDs
     * da campanha, conjunto e anúncio.
     */
    analyticsWindow.gtag?.(
      "event",
      "join_group_click",
      {
        event_category: "engagement",
        event_label: "grupo_vip_eleve",

        destination: "whatsapp_group",

        campaign_id: tracking.campaign_id,
        adset_id: tracking.adset_id,
        ad_id: tracking.ad_id,
        placement: tracking.placement,

        event_callback: () => {
          window.location.assign(REDIRECT_URL);
        },

        event_timeout: 800,
      },
    );

    /*
     * Caso GA4 não esteja carregado,
     * o redirecionamento continua funcionando.
     */
    if (!analyticsWindow.gtag) {
      window.location.assign(REDIRECT_URL);
      return;
    }

    /*
     * Segurança adicional:
     * mesmo se o Analytics não executar callback,
     * ninguém fica preso na página.
     */
    window.setTimeout(() => {
      if (window.location.pathname !== "/entrar") {
        window.location.assign(REDIRECT_URL);
      }
    }, 900);
  }

  return (
    <a
      href={REDIRECT_URL}
      className={className}
      onClick={handleClick}
      rel="noopener noreferrer"
      aria-label="Entrar gratuitamente no Grupo VIP eLeve Saúde no WhatsApp"
    >
      <span
        className={iconClassName}
        aria-hidden="true"
      >
        🟢
      </span>

      <span>
        ENTRAR GRATUITAMENTE NO WHATSAPP
      </span>
    </a>
  );
}
