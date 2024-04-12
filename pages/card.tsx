import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import styles from '../styles/Card.module.css';

interface FlipCardProps {
  hue: number;
  details: string[];
  web3: Web3;
  contract: any;
}

const FlipCard: React.FC<FlipCardProps> = ({ hue, details }) => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [lp, setLp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFromTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFromToken(event.target.value as string);
  };

  const handleToTokenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setToToken(event.target.value as string);
  };
  
  const handleLpChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLp(event.target.value as string);
  };

  useEffect(() => {
    if (fromToken && toToken && amount) {
      getRate();
    }
  }, [fromToken, toToken, amount]);

  const getRate = async () => {
    try {
      setLoading(true);
      const rate = await contract.methods.getExchangeRate(fromToken, toToken, amount).call();
      setExchangeRate(rate);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exchange rate');
      setLoading(false);
    }
  };

  const performSwap = async () => {
    try {
      setLoading(true);
      const receipt = await contract.methods.swapTokens(fromToken, toToken, amount).send({ from: web3.currentProvider.selectedAddress });
      setTransactionHash(receipt.transactionHash);
      setLoading(false);
    } catch (err) {
      setError('Transaction failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles['flip-card-container']} style={{ "--hue": hue }}>
      <Grid container spacing={2} className={styles['custom-grid-padding']}>
        <Grid item xs={12}>
          {details.map((detail, index) => (
            <li key={index} className={styles['li']}>{detail}</li>
          ))}
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Liquidity Pool</InputLabel>
            <Select value={lp} onChange={handleLpChange} label="Liquidity Pool">
              <MenuItem value="LP1">LP1</MenuItem>
              <MenuItem value="LP2">LP2</MenuItem>
              {/* Add more LPs as needed */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <TextField label="From Token" fullWidth value={fromToken} onChange={handleFromTokenChange} />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={fromToken} onChange={handleFromTokenChange}>
              <MenuItem value="BTC">BTC</MenuItem>
              <MenuItem value="ETH">ETH</MenuItem>
              {/* Add more coins as needed */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={9}>
          <TextField label="To Token" fullWidth value={toToken} onChange={handleToTokenChange} />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>Coin Type</InputLabel>
            <Select value={toToken} onChange={handleToTokenChange}>
              <MenuItem value="BTC">BTC</MenuItem>
              <MenuItem value="ETH">ETH</MenuItem>
              {/* Add more coins as needed */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Amount" fullWidth value={amount} onChange={e => setAmount(e.target.value)} />
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
      </Grid>
        {/* <div className={styles['card-front']}>
          <ul className={styles['ul']}>
            {details.map((detail, index) => (
              <li key={index} className={styles['li']}>{detail}</li>
            ))}
          </ul> */}
          {/* <TextField
          label="From Token"
          variant="outlined"
          fullWidth
          value={fromToken}
          onChange={e => setFromToken(e.target.value)}
        />
        <TextField
          label="To Token"
          variant="outlined"
          fullWidth
          margin="normal"
          value={toToken}
          onChange={e => setToToken(e.target.value)}
        />
        <TextField
          label="Amount"
          variant="outlined"
          fullWidth
          margin="normal"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={getRate} fullWidth style={{ marginTop: '8px' }}>
          Get Exchange Rate
        </Button>
        {exchangeRate && <p>Rate: {exchangeRate}</p>}
        <Button variant="contained" color="secondary" onClick={performSwap} fullWidth style={{ marginTop: '8px' }}>
          {buttonText}
        </Button>
        {transactionHash && <p>Transaction Hash: {transactionHash}</p>} */}
        </div>
      // </div> 
  );
};

export default FlipCard;