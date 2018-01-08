function (x, size = NULL, prob, log = FALSE)
{
    K <- length(prob)
    if (length(x) != K)
        stop("x[] and prob[] must be equal length vectors.")
    if (any(!is.finite(prob)) || any(prob < 0) || (s <- sum(prob)) ==
        0)
        stop("probabilities must be finite, non-negative and not all 0")
    prob <- prob/s
    x <- as.integer(x + 0.5)
    if (any(x < 0))
        stop("'x' must be non-negative")
    N <- sum(x)
    if (is.null(size))
        size <- N
    else if (size != N)
        stop("size != sum(x), i.e. one is wrong")
    i0 <- prob == 0
    if (any(i0)) {
        if (any(x[i0] != 0))
            return(if (log) -Inf else 0)
        if (all(i0))
            return(if (log) 0 else 1)
        x <- x[!i0]
        prob <- prob[!i0]
    }
    r <- lgamma(size + 1) + sum(x * log(prob) - lgamma(x + 1))
    if (log)
        r
    else exp(r)
}