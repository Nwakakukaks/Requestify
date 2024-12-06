"use client";
import React, { useEffect, useState } from "react";
import "./TransactionTypes.css";

import { useRouter } from "next/navigation";
import { useAccount, useNetwork, useWalletClient } from "wagmi";
import { RequestNetwork, Types } from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { useEthersV5Signer } from "@/hooks/use-ethers-signer";
import { useEthersV5Provider } from "@/hooks/use-ethers-provider";
import { currencies } from "@/hooks/currency";
import { storageChains } from "@/hooks/storage-chain";
import Queue from "./Types/Queue";
import History from "./Types/History";
import InitiateTransaction from "./Modal/ThirdParty";
import Link from "next/link";
import { Send } from "lucide-react";

const TransactionTypes = () => {
  const { address } = useAccount();
  const [transactions, setTransaction] = useState([]);

  const [activeTab, setActiveTab] = useState("queue");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { chain } = useNetwork();
  const provider = useEthersV5Provider();
  const signer = useEthersV5Signer();
  const [storageChain] = useState(() => {
    const chains = Array.from(storageChains.keys());
    return chains.length > 0 ? chains[0] : "";
  });

  const { data: walletClient } = useWalletClient();

  const [currency] = useState(() => {
    const currencyKeys = Array.from(currencies.keys());
    return currencyKeys.length > 0 ? currencyKeys[0] : "";
  });

  const [queueRequests, setQueueRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRequestCompletion = async (requestClient, requestId) => {
      try {
        const request = await requestClient.fromRequestId(requestId);
        let requestData = request.getData();
  
        // Polling mechanism to check request completion
        while (
          requestData.balance?.balance === undefined || 
          parseFloat(requestData.balance.balance) < parseFloat(requestData.expectedAmount)
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
          requestData = await request.refresh();
        }
  
        return true;
      } catch (error) {
        console.error(`Error checking request ${requestId}:`, error);
        return false;
      }
    };
  
    const fetchRequests = async () => {
      if (!address) return;
  
      const selectedCurrency = currencies.get(currency);
      const selectedStorageChain = storageChains.get(storageChain);
  
      if (!selectedCurrency || !selectedStorageChain) {
        toast.error("Invalid currency or storage chain configuration");
        return;
      }
  
      try {
        setIsLoading(true);
  
        const requestClient = new RequestNetwork({
          nodeConnectionConfig: {
            baseURL: selectedStorageChain.gateway,
          },
        });
  
        const identityAddress = address;
        const requestsResponse = await requestClient.fromIdentity({
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: identityAddress,
        });
  
        const transformedRequests = await Promise.all(
          requestsResponse.map(async (requestItem) => {
            const initialData = requestItem.getData();
            
            try {
              const request = await requestClient.fromRequestId(initialData.requestId);
              let requestData = request.getData();
  
              // Check if the request is completed
              const isCompleted = 
                requestData.balance?.balance !== undefined && 
                parseFloat(requestData.balance.balance) >= parseFloat(requestData.expectedAmount);
  
              return {
                requestId: initialData.requestId,
                contentData: initialData.extensions["content-data"]?.values || {},
                state: initialData.state,
                creator: initialData.creator,
                payee: initialData.payee,
                expectedAmount: initialData.expectedAmount,
                currency: initialData.currency,
                timestamp: initialData.timestamp,
                events: initialData.events,
                isCompleted: isCompleted,
                balance: requestData.balance?.balance
              };
            } catch (error) {
              console.error(`Error processing request ${initialData.requestId}:`, error);
              return null;
            }
          })
        );
  
        // Filter out any null results and sort
        const validRequests = transformedRequests.filter(request => request !== null);
        const sortedRequests = validRequests.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
  
        const queue = sortedRequests.filter(
          (request) => request.state === "created" && !request.isCompleted
        );
        const completed = sortedRequests.filter(
          (request) => request.isCompleted
        );
  
      
        for (const request of queue) {
          const isFullyCompleted = await checkRequestCompletion(
            requestClient, 
            request.requestId
          );
  
          if (isFullyCompleted) {
            queue.splice(queue.indexOf(request), 1);
            completed.push(request);
          }
        }
  
        setQueueRequests(queue);
        setCompletedRequests(completed);
        console.log(queue, completed)
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        toast.error("Failed to fetch requests");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchRequests();
  }, [address, activeTab]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderComponent = (tab) => {
    switch (tab) {
      case "queue":
        return (
          <Queue
            transactions={queueRequests}
            address={address}
            activeTab={activeTab}
          />
        );

      case "history":
        return (
          <History
            transactions={completedRequests}
            address={address}
            activeTab={activeTab}
          />
        );

      default:
        return (
          <Queue
            transactions={requests}
            address={address}
            activeTab={activeTab}
          />
        );
    }
  };

  return (
    <>
      <div className="mt-16">
        <div className="container-parent">
          <div className="flex flex-col-reverse gap-6 md:gap-0 md:flex-row  items-center justify-between pb-0 md:pb-[24px] px-[24px]">
            <h1 className="reqheader2">All Requests</h1>
            <Link
              href="/send-request"
              className="bg-[#29FF81] text-black font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Send className="w-5 h-5 text-black" />
              <span className="ml-2">New Request</span>
            </Link>
          </div>

          <div className="table-tabs w-full border-b border-[#dcdee0] px-[24px] pt-[24px]">
            <div className="flex justify-left space-x-4  ">
              <button
                className={`px-6 py-4  text-base font-bold ${
                  activeTab === "queue" ? "activeTabBtn" : "inactiveBtn"
                }`}
                onClick={() => handleTabChange("queue")}
              >
                Queue
              </button>

              <button
                className={`px-4 py-2  text-base font-bold ${
                  activeTab === "history" ? "activeTabBtn" : "inactiveBtn"
                }`}
                onClick={() => handleTabChange("history")}
              >
                Completed
              </button>
            </div>
          </div>
          <div className=" custom-container ">{renderComponent(activeTab)}</div>
        </div>
      </div>
      {isModalOpen && <InitiateTransaction onClose={closeModal} />}
    </>
  );
};

export default TransactionTypes;
