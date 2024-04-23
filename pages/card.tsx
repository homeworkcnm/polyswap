import React, { useState, useEffect } from "react";
import Web3, { Contract } from "web3";
import { Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import styles from '../styles/Card.module.css';
import contractABI from '../out/PolyswapRouter.sol/PolyswapRouter.json';
import tokenABI from '../out/ERC20.sol/ERC20.json';
import polyswapABI from '../out/PolyswapPair.sol/PolyswapPair.json'
import { ethers } from 'ethers';

interface FlipCardProps {
  hue: number;
  details: string[];
}

//our primary tokens' addresses
const getTokenAddressBySymbol = (tokenSymbol: string): string => {
  const tokenAddressMap: { [key: string]: string } = {
    TOKEN0: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // token0
    TOKEN1: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // token1
    TOKEN2: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', //token2
    TOKEN3: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', //token3
    // add more if needed
  };

  return tokenAddressMap[tokenSymbol] || '';
};

//main fucntion including logic design and const set
const FlipCard: React.FC<FlipCardProps> = ({ hue, details }) => {
  const [upToken, setUpToken] = useState('');
  const [downToken, setDownToken] = useState('');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [fromamount, setFromAmount] = useState('');
  const [toamount, setToAmount] = useState('');
  const [v1amount, setV1Amount] = useState('');
  const [v11amount, setV11Amount] = useState('');
  const [v22amount, setV22Amount] = useState('');
  const [v2amount, setV2Amount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [lp, setLp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('rate');//change grid
  const [contractInstance, setContractInstance] = useState<Contract | null>(null);
  const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const polyswapcontract1Address = '0xc8EB95616FfacB1D4b5AD573a4c76D1982e3aC7b';
  const polyswapcontract2Address = '0xd883Bf377eadDBAfD9917565B20e737d32a53cC7';
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [isCurved, setIsCurved] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [buttonText, setButtonText] = useState('Get Exchange Rate');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [whichflow, setwhichflow] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [withdrawfrom, setWithdrawfrom] = useState('');
  const [withdrawto, setWithdrawto] = useState('');
  const [fromamountchanged, setfromamountchanged] = useState(false);
  const [toamountchanged, settoamountchanged] = useState(false);
  const [enough, setenough] = useState(false);

  //get the user's address
  useEffect(() => {
    const fetchUserAddress = async () => {
      if ((window as any).ethereum) {
        try {
          await (window as any).ethereum.enable();
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (error) {
          console.error('Failed to fetch user address:', error);
        }
      }
    };

    fetchUserAddress();
  }, []);

  //initializing web3 and our main contract
  useEffect(() => {
    const loadWeb3 = async () => {
      console.log("Checking web3...")
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const web3 = new Web3((window as any).ethereum);
          setWeb3Instance(web3);
          await (window as any).ethereum.request({ method: "eth_requestAccounts" });
          if (!contractInstance) {
            const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
            setContractInstance(contract);
          }
        } catch (error) {
          console.error("Error initializing web3 or contract:", error);
        }
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    loadWeb3();
  }, [contractInstance]);

  //initialize amount when creating the liquidity pool
  const handleV1AmountChange = (event) => {
    const etherValue = event.target.value;
    const weiValue = Web3.utils.toWei(etherValue, 'ether');
    setV11Amount(etherValue);
    setV1Amount(weiValue);
  };
  const handleV2AmountChange = (event) => {
    const etherValue = event.target.value;
    const weiValue = Web3.utils.toWei(etherValue, 'ether');
    setV22Amount(etherValue);
    setV2Amount(weiValue);
  };

  //handle the amount change of upper textfield in swap page
  const handleFromTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFromToken(event.target.value as string);
  };

  //handle the chage of bottom coin type in swap page
  const handleToTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setToToken(event.target.value as string);
  };

  //handle the textfield change in swap
  const handleFromAmountChange = (event) => {
    const newAmount = event.target.value;
    setfromamountchanged(true);
    const weiValue = Web3.utils.toWei(newAmount, 'ether');
    setFromAmount(newAmount);
  };

  //handle the textfield change in swap
  const handleToAmountChange = (event) => {
    const newAmount = event.target.value;
    settoamountchanged(true);
    const weiValue = Web3.utils.toWei(newAmount, 'ether');
    setToAmount(newAmount);
  };

  //wthdraw coin type
  const handleWF = (event: React.ChangeEvent<{ value: unknown }>) => {
    setWithdrawfrom(event.target.value as string);
  };
  const handleWT = (event: React.ChangeEvent<{ value: unknown }>) => {
    setWithdrawto(event.target.value as string);
  };


  //handle the change of upper coin type in liquidity page
  const handleUpTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setUpToken(newToken);
  };

  //handle the change of bottom coin type in liquidity page
  const handleDownTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setDownToken(newToken);
  };




  //refresh the number when one of the four main values is changed and its logic
  useEffect(() => {
    const values = [upToken, downToken, fromamount, toamount];
    const filledValues = values.filter(Boolean).length; //number of values already filled

    if (filledValues == 3 && enough == false) //user wants to get another amount when set three values
    {
      if (fromamount && upToken && downToken && !toamount) {
        setwhichflow(0);
        calculateOtherAmountT(fromamount);
        setenough(true);
      } else if (toamount && upToken && downToken && !fromamount) {
        setwhichflow(1);
        calculateOtherAmountF(toamount);
        setenough(true);
      }
    }
    else if (filledValues == 4) //already four values here define what will happen if one changes, refresh another amount correctly
    {
      if (fromamountchanged == true) {
        setwhichflow(0);
        calculateOtherAmountT(fromamount);
      }
      if (toamountchanged == true) {
        setwhichflow(1);;
        calculateOtherAmountF(toamount);
      }
    }
    else if ((filledValues == 3 && toamount == '' && enough == true) || (filledValues == 3 && fromamount == '' && enough == true)) //deleting 
    {
      setFromAmount('');
      setToAmount('');
      setenough(false);
    }
  }, [upToken, downToken, fromamount, toamount]);


  //page switch
  const handleGetRateClick = () => {
    setCurrentView('rate');
  };
  const handleLiquidityClick = () => {
    setCurrentView('liquidity');
  };


  const handleDialogOpen = () => {
    setOpenDialog(true);
  }

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const dialogStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const formControlStyle: React.CSSProperties = {
    margin: '8px',
    minWidth: 120,
  };

  //when will happen if user clicks confirm swap
  const handleConfirmSwapClick = async () => {
    if (fromamount && toamount && upToken && downToken) //judge whether all values are filled
    {
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if (whichflow == 0) //exact tokens to tokens
      {
        //get tokens' contract
        const UpAddress = getTokenAddressBySymbol(upToken);
        const DownAddress = getTokenAddressBySymbol(downToken);
        const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
        await upcontract.methods.approve(contractAddress, Web3.utils.toWei(fromamount, 'ether')).send({ from: userAddress });
        const inputnumber = Number(fromamount) * (10 ** 18);//wei
        await contractInstance.methods.swapExactTokensForTokens(inputnumber, 0, [UpAddress, DownAddress], userAddress, true).send({ from: userAddress });
      } else //tokens for exact tokens
      {
        const UpAddress = getTokenAddressBySymbol(upToken);
        const DownAddress = getTokenAddressBySymbol(downToken);
        const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
        await upcontract.methods.approve(contractAddress, Web3.utils.toWei(fromamount, 'ether')).send({ from: userAddress });
        const inputnumber = Number(fromamount) * (10 ** 18);
        const maxUint256 = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
        await contractInstance.methods.swapTokensForExactTokens(inputnumber, maxUint256, [UpAddress, DownAddress], userAddress, true).send({ from: userAddress });
        setOpenSnackbar(true);
      }
    }
  };

  //choose the pool type
  const handleLPChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    if (value === 'Constant') {
      setLp('Constant');
      setIsCurved(false);
    } else if (value === 'Curve') {
      setLp('Curve')
      setIsCurved(true);
    }
  };

  //calculate the bottom amount
  const calculateOtherAmountT = async (value) => {
    if (!upToken || !downToken || !fromamount) {
      setError('Please select both token types.');
      return;
    }
    try {
      setLoading(true);
      //check web3
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if (!web3) {
        console.log("00000000000000");
      }
      const UpAddress = getTokenAddressBySymbol(upToken);
      const DownAddress = getTokenAddressBySymbol(downToken);
      let calculated;
      const inputnumber = Number(value) * (10 ** 18);
      calculated = await contractInstance.methods.swapExactTokensForTokens(inputnumber, 0, [UpAddress, DownAddress], userAddress, false).call();
      //calculate the rate
      const rate = Number(calculated[1]) / inputnumber;
      setExchangeRate(rate.toString());
      setButtonText(`1 ${upToken} = ${rate.toFixed(4)} ${downToken}`);;
      const outputnumber = Number(calculated[1]) / (10 ** 18);
      //reset the new amount
      setToAmount(outputnumber.toString());
      setfromamountchanged(false);
      settoamountchanged(false);
      setLoading(false);
    }
    catch (error) {
      console.error('Error calculating token amount:', error);
      setLoading(false);
    }
  };

  //calculate the upper amount
  const calculateOtherAmountF = async (value) => {
    if (!upToken || !downToken || !toamount) {
      setError('Please select both token types.');
      return;
    }
    try {
      setLoading(true);
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if (!web3) {
      }
      const UpAddress = getTokenAddressBySymbol(upToken);
      const DownAddress = getTokenAddressBySymbol(downToken);
      let calculated;
      const inputnumber = Number(value) * (10 ** 18);
      const maxUint256 = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
      calculated = await contractInstance.methods.swapTokensForExactTokens(inputnumber, maxUint256, [DownAddress, UpAddress], userAddress, false).call();
      const rate = inputnumber / Number(calculated[0])
      setExchangeRate(rate.toString());
      setButtonText(`1 ${upToken} = ${rate.toFixed(4)} ${downToken}`);;
      const outputnumber = Number(calculated[0]) / (10 ** 18);
      setFromAmount(outputnumber.toString());
      settoamountchanged(false);
      setfromamountchanged(false);
    } catch (error) {
      console.error('Error calculating token amount:', error);
      setLoading(false);
    }
  };

  //create new pool
  const handleCreateLiquidity = async () => {
    if (!v1amount || !v2amount || !fromToken || !toToken) {
      setError('Please ensure all fields are filled out correctly.');
      return;
    }
    try {
      setLoading(true);
      //initalize web3 & contracts
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      const UpAddress = getTokenAddressBySymbol(fromToken);
      const DownAddress = getTokenAddressBySymbol(toToken);
      const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
      const downcontract = new web3.eth.Contract(tokenABI.abi, DownAddress);
      //wait for both tokens are approved
      await Promise.all([
        console.log('start calling'),
        upcontract.methods.approve(contractAddress, v1amount).send({ from: userAddress }),
        console.log(fromToken),
        downcontract.methods.approve(contractAddress, v2amount).send({ from: userAddress }),
        console.log(downToken),
      ]);
      console.log("approve finished!");
      //call function from contract
      const receipt = await contractInstance.methods.addLiquidity(
        UpAddress,
        DownAddress,
        v1amount, // amountADesired
        v2amount, // amountBDesired
        0, // amountAMin
        0, // amountBMin
        userAddress, // to (可以是用户的地址或其他目标地址)
        isCurved
      ).send({ from: userAddress });
      console.log('Transaction receipt:', receipt);
      setLoading(false);
    } catch (error) {
      console.error('Error creating liquidity:', error);
      setError('Transaction failed');
      setLoading(false);
    }
  };

  //handle the confirm swap
  const handleConfirmWithdraw = async () => {
    try {
      setLoading(true);
      console.log('fewhuifeh');
      //initialize web3 and contracts
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      const UpAddress = getTokenAddressBySymbol(withdrawfrom);
      const DownAddress = getTokenAddressBySymbol(withdrawto);
      const polyswapcontract1 = new web3.eth.Contract(polyswapABI.abi, polyswapcontract1Address);
      const polyswapcontract2 = new web3.eth.Contract(polyswapABI.abi, polyswapcontract2Address);
      const withdrawamount = Number(inputValue) * (10 ** 18);//wei
      //Constant pool
      if ((UpAddress == '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' || UpAddress == '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0')
        && (DownAddress == '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' || DownAddress == '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0')) {
        await polyswapcontract1.methods.approve(contractAddress, withdrawamount).send({ from: userAddress });
      }
      //Curve pool
      else if ((UpAddress == '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' || UpAddress == '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9')
        && (DownAddress == '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' || DownAddress == '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9')) {
        await polyswapcontract2.methods.approve(contractAddress, withdrawamount).send({ from: userAddress });
      }
      //call related function from contract
      await contractInstance.methods.removeLiquidity(
        UpAddress,
        DownAddress,
        withdrawamount,
        0, // amountADesired
        0, // amountBDesired
        userAddress, // to 
      ).send({ from: userAddress });
      setLoading(false);
      setOpenDialog(false);
      setWithdrawfrom('');
      setWithdrawto('');
      setInputValue('');
    } catch (error) {
      console.error('Error creating liquidity:', error);
      setError('Transaction failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            Swap successfully!
          </Alert>
        </Snackbar>
      </div>
      <div className={styles['flip-card-container']} style={{ "--hue": hue }}>
        <Grid container spacing={2} className={styles['custom-grid-padding']}>
          <Grid item xs={12}>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="primary" fullWidth onClick={handleGetRateClick}>
              SWAP
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="secondary" fullWidth onClick={handleLiquidityClick}>
              LIQUIDITY POOL
            </Button>
          </Grid>

          {currentView === 'rate' && (
            <React.Fragment>
              <Grid item xs={9}>
                <TextField label="From Token" type="text" fullWidth value={fromamount} onChange={handleFromAmountChange} />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Coin Type</InputLabel>
                  <Select value={upToken} onChange={handleUpTokenChange}>
                    <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                    <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                    <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                    <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={9}>
                <TextField label="To Token" type="text" fullWidth value={toamount} onChange={handleToAmountChange} />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Coin Type</InputLabel>
                  <Select value={downToken} onChange={handleDownTokenChange}>
                    <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                    <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                    <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                    <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="primary" fullWidth>
                  {buttonText}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="secondary" fullWidth onClick={handleConfirmSwapClick} >
                  CONFIRM SWAP
                </Button>
              </Grid>
            </React.Fragment>
          )}
          {currentView === 'liquidity' && (
            <React.Fragment>
              <Grid item xs={9}>
                <TextField label="From Token" type="number" fullWidth value={v11amount} onChange={handleV1AmountChange} />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Coin Type</InputLabel>
                  <Select value={fromToken} onChange={handleFromTokenChange}>
                    <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                    <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                    <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                    <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={9}>
                <TextField label="To Token" type="number" fullWidth value={v22amount} onChange={handleV2AmountChange} />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <InputLabel>Coin Type</InputLabel>
                  <Select value={toToken} onChange={handleToTokenChange}>
                    <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                    <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                    <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                    <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4.5}>
                <Button variant="contained" color="primary" fullWidth onClick={handleCreateLiquidity}>
                  ADD
                </Button>
              </Grid>
              <Grid item xs={4.5}>
                <Button variant="contained" color="primary" fullWidth onClick={handleDialogOpen}>
                  Withdraw
                </Button>
              </Grid>
              <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>TYPE IN</DialogTitle>
                <DialogContent>
                  <div style={dialogStyle}>
                    <FormControl style={formControlStyle}>
                      <InputLabel>From Coin</InputLabel>
                      <Select value={withdrawfrom} onChange={handleWF}>
                        <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                        <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                        <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                        <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl style={formControlStyle}>
                      <InputLabel>To Coin</InputLabel>
                      <Select value={withdrawto} onChange={handleWT}>
                        <MenuItem value="TOKEN0">TOKEN0</MenuItem>
                        <MenuItem value="TOKEN1">TOKEN1</MenuItem>
                        <MenuItem value="TOKEN2">TOKEN2</MenuItem>
                        <MenuItem value="TOKEN3">TOKEN3</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Amount"
                    type="number"
                    value={inputValue}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleDialogClose} color="primary">
                    CANCEL
                  </Button>
                  <Button onClick={handleConfirmWithdraw} color="primary">
                    CONFIRM
                  </Button>
                </DialogActions>
              </Dialog>
              <Grid item xs={2.5}>
                <FormControl fullWidth>
                  <InputLabel>Pool</InputLabel>
                  <Select value={lp} onChange={handleLPChange}>
                    <MenuItem value="Constant">Constant</MenuItem>
                    <MenuItem value="Curve">Curve</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </React.Fragment>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default FlipCard;