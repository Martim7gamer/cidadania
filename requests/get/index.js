const path = require('path');

module.exports = {
    endpoint: '/display',
    method: 'GET',
    async execute(req, res) {
        res.sendFile(path.join(path.dirname(path.dirname(__dirname)), 'content', 'html', 'g.html'));
    }
}