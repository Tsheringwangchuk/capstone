const path = require('path')
/* Index Page PAGE */
exports.getindexPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'))
}
