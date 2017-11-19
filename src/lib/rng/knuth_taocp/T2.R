.TAOdebug = function(seed)
{
  KK <- 100L;
  LL <- 37L; 
  MM <- as.integer(2^30)
  KKK <- KK + KK - 1L
  KKL <- KK - LL
  ss <- seed - (seed %% 2L) + 2L
  
  X <- integer(KKK)
  for(j in 1L:KK) {
    X[j] <- ss
    ss <- ss+ss
    if(ss >= MM) ss <- ss - MM + 2L
  }
  X[2L] <- X[2L] + 1L
  ss <- seed
  T <- 69L
 
  while(T > 0) {
   # return(X)
    print (c("top T",T))
   
     for(j in KK:2L){ 
      X[j + j - 1L] = X[j]
     
    }
    
    for(j in seq(KKK, KKL + 1L, -2L)){
      X[KKK - j + 2L] <- X[j] - (X[j] %% 2L)
      #print(c(KKK - j + 2L, j))
    }
    
    for(j in KKK:(KK+1L)){
      #print(c(j -KKL, j, X[j] %% 2L))
      if(X[j] %% 2L == 1L) {
        #print(c(j -KKL, j))
        X[j - KKL] <- (X[j - KKL] - X[j]) %% MM
        X[j - KK] <- (X[j - KK] - X[j]) %% MM
      }
    }
    if(ss %% 2L == 1L) {
      
      for(j in KK:1L) {
        #print(c(j +1 , j))
        X[j + 1L] <- X[j]
      }
      print(c("ss",ss,"x0",X[1L],"xKK",X[KK+1L]))
      X[1L] <- X[KK + 1L]
   
      if(X[KK + 1L] %% 2L == 1L)
        X[LL + 1L] <- (X[LL + 1L] - X[KK + 1L]) %% MM
    }
    #print(c("before:",ss, T))
   
    if(ss){
      ss <- ss %/% 2L
      #print(c("true",ss))
    }
    else {
      #print(c("false", ss))
      T <- T - 1L
    }
    #print(c("T", T))
    #return (X)
    #if (T == 67) return (X)
  }
 
 
  rs <- c(X[(LL+1L):KK], X[1L:LL])
  rs
}

