import React from "react";
import Blockies from "react-blockies";
import AddressWithCopy from "../../quickaccess/AddressWithCopy";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import TransactionAccordion from "../test/TransactionAccordion";

function History({ transactions }) {
  return (
    <div style={{ backgroundColor: "#f4f4f4" }}>
      <main>
        <TransactionAccordion transactions={transactions} isCompleted={true} />
      </main>
    </div>
  );
}

export default History;
