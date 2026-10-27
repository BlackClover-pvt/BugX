require('dotenv').config()
const appModule = require('./src/app');
const app = appModule.default || appModule;



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})