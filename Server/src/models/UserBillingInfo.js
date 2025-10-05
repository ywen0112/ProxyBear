const mongoose = require('mongoose');

const userBillingInfoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    legalName: { type: String, default: '' }, 
    legalSurname: { type: String, default: '' },           
    billingEmail: { type: String, default: '' },   
    phone: { type: String, default: '' },         
    address: { type: String, default: '' },        
    zip: { type: String, default: '' },           
    companyMode: { type: Boolean, default: false }, 
    companyName: { type: String, default: '' },     
    vatNumber: { type: String, default: '' },       
});

module.exports = mongoose.model('UserBillingInfo', userBillingInfoSchema);
