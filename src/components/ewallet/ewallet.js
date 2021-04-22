import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import EwalletService from '../services/ewallet-services';

const WITHDRAW = 'Withdraw';
const DEPOSIT = 'Deposit';

const Ewallets = () => {

  const emptyArray = [];
  const [ownerList, setOwnerList] = useState(emptyArray);
  const [ewalletList, setEwalletList] = useState([]);
  const [show, setShow] = useState(false);
  const [actionLabel, setActionLabel] = useState('');
  const [selectedWallet, setSelectedWallet] = useState();
  const [amount, setAmount] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getAllEntities = async () => {
    await EwalletService.getAll()
      .then((response) => {
        setOwnerList(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const createEwalletList = () => {
    const newEwalletList = [];
    ownerList.forEach(owner => {
      owner.ewallets?.forEach(ewallet => {
        const newEwallet = {...ewallet, owner: {name: owner.name, id: owner.id} };
        newEwalletList.push(newEwallet);
      })
    })
    setEwalletList([...newEwalletList]);
  }

  useEffect(() => {
    getAllEntities();
  }, []);

  useEffect(() => {
    createEwalletList();
  }, [ownerList]);

  console.log('ewalletList before return:', ewalletList);

  const handleActionClick = (ewalletId, type) => {
    console.log('Deposit for id is clicked:', ewalletId);
    setActionLabel(type > 0 ? DEPOSIT : WITHDRAW);
    const activeEwallet = ewalletList.find((ewallet) => ewallet.id === ewalletId);
    if(activeEwallet) {
      setSelectedWallet({...activeEwallet});
      setAmount();
      handleShow();
    }
    console.log('*** activeEwallet:', activeEwallet);
  }

  const onAmountChange = (value) => {
    console.log('= = onAmountChange, value:', value, typeof value);
    if(value && value.length > 0) {
      setAmount(Number(value));
    } else {
      setAmount();
    }
  }

  const proceedWithAction = () => {
    let updatedEwallet;
    if(actionLabel === DEPOSIT) {
      const response = EwalletService.deposit(selectedWallet, amount)
      .then((response) => {
        updatedEwallet = response.data;
        console.log('-- DEPOSIT response:', response);
        updateAmountOfEwallet(updatedEwallet);
      })
      .catch((error) => console.log(error));
    } else if (actionLabel === WITHDRAW) {
      EwalletService.withdraw(selectedWallet, amount)
      .then((response) => {
        updatedEwallet = response.data;
        console.log('-- WITHDRAW response:', response);
        updateAmountOfEwallet(updatedEwallet);
      })
      .catch((error) => console.log(error));
      
    }
    handleClose();
  }

  const updateAmountOfEwallet = (updatedEwallet) => {
    const newEwalletList = [];
    ewalletList.forEach(ewallet => {
      if(ewallet.id === updatedEwallet.id) {
        const newEwallet = {...ewallet, amount: updatedEwallet.amount };
        newEwalletList.push(newEwallet);
      } else {
        newEwalletList.push({...ewallet, owner: {...ewallet.owner} });
      }
    });
    setEwalletList([...newEwalletList]);
  }

  const getTableBody = () => {
    const tableBody = ewalletList.map((ewallet) => {
      console.log('getTableBody, ewallet:', ewallet);
      return (
        <tr key={`${ewallet.id}`}>
          <td>{ewallet.name}</td>
          <td>{ewallet.currency}</td>
          <td>{ewallet.amount}</td>
          <td>{ewallet.owner?.name}</td>
          <td className="text-right">
            <div className="btn-group flex-btn-group-container">
              <button type="button" class="btn btn-success" onClick={() => handleActionClick(ewallet.id, 1)}>
                <span className="d-none d-md-inline">{DEPOSIT}</span>
              </button>
              &nbsp;
              <button type="button" class="btn btn-danger" onClick={() => handleActionClick(ewallet.id, -1)} >
                <span className="d-none d-md-inline">{WITHDRAW}</span>
              </button>
            </div>
          </td>
        </tr>
      );
    })
    console.log('tableBody:', tableBody);
    return tableBody;
  };
  
  return (
    <>
      <div>
        <h2 id="ewallet-heading">Ewallets</h2>
        <div className="col-md-12 list">
          {ownerList && ownerList.length > 0 ? (
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th className="hand">Name</th>
                  <th className="hand">Currency</th>
                  <th className="hand">Amount</th>
                  <th className="hand">Owner</th>
                  <th className="hand">Operations</th>
                </tr>
              </thead>
              <tbody>
                {getTableBody()}
              </tbody>
            </table>
          ) : (
              <div className="alert alert-warning">No Ewallets found</div>
          )}
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{actionLabel}</Modal.Title>
        </Modal.Header>
          <div class="modal-body">
            <div key="owner">owner: {selectedWallet?.owner?.name}</div>
            <div key="name">{selectedWallet?.name}</div>
            { actionLabel === WITHDRAW && 
              <div key="amount">Current Limit: {`${selectedWallet?.amount} ${selectedWallet?.currency}`}</div>
            }
            <div>Enter amount: <input
                style={{ textAlign: 'right' }}
                key="amount"
                id="amount"
                name="amount"
                value={amount}
                placeholder="0"
                type="number"
                min="0.01"
                step="1"
                onChange={(e) => onAmountChange(e.target.value)}
              />
            </div>
          </div>
        <div class="modal-footer">
          <fieldset class="w-100">
            <button type="button" class="btn btn-primary" data-dismiss="modal" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" class="btn btn-success float-right" onClick={proceedWithAction}>
              {actionLabel}
            </button>
          </fieldset>
        </div>
      </Modal>
    </>
  );
};

export default Ewallets;
