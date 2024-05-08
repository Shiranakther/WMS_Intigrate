import React, { useEffect, useState } from 'react'
import {Link} from 'react-router-dom'
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import Item from '../../../api/models/Item.model';

export default function Item_main() {
  const [AllItems,getAllItems] = useState([]);
  const [search, setSearch] = useState(''); //a save state for search bar
  const [loading, setLoading] = useState(false); //a save state for loading status
  const [error,setError] = useState(false); //a save state for an error mostly for fetching
  const [input, setInput] = useState(''); //a save state for input data

  //fetching all the item data from api
  //useEffect is a hook that runs after the first render and every update
  useEffect(() => {
  fetchItems(); //running async function to fetch data from api
}, []);

const fetchItems = async () => {
  try{
  setError(false);  //trying unless error occurs, set the error status to false
  setLoading(true); //loding while fetching data form api

  //fetching related data from the api
  const response = await fetch('/api/Item/getitem',
  {method:'post',headers:{'Content-Type':'application/json'}, //a workaround for api and client loading into two different ports by a proxy
  body:JSON.stringify(AllItems)});
  
  //turns fetched data to json
  const itemData = await response.json();//turns fetched data to json
  getAllItems(itemData); // assing json data to a state
  setLoading(false);   //ends loading state onece the fetching done
}catch(error){
  setError(true); //if an error occurs set error true
}};

// deleting an item from the api
// deleting an item from the api
// const SetItemDelete = async (id) => { 
//   try {
//     const res = await fetch (`/api/Item/item_delete/${id}`,
//     {method:'DELETE',headers:{'Content-Type':'application/json'},
//     body:JSON.stringify()}).then((res) => res.json());
//   } catch (error) {
//     console.log(error);
//   }
// };

const SetItemDelete = async (id) => { 
  try {
    await fetch(`/api/Item/item_delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    // After successful deletion, filter out the deleted item from AllItems
    const updatedItems = AllItems.filter(item => item.ItemID !== id);
    // Update the state with the filtered items
    getAllItems(updatedItems);
  } catch (error) {
    console.log(error);
  }
};



//searching items by ItemID
const searchItems = AllItems.filter((item) => 
  item.ItemID.toLowerCase().includes(search.toLowerCase()));

//a function to handle search through setting the search data to states
const handleSearch = (e) => {
  e.preventDefault();
  fetchItems(searchItems);
  renderItems(searchItems);
}

function generatePDF(item){
  const doc = new jsPDF();
   // Add header border
   doc.setDrawColor(0); // Set border color to black
   doc.rect(5, 5, doc.internal.pageSize.getWidth() - 10, 40); // Draw header border with increased height

   // Add header content
   doc.setFontSize(20);
   doc.setTextColor(0, 0, 255); // Set color to blue
   doc.text('Chaminda Stores', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
   doc.setFontSize(10);
   doc.setTextColor(0, 0, 0); // Reset color to black
   doc.setFontSize(10);
   doc.setTextColor(130,130,130); // Set color to blue
   doc.text('No 125, Mapatana, Horana', doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });
   doc.setFontSize(10);
   doc.text('TP : 075 - 6175658', doc.internal.pageSize.getWidth() / 2, 34, { align: 'center' });
   doc.setFontSize(16);
   // Calculate space needed for date and time text
   const currentDate = new Date();
   const formattedDate = currentDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
   const formattedTime = currentDate.toLocaleTimeString('en-US', { timeZone: 'UTC' });
   const dateTimeText = 'Date: ' + formattedDate + ' Time: ' + formattedTime;
   const xPos = 104;
   const yPos = 40; // Adjust as needed

   // Add current date and time
   doc.setFontSize(10);
   doc.setTextColor(0, 0, 0); // Set color to black
   doc.text(dateTimeText, xPos, yPos, { align: 'center' }); // Adjust the position as needed

   // Add document border
   doc.rect(5, 5, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10); // Draw document border

   // Add title with underline
   doc.setFontSize(16);
   doc.setDrawColor(0); // Set140,140 underline color to black

  const tableCol = ["ItemID","ItemDiscription","ItemType","ItemNoOfUints","supplierName"];
  const tableRow = [];

  item.forEach(item=>{
    const itemData = [
      item.ItemID,
      item.ItemDiscription,
      item.ItemType,
      item.ItemNoOfUints,
      item.curruntlevel,
      item.supplierName
    ];
    tableRow.push(itemData);
  });

  doc.autoTable(tableCol,tableRow,{startY:50});
  doc.text("Item Report",14,15);
   // Add footer
   doc.setFontSize(10);
   doc.setTextColor(255, 0, 0); // Set color to red
   doc.text('**Keep this report Confidential**', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
  doc.save("Item Report.pdf");
}
const itemCount = AllItems.length;
const totalUnitsCount = AllItems.reduce((total, item) => total + item.ItemNoOfUints, 0);
//rendering all the items from the api
const renderItems = (data) => {
    return (
      <div className='w-full '>
        <table className='  border border-black '>
          <thead className='text-md bg-blue-600 text-white'>
          
          <tr className=' outline outline-2 rounded-sm m-5'>
            <th className='text-center text-sm border border-black p-5'>ItemID</th>
            <th className='text-center text-sm border border-black p-5'>Item Name</th>
            <th className='text-center text-sm border border-black p-5'>Supplier Name</th>
            <th className='text-center text-sm border border-black p-5'>Item Discription</th>
            <th className='text-center text-sm border border-black p-5'>Units(Kg/L)</th>
            <th className='text-center text-sm border border-black p-5'>Inventory Level</th>
            <th className='text-center text-sm border border-black p-5'>Added Date</th>
            <th className='text-center text-sm border border-black p-5'>Updated Date</th>
            <th className='text-center text-sm border border-black p-5'>Action</th>
            </tr>
          </thead>
          <tbody className='border-spacing-y-2'>
        {data.map((item) => (
          <tr key={item.ItemID} className=' ' >
              <td className=' text-sm text-black bg-white border border-black p-5' id='iid'>{item.ItemID}</td>
              <td className=' text-sm text-black bg-white border border-black p-5' id='itype'>{item.ItemType }</td>
              <td className=' text-sm text-black bg-white border border-black p-5' id='itype'>{item.supplierName }</td>
              <td className=' text-sm text-black bg-white border border-black p-5' id='idisc'>{item.ItemDiscription}</td>
              <td className=' text-sm text-black bg-white border border-black p-5' id='noofunits'>{item.ItemNoOfUints}</td>
              <td className=' text-sm text-black bg-white border border-black p-5' id='curruntlevel'>{item.curruntlevel}</td>
              <td className=' text-sm text-black bg-white border border-black p-5'>{new Date(item.createdAt).toDateString()}</td>
              <td className=' text-sm text-black bg-white border border-black p-5'>{new Date(item.updatedAt).toDateString()}</td>
              <td className='text-sm text-black bg-white border border-black p-5 w-60'><Link to={`/Item_Update/${item.ItemID}`}><button className='w-20 bg-green-600 rounded-md p-3  text-white  hover:bg-slate-700 m-2' >Edit</button></Link>
              <button className='w-20 bg-red-600 rounded-md p-3  text-white   hover:bg-slate-700 m-2'  onClick={()=>SetItemDelete(item.ItemID)}>Delete</button> </td>
          </tr>
        ))}
        </tbody>
        </table>
      </div>
    );
    };

  //returning the main component of Item_main
  return (
    
    <div className='p-10 ml-72 justify-between'>

      <div className='flex justify-between p-8'>
      <h1 className='text-3xl font-semibold'>Item Mangement</h1>
      <div className=' ml-8 flex justify-between gap-5 items-center'>
      
      <form onSubmit={handleSearch}>
      <input className='w-80 h-13 rounded-md outline outline-2 outline-black p-4 hover:outline-slate-600 focus:outline-rose-700' 
      type='string' placeholder='Search Items by ItemID' value= {input} 
      onChange={e=>
        {setInput(e.target.value);
          setSearch(e.target.value)}} />
      </form>
      
     
      <Link to='/Item_add'>
      <button className='w-20 h-100 bg-blue-600 rounded-md p-3  text-white  hover:bg-slate-700' >New+</button>
      </Link>
      </div>
      </div>
      
      <div className='flex bg-slate-300 justify-between p-8 rounded-md overflow-auto w-full h-min-2 h-screen  '>
        <div className='w-full'>
          {loading?'Loading....':renderItems(AllItems)&&renderItems(searchItems)}
          {searchItems.length === 0 && <p className='text-red-700'>No Items Found</p>}
          <p className='text-red-700'>{error && 'An Error Occured! Please try again'}</p>
          </div>
      </div>
      <button className='w-full my-10 bg-blue-600 rounded-md p-3  text-white  hover:bg-slate-700' onClick={() => generatePDF(AllItems)}>Genarate Item Report</button>
    </div>
  )
}