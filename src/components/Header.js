import Identicon from 'identicon.js'
import '../assets/bootstrap/css/bootstrap.min.css'

const Header = ({ web3Handler, account}) => {

    return (
      <nav className="navbar navbar-dark navbar-expand-sm sticky-top bg-success d-flex justify-content-center mb-5 shadow">
        <div className="row text-center">
          <div className="col-md-12" >
          <h3 className="text-white">Turvec Block </h3>
          </div>
          <div className="col-md-12" >
          <h1 className="text-white">Welcome to Earth2Verse </h1>
          </div>
          <div className="col-md-12" >
          <div className='d-flex text-white justify-content-center'>
          {
             account 
             ?
             (<p className='text-white '>{ account.slice(0 , 13) + '...' }</p>)
             :
            (
              <button onClick={web3Handler} className="btn btn-outline-primary" >Connect Wallet</button>
            ) 
          }
            
           {
             account 
             ?
             <div>
               <img 
                className='ml-2'
                height={30}
                width={30}
                src={`data:image/png;base64,${new Identicon(account, 30).toString() }`}
                alt=''
               />
             </div>
             :
             <div></div>
            }
          </div>
          </div>
        </div>
      </nav>
    );
}

export default Header;
