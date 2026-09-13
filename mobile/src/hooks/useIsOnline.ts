import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useIsOnline(): { isOnline: boolean; isReady: boolean } {
  const [isOnline, setIsOnline] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected);
      setIsReady(true);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, isReady };
}