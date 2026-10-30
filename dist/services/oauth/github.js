import axios from "axios";
export async function exchangeGitHubCode(code) {
    const response = await axios.post("https://github.com/login/oauth/access_token", {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
    }, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });
    return response.data;
}
export async function fetchGitHubUser(accessToken) {
    const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const primaryEmail = emailsResponse.data.find((email) => email.primary && email.verified)?.email;
    return {
        ...userResponse.data,
        email: primaryEmail ?? userResponse.data.email ?? null,
    };
}
//# sourceMappingURL=github.js.map