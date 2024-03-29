import { Broadcast, Destination } from "../models/schema.js";
import { nanoid } from 'nanoid';
import axios from 'axios';

export const setBroadcastDetails = async(req, res, next) => {
    try {
        const { yt_title, yt_description, yt_policy, twitch_title, fb_title } = req.body;

        console.log("\nYt title : ", yt_title,"\nYt description : ", yt_description,"\nYt Policy : ", yt_policy,"\n\nTwitch title : ", twitch_title,"\n\nFb title : ", fb_title);

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        let twitch_stream_key = null;

        if(twitch_title){
            const des = await Destination.findOne({ user_id : user._id.valueOf() });
    
            const token = des.twitch_access_token;
    
            console.log("Twitch access token : ", token);

            const validate = await validateTwitchRequest(token);

            console.log("Validation data : " ,validate);

            const result = await getTwitchStreamKey(token, validate.client_id, validate.user_id);
            twitch_stream_key = result.twitchStreamKey;
        }
        
        const studioId = nanoid();

        const details = {
            yt_title: yt_title ? yt_title : null,
            yt_description: yt_description ? yt_description : null,
            yt_privacy_policy: yt_policy ? yt_policy : null,
            fb_title: fb_title ? fb_title : null,
            twitch_title: twitch_title ? twitch_title : null,
            twitch_stream_key: twitch_stream_key ? twitch_stream_key : null,
            studio_id : studioId,
        }

        console.log(details);
        console.log(user._id);
        const broadcast = await addBroadcastDetails(user._id.valueOf(), details);
        console.log(" This is random studio Id : ",studioId);

        return res.status(200).json(broadcast);

    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
}

export const getBroadcasts = async (req, res , next) => {
    try {

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        const broadcasts = await Broadcast.find({user_id : user._id.valueOf()});

        console.log(broadcasts);

        const result = broadcasts.map((item) => {
            return {
                id : item._id.valueOf(),
                yt_title : item.yt_title,
                yt_description : item.yt_description,
                yt_policy : item.yt_privacy_policy,
                twitch_title : item.twitch_title,
                fb_title : item.fb_title,
                studio_id : item.studio_id,
            }
        })

        return res.status(200).json(result);

    } catch (error) {
        return res.status(404).json({ message: "error", cause: error.message });
    }
}

export const removeBroadcast = async (req, res , next) => {
    try {
        const { broadcast_id } = req.body;

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        deleteBroadcast(user._id.valueOf(), broadcast_id);

        res.status(200).json({
            message: "success"
        });

    } catch (error) {
        return res.status(404).json({ message: "error", cause:error.message });
    }
}

export const startBroadcast = async (req, res, next) => {
    try {
        // Write Logic to start broadcast based on broadcast id and selected platforms
        const { broadcast_id } = req.body;

        const user = res.locals.user;

        console.log(user._id.valueOf());
        console.log(user);

        const broadcast = await Broadcast.findOne(user._id.valueOf(), broadcast_id);

        const result = await Promise.all([
            broadcastToYoutube(),
            broadcastToTwitch(),
            broadcastToFacebook(),
        ]);

        res.status(200).json({
            message: "You are live now!!",
            broadcast: broadcast,
            result: result

        })
    } catch (error) {
        res.status(404).json({ message: "error", cause: error.message});
    }
}

const broadcastToYoutube = async () => {
    // Write logic related to broadcasting to Youtube
}

const broadcastToTwitch = async () => {
    // Write logic related to broadcasting to Twitch
}

const broadcastToFacebook = async () => {
    // Write logic related to broadcasting to Facebook
}

const validateTwitchRequest = async (token) => {
    try {
        
        const config = {
            headers: { Authorization: `Bearer ${token}` },
        }

        const response = await axios.get('https://id.twitch.tv/oauth2/validate', config)
        // .then((res) => {
        //     console.log(res.data);
        //     return res.data;
        // })
        // .catch((err) => {
        //     console.error(err);
        //     return err;
        // })

        console.log(response.data);

        return response.data;

    } catch (error) {
        return { message: "error in validate", cause: error.message};
    }
}
  
const getTwitchStreamKey = async (twitchAccessToken, twitchClientId, twitchBroadcasterId) => {
    try {
        
        const config = {
            headers: {
                Authorization: `Bearer ${twitchAccessToken}`,
                'Client-Id': twitchClientId,
            },
        }
    
        const response = await axios.get(
            `https://api.twitch.tv/helix/streams/key?broadcaster_id=${twitchBroadcasterId}`,
            config
        )

        console.log(response.data);
    
        const twitchStreamKey = response.data.data[0].stream_key;
        return {
            twitchStreamKey: twitchStreamKey,
        };

    } catch (error) {
        return { message: "error in streamKey", cause: error.message};
    }
}

export const updateBroadcastDetails = async (userId, detailsObj) => {
    const filter = { user_id: userId };
    const update = { $set: detailsObj };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const broadcast = await Broadcast.findOneAndUpdate(filter, update, options);

    console.log('Broadcast:\n', broadcast);
    return broadcast;
}

export const addBroadcastDetails = async (userId, detailsObj) => {

    detailsObj.user_id = userId;

    const broadcast = await Broadcast.create(detailsObj);

    console.log('Broadcast:\n', broadcast);
    return broadcast;
}

export const deleteBroadcast = async (userId, broadcastId) => {

    const broadcast = await Broadcast.deleteOne({ user_id : userId, _id : broadcastId });
    return broadcast;
}

export const findBroadcast = async (userId, broadcastId) => {
    const broadcast = await Broadcast.findOne({ user_id : userId, _id : broadcastId });
    return broadcast;
}
