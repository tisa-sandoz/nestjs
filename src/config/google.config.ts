export default () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    authUrl: process.env.GOOGLE_AUTHURL,
    tokenUrl: process.env.GOOGLE_TOKENURL,
  },
});
