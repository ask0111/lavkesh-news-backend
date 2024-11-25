import express, {Express, Request, Response} from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import useRouters from "./src/routes/index";
import connectDB from './src/config/dbConnection';
const app: Express = express()
const PORT = 5000;
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1/news/lv-powered', useRouters)
connectDB();

app.listen(PORT, ()=>{
console.log('Server Listning on PORT: ', PORT)
})

