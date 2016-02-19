import email from 'rfc822-validate'
import {formats as jgf} from 'json-gate/lib/formats'

export default {
  email,
  'date-time': (str) => jgf['date-time'].regex.test(str),
  date: (str) => jgf['date'].regex.test(str),
  time: (str) => jgf['time'].regex.test(str),
  phone: (str) => jgf['phone'].func(str),
  uri: (str) => jgf['uri'].regex.test(str),
  ipv4: (str) => jgf['uri'].regex.test(str),
  ipv6: (str) => jgf['uri'].regex.test(str),
  hostname: (str) => jgf['host-name'].regex.test(str)
}
