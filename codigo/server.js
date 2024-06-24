const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smpt.gmail.com',
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

app.use(bodyParser.json());
app.use(cors());

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

app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
});