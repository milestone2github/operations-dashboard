import React, { useState } from 'react';
import Header from '../components/Header';

const NfoSchemes = () => {
  const [amcName, setAmcName] = useState('');
  const [schemeName, setSchemeName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/data/add-scheme?amcName=${encodeURIComponent(amcName)}&schemeName=${encodeURIComponent(schemeName)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('Scheme added:', result);
        alert("Scheme Successfully Added");
      } else {
        console.error('Failed to add scheme:', result.error);
      }
    } catch (error) {
      console.error('Error adding scheme:', error.message);
    }
  };
  
  

  return (
    <main className="w-full">
      <div className="sticky top-0 bg-white w-full px-2 md:px-6 z-10">
        <Header title="NFO Schemes" />
        <hr className="border-b border-slate-100 w-full" />
      </div>
      <section className="px-2 md:px-6 w-full py-[60px]">
        <form
          className="bg-gray-50 p-6 rounded-md border border-gray-200 w-full max-w-xl mx-auto"
          onSubmit={handleSubmit}
        >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Add New Scheme</h2>
          <div className="mb-4">
            <label
              htmlFor="amcName"
              className="block text-sm font-medium text-gray-700"
            >
              AMC Name
            </label>
            <input
              type="text"
              id="amcName"
              value={amcName}
              onChange={(e) => setAmcName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="schemeName"
              className="block text-sm font-medium text-gray-700"
            >
              Scheme Name
            </label>
            <input
              type="text"
              id="schemeName"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default NfoSchemes;
