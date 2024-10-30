import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
import { db_instance_details, db_config } from '../config/config.js';
const { Pool } = pg;

const connector = new Connector();
const clientOpts = await connector.getOptions(db_instance_details);

const pool = new Pool(Object.assign(clientOpts, db_config));

export default {
  insert: (table, data, callback) => {  
    const query = `INSERT INTO "${table}" VALUES ('${data[0]}','${data[1]}','${data[2]}') RETURNING *`;
    pool.query(query,(err, result)=>{
      callback(err, result && result.rows[0]);
    })
  },
  select: (userInfo, callback) => {
    const query = `SELECT otp FROM "otp_management" WHERE public_key='${userInfo}' ORDER BY "created_at" DESC LIMIT 1`;
    pool.query(query,(err, result)=>{
      callback(err, result.rows);
    })
  },
  select_contract: (contractInfo, callback) => {
    const query = `SELECT contract_address, contract_json FROM "contract" WHERE contract_type='${contractInfo}' ORDER BY "created_at" DESC LIMIT 1`;
    pool.query(query,(err, result)=>{
      callback(err, result && result.rows[0]);
    })
  }
}
