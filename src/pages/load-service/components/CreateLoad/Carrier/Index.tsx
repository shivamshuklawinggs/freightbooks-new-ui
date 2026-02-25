// Carier.jsx
import { useDispatch, useSelector } from "react-redux";
import Asset from "./Asset";
import { AppDispatch, RootState } from "@/redux/store";
import {  useEffect } from "react";
import { Typography } from "@mui/material";
import { fetchCarriers } from "@/redux/api";

const Carrier = () => {
  const dispatch = useDispatch<AppDispatch>();
  const search = useSelector((state:RootState) => state.carriers.search);

    useEffect(() => {
      dispatch(fetchCarriers({page:1,limit:10}));
    }, [search]);
  return (
    <>
      <Typography variant="h6"  color="primary">
        Carier Information
      </Typography>
      <Asset
        index={0}
      />

      {/* <div className="text-center mb-4">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={addNewCarierLocation}
        >
          <IoIosAdd /> Add Another Carier Location
        </button>
      </div> */}
    </>
  );
};

export default Carrier;