(module
  ;; Import memory from JavaScript
  (import "env" "memory" (memory 1))

  ;; Globals for the 3 seeds (mutable)
  (global $s0 (mut i32) (i32.const 0))
  (global $s1 (mut i32) (i32.const 0))
  (global $s2 (mut i32) (i32.const 0))

  ;; Constants
  (global $mod0 i32 (i32.const 30269))
  (global $mod1 i32 (i32.const 30307))
  (global $mod2 i32 (i32.const 30323))

  ;; Exports
  (export "getSeed" (func $getSeed))
  (export "setSeed" (func $setSeed))
  (export "init" (func $init))
  (export "random" (func $random))
  (export "randoms" (func $randoms))

  ;; Export getSeed for debugging/verification
  (func $getSeed (param $index i32) (result i32)
    local.get $index
    i32.const 0
    i32.eq
    if (result i32)
      global.get $s0
    else
      local.get $index
      i32.const 1
      i32.eq
      if (result i32)
        global.get $s1
      else
        global.get $s2
      end
    end
  )


  ;; Set all seeds at once
  (func $setSeed (param $v0 i32) (param $v1 i32) (param $v2 i32)
    local.get $v0
    global.set $s0
    
    local.get $v1
    global.set $s1
    
    local.get $v2
    global.set $s2
    
    call $fixup
  )


  ;; Init function
  (func $init (param $seed i32)
    (local $i i32)
    (local $runner i32)
    
    ;; s[0] = seed
    local.get $seed
    global.set $s0

    ;; Initialize runner with seed
    local.get $seed
    local.set $runner

    ;; Loop 50 times for initial scramble
    i32.const 0
    local.set $i
    
    loop $loop_scramble
      ;; runner = 69069 * runner + 1
      i32.const 69069
      local.get $runner
      i32.mul
      i32.const 1
      i32.add
      local.set $runner

      ;; i++
      local.get $i
      i32.const 1
      i32.add
      local.set $i

      ;; if i < 50 continue
      local.get $i
      i32.const 50
      i32.lt_s
      br_if $loop_scramble
    end

    ;; Fill s0
    ;; runner = 69069 * runner + 1
    i32.const 69069
    local.get $runner
    i32.mul
    i32.const 1
    i32.add
    local.set $runner
    
    local.get $runner
    global.set $s0

    ;; Fill s1
    ;; runner = 69069 * runner + 1
    i32.const 69069
    local.get $runner
    i32.mul
    i32.const 1
    i32.add
    local.set $runner

    local.get $runner
    global.set $s1

    ;; Fill s2
    ;; runner = 69069 * runner + 1
    i32.const 69069
    local.get $runner
    i32.mul
    i32.const 1
    i32.add
    local.set $runner

    local.get $runner
    global.set $s2

    call $fixup
  )


  ;; Fixup function
  (func $fixup
    ;; s0 = s0 % 30269
    global.get $s0
    global.get $mod0
    i32.rem_u
    global.set $s0

    ;; s1 = s1 % 30307
    global.get $s1
    global.get $mod1
    i32.rem_u
    global.set $s1

    ;; s2 = s2 % 30323
    global.get $s2
    global.get $mod2
    i32.rem_u
    global.set $s2

    ;; if s0 == 0 -> s0 = 1
    global.get $s0
    i32.eqz
    if
      i32.const 1
      global.set $s0
    end

    ;; if s1 == 0 -> s1 = 1
    global.get $s1
    i32.eqz
    if
      i32.const 1
      global.set $s1
    end

    ;; if s2 == 0 -> s2 = 1
    global.get $s2
    i32.eqz
    if
      i32.const 1
      global.set $s2
    end
  )

  ;; Random function
  (func $random (result f64)
    (local $term1 f64)
    (local $term2 f64)
    (local $term3 f64)
    (local $sum f64)

    ;; s0 = (s0 * 171) % 30269
    global.get $s0
    i32.const 171
    i32.mul
    global.get $mod0
    i32.rem_u ;;
    global.set $s0

    ;; s1 = (s1 * 172) % 30307
    global.get $s1
    i32.const 172
    i32.mul
    global.get $mod1
    i32.rem_u
    global.set $s1

    ;; s2 = (s2 * 170) % 30323
    global.get $s2
    i32.const 170
    i32.mul
    global.get $mod2
    i32.rem_u
    global.set $s2

    ;; term1 = s0 / 30269.0
    global.get $s0
    f64.convert_i32_u
    f64.const 30269.0
    f64.div
    local.set $term1

    ;; term2 = s1 / 30307.0
    global.get $s1
    f64.convert_i32_u
    f64.const 30307.0
    f64.div
    local.set $term2

    ;; term3 = s2 / 30323.0
    global.get $s2
    f64.convert_i32_u
    f64.const 30323.0
    f64.div
    local.set $term3

    ;; sum = term1 + term2 + term3
    local.get $term1
    local.get $term2
    f64.add
    local.get $term3
    f64.add
    local.set $sum

    ;; return sum - floor(sum)
    local.get $sum
    local.get $sum
    f64.floor
    f64.sub
    
    ;; fixup: ensure result is never exactly 0.0 or 1.0
    ;; const i2_32m1 = 2.328306437080797e-10
    ;; if (x <= 0.0) return 0.5 * i2_32m1
    ;; if (1.0 - x <= 0.0) return 1.0 - 0.5 * i2_32m1
    ;; return x
    local.tee $sum  ;; save result to $sum and keep on stack
    f64.const 0.0
    f64.le
    if (result f64)
      f64.const 1.1641532185398985e-10  ;; 0.5 * i2_32m1
    else
      f64.const 1.0
      local.get $sum
      f64.sub
      f64.const 0.0
      f64.le
      if (result f64)
        f64.const 0.9999999998835847  ;; 1.0 - 0.5 * i2_32m1
      else
        local.get $sum
      end
    end
  )

  ;; Bulk random generation - writes directly to memory
  ;; Parameters:
  ;;   offset: byte offset in memory where to start writing (must be 8-byte aligned for f64)
  ;;   count: number of f64 values to generate
  ;; Returns:
  ;;   actual number of f64 values generated (may be less than count if memory is insufficient)
  (func $randoms (param $offset i32) (param $count i32) (result i32)
    (local $i i32)
    (local $value f64)
    (local $memSize i32)
    (local $maxCount i32)
    (local $requiredBytes i32)
    
    ;; Get current memory size in bytes (memory.size returns pages, 1 page = 64KB)
    memory.size
    i32.const 65536
    i32.mul
    local.set $memSize
    
    ;; Calculate how many f64 values can fit from offset to end of memory
    ;; maxCount = (memSize - offset) / 8
    local.get $memSize
    local.get $offset
    i32.sub
    i32.const 8
    i32.div_u
    local.set $maxCount
    
    ;; If offset is beyond memory, return 0
    local.get $offset
    local.get $memSize
    i32.ge_u
    if
      i32.const 0
      return
    end
    
    ;; Clamp count to maxCount
    local.get $count
    local.get $maxCount
    i32.gt_u
    if
      local.get $maxCount
      local.set $count
    end
    
    ;; Loop counter
    i32.const 0
    local.set $i
    
    loop $generate_loop
      ;; Check if we've generated enough
      local.get $i
      local.get $count
      i32.ge_u
      if
        ;; Return the number of values generated
        local.get $i
        return
      end
      
      ;; Generate one random value
      call $random
      local.set $value
      
      ;; Calculate memory address: offset + (i * 8)
      ;; Each f64 is 8 bytes
      local.get $offset
      local.get $i
      i32.const 8
      i32.mul
      i32.add
      
      ;; Store the value
      local.get $value
      f64.store
      
      ;; Increment counter
      local.get $i
      i32.const 1
      i32.add
      local.set $i
      
      ;; Continue loop
      br $generate_loop
    end
    
    ;; Return count (should never reach here, but for safety)
    local.get $i
  )
)
