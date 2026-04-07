import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'

export const seedAdminUser = async () => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim()
  const adminUsername = String(process.env.ADMIN_USERNAME || 'Sahil Admin').trim()

  if (!adminEmail || !adminPassword) {
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  )
}
