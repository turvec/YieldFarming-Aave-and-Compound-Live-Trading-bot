import Web3 from 'web3'

import React, { Component } from 'react';
// import logo from '../logo.jpg';
import './App.css';
import '../assets/fa/css/all.min.css'

import Aggregator from '../abis/Aggregator.json'
import DAI_ABI from '../helpers/dai-abi.json'
import cDAI_ABI from '../helpers/cDai-abi.json'
import AAVE_ABI from '../helpers/aaveLendingPool-abi.json'
import { getCompoundAPY, getAaveAPY } from '../helpers/calculateAPY'

// Import components
import NavBar from './Navbar'

class App extends Component {

	constructor() {
		super();
		this.state = {
			web3: null,
			aggregator: null,
			dai_contract: null,
			dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
			cDAI_contract: null,
			cDAI_address: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // Address of Compound's cDAI
			aaveLendingPool_contract: null,
			aaveLendingPool_address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9", // Address of aaveLendingPool
			account: "0x0",
			walletBalance: "0",
			aggregatorBalance: "0",
			activeProtocol: "None",
			amountToDeposit: "0",
			loading: true
		};

		// Binding methods here
		this.depositHandler = this.depositHandler.bind(this)
		this.withdrawHandler = this.withdrawHandler.bind(this)
		this.rebalanceHandler = this.rebalanceHandler.bind(this)

	}

	componentWillMount() {
		this.loadWeb3()
	}

	async loadWeb3() {
		if (window.ethereum) {

			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable()

			this.loadBlockchainData(this.props.dispatch)

		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		} else {
			window.alert('Non-ethereum browser detected.')
		}
	}

	async loadBlockchainData(dispatch) {
		const web3 = new Web3(window.ethereum)
		this.setState({ web3 })

		const networkId = await web3.eth.net.getId()

		const accounts = await web3.eth.getAccounts()
		this.setState({ account: accounts[0] })

		const aggregator = new web3.eth.Contract(Aggregator.abi, Aggregator.networks[networkId].address)

		if (!aggregator) {
			window.alert('Aggregator smart contract not detected on the current network. Please select another network with Metamask.')
			return
		}

		this.setState({ aggregator })

		const dai = new web3.eth.Contract(DAI_ABI, this.state.dai_address)

		this.setState({ dai })

		const cDAI_contract = new web3.eth.Contract(cDAI_ABI, this.state.cDAI_address);

		this.setState({ cDAI_contract })

		const aaveLendingPool_contract = new web3.eth.Contract(AAVE_ABI, this.state.aaveLendingPool_address);

		this.setState({ aaveLendingPool_contract })

		await this.loadAccountInfo()

	}

	async loadAccountInfo() {

		let walletBalance = await this.state.dai.methods.balanceOf(this.state.account).call()
		let aggregatorBalance = await this.state.aggregator.methods.amountDeposited().call()

		walletBalance = this.state.web3.utils.fromWei(walletBalance, 'ether')
		aggregatorBalance = this.state.web3.utils.fromWei(aggregatorBalance, 'ether')

		this.setState({ walletBalance })
		this.setState({ aggregatorBalance })

		if (aggregatorBalance !== "0") {

			let activeProtocol = await this.state.aggregator.methods.balanceWhere().call()
			activeProtocol === this.state.cDAI_address ? this.setState({ activeProtocol: "Compound" }) : this.setState({ activeProtocol: "Aave" })

		} else {
			this.setState({ activeProtocol: "None" })
		}
	}

	async depositHandler() {
		if (this.state.walletBalance === "0") {
			window.alert('No funds in wallet')
			return
		}

		if (Number(this.state.amountToDeposit) > Number(this.state.walletBalance)) {
			window.alert('Insufficient funds')
			return
		}

		if (this.state.amountToDeposit <= 0) {
			window.alert('Cannot be 0 or negative')
			return
		}

		const amount = this.state.web3.utils.toWei(this.state.amountToDeposit.toString(), 'ether')
		const compAPY = await getCompoundAPY(this.state.cDAI_contract)
		const aaveAPY = await getAaveAPY(this.state.aaveLendingPool_contract)

		this.state.dai.methods.approve(this.state.aggregator._address, amount).send({ from: this.state.account })
			.on('transactionHash', () => {
				this.state.aggregator.methods.deposit(
					amount, compAPY, aaveAPY
				).send({ from: this.state.account })
					.on('transactionHash', () => {
						this.loadAccountInfo()
					})
			})
	}

	async rebalanceHandler() {
		if (this.state.aggregatorBalance === "0") {
			window.alert('No funds in contract')
			return
		}

		const compAPY = await getCompoundAPY(this.state.cDAI_contract)
		const aaveAPY = await getAaveAPY(this.state.aaveLendingPool_contract)

		if ((compAPY > aaveAPY) && (this.state.activeProtocol === "Compound")) {
			window.alert('Funds are already in the higher protocol')
			return
		}

		if ((aaveAPY > compAPY) && (this.state.activeProtocol === "Aave")) {
			window.alert('Funds are already in the higher protocol')
			return
		}

		this.state.aggregator.methods.rebalance(
			compAPY,
			aaveAPY
		).send({ from: this.state.account })
			.on('transactionHash', () => {
				this.loadAccountInfo()
			})
	}

	async withdrawHandler() {
		if (this.state.aggregatorBalance === "0") {
			window.alert('No funds in contract')
			return
		}

		this.state.aggregator.methods.withdraw(
		).send({ from: this.state.account })
			.on('transactionHash', () => {
				this.loadAccountInfo()
			})
	}
	async web3Handler () {
		if(this.state.web3){
		  const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
		  this.setState({ account: accounts[0] })
		}
	}

	render() {
		return (
			<div>
				<NavBar web3Handler={this.web3Handler} account={this.state.account} balance={this.state.walletBalance} />
				<div className="container-fluid">
					<main role="main" className="col-lg-12">
						<div className="row">
							{/* <div className="col-6">
								<div class="container mt-5 mb-5 d-flex justify-content-center">
									<a
										href=""
										target="_blank"
										rel="noopener noreferrer"
									>
									<img src={logo} className="App-logo" alt="logo" />
									</a>
								</div>
							</div> */}
							<div className="col-12">
								<div class="container mt-5 mb-5 d-flex justify-content-center">
									<div class="card px-1 py-4">
										<div class="card-body">
										<h6 class="card-title mb-3">Connected Wallet Balance: {this.state.walletBalance} DAI</h6>
											<h6 class="card-title mb-3">Amount Staked : {this.state.aggregatorBalance} DAI </h6>
											<form onSubmit={(e) => {
												e.preventDefault()
												this.depositHandler()
											}}>
												<div class="row">
													<div class="col-sm-12">
														<div class="form-group">
														<label for="name">Start using this Instant Money Printing Bot Now!!</label> <input class="form-control" type="number" placeholder="Amount you want to deposit" onChange={(e) => this.setState({ amountToDeposit: e.target.value })}/> </div>
													</div>
												</div>
												<h6 class="information mt-4 text center">Yield Protocol Currently On: {this.state.activeProtocol}</h6>
												<div class="d-flex flex-row">
													<label class="radio ">
														<input type="radio" name="action"/>
														<button > Deposit </button> 
													</label> 
													<label class="radio mx-2" onClick={this.rebalanceHandler}> 
														<input type="radio" name="action" /> 
														<button type="button"> Move Fund </button>
													</label> 
													<label class="radio" onClick={this.withdrawHandler}> 
														<input type="radio" name="action" /> 
														<button type="button"> Withdraw </button>
													</label> 
												</div>
											</form>
											<div class=" d-flex flex-column text-center px-5 mt-3 mb-3"> <small class="agree-text">Please bare in mind that Turvec Na Boss no mean say the Bot na sure plug oo</small> <a href="#" class="terms">Turvec.bot</a> </div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</main>

				</div>
				
			</div>
		);
	}
}

export default App;
