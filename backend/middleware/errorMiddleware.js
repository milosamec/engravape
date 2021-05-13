const notFound = (err, req, res, next) => {
    // Check for status code and set accordingly
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    //respong with statuscode and error message
    res.status(statusCode)
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack, 
    })
}

// Error handler for routes that don't exist
const errorHandler = (req, res, next) => {
    // Create an error var if route is not found
    const error = new Error(`Not Found - ${req.originalUrl}`)
    // Respond with 404
    res.status(404)
    // Procieed with request by passing the error we created
    next(error)
}

export {notFound, errorHandler}
