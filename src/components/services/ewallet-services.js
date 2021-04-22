import axiosInstance from "./http-common";

const getAll = () => {
    return axiosInstance.get('/owner/list');
};

const withdraw = async (ewallet, amount) => {
  const operation = getOperation(ewallet, amount);
  return await axiosInstance.put('/ewallet/withdraw', operation);
};

const deposit = async (ewallet, amount) => {
  const operation = getOperation(ewallet, amount);
  return await axiosInstance.put('/ewallet/deposit', operation);
};

const getOperation = (ewallet, amount) => {
  return {
    ownerId: ewallet.owner.id,
    ewalletId: ewallet.id,
    amount: amount
  };
}
const EwalletService = {
  getAll,
  withdraw,
  deposit,
};

export default EwalletService;