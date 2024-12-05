import React, { useEffect } from "react";
import AddressWithCopy from "../../quickaccess/AddressWithCopy";
import Blockies from "react-blockies";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import TransactionAccordion from "../test/TransactionAccordion";

function Queue({ transactions, address, activeTab }) {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: "#f4f4f4" }}>
      <main>
        <TransactionAccordion transactions={transactions} />
      </main>
    </div>
  );
}

export default Queue;
