import "../styles/globals.scss";
import UserProvider from "../context/userContext";
import ChannelProvider from "../context/channelContext";
import PopUpProvider from "../context/popUpContext";
import MessageProvider from "../context/messageContext";
import { AppProps } from "next/dist/shared/lib/router/router";
import { useEffect, useState } from "react";
import Loading from "components/Loading";

function MyApp({ Component, pageProps, router }: AppProps) {
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    const routeChangeStartHandler = () => setIsRouteChanging(true);

    const routeChangeEndHandler = () => setIsRouteChanging(false);

    router.events.on("routeChangeStart", routeChangeStartHandler);
    router.events.on("routeChangeComplete", routeChangeEndHandler);
    router.events.on("routeChangeError", routeChangeEndHandler);
    return () => {
      router.events.off("routeChangeStart", routeChangeStartHandler);
      router.events.off("routeChangeComplete", routeChangeEndHandler);
      router.events.off("routeChangeError", routeChangeEndHandler);
    };
  }, []);

  return (
    <UserProvider>
      <ChannelProvider>
        <MessageProvider>
          <PopUpProvider>
            {isRouteChanging ? <Loading /> : <Component {...pageProps} />}
          </PopUpProvider>
        </MessageProvider>
      </ChannelProvider>
    </UserProvider>
  );
}

export default MyApp;
function setIsRouteChanging(arg0: boolean) {
  throw new Error("Function not implemented.");
}
