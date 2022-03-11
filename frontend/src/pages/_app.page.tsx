import "../styles/globals.scss";
import { useEffect, useRef } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { LocalizationProvider } from "@fluent/react";
import { SSRProvider } from "@react-aria/ssr";
import { OverlayProvider } from "@react-aria/overlays";
import ReactGa from "react-ga";
import { getL10n } from "../functions/getL10n";
import { hasDoNotTrackEnabled } from "../functions/userAgent";
import { AddonDataContext, useAddonElementWatcher } from "../hooks/addon";
import { getRuntimeConfig } from "../config";
import { ReactAriaI18nProvider } from "../components/ReactAriaI18nProvider";
import { initialiseApiMocks } from "../apiMocks/initialise";
import { mockIds } from "../apiMocks/mockData";

if (process.env.NEXT_PUBLIC_MOCK_API === "true") {
  initialiseApiMocks();

  if (
    typeof URLSearchParams !== "undefined" &&
    typeof document !== "undefined"
  ) {
    // When deploying the frontend with a mocked back-end,
    // this query parameter will allow us to automatically "sign in" with one
    // of the mock users. This is useful to be able to give testers a link
    // in which to see a particular feature:
    const searchParams = new URLSearchParams(document.location.search);
    const mockId = searchParams.get("mockId");
    const selectedMockId = mockIds.find((id) => id === mockId);
    if (typeof selectedMockId === "string") {
      // See `src/hooks/api/api.ts`; this localStorage entry is how we tell the
      // API mock what mock data we want to load:
      localStorage.setItem("authToken", selectedMockId);
    }
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const addonDataElementRef = useRef<HTMLElement>(null);

  const addonData = useAddonElementWatcher(addonDataElementRef);

  useEffect(() => {
    if (hasDoNotTrackEnabled()) {
      return;
    }
    ReactGa.initialize(getRuntimeConfig().googleAnalyticsId, {
      titleCase: false,
      debug: process.env.NEXT_PUBLIC_DEBUG === "true",
    });
    ReactGa.set({
      anonymizeIp: true,
      transport: "beacon",
    });
    const cookies = document.cookie.split("; ");
    const gaEventCookies = cookies.filter((item) =>
      item.trim().startsWith("server_ga_event:")
    );
    gaEventCookies.forEach((item) => {
      const serverEventLabel = item.split("=")[1];
      if (serverEventLabel) {
        ReactGa.event({
          category: "server event",
          action: "fired",
          label: serverEventLabel,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (hasDoNotTrackEnabled()) {
      return;
    }
    ReactGa.pageview(router.asPath);
  }, [router.asPath]);

  return (
    <SSRProvider>
      <LocalizationProvider l10n={getL10n()}>
        <ReactAriaI18nProvider>
          <AddonDataContext.Provider value={addonData}>
            <firefox-private-relay-addon
              ref={addonDataElementRef}
              data-addon-installed={addonData.present}
              data-user-logged-in={addonData.isLoggedIn}
              data-local-labels={JSON.stringify(addonData.localLabels)}
            ></firefox-private-relay-addon>
            <OverlayProvider id="overlayProvider">
              <Component {...pageProps} />
            </OverlayProvider>
          </AddonDataContext.Provider>
        </ReactAriaI18nProvider>
      </LocalizationProvider>
    </SSRProvider>
  );
}
export default MyApp;
