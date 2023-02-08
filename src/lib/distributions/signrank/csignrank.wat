(module
 (import "env" "memory" (memory $0 0))
 (export "memory" (memory $0))
 (export "csignrank" (func $assembly/index/csignrank))
 (func $assembly/index/csignrank (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result f64)
  (local $4 i32)
  (local $5 i32)
  i32.const 1
  local.get $0
  local.get $2
  i32.gt_s
  local.get $0
  i32.const 0
  i32.lt_s
  select
  if
   f64.const 0
   return
  end
  local.get $2
  local.get $0
  i32.sub
  local.get $0
  local.get $0
  local.get $3
  i32.gt_s
  select
  local.get $1
  i32.const 1
  i32.eq
  if
   f64.const 1
   return
  end
  i32.const 0
  f64.load
  f64.const 1
  f64.ne
  if
   i32.const 0
   f64.const 1
   f64.store
   i32.const 8
   f64.const 1
   f64.store
   i32.const 2
   local.set $2
   loop $for-loop|0
    local.get $1
    i32.const 1
    i32.add
    local.get $2
    i32.gt_s
    if
     local.get $2
     i32.const 1
     i32.add
     local.get $2
     i32.mul
     i32.const 2
     i32.div_s
     local.tee $4
     local.get $3
     local.get $3
     local.get $4
     i32.gt_s
     select
     local.set $4
     loop $for-loop|1
      local.get $2
      local.get $4
      i32.le_s
      if
       local.get $4
       i32.const 3
       i32.shl
       local.tee $5
       local.get $4
       local.get $2
       i32.sub
       i32.const 3
       i32.shl
       f64.load
       local.get $5
       f64.load
       f64.add
       f64.store
       local.get $4
       i32.const 1
       i32.sub
       local.set $4
       br $for-loop|1
      end
     end
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $for-loop|0
    end
   end
  end
  i32.const 3
  i32.shl
  f64.load
 )
)
