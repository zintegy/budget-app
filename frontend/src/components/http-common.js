import axios from "axios";

export default axios.create({
  baseURL: "https://budgetappapi-1-s6436930.deta.app/",
  headers: {
    "Content-type": "application/json",
  }
});
