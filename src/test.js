const {ethers} = require('ethers')
const paypal = require('./paypal/paypal.json')

const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

// Contracts 
const paypalContract = new ethers.Contract('0xf49ea756C90147d17F64F4068134dBA71F7381E7', paypal.output.abi, provider);

async function getData() {
    const get = await paypalContract.filters.recipients()
    const trans = await paypalContract.queryFilter(get);
    console.log(trans)
  }
  
getData()