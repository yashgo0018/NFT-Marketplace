import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../context";
import { useNavigate } from 'react-router-dom';

function Header({ provider }) {
    console.log(provider)
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    async function connect() {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const { data: { message, registered } } = await axios.get(`http://localhost:8000/auth/get-nonce-message/${address}`);
        if (!registered) {
            // redirect to register page
            navigate("/register");
            return;
        }
        const signature = await signer.signMessage(message);
        const { data: { user, token } } = await axios.post(`http://localhost:8000/auth/login`, { address, signature });
        auth.setLoginData({
            user,
            signer,
            token,
            isLoggedIn: true,
            expireTimeStamp: 0
        });
    }

    return <nav>
        {
            auth.isLoggedIn
                ? <>you are already logged in</>
                : <button onClick={connect}>Connect</button>
        }
    </nav>;
}

export default Header;