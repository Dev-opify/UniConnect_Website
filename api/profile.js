// api/profile.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Store in Vercel Environment Variables
const client = new MongoClient(uri);

export default async function handler(req, res) {
    try {
        if (!client.topology?.isConnected) {
            await client.connect();
        }
        const db = client.db("uniconnect");
        const users = db.collection("users");

        if (req.method === "POST") {
            const { uid, ...profileData } = req.body;

            await users.updateOne(
                { uid: uid },
                { $set: { ...profileData, updatedAt: new Date() } },
                { upsert: true }
            );

            return res.status(200).json({ success: true, message: "Profile saved" });
        }

        if (req.method === "GET") {
            const { uid } = req.query;
            const user = await users.findOne({ uid: uid });
            return res.status(200).json({ success: true, data: user });
        }

        res.status(405).json({ success: false, message: "Method Not Allowed" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}
