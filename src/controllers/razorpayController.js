// const axios = require('axios');
const Razorpay = require('razorpay');
require('dotenv').config();


const instance = new Razorpay({
    key_id: process.env.RZ_ID,
    key_secret: process.env.RZ_KEY_SECRET,
});

const createRazorpayOrder = async (req, res) => {

    console.log('id', process.env.RZ_ID);

    try {
        const { amount, currency, receipt } = req.body;

        const options = {   
            amount: amount,
            currency: currency,
            receipt: receipt,
        };

        instance.orders.create(options, (err, order) => {
            if (err) {
                console.error('Error creating Razorpay order:', err);
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else {
                console.log(order)
                res.status(200).json({
                    success: true,
                    order_id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    razorpay_key: process.env.RZ_ID, // Provide your Razorpay Key ID to the frontend
                });
            }
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;

        // Make a request to the Razorpay API to verify the payment
        instance.payments.capture(payment_id, 650 * 100, 'INR', (err, response) => {
            console.log(response);
            if (err) {
                console.error('Error verifying Razorpay payment:', err);
                res.status(200).json({ success: true, message: 'Payment verification failed' });
            } else {
                if (response.status === 'captured') {
                    // Payment is successful
                    // You can update your database or perform other necessary actions here

                    res.status(200).json({ success: true, message: 'Payment verified successfully' });
                } else {
                    // Payment failed
                    res.status(400).json({ success: false, message: 'Payment verification failed' });
                }
            }
        });
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const updatePlan = async (req, res) => {
    try {
      const { plan, userId } = req.body;
  
      // Validation
      if (!plan || !userId) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
      }
  
      // Assuming you have a Mongoose User model
      const user = await User.findOne({ _id: userId });
  
      // Validation: Check if the user exists
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
  
      // Validation: Check if the provided plan is valid (you might want to customize this based on your plans)
      const validPlans = ['basic', 'premium', 'pro'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ success: false, message: 'Invalid plan.' });
      }
  
      // Update user plan
      user.plan = plan;
  
      // Save the updated user
      await user.save();
  
      return res.status(200).json({ success: true, message: 'Plan updated successfully.' });
    } catch (error) {
      console.error('Error updating plan:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
};

module.exports = {
    verifyRazorpayPayment,
    createRazorpayOrder,
    updatePlan
};
