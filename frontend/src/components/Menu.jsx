import { Link } from "react-router-dom";
import { UseAuth } from "../contexts/AuthContext";
import Notification from "./Notification.jsx";

function Menu() {
  const { user, logoutUser } = UseAuth();

  return (
    <nav className="menu">
      <ul>
        {user && (
          <li>
            <Notification />
          </li>
        )}
        <li>
          <Link to="/">Home</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/favorites">Favorites</Link>
            </li>
            <li>
              <button className="log-button" onClick={logoutUser}>
                Logout
              </button>
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
