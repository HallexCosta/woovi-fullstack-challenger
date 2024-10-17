export const patterns = {
  cpf: /^[0-9]{11}$/,
  cnpj: /^[0-9]{14}$/,
  phone: /^\+[1-9]\d{1,14}$/,
  email:
    /^[a-z0-9.!#$&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/,
  evp: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
}

export const validationPixKey = (pixKey: string) => {
  if (pixKey.startsWith('+') && pixKey.replace(/[^\d+]/g, '').length === 14) {
    return true
  }

  if (
    (patterns.cpf.test(pixKey.replace(/\D/g, '')) &&
      pixKey.replace(/\D/g, '').length === 11) ||
    (patterns.cnpj.test(pixKey) && pixKey.replace(/\D/g, '').length === 14)
  ) {
    return true
  }

  if (patterns.email.test(pixKey)) return true

  if (patterns.evp.test(pixKey)) return true

  return false
}

export const formatPixKey = (pixKey: string): string => {
  const numberPattern = /^\d+$/
  const alphaNumericPattern = /^[0-9a-f]+$/
  const pixKeyClean = pixKey.replace(/(\.*)(\-*)(\/*)/g, '')
  console.log({ pixKeyClean })

  if (pixKeyClean.startsWith('+')) {
    return pixKeyClean
      .replace(/[^+\d]/g, '')
      .replace(/^\+(\d{2})(\d)/, '+$1 ($2') // Enter the country code and open parentheses
      .replace(/(\(\d{2})(\d)/, '$1) $2') // Close parentheses and add space
      .replace(/(\d{5})(\d)/, '$1-$2') // Put the dash in phone number
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  if (numberPattern.test(pixKeyClean)) {
    if (pixKeyClean.length <= 11 && numberPattern.test(pixKeyClean)) {
      // Formata CPF: 123.456.789-01

      return pixKeyClean
        .replace(/\D/g, '') // Remove anywhere char non-numeric
        .replace(/(\d{3})(\d)/, '$1.$2') // Put the first dot
        .replace(/(\d{3})(\d)/, '$1.$2') // Put the second dot
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Put the dash
    }

    if (pixKeyClean.length <= 15 && numberPattern.test(pixKeyClean)) {
      console.log('entrei cnpj')
      // Format CNPJ: 12.345.678/0001-01
      return pixKeyClean
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{4})/, '$1/$2')
        .replace(/(\d{4})(\d{2})/, '$1-$2')
    }
  }

  if (pixKey.length >= 8 && alphaNumericPattern.test(pixKeyClean)) {
    console.log('sou uma evp')
    // EVP (Random key in the format UUID): 123e4567-e89b-12d3-a456-426614174000
    return pixKeyClean
      .slice(0, 32)
      .replace(/^([0-9a-f]{8})([0-9a-f]{0,4})/, '$1-$2')
      .replace(/^([0-9a-f]{8}-[0-9a-f]{4})([0-9a-f]{0,4})/, '$1-$2')
      .replace(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4})([0-9a-f]{0,4})/, '$1-$2')
      .replace(
        /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4})([0-9a-f]{0,12})/,
        '$1-$2'
      )
  }

  // If don´t match a none pattern, return the original pixKey
  return pixKey
}
