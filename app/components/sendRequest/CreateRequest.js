"use client";
import "@/app/components/TransactionTypes.css";
import { useState } from "react";
import SinglePartyRequest from "./SingleParty";
import ThirdPartyRequest from "../Modal/ThirdParty";

export default function SendRequest() {
  const [activeTab, setActiveTab] = useState("single");

  return (
    <div className="container max-w-3xl mx-auto px-4 py-2 pt-[80px]">
      <div className="table-tabs w-full border-b border-[#dcdee0] px-[20px] pt-[24px]">
        <div className="flex justify-left space-x-4  ">
          <button
            className={`px-6 py-4  text-base font-bold ${
              activeTab === "single" ? "activeTabBtn" : "inactiveBtn"
            }`}
            onClick={() => setActiveTab("single")}
          >
            Single-Party
          </button>
          <button
            className={`px-4 py-2  text-base font-bold ${
              activeTab === "thirdparty" ? "activeTabBtn" : "inactiveBtn"
            }`}
            onClick={() => setActiveTab("thirdparty")}
          >
            Third-Party
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow max-w-3xl">
        {activeTab === "single" ? <SinglePartyRequest /> : <ThirdPartyRequest />}
      </div>
    </div>
  );
}
