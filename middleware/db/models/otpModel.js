import db from '../db.js';

export default{
    insert_otp: (userData, callback) => {
        db.insert('otp_management', userData, callback);
    },
    retrieve_otp: (userInfo, callback) => {
        db.select(userInfo, callback);
    }
}