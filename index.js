const app = require('./src/app');
const pool = require('./src/pool');

pool.connect({
    host: 'localhost',
    port: '5432',
    database: 'socialnetwork',
    user: 'postgres',
    password: 'admin'
}).then(() => {
    app().listen(3005, () => {
        console.log('App Listening on PORT: 3005');
    })
}).catch(err => {
    console.error(err)
})
