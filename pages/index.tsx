import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Card from './card';
import StarsWrapper from './Star';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function Home(): JSX.Element {
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

  return (
    <div>
      <StarsWrapper /> {/*starry sky as background container */}
      <div className={styles.container} style={{ zIndex: 1 }}>
        <Head>
          <title>PolySwap</title>
          <meta
            content="Generated by @rainbow-me/create-rainbowkit"
            name="description"
          />
          {/* <link href="/favicon.ico" rel="icon" /> */}
        </Head>

        <main className={styles.main}>
          <div className={styles.buttoncontainer}>
            <div className={styles.connectbutton}>
              <ConnectButton />
            </div>
          </div>
          <div className={styles.highlightCard}>
            <Card
              hue={711}
              imgAlt="Image Alt Text"
              title="Astronaut"
              details={['']}
              buttonText="Mint"
            />
          </div>
        </main>
      </div>
    </div>
  );
}