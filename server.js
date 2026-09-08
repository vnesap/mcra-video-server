const express = require('express');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
app.use(express.json());

// Enable CORS so your Cloudflare app can talk to this server freely
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Endpoint to generate tokens for teachers and students
app.post('/get-token', async (req, res) => {
    const { roomName, participantName, isTeacher } = req.body;

    if (!roomName || !participantName) {
        return res.status(400).json({ error: "Missing roomName or participantName" });
    }

    try {
        // Initialize token using environment variables
        const at = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            { identity: participantName }
        );

        // Grant administrative permissions if the user is a teacher
        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            roomAdmin: isTeacher === true
        });

        const token = await at.toJwt();
        res.json({ token });

    } catch (error) {
        console.error("Token Generation Error:", error);
        res.status(500).json({ error: "Failed to generate video token" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCRA Server running on port ${PORT}`));
