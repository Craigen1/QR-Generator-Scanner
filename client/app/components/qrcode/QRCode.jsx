"use client";
import axios from "axios";
import NextImage from "next/image";
import { useEffect, useState } from "react";

const QRCodeGenerator = (p) => {
  const [QRdata, setQRData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getqr`, {
          withCredentials: true,
        });
        const data = await response.json();
        console.log(data);
        setQRData(data);
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
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.log(`Error Update: ${err}`);
    }
  };

  const hanldeDelete = async (id) => {
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
    <div className="m-4 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6 text-sky-600">
        QR Code Generator
      </h1>
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
          className="bg-sky-600 text-white py-2 px-4 rounded w-full hover:bg-sky-700 transition"
          onClick={generateQRCode}
        >
          Generate QR Code
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-6 w-full"></div>

      {/* QR Code Display Section */}
      <h1 className="text-2xl font-bold mb-4 text-sky-600">QR Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {QRdata.length <= 0 ? (
          <p className="text-neutral-500 text-center">No QR Code Available!</p>
        ) : (
          QRdata.map((qr) => (
            <div
              className="bg-white border rounded-lg shadow-md p-4 flex flex-col items-center"
              key={qr.qr_id}
            >
              {qr.qr_data ? (
                <NextImage
                  className="my-2"
                  alt="Qrcode"
                  width={150}
                  height={150}
                  src={qr.qr_data}
                />
              ) : (
                <div>No QR code available</div>
              )}

              <div className="text-center mt-3 mb-2">
                <p className="font-bold text-sky-600">{qr.QRitem_name}</p>
                <p className="text-gray-600">Price: ${qr.QRprice}</p>
                <p
                  className={
                    qr.status === "Good"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  Status: {qr.status}
                </p>
              </div>

              <div className="w-full flex gap-2 mb-2">
                <button
                  disabled={qr.status ? true : false}
                  id="A"
                  onClick={() => handleUpdateStatus(qr.qr_id, "A")}
                  className="bg-green-600 text-white py-1 px-3 rounded w-full hover:bg-green-700 transition"
                >
                  Good
                </button>
                <button
                  disabled={qr.status ? true : false}
                  id="B"
                  onClick={() => handleUpdateStatus(qr.qr_id, "B")}
                  className="bg-red-600 text-white py-1 px-3 rounded w-full hover:bg-red-700 transition"
                >
                  Bad
                </button>
              </div>

              <button
                onClick={() => handleDownload(qr)}
                className="bg-blue-600 text-white py-1 px-4 rounded w-full hover:bg-blue-700 transition"
              >
                Download QR
              </button>
              <button
                onClick={() => hanldeDelete(qr.qr_id)}
                className="text-red-600 mt-2"
              >
                Delete QR
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
