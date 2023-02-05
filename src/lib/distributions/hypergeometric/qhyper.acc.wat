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
   i32.const 0
   local.get $0   ;; sum
   local.get $2   ;; p
   f64.lt         ;; <
   select         ;; while (sum < p && xr < end) {
   if
    local.get $0
    local.get $1
    local.get $7
    local.get $3
    f64.const 1
    f64.add
    local.tee $3
    f64.div
    local.get $5
    local.get $6
    f64.const 1
    f64.add
    local.tee $6
    f64.div
    f64.mul
    f64.add
    local.tee $1
    f64.add
    local.set $0
    local.get $5
    f64.const 1
    f64.sub
    local.set $5
    local.get $7
    f64.const 1
    f64.sub
    local.set $7
    br $while-continue|0
   end
  end
  local.get $3
 )
 (func $simple/calcBigN (param $0 f64) (param $1 f64) (param $2 f64) (param $3 f64) (param $4 f64) (param $5 f64) (param $6 f64) (param $7 f64) (result f64)
  loop $while-continue|0
   local.get $3
   local.get $4
   f64.lt
   i32.const 0
   local.get $0
   local.get $2
   f64.lt
   select
   if
    local.get $0
    local.get $1
    local.get $7
    local.get $3
    f64.const 1
    f64.add
    local.tee $3
    f64.div
    local.get $5
    local.get $6
    f64.const 1
    f64.add
    local.tee $6
    f64.div
    f64.mul
    call $simple/log
    f64.add
    local.tee $1
    call $simple/exp
    f64.add
    local.set $0
    local.get $5
    f64.const 1
    f64.sub
    local.set $5
    local.get $7
    f64.const 1
    f64.sub
    local.set $7
    br $while-continue|0
   end
  end
  local.get $3
 )
)
