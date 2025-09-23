import express from 'express'
import { Client } from '@elastic/elasticsearch';
import { createClient } from 'redis';
import 'dotenv/config';

const app = express();
const port = 3001
const cacheKeyPrefix = 'events:tenant:'

// Setup Redis
const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();

// Elasticsearch setup
const node = 'http://localhost:9200';
const esClient = new Client({
  node,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  }
})
const index = 'audit-events'
// await esClient.indices.create({ index })


// middleware to parse JSON request body
app.use(express.json());

// Check status of service
app.get('/health', (req, res) => {
    return res.json({
        status: "up"
    })
})

app.get('/audit-event', async (req, res) => {
    const tenantId = 123
    const cacheKey = `${cacheKeyPrefix}${tenantId}`
    
    const cachedResults = await redisClient.lRange(cacheKey, 0, -1);

    // Parse each JSON string back into an object
    const cachedEvents = cachedResults.map(JSON.parse);
    console.log("Cached Events: (NOT RETURNING)")
    console.log(cachedEvents);

    /*
    if(cachedEvents){
      return res.json(cachedEvents)
    }
    */

    const result = await esClient.search({
        query: {
            match: {
                "tenantId": tenantId
            }
        }
    })

    return res.json(result?.hits.hits)
})

app.listen(port, () => {
  console.log(`Audit Event API Service listening on port ${port}`)
})