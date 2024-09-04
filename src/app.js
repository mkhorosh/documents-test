const http = require('http');
const url = require('url');
const { connectToMongoDB, getUserDocsByEmail } = require('./db');
const { processObjects, processFile } = require('./utils');

connectToMongoDB();

let test_users = [{
    email: 'NazarenkoMV@72to.ru.',
    phone: '8(909)8648888',
    docs: {
        doc_1: 'Прил_1_Заявка',
        doc_2: 'Прил_2_СпрОСуб'
    }
},
{
    email: 'marina@72to.com.',
    phone: '+7(909)864-88-88',
    docs: {
        doc_1: 'Прил_3_УплЛиз',
        doc_2: 'Прил_4_ОтчетИсп'
    }
}];
const filePath = './src/users.csv';

processObjects(test_users);
processFile(filePath);


const requestListener = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (req.method === 'POST' && path === '/documents') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const parsedBody = JSON.parse(body);
                const email = parsedBody.email;

                if (!email) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Email query parameter is required' }));
                    return;
                }
                const { status, data } = await getUserDocsByEmail(email);
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};

const server = http.createServer(requestListener);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
