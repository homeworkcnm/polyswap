import React, { useState, useEffect } from "react";
import Web3, {Contract} from "web3";
import { TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import styles from '../styles/Card.module.css';
import contractABI from '../out/PolyswapRouter.sol/PolyswapRouter.json';

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
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [v1amount, setV1Amount] = useState('');
  const [v2amount, setV2Amount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [lp, setLp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [currentView, setCurrentView] = useState('rate');//change grid
  // const [contractInstance, setContractInstance] = useState(null);
  const [contractInstance, setContractInstance] = useState<Contract | null>(null);
  const contractAddress='0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [isCurved,setIsCurved] = useState('') ;
  
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

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      console.log("User address", userAddress);
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

  useEffect(() => {
    if (fromToken && toToken && amount) {
      getRate();
    }
  }, [fromToken, toToken, amount]);
  
  const handleV1AmountChange = (event) => {
    setV1Amount(event.target.value);
  };

  const handleV2AmountChange = (event) => {
    setV2Amount(event.target.value);
  };
  
  const handleAmountChange = async (event) => {
    const newAmount = event.target.value;
    setAmount(newAmount);
    await calculateOtherAmount(newAmount, 'from');
  };

  const handleCalculatedAmountChange = async (event) => {
    const newCalculatedAmount = event.target.value;
    setCalculatedAmount(newCalculatedAmount);
    await calculateOtherAmount(newCalculatedAmount, 'to');
  };

  const calculateOtherAmount = async (value, direction) => {
    if (!fromToken || !toToken) {
      setError('Please select both token types.');
      return;
    }
    try {
      setLoading(true);
      let calculated;
      const fromTokenAddress = getTokenAddressBySymbol(fromToken);
      const toTokenAddress = getTokenAddressBySymbol(toToken);
      if (direction === 'from') {
        calculated = await contractInstance.methods.swapExactTokensForTokens(value, 0, [fromTokenAddress, toTokenAddress], toTokenAddress).call();
        setCalculatedAmount(calculated);
      } else {
        calculated = await contractInstance.methods.swapTokensForExactTokens(value, 0, [fromTokenAddress, toTokenAddress], toTokenAddress).call();
        setAmount(calculated);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error calculating token amount:', error);
      direction === 'from' ? setCalculatedAmount('') : setAmount('');
      setLoading(false);
    }
  };

  const handleFromTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFromToken(event.target.value as string);
  };

  const handleToTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setToToken(event.target.value as string);
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
    if (!amount || !fromToken || !toToken) {
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
    if (!amount || !fromToken || !toToken) {
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

  const calculateAmount = async () => {
    try {
      const calculated = await contractInstance.methods.calculateTokenAmount(fromToken, toToken, amount).call();
      setCalculatedAmount(calculated);
    } catch (error) {
      console.error('Error calculating token amount:', error);
      setCalculatedAmount('');
    }
  };

  const handleLPChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const isCurved = event.target.value as string;
    setIsCurved(isCurved);
    // 根据用户选择的 Token 来更新 isCurved 状态
    if (lp === 'Constant') {
      setIsCurved('false');
    } else if (lp === 'Curve') {
      setIsCurved('true');
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
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      // 调用合约函数添加流动性
      const receipt = await contractInstance.methods.addLiquidity(
        tokenAAddress,
        tokenBAddress,
        v1amount, // amountADesired
        v2amount, // amountBDesired
        0, // amountAMin
        0, // amountBMin
        userAddress, // to (可以是用户的地址或其他目标地址)
        false // isCurveBased，这里根据实际情况传递参数
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
    <div className={styles['flip-card-container']} >
      <Grid container spacing={2} className={styles['custom-grid-padding']}>
        <Grid item xs={12}>
          {details.map((detail, index) => (
            <li key={index} className={styles['li']}>{detail}</li>
          ))}
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
          <TextField label="From Token" type="number" fullWidth value={amount} onChange={handleAmountChange}/>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={fromToken} onChange={handleFromTokenChange}>
              <MenuItem value="TOKEN0">TOKEN0</MenuItem>
              <MenuItem value="TOKEN1">TOKEN1</MenuItem>
              {/* Add more coins as needed */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <TextField label="To Token" fullWidth value={calculatedAmount} onChange={handleCalculatedAmountChange} />
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
          <TextField label="From Token" type="number" fullWidth value={v1amount} onChange={handleV1AmountChange}/>
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
          <TextField label="To Token" type="number" fullWidth value={v2amount} onChange={handleV2AmountChange}/>
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
            <Select value={isCurved} onChange={handleLPChange}>
              <MenuItem value="V1">Constant</MenuItem>
              <MenuItem value="V2">Curve</MenuItem>
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