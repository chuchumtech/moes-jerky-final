import axios from 'axios';

export const getDeliveryDates = async () => {
  const res = await axios.get('http://localhost:3050/api/deliverydates');
  return res.data;
};
