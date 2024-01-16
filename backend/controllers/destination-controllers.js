import { User, Destination } from "../models/schema.js";
import { updateTokensInDestination } from "./auth-controllers.js";

export const getDestinations = async (req, res, next) => {
    try {

        console.log(res.locals.jwtData.id);

        const user = await User.findById(res.locals.jwtData.id).lean().then( user => {
            console.log(user._id.valueOf());
            return user;
        });
            
        if(!user){
            return res.status(404).send("User does not exist");
        }

        console.log(user);
            
        const des = await Destination.findOne({ user_id : user._id.valueOf() });

        const destinationAdded = {
            youtube : des.youtube_refresh_token ? true : false,
            twitch : des.twitch_refresh_token ? true : false,
            facebook : des.facebook_long_access_token ? true : false
        }

        res.status(200).json(destinationAdded);
        
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
}

export const removeDestinations = async (req, res, next) => {
    try {
        const { platform } = req.body;

        console.log(res.locals.jwtData.id);

        const user = await User.findById(res.locals.jwtData.id).lean().then( user => {
            console.log(user._id.valueOf());
            return user;
        });

        if(!user){
            return res.status(404).send("User does not exist");
        }

        let tokenObj;

        switch(platform){
            case 'Youtube' : 
                tokenObj = {
                    youtube_access_token : "",
                    youtube_refresh_token : ""
                }
                break;
            case 'Twitch' : 
                tokenObj = {
                    twitch_access_token : "",
                    twitch_refresh_token : ""
                }
                break;
            case 'Facebook' : 
                tokenObj = {
                    facebook_access_token : "",
                    facebook_long_access_token : ""
                }
                break;
            default :
                throw new Error(`Unknown platform ${platform}`);
        }

        updateTokensInDestination(user._id.valueOf(), tokenObj);

        res.status(200).send(`${platform} removed from destinations`);
        
    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
}