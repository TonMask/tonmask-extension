import { fromNano } from "@openmask/web-sdk";
import React, { FC, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { JettonState } from "../../../../../../../libs/entries/asset";
import { AddressTransfer } from "../../../../../../components/Address";
import {
  Body,
  ButtonBottomRow,
  ButtonPositive,
  ErrorMessage,
  Gap,
  TextLine,
} from "../../../../../../components/Components";
import { Dots } from "../../../../../../components/Dots";
import {
  SendCancelButton,
  SendEditButton,
} from "../../../../../../components/send/SendButtons";
import { WalletStateContext } from "../../../../../../context";
import { fiatFees, toShortAddress, toShortName } from "../../../../../../utils";
import { useEstimateFee, useSendMutation } from "../../../send/api";
import { SendJettonState, toSendJettonState, useSendJettonMethod } from "./api";

const EditButton = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onEdit = () => {
    const state = toSendJettonState(searchParams);
    setSearchParams({ ...state }); // Remove submit flag from params
  };
  return <SendEditButton onEdit={onEdit} />;
});

const Comment = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

interface ConfirmProps {
  jetton: JettonState;
  state: SendJettonState;
  balance?: string;
  onSend: (seqNo: number, transactionId?: string) => void;
}

export const SendJettonConfirm: FC<ConfirmProps> = ({
  jetton,
  state,
  balance,
  onSend,
}) => {
  const wallet = useContext(WalletStateContext);

  const {
    data: method,
    error,
    isFetching,
  } = useSendJettonMethod(jetton, state, balance);
  const { data } = useEstimateFee(method);

  const { mutateAsync, isLoading } = useSendMutation();

  const onConfirm = async () => {
    if (!method) return;
    const seqNo = await mutateAsync(method);
    onSend(seqNo, state.id);
  };

  const Fees = useCallback(() => {
    if (!data) {
      return (
        <TextLine>
          <Dots>Loading</Dots>
        </TextLine>
      );
    }
    const totalTon = fromNano(
      String(data.fwd_fee + data.in_fwd_fee + data.storage_fee + data.gas_fee)
    );

    return (
      <TextLine>
        Network: ~<b>{fiatFees.format(parseFloat(totalTon))} TON</b>
      </TextLine>
    );
  }, [data]);

  const transaction =
    state.transactionAmount != "" ? parseFloat(state.transactionAmount) : 0.1;

  const disabled = isLoading || isFetching || error != null;

  return (
    <>
      <EditButton />
      <Body>
        <AddressTransfer
          left={toShortName(wallet.name)}
          right={toShortAddress(state.address)}
        />
        <TextLine>
          SENDING {jetton.state.symbol}:
          {state.origin ? ` (${state.origin})` : ""}
        </TextLine>

        <TextLine>
          <b>
            {state.amount} {jetton.state.symbol}
          </b>
        </TextLine>
        {state.comment && (
          <>
            <TextLine>Comment:</TextLine>
            <Comment>{state.comment}</Comment>
          </>
        )}

        <TextLine>Network fee estimation:</TextLine>
        <Fees />
        <TextLine>Transaction fee estimation:</TextLine>
        <TextLine>
          Max: ~<b>{fiatFees.format(transaction)} TON*</b>
        </TextLine>
        <div>
          * The wallet sends an amount of TON to cover transaction costs. The
          rest of the TON that will not be used will be returned to the wallet.
        </div>

        {error && <ErrorMessage>{error.message}</ErrorMessage>}

        <Gap />
        <ButtonBottomRow>
          <SendCancelButton
            disabled={isLoading}
            transactionId={state.id}
            homeRoute="../"
          />
          <ButtonPositive disabled={disabled} onClick={onConfirm}>
            {isFetching ? <Dots>Validating</Dots> : "Confirm"}
          </ButtonPositive>
        </ButtonBottomRow>
      </Body>
    </>
  );
};