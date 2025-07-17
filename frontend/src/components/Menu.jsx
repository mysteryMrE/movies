import { Link } from "react-router-dom";
import { UseAuth } from "../contexts/AuthContext";
import { UseWebSocket } from "../contexts/WebSocketContext";

function Menu() {
    const { user, logoutUser } = UseAuth();
    const { isConnected, toggleMute } = UseWebSocket();

    return (
        <nav className="menu">
            <ul>
                <li><button className = "log-button" onClick={toggleMute}>{isConnected ? "Disconnect" : "Connect"}</button></li>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {user ? (
                    <>
                        <li>
                            <Link to="/favorites">Favorites</Link>
                        </li>
                        <li>
                            <button className = "log-button" onClick={logoutUser}>Logout</button>
                        </li>
                    </>
                ) : (
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Menu;