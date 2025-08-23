(module
 (import "simple" "log" (func $simple/log (param f64) (result f64)))
 (import "simple" "exp" (func $simple/exp (param f64) (result f64)))
 (export "calcTinyN" (func $simple/calcTinyN))
 (export "calcBigN" (func $simple/calcBigN))
 ;; cpuBackendTinyN(sum: number, term: number, p: number, xr: number, end: number, xb: number, NB: number, NR: number):
 (func $simple/calcTinyN (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (result f64)
  loop $while-continue|0
   local.get $3   ;; xr
   local.get $4   ;; end
   f64.lt         ;; <
   local.get $0   ;; sum
   local.get $2   ;; p
   f64.lt         ;; <
   i32.and        ;; (xr < end) && (sum < p)
   if
    local.get $0  ;; sum
    local.get $1  ;; sum, term
    local.get $7  ;; sum, term, NR
    local.get $3  ;; sum, term, NR, xr
    f64.const 1   ;; sum, term, NR, xr, 1
    f64.add       ;; sum, term, NR, (xr + 1)
    local.tee $3  ;; xr = xr + 1;; stack; sum, term, NR, (xr + 1) 
    f64.div       ;; stack; sum, term, (NR/ (xr + 1)) 
    local.get $5  ;; stack; sum, term, (NR/ (xr + 1)) , xb
    local.get $6  ;; stack; sum, term, (NR/ (xr + 1)) , xb, NB
    f64.const 1   ;; stack; sum, term, (NR/ (xr + 1)) , xb, NB, 1
    f64.add       ;; stack; sum, term, (NR/ (xr + 1)) , xb, (NB+ 1)
    local.tee $6  ;; NB = (NB + 1); stack; sum, term, (NR/ (xr + 1)) , xb, (NB+ 1)
    f64.div       ;; stack; sum, term, (NR/ (xr + 1)) , (xb/ (NB+ 1))
    f64.mul       ;; stack; sum, term, (NR/ (xr + 1)) * (xb/ (NB+ 1))
    f64.mul       ;; stack; sum, term + (NR/ (xr + 1)) * (xb/ (NB+ 1))
    local.tee $1  ;; term = term * ... ; stack: sum, term
    f64.add       ;; sum + term
    local.set $0  ;; sum = sum + term
    local.get $5  ;; xb
    f64.const 1   ;; 1
    f64.sub       ;; xb -1
    local.set $5  ;; xb = xb - 1
    local.get $7  ;; NR
    f64.const 1   ;; NR, 1
    f64.sub       ;; NR - 1
    local.set $7  ;; NR = NR -1
    br $while-continue|0
   end ;; end-if
  end ;; end loop
  local.get $3 ;; put xr on the stack
 )
 (func $simple/calcBigN (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (result f64)
  loop $while-continue|0
   local.get $3 ;; xr
   local.get $4 ;; end
   f64.lt       ;; xr < end
   local.get $0 ;; sum
   local.get $2 ;; p
   f64.lt       ;; sum < p
   i32.and      ;; (xr < end) && (sum < p)
   if
    local.get $0 ;; sum
    local.get $1 ;; term
    local.get $7 ;; NR
    local.get $3 ;; xr
    f64.const 1  ;; 1
    f64.add      ;; xr + 1 
    local.tee $3 ;; xr = xr + 1, (xr + 1) on the stack
    f64.div      ;; (NR / (xr+1)) on the stack: sum, term
    local.get $5 ;; stack: sum, term, (NR / (xr+1)), xb
    local.get $6 ;; stack: sum, term, (NR / (xr+1)), xb, NB
    f64.const 1  ;; stack: sum, term, (NR / (xr+1)), xb, NB, 1
    f64.add      ;; stack: sum, term, (NR / (xr+1)), xb, (NB+1)
    local.tee $6 ;; NB = NB +1; stack same as above
    f64.div      ;; stack: sum, term, (NR / (xr+1)), (xb/ (NB+1))
    f64.mul      ;; stack: sum, term, (NR / (xr+1)) * (xb/ (NB+1))
    call $simple/log ;; stack: sum, term, log((NR / (xr+1)) * (xb/ (NB+1)))
    f64.add       ;;  stack: sum, term + log((NR / (xr+1)) * (xb/ (NB+1)))
    local.tee $1  ;; term = term + ....
    call $simple/exp ;;  stack: sum, exp(term + log((NR / (xr+1)) * (xb/ (NB+1))))
    f64.add       ;; stack: sum + exp(term + log((NR / (xr+1)) * (xb/ (NB+1))))
    local.set $0  ;; sum = sum + ...; stack (empty)
    local.get $5  ;; xb
    f64.const 1   ;; 1
    f64.sub       ;; stack; xb -1
    local.set $5  ;; xb = xb - 1
    local.get $7  ;; NR
    f64.const 1   ;; NR,1
    f64.sub       ;; NR +1
    local.set $7  ;; NR = NR +1, empty stack
    br $while-continue|0 ;; loop back
   end ;; end if
  end ;; end loop
  local.get $3 ;; xr on the stack , (return value)
 )
)
