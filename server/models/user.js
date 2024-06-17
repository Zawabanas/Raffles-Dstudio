const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    active: {
        type: Boolean,
        default: true,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    // Comprobamos si la contraseña ya está hasheada
    if (this.isModified('password')) {
        if (!this.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`Comparando ${enteredPassword} con ${this.password}: ${isMatch}`);
    return isMatch;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


