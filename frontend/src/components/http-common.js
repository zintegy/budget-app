import axios from "axios";

export default axios.create({
  baseURL: "https://yitz-budget.deta.dev/",
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "https://ydeng-budget.cyclic.app/"
  }
});
