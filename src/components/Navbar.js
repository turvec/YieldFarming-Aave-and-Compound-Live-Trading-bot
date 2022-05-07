// import Identicon from 'identicon.js';
import React, { Component } from 'react';

class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-dark navbar-expand-sm sticky-top bg-success d-flex justify-content-center mb-5 shadow">
        <div className="row text-center">
          <div className="col-md-12" >
          <h3 className="text-white">Turvec Trading Bot </h3>
          </div>
          <div className="col-md-12" >
          <h1 className="text-white">Welcome to CryptoFarmers </h1>
          </div>
          <div className="col-md-12" >
          <div className='d-flex text-white justify-content-center'>
            {
              this.props.account 
              ?
              (
                  <a
                      className="nav-link small mx-3"
                      href={`https://etherscan.io/address/${this.props.account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <p className='text-white '>{ this.props.account.slice(0 , 13) + '...' }</p> 
                      <div>
                      {/* <img 
                        className='ml-2'
                        height={30}
                        width={30}
                        src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString() }`}
                        alt=''
                      /> */}
                    </div>
                  </a>)
              :
              (
                  <button onClick={this.props.web3Handler} className="btn btn-outline-primary" >Connect Wallet</button>
              ) 
            }
          </div>
          
          </div>
        </div>
      </nav>
        )
    }
}

export default Navbar