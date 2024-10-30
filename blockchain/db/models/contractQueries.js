import db from '../db.js';

export default{
    insert_contract: (contractData, callback) => {
        db.insert('contract', contractData, callback);
    }
}