import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body

    // Define the path to the JSON file
    const filePath = path.resolve('./data/contactMessages.json')

    // Read the existing data from the JSON file
    let data: { name: string; email: string; message: string; date: string }[] = []
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8')
      data = JSON.parse(fileData)
    }

    // Add the new message to the data
    data.push({ name, email, message, date: new Date().toISOString() })

    // Write the updated data back to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    // Respond with a success message
    res.status(200).json({ message: 'Form submitted successfully' })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}