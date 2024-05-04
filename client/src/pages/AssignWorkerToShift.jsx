import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

export default function AssignWorkerToShift() {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedShift, setSelectedShift] = useState(() => localStorage.getItem('selectedShift') || '');
  const [selectedStaffForShift, setSelectedStaffForShift] = useState(() => {
    const storedData = localStorage.getItem('selectedStaffForShift');
    return storedData ? JSON.parse(storedData) : Object.fromEntries(shifts.map(shift => [shift._id, []]));
  });

  useEffect(() => {
    const fetchShiftsAndStaff = async () => {
      try {
        const shiftResponse = await axios.get('/api/workersShiftSchedule/shift');
        const staffResponse = await axios.get('/api/workersShiftSchedule/all/staff');
        setShifts(shiftResponse.data);
        setStaff(staffResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchShiftsAndStaff();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedShift', selectedShift);
  }, [selectedShift]);

  useEffect(() => {
    localStorage.setItem('selectedStaffForShift', JSON.stringify(selectedStaffForShift));
  }, [selectedStaffForShift]);

  const handleShiftChange = (e) => {
    setSelectedShift(e.target.value);
  };

  const handleStaffChange = (e) => {
    const staffId = e.target.value;
    const isChecked = e.target.checked;

    setSelectedStaffForShift(prevState => {
      const updatedSelectedStaff = { ...prevState };
      if (isChecked) {
        Object.keys(updatedSelectedStaff).forEach(shiftId => {
          if (shiftId !== selectedShift) {
            updatedSelectedStaff[shiftId] = updatedSelectedStaff[shiftId].filter(id => id !== staffId);
          }
        });
        updatedSelectedStaff[selectedShift] = updatedSelectedStaff[selectedShift] ? [...updatedSelectedStaff[selectedShift], staffId] : [staffId];
      } else {
        updatedSelectedStaff[selectedShift] = updatedSelectedStaff[selectedShift].filter(id => id !== staffId);
      }
      return updatedSelectedStaff;
    });
  };

  return (
    <div className='flex w-3/5 ml-96'>
      
    <div className='container mx-auto mt-14'>
    <h1 className="text-3xl font-bold mb-10 text-center text-slate-500">Assign Workers To Shift</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-md shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Shift</h2>
          <select value={selectedShift} onChange={handleShiftChange} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500">
            <option value="">Select Shift</option>
            {shifts.map(shift => (
              <option key={shift._id} value={shift._id}>{shift.shiftname}</option>
            ))}
          </select>
        </div>
        <div className="p-6 bg-white rounded-md shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Staff</h2>
          <div className="grid grid-cols-1 gap-2">
            {staff.map(member => (
              <div key={member._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={member._id}
                  checked={selectedStaffForShift[selectedShift]?.includes(member._id)}
                  onChange={handleStaffChange}
                  className="mr-2 cursor-pointer"
                />
                <label className="cursor-pointer">{member.username} - ID: {member.id} - Type: {member.type}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {shifts.map(shift => (
          <div key={shift._id} className="bg-white rounded-md shadow-md p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{shift.shiftname}</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">ID</th>
                    <th className="py-2 px-4 border">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStaffForShift[shift._id] && selectedStaffForShift[shift._id].length > 0 ? (
                    selectedStaffForShift[shift._id].map(id => {
                      const selectedStaffMember = staff.find(member => member._id === id);
                      return (
                        <tr key={id}>
                          <td className="border px-4 py-2">{selectedStaffMember ? selectedStaffMember.username : 'Staff member not found'}</td>
                          <td className="border px-4 py-2">{selectedStaffMember ? selectedStaffMember.id : '-'}</td>
                          <td className="border px-4 py-2">{selectedStaffMember ? selectedStaffMember.type : '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="border px-4 py-2" colSpan="3">No staff selected for this shift.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}