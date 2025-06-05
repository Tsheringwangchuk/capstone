// src/components/VerifyQRScanner.tsx
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const VerifyQRScanner: React.FC = () => {
  const [proofRequestId, setProofRequestId] = useState<string>();
  const [invitation, setInvitation] = useState<string>();
  const [isVerified, setIsVerified] = useState(false);
  const [proofCredentialAttributes, setProofCredentialAttributes] = useState<
    Record<string, any> | null
  >(null);

   
    // Loading state for Workpermit verification
    const [isCheckingWorkpermit, setisCheckingWorkpermit] = useState(false);

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


  // Base URLs
  const registrationBaseUrl = "http://localhost:4001/api/v1/registrationDetails";

  // ------------- Helper: Workpermit -------------
  const verifyWorkPermit = async (Workpermit: string) => {
    try {
      const url = `${registrationBaseUrl}/${Workpermit}`;
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
      console.log("Workpermit → returned data:", data);
      return data;
    } catch (err) {
      console.error("Error in Workpermit():", err);
      return null;
    }
  };


  const handleSubmit = async () => {
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
                      path: ["$.credentialSubject['WorkPermit']"],
                    },
                  ],
                },
                id: "input_1",
                schema: [
                  {
                    uri: "https://dev-schema.sovio.id/schemas/419fa58e-1c14-4546-a8bf-a72a55d100f8",
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

      const result = await response.json();
      if (result.success) {
        setProofRequestId(result.proofRequestId);
        setInvitation(result.inviation);
      }
      console.log("Response:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error:", error);
    }
  };

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

      // Get the workpermit from the credential subject
      const workpermit = credentialSubject.WorkPermit;
      console.log("Extracted workpermit for verification:", workpermit);

      // Show loading state while checking Workpermit
      setisCheckingWorkpermit(true);
      
      // Wait for 2 seconds while checking workpermit in database
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify Workpermit exists in database
      const registrationInfo = await verifyWorkPermit(workpermit);
      
      setisCheckingWorkpermit(false);
      
      if (registrationInfo) {
        console.log("Registration service returned:", registrationInfo);
        
      } else {
        console.warn("No registration data found for workpermit:", workpermit);
        alert("Verification failed:  workpermit not found in database");
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
      setisCheckingWorkpermit(false);
    }
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  useEffect(() => {
    if (!proofRequestId) return;

    console.log("Polling for proofRequestId:", proofRequestId);
    let intervalId: ReturnType<typeof setInterval>;

    const fetchProofStatus = async () => {
      try {
        const res = await fetch(
          `http://192.168.232.77:4000/api/proof/proof-record/${proofRequestId}`
        );
        const statusData = await res.json();

        if (statusData.success) {
          console.log("Current state:", statusData.record.state);

          if (statusData.record.state === "done") {
            clearInterval(intervalId);
            setIsVerified(true);
            fetchDataForProof();
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    intervalId = setInterval(fetchProofStatus, 2000);
    return () => clearInterval(intervalId);
  }, [proofRequestId]);

   // Show loading while checking Workpermit in database
  if (isCheckingWorkpermit) {
    return (
      <div className="qr-data-container">
        <div className="qr-data-card">
          <div className="qr-data-header">
            <h2>🔍 Checking WorkPermit in Database</h2>
            <p>Please wait while we verify your Workpermit...</p>
            <div className="loading-spinner">⏳</div>
          </div>
        </div>
      </div>
    );
  }

  // While not yet verified, show the QR code prompt
  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 p-8">
        <div className="relative">
          <div className="w-64 h-64 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center transition-all duration-500">
            <QRCode
              value={invitation ?? "Loading..."}
              size={220}
              level="M"
              style={{ width: 250, height: 250 }}
            />
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Scan the QR to verify your work permit 
          </p>
          {/* <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            New
          </button> */}
        </div>
      </div>
    );
  }

  // Once verified, show welcome message
  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn p-4">
      <div className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="text-center bg-white/80 px-6 py-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">🇧🇹 WELCOME TO BHUTAN 🇧🇹</h2>
          <p className="text-gray-600 text-lg">
            Your Work Permit has been successfully verified!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyQRScanner;