import 'dotenv/config';



export const server_config = {
    host: process.env.API_HOST,
    port: process.env.API_PORT
}
   
export const otp_config = {
    length: 4,
    otp_config: {
      digits: 4,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    }
}

export const twilio_config = {
    auth_token : process.env.TWILIO_AUTH_TOKEN,
    acc_ssid : process.env.TWILIO_SSID,
    twilio_number: process.env.TWILIO_NUMBER
}

export const db_config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
}

export const db_instance_details = {
    instanceConnectionName: process.env.DB_INSTANCE,
    ipType: 'PUBLIC',
}

export const web3_connection = {
    web3_provider: process.env.WEB3_PROVIDER,
    contract_address: process.env.CONTRACT_ADDRESS,
    gas_price: process.env.GAS_VALUE
}

export const email_config = {
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    }
}

export const aes_config = {
    key: process.env.SECRET_STRING
}

export const JWT_USER_SECRET = process.env.JWT_USER_SECRET

export const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET