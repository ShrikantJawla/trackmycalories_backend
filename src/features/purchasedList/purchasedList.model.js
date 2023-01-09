const { model, Schema } = require('mongoose')

const purchasedItemsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'shopproduct',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    modeOfPayment: {
        type: String,
        enum: ['cash', 'card']
    },
    dateOfPurchase: String,
    dateOfDelevery: String,
}, {
    timestamps: true
})

module.exports = PurchasedItems = model('purchasedItem', purchasedItemsSchema);