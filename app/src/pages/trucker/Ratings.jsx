import * as React from 'react';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

export default function Ratings() {
  const [value, setValue] = React.useState(2);

  return (
    <div className=" flex-row border px-10 text-center rounded-md pb-2 shadow-sm ">
        <Box sx={{ '& > legend': { mt: 2, gap: 2 } }}>
      <div className="pt-3 ">
      <Typography className='' component="legend"><h1 className='font-bold  '>Rate our Services</h1></Typography>
      <Rating
        name="simple-controlled"
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      />
      </div>
      
    </Box>
    <div className=" pb-5  ">
        <textarea placeholder='Leave a comment....' className='w-[50%] text-black text-center border  p-2 rounded-md shadow-sm' name="" id=""></textarea>
       { console.log("value",value)}
       
    </div>
    <div className="">
    <button className='bg-green-500 w-[30%] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'>Submit</button>
    </div>

    </div>
  );
}