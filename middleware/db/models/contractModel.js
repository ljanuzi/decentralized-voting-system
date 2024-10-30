import db from '../db.js';

export default{
    retrieve_contract: (data, callback) => {
        db.select_contract(data, callback);
    }
}