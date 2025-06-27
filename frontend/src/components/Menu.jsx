import { Link } from "react-router-dom";
import { UseAuth } from "../contexts/AuthContext";

function Menu() {
    const { user, logoutUser } = UseAuth();

    return (
        <nav className="menu">
            <ul>
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