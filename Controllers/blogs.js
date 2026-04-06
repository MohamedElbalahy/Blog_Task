const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const ALLOWED_SORT_FIELDS = ['likes']

blogsRouter.get('/', async (request, response) => {
  const { search, author, sortBy, order, page, limit } = request.query

  const filter = {}

  if (search) {
    filter.title = { $regex: search, $options: 'i' }
  }

  if (author) {
    filter.author = { $regex: author, $options: 'i' }
  }

  if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
    return response.status(400).json({
      error: `unsupported sort field '${sortBy}'. Allowed fields: ${ALLOWED_SORT_FIELDS.join(', ')}`,
    })
  }

  const sortOrder = order === 'asc' ? 1 : -1
  const sort = sortBy ? { [sortBy]: sortOrder } : {}

  const pageNumber = Math.max(1, parseInt(page) || 1)
  const pageSize = Math.max(1, parseInt(limit) || 10)
  const skip = (pageNumber - 1) * pageSize

  const total = await Blog.countDocuments(filter)
  const totalPages = Math.ceil(total / pageSize)

  const blogs = await Blog.find(filter)
    .populate('user', { username: 1, name: 1 })
    .sort(sort)
    .skip(skip)
    .limit(pageSize)

  response.json({
    blogs,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages,
    },
  })
})

blogsRouter.post('/', async (request, response) => {
  const user = await User.findOne({})

  const blog = new Blog({
    ...request.body,
    user: user._id,
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.patch('/:id/like', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: blog.likes + 1 },
    { new: true }
  ).populate('user', { username: 1, name: 1 })

  response.json(updatedBlog)
})

module.exports = blogsRouter
