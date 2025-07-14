import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    blogTitle: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        
        required: false
    },
    remarks: {
        type: String,
        required: false
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    },
    userAgent: {
        type: String
    },
    ipAddress: {
        type: String,
        required: false
    },
    referrer: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for faster querying
downloadSchema.index({ blogId: 1 });
downloadSchema.index({ email: 1 });
downloadSchema.index({ downloadedAt: -1 });

export default mongoose.model('Download', downloadSchema);
