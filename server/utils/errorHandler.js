const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal server error"
    res.status(statusCode).json({ message })
    console.log("Err --> ", message)
}

export { errorHandler }