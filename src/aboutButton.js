import { useState } from "react";
import aboutIcon from "./imagesTest/icons/about-icon.webp";
import aboutImage from "./imagesTest/icons/about.webp";

export default function AboutButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => setIsOpen(!isOpen);

  return (
    <>
      {/* button */}
      <button
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "2%",
          left: "2%",
          width: "7vw",
          height: "6vw",
          cursor: "pointer",
          border: "none",
          background: "none",
          zIndex: 99,
        }}
      >
        <img
          src={aboutIcon}
          alt="About"
          style={{ width: "100%", height: "100%" }}
        />
      </button>

      {/* image */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)", // darkeerrrrr
            display: "flex",
            justifyContent: "center",
            alignItems: "start",
            zIndex: 9998,
            overflowY: "auto",
          }}
          onClick={handleClick}
        >
          <img
            src={aboutImage}
            alt="About Content"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "100%",
            }}
          />
        </div>
      )}
    </>
  );
}