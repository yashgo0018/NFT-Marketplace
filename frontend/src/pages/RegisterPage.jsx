import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context";

function RegisterPage({ provider }) {
    const [name, setName] = useState("");
    const [image, setImage] = useState();
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState({
        name: "",
        image: "",
        username: ""
    });
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const { data: { message, registered } } = await axios.get(`http://localhost:8000/auth/get-nonce-message/${address}`);
        const signature = await signer.signMessage(message);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", image);
        formData.append("username", username);
        formData.append("address", address);
        formData.append("signature", signature);
        const { data: { user, token } } = registered
            ? await axios.post(`http://localhost:8000/auth/login`, {
                address,
                signature
            })
            : await axios.post("http://localhost:8000/auth/register", formData);
        auth.setLoginData({
            user,
            signer,
            token,
            isLoggedIn: true,
            expireTimeStamp: 0
        });
        navigate("/");
    }

    function updateUsername(username) {
        setUsername(username);
    }

    return <div>
        <form onSubmit={submit}>
            <input
                value={name}
                required
                onChange={(e) => setName(e.target.value)} />
            <input
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)} />
            <input
                type="file"
                required
                onChange={(e) => setImage(e.target.files[0])} />
            <input
                type="submit"
                value="submit" />
        </form>
    </div>;
}

export default RegisterPage;