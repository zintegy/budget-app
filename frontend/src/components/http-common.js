import axios from "axios";

export default axios.create({
  baseURL: "https://malamute-definite-turtle.ngrok-free.app/",
  headers: {
    "Content-type": "application/json",
    "ngrok-skip-browser-warning": "123", // ngrok interstitial bypass
  }
});
