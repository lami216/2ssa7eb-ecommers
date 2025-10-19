import React from "react";

const Footer = () => {
        const buildTime = new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString();
        return (
                <footer style={{ textAlign: "center", marginTop: "2rem", opacity: 0.7 }}>
                        <small>آخر تحديث للموقع: {buildTime}</small>
                </footer>
        );
};

export default Footer;
