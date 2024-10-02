"use client";
import { useEffect, useState } from "react";

const CopyFromExcel = () => {
  const [personData, setPersonData] = useState([]);
  const [lname, setLname] = useState("");
  const [fname, setFname] = useState("");
  const [age, setAge] = useState(0);

  useEffect(() => {
    const getPerson = async () => {
      try {
        const res = await fetch(`http://localhost:8080`);
        const data = await res.json();
        setPersonData(data);
      } catch (err) {
        console.error(err);
      }
    };
    getPerson();
  }, []);

  const handlePaste = async () => {
    const readText = await navigator.clipboard.readText();
    readText.split("\n").forEach((text) => {
      let tText = text.split("\t");
      const person = {
        fname: tText[0],
        lname: tText[1],
        age: tText[2],
      };
      setLname(person.lname);
      setFname(person.fname);
      setAge(person.age);
      addPerson(person);
    });
  };

  const addPerson = async (person) => {
    try {
      await fetch(`http://localhost:8080/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setPersonData((prev) =>
        prev.filter((personData) => personData.personId !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center text-center p-6">
      <form onSubmit={handlePaste}>
        <h2 className="font-bold text-3xl mb-4">Paste Text from Excel</h2>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 btn btn-sm text-white mb-4"
        >
          Paste
        </button>
      </form>
      <div className="overflow-x-auto w-full max-w-2xl">
        <table className="table w-full">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {personData.map((item) => (
              <tr key={item.personId}>
                <td>{item.fname}</td>
                <td>{item.lname}</td>
                <td>{item.age}</td>
                <td>
                  <button
                    onClick={() => handleDelete(item.personId)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CopyFromExcel;
