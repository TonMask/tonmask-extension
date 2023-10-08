import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import { useNonBounceableAddress } from "../../../libs/address";
import { WalletAddressContext, WalletStateContext } from "../../context";
import { AppRoute, any } from "../../routes";
import { useBalance, useCoinPrice, useDexStock } from "./api";
import { WalletHome, WalletInfo } from "./wallet/Wallet";
import { AssetsRouter } from "./wallet/assets/Assets";
import { ReceiveRouter, ReceiveTonPage } from "./wallet/receive/Receive";
import { SwapRouter } from "./wallet/receive/Swap";
import { Send } from "./wallet/send/Send";
import { WalletSettings } from "./wallet/setttings/Settings";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const Home = () => {
  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);
  const { data: price } = useCoinPrice(balance != null);
  const { data: stocks } = useDexStock(balance != null);

  const address = useNonBounceableAddress(wallet.address);
  return (
    <WalletAddressContext.Provider value={address}>
      <Body>
        <WalletInfo />
        <Routes>
          <Route
            path={any(AppRoute.send)}
            element={<Send price={price} balance={balance} />}
          />
          <Route path={any(AppRoute.swap)} element={<SwapRouter />} />
          <Route path={any(AppRoute.receive)} element={<ReceiveTonPage />} />
          <Route path={any(AppRoute.buy)} element={<ReceiveRouter />} />
          <Route path={any(AppRoute.wallet)} element={<WalletSettings />} />
          <Route path={any(AppRoute.assets)} element={<AssetsRouter />} />
          <Route
            path="*"
            element={
              <WalletHome price={price} balance={balance} stocks={stocks} />
            }
          />
        </Routes>
      </Body>
    </WalletAddressContext.Provider>
  );
};

export default Home;
