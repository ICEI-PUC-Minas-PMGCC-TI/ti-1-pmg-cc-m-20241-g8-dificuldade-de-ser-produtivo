const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () =>
{
    console.log(`Server running on port ${PORT}`);
})