import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div>
      <div
        style={{
          padding: 20,
          borderBottom: "5px solid orange",
          color: "#333",
          fontSize: "125%",
          fontWeight: 300,
          letterSpacing: 1.1,
          backgroundColor: "#f0f0f0",
        }}
        onKeyDown={() => navigate("/")}
        onClick={() => navigate("/")}
      >
        <strong>AWS S3 Explorer </strong>
        <span style={{ fontSize: "50%", letterSpacing: 1 }}>
          powered by aws-sdk and aws-cli
        </span>
      </div>
    </div>
  );
}
