// src/components/QRScanner.tsx
import React, { useEffect, useState } from "react";
import "./QRScanner.css";
import QRCode from "react-qr-code";

// ------------- Interfaces -------------
interface ProofResponse {
  success: boolean;
  proofRequestId: string;
  inviation: string;
}

interface OfferResponse {
  success: boolean;
  credentialOfferId: string;
  invitation: string;
}

interface RecordData {
  record: {
    presentation: {
      presentationExchange: {
        verifiableCredential: Array<{
          credentialSubject: Record<string, any>;
        }>;
      };
    };
  };
}

// Updated interface to match actual API response
interface RegistrationApiResponse {
  status: string;
  count: number;
  data: Array<{
    id: number;
    employeename: string;
    mycid: string;
    date: string;
    employername: string;
    Workpermit: string;
    createdAt: string;
  }>;
}

// Keep the existing interface for the component's use
interface RegistrationData {
  workPermit: string;
}

// ------------- Component -------------
const QRScanner: React.FC = () => {
  // Proof‐request state
  const [proofRequestId, setProofRequestId] = useState<string | undefined>();
  const [invitation, setInvitation] = useState<string | undefined>();
  const [isVerified, setIsVerified] = useState(false);
  const [proofCredentialAttributes, setProofCredentialAttributes] = useState<
    Record<string, any> | null
  >(null);

  // Credential offer state
  const [showCredentialOffer, setShowCredentialOffer] = useState(false);
  const [credentialOfferId, setCredentialOfferId] = useState<string | undefined>();
  const [offerInvitation, setOfferInvitation] = useState<string | undefined>();
  const [isCredentialAccepted, setIsCredentialAccepted] = useState(false);
  
  // Loading state for CID verification
  const [isCheckingCID, setIsCheckingCID] = useState(false);

  // Base URLs
  const registrationBaseUrl = "http://localhost:4001/api/v1/registrationDetails";
  const credentialOfferUrl = "http://localhost:4000/api/credentials/offer-credential";

  // ------------- Helper: verifyCID -------------
  const verifyCID = async (cid: string) => {
    try {
      const url = `${registrationBaseUrl}/${encodeURIComponent(cid)}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Registration API returned status ${res.status}`);
      }
      const data = await res.json();
      console.log("verifyCID → returned data:", data);
      return data;
    } catch (err) {
      console.error("Error in verifyCID():", err);
      return null;
    }
  };

  // ------------- Helper: getRegistrationDetails -------------
  const getRegistrationDetails = async (cid: string): Promise<RegistrationData | null> => {
    try {
      const url = `${registrationBaseUrl}/registerDetails`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Registration details API returned status ${res.status}`);
      }
      
      const apiResponse: RegistrationApiResponse = await res.json();
      console.log("Registration API response:", apiResponse);

      // Check if we have successful response with data
      if (apiResponse.status === 'success' && apiResponse.data && apiResponse.data.length > 0) {
        // Find the record that matches the provided CID
        const matchingRecord = apiResponse.data.find(record => record.mycid === cid);
        
        if (matchingRecord) {
          const registrationData: RegistrationData = {
            workPermit: matchingRecord.Workpermit
          };
          
          console.log(`Found matching record for CID ${cid}:`, registrationData);
          return registrationData;
        } else {
          console.error(`No registration record found for CID: ${cid}`);
          return null;
        }
      } else {
        console.error("No registration data found in API response");
        return null;
      }
    } catch (err) {
      console.error("Error getting registration details:", err);
      return null;
    }
  };

  // ------------- Helper: offerCredential -------------
  const offerCredential = async (cid: string) => {
    try {
      // Get registration data from database using the specific CID
      const registrationData = await getRegistrationDetails(cid);
      console.log('registrationData for CID', cid, ':', registrationData)
      if (!registrationData) {
        alert(`Failed to get registration data for CID: ${cid}`);
        return;
      }

      // Prepare credential data mapping
      const credentialData = {
        "WorkPermit": registrationData.workPermit
      };

      const offerPayload = {
        protocolVersion: "v2",
        credentialFormats: {
          jsonld: {
            credential: {
              "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://dev-schema.sovio.id/schemas/419fa58e-1c14-4546-a8bf-a72a55d100f8"
              ],
              type: ["VerifiableCredential", "WorkPermit"], 
              credentialSubject: credentialData // e.g., { WorkPermit: "WP1749051928464861" }
            },
            options: {
              proofType: "Ed25519Signature2018",
              proofPurpose: "assertionMethod"
            }
          }
        }
      };

      console.log("Offering credential with payload:", JSON.stringify(offerPayload, null, 2));

      const response = await fetch(credentialOfferUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerPayload),
      });

      if (!response.ok) throw new Error("Credential offer failed");

      const result: OfferResponse = await response.json();
      if (result.success) {
        setCredentialOfferId(result.credentialOfferId);
        setOfferInvitation(result.invitation);
        setShowCredentialOffer(true);
      }
      console.log("Credential offer response:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error offering credential:", error);
      alert("Failed to offer credential");
    }
  };

  // 1. Handler to request a new proof
  const handleSubmit = async () => {
    console.log("handleSubmit called...");
    const payload = {
      protocolVersion: "v2",
      proofFormats: {
        presentationExchange: {
          presentationDefinition: {
            id: "d75c8b3c-ba4b-488a-bc62-f7bf5d4cd7ad",
            input_descriptors: [
              {
                constraints: {
                  fields: [
                    {
                      path: ["$.credentialSubject['CID']"],
                    },
                  ],
                },
                id: "input_1",
                schema: [
                  {
                    uri: "https://dev-schema.sovio.id/schemas/91de5c09-26b6-450e-ac88-644051a262a5",
                  },
                ],
              },
            ],
          },
        },
      },
    };

    try {
      const response = await fetch(
        "http://192.168.232.77:4000/api/proof/request-proof",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Request failed");

      const result: ProofResponse = await response.json();
      if (result.success) {
        setProofRequestId(result.proofRequestId);
        setInvitation(result.inviation);
      }
      console.log("Proof-request response:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error requesting proof:", error);
    }
  };

  // 2. Poll for proof status until "done"
  useEffect(() => {
    if (!proofRequestId) return;

    let pollInterval: NodeJS.Timeout;
    const fetchProofStatus = async () => {
      try {
        const res = await fetch(
          `http://192.168.232.77:4000/api/proof/proof-record/${proofRequestId}`
        );
        const statusData = await res.json();
        if (
          statusData.success &&
          statusData.record &&
          statusData.record.state === "done"
        ) {
          clearInterval(pollInterval);
          setIsVerified(true);
          fetchDataForProof();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollInterval = setInterval(fetchProofStatus, 2000);
    return () => clearInterval(pollInterval);
  }, [proofRequestId]);

  // 3. Poll for credential offer status
  useEffect(() => {
    if (!credentialOfferId) return;

    let pollInterval: NodeJS.Timeout;
    const fetchOfferStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/credentials/credential-record/${credentialOfferId}`
        );
        const statusData = await res.json();
        if (
          statusData.success &&
          statusData.record &&
          statusData.record.state === "done"
        ) {
          clearInterval(pollInterval);
          setIsCredentialAccepted(true);
        }
      } catch (err) {
        console.error("Credential offer polling error:", err);
      }
    };

    pollInterval = setInterval(fetchOfferStatus, 2000);
    return () => clearInterval(pollInterval);
  }, [credentialOfferId]);

  // 4. Once verified, fetch the actual credential subject
  const fetchDataForProof = async () => {
    if (!proofRequestId) return;
    try {
      const response = await fetch(
        `http://192.168.232.77:4000/api/proof/proof-record-data/${proofRequestId}`
      );
      if (!response.ok) throw new Error("Failed to fetch record data");

      const recordData: RecordData = await response.json();
      const credentialSubject =
        recordData.record.presentation.presentationExchange.verifiableCredential[0]
          .credentialSubject;

      console.log("Credential Subject:", credentialSubject);
      setProofCredentialAttributes(credentialSubject);

      // Get the CID from the credential subject
      const cid = credentialSubject.CID;
      console.log("Extracted CID for verification:", cid);

      // Show loading state while checking CID
      setIsCheckingCID(true);
      
      // Wait for 2 seconds while checking CID in database
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify CID exists in database
      const registrationInfo = await verifyCID(cid);
      
      setIsCheckingCID(false);
      
      if (registrationInfo) {
        console.log("Registration service returned:", registrationInfo);
        alert("CID Verified! Now offering credential...");
        // Automatically offer credential after verification, passing the CID
        setTimeout(() => {
          offerCredential(cid);
        }, 1000);
      } else {
        console.warn("No registration data found for CID:", cid);
        alert("Verification failed: CID not found in database");
        // Reset verification state - don't proceed to credential offer
        setIsVerified(false);
        // Optionally restart the process
        setTimeout(() => {
          handleSubmit();
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching record data:", error);
      alert("Error during verification process");
      setIsVerified(false);
      setIsCheckingCID(false);
    }
  };

  // 5. On mount, immediately request a new proof so invitation is set
  useEffect(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 6. RENDER logic

  // Show loading while checking CID in database
  if (isCheckingCID) {
    return (
      <div className="qr-data-container">
        <div className="qr-data-card">
          <div className="qr-data-header">
            <h2>🔍 Checking CID in Database</h2>
            <p>Please wait while we verify your CID...</p>
            <div className="loading-spinner">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  // Show credential accepted success
  if (isCredentialAccepted) {
    return (
      <div className="qr-data-container">
        <div className="qr-data-card">
          <div className="qr-data-header">
            <h2>🎉 Credential Accepted!</h2>
            <p>The credential has been successfully added to the user's wallet.</p>
          </div>
          <button 
            className="qr-new-button" 
            onClick={() => {
              // Reset all states to start over
              setProofRequestId(undefined);
              setInvitation(undefined);
              setIsVerified(false);
              setProofCredentialAttributes(null);
              setShowCredentialOffer(false);
              setCredentialOfferId(undefined);
              setOfferInvitation(undefined);
              setIsCredentialAccepted(false);
              setIsCheckingCID(false);
              handleSubmit();
            }}
          >
            Start New Verification
          </button>
        </div>
      </div>
    );
  }

  // Show credential offer QR
  if (showCredentialOffer && !isCredentialAccepted) {
    return (
      <div className="qr-scanner-container">
        <div className="qr-placeholder">
          <QRCode value={offerInvitation || "Loading..."} size={180} />
        </div>
        <div className="qr-instructions">
          <h3>Accept Credential</h3>
          <p>Scan this QR code with your wallet to accept the credential.</p>
        </div>
      </div>
    );
  }

  // Show proof verification QR (initial state)
  if (!isVerified) {
    return (
      <div className="qr-scanner-container">
        <div className="qr-placeholder">
          <QRCode value={invitation || "Loading..."} size={180} />
        </div>
        <div className="qr-instructions">
          <p>Scan this QR code to verify your identity.</p>
          <button className="qr-new-button" onClick={handleSubmit}>
            New
          </button>
        </div>
      </div>
    );
  }

  // This state should not be reached now since we automatically offer credential
  return (
    <div className="qr-data-container">
      <div className="qr-data-card">
        <div className="qr-data-header">
          <h2>Processing...</h2>
          <p>Preparing credential offer...</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;