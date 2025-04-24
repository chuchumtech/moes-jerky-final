import axios from 'axios';

export const getDeliveryDates = async () => {
  const res = await axios.get('https://moes-jerky-final.onrender.com/api/deliverydates');
  return res.data;
};
