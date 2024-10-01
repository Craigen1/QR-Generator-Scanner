"use client";
import axios from "axios";
import NextImage from "next/image";
import { useEffect, useState } from "react";

const QRCodeGenerator = () => {
  const [QRdata, setQRData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getqr`, {
          withCredentials: true,
        });
        setQRData(response.data);
      } catch (err) {
        console.error("Error fetching QR data:", err);
      }
    };
    fetchData();
  }, []);

  const generateQRCode = async () => {
    if (!itemName) {
      console.warn("Please enter text to generate the QR code");
      return;
    }
    try {
      await axios.post(
        `http://localhost:8080/generate`,
        {
          QRitem_name: itemName,
          QRitem_desc: itemDesc,
          QRprice: itemPrice,
        },
        { withCredentials: true }
      );
      setItemName("");
      setItemDesc("");
      setItemPrice(0);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  const handleUpdateStatus = async (qr_id, btnId) => {
    try {
      const newStatus = btnId === "A" ? "Good" : "Bad";
      const response = await fetch(
        `http://localhost:8080/updated/status/${qr_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        setQRData((p) =>
          p.map((qrItem) =>
            qrItem.qr_id === qr_id ? { ...qrItem, status: newStatus } : qrItem
          )
        );
      }
      await response.json();
    } catch (err) {
      console.log(`Error Update: ${err}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/delete/qr/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setQRData((prev) => prev.filter((qr) => qr.qr_id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = (qr) => {
    const link = document.createElement("a");
    link.href = qr.qr_data;
    link.download = `${qr.QRitem_name}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* QR Code Display Section */}
      <div className="w-full flex justify-end">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded my-4 hover:bg-blue-700 transition"
          onClick={() => setIsModalOpen(true)}
        >
          View QR Codes
        </button>
      </div>

      <h1 className="text-3xl font-bold text-blue-600">QR Code Generator</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <input
          className="p-2 border rounded w-full mb-3"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item Name"
        />
        <input
          className="p-2 border rounded w-full mb-3"
          type="text"
          value={itemDesc}
          onChange={(e) => setItemDesc(e.target.value)}
          placeholder="Item Description"
        />
        <input
          className="p-2 border rounded w-full mb-3"
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          placeholder="Item Price"
        />
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700 transition"
          onClick={generateQRCode}
        >
          Generate QR Code
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Generated QR Codes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QRdata.length <= 0 ? (
                <p className="text-neutral-500 text-center">
                  No QR Code Available!
                </p>
              ) : (
                QRdata.map((qr) => (
                  <div
                    className="bg-gray-100 border rounded-lg shadow-md p-4 flex flex-col items-center"
                    key={qr.qr_id}
                  >
                    {qr.qr_data ? (
                      <NextImage
                        className="my-2 w-auto max-w-[150px] h-auto"
                        alt="Qrcode"
                        width={150}
                        height={150}
                        src={qr.qr_data}
                      />
                    ) : (
                      <div>No QR code available</div>
                    )}
                    <div className="mt-3 mb-2">
                      <div className="grid grid-cols-2 text-center">
                        Item:{" "}
                        <p className="font-bold text-sky-600">
                          {qr.QRitem_name}
                        </p>
                      </div>

                      {/* <p className="text-gray-600">Price: ${qr.QRprice}</p> */}
                      <div className="grid grid-cols-2 text-center">
                        <p> Status:</p>
                        <p
                          className={
                            qr.status === "Good"
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {qr.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <button
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition"
                        onClick={() => handleUpdateStatus(qr.qr_id, "A")}
                      >
                        👍
                      </button>
                      <button
                        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                        onClick={() => handleUpdateStatus(qr.qr_id, "B")}
                      >
                        👎
                      </button>
                      <button
                        className="bg-red-500 hover:text-black py-1 px-3 rounded hover:bg-red-600 transition"
                        onClick={() => handleDelete(qr.qr_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
