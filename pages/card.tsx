import React, { useState, useEffect } from "react";
import Web3, { Contract } from "web3";
import { Dialog,DialogTitle,DialogContent,DialogActions,Snackbar, Alert, TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import styles from '../styles/Card.module.css';
import contractABI from '../out/PolyswapRouter.sol/PolyswapRouter.json';
import tokenABI from '../out/ERC20.sol/ERC20.json';
import polyswapABI from '../out/PolyswapPair.sol/PolyswapPair.json'
import { ethers } from 'ethers';
import { setFlagsFromString } from "v8";

interface FlipCardProps {
  hue: number;
  details: string[];
}

const getTokenAddressBySymbol = (tokenSymbol: string): string => {
  // 显式声明 tokenAddressMap 的类型
  const tokenAddressMap: { [key: string]: string } = {
    TOKEN0: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // token0
    TOKEN1: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // token1
    TOKEN2: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9', //token2
    TOKEN3: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    // 添加更多的代币符号和地址映射
  };

  return tokenAddressMap[tokenSymbol] || '';
};

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
  // const [deal1amount, setDeal1Amount] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [whichflow, setwhichflow] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [withdrawfrom, setWithdrawfrom] = useState('');
  const [withdrawto, setWithdrawto] = useState('');
  const [fromamountchanged, setfromamountchanged] = useState(false);
  const [toamountchanged, settoamountchanged] = useState(false);
  const [enough, setenough] = useState(false);
  useEffect(() => {
    const fetchUserAddress = async () => {
      if ((window as any).ethereum) {
        console.log('success');
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

  useEffect(() => {
    const loadWeb3 = async () => {
      console.log("Checking web3...")
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        // 创建Web3实例
        try {
          const web3 = new Web3((window as any).ethereum);
          setWeb3Instance(web3);
          console.log("web3 instance created", web3);
          // 请求用户授权访问其以太坊账户
          await (window as any).ethereum.request({ method: "eth_requestAccounts" });
          console.log("ethereum enabled");
          if (!contractInstance) {
            const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
            console.log("contract instance created", contract);
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

  const handleFromTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFromToken(event.target.value as string);
  };

  const handleToTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setToToken(event.target.value as string);
  };

  const handleWF = (event: React.ChangeEvent<{ value: unknown }>) => {
    setWithdrawfrom(event.target.value as string);
  };

  const handleWT = (event: React.ChangeEvent<{ value: unknown }>) => {
    setWithdrawto(event.target.value as string);
  };

  const handleUpTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setUpToken(newToken);
  };

  const handleDownTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setDownToken(newToken);
  };

  const handleFromAmountChange = (event) => {
    const newAmount = event.target.value;
    setfromamountchanged(true);
    const weiValue = Web3.utils.toWei(newAmount, 'ether');
    setFromAmount(newAmount);
    // setDeal1Amount(weiValue);
    // console.log(deal1amount);
  };

  const handleToAmountChange = (event) => {
    const newAmount = event.target.value;
    settoamountchanged(true);
      const weiValue = Web3.utils.toWei(newAmount, 'ether');
      setToAmount(newAmount);
  };

  useEffect(() => {
    // 检查设置的值数量
    const values = [upToken, downToken, fromamount, toamount];
    const filledValues = values.filter(Boolean).length;

    if (filledValues == 3 && enough == false) {
      if (fromamount && upToken && downToken && !toamount ) {
        console.log('Calculating from upToken to downToken...');
        setwhichflow(0);
        calculateOtherAmountT(fromamount);
        setenough(true);
      } else if (toamount && upToken && downToken && !fromamount) {
        console.log('Calculating from downToken to upToken...');
        setwhichflow(1);
        calculateOtherAmountF(toamount);
        setenough(true);
      }
    }
    else if (filledValues == 4)
    {
        if(fromamountchanged == true)
        {
          setwhichflow(0);
          calculateOtherAmountT(fromamount);
        }
        if(toamountchanged == true)
        {
          setwhichflow(1);
          console.log(whichflow);
          calculateOtherAmountF(toamount);
          console.log(toamount);
          console.log(enough);
        }
    }
    else if ((filledValues == 3 && toamount == '' && enough == true)||(filledValues == 3 && fromamount == '' && enough ==true))
    {
      setFromAmount('');
      setToAmount('');
      setenough(false);
    }
  }, [upToken, downToken, fromamount, toamount]); // 这些是依赖项，任何一个变化都会触发这个效果

  useEffect(() => {
    console.log(whichflow); // 在回调函数中输出 whichflow 的值
  }, [whichflow]); 

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

  const handleConfirmSwapClick = async () => {
    if (fromamount && toamount && upToken && downToken) {
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if(whichflow == 0){
      const UpAddress = getTokenAddressBySymbol(upToken);
      const DownAddress = getTokenAddressBySymbol(downToken);
      const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
      console.log('approving token...');
      await upcontract.methods.approve(contractAddress,Web3.utils.toWei(fromamount, 'ether')).send({from:userAddress});
      const inputnumber = Number(fromamount) * (10 ** 18);
      console.log(inputnumber);
      console.log(UpAddress);
      console.log(DownAddress);
      console.log(userAddress);
      await contractInstance.methods.swapExactTokensForTokens(inputnumber, 0, [UpAddress, DownAddress], userAddress, true).send({from:userAddress});
      }else{
        const UpAddress = getTokenAddressBySymbol(upToken);
        const DownAddress = getTokenAddressBySymbol(downToken);
        const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
        console.log('approving token...');
        await upcontract.methods.approve(contractAddress,Web3.utils.toWei(fromamount, 'ether')).send({from:userAddress});
        const inputnumber = Number(fromamount) * (10 ** 18);
        console.log(inputnumber);
        console.log(UpAddress);
        console.log(DownAddress);
        console.log(userAddress);
        const maxUint256 = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
        await contractInstance.methods.swapTokensForExactTokens(inputnumber, maxUint256, [UpAddress, DownAddress], userAddress, true).send({from:userAddress});
        setOpenSnackbar(true);
      }
    }
  };

  const handleLPChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    // 根据用户选择的 Token 来更新 isCurved 状态
    if (value === 'Constant') {
      setLp('Constant');
      setIsCurved(false);
    } else if (value === 'Curve') {
      setLp('Curve')
      setIsCurved(true);
    }
  };

  const calculateOtherAmountT = async (value) => {
    console.log('pigggggggg');
    if (!upToken || !downToken || !fromamount) {
      console.log("biggggggggggggggggg");
      console.log(upToken);
      console.log(downToken);
      console.log(fromamount);
      setError('Please select both token types.');
      return;
    }
    try {
      setLoading(true);
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if (!web3) {
        console.log("00000000000000");
      }
      const UpAddress = getTokenAddressBySymbol(upToken);
      console.log(UpAddress);
      const DownAddress = getTokenAddressBySymbol(downToken);
      console.log(DownAddress);
      let calculated;
      const inputnumber = Number(value) * (10 ** 18);
      console.log(inputnumber);
      calculated = await contractInstance.methods.swapExactTokensForTokens(inputnumber, 0, [UpAddress, DownAddress], userAddress, false).call();
      const rate =Number(calculated[1]) / inputnumber;
      console.log(rate);
      setExchangeRate(rate.toString());
      setButtonText(`1 ${upToken} = ${rate.toFixed(4)} ${downToken}`);;
      console.log(calculated);
      const outputnumber = Number(calculated[1]) / (10 ** 18);
      console.log(outputnumber);
      // const outputAmount = outputnumber.toString();  // 转换 BigNumber 为字符串
      setToAmount(outputnumber.toString());
      setfromamountchanged(false);
      settoamountchanged(false);
      console.log(fromamount, toamount, upToken, downToken);
      setLoading(false);
    }
    catch (error) {
      console.error('Error calculating token amount:', error);
      setLoading(false);
    }
  };

  const calculateOtherAmountF = async (value) => {
    console.log('pigggggggg');
    if (!upToken || !downToken || !toamount) {
      console.log(upToken);
      console.log(downToken);
      console.log(toamount);
      setError('Please select both token types.');
      return;
    }
    try {
      setLoading(true);
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      if (!web3) {
        console.log("00000000000000");
      }
      const UpAddress = getTokenAddressBySymbol(upToken);
      console.log(UpAddress);
      const DownAddress = getTokenAddressBySymbol(downToken);
      console.log(DownAddress);
      let calculated;
      const inputnumber = Number(value) * (10 ** 18);
      console.log(inputnumber);
      const maxUint256 = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
      console.log(maxUint256);
      console.log(contractInstance);
      calculated = await contractInstance.methods.swapTokensForExactTokens(inputnumber, maxUint256, [DownAddress, UpAddress], userAddress, false).call();
      const rate =  inputnumber / Number(calculated[0])
      setExchangeRate(rate.toString());
      setButtonText(`1 ${upToken} = ${rate.toFixed(4)} ${downToken}`);;
      console.log(calculated);
      const outputnumber = Number(calculated[0]) / (10 ** 18);
      console.log(outputnumber);
      // const outputAmount = outputnumber.toString();  // 转换 BigNumber 为字符串
      setFromAmount(outputnumber.toString());
      settoamountchanged(false);
      setfromamountchanged(false);
      console.log(outputnumber);
      console.log(fromamount, toamount, upToken, downToken);
    } catch (error) {
      console.error('Error calculating token amount:', error);

      setLoading(false);
    }
  };

  const handleCreateLiquidity = async () => {
    if (!v1amount || !v2amount || !fromToken || !toToken) {
      setError('Please ensure all fields are filled out correctly.');
      return;
    }
    try {
      setLoading(true);
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      const UpAddress = getTokenAddressBySymbol(fromToken);
      const DownAddress = getTokenAddressBySymbol(toToken);
      const upcontract = new web3.eth.Contract(tokenABI.abi, UpAddress);
      const downcontract = new web3.eth.Contract(tokenABI.abi, DownAddress);
      await Promise.all([
        console.log('start calling'),
        upcontract.methods.approve(contractAddress, v1amount).send({ from: userAddress }),
        console.log(fromToken),
        downcontract.methods.approve(contractAddress, v2amount).send({ from: userAddress }),
        console.log(downToken),
      ]);
      console.log("approve finished!");
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

  const handleConfirmWithdraw = async () => {
    try {
      setLoading(true);
      console.log('fewhuifeh');
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      const UpAddress = getTokenAddressBySymbol(withdrawfrom);
      const DownAddress = getTokenAddressBySymbol(withdrawto);
      const polyswapcontract1 = new web3.eth.Contract(polyswapABI.abi, polyswapcontract1Address);
      const polyswapcontract2 = new web3.eth.Contract(polyswapABI.abi, polyswapcontract2Address);
      console.log('start calling'),
      console.log(UpAddress);
      console.log(DownAddress);
      const withdrawamount = Number(inputValue) * (10 ** 18);
      console.log(withdrawamount);
      if((UpAddress == '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'|| UpAddress == '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0') 
      && (DownAddress == '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' || DownAddress == '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'))
      {
        await polyswapcontract1.methods.approve(contractAddress, withdrawamount).send({ from: userAddress });
      }
      else if((UpAddress == '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' || UpAddress == '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9')
      && (DownAddress == '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' || DownAddress == '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'))
      {
        console.log('yesss');
        await polyswapcontract2.methods.approve(contractAddress, withdrawamount).send({ from: userAddress });
      }
      console.log("approve finished!");
      await contractInstance.methods.removeLiquidity(
        UpAddress,
        DownAddress,
        withdrawamount,
        0, // amountADesired
        0, // amountBDesired
        userAddress, // to (可以是用户的地址或其他目标地址)
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
            {/* {details.map((detail, index) => (
            <li key={index} className={styles['li']}>{detail}</li>
          ))} */}
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
              {/* {transactionHash && (
                <Grid item xs={12}>
                  <p>Transaction Hash: {transactionHash}</p>
                </Grid>
              )} */}
              {/* {exchangeRate && (
          <Grid item xs={12}>
            <p>Rate: {exchangeRate}</p>
          </Grid>
        )} */}
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
              <Grid item xs={5}>
                <Button variant="contained" color="primary" fullWidth onClick={handleCreateLiquidity}>
                  ADD
                </Button>
              </Grid>
              <Grid item xs={5}>
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
              <Grid item xs={2}>
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