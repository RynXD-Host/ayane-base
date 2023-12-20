const s = {
  z1: `々`,
  z4: `◦`
}

const teksMenu = (prefix) => {
return (`
*MAIN*
${s.z1} ${prefix}test
${s.z1} ${prefix}owner

*DOWNLOADER*
${s.z1} ${prefix}tiktok
${s.z1} ${prefix}ytmp4
`)
}

export default { teksMenu, s }