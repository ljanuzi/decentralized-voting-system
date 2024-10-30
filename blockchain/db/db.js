import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
const { Pool } = pg;
import 'dotenv/config';

const connector = new Connector();
const clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.DB_INSTANCE,
    ipType: 'PUBLIC',
});

const pool = new Pool(Object.assign(clientOpts, {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
}));

export default {
  insert: (table, data, callback) => {  
    const query = `INSERT INTO "${table}" VALUES ('${data[0]}','${data[1]}','${data[2]}') RETURNING *`;
    pool.query(query,(err, result)=>{
      callback(err, result && result.rows[0]);
    })
  }
}
