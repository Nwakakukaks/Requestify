"use client";

import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "../ui/button";
import { useAccount, useNetwork, useWalletClient } from "wagmi";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import {
  payRequest,
  hasSufficientFunds,
  hasErc20Approval,
  approveErc20,
} from "@requestnetwork/payment-processor";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useEthersV5Signer } from "@/hooks/use-ethers-signer";
import { useEthersV5Provider } from "@/hooks/use-ethers-provider";
import { currencies } from "@/hooks/currency";
import { storageChains } from "@/hooks/storage-chain";
import { useToast } from "../ui/use-toast";
import { File } from "lucide-react";

const CustomAccordion = styled(Accordion)({
  margin: "10px 0",
  marginBottom: "20px",
  "&:before": { display: "none" },
  boxShadow: "none",
  borderRadius: "10px",
  "&.Mui-expanded": {
    border: "1px solid rgb(176, 255, 201)",
    background: "rgb(239, 255, 244)",
  },
});

const CustomAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "white",
  padding: "10px 20px",
  borderRadius: "10px",
  border: "1px solid #dcdee0",
  "&.MuiAccordionSummary-content": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  "&:hover": {
    border: "1px solid rgb(176, 255, 201)",
    background: "rgb(239, 255, 244)",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
  },
  "&.Mui-expanded": {
    border: "none",
    borderBottom: "1px solid #dcdee0",
    background: "rgb(239, 255, 244)",
    borderTopRightRadius: "10px",
    borderTopLeftRadius: "10px",
    borderBottomRightRadius: "0",
    borderBottomLeftRadius: "0",
  },
});

const CustomAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "white",
  borderBottomRightRadius: "10px",
  borderBottomLeftRadius: "10px",
});

const CustomGridItem = styled(Grid)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const TransactionAccordion = ({ transactions, isCompleted }) => {
  const { chain } = useNetwork();
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();
  const [storageChain] = useState(() => {
    const chains = Array.from(storageChains.keys());
    return chains.length > 0 ? chains[0] : "";
  });
  const { toast } = useToast();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [currency] = useState(() => {
    const currencyKeys = Array.from(currencies.keys());
    return currencyKeys.length > 0 ? currencyKeys[0] : "";
  });
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusLabel = (request) => {
    switch (request.state) {
      case "created":
        return "Pending";
      default:
        return "Completed";
    }
  };

  const handleRequestAction = async (request) => {
    console.log("Starting payTheRequest function");

    if (!request.requestId) {
      console.error("No request ID found");
      toast({
        title: "Error",
        description: "No request found to pay",
      });
      return;
    }

    const selectedCurrency = currencies.get(currency);
    const selectedStorageChain = storageChains.get(storageChain);

    if (!selectedCurrency || !selectedStorageChain) {
      console.error("Invalid currency or storage chain configuration", {
        currency,
        storageChain,
      });
      toast({
        title: "Configuration Error",
        description: "Invalid currency or storage chain configuration",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      console.log("Setting up signature provider and request client");

      const signatureProvider = new Web3SignatureProvider(walletClient);
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: selectedStorageChain.gateway,
        },
        signatureProvider,
      });

      const myrequest = await requestClient.fromRequestId(request.requestId);
      const requestData = myrequest.getData();

      console.log("Request data retrieved:", {
        network: requestData.currencyInfo.network,
        expectedAmount: requestData.expectedAmount,
        currency: requestData.currency,
      });

      if (!requestData.expectedAmount || requestData.expectedAmount === "0") {
        console.error("Invalid amount for payment");
        toast({
          title: "Payment Error",
          description: "Invalid payment amount",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (requestData.currencyInfo.network !== chain?.network) {
        console.error("Network mismatch", {
          requestNetwork: requestData.currencyInfo.network,
          currentNetwork: chain?.network,
        });
        toast({
          title: "Network Mismatch",
          description: `Please switch to ${requestData.currencyInfo.network}`,
        });
        setLoading(false);
        return;
      }

      console.log("Checking for sufficient funds");
      const hasFunds = await hasSufficientFunds({
        request: requestData,
        address: address,
        providerOptions: {
          provider: provider,
        },
      });

      if (!hasFunds) {
        console.error("Insufficient funds for the request");
        toast({
          title: "Insufficient Funds",
          description: "You do not have enough funds to pay this request",
        });
        setLoading(false);
        return;
      }

      // console.log("Checking ERC20 approval");
      // const _hasErc20Approval = await hasErc20Approval(
      //   requestData,
      //   address,
      //   provider
      // );
      // if (!_hasErc20Approval) {
      //   console.log("Requesting ERC20 approval");
      //   const approvalTx = await approveErc20(requestData, signer);
      //   await approvalTx.wait(2);
      //   console.log("ERC20 approval transaction completed");
      // }

      console.log("Paying the request");
      const paymentTx = await payRequest(requestData, signer);
      await paymentTx.wait(2);

      if (paymentTx.hash) {
        toast({
          title: "Payment Success",
          description: `Payment successful, transaction hash: ${paymentTx.hash}`,
        });
        console.log(`Payment successful, transaction hash: ${paymentTx.hash}`);
      }

      setLoading(false);
    } catch (error) {
      console.error("Comprehensive payment error:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the payment",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  function shortenEthereumAddress(address) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      throw new Error("Invalid Ethereum address");
    }
    return address.slice(0, 6) + "..." + address.slice(-4);
  }

  return (
    <div className="accordian-parent">
      {isloading ? (
        <div className="text-black">Loading requests...</div>
      ) : transactions.length === 0 ? (
        <CustomAccordion>
          <CustomAccordionSummary>
            <div style={{ textAlign: "center", width: "100%" }}>
              No requests found for this address.
              <div style={{ marginTop: "10px" }}>
                To start a new request, please click on the "Initiate Request"
                button located in the top right corner.
              </div>
            </div>
          </CustomAccordionSummary>
        </CustomAccordion>
      ) : (
        transactions.map((request, index) => (
          <CustomAccordion key={request.requestId}>
            <CustomAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Grid
                container
                spacing={{ xs: 2, md: 3 }}
                columns={{ xs: 6, sm: 10, md: 10 }}
              >
                <CustomGridItem item xs={3} sm={1} md={1}>
                  <div>{index + 1}</div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div className="senderOrReceiverOnAccordian">
                    {request.contentData.content.RequestType || "Unknown Type"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div style={{ fontWeight: "700" }}>
                    {request.contentData.content.RequestTitle ||
                      "Untitled Request"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div style={{ color: "#a1a3a7" }}>
                    {new Date(request.timestamp * 1000).toLocaleDateString()}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={1} md={1}>
                  <div className="accordian-txn-status">
                    {isCompleted ? "Completed" : "Pending"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <Button
                    className={`action-btn ${
                      request.state === "completed"
                        ? "completed-action-btn"
                        : "waiting-action-btn"
                    }`}
                  >
                    {isCompleted ? "Closed" : "Sign"}
                  </Button>
                </CustomGridItem>
              </Grid>
            </CustomAccordionSummary>
            <CustomAccordionDetails>
              <div className="bg-white shadow-md rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Creator
                    </label>
                    <p className="text-sm text-gray-800 bg-gray-50 py-1 px-2 rounded">
                      {shortenEthereumAddress(request.creator.value)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Payee
                    </label>
                    <p className="text-sm text-gray-800 bg-gray-50 py-1 px-2 rounded">
                      {shortenEthereumAddress(request.payee.value)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Amount
                    </label>
                    <p className="text-sm text-green-600 font-semibold bg-green-50 py-1 px-2 rounded">
                      {request.expectedAmount / Math.pow(10, 18)}{" "}
                      {request.currency}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Required Signer
                    </label>
                    <p className="text-sm text-gray-800 bg-gray-50 py-1 px-2 rounded">
                      {request.contentData.content.signer1
                        ? shortenEthereumAddress(
                            request.contentData.content.signer1.value
                          )
                        : "None"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">
                    Memo
                  </label>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-800 break-words">
                      {request.contentData.content.RequestMemo}
                    </p>
                    {request.contentData.content.Attachment && (
                      <div className="mt-2 flex justify-center items-center space-x-1">
                        <File size={16} className="text-blue-500" />
                        <a
                          href={request.contentData.content.Attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Attached Doc
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500">
                    Transaction Events
                  </h3>
                  <div className="divide-y divide-gray-100 bg-gray-50 rounded-lg">
                    {request.events.map((event, idx) => (
                      <div key={idx} className="px-3 py-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{event.name}d</span> by{" "}
                          {shortenEthereumAddress(event.actionSigner.value)}
                          <span className="text-gray-500 ml-2">
                            {new Date(event.timestamp * 1000).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className={` w-full mt-5`}
                  onClick={() => handleRequestAction(request)}
                  disabled={
                    ((address !==
                      request?.contentData?.content?.signer1?.value ??
                      "") &&
                      (address !== request?.payer?.value ?? "")) ||
                    isCompleted
                  }
                >
                  {isCompleted
                    ? "Request completed and closed ☑️"
                    : loading
                    ? "Signing.."
                    : "Sign Request"}
                </Button>
              </div>
            </CustomAccordionDetails>
          </CustomAccordion>
        ))
      )}

      <ToastContainer />
    </div>
  );
};

export default TransactionAccordion;
