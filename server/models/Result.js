import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wpm: {
      type: Number,
      required: true,
      min: 0,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    time_taken: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
)

resultSchema.index({ wpm: -1, accuracy: -1, created_at: -1 })

export const Result = mongoose.model('Result', resultSchema)
