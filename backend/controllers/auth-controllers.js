import { Destination } from "../models/schema.js";
import axios from 'axios';

export const getYoutubeTokens = async (req, res, next) => {
    try {
        const { code } = req.body;

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        if(!code){
            return res.status(404).send("Code not found");
        }

        console.log(code);

        const dataUrl = `code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}&grant_type=authorization_code`;
        console.log(dataUrl);

        const tokens = await axios.post(
            'https://oauth2.googleapis.com/token',
            dataUrl
        )
        // .then(function (response){
        //     console.log(response.data);
        //     tokens = response.data;
        // })
        // .catch(function (error) {
        //     console.error('Error signing in:', error);
        // });

        if(!tokens){
            return res.status(404).send("Token not received");
        }

        console.log(tokens.data);
        console.log("Access Token : " + tokens.data.access_token + ", Refresh Token : " + tokens.data.refresh_token);

        const des = {
            youtube_access_token: tokens.data.access_token,
            youtube_refresh_token: tokens.data.refresh_token,
        };
        
        // Using findOneAndUpdate with upsert option
        updateTokensInDestination(user._id.valueOf(), des);

        res.status(200).json(tokens.data);
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
};

export const getTwitchTokens = async (req, res, next) => {
    try {
        const { code } = req.body;

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        if(!code){
            return res.status(404).send("Code not found");
        }

        console.log(code);

        const dataUrl = `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.TWITCH_REDIRECT_URL}`;
        
        console.log(dataUrl);

        const tokens = await axios.post("https://id.twitch.tv/oauth2/token?",dataUrl)
        // .then((res) => {
        //     console.log(res.data);
        //     return res.data;
        // })
        // .catch((err) => {
        //     console.log(err);
        // })

        if(!tokens){
            return res.status(404).send("Token not received");
        }

        console.log(tokens.data);
        console.log("Access Token : " + tokens.data.access_token + "Refresh Token : " + tokens.data.refresh_token);

        const des = {
            twitch_access_token: tokens.data.access_token,
            twitch_refresh_token: tokens.data.refresh_token
        };
        
        // Using findOneAndUpdate with upsert option
        updateTokensInDestination(user._id.valueOf(), des);

        res.status(200).json(tokens.data);

    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }   
}

export const getFacebookTokens = async (req, res, next) => {
    try {
        const { fb_access_token , fb_user_id } = req.body;

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        if(!fb_access_token){
            return res.status(404).send("Code not found");
        }

        console.log("Facebook Access token : " + fb_access_token + "\nFacebook User Id : " + fb_user_id);

        const tokens = await axios.get(
            `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${fb_access_token}`
        )
        // .then((res) => {
        //     console.log(res);
        //     return res.data;
        // })
        // .catch((err) => {
        //     console.log(err);
        // })

        console.log(tokens.data);
        console.log(tokens.data.access_token);

        const des = {
            facebook_user_id : fb_user_id,
            facebook_access_token : fb_access_token,
            facebook_long_access_token : tokens.data.access_token
        }

        console.log(des);

        updateTokensInDestination(user._id.valueOf(), des);

        res.status(200).json(tokens.data);

    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }   
}

export const updateTokensInDestination = async (userId, tokensObj) => {
    const filter = { user_id: userId };
    const update = { $set: tokensObj };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    
    const destination = await Destination.findOneAndUpdate(filter, update, options);
    
    console.log('Destination:', destination);
}