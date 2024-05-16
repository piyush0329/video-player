const express = require('express')
const fs = require('fs')
const cors  = require('cors')
const morgan = require('morgan')
const { config } = require('process')
require('dotenv').config

const app = express()
app.use(morgan('dev'))
app.use(cors({
    Credential:true,
    origin:true
}))

const videoFileMap={
    'cdn':process.env.VIDEO_PATH,
}

app.get('/videos/:filename', (req, res)=>{
    const fileName = req.params.filename;
    const filePath = videoFileMap[fileName]
    if(!filePath){
        return res.status(404).send('File not found')
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if(range){
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, head);
        file.pipe(res);
    }
    else{
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res)
    }
})

app.listen(8000, ()=>{
    console.log('server is listening on post 8000')
})
