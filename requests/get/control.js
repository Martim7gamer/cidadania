const path = require('path');

module.exports = {
    endpoint: '/c24ifmaw4g',
    method: 'GET',
    async execute(req, res) {
        res.sendFile(path.join(path.dirname(path.dirname(__dirname)), 'content', 'html', 'c.html'));
    }
}