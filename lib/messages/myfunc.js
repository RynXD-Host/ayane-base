import axios from 'axios'

export const getGroupAdmins = async(participants) => {
  let admins = []
  for (let i of participants) {
    i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
    }
  return admins || []
}

export const fetchJson = async (url, options) => {
  try {
    options ? options : {}
      const res = await axios({
        method: 'GET',
        url: url,
        headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
         },
      ...options
    })
  return res.data
  } catch (err) {
    return err
  }
}

export const jsonformat = (string) => {
  return JSON.stringify(string, null, 2)
}

export const parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}