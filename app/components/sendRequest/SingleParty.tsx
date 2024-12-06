import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toast } from "@/app/components/ui/use-toast";
import { useAccount, useWalletClient } from "wagmi";
import {
  RequestNetwork,
  Types,
  Utils,
} from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { parseUnits, zeroAddress } from "viem";
import { currencies } from "@/hooks/currency";
import { storageChains } from "@/hooks/storage-chain";
import { Textarea } from "../ui/textarea";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const CLOUD_NAME = "your_cloud_name";
const UPLOAD_PRESET = "your_upload_preset";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

const uploadToCloudinary = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "raw");

    const headers = { ...formData.getHeaders() };

    const response = await axios.post(CLOUDINARY_URL, formData, { headers });
    return response.data.url;
  } catch (error) {
    throw new Error("Failed to upload attachment to Cloudinary");
  }
};

const SinglePartyRequest: React.FC = () => {
  const { address, isDisconnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [requestTitle, setRequestTitle] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [creator, setCreator] = useState(address || "");
  const [payee, setPayee] = useState("");
  const [payer, setPayer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [currency, setCurrency] = useState(() => {
    const currencyKeys = Array.from(currencies.keys());
    return currencyKeys.length > 0 ? currencyKeys[0] : "";
  });
  const [storageChain, setStorageChain] = useState(() => {
    const chains = Array.from(storageChains.keys());
    return chains.length > 0 ? chains[0] : "";
  });

  const isValidEthereumAddress = (address: string): boolean => {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  };

  const validateInputs = () => {
    const errors: string[] = [];
    if (!isValidEthereumAddress(creator))
      errors.push("Invalid creator Ethereum address");
    if (!isValidEthereumAddress(payee))
      errors.push("Invalid payee Ethereum address");
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      errors.push("Invalid amount");
    if (!currency || !currencies.has(currency)) errors.push("Invalid currency");
    if (!storageChain || !storageChains.has(storageChain))
      errors.push("Invalid storage chain");
    return errors;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const createRequest = async () => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (!walletClient || !address) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrency = currencies.get(currency);
    const selectedStorageChain = storageChains.get(storageChain);

    if (!selectedCurrency || !selectedStorageChain) {
      toast({
        title: "Configuration Error",
        description: "Invalid currency or storage chain configuration",
        variant: "destructive",
      });
      return;
    }

    let attachmentUrl = null;
    if (attachment) {
      try {
        attachmentUrl = await uploadToCloudinary(attachment);
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to upload attachment",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const signatureProvider = new Web3SignatureProvider(walletClient);
      const requestClient = new RequestNetwork({
        nodeConnectionConfig: {
          baseURL: selectedStorageChain.gateway,
        },
        signatureProvider,
      });

      const requestCreateParameters: Types.ICreateRequestParameters = {
        requestInfo: {
          currency: {
            type: selectedCurrency.type,
            value: selectedCurrency.value,
            network: selectedCurrency.network,
          },
          expectedAmount: parseUnits(
            amount,
            selectedCurrency.decimals
          ).toString(),
          payee: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payee,
          },
          payer: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payer,
          },
          timestamp: Utils.getCurrentTimestampInSecond(),
        },
        paymentNetwork: {
          id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
          parameters: {
            paymentNetworkName: selectedCurrency.network,
            paymentAddress: payee,
            feeAddress: zeroAddress,
            feeAmount: "0",
          },
        },
        contentData: {
          RequestType: "Single-Party",
          RequestTitle: requestTitle,
          RequestMemo: requestMemo,
          Attachment: attachmentUrl,
          creator: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: creator,
          },
        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: address as string,
        },
      };

      const request = await requestClient.createRequest(
        requestCreateParameters
      );
      const confirmedRequestData = await request.waitForConfirmation();

      toast({
        title: "Request Created",
        description: `Request ID: ${confirmedRequestData.requestId}`,
        variant: "default",
      });

      setIsLoading(false);
      return confirmedRequestData.requestId;
    } catch (err) {
      console.error("Error in createRequest:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      toast({
        title: "Request Creation Error",
        description: errorMessage,
        variant: "destructive",
      });

      setIsLoading(false);
      return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Single Party Request</CardTitle>
          <p className="text-xs text-gray-700">
            Suitable for contract agreements and single point payments. Does not
            require a third-party signer.
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creator Address
              </label>
              <Input
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder="Enter creator Ethereum address"
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Title
              </label>
              <Input
                type="text"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="Enter request Title"
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Document (Optional)
              </label>
              <Input
                type="file"
                onChange={handleFileChange}
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Memo
              </label>
              <Textarea
                value={requestMemo}
                onChange={(e) => setRequestMemo(e.target.value)}
                placeholder="Enter request memo.."
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payee Address
              </label>
              <Input
                type="text"
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="Enter payee address"
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payer Address
              </label>
              <Input
                type="text"
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                placeholder="Enter payer address"
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={isDisconnected}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isDisconnected}
              >
                {Array.from(currencies.entries()).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.symbol} ({value.network})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Chain
              </label>
              <select
                value={storageChain}
                onChange={(e) => setStorageChain(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isDisconnected}
              >
                {Array.from(storageChains.entries()).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name} ({value.type})
                  </option>
                ))}
              </select>
            </div>

          

            <Button
              onClick={createRequest}
              className="w-full"
              disabled={isDisconnected}
            >
              {isLoading ? "Creating Request.." : "Create Request"}
            </Button>

            {isDisconnected && (
              <p className="text-red-500 text-center mt-2">
                Please connect your wallet to create a request
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SinglePartyRequest;
