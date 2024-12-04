"use client";

import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useAccount } from "wagmi";

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

const TransactionAccordion = ({ transactions }) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 3 seconds
    }, 3000);

    // Cleanup the timeout on component unmount
    return () => clearTimeout(timer);
  }, []);

  const getStatusLabel = (request) => {
    // Determine status based on state and events
    switch (request.state) {
      case "created":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return request.state;
    }
  };

  const handleRequestAction = async (request) => {
    // Implement request-specific actions
    try {
      // Example action - you'd replace this with actual request processing logic
      console.log("Processing request:", request.requestId);
    } catch (error) {
      console.error("Failed to process request:", error);
      toast.error("Failed to process request");
    }
  };

  return (
    <div className="accordian-parent">
      {loading ? (
        <div className="text-black">Loading requests...</div> // Show loading text
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
                    {request.contentData.RequestType || "Unknown Type"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div style={{ fontWeight: "700" }}>
                    {request.contentData.RequestTitle || "Untitled Request"}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <div style={{ color: "#a1a3a7" }}>
                    {new Date(request.timestamp * 1000).toLocaleDateString()}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={1} md={1}>
                  <div className="accordian-txn-status">
                    {getStatusLabel(request)}
                  </div>
                </CustomGridItem>
                <CustomGridItem item xs={3} sm={2} md={2}>
                  <button
                    className={`action-btn ${
                      request.state === "completed"
                        ? "completed-action-btn"
                        : "waiting-action-btn"
                    }`}
                    onClick={() => handleRequestAction(request)}
                    disabled={
                      address !== request.contentData.signer1 ||
                      request.contentData.signer2
                    }
                  >
                    {request.state === "completed" ? "Completed" : "Sign"}
                  </button>
                </CustomGridItem>
              </Grid>
            </CustomAccordionSummary>
            <CustomAccordionDetails>
              <div className="flex-col justify-start items-start">
                <p className="text-start text-sm text-gray-700 mb-1">
                  Creator: {request.creator.value}
                </p>
                <p className="text-start text-sm text-gray-700 mb-1">
                  Payee: {request.payee.value}
                </p>
                <p className="text-start text-sm text-gray-700 mb-1">
                  Amount: {request.expectedAmount} {request.currency}
                </p>
                <p className="text-start text-sm text-gray-700 mb-1">
                  Required Signers: {request.contentData.signer1},{" "}
                  {request.contentData.signer2}
                </p>

                {request.events.map((event, idx) => (
                  <p
                    className="text-start text-sm text-gray-700 mb-1"
                    key={idx}
                  >
                    {event.name} by {event.actionSigner.value} at{" "}
                    {new Date(event.timestamp * 1000).toLocaleString()}
                  </p>
                ))}
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
