import express from 'express'
import { Client } from '@elastic/elasticsearch';
import 'dotenv/config';

const app = express();
const port = 3001

// Elasticsearch setup
const node = 'http://localhost:9200';
const client = new Client({
  node,
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY,
  }
})
const index = 'audit-events'
// await client.indices.create({ index })


// middleware to parse JSON request body
app.use(express.json());

// Check status of service
app.get('/health', (req, res) => {
    return res.json({
        status: "up"
    })
})

app.get('/audit-event', async (req, res) => {
    const result = await client.search({
        query: {
            match: {
                "tenantId": 123
            }
        }
    })

    return res.json(result?.hits.hits)
})

app.listen(port, () => {
  console.log(`Audit Event API Service listening on port ${port}`)
})