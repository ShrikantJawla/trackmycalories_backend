const path = require('path')
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const port = process.env.PORT || 8000;
const connect = require('./configs/dbConfig')
const userRoute = require('./features/userProfile/user.route')
const authRoute = require('./features/auth/auth.route')
const productsRoute = require('./features/foodProducts/products.route')
const tasksRoute = require('./features/tasks/task.route')
const shopproductsRoute = require('./features/shopProducts/shopProducts.route')
const reviewsRoute = require('./features/reviews/reviews.routes')
const cartRoute = require('./features/cart/cart.routes')
const adminRoute = require('./features/admin/admin.routes')
const followAndConnectRoute = require('./features/connect&follow/followAndConnect.routes')
const messagesRoute = require('./features/messages/messages.routes')
const feedRoute = require('./features/feeds/feed.routes')



const app = express();


app.get('/', async (req, res) => {
    res.send({
        res: 1,
        message: 'Server is running'
    })
})

app.use(cors())
app.use(express.json())
app.use('/userprofile', userRoute)
app.use('/user/auth', authRoute)
app.use('/foodProducts', productsRoute)
app.use('/user/tasks', tasksRoute)
app.use('/shop/products', shopproductsRoute)
app.use('/shop/product/reviews', reviewsRoute)
app.use('/shop/cart', cartRoute)
app.use('/admin', adminRoute)
app.use('/follow-connect', followAndConnectRoute)
app.use('/messages', messagesRoute)
app.use('/feeds', feedRoute)




app.listen(port, async () => {
    await connect();
    console.log(`listening on http://localhost:${port}`);
})
