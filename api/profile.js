// api/profile.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "uniconnect";
const collectionName = "users";

let client;
let clientPromise;

if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db(dbName);
        const users = db.collection(collectionName);

        if (req.method === "POST") {
            const { uid, ...profileData } = req.body;
            if (!uid) return res.status(400).json({ success: false, message: "UID is required" });

            await users.updateOne(
                { uid: uid },
                { $set: { ...profileData, updatedAt: new Date() } },
                { upsert: true }
            );

            return res.status(200).json({ success: true, message: "Profile saved" });
        }

        if (req.method === "GET") {
            const { uid } = req.query;
            if (!uid) return res.status(400).json({ success: false, message: "UID is required" });

            const user = await users.findOne({ uid: uid });
            return res.status(200).json({ success: true, data: user || null });
        }

        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    } catch (err) {
        console.error("API /profile error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
