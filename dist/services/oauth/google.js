import axios from "axios";
export async function exchangeGoogleCode(code) {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
    });
    return response.data;
}
export async function fetchGoogleProfile(accessToken) {
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
}
//# sourceMappingURL=google.js.map