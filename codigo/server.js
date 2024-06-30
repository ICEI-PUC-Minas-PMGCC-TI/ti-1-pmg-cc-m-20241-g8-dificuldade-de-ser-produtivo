const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: 'false',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        const dir = path.join(__dirname, 'uploads/');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) =>
    {
        const userId = req.headers['filename'];

        console.log(userId);

        if (!userId)
        {
            cb(new Error('User ID not provided'), false);
        }
        const extension = path.extname(file.originalname);
        cb(null, `${userId}${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) =>
    {
        checkFileType(file, cb);
    }
}).single('image');

function checkFileType(file, cb)
{
    const filetypes = /jpeg|jpg|png|gif/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname)
        return cb(null, true);
    else
        cb('Error: Images only!');
}

app.get('/', (req, res) =>
{
    res.send('hello world!');
});

app.post('/hashPassword', async (req, res) =>
{
    const { password } = req.body;

    if (!password)
        return res.status(400).json({ message: 'Password is required' });

    try
    {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        res.status(200).json({ hashedPassword });
    } catch (error)
    {
        console.error('Error hashing password: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/validatePassword', async (req, res) =>
{
    const { password, hashedPassword } = req.body;

    if (!password || !hashedPassword)
        return res.status(400).json({ message: 'Password and hashed password are required' });

    try
    {
        const isValid = await bcrypt.compare(password, hashedPassword);
        res.status(200).json({ isValid });
    } catch (error)
    {
        console.error('Error validating password: ', error);
        res.status(500).json({ message: error });
    }
});

app.get('/generateToken', async (req, res) =>
{
    const token = crypto.randomBytes(20).toString('hex');
    const expiration = Date.now() + (10 * 60 * 1000);

    res.status(200).json({ token: token, expiration: expiration });
});

app.post('/sendEmail', async (req, res) =>
{
    const { email, subject, html } = req.body;

    const mailSent = transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: html
    }).
        then(() =>
        {
            res.status(200).send(req.body);
            console.log('enviado');
        })
        .catch((err) =>
        {
            console.log(err);
            res.send(err);
        });
});

app.post('/upload', (req, res) =>
{
    upload(req, res, (err) =>
    {
        if (err) 
        {
            res.status(400).send(err.message);
            return;
        }

        if (req.file == undefined)
        {
            res.status(400).send('Error: no file selected!');
            return;
        }

        res.status(200).send({
            message: 'File uploaded successfully!',
            filePath: `${req.file.filename}`
        });
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});