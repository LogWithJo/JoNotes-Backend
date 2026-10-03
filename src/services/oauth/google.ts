import axios from "axios";

interface GoogleTokenResponse {
	access_token: string;
	id_token: string;
	expires_in: number;
	token_type: string;
}

interface GoogleProfile {
	sub: string; // Google's unique, permanent user ID
	email: string;
	email_verified: boolean;
	name: string;
	picture: string;
}

export async function exchangeGoogleCode(
	code: string,
): Promise<GoogleTokenResponse> {
	const response = await axios.post<GoogleTokenResponse>(
		"https://oauth2.googleapis.com/token",
		{
			code,
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uri: process.env.GOOGLE_CALLBACK_URL,
			grant_type: "authorization_code",
		},
	);

	return response.data;
}

export async function fetchGoogleProfile(
	accessToken: string,
): Promise<GoogleProfile> {
	const response = await axios.get<GoogleProfile>(
		"https://www.googleapis.com/oauth2/v3/userinfo",
		{
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	);

	return response.data;
}
