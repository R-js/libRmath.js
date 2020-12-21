## Knut-TAOCP for seed 3324
RNGkind("Knuth-TAOCP")
set.seed(3324)
write.csv(data.frame(first100=runif(100), file="first100FromSeed3324.csv")
write.csv(data.frame(seed=.Random.seed), file="seedAfterfirst100FromSeed3324.csv")


