export const samples25fromSeed1234 = [
    0.666352588373,
    0.70895803387,
    0.330417360722,
    0.625727496488,
    0.116692046662,
    0.748817207932,
    0.140530452631,
    0.50992739748,
    0.453351283552,
    0.507748161328,
    0.232294351149,
    0.36052250172,
    0.436818078029,
    0.615453107426,
    0.124710506323,
    0.607728453029,
    0.117226091939,
    0.106610431826,
    0.4794349916,
    0.774122025532,
    0.958352082632,
    0.426307386585,
    0.546883630926,
    0.930082156307,
    0.959073444586,
];

/*
RNGkind("Super-Duper")
set.seed(4568)
options(digits=12)
.Random.seed 
*/
export const stateAfterSeed4568 = [-231195905, 218444085];

/*
RNGkind("Super-Duper")
set.seed(4568)
options(digits=12)
.Random.seed[2] =as.integer(0)
.Random.seed[3] =as.integer(0)
.Random.seed
runif(2)
*/
export const samplesAfterCorrectedSeed = [4.65987250317e-5, 1.10602746743e-1];
