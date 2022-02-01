self.onmessage = async e => {
    let wasm = await import('permutations')
    postMessage(wasm.permute(e.data.arr, e.data.n))   
}