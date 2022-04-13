import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context";

function OnlyAdmin({ children }) {
    const auth = useContext(AuthContext);

    if (!auth.isLoggedIn || !auth.user.isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
}

export default OnlyAdmin;