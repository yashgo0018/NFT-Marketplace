import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context";

function OnlyAuthorized({ children }) {
    const auth = useContext(AuthContext);

    if (!auth.isLoggedIn) {
        return <Navigate to="/" />;
    }

    return children;
}

export default OnlyAuthorized;