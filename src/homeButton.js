
import { useNavigate, useLocation } from "react-router-dom";
import homeIcon from "./imagesTest/icons/home-icon.webp"; // replace with your own icon

export default function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: "1%",
        left: "8%",
        width: "8vw",
        height: "7vw",
        cursor: "pointer",
        border: "none",
        background: "none",
        zIndex: 99,
      }}
    >
      <img
        src={homeIcon}
        alt="Home"
        style={{ width: "100%", height: "100%", zIndex: 30,}}
        
      />
    </button>
  );
}