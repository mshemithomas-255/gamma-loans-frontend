import { Link } from "react-router-dom";
const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year

  return (
    <footer className="w-full bg-black bg-opacity-50 py-4 text-center p-3">
      <p className="text-sm">
        &copy; {currentYear} Gammaridge. All rights reserved. |{" "}
        <Link to="/privacy" className="underline">
          Privacy Policy
        </Link>{" "}
        |{" "}
        <Link to="/terms" className="underline">
          Terms of Service
        </Link>
        <Link to={"/logger"}>
          <p>_</p>
        </Link>
      </p>
    </footer>
  );
};

export default Footer;
