const express = require('express');
const cors = require('cors');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: ['https://webportfolio-6fpc.vercel.app', 'http://localhost:3000'],
    methods: ['POST']
}));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Add route for home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Configure Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post('/send-email', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const sendSmtpEmail = {
            to: [{ email: 'sononeabhay6@gmail.com', name: 'Portfolio Admin' }],
            sender: { email: 'sononeabhay6@gmail.com', name: 'Portfolio Contact Form' },
            subject: `Portfolio Contact: ${subject}`,
            htmlContent: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
            replyTo: { email: email, name: name }
        };

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        res.status(200).json({ message: 'Email sent successfully', data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            message: 'Failed to send email',
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
