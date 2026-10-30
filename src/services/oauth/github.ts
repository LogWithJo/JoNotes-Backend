import axios from "axios";

interface GitHubTokenResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

interface GitHubUser {
	id: number;
	login: string;
	name?: string | null;
	email?: string | null;
	avatar_url?: string | null;
}

interface GitHubEmail {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility?: string | null;
}

export async function exchangeGitHubCode(
	code: string,
): Promise<GitHubTokenResponse> {
	const response = await axios.post<GitHubTokenResponse>(
		"https://github.com/login/oauth/access_token",
		{
			client_id: process.env.GITHUB_CLIENT_ID,
			client_secret: process.env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: process.env.GITHUB_CALLBACK_URL,
		},
		{
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
		},
	);

	return response.data;
}

export async function fetchGitHubUser(
	accessToken: string,
): Promise<GitHubUser> {
	const userResponse = await axios.get<GitHubUser>(
		"https://api.github.com/user",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		},
	);

	const emailsResponse = await axios.get<GitHubEmail[]>(
		"https://api.github.com/user/emails",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		},
	);

	const primaryEmail = emailsResponse.data.find(
		(email) => email.primary && email.verified,
	)?.email;

	return {
		...userResponse.data,
		email: primaryEmail ?? userResponse.data.email ?? null,
	};
}
