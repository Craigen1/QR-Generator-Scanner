"use client";
import { useEffect, useState } from "react";

export default function Home() {
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
      } catch (err) {}
    };
    getPerson();
  }, []);

  const handlePaste = async (e) => {
    e.preventDefault();
    const readtText = await navigator.clipboard.readText();
    readtText.split("\n").map((text) => {
      let tText = text.split("\t");
      console.log(tText);
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

  const hanldeDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center text-center">
      <h2 className="font-bold text-2xl">Paste Text from Excel</h2>
      <div>
        <button
          onClick={handlePaste}
          className="bg-neutral-900 text-white p-2 rounded-md m-2"
        >
          Paste person
        </button>
      </div>
      {personData.map((person, index) => (
        <div key={index}>
          <label>Firstname:</label>
          <input
            value={person.fname}
            className="m-1 border p-1 rounded"
            type="text"
          />
          <label>Lastname:</label>
          <input
            value={person.lname}
            className="m-1 border p-1 rounded"
            type="text"
          />
          <label>Age:</label>
          <input
            value={person.age}
            className="m-1 border p-1 rounded"
            type="number"
          />
        </div>
      ))}
      <div className="flex flex-col border p-2 rounded-md w-1/2">
        {personData.map((item) => (
          <div key={item.personId} className="grid grid-cols-4 gap-2">
            <span>{item.fname}</span>
            <span>{item.lname}</span>
            <span>{item.age}</span>
            <button
              onClick={() => hanldeDelete(item.personId)}
              className="text-white bg-red-600 rounded-sm my-1"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
