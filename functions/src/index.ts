import * as functions from "firebase-functions";
import * as nacl from "tweetnacl";
import {Request} from "firebase-functions/lib/providers/https";

const PUBLIC_KEY: string = process.env.DISCORD_APPLICATION_PUBLIC_KEY!;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


/**
 * Type of Interaction
 */
enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3,
}


/**
 * Type of Interaction Response
 */
enum InteractionResponseType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7,
}

/**
 * Flags that can be included in an Interaction Response.
 */
enum InteractionResponseFlags {
    EPHEMERAL = 1 << 6,
}


/**
 * 認証でたかどうか判定する関数
 * @param {Request} request 受け取ったリクエスト
 * @return {boolean} 認証できたか
 */
function verify(request: Request) {
    const signature = request.get("X-Signature-Ed25519");
    const timestamp = request.get("X-Signature-Timestamp");
    const body = request.rawBody;
    return nacl.sign.detached.verify(
        Buffer.from(timestamp! + body),
        Buffer.from(signature!, "hex"),
        Buffer.from(PUBLIC_KEY, "hex")
    );
}


export const testBot = functions.https.onRequest((request, response) => {
    if (!verify(request)) {
        response.status(401).end("invalid request signature");
        return;
    }
    if (request.method !== "POST") {
        response.status(404);
        return;
    }
    switch (request.body.type) {
        case InteractionType.PING: {
            response.json({type: InteractionResponseType.PONG});
            break;
        }
        case InteractionType.APPLICATION_COMMAND: {
            response.json({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    tts: false,
                    content: "Congrats on sending your command!",
                    embeds: [],
                    flags: InteractionResponseFlags.EPHEMERAL,
                },
            });
            break;
        }
    }
}
);
