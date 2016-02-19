export function arrayUnique (a) {
  return a.reduce((p, c) => {
    if (p.indexOf(c) < 0) {
      p.push(c)
    }
    return p
  }, [])
}

export function arrayCount (arr) {
  const counts = {}
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i]
    counts[key] = counts[key] ? counts[key]++ : 1
  }
  return counts
}

export function mode (array) {
  if (array.length === 0) {
    return null
  }
  const modeMap = {}
  let maxEl = array[0]
  let maxCount = 1
  for (let i = 0; i < array.length; i++) {
    const el = array[i]
    if (modeMap[el] === null) {
      modeMap[el] = 1
    } else {
      modeMap[el]++
    }

    if (modeMap[el] > maxCount) {
      maxEl = el
      maxCount = modeMap[el]
    }
  }
  return maxEl
}

/**
 *
 * Used to omit `enum` during comparison
 *
 * @param key
 * @param val
 * @returns {*}
 */
export function omitter (key, val) {
  if (key === 'enum' || key === 'default') {
    return undefined
  }
  return val
}
