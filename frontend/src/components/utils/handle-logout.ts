import axios from "axios";
import Cookies from "js-cookie";

export async function handleLogout() {
  try {
    var token = Cookies.get("token");
    await axios.post(
      "http://127.0.0.1:8000/api/v1/logout/",
      {},
      {
        headers: { Authorization: `Token ${token}` },
      },
    );
    Cookies.remove("token");
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
