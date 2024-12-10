import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
console.log('Connecting to MongoDB at:', uri) // 연결 URI 로깅

const options = {
  connectTimeoutMS: 10000, // 연결 타임아웃 10초
  socketTimeoutMS: 45000,  // 소켓 타임아웃 45초
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().then(client => {
      console.log('Successfully connected to MongoDB')
      return client
    }).catch(err => {
      console.error('Failed to connect to MongoDB:', err)
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

