import { useState, createContext, useEffect } from 'react';
import Header from './components/Header'
import Main from './components/Main'
import Login from './components/Login'
import { ethers } from 'ethers';
import paypal from './paypal/paypal.json'

const AppState = createContext();

function App() {
  const { ethereum } = window;
  const [login, setLogin] = useState(false);
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('');
  const [ercTokenAddress, setErcTokenAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [paypalContractAddress, setPaypalContractAddress] = useState('');
  const [explorer, setExplorer] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tokenChanged, setTokenChanged] = useState(false);
  const [showErc, setShowErc] = useState(false);
  const [ercLoading, setErcLoading] = useState(false);
  const [txLoading, setTxLoading] = useState('');
  const [showRecentTx, setShowRecentTx] = useState('');
  const [recentTx, setRecentTx] = useState({
    txhash: '',
    from: '',
    to: '',
    amount: '',
    symbol: ''
  });
  const [saveTxLoad, setSaveTxLoad] = useState('');

  async function getBal() {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner();
    const balance = await signer.getBalance();
    setBalance(ethers.utils.formatEther(balance))
  }
 
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const ERCABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)",
    "function symbol() external view returns (string memory)",
    "function name() external view returns (string memory)"
  ]
  // Contracts
  const ERCContract = new ethers.Contract(ercTokenAddress, ERCABI, signer);
  const paypalContract = new ethers.Contract(paypalContractAddress,
    paypal.output.abi, signer);

  const selectToken = async () => {
    try {
    setErcLoading(true);
    const name = await ERCContract.name();
    const balance = await ERCContract.balanceOf(address);
    const symbol = await ERCContract.symbol();
    setBalance(ethers.utils.formatEther(balance))
    setSymbol(symbol)
    setCurrency(name)
    setTokenChanged(true);
    setErcLoading(false);
  } catch(error) {
    setError(error.message)
    setErcLoading(false);
  }
}

  const removeToken = async () => {
    try {
    if (chain == "Goerli") {
      setCurrency("GoerliEther")
      setSymbol("GöEth")
    } else if (chain == "Sepolia") {
      setCurrency("SepoliaEther")
      setSymbol("sEth")
    }

    setErcTokenAddress('');
    setShowErc(false);
    setTokenChanged(false);
    getBal();
  } catch(error) {
    setError(error.message)
  }
}

  const transferAmount = async () => {
    setMessage('');
    setTxLoading(true);
    try {
      if (tokenChanged) {
        const tx = await ERCContract.transfer(recipientAddress, ethers.utils.parseEther(amount));
        await tx.wait();
        selectToken();

        setRecentTx({
          txhash: tx.hash,
          from: address,
          to: recipientAddress,
          amount: amount,
          symbol: symbol
        })

        setShowRecentTx(true);
      } else {
        const tx = await paypalContract._transfer(recipientAddress, symbol, {
          value: ethers.utils.parseEther(amount)
        });

        await tx.wait();
        getBal();
      }

      setMessage("Transaction Successful!!")
      setAmount('');
    } catch (error) {
      setError(error.message)
    }
    setTxLoading(false);
  }

  const saveTx = async () => {
    setSaveTxLoad(true);
    try {
      const tx = await paypalContract.saveTx(recentTx.from, recentTx.to, 
        ethers.utils.parseEther(recentTx.amount), recentTx.symbol);
        await tx.wait();

        setMessage("Transaction Saved Succesfully!")
    } catch (error) {
      setError(error.message)
    }

    setShowRecentTx(false);
    setSaveTxLoad(false);
  }

  useEffect(() => {
    ethereum.on("chainChanged", async (chainId) => {
      if (chainId == "0x5") {
        setChain("Goerli")
        setCurrency("GoerliEther");
        setSymbol("GöEth")
        setPaypalContractAddress('0xf49ea756C90147d17F64F4068134dBA71F7381E7')
        setExplorer("https://goerli.etherscan.io")

      } else if (chainId == "0xaa36a7") {
        setChain("Sepolia")
        setCurrency("SepoliaEther");
        setSymbol("sEth")
        setPaypalContractAddress('0x7899Fd3DF04000Fa6CdD6D36eB5904637A38bb40')
        setExplorer("https://sepolia.etherscan.io")

      } else {
        setLogin(false);
      }
      getBal();
    })

    ethereum.on("accountsChanged", async (accounts) => {
      setAddress(accounts[0])
    })
  })

  useEffect(() => {
    if(tokenChanged) {
      selectToken();
    } else {
      getBal();
    }
  }, [address])

  useEffect(() => {
    removeToken();
  }, [chain])


  return (
    <AppState.Provider value={{
      login, setLogin, address,
      setAddress, chain, setChain, symbol,
      setSymbol, balance, setBalance, currency, 
      setCurrency, getBal, ercTokenAddress, setErcTokenAddress,
      recipientAddress, setRecipientAddress, amount, setAmount,
      paypalContractAddress, setPaypalContractAddress, explorer, setExplorer,
      message, setMessage, error, setError, tokenChanged, setTokenChanged,
      showErc, setShowErc, ercLoading, setErcLoading,
      selectToken, removeToken, transferAmount, txLoading, setTxLoading,
      showRecentTx, setShowRecentTx, recentTx, setRecentTx, saveTxLoad, setSaveTxLoad,
      saveTx, paypalContract }}>
      <div className="min-w-full h-screen">
        {login ?
          <div className="min-w-full min-h-full">
            {/* Main Application */}
            <Header />
            <Main />
          </div>
          :
          <Login />
        }
      </div>
    </AppState.Provider>
  );
}

export default App;
export { AppState };