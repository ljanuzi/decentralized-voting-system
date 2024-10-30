import App from 'express';
const app = App();
import { server_config } from './config/config.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import bodyParser from 'body-parser';
import cors from 'cors';
const host = server_config.host;
const port = server_config.port;

app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRouter);
app.use('/admin', adminRouter);

app.listen(port , host, (err) =>{
    if(err) console.log("error");
    console.log(`App is serving on the host:${host} and port:${port}`)
})

