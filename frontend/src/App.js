import logo from './logo.svg';
import './App.css';
import { Component } from 'react';
import { ethers } from 'ethers';
import Header from './components/Header';
import { AuthContext } from './context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      provider: null,
      isLoggedIn: false,
      user: {
        name: "",
        address: "",
        image: "",
      },
      token: "",
      expireTimeStamp: 0,
      signer: null
    };
  }

  async componentDidMount() {
    if (!window.ethereum) {
      this.setState({ error: "Please install/update Metamask" });
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    this.setState({ provider });

    // reload on network change
    provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload();
      }
    });

    // reload if logged in and account changed 
    window.ethereum.on("accountsChanged", (account) => {
      if (this.state.isLoggedIn)
        window.location.reload();
    })
  }

  render() {
    const { error, provider, isLoggedIn, user, token, expireTimeStamp, signer } = this.state;
    if (error)
      return <div>{error}</div>;

    if (!provider)
      return <>Loading...</>;

    return (
      <Router>
        <AuthContext.Provider value={{
          isLoggedIn,
          user,
          token,
          expireTimeStamp,
          signer,
          setUser: (user) => { this.setState({ user }) },
          setToken: (token) => { this.setState({ token }) },
          setExpireTimeStamp: (expireTimeStamp) => { this.setState({ expireTimeStamp }) },
          setIsLoggedIn: (isLoggedIn) => { this.setState({ isLoggedIn }) },
          setSigner: (signer) => { this.setState({ signer }) },
          setLoginData: ({ user, isLoggedIn, signer, token, expireTimeStamp }) => { this.setState({ user, isLoggedIn, signer, token, expireTimeStamp }) }
        }}>
          <Header provider={provider} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage provider={provider} />} />
          </Routes>
        </AuthContext.Provider>
      </Router>
    );
  }
}

export default App;
