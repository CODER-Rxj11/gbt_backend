const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

// user Schema
const userSchema = new Schema(
	{
        role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
        userId :{
            type: String,
            unique: true,
        },
		firstName: {
			type: String,
			required: [true, "Name is required"],
			// minLength: [6, "name should be atleast 6 character long"],
		},
        lastName: {
			type: String,
			required: [true, "Name is required"],
			// minLength: [6, "name should be atleast 6 character long"],
		},
		contact: {
			type: String,
			required: [true, "Contact is required"],
			minLength: [10, "Contact should be atleast 10 character long"],
			maxLength: [10, "Contact must not be exceed 10 character long"],
		},
        city: {
			type: String,
			required: [true, "City is required"],
			maxLength: [30, "City must not be exceed 30 character long"],
		},
        postalCode: {
            type: String,
            required: [true, "Postal Code is required"],
            minLength: [6, "Postal Code must be 6 character long"],
            maxLength: [6, "Postal Code must be 6 character long"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
            minLength: [3, "State must be 3 character long"],
            maxLength: [20, "State must not exceed 20 character long"],
        },
		email: {
			type: String,
			unique: true,
			reqired: [true, "Email is required"],
			match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, "Please fill a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			select: false,
			maxlength: [25, "Password should not exceed more than 25 characters"],
			minlength: [6, "Password should not less than 6 characters"],
			//match:[]
		},
		avatar: {
			type: Object,
			default: {
				fileId: "",
				url: "https://cdn.vectorstock.com/i/1000x1000/62/59/default-avatar-photo-placeholder-profile-icon-vector-21666259.webp",
			},
		},
        aadharCard: {
            type: Object,
            default: {
                fileId: "",
                url: "https://cdn.vectorstock.com/i/1000x1000/62/59/default-avatar-photo-placeholder-profile-icon-vector-21666259.webp",
            },
        },
        panCard:{
            type: Object,
            default: {
                fileId: "",
                url: "https://cdn.vectorstock.com/i/1000x1000/62/59/default-avatar-photo-placeholder-profile-icon-vector-21666259.webp",
            },
        },
        membershipPakage:{
            type: String,
            default: "free",
        },
        membershipExpiry:{
            type: Date,
            default: Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
        rank:{
            type: String,
            default: "Silver",
        },
        referralCode:{
            type: String,
            unique: true,
        },
        referralUrl:{
            type: String,
            unique: true,
        },
        refers:{
            type: [Schema.Types.ObjectId],
            ref:"referrals"
        },
        // REFER TO AND REFER BY   
        totalBonus:{
            type: Number,
            default: 0,
        },
        balance:{
            type: Number,
            default: 0,
        },
        gender: {
			type: String,
			enum: ["male", "female", "others"],
		},
        dob:{
            type: Date,
        },
        levelBonus:{
            type: Number,
            default: 0,
        },
        referralIncome:{
            type: Number,
            default: 0,
        },
        epinUser:{
            type:Schema.Types.ObjectId,
            ref:"epin"
        },
        epinManager:{
            transferId:{
                type: String,
                // required: [true, "Transfer Id is required"],
                unique: true,
            },
            epin:{
                type: [String],
                required: [true, "Epin is required"],
                unique: true,
            },
            isRedeem : {
                type: Boolean,
                default: false,
            },
            status:{
                type: String,
                enum: ["allocated", "notAllocated"],
                default: "notAllocated",
            },
        },
        totalEpin:{
            type: Number,
            default: 0,
        },
        currentBalance:{
            type: Number,
            default: 0,
        },
        withdrawableBalance:{
            type: Number,
        },
        tdsDeduction:{
            type: Number,
        },
        serviceCharge:{
            type: Number,
        },
        childrens:{
            type: Schema.Types.ObjectId,
            ref:"users"
        },
		resetPasswordToken: {
			type: String,
			default: "0",
		},
        plan:{
            type: String,
            enum: ["free", "premium", "gold", "platinum"],
            default: "free",
        },
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (this.isNew) {
        const lastUser = await User.findOne({}, {}, { sort: { 'userId': -1 }     });
        if (lastUser) {
            this.userId = Number(lastUser.userId) + 1;
        } else {
            this.userId = 1;
        }
    }
	if (!this.isModified("password")) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});


userSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.getJwtToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
			role: this.role,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRE,
		}
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		}
	);
};

const User = mongoose.model("user", userSchema);
module.exports = User;
