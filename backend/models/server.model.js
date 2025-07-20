const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serverSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    server_name: {
      type: String,
      required: true,
      trim: true,
    },
    game_type: {
      type: String,
      required: true,
      enum: ['java', 'bedrock'],
    },
    version: {
      type: String,
      required: true,
    },
    ram: {
      type: Number,
      required: true,
    },
    port: {
      type: Number,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['online', 'offline', 'starting', 'stopping'],
      default: 'offline',
    },
  },
  {
    timestamps: true,
  }
);

const Server = mongoose.model('Server', serverSchema);

module.exports = Server;
