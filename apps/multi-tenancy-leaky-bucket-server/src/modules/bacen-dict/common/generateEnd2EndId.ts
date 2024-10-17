function getRandomIpsb(ipsbList: { code: string; institute: string }[]) {
  const randomIndex = Math.floor(Math.random() * ipsbList.length)
  return ipsbList[randomIndex]
}

const ipsbList = [
  { code: '001', institute: 'Banco do Brasil S.A.' },
  { code: '033', institute: 'Banco Santander (Brasil) S.A.' },
  { code: '104', institute: 'Caixa Econômica Federal' },
  { code: '237', institute: 'Banco Bradesco S.A.' },
  { code: '341', institute: 'Itaú Unibanco S.A.' },
  { code: '389', institute: 'Banco Mercantil do Brasil S.A.' },
  { code: '422', institute: 'Banco Safra S.A.' },
  { code: '745', institute: 'Banco Citibank S.A.' },
  { code: '756', institute: 'Bancoob – Banco Cooperativo do Brasil S.A.' },
  { code: '260', institute: 'Nu Pagamentos S.A. (Nubank)' },
  { code: '380', institute: 'PicPay Serviços S.A.' },
  { code: '290', institute: 'PagSeguro Internet S.A.' },
  { code: '102', institute: 'XP Investimentos S.A.' },
  { code: '399', institute: 'Kirton Bank S.A.' },
  { code: '136', institute: 'Unicred Cooperativa' },
  { code: '655', institute: 'Banco Votorantim S.A.' }
]

function generateUTCHashId() {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const day = now.getUTCDate()
  const hour = now.getUTCHours()
  const minutes = now.getUTCMinutes()

  const formattedMonth = month.toString().padStart(2, '0')
  const formattedDay = day.toString().padStart(2, '0')
  const formattedHour = hour.toString().padStart(2, '0')
  const formattedMinutes = minutes.toString().padStart(2, '0')

  return `${year}${formattedMonth}${formattedDay}${formattedHour}${formattedMinutes}`
}

function generateRandomSequenceAlphanumeric(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let sequency = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    sequency += chars.charAt(randomIndex)
  }

  return sequency
}

export const generateEndToEndId = () => {
  const ispb = getRandomIpsb(ipsbList)
  const e2eid = `E${ispb.code}${generateUTCHashId()}${generateRandomSequenceAlphanumeric(11)}`
  return e2eid
}
