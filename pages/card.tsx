import React, { useState, useEffect } from "react";
import Web3, {Contract} from "web3";
import { TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import styles from '../styles/Card.module.css';
import contractABI from '../out/PolyswapRouter.sol/PolyswapRouter.json';
import tokenABI from '../out/ERC20.sol/ERC20.json';
import { ethers } from 'ethers';

interface FlipCardProps {
  hue: number;
  details: string[];
  // web3: Web3;
  // contract: any;
}

const getTokenAddressBySymbol = (tokenSymbol: string): string => {
  // 显式声明 tokenAddressMap 的类型
  const tokenAddressMap: { [key: string]: string } = {
    TOKEN0: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // token0
    TOKEN1: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // token1
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
  const [transactionHash, setTransactionHash] = useState('');
  const [lp, setLp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [calculatedAmount, setCalculatedAmount] = useState('');
  const [currentView, setCurrentView] = useState('rate');//change grid
  // const [contractInstance, setContractInstance] = useState(null);
  const [contractInstance, setContractInstance] = useState<Contract | null>(null);
  const contractAddress='0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
  const [token0contractInstance, setToken0ContractInstance] = useState<Contract | null>(null);
  const token0contractAddress='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const [token1contractInstance, setToken1ContractInstance] = useState<Contract | null>(null);
  const token1contractAddress='0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [isCurved,setIsCurved] = useState(false) ;
  const [userAddress, setUserAddress] = useState('');
  
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
    if (typeof window !== 'undefined' && (window as any).ethereum){
    // 创建Web3实例
    try{
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
    }catch (error) {
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
  
  const handleUpTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setUpToken(newToken);
    console.log("ssssssssss");
    if (downToken && fromamount){
      console.log("pppppppppppp");
      await calculateOtherAmountT(fromamount);
    }else if (downToken && toamount){
      console.log("oooooooooooooo");
      calculateOtherAmountF(toamount);
    }
  };

  const handleDownTokenChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newToken = event.target.value as string;
    setDownToken(newToken);
    console.log("ssssssssss");
    if (upToken && fromamount){
      console.log("pppppppppppp");
      await calculateOtherAmountT(fromamount);
    }else if (upToken && toamount){
      console.log("oooooooooooooo");
      calculateOtherAmountF(toamount);
    }
  };

  const handleFromAmountChange = async (event) => {
    const newAmount = event.target.value;
    const valueWithDecimals = newAmount + '000000000000000000';
    setFromAmount(newAmount);
    console.log(newAmount);
    if(upToken && downToken){
      console.log('calcuating');
      calculateOtherAmountT(valueWithDecimals);
    }
  };

  const handleToAmountChange = async (event) => {
    const newAmount = event.target.value;
    const valueWithDecimals = newAmount + '000000000000000000';
    setToAmount(newAmount);
    console.log(newAmount);
    if(upToken && downToken){
      calculateOtherAmountF(valueWithDecimals)
    }
  };




  
  // const handleLpChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setLp(event.target.value as string);
  // };

  const handleGetRateClick = () => {
    setCurrentView('rate');
    getRate();
  };

  const handleLiquidityClick = () => {
    setCurrentView('liquidity');
    performSwap();
  };

  const getRate = async () => {
    if (!toamount || !fromToken || !toToken) {
      setError('Please ensure all fields are filled out correctly.');
      return;
    }
    try {
      setLoading(true);
      const rate = await contractInstance.methods.getExchangeRate(fromToken, toToken, amount).call();
      setExchangeRate(rate);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exchange rate');
      setLoading(false);
    }
  };

  const performSwap = async () => {
    if (!fromamount || !fromToken || !toToken) {
      setError('Please ensure all fields are filled out correctly.');
      return;
    }
    try {
      setLoading(true);
      const receipt = await contractInstance.methods.swapTokens(fromToken, toToken, amount).send({ from: web3.currentProvider.selectedAddress });
      setTransactionHash(receipt.transactionHash);
      setLoading(false);
    } catch (err) {
      setError('Transaction failed');
      setLoading(false);
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
      if(!web3){
      console.log("00000000000000");}
      const UpAddress = getTokenAddressBySymbol(upToken);
      console.log(UpAddress);
      const DownAddress = getTokenAddressBySymbol(downToken);
      console.log(DownAddress);
      let calculated;
      const maxUint256 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'; 
      if (!toamount) {
        calculated = await contractInstance.methods.swapExactTokensForTokens(value, 0, [UpAddress, DownAddress], userAddress, false).call();
        setToAmount(calculated);
        console.log(calculated);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error calculating token amount:', error);
      // direction === 'from' ? setCalculatedAmount('') : setAmount('');
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
      if(!web3){
      console.log("00000000000000");}
      const UpAddress = getTokenAddressBySymbol(upToken);
      console.log(UpAddress);
      const DownAddress = getTokenAddressBySymbol(downToken);
      console.log(DownAddress);
      let calculated;
      const maxUint256 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'; 
      if (!fromamount) {
        calculated = await contractInstance.methods.swapTokensForExactTokens(value, maxUint256, [DownAddress, UpAddress], userAddress, false).call();
        setFromAmount(calculated);
        console.log(calculated);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error calculating token amount:', error);
      // direction === 'from' ? setCalculatedAmount('') : setAmount('');
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
      // 根据选定的代币符号获取代币地址
      const web3 = new Web3((window as any).ethereum);
      setWeb3Instance(web3);
      const tokenAAddress = getTokenAddressBySymbol(fromToken);
      const tokenBAddress = getTokenAddressBySymbol(toToken);
      const token0contract = new web3.eth.Contract(tokenABI.abi, token0contractAddress);
      const token1contract = new web3.eth.Contract(tokenABI.abi, token1contractAddress);
      await Promise.all([
        console.log('start calling'),
        token0contract.methods.approve(contractAddress, v1amount).send({ from: userAddress }),
        console.log("token0"),
        token1contract.methods.approve(contractAddress, v2amount).send({ from: userAddress }),
        console.log('token1')
      ]);
      console.log("approve finished!");
      //调用合约函数添加流动性
      const receipt = await contractInstance.methods.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        v1amount, // amountADesired
        v2amount, // amountBDesired
        0, // amountAMin
        0, // amountBMin
        userAddress, // to (可以是用户的地址或其他目标地址)
        isCurved // isCurveBased，这里根据实际情况传递参数
      ).send({ from: userAddress }); // 你需要从哪个地址发送交易
      // 处理返回的交易收据
      console.log('Transaction receipt:', receipt);
      setLoading(false);
    } catch (error) {
      console.error('Error creating liquidity:', error);
      setError('Transaction failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles['flip-card-container']} style={{ "--hue": hue }}>
      <Grid container spacing={2} className={styles['custom-grid-padding']}>
        <Grid item xs={12}>
          {/* {details.map((detail, index) => (
            <li key={index} className={styles['li']}>{detail}</li>
          ))} */}
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleGetRateClick}>
            S
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
          <TextField label="From Token" type="number" fullWidth value={fromamount} onChange={handleFromAmountChange}/>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={upToken} onChange={handleUpTokenChange}>
              <MenuItem value="TOKEN0">TOKEN0</MenuItem>
              <MenuItem value="TOKEN1">TOKEN1</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <TextField label="To Token" type="number" fullWidth value={toamount} onChange={handleToAmountChange} />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={downToken} onChange={handleDownTokenChange}>
              <MenuItem value="TOKEN0">TOKEN0</MenuItem>
              <MenuItem value="TOKEN1">TOKEN1</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color="primary" fullWidth onClick={getRate}>
            Get Exchange Rate
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color="secondary" fullWidth onClick={performSwap}>
            SWAP
          </Button>
        </Grid>
        {transactionHash && (
          <Grid item xs={12}>
          <p>Transaction Hash: {transactionHash}</p>
          </Grid>
        )}
        {exchangeRate && (
          <Grid item xs={12}>
            <p>Rate: {exchangeRate}</p>
          </Grid>
        )}
          </React.Fragment>
        )}
        {currentView === 'liquidity' && (
          <React.Fragment>
        <Grid item xs={9}>
          <TextField label="From Token" type="number" fullWidth value={v11amount} onChange={handleV1AmountChange}/>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={fromToken} onChange={handleFromTokenChange}>
              <MenuItem value="TOKEN0">TOKEN0</MenuItem>
              <MenuItem value="TOKEN1">TOKEN1</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <TextField label="To Token" type="number" fullWidth value={v22amount} onChange={handleV2AmountChange}/>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={toToken} onChange={handleToTokenChange}>
              <MenuItem value="TOKEN0">TOKEN0</MenuItem>
              <MenuItem value="TOKEN1">TOKEN1</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <Button variant="contained" color="primary" fullWidth onClick={handleCreateLiquidity}>
            Create
          </Button>
        </Grid>
        <Grid item xs={3}>
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
  );
};

export default FlipCard;