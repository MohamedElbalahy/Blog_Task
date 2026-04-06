// models/blog.js
// Defines the shape of a blog document in MongoDB.
// Mongoose uses this schema to validate and structure data.

const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

// Optional: clean up the JSON output
// This removes the internal __v field and renames _id to id
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

// mongoose.model() compiles the schema into a Model
// The first argument 'Blog' becomes the collection name 'blogs' in MongoDB
const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
