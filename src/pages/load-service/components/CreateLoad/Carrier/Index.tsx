// Carier.jsx
import { useDispatch, useSelector } from "react-redux";
import Asset from "./Asset";
import { AppDispatch, RootState } from "@/redux/store";
import {  useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import { fetchCarriers } from "@/redux/api";

const Carrier = () => {
  const dispatch = useDispatch<AppDispatch>();
  const search = useSelector((state:RootState) => state.carriers.search);

    useEffect(() => {
      dispatch(fetchCarriers({page:1,limit:10}));
    }, [search]);
  return (
    <Card elevation={2} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
       
        <Asset index={0} />
      </CardContent>
    </Card>
  );
};

export default Carrier;