// Extensão do objeto global para incluir __COUNTERS__
declare global {
  var __COUNTERS__: Record<string, number>
}

// Função para obter o contador
export const getCounter = (key: string) => {
  // Inicializa __COUNTERS__ se não existir
  if (!global.__COUNTERS__) {
    global.__COUNTERS__ = {}
  }

  // Verifica se a chave já existe em __COUNTERS__
  if (key in global.__COUNTERS__) {
    global.__COUNTERS__[key]++

    return global.__COUNTERS__[key]
  }

  // Caso contrário, inicializa o contador da chave em 0
  global.__COUNTERS__[key] = 0

  return global.__COUNTERS__[key]
}

// Função para reiniciar todos os contadores
// export const restartCounters = () => {
// 	// Inicializa __COUNTERS__ se não existir
// 	if (!global.__COUNTERS__) {
// 		global.__COUNTERS__ = {}
// 	}

// 	// Reinicializa todos os contadores para 0
// 	global.__COUNTERS__ = Object.keys(global.__COUNTERS__).reduce(
// 		(prev, curr) => ({ ...prev, [curr]: 0 }),
// 		{}
// 	)
// }
