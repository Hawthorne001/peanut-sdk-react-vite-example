import { useState } from 'react'
import './App.css'
import peanut from '@squirrel-labs/peanut-sdk'
import { ethers } from 'ethers'
import { useEffect } from 'react'

function App() {
  const [signer, setSigner] = useState(null)
  const [amount, setAmount] = useState(0)
  const [link, setLink] = useState('')
  const [linkStatus, setLinkStatus] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts?.length > 0) {
          setIsConnected(true);
          connectWallet();
        } else {
          setIsConnected(false);
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', function (chainId) {
        console.log('chainChanged', chainId);
        connectWallet();
      });
    }
  }, []);


  const connectWallet = async () => {
    if (isConnected) return
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.enable()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const walletAddress = await signer.getAddress()

      // Get the chain ID
      const network = await provider.getNetwork()
      const chainId = network.chainId

      console.log({
        walletAddress,
        network,
        chainId,
      })
      setSigner(signer)
      setIsConnected(true)
    } else {
      console.log('Please install MetaMask!')
    }
  }

  const createLink = async () => {
    if (!signer) return
    console.log("signer ----------------------------", signer);
    // create link
    const { link, txReceipt } = await peanut.createLink({
      signer: signer,
      chainId: 80001,
      tokenAmount: 0.0001337,
      tokenType: 0, // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
      password: 'super_secret_password', // optional, if not provided, a random password will be generated
      eip1559: false,
      verbose: true,
    })
    setLink(link)
    console.log(txReceipt)
  }

  const claimLink = async () => {
    if (!signer || !link) return
    const claimTx = await peanut.claimLink({ signer: signer, link: link })
    console.log(claimTx)
  }

  const checkLinkStatus = async () => {
    if (!signer || !link) return
    try {
      const status = await peanut.getLinkStatus({ signer: signer, link: link })
      console.log(status)
      setLinkStatus(status)
    } catch (error) {
      console.error('Failed to check link status', error)
    }
  }
  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      <h2> {signer ? 'Connected' : 'Not connected'}</h2>

      <div>
        <h2>Create new link</h2>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={createLink}>Create link</button>
      </div>

      <div>
        <h2>Claim link</h2>
        <input
          type='text'
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button onClick={claimLink}>Claim link</button>
      </div>
      <div>
        <h2>Check Link Status</h2>
        <input
          type='text'
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button onClick={checkLinkStatus}>Check Status</button>
        {linkStatus && <p>Status of the link: {linkStatus}</p>}
      </div>
    </div>
  )
}

export default App
