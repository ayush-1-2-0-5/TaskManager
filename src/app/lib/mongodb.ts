import { MongoClient } from "mongodb"

// Declare the global variable here
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// In development mode, use a global variable to persist the connection across module reloads
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise! // The '!' tells TypeScript that this value will not be undefined here
} else {
  // In production, don't use the global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
